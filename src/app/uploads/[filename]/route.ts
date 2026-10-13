import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ filename: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { filename } = await params;
    const safeFilename = path.basename(filename);
    const filePath = path.resolve(process.cwd(), ".local-storage", "uploads", safeFilename);

    const buffer = await fs.readFile(filePath);

    const ext = path.extname(safeFilename).toLowerCase();
    let contentType = "image/png";
    if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".webp") contentType = "image/webp";
    else if (ext === ".gif") contentType = "image/gif";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    return new NextResponse("File not found", { status: 404 });
  }
}
