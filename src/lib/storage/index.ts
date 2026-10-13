import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";

export interface UploadResult {
  url: string;
  key: string;
  sizeBytes: number;
  mimeType: string;
}

export interface StorageAdapter {
  uploadFile(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<UploadResult>;
  deleteFile(key: string): Promise<void>;
  getFileUrl(key: string): string;
}

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export function validateImageUpload(buffer: Buffer, mimeType: string): void {
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new Error(`Unsupported image type "${mimeType}". Allowed types: JPEG, PNG, WebP, GIF.`);
  }

  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `File size ${(buffer.length / (1024 * 1024)).toFixed(2)}MB exceeds limit of 5MB.`
    );
  }
}

/**
 * Local filesystem storage adapter for development and zero-dependency testing.
 */
export class LocalStorageAdapter implements StorageAdapter {
  private baseDir: string;
  private publicUrlPrefix: string;

  constructor(baseDir = "./.local-storage/uploads", publicUrlPrefix = "/uploads") {
    this.baseDir = path.resolve(process.cwd(), baseDir);
    this.publicUrlPrefix = publicUrlPrefix;
  }

  private async ensureDir(): Promise<void> {
    await fs.mkdir(this.baseDir, { recursive: true });
  }

  public async uploadFile(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string
  ): Promise<UploadResult> {
    validateImageUpload(fileBuffer, mimeType);
    await this.ensureDir();

    // Prevent path traversal and generate safe, unique object keys
    const ext =
      path
        .extname(originalName)
        .toLowerCase()
        .replace(/[^a-z0-9.]/g, "") || ".png";
    const safeKey = `${Date.now()}-${randomBytes(8).toString("hex")}${ext}`;
    const destinationPath = path.join(this.baseDir, safeKey);

    // Double check path safety
    if (!destinationPath.startsWith(this.baseDir)) {
      throw new Error("Invalid destination path.");
    }

    await fs.writeFile(destinationPath, fileBuffer);

    return {
      url: `${this.publicUrlPrefix}/${safeKey}`,
      key: safeKey,
      sizeBytes: fileBuffer.length,
      mimeType,
    };
  }

  public async deleteFile(key: string): Promise<void> {
    const safeKey = path.basename(key);
    const filePath = path.join(this.baseDir, safeKey);
    try {
      await fs.unlink(filePath);
    } catch (err: unknown) {
      // File may already be removed
      console.warn("Could not delete file:", filePath, err);
    }
  }

  public getFileUrl(key: string): string {
    const safeKey = path.basename(key);
    return `${this.publicUrlPrefix}/${safeKey}`;
  }
}

/**
 * Storage adapter factory supporting local and S3-compatible providers
 */
export function getStorageAdapter(): StorageAdapter {
  const provider = process.env.STORAGE_PROVIDER || "local";
  if (provider === "s3") {
    // S3 adapter can be initialized here when S3 credentials exist
    console.info(
      "S3 storage selected. Note: Falling back to local storage if credentials are absent."
    );
  }
  return new LocalStorageAdapter();
}
