import React, { createContext, useContext, useState, useEffect } from 'react';
import { Application, ConsentRecord, Notification, DataSharingLog, DocumentRecord, ApplicationStatus } from '../types';
import { mockApplications, mockConsents, mockNotifications, mockDataSharingLogs } from '../mock/data';
import { ruralDepartmentApi } from '../services/ruralDepartmentApi';
import api from '../services/api';

export type ServiceWorkflowStep =
  | 'INPUT'
  | 'ANALYZING'
  | 'INTENT_DETECTED'
  | 'DEPT_PREVIEW'
  | 'CONSENT_FORM'
  | 'DOC_UPLOAD'
  | 'OCR_PROCESSING'
  | 'FINAL_REVIEW'
  | 'SUCCESS_SPLASH';

export type TrackingDemoState =
  | 'SUBMITTED' // Application submitted, starting workflow
  | 'REVENUE_SUCCESS' // Revenue complete (1/3)
  | 'FOOD_SUCCESS' // Food complete (2/3)
  | 'RURAL_FAILURE' // Rural system down (Failure screen)
  | 'RURAL_RETRYING' // Automatic queue retry (Retry animation)
  | 'RURAL_SUCCESS' // Rural completes (3/3)
  | 'ACTION_REQUIRED_STATE' // Revenue requests clarification
  | 'ACTION_RESOLVED' // Verification resumes
  | 'COMPLETED'; // Full workflow completed

async function generateSHA256Hash(seed: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const buffer = new TextEncoder().encode(seed);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return 'sha256:' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback
    }
  }
  return 'sha256:a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e';
}

interface DemoContextType {
  applications: Application[];
  consents: ConsentRecord[];
  notifications: Notification[];
  sharingLogs: DataSharingLog[];
  documents: DocumentRecord[];
  
  // Current active request workflow
  currentStep: ServiceWorkflowStep;
  nlQuery: string;
  detectedIntent: string;
  uploadedDoc: DocumentRecord | null;
  ocrFields: { name: string; address: string; issueDate: string } | null;
  ocrConfidence: number;
  
  // Active Tracking Demo State
  activeAppId: string | null;
  trackingState: TrackingDemoState;
  
  // Real API Transaction mode
  isRealTransaction: boolean;
  setIsRealTransaction: (val: boolean) => void;
  
  // State methods
  setWorkflowStep: (step: ServiceWorkflowStep) => void;
  setNlQuery: (query: string) => void;
  setDetectedIntent: (intent: string) => void;
  uploadDocument: (file: { name: string; size: number }) => Promise<void>;
  updateOcrField: (key: 'name' | 'address' | 'issueDate', val: string) => void;
  submitServiceRequest: (consentsApproved: { revenue: boolean; food: boolean; rural: boolean }) => void;
  
  setApplications: React.Dispatch<React.SetStateAction<Application[]>>;
  
