export interface CitizenProfile {
  name: string;
  citizenId: string;
  mobile: string;
  email: string;
  address: string;
  district: string;
  state: string;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  preferredLanguage: 'en' | 'mr' | 'hi';
}

export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'CONSENT_PENDING'
  | 'VALIDATING'
  | 'IN_PROGRESS'
  | 'ACTION_REQUIRED'
  | 'PARTIALLY_COMPLETED'
  | 'FAILED'
  | 'RETRY_REQUIRED'
  | 'RETRYING'
  | 'COMPLETED'
  | 'CANCELLED';

export interface DepartmentStep {
  departmentName: string;
  departmentCode?: string;
  protocol?: string;
  action: string;
  status: 'PENDING' | 'SENT' | 'RECEIVED' | 'VALIDATING' | 'ACCEPTED' | 'PROCESSING' | 'SUCCESS' | 'PARTIALLY_COMPLETED' | 'FAILED' | 'RETRYING' | 'ACTION_REQUIRED' | 'CONSENT_BLOCKED';
  timestamp?: string;
  receivedAt?: string;
  acceptedAt?: string;
  completedAt?: string;
  remarks?: string;
  requestHash?: string;
  hashStatus?: 'VERIFIED' | 'MISMATCH';
  documentHash?: string;
  acknowledgementId?: string;
}

export interface Application {
  id: string;
  serviceId: string;
  serviceName: string;
  workflowId: string;
  timestamp: string;
  correlationId: string;
  requestVersion?: number;
  canonicalRequestHash?: string;
  documentHash?: string;
  status: ApplicationStatus;
  progressPercent: number;
  completedDepartments: number;
  totalDepartments: number;
  steps: DepartmentStep[];
  uploadedDocuments: string[]; // Document IDs
}

export interface ConsentRecord {
  id: string;
  department: string;
  scope: string[];
  purpose: string;
  durationDays: number;
  status: 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'REVOKED';
  createdAt: string;
  expiryDate: string;
}

export interface DocumentRecord {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  receivedAt?: string;
  documentHash?: string;
  checksum?: string;
  status: 'UPLOADED' | 'ANALYZING' | 'VERIFIED' | 'FAILED';
  extractionResult?: {
    name: string;
    address: string;
    issueDate: string;
  };
  confidenceScore?: number;
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
  departmentCode: string;
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
  departmentCode: string;
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
  lifecycleState: string;
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
  overallStatus: ApplicationStatus;
  progressPercent: number;
  departmentDelivery: Record<string, {
    departmentCode: string;
    departmentName: string;
    protocol: string;
    lifecycleState: string;
    receivedAt: string;
    acceptedAt?: string;
    completedAt?: string;
    requestHash: string;
    hashStatus: 'VERIFIED' | 'MISMATCH';
    documentHash?: string;
    documentIntegrity: 'VERIFIED' | 'NOT_APPLICABLE';
    acknowledgementId: string;
  }>;
  receivedRequests: DepartmentReceivedRequest[];
}

export interface DataSharingLog {
  id: string;
  sharedWith: string;
  dataScope: string[];
  purpose: string;
  timestamp: string;
  applicationId: string;
  consentId: string;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  timestamp: string;
  applicationId?: string;
  isRead: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}
