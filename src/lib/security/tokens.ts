import { createHash, randomBytes, timingSafeEqual } from "crypto";

export interface TicketTokenPayload {
  token: string;
  tokenHash: string;
}

/**
 * Generates an unpredictable cryptographically secure ticket token.
 * QR codes render ONLY the token identifier, never private student emails or PII.
 */
export function generateTicketToken(): TicketTokenPayload {
  // 128-bit cryptographically secure entropy
  const randomHex = randomBytes(16).toString("hex").toUpperCase();
  const token = `CP-TKT-${randomHex}`;
  const tokenHash = hashTicketToken(token);

  return {
    token,
    tokenHash,
  };
}

/**
 * Creates a SHA-256 hash of the ticket token for indexed and secure database lookup.
 */
export function hashTicketToken(token: string): string {
  return createHash("sha256").update(token.trim()).digest("hex");
}

/**
 * Constant-time comparison to prevent timing attacks when comparing sensitive tokens.
 */
export function verifyTokenHash(providedHash: string, storedHash: string): boolean {
  if (providedHash.length !== storedHash.length) {
    return false;
  }
  const bufA = Buffer.from(providedHash, "hex");
  const bufB = Buffer.from(storedHash, "hex");
  if (bufA.length !== bufB.length) {
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}
