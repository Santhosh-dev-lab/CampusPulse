import { z } from "zod";

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
    APP_NAME: z.string().default("CampusPulse"),
    APP_TIMEZONE: z.string().default("Asia/Kolkata"),

    // Local PostgreSQL Database URL
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

    // Auth configuration
    AUTH_SECRET: z
      .string()
      .min(16, "AUTH_SECRET must be at least 16 characters")
      .default("campuspulse_default_development_secret_32chars_long"),
    AUTH_URL: z.string().url().optional(),
    DEV_AUTH_ENABLED: z
      .string()
      .optional()
      .transform((val) => val === "true" || val === "1"),

    // Optional OAuth credentials
    AUTH_GOOGLE_ID: z.string().optional(),
    AUTH_GOOGLE_SECRET: z.string().optional(),

    // File storage
    STORAGE_PROVIDER: z.enum(["local", "s3"]).default("local"),
    LOCAL_UPLOAD_DIR: z.string().default("./.local-storage/uploads"),
    MAX_UPLOAD_SIZE_MB: z
      .string()
      .default("5")
      .transform((val) => parseInt(val, 10)),

    // Optional S3 credentials
    S3_REGION: z.string().optional(),
    S3_BUCKET: z.string().optional(),
    S3_ACCESS_KEY_ID: z.string().optional(),
    S3_SECRET_ACCESS_KEY: z.string().optional(),
    S3_ENDPOINT: z.string().optional(),

    // Optional AI extraction
    AI_PROVIDER: z.enum(["mock", "gemini", "openai"]).default("mock"),
    AI_API_KEY: z.string().optional(),
    AI_MODEL: z.string().optional(),

    // Optional email provider
    EMAIL_PROVIDER: z.enum(["console", "smtp", "sendgrid"]).default("console"),
    EMAIL_FROM: z.string().default("notifications@campuspulse.srmist.edu.in"),

    // Logging & Rate Limiting
    LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
    RATE_LIMIT_ENABLED: z
      .string()
      .optional()
      .transform((val) => val === "true" || val === "1"),
  })
  .refine(
    (data) => {
      // In production, DEV_AUTH_ENABLED must never be true
      if (data.NODE_ENV === "production" && data.DEV_AUTH_ENABLED === true) {
        return false;
      }
      return true;
    },
    {
      message: "DEV_AUTH_ENABLED cannot be enabled in production environment for security.",
      path: ["DEV_AUTH_ENABLED"],
    }
  );

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errorDetails = result.error.errors.map((e) => {
      return `  - ${e.path.join(".")}: ${e.message}`;
    });

    const errorMessage = [
      "============================================================",
      "❌ CRITICAL CONFIGURATION ERROR: Invalid environment variables",
      "============================================================",
      "The following environment variables failed validation:",
      ...errorDetails,
      "",
      "👉 Please check your `.env.local` or `.env` file against `.env.example`.",
      "   Ensure all required variables are set correctly without syntax errors.",
      "============================================================",
    ].join("\n");

    console.error(errorMessage);
    if (process.env.NODE_ENV !== "test") {
      throw new Error("Invalid application environment configuration.");
    }
    // In test environment, return a fallback with defaults
    return envSchema.parse({
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/campuspulse_test",
      AUTH_SECRET: "campuspulse_test_secret_for_unit_tests_only_32_chars",
    });
  }

  return result.data;
}

export const env = validateEnv();
