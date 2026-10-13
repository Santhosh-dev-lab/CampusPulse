import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/security/auth-context";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        campus: true,
        clubMemberships: {
          include: { club: true },
        },
      },
    });

    if (!fullUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: fullUser.id,
        name: fullUser.name,
        email: fullUser.email,
        role: fullUser.role,
        studentId: fullUser.studentId,
        department: fullUser.department,
        campusCode: fullUser.campus?.code ?? "SRM-RMP",
        campusName: fullUser.campus?.name,
        club: fullUser.clubMemberships[0]?.club
          ? {
              id: fullUser.clubMemberships[0].club.id,
              name: fullUser.clubMemberships[0].club.name,
              category: fullUser.clubMemberships[0].club.category,
              role: fullUser.clubMemberships[0].role,
            }
          : null,
      },
    });
  } catch (error: any) {
    console.error("Auth me error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to query current user" },
      { status: 500 }
    );
  }
}
