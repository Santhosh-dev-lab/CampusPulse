import { NextRequest, NextResponse } from "next/server";
import { getStorageAdapter } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") || formData.get("image");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { success: false, error: "No file provided in request." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = (file as any).name || "upload.png";
    const mimeType = file.type || "image/png";

    const storage = getStorageAdapter();
    const result = await storage.uploadFile(buffer, fileName, mimeType);

    return NextResponse.json({
      success: true,
      url: result.url,
      key: result.key,
      sizeBytes: result.sizeBytes,
      mimeType: result.mimeType,
    });
  } catch (error: any) {
    console.error("Upload failed:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "File upload failed." },
      { status: 400 }
    );
  }
}
