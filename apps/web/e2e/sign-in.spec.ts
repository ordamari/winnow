import { expect, test } from "@playwright/test";

test("magic link sign-in finishes onboarding and opens the builder", async ({
  page,
  request,
}) => {
  const email = `e2e-${Date.now()}@winnow.test`;

  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Email me a link" }).click();
  await expect(page.getByText("Check your email")).toBeVisible();

  let link = "";
  await expect
    .poll(async () => {
      const response = await request.get(
        `/api/test/magic-link?email=${encodeURIComponent(email)}`,
      );
      if (!response.ok()) return "";
      const body = (await response.json()) as { url?: string };
      link = body.url ?? "";
      return link;
    })
    .not.toBe("");

  await page.goto(link);
  await expect(page).toHaveURL(/\/onboarding$/);
  await page.getByLabel("Name").fill("E2E User");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL(/\/builder$/);
  await expect(page.getByText("Winnow", { exact: true }).first()).toBeVisible();
});
