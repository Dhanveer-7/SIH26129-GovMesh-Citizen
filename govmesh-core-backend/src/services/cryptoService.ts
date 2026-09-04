import crypto from 'crypto';

export class CryptoService {
  /**
   * Deterministically normalizes an object by sorting keys recursively
   * and formatting values to guarantee consistent SHA-256 hash generation.
   */
  public canonicalize(obj: any): string {
    if (obj === null || obj === undefined) {
      return 'null';
    }
    if (typeof obj !== 'object') {
      if (typeof obj === 'string') {
        return JSON.stringify(obj.trim());
      }
      return JSON.stringify(obj);
    }
    if (Array.isArray(obj)) {
      return '[' + obj.map(item => this.canonicalize(item)).join(',') + ']';
    }

    const sortedKeys = Object.keys(obj).sort();
    const keyValues = sortedKeys
      .filter(key => obj[key] !== undefined && !['idempotencyKey', 'transportPayloadHash'].includes(key))
      .map(key => `${JSON.stringify(key)}:${this.canonicalize(obj[key])}`);

    return '{' + keyValues.join(',') + '}';
  }

  /**
   * Computes SHA-256 hash of a canonical request representation.
   */
  public computeCanonicalRequestHash(request: any): string {
    // Strip mutable transport flags to hash only the logical business content
    const sanitized = {
      applicationId: request.applicationId,
      correlationId: request.correlationId,
      citizenId: request.citizenId,
      serviceCode: request.serviceCode,
      purpose: request.purpose,
      citizen: request.citizen,
      consentId: request.consentId,
      documents: request.documents?.map((d: any) => ({
        id: d.id,
        name: d.name,
        type: d.type,
        size: d.size,
        checksum: d.checksum || d.documentHash
      }))
    };

    const canonicalJson = this.canonicalize(sanitized);
    const hash = crypto.createHash('sha256').update(canonicalJson, 'utf8').digest('hex');
    return `sha256:${hash}`;
  }

  /**
   * Computes SHA-256 hash of binary or string document contents.
   */
  public computeDocumentHash(content: string | Buffer): string {
    if (!content) {
      // Default deterministic hash for demo address proof
      return 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    }
    const hash = crypto.createHash('sha256').update(content).digest('hex');
    return `sha256:${hash}`;
  }

  /**
   * Computes hash for transport-specific serialization (e.g. XML envelope or CSV lines).
   */
  public computeTransportPayloadHash(payload: any): string {
    const raw = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const hash = crypto.createHash('sha256').update(raw, 'utf8').digest('hex');
    return `sha256:${hash}`;
  }

  /**
   * Verifies if calculated hash matches expected hash.
   */
  public verifyHash(calculated: string, expected?: string): boolean {
    if (!expected) return true;
    return calculated.toLowerCase().trim() === expected.toLowerCase().trim();
  }
}

export const cryptoService = new CryptoService();
