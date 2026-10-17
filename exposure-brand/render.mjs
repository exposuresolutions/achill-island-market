// Exports the animated Exposure logo to every size we use.
// Usage: node render.mjs            (all)   |   node render.mjs email   (names containing "email")
// Needs Playwright + ffmpeg. Set PLAYWRIGHT_PATH if playwright isn't resolvable.
import { createRequire } from "module";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(here, "export");
fs.mkdirSync(OUT, { recursive: true });

const LOOP = 4; // seconds, must match T in animated-logo.html
// name, width, height, kind (gif | mp4 | png), extra URL options, fps, loops
const JOBS = [
  ["email-header-600x200", 600, 200, "gif", "pad=0.1", 10, 1, 80],      // last value = GIF colours (smaller file)
  ["email-signature-300x100", 300, 100, "gif", "pad=0.08", 10, 1, 48],
  ["facebook-cover-1640x624", 1640, 624, "mp4", "pad=0.16", 30, 5],   // Facebook cover videos must be 20s+
  ["facebook-cover-1640x624", 1640, 624, "png", "pad=0.16"],
  ["linkedin-banner-1584x396", 1584, 396, "png", "pad=0.12"],
  ["x-header-1500x500", 1500, 500, "png", "pad=0.14"],
  ["youtube-banner-2560x1440", 2560, 1440, "png", "pad=0.36"],         // keeps the logo in YouTube's safe area
  ["profile-icon-1080", 1080, 1080, "png", "mode=icon&pad=0.2"],
  ["profile-icon-1080", 1080, 1080, "mp4", "mode=icon&pad=0.2", 30, 3],
  ["logo-animated-1920x1080", 1920, 1080, "mp4", "pad=0.18", 30, 3],
  ["logo-animated-1080x1920", 1080, 1920, "mp4", "pad=0.1", 30, 3],
  ["logo-still-transparent-2400", 2400, 820, "png", "pad=0.04&bg=none"],
];

const only = process.argv[2];
const browser = await chromium.launch();
const page = await browser.newPage();

async function frame(t) {
  const url = await page.evaluate((t) => { renderAt(t); return document.getElementById("c").toDataURL("image/png"); }, t);
  return Buffer.from(url.split(",")[1], "base64");
}

for (const [name, w, h, kind, opts, fps = 30, loops = 1, colors = 128] of JOBS) {
  if (only && !name.includes(only)) continue;
  await page.setViewportSize({ width: Math.min(w, 1920), height: Math.min(h, 1080) });
  await page.goto("file://" + path.join(here, "animated-logo.html") + `?w=${w}&h=${h}&${opts}&still=1.6`);
  const file = path.join(OUT, `${name}.${kind}`);
  if (kind === "png") { fs.writeFileSync(file, await frame(1.6)); console.log("wrote", path.relative(here, file)); continue; }

  const n = Math.round(LOOP * fps);
  const args = kind === "gif"
    ? ["-f", "image2pipe", "-framerate", String(fps), "-i", "-", "-vf",
       `split[a][b];[a]palettegen=max_colors=${colors}:stats_mode=full[p];[b][p]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle`, "-loop", "0", file]
    : ["-f", "image2pipe", "-framerate", String(fps), "-i", "-", "-vf", `loop=${loops - 1}:${n}:0`,
       "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "19", "-preset", "slow", "-movflags", "+faststart", file];
  const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", ...args], { stdio: ["pipe", "inherit", "inherit"] });
  for (let i = 0; i < n; i++) {
    const buf = await frame((i / fps));
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
  }
  ff.stdin.end();
  await new Promise((r) => ff.on("close", r));
  if (kind === "gif") {
    // Optional: shrink GIFs for email with gifsicle (set GIFSICLE=/path/to/gifsicle or have it on PATH)
    const { spawnSync } = await import("child_process");
    const g = spawnSync(process.env.GIFSICLE || "gifsicle", ["-O3", "--lossy=80", "-b", file]);
    if (g.error) console.log("  (gifsicle not found — GIF left unoptimised)");
  }
  console.log("wrote", path.relative(here, file), (fs.statSync(file).size / 1048576).toFixed(2) + " MB");
}
await browser.close();
