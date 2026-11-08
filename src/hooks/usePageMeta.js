/* global __SITE_URL__ */
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const DEFAULT_TITLE = "Feran Odedairo — Software Engineer";
export const DEFAULT_DESCRIPTION =
  "Feran Odedairo, software engineer and CS student building full-stack products that hold up when real people use them.";

function setMeta(name, content, attr = "name") {
  let el = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (content == null) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

// Per-route <title>, description, robots, canonical and og: tags. Each page
// sets its own. (Link previews read the static tags in index.html, which
// describe the home page; these updates are for search engines that run JS.)
export function usePageMeta({ title = DEFAULT_TITLE, description = DEFAULT_DESCRIPTION, noindex = false } = {}) {
  const { pathname } = useLocation();
  useEffect(() => {
    const url = `${__SITE_URL__}${pathname}`;
    document.title = title;
    setMeta("description", description);
    setMeta("robots", noindex ? "noindex" : null);
    setMeta("og:title", title, "property");
    setMeta("og:description", description, "property");
    setMeta("og:url", url, "property");
    if (noindex) document.head.querySelector('link[rel="canonical"]')?.remove();
    else setCanonical(url);
  }, [title, description, noindex, pathname]);
}
