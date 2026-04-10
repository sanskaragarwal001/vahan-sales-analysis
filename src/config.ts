import type { LaunchOptions } from "playwright";

export const vahanDashboardUrl =
  "https://vahan.parivahan.gov.in/vahan4dashboard/vahan/view/reportview.xhtml";

export const browserLauchOptions: LaunchOptions = {
  headless: true,
  slowMo: 200,
  args: [],
};

export const newPageOptions = {
  acceptDownloads: true,
};
