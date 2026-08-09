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

test("admin login form fields are visible", async ({ page }) => {
  await page.goto(`${siteUrl}/admin/login`);
  await expect(page.getByLabel(/email/i)).toBeVisible();
  await expect(page.getByLabel(/password/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /sign in|login/i })).toBeVisible();
});

test("admin login shows show/hide password button", async ({ page }) => {
  await page.goto(`${siteUrl}/admin/login`);
  const toggleBtn = page.getByRole("button", { name: /show password|hide password/i });
  await expect(toggleBtn).toBeVisible();

  const passwordInput = page.getByLabel(/password/i);
  await expect(passwordInput).toHaveAttribute("type", "password");

  await toggleBtn.click();
  await expect(passwordInput).toHaveAttribute("type", "text");
});

test("invalid admin login shows error message", async ({ page }) => {
  await page.goto(`${siteUrl}/admin/login`);
  await page.getByLabel(/email/i).fill("wrong@example.com");
  await page.getByLabel(/password/i).fill("wrongpassword");
  await page.getByRole("button", { name: /sign in|login/i }).click();
  await expect(page.locator("body")).toContainText(
    /invalid email or password|access denied|credentials/i,
    { timeout: 10_000 }
  );
});

test("admin login works for test admin", async ({ page }) => {
  test.skip(!adminEmail || !adminPassword, "Missing admin test credentials");

  await page.goto(`${siteUrl}/admin/login`);

  await page.getByLabel(/email/i).fill(adminEmail!);
  await page.getByLabel(/password/i).fill(adminPassword!);
  await page.getByRole("button", { name: /sign in|login/i }).click();

  await expect(page).toHaveURL(/\/admin/, { timeout: 15_000 });
  await expect(page.locator("body")).toContainText(/dashboard|orders|menu|admin/i);
});

test("admin dashboard shows key sections after login", async ({ page }) => {
  test.skip(!adminEmail || !adminPassword, "Missing admin test credentials");

  await page.goto(`${siteUrl}/admin/login`);
  await page.getByLabel(/email/i).fill(adminEmail!);
  await page.getByLabel(/password/i).fill(adminPassword!);
  await page.getByRole("button", { name: /sign in|login/i }).click();
  await page.waitForURL(/\/admin/, { timeout: 15_000 });

  await expect(page.locator("body")).toContainText(/dashboard|orders|menu/i);
});

test("unauthenticated user is redirected from /admin to login", async ({ page }) => {
  await page.goto(`${siteUrl}/admin`);
  await expect(page).toHaveURL(/\/admin\/login/, { timeout: 10_000 });
});

test("unauthenticated user is redirected from super-admin route to login", async ({ page }) => {
  await page.goto(`${siteUrl}/admin/users`);
  await expect(page).toHaveURL(/\/admin\/login/, { timeout: 10_000 });
});

