import { useEffect, useState } from "react";
import { timeAgo } from "@/lib/time";

const ENDPOINT = "/.netlify/functions/github-activity";

function Sparkline({ weeks }) {
  const max = Math.max(1, ...weeks);
  const w = 6;
  const gap = 3;
  const h = 18;
  return (
    <svg
      width={weeks.length * (w + gap) - gap}
      height={h}
      viewBox={`0 0 ${weeks.length * (w + gap) - gap} ${h}`}
      role="img"
      aria-label={`Pushes per week, oldest first: ${weeks.join(", ")}`}
      className="shrink-0"
    >
      {weeks.map((n, i) => {
        const bh = n ? Math.max(3, Math.round((n / max) * h)) : 1;
        return <rect key={i} x={i * (w + gap)} y={h - bh} width={w} height={bh} fill="currentColor" opacity={n ? 1 : 0.3} />;
      })}
    </svg>
  );
}

// Fetched once the page is idle. Anything other than a good response keeps the
// strip hidden; nothing is rendered until data is in hand.
export default function GitHubStrip() {
  const [data, setData] = useState(null);
  const [, setNow] = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    const load = () =>
      fetch(ENDPOINT, { signal: ctrl.signal })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.available && d.repo && d.pushedAt && Array.isArray(d.weeks)) setData(d);
        })
        .catch(() => {});
    const ric = window.requestIdleCallback;
    const id = ric ? ric(load, { timeout: 4000 }) : setTimeout(load, 1500);
    return () => {
      ctrl.abort();
      if (ric) window.cancelIdleCallback(id);
      else clearTimeout(id);
    };
  }, []);

  // Keep "3h ago" fresh while the page stays open.
  useEffect(() => {
    if (!data) return;
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, [data]);

  if (!data) return null;
  const repoName = data.repo.split("/")[1] ?? data.repo;

  return (
    <aside aria-label="Latest GitHub activity" className="shell pb-16">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-hairline pt-6 font-mono text-[13px] text-ink-2">
        <p className="min-w-0 flex-1 basis-[420px]">
          <span className="text-muted">Last pushed </span>
          <time dateTime={data.pushedAt}>{timeAgo(data.pushedAt)}</time>
          <span className="text-muted"> to </span>
          <a className="link-underline" href={data.repoUrl} target="_blank" rel="noopener noreferrer">
            {repoName}
          </a>
          {data.message && (
            <>
              <span className="text-muted"> — </span>
              <a className="hover:text-violet" href={data.commitUrl} target="_blank" rel="noopener noreferrer">
                {data.message}
              </a>
            </>
          )}
        </p>
        <span className="flex items-center gap-3 text-muted">
          <Sparkline weeks={data.weeks} />
          <span className="text-[12px] uppercase tracking-[0.14em]">pushes · {data.weeks.length} wk</span>
        </span>
      </div>
    </aside>
  );
}
