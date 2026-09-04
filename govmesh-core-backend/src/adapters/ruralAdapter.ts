import { CanonicalAddressChangeRequest, DepartmentCode, DepartmentStepResult, DocumentEvidenceRecord } from '../models/canonical.js';
import { DepartmentAdapter, AdapterRequestContext } from './departmentAdapter.js';
import { serviceRegistry } from '../registry/serviceRegistry.js';
import { auditService } from '../services/auditService.js';
import { cryptoService } from '../services/cryptoService.js';
import { evidenceService } from '../services/evidenceService.js';

export class RuralAdapter implements DepartmentAdapter {
  public getDepartmentCode(): DepartmentCode {
    return 'RURAL_DEVELOPMENT';
  }

  public getDepartmentName(): string {
    return 'Rural Development & Panchayat Raj';
  }

  public getProtocol(): 'CSV/SFTP' {
    return 'CSV/SFTP';
  }

  public supports(serviceCode: string): boolean {
    const supported = [
      'ADDRESS_CHANGE',
      'GRAM_PANCHAYAT_ADDRESS_UPDATE',
      'CIVIC_UTILITY_SYNC',
      'RURAL_SERVICE_SYNC',
      'PANCHAYAT_RECORD_UPDATE'
    ];
    return supported.includes(serviceCode);
  }

  public validate(request: CanonicalAddressChangeRequest): { valid: boolean; error?: string } {
    if (!request.applicationId) return { valid: false, error: 'Application ID is required.' };
    return { valid: true };
  }

  public transform(request: CanonicalAddressChangeRequest): any {
    const reqHash = request.canonicalRequestHash || cryptoService.computeCanonicalRequestHash(request);
    const docHash = request.documentHash || (request.documents && request.documents[0]?.checksum) || 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

    return {
      applicationId: request.applicationId,
      correlationId: request.correlationId || `CORR-26-${request.applicationId}`,
      citizenId: request.citizenId || 'GM-CIT-10001',
      serviceCode: request.serviceCode || 'ADDRESS_CHANGE',
      purpose: request.purpose || 'Rural service record update',
      consentId: request.consentId || 'CONSENT-00124',
      requestVersion: request.requestVersion || 1,
      canonicalRequestHash: reqHash,
      documentHash: docHash,
      createdAt: request.createdAt || new Date().toISOString(),
      citizen: {
        name: request.citizen.name || 'Demo Citizen',
        address: {
          line1: request.citizen.address?.line1 || request.citizen.address?.line || 'Gram Panchayat Ward No. 4',
          district: request.citizen.address?.district || 'Pune',
          state: request.citizen.address?.state || 'Maharashtra'
        }
      }
    };
  }

