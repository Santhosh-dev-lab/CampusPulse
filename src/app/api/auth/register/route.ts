import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { UserRole, ClubRole } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      role = "STUDENT",
      studentId,
      department,
      campusCode = "SRM-RMP",
      clubName,
      clubCategory = "Technical",
      clubDescription,
    } = body;

    if (!email || !name) {
      return NextResponse.json(
        { success: false, error: "Name and institutional email are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists. Please sign in." },
        { status: 409 }
      );
    }

    // Resolve Campus
    let campus = await prisma.campus.findUnique({
      where: { code: campusCode },
    });
    if (!campus) {
      campus = await prisma.campus.findFirst();
    }
    if (!campus) {
      campus = await prisma.campus.create({
        data: {
          name: "SRM IST, Ramapuram Campus",
          code: "SRM-RMP",
          city: "Ramapuram, Chennai",
          state: "Tamil Nadu",
          country: "India",
        },
      });
    }

    const resolvedRole = (role.toUpperCase() in UserRole)
      ? (role.toUpperCase() as UserRole)
      : UserRole.STUDENT;

    // Create User inside transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: name.trim(),
          email: cleanEmail,
          role: resolvedRole,
          studentId: studentId ? studentId.trim().toUpperCase() : null,
          department: department ? department.trim() : null,
          campusId: campus.id,
        },
      });

      // If registered as an Organizer / Club, create club if provided
      if (resolvedRole === UserRole.ORGANIZER && clubName) {
        const slug = `${clubName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}-${Date.now().toString(36)}`;
        const club = await tx.club.create({
          data: {
            name: clubName.trim(),
            slug,
            description: clubDescription?.trim() || `${clubName} student organization at SRM IST.`,
            category: clubCategory,
            campusId: campus.id,
          },
        });

        await tx.clubMembership.create({
          data: {
            clubId: club.id,
            userId: newUser.id,
            role: ClubRole.PRESIDENT,
          },
        });
      }

      return newUser;
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        department: user.department,
        campusCode: campus.code,
      },
      message: `Account created successfully for ${user.name}!`,
    });

    response.cookies.set("campuspulse_user_id", user.id, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });

    response.cookies.set("campuspulse_role", user.role, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error: any) {
    console.error("Registration API error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create account." },
      { status: 500 }
    );
  }
}
