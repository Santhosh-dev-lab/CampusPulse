import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campusCode = searchParams.get("campus");

    const venues = await prisma.venue.findMany({
      where: campusCode
        ? {
            campus: {
              code: campusCode,
            },
          }
        : {},
      include: {
        campus: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        capacity: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      venues,
    });
  } catch (error: any) {
    console.error("Failed to fetch venues:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch venues" },
      { status: 500 }
    );
  }
}
