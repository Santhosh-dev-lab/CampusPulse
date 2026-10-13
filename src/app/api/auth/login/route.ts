import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, role, userId } = body;

    let user = null;

    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          campus: true,
          clubMemberships: {
            include: { club: true },
          },
        },
      });
    } else if (email) {
      user = await prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() },
        include: {
          campus: true,
          clubMemberships: {
            include: { club: true },
          },
        },
      });
    } else if (role) {
      user = await prisma.user.findFirst({
        where: { role: role.toUpperCase() as UserRole },
        include: {
          campus: true,
          clubMemberships: {
            include: { club: true },
          },
        },
      });
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials. User not found." },
        { status: 401 }
      );
    }

    // Set secure authentication cookies
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        department: user.department,
        campusCode: user.campus?.code ?? "SRM-RMP",
        club: user.clubMemberships[0]?.club
          ? {
              id: user.clubMemberships[0].club.id,
              name: user.clubMemberships[0].club.name,
              role: user.clubMemberships[0].role,
            }
          : null,
      },
      message: `Successfully signed in as ${user.name} (${user.role})`,
    });

    response.cookies.set("campuspulse_user_id", user.id, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    response.cookies.set("campuspulse_role", user.role, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error during login." },
      { status: 500 }
    );
  }
}
