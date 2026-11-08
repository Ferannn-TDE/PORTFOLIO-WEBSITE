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
