import {
  DepartmentReceivedRequest,
  DocumentEvidenceRecord,
  InteroperabilityEvidence,
  DepartmentCode,
  DepartmentStepStatus,
  TransactionRecord,
  TimestampIntegrityReport
} from '../models/canonical.js';
import { cryptoService } from './cryptoService.js';

class EvidenceService {
  // Map key: "${departmentCode}:${applicationId}"
  private receivedStore: Map<string, DepartmentReceivedRequest> = new Map();
  // Map key: "${applicationId}:${documentId}"
  private documentStore: Map<string, DocumentEvidenceRecord> = new Map();

  constructor() {
    this.seedDefaultEvidence();
  }

  private seedDefaultEvidence() {
    const appId = 'GM-2026-000124';
    const corrId = 'CORR-26-000124';
    const createdUtc = '2026-09-04T04:35:20.000Z';
    const receivedUtc = '2026-09-04T04:35:21.450Z';
    const acceptedUtc = '2026-09-04T04:35:22.100Z';
    const completedUtc = '2026-09-04T04:35:25.800Z';

    const reqHash = 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069';
    const docHash = 'sha256:a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e';

    const defaultDoc: DocumentEvidenceRecord = {
      documentId: 'DOC-ADDR-PROOF-124',
      applicationId: appId,
      documentName: 'address-proof-demo.pdf',
      documentType: 'ELECTRICITY_BILL',
      documentVersion: 1,
      documentSize: '1.2 MB',
      documentHash: docHash,
      uploadedAt: createdUtc,
      receivedAt: receivedUtc,
      sourceSystem: 'GovMesh Citizen Portal',
      receivedFrom: 'GovMesh Core Ingress',
      contentType: 'application/pdf',
      integrityStatus: 'VERIFIED',
      downloadUrl: `/api/govmesh/evidence/${appId}/documents/DOC-ADDR-PROOF-124`,
      contentPreview: 'Verified Residential Electricity Utility Bill — Consumer No. 0491823910'
    };

    this.documentStore.set(`${appId}:DOC-ADDR-PROOF-124`, defaultDoc);

    // Revenue Received Record (Data minimized to Land & Revenue fields)
    this.receivedStore.set(`REVENUE:${appId}`, {
      applicationId: appId,
      correlationId: corrId,
      serviceCode: 'ADDRESS_CHANGE',
      departmentCode: 'REVENUE',
      departmentName: 'Revenue & Forest Department',
      sourceSystem: 'GovMesh Core',
      receivedAt: receivedUtc,
      acceptedAt: acceptedUtc,
      completedAt: completedUtc,
      requestVersion: 1,
      requestHash: reqHash,
      hashStatus: 'VERIFIED',
      citizenId: 'GM-CIT-10001',
      authorizedFields: ['citizen.name', 'citizen.address.line1', 'citizen.address.district', 'citizen.address.taluka', 'consent_id'],
      receivedPayload: {
        application_id: appId,
        citizen_name: 'Aarav Sharma',
        new_address: {
          line: 'Flat 402, Shivajinagar Residency, FC Road',
          district: 'Pune',
          taluka: 'Haveli'
        },
        consent_id: 'CONSENT-00124',
        statutory_purpose: 'Land Record & Residential Verification'
      },
      documents: [defaultDoc],
      lifecycleState: 'SUCCESS',
      acknowledgement: {
        acknowledgementId: 'ACK-REV-000124',
        applicationId: appId,
        correlationId: corrId,
        departmentCode: 'REVENUE',
        requestVersion: 1,
        receivedAt: receivedUtc,
        acceptedAt: acceptedUtc,
        completedAt: completedUtc,
        status: 'COMPLETED',
        requestHash: reqHash,
        documentHash: docHash,
        hashStatus: 'VERIFIED',
        remarks: 'Revenue Land Records registry updated and verified.'
      },
      updatedAt: completedUtc
    });

    // Food Received Record (Data minimized to PDS / Ration Card fields)
    this.receivedStore.set(`FOOD:${appId}`, {
      applicationId: appId,
      correlationId: corrId,
      serviceCode: 'ADDRESS_CHANGE',
      departmentCode: 'FOOD',
      departmentName: 'Food, Civil Supplies & Consumer Protection',
      sourceSystem: 'GovMesh Core',
      receivedAt: receivedUtc,
      acceptedAt: acceptedUtc,
      completedAt: completedUtc,
      requestVersion: 1,
      requestHash: reqHash,
      hashStatus: 'VERIFIED',
      citizenId: 'GM-CIT-10001',
      authorizedFields: ['citizen.name', 'citizen.address.line', 'citizen.address.district', 'verification.status', 'consent.id'],
      receivedPayload: {
        applicationId: appId,
        sourceDepartment: 'REVENUE',
        targetDepartment: 'FOOD',
        correlationId: corrId,
        purpose: 'RATION_ADDRESS_UPDATE',
        citizen: {
          reference: 'GM-CIT-10001',
          name: 'Aarav Sharma',
          address: {
            line: 'Flat 402, Shivajinagar Residency, FC Road',
            district: 'Pune',
            taluka: 'Haveli'
          }
        },
        verification: { status: 'VALID', source: 'REVENUE_DEPARTMENT', verified: true }
      },
      documents: [defaultDoc],
      lifecycleState: 'SUCCESS',
      acknowledgement: {
        acknowledgementId: 'ACK-FOOD-000124',
        applicationId: appId,
        correlationId: corrId,
        departmentCode: 'FOOD',
        requestVersion: 1,
        receivedAt: receivedUtc,
        acceptedAt: acceptedUtc,
        completedAt: completedUtc,
        status: 'COMPLETED',
        requestHash: reqHash,
        documentHash: docHash,
        hashStatus: 'VERIFIED',
        remarks: 'Ration card & family quota quota records updated via SOAP XML.'
      },
      updatedAt: completedUtc
    });

    // Rural Received Record (Data minimized to Gram Panchayat voter & resident fields)
    this.receivedStore.set(`RURAL_DEVELOPMENT:${appId}`, {
      applicationId: appId,
      correlationId: corrId,
      serviceCode: 'ADDRESS_CHANGE',
      departmentCode: 'RURAL_DEVELOPMENT',
      departmentName: 'Rural Development & Panchayat Raj',
      sourceSystem: 'GovMesh Core',
      receivedAt: receivedUtc,
      acceptedAt: acceptedUtc,
      completedAt: completedUtc,
      requestVersion: 1,
      requestHash: reqHash,
      hashStatus: 'VERIFIED',
      citizenId: 'GM-CIT-10001',
      authorizedFields: ['citizenId', 'citizen.name', 'citizen.address.line1', 'citizen.address.district', 'citizen.address.state'],
      receivedPayload: {
        applicationId: appId,
        citizenId: 'GM-CIT-10001',
        serviceCode: 'ADDRESS_CHANGE',
        citizen: {
          name: 'Aarav Sharma',
          address: {
            line1: 'Flat 402, Shivajinagar Residency, FC Road',
            district: 'Pune',
            state: 'Maharashtra'
          }
        }
      },
      documents: [defaultDoc],
      lifecycleState: 'SUCCESS',
      acknowledgement: {
        acknowledgementId: 'ACK-RURAL-000124',
        applicationId: appId,
        correlationId: corrId,
        departmentCode: 'RURAL_DEVELOPMENT',
        requestVersion: 1,
        receivedAt: receivedUtc,
        acceptedAt: acceptedUtc,
        completedAt: completedUtc,
        status: 'COMPLETED',
        requestHash: reqHash,
        documentHash: docHash,
        hashStatus: 'VERIFIED',
        remarks: 'Local Gram Panchayat resident directory synchronized.'
      },
      updatedAt: completedUtc
    });
  }

