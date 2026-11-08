import { describe, it, expect, vi } from "vitest";
import { handle, getActivity, firstLine, weeklyCounts, GITHUB_USER, COMMIT_WEEKS, PUSH_WEEKS } from "./github-activity.mjs";

const NOW = Date.parse("2026-11-08T12:00:00Z");
const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;
const iso = (t) => new Date(t).toISOString();
const TOKEN = "github_pat_test_value";
const NO_TOKEN = { token: "" };

const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...headers } });

const push = (repo, ageMs, sha = `sha-${repo}-${ageMs}`) => ({
  type: "PushEvent",
  public: true,
  repo: { name: `${GITHUB_USER}/${repo}` },
  payload: { head: sha },
  created_at: iso(NOW - ageMs),
});

const repoList = [
  { full_name: `${GITHUB_USER}/portfolio`, fork: false, private: false },
  { full_name: `${GITHUB_USER}/some-fork`, fork: true, private: false },
];

// A GraphQL contributions response. `groups` = [[repo, isPrivate, isFork, [[ageMs, commits], …]], …]
const contributions = (groups) =>
  json({
    data: {
      user: {
        contributionsCollection: {
          commitContributionsByRepository: groups.map(([name, isPrivate, isFork, days]) => ({
            repository: { nameWithOwner: `${GITHUB_USER}/${name}`, isPrivate, isFork },
            contributions: { nodes: days.map(([age, n]) => ({ occurredAt: iso(NOW - age), commitCount: n })) },
          })),
        },
      },
    },
  });

// Routes mocked GitHub URLs to replies; records every request.
function mockFetch(routes) {
  const calls = [];
  const fn = vi.fn(async (url, init) => {
    calls.push({ url, init });
    for (const [pattern, reply] of routes) {
      if (pattern.test(url)) return typeof reply === "function" ? reply(url, init) : reply.clone();
    }
    return json({ message: "not mocked" }, 404);
  });
  fn.calls = calls;
  return fn;
}

// Standard REST replies for a healthy account.
const restRoutes = (events) => [
  [/\/events\/public/, json(events)],
  [/\/repos\?type=owner/, json(repoList)],
  [/\/commits\/abc123$/, json({ html_url: "https://github.com/x/commit/abc123", commit: { message: "Add command palette" } })],
];

const read = async (res) => ({ status: res.status, headers: res.headers, body: await res.json() });

