# GovMesh Core Interoperability Architecture — SIH26129

> **Disclaimer**: *This is a demonstration interoperability platform developed for SIH26129 and is not an official Government of Maharashtra production system.*

---

## 1. System Overview & Problem Context
Government departments independently develop their IT infrastructure with disparate technology stacks, data models, and protocols. In a traditional architecture, citizens must submit duplicative applications to multiple departmental portals for a single life event (e.g., updating a residential address).

**GovMesh** introduces a canonical interoperability backbone that coordinates cross-departmental service workflows while allowing individual departments to retain their legacy schemas, business rules, and protocols.

---

## 2. Target Architecture & Request/Response Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Citizen as Citizen Portal (Vercel)
    participant Core as GovMesh Core Engine (Node/Express)
    participant Gate as Consent & Audit Gatekeeper
    participant Rev as Revenue Dept (FastAPI / Render)
    participant Food as Food & Civil Supplies (Spring Boot / SOAP)
    participant Rural as Rural Development (Express / CSV)

    Citizen->>Core: POST /api/govmesh/transactions (Canonical Request)
    Core->>Gate: Verify Citizen Consent & Scope
    Gate-->>Core: Consent Validated (Audit Logged)
    
    rect rgb(240, 248, 255)
        Note over Core,Rev: Stage 1: Revenue & Land Records Verification (REST/JSON)
        Core->>Rev: POST /api/v1/revenue/address/verify (Bearer Token Auth)
        Rev-->>Core: HTTP 200 OK (Status: VERIFIED)
    end

    rect rgb(255, 250, 240)
        Note over Core,Food: Stage 2: Food & Ration Card Synchronization (SOAP/XML)
        Core->>Food: POST /api/govmesh/interoperability/address-update
        Food->>Food: Schema Transformation -> SOAP WebService (/ws)
        Food-->>Core: HTTP 200 OK (Status: SUCCESS)
    end

    rect rgb(245, 255, 250)
        Note over Core,Rural: Stage 3: Rural Panchayat Registry Sync (Legacy CSV)
        Core->>Rural: POST /api/rural/address-update (CSV / REST Ingestion)
        Rural->>Rural: SHA-256 Checksum Validation & DB Write
        Rural-->>Core: HTTP 200 OK (Status: COMPLETED)
    end

    Core-->>Citizen: 200 OK (Status: COMPLETED, Progress: 100%)
```

---

## 3. Core Architectural Components

### 1. GovMesh Core Engine
*   **Canonical Transaction Model**: Decouples incoming requests from internal department structures.
*   **Service Registry**: Maintains dynamic metadata, health status, supported services, and base URLs.
*   **Consent Gatekeeper**: Ensures requests contain explicit citizen approval and enforces field-level data minimization.
*   **Deduplication & Idempotency**: Prevents repeated actions using unique `applicationId` and `correlationId`.
*   **Append-Only Audit Trail**: Captures immutable event logs without exposing sensitive citizen data.

### 2. Heterogeneous Department Adapters
*   **Revenue Adapter (REST/JSON)**: Connects to the Python FastAPI backend on Render (`https://sih-2026-revenue-dept.onrender.com`), acquiring session Bearer tokens and querying scrutiny records.
*   **Food Adapter (SOAP/XML)**: Connects to the Java Spring Boot backend, translating canonical JSON into XML payloads accepted by the department's SOAP endpoint (`/ws`).
*   **Rural Adapter (Legacy File/CSV)**: Connects to the Node.js Express backend, generating CSV batch structures with SHA-256 integrity checksum verification.
