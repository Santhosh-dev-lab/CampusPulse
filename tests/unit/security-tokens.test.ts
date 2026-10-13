import { describe, it, expect } from "vitest";
import { generateTicketToken, hashTicketToken, verifyTokenHash } from "@/lib/security/tokens";

describe("Cryptographic Ticket Tokens & Security", () => {
  it("generates unpredictable, high-entropy tokens with proper prefix", () => {
    const t1 = generateTicketToken();
    const t2 = generateTicketToken();

    expect(t1.token).toMatch(/^CP-TKT-[0-9A-F]{32}$/);
    expect(t2.token).toMatch(/^CP-TKT-[0-9A-F]{32}$/);
    expect(t1.token).not.toBe(t2.token);
  });

  it("produces deterministic SHA-256 token hash", () => {
    const { token, tokenHash } = generateTicketToken();
    const computedHash = hashTicketToken(token);

    expect(computedHash).toBe(tokenHash);
    expect(computedHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("constant-time verification verifies equal hashes safely", () => {
    const hash = hashTicketToken("CP-TKT-SAMPLETOKEN12345");
    expect(verifyTokenHash(hash, hash)).toBe(true);

    const wrongHash = hashTicketToken("CP-TKT-WRONGTOKEN54321");
    expect(verifyTokenHash(hash, wrongHash)).toBe(false);
  });
});
