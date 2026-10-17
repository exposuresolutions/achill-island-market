// Renders every print piece to print/pdf/*.pdf from the current data/band.js.
// Usage: node print/make-pdfs.mjs   (set PLAYWRIGHT_PATH if playwright isn't resolvable)
import { createRequire } from "module";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, "pdf");
fs.mkdirSync(out, { recursive: true });

const pieces = ["poster-dates", "poster-residency", "letterhead", "business-card", "compliments-slip", "quote-invoice"];
const browser = await chromium.launch();
const page = await browser.newPage();
for (const name of pieces) {
  await page.goto("file://" + path.join(here, name + ".html"));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState("networkidle");
  await page.emulateMedia({ media: "print" });
  await page.pdf({ path: path.join(out, name + ".pdf"), preferCSSPageSize: true, printBackground: true });
  await page.emulateMedia({ media: "screen" });
  console.log("wrote pdf/" + name + ".pdf");
}
await browser.close();
