export interface AddressRecord {
  line1: string;
  district: string;
  state: string;
}

export interface RuralApplication {
  departmentApplicationId: string;
  applicationId: string;
  citizenId: string;
  name: string;
  address: AddressRecord;
  purpose: string;
  status: 'RECEIVED' | 'PROCESSING' | 'ACTION_REQUIRED' | 'COMPLETED' | 'FAILED';
  updatedAt: string;
}

// In-Memory Database Map
const applicationsDb = new Map<string, RuralApplication>();

// Failure Simulation State
let isSystemOffline = false;

// Seed initial completed application matching the Citizen Portal mock history
const seedId = 'RUR-2026-000087';
applicationsDb.set(seedId, {
  departmentApplicationId: seedId,
  applicationId: 'GM-2026-000087',
  citizenId: 'GM-CIT-10001',
  name: 'Demo Citizen',
  address: {
    line1: 'Plot 42, Sector 12, Pradhikaran, Nigdi',
    district: 'Pune',
    state: 'Maharashtra'
  },
  purpose: 'ADDRESS_CHANGE',
  status: 'COMPLETED',
  updatedAt: new Date('2026-08-18T14:45:00Z').toISOString()
});

export const memoryDb = {
  // Application Operations
  saveApplication: (app: RuralApplication) => {
    applicationsDb.set(app.departmentApplicationId, app);
  },

  getApplication: (id: string): RuralApplication | undefined => {
    return applicationsDb.get(id);
  },

  getAllApplications: (): RuralApplication[] => {
    return Array.from(applicationsDb.values());
  },

  updateStatus: (id: string, status: RuralApplication['status']): boolean => {
    const app = applicationsDb.get(id);
    if (app) {
      app.status = status;
      app.updatedAt = new Date().toISOString();
      applicationsDb.set(id, app);
      return true;
    }
    return false;
  },

  // Demo Failure Simulation Toggles
  setSystemOffline: (offline: boolean) => {
    isSystemOffline = offline;
    console.log(`[MemoryDB] System offline failure mode set to: ${isSystemOffline}`);
  },

  isOffline: (): boolean => {
    return isSystemOffline;
  }
};
export default memoryDb;