  public validateTimestampOrdering(timestamps: {
    createdAt?: string;
    sentAt?: string;
    receivedAt?: string;
    validatedAt?: string;
    acceptedAt?: string;
    processingStartedAt?: string;
    completedAt?: string;
    ackReceivedAt?: string;
  }): TimestampIntegrityReport {
    const stageDefs: { key: keyof typeof timestamps; stage: string; system: string; owner: 'GOVMESH' | 'DEPARTMENT' }[] = [
      { key: 'createdAt', stage: 'Request Created (Ingress)', system: 'GovMesh Citizen Portal / Core', owner: 'GOVMESH' },
      { key: 'sentAt', stage: 'Request Dispatched', system: 'GovMesh Department Adapter', owner: 'GOVMESH' },
      { key: 'receivedAt', stage: 'Request Ingested', system: 'Department Ingress Gateway', owner: 'DEPARTMENT' },
      { key: 'validatedAt', stage: 'Schema & Hash Validated', system: 'Department Security Guard', owner: 'DEPARTMENT' },
      { key: 'acceptedAt', stage: 'Request Accepted into Queue', system: 'Department Core DB', owner: 'DEPARTMENT' },
      { key: 'processingStartedAt', stage: 'Officer Scrutiny Started', system: 'Department Officer Portal', owner: 'DEPARTMENT' },
      { key: 'completedAt', stage: 'Processing Completed', system: 'Department Registry Engine', owner: 'DEPARTMENT' },
      { key: 'ackReceivedAt', stage: 'Acknowledgement Received', system: 'GovMesh Core Ledger', owner: 'GOVMESH' }
    ];

    const timeline: { stage: string; timestamp: string; system: string; owner: 'GOVMESH' | 'DEPARTMENT' }[] = [];
    const orderedEntries: { key: string; stage: string; timestamp: string; epoch: number }[] = [];

    for (const def of stageDefs) {
      const ts = timestamps[def.key];
      if (ts) {
        const epoch = new Date(ts).getTime();
        timeline.push({
          stage: def.stage,
          timestamp: ts,
          system: def.system,
          owner: def.owner
        });
        orderedEntries.push({
          key: def.key,
          stage: def.stage,
          timestamp: ts,
          epoch
        });
      }
    }

    const violations: string[] = [];
    let maxSkewMs = 0;
    let hasStrictViolation = false;
    let hasClockSkewWarning = false;

    for (let i = 0; i < orderedEntries.length - 1; i++) {
      const curr = orderedEntries[i];
      const next = orderedEntries[i + 1];

      if (next.epoch < curr.epoch) {
        const diffMs = curr.epoch - next.epoch;
        if (diffMs > maxSkewMs) maxSkewMs = diffMs;

        if (diffMs <= 5000) {
          hasClockSkewWarning = true;
          violations.push(`Minor cloud server clock skew detected between [${curr.stage}] (${curr.timestamp}) and [${next.stage}] (${next.timestamp}): ${diffMs}ms delta.`);
        } else {
          hasStrictViolation = true;
          violations.push(`Chronological ordering violated: [${next.stage}] (${next.timestamp}) occurred ${diffMs}ms before [${curr.stage}] (${curr.timestamp}).`);
        }
      }
    }

    let status: 'VERIFIED' | 'WARNING' | 'FAILED' = 'VERIFIED';
    let summary = 'Strict chronological timestamp sequence verified across all systems.';

    if (hasStrictViolation) {
      status = 'FAILED';
      summary = `Timestamp integrity failure: ${violations.length} ordering violation(s) detected.`;
    } else if (hasClockSkewWarning) {
      status = 'WARNING';
      summary = `Chronological order consistent with acceptable cloud server clock skew (${maxSkewMs}ms).`;
    }

    return {
      status,
      skewMs: maxSkewMs,
      timeline,
      violations,
      summary
    };
  }

