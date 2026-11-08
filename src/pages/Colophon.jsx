/* global __STACK_VERSIONS__ */
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Todo from "@/components/Todo";
import { CaseSection } from "@/components/case/parts";
import { HEAVY_COST } from "@/components/Pathfinder/algorithms";
import { site } from "@/data/site";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useReveal } from "@/hooks/useReveal";
import { analyticsEnabled } from "@/lib/analytics";

const v = __STACK_VERSIONS__;

const colours = [
  ["Paper", "#F2EEE6", "page ground"],
  ["Night", "#1C1838", "hero and footer ground"],
  ["Ink", "#1D1715", "primary text"],
  ["Ink 2", "#3A332F", "body text"],
  ["Muted", "#6B635C", "labels and metadata"],
  ["Violet", "#4B3FB0", "hover and focus only"],
  ["Violet soft", "#A99CF5", "accent on night"],
  ["Button", "#0B0B0B", "buttons, nav bar, marquee"],
  ["OK", "#9FE3B4", "online dot"],
  ["Cream", "#F4EFE6", "text on night"],
];

// Measured with the WCAG 2 relative-luminance formula.
const contrast = [
  ["Ink on paper", "15.3:1"],
  ["Body text (ink 2) on paper", "10.7:1"],
  ["Muted labels on paper", "5.1:1"],
  ["Cream on night", "14.8:1"],
  ["Cream at 60% on night (dimmest text there)", "6.1:1"],
  ["Violet focus and hover text on paper", "6.9:1"],
];

