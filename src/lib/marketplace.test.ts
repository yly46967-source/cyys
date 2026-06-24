import { describe, expect, it } from "vitest";
import { marketplaceRepository } from "./repositories/marketplace-repository";

describe("marketplace repository", () => {
  it("returns every project when no filters are applied", async () => {
    const list = await marketplaceRepository.listProjects();
    expect(list.length).toBeGreaterThanOrEqual(6);
  });

  it("filters by industry deterministically", async () => {
    const list = await marketplaceRepository.listProjects({ industries: ["maritime"] });
    expect(list.length).toBeGreaterThanOrEqual(2);
    expect(list.every((p) => p.industry === "maritime")).toBe(true);
  });

  it("maps stage filters to status groups", async () => {
    const evaluating = await marketplaceRepository.listProjects({ stages: ["evaluating"] });
    expect(evaluating.every((p) => ["evaluating", "contracting"].includes(p.status))).toBe(true);
    expect(evaluating.some((p) => p.status === "open")).toBe(false);
  });

  it("keeps negotiable-budget projects only in the negotiable band", async () => {
    const negotiable = await marketplaceRepository.listProjects({ budgetBands: ["negotiable"] });
    expect(negotiable.length).toBeGreaterThan(0);
    expect(
      negotiable.every((p) => p.budgetMin === null && p.budgetMax === null)
    ).toBe(true);

    const fixed = await marketplaceRepository.listProjects({ budgetBands: ["30to60"] });
    expect(
      fixed.every((p) => {
        const min = p.budgetMin ?? 0;
        const max = p.budgetMax ?? p.budgetMin ?? 0;
        return min < 600_000 && max > 300_000;
      })
    ).toBe(true);
  });

  it("sorts by budget ascending", async () => {
    const list = await marketplaceRepository.listProjects({ sort: "budget-asc" });
    const budgets = list.map((p) => p.budgetMin ?? p.budgetMax ?? 0);
    const sorted = [...budgets].sort((a, b) => a - b);
    expect(budgets).toEqual(sorted);
  });

  it("returns null for an unknown project id", async () => {
    expect(await marketplaceRepository.getProject("does-not-exist")).toBeNull();
  });

  it("returns immutable clones", async () => {
    const a = await marketplaceRepository.getProject("maritime-knowledge-rfp");
    const b = await marketplaceRepository.getProject("maritime-knowledge-rfp");
    expect(a).not.toBe(b);
    expect(a?.title).toBe(b?.title);
  });

  it("lists services and cases", async () => {
    expect((await marketplaceRepository.listServices()).length).toBeGreaterThanOrEqual(8);
    expect((await marketplaceRepository.listCases()).length).toBe(6);
  });
});
