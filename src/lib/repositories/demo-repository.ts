import { demoProject } from "@/fixtures/demo-project";
import type { AssessmentAnswer, DemoProject } from "@/types/domain";
import { assessmentRisks, calculateAssessmentScore } from "@/lib/assessment";

export const demoRepository = {
  async getProject(): Promise<DemoProject> {
    return structuredClone(demoProject);
  },
  async generateAssessment(answer: AssessmentAnswer) {
    return {
      score: calculateAssessmentScore(answer),
      risks: assessmentRisks(answer),
      recommendation:
        "建议先完成 3 周 PoC 验收设计，再进入实施。暂不建议直接签署全量建设合同。"
    };
  }
};
