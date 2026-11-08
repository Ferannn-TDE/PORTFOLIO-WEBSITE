import { useEffect } from "react";

export const DEFAULT_TITLE = "Feran Odedairo — Software Engineer";
export const DEFAULT_DESCRIPTION =
  "Feran Odedairo, software engineer and CS student building full-stack products that hold up when real people use them.";

function setMeta(name, content) {
  let el = document.head.querySelector(`meta[name="${name}"]`);
  if (content == null) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

// Per-route <title>, meta description and robots. Each page sets its own.
export function usePageMeta({ title = DEFAULT_TITLE, description = DEFAULT_DESCRIPTION, noindex = false } = {}) {
  useEffect(() => {
    document.title = title;
    setMeta("description", description);
    setMeta("robots", noindex ? "noindex" : null);
  }, [title, description, noindex]);
}
