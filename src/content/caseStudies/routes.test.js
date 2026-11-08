import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { caseStudySlugs } from "./slugs.js";
import { projects } from "../../data/projects.js";

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

  it("serves /colophon with 200 and everything else with a real 404", () => {
    expect(rules.find((r) => r.from === "/colophon")).toMatchObject({ to: "/index.html", status: 200 });
    expect(rules.at(-1)).toEqual({ from: "/*", to: "/index.html", status: 404 });
    expect(rules.some((r) => r.from === "/work/*")).toBe(false); // no soft 404s for unknown slugs
  });

  it("every internal project link points at a real case study", () => {
    for (const p of projects.filter((p) => p.href)) {
      expect(caseStudySlugs).toContain(p.href.replace("/work/", ""));
    }
  });
});
