import { Link } from "react-router-dom";
import { projects, projectLink } from "@/data/projects";

// Previous / next among projects that have somewhere to go (case study or
// repo). Projects without a link are skipped, so this never makes a dead link.
function neighbours(slug) {
  const linked = projects.filter((p) => projectLink(p));
  const i = linked.findIndex((p) => p.slug === slug);
  if (i === -1 || linked.length < 2) return [];
  const prev = linked[(i - 1 + linked.length) % linked.length];
  const next = linked[(i + 1) % linked.length];
  return prev === next ? [["Next", next]] : [["Previous", prev], ["Next", next]];
}

function ProjectLink({ dir, p }) {
  const inner = (
    <>
      <span className="label !text-[12px]">{dir === "Previous" ? "← Previous" : "Next →"}</span>
      <span className="row-title mt-2 block font-display text-[clamp(32px,6vw,40px)] leading-[1.05]">{p.title}</span>
      <span className="mt-1 block font-mono text-[12px] uppercase tracking-[0.1em] text-muted">
        {p.href ? "Case study" : "GitHub ↗"}
      </span>
    </>
  );
  const cls = `row group relative -mx-4 block px-4 py-8 ${dir === "Next" ? "md:text-right" : ""}`;
  return p.href ? (
    <Link to={p.href} className={cls} data-cursor="open →">
      {inner}
    </Link>
  ) : (
    <a href={projectLink(p)} target="_blank" rel="noopener noreferrer" className={cls} data-cursor="open ↗">
      {inner}
      <span className="sr-only">(GitHub repository, opens in a new tab)</span>
    </a>
  );
}

export default function PrevNext({ slug }) {
  const items = neighbours(slug);
  if (!items.length) return null;
  return (
    <nav aria-label="More projects" className="grid border-y border-hairline md:grid-cols-2 md:divide-x md:divide-hairline">
      {items.map(([dir, p]) => (
        <ProjectLink key={dir} dir={dir} p={p} />
      ))}
    </nav>
  );
}