describe("GitHub activity: latest push", () => {
  it("success: latest non-fork push, one-line message, CDN cache headers", async () => {
    const fetch = mockFetch([
      [/\/events\/public/, json([push("portfolio", 3 * HOUR, "abc123"), push("portfolio", 9 * DAY)])],
      [/\/repos\?type=owner/, json(repoList)],
      [
        /\/commits\/abc123$/,
        json({
          html_url: `https://github.com/${GITHUB_USER}/portfolio/commit/abc123`,
          commit: { message: `Rebuild project rows with a much longer subject line that keeps going past the limit\n\nBody text` },
        }),
      ],
    ]);

    const { status, headers, body } = await read(await handle({ fetch, now: NOW, ...NO_TOKEN }));

    expect(status).toBe(200);
    expect(headers.get("netlify-cdn-cache-control")).toBe("public, durable, max-age=900, stale-while-revalidate=3600");
    expect(headers.get("cache-control")).toBe("public, max-age=0, must-revalidate");
    expect(body.available).toBe(true);
    expect(body.repo).toBe(`${GITHUB_USER}/portfolio`);
    expect(body.pushedAt).toBe(iso(NOW - 3 * HOUR));
    expect(body.message.length).toBeLessThanOrEqual(72);
    expect(body.message.endsWith("…")).toBe(true);
    expect(JSON.stringify(body)).not.toMatch(/ago/); // relative time is computed in the browser
    for (const c of fetch.calls) {
      expect(c.init.headers["User-Agent"]).toBeTruthy();
      expect(c.init.signal).toBeInstanceOf(AbortSignal);
    }
  });

  it("rate limited (403 with remaining 0, 429, 403 retry-after): unavailable, short cache, no throw", async () => {
    for (const reply of [
      json({ message: "API rate limit exceeded" }, 403, { "x-ratelimit-remaining": "0" }),
      json({ message: "Too many requests" }, 429),
      json({ message: "secondary rate limit" }, 403, { "retry-after": "60" }),
    ]) {
      const fetch = mockFetch([[/./, reply]]);
      const { status, headers, body } = await read(await handle({ fetch, now: NOW, ...NO_TOKEN }));
      expect(status).toBe(200);
      expect(body).toEqual({ available: false, reason: "rate-limited" });
      expect(headers.get("netlify-cdn-cache-control")).toBe("public, durable, max-age=60");
    }
  });

  it("timeout: aborts after the limit and reports unavailable", async () => {
    const hang = (url, init) =>
      new Promise((_, reject) => {
        init.signal.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
      });
    const fetch = mockFetch([[/./, hang]]);
    const started = Date.now();
    const { body } = await read(await handle({ fetch, now: NOW, timeoutMs: 50, ...NO_TOKEN }));
    expect(body).toEqual({ available: false, reason: "timeout" });
    expect(Date.now() - started).toBeLessThan(1000);
  });

  it("no recent pushes: unavailable", async () => {
    const fetch = mockFetch([
      [/\/events\/public/, json([{ type: "WatchEvent", repo: { name: "x/y" }, created_at: iso(NOW - HOUR) }])],
      [/\/repos\?type=owner/, json(repoList)],
    ]);
    const { body } = await read(await handle({ fetch, now: NOW, ...NO_TOKEN }));
    expect(body).toEqual({ available: false, reason: "no-recent-pushes" });
  });

  it("latest push to a fork is skipped in favour of the newest non-fork push", async () => {
    const fetch = mockFetch([
      [/\/events\/public/, json([push("some-fork", HOUR, "forksha"), push("portfolio", 2 * DAY, "realsha")])],
      [/\/repos\?type=owner/, json(repoList)],
      [/\/commits\/realsha$/, json({ commit: { message: "Add command palette" } })],
    ]);
    const { body } = await read(await handle({ fetch, now: NOW, ...NO_TOKEN }));
    expect(body.repo).toBe(`${GITHUB_USER}/portfolio`);
    expect(body.message).toBe("Add command palette");
    expect(body.activity.weeks.reduce((a, b) => a + b, 0)).toBe(1); // fork push not counted
    expect(fetch.calls.some((c) => /forksha/.test(c.url))).toBe(false);
  });

  it("only forks pushed recently: unavailable", async () => {
    const fetch = mockFetch([
      [/\/events\/public/, json([push("some-fork", HOUR)])],
      [/\/repos\?type=owner/, json(repoList)],
    ]);
    expect((await getActivity({ fetch, now: NOW, ...NO_TOKEN })).available).toBe(false);
  });

  it("a failing repo list (fork check) fails closed", async () => {
    const fetch = mockFetch([
      [/\/events\/public/, json([push("portfolio", HOUR)])],
      [/\/repos\?type=owner/, json({ message: "boom" }, 500)],
    ]);
    const { body } = await read(await handle({ fetch, now: NOW, ...NO_TOKEN }));
    expect(body).toEqual({ available: false, reason: "http-error" });
  });
});

