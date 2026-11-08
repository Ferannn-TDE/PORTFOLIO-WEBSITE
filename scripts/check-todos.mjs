// Lists every TODO in the site's source.
//
//   visible  – shows up on the page: <Todo>…</Todo>, "[TODO: …]" strings, and
//              `todo:` fields in case study meta. Production builds fail while
//              any of these remain (see vite.config.js).
//   comments – // TODO notes in code; never rendered, listed for completeness.
//
// Usage: npm run check:todos          (lists, exits 0)
//        npm run check:todos -- --strict   (exits 1 if any visible TODO remains)

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SCAN = ["src", "index.html"];
const SKIP_FILES = [/\.test\.js$/, /[/\\]Todo\.jsx$/];

const VISIBLE = [
  // Inner text stops at "<" so a mention in a comment can't swallow the file.
  // `<Todo>{expr}</Todo>` is template code that renders a `todo:` field (counted below).
  { re: /<Todo>([^<{]*)<\/Todo>/g, text: (m) => m[1] },
  { re: /<Todo\s*\/>/g, text: () => "confirm" },
  { re: /\[TODO:\s*([^\]]*)\]/g, text: (m) => m[1] },
  { re: /\btodo:\s*"([^"]*)"/g, text: (m) => m[1] },
];
const COMMENT = /\/\/\s*TODO:?\s*(.*)$/gm;

function files(path) {
  const abs = join(ROOT, path);
  if (statSync(abs).isFile()) return [abs];
  return readdirSync(abs, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? files(join(path, d.name)) : /\.(jsx?|mjs|html)$/.test(d.name) ? [join(abs, d.name)] : []
  );
}

const lineOf = (src, index) => src.slice(0, index).split("\n").length;
const clean = (t) => t.replace(/\{"\s*"\}|\{" "\}/g, " ").replace(/\s+/g, " ").trim();

export function scanTodos() {
  const visible = [];
  const comments = [];
  for (const file of SCAN.flatMap(files)) {
    if (SKIP_FILES.some((re) => re.test(file))) continue;
    const src = readFileSync(file, "utf8");
    const rel = relative(ROOT, file);
    const seen = new Set();
    for (const { re, text } of VISIBLE) {
      for (const m of src.matchAll(re)) {
        const line = lineOf(src, m.index);
        const key = `${line}:${m.index}`;
        // A `[TODO: …]` inside a // comment is a comment, not page content.
        const lineText = src.split("\n")[line - 1];
        if (/^\s*\/\//.test(lineText) || seen.has(key)) continue;
        seen.add(key);
        visible.push({ file: rel, line, text: clean(text(m)) });
      }
    }
    for (const m of src.matchAll(COMMENT)) {
      comments.push({ file: rel, line: lineOf(src, m.index), text: clean(m[1]) });
    }
  }
  const byPos = (a, b) => a.file.localeCompare(b.file) || a.line - b.line;
  return { visible: visible.sort(byPos), comments: comments.sort(byPos) };
}

export function formatTodos({ visible, comments }) {
  const out = [];
  out.push(`Visible TODO markers (block production builds): ${visible.length}`);
  for (const t of visible) out.push(`  ${t.file}:${t.line}  ${t.text}`);
  out.push("", `Code comments (not rendered): ${comments.length}`);
  for (const t of comments) out.push(`  ${t.file}:${t.line}  ${t.text}`);
  return out.join("\n");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const result = scanTodos();
  console.log(formatTodos(result));
  if (process.argv.includes("--strict") && result.visible.length) process.exit(1);
}
