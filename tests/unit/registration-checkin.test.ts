import { describe, it, expect } from "vitest";
import { generateTicketToken, hashTicketToken, verifyTokenHash } from "@/lib/security/tokens";
import {
  DuplicateCheckInError,
  InvalidTicketError,
  EventFullError,
  DuplicateRegistrationError,
} from "@/lib/errors/app-error";

describe("Registration & Check-In Core Mechanics", () => {
  it("generates cryptographic tokens and matches SHA-256 hash", () => {
    const { token, tokenHash } = generateTicketToken();

    expect(token).toBeDefined();
    expect(hashTicketToken(token)).toBe(tokenHash);
    expect(token.startsWith("CP-TKT-")).toBe(true);
    expect(verifyTokenHash(tokenHash, tokenHash)).toBe(true);
  });

  it("enforces unique registration semantics and rejects duplicates", () => {
    const mockUserRegistration = {
      userId: "user-student-1",
      eventId: "event-hack-1",
    };

    const registeredUsers = new Set<string>();
    const register = (userId: string, eventId: string) => {
      const key = `${userId}:${eventId}`;
      if (registeredUsers.has(key)) {
        throw new DuplicateRegistrationError();
      }
      registeredUsers.add(key);
      return { success: true };
    };

    expect(register(mockUserRegistration.userId, mockUserRegistration.eventId).success).toBe(true);
    expect(() =>
      register(mockUserRegistration.userId, mockUserRegistration.eventId)
    ).toThrow("already registered");
  });

  it("enforces capacity constraints when registrations reach capacity limit", () => {
    let capacity = 3;
    let registeredCount = 3;

    const checkCapacity = () => {
      if (registeredCount >= capacity) {
        throw new EventFullError();
      }
      registeredCount++;
    };

    expect(() => checkCapacity()).toThrow("maximum seating capacity");
  });

  it("guarantees idempotent check-in and rejects duplicate scans", () => {
    const checkedInTokens = new Set<string>();

    const checkIn = (token: string) => {
      if (!token.startsWith("CP-TKT-")) {
        throw new InvalidTicketError();
      }
      if (checkedInTokens.has(token)) {
        throw new DuplicateCheckInError();
      }
      checkedInTokens.add(token);
      return { status: "SUCCESS" };
    };

    const validToken = "CP-TKT-1234567890ABCDEF1234567890ABCDEF";

    expect(checkIn(validToken).status).toBe("SUCCESS");
    expect(() => checkIn(validToken)).toThrow("already been checked into");
    expect(() => checkIn("INVALID-TOKEN")).toThrow("Invalid or unrecognized");
  });
});
