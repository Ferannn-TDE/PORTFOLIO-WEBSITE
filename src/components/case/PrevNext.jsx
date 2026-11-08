import { Link } from "react-router-dom";
import { projectLink } from "@/data/projects";
import { neighbours } from "@/lib/projectNav";

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
