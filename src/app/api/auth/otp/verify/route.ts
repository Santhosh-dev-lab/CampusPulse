import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";

const DASHBOARD_REDIRECTS: Record<UserRole, string> = {
  STUDENT: "/student/dashboard",
  ORGANIZER: "/club/dashboard",
  ADMIN: "/admin/dashboard",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let email = (body.email || "").trim().toLowerCase();
    const code = (body.code || "").trim();

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: "Email and 6-digit verification code are required." },
        { status: 400 }
      );
    }

    if (!email.includes("@")) {
      email = `${email}@srmist.edu.in`;
    }

    // Look up token in database
    const verification = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token: code,
      },
    });

    if (!verification) {
      return NextResponse.json(
        { success: false, error: "Invalid verification code. Please check your code or request a new one." },
        { status: 400 }
      );
    }

    // Check expiry
    if (new Date() > verification.expires) {
      // Clean up expired token
      await prisma.verificationToken.deleteMany({
        where: { identifier: email },
      });

      return NextResponse.json(
        { success: false, error: "This verification code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    // Token is valid! Remove token (one-time use)
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    // Find or auto-provision student account
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Derive student name and registration number from email
      const prefix = email.split("@")[0];
      const nameParts = prefix.split(".").map(
        (part: string) => part.charAt(0).toUpperCase() + part.slice(1)
      );
      const studentName = nameParts.join(" ") || "SRM Student";

      // Generate realistic SRM Registration Number
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const generatedStudentId = `RA241100301${randomDigits}`;

      const campus = await prisma.campus.findFirst({
        where: { code: "SRM-RMP" },
      });

      user = await prisma.user.create({
        data: {
          email,
          name: studentName,
          studentId: generatedStudentId,
          role: "STUDENT",
          campusId: campus?.id ?? null,
          department: "Computer Science and Engineering",
          yearOfStudy: 3,
        },
      });
      console.log(`[Auth] Auto-provisioned verified student account: ${user.email} (${user.studentId})`);
    }

    // Set secure authentication cookies
    const cookieStore = await cookies();
    const isProduction = process.env.NODE_ENV === "production";

    cookieStore.set("campuspulse_user_id", user.id, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    cookieStore.set("campuspulse_role", user.role, {
      httpOnly: false,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    const redirectUrl = DASHBOARD_REDIRECTS[user.role] || "/student/dashboard";

    return NextResponse.json({
      success: true,
      message: "Successfully verified and signed in.",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        studentId: user.studentId,
      },
      role: user.role,
      redirectUrl,
    });
  } catch (error: any) {
    console.error("Failed to verify OTP:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to verify code." },
      { status: 500 }
    );
  }
}
