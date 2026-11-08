// Title and description for every route. Used in two places:
//  - the pages themselves (usePageMeta), for in-app navigation, and
//  - the build, which writes a static HTML file per route with these tags so
//    link previews (which don't run JavaScript) show the right page.
// Plain JS on purpose: vite.config.js imports it.

export const routeMeta = {
  "/": {
    title: "Feran Odedairo — Software Engineer",
    description:
      "Feran Odedairo, software engineer and CS student building full-stack products that hold up when real people use them.",
  },
  "/work/fairsynq": {
    title: "FairSynq case study — Feran Odedairo",
    description:
      "Case study: FairSynq, a multi-vendor ordering platform for live fairs. Architecture, payout design, and the race conditions found during live operations.",
  },
  "/work/cougar-connection": {
    title: "Cougar Connection case study — Feran Odedairo",
    description:
      "Case study: Cougar Connection, a CRM for the SIUE School of Engineering's outreach to high schools, built by a four-person capstone team.",
  },
  "/work/campus-routing": {
    title: "Campus Routing Visualizer case study — Feran Odedairo",
    description:
      "Case study: a full-stack tool that runs Dijkstra and Floyd–Warshall side by side on a graph of the SIUE campus, with step-by-step playback.",
  },
  "/work/http-proxy": {
    title: "HTTP Security Proxy & TCP Server case study — Feran Odedairo",
    description:
      "Case study: a multi-threaded HTTP proxy in C++ with Winsock that relays traffic both ways and answers blocked clients with a local 403.",
  },
  "/work/safesite": {
    title: "SafeSite case study — Feran Odedairo",
    description:
      "Case study: SafeSite, a mobile-first construction-safety inspection app designed through two rounds of user testing and a heuristic evaluation.",
  },
  "/work/ra-scheduler": {
    title: "RA Shift Scheduler case study — Feran Odedairo",
    description: "Case study: RA Shift Scheduler, a scheduling platform for Resident Assistant shifts across campus housing.",
  },
  "/colophon": {
    title: "Colophon — Feran Odedairo",
    description: "How this site is built: type, colour, stack, how the pathfinder works, and accessibility notes.",
  },
  "/404": {
    title: "Path not found — Feran Odedairo",
    description: "This page doesn't exist. Head back to the home page or search the site.",
    noindex: true,
  },
};
