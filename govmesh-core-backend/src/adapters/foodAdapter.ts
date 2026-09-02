import { CanonicalAddressChangeRequest, DepartmentStepResult } from '../models/canonical.js';
import { serviceRegistry } from '../registry/serviceRegistry.js';
import { auditService } from '../services/auditService.js';

export const foodAdapter = {
  process: async (request: CanonicalAddressChangeRequest): Promise<DepartmentStepResult> => {
    const dept = serviceRegistry.getDepartment('FOOD');
    const baseUrl = dept?.baseUrl || 'https://sih-flax-rho.vercel.app';
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    auditService.log({
      correlationId: request.correlationId || request.applicationId,
      applicationId: request.applicationId,
      event: 'DEPARTMENT_REQUEST_SENT',
      department: 'FOOD',
      actor: 'GovMesh Food Adapter',
      result: 'SUCCESS',
      details: `Dispatched Canonical interoperability request to ${baseUrl}/api/govmesh/interoperability/address-update`
    });

    try {
      const payload = {
        applicationId: request.applicationId,
        sourceDepartment: 'REVENUE',
        targetDepartment: 'FOOD',
        correlationId: request.correlationId || `CORR-26-${Math.floor(1000 + Math.random() * 9000)}`,
        purpose: 'RATION_ADDRESS_UPDATE',
        requestedFields: [
          'citizen.name',
          'citizen.address',
          'citizen.address.district',
          'citizen.address.taluka',
          'verification.status'
        ],
        citizen: {
          reference: request.citizenId || 'GM-CIT-10001',
          name: request.citizen.name || 'Demo Citizen',
          address: {
            line: request.citizen.address?.line1 || request.citizen.address?.line || 'Demo Address',
            district: request.citizen.address?.district || 'Pune',
            taluka: request.citizen.address?.taluka || 'Haveli'
          }
        },
        verification: {
          status: 'VERIFIED',
          source: 'REVENUE_DEPARTMENT'
        },
        consent: {
          id: request.consentId || 'CONSENT-00124'
        }
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(`${baseUrl}/api/govmesh/interoperability/address-update`, {
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
        department: 'FOOD',
        actor: 'Food Department API / SOAP Interoperability',
        result: response.ok ? 'SUCCESS' : 'FAILED',
        details: `Received HTTP ${response.status} from Food Department (Status: ${parsedData?.status || 'N/A'})`
      });

      if (response.ok && (parsedData?.status === 'SUCCESS' || !parsedData?.status || parsedData?.status === 'RECEIVED')) {
        return {
          departmentCode: 'FOOD',
          departmentName: 'Food, Civil Supplies & Consumer Protection',
          protocol: 'SOAP/XML',
          status: 'SUCCESS',
          timestamp,
          remarks: 'Ration card & PDS family quota records successfully synchronized via SOAP transformation.',
          departmentTransactionId: parsedData?.correlationId || request.correlationId,
          rawResponse: parsedData
        };
      } else {
        return {
          departmentCode: 'FOOD',
          departmentName: 'Food, Civil Supplies & Consumer Protection',
          protocol: 'SOAP/XML',
          status: 'FAILED',
          timestamp,
          remarks: parsedData?.message || `Food Department returned error status: ${parsedData?.status || response.status}`,
          errorCode: parsedData?.errorCode || `HTTP_${response.status}`,
          rawResponse: parsedData
        };
      }
    } catch (err: any) {
      const isTimeout = err.name === 'AbortError';
      const errorMsg = isTimeout 
        ? 'Food Department SOAP service connection timed out.'
        : `Network Error: ${err.message}`;

      auditService.log({
        correlationId: request.correlationId || request.applicationId,
        applicationId: request.applicationId,
        event: 'FAILED',
        department: 'FOOD',
        actor: 'GovMesh Food Adapter',
        result: 'FAILED',
        details: errorMsg
      });

      return {
        departmentCode: 'FOOD',
        departmentName: 'Food, Civil Supplies & Consumer Protection',
        protocol: 'SOAP/XML',
        status: 'FAILED',
        timestamp,
        remarks: errorMsg,
        errorCode: isTimeout ? 'TIMEOUT' : 'CONNECTION_FAILED'
      };
    }
  }
};
