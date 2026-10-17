// Renders an animated HTML page to MP4, frame by frame (smooth, no dropped frames).
// Usage: node render.mjs <page.html> <out.mp4> <width> <height> [seconds=15] [fps=30] [startSeconds=0]
// Needs Playwright + ffmpeg. Set PLAYWRIGHT_PATH if playwright isn't resolvable.
import { createRequire } from "module";
import { spawn } from "child_process";
import path from "path";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");

const [page_, out, w, h, secs = "15", fps = "30", start = "0"] = process.argv.slice(2);
const W = +w, H = +h, S = +secs, F = +fps, T0 = +start * 1000, total = Math.round(S * F);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.goto("file://" + path.resolve(page_));
await page.evaluate(() => document.fonts.ready);
await page.waitForLoadState("networkidle");

const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(F), "-i", "-",
  "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "slow", "-movflags", "+faststart", out],
  { stdio: ["pipe", "inherit", "inherit"] });

for (let i = 0; i < total; i++) {
  const ms = T0 + (i / F) * 1000;
  await page.evaluate((t) => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = t; }), ms);
  const buf = await page.screenshot({ type: "png" });
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
}
ff.stdin.end();
await new Promise((r) => ff.on("close", r));
await browser.close();
console.log("wrote", out);