describe("GitHub activity: weekly sparkline", () => {
  const events = [push("portfolio", 3 * HOUR, "abc123"), push("portfolio", 9 * DAY), push("portfolio", 20 * DAY), push("portfolio", 40 * DAY)];

  it("token present: 12 weeks of public, non-fork commits from GraphQL; token sent only as a header", async () => {
    const fetch = mockFetch([
      [
        /\/graphql$/,
        contributions([
          ["portfolio", false, false, [[HOUR, 3], [8 * DAY, 2], [80 * DAY, 4]]],
          ["secret-repo", true, false, [[HOUR, 50]]], // private: excluded
          ["some-fork", false, true, [[HOUR, 7]]], // fork: excluded
        ]),
      ],
      ...restRoutes(events),
    ]);

    const { body } = await read(await handle({ fetch, now: NOW, token: TOKEN }));

    expect(body.activity.kind).toBe("commits");
    expect(body.activity.weeks).toHaveLength(COMMIT_WEEKS);
    expect(body.activity.weeks[COMMIT_WEEKS - 1]).toBe(3);
    expect(body.activity.weeks[COMMIT_WEEKS - 2]).toBe(2);
    expect(body.activity.weeks[0]).toBe(4); // 80 days ago, inside 12 weeks
    expect(body.activity.weeks.reduce((a, b) => a + b, 0)).toBe(9);
    expect(body.activity.fallback).toBeUndefined();

    // Every call (REST and GraphQL) is authenticated, only to api.github.com.
    expect(fetch.calls.length).toBeGreaterThanOrEqual(4);
    for (const c of fetch.calls) {
      expect(new URL(c.url).host).toBe("api.github.com");
      expect(c.init.headers.Authorization).toBe(`Bearer ${TOKEN}`);
    }
    const gql = fetch.calls.find((c) => c.url.endsWith("/graphql"));
    expect(gql.init.method).toBe("POST");
    expect(JSON.parse(gql.init.body).variables).toMatchObject({ login: GITHUB_USER });
    // The token never reaches the response.
    expect(JSON.stringify(body)).not.toContain(TOKEN);
  });

  it("token missing: 4-week pushes fallback, no GraphQL call, no Authorization header", async () => {
    const fetch = mockFetch(restRoutes(events));
    const { body } = await read(await handle({ fetch, now: NOW, ...NO_TOKEN }));

    expect(body.activity).toEqual({ kind: "pushes", weeks: [0, 1, 1, 1], fallback: "no-token" });
    expect(body.activity.weeks).toHaveLength(PUSH_WEEKS);
    expect(fetch.calls.some((c) => c.url.endsWith("/graphql"))).toBe(false);
    for (const c of fetch.calls) expect(c.init.headers.Authorization).toBeUndefined();
  });

  it("GraphQL error (errors array, HTTP failure, or timeout): falls back to 4-week pushes, strip still shows", async () => {
    const hang = (url, init) =>
      new Promise((_, reject) => init.signal.addEventListener("abort", () => reject(new DOMException("x", "AbortError"))));
    const cases = [
      [json({ errors: [{ message: "Resource not accessible by personal access token" }] }), "graphql-error"],
      [json({ message: "Bad credentials" }, 401), "http-error"],
      [hang, "timeout"],
    ];
    for (const [reply, reason] of cases) {
      const fetch = mockFetch([[/\/graphql$/, reply], ...restRoutes(events)]);
      const { body } = await read(await handle({ fetch, now: NOW, token: TOKEN, timeoutMs: 50 }));
      expect(body.available).toBe(true);
      expect(body.message).toBe("Add command palette");
      expect(body.activity).toEqual({ kind: "pushes", weeks: [0, 1, 1, 1], fallback: reason });
    }
  });

  it("reads the token from GITHUB_TOKEN when not passed in", async () => {
    vi.stubEnv("GITHUB_TOKEN", TOKEN);
    try {
      const fetch = mockFetch([[/\/graphql$/, contributions([])], ...restRoutes(events)]);
      const res = await getActivity({ fetch, now: NOW });
      expect(res.activity.kind).toBe("commits");
      expect(fetch.calls[0].init.headers.Authorization).toBe(`Bearer ${TOKEN}`);
    } finally {
      vi.unstubAllEnvs();
    }
  });
});

describe("helpers", () => {
  it("firstLine keeps the subject and caps it at 72 characters", () => {
    expect(firstLine("Short\nbody")).toBe("Short");
    const long = "x".repeat(100);
    expect(firstLine(long)).toHaveLength(72);
    expect(firstLine(long).endsWith("…")).toBe(true);
    expect(firstLine("y".repeat(72))).toBe("y".repeat(72));
  });

  it("weeklyCounts buckets by 7-day windows ending now, oldest first, and sums counts", () => {
    const counts = weeklyCounts([NOW - HOUR, NOW - 6 * DAY, NOW - 8 * DAY, NOW - 27 * DAY, NOW - 29 * DAY], NOW, 4);
    expect(counts).toEqual([1, 0, 1, 2]);
    expect(weeklyCounts([[NOW - HOUR, 3], [NOW - 8 * DAY, 2]], NOW, 2)).toEqual([2, 3]);
  });
});
