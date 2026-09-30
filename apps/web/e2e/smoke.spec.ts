import { expect, test } from "@playwright/test";

test("signed-out visitors land on sign-in", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await expect(page.getByText("Winnow", { exact: true }).first()).toBeVisible();
});
