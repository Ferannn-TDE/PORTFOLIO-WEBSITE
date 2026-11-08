// Builds the "last pushed" strip data from the GitHub API.
//
// Latest push: REST events (newest public PushEvent, forks skipped via the
// repo list) plus one call for the head commit's message.
//
// Weekly activity:
//   - With GITHUB_TOKEN: commits per week for the last 12 weeks from GraphQL
//     contributionsCollection, counting only public, non-fork repositories.
//     (contributionCalendar is not used: for the token's own account it also
//     counts private contributions.)
//   - Without a token, or if GraphQL fails: pushes per week for the last 4
//     weeks from the events API, which only covers roughly 30 days.
//
// The token is read server-side only and sent only to api.github.com.
// Dependencies (fetch, clock, timeout, token) are injected for unit tests.

export const GITHUB_USER = "Ferannn-TDE";
export const COMMIT_WEEKS = 12;
export const PUSH_WEEKS = 4;
const API = "https://api.github.com";
const DAY = 24 * 60 * 60 * 1000;
const WEEK = 7 * DAY;
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

const CONTRIBUTIONS_QUERY = `query ($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      commitContributionsByRepository(maxRepositories: 100) {
        repository { nameWithOwner isPrivate isFork }
        contributions(first: 100) { nodes { occurredAt commitCount } }
      }
    }
  }
}`;

async function request(fetchImpl, url, { timeoutMs, token, method = "GET", body } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "ferans-portfolio-activity-strip",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers["Content-Type"] = "application/json";
  let res;
  try {
    res = await fetchImpl(url, { method, headers, body, signal: ctrl.signal });
  } catch (err) {
    throw new GitHubError(err?.name === "AbortError" ? "timeout" : "network", 0);
  } finally {
    clearTimeout(timer);
  }
  const limited =
    res.status === 429 ||
    (res.status === 403 && (res.headers.get("x-ratelimit-remaining") === "0" || res.headers.has("retry-after")));
  if (limited) throw new GitHubError("rate-limited", res.status);
  if (!res.ok) throw new GitHubError("http-error", res.status);
  return res.json();
}

export function firstLine(message, max = MAX_MESSAGE) {
  const line = String(message ?? "").split("\n")[0].trim();
  return line.length > max ? `${line.slice(0, max - 1).trimEnd()}…` : line;
}

// Sums [time, count] pairs into weekly buckets, oldest first; the last bucket
// is the 7 days up to `now`.
export function weeklyCounts(entries, now, weeks) {
  const counts = new Array(weeks).fill(0);
  for (const entry of entries) {
    const [t, n] = Array.isArray(entry) ? entry : [entry, 1];
    const age = now - t;
    if (age < 0) continue;
    const w = Math.floor(age / WEEK);
    if (w < weeks) counts[weeks - 1 - w] += n;
  }
  return counts;
}

// 12 weeks of commits to public, non-fork repositories. Throws on any failure
// (including GraphQL `errors`) so the caller can fall back.
export async function commitWeeks({ fetchImpl, now, timeoutMs, token, user }) {
  const to = new Date(now).toISOString();
  const from = new Date(now - COMMIT_WEEKS * WEEK).toISOString();
  const res = await request(fetchImpl, `${API}/graphql`, {
    timeoutMs,
    token,
    method: "POST",
    body: JSON.stringify({ query: CONTRIBUTIONS_QUERY, variables: { login: user, from, to } }),
  });
  if (res.errors?.length || !res.data?.user) throw new GitHubError("graphql-error", 200);
  const entries = [];
  for (const group of res.data.user.contributionsCollection.commitContributionsByRepository) {
    if (group.repository.isPrivate || group.repository.isFork) continue;
    for (const node of group.contributions.nodes) {
      entries.push([Date.parse(node.occurredAt), node.commitCount]);
    }
  }
  return weeklyCounts(entries, now, COMMIT_WEEKS);
}

export async function getActivity({
  fetch: fetchImpl = fetch,
  now = Date.now(),
  timeoutMs = 3000,
  user = GITHUB_USER,
  token = process.env.GITHUB_TOKEN,
} = {}) {
  const pushSince = now - PUSH_WEEKS * WEEK;
  const opts = { timeoutMs, token };

  // Repo list gives the fork flag; the events payload does not.
  const reposPromise = request(fetchImpl, `${API}/users/${user}/repos?type=owner&per_page=100`, opts);
  reposPromise.catch(() => {}); // awaited below; avoid an unhandled rejection meanwhile

  // Contribution weeks run alongside; any failure means "use the fallback".
  const commitsPromise = token
    ? commitWeeks({ fetchImpl, now, timeoutMs, token, user }).catch((err) => ({ failed: err?.reason ?? "error" }))
    : Promise.resolve({ failed: "no-token" });

  const events = [];
  for (let page = 1; page <= MAX_EVENT_PAGES; page++) {
    const batch = await request(fetchImpl, `${API}/users/${user}/events/public?per_page=100&page=${page}`, opts);
    events.push(...batch);
    const oldest = batch.length ? Date.parse(batch[batch.length - 1].created_at) : 0;
    if (batch.length < 100 || oldest < pushSince) break;
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
  const commit = await request(fetchImpl, `${API}/repos/${repo}/commits/${sha}`, opts);

  const commits = await commitsPromise;
  const activity = Array.isArray(commits)
    ? { kind: "commits", weeks: commits }
    : {
        kind: "pushes",
        weeks: weeklyCounts(
          pushes.map((e) => Date.parse(e.created_at)).filter((t) => t >= pushSince),
          now,
          PUSH_WEEKS
        ),
        fallback: commits.failed,
      };

  return {
    available: true,
    repo,
    repoUrl: `https://github.com/${repo}`,
    commitUrl: commit.html_url ?? `https://github.com/${repo}/commit/${sha}`,
    message: firstLine(commit.commit?.message),
    pushedAt: latest.created_at,
    activity,
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
