import {
  CanonicalAddressChangeRequest,
  TransactionRecord,
  CanonicalTransactionResponse,
  DepartmentStepResult,
  DepartmentCode,
  TransactionStatus,
  ProofDocument
} from '../models/canonical.js';
import { DepartmentAdapter } from '../adapters/departmentAdapter.js';
import { revenueAdapter } from '../adapters/revenueAdapter.js';
import { foodAdapter } from '../adapters/foodAdapter.js';
import { ruralAdapter } from '../adapters/ruralAdapter.js';
import { serviceRegistry } from '../registry/serviceRegistry.js';
import { auditService } from './auditService.js';
import { cryptoService } from './cryptoService.js';
import { evidenceService } from './evidenceService.js';

class OrchestratorService {
  private transactions: Map<string, TransactionRecord> = new Map();
  private adapters: Map<DepartmentCode, DepartmentAdapter> = new Map();

  constructor() {
    this.registerAdapter('REVENUE', revenueAdapter);
    this.registerAdapter('FOOD', foodAdapter);
    this.registerAdapter('RURAL_DEVELOPMENT', ruralAdapter);
    this.seedSample();
  }

  public registerAdapter(code: DepartmentCode, adapter: DepartmentAdapter): void {
    this.adapters.set(code, adapter);
  }

  public getAdapter(code: DepartmentCode): DepartmentAdapter | undefined {
    return this.adapters.get(code);
  }

