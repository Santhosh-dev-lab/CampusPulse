import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";
import { AuthenticatedUser } from "@/server/policies/rbac";

export interface DevUserOption {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string | null;
  department?: string | null;
  campusCode?: string | null;
}

/**
 * Retrieves the current user for API routes and Server Components.
 * Inspects:
 * 1. Request headers (e.g., 'x-user-id' or 'x-user-role' for automated testing and API clients)
 * 2. Incoming request cookies ('campuspulse_user_id')
 * 3. Default fallback to seeded Student (Santhosh Kumar) for seamless zero-config local testing.
 */
export async function getCurrentUser(req?: Request): Promise<AuthenticatedUser> {
  let userIdFromHeader: string | null = null;
  let roleFromHeader: string | null = null;

  if (req) {
    userIdFromHeader = req.headers.get("x-user-id");
    roleFromHeader = req.headers.get("x-user-role");
  } else {
    try {
      const headerStore = await headers();
      userIdFromHeader = headerStore.get("x-user-id");
      roleFromHeader = headerStore.get("x-user-role");
    } catch {
      // Outside request context
    }
  }

  let userIdFromCookie: string | null = null;
  try {
    const cookieStore = await cookies();
    userIdFromCookie = cookieStore.get("campuspulse_user_id")?.value ?? null;
  } catch {
    // Outside request context
  }

  const effectiveUserId = userIdFromHeader || userIdFromCookie;

  if (effectiveUserId) {
    const user = await prisma.user.findUnique({
      where: { id: effectiveUserId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        campusId: true,
      },
    });

    if (user) {
      return user;
    }
  }

  if (roleFromHeader) {
    const userByRole = await prisma.user.findFirst({
      where: { role: roleFromHeader.toUpperCase() as UserRole },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        campusId: true,
      },
    });

    if (userByRole) {
      return userByRole;
    }
  }

  // Fallback: Default to Student Santhosh Kumar, or first available user
  let defaultUser = await prisma.user.findFirst({
    where: { email: "santhosh.student@srmist.edu.in" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      campusId: true,
    },
  });

  if (!defaultUser) {
    defaultUser = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        campusId: true,
      },
    });
  }

  if (!defaultUser) {
    // In rare zero-record state, create a default student
    const created = await prisma.user.create({
      data: {
        email: "santhosh.student@srmist.edu.in",
        name: "Santhosh Kumar",
        role: UserRole.STUDENT,
        studentId: "RA2311003010512",
      },
    });
    return {
      id: created.id,
      email: created.email,
      name: created.name,
      role: created.role,
      campusId: created.campusId,
    };
  }

  return defaultUser;
}

/**
 * Returns available seeded developer users to populate switcher components.
 */
export async function getAvailableDevUsers(): Promise<DevUserOption[]> {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      studentId: true,
      department: true,
      campus: {
        select: { code: true },
      },
    },
    orderBy: {
      role: "asc",
    },
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name || u.email,
    email: u.email,
    role: u.role,
    studentId: u.studentId,
    department: u.department,
    campusCode: u.campus?.code,
  }));
}
