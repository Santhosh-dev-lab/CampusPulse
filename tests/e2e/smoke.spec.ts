import { test, expect } from "@playwright/test";

test.describe("CampusPulse E2E Smoke Tests", () => {
  test("home page loads and displays brand, hero, and events", async ({ page }) => {
    await page.goto("/");

    // Verify brand heading
    await expect(page).toHaveTitle(/CampusPulse/);

    // Verify SRM brand presence
    await expect(page.getByText("CampusPulse").first()).toBeVisible();
    await expect(page.getByText(/SRM University/i).first()).toBeVisible();

    // Verify Upcoming Events section
    await expect(page.getByText("Upcoming Events")).toBeVisible();
  });
});
