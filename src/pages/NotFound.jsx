import { Link } from "react-router-dom";
import Nav from "@/components/Nav";
import MiniPathfinder from "@/components/MiniPathfinder";
import { usePageMeta } from "@/hooks/usePageMeta";
import { routeMeta } from "@/content/routeMeta";
import { openPalette } from "@/lib/palette";

export default function NotFound() {
  usePageMeta(routeMeta["/404"]);
  return (
    <>
      <Nav />
      <main
        id="main"
        tabIndex={-1}
        className="on-night dot-grid flex min-h-[100svh] items-center bg-night pb-16 pt-[120px] text-cream outline-none"
      >
        <div id="top" className="shell grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)]">
          <div className="flex flex-col gap-7">
            <p className="label">( 404 )</p>
            <h1 className="font-display text-[clamp(56px,11vw,96px)] font-normal leading-[1.02] tracking-[-0.02em]">
              path not found
            </h1>
            <p className="max-w-[34ch] text-[21px] font-light leading-[1.5]">
              The search ran and every reachable square came back empty. This page isn&apos;t here.
            </p>
            <div className="flex flex-wrap gap-3 font-mono text-[12px] uppercase tracking-[0.18em]">
              <Link to="/" className="inline-flex h-[50px] items-center bg-button px-[18px] text-cream hover:bg-violet">
                Back home ←
              </Link>
              <a href="/#work" className="inline-flex h-[50px] items-center border border-cream/35 px-[18px] hover:border-violet-soft hover:text-violet-soft">
                See the work
              </a>
              <button
                type="button"
                onClick={openPalette}
                className="inline-flex h-[50px] items-center border border-cream/35 px-[18px] uppercase hover:border-violet-soft hover:text-violet-soft"
              >
                Search ⌘K
              </button>
            </div>
          </div>
          <MiniPathfinder />
        </div>
      </main>
    </>
  );
}