  public recordDepartmentReceived(record: DepartmentReceivedRequest): DepartmentReceivedRequest {
    const key = `${record.departmentCode}:${record.applicationId}`;
    if (!record.timestampIntegrity) {
      record.timestampIntegrity = this.validateTimestampOrdering({
        sentAt: record.sentAt,
        receivedAt: record.receivedAt,
        validatedAt: record.validatedAt,
        acceptedAt: record.acceptedAt,
        processingStartedAt: record.processingStartedAt,
        completedAt: record.completedAt,
        ackReceivedAt: record.ackReceivedAt
      });
    }
    if (record.acknowledgement && !record.acknowledgement.timestampIntegrity) {
      record.acknowledgement.timestampIntegrity = record.timestampIntegrity;
    }
    this.receivedStore.set(key, record);
    return record;
  }

  public updateDepartmentLifecycle(
    departmentCode: DepartmentCode,
    applicationId: string,
    state: DepartmentStepStatus,
    remarks?: string,
    completedAt?: string,
    validatedAt?: string,
    acceptedAt?: string
  ): DepartmentReceivedRequest | undefined {
    const key = `${departmentCode}:${applicationId}`;
    const record = this.receivedStore.get(key);
    if (record) {
      record.lifecycleState = state;
      record.updatedAt = new Date().toISOString();
      if (completedAt) record.completedAt = completedAt;
      if (validatedAt) record.validatedAt = validatedAt;
      if (acceptedAt) record.acceptedAt = acceptedAt;
      if (remarks) record.acknowledgement.remarks = remarks;
      record.acknowledgement.status = state === 'SUCCESS' ? 'COMPLETED' : (state === 'ACCEPTED' ? 'ACCEPTED' : (state === 'PROCESSING' ? 'PROCESSING' : 'REJECTED'));
      
      record.timestampIntegrity = this.validateTimestampOrdering({
        sentAt: record.sentAt,
        receivedAt: record.receivedAt,
        validatedAt: record.validatedAt,
        acceptedAt: record.acceptedAt,
        processingStartedAt: record.processingStartedAt,
        completedAt: record.completedAt,
        ackReceivedAt: record.ackReceivedAt || new Date().toISOString()
      });
      record.acknowledgement.timestampIntegrity = record.timestampIntegrity;

      this.receivedStore.set(key, record);
    }
    return record;
  }

