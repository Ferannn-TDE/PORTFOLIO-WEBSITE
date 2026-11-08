import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { scrollToElement } from "@/lib/scroll";

// On client-side route changes (not the first load, not hash-only changes),
// start the new page at the top and move focus to its main content.
export default function RouteEffects() {
  const { pathname } = useLocation();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const top = document.getElementById("top");
    if (top) scrollToElement(top, { immediate: true });
    else window.scrollTo(0, 0);
    // Lazy pages render a frame or two later; wait for their <main>.
    let frames = 0;
    let raf = 0;
    const focusMain = () => {
      const main = document.getElementById("main");
      if (main) main.focus({ preventScroll: true });
      else if (frames++ < 60) raf = requestAnimationFrame(focusMain);
    };
    focusMain();
    return () => cancelAnimationFrame(raf);
  }, [pathname]);
  return null;
}
