import { site } from "@/data/site";
import { copyEmail } from "@/lib/email";
import { track } from "@/lib/analytics";
import Clock from "./Clock";

function CopyEmail() {
  return (
    <button
      type="button"
      onClick={() => copyEmail("footer")}
      data-cursor="copy"
      className="min-h-11 font-mono text-[12px] uppercase tracking-[0.14em] text-cream/70 hover:text-violet-soft"
    >
      Copy email
    </button>
  );
}

const words = ["Let’s", "build", "something", "that", "holds", "up."];

export default function Footer() {
  return (
    <footer id="contact" className="on-night dot-grid bg-night px-4 pb-10 pt-[120px] text-cream md:px-10">
      <div className="mx-auto flex max-w-[1160px] flex-col gap-9">
        <p className="label">( exit 0 )</p>
        <h2 data-reveal="words" className="max-w-[12ch] font-display text-[clamp(56px,11vw,96px)] font-normal leading-[1.02] tracking-[-0.02em]">
          {words.map((w, i) => (
            <span
              key={w}
              className={`footer-word inline-block ${i === words.length - 1 ? "italic" : ""}`}
              style={{ "--i": i }}
            >
              {w}
              {i < words.length - 1 && " "}
            </span>
          ))}
        </h2>
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-3">
          <a
            href={`mailto:${site.email}`}
            className="break-all border-b-2 border-cream pb-0.5 text-[clamp(22px,5vw,36px)] hover:border-violet-soft hover:text-violet-soft"
          >
            {site.email}
          </a>
          <CopyEmail />
        </div>
        <div className="mt-20 flex flex-wrap items-center justify-between gap-x-9 gap-y-5 border-t border-cream/20 pt-8 text-[16px]">
          <ul className="flex flex-wrap gap-x-9 gap-y-3">
            <li>
              <a className="hover:text-violet-soft" href={site.github} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </li>
            <li>
              <a className="hover:text-violet-soft" href={site.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            </li>
            <li>
              <a
                className="hover:text-violet-soft"
                href={site.resume}
                onClick={() => track("resume-open", { source: "footer" })}
                target="_blank"
                rel="noopener noreferrer"
              >
                Résumé (PDF)
              </a>
            </li>
          </ul>
          <div className="flex flex-wrap items-center gap-x-9 gap-y-3 font-mono text-[12px] uppercase tracking-[0.14em] text-cream/70">
            <Clock />
            <a href="#top" className="text-cream hover:text-violet-soft">
              Back to top ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
