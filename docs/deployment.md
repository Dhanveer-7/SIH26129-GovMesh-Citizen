# GovMesh Deployment Guide

> **Disclaimer**: *This is a demonstration interoperability platform developed for SIH26129 and is not an official Government of Maharashtra production system.*

---

## 1. Production Topology

| Component | Platform | Production Endpoint |
| :--- | :--- | :--- |
| **Citizen Portal** | Vercel | `https://sih-26129-gov-mesh-citizen.vercel.app/` |
| **GovMesh Core Engine** | Node.js / Express | `http://localhost:5000` (Local) / Cloud Host |
| **Revenue Backend** | Render (FastAPI) | `https://sih-2026-revenue-dept.onrender.com` |
| **Food Department Backend** | Render (Spring Boot) | `https://sih-awaq.onrender.com` |
| **Food Department Frontend** | Vercel | `https://sih-flax-rho.vercel.app/` |
| **Rural Development** | Node.js / Express | `http://localhost:5003` / `https://sih-26129-gov-mesh-rural-develpment.vercel.app/` |

---

## 2. Environment Variables Reference

### Citizen Portal (`.env`)
```bash
VITE_API_BASE_URL=http://localhost:5000
VITE_GOVMESH_CORE_URL=http://localhost:5000
```

### GovMesh Core Backend (`govmesh-core-backend/.env`)
```bash
PORT=5000
NODE_ENV=production
FRONTEND_ORIGIN=https://sih-26129-gov-mesh-citizen.vercel.app,http://localhost:5173,http://localhost:3000

DEPARTMENT_1_API_BASE_URL=https://sih-2026-revenue-dept.onrender.com
REVENUE_API_BASE_URL=https://sih-2026-revenue-dept.onrender.com

DEPARTMENT_2_API_BASE_URL=https://sih-awaq.onrender.com
FOOD_API_BASE_URL=https://sih-awaq.onrender.com

DEPARTMENT_3_API_BASE_URL=http://localhost:5003
RURAL_API_BASE_URL=http://localhost:5003

GOVMESH_API_KEY=gm-secret-key-2026-interop
```
