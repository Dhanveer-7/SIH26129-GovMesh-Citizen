import { DepartmentCode, ServiceRegistryEntry } from '../models/canonical.js';
import { config } from '../config.js';

class ServiceRegistry {
  private registry: Map<DepartmentCode, ServiceRegistryEntry> = new Map();

  constructor() {
    this.init();
  }

  private init() {
    this.registry.set('REVENUE', {
      departmentCode: 'REVENUE',
      departmentName: 'Revenue & Forest Department',
      baseUrl: config.revenueApiBaseUrl,
      protocol: 'REST/JSON',
      enabled: true,
      supportedServices: ['ADDRESS_CHANGE', 'LAND_RECORD', 'CITIZEN_VERIFICATION'],
      description: 'Primary registry for land records, civic address indices, and citizen verification scrutiny.'
    });

    this.registry.set('FOOD', {
      departmentCode: 'FOOD',
      departmentName: 'Food, Civil Supplies & Consumer Protection',
      baseUrl: config.foodApiBaseUrl,
      protocol: 'SOAP/XML',
      enabled: true,
      supportedServices: ['ADDRESS_CHANGE', 'RATION_CARD_UPDATE', 'PDS_RECORD_SYNC'],
      description: 'Public Distribution System (PDS) and Ration Card database synchronization engine.'
    });

    this.registry.set('RURAL_DEVELOPMENT', {
      departmentCode: 'RURAL_DEVELOPMENT',
      departmentName: 'Rural Development & Panchayat Raj',
      baseUrl: config.ruralApiBaseUrl,
      protocol: 'CSV/SFTP',
      enabled: true,
      supportedServices: ['ADDRESS_CHANGE', 'PANCHAYAT_RECORD_UPDATE', 'RURAL_SERVICE_SYNC'],
      description: 'Legacy file-based and modern registry synchronization for local Gram Panchayats.'
    });
  }

  public getDepartment(code: DepartmentCode): ServiceRegistryEntry | undefined {
    return this.registry.get(code);
  }

  public getAllDepartments(): ServiceRegistryEntry[] {
    return Array.from(this.registry.values());
  }

  public updateBaseUrl(code: DepartmentCode, url: string): void {
    const dept = this.registry.get(code);
    if (dept) {
      dept.baseUrl = url;
      this.registry.set(code, dept);
    }
  }
}

export const serviceRegistry = new ServiceRegistry();
