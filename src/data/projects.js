// Selected work. Each row links to its case study (`href`). The case study
// header shows `repo` and `live` when they are set; to add a live demo later,
// set `live` here. A project with no href and no repo renders as a plain row.
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
    live: null, // TODO: live link, confirm with the client first. Final: https://www.fairsynq.com
  },
  {
    slug: "cougar-connection",
    title: "Cougar Connection",
    tag: "Capstone team · Real client",
    description:
      "A CRM for the SIUE School of Engineering’s outreach to high schools: county‑level engagement analytics, CSV/Excel bulk import with column mapping, and filtered exports for email and mailing labels.",
    stack: ["React · TypeScript", "Supabase"],
    href: "/work/cougar-connection",
    repo: "https://github.com/Ferannn-TDE/School-Engagement-CRM",
    live: "https://school-engagement-crm.vercel.app/",
  },
  {
    slug: "campus-routing",
    title: "Campus Routing Visualizer",
    tag: "Algorithms · Full stack",
    description:
      "Dijkstra and Floyd–Warshall side by side over 50+ SIUE buildings, with step‑by‑step playback and run‑time, nodes‑visited and edges‑relaxed stats. (The hero above is a tiny cousin of it.)",
    stack: ["Next.js · FastAPI", "Graph algorithms"],
    href: "/work/campus-routing",
    repo: "https://github.com/Ferannn-TDE/Algo-Main",
    live: null,
  },
  {
    slug: "http-proxy",
    title: "HTTP Security Proxy",
    tag: "Systems · C++",
    description:
      "A multi‑threaded proxy that relays traffic both ways, blocks prohibited IPs with a local 403 before touching the origin, and closes with a clean FIN instead of a reset.",
    stack: ["C++ · Winsock", "TCP · Threads"],
    href: "/work/http-proxy",
    repo: "https://github.com/Ferannn-TDE/cs447-http-security-proxy",
    live: null,
  },
  {
    slug: "safesite",
    title: "SafeSite",
    tag: "HCI research · Mobile",
    description:
      "A construction‑safety inspection app taken through a full HCI process: two rounds of user testing and a heuristic evaluation that surfaced eleven issues, all fixed before the final prototype.",
    stack: ["React · Tailwind", "User research"],
    href: "/work/safesite",
    repo: "https://github.com/Ferannn-TDE/Safe-Site",
    live: null,
  },
  {
    slug: "ra-scheduler",
    title: "RA Shift Scheduler",
    tag: "Campus housing · Scheduling",
    description:
      "Shift assignment, availability tracking and monthly rosters for Resident Assistants across campus housing.",
    stack: ["React · TypeScript", "Calendar API"],
    href: "/work/ra-scheduler",
    repo: null, // TODO: repo URL
    live: null,
  },
];

export const projectLink = (p) => p.href || p.repo || null;

export const smallerBuilds = [
  { title: "Recipe app", url: null }, // TODO: link
  { title: "Family Feud", url: "https://family-feud-roan.vercel.app/" },
  { title: "Tic‑Tac‑Toe", url: "https://ferans-tic-tac-toe-demo-game.netlify.app/" },
];
