// Renders the Open Graph image and icons from scripts/brand/*.html with the
// locally installed Google Chrome (headless), into public/. Run once after a
// design change: `npm run brand`. The outputs are committed, so builds and
// deploys never need Chrome.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { join } from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const CHROME =
  process.env.CHROME_PATH ||
  ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome", "/usr/bin/chromium"].find(existsSync);
if (!CHROME) throw new Error("Google Chrome not found; set CHROME_PATH.");

function shot(page, query, width, height, out) {
  const url = `${pathToFileURL(join(ROOT, "scripts/brand", page)).href}${query}`;
  execFileSync(
    CHROME,
    [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--allow-file-access-from-files",
      "--virtual-time-budget=3000",
      `--window-size=${width},${height}`,
      `--screenshot=${join(ROOT, "public", out)}`,
      url,
    ],
    { stdio: "ignore" }
  );
  console.log(`public/${out}  ${width}×${height}`);
}

shot("og.html", "", 1200, 630, "og.png");
for (const [size, out] of [
  [32, "favicon-32.png"],
  [180, "apple-touch-icon.png"],
]) {
  shot("icon.html", `?s=${size}`, size, size, out);
}

// favicon.ico for browsers that request it directly: a single 32×32 PNG
// wrapped in an ICO container (PNG-in-ICO is supported by current browsers).
const png = readFileSync(join(ROOT, "public/favicon-32.png"));
const header = Buffer.alloc(6 + 16);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(1, 4); // one image
header.writeUInt8(32, 6); // width
header.writeUInt8(32, 7); // height
header.writeUInt8(0, 8); // palette
header.writeUInt8(0, 9); // reserved
header.writeUInt16LE(1, 10); // colour planes
header.writeUInt16LE(32, 12); // bits per pixel
header.writeUInt32LE(png.length, 14); // image size
header.writeUInt32LE(22, 18); // image offset
writeFileSync(join(ROOT, "public/favicon.ico"), Buffer.concat([header, png]));
console.log("public/favicon.ico  32×32 (PNG in ICO)");
