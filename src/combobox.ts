import type { Page, Locator } from "playwright";
import type { ComboboxIds } from "./types.ts";

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