  public getDepartmentReceivedRequest(applicationId: string, departmentCode: DepartmentCode): DepartmentReceivedRequest | undefined {
    return this.receivedStore.get(`${departmentCode}:${applicationId}`);
  }

  public getAllReceivedForApplication(applicationId: string): DepartmentReceivedRequest[] {
    const results: DepartmentReceivedRequest[] = [];
    for (const [key, record] of this.receivedStore.entries()) {
      if (record.applicationId === applicationId) {
        results.push(record);
      }
    }
    return results;
  }

  public storeDocument(doc: DocumentEvidenceRecord): void {
    this.documentStore.set(`${doc.applicationId}:${doc.documentId}`, doc);
  }

  public getDocument(applicationId: string, documentId: string): DocumentEvidenceRecord | undefined {
    return this.documentStore.get(`${applicationId}:${documentId}`);
  }

  public getDocumentsForApplication(applicationId: string): DocumentEvidenceRecord[] {
    const docs: DocumentEvidenceRecord[] = [];
    for (const [key, doc] of this.documentStore.entries()) {
      if (doc.applicationId === applicationId) {
        docs.push(doc);
      }
    }
    return docs;
  }

  public getInteroperabilityEvidence(applicationId: string, tx?: TransactionRecord): InteroperabilityEvidence | undefined {
    const received = this.getAllReceivedForApplication(applicationId);
    if (received.length === 0 && !tx) return undefined;

    const delivery: Record<string, any> = {};
    received.forEach(r => {
      delivery[r.departmentCode] = {
        departmentCode: r.departmentCode,
        departmentName: r.departmentName,
        protocol: r.departmentCode === 'REVENUE' ? 'REST/JSON' : (r.departmentCode === 'FOOD' ? 'SOAP/XML' : 'CSV/SFTP'),
        lifecycleState: r.lifecycleState,
        sentAt: r.sentAt,
        receivedAt: r.receivedAt,
        validatedAt: r.validatedAt,
        acceptedAt: r.acceptedAt,
        processingStartedAt: r.processingStartedAt,
        completedAt: r.completedAt,
        ackReceivedAt: r.ackReceivedAt,
        requestHash: r.requestHash,
        hashStatus: r.hashStatus,
        documentHash: r.documents[0]?.documentHash,
        documentIntegrity: r.documents[0]?.integrityStatus || 'NOT_APPLICABLE',
        acknowledgementId: r.acknowledgement.acknowledgementId,
        timestampIntegrity: r.timestampIntegrity
      };
    });

    const canonicalHash = tx?.canonicalRequestHash || received[0]?.requestHash || 'sha256:unknown';
    const docHash = tx?.documentHash || received[0]?.documents[0]?.documentHash;

    const overallTimestampReport = this.validateTimestampOrdering({
      createdAt: tx?.createdAt || received[0]?.receivedAt,
      sentAt: tx?.sentAt || received[0]?.sentAt,
      receivedAt: received[0]?.receivedAt,
      acceptedAt: received[0]?.acceptedAt,
      completedAt: tx?.completedAt || received[0]?.completedAt,
      ackReceivedAt: tx?.ackReceivedAt || new Date().toISOString()
    });

    return {
      applicationId,
      correlationId: tx?.correlationId || received[0]?.correlationId || `CORR-26-${applicationId}`,
      serviceCode: tx?.serviceCode || received[0]?.serviceCode || 'ADDRESS_CHANGE',
      requestVersion: tx?.requestVersion || received[0]?.requestVersion || 1,
      createdAt: tx?.createdAt || received[0]?.receivedAt || new Date().toISOString(),
      sentAt: tx?.sentAt || received[0]?.sentAt,
      completedAt: tx?.completedAt || received[0]?.completedAt,
      canonicalRequestHash: canonicalHash,
      documentHash: docHash,
      overallStatus: tx?.status || 'COMPLETED',
      progressPercent: tx?.progressPercent !== undefined ? tx?.progressPercent : 100,
      timestampIntegrity: overallTimestampReport,
      departmentDelivery: delivery,
      receivedRequests: received
    };
  }
}

export const evidenceService = new EvidenceService();
