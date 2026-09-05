import { CitizenProfile, ConsentRecord, Application, Notification, DataSharingLog } from '../types';

export const mockCitizen: CitizenProfile = {
  name: "Rajesh Shantaram Patil",
  citizenId: "CIT-MH-1001",
  mobile: "+91 98765 43210",
  email: "rajesh.patil@govmesh.in",
  address: "Flat 201, Shanti Niketan, Prabhat Road, Deccan Gymkhana, Haveli, Pune - 411004",
  district: "Pune",
  state: "Maharashtra",
  verificationStatus: "VERIFIED",
  preferredLanguage: "en"
};

export interface ServiceItem {
  id: string;
  name: string;
  category: 'personal' | 'address' | 'food' | 'rural' | 'benefits';
  description: string;
  departments: string[];
  requiredDocs: string[];
  purpose: string;
  estimatedTime: string;
  availability: 'Available' | 'Maintenance' | 'High Load';
}

export const mockServices: ServiceItem[] = [
  {
    id: "address-update",
    name: "Address Update",
    category: "address",
    description: "Update your address across relevant connected government services through a single coordinated request.",
    departments: ["Revenue Department", "Food & Civil Supplies Department", "Rural Development Department"],
    requiredDocs: ["Rent Agreement", "Electricity Bill", "Aadhaar Card"],
    purpose: "Synchronize citizen residential details for civic registry, PDS ration distribution, and local administration.",
    estimatedTime: "2-3 Days",
    availability: "Available"
  },
  {
    id: "income-certificate",
    name: "Income Certificate",
    category: "personal",
    description: "Apply for a certified declaration of annual family income issued by local revenue authorities.",
    departments: ["Revenue Department"],
    requiredDocs: ["Salary Slip / Form 16", "Land Revenue Records", "Declaration Form"],
    purpose: "Verify financial eligibility for government subsidies, educational concessions, and social welfare programs.",
    estimatedTime: "5 Days",
    availability: "Available"
  },
  {
    id: "ration-card-update",
    name: "Ration Card & PDS Record Sync",
    category: "food",
    description: "Update household beneficiary lists or address data in the Public Distribution System (PDS) registry.",
    departments: ["Food & Civil Supplies Department", "Revenue Department"],
    requiredDocs: ["Original Ration Card", "Identity Proof of Head of Family", "Address Verification Proof"],
    purpose: "Validate grain quotas and allocation of essential commodities under state food security programs.",
    estimatedTime: "7 Days",
    availability: "Available"
  },
  {
    id: "rural-utility",
    name: "Rural Utility Connection",
    category: "rural",
    description: "Apply for household electricity, drinking water tap connection, or rural waste sanitation service setup.",
    departments: ["Rural Development Department", "Revenue Department"],
    requiredDocs: ["Property Registry Card", "No Objection Certificate (NOC) from Gram Panchayat", "Address Proof"],
    purpose: "Validate land rights and issue local utility infrastructure accounts within panchayat borders.",
    estimatedTime: "10 Days",
    availability: "Available"
  },
  {
    id: "benefits-schemes",
    name: "Rural Social Pension & Benefits",
    category: "benefits",
    description: "Enroll in central and state welfare pension benefits for senior citizens, widows, or differently-abled individuals.",
    departments: ["Rural Development Department", "Food & Civil Supplies Department", "Revenue Department"],
    requiredDocs: ["Age Proof / Birth Certificate", "Income Certificate", "Disability/Widow Proof Document"],
    purpose: "Verify social security eligibility guidelines and configure Direct Benefit Transfer (DBT) bank links.",
    estimatedTime: "15 Days",
    availability: "High Load"
  }
];

// Initial mock applications history
export const mockApplications: Application[] = [
  {
    id: "GM-2026-000124",
    serviceId: "address-update",
    serviceName: "Cross-Department Address Synchronization",
    workflowId: "ADDRESS_CHANGE_V2",
    timestamp: "2026-09-05T04:30:00.000Z",
    correlationId: "GM-CORR-2026-000124",
    requestVersion: 1,
    canonicalRequestHash: "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    documentHash: "sha256:a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
    status: "SUBMITTED",
    progressPercent: 35,
    completedDepartments: 0,
    totalDepartments: 3,
    steps: [
      {
        departmentName: "Revenue & Forest Department",
        departmentCode: "REVENUE",
        protocol: "REST/JSON",
        action: "Verify/update address record & 7/12 land linkage",
        status: "PENDING",
        remarks: "Received in Revenue Officer queue — Awaiting desk scrutiny.",
        timestamp: "2026-09-05T04:30:00.000Z",
        requestHash: "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
        documentHash: "sha256:a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
        receivedAt: "2026-09-05T04:30:05.000Z",
        acknowledgementId: "ACK-REV-00124"
      },
      {
        departmentName: "Food, Civil Supplies & Consumer Protection",
        departmentCode: "FOOD",
        protocol: "SOAP/XML",
        action: "Update eligible ration/PDS household record",
        status: "PENDING",
        remarks: "Received via SOAP Web Service — Awaiting food supply officer verification.",
        timestamp: "2026-09-05T04:30:00.000Z",
        requestHash: "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
        documentHash: "sha256:a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
        receivedAt: "2026-09-05T04:30:05.000Z",
        acknowledgementId: "ACK-FOOD-00124"
      },
      {
        departmentName: "Rural Development & Panchayat Raj",
        departmentCode: "RURAL_DEVELOPMENT",
        protocol: "CSV/SFTP",
        action: "Update local Gram Panchayat resident register",
        status: "PENDING",
        remarks: "Ingested into Gram Panchayat queue — Awaiting local officer review.",
        timestamp: "2026-09-05T04:30:00.000Z",
        requestHash: "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
        documentHash: "sha256:a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
        receivedAt: "2026-09-05T04:30:05.000Z",
        acknowledgementId: "ACK-RURAL-00124"
      }
    ],
    uploadedDocuments: ["doc-124-1"]
  },
  {
    id: "GM-2026-000087",
    serviceId: "income-certificate",
    serviceName: "Income Certificate",
    workflowId: "INCOME_CERT_V1.2",
    timestamp: "2026-08-15T10:30:00Z",
    correlationId: "CORR-87-9921",
    status: "COMPLETED",
    progressPercent: 100,
    completedDepartments: 1,
    totalDepartments: 1,
    steps: [
      {
        departmentName: "Revenue Department",
        action: "Income evaluation and certificate issuance",
        status: "SUCCESS",
        timestamp: "2026-08-18T14:45:00Z",
        remarks: "Certificate issued: CERT-INC-2026-99381. Downloadable from digital wallet."
      }
    ],
    uploadedDocuments: ["doc-087-1"]
  }
];