function Table({ rows, cols }) {
  return (
    <table className="w-full border-collapse text-left text-[16px]">
      <thead>
        <tr>
          {cols.map((c) => (
            <th key={c} scope="col" className="label border-b border-hairline pb-3 pr-4 font-normal">
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r[0]} className="border-b border-hairline">
            {r.map((cell, i) => (
              <td key={i} className={`py-3 pr-4 align-top ${i === 0 ? "text-ink" : "font-mono text-[14px] text-ink-2"}`}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Colophon() {
  usePageMeta({
    title: "Colophon — Feran Odedairo",
    description: "How this site is built: type, colour, stack, how the pathfinder works, and accessibility notes.",
  });
  useReveal();

  return (
    <>
      <a href="#main" className="sr-only z-[70] bg-button px-4 py-3 text-cream focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <Nav />
      <header id="top" className="on-night dot-grid bg-night pb-16 pt-[140px] text-cream">
        <div className="shell flex flex-col gap-8">
          <p className="label">( Colophon )</p>
          <h1 className="font-display text-[clamp(64px,13vw,96px)] font-normal leading-[0.98] tracking-[-0.02em]">How this site is made</h1>
        </div>
      </header>
      <main id="main" tabIndex={-1} className="shell flex flex-col gap-24 py-24 outline-none">
        <CaseSection num="01" label="Type" title="Three typefaces, all self-hosted">
          <p>
            <span className="font-display text-[22px]">Instrument Serif</span> for headings,{" "}
            <strong className="font-medium">Inter</strong> for reading, and{" "}
            <span className="font-mono text-[15px]">JetBrains Mono</span> for labels and code. All three are under the SIL
            Open Font License and are served from this site through Fontsource, so no font request leaves the domain.
            Only the Latin subsets load, and the two hero fonts are preloaded so the first screen does not shift when
            they arrive.
          </p>
        </CaseSection>

        <CaseSection num="02" label="Colour" title="Ten colours, one accent">
          <p>Violet appears only on hover and focus. Corners are square, rows are split by 1px hairlines, and there are no gradients or glows.</p>
          <ul className="!mt-6 grid !list-none grid-cols-2 gap-4 !pl-0 sm:grid-cols-5">
            {colours.map(([name, hex, use]) => (
              <li key={name} className="!mt-0">
                <span className="block h-14 border border-hairline" style={{ background: hex }} aria-hidden="true" />
                <span className="mt-2 block text-[15px] text-ink">{name}</span>
                <span className="block font-mono text-[12px] text-muted">{hex}</span>
                <span className="block text-[13px] leading-[1.4] text-muted">{use}</span>
              </li>
            ))}
          </ul>
        </CaseSection>

        <CaseSection num="03" label="Stack" title="Small and boring, on purpose">
          <Table
            cols={["Part", "Version / service"]}
            rows={[
              ["UI", `React ${v.react}, React Router ${v["react-router-dom"]}`],
              ["Build", `Vite ${v.vite}`],
              ["Styles", `Tailwind CSS ${v.tailwindcss}, with the site's colours as theme tokens`],
              ["Smooth scrolling", `Lenis ${v.lenis} (off with reduced motion)`],
              ["Tests", `Vitest ${v.vitest}`],
              ["Hosting", "Netlify, with one Netlify Function for the GitHub strip"],
            ]}
          />
          <p>
            The GitHub strip is fetched by a server-side function and cached on Netlify&apos;s CDN for 15 minutes. If
            anything goes wrong, the strip simply doesn&apos;t show.{" "}
            <a className="link-underline" href="https://github.com/Ferannn-TDE/PORTFOLIO-WEBSITE" target="_blank" rel="noopener noreferrer">
              Source on GitHub ↗
            </a>
          </p>
        </CaseSection>

        <CaseSection num="04" label="Pathfinder" title="How the hero grid works">
          <p>
            Clicking a square runs a real search from the start square to the one you clicked. BFS explores in rings and
            finds the fewest steps. Dijkstra and A* also count cost: the squares marked with a small inner square cost{" "}
            {HEAVY_COST} to enter instead of 1, so they will walk around them when that is cheaper. A* uses the
            straight-line grid distance (Manhattan distance) to head toward the target, which is why it usually checks
            fewer squares than Dijkstra for the same answer.
          </p>
          <p>
            The searches are plain functions with no React in them, and they are deterministic: neighbours are always
            tried up, right, down, left, so the same click animates the same way every time. Their tests check the
            answers against a separate brute-force solver on hundreds of seeded random grids, and they include
            deliberately broken versions that the tests must catch.
          </p>
          <h3 className="!mt-8 font-display text-[26px] font-normal">The timing number</h3>
          <p>
            One search on a grid this size takes a few hundredths of a millisecond, which is often below what a
            browser&apos;s timer can measure. So the number is an average: the same search is repeated until at least 2
            milliseconds have passed (up to 200 runs), and the total is divided by the number of runs. Before the first
            timed search, each algorithm is run 30 times untimed so the browser has finished compiling it; those warm-up
            runs are not counted. Only the search itself is timed, never the drawing.
          </p>
        </CaseSection>

        <CaseSection num="05" label="Access" title="Accessibility notes">
          <ul>
            <li>
              All motion stops when your system asks for reduced motion, or when you choose “Reduce motion” in the
              command palette (⌘K or Ctrl K) for this session. No intro, no smooth scrolling, no animation.
            </li>
            <li>Everything works from the keyboard, with a visible focus ring and a skip link. The palette is a standard combobox.</li>
            <li>
              The pathfinder grid is hidden from screen readers; its controls are real buttons and its result line is
              announced.
            </li>
            <li>Text contrast, measured:</li>
          </ul>
          <div className="!mt-4">
            <Table cols={["Text", "Contrast"]} rows={contrast} />
          </div>
        </CaseSection>

        <CaseSection num="06" label="Measured" title="Lighthouse">
          <p>
            Mobile scores from the live site: <Todo>fill after deploy</Todo>
          </p>
          <p>
            {analyticsEnabled
              ? "Analytics: Umami, which sets no cookies and collects no personal data. It loads after the page and counts page views plus a few named events (case study opened, résumé opened, email copied, palette opened, pathfinder run)."
              : "Analytics: none."}
          </p>
          <p>
            Built by {site.name} in {site.location}.
          </p>
        </CaseSection>
      </main>
      <Footer />
    </>
  );
}
