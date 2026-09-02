import { CanonicalAddressChangeRequest, DepartmentStepResult } from '../models/canonical.js';
import { serviceRegistry } from '../registry/serviceRegistry.js';
import { auditService } from '../services/auditService.js';

let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

async function getRevenueAuthToken(baseUrl: string): Promise<string> {
  const now = Date.now();
  if (cachedToken && tokenExpiresAt > now + 60000) {
    return cachedToken;
  }

  try {
    const res = await fetch(`${baseUrl}/revenue/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: process.env.REVENUE_SERVICE_USER || 'revenue.officer',
        password: process.env.REVENUE_SERVICE_PASSWORD || 'Officer@2026'
      })
    });

    if (res.ok) {
      const data: any = await res.json();
      if (data?.access_token) {
        cachedToken = String(data.access_token);
        tokenExpiresAt = now + ((data.expires_in || 1800) * 1000);
        return cachedToken;
      }
    }
  } catch (err) {
    console.warn('[Revenue Adapter] Could not acquire service token:', err);
  }
  return '';
}

export const revenueAdapter = {
  process: async (request: CanonicalAddressChangeRequest): Promise<DepartmentStepResult> => {
    const dept = serviceRegistry.getDepartment('REVENUE');
    const baseUrl = dept?.baseUrl || 'https://sih-2026-revenue-dept.onrender.com';
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    auditService.log({
      correlationId: request.correlationId || request.applicationId,
      applicationId: request.applicationId,
      event: 'DEPARTMENT_REQUEST_SENT',
      department: 'REVENUE',
      actor: 'GovMesh Revenue Adapter',
      result: 'SUCCESS',
      details: `Dispatched REST/JSON verification probe to ${baseUrl}/api/v1/revenue/address/verify`
    });

    try {
      const token = await getRevenueAuthToken(baseUrl);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Correlation-ID': request.correlationId || request.applicationId
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const payload = {
        application_id: request.applicationId,
        citizen_name: request.citizen.name || 'Demo Citizen',
        new_address: {
          line: request.citizen.address?.line1 || request.citizen.address?.line || 'Demo Address',
          district: request.citizen.address?.district || 'Pune',
          taluka: request.citizen.address?.taluka || 'Haveli'
        },
        consent_id: request.consentId
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(`${baseUrl}/api/v1/revenue/address/verify`, {
        method: 'POST',
        headers,
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
        department: 'REVENUE',
        actor: 'Revenue Department API',
        result: response.ok ? 'SUCCESS' : 'FAILED',
        details: `Received HTTP ${response.status} from Revenue Department`
      });

      if (response.ok && (parsedData?.success || parsedData?.data)) {
        return {
          departmentCode: 'REVENUE',
          departmentName: 'Revenue & Forest Department',
          protocol: 'REST/JSON',
          status: 'SUCCESS',
          timestamp,
          remarks: 'Address record successfully verified and updated on Revenue Land Registry.',
          departmentTransactionId: parsedData?.data?.applicationId || request.applicationId,
          rawResponse: parsedData
        };
      } else {
        return {
          departmentCode: 'REVENUE',
          departmentName: 'Revenue & Forest Department',
          protocol: 'REST/JSON',
          status: 'FAILED',
          timestamp,
          remarks: parsedData?.message || parsedData?.error?.message || `Revenue verification probe returned HTTP ${response.status}`,
          errorCode: parsedData?.error?.code || `HTTP_${response.status}`,
          rawResponse: parsedData
        };
      }
    } catch (err: any) {
      const isTimeout = err.name === 'AbortError';
      const errorMsg = isTimeout 
        ? 'Revenue Department connection timed out.'
        : `Network Error: ${err.message}`;

      auditService.log({
        correlationId: request.correlationId || request.applicationId,
        applicationId: request.applicationId,
        event: 'FAILED',
        department: 'REVENUE',
        actor: 'GovMesh Revenue Adapter',
        result: 'FAILED',
        details: errorMsg
      });

      return {
        departmentCode: 'REVENUE',
        departmentName: 'Revenue & Forest Department',
        protocol: 'REST/JSON',
        status: 'FAILED',
        timestamp,
        remarks: errorMsg,
        errorCode: isTimeout ? 'TIMEOUT' : 'CONNECTION_FAILED'
      };
    }
  }
};
