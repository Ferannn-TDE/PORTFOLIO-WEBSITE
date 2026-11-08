import { Link } from "react-router-dom";
import { projects, smallerBuilds, projectLink } from "@/data/projects";
import { site } from "@/data/site";

const rowClass =
  "row group -mx-4 grid grid-cols-[40px_minmax(0,1fr)] gap-x-4 gap-y-4 border-t border-hairline px-4 py-9 md:grid-cols-[48px_minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,0.8fr)] md:gap-x-8";

function RowBody({ p, n, linked }) {
  return (
    <>
      <span className="pt-2.5 font-mono text-[13px] text-muted">{String(n).padStart(2, "0")}</span>
      <div className="flex min-w-0 flex-col gap-2">
        <span className="row-title font-display text-[clamp(32px,6vw,40px)] leading-[1.05]">{p.title}</span>
        <span className="font-mono text-[12px] uppercase tracking-[0.1em] text-muted">{p.tag}</span>
      </div>
      <p className="col-start-2 pt-1.5 text-[18px] leading-[1.6] text-ink-2 md:col-start-auto">{p.description}</p>
      <span className="col-start-2 flex justify-between gap-3 pt-2 font-mono text-[13px] leading-[1.8] text-ink-2 md:col-start-auto">
        <span>
          {p.stack.map((s) => (
            <span key={s} className="block">
              {s}
            </span>
          ))}
        </span>
        {linked && (
          <span aria-hidden="true" className="row-arrow text-[22px] text-violet">
            →
          </span>
        )}
      </span>
    </>
  );
}

function Row({ p, n }) {
  const url = projectLink(p);
  if (!url) {
    return (
      <div className={rowClass}>
        <RowBody p={p} n={n} linked={false} />
      </div>
    );
  }
  if (p.href) {
    return (
      <Link to={p.href} className={rowClass}>
        <RowBody p={p} n={n} linked />
        <span className="sr-only">Read the case study</span>
      </Link>
    );
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={rowClass}>
      <RowBody p={p} n={n} linked />
      <span className="sr-only">(GitHub repository, opens in a new tab)</span>
    </a>
  );
}

export default function Work() {
  return (
    <section id="work" aria-labelledby="work-h" className="shell pb-[120px] pt-10">
      <div className="flex flex-wrap items-baseline justify-between gap-4 pb-8">
        <h2 id="work-h" className="label">
          ( 01 — The work )
        </h2>
        <p className="text-[18px] font-light text-ink-2">Six selected projects.</p>
      </div>
      <div className="border-b border-hairline">
        {projects.map((p, i) => (
          <Row key={p.slug} p={p} n={i + 1} />
        ))}
      </div>
      <p className="mt-7 font-mono text-[13px] tracking-[0.06em] text-muted">
        Smaller builds:{" "}
        {smallerBuilds.map((b, i) => (
          <span key={b.title}>
            {i > 0 && " · "}
            {b.url ? (
              <a className="link-underline text-ink-2" href={b.url} target="_blank" rel="noopener noreferrer">
                {b.title} ↗
              </a>
            ) : (
              b.title
            )}
          </span>
        ))}{" "}
        —{" "}
        <a className="link-underline text-ink-2" href={site.github} target="_blank" rel="noopener noreferrer">
          more on GitHub ↗
        </a>
      </p>
    </section>
  );
}
