import { describe, it, expect } from "vitest";
import { FEATURED, ARCHIVE, CATEGORIES, STATS, CATEGORY_LABEL } from "./projects.js";

const CATEGORY_IDS = CATEGORIES.map((c) => c.id).filter((id) => id !== "all");
const GH = "https://github.com/Aariyan007/";

describe("projects data", () => {
  it("has exactly 8 featured projects", () => {
    expect(FEATURED).toHaveLength(8);
  });

  it("uses unique ids across featured and archive", () => {
    const ids = [...FEATURED, ...ARCHIVE].map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every entry a valid category with a label", () => {
    for (const p of [...FEATURED, ...ARCHIVE]) {
      expect(CATEGORY_IDS, p.id).toContain(p.category);
      expect(CATEGORY_LABEL[p.category], p.id).toBeTruthy();
    }
  });

  it("links every featured project to a real repo", () => {
    for (const p of FEATURED) {
      expect(p.href.startsWith(GH), p.id).toBe(true);
      expect(p.href, p.id).not.toMatch(/REPO-NAME/);
    }
  });

  it("links archive entries to a repo, or gives them modal content", () => {
    for (const p of ARCHIVE) {
      if (p.href === null) expect(p.longDescription, p.id).toBeTruthy();
      else expect(p.href.startsWith(GH), p.id).toBe(true);
      if (p.live) expect(p.live.startsWith("https://"), p.id).toBe(true);
    }
  });

  it("has every field the cards and rows render", () => {
    for (const p of FEATURED) {
      for (const key of ["title", "subtitle", "year", "status", "description", "longDescription", "accent"]) {
        expect(p[key], `${p.id}.${key}`).toBeTruthy();
      }
      expect(p.tags.length, p.id).toBeGreaterThan(0);
      expect(p.metrics.length, p.id).toBeGreaterThan(0);
    }
    for (const p of ARCHIVE) {
      for (const key of ["title", "description", "year", "lang"]) {
        expect(p[key], `${p.id}.${key}`).toBeTruthy();
      }
      expect(Number.isInteger(p.stars), p.id).toBe(true);
    }
  });

  it("keeps every archive category non-empty", () => {
    for (const id of CATEGORY_IDS) {
      expect(ARCHIVE.some((p) => p.category === id), id).toBe(true);
    }
  });

  it("exposes 4 stats", () => {
    expect(STATS).toHaveLength(4);
  });
});
