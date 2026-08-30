export interface AddressInfo {
  line1: string;
  district: string;
  state: string;
}

export interface CanonicalAddressChangeRequest {
  applicationId: string;
  citizenId: string;
  serviceCode: string;
  purpose: string;
  consentId: string;
  citizen: {
    name: string;
    address: AddressInfo;
  };
}

export interface IntegrationResponse {
  success: boolean;
  department: string;
  departmentApplicationId: string;
  status: 'RECEIVED' | 'PROCESSING' | 'ACTION_REQUIRED' | 'COMPLETED' | 'FAILED';
  message: string;
}

const RURAL_API_BASE_URL = import.meta.env.VITE_RURAL_API_BASE_URL || '';
const GOVMESH_API_BASE_URL = import.meta.env.VITE_GOVMESH_API_BASE_URL || '';

export const ruralDepartmentApi = {
  getBaseUrl: () => RURAL_API_BASE_URL,
  getGovmeshBaseUrl: () => GOVMESH_API_BASE_URL,

  /**
   * Submits a canonical address change request to the Rural Development department.
   * Maps client format to the department contract schemas.
   */
  submitAddressChange: async (request: CanonicalAddressChangeRequest): Promise<IntegrationResponse> => {
    // 1. Check if the VITE_RURAL_API_BASE_URL is configured
    if (!RURAL_API_BASE_URL) {
      throw new Error("Integration Error: VITE_RURAL_API_BASE_URL environment variable is not defined.");
    }

    console.log(`[Integration Service] Submitting transaction ${request.applicationId} to remote host: ${RURAL_API_BASE_URL}`);

    /**
     * Inspecting the remote Rural Development API spec:
     * Currently, the remote system only exposes file uploads/toggles and auth. 
     * It does NOT expose any endpoint matching POST /api/rural/address-update or POST /api/govmesh/requests.
     * 
     * As per the architectural guidelines, if the required endpoint is missing,
     * we must immediately report its unavailability.
     */
    const expectedEndpoint = '/api/rural/address-update';
    
    // Explicitly throw integration error to prevent silent mock bypasses
    throw new Error("GovMesh integration endpoint is not currently available.");
  },

  /**
   * Polls the status of a specific GovMesh transaction from the Rural system.
   */
  pollApplicationStatus: async (departmentApplicationId: string): Promise<any> => {
    if (!RURAL_API_BASE_URL) {
      throw new Error("Integration Error: VITE_RURAL_API_BASE_URL environment variable is not defined.");
    }

    /**
     * The Rural system does not currently provide a GET /api/govmesh/requests/{applicationId} 
     * or GET /api/rural/application/{id} status polling endpoint.
     */
    throw new Error("Status endpoint 'GET /api/rural/application/{id}' must be added to the Rural Development application.");
  }
};

export default ruralDepartmentApi;
