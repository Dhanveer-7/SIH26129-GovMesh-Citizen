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
   * Connects directly to the configured endpoint and maps response status.
   */
  submitAddressChange: async (request: CanonicalAddressChangeRequest): Promise<IntegrationResponse> => {
    if (!RURAL_API_BASE_URL) {
      throw new Error("Integration Error: VITE_RURAL_API_BASE_URL environment variable is not defined.");
    }

    const url = `${RURAL_API_BASE_URL}/api/rural/address-update`;
    console.log(`[Integration Service] POST Request initiated to: ${url}`);

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });
    } catch (err: any) {
      throw new Error(`Network Failure: Unable to establish connection to Rural server. details: ${err.message}`);
    }

    // Capture raw response body for parsing analysis
    const rawBody = await response.text();
    console.log(`[Integration Service Response] HTTP ${response.status} Raw Body:`, rawBody);

    // Guard: Verify HTTP response is successful (2xx)
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("GovMesh integration endpoint is not currently available.");
      }
      throw new Error(`API Error ${response.status}: Rural Development service is temporarily unavailable. Request not completed.`);
    }

    // Guard: Parse JSON response securely
    try {
      const data = JSON.parse(rawBody) as IntegrationResponse;
      return data;
    } catch {
      throw new Error(`Parsing Failure: Server returned an invalid payload format (Expected JSON, received: ${response.headers.get('content-type') || 'text'}).`);
    }
  },

  /**
   * Polls the status of a specific GovMesh transaction from the Rural system.
   */
  pollApplicationStatus: async (departmentApplicationId: string): Promise<any> => {
    if (!RURAL_API_BASE_URL) {
      throw new Error("Integration Error: VITE_RURAL_API_BASE_URL environment variable is not defined.");
    }

    const url = `${RURAL_API_BASE_URL}/api/rural/application/${departmentApplicationId}`;
    console.log(`[Integration Service] Polling application status from: ${url}`);

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'GET'
      });
    } catch (err: any) {
      throw new Error(`Network Failure: Status lookup failed. details: ${err.message}`);
    }

    const rawBody = await response.text();

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Status endpoint 'GET /api/rural/application/{id}' must be added to the Rural Development application.");
      }
      throw new Error(`API Status Lookup Error ${response.status}`);
    }

    try {
      return JSON.parse(rawBody);
    } catch {
      throw new Error("Parsing Failure: Status response was not valid JSON.");
    }
  }
};

export default ruralDepartmentApi;
