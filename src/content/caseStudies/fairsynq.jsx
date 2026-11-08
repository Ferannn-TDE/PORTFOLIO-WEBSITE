import { CaseSection, CasePoint, CaseFigure } from "@/components/case/parts";
import FairSynqDiagram from "@/components/case/FairSynqDiagram";

// Keep out: client and event names, internal file paths, environment
// variable names, and how access checks work internally.

export const meta = {
  slug: "fairsynq",
  title: "FairSynq",
  summary: "A multi-vendor ordering platform for live fairs, built solo.",
  facts: [
    { label: "Role", value: "Solo developer, from build to live-event operations" },
    { label: "Stack", value: "Next.js · TypeScript · Supabase (Postgres) · Prisma · Clerk · Stripe Connect · BullMQ · Redis · Firebase", wide: true },
    { label: "Years", value: "March 2026 – present" },
  ],
};

export function Body() {
  return (
    <>
      <CaseSection num="01" label="The problem" title="Four kinds of user, one fair">
        <p>
          At its first live fair, FairSynq had four kinds of user. Organizers created fairs, approved vendors and ran the
          marketplace. Vendors managed their menus, orders and payouts. Runners handled order delivery. Customers browsed
          and ordered.
        </p>
        <p>
          That makes it a marketplace with real money in the middle: customers order from vendors across a fair, and
          every vendor has to be paid their share.
        </p>
      </CaseSection>

      <CaseSection num="02" label="Architecture" title="One app, a queue, and the services around it">
        <p>
          The web app is Next.js on Vercel. Data lives in Postgres on Supabase, accessed through Prisma. Clerk handles
          sign-in and the different roles. Stripe Connect moves the money. A BullMQ worker on a Redis queue runs order
          scheduling, order-acceptance timeouts and vendor payouts. The app writes live order status to Firebase
          Realtime Database, which pushes it to people&apos;s screens.
        </p>
        <CaseFigure caption="Arrows show which part calls which.">
          <FairSynqDiagram />
        </CaseFigure>
      </CaseSection>

      <CaseSection num="03" label="Decisions" title="Two decisions and what they cost">
        <CasePoint title="Separate charges and transfers for payouts">
          <p>
            The platform takes the customer&apos;s payment once, then pays each vendor their share on its own schedule.
            That means payouts can wait until orders are fulfilled, and the platform controls refunds before any money
            leaves.
          </p>
          <p>
            The cost is bookkeeping. The platform holds the money in between, so it has to know at all times what has
            been charged, what is owed, and what has already been transferred.
          </p>
        </CasePoint>
        <CasePoint title="A queue-based worker instead of work inside requests">
          <p>
            Order scheduling, order-acceptance timeouts and vendor payouts run as jobs on a queue, picked up by a worker.
            A web request can time out or be retried by the browser; a job can be retried on purpose and its progress
            recorded.
          </p>
          <p>The cost is one more moving part to run and watch: Redis and the worker process.</p>
        </CasePoint>
      </CaseSection>

      <CaseSection num="04" label="What broke" title="What broke, and how I fixed it">
        <p>Two problems, and what I changed.</p>
        <CasePoint title="A timer that fired far too early">
          <p>
            The order-acceptance timer, armed when an order was placed, fired about 128 seconds later, far earlier than
            it should have. I widened it to 10 minutes and stopped arming it when the fair isn&apos;t open.
          </p>
        </CasePoint>
        <CasePoint title="One rule in six places">
          <p>
            Two copies of one derivation drift apart, and eventually one of them lies. The rule for what counts as a
            sellable item lived in six places; I collapsed it into one shared predicate. The vendor-documents check had
            seven readers that had drifted apart; they now all go through one helper. Both are guarded by tests that I
            checked fail when the rule regresses.
          </p>
        </CasePoint>
      </CaseSection>

      <CaseSection num="05" label="Next" title="What I'd do next">
        <p>
          Hardening for full launch: one consistent design language across every portal, an audit of every action (with
          confirmation on anything destructive), and clearer onboarding for organizers and vendors.
        </p>
      </CaseSection>
    </>
  );
}
