export type DepartmentCode = 'REVENUE' | 'FOOD' | 'RURAL_DEVELOPMENT' | string;

export type TransactionStatus = 
  | 'SUBMITTED' 
  | 'ROUTING' 
  | 'SENT_TO_DEPARTMENT' 
  | 'RECEIVED' 
  | 'VALIDATING'
  | 'ACCEPTED'
  | 'PROCESSING' 
  | 'PARTIALLY_COMPLETED'
  | 'ACTION_REQUIRED' 
  | 'COMPLETED' 
  | 'FAILED' 
  | 'RETRY_REQUIRED'
  | 'RETRYING';

export type DepartmentStepStatus =
  | 'PENDING'
  | 'SENT'
  | 'RECEIVED'
  | 'VALIDATING'
  | 'ACCEPTED'
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
  documentHash?: string;
  version?: number;
  uploadedAt?: string;
  contentType?: string;
  dataUrl?: string;
  extractedFields?: Record<string, any>;
}

export interface DocumentEvidenceRecord {
  documentId: string;
  applicationId: string;
  documentName: string;
  documentType: string;
  documentVersion: number;
  documentSize: string;
  documentHash: string;
  uploadedAt: string;
  receivedAt: string;
  sourceSystem: string;
  receivedFrom: string;
  contentType: string;
  integrityStatus: 'VERIFIED' | 'MISMATCH';
  downloadUrl?: string;
  contentPreview?: string;
}

export interface DepartmentAcknowledgement {
  acknowledgementId: string;
  applicationId: string;
  correlationId: string;
  departmentCode: DepartmentCode;
  requestVersion: number;
  receivedAt: string;
  acceptedAt?: string;
  completedAt?: string;
  status: 'RECEIVED' | 'ACCEPTED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  requestHash: string;
  documentHash?: string;
  hashStatus: 'VERIFIED' | 'MISMATCH';
  remarks: string;
}

export interface DepartmentReceivedRequest {
  applicationId: string;
  correlationId: string;
  serviceCode: string;
  departmentCode: DepartmentCode;
  departmentName: string;
  sourceSystem: string;
  receivedAt: string;
  acceptedAt?: string;
  completedAt?: string;
  requestVersion: number;
  requestHash: string;
  hashStatus: 'VERIFIED' | 'MISMATCH';
  citizenId: string;
  authorizedFields: string[];
  receivedPayload: Record<string, any>;
  documents: DocumentEvidenceRecord[];
  lifecycleState: DepartmentStepStatus;
  acknowledgement: DepartmentAcknowledgement;
  updatedAt: string;
}

export interface InteroperabilityEvidence {
  applicationId: string;
  correlationId: string;
  serviceCode: string;
  requestVersion: number;
  createdAt: string;
  canonicalRequestHash: string;
  documentHash?: string;
  overallStatus: TransactionStatus;
  progressPercent: number;
  departmentDelivery: Record<string, {
    departmentCode: DepartmentCode;
    departmentName: string;
    protocol: string;
    lifecycleState: DepartmentStepStatus;
    receivedAt: string;
    requestHash: string;
    hashStatus: 'VERIFIED' | 'MISMATCH';
    documentHash?: string;
    documentIntegrity: 'VERIFIED' | 'NOT_APPLICABLE';
    acknowledgementId: string;
  }>;
  receivedRequests: DepartmentReceivedRequest[];
}

export interface CanonicalAddressChangeRequest {
  applicationId: string;
  citizenId: string;
  correlationId?: string;
  requestVersion?: number;
  canonicalRequestHash?: string;
  documentHash?: string;
  idempotencyKey?: string;
  sourceDepartment?: string;
  targetDepartments?: DepartmentCode[];
  departmentCode?: DepartmentCode;
  serviceCode: string;
  purpose: string;
  consentId: string;
  createdAt?: string;
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
  requestHash?: string;
  hashStatus?: 'VERIFIED' | 'MISMATCH';
  documentHash?: string;
  receivedAt?: string;
  acceptedAt?: string;
  completedAt?: string;
  acknowledgementId?: string;
}

export interface TransactionRecord {
  applicationId: string;
  correlationId: string;
  requestVersion: number;
  canonicalRequestHash: string;
  documentHash?: string;
  citizenId: string;
  serviceCode: string;
  purpose: string;
  consentId: string;
  targetDepartments: DepartmentCode[];
  createdAt: string;
  receivedAt?: string;
  sentAt?: string;
  acceptedAt?: string;
  completedAt?: string;
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
  requestVersion?: number;
  canonicalRequestHash?: string;
  documentHash?: string;
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
    | 'CANONICAL_HASH_GENERATED'
    | 'DOCUMENT_HASH_VERIFIED'
    | 'ROUTING_STARTED'
    | 'DEPARTMENT_REQUEST_SENT'
    | 'DEPARTMENT_ACK_RECEIVED'
    | 'DEPARTMENT_RESPONSE_RECEIVED'
    | 'DEPARTMENT_VALIDATED'
    | 'DEPARTMENT_ACCEPTED'
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
