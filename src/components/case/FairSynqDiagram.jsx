import { useId } from "react";
import { Arrow, Box, Edge, Responsive } from "./svg";
import { svgId } from "@/lib/svgId";

// FairSynq architecture. Two layouts of the same diagram: wide (640px and up)
// and stacked (phones). Only one is displayed at a time.

const DESC =
  "People (customers, vendors, runners and organizers) use a Next.js app hosted on Vercel. " +
  "The app uses Clerk for sign-in and roles, Postgres on Supabase through Prisma for data, " +
  "Stripe Connect for payments with separate charges and transfers, and Firebase to push live order status. " +
  "The app puts scheduling and payout jobs on a Redis queue, which a BullMQ worker processes; " +
  "the worker updates Postgres and creates Stripe transfers. Firebase sends live status back to people.";

function Wide({ ids }) {
  const m = `${ids}-m`;
  return (
    <svg viewBox="0 0 960 480" role="img" aria-labelledby={`${ids}-t ${ids}-d`} className="h-auto w-full">
      <title id={`${ids}-t`}>FairSynq architecture</title>
      <desc id={`${ids}-d`}>{DESC}</desc>
      <Arrow id={m} />
      <Box x={20} y={180} w={190} h={80} title="People" sub={["customers · vendors", "runners · organizers"]} />
      <Box x={300} y={170} w={230} h={100} title="Next.js app" sub={["hosted on Vercel"]} dark />
      <Box x={660} y={20} w={280} h={64} title="Clerk" sub="sign-in, multi-role auth" />
      <Box x={660} y={110} w={280} h={64} title="Postgres" sub="Supabase, via Prisma" />
      <Box x={660} y={200} w={280} h={64} title="Stripe Connect" sub="separate charges and transfers" />
      <Box x={660} y={290} w={280} h={64} title="Firebase" sub="realtime order status" />
      <Box x={300} y={350} w={230} h={72} title="BullMQ worker" sub={["Redis queue:", "scheduling, payouts"]} />

      <Edge d="M210,220 L298,220" marker={m} />
      <Edge d="M530,205 L658,52" marker={m} />
      <Edge d="M530,214 L658,142" marker={m} />
      <Edge d="M530,226 L658,232" marker={m} />
      <Edge d="M530,236 L658,320" marker={m} />
      <Edge d="M415,270 L415,348" label="enqueue jobs" lx={424} ly={314} marker={m} />
      <Edge d="M530,372 L658,160" marker={m} />
      <Edge d="M530,392 L658,252" label="transfers" lx={566} ly={350} marker={m} />
      <Edge d="M800,354 L800,462 L115,462 L115,262" label="live status" lx={600} ly={455} marker={m} />
    </svg>
  );
}

function Stacked({ ids }) {
  const m = `${ids}-m`;
  const services = [
    ["Clerk", "sign-in, multi-role auth"],
    ["Postgres", "Supabase, via Prisma"],
    ["Stripe Connect", "charges and transfers"],
    ["Firebase", "realtime order status"],
  ];
  return (
    <svg viewBox="0 0 340 700" role="img" aria-labelledby={`${ids}-t ${ids}-d`} className="h-auto w-full">
      <title id={`${ids}-t`}>FairSynq architecture</title>
      <desc id={`${ids}-d`}>{DESC}</desc>
      <Arrow id={m} />
      <Box x={20} y={10} w={280} h={78} title="People" sub={["customers · vendors", "runners · organizers"]} />
      <Edge d="M160,88 L160,126" marker={m} />
      <Box x={20} y={128} w={280} h={70} title="Next.js app" sub="hosted on Vercel" dark />
      {/* rail from the app to each service */}
      <path d="M40,198 L40,512" className="stroke-ink" strokeWidth="1" fill="none" />
      {services.map(([title, sub], i) => {
        const y = 222 + i * 74;
        return (
          <g key={title}>
            <Edge d={`M40,${y + 30} L68,${y + 30}`} marker={m} />
            <Box x={70} y={y} w={250} h={60} title={title} sub={sub} />
          </g>
        );
      })}
      <Edge d="M40,512 L40,560 L68,560" label="enqueue jobs" lx={76} ly={546} marker={m} />
      <Box x={70} y={530} w={250} h={72} title="BullMQ worker" sub={["Redis queue:", "scheduling, payouts"]} />
      {/* live status back to people */}
      <Edge d="M320,474 L332,474 L332,49 L302,49" label="live status" lx={240} ly={110} marker={m} />
      <text x={70} y={630} className="fill-muted font-mono text-[10px]">
        worker → Postgres, Stripe transfers
      </text>
    </svg>
  );
}

export default function FairSynqDiagram() {
  const ids = svgId(useId());
  return <Responsive wide={<Wide ids={`w${ids}`} />} stacked={<Stacked ids={`s${ids}`} />} />;
}
