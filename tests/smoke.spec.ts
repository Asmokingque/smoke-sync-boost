import { test, expect } from "@playwright/test";

const siteUrl = process.env.SITE_URL || "http://localhost:5173";
const adminEmail = process.env.ADMIN_TEST_EMAIL;
const adminPassword = process.env.ADMIN_TEST_PASSWORD;

test("homepage loads", async ({ page }) => {
  await page.goto(siteUrl);
  await expect(page.locator("body")).toContainText(/Anderson|Smoking|Que|BBQ|Smoked/i);
});

test("menu page loads", async ({ page }) => {
  await page.goto(`${siteUrl}/menu`);
  await expect(page.locator("body")).toContainText(/menu|brisket|ribs|bbq|order/i);
});

test("admin login page loads", async ({ page }) => {
  await page.goto(`${siteUrl}/admin/login`);
  await expect(page.locator("body")).toContainText(/admin|login|sign in|authorized/i);
});

test("admin login works for test admin", async ({ page }) => {
  test.skip(!adminEmail || !adminPassword, "Missing admin test credentials");

  await page.goto(`${siteUrl}/admin/login`);

  await page.getByLabel(/email/i).fill(adminEmail!);
  await page.getByLabel(/password/i).fill(adminPassword!);
  await page.getByRole("button", { name: /login|sign in/i }).click();

  await expect(page).toHaveURL(/\/admin/);
  await expect(page.locator("body")).toContainText(/dashboard|orders|menu|admin/i);
});
