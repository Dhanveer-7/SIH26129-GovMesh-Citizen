import { AuditLogEntry } from '../models/canonical.js';

class AuditService {
  private logs: AuditLogEntry[] = [];

  public log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
    const logEntry: AuditLogEntry = {
      id: `AUDIT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString(),
      ...entry,
      details: this.sanitize(entry.details)
    };
    this.logs.unshift(logEntry);
    console.log(`[GovMesh Audit Log] [${logEntry.event}] App: ${logEntry.applicationId} | Result: ${logEntry.result} | ${logEntry.details}`);
    return logEntry;
  }

  public getLogsByApplicationId(applicationId: string): AuditLogEntry[] {
    return this.logs.filter(l => l.applicationId === applicationId);
  }

  public getAllLogs(limit: number = 100): AuditLogEntry[] {
    return this.logs.slice(0, limit);
  }

  private sanitize(text: string): string {
    if (!text) return '';
    return text
      .replace(/password\s*[:=]\s*[^\s,]+/gi, 'password=[REDACTED]')
      .replace(/bearer\s+[a-zA-Z0-9._-]+/gi, 'Bearer [REDACTED]')
      .replace(/token\s*[:=]\s*[^\s,]+/gi, 'token=[REDACTED]');
  }
}

export const auditService = new AuditService();
