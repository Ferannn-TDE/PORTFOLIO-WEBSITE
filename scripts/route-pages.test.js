import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { build } from "vite";
import { mkdtempSync, readFileSync, existsSync, rmSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { routeFile, applyRouteMeta } from "./route-html.mjs";
import { routeMeta } from "../src/content/routeMeta.js";
import { caseStudySlugs } from "../src/content/caseStudies/slugs.js";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SITE = "https://test.example";
let out;

// Attribute value of the first tag matching `selector` (e.g. 'meta[property="og:url"]').
function attr(html, tag, key, value, want) {
  const re = new RegExp(`<${tag}\\b[^>]*\\b${key}="${value.replace(/[.:]/g, "\\$&")}"[^>]*>`);
  const m = html.match(re);
  if (!m) return undefined;
  return m[0].match(new RegExp(`\\b${want}="([^"]*)"`))?.[1];
}
const unesc = (s) => s?.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

describe("per-route HTML (real build)", () => {
  beforeAll(async () => {
    out = mkdtempSync(join(tmpdir(), "portfolio-build-"));
    const prev = process.env.SITE_URL;
    process.env.SITE_URL = SITE;
    try {
      await build({ root: ROOT, logLevel: "silent", build: { outDir: out, emptyOutDir: true } });
    } finally {
      if (prev === undefined) delete process.env.SITE_URL;
      else process.env.SITE_URL = prev;
    }
  }, 120_000);

  afterAll(() => out && rmSync(out, { recursive: true, force: true }));

  it("every sitemap route has its own HTML file with that route's tags", () => {
    const sitemap = readFileSync(join(out, "sitemap.xml"), "utf8");
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs.length).toBeGreaterThanOrEqual(3);

    for (const loc of locs) {
      const path = loc.slice(SITE.length) || "/";
      const meta = routeMeta[path];
      expect(meta, `routeMeta entry for ${path}`).toBeDefined();
      const file = join(out, routeFile(path));
      expect(existsSync(file), `${routeFile(path)} exists`).toBe(true);
      const html = readFileSync(file, "utf8");

      expect(unesc(html.match(/<title>([^<]*)<\/title>/)?.[1])).toBe(meta.title);
      expect(unesc(attr(html, "meta", "name", "description", "content"))).toBe(meta.description);
      expect(attr(html, "link", "rel", "canonical", "href")).toBe(loc);
      expect(attr(html, "meta", "property", "og:url", "content")).toBe(loc);
      expect(unesc(attr(html, "meta", "property", "og:title", "content"))).toBe(meta.title);
      expect(unesc(attr(html, "meta", "property", "og:description", "content"))).toBe(meta.description);
      expect(unesc(attr(html, "meta", "name", "twitter:title", "content"))).toBe(meta.title);
      expect(unesc(attr(html, "meta", "name", "twitter:description", "content"))).toBe(meta.description);
      expect(attr(html, "meta", "property", "og:image", "content")).toBe(`${SITE}/og.png`);
      // Same app shell as index.html: the module script and the root element.
      expect(html).toMatch(/<script type="module"[^>]*src="\/assets\/index-[\w-]+\.js"/);
      expect(html).toContain('<div id="root"></div>');
      // Each file appears exactly once per tag (no duplicates left behind).
      expect(html.match(/rel="canonical"/g)).toHaveLength(1);
    }
  });

  it("route files are flat (work/<slug>.html), never folder/index.html", () => {
    for (const path of Object.keys(routeMeta).filter((p) => p !== "/" && p !== "/404")) {
      expect(routeFile(path)).toBe(`${path.slice(1)}.html`);
      expect(existsSync(join(out, path.slice(1), "index.html")), `no ${path.slice(1)}/index.html`).toBe(false);
    }
    // The only index.html is the root one.
    const walk = (dir) =>
      readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(join(dir, d.name)) : [join(dir, d.name)]));
    expect(walk(out).filter((f) => f.endsWith("index.html"))).toEqual([join(out, "index.html")]);
  });

  it("404.html is noindex, has no canonical, and carries the 404 title", () => {
    const html = readFileSync(join(out, "404.html"), "utf8");
    expect(unesc(html.match(/<title>([^<]*)<\/title>/)?.[1])).toBe(routeMeta["/404"].title);
    expect(attr(html, "meta", "name", "robots", "content")).toBe("noindex");
    expect(html).not.toMatch(/rel="canonical"/);
  });

  it("every case study has route meta and is in the sitemap", () => {
    const sitemap = readFileSync(join(out, "sitemap.xml"), "utf8");
    for (const slug of caseStudySlugs) {
      expect(routeMeta[`/work/${slug}`]).toBeDefined();
      expect(sitemap).toContain(`<loc>${SITE}/work/${slug}</loc>`);
    }
  });
});

describe("applyRouteMeta", () => {
  it("fails loudly when index.html is missing a tag it must replace", () => {
    expect(() =>
      applyRouteMeta("<html><head><title>x</title></head></html>", { siteUrl: SITE, path: "/colophon", ...routeMeta["/colophon"] })
    ).toThrow(/no description tag/);
  });
});
