import { useEffect } from "react";
import { useParams } from "react-router-dom";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PrevNext from "@/components/case/PrevNext";
import Todo from "@/components/Todo";
import NotFound from "./NotFound";
import { getCaseStudy } from "@/content/caseStudies";
import { usePageMeta } from "@/hooks/usePageMeta";
import { routeMeta } from "@/content/routeMeta";
import { useReveal } from "@/hooks/useReveal";
import { track } from "@/lib/analytics";
import { projects } from "@/data/projects";

// Header facts. Links come from the project data (src/data/projects.js):
// "Live demo" when `live` is set, "Repository" when `repo` is set.
function Facts({ meta, project }) {
  const links = [
    project?.live && { label: "Live demo", href: project.live },
    project?.repo && { label: "Repository", href: project.repo },
  ].filter(Boolean);
  const pending = meta.pendingLinks ?? [];
  return (
    <dl className="grid gap-x-10 gap-y-6 border-t border-hairline-night pt-8 sm:grid-cols-2 lg:grid-cols-4">
      {meta.facts.map((f) => (
        <div key={f.label} className={f.wide ? "lg:col-span-2" : undefined}>
          <dt className="label">{f.label}</dt>
          <dd className="mt-2 text-[16px] leading-[1.6]">
            {f.value}
            {f.value && f.todo && " "}
            {f.todo && <Todo>{f.todo}</Todo>}
          </dd>
        </div>
      ))}
      {(links.length > 0 || pending.length > 0) && (
        <div>
          <dt className="label">Links</dt>
          <dd className="mt-2 flex flex-col gap-1 text-[16px] leading-[1.6]">
            {links.map((l) => (
              <a key={l.label} className="link-underline w-fit" href={l.href} target="_blank" rel="noopener noreferrer">
                {l.label} ↗
              </a>
            ))}
            {pending.map((l) => (
              <span key={l.label}>
                {l.label} <Todo>{l.todo}</Todo>
              </span>
            ))}
          </dd>
        </div>
      )}
    </dl>
  );
}

function Page({ mod }) {
  const { meta, Body } = mod;
  usePageMeta(routeMeta[`/work/${meta.slug}`]);
  useReveal();
  useEffect(() => track("case-study-open", { slug: meta.slug }), [meta.slug]);

  return (
    <>
      <a href="#main" className="sr-only z-[70] bg-button px-4 py-3 text-cream focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <Nav />
      <header id="top" className="on-night dot-grid bg-night pb-16 pt-[140px] text-cream">
        <div className="shell flex flex-col gap-8">
          <p className="label">( Case study )</p>
          <h1 className="font-display text-[clamp(64px,13vw,96px)] font-normal leading-[0.98] tracking-[-0.02em]">{meta.title}</h1>
          <p className="max-w-[34ch] text-[clamp(21px,3vw,28px)] font-light leading-[1.45]">{meta.summary}</p>
          <Facts meta={meta} project={projects.find((p) => p.slug === meta.slug)} />
        </div>
      </header>
      <main id="main" tabIndex={-1} className="shell flex flex-col gap-24 py-24 outline-none">
        <Body />
        <PrevNext slug={meta.slug} />
      </main>
      <Footer />
    </>
  );
}

export default function CaseStudy() {
  const { slug } = useParams();
  const mod = getCaseStudy(slug);
  if (!mod) return <NotFound />;
  return <Page key={slug} mod={mod} />;
}
