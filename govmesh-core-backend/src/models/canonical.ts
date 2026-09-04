export type DepartmentCode = 'REVENUE' | 'FOOD' | 'RURAL_DEVELOPMENT' | string;

export type TransactionStatus = 
  | 'SUBMITTED' 
  | 'ROUTING' 
  | 'SENT_TO_DEPARTMENT' 
  | 'RECEIVED' 
  | 'PROCESSING' 
  | 'PARTIALLY_COMPLETED'
  | 'ACTION_REQUIRED' 
  | 'COMPLETED' 
  | 'FAILED' 
  | 'RETRY_REQUIRED'
  | 'RETRYING';

export type DepartmentStepStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'PARTIALLY_COMPLETED'
  | 'FAILED'
  | 'RETRYING'
  | 'ACTION_REQUIRED'
  | 'CONSENT_BLOCKED';

export type ServiceExecutionMode = 'PARALLEL_FAN_OUT' | 'SEQUENTIAL_VERIFIED';

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
  idempotencyKey?: string;
  sourceDepartment?: string;
  targetDepartments?: DepartmentCode[];
  departmentCode?: DepartmentCode;
  serviceCode: string;
  purpose: string;
  consentId: string;
  consents?: {
    revenue?: boolean;
    food?: boolean;
    rural?: boolean;
    [key: string]: boolean | undefined;
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
  status: DepartmentStepStatus;
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
  targetDepartments: DepartmentCode[];
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
  completedDepartments?: number;
  totalDepartments?: number;
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
    | 'TRANSACTION_CREATED'
    | 'CONSENT_VERIFIED'
    | 'ROUTING_STARTED'
    | 'DEPARTMENT_REQUEST_SENT'
    | 'DEPARTMENT_RESPONSE_RECEIVED'
    | 'DEPARTMENT_PROCESSING'
    | 'DEPARTMENT_COMPLETED'
    | 'DEPARTMENT_FAILED'
    | 'TRANSACTION_PARTIALLY_COMPLETED'
    | 'TRANSACTION_COMPLETED'
    | 'RETRY_STARTED'
    | 'RETRY_COMPLETED'
    | 'FAILED';
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

export interface ServiceDefinition {
  serviceCode: string;
  serviceName: string;
  description: string;
  targetDepartments: DepartmentCode[];
  requiredConsents: string[];
  executionMode: ServiceExecutionMode;
  requiredFields: string[];
}
