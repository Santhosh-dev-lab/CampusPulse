import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/security/auth-context";
import { performCheckIn } from "@/server/services/checkin.service";
import { AppError } from "@/lib/errors/app-error";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const body = await request.json();

    const { ticketToken, checkInMethod = "QR_SCAN", notes } = body;

    if (!ticketToken || typeof ticketToken !== "string") {
      return NextResponse.json(
        { success: false, error: "Valid ticket token is required." },
        { status: 400 }
      );
    }

    const result = await performCheckIn({
      ticketToken: ticketToken.trim(),
      staffUserId: user.id,
      checkInMethod,
      notes,
    });

    return NextResponse.json({
      success: true,
      message: `Verified and checked in: ${result.attendeeName || "Student"}`,
      ...result,
    });
  } catch (error: any) {
    console.error("Check-in error:", error);

    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          errorCode: error.code,
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal server error during check-in.",
      },
      { status: 500 }
    );
  }
}