// Initial mock consents history
export const mockConsents: ConsentRecord[] = [
  {
    id: "GM-CONSENT-2026-00124-REV",
    department: "Revenue & Forest Department",
    scope: ["Full Name", "New Residential Address", "Electricity Proof Verification"],
    purpose: "Synchronize land registry records and verify 7/12 extract residential address",
    durationDays: 30,
    status: "APPROVED",
    createdAt: "2026-09-05T04:30:00.000Z",
    expiryDate: "2026-10-05T04:30:00.000Z"
  },
  {
    id: "GM-CONSENT-2026-00124-FOOD",
    department: "Food, Civil Supplies & Consumer Protection",
    scope: ["Full Name", "New Residential Address", "Ration Card Quota Linkage"],
    purpose: "Synchronize PDS ration card beneficiary residence address",
    durationDays: 30,
    status: "APPROVED",
    createdAt: "2026-09-05T04:30:00.000Z",
    expiryDate: "2026-10-05T04:30:00.000Z"
  },
  {
    id: "GM-CONSENT-2026-00124-RURAL",
    department: "Rural Development & Panchayat Raj",
    scope: ["Full Name", "New Residential Address", "Gram Panchayat Registry"],
    purpose: "Synchronize village household registry and drinking water/tax record",
    durationDays: 30,
    status: "APPROVED",
    createdAt: "2026-09-05T04:30:00.000Z",
    expiryDate: "2026-10-05T04:30:00.000Z"
  },
  {
    id: "CONSENT-000087-REV",
    department: "Revenue Department",
    scope: ["Name", "Income Details", "Form 16 Verification Result"],
    purpose: "Income Certificate issuance and eligibility verification",
    durationDays: 30,
    status: "APPROVED",
    createdAt: "2026-08-15T10:32:00Z",
    expiryDate: "2026-09-14T10:32:00Z"
  }
];

// Initial data sharing logs
export const mockDataSharingLogs: DataSharingLog[] = [
  {
    id: "DSL-12401",
    sharedWith: "Revenue & Forest Department",
    dataScope: ["Full Name", "New Address", "Electricity Proof"],
    purpose: "Revenue address record and 7/12 land registry linkage",
    timestamp: "2026-09-05T04:30:05.000Z",
    applicationId: "GM-2026-000124",
    consentId: "GM-CONSENT-2026-00124-REV"
  },
  {
    id: "DSL-12402",
    sharedWith: "Food & Civil Supplies Department",
    dataScope: ["Full Name", "New Address", "PDS Verification"],
    purpose: "Ration card address synchronization via SOAP Web Service",
    timestamp: "2026-09-05T04:30:05.000Z",
    applicationId: "GM-2026-000124",
    consentId: "GM-CONSENT-2026-00124-FOOD"
  },
  {
    id: "DSL-12403",
    sharedWith: "Rural Development Department",
    dataScope: ["Full Name", "New Address", "Gram Panchayat Registry"],
    purpose: "Village household register update via CSV/SFTP queue",
    timestamp: "2026-09-05T04:30:05.000Z",
    applicationId: "GM-2026-000124",
    consentId: "GM-CONSENT-2026-00124-RURAL"
  },
  {
    id: "DSL-8701",
    sharedWith: "Revenue Department",
    dataScope: ["Name", "Income Details", "Form 16 Verification Result"],
    purpose: "Income Certificate processing",
    timestamp: "2026-08-15T10:35:00Z",
    applicationId: "GM-2026-000087",
    consentId: "CONSENT-000087-REV"
  }
];

// Initial notifications
export const mockNotifications: Notification[] = [
  {
    id: "ntf-001",
    title: "Income Certificate Application Completed",
    description: "Revenue Department has successfully issued your Income Certificate. File GM-2026-000087 is complete.",
    type: "SUCCESS",
    timestamp: "2026-08-18T14:46:00Z",
    applicationId: "GM-2026-000087",
    isRead: true,
    priority: "MEDIUM"
  },
  {
    id: "ntf-002",
    title: "Data Share Logged",
    description: "Verified income proof was shared with the Revenue Department according to Consent ID: CONSENT-000087-REV.",
    type: "INFO",
    timestamp: "2026-08-15T10:35:00Z",
    applicationId: "GM-2026-000087",
    isRead: true,
    priority: "LOW"
  }
];
