import { NextRequest, NextResponse } from "next/server";
import { getPosterExtractionProvider } from "@/server/services/ai-poster.service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let buffer: Buffer;
    let mimeType = "image/png";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("poster") || formData.get("file");

      if (!file || !(file instanceof Blob)) {
        return NextResponse.json(
          { success: false, error: "Please upload an image file (field 'poster' or 'file')." },
          { status: 400 }
        );
      }

      mimeType = file.type || "image/png";
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      const body = await request.json().catch(() => ({}));
      if (body.imageBase64) {
        const base64Data = body.imageBase64.replace(/^data:image\/\w+;base64,/, "");
        buffer = Buffer.from(base64Data, "base64");
        mimeType = body.mimeType || "image/png";
      } else {
        // Fallback buffer for demo extraction
        buffer = Buffer.from("mock-poster-image");
      }
    }

    const provider = getPosterExtractionProvider();
    const extractedDraft = await provider.extractFromPoster(buffer, mimeType);

    return NextResponse.json({
      success: true,
      draft: extractedDraft,
      message: "Poster successfully analyzed by CampusPulse AI.",
    });
  } catch (error: any) {
    console.error("Poster extraction error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to extract event draft from poster." },
      { status: 500 }
    );
  }
}
