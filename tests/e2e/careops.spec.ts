import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test.beforeEach(async ({ page }) => {
  await page.goto("/settings");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});
test("all primary routes render through createBrowserRouter", async ({
  page,
}) => {
  await page.goto("/settings");
  await page.getByLabel("Current role").click();
  await page
    .getByRole("option", { name: "Administrator", exact: true })
    .click();
  for (const route of [
    "/",
    "/patients",
    "/referrals",
    "/waiting-list",
    "/appointments",
    "/patient-flow",
    "/medication",
    "/safety-analytics",
    "/copilot",
    "/ai-insights",
    "/population",
    "/portal",
    "/integrations",
    "/settings",
  ]) {
    await page.goto(route);
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`${route === "/" ? "/$" : route}`));
  }
});
test("referral approval creates waiting-list continuity", async ({ page }) => {
  await page.goto("/referrals");
  await page.getByRole("button", { name: "Review" }).first().click();
  await page.getByRole("button", { name: /Analyze/ }).click();
  await expect(page.getByText("AI specialty")).toBeVisible({ timeout: 3000 });
  await page.getByRole("button", { name: "Approve" }).click();
  await page.goto("/waiting-list");
  await expect(page.getByText("Amina Rahman")).toBeVisible();
});
test("human referral override reaches the waiting list", async ({ page }) => {
  await page.goto("/referrals");
  await page.getByRole("button", { name: "Review" }).first().click();
  await page.getByRole("button", { name: /Analyze/ }).click();
  await expect(page.getByText("AI specialty")).toBeVisible({ timeout: 3000 });
  await page.getByRole("button", { name: "Modify" }).click();
  await page.getByLabel("Service").click();
  await page.getByRole("option", { name: "Cardiology", exact: true }).click();
  await page
    .getByLabel("Missing information (comma separated)")
    .fill("Recent ECG");
  await page
    .getByRole("button", { name: "Save staff decision", exact: true })
    .click();
  await page.getByRole("button", { name: "Approve", exact: true }).click();
  await page.goto("/waiting-list");
  const row = page.locator("tbody tr").filter({ hasText: "Amina Rahman" });
  await expect(row).toContainText("Cardiology");
  await expect(row).toContainText("Recent ECG");
});
test("patient creation validates and persists", async ({ page }) => {
  await page.goto("/patients");
  await page.getByRole("button", { name: /Add Patient/ }).click();
  await page.getByLabel("First name").fill("Nadia");
  await page.getByLabel("Last name").fill("Hussain");
  await page.getByLabel("Date of birth").fill("1990-04-12");
  await page.getByLabel("Phone", { exact: true }).fill("07000 123456");
  await page
    .getByRole("textbox", { name: "Email", exact: true })
    .fill("nadia@example.demo");
  await page.getByRole("button", { name: "Add patient", exact: true }).click();
  await expect(page.getByText("Nadia Hussain", { exact: true })).toBeVisible();
});
test("critical accessibility scan has no serious violations", async ({
  page,
}) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(
    results.violations.filter((v) =>
      ["critical", "serious"].includes(v.impact || ""),
    ),
  ).toEqual([]);
});
test("discharge workflow resolves blockers and releases patient", async ({
  page,
}) => {
  await page.goto("/patient-flow");
  await page.getByRole("button", { name: "Discharge", exact: true }).click();
  const card = page.locator("section.card").filter({ hasText: "James Sutton" });
  for (const dropdown of await card
    .locator(".checklist .custom-select-trigger")
    .all()) {
    await dropdown.click();
    await page.getByRole("option", { name: "Complete", exact: true }).click();
  }
  await card.getByRole("button", { name: "Discharge patient" }).click();
  await expect(card).toHaveCount(0);
});
test("safety officer can report and review an ADR", async ({ page }) => {
  await page.goto("/settings");
  await page.getByLabel("Current role").click();
  await page
    .getByRole("option", { name: "Safety Officer", exact: true })
    .click();
  await page.goto("/medication");
  await expect(page.locator("tbody tr").first()).toBeVisible();
  const recordsBefore = await page.locator("tbody tr").count();
  await page.getByRole("button", { name: "Report ADR" }).click();
  await page.getByRole("button", { name: /Analyze/ }).click();
  await expect(
    page.getByText("Review and edit every extracted field"),
  ).toBeVisible();
  await expect(page.locator("tbody tr")).toHaveCount(recordsBefore);
  await page.getByRole("button", { name: /Confirm & submit/ }).click();
  await expect(page.locator("tbody tr")).toHaveCount(recordsBefore + 1);
  await expect(page.getByText("Adverse Drug Reaction").first()).toBeVisible();
});
test("non-scheduler cannot open booking by double-click", async ({ page }) => {
  await page.goto("/settings");
  await page.getByLabel("Current role").click();
  await page.getByRole("option", { name: "Nurse", exact: true }).click();
  await page.goto("/appointments");
  await page.locator(".calrow > div").first().dblclick();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
test("portal reschedule Cancel closes the modal", async ({ page }) => {
  await page.goto("/settings");
  await page.getByLabel("Current role").click();
  await page.getByRole("option", { name: "Patient", exact: true }).click();
  await page.goto("/portal");
  await page.getByRole("button", { name: "Book appointment" }).click();
  await page
    .getByRole("button", { name: "Save appointment", exact: true })
    .click();
  await page.getByRole("button", { name: "Reschedule" }).first().click();
  const dialog = page.getByRole("dialog", { name: "Reschedule appointment" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
test("modal supports Escape and returns focus", async ({ page }) => {
  await page.goto("/patients");
  const trigger = page.getByRole("button", { name: /Add Patient/ });
  await trigger.click();
  await expect(page.getByRole("dialog", { name: "Add patient" })).toBeVisible();
  const modalA11y = await new AxeBuilder({ page })
    .include("[role=dialog]")
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(
    modalA11y.violations.filter((violation) =>
      ["critical", "serious"].includes(violation.impact || ""),
    ),
  ).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
});
test("responsive layouts render at portfolio target widths", async ({
  page,
}) => {
  for (const target of [
    { width: 1440, height: 900, path: "/" },
    { width: 1280, height: 800, path: "/" },
    { width: 834, height: 1194, path: "/portal" },
    { width: 390, height: 844, path: "/portal" },
  ]) {
    await page.setViewportSize({ width: target.width, height: target.height });
    await page.goto(target.path);
    await expect(page.locator("h1").first()).toBeVisible();
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth + 2,
      ),
      `viewport ${target.width} on ${target.path}`,
    ).toBe(true);
  }
});
