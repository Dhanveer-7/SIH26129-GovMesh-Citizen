import express from 'express';
import { orchestratorService } from '../services/orchestratorService.js';
import { serviceRegistry } from '../registry/serviceRegistry.js';
import { auditService } from '../services/auditService.js';
import { CanonicalAddressChangeRequest } from '../models/canonical.js';

const router = express.Router();

// ============================================================
// 1. HEALTH & SYSTEM MONITORING
// ============================================================
router.get(['/', '/health', '/api/health'], (req, res) => {
  res.json({
    status: 'ok',
    service: 'govmesh-core-backend',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString(),
    departments: serviceRegistry.getAllDepartments().map(d => ({
      code: d.departmentCode,
      name: d.departmentName,
      status: d.enabled ? 'ONLINE' : 'DISABLED',
      protocol: d.protocol,
      endpoint: d.baseUrl
    }))
  });
});

// ============================================================
// 2. SERVICE REGISTRY
// ============================================================
router.get('/api/govmesh/registry', (req, res) => {
  res.json({
    success: true,
    registry: serviceRegistry.getAllDepartments()
  });
});

// ============================================================
// 3. CANONICAL TRANSACTION INGRESS & ORCHESTRATION
// ============================================================
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
    const httpStatus = result.success ? 200 : (result.status === 'ACTION_REQUIRED' ? 422 : 200);

    res.status(httpStatus).json(result);
  } catch (err: any) {
    console.error('[GovMesh Core Error]', err);
    res.status(500).json({
      success: false,
      message: `Internal Orchestration Error: ${err.message}`
    });
  }
});

// ============================================================
// 4. TRANSACTION STATUS & TRACKING
// ============================================================
router.get('/api/govmesh/transactions/:applicationId', (req, res) => {
  const { applicationId } = req.params;
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
    status: tx.status,
    progressPercent: tx.progressPercent,
    completedDepartments: tx.completedDepartments,
    totalDepartments: tx.totalDepartments,
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

// ============================================================
// 5. OPERATIONAL RETRY
// ============================================================
router.post('/api/govmesh/transactions/:applicationId/retry', async (req, res) => {
  const { applicationId } = req.params;
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

// ============================================================
// 6. AUDIT TRAILS
// ============================================================
router.get('/api/govmesh/audit/:applicationId', (req, res) => {
  const { applicationId } = req.params;
  const logs = auditService.getLogsByApplicationId(applicationId);
  res.json({
    success: true,
    applicationId,
    count: logs.length,
    auditLogs: logs
  });
});

router.get('/api/govmesh/audit', (req, res) => {
  const limit = parseInt(req.query.limit as string || '50', 10);
  const logs = auditService.getAllLogs(limit);
  res.json({
    success: true,
    count: logs.length,
    auditLogs: logs
  });
});

export default router;
