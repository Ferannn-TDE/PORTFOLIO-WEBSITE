import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { readFileSync } from "fs";
import { caseStudySlugs } from "./src/content/caseStudies/slugs.js";
import { scanTodos, formatTodos } from "./scripts/check-todos.mjs";
import { applyRouteMeta, routeFile } from "./scripts/route-html.mjs";
import { routeMeta } from "./src/content/routeMeta.js";

// ---------------------------------------------------------------------------
// The site's public URL. Used for the canonical link, Open Graph tags, the
// sitemap and robots.txt. To switch domains, set SITE_URL in Netlify (or .env),
// or change this default. Nothing else needs editing.
const DEFAULT_SITE_URL = "https://ferans-portfolio-website.netlify.app";

// Pages listed in the sitemap.
const ROUTES = ["/", ...caseStudySlugs.map((slug) => `/work/${slug}`), "/colophon"];

const SITE = { ...routeMeta["/"], ogImage: "/og.png" };

// Installed versions, shown on the colophon page. Read at build time so the
// page never states a version that isn't actually shipped.
const STACK = ["react", "react-router-dom", "vite", "tailwindcss", "lenis", "vitest"];
const versions = Object.fromEntries(
  STACK.map((name) => [name, JSON.parse(readFileSync(path.resolve(__dirname, "node_modules", name, "package.json"), "utf8")).version])
);

// Preload the two fonts the hero needs for first paint, so the text does not
// reflow (and shift the layout) when they swap in. Names are hashed at build
// time, so they are looked up in the bundle.
const PRELOAD_FONTS = [/instrument-serif-latin-400-normal-[\w-]+\.woff2$/, /inter-latin-wght-normal-[\w-]+\.woff2$/];

function preloadFonts() {
  return {
    name: "preload-fonts",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        if (!ctx.bundle) return html;
        const tags = Object.keys(ctx.bundle)
          .filter((file) => PRELOAD_FONTS.some((re) => re.test(file)))
          .map((file) => ({
            tag: "link",
            attrs: { rel: "preload", as: "font", type: "font/woff2", href: `/${file}`, crossorigin: "" },
            injectTo: "head",
          }));
        return { html, tags };
      },
    },
  };
}

// Canonical + social tags in index.html, plus sitemap.xml and robots.txt,
// all built from SITE_URL.
function seo(siteUrl) {
  const abs = (p) => `${siteUrl}${p}`;
  return {
    name: "seo",
    transformIndexHtml() {
      const meta = (attrs) => ({ tag: "meta", attrs, injectTo: "head" });
      return [
        { tag: "link", attrs: { rel: "canonical", href: abs("/") }, injectTo: "head" },
        meta({ property: "og:type", content: "website" }),
        meta({ property: "og:site_name", content: "Feran Odedairo" }),
        meta({ property: "og:title", content: SITE.title }),
        meta({ property: "og:description", content: SITE.description }),
        meta({ property: "og:url", content: abs("/") }),
        meta({ property: "og:image", content: abs(SITE.ogImage) }),
        meta({ property: "og:image:width", content: "1200" }),
        meta({ property: "og:image:height", content: "630" }),
        meta({ property: "og:image:alt", content: "Feran Odedairo, software engineer, set over a dot grid." }),
        meta({ name: "twitter:card", content: "summary_large_image" }),
        meta({ name: "twitter:title", content: SITE.title }),
        meta({ name: "twitter:description", content: SITE.description }),
        meta({ name: "twitter:image", content: abs(SITE.ogImage) }),
      ];
    },
    generateBundle() {
      const urls = ROUTES.map((r) => `  <url><loc>${abs(r)}</loc></url>`).join("\n");
      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      });
      this.emitFile({
        type: "asset",
        fileName: "robots.txt",
        source: `User-agent: *\nAllow: /\n\nSitemap: ${abs("/sitemap.xml")}\n`,
      });
    },
  };
}

// After index.html is final, write a copy per route (work/fairsynq.html,
// colophon.html, 404.html) carrying that route's title, description,
// canonical, og: and twitter: tags. Netlify serves these real files before
// the rewrite rules, so link previews and crawlers see the right page; the
// app then boots exactly as it does from index.html.
function routePages(siteUrl) {
  return {
    name: "route-pages",
    enforce: "post",
    generateBundle: {
      order: "post",
      handler(_, bundle) {
        const index = bundle["index.html"];
        if (!index) this.error("route-pages: index.html missing from the bundle");
        const html = String(index.source);
        for (const [path, meta] of Object.entries(routeMeta)) {
          if (path === "/") continue;
          this.emitFile({ type: "asset", fileName: routeFile(path), source: applyRouteMeta(html, { siteUrl, path, ...meta }) });
        }
      },
    },
  };
}

// Production builds fail while visible TODO markers remain. Strict mode is on
// when STRICT_TODOS=1 (set for Netlify's production context in netlify.toml,
// and by `npm run build:prod`). Drafts, previews and dev builds are allowed.
function todoGuard(strict) {
  return {
    name: "todo-guard",
    apply: "build",
    generateBundle(_, bundle) {
      if (!strict) return;
      const result = scanTodos();
      const inBundle = Object.values(bundle).some((c) => c.type === "chunk" && c.code.includes("[TODO"));
      if (result.visible.length || inBundle) {
        this.error(
          `Visible TODO markers remain; production build stopped.\n\n${formatTodos(result)}\n` +
            (inBundle && !result.visible.length ? "\nThe built bundle still contains a [TODO marker.\n" : "") +
            "\nResolve them, or build a draft without STRICT_TODOS=1."
        );
      }
    },
  };
}

// Serves the GitHub activity Netlify Function locally (vite dev / preview) by
// calling the same handler, so the strip can be checked without netlify dev.
// Note: this does not emulate Netlify's CDN cache.
function localFunctions(env) {
  // Block body on purpose: a function returned from configureServer would be
  // treated as a post-middleware hook.
  const mount = (server) => {
    server.middlewares.use("/.netlify/functions/github-activity", async (_req, res) => {
      const { handle } = await import("./netlify/lib/github-activity.mjs");
      const response = await handle({ token: env.GITHUB_TOKEN || undefined });
      res.statusCode = response.status;
      response.headers.forEach((value, key) => res.setHeader(key, value));
      res.end(await response.text());
    });
  };
  return { name: "local-functions", configureServer: mount, configurePreviewServer: mount };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // GITHUB_TOKEN and SITE_URL are read on the Node side only. Only
  // VITE_-prefixed variables (and the values in `define`) reach the browser.
  const env = { ...loadEnv(mode, process.cwd(), ""), ...process.env };
  const siteUrl = (env.SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, "");
  const strictTodos = env.STRICT_TODOS === "1";

  return {
    plugins: [react(), tailwindcss(), preloadFonts(), seo(siteUrl), routePages(siteUrl), todoGuard(strictTodos), localFunctions(env)],
    define: {
      __STACK_VERSIONS__: JSON.stringify(versions),
      __SITE_URL__: JSON.stringify(siteUrl),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
