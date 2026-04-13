import type { Locator, Page } from "playwright";
import { join } from "path";
import { vahanDashboardUrl } from "./config.ts";

export async function openFilterLayoutPanel(page: Page) {
  const openButton = page.locator("div[id=filterLayout-toggler]");

  const isOpen = await openButton.getAttribute("title");
  if (typeof isOpen === "string" && isOpen === "Open") {
    await openButton.click();
  }
}

async function attemptSetChecked(locator: Locator) {
  try {
    // Check if the element is visible and enabled before attempting to check
    await locator.waitFor({ state: "visible", timeout: 5000 });
    await locator.check(); // Use check() or click() if setChecked() fails or is flaky
  } catch (error) {
    console.warn("Could not set check state for a filter, proceeding:", error);
    throw error;
  }
}

export async function selectFilters(
  page: Page,
  selectErickshawFilters: boolean,
  selectThreeWheelersFilter: boolean,
) {
  const erickshawWithCart = page.locator('label[for="VhClass:36"]');
  const erickshawWithPassanger = page.locator('label[for="VhClass:37"]');
  const threeWheelerPassanger = page.locator('label[for="VhClass:39"]');
  const threeWheelerGoods = page.locator('label[for="VhClass:40"]');

  if (selectErickshawFilters) {
    await attemptSetChecked(erickshawWithCart);
    await attemptSetChecked(erickshawWithPassanger);
  }
  if (selectThreeWheelersFilter) {
    await attemptSetChecked(threeWheelerPassanger);
    await attemptSetChecked(threeWheelerGoods);
  }
}

export async function fetchFilteredData(page: Page) {
  const refreshButton = page.locator('div[id="filterLayout"] button').first();

  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes(vahanDashboardUrl) &&
      response.status() === 200 &&
      response.request().method() === "POST",
  );
  await refreshButton.click();
  await responsePromise;
}

export async function downloadExcelData(page: Page) {
  const downloadPromise = page.waitForEvent("download");
  const downloadButton = page.locator('a[id="groupingTable:xls"]');

  await downloadButton.click();
  const download = await downloadPromise;

  const filePath = join(
    process.cwd(),
    "downloads",
    download.suggestedFilename(),
  );

  // Wait for the download process to complete and save the downloaded file somewhere.
  await download.saveAs(filePath);
}
