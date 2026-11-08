import { useEffect, useRef } from "react";
import { site, sections } from "@/data/site";
import { INTRO_LIFT, isReduced } from "@/lib/motion";
import { tick } from "@/lib/ticker";
import Clock from "./Clock";
import Pathfinder from "./Pathfinder";

const NAME = ["Feran", "Odedairo"];
const GLYPHS = "01<>/{}#$%&*+=";
const SCRAMBLE_MS = 1000;
const SWAP_MS = 45; // how often unresolved glyphs change

// Resolves each line left to right from random glyphs. Writes text directly
// to the spans so React does not re-render every frame.
function useScramble(refs) {
  useEffect(() => {
    let stop = null;
    const run = () => {
      stop?.();
      if (isReduced()) return;
      const start = performance.now();
      let lastSwap = -Infinity;
      stop = tick((now) => {
        const p = Math.min(1, (now - start) / SCRAMBLE_MS);
        if (p < 1 && now - lastSwap < SWAP_MS) return;
        lastSwap = now;
        NAME.forEach((word, i) => {
          const shown = Math.floor(p * word.length);
          let out = word.slice(0, shown);
          for (let j = shown; j < word.length; j++) out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
          if (refs[i].current) refs[i].current.textContent = out;
        });
        if (p >= 1) {
          stop();
          stop = null;
        }
      });
    };
    window.addEventListener(INTRO_LIFT, run);
    return () => {
      window.removeEventListener(INTRO_LIFT, run);
      stop?.();
      refs.forEach((r, i) => r.current && (r.current.textContent = NAME[i]));
    };
  }, [refs]);
}

export default function Hero() {
  const line1 = useRef(null);
  const line2 = useRef(null);
  const lines = useRef([line1, line2]).current;
  useScramble(lines);

  return (
    <section
      id="top"
      aria-label="Introduction"
      className="on-night dot-grid relative flex min-h-[100svh] flex-col bg-night pb-10 pt-[108px] text-cream"
    >
      <div className="shell grid flex-1 items-center gap-14 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:py-16">
        <div className="flex min-w-0 flex-col gap-7">
          <p className="label !text-[12px]">( Now shipping )</p>
          <h1
            aria-label="Feran Odedairo"
            className="overflow-x-clip font-display text-[clamp(64px,13vw,88px)] font-normal leading-[0.98] tracking-[-0.02em]"
          >
            <span ref={line1} aria-hidden="true" className="block whitespace-nowrap">
              {NAME[0]}
            </span>
            <span ref={line2} aria-hidden="true" className="block whitespace-nowrap">
              {NAME[1]}
            </span>
          </h1>
          <p className="max-w-[30ch] text-[21px] font-light leading-[1.5]">
            Software engineer and CS student building full‑stack products that hold up when real people use them.
          </p>
          <div className="mt-3 flex flex-wrap gap-3 font-mono text-[12px] uppercase tracking-[0.18em]">
            <a href="#contact" className="inline-flex h-[50px] items-center gap-3.5 bg-button px-[18px] text-cream hover:bg-violet">
              Get in touch <span aria-hidden="true">→</span>
            </a>
            <a
              href={site.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-[50px] items-center border border-cream/35 px-[18px] hover:border-violet-soft hover:text-violet-soft"
            >
              Résumé ↓
            </a>
          </div>
        </div>
        <Pathfinder />
      </div>

      <div className="shell flex flex-wrap items-end justify-between gap-5 font-mono text-[12px] uppercase tracking-[0.14em]">
        <div className="flex flex-col gap-2.5">
          <nav aria-label="Sections" className="flex flex-wrap gap-x-8 gap-y-2">
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="hover:text-violet-soft">
                <span className="text-cream/60">{s.num}</span>&nbsp; {s.label}
              </a>
            ))}
          </nav>
          <Clock className="text-cream/70" />
        </div>
        <a href="#readme" className="bg-button px-3.5 py-3 hover:bg-violet">
          Start reading ↓
        </a>
      </div>
    </section>
  );
}
