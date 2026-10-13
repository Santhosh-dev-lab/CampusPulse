import { UserRole } from "@prisma/client";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors/app-error";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  campusId: string | null;
}

/**
 * Validates that an authenticated session exists.
 */
export function requireAuth(user: AuthenticatedUser | null | undefined): AuthenticatedUser {
  if (!user || !user.id) {
    throw new UnauthorizedError("You must be signed in to perform this action.");
  }
  return user;
}

/**
 * Validates that the user has at least one of the allowed roles.
 */
export function requireRole(
  user: AuthenticatedUser | null | undefined,
  allowedRoles: UserRole[]
): AuthenticatedUser {
  const authed = requireAuth(user);

  if (!allowedRoles.includes(authed.role)) {
    throw new ForbiddenError(
      `Access restricted. Requires one of the following roles: [${allowedRoles.join(", ")}]. Current role: ${authed.role}.`
    );
  }

  return authed;
}

/**
 * Helper specifically for Administrator actions.
 */
export function requireAdmin(user: AuthenticatedUser | null | undefined): AuthenticatedUser {
  return requireRole(user, [UserRole.ADMIN]);
}

/**
 * Helper specifically for Organizer actions (also allows ADMIN).
 */
export function requireOrganizer(user: AuthenticatedUser | null | undefined): AuthenticatedUser {
  return requireRole(user, [UserRole.ORGANIZER, UserRole.ADMIN]);
}

/**
 * Helper for Student actions.
 */
export function requireStudent(user: AuthenticatedUser | null | undefined): AuthenticatedUser {
  return requireRole(user, [UserRole.STUDENT, UserRole.ORGANIZER, UserRole.ADMIN]);
}

/**
 * Evaluates whether an event status transition is permitted.
 */
export function validateEventStatusTransition(
  currentStatus: string,
  newStatus: string,
  userRole: UserRole
): boolean {
  if (userRole === UserRole.ADMIN) {
    // Admins can approve, reject, publish or cancel
    return true;
  }

  if (userRole === UserRole.ORGANIZER) {
    // Organizers can submit draft for approval or publish already approved events
    if (currentStatus === "DRAFT" && newStatus === "PENDING_APPROVAL") return true;
    if (currentStatus === "APPROVED" && newStatus === "PUBLISHED") return true;
    if (currentStatus === "PUBLISHED" && newStatus === "CANCELLED") return true;
    return false;
  }

  return false;
}
