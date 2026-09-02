export type DepartmentCode = 'REVENUE' | 'FOOD' | 'RURAL_DEVELOPMENT';

export type TransactionStatus = 
  | 'SUBMITTED' 
  | 'ROUTING' 
  | 'SENT_TO_DEPARTMENT' 
  | 'RECEIVED' 
  | 'PROCESSING' 
  | 'ACTION_REQUIRED' 
  | 'COMPLETED' 
  | 'FAILED' 
  | 'RETRYING';

export interface AddressInfo {
  line1?: string;
  line?: string;
  houseNo?: string;
  street?: string;
  village?: string;
  taluka?: string;
  district?: string;
  state?: string;
  pincode?: string;
}

export interface CitizenInfo {
  reference?: string;
  citizenId?: string;
  name?: string;
  mobile?: string;
  email?: string;
  address?: AddressInfo;
}

export interface VerificationInfo {
  status?: string;
  source?: string;
  verified?: boolean;
}

export interface ConsentInfo {
  id: string;
  purpose?: string;
  scope?: string[];
  validUntil?: string;
  approved?: boolean;
}

export interface ProofDocument {
  id?: string;
  name?: string;
  type?: string;
  size?: string;
  checksum?: string;
  extractedFields?: Record<string, any>;
}

export interface CanonicalAddressChangeRequest {
  applicationId: string;
  citizenId: string;
  correlationId?: string;
  sourceDepartment?: string;
  targetDepartment?: string;
  departmentCode?: DepartmentCode;
  serviceCode: string;
  purpose: string;
  consentId: string;
  consents?: {
    revenue?: boolean;
    food?: boolean;
    rural?: boolean;
  };
  citizen: CitizenInfo;
  verification?: VerificationInfo;
  consent?: ConsentInfo;
  documents?: ProofDocument[];
  requestedFields?: string[];
  payload?: Record<string, any>;
}

export interface DepartmentStepResult {
  departmentCode: DepartmentCode;
  departmentName: string;
  protocol: 'REST/JSON' | 'SOAP/XML' | 'CSV/SFTP';
  status: 'PENDING' | 'SUCCESS' | 'PROCESSING' | 'FAILED' | 'RETRYING' | 'ACTION_REQUIRED';
  timestamp: string;
  remarks: string;
  departmentTransactionId?: string;
  errorCode?: string;
  rawResponse?: any;
}

export interface TransactionRecord {
  applicationId: string;
  correlationId: string;
  citizenId: string;
  serviceCode: string;
  purpose: string;
  consentId: string;
  createdAt: string;
  updatedAt: string;
  status: TransactionStatus;
  progressPercent: number;
  completedDepartments: number;
  totalDepartments: number;
  steps: DepartmentStepResult[];
  citizen: CitizenInfo;
  documents?: ProofDocument[];
  auditTrail: string[];
}

export interface CanonicalTransactionResponse {
  success: boolean;
  applicationId: string;
  correlationId: string;
  status: TransactionStatus;
  departmentCode?: DepartmentCode;
  progressPercent: number;
  message: string;
  transaction?: TransactionRecord;
  errorCode?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  correlationId: string;
  applicationId: string;
  event: 
    | 'REQUEST_CREATED'
    | 'CONSENT_VERIFIED'
    | 'ROUTING'
    | 'DEPARTMENT_REQUEST_SENT'
    | 'DEPARTMENT_RESPONSE_RECEIVED'
    | 'PROCESSING'
    | 'FAILED'
    | 'RETRY'
    | 'COMPLETED';
  department?: string;
  actor: string;
  result: 'SUCCESS' | 'FAILED' | 'BLOCKED' | 'PENDING' | 'RETRY';
  details: string;
}

export interface ServiceRegistryEntry {
  departmentCode: DepartmentCode;
  departmentName: string;
  baseUrl: string;
  protocol: 'REST/JSON' | 'SOAP/XML' | 'CSV/SFTP';
  enabled: boolean;
  supportedServices: string[];
  description: string;
}
