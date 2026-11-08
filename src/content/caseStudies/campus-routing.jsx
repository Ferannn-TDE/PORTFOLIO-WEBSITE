import { CaseSection, CaseFigure } from "@/components/case/parts";
import FlowDiagram from "@/components/case/FlowDiagram";
import Pathfinder from "@/components/Pathfinder";

export const meta = {
  slug: "campus-routing",
  title: "Campus Routing Visualizer",
  summary: "A full-stack tool for watching shortest-path algorithms work on a map of the SIUE campus.",
  facts: [{ label: "Stack", value: "Next.js frontend · FastAPI backend", wide: true }],
};

export function Body() {
  return (
    <>
      <CaseSection num="01" label="The problem" title="Seeing how the algorithms differ">
        <p>
          The goal was to visualize and compare shortest-path algorithms on a graph of the SIUE campus: more than 50
          mapped buildings, joined by more than 70 weighted edges.
        </p>
      </CaseSection>

      <CaseSection num="02" label="How it works" title="Two algorithms, side by side">
        <p>
          The frontend is Next.js and the backend is FastAPI. It runs Dijkstra and Floyd–Warshall on the same campus
          graph side by side, with step-by-step playback, and reports the total distance, run time, nodes visited and
          edges relaxed.
        </p>
        <CaseFigure caption="From request to playback.">
          <FlowDiagram
            title="Campus Routing Visualizer architecture"
            desc="The Next.js UI sends a request to the FastAPI backend, which loads the campus graph and runs Dijkstra and Floyd–Warshall. The results come back as step-by-step playback and stats."
            steps={[
              { title: "Next.js UI", dark: true },
              { title: "FastAPI" },
              { title: "Campus graph", sub: ["50+ buildings", "70+ edges"] },
              { title: ["Dijkstra /", "Floyd–Warshall"] },
              { title: ["Playback", "+ stats"] },
            ]}
          />
        </CaseFigure>
        <CaseFigure caption="Try it: a small cousin of this project, the same grid as on the home page with Dijkstra selected. Click a square to route to it.">
          <div className="on-night bg-night p-4 text-cream sm:p-6">
            <Pathfinder initialAlgo="dijkstra" />
          </div>
        </CaseFigure>
      </CaseSection>
    </>
  );
}
