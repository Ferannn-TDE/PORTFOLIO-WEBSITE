import { useLayoutEffect } from "react";
import { isReduced, subscribeReduced } from "@/lib/motion";
import { scrollToElement } from "@/lib/scroll";

// Scroll reveals for [data-reveal] elements, plus deep-link handling.
//
// Content is never hidden by default: the hiding rule only applies once
// <html> has `js-reveal`, which is added here after every element already in
// view has been marked `is-in`. So above-the-fold content is never hidden,
// and if JS fails nothing is hidden at all.
export function useReveal() {
  useLayoutEffect(() => {
    // Deep link (/#work): the browser tried to scroll before React rendered.
    if (location.hash) {
      const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (el) scrollToElement(el, { immediate: true });
    }

    const root = document.documentElement;
    const els = [...document.querySelectorAll("[data-reveal]")];
    const vh = window.innerHeight;
    for (const el of els) {
      if (el.getBoundingClientRect().top < vh) el.classList.add("is-in");
    }
    root.classList.add("js-reveal");

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    els.filter((el) => !el.classList.contains("is-in")).forEach((el) => io.observe(el));

    const showAll = () => isReduced() && els.forEach((el) => el.classList.add("is-in"));
    showAll();
    const unsub = subscribeReduced(showAll);

    return () => {
      io.disconnect();
      unsub();
      root.classList.remove("js-reveal");
    };
  }, []);
}
