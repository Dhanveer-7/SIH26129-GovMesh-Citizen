# GovMesh Core API Contract & Specification

> **Disclaimer**: *This is a demonstration interoperability platform developed for SIH26129 and is not an official Government of Maharashtra production system.*

---

## 1. Core Endpoints

### 1. Health & Registry Probe
*   **Method**: `GET`
*   **Endpoint**: `/api/health`
*   **Response (200 OK)**:
```json
{
  "status": "ok",
  "service": "govmesh-core-backend",
  "version": "1.0.0",
  "environment": "production",
  "departments": [
    { "code": "REVENUE", "name": "Revenue & Forest Department", "status": "ONLINE", "protocol": "REST/JSON" },
    { "code": "FOOD", "name": "Food, Civil Supplies & Consumer Protection", "status": "ONLINE", "protocol": "SOAP/XML" },
    { "code": "RURAL_DEVELOPMENT", "name": "Rural Development & Panchayat Raj", "status": "ONLINE", "protocol": "CSV/SFTP" }
  ]
}
```

---

### 2. Submit Multi-Department Transaction
*   **Method**: `POST`
*   **Endpoint**: `/api/govmesh/transactions`
*   **Headers**: `Content-Type: application/json`
*   **Request Body**:
```json
{
  "applicationId": "GM-2026-000124",
  "citizenId": "GM-CIT-10001",
  "serviceCode": "ADDRESS_CHANGE",
  "purpose": "Unified residence address update across state registries",
  "consentId": "CONSENT-00124",
  "consents": {
    "revenue": true,
    "food": true,
    "rural": true
  },
  "citizen": {
    "name": "Aarav Sharma",
    "address": {
      "line1": "Flat 402, Shivajinagar Residency, FC Road",
      "district": "Pune",
      "state": "Maharashtra"
    }
  }
}
```
*   **Response (200 OK)**:
```json
{
  "success": true,
  "applicationId": "GM-2026-000124",
  "correlationId": "CORR-26-8481",
  "status": "COMPLETED",
  "progressPercent": 100,
  "message": "Address update synchronized successfully across Revenue, Food & Civil Supplies, and Rural Development registries.",
  "transaction": {
    "completedDepartments": 3,
    "totalDepartments": 3,
    "steps": [
      {
        "departmentCode": "REVENUE",
        "protocol": "REST/JSON",
        "status": "SUCCESS",
        "remarks": "Address record successfully verified and updated on Revenue Land Registry."
      },
      {
        "departmentCode": "FOOD",
        "protocol": "SOAP/XML",
        "status": "SUCCESS",
        "remarks": "Ration card & PDS family quota records successfully synchronized via SOAP transformation."
      },
      {
        "departmentCode": "RURAL_DEVELOPMENT",
        "protocol": "CSV/SFTP",
        "status": "SUCCESS",
        "remarks": "Local Gram Panchayat voter & resident registry synchronized with verified address."
      }
    ]
  }
}
```

---

### 3. Query Application Status
*   **Method**: `GET`
*   **Endpoint**: `/api/govmesh/transactions/:applicationId`
*   **Response (200 OK)**:
```json
{
  "success": true,
  "applicationId": "GM-2026-000124",
  "status": "COMPLETED",
  "progressPercent": 100,
  "completedDepartments": 3,
  "totalDepartments": 3
}
```

---

### 4. Query Audit Logs
*   **Method**: `GET`
*   **Endpoint**: `/api/govmesh/audit/:applicationId`
*   **Response (200 OK)**:
```json
{
  "success": true,
  "applicationId": "GM-2026-000124",
  "count": 9,
  "auditLogs": [
    {
      "id": "AUDIT-1788352381177-122",
      "event": "COMPLETED",
      "actor": "GovMesh Core Orchestrator",
      "result": "SUCCESS",
      "details": "End-to-end multi-department synchronization completed successfully."
    }
  ]
}
```
