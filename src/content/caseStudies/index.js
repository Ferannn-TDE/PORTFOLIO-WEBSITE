import { caseStudySlugs } from "./slugs";
import * as fairsynq from "./fairsynq.jsx";
import * as cougarConnection from "./cougar-connection.jsx";
import * as campusRouting from "./campus-routing.jsx";
import * as httpProxy from "./http-proxy.jsx";
import * as safesite from "./safesite.jsx";
import * as raScheduler from "./ra-scheduler.jsx";

// Case study registry. Content is small, so it ships inside the case study
// page chunk (one request after the main bundle, not two).
//
// To add one: create <slug>.jsx exporting `meta` and `Body`, import it here,
// add the slug to slugs.js, add a 200 rule to netlify.toml, and point the
// project's `href` in src/data/projects.js at /work/<slug>.
const modules = {
  fairsynq,
  "cougar-connection": cougarConnection,
  "campus-routing": campusRouting,
  "http-proxy": httpProxy,
  safesite,
  "ra-scheduler": raScheduler,
};

export function getCaseStudy(slug) {
  return caseStudySlugs.includes(slug) ? (modules[slug] ?? null) : null;
}
