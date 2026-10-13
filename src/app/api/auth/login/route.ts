import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { success: false, error: "Please enter your SRM institutional email address." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || !password.trim()) {
      return NextResponse.json(
        { success: false, error: "Please enter your password." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Find user in PostgreSQL
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        campus: true,
        clubMemberships: {
          include: { club: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "No account found with this email. Please check your credentials or create an account.",
        },
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
      message: `Signed in successfully as ${user.name}`,
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
