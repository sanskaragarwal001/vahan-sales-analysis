import http from "http";
import { URL } from "url";

import { BrowserManager } from "./browser.ts";
import { getSalesRecord, getAllStates, getAllRtos } from "./index.ts";
import { vahanDashboardUrl } from "./config.ts";
import { getAllCombobox } from "./combobox.ts";

async function startBrowserAndNaviagateToVahanDashboard() {
  await BrowserManager.initializeBrowser();

  const page = await BrowserManager.getNewPage();
  await page.goto(vahanDashboardUrl, { waitUntil: "networkidle" });

  const comboboxIds = await getAllCombobox(page);
  for (const id of Object.values(comboboxIds).reverse()) {
    const locator = page.locator(`div[id=${id}]`);
    await locator.click();
  }

  return page;
}

const page = await startBrowserAndNaviagateToVahanDashboard();

// --- Helper Functions ---
const sendJSON = (res, status, data) => {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
};

const getBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
  });
};

// --- Server Logic ---
const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const path = parsedUrl.pathname;
  const method = req.method;

  // CORS Headers (To allow your SolidJS frontend to connect)
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
      const body = await getBody(req);
      const { stateId } = body;
      // if (!stateId) return sendJSON(res, 400, { error: "stateId is required" });

      const rtoList = await getAllRtos(page, stateId);
      return sendJSON(res, 200, rtoList);
    }

    // 4. Get Sales Records (POST)
    if (path === "/api/sales" && method === "POST") {
      const body = await getBody(req);
      const { stateId, rtoId, yearId, includeErickshaw, includeThreeWheeler } =
        body;

      // Strict validation
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

    // 404 Fallback
    sendJSON(res, 404, { error: "Endpoint not found" });
  } catch (err) {
    console.error(err);
    sendJSON(res, 500, { error: "Internal Server Error" });
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Vehicle Data Server running at http://localhost:${PORT}`);
});
