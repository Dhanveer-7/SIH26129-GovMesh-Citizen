# GovMesh Multi-Protocol Integration Guide

> **Disclaimer**: *This is a demonstration interoperability platform developed for SIH26129 and is not an official Government of Maharashtra production system.*

---

## 1. Integration Patterns Supported

GovMesh proves that heterogeneous government systems can interoperate without standardizing on a single programming language or backend framework.

| Department | Internal Stack | Exposed Interface | GovMesh Transformation |
| :--- | :--- | :--- | :--- |
| **Revenue Department** | Python 3.11 + FastAPI | REST / JSON | Maps canonical fields to scrutiny format & passes Bearer JWT token |
| **Food & Civil Supplies** | Java 17 + Spring Boot 3 | SOAP / XML WebService | Jaxb2Marshaller transforms canonical JSON $\rightarrow$ `<UpdateRationAddress>` XML |
| **Rural Development** | Node.js + Express | Legacy CSV / SFTP | Generates CSV records with SHA-256 integrity checksum manifest |

---

## 2. Department Mapping Matrix

### 1. Revenue Department Mapping
```json
// GovMesh Canonical Input
{
  "applicationId": "GM-2026-000124",
  "citizen": { "name": "Aarav Sharma", "address": { "line1": "FC Road", "district": "Pune" } }
}

// Mapped Revenue FastAPI Payload (/api/v1/revenue/address/verify)
{
  "application_id": "GM-2026-000124",
  "citizen_name": "Aarav Sharma",
  "new_address": { "line": "FC Road", "district": "Pune" }
}
```

### 2. Food & Civil Supplies SOAP Mapping
```xml
<!-- Mapped SOAP XML Payload (/ws) -->
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:food="http://govmesh.mahagov.in/food">
   <soapenv:Header/>
   <soapenv:Body>
      <food:UpdateRationAddress>
         <food:ApplicationId>GM-2026-000124</food:ApplicationId>
         <food:CitizenName>Aarav Sharma</food:CitizenName>
         <food:Address>FC Road</food:Address>
         <food:DistrictCode>Pune</food:DistrictCode>
         <food:RevenueVerified>true</food:RevenueVerified>
      </food:UpdateRationAddress>
   </soapenv:Body>
</soapenv:Envelope>
```

### 3. Rural Development CSV Mapping
```csv
application_id,citizen_name,address,district,verified
GM-2026-000124,Aarav Sharma,FC Road,Pune,true
```
