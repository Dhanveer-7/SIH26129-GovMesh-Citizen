import { CitizenProfile, Application, ConsentRecord, Notification, DataSharingLog, InteroperabilityEvidence, DepartmentReceivedRequest, DocumentEvidenceRecord } from '../types';
import { mockServices } from '../mock/data';

// Read backend URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const IS_MOCK_MODE = !API_BASE_URL;

console.log(`[GovMesh Service Init] Mode: ${IS_MOCK_MODE ? 'SANDBOX_MOCK' : 'LIVE_BACKEND'}, Base URL: ${API_BASE_URL || 'N/A'}`);

function getCoreBaseUrl(): string {
  const configuredUrl = import.meta.env.VITE_GOVMESH_CORE_URL || import.meta.env.VITE_API_BASE_URL;
  return configuredUrl ? configuredUrl.replace(/\/+$/, '') : (import.meta.env.DEV ? 'http://localhost:5000' : window.location.origin);
}

// Helper to make fetch requests to the real API
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  // Check modes
  isMock: () => IS_MOCK_MODE,
  getBaseUrl: () => API_BASE_URL,
  getCoreUrl: () => getCoreBaseUrl(),

  // Authentication API
  login: async (mobile: string): Promise<{ success: boolean; otpSent: boolean }> => {
    if (IS_MOCK_MODE) {
      return { success: true, otpSent: true };
    }
    return apiRequest<{ success: boolean; otpSent: boolean }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ mobile }),
    });
  },

  verifyOtp: async (mobile: string, otp: string): Promise<{ success: boolean; token?: string; user?: CitizenProfile }> => {
    if (IS_MOCK_MODE) {
      return { success: otp === '123456' };
    }
    return apiRequest<{ success: boolean; token?: string; user: CitizenProfile }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile, otp }),
    });
  },

  register: async (name: string, mobile: string, email: string): Promise<{ success: boolean; user?: CitizenProfile }> => {
    if (IS_MOCK_MODE) {
      return { success: true };
    }
    return apiRequest<{ success: boolean; user: CitizenProfile }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, mobile, email }),
    });
  },

  // Services Directory API
  getServices: async () => {
    if (IS_MOCK_MODE) {
      return mockServices;
    }
    return apiRequest<typeof mockServices>('/services');
  },

  // Service Request Submission
  submitServiceRequest: async (requestData: {
    serviceId: string;
    consents: { department: string; approved: boolean }[];
    documents: { name: string; size: string; type: string }[];
  }): Promise<{ success: boolean; applicationId: string; workflowId: string }> => {
    if (IS_MOCK_MODE) {
      return {
        success: true,
        applicationId: 'GM-2026-000124',
        workflowId: 'ADDRESS_CHANGE_V1'
      };
    }
    return apiRequest<{ success: boolean; applicationId: string; workflowId: string }>('/service-request', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  },

  // Applications & Tracking API
  getApplications: async (): Promise<Application[]> => {
    if (IS_MOCK_MODE) {
      return [];
    }
    return apiRequest<Application[]>('/applications');
  },

  getApplicationById: async (id: string): Promise<Application> => {
    if (IS_MOCK_MODE) {
      throw new Error("Use local sandbox state handlers for single application query.");
    }
    return apiRequest<Application>(`/applications/${id}`);
  },

  // Consents API
  getConsents: async (): Promise<ConsentRecord[]> => {
    if (IS_MOCK_MODE) {
      return [];
    }
    return apiRequest<ConsentRecord[]>('/consents');
  },

  revokeConsent: async (consentId: string): Promise<{ success: boolean }> => {
    if (IS_MOCK_MODE) {
      return { success: true };
    }
    return apiRequest<{ success: boolean }>(`/consent/${consentId}/revoke`, {
      method: 'POST',
    });
  },

  // Notifications API
  getNotifications: async (): Promise<Notification[]> => {
    if (IS_MOCK_MODE) {
      return [];
    }
    return apiRequest<Notification[]>('/notifications');
  },

  markNotificationRead: async (id: string): Promise<{ success: boolean }> => {
    if (IS_MOCK_MODE) {
      return { success: true };
    }
    return apiRequest<{ success: boolean }>(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },

  // Audit Logs API (Data Sharing Ledger)
  getDataSharingLogs: async (): Promise<DataSharingLog[]> => {
    if (IS_MOCK_MODE) {
      return [];
    }
    return apiRequest<DataSharingLog[]>('/transparency/logs');
  },

  // GovMesh Interoperability Core Transaction Ingress
  submitGovMeshTransaction: async (payload: {
    applicationId?: string;
    citizenId?: string;
    serviceCode?: string;
    purpose?: string;
    consentId?: string;
    consents?: { revenue: boolean; food: boolean; rural: boolean; [key: string]: boolean | undefined };
    citizen?: { name?: string; address?: { line1?: string; district?: string; state?: string } };
    documents?: any[];
  }) => {
    const coreUrl = getCoreBaseUrl();
    const res = await fetch(`${coreUrl}/api/govmesh/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  getGovMeshTransactionStatus: async (applicationId: string) => {
    const coreUrl = getCoreBaseUrl();
    const res = await fetch(`${coreUrl}/api/govmesh/transactions/${applicationId}`);
    return res.json();
  },

  retryGovMeshTransaction: async (applicationId: string) => {
    const coreUrl = getCoreBaseUrl();
    const res = await fetch(`${coreUrl}/api/govmesh/transactions/${applicationId}/retry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return res.json();
  },

  getGovMeshServices: async () => {
    const coreUrl = getCoreBaseUrl();
    const res = await fetch(`${coreUrl}/api/govmesh/services`);
    return res.json();
  },

  getGovMeshAudit: async (applicationId: string) => {
    const coreUrl = getCoreBaseUrl();
    const res = await fetch(`${coreUrl}/api/govmesh/audit/${applicationId}`);
    return res.json();
  },

  // End-to-End Interoperability Evidence & Traceability
  getGovMeshEvidence: async (applicationId: string): Promise<{ success: boolean; evidence: InteroperabilityEvidence }> => {
    const coreUrl = getCoreBaseUrl();
    const res = await fetch(`${coreUrl}/api/govmesh/evidence/${applicationId}`);
    return res.json();
  },

  getDepartmentReceivedRequest: async (applicationId: string, departmentCode: string): Promise<{ success: boolean; receivedRequest: DepartmentReceivedRequest }> => {
    const coreUrl = getCoreBaseUrl();
    const res = await fetch(`${coreUrl}/api/govmesh/evidence/${applicationId}/department/${departmentCode}`);
    return res.json();
  },

  getDocumentEvidence: async (applicationId: string, documentId: string): Promise<{ success: boolean; document: DocumentEvidenceRecord }> => {
    const coreUrl = getCoreBaseUrl();
    const res = await fetch(`${coreUrl}/api/govmesh/evidence/${applicationId}/documents/${documentId}`);
    return res.json();
  }
};
export default api;
