import { describe, it, expect } from "vitest";
import {
  requireAuth,
  requireRole,
  requireAdmin,
  requireOrganizer,
  validateEventStatusTransition,
} from "@/server/policies/rbac";
import { UserRole } from "@prisma/client";

describe("Role-Based Access Control (RBAC) Policies", () => {
  const student = {
    id: "usr-student-1",
    email: "student@srmist.edu.in",
    name: "Student One",
    role: UserRole.STUDENT,
    campusId: "srm-ktr",
  };

  const organizer = {
    id: "usr-organizer-1",
    email: "lead@dsc.srmist.edu.in",
    name: "Organizer Lead",
    role: UserRole.ORGANIZER,
    campusId: "srm-ktr",
  };

  const admin = {
    id: "usr-admin-1",
    email: "dean@srmist.edu.in",
    name: "Dean Affairs",
    role: UserRole.ADMIN,
    campusId: "srm-ktr",
  };

  it("throws UnauthorizedError when session is missing", () => {
    expect(() => requireAuth(null)).toThrow(/must be signed in/i);
    expect(() => requireAuth(undefined)).toThrow(/must be signed in/i);
  });

  it("permits allowed roles and rejects unauthorized roles", () => {
    expect(() => requireRole(admin, [UserRole.ADMIN])).not.toThrow();
    expect(() => requireRole(organizer, [UserRole.ORGANIZER])).not.toThrow();
    expect(() => requireRole(student, [UserRole.ADMIN])).toThrow(/Access restricted/i);
  });

  it("admin helper rejects organizer and student", () => {
    expect(() => requireAdmin(admin)).not.toThrow();
    expect(() => requireAdmin(organizer)).toThrow(/Access restricted/i);
    expect(() => requireAdmin(student)).toThrow(/Access restricted/i);
  });

  it("organizer helper permits both organizers and admins, but rejects students", () => {
    expect(() => requireOrganizer(organizer)).not.toThrow();
    expect(() => requireOrganizer(admin)).not.toThrow();
    expect(() => requireOrganizer(student)).toThrow(/Access restricted/i);
  });

  describe("Event Status Transition Rules", () => {
    it("permits organizers to submit DRAFT for PENDING_APPROVAL", () => {
      expect(validateEventStatusTransition("DRAFT", "PENDING_APPROVAL", UserRole.ORGANIZER)).toBe(
        true
      );
    });

    it("prevents organizers from directly self-approving DRAFT to PUBLISHED", () => {
      expect(validateEventStatusTransition("DRAFT", "PUBLISHED", UserRole.ORGANIZER)).toBe(false);
    });

    it("permits organizers to publish an already APPROVED event", () => {
      expect(validateEventStatusTransition("APPROVED", "PUBLISHED", UserRole.ORGANIZER)).toBe(true);
    });

    it("grants administrators full state transition authority", () => {
      expect(validateEventStatusTransition("PENDING_APPROVAL", "APPROVED", UserRole.ADMIN)).toBe(
        true
      );
      expect(validateEventStatusTransition("PENDING_APPROVAL", "REJECTED", UserRole.ADMIN)).toBe(
        true
      );
    });
  });
});
