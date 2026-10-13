import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, getAvailableDevUsers } from "@/lib/security/auth-context";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const availableUsers = await getAvailableDevUsers();

    return NextResponse.json({
      success: true,
      user,
      availableUsers,
    });
  } catch (error) {
    console.error("Failed to get current user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get current user" },
      { status: 500 }
    );
  }
}
