import { describe, expect, it } from "vitest";
import { assessmentRisks, calculateAssessmentScore, defaultAssessment } from "./assessment";

describe("assessment engine", () => {
  it("returns a deterministic readiness score", () => {
    expect(calculateAssessmentScore(defaultAssessment)).toBe(54);
  });

  it("flags missing acceptance and governance controls", () => {
    const risks = assessmentRisks(defaultAssessment);
    expect(risks.map((risk) => risk.id)).toEqual(["A-01", "A-02", "A-03"]);
    expect(risks[0].level).toBe("critical");
  });

  it("returns no readiness risks for a fully prepared project", () => {
    expect(
      assessmentRisks({
        ...defaultAssessment,
        dataReadiness: 5,
        vendorReadiness: 5,
        acceptanceReadiness: 5,
        governanceReadiness: 5
      })
    ).toEqual([]);
  });
});
