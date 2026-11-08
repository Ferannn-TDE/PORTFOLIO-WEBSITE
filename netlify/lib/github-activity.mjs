// Builds the "last pushed" strip data from the public GitHub API.
// Pushes per week cover the last WEEKS weeks.
// Dependencies (fetch, clock, timeout) are injected so it can be unit-tested.

export const GITHUB_USER = "Ferannn-TDE";
// The public events API only returns roughly the last 30 days of events, so
// four full weeks is the longest window it can describe truthfully.
export const WEEKS = 4;
const API = "https://api.github.com";
const DAY = 24 * 60 * 60 * 1000;
const MAX_MESSAGE = 72;
const MAX_EVENT_PAGES = 3; // the events API returns at most 300 events

export const HEADERS_OK = {
  "Content-Type": "application/json; charset=utf-8",
  // Browsers always revalidate; Netlify's CDN keeps one shared copy for 15 min.
  "Cache-Control": "public, max-age=0, must-revalidate",
  "Netlify-CDN-Cache-Control": "public, durable, max-age=900, stale-while-revalidate=3600",
};

// Failures are cached briefly so a rate limit is not hammered, but recover soon.
export const HEADERS_UNAVAILABLE = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "public, max-age=0, must-revalidate",
  "Netlify-CDN-Cache-Control": "public, durable, max-age=60",
};

export class GitHubError extends Error {
  constructor(reason, status) {
    super(reason);
    this.reason = reason;
    this.status = status;
  }
}

async function getJSON(fetchImpl, url, timeoutMs) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  let res;
  try {
    res = await fetchImpl(url, {
      signal: ctrl.signal,
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "ferans-portfolio-activity-strip",
      },
    });
  } catch (err) {
    throw new GitHubError(err?.name === "AbortError" ? "timeout" : "network", 0);
  } finally {
    clearTimeout(timer);
  }
  const limited =
    res.status === 429 ||
    (res.status === 403 && (res.headers.get("x-ratelimit-remaining") === "0" || res.headers.has("retry-after")));
  if (limited) {
    throw new GitHubError("rate-limited", res.status);
  }
  if (!res.ok) throw new GitHubError("http-error", res.status);
  return res.json();
}

export function firstLine(message, max = MAX_MESSAGE) {
  const line = String(message ?? "").split("\n")[0].trim();
  return line.length > max ? `${line.slice(0, max - 1).trimEnd()}…` : line;
}

// Pushes per week, oldest first; the last bucket is the 7 days up to `now`.
export function weeklyCounts(timestamps, now, weeks = WEEKS) {
  const counts = new Array(weeks).fill(0);
  for (const t of timestamps) {
    const age = now - t;
    if (age < 0) continue;
    const w = Math.floor(age / (7 * DAY));
    if (w < weeks) counts[weeks - 1 - w] += 1;
  }
  return counts;
}

export async function getActivity({ fetch: fetchImpl = fetch, now = Date.now(), timeoutMs = 3000, user = GITHUB_USER } = {}) {
  const since = now - WEEKS * 7 * DAY;

  // Repo list gives the fork flag; the events payload does not.
  const reposPromise = getJSON(fetchImpl, `${API}/users/${user}/repos?type=owner&per_page=100`, timeoutMs);
  reposPromise.catch(() => {}); // awaited below; avoid an unhandled rejection meanwhile

  const events = [];
  for (let page = 1; page <= MAX_EVENT_PAGES; page++) {
    const batch = await getJSON(fetchImpl, `${API}/users/${user}/events/public?per_page=100&page=${page}`, timeoutMs);
    events.push(...batch);
    const oldest = batch.length ? Date.parse(batch[batch.length - 1].created_at) : 0;
    if (batch.length < 100 || oldest < since) break;
  }

  const repos = await reposPromise;
  const forks = new Set(repos.filter((r) => r.fork).map((r) => r.full_name.toLowerCase()));
  const privateRepos = new Set(repos.filter((r) => r.private).map((r) => r.full_name.toLowerCase()));

  const pushes = events.filter((e) => {
    if (e.type !== "PushEvent" || e.public === false) return false;
    const name = String(e.repo?.name ?? "").toLowerCase();
    return !forks.has(name) && !privateRepos.has(name);
  });

  const latest = pushes[0]; // events come newest first
  if (!latest) return { available: false, reason: "no-recent-pushes" };

  const repo = latest.repo.name;
  const sha = latest.payload?.head;
  if (!sha) return { available: false, reason: "no-commit" };

  // PushEvent payloads no longer include commits, so fetch the head commit.
  const commit = await getJSON(fetchImpl, `${API}/repos/${repo}/commits/${sha}`, timeoutMs);

  return {
    available: true,
    repo,
    repoUrl: `https://github.com/${repo}`,
    commitUrl: commit.html_url ?? `https://github.com/${repo}/commit/${sha}`,
    message: firstLine(commit.commit?.message),
    pushedAt: latest.created_at,
    weeks: weeklyCounts(
      pushes.map((e) => Date.parse(e.created_at)).filter((t) => t >= since),
      now
    ),
  };
}

// Request handler shared by the Netlify Function and the local preview server.
export async function handle(deps = {}) {
  try {
    const data = await getActivity(deps);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: data.available ? HEADERS_OK : HEADERS_UNAVAILABLE,
    });
  } catch (err) {
    const reason = err instanceof GitHubError ? err.reason : "error";
    return new Response(JSON.stringify({ available: false, reason }), {
      status: 200,
      headers: HEADERS_UNAVAILABLE,
    });
  }
}
