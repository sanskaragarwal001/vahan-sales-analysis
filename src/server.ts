import http, { IncomingMessage, ServerResponse } from "http";
import { URL } from "url";
import { BrowserManager } from "./browser.ts";
import { getSalesRecord, getAllStates, getAllRtos } from "./index.ts";
import { vahanDashboardUrl } from "./config.ts";
import { getAllCombobox } from "./combobox.ts";
import type { Page } from "playwright";

// --- Types ---
interface SalesRequestBody {
  stateId: string;
  rtoId: string;
  yearId: string;
  includeErickshaw: boolean;
  includeThreeWheeler: boolean;
}

interface RtoRequestBody {
  stateId: string;
}

// --- Browser Setup & Recovery ---
let page: Page;

async function setupPage(targetPage: Page): Promise<void> {
  await targetPage.goto(vahanDashboardUrl, { waitUntil: "networkidle" });

  const comboboxIds = await getAllCombobox(targetPage);
  for (const id of Object.values(comboboxIds).reverse()) {
    const locator = targetPage.locator(`div[id=${id}]`);
    await locator.click();
  }
}

async function startBrowserAndNavigate() {
  await BrowserManager.initializeBrowser();
  page = await BrowserManager.getNewPage();
  await setupPage(page);
  return page;
}

/**
 * Handles error recovery by refreshing the page and re-clicking comboboxes
 */
async function recoverPage() {
  console.log(
    "⚠️ Error detected. Refreshing page and re-initializing UI components...",
  );
  try {
    await page.reload({ waitUntil: "networkidle" });
    await setupPage(page);
    console.log("✅ Recovery successful.");
  } catch (recoveryError) {
    await BrowserManager.closeBrowser();
    server.close();
    console.error("❌ Fatal: Failed to recover browser state.", recoveryError);
  }
}

// --- Helper Functions ---
const sendJSON = (res: ServerResponse, status: number, data: any) => {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
};

const getBody = <T>(req: IncomingMessage): Promise<T> => {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : ({} as T));
      } catch (e) {
        reject(e);
      }
    });
  });
};

// --- Initial Launch ---
await startBrowserAndNavigate();

// --- Server Logic ---
const server = http.createServer(
  async (req: IncomingMessage, res: ServerResponse) => {
    const host = req.headers.host || "localhost";
    const parsedUrl = new URL(req.url || "/", `http://${host}`);
    const path = parsedUrl.pathname;
    const method = req.method;

    // CORS Headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    try {
      // 1. Health Check
      if (path === "/health" && method === "GET") {
        return sendJSON(res, 200, { status: "OK", timestamp: new Date() });
      }

      // 2. Get All States
      if (path === "/api/states" && method === "GET") {
        const stateList = await getAllStates(page);
        return sendJSON(res, 200, stateList);
      }

      // 3. Get RTOs by State ID
      if (path === "/api/rtos" && method === "POST") {
        const body = await getBody<RtoRequestBody>(req);
        const { stateId } = body;
        if (!stateId)
          return sendJSON(res, 400, { error: "stateId is required" });

        const rtoList = await getAllRtos(page, stateId);
        return sendJSON(res, 200, rtoList);
      }

      // 4. Get Sales Records
      if (path === "/api/sales" && method === "POST") {
        const body = await getBody<SalesRequestBody>(req);
        const {
          stateId,
          rtoId,
          yearId,
          includeErickshaw,
          includeThreeWheeler,
        } = body;

        if (
          !stateId ||
          !rtoId ||
          !yearId ||
          includeErickshaw === undefined ||
          includeThreeWheeler === undefined
        ) {
          return sendJSON(res, 400, { error: "All fields are necessary" });
        }

        const salesRecord = await getSalesRecord(
          page,
          stateId,
          rtoId,
          yearId,
          includeErickshaw,
          includeThreeWheeler,
        );

        return sendJSON(res, 200, salesRecord);
      }

      sendJSON(res, 404, { error: "Endpoint not found" });
    } catch (err) {
      console.error("🚨 Request Error:", err);

      // Trigger the recovery mechanism
      await recoverPage();

      sendJSON(res, 500, {
        error: "Internal Server Error",
        message:
          "The page has been refreshed due to an error. Please retry your request.",
      });
    }
  },
);

const PORT = 3000;
server.listen(PORT, () => {
  console.log(
    `🚀 Vehicle Data Server (TS) running at http://localhost:${PORT}`,
  );
});
