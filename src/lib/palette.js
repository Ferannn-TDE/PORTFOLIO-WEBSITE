export const OPEN_PALETTE = "fo:palette-open";
export const openPalette = () => window.dispatchEvent(new Event(OPEN_PALETTE));

// "⌘K" on Apple platforms, "Ctrl K" elsewhere.
export function paletteShortcut() {
  const p = navigator.userAgentData?.platform || navigator.platform || "";
  return /mac|iphone|ipad/i.test(p) ? "⌘K" : "Ctrl K";
}
