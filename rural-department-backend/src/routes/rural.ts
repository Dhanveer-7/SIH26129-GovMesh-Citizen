import { Router, Request, Response, NextFunction } from 'express';
import { memoryDb, RuralApplication } from '../db/memoryDb.js';

const router = Router();

// Middleware to simulate system offline crash (HTTP 503)
const simulateOfflineMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (memoryDb.isOffline()) {
    console.log(`[Rural API Alert] Blocked request to ${req.originalUrl} - System is offline (503)`);
    res.status(503).json({
      success: false,
      department: "RURAL_DEVELOPMENT",
      status: "UNAVAILABLE",
      message: "Rural Development registry system is temporarily offline for maintenance."
    });
    return;
  }
  next();
};

// Apply offline blocker middleware to active integration endpoints
router.use('/address-update', simulateOfflineMiddleware);
router.use('/application/:id', simulateOfflineMiddleware);

/**
 * @route   POST /api/rural/address-update
 * @desc    Submit address update request to Rural Development
 * @access  GovMesh Core Adapter Only
 */
router.post('/address-update', (req: Request, res: Response) => {
  const { applicationId, citizenId, name, address, purpose } = req.body;

  // Basic validation checks
  if (!applicationId || !citizenId || !name || !address || !address.line1 || !address.district || !address.state) {
    res.status(400).json({
      success: false,
      message: "Validation Error: Missing required integration parameters (applicationId, citizenId, name, address details)."
    });
    return;
  }

  // Generate unique department application ID
  const departmentApplicationId = `RUR-2026-000${Math.floor(10 + Math.random() * 90)}`;
  const timeNow = new Date().toISOString();

  // Create new entry
  const newApp: RuralApplication = {
    departmentApplicationId,
    applicationId,
    citizenId,
    name,
    address: {
      line1: address.line1,
      district: address.district,
      state: address.state
    },
    purpose: purpose || "ADDRESS_CHANGE",
    status: 'RECEIVED',
    updatedAt: timeNow
  };

  memoryDb.saveApplication(newApp);

  console.log(`[Rural API] Created application ${departmentApplicationId} for GovMesh ID: ${applicationId}`);

  // Simulate self-advancing legacy database updates:
  // 1. Transition to 'PROCESSING' after 15 seconds
  setTimeout(() => {
    const app = memoryDb.getApplication(departmentApplicationId);
    if (app && app.status === 'RECEIVED') {
      memoryDb.updateStatus(departmentApplicationId, 'PROCESSING');
      console.log(`[Rural DB Sync] Application ${departmentApplicationId} status advanced: RECEIVED ➔ PROCESSING`);
    }
  }, 15000);

  // 2. Transition to 'COMPLETED' after 40 seconds
  setTimeout(() => {
    const app = memoryDb.getApplication(departmentApplicationId);
    if (app && app.status === 'PROCESSING') {
      memoryDb.updateStatus(departmentApplicationId, 'COMPLETED');
      console.log(`[Rural DB Sync] Application ${departmentApplicationId} status advanced: PROCESSING ➔ COMPLETED`);
    }
  }, 40000);

  // Return standard response immediately
  res.status(202).json({
    success: true,
    department: "RURAL_DEVELOPMENT",
    departmentApplicationId,
    status: "RECEIVED",
    message: "Request received successfully"
  });
});

/**
 * @route   GET /api/rural/application/:id
 * @desc    Fetch status of application
 * @access  GovMesh Core Adapter Only
 */
router.get('/application/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const app = memoryDb.getApplication(id);

  if (!app) {
    res.status(404).json({
      success: false,
      message: `Application not found for Department ID: ${id}`
    });
    return;
  }

  res.status(200).json({
    departmentApplicationId: app.departmentApplicationId,
    applicationId: app.applicationId,
    status: app.status,
    updatedAt: app.updatedAt
  });
});

/**
 * @route   POST /api/rural/demo/toggle-failure
 * @desc    Simulate system crash/offline mode for testing retry loops
 * @access  Demo Presenter Only (unaffected by simulateOfflineMiddleware)
 */
router.post('/demo/toggle-failure', (req: Request, res: Response) => {
  const { enabled } = req.body;

  if (typeof enabled !== 'boolean') {
    res.status(400).json({
      success: false,
      message: "Validation Error: 'enabled' toggle parameter must be a boolean."
    });
    return;
  }

  memoryDb.setSystemOffline(enabled);

  res.status(200).json({
    success: true,
    failureModeActive: enabled,
    message: enabled 
      ? "Simulated Rural Development API is now OFFLINE (returns HTTP 503 for updates/queries)." 
      : "Simulated Rural Development API is now ONLINE (normal operation resumed)."
  });
});

export default router;
