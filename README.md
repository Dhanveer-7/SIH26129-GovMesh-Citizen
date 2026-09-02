# GovMesh Citizen Portal & Interoperability Orchestrator — SIH26129

> **Disclaimer**: *This is a demonstration interoperability platform developed for SIH26129 and is not an official Government of Maharashtra production system.*

GovMesh is an interoperability and digital service orchestration platform designed for the Smart India Hackathon 2026.

## Problem Statement

> **"System integration and interoperability among government digital platforms, resulting in fragmented service delivery."**

Currently, citizens applying for multi-system changes (e.g. updating an address or family credentials) must log in to several department portals separately (Revenue, Food/PDS distribution, and Rural Development Panchayats). This results in a fragmented, repetitive service delivery model with redundant file uploads, data synchronization lag, and high administrative overhead.

## System Architecture

GovMesh demonstrates heterogeneous multi-protocol government system interoperability:
- **Revenue Department**: REST / JSON API (Python FastAPI on Render)
- **Food & Civil Supplies Department**: SOAP / XML WebService (Java 17 Spring Boot)
- **Rural Development & Panchayat Raj**: Legacy File / CSV Ingestion (Node.js Express)
- **Citizen Portal**: Unified client orchestrator (React + TypeScript)

For in-depth technical guides, refer to:
- [Architecture Design](docs/architecture.md)
- [API Contract Specification](docs/api.md)
- [Protocol Integration Guide](docs/integration.md)
- [Deployment Configuration](docs/deployment.md)

---

## Features

- **Citizen Single-Sign-On (SSO)**: Mobile and OTP authentication simulation.
- **Natural-Language Query parsing**: Describe requests in plain text (e.g., *"I changed my address"*), auto-detect intents, and recommend services.
- **Service Discovery Directory**: Directory catalog detailing department involvements, required documents, and purpose.
- **Coordinated Data Previews**: Inspect exactly what parameters are requested by each department and why before sharing.
- **Explicit Consent Management**: Purpose-bound consent cards with approve/reject options (secured by PIN authorization).
- **Simulated OCR Extraction**: Automated entity extraction (Name, Address, Date) from uploaded files with confidence scores and verification forms.
- **Unified Timeline Tracking**: Single tracking number (`GM-2026-000124`) and progress timeline showing coordinated backend steps.
- **Automatic Retry Recovery**: Real-time display of retry backoffs when department systems fail, showing citizen-friendly status screens instead of SOAP/XML crashes.
- **Data Sharing Transparency Ledger**: Log trail detailing exactly who accessed your documents, what fields were shared, and when.
- **Privacy & Security Center**: Session controllers, device logging tables, and logout actions.
- **Citizen Help Desk**: Collapsible FAQs and support trouble ticket submitter.

---

## Tech Stack

- **Framework**: React.js (v18.3) & TypeScript
- **Bundler & Dev Server**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM (v6)
- **Icons**: Lucide React
- **Charts**: Recharts (for access audit volume)

---

## Environment Variables

The portal uses variables configured in your `.env` file. See [`.env.example`](file:///.env.example):
- `VITE_API_BASE_URL`: Base endpoint of the future GovMesh API gateway. If left empty, the application automatically defaults to sandbox mock mode.
- `VITE_APP_ENV`: Current execution mode (e.g. `development` or `production`).

---

## Local Development

Follow these commands to configure the workspace and launch the developer server locally.

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Developer Server
```bash
npm run dev
```
The server will bind to `http://localhost:3000/`.

---

## Production Build

To bundle the React client for deployment:

### Compile Build
```bash
npm run build
```
This generates optimized static files in the `/dist` directory.

### Preview Bundle
```bash
npm run preview
```

---

## Deployment

The portal is designed to deploy to static web hosting providers:
- **Netlify**: Configured via [`public/_redirects`](file:///public/_redirects) to fallback route lookups to React Router.
- **Vercel**: Configured via [`vercel.json`](file:///vercel.json) rewrite definitions.

For detailed guidelines, see the [Deployment Guide](file:///docs/deployment.md).

---

## GovMesh Core Architecture

The GovMesh platform coordinates separate systems using this conceptual model:

```
      [ Citizen Portal ]  (This Repository)
              │
              ▼
       [ GovMesh Core ]   (Workflow Orchestration temporal engine, Consent database)
              │
              ▼
   [ Department Adapters ] (SOAP/REST adapters, legacy CSV handlers)
       ┌──────┼──────┐
       ▼      ▼      ▼
   Revenue   Food  Rural
   System   System System
```

**Advisory Disclaimer:** This repository represents the Citizen Portal user interface and simulated department sandbox API schemas. Authentic government databases or official state portals are simulated.

---

## Rural Development Department Integration API

A standalone simulated API backend for the Rural Development & Panchayat Raj Department resides in the [`/rural-department-backend`](file:///rural-department-backend) subfolder. This system serves as a legacy database simulator for GovMesh to demonstrate cross-registry updates.

### Endpoints Map
- `POST /api/rural/address-update`: Submit address update payload. Creates a Panchayat application entry in `RECEIVED` status. Over a 40-second window, the status automatically cycles from `RECEIVED` ➔ `PROCESSING` ➔ `COMPLETED`.
- `GET /api/rural/application/{id}`: Fetch current status of a specific Panchayat application.
- `POST /api/rural/demo/toggle-failure`: Simulate a backend system failure (returns HTTP 503 Service Unavailable) to demonstrate GovMesh's queue-retry loops and automatic recovery.

For setup steps and code details, refer to the [Rural Backend README](file:///rural-department-backend/README.md).
