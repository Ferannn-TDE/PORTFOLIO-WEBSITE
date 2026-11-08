// Umami, cookieless analytics. Off unless both VITE_UMAMI_SRC and
// VITE_UMAMI_ID are set at build time. The script is injected with `defer`
// after the page has loaded, so it never competes with first paint.
const SRC = import.meta.env.VITE_UMAMI_SRC;
const ID = import.meta.env.VITE_UMAMI_ID;
export const analyticsEnabled = Boolean(SRC && ID);

export function loadAnalytics() {
  if (!analyticsEnabled || document.querySelector("script[data-website-id]")) return;
  const inject = () => {
    const s = document.createElement("script");
    s.src = SRC;
    s.defer = true;
    s.dataset.websiteId = ID;
    document.head.appendChild(s);
  };
  if (document.readyState === "complete") inject();
  else window.addEventListener("load", inject, { once: true });
}

// Custom events. A no-op until the Umami script has loaded (or when it is off).
export function track(name, data) {
  try {
    window.umami?.track(name, data);
  } catch {
    // analytics must never break the page
  }
}
