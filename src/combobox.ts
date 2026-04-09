import type { Page, Locator } from "playwright";
import type { ComboboxIds } from "./types.ts";
import { vahanDashboardUrl } from "./config.ts";

export async function getAllCombobox(page: Page): Promise<ComboboxIds> {
  const comboboxIds = await page.locator("div[role='combobox']").all();

  const stateComboboxId = await getComboboxId(comboboxIds.at(1)!);
  const rtoComboboxId = await getComboboxId(comboboxIds.at(2)!);
  const yaxisComboboxId = await getComboboxId(comboboxIds.at(3)!);
  const xaxisComboboxId = await getComboboxId(comboboxIds.at(4)!);
  const selectedYearCombobxId = await getComboboxId(comboboxIds.at(6)!);

  return {
    stateComboboxId,
    rtoComboboxId,
    yaxisComboboxId,
    xaxisComboboxId,
    selectedYearCombobxId,
  };
}

export async function getComboboxItemsIds(
  page: Page,
  combobxId: string,
): Promise<string[]> {
  const combobox = page.locator(`div[id=${combobxId}]`);
  const comboboxItemsListId = await getComboboxItemsListId(combobox);
  const itemsLocator = await page
    .locator(`ul[id=${comboboxItemsListId}] > li`)
    .all();

  const ids: string[] = [];
  for (const locator of itemsLocator) {
    const id = await locator.getAttribute("id");
    ids.push(id as string);
  }

  return ids;
}

export async function selectCombobxItem(
  page: Page,
  comboboxId: string,
  itemId: string,
): Promise<string[] | void> {
  const combobox = page.locator(`div[id=${comboboxId}]`);

  const comboboxItemsListId = await getComboboxItemsListId(combobox);
  const comboboxItemListLocater = page.locator(`ul[id=${comboboxItemsListId}]`);
  if (await isItemSelected(comboboxItemListLocater, itemId)) {
    return;
  }

  const comboboxItem = comboboxItemListLocater.locator(`li[id=${itemId}]`);

  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes(vahanDashboardUrl) &&
      response.status() === 200 &&
      response.request().method() === "POST",
  );

  await comboboxItem.evaluate((el: HTMLLIElement) => el.click());
  await responsePromise;
}

export async function selectaxisVarComboboxItem(
  page: Page,
  comboboxId: string,
) {
  const combobox = page.locator(`div[id=${comboboxId}]`);

  const comboboxItemsListId = await getComboboxItemsListId(combobox);
  const comboboxItemListLocater = page.locator(`ul[id=${comboboxItemsListId}]`);
  if (await isVarSelected(comboboxItemListLocater, comboboxId)) {
    return;
  }

  const comboboxItem = comboboxItemListLocater.getByText(
    comboboxId[0]!.toLowerCase() === "x" ? "Month Wise" : "Maker",
    { exact: true },
  );

  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes(vahanDashboardUrl) &&
      response.status() === 200 &&
      response.request().method() === "POST",
  );

  await comboboxItem.evaluate((el: HTMLLIElement) => el.click());
  await responsePromise;
}

async function isItemSelected(
  combobox: Locator,
  itemId: string,
): Promise<boolean> {
  const ariaActiveDescendentId = await combobox.getAttribute(
    "aria-activedescendant",
  );
  return ariaActiveDescendentId === itemId;
}

async function isVarSelected(
  combobox: Locator,
  comboboxId: string,
): Promise<boolean> {
  const ariaActiveDescendentId = await combobox.getAttribute(
    "aria-activedescendant",
  );

  let itemId: string | null = null;
  if (comboboxId[0]!.toLowerCase() === "y") {
    const item = combobox.getByText("Maker", { exact: true });
    itemId = await item.getAttribute("id");
  } else {
    const item = combobox.getByText("Month Wise", { exact: true });
    itemId = await item.getAttribute("id");
  }
  return ariaActiveDescendentId === itemId;
}

async function getComboboxId(combobox: Locator): Promise<string> {
  if (!combobox) {
    throw new Error(
      "Error retrieving combobox ID. The combobox element is not available.",
    );
  }

  const id = (await combobox.getAttribute("id")) as string;
  return id;
}

async function getComboboxItemsListId(combobox: Locator): Promise<string> {
  if (!combobox) {
    throw new Error(
      "Error retrieving combobox Items List ID. The combobox element is not available.",
    );
  }

  const id = (await combobox.getAttribute("aria-owns")) as string;
  return id;
}
