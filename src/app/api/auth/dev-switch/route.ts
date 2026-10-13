import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, role } = body;

    let targetUser = null;
    if (userId) {
      targetUser = await prisma.user.findUnique({
        where: { id: userId },
      });
    } else if (role) {
      targetUser = await prisma.user.findFirst({
        where: { role: role.toUpperCase() as UserRole },
      });
    }

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "Target user not found" },
        { status: 404 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
      },
      message: `Active dev role switched to ${targetUser.role} (${targetUser.name})`,
    });

    response.cookies.set("campuspulse_user_id", targetUser.id, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error: any) {
    console.error("Error switching dev user:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to switch user" },
      { status: 500 }
    );
  }
}
