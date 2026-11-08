import { CaseSection, CasePoint, CaseFigure } from "@/components/case/parts";
import FlowDiagram from "@/components/case/FlowDiagram";

export const meta = {
  slug: "cougar-connection",
  title: "Cougar Connection",
  summary: "A CRM for the SIUE School of Engineering’s outreach to high schools, built by a four-person capstone team.",
  facts: [
    { label: "Role", value: "Frontend / UI and full-stack, on a team of four" },
    { label: "Context", value: "SIUE CS499 capstone, for a real client" },
    {
      label: "Stack",
      value: "React 19 · TypeScript · Vite · Tailwind v4 · React Router 7 · Supabase (Postgres + auth) · Python scraper",
      wide: true,
    },
  ],
};

export function Body() {
  return (
    <>
      <CaseSection num="01" label="The problem" title="Keeping track of outreach">
        <p>
          The SIUE School of Engineering reaches out to high schools in Illinois and Missouri. Cougar Connection is the
          CRM for that work: it keeps track of the schools, the people there, and the events. It was our CS499 capstone,
          built by four of us for the School of Engineering as a real client.
        </p>
      </CaseSection>

      <CaseSection num="02" label="How it works" title="A React app on Supabase, fed by a scraper">
        <p>
          The app is React 19 with TypeScript, built with Vite and styled with Tailwind v4, with React Router 7 for
          pages. Supabase provides the Postgres database and sign-in. A separate Python scraper writes school data
          straight into Postgres, and the app reads it from there.
        </p>
        <CaseFigure caption="Arrows show which way data moves.">
          <FlowDiagram
            title="Cougar Connection architecture"
            desc="A Python scraper writes school data into Supabase (Postgres and auth). The React app reads and writes through Supabase, and exports filtered contact lists as email lists and mailing labels."
            steps={[
              { title: "Python scraper", sub: "school data" },
              { title: "Supabase", sub: ["Postgres + auth"] },
              { title: "React app", sub: ["React 19 · TypeScript"], dark: true },
              { title: "Exports", sub: ["email list", "mailing labels"] },
            ]}
            links={["→", "↔", "→"]}
          />
        </CaseFigure>
        <p>What it does:</p>
        <ul>
          <li>County-level engagement analytics, with color-coded rate badges.</li>
          <li>Bulk import from CSV and Excel, with the column mapping done in the browser.</li>
          <li>Filtered contact lists, exported for email and for mailing labels.</li>
        </ul>
      </CaseSection>

      <CaseSection num="03" label="Decisions" title="Built to be handed over">
        <CasePoint title="Only SIUE accounts, with two-factor sign-in">
          <p>
            As a team, we decided that sign-up is limited to @siue.edu email addresses, and that every account has to
            use TOTP two-factor authentication.
          </p>
        </CasePoint>
        <CasePoint title="Stability over features">
          <p>
            The app was built to be handed off to the client, so stability and keeping it easy to maintain later came
            first.
          </p>
        </CasePoint>
        <CasePoint title="No data gets deleted">
          <p>We had a standing rule for the whole project: no data gets deleted during development.</p>
        </CasePoint>
      </CaseSection>
    </>
  );
}
