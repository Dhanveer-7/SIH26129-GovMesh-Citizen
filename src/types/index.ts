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
  | 'RETRYING'
  | 'COMPLETED'
  | 'CANCELLED';

export interface DepartmentStep {
  departmentName: string;
  action: string;
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'RETRYING';
  timestamp?: string;
  remarks?: string;
}

export interface Application {
  id: string;
  serviceId: string;
  serviceName: string;
  workflowId: string;
  timestamp: string;
  correlationId: string;
  status: ApplicationStatus;
  progressPercent: number; // e.g., 66%
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
  status: 'UPLOADED' | 'ANALYZING' | 'VERIFIED' | 'FAILED';
  extractionResult?: {
    name: string;
    address: string;
    issueDate: string;
  };
  confidenceScore?: number; // 0 to 100
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
