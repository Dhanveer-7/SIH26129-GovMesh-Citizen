import { CanonicalAddressChangeRequest, DepartmentStepResult } from '../models/canonical.js';
import { serviceRegistry } from '../registry/serviceRegistry.js';
import { auditService } from '../services/auditService.js';

export const ruralAdapter = {
  process: async (request: CanonicalAddressChangeRequest): Promise<DepartmentStepResult> => {
    const dept = serviceRegistry.getDepartment('RURAL_DEVELOPMENT');
    const baseUrl = dept?.baseUrl || 'https://sih-26129-gov-mesh-rural-develpment-qict005hp-josh06.vercel.app';
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    auditService.log({
      correlationId: request.correlationId || request.applicationId,
      applicationId: request.applicationId,
      event: 'DEPARTMENT_REQUEST_SENT',
      department: 'RURAL_DEVELOPMENT',
      actor: 'GovMesh Rural Legacy Adapter',
      result: 'SUCCESS',
      details: `Dispatched CSV payload / API request to ${baseUrl}/api/rural/address-update`
    });

    try {
      const payload = {
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

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      const response = await fetch(`${baseUrl}/api/rural/address-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
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

      auditService.log({
        correlationId: request.correlationId || request.applicationId,
        applicationId: request.applicationId,
        event: 'DEPARTMENT_RESPONSE_RECEIVED',
        department: 'RURAL_DEVELOPMENT',
        actor: 'Rural Development API',
        result: response.ok ? 'SUCCESS' : 'FAILED',
        details: `Received HTTP ${response.status} from Rural Development Department`
      });

      if (response.ok && parsedData?.success) {
        return {
          departmentCode: 'RURAL_DEVELOPMENT',
          departmentName: 'Rural Development & Panchayat Raj',
          protocol: 'CSV/SFTP',
          status: 'SUCCESS',
          timestamp,
          remarks: 'Local Gram Panchayat voter & resident registry synchronized with verified address.',
          departmentTransactionId: parsedData?.departmentApplicationId || parsedData?.record?.id || request.applicationId,
          rawResponse: parsedData
        };
      } else {
        return {
          departmentCode: 'RURAL_DEVELOPMENT',
          departmentName: 'Rural Development & Panchayat Raj',
          protocol: 'CSV/SFTP',
          status: 'FAILED',
          timestamp,
          remarks: parsedData?.message || `Rural Development service returned HTTP ${response.status}`,
          errorCode: parsedData?.errorCode || `HTTP_${response.status}`,
          rawResponse: parsedData
        };
      }
    } catch (err: any) {
      const isTimeout = err.name === 'AbortError';
      const errorMsg = isTimeout 
        ? 'Rural Development server connection timed out.'
        : `Network Error: ${err.message}`;

      auditService.log({
        correlationId: request.correlationId || request.applicationId,
        applicationId: request.applicationId,
        event: 'FAILED',
        department: 'RURAL_DEVELOPMENT',
        actor: 'GovMesh Rural Legacy Adapter',
        result: 'FAILED',
        details: errorMsg
      });

      return {
        departmentCode: 'RURAL_DEVELOPMENT',
        departmentName: 'Rural Development & Panchayat Raj',
        protocol: 'CSV/SFTP',
        status: 'FAILED',
        timestamp,
        remarks: errorMsg,
        errorCode: isTimeout ? 'TIMEOUT' : 'CONNECTION_FAILED'
      };
    }
  }
};
