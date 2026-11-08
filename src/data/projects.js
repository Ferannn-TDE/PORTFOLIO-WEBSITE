// Selected work. `href` is internal (case study); `repo` is external.
// A project with neither renders as a plain row: no link, no arrow, not in the palette.
export const projects = [
  {
    slug: "fairsynq",
    title: "FairSynq",
    tag: "Solo build · Marketplace",
    description:
      "Multi‑vendor ordering for live events. Vendors run menus and orders in real time; organizers run multi‑fair marketplaces with Stripe Connect payouts and queue‑based order scheduling.",
    stack: ["Next.js · TypeScript", "Supabase · Stripe Connect", "BullMQ · Clerk"],
    href: "/work/fairsynq",
    repo: null,
  },
  {
    slug: "cougar-connection",
    title: "Cougar Connection",
    tag: "Capstone team · Real client",
    description:
      "A CRM for the SIUE School of Engineering’s K–12 outreach: county‑level engagement analytics, CSV/Excel bulk import with column mapping, and filtered exports for email and mailing labels.",
    stack: ["React · TypeScript", "Supabase"],
    href: null,
    repo: "https://github.com/Ferannn-TDE/School-Engagement-CRM",
  },
  {
    slug: "campus-routing",
    title: "Campus Routing Visualizer",
    tag: "Algorithms · Full stack",
    description:
      "Dijkstra and Floyd–Warshall side by side over 50+ SIUE buildings, with step‑by‑step playback and run‑time, nodes‑visited and edges‑relaxed stats. (The hero above is a tiny cousin of it.)",
    stack: ["Next.js · FastAPI", "Graph algorithms"],
    href: null,
    repo: "https://github.com/Ferannn-TDE/Algo-Main",
  },
  {
    slug: "http-proxy",
    title: "HTTP Security Proxy",
    tag: "Systems · C++",
    description:
      "A multi‑threaded proxy that relays traffic both ways, blocks prohibited IPs with a local 403 before touching the origin, and closes with a clean FIN instead of a reset.",
    stack: ["C++ · Winsock", "TCP · Threads"],
    href: null,
    repo: "https://github.com/Ferannn-TDE/cs447-http-security-proxy",
  },
  {
    slug: "safesite",
    title: "SafeSite",
    tag: "HCI research · Mobile",
    description:
      "A construction‑safety inspection app taken through a full HCI process: two rounds of user testing and a heuristic evaluation that surfaced eleven issues, all fixed before the final prototype.",
    stack: ["React · Tailwind", "User research"],
    href: null,
    repo: "https://github.com/Ferannn-TDE/Safe-Site",
  },
  {
    slug: "ra-scheduler",
    title: "RA Shift Scheduler",
    tag: "Campus housing · Scheduling",
    description:
      "Shift assignment, availability tracking and monthly rosters for Resident Assistants across campus housing.",
    stack: ["React · TypeScript", "Calendar API"],
    href: null,
    repo: null, // TODO: repo URL
  },
];

export const projectLink = (p) => p.href || p.repo || null;

export const smallerBuilds = [
  { title: "Recipe app", url: null }, // TODO: link
  { title: "Family Feud", url: "https://family-feud-roan.vercel.app/" },
  { title: "Tic‑Tac‑Toe", url: "https://ferans-tic-tac-toe-demo-game.netlify.app/" },
];
