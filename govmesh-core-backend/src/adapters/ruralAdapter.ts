import { CanonicalAddressChangeRequest, DepartmentCode, DepartmentStepResult } from '../models/canonical.js';
import { DepartmentAdapter, AdapterRequestContext } from './departmentAdapter.js';
import { serviceRegistry } from '../registry/serviceRegistry.js';
import { auditService } from '../services/auditService.js';

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
    return {
      applicationId: request.applicationId,
      citizenId: request.citizenId || 'GM-CIT-10001',
      serviceCode: request.serviceCode || 'ADDRESS_CHANGE',
      purpose: request.purpose || 'Rural service record update',
      consentId: request.consentId || 'CONSENT-00124',
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
    const timestamp = context.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(`${baseUrl}/api/rural/address-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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

      return this.normalizeResponse(parsedData, response.status, context);
    } catch (err: any) {
      clearTimeout(timeoutId);
      const isTimeout = err.name === 'AbortError';
      const errorMsg = isTimeout 
        ? 'Rural Development server connection timed out.'
        : `Network Error: ${err.message}`;

      return {
        departmentCode: 'RURAL_DEVELOPMENT',
        departmentName: this.getDepartmentName(),
        protocol: this.getProtocol(),
        status: 'FAILED',
        timestamp,
        remarks: errorMsg,
        errorCode: isTimeout ? 'TIMEOUT' : 'CONNECTION_FAILED'
      };
    }
  }

  public normalizeResponse(rawResponse: any, httpStatus: number, context: AdapterRequestContext): DepartmentStepResult {
    const timestamp = context.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const context: AdapterRequestContext = {
      applicationId: request.applicationId,
      correlationId: request.correlationId || `CORR-26-${Date.now()}`,
      citizenId: request.citizenId,
      serviceCode: request.serviceCode,
      consentId: request.consentId,
      timestamp
    };

    if (!validation.valid) {
      return {
        departmentCode: 'RURAL_DEVELOPMENT',
        departmentName: this.getDepartmentName(),
        protocol: this.getProtocol(),
        status: 'FAILED',
        timestamp,
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
      details: 'Dispatched CSV payload / API request to Rural Development Department.'
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
