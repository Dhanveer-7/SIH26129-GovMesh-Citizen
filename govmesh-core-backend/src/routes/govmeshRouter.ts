import express from 'express';
import { orchestratorService } from '../services/orchestratorService.js';
import { serviceRegistry } from '../registry/serviceRegistry.js';
import { auditService } from '../services/auditService.js';
import { evidenceService } from '../services/evidenceService.js';
import { CanonicalAddressChangeRequest } from '../models/canonical.js';

const router = express.Router();

// Sanitizer helper to prevent path traversal and injection in route params
const isValidIdentifier = (val: string): boolean => /^[a-zA-Z0-9_\-\.:]+$/.test(val);

router.get(['/', '/health', '/api/health'], (req, res) => {
  res.json({
    status: 'ok',
    service: 'govmesh-core-backend',
    version: '2.1.0-traceability',
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString(),
    departments: serviceRegistry.getAllDepartments().map(d => ({
      code: d.departmentCode,
      name: d.departmentName,
      status: d.enabled ? 'ONLINE' : 'DISABLED',
      protocol: d.protocol,
      endpoint: d.baseUrl,
      supportedServices: d.supportedServices
    }))
  });
});

router.get('/api/govmesh/services', (req, res) => {
  res.json({
    success: true,
    count: serviceRegistry.getAllServices().length,
    services: serviceRegistry.getAllServices()
  });
});

router.get('/api/govmesh/registry', (req, res) => {
  res.json({
    success: true,
    count: serviceRegistry.getAllDepartments().length,
    departments: serviceRegistry.getAllDepartments()
  });
});

router.post('/api/govmesh/transactions', async (req, res) => {
  try {
    const canonicalRequest = req.body as CanonicalAddressChangeRequest;

    if (!canonicalRequest.citizen?.name && !req.body.name) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payload: citizen name is required.'
      });
    }

    const result = await orchestratorService.processTransaction(canonicalRequest);
    const httpStatus = result.status === 'ACTION_REQUIRED' ? 422 : 200;

    res.status(httpStatus).json(result);
  } catch (err: any) {
    console.error('[GovMesh Core Ingress Error]', err);
    res.status(500).json({
      success: false,
      message: `Internal Orchestration Error: ${err.message}`
    });
  }
});

router.get('/api/govmesh/transactions/:applicationId', (req, res) => {
  const { applicationId } = req.params;
  if (!isValidIdentifier(applicationId)) {
    return res.status(400).json({ success: false, message: 'Invalid applicationId format' });
  }
  const tx = orchestratorService.getTransaction(applicationId);

  if (!tx) {
    return res.status(404).json({
      success: false,
      message: `Transaction record for application '${applicationId}' was not found in GovMesh Core registry.`
    });
  }

  res.json({
    success: true,
    applicationId: tx.applicationId,
    correlationId: tx.correlationId,
    requestVersion: tx.requestVersion,
    canonicalRequestHash: tx.canonicalRequestHash,
    documentHash: tx.documentHash,
    serviceCode: tx.serviceCode,
    status: tx.status,
    progressPercent: tx.progressPercent,
    completedDepartments: tx.completedDepartments,
    totalDepartments: tx.totalDepartments,
    targetDepartments: tx.targetDepartments,
    transaction: tx
  });
});

router.get('/api/govmesh/transactions', (req, res) => {
  const all = orchestratorService.getAllTransactions();
  res.json({
    success: true,
    count: all.length,
    transactions: all
  });
});

router.post('/api/govmesh/transactions/:applicationId/retry', async (req, res) => {
  const { applicationId } = req.params;
  if (!isValidIdentifier(applicationId)) {
    return res.status(400).json({ success: false, message: 'Invalid applicationId format' });
  }
  try {
    const result = await orchestratorService.retryTransaction(applicationId);
    res.json(result);
  } catch (err: any) {
    res.status(404).json({
      success: false,
      message: err.message
    });
  }
});

