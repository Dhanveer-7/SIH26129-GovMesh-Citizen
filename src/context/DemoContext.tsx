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
  
  // Controller State Triggers
  triggerDemoState: (state: TrackingDemoState) => void;
  resetDemo: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markNotificationAsRead: (id: string) => void;
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

  const [isRealTransaction, setIsRealTransaction] = useState(false);

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
    const newDoc: DocumentRecord = {
      id: docId,
      name: file.name,
      type: file.name.split('.').pop()?.toUpperCase() || 'PDF',
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'UPLOADED'
    };

    setUploadedDoc(newDoc);
    setDocuments(prev => [newDoc, ...prev]);

    // Simulate file upload validation latency (remains on upload step)
    await new Promise(resolve => setTimeout(resolve, 1000));

    const finalDoc: DocumentRecord = {
      ...newDoc,
      status: 'VERIFIED',
      confidenceScore: 96,
      extractionResult: {
        name: "DEMO CITIZEN",
        address: "FLAT NO 104, RAJENDRA APARTMENTS, SECTOR 12, PRADHIKARAN, NIGDI, PUNE, MAHARASHTRA - 411044",
        issueDate: "12/04/2026"
      }
    };
    setUploadedDoc(finalDoc);
    setOcrFields(finalDoc.extractionResult!);
    setOcrConfidence(96);
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
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };
    setNotifications(prev => [newNtf, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
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
    const appId = `GM-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const corrId = `CORR-26-${Math.floor(1000 + Math.random() * 9000)}`;
    const timeNow = new Date().toISOString();
    
    // 1. Create Application
    const newApp: Application = {
      id: appId,
      serviceId: "address-update",
      serviceName: "Address Update",
      workflowId: "ADDRESS_CHANGE_V1",
      timestamp: timeNow,
      correlationId: corrId,
      status: "SUBMITTED",
      progressPercent: 10,
      completedDepartments: 0,
      totalDepartments: 3,
      steps: [
        { departmentName: "Revenue Department", action: "Verify/update address record", status: "PENDING" },
        { departmentName: "Food & Civil Supplies Department", action: "Update eligible ration/PDS record", status: "PENDING" },
        { departmentName: "Rural Development Department", action: "Update relevant local service record", status: "PENDING" }
      ],
      uploadedDocuments: uploadedDoc ? [uploadedDoc.id] : []
    };

    // 2. Create Consents
    const newConsents: ConsentRecord[] = [
      {
        id: `CONSENT-${Math.floor(10000 + Math.random() * 90000)}-REV`,
        department: "Revenue Department",
        scope: ["Name", "New Address", "Address Proof Verification Result"],
        purpose: "Address registry update verification",
        durationDays: 30,
        status: consentsApproved.revenue ? "APPROVED" : "REJECTED",
        createdAt: timeNow,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: `CONSENT-${Math.floor(10000 + Math.random() * 90000)}-FOOD`,
        department: "Food & Civil Supplies Department",
        scope: ["Name", "New Address", "Supporting Verification Result"],
        purpose: "Ration/PDS registry address update",
        durationDays: 30,
        status: consentsApproved.food ? "APPROVED" : "REJECTED",
        createdAt: timeNow,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: `CONSENT-${Math.floor(10000 + Math.random() * 90000)}-RURAL`,
        department: "Rural Development Department",
        scope: ["Name", "New Address", "Local Registry Details"],
        purpose: "Local panchayat address database synchronization",
        durationDays: 30,
        status: consentsApproved.rural ? "APPROVED" : "REJECTED",
        createdAt: timeNow,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    // 3. Create Data Sharing Logs
    const newSharingLogs: DataSharingLog[] = [];
    if (consentsApproved.revenue) {
      newSharingLogs.push({
        id: `DSL-${Math.floor(10000 + Math.random() * 90000)}`,
        sharedWith: "Revenue Department",
        dataScope: ["Name", "New Address", "Address Proof Verification Result"],
        purpose: "Address registry verification",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        applicationId: appId,
        consentId: `CONSENT-${Math.floor(10000 + Math.random() * 90000)}-REV`
      });
    }

    if (isRealTransaction) {
      console.log("[GovMesh Core Ingress] Real Transaction mode active. Invoking GovMesh Core Orchestrator...");
      
      setApplications(prev => [newApp, ...prev]);
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
          consentId: `CONSENT-${Math.floor(10000 + Math.random() * 90000)}`,
          consents: consentsApproved,
          citizen: {
            name: ocrFields?.name || "Aarav Sharma",
            address: {
              line1: ocrFields?.address || "Flat 402, Shivajinagar Residency, FC Road",
              district: "Pune",
              state: "Maharashtra"
            }
          }
        });

        if (response.success && response.status === 'COMPLETED') {
          // Update application to COMPLETED
          setApplications(prev => prev.map(a => {
            if (a.id !== appId) return a;
            return {
              ...a,
              status: "COMPLETED",
              progressPercent: 100,
              completedDepartments: 3,
              steps: [
                { departmentName: "Revenue Department", action: "Verify/update address record", status: "SUCCESS", remarks: "Verified via Revenue Land Registry on Render." },
                { departmentName: "Food & Civil Supplies Department", action: "Update eligible ration/PDS record", status: "SUCCESS", remarks: "Synchronized via SOAP XML adapter." },
                { departmentName: "Rural Development Department", action: "Update relevant local service record", status: "SUCCESS", remarks: "Synchronized via legacy CSV adapter." }
              ]
            };
          }));

          setTrackingState('RURAL_SUCCESS');

          addNotification({
            title: "Cross-Department Synchronization Complete",
            description: `GovMesh successfully synchronized application ${appId} across Revenue, Food, and Rural registries.`,
            type: "SUCCESS",
            applicationId: appId,
            priority: "HIGH"
          });
        } else {
          // Update application to FAILED with real department error
          const failedMsg = response.message || "Interoperability transaction failed.";
          setApplications(prev => prev.map(a => {
            if (a.id !== appId) return a;
            return {
              ...a,
              status: "FAILED",
              progressPercent: response.progressPercent || 40,
              steps: [
                { departmentName: "Revenue Department", action: "Verify/update address record", status: (response.progressPercent >= 40 ? "SUCCESS" : "FAILED"), remarks: "Verified." },
                { departmentName: "Food & Civil Supplies Department", action: "Update eligible ration/PDS record", status: (response.progressPercent >= 70 ? "SUCCESS" : "FAILED"), remarks: "Food status" },
                { departmentName: "Rural Development Department", action: "Update relevant local service record", status: (response.progressPercent >= 100 ? "SUCCESS" : "FAILED"), remarks: failedMsg }
              ]
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
      // Mock sandbox mode (Simulate timeline automatically)
      setApplications(prev => [newApp, ...prev]);
      setConsents(prev => [...newConsents, ...prev]);
      setSharingLogs(prev => [...newSharingLogs, ...prev]);

      setActiveAppId(appId);
      setTrackingState('SUBMITTED');
      setCurrentStep('SUCCESS_SPLASH');

      addNotification({
        title: "Address Update Request Submitted",
        description: `Request ${appId} has been created. GovMesh is coordinating with 3 departments.`,
        type: "SUCCESS",
        applicationId: appId,
        priority: "HIGH"
      });
    }
  };

  // State transitions triggered by controller or timeout
  const triggerDemoState = (state: TrackingDemoState) => {
    setTrackingState(state);
    
    const targetAppId = activeAppId || "GM-2026-000124";
    
    setApplications(prev => {
      return prev.map(app => {
        if (app.id !== targetAppId) return app;
        
        let status: ApplicationStatus = app.status;
        let progressPercent = app.progressPercent;
        let completedDepartments = app.completedDepartments;
        let steps = [...app.steps];
        
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        switch (state) {
          case 'SUBMITTED':
            status = 'SUBMITTED';
            progressPercent = 10;
            completedDepartments = 0;
            steps = steps.map(s => ({ ...s, status: 'PENDING' }));
            break;
          case 'REVENUE_SUCCESS':
            status = 'IN_PROGRESS';
            progressPercent = 40;
            completedDepartments = 1;
            steps[0] = { ...steps[0], status: 'SUCCESS', timestamp, remarks: "Address updated on Revenue Land Records database." };
            steps[1] = { ...steps[1], status: 'PROCESSING', remarks: "Request routed to Food & Civil Supplies." };
            break;
          case 'FOOD_SUCCESS':
            status = 'IN_PROGRESS';
            progressPercent = 70;
            completedDepartments = 2;
            steps[1] = { ...steps[1], status: 'SUCCESS', timestamp, remarks: "Ration card details successfully modified." };
            steps[2] = { ...steps[2], status: 'PROCESSING', remarks: "Contacting Rural Development panchayat registry..." };
            break;
          case 'RURAL_FAILURE':
            status = 'RETRYING';
            progressPercent = 75;
            steps[2] = { 
              ...steps[2], 
              status: 'RETRYING', 
              timestamp, 
              remarks: "Rural Development server is temporarily offline. GovMesh has safely queued the request." 
            };
            break;
          case 'RURAL_RETRYING':
            status = 'RETRYING';
            progressPercent = 80;
            steps[2] = { 
              ...steps[2], 
              status: 'RETRYING', 
              remarks: "Auto-retry active (Attempt 2 of 5). Connection pending..." 
            };
            break;
          case 'RURAL_SUCCESS':
            status = 'COMPLETED';
            progressPercent = 100;
            completedDepartments = 3;
            steps[2] = { ...steps[2], status: 'SUCCESS', timestamp, remarks: "Local gram panchayat index updated. Workflow completed." };
            break;
          case 'ACTION_REQUIRED_STATE':
            status = 'ACTION_REQUIRED';
            progressPercent = 30;
            steps[0] = { 
              ...steps[0], 
              status: 'FAILED', 
              remarks: "Clarification required: Address proof is blurry. Please upload a clear image." 
            };
            break;
          case 'ACTION_RESOLVED':
            status = 'IN_PROGRESS';
            progressPercent = 50;
            steps[0] = { ...steps[0], status: 'SUCCESS', timestamp, remarks: "New document validated. Address update approved." };
            break;
          case 'COMPLETED':
            status = 'COMPLETED';
            progressPercent = 100;
            completedDepartments = 3;
            steps[0] = { ...steps[0], status: 'SUCCESS', timestamp: timestamp, remarks: "Verified." };
            steps[1] = { ...steps[1], status: 'SUCCESS', timestamp: timestamp, remarks: "Verified." };
            steps[2] = { ...steps[2], status: 'SUCCESS', timestamp: timestamp, remarks: "Verified." };
            break;
        }

        return {
          ...app,
          status,
          progressPercent,
          completedDepartments,
          steps
        };
      });
    });

    // Automatically trigger relevant notifications & data sharing logs based on states
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const appId = targetAppId;

    if (state === 'REVENUE_SUCCESS') {
      addNotification({
        title: "Revenue Verification Successful",
        description: "Revenue Department has successfully verified and updated your address records.",
        type: "SUCCESS",
        applicationId: appId,
        priority: "MEDIUM"
      });
      // Log data sharing
      setSharingLogs(prev => [
        {
          id: `DSL-${Math.floor(10000 + Math.random() * 90000)}`,
          sharedWith: "Food & Civil Supplies Department",
          dataScope: ["Name", "New Address", "Revenue Verification ID"],
          purpose: "Verify ration card match",
          timestamp,
          applicationId: appId,
          consentId: "CONSENT-00124-FOOD"
        },
        ...prev
      ]);
    } else if (state === 'FOOD_SUCCESS') {
      addNotification({
        title: "Food & Civil Supplies Updated",
        description: "Your ration card address records have been updated successfully.",
        type: "SUCCESS",
        applicationId: appId,
        priority: "MEDIUM"
      });
      setSharingLogs(prev => [
        {
          id: `DSL-${Math.floor(10000 + Math.random() * 90000)}`,
          sharedWith: "Rural Development Department",
          dataScope: ["Name", "New Address"],
          purpose: "Update local service records",
          timestamp,
          applicationId: appId,
          consentId: "CONSENT-00124-RURAL"
        },
        ...prev
      ]);
    } else if (state === 'RURAL_FAILURE') {
      addNotification({
        title: "Rural Development Offline - Automatic Retry Queued",
        description: "GovMesh detected that the Rural Development system is down. Retry schedule is active. No action required.",
        type: "WARNING",
        applicationId: appId,
        priority: "MEDIUM"
      });
    } else if (state === 'RURAL_SUCCESS') {
      addNotification({
        title: "Rural Development Workflow Resumed & Complete",
        description: "Gram Panchayat system recovered. Address records synchronized successfully. Your application is fully completed.",
        type: "SUCCESS",
        applicationId: appId,
        priority: "HIGH"
      });
    } else if (state === 'ACTION_REQUIRED_STATE') {
      addNotification({
        title: "Action Required: Blur Document Alert",
        description: "Revenue Department requests a clearer scan of your Address Proof to proceed with validation.",
        type: "ALERT",
        applicationId: appId,
        priority: "HIGH"
      });
    } else if (state === 'ACTION_RESOLVED') {
      addNotification({
        title: "Clarified Document Received",
        description: "GovMesh submitted your document to the Revenue Department. Processing has resumed.",
        type: "INFO",
        applicationId: appId,
        priority: "MEDIUM"
      });
    }
  };

  const resetDemo = () => {
    localStorage.removeItem('govmesh_applications');
    localStorage.removeItem('govmesh_consents');
    localStorage.removeItem('govmesh_notifications');
    localStorage.removeItem('govmesh_sharing_logs');
    localStorage.removeItem('govmesh_documents');
    localStorage.removeItem('govmesh_active_appid');
    localStorage.removeItem('govmesh_tracking_state');

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
    setOcrConfidence(0);
    setActiveAppId(null);
    setTrackingState('SUBMITTED');

    addNotification({
      title: "Demo Environment Reset",
      description: "All application tracking, uploaded docs, and notifications have been restored to fresh prototype defaults.",
      type: "INFO",
      priority: "LOW"
    });
  };

  return (
    <DemoContext.Provider value={{
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
      triggerDemoState,
      resetDemo,
      addNotification,
      markNotificationAsRead,
      revokeConsent
    }}>
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};