  // Controller State Triggers
  triggerDemoState: (state: TrackingDemoState) => void;
  resetDemo: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearAllNotifications: () => void;
  revokeConsent: (id: string) => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [applications, setApplications] = useState<Application[]>(() => {
    const saved = localStorage.getItem('govmesh_applications');
    return saved ? JSON.parse(saved) : mockApplications;
  });
  const [consents, setConsents] = useState<ConsentRecord[]>(() => {
    const saved = localStorage.getItem('govmesh_consents');
    return saved ? JSON.parse(saved) : mockConsents;
  });
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('govmesh_notifications');
    return saved ? JSON.parse(saved) : mockNotifications;
  });
  const [sharingLogs, setSharingLogs] = useState<DataSharingLog[]>(() => {
    const saved = localStorage.getItem('govmesh_sharing_logs');
    return saved ? JSON.parse(saved) : mockDataSharingLogs;
  });
  const [documents, setDocuments] = useState<DocumentRecord[]>(() => {
    const saved = localStorage.getItem('govmesh_documents');
    return saved ? JSON.parse(saved) : [];
  });

  // Current active request states
  const [currentStep, setCurrentStep] = useState<ServiceWorkflowStep>('INPUT');
  const [nlQuery, setNlQuery] = useState<string>('');
  const [detectedIntent, setDetectedIntent] = useState<string>('');
  const [uploadedDoc, setUploadedDoc] = useState<DocumentRecord | null>(null);
  const [ocrFields, setOcrFields] = useState<{ name: string; address: string; issueDate: string } | null>(null);
  const [ocrConfidence, setOcrConfidence] = useState<number>(0);

  // Active tracking demo states
  const [activeAppId, setActiveAppId] = useState<string | null>(() => {
    return localStorage.getItem('govmesh_active_appid') || null;
  });
  const [trackingState, setTrackingState] = useState<TrackingDemoState>(() => {
    return (localStorage.getItem('govmesh_tracking_state') as TrackingDemoState) || 'SUBMITTED';
  });

  const [isRealTransaction, setIsRealTransaction] = useState(true);

  // Save list state to local storage
  useEffect(() => {
    localStorage.setItem('govmesh_applications', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem('govmesh_consents', JSON.stringify(consents));
  }, [consents]);

  useEffect(() => {
    localStorage.setItem('govmesh_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('govmesh_sharing_logs', JSON.stringify(sharingLogs));
  }, [sharingLogs]);

  useEffect(() => {
    localStorage.setItem('govmesh_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    if (activeAppId) {
      localStorage.setItem('govmesh_active_appid', activeAppId);
    } else {
      localStorage.removeItem('govmesh_active_appid');
    }
  }, [activeAppId]);

  useEffect(() => {
    localStorage.setItem('govmesh_tracking_state', trackingState);
  }, [trackingState]);

  const setWorkflowStep = (step: ServiceWorkflowStep) => {
    setCurrentStep(step);
  };

  const uploadDocument = async (file: { name: string; size: number }) => {
    const docId = `doc-${Math.floor(1000 + Math.random() * 9000)}`;
    const docHash = await generateSHA256Hash(`${file.name}:${file.size}:demo-document-content`);
    const nowUtc = new Date().toISOString();

    const newDoc: DocumentRecord = {
      id: docId,
      name: file.name,
      type: file.name.split('.').pop()?.toUpperCase() || 'PDF',
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadedAt: nowUtc,
      receivedAt: nowUtc,
      documentHash: docHash,
      checksum: docHash,
      status: 'UPLOADED'
    };

    setUploadedDoc(newDoc);
    setDocuments(prev => [newDoc, ...prev]);

    // Simulate file upload validation latency
    await new Promise(resolve => setTimeout(resolve, 800));

    const finalDoc: DocumentRecord = {
      ...newDoc,
      status: 'VERIFIED',
      confidenceScore: 98,
      extractionResult: {
        name: "Aarav Sharma",
        address: "Flat 402, Shivajinagar Residency, FC Road, Pune, Maharashtra - 411005",
        issueDate: "12/04/2026"
      }
    };
    setUploadedDoc(finalDoc);
    setOcrFields(finalDoc.extractionResult!);
    setOcrConfidence(98);
    setDocuments(prev => prev.map(d => d.id === docId ? finalDoc : d));
  };

  const updateOcrField = (key: 'name' | 'address' | 'issueDate', val: string) => {
    if (ocrFields) {
      setOcrFields(prev => prev ? { ...prev, [key]: val } : null);
    }
  };

  const addNotification = (n: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNtf: Notification = {
      ...n,
      id: `ntf-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setNotifications(prev => [newNtf, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('govmesh_notifications');
  };

  const revokeConsent = (id: string) => {
    setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'REVOKED' } : c));
    addNotification({
      title: "Consent Revoked",
      description: `Consent ID: ${id} was revoked by the user. Connected departments can no longer access this data scope.`,
      type: "WARNING",
      priority: "HIGH"
    });
  };

  // Submit address change request
  const submitServiceRequest = async (consentsApproved: { revenue: boolean; food: boolean; rural: boolean }) => {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const appId = activeAppId || `GM-2026-${randomSuffix}`;
    const corrId = `CORR-26-${randomSuffix}`;
    const consentBase = `CONSENT-${randomSuffix}`;
    const timeNowUtc = new Date().toISOString();
    const docHash = uploadedDoc?.documentHash || 'sha256:a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e';
    const reqHash = 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069';
    
    // 1. Create Application
    const newApp: Application = {
      id: appId,
      serviceId: "address-update",
      serviceName: "Cross-Department Address Synchronization",
      workflowId: "ADDRESS_CHANGE_V2",
      timestamp: timeNowUtc,
      correlationId: corrId,
      requestVersion: 1,
      canonicalRequestHash: reqHash,
      documentHash: docHash,
      status: "SUBMITTED",
      progressPercent: 10,
      completedDepartments: 0,
      totalDepartments: 3,
      steps: [
        { departmentName: "Revenue & Forest Department", departmentCode: "REVENUE", protocol: "REST/JSON", action: "Verify/update address record", status: "PENDING", timestamp: timeNowUtc, requestHash: reqHash, documentHash: docHash },
        { departmentName: "Food, Civil Supplies & Consumer Protection", departmentCode: "FOOD", protocol: "SOAP/XML", action: "Update eligible ration/PDS record", status: "PENDING", timestamp: timeNowUtc, requestHash: reqHash, documentHash: docHash },
        { departmentName: "Rural Development & Panchayat Raj", departmentCode: "RURAL_DEVELOPMENT", protocol: "CSV/SFTP", action: "Update local Gram Panchayat record", status: "PENDING", timestamp: timeNowUtc, requestHash: reqHash, documentHash: docHash }
      ],
      uploadedDocuments: uploadedDoc ? [uploadedDoc.id] : []
    };

    // 2. Create Consents
    const newConsents: ConsentRecord[] = [
      {
        id: `${consentBase}-REV`,
        department: "Revenue & Forest Department",
        scope: ["Name", "New Address", "Address Proof Verification Result"],
        purpose: "Address registry update verification",
        durationDays: 30,
        status: consentsApproved.revenue ? "APPROVED" : "REJECTED",
        createdAt: timeNowUtc,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: `${consentBase}-FOOD`,
        department: "Food, Civil Supplies & Consumer Protection",
        scope: ["Name", "New Address", "Supporting Verification Result"],
        purpose: "Ration/PDS registry address update",
        durationDays: 30,
        status: consentsApproved.food ? "APPROVED" : "REJECTED",
        createdAt: timeNowUtc,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: `${consentBase}-RURAL`,
        department: "Rural Development & Panchayat Raj",
        scope: ["Name", "New Address", "Local Registry Details"],
        purpose: "Local panchayat address database synchronization",
        durationDays: 30,
        status: consentsApproved.rural ? "APPROVED" : "REJECTED",
        createdAt: timeNowUtc,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    // 3. Create Data Sharing Logs
    const newSharingLogs: DataSharingLog[] = [];
    if (consentsApproved.revenue) {
      newSharingLogs.push({
        id: `DSL-${Math.floor(10000 + Math.random() * 90000)}`,
        sharedWith: "Revenue & Forest Department",
        dataScope: ["Name", "New Address", "Address Proof Verification Result"],
        purpose: "Address registry verification",
        timestamp: timeNowUtc,
        applicationId: appId,
        consentId: consentBase
      });
    }

    if (isRealTransaction) {
      console.log("[GovMesh Core Ingress] Real Transaction mode active. Invoking GovMesh Core Orchestrator with Cryptographic Traceability...");
      
      setApplications(prev => [newApp, ...prev.filter(a => a.id !== appId)]);
      setConsents(prev => [...newConsents, ...prev]);
      setSharingLogs(prev => [...newSharingLogs, ...prev]);
      
      setActiveAppId(appId);
      setTrackingState('SUBMITTED');
      setCurrentStep('SUCCESS_SPLASH');

      try {
        const response = await api.submitGovMeshTransaction({
          applicationId: appId,
          citizenId: "GM-CIT-10001",
          serviceCode: "ADDRESS_CHANGE",
          purpose: "Unified residence address update across state registries",
          consentId: consentBase,
          consents: consentsApproved,
          citizen: {
            name: ocrFields?.name || "Aarav Sharma",
            address: {
              line1: ocrFields?.address || "Flat 402, Shivajinagar Residency, FC Road",
              district: "Pune",
              state: "Maharashtra"
            }
          },
          documents: [
            {
              id: uploadedDoc?.id || 'DOC-ADDR-PROOF-124',
              name: uploadedDoc?.name || 'address-proof-demo.pdf',
              type: uploadedDoc?.type || 'ELECTRICITY_BILL',
              size: uploadedDoc?.size || '1.2 MB',
              checksum: docHash,
              documentHash: docHash,
              version: 1,
              uploadedAt: timeNowUtc,
              contentType: 'application/pdf'
            }
          ]
        });

        if (response.success && (response.status === 'COMPLETED' || response.progressPercent === 100)) {
          const realSteps = response.transaction?.steps?.map((s: any) => ({
            departmentName: s.departmentName,
            departmentCode: s.departmentCode,
            protocol: s.protocol,
            action: s.departmentCode === 'REVENUE' ? 'Verify/update address record' : (s.departmentCode === 'FOOD' ? 'Update eligible ration/PDS record' : 'Update relevant local service record'),
            status: s.status,
            remarks: s.remarks,
            requestHash: s.requestHash,
            hashStatus: s.hashStatus,
            documentHash: s.documentHash,
            receivedAt: s.receivedAt,
            acceptedAt: s.acceptedAt,
            completedAt: s.completedAt,
            acknowledgementId: s.acknowledgementId
          })) || [
            { departmentName: "Revenue & Forest Department", departmentCode: "REVENUE", protocol: "REST/JSON", action: "Verify/update address record", status: "SUCCESS", remarks: "Verified via Revenue Land Registry.", requestHash: reqHash, hashStatus: "VERIFIED", documentHash: docHash },
            { departmentName: "Food, Civil Supplies & Consumer Protection", departmentCode: "FOOD", protocol: "SOAP/XML", action: "Update eligible ration/PDS record", status: "SUCCESS", remarks: "Synchronized via SOAP XML adapter.", requestHash: reqHash, hashStatus: "VERIFIED", documentHash: docHash },
            { departmentName: "Rural Development & Panchayat Raj", departmentCode: "RURAL_DEVELOPMENT", protocol: "CSV/SFTP", action: "Update relevant local service record", status: "SUCCESS", remarks: "Synchronized via legacy CSV adapter.", requestHash: reqHash, hashStatus: "VERIFIED", documentHash: docHash }
          ];

          // Update application to COMPLETED
          setApplications(prev => prev.map(a => {
            if (a.id !== appId) return a;
            return {
              ...a,
              status: "COMPLETED",
              progressPercent: 100,
              completedDepartments: 3,
              requestVersion: response.transaction?.requestVersion || 1,
              canonicalRequestHash: response.transaction?.canonicalRequestHash || reqHash,
              documentHash: response.transaction?.documentHash || docHash,
              steps: realSteps
            };
          }));

          setTrackingState('RURAL_SUCCESS');

          addNotification({
            title: "Cross-Department Synchronization Complete",
            description: `GovMesh successfully synchronized application ${appId} across Revenue, Food, and Rural registries with verified cryptographic hashes.`,
            type: "SUCCESS",
            applicationId: appId,
            priority: "HIGH"
          });
        } else {
          const failedMsg = response.message || "Interoperability transaction failed.";
          setApplications(prev => prev.map(a => {
            if (a.id !== appId) return a;
            return {
              ...a,
              status: "FAILED",
              progressPercent: response.progressPercent || 40,
              steps: response.transaction?.steps?.map((s: any) => ({
                departmentName: s.departmentName,
                departmentCode: s.departmentCode,
                protocol: s.protocol,
                action: s.departmentCode === 'REVENUE' ? 'Verify/update address record' : (s.departmentCode === 'FOOD' ? 'Update eligible ration/PDS record' : 'Update relevant local service record'),
                status: s.status,
                remarks: s.remarks,
                requestHash: s.requestHash,
                documentHash: s.documentHash
              })) || a.steps
            };
          }));

          setTrackingState('RURAL_FAILURE');

          addNotification({
            title: "Department Synchronization Exception",
            description: failedMsg,
            type: "ALERT",
            applicationId: appId,
            priority: "HIGH"
          });
        }
      } catch (err: any) {
        console.error(`[GovMesh Core Ingress Error] ${err.message}`);
        setTrackingState('RURAL_FAILURE');
        addNotification({
          title: "GovMesh Core Connection Exception",
          description: `Unable to connect to GovMesh Core orchestrator. Details: ${err.message}`,
          type: "ALERT",
          applicationId: appId,
          priority: "HIGH"
        });
      }
    } else {
      setApplications(prev => [newApp, ...prev]);
      setConsents(prev => [...newConsents, ...prev]);
      setSharingLogs(prev => [...newSharingLogs, ...prev]);

      setActiveAppId(appId);
      setTrackingState('SUBMITTED');
      setCurrentStep('SUCCESS_SPLASH');
    }
  };

  const triggerDemoState = (state: TrackingDemoState) => {
    setTrackingState(state);
  };

  const resetDemo = () => {
    localStorage.clear();
    setApplications(mockApplications);
    setConsents(mockConsents);
    setNotifications(mockNotifications);
    setSharingLogs(mockDataSharingLogs);
    setDocuments([]);
    setCurrentStep('INPUT');
    setNlQuery('');
    setDetectedIntent('');
    setUploadedDoc(null);
    setOcrFields(null);
    setActiveAppId(null);
    setTrackingState('SUBMITTED');
  };

  return (
    <DemoContext.Provider
      value={{
        applications,
        consents,
        notifications,
        sharingLogs,
        documents,
        currentStep,
        nlQuery,
        detectedIntent,
        uploadedDoc,
        ocrFields,
        ocrConfidence,
        activeAppId,
        trackingState,
        isRealTransaction,
        setIsRealTransaction,
        setWorkflowStep,
        setNlQuery,
        setDetectedIntent,
        uploadDocument,
        updateOcrField,
        submitServiceRequest,
        setApplications,
        triggerDemoState,
        resetDemo,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearAllNotifications,
        revokeConsent,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};
