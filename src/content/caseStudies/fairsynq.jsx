import { CaseSection, CasePoint, CaseFigure } from "@/components/case/parts";
import FairSynqDiagram from "@/components/case/FairSynqDiagram";
import Todo from "@/components/Todo";

// Draft copy. Every factual claim carries a <Todo> until confirmed.
// Keep out: client and event names, internal file paths, environment
// variable names, and how access checks work internally.

export const meta = {
  slug: "fairsynq",
  title: "FairSynq",
  summary: "A multi-vendor ordering platform for live fairs, built solo.",
  facts: [
    { label: "Role", value: "Solo developer", todo: "confirm wording" },
    { label: "Stack", value: "Next.js · TypeScript · Supabase (Postgres) · Prisma · Clerk · Stripe Connect · BullMQ · Redis · Firebase", wide: true },
    { label: "Year", value: null, todo: "year(s) built" },
  ],
  // Shown until the live link is confirmed and set as `live` in src/data/projects.js.
  pendingLinks: [{ label: "Live demo", todo: "live link — confirm with client before publishing" }],
};

export function Body() {
  return (
    <>
      <CaseSection num="01" label="The problem" title="Four kinds of user, one fair">
        <p>
          A live fair has four groups who need different things at the same moment. Organizers set up the fair and
          decide which vendors take part. Vendors run their own menus and orders. Runners carry orders from vendor to
          customer. Customers just want to order from several stalls without standing in several queues.{" "}
          <Todo>confirm the four roles and what each one does</Todo>
        </p>
        <p>
          That makes it a multi-sided marketplace with real money in the middle: one customer payment can be owed to
          several vendors, and orders have to keep moving while the fair is busy.{" "}
          <Todo>confirm that one checkout can span several vendors</Todo>
        </p>
      </CaseSection>

      <CaseSection num="02" label="Architecture" title="One app, a queue, and the services around it">
        <p>
          The web app is Next.js on Vercel. Data lives in Postgres on Supabase, accessed through Prisma. Clerk handles
          sign-in and the different roles. Stripe Connect moves the money. A BullMQ worker on a Redis queue runs the
          work that should not depend on a web request, and Firebase pushes live order status to people&apos;s screens.
        </p>
        <CaseFigure
          caption={
            <>
              Arrows show which part calls which. <Todo>confirm the worker → Postgres and worker → Stripe edges, and that the app writes status to Firebase</Todo>
            </>
          }
        >
          <FairSynqDiagram />
        </CaseFigure>
      </CaseSection>

      <CaseSection num="03" label="Decisions" title="Three decisions and what they cost">
        <CasePoint title="Separate charges and transfers for payouts">
          <p>
            The customer pays the platform once, and each vendor&apos;s share is sent as its own transfer afterwards.
            That keeps one checkout even when an order covers several vendors, and it leaves room to handle refunds and
            adjustments before money goes out. <Todo>confirm the reasons</Todo>
          </p>
          <p>
            The cost is bookkeeping. The platform holds the money in between, so it has to know at all times what has
            been charged, what is owed, and what has already been transferred.
          </p>
        </CasePoint>
        <CasePoint title="A queue-based worker instead of work inside requests">
          <p>
            Order scheduling and payouts run as jobs on a queue, picked up by a worker. A web request can time out or
            be retried by the browser; a job can be retried on purpose and its progress recorded.{" "}
            <Todo>confirm which jobs run on the queue</Todo>
          </p>
          <p>The cost is one more moving part to run and watch: Redis and the worker process.</p>
        </CasePoint>
        <CasePoint title="One rule, one place">
          <p>
            Two copies of one derivation drift apart, and eventually one of them lies. The rule for what counts as a
            sellable item lived in six places; I collapsed it into one shared predicate. The vendor-documents check had
            seven readers that had drifted apart; they now all go through one helper. Both are guarded by tests that I
            checked fail when the rule regresses.
          </p>
        </CasePoint>
      </CaseSection>

      <CaseSection num="04" label="What broke" title="What broke during live fairs, and the fixes">
        <p>These came up during live fair operations.</p>
        <CasePoint title="Check-then-act on vendor status">
          <p>
            A race between checking a vendor&apos;s status and acting on it. <Todo>real fix</Todo>
          </p>
        </CasePoint>
        <CasePoint title="Refund versus payout">
          <p>
            A race between a refund and a payout for the same order. <Todo>real fix</Todo>
          </p>
        </CasePoint>
        <CasePoint title="A transfer sent but not marked">
          <p>
            A transfer went out but was not recorded as sent. <Todo>real fix</Todo>
          </p>
        </CasePoint>
        <CasePoint title="A timer that fired far too early">
          <p>
            A timer armed at order placement fired about 128 seconds later, far earlier than it should have. I widened it
            to 10 minutes and stopped arming it when the fair isn&apos;t open.
          </p>
        </CasePoint>
      </CaseSection>

      <CaseSection num="05" label="Next" title="What I'd do next">
        <ul>
          <li>
            Load-test a full fair&apos;s worth of orders before the next live event, instead of finding races in
            production.
          </li>
          <li>End-to-end tests around every path that moves money: charge, refund, transfer, retry.</li>
          <li>A daily reconciliation report that compares Stripe with the database and flags any difference.</li>
          <li>Better visibility into the worker: queue depth, failed jobs, and how long jobs wait.</li>
        </ul>
        <p>
          <Todo>confirm these are the right next steps</Todo>
        </p>
      </CaseSection>
    </>
  );
}