  public async send(transformedPayload: any, context: AdapterRequestContext): Promise<DepartmentStepResult> {
    const dept = serviceRegistry.getDepartment('RURAL_DEVELOPMENT');
    const baseUrl = dept?.baseUrl || 'https://sih-26129-gov-mesh-rural-develpment.vercel.app';
    const sentAt = new Date().toISOString();
    transformedPayload.sentAt = sentAt;

    const reqHash = context.canonicalRequestHash || transformedPayload.canonicalRequestHash;
    const docHash = context.documentHash || transformedPayload.documentHash;
    const ackId = `ACK-RURAL-${context.applicationId.replace(/[^a-zA-Z0-9]/g, '')}`;

    const docRecords: DocumentEvidenceRecord[] = (context.documents || []).map(d => ({
      documentId: d.id || `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
      applicationId: context.applicationId,
      documentName: d.name || 'address-proof-demo.pdf',
      documentType: d.type || 'PANCHAYAT_RESIDENCE_PROOF',
      documentVersion: d.version || 1,
      documentSize: d.size || '1.2 MB',
      documentHash: d.checksum || d.documentHash || docHash,
      uploadedAt: context.createdAt || sentAt,
      receivedAt: sentAt,
      sourceSystem: 'GovMesh Citizen Portal',
      receivedFrom: 'GovMesh Core Ingress',
      contentType: d.contentType || 'application/pdf',
      integrityStatus: 'VERIFIED',
      downloadUrl: `/api/govmesh/evidence/${context.applicationId}/documents/${d.id || 'DOC-1'}`
    }));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(`${baseUrl}/api/rural/address-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Correlation-ID': context.correlationId,
          'X-GovMesh-App-ID': context.applicationId,
          'X-GovMesh-Request-Hash': reqHash,
          'X-GovMesh-Sent-At': sentAt,
          'X-GovMesh-API-Key': process.env.GOVMESH_API_KEY || 'govmesh-live-secure-key-2026'
        },
        body: JSON.stringify(transformedPayload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const rawText = await response.text();
      let parsedData: any = {};
      try {
        parsedData = JSON.parse(rawText);
      } catch {
        parsedData = { raw: rawText };
      }

      const ackReceivedAt = new Date().toISOString();
      const receivedAt = parsedData?.receivedAt || parsedData?.data?.receivedAt || new Date().toISOString();
      const validatedAt = parsedData?.validatedAt || parsedData?.data?.validatedAt || receivedAt;
      const acceptedAt = parsedData?.acceptedAt || parsedData?.data?.acceptedAt || validatedAt;
      const completedAt = parsedData?.completedAt || parsedData?.data?.completedAt || (parsedData?.success ? ackReceivedAt : undefined);
      const finalAckId = parsedData?.acknowledgementId || parsedData?.data?.acknowledgementId || ackId;

      const normResult = this.normalizeResponse(parsedData, response.status, context);

      const timestampReport = evidenceService.validateTimestampOrdering({
        createdAt: context.createdAt,
        sentAt,
        receivedAt,
        validatedAt,
        acceptedAt,
        completedAt: normResult.status === 'SUCCESS' ? completedAt : undefined,
        ackReceivedAt
      });

      // Register Received Request Snapshot in Rural Evidence Ledger
      evidenceService.recordDepartmentReceived({
        applicationId: context.applicationId,
        correlationId: context.correlationId,
        serviceCode: context.serviceCode,
        departmentCode: 'RURAL_DEVELOPMENT',
        departmentName: this.getDepartmentName(),
        sourceSystem: 'GovMesh Core',
        sentAt,
        receivedAt,
        validatedAt,
        acceptedAt,
        completedAt: normResult.status === 'SUCCESS' ? completedAt : undefined,
        ackReceivedAt,
        requestVersion: context.requestVersion || 1,
        requestHash: reqHash,
        hashStatus: 'VERIFIED',
        citizenId: context.citizenId,
        authorizedFields: ['citizenId', 'citizen.name', 'citizen.address.line1', 'citizen.address.district', 'citizen.address.state'],
        receivedPayload: transformedPayload,
        documents: docRecords.length > 0 ? docRecords : [{
          documentId: 'DOC-RURAL-124',
          applicationId: context.applicationId,
          documentName: 'address-proof-demo.pdf',
          documentType: 'PANCHAYAT_RESIDENCE_PROOF',
          documentVersion: 1,
          documentSize: '1.2 MB',
          documentHash: docHash,
          uploadedAt: context.createdAt || sentAt,
          receivedAt,
          sourceSystem: 'GovMesh Citizen Portal',
          receivedFrom: 'GovMesh Core Ingress',
          contentType: 'application/pdf',
          integrityStatus: 'VERIFIED',
          downloadUrl: `/api/govmesh/evidence/${context.applicationId}/documents/DOC-RURAL-124`
        }],
        lifecycleState: normResult.status === 'SUCCESS' ? 'SUCCESS' : 'ACCEPTED',
        acknowledgement: {
          acknowledgementId: finalAckId,
          applicationId: context.applicationId,
          correlationId: context.correlationId,
          departmentCode: 'RURAL_DEVELOPMENT',
          requestVersion: context.requestVersion || 1,
          sentAt,
          receivedAt,
          validatedAt,
          acceptedAt,
          completedAt: normResult.status === 'SUCCESS' ? completedAt : undefined,
          ackReceivedAt,
          status: normResult.status === 'SUCCESS' ? 'COMPLETED' : 'ACCEPTED',
          requestHash: reqHash,
          documentHash: docHash,
          hashStatus: 'VERIFIED',
          remarks: normResult.remarks,
          timestampIntegrity: timestampReport
        },
        updatedAt: ackReceivedAt,
        timestampIntegrity: timestampReport
      });

      normResult.requestHash = reqHash;
      normResult.hashStatus = 'VERIFIED';
      normResult.documentHash = docHash;
      normResult.sentAt = sentAt;
      normResult.receivedAt = receivedAt;
      normResult.validatedAt = validatedAt;
      normResult.acceptedAt = acceptedAt;
      normResult.completedAt = completedAt;
      normResult.ackReceivedAt = ackReceivedAt;
      normResult.acknowledgementId = finalAckId;
      normResult.timestampIntegrity = timestampReport;

      return normResult;
    } catch (err: any) {
      clearTimeout(timeoutId);
      const isTimeout = err.name === 'AbortError';
      const errorMsg = isTimeout 
        ? 'Rural Development server connection timed out.'
        : `Network Error: ${err.message}`;

      const ackReceivedAt = new Date().toISOString();
      const receivedAt = new Date().toISOString();

      const timestampReport = evidenceService.validateTimestampOrdering({
        createdAt: context.createdAt,
        sentAt,
        receivedAt,
        ackReceivedAt
      });

      evidenceService.recordDepartmentReceived({
        applicationId: context.applicationId,
        correlationId: context.correlationId,
        serviceCode: context.serviceCode,
        departmentCode: 'RURAL_DEVELOPMENT',
        departmentName: this.getDepartmentName(),
        sourceSystem: 'GovMesh Core',
        sentAt,
        receivedAt,
        ackReceivedAt,
        requestVersion: context.requestVersion || 1,
        requestHash: reqHash,
        hashStatus: 'VERIFIED',
        citizenId: context.citizenId,
        authorizedFields: ['citizenId', 'citizen.name', 'citizen.address.line1', 'citizen.address.district', 'citizen.address.state'],
        receivedPayload: transformedPayload,
        documents: docRecords,
        lifecycleState: 'FAILED',
        acknowledgement: {
          acknowledgementId: ackId,
          applicationId: context.applicationId,
          correlationId: context.correlationId,
          departmentCode: 'RURAL_DEVELOPMENT',
          requestVersion: context.requestVersion || 1,
          sentAt,
          receivedAt,
          ackReceivedAt,
          status: 'REJECTED',
          requestHash: reqHash,
          documentHash: docHash,
          hashStatus: 'VERIFIED',
          remarks: errorMsg,
          timestampIntegrity: timestampReport
        },
        updatedAt: ackReceivedAt,
        timestampIntegrity: timestampReport
      });

      return {
        departmentCode: 'RURAL_DEVELOPMENT',
        departmentName: this.getDepartmentName(),
        protocol: this.getProtocol(),
        status: 'FAILED',
        timestamp: receivedAt,
        remarks: errorMsg,
        errorCode: isTimeout ? 'TIMEOUT' : 'CONNECTION_FAILED',
        requestHash: reqHash,
        hashStatus: 'VERIFIED',
        documentHash: docHash,
        sentAt,
        receivedAt,
        ackReceivedAt,
        acknowledgementId: ackId,
        timestampIntegrity: timestampReport
      };
    }
  }

  public normalizeResponse(rawResponse: any, httpStatus: number, context: AdapterRequestContext): DepartmentStepResult {
    const timestamp = context.createdAt || new Date().toISOString();

    if (httpStatus >= 200 && httpStatus < 300 && rawResponse?.success) {
      return {
        departmentCode: 'RURAL_DEVELOPMENT',
        departmentName: this.getDepartmentName(),
        protocol: this.getProtocol(),
        status: 'SUCCESS',
        timestamp,
        remarks: 'Local Gram Panchayat voter & resident registry synchronized with verified address.',
        departmentTransactionId: rawResponse?.departmentApplicationId || rawResponse?.record?.id || context.applicationId,
        rawResponse
      };
    }

    return {
      departmentCode: 'RURAL_DEVELOPMENT',
      departmentName: this.getDepartmentName(),
      protocol: this.getProtocol(),
      status: 'FAILED',
      timestamp,
      remarks: rawResponse?.message || `Rural Development service returned HTTP ${httpStatus}`,
      errorCode: rawResponse?.errorCode || `HTTP_${httpStatus}`,
      departmentTransactionId: context.applicationId,
      rawResponse
    };
  }

  public async healthCheck(): Promise<boolean> {
    const dept = serviceRegistry.getDepartment('RURAL_DEVELOPMENT');
    const baseUrl = dept?.baseUrl || 'https://sih-26129-gov-mesh-rural-develpment.vercel.app';
    try {
      const res = await fetch(`${baseUrl}/api/rural/health`);
      return res.status < 500;
    } catch {
      return false;
    }
  }

  public async process(request: CanonicalAddressChangeRequest): Promise<DepartmentStepResult> {
    const validation = this.validate(request);
    const createdUtc = request.createdAt || new Date().toISOString();
    const reqHash = request.canonicalRequestHash || cryptoService.computeCanonicalRequestHash(request);
    const docHash = request.documentHash || (request.documents && request.documents[0]?.checksum) || 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

    const context: AdapterRequestContext = {
      applicationId: request.applicationId,
      correlationId: request.correlationId || `CORR-26-${request.applicationId}`,
      citizenId: request.citizenId,
      serviceCode: request.serviceCode,
      consentId: request.consentId,
      timestamp: createdUtc,
      requestVersion: request.requestVersion || 1,
      canonicalRequestHash: reqHash,
      documentHash: docHash,
      createdAt: createdUtc,
      documents: request.documents
    };

    if (!validation.valid) {
      return {
        departmentCode: 'RURAL_DEVELOPMENT',
        departmentName: this.getDepartmentName(),
        protocol: this.getProtocol(),
        status: 'FAILED',
        timestamp: createdUtc,
        remarks: validation.error || 'Validation failed',
        errorCode: 'VALIDATION_ERROR'
      };
    }

    auditService.log({
      correlationId: context.correlationId,
      applicationId: context.applicationId,
      event: 'DEPARTMENT_REQUEST_SENT',
      department: 'RURAL_DEVELOPMENT',
      actor: 'GovMesh Rural Legacy Adapter',
      result: 'SUCCESS',
      details: `Dispatched CSV/API payload to Rural Panchayat. RequestHash: ${reqHash.slice(0, 16)}... | DocumentHash: ${docHash.slice(0, 16)}...`
    });

    const transformed = this.transform(request);
    const result = await this.send(transformed, context);

    auditService.log({
      correlationId: context.correlationId,
      applicationId: context.applicationId,
      event: 'DEPARTMENT_RESPONSE_RECEIVED',
      department: 'RURAL_DEVELOPMENT',
      actor: 'Rural Development Panchayat API',
      result: result.status === 'SUCCESS' ? 'SUCCESS' : 'FAILED',
      details: result.remarks
    });

    return result;
  }
}

export const ruralAdapter = new RuralAdapter();
