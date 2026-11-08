// GET /.netlify/functions/github-activity
// Latest public push (skipping forks) and pushes per week for the last four weeks.
// Cached on Netlify's CDN for 15 minutes; see netlify/lib/github-activity.mjs.
import { handle } from "../lib/github-activity.mjs";

export default async () => handle();
