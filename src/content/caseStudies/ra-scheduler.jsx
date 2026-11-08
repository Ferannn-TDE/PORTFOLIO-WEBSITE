import { CaseSection, CaseFigure } from "@/components/case/parts";
import FlowDiagram from "@/components/case/FlowDiagram";

export const meta = {
  slug: "ra-scheduler",
  title: "RA Shift Scheduler",
  summary: "A scheduling platform for Resident Assistant shifts across campus housing.",
  facts: [{ label: "Stack", value: "React · TypeScript · Calendar API" }],
};

export function Body() {
  return (
    <>
      <CaseSection num="01" label="The problem" title="Shifts across campus housing">
        <p>RA Shift Scheduler handles shift scheduling for Resident Assistants across campus housing.</p>
      </CaseSection>

      <CaseSection num="02" label="How it works" title="From availability to a monthly roster">
        <p>
          RAs give their availability, shifts are assigned automatically, the results go to the calendar with
          notifications, and the month&apos;s roster shows on a dashboard.
        </p>
        <CaseFigure caption="How a schedule gets made.">
          <FlowDiagram
            title="RA Shift Scheduler flow"
            desc="Availability goes into automated shift assignment. Assigned shifts go to the calendar and to notifications, and the monthly roster shows on a dashboard."
            steps={[
              { title: "Availability" },
              { title: "Assignment", sub: "automated" },
              { title: ["Calendar +", "notifications"] },
              { title: "Roster", sub: "monthly dashboard", dark: true },
            ]}
          />
        </CaseFigure>
        <p>What it does:</p>
        <ul>
          <li>Automated shift assignment.</li>
          <li>Calendar integration.</li>
          <li>Availability tracking.</li>
          <li>Real-time notifications.</li>
          <li>Morning and evening shift toggles.</li>
          <li>User management.</li>
          <li>A dashboard for monthly rosters.</li>
        </ul>
      </CaseSection>
    </>
  );
}
