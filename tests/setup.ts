import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock process environment variables for deterministic unit testing
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/campuspulse_test";
}
process.env.AUTH_SECRET = process.env.AUTH_SECRET || "test_super_secret_key_32_characters_long_min";
process.env.STORAGE_PROVIDER = "local";
process.env.AI_PROVIDER = "mock";
