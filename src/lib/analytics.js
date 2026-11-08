// Custom events for Umami. A no-op until the Umami script is loaded (phase 7
// wires it up behind VITE_UMAMI_SRC and VITE_UMAMI_ID).
export function track(name, data) {
  try {
    window.umami?.track(name, data);
  } catch {
    // analytics must never break the page
  }
}