// Bi-Directional Department Officer Status Callback Endpoint
router.post('/api/govmesh/callbacks/department-status', async (req, res) => {
  try {
    const { applicationId, departmentCode, status, remarks, officer, acknowledgementId, timestamp } = req.body;

    if (!applicationId || !isValidIdentifier(applicationId)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing applicationId.' });
    }
    if (!departmentCode || !isValidIdentifier(departmentCode)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing departmentCode.' });
    }

    const updatedTx = orchestratorService.updateDepartmentCallback(
      applicationId,
      departmentCode.toUpperCase(),
      status || 'SUCCESS',
      remarks || `Status transitioned to ${status} by department officer.`,
      officer,
      acknowledgementId,
      timestamp
    );

    if (!updatedTx) {
      return res.status(404).json({
        success: false,
        message: `Transaction record for '${applicationId}' not found in GovMesh Core.`
      });
    }

    res.json({
      success: true,
      message: `Department [${departmentCode}] status updated to [${status}].`,
      applicationId,
      departmentCode,
      status: updatedTx.status,
      progressPercent: updatedTx.progressPercent,
      transaction: updatedTx
    });
  } catch (err: any) {
    console.error('[GovMesh Callback Error]', err);
    res.status(500).json({
      success: false,
      message: `Failed to process department status callback: ${err.message}`
    });
  }
});

// Evidence & End-to-End Traceability Endpoints

router.get('/api/govmesh/evidence/:applicationId', (req, res) => {
  const { applicationId } = req.params;
  if (!isValidIdentifier(applicationId)) {
    return res.status(400).json({ success: false, message: 'Invalid applicationId format' });
  }
  const tx = orchestratorService.getTransaction(applicationId);
  const evidence = evidenceService.getInteroperabilityEvidence(applicationId, tx);

  if (!evidence) {
    return res.status(404).json({
      success: false,
      message: `No interoperability evidence found for application '${applicationId}'.`
    });
  }

  res.json({
    success: true,
    applicationId,
    evidence
  });
});

router.get('/api/govmesh/evidence/:applicationId/department/:departmentCode', (req, res) => {
  const { applicationId, departmentCode } = req.params;
  if (!isValidIdentifier(applicationId) || !isValidIdentifier(departmentCode)) {
    return res.status(400).json({ success: false, message: 'Invalid identifier format' });
  }
  const deptReq = evidenceService.getDepartmentReceivedRequest(applicationId, departmentCode.toUpperCase());

  if (!deptReq) {
    return res.status(404).json({
      success: false,
      message: `No received request record found for department '${departmentCode}' under application '${applicationId}'.`
    });
  }

  res.json({
    success: true,
    applicationId,
    departmentCode: departmentCode.toUpperCase(),
    receivedRequest: deptReq
  });
});

router.get('/api/govmesh/evidence/:applicationId/documents/:documentId', (req, res) => {
  const { applicationId, documentId } = req.params;
  if (!isValidIdentifier(applicationId) || !isValidIdentifier(documentId)) {
    return res.status(400).json({ success: false, message: 'Invalid identifier format' });
  }
  const doc = evidenceService.getDocument(applicationId, documentId);

  if (!doc) {
    return res.status(404).json({
      success: false,
      message: `Document '${documentId}' not found for application '${applicationId}'.`
    });
  }

  res.json({
    success: true,
    applicationId,
    document: doc
  });
});

router.get('/api/govmesh/audit/:applicationId', (req, res) => {
  const { applicationId } = req.params;
  if (!isValidIdentifier(applicationId)) {
    return res.status(400).json({ success: false, message: 'Invalid applicationId format' });
  }
  const logs = auditService.getLogsByApplicationId(applicationId);
  res.json({
    success: true,
    applicationId,
    count: logs.length,
    auditLogs: logs
  });
});

router.get('/api/govmesh/audit', (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit as string || '50', 10) || 50, 1), 500);
  const logs = auditService.getAllLogs(limit);
  res.json({
    success: true,
    count: logs.length,
    auditLogs: logs
  });
});

export default router;
