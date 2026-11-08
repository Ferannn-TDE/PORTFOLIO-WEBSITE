import { describe, it, expect, vi } from "vitest";
import { handle, getActivity, firstLine, weeklyCounts, GITHUB_USER, WEEKS } from "./github-activity.mjs";

const NOW = Date.parse("2026-11-08T12:00:00Z");
const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;
const iso = (t) => new Date(t).toISOString();

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

// Routes mocked GitHub URLs to handlers; records every request.
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

const read = async (res) => ({ status: res.status, headers: res.headers, body: await res.json() });

describe("GitHub activity function", () => {
  it("success: latest non-fork push, one-line message, weekly counts, CDN cache headers", async () => {
    const events = [
      push("portfolio", 3 * HOUR, "abc123"),
      { type: "WatchEvent", repo: { name: `${GITHUB_USER}/portfolio` }, created_at: iso(NOW - 4 * HOUR) },
      push("portfolio", 9 * DAY),
      push("portfolio", 20 * DAY),
      push("portfolio", 40 * DAY), // older than the window
    ];
    const fetch = mockFetch([
      [/\/events\/public/, json(events)],
      [/\/repos\?type=owner/, json(repoList)],
      [
        /\/commits\/abc123$/,
        json({
          html_url: `https://github.com/${GITHUB_USER}/portfolio/commit/abc123`,
          commit: { message: `Rebuild project rows with a much longer subject line that keeps going past the limit\n\nBody text` },
        }),
      ],
    ]);

    const { status, headers, body } = await read(await handle({ fetch, now: NOW }));

    expect(status).toBe(200);
    expect(headers.get("netlify-cdn-cache-control")).toBe("public, durable, max-age=900, stale-while-revalidate=3600");
    expect(headers.get("cache-control")).toBe("public, max-age=0, must-revalidate");
    expect(body.available).toBe(true);
    expect(body.repo).toBe(`${GITHUB_USER}/portfolio`);
    expect(body.pushedAt).toBe(iso(NOW - 3 * HOUR));
    expect(body.message.length).toBeLessThanOrEqual(72);
    expect(body.message.endsWith("…")).toBe(true);
    expect(body.message).not.toContain("\n");
    expect(body.weeks).toHaveLength(WEEKS);
    expect(body.weeks.reduce((a, b) => a + b, 0)).toBe(3); // the 40-day push is excluded
    expect(body.weeks[WEEKS - 1]).toBe(1); // 3h ago
    expect(body.weeks[WEEKS - 2]).toBe(1); // 9 days ago
    expect(body.weeks[WEEKS - 3]).toBe(1); // 20 days ago
    // No relative time is baked into the cached response.
    expect(JSON.stringify(body)).not.toMatch(/ago/);
    // Every GitHub request identifies itself and can be aborted.
    for (const c of fetch.calls) {
      expect(c.init.headers["User-Agent"]).toBeTruthy();
      expect(c.init.signal).toBeInstanceOf(AbortSignal);
    }
  });

  it("rate limited (403 with remaining 0, or 429): unavailable, short cache, no throw", async () => {
    for (const reply of [
      json({ message: "API rate limit exceeded" }, 403, { "x-ratelimit-remaining": "0" }),
      json({ message: "Too many requests" }, 429),
      json({ message: "secondary rate limit" }, 403, { "retry-after": "60" }),
    ]) {
      const fetch = mockFetch([[/./, reply]]);
      const { status, headers, body } = await read(await handle({ fetch, now: NOW }));
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
    const { body } = await read(await handle({ fetch, now: NOW, timeoutMs: 50 }));
    expect(body).toEqual({ available: false, reason: "timeout" });
    expect(Date.now() - started).toBeLessThan(1000);
  });

  it("no recent pushes: unavailable", async () => {
    const fetch = mockFetch([
      [/\/events\/public/, json([{ type: "WatchEvent", repo: { name: "x/y" }, created_at: iso(NOW - HOUR) }])],
      [/\/repos\?type=owner/, json(repoList)],
    ]);
    const { body } = await read(await handle({ fetch, now: NOW }));
    expect(body).toEqual({ available: false, reason: "no-recent-pushes" });
  });

  it("latest push to a fork is skipped in favour of the newest non-fork push", async () => {
    const fetch = mockFetch([
      [/\/events\/public/, json([push("some-fork", HOUR, "forksha"), push("portfolio", 2 * DAY, "realsha")])],
      [/\/repos\?type=owner/, json(repoList)],
      [/\/commits\/realsha$/, json({ commit: { message: "Add command palette" } })],
    ]);
    const { body } = await read(await handle({ fetch, now: NOW }));
    expect(body.repo).toBe(`${GITHUB_USER}/portfolio`);
    expect(body.message).toBe("Add command palette");
    expect(body.weeks.reduce((a, b) => a + b, 0)).toBe(1); // fork push not counted
    expect(fetch.calls.some((c) => /forksha/.test(c.url))).toBe(false);
  });

  it("only forks pushed recently: unavailable", async () => {
    const fetch = mockFetch([
      [/\/events\/public/, json([push("some-fork", HOUR)])],
      [/\/repos\?type=owner/, json(repoList)],
    ]);
    expect((await getActivity({ fetch, now: NOW })).available).toBe(false);
  });

  it("a failing repo list (fork check) fails closed", async () => {
    const fetch = mockFetch([
      [/\/events\/public/, json([push("portfolio", HOUR)])],
      [/\/repos\?type=owner/, json({ message: "boom" }, 500)],
    ]);
    const { body } = await read(await handle({ fetch, now: NOW }));
    expect(body).toEqual({ available: false, reason: "http-error" });
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

  it("weeklyCounts buckets by 7-day windows ending now, oldest first", () => {
    const counts = weeklyCounts([NOW - HOUR, NOW - 6 * DAY, NOW - 8 * DAY, NOW - 27 * DAY, NOW - 29 * DAY], NOW, 4);
    expect(counts).toEqual([1, 0, 1, 2]);
  });
});
