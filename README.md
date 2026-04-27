# 🕵️‍♂️ Panther Vahan Analysis Server

The backend scraping engine for the **Panther Vahan Dashboard**. This server leverages **Playwright** to perform high-fidelity web scraping of vehicle registration data and serves it via a lightweight Node.js HTTP interface.

## 🛠️ Tech Stack

*   **Runtime:** [Node.js](https://nodejs.org/) (v24.0.0 or higher required)
*   **Scraping:** [Playwright](https://playwright.dev/) (Chromium)
*   **Server:** Node `http` module
*   **Execution:** [tsx](https://github.com/privatenumber/tsx) for seamless TypeScript execution

---

## 📋 Prerequisites

Before running the server, ensure you have the following installed:

1.  **Node.js v24+**: This project utilizes features available in the latest Node runtimes.
2.  **pnpm**: Recommended package manager.
3.  **Playwright Binaries**: The headless browser engines required for scraping.

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/sanskaragarwal001/vahan-sales-analysis.git
cd vahan-sales-analysis
pnpm install
```

### 2. Install Playwright Browsers
To enable web scraping, you must install the headless Chromium binary:
```bash
pnpm exec playwright install chromium
```

### 3. Start the Server
Run the following command to launch the TypeScript server:
```bash
pnpm start
```
*This command executes `tsx server.ts` internally.*

---

**Features:**
*   **Real-time Scraping:** Fetches data directly from source on request.
*   **JSON Output:** Returns structured data compatible with the Panther Vahan Frontend.
*   **Error Handling:** Provides meaningful status codes if the scraping process is blocked or fails.

---

## ⚠️ Requirements Note

> **Node.js Version:** This project is strictly configured for **Node 24 or above**. Using lower versions may result in unexpected behavior with the `http` module or TypeScript execution.

---

## 🤝 Relationship to Dashboard
This server is designed to work in tandem with the [Panther Vahan Dashboard](https://github.com/sanskaragarwal001/panther-vahan-dashboard). Ensure this server is running and accessible before launching the frontend dashboard.

---

### Project maintained by [Sanskar Agarwal]
