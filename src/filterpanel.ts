import type { Page } from "playwright";
import { join } from "path";
import { vahanDashboardUrl } from "./config.ts";

export async function openFilterLayoutPanel(page: Page) {
  const openButton = page.locator("div[id=filterLayout-toggler]");

  const isOpen = await openButton.getAttribute("title");
  if (typeof isOpen === "string" && isOpen === "Open") {
    await openButton.click();
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
    await erickshawWithCart.setChecked(true);
    await erickshawWithPassanger.setChecked(true);
  }
  if (selectThreeWheelersFilter) {
    await threeWheelerPassanger.setChecked(true);
    await threeWheelerGoods.setChecked(true);
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
