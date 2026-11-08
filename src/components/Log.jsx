import { useEffect, useRef } from "react";
import { log } from "@/data/about";
import { tick } from "@/lib/ticker";
import { getScroll, onScroll } from "@/lib/scroll";
import { useReducedMotion } from "@/lib/motion";

const READING_LINE = 0.6; // fraction of viewport height

// The trunk draws down as the log scrolls past the reading line; each row
// lights up as its dot reaches it. Geometry is measured on resize only; the
// per-frame work compares numbers and toggles classes.
function useTimeline(listRef, reduced) {
  useEffect(() => {
    const list = listRef.current;
    if (!list || reduced) return;
    const trunk = list.querySelector(".trunk");
    const rows = [...list.querySelectorAll(".log-row")];
    let geo = null;
    let dirty = true;
    let lastActive = -1;

    const measure = () => {
      const y = window.scrollY;
      const box = list.getBoundingClientRect();
      geo = {
        top: box.top + y + 36,
        height: Math.max(1, box.height - 72),
        rows: rows.map((r) => r.getBoundingClientRect().top + y + 36),
      };
      dirty = true;
    };

    list.classList.add("tl-js");
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    ro.observe(document.body); // content above can move the list (fonts, images)
    const unScroll = onScroll(() => (dirty = true));
    const unTick = tick(() => {
      if (!dirty || !geo) return;
      dirty = false;
      const { y, vh } = getScroll();
      const line = y + vh * READING_LINE;
      const p = Math.min(1, Math.max(0, (line - geo.top) / geo.height));
      trunk.style.transform = `scaleY(${p})`;
      let active = -1;
      geo.rows.forEach((top, i) => {
        if (top <= line) active = i;
      });
      if (active !== lastActive) {
        rows.forEach((r, i) => r.classList.toggle("is-active", i <= active));
        lastActive = active;
      }
    });

    return () => {
      ro.disconnect();
      unScroll();
      unTick();
      list.classList.remove("tl-js");
      trunk.style.transform = "";
      rows.forEach((r) => r.classList.remove("is-active"));
    };
  }, [listRef, reduced]);
}

export default function Log() {
  const listRef = useRef(null);
  const reduced = useReducedMotion();
  useTimeline(listRef, reduced);

  return (
    <section id="log" aria-labelledby="log-h" className="shell pb-[120px] pt-10">
      <h2 id="log-h" data-reveal className="label mb-8">
        ( 02 — The log )
      </h2>
      <ol ref={listRef} className="timeline relative flex flex-col">
        <span aria-hidden="true" className="trunk absolute bottom-9 left-[7px] top-9 w-0.5 origin-top bg-violet" />
        {log.map((e, i) => (
          <li
            key={e.role}
            className={`log-row relative flex flex-wrap items-start gap-x-8 gap-y-2 py-[26px] pl-11 ${i > 0 ? "border-t border-ink/[0.12]" : ""}`}
          >
            <span aria-hidden="true" className="log-dot absolute left-0 top-9 size-3 rounded-full border-2 border-violet" />
            <span className="flex-[1_1_280px] font-display text-[30px] leading-[1.15]">{e.role}</span>
            <span className="flex-[1_1_240px] pt-1.5 text-[18px] text-ink-2">{e.org}</span>
            <span className="flex-[0_1_200px] pt-2.5 font-mono text-[13px] text-muted md:text-right">{e.when}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
