import { CaseSection, CasePoint, CaseFigure } from "@/components/case/parts";
import FlowDiagram from "@/components/case/FlowDiagram";

export const meta = {
  slug: "safesite",
  title: "SafeSite",
  summary: "A mobile-first construction-safety inspection app, designed and prototyped through a full HCI process.",
  facts: [
    { label: "Process", value: "HCI: two rounds of user testing, heuristic evaluation" },
    { label: "Stack", value: "React · Tailwind CSS" },
  ],
};

export function Body() {
  return (
    <>
      <CaseSection num="01" label="The problem" title="A safety inspection, one shift at a time">
        <p>
          SafeSite guides construction workers through a shift as one workflow in four parts, on their phone. I designed
          and prototyped it through a full HCI process.
        </p>
      </CaseSection>

      <CaseSection num="02" label="How it works" title="Four steps, in order">
        <p>
          A shift starts with a PPE checklist, moves to a color-coded floor plan, then hazard reporting with GPS tags and
          severity levels, and ends with a supervisor signing off after the shift.
        </p>
        <CaseFigure caption="The shift workflow.">
          <FlowDiagram
            title="SafeSite shift workflow"
            desc="Four steps in order: a PPE checklist, a color-coded floor plan, GPS-tagged hazard reporting with severity levels, and a post-shift supervisor sign-off."
            steps={[
              { title: "PPE checklist", sub: "step 1" },
              { title: "Floor plan", sub: ["step 2", "color-coded"] },
              { title: "Hazard report", sub: ["step 3", "GPS + severity"] },
              { title: "Sign-off", sub: ["step 4", "supervisor"] },
            ]}
          />
        </CaseFigure>
      </CaseSection>

      <CaseSection num="03" label="What I learned" title="Testing it, then checking it">
        <CasePoint title="Two rounds of user testing">
          <p>I refined the design across two rounds of user testing, with each round shaping the next version.</p>
        </CasePoint>
        <CasePoint title="A heuristic evaluation">
          <p>
            A Nielsen heuristic evaluation surfaced eleven usability issues. All eleven were resolved before the final
            prototype.
          </p>
        </CasePoint>
      </CaseSection>
    </>
  );
}
