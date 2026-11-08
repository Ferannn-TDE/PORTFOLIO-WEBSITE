import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { caseStudySlugs } from "./slugs.js";
import { projects } from "../../data/projects.js";
import { routeMeta } from "../routeMeta.js";
import { neighbours } from "../../lib/projectNav.js";

const toml = readFileSync(fileURLToPath(new URL("../../../netlify.toml", import.meta.url)), "utf8");

// Minimal parse of the [[redirects]] blocks: [{ from, to, status }] in order.
const rules = toml
  .split("[[redirects]]")
  .slice(1)
  .map((block) => ({
    from: block.match(/from\s*=\s*"([^"]+)"/)?.[1],
    to: block.match(/to\s*=\s*"([^"]+)"/)?.[1],
    status: Number(block.match(/status\s*=\s*(\d+)/)?.[1]),
  }));

describe("netlify.toml routes", () => {
  it("serves every case study with a 200 rule before the catch-all", () => {
    const catchAll = rules.findIndex((r) => r.from === "/*");
    for (const slug of caseStudySlugs) {
      const i = rules.findIndex((r) => r.from === `/work/${slug}`);
      expect(i, `missing rule for /work/${slug}`).toBeGreaterThanOrEqual(0);
      expect(rules[i]).toMatchObject({ to: "/index.html", status: 200 });
      expect(i).toBeLessThan(catchAll);
    }
  });

  it("serves /colophon with 200 and everything else with a real 404 from 404.html", () => {
    expect(rules.find((r) => r.from === "/colophon")).toMatchObject({ to: "/index.html", status: 200 });
    expect(rules.at(-1)).toEqual({ from: "/*", to: "/404.html", status: 404 });
    expect(rules.some((r) => r.from === "/work/*")).toBe(false); // no soft 404s for unknown slugs
  });

  it("every internal project link points at a real case study", () => {
    for (const p of projects.filter((p) => p.href)) {
      expect(caseStudySlugs).toContain(p.href.replace("/work/", ""));
    }
  });

  it("every project row has a case study, a 200 rule and route meta", () => {
    for (const p of projects) {
      expect(p.href, `${p.slug} links to its case study`).toBe(`/work/${p.slug}`);
      expect(caseStudySlugs).toContain(p.slug);
      expect(rules.some((r) => r.from === `/work/${p.slug}` && r.status === 200), `200 rule for ${p.slug}`).toBe(true);
      expect(routeMeta[`/work/${p.slug}`], `routeMeta for ${p.slug}`).toBeDefined();
    }
    expect(caseStudySlugs).toHaveLength(projects.length);
  });
});

describe("case study pages", () => {
  // FairSynq keeps its markers until its facts are confirmed; the others must have none.
  const TODO_ALLOWED = ["fairsynq"];

  it("new case studies contain no TODO markers", () => {
    for (const slug of caseStudySlugs.filter((s) => !TODO_ALLOWED.includes(s))) {
      const src = readFileSync(fileURLToPath(new URL(`./${slug}.jsx`, import.meta.url)), "utf8");
      expect(src, `${slug}.jsx`).not.toMatch(/<Todo\b|\[TODO|\btodo:/);
    }
  });

  it("prev/next cycles through all six projects in row order", () => {
    const order = projects.map((p) => p.slug);
    order.forEach((slug, i) => {
      const [[, prev], [, next]] = neighbours(slug);
      expect(prev.slug).toBe(order[(i - 1 + order.length) % order.length]);
      expect(next.slug).toBe(order[(i + 1) % order.length]);
    });
  });
});
