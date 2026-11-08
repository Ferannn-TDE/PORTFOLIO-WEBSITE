import { useId } from "react";

// Building blocks for case study content files (src/content/caseStudies/*.jsx).

// A numbered section: mono label in the left column, heading and prose on the right.
export function CaseSection({ num, label, title, children }) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="grid gap-6 border-t border-hairline pt-10 md:grid-cols-[220px_minmax(0,1fr)] md:gap-10">
      <p data-reveal className="label">
        ( {num} — {label} )
      </p>
      <div data-reveal className="min-w-0">
        <h2 id={id} className="font-display text-[clamp(32px,6vw,40px)] font-normal leading-[1.1] tracking-[-0.01em]">
          {title}
        </h2>
        <div className="case-prose mt-6">{children}</div>
      </div>
    </section>
  );
}

// A sub-point inside a section (one decision, one bug).
export function CasePoint({ title, children }) {
  return (
    <div className="case-point border-t border-hairline pt-6">
      <h3 className="font-display text-[26px] font-normal leading-[1.2]">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}

// A figure with a caption (diagrams, screenshots).
export function CaseFigure({ caption, children }) {
  return (
    <figure className="case-figure my-8">
      {children}
      {caption && <figcaption className="mt-4 font-mono text-[12px] leading-[1.6] text-muted">{caption}</figcaption>}
    </figure>
  );
}
