import { DepartmentCode, ServiceRegistryEntry, ServiceDefinition } from '../models/canonical.js';
import { config } from '../config.js';

class ServiceRegistry {
  private departments: Map<DepartmentCode, ServiceRegistryEntry> = new Map();
  private services: Map<string, ServiceDefinition> = new Map();

  constructor() {
    this.initDepartments();
    this.initServices();
  }

  private initDepartments() {
    this.registerDepartment({
      departmentCode: 'REVENUE',
      departmentName: 'Revenue & Forest Department',
      baseUrl: config.revenueApiBaseUrl,
      protocol: 'REST/JSON',
      enabled: true,
      supportedServices: ['ADDRESS_CHANGE', 'LAND_RECORD_UPDATE', 'INCOME_CERTIFICATE_SYNC', 'CITIZEN_VERIFICATION', 'CIVIC_UTILITY_SYNC'],
      description: 'Primary registry for land records, civic address indices, and citizen verification scrutiny.'
    });

    this.registerDepartment({
      departmentCode: 'FOOD',
      departmentName: 'Food, Civil Supplies & Consumer Protection',
      baseUrl: config.foodApiBaseUrl,
      protocol: 'SOAP/XML',
      enabled: true,
      supportedServices: ['ADDRESS_CHANGE', 'RATION_CARD_ADDRESS_UPDATE', 'INCOME_CERTIFICATE_SYNC', 'PDS_RECORD_SYNC'],
      description: 'Public Distribution System (PDS) and Ration Card database synchronization engine.'
    });

    this.registerDepartment({
      departmentCode: 'RURAL_DEVELOPMENT',
      departmentName: 'Rural Development & Panchayat Raj',
      baseUrl: config.ruralApiBaseUrl,
      protocol: 'CSV/SFTP',
      enabled: true,
      supportedServices: ['ADDRESS_CHANGE', 'GRAM_PANCHAYAT_ADDRESS_UPDATE', 'CIVIC_UTILITY_SYNC', 'RURAL_SERVICE_SYNC', 'PANCHAYAT_RECORD_UPDATE'],
      description: 'Legacy file-based and modern registry synchronization for local Gram Panchayats.'
    });
  }

  private initServices() {
    this.registerService({
      serviceCode: 'ADDRESS_CHANGE',
      serviceName: 'Cross-Department Address Synchronization',
      description: 'Unified residential address change synchronized across Revenue, Food (Ration), and Rural (Panchayat) registries.',
      targetDepartments: ['REVENUE', 'FOOD', 'RURAL_DEVELOPMENT'],
      requiredConsents: ['revenue', 'food', 'rural'],
      executionMode: 'SEQUENTIAL_VERIFIED',
      requiredFields: ['citizen.name', 'citizen.address']
    });

    this.registerService({
      serviceCode: 'LAND_RECORD_UPDATE',
      serviceName: 'Land & Revenue Record Verification',
      description: 'Dedicated update and verification against state Land & Revenue records.',
      targetDepartments: ['REVENUE'],
      requiredConsents: ['revenue'],
      executionMode: 'PARALLEL_FAN_OUT',
      requiredFields: ['citizen.name', 'citizen.address']
    });

    this.registerService({
      serviceCode: 'RATION_CARD_ADDRESS_UPDATE',
      serviceName: 'Ration Card & Food Quota Sync',
      description: 'Public Distribution System (PDS) and family quota address update.',
      targetDepartments: ['FOOD'],
      requiredConsents: ['food'],
      executionMode: 'PARALLEL_FAN_OUT',
      requiredFields: ['citizen.name', 'citizen.address']
    });

    this.registerService({
      serviceCode: 'GRAM_PANCHAYAT_ADDRESS_UPDATE',
      serviceName: 'Gram Panchayat Resident Registry Update',
      description: 'Local village governance resident registry update.',
      targetDepartments: ['RURAL_DEVELOPMENT'],
      requiredConsents: ['rural'],
      executionMode: 'PARALLEL_FAN_OUT',
      requiredFields: ['citizen.name', 'citizen.address']
    });

    this.registerService({
      serviceCode: 'INCOME_CERTIFICATE_SYNC',
      serviceName: 'Income & Asset Certificate Sync',
      description: 'Dual validation across Revenue scrutiny and Food subsidy tier classification.',
      targetDepartments: ['REVENUE', 'FOOD'],
      requiredConsents: ['revenue', 'food'],
      executionMode: 'SEQUENTIAL_VERIFIED',
      requiredFields: ['citizen.name', 'citizen.address']
    });

    this.registerService({
      serviceCode: 'CIVIC_UTILITY_SYNC',
      serviceName: 'Rural Utility & Civic Connection',
      description: 'Joint update across Rural Panchayat utility infrastructure and Revenue records.',
      targetDepartments: ['RURAL_DEVELOPMENT', 'REVENUE'],
      requiredConsents: ['rural', 'revenue'],
      executionMode: 'PARALLEL_FAN_OUT',
      requiredFields: ['citizen.name', 'citizen.address']
    });
  }

  // Department management
  public registerDepartment(dept: ServiceRegistryEntry): void {
    this.departments.set(dept.departmentCode, dept);
  }

  public getDepartment(code: DepartmentCode): ServiceRegistryEntry | undefined {
    return this.departments.get(code);
  }

  public getAllDepartments(): ServiceRegistryEntry[] {
    return Array.from(this.departments.values());
  }

  public updateBaseUrl(code: DepartmentCode, url: string): void {
    const dept = this.departments.get(code);
    if (dept) {
      dept.baseUrl = url;
      this.departments.set(code, dept);
    }
  }

  // Service management
  public registerService(service: ServiceDefinition): void {
    this.services.set(service.serviceCode, service);
  }

  public getService(serviceCode: string): ServiceDefinition | undefined {
    return this.services.get(serviceCode);
  }

  public getAllServices(): ServiceDefinition[] {
    return Array.from(this.services.values());
  }

  public resolveTargetDepartments(serviceCode: string, requestedTargets?: DepartmentCode[]): DepartmentCode[] {
    if (requestedTargets && requestedTargets.length > 0) {
      return requestedTargets.filter(d => this.departments.has(d));
    }

    const service = this.services.get(serviceCode);
    if (service) {
      return service.targetDepartments.filter(d => {
        const dept = this.departments.get(d);
        return dept && dept.enabled;
      });
    }

    // Default fallback: match any department that supports the service
    const matching: DepartmentCode[] = [];
    for (const [code, dept] of this.departments.entries()) {
      if (dept.enabled && dept.supportedServices.includes(serviceCode)) {
        matching.push(code);
      }
    }

    return matching.length > 0 ? matching : ['REVENUE', 'FOOD', 'RURAL_DEVELOPMENT'];
  }
}

export const serviceRegistry = new ServiceRegistry();
