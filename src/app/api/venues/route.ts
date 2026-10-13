import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { jsonResponse, handleApiError } from "@/lib/errors/app-error";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campusCode = searchParams.get("campusCode");

    const campuses = await prisma.campus.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        city: true,
        venues: {
          select: {
            id: true,
            name: true,
            code: true,
            building: true,
            capacity: true,
            isIndoor: true,
            facilities: true,
          },
          orderBy: {
            capacity: "desc",
          },
        },
      },
      where: campusCode ? { code: campusCode } : undefined,
      orderBy: {
        code: "asc",
      },
    });

    return jsonResponse({ campuses });
  } catch (error) {
    return handleApiError(error);
  }
}
