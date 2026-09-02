import {
  CanonicalAddressChangeRequest,
  TransactionRecord,
  CanonicalTransactionResponse,
  DepartmentStepResult,
  TransactionStatus
} from '../models/canonical.js';
import { revenueAdapter } from '../adapters/revenueAdapter.js';
import { foodAdapter } from '../adapters/foodAdapter.js';
import { ruralAdapter } from '../adapters/ruralAdapter.js';
import { auditService } from './auditService.js';

class OrchestratorService {
  private transactions: Map<string, TransactionRecord> = new Map();

  constructor() {
    this.seedSample();
  }

  private seedSample() {
    const defaultAppId = 'GM-2026-000124';
    const now = new Date().toISOString();
    this.transactions.set(defaultAppId, {
      applicationId: defaultAppId,
      correlationId: 'CORR-26-000124',
      citizenId: 'GM-CIT-10001',
      serviceCode: 'ADDRESS_CHANGE',
      purpose: 'Unified residence address update across state registries',
      consentId: 'CONSENT-00124',
      createdAt: now,
      updatedAt: now,
      status: 'PROCESSING',
      progressPercent: 40,
      completedDepartments: 1,
      totalDepartments: 3,
      steps: [
        {
          departmentCode: 'REVENUE',
          departmentName: 'Revenue & Forest Department',
          protocol: 'REST/JSON',
          status: 'SUCCESS',
          timestamp: '10:05 AM',
          remarks: 'Address verified and updated on Revenue Land Records registry.'
        },
        {
          departmentCode: 'FOOD',
          departmentName: 'Food, Civil Supplies & Consumer Protection',
          protocol: 'SOAP/XML',
          status: 'PROCESSING',
          timestamp: '10:06 AM',
          remarks: 'Routing verified address payload to Food Department SOAP endpoint...'
        },
        {
          departmentCode: 'RURAL_DEVELOPMENT',
          departmentName: 'Rural Development & Panchayat Raj',
          protocol: 'CSV/SFTP',
          status: 'PENDING',
          timestamp: '10:06 AM',
          remarks: 'Awaiting upstream department verification before dispatching local panchayat update.'
        }
      ],
      citizen: {
        reference: 'GM-CIT-10001',
        name: 'Aarav Sharma',
        mobile: '+91 98765 43210',
        email: 'aarav.sharma@example.gov.in',
        address: {
          line1: 'Flat 402, Shivajinagar Residency, FC Road',
          district: 'Pune',
          state: 'Maharashtra',
          pincode: '411005'
        }
      },
      auditTrail: [
        'REQUEST_CREATED: Initiated by citizen Aarav Sharma',
        'CONSENT_VERIFIED: Revenue, Food, and Rural data scopes approved',
        'REVENUE_SUCCESS: Revenue Department verified address proof'
      ]
    });
  }

