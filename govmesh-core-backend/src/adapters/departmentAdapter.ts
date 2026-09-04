import { CanonicalAddressChangeRequest, DepartmentCode, DepartmentStepResult, ProofDocument } from '../models/canonical.js';

export interface AdapterRequestContext {
  applicationId: string;
  correlationId: string;
  citizenId: string;
  serviceCode: string;
  consentId: string;
  timestamp: string;
  requestVersion?: number;
  canonicalRequestHash?: string;
  documentHash?: string;
  createdAt?: string;
  documents?: ProofDocument[];
}

export interface DepartmentAdapter {
  getDepartmentCode(): DepartmentCode;
  getDepartmentName(): string;
  getProtocol(): 'REST/JSON' | 'SOAP/XML' | 'CSV/SFTP';
  supports(serviceCode: string): boolean;
  validate(request: CanonicalAddressChangeRequest): { valid: boolean; error?: string };
  transform(request: CanonicalAddressChangeRequest): any;
  send(transformedPayload: any, context: AdapterRequestContext): Promise<DepartmentStepResult>;
  normalizeResponse(rawResponse: any, httpStatus: number, context: AdapterRequestContext): DepartmentStepResult;
  getStatus?(departmentTransactionId: string): Promise<DepartmentStepResult | null>;
  healthCheck(): Promise<boolean>;
  process(request: CanonicalAddressChangeRequest): Promise<DepartmentStepResult>;
}
