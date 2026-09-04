import {
  DepartmentReceivedRequest,
  DocumentEvidenceRecord,
  InteroperabilityEvidence,
  DepartmentCode,
  DepartmentStepStatus,
  TransactionRecord
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

  public recordDepartmentReceived(record: DepartmentReceivedRequest): DepartmentReceivedRequest {
    const key = `${record.departmentCode}:${record.applicationId}`;
    this.receivedStore.set(key, record);
    return record;
  }

  public updateDepartmentLifecycle(
    departmentCode: DepartmentCode,
    applicationId: string,
    state: DepartmentStepStatus,
    remarks?: string,
    completedAt?: string
  ): DepartmentReceivedRequest | undefined {
    const key = `${departmentCode}:${applicationId}`;
    const record = this.receivedStore.get(key);
    if (record) {
      record.lifecycleState = state;
      record.updatedAt = new Date().toISOString();
      if (completedAt) {
        record.completedAt = completedAt;
      }
      if (remarks) {
        record.acknowledgement.remarks = remarks;
      }
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
        receivedAt: r.receivedAt,
        acceptedAt: r.acceptedAt,
        completedAt: r.completedAt,
        requestHash: r.requestHash,
        hashStatus: r.hashStatus,
        documentHash: r.documents[0]?.documentHash,
        documentIntegrity: r.documents[0]?.integrityStatus || 'NOT_APPLICABLE',
        acknowledgementId: r.acknowledgement.acknowledgementId
      };
    });

    const canonicalHash = tx?.canonicalRequestHash || received[0]?.requestHash || 'sha256:unknown';
    const docHash = tx?.documentHash || received[0]?.documents[0]?.documentHash;

    return {
      applicationId,
      correlationId: tx?.correlationId || received[0]?.correlationId || `CORR-26-${applicationId}`,
      serviceCode: tx?.serviceCode || received[0]?.serviceCode || 'ADDRESS_CHANGE',
      requestVersion: tx?.requestVersion || received[0]?.requestVersion || 1,
      createdAt: tx?.createdAt || received[0]?.receivedAt || new Date().toISOString(),
      canonicalRequestHash: canonicalHash,
      documentHash: docHash,
      overallStatus: tx?.status || 'COMPLETED',
      progressPercent: tx?.progressPercent !== undefined ? tx?.progressPercent : 100,
      departmentDelivery: delivery,
      receivedRequests: received
    };
  }
}

export const evidenceService = new EvidenceService();
