# GovMesh Citizen Portal Deployment Guide

This document describes the prerequisites, environment variables, routing configurations, and deployment steps for hosting the Citizen Portal frontend of GovMesh.

---

## Prerequisites

- **Node.js**: Version 18.x or 20.x is recommended.
- **npm**: Version 9.x or higher.
- **Git**: Installed for repository tracking.

---

## Git Repository Initialization

To prepare your project locally for a new GitHub repository:

1. **Initialize Git**:
   ```bash
   git init
   ```
2. **Stage files**:
   ```bash
   git add .
   ```
3. **Commit changes**:
   ```bash
   git commit -m "Initial GovMesh Citizen Portal"
   ```
4. **Push to your GitHub repository**:
   ```bash
   git branch -M main
   # Add your GitHub repository link as origin
   git remote add origin <YOUR_GITHUB_REPOSITORY_URL>
   # Push files
   git push -u origin main
   ```

---

## Environment Variables Configuration

The application reads configuration from environment variables prefixed with `VITE_`.

| Variable | Description | Default Value |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base API gateway URL of the future backend server. | `""` (Empty string) |
| `VITE_APP_ENV` | Mode of deployment (`development`, `production`). | `"development"` |

### Sandbox API Fallback (Mock Mode)
If `VITE_API_BASE_URL` is omitted or empty, the application automatically mounts in **Sandbox Mock Mode**. This runs the entire presentation workflow (Login -> OTP verify -> Consent grants -> File Upload -> OCR Extraction -> Timeline auto-retries -> Action Required notifications) in local storage, enabling demonstration without external database servers.

---

## Production Build & Bundler output

To build the project for production:

1. Run the build script:
   ```bash
   npm run build
   ```
2. The bundled assets will be written to the `/dist` directory.
3. This static folder can be served by any static web server (NGINX, Apache, Vercel, Netlify).

---

## SPA Routing & Redirect Configurations

Because React Router uses client-side history navigation (`HTML5 History API`), deep-linking to routes (e.g. `/track` or `/services`) directly in the browser address bar will trigger a `404 Not Found` if served directly by NGINX or static web servers. The hosting provider must rewrite all requests to `index.html` so the React router can intercept and render the proper page.

### 1. Vercel Configuration
Vercel routing fallbacks are defined in [`vercel.json`](file:///vercel.json):
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 2. Netlify Configuration
Netlify rewrite rules are placed in [`public/_redirects`](file:///public/_redirects):
```
/*    /index.html   200
```

### 3. NGINX Configuration (for Virtual Private Server)
If hosting on a VPS under NGINX, add a `try_files` rule inside your location block:
```nginx
server {
    listen 80;
    server_name govmesh.in;
    root /var/www/govmesh/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## Connecting a Future Backend

The project implements a service layer in [`src/services/api.ts`](file:///src/services/api.ts). It exports the API client `api` which checks environment variables.

When connecting a real backend (e.g. a Python FastAPI backend or an Express API gateway):
1. Deploy your backend APIs.
2. Modify your deployment environment variables to specify:
   ```env
   VITE_API_BASE_URL=https://api.govmesh.gov.in
   ```
3. Re-build the client. The service layer will automatically switch from local mock sandbox operations to issuing `fetch` HTTP requests.
