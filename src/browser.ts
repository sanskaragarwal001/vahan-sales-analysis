import { chromium } from "playwright";
import type { Browser, Page } from "playwright";

import { browserLauchOptions, newPageOptions } from "./config";

export class BrowserManager {
  private static browser: Browser | null = null;

  private constructor() {}

  public static async initializeBrowser(): Promise<void> {
    if (BrowserManager.browser) {
      return;
    }

    try {
      BrowserManager.browser = await chromium.launch(browserLauchOptions);
    } catch (error) {
      console.error("Browser initialization failed");
      throw error;
    }
  }

  public static async closeBrowser(): Promise<void> {
    if (BrowserManager.browser == null) {
      return;
    }

    try {
      await BrowserManager.browser.close();
      BrowserManager.browser = null;
    } catch (error) {
      console.error("Browser cannot be closed");
      throw error;
    }
  }

  public static async getNewPage(): Promise<Page> {
    if (BrowserManager.browser == null) {
      throw new Error("Browser not initialized");
    }

    try {
      return await BrowserManager.browser.newPage(newPageOptions);
    } catch (error) {
      console.error("Error creating new page");
      throw error;
    }
  }
}
