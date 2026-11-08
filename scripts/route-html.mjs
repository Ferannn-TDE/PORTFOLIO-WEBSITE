// Turns the built index.html into a copy for another route, with that route's
// title, description, canonical, og: and twitter: tags. Every tag it replaces
// must exist, so a change to index.html can't make this silently do nothing.

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Where each route's file goes in dist/.
export function routeFile(path) {
  if (path === "/") return "index.html";
  if (path === "/404") return "404.html";
  return `${path.replace(/^\/+|\/+$/g, "")}/index.html`;
}

function replaceOne(html, re, replacement, what) {
  if (!re.test(html)) throw new Error(`route-html: no ${what} tag in index.html`);
  return html.replace(re, replacement);
}

const metaRe = (attr, key) => new RegExp(`<meta\\b[^>]*\\b${attr}="${key.replace(/[.:]/g, "\\$&")}"[^>]*>`);

export function applyRouteMeta(html, { siteUrl, path, title, description, noindex = false }) {
  const url = `${siteUrl}${path === "/" ? "/" : path}`;
  let out = html;
  out = replaceOne(out, /<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`, "<title>");
  out = replaceOne(out, metaRe("name", "description"), `<meta name="description" content="${esc(description)}">`, "description");
  out = replaceOne(out, metaRe("property", "og:title"), `<meta property="og:title" content="${esc(title)}">`, "og:title");
  out = replaceOne(out, metaRe("property", "og:description"), `<meta property="og:description" content="${esc(description)}">`, "og:description");
  out = replaceOne(out, metaRe("property", "og:url"), `<meta property="og:url" content="${esc(url)}">`, "og:url");
  out = replaceOne(out, metaRe("name", "twitter:title"), `<meta name="twitter:title" content="${esc(title)}">`, "twitter:title");
  out = replaceOne(
    out,
    metaRe("name", "twitter:description"),
    `<meta name="twitter:description" content="${esc(description)}">`,
    "twitter:description"
  );
  const canonical = /<link\b[^>]*\brel="canonical"[^>]*>/;
  if (noindex) {
    // A page that shouldn't be indexed gets no canonical, and a robots tag.
    out = replaceOne(out, canonical, `<meta name="robots" content="noindex">`, "canonical");
  } else {
    out = replaceOne(out, canonical, `<link rel="canonical" href="${esc(url)}">`, "canonical");
  }
  return out;
}
