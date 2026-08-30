# GovMesh Rural Development Department API (Demo System)

This subproject implements a simulated backend API for the Rural Development & Panchayat Raj Department to demonstrate interoperability and system coordination in the Smart India Hackathon 2026.

---

## Architecture Flow

This application is designed as an independent department registry system. The GovMesh platform interacts with it through secure adapters without bypasses:

```
Citizen Portal ➔ GovMesh Core ➔ Rural Adapter ➔ Rural API (This project) ➔ Panchayat Database
```

---

## Getting Started

### Prerequisites
- Node.js (v18.x or 20.x)
- npm (v9.x or higher)

### Setup & Installation
1. Install node dependencies:
   ```bash
   npm install
   ```
2. Configure environmental variables. Create `.env` from `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Set your CORS allowed origins inside `.env`:
   ```env
   PORT=3001
   GOVMESH_ALLOWED_ORIGIN=http://localhost:3000
   ```

### Execution Scripts

#### Launch Developer Server
```bash
npm run dev
```
Starts Express server on `http://localhost:3001/` with auto-reload (using `ts-node-dev`).

#### Compile Build
```bash
npm run build
```
Compiles TypeScript files into production JavaScript inside `/dist`.

#### Run Production Server
```bash
npm run start
```

---

## API Documentation

All integration endpoints are prefixed with `/api/rural`.

### 1. Submit Address Update
*   **Method**: `POST`
*   **Path**: `/api/rural/address-update`
*   **Headers**: `Content-Type: application/json`
*   **Request Body Schema**:
    ```json
    {
      "applicationId": "GM-2026-000124",
      "citizenId": "GM-CIT-10001",
      "name": "Demo Citizen",
      "address": {
        "line1": "Demo Address",
        "district": "Pune",
        "state": "Maharashtra"
      },
      "purpose": "ADDRESS_CHANGE"
    }
    ```
*   **Success Response (202 Accepted)**:
    ```json
    {
      "success": true,
      "department": "RURAL_DEVELOPMENT",
      "departmentApplicationId": "RUR-2026-00051",
      "status": "RECEIVED",
      "message": "Request received successfully"
    }
    ```

### 2. Query Application Status
*   **Method**: `GET`
*   **Path**: `/api/rural/application/{departmentApplicationId}`
*   **Success Response (200 OK)**:
    ```json
    {
      "departmentApplicationId": "RUR-2026-00051",
      "applicationId": "GM-2026-000124",
      "status": "PROCESSING",
      "updatedAt": "2026-08-30T13:00:15.123Z"
    }
    ```
    *Note: The status will automatically cycle through `RECEIVED` ➔ `PROCESSING` ➔ `COMPLETED` over a 40-second interval to simulate background Panchayat database synchronizations.*

### 3. Demo Control: Toggle Failure Mode
*   **Method**: `POST`
*   **Path**: `/api/rural/demo/toggle-failure`
*   **Request Body**:
    ```json
    {
      "enabled": true
    }
    ```
*   **Success Response (200 OK)**:
    ```json
    {
      "success": true,
      "failureModeActive": true,
      "message": "Simulated Rural Development API is now OFFLINE (returns HTTP 503)."
    }
    ```
    *Note: When enabled, all calls to `/address-update` and `/application/:id` will fail with an HTTP 503 Service Unavailable error. Toggle `enabled: false` to simulate recovery.*