  public async processTransaction(request: CanonicalAddressChangeRequest): Promise<CanonicalTransactionResponse> {
    const appId = request.applicationId || `GM-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const corrId = request.correlationId || `CORR-26-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    // Idempotency check: If transaction already exists and completed, return existing
    const existing = this.transactions.get(appId);
    if (existing && existing.status === 'COMPLETED') {
      return {
        success: true,
        applicationId: existing.applicationId,
        correlationId: existing.correlationId,
        status: existing.status,
        progressPercent: existing.progressPercent,
        message: 'Transaction was already completed successfully (Idempotent replay).',
        transaction: existing
      };
    }

    // Initialize Transaction Record
    const tx: TransactionRecord = {
      applicationId: appId,
      correlationId: corrId,
      citizenId: request.citizenId || 'GM-CIT-10001',
      serviceCode: request.serviceCode || 'ADDRESS_CHANGE',
      purpose: request.purpose || 'Unified address change coordination',
      consentId: request.consentId || `CONSENT-${Math.floor(10000 + Math.random() * 90000)}`,
      createdAt: now,
      updatedAt: now,
      status: 'SUBMITTED',
      progressPercent: 10,
      completedDepartments: 0,
      totalDepartments: 3,
      steps: [
        {
          departmentCode: 'REVENUE',
          departmentName: 'Revenue & Forest Department',
          protocol: 'REST/JSON',
          status: 'PENDING',
          timestamp: 'Just now',
          remarks: 'Queued for Revenue land records scrutiny.'
        },
        {
          departmentCode: 'FOOD',
          departmentName: 'Food, Civil Supplies & Consumer Protection',
          protocol: 'SOAP/XML',
          status: 'PENDING',
          timestamp: 'Pending',
          remarks: 'Awaiting Revenue Department verification.'
        },
        {
          departmentCode: 'RURAL_DEVELOPMENT',
          departmentName: 'Rural Development & Panchayat Raj',
          protocol: 'CSV/SFTP',
          status: 'PENDING',
          timestamp: 'Pending',
          remarks: 'Awaiting upstream approvals.'
        }
      ],
      citizen: request.citizen,
      documents: request.documents,
      auditTrail: []
    };

    this.transactions.set(appId, tx);

    auditService.log({
      correlationId: corrId,
      applicationId: appId,
      event: 'REQUEST_CREATED',
      actor: 'GovMesh Core Ingress',
      result: 'SUCCESS',
      details: `Initialized transaction ${appId} for citizen ${request.citizen?.name || 'Unknown'}`
    });

    // Step 1: Consent Verification
    const hasConsents = request.consents?.revenue !== false && request.consents?.food !== false && request.consents?.rural !== false;
    if (!hasConsents) {
      tx.status = 'ACTION_REQUIRED';
      tx.updatedAt = new Date().toISOString();
      this.transactions.set(appId, tx);

      auditService.log({
        correlationId: corrId,
        applicationId: appId,
        event: 'CONSENT_VERIFIED',
        actor: 'GovMesh Consent Gatekeeper',
        result: 'BLOCKED',
        details: 'Citizen consent missing or revoked for one or more target departments.'
      });

      return {
        success: false,
        applicationId: appId,
        correlationId: corrId,
        status: 'ACTION_REQUIRED',
        progressPercent: tx.progressPercent,
        message: 'Consent verification failed: All three departmental consents must be approved.',
        transaction: tx
      };
    }

    auditService.log({
      correlationId: corrId,
      applicationId: appId,
      event: 'CONSENT_VERIFIED',
      actor: 'GovMesh Consent Gatekeeper',
      result: 'SUCCESS',
      details: `Verified statutory consent record ${request.consentId} for all 3 departments.`
    });

    // Step 2: Route to Revenue Department (REST / JSON)
    tx.status = 'ROUTING';
    tx.steps[0].status = 'PROCESSING';
    tx.steps[0].remarks = 'Connecting to Revenue Department verification service...';
    this.transactions.set(appId, tx);

    const revenueResult = await revenueAdapter.process(request);
    tx.steps[0] = revenueResult;

    if (revenueResult.status === 'SUCCESS') {
      tx.completedDepartments = 1;
      tx.progressPercent = 40;
      tx.status = 'PROCESSING';
    } else {
      tx.status = 'FAILED';
      tx.updatedAt = new Date().toISOString();
      this.transactions.set(appId, tx);
      return {
        success: false,
        applicationId: appId,
        correlationId: corrId,
        status: tx.status,
        progressPercent: tx.progressPercent,
        message: `Revenue Department verification failed: ${revenueResult.remarks}`,
        transaction: tx,
        errorCode: revenueResult.errorCode
      };
    }

    // Step 3: Route to Food & Civil Supplies Department (SOAP / XML)
    tx.steps[1].status = 'PROCESSING';
    tx.steps[1].remarks = 'Translating canonical data to SOAP/XML schema for Food Department...';
    this.transactions.set(appId, tx);

    const foodResult = await foodAdapter.process(request);
    tx.steps[1] = foodResult;

    if (foodResult.status === 'SUCCESS') {
      tx.completedDepartments = 2;
      tx.progressPercent = 70;
      tx.status = 'PROCESSING';
    } else {
      tx.status = 'FAILED';
      tx.updatedAt = new Date().toISOString();
      this.transactions.set(appId, tx);
      return {
        success: false,
        applicationId: appId,
        correlationId: corrId,
        status: tx.status,
        progressPercent: tx.progressPercent,
        message: `Food Department synchronization failed: ${foodResult.remarks}`,
        transaction: tx,
        errorCode: foodResult.errorCode
      };
    }

    // Step 4: Route to Rural Development Department (Legacy CSV / SFTP)
    tx.steps[2].status = 'PROCESSING';
    tx.steps[2].remarks = 'Generating CSV batch manifest for Rural Development legacy ingestion...';
    this.transactions.set(appId, tx);

    const ruralResult = await ruralAdapter.process(request);
    tx.steps[2] = ruralResult;

    if (ruralResult.status === 'SUCCESS') {
      tx.completedDepartments = 3;
      tx.progressPercent = 100;
      tx.status = 'COMPLETED';
      tx.updatedAt = new Date().toISOString();

      auditService.log({
        correlationId: corrId,
        applicationId: appId,
        event: 'COMPLETED',
        actor: 'GovMesh Core Orchestrator',
        result: 'SUCCESS',
        details: 'End-to-end multi-department synchronization completed successfully across Revenue, Food, and Rural registries.'
      });
    } else {
      tx.status = 'FAILED';
      tx.updatedAt = new Date().toISOString();
    }

    this.transactions.set(appId, tx);

    return {
      success: tx.status === 'COMPLETED',
      applicationId: appId,
      correlationId: corrId,
      status: tx.status,
      progressPercent: tx.progressPercent,
      message: tx.status === 'COMPLETED'
        ? 'Address update synchronized successfully across Revenue, Food & Civil Supplies, and Rural Development registries.'
        : `Rural Development synchronization failed: ${ruralResult.remarks}`,
      transaction: tx,
      errorCode: ruralResult.errorCode
    };
  }

  public getTransaction(applicationId: string): TransactionRecord | undefined {
    return this.transactions.get(applicationId);
  }

  public getAllTransactions(): TransactionRecord[] {
    return Array.from(this.transactions.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  public async retryTransaction(applicationId: string): Promise<CanonicalTransactionResponse> {
    const tx = this.transactions.get(applicationId);
    if (!tx) {
      throw new Error(`Transaction ${applicationId} not found.`);
    }

    auditService.log({
      correlationId: tx.correlationId,
      applicationId: tx.applicationId,
      event: 'RETRY',
      actor: 'GovMesh Retry Coordinator',
      result: 'PENDING',
      details: `Initiating operational retry for application ${applicationId}`
    });

    const request: CanonicalAddressChangeRequest = {
      applicationId: tx.applicationId,
      citizenId: tx.citizenId,
      correlationId: tx.correlationId,
      serviceCode: tx.serviceCode,
      purpose: tx.purpose,
      consentId: tx.consentId,
      citizen: tx.citizen,
      documents: tx.documents
    };

    return this.processTransaction(request);
  }
}

export const orchestratorService = new OrchestratorService();
