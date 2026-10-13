import { describe, it, expect } from "vitest";
import { z } from "zod";

describe("Environment Configuration & Validation", () => {
  const schema = z
    .object({
      NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
      DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
      AUTH_SECRET: z.string().min(16),
      DEV_AUTH_ENABLED: z
        .string()
        .optional()
        .transform((v) => v === "true"),
    })
    .refine((data) => !(data.NODE_ENV === "production" && data.DEV_AUTH_ENABLED === true), {
      message: "DEV_AUTH_ENABLED cannot be true in production",
    });

  it("accepts valid local development configuration", () => {
    const valid = {
      NODE_ENV: "development",
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/campuspulse",
      AUTH_SECRET: "secure_local_dev_secret_key_32_characters",
      DEV_AUTH_ENABLED: "true",
    };
    const result = schema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects configuration missing DATABASE_URL", () => {
    const invalid = {
      NODE_ENV: "development",
      DATABASE_URL: "",
      AUTH_SECRET: "secure_local_dev_secret_key_32_characters",
    };
    const result = schema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("strictly forbids mock authentication in production", () => {
    const productionWithMock = {
      NODE_ENV: "production",
      DATABASE_URL: "postgresql://prod-db:5432/campuspulse",
      AUTH_SECRET: "secure_production_secret_key_32_characters",
      DEV_AUTH_ENABLED: "true",
    };
    const result = schema.safeParse(productionWithMock);
    expect(result.success).toBe(false);
  });
});
