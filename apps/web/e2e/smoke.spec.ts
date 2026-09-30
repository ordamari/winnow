import { expect, test } from "@playwright/test";

test("home redirects to the builder and shows the wordmark", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/builder$/);
  await expect(page.getByText("Winnow", { exact: true }).first()).toBeVisible();
});
