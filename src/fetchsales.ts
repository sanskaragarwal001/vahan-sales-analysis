import type { Page } from "playwright";
import { vahanDashboardUrl } from "./config.ts";

export async function fetchVahanSalesData(page: Page) {
  const refreshButton = page.locator("div[class=button-section] > button");

  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes(vahanDashboardUrl) &&
      response.status() === 200 &&
      response.request().method() === "POST",
  );

  await refreshButton.click();
  await responsePromise;

  // 👇 wait for DOM update based on that HTML
  await page.locator("div[id=combTablePnl]").waitFor();
}