  private seedSample() {
    const defaultAppId = 'GM-2026-000124';
    const corrId = 'CORR-26-000124';
    const createdUtc = '2026-09-04T04:35:20.000Z';
    const reqHash = 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069';
    const docHash = 'sha256:a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e';

    const defaultDocs: ProofDocument[] = [
      {
        id: 'DOC-ADDR-PROOF-124',
        name: 'address-proof-demo.pdf',
        type: 'ELECTRICITY_BILL',
        size: '1.2 MB',
        checksum: docHash,
        documentHash: docHash,
        version: 1,
        uploadedAt: createdUtc,
        contentType: 'application/pdf'
      }
    ];

    this.transactions.set(defaultAppId, {
      applicationId: defaultAppId,
      correlationId: corrId,
      requestVersion: 1,
      canonicalRequestHash: reqHash,
      documentHash: docHash,
      citizenId: 'GM-CIT-10001',
      serviceCode: 'ADDRESS_CHANGE',
      purpose: 'Unified residence address update across state registries',
      consentId: 'CONSENT-00124',
      targetDepartments: ['REVENUE', 'FOOD', 'RURAL_DEVELOPMENT'],
      createdAt: createdUtc,
      receivedAt: '2026-09-04T04:35:21.450Z',
      sentAt: '2026-09-04T04:35:21.500Z',
      acceptedAt: '2026-09-04T04:35:22.100Z',
      completedAt: '2026-09-04T04:35:25.800Z',
      updatedAt: '2026-09-04T04:35:25.800Z',
      status: 'COMPLETED',
      progressPercent: 100,
      completedDepartments: 3,
      totalDepartments: 3,
      steps: [
        {
          departmentCode: 'REVENUE',
          departmentName: 'Revenue & Forest Department',
          protocol: 'REST/JSON',
          status: 'SUCCESS',
          timestamp: '2026-09-04T04:35:21.450Z',
          remarks: 'Address record successfully verified and updated on Revenue Land Registry.',
          requestHash: reqHash,
          hashStatus: 'VERIFIED',
          documentHash: docHash,
          receivedAt: '2026-09-04T04:35:21.450Z',
          acceptedAt: '2026-09-04T04:35:22.100Z',
          completedAt: '2026-09-04T04:35:23.200Z',
          acknowledgementId: 'ACK-REV-000124'
        },
        {
          departmentCode: 'FOOD',
          departmentName: 'Food, Civil Supplies & Consumer Protection',
          protocol: 'SOAP/XML',
          status: 'SUCCESS',
          timestamp: '2026-09-04T04:35:21.450Z',
          remarks: 'Ration card & PDS family quota records successfully synchronized via SOAP transformation.',
          requestHash: reqHash,
          hashStatus: 'VERIFIED',
          documentHash: docHash,
          receivedAt: '2026-09-04T04:35:21.450Z',
          acceptedAt: '2026-09-04T04:35:22.200Z',
          completedAt: '2026-09-04T04:35:24.500Z',
          acknowledgementId: 'ACK-FOOD-000124'
        },
        {
          departmentCode: 'RURAL_DEVELOPMENT',
          departmentName: 'Rural Development & Panchayat Raj',
          protocol: 'CSV/SFTP',
          status: 'SUCCESS',
          timestamp: '2026-09-04T04:35:21.450Z',
          remarks: 'Local Gram Panchayat voter & resident registry synchronized with verified address.',
          requestHash: reqHash,
          hashStatus: 'VERIFIED',
          documentHash: docHash,
          receivedAt: '2026-09-04T04:35:21.450Z',
          acceptedAt: '2026-09-04T04:35:22.300Z',
          completedAt: '2026-09-04T04:35:25.800Z',
          acknowledgementId: 'ACK-RURAL-000124'
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
      documents: defaultDocs,
      auditTrail: [
        'TRANSACTION_CREATED: Initiated by citizen Aarav Sharma',
        'CANONICAL_HASH_GENERATED: sha256:7f83b165...',
        'CONSENT_VERIFIED: Revenue, Food, and Rural data scopes approved',
        'REVENUE_SUCCESS: Revenue Department verified address proof',
        'FOOD_SUCCESS: Ration card updated via SOAP',
        'RURAL_SUCCESS: Gram Panchayat updated via CSV'
      ]
    });
  }

  public async processTransaction(request: CanonicalAddressChangeRequest): Promise<CanonicalTransactionResponse> {
    const appId = request.applicationId || `GM-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const corrId = request.correlationId || `CORR-26-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowUtc = new Date().toISOString();
    const reqVersion = request.requestVersion || 1;

    // Idempotency check: If transaction already completed successfully, return cached result
    const existing = this.transactions.get(appId);
    if (existing && existing.status === 'COMPLETED') {
      return {
        success: true,
        applicationId: existing.applicationId,
        correlationId: existing.correlationId,
        requestVersion: existing.requestVersion,
        canonicalRequestHash: existing.canonicalRequestHash,
        documentHash: existing.documentHash,
        status: existing.status,
        progressPercent: existing.progressPercent,
        completedDepartments: existing.completedDepartments,
        totalDepartments: existing.totalDepartments,
        message: 'Transaction was already completed successfully (Idempotent replay).',
        transaction: existing
      };
    }

    // 1. Dynamic Service & Target Resolution
    const serviceCode = request.serviceCode || 'ADDRESS_CHANGE';
    const targetDepartments = serviceRegistry.resolveTargetDepartments(serviceCode, request.targetDepartments);
    const serviceDef = serviceRegistry.getService(serviceCode);

    // 2. Cryptographic Canonical & Document Hash Calculation
    request.applicationId = appId;
    request.correlationId = corrId;
    request.createdAt = nowUtc;
    request.requestVersion = reqVersion;

    const canonicalHash = request.canonicalRequestHash || cryptoService.computeCanonicalRequestHash(request);
    const docHash = request.documentHash || (request.documents && request.documents[0]?.checksum) || 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

    request.canonicalRequestHash = canonicalHash;
    request.documentHash = docHash;

    // 3. Initialize Transaction Record
    const initialSteps: DepartmentStepResult[] = targetDepartments.map(code => {
      const deptEntry = serviceRegistry.getDepartment(code);
      return {
        departmentCode: code,
        departmentName: deptEntry?.departmentName || code,
        protocol: deptEntry?.protocol || 'REST/JSON',
        status: 'PENDING',
        timestamp: nowUtc,
        remarks: `Queued for ${deptEntry?.departmentName || code} processing.`,
        requestHash: canonicalHash,
        hashStatus: 'VERIFIED',
        documentHash: docHash
      };
    });

    const tx: TransactionRecord = {
      applicationId: appId,
      correlationId: corrId,
      requestVersion: reqVersion,
      canonicalRequestHash: canonicalHash,
      documentHash: docHash,
      citizenId: request.citizenId || 'GM-CIT-10001',
      serviceCode,
      purpose: request.purpose || serviceDef?.description || 'Multi-department service coordination',
      consentId: request.consentId || `CONSENT-${Math.floor(10000 + Math.random() * 90000)}`,
      targetDepartments,
      createdAt: nowUtc,
      receivedAt: nowUtc,
      updatedAt: nowUtc,
      status: 'SUBMITTED',
      progressPercent: 10,
      completedDepartments: 0,
      totalDepartments: targetDepartments.length,
      steps: initialSteps,
      citizen: request.citizen,
      documents: request.documents,
      auditTrail: []
    };

    this.transactions.set(appId, tx);

    auditService.log({
      correlationId: corrId,
      applicationId: appId,
      event: 'TRANSACTION_CREATED',
      actor: 'GovMesh Core Ingress',
      result: 'SUCCESS',
      details: `Initialized transaction ${appId} (v${reqVersion}) for service [${serviceCode}] with ${targetDepartments.length} target department(s): ${targetDepartments.join(', ')}`
    });

    auditService.log({
      correlationId: corrId,
      applicationId: appId,
      event: 'CANONICAL_HASH_GENERATED',
      actor: 'GovMesh Cryptographic Service',
      result: 'SUCCESS',
      details: `Generated canonical request hash: ${canonicalHash} | Document hash: ${docHash}`
    });

    // 4. Department-Level Consent Verification & Data Minimization Gatekeeper
    let hasAnyConsent = false;
    const consents = request.consents || {};

    for (let i = 0; i < tx.steps.length; i++) {
      const step = tx.steps[i];
      const deptKey = step.departmentCode.toLowerCase().replace('_development', '');
      const isApproved = consents[deptKey] !== false && consents[step.departmentCode.toLowerCase()] !== false;

      if (!isApproved) {
        step.status = 'CONSENT_BLOCKED';
        step.remarks = `Processing blocked: Citizen consent not granted for ${step.departmentName}.`;
        auditService.log({
          correlationId: corrId,
          applicationId: appId,
          event: 'CONSENT_VERIFIED',
          department: step.departmentCode,
          actor: 'GovMesh Consent Gatekeeper',
          result: 'BLOCKED',
          details: `Consent withheld for ${step.departmentName}.`
        });
      } else {
        hasAnyConsent = true;
        auditService.log({
          correlationId: corrId,
          applicationId: appId,
          event: 'CONSENT_VERIFIED',
          department: step.departmentCode,
          actor: 'GovMesh Consent Gatekeeper',
          result: 'SUCCESS',
          details: `Consent verified for ${step.departmentName}.`
        });
      }
    }

    if (!hasAnyConsent) {
      tx.status = 'ACTION_REQUIRED';
      tx.updatedAt = new Date().toISOString();
      this.transactions.set(appId, tx);

      return {
        success: false,
        applicationId: appId,
        correlationId: corrId,
        requestVersion: reqVersion,
        canonicalRequestHash: canonicalHash,
        documentHash: docHash,
        status: 'ACTION_REQUIRED',
        progressPercent: tx.progressPercent,
        completedDepartments: 0,
        totalDepartments: tx.totalDepartments,
        message: 'Consent verification failed: At least one departmental consent must be approved to proceed.',
        transaction: tx
      };
    }

    // 5. Dynamic Execution & Routing
    tx.status = 'ROUTING';
    tx.sentAt = new Date().toISOString();
    this.transactions.set(appId, tx);

    auditService.log({
      correlationId: corrId,
      applicationId: appId,
      event: 'ROUTING_STARTED',
      actor: 'GovMesh Dynamic Router',
      result: 'SUCCESS',
      details: `Routing execution mode: ${serviceDef?.executionMode || 'PARALLEL_FAN_OUT'}`
    });

    const executionMode = serviceDef?.executionMode || 'PARALLEL_FAN_OUT';

    if (executionMode === 'SEQUENTIAL_VERIFIED' && targetDepartments.includes('REVENUE')) {
      // Step 5A: Execute Revenue scrutiny first if present
      const revIndex = tx.steps.findIndex(s => s.departmentCode === 'REVENUE');
      if (revIndex >= 0 && tx.steps[revIndex].status !== 'CONSENT_BLOCKED') {
        tx.steps[revIndex].status = 'PROCESSING';
        tx.steps[revIndex].remarks = 'Connecting to Revenue Department verification scrutiny...';
        this.transactions.set(appId, tx);

        const revAdapter = this.adapters.get('REVENUE');
        const revResult = revAdapter
          ? await revAdapter.process(request)
          : { departmentCode: 'REVENUE', departmentName: 'Revenue & Forest Department', protocol: 'REST/JSON' as const, status: 'FAILED' as const, timestamp: new Date().toISOString(), remarks: 'Adapter not found' };

        tx.steps[revIndex] = revResult;

        if (revResult.status === 'ACTION_REQUIRED') {
          tx.status = 'ACTION_REQUIRED';
          tx.updatedAt = new Date().toISOString();
          this.transactions.set(appId, tx);
          return {
            success: false,
            applicationId: appId,
            correlationId: corrId,
            requestVersion: reqVersion,
            canonicalRequestHash: canonicalHash,
            documentHash: docHash,
            status: 'ACTION_REQUIRED',
            progressPercent: tx.progressPercent,
            completedDepartments: 0,
            totalDepartments: tx.totalDepartments,
            message: `Revenue Department action required: ${revResult.remarks}`,
            transaction: tx
          };
        }

        if (revResult.status === 'SUCCESS') {
          tx.completedDepartments = 1;
          tx.progressPercent = Math.round((1 / tx.totalDepartments) * 100);
          tx.status = 'PROCESSING';
          this.transactions.set(appId, tx);
        }
      }

      // Step 5B: Fan out to all other remaining departments in parallel
      const remainingIndices = tx.steps
        .map((s, idx) => ({ idx, code: s.departmentCode, status: s.status }))
        .filter(item => item.code !== 'REVENUE' && item.status !== 'CONSENT_BLOCKED');

      await Promise.allSettled(
        remainingIndices.map(async ({ idx, code }) => {
          tx.steps[idx].status = 'PROCESSING';
          tx.steps[idx].remarks = `Dispatched to ${tx.steps[idx].departmentName}...`;
          this.transactions.set(appId, tx);

          const adapter = this.adapters.get(code);
          if (adapter) {
            const res = await adapter.process(request);
            tx.steps[idx] = res;
          } else {
            tx.steps[idx] = {
              departmentCode: code,
              departmentName: tx.steps[idx].departmentName,
              protocol: tx.steps[idx].protocol,
              status: 'FAILED',
              timestamp: new Date().toISOString(),
              remarks: `No adapter registered for department code [${code}]`
            };
          }
        })
      );
    } else {
      // Step 5C: Full Parallel Fan-out for all target departments
      const actionableIndices = tx.steps
        .map((s, idx) => ({ idx, code: s.departmentCode, status: s.status }))
        .filter(item => item.status !== 'CONSENT_BLOCKED');

      await Promise.allSettled(
        actionableIndices.map(async ({ idx, code }) => {
          tx.steps[idx].status = 'PROCESSING';
          tx.steps[idx].remarks = `Dispatched to ${tx.steps[idx].departmentName}...`;
          this.transactions.set(appId, tx);

          const adapter = this.adapters.get(code);
          if (adapter) {
            const res = await adapter.process(request);
            tx.steps[idx] = res;
          } else {
            tx.steps[idx] = {
              departmentCode: code,
              departmentName: tx.steps[idx].departmentName,
              protocol: tx.steps[idx].protocol,
              status: 'FAILED',
              timestamp: new Date().toISOString(),
              remarks: `No adapter registered for department code [${code}]`
            };
          }
        })
      );
    }

    // 6. Response Aggregation Engine & Interoperability Evidence Sync
    const finalStatus = this.aggregateTransactionState(tx);
    this.transactions.set(appId, tx);

    return {
      success: finalStatus === 'COMPLETED' || finalStatus === 'PARTIALLY_COMPLETED',
      applicationId: appId,
      correlationId: corrId,
      requestVersion: reqVersion,
      canonicalRequestHash: canonicalHash,
      documentHash: docHash,
      status: finalStatus,
      progressPercent: tx.progressPercent,
      completedDepartments: tx.completedDepartments,
      totalDepartments: tx.totalDepartments,
      message: this.generateStatusMessage(tx),
      transaction: tx
    };
  }

  private aggregateTransactionState(tx: TransactionRecord): TransactionStatus {
    const total = tx.steps.length;
    const completed = tx.steps.filter(s => s.status === 'SUCCESS').length;
    const failed = tx.steps.filter(s => s.status === 'FAILED').length;
    const actionReq = tx.steps.filter(s => s.status === 'ACTION_REQUIRED').length;
    const blocked = tx.steps.filter(s => s.status === 'CONSENT_BLOCKED').length;

    tx.completedDepartments = completed;
    tx.updatedAt = new Date().toISOString();

    const activeTotal = total - blocked;
    if (activeTotal <= 0) {
      tx.status = 'ACTION_REQUIRED';
      tx.progressPercent = 0;
      return tx.status;
    }

    tx.progressPercent = Math.round((completed / total) * 100);

    if (actionReq > 0) {
      tx.status = 'ACTION_REQUIRED';
    } else if (completed === activeTotal) {
      tx.status = 'COMPLETED';
      tx.progressPercent = 100;
      tx.completedAt = new Date().toISOString();
      auditService.log({
        correlationId: tx.correlationId,
        applicationId: tx.applicationId,
        event: 'TRANSACTION_COMPLETED',
        actor: 'GovMesh Response Aggregator',
        result: 'SUCCESS',
        details: `All ${completed} target department(s) synchronized and verified with canonical request hash ${tx.canonicalRequestHash.slice(0, 16)}...`
      });
    } else if (completed > 0 && failed > 0) {
      tx.status = 'PARTIALLY_COMPLETED';
      auditService.log({
        correlationId: tx.correlationId,
        applicationId: tx.applicationId,
        event: 'TRANSACTION_PARTIALLY_COMPLETED',
        actor: 'GovMesh Response Aggregator',
        result: 'PENDING',
        details: `Partially completed: ${completed} of ${activeTotal} departments succeeded, ${failed} failed.`
      });
    } else if (failed === activeTotal) {
      tx.status = 'FAILED';
      auditService.log({
        correlationId: tx.correlationId,
        applicationId: tx.applicationId,
        event: 'FAILED',
        actor: 'GovMesh Response Aggregator',
        result: 'FAILED',
        details: `All ${failed} active target departments encountered errors.`
      });
    } else {
      tx.status = 'PROCESSING';
    }

    return tx.status;
  }

  private generateStatusMessage(tx: TransactionRecord): string {
    if (tx.status === 'COMPLETED') {
      return `Transaction completed successfully across ${tx.completedDepartments} department registries. Canonical hash: ${tx.canonicalRequestHash.slice(0, 16)}...`;
    }
    if (tx.status === 'PARTIALLY_COMPLETED') {
      return `Transaction partially completed: ${tx.completedDepartments} of ${tx.totalDepartments} departments synchronized. Operational retry available for remaining departments.`;
    }
    if (tx.status === 'ACTION_REQUIRED') {
      return 'Action required: Please review documentation or consent requirements.';
    }
    if (tx.status === 'FAILED') {
      return 'Synchronization could not be completed with one or more departments. Please retry.';
    }
    return `Transaction processing across ${tx.totalDepartments} departments.`;
  }

  public getTransaction(applicationId: string): TransactionRecord | undefined {
    return this.transactions.get(applicationId);
  }

  public getAllTransactions(): TransactionRecord[] {
    return Array.from(this.transactions.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  // 7. Selective Idempotent Retry
  public async retryTransaction(applicationId: string): Promise<CanonicalTransactionResponse> {
    const tx = this.transactions.get(applicationId);
    if (!tx) {
      throw new Error(`Transaction '${applicationId}' not found in registry.`);
    }

    const retrySteps = tx.steps
      .map((s, idx) => ({ idx, step: s }))
      .filter(({ step }) => step.status !== 'SUCCESS' && step.status !== 'CONSENT_BLOCKED');

    if (retrySteps.length === 0) {
      return {
        success: true,
        applicationId: tx.applicationId,
        correlationId: tx.correlationId,
        requestVersion: tx.requestVersion,
        canonicalRequestHash: tx.canonicalRequestHash,
        documentHash: tx.documentHash,
        status: tx.status,
        progressPercent: tx.progressPercent,
        completedDepartments: tx.completedDepartments,
        totalDepartments: tx.totalDepartments,
        message: 'All target departments are already successfully synchronized.',
        transaction: tx
      };
    }

    tx.requestVersion = (tx.requestVersion || 1) + 1;
    tx.updatedAt = new Date().toISOString();

    auditService.log({
      correlationId: tx.correlationId,
      applicationId: tx.applicationId,
      event: 'RETRY_STARTED',
      actor: 'GovMesh Selective Retry Coordinator',
      result: 'PENDING',
      details: `Initiating selective retry (v${tx.requestVersion}) for ${retrySteps.length} failed department(s): ${retrySteps.map(r => r.step.departmentCode).join(', ')}`
    });

    const canonicalRequest: CanonicalAddressChangeRequest = {
      applicationId: tx.applicationId,
      citizenId: tx.citizenId,
      correlationId: tx.correlationId,
      requestVersion: tx.requestVersion,
      canonicalRequestHash: tx.canonicalRequestHash,
      documentHash: tx.documentHash,
      serviceCode: tx.serviceCode,
      purpose: tx.purpose,
      consentId: tx.consentId,
      createdAt: tx.createdAt,
      citizen: tx.citizen,
      documents: tx.documents
    };

    await Promise.allSettled(
      retrySteps.map(async ({ idx, step }) => {
        tx.steps[idx].status = 'RETRYING';
        tx.steps[idx].remarks = `Retrying connection to ${step.departmentName}...`;
        this.transactions.set(applicationId, tx);

        const adapter = this.adapters.get(step.departmentCode);
        if (adapter) {
          const res = await adapter.process(canonicalRequest);
          tx.steps[idx] = res;
        }
      })
    );

    const finalStatus = this.aggregateTransactionState(tx);
    this.transactions.set(applicationId, tx);

    auditService.log({
      correlationId: tx.correlationId,
      applicationId: tx.applicationId,
      event: 'RETRY_COMPLETED',
      actor: 'GovMesh Selective Retry Coordinator',
      result: finalStatus === 'COMPLETED' ? 'SUCCESS' : 'PENDING',
      details: `Retry completed with status [${finalStatus}]. Progress: ${tx.progressPercent}%`
    });

    return {
      success: finalStatus === 'COMPLETED' || finalStatus === 'PARTIALLY_COMPLETED',
      applicationId: tx.applicationId,
      correlationId: tx.correlationId,
      requestVersion: tx.requestVersion,
      canonicalRequestHash: tx.canonicalRequestHash,
      documentHash: tx.documentHash,
      status: finalStatus,
      progressPercent: tx.progressPercent,
      completedDepartments: tx.completedDepartments,
      totalDepartments: tx.totalDepartments,
      message: this.generateStatusMessage(tx),
      transaction: tx
    };
  }
}

export const orchestratorService = new OrchestratorService();
