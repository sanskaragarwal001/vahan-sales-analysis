import type { Page } from "playwright";
import { fetchVahanSalesData } from "./fetchsales";

import {
  getAllCombobox,
  getComboboxItemsIds,
  selectaxisVarComboboxItem,
  selectCombobxItem,
} from "./combobox";
import {
  downloadExcelData,
  fetchFilteredData,
  openFilterLayoutPanel,
  selectFilters,
} from "./filterpanel";
import { convertExcelSalesRecordIntoJson } from "./excel";
import type { Items } from "./types";

export async function getSalesRecord(
  page: Page,
  stateId: string,
  rtoId: string,
  yearId: string,
  erickshaw: boolean,
  threeWheeler: boolean,
) {
  const comboboxIds = await getAllCombobox(page);

  await selectCombobxItem(page, comboboxIds.stateComboboxId, stateId);
  await selectCombobxItem(page, comboboxIds.rtoComboboxId, rtoId);
  await selectaxisVarComboboxItem(page, comboboxIds.yaxisComboboxId);
  await selectaxisVarComboboxItem(page, comboboxIds.xaxisComboboxId);
  await selectCombobxItem(page, comboboxIds.selectedYearCombobxId, yearId);

  await fetchVahanSalesData(page);
  await openFilterLayoutPanel(page);

  await selectFilters(page, erickshaw, threeWheeler);
  await fetchFilteredData(page);

  await downloadExcelData(page);
  return await convertExcelSalesRecordIntoJson();
}

export async function getAllStates(page: Page): Promise<Items[]> {
  const comboboxIds = await getAllCombobox(page);

  return await getComboboxItemsIds(page, comboboxIds.stateComboboxId);
}

export async function getAllRtos(
  page: Page,
  stateId: string | undefined = undefined,
): Promise<Items[]> {
  const comboboxIds = await getAllCombobox(page);

  if (typeof stateId === "string") {
    await selectCombobxItem(page, comboboxIds.stateComboboxId, stateId);
  }

  return await getComboboxItemsIds(page, comboboxIds.rtoComboboxId);
}
