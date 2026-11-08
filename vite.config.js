import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

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
export default defineConfig(({ mode }) => ({
  // GITHUB_TOKEN is loaded for the local function middleware only (Node side).
  // Only VITE_-prefixed variables ever reach the browser bundle.
  plugins: [react(), tailwindcss(), preloadFonts(), localFunctions(loadEnv(mode, process.cwd(), ""))],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
