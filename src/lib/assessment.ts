import type { AssessmentAnswer, RiskItem } from "@/types/domain";

export const defaultAssessment: AssessmentAnswer = {
  businessGoal: "将设备平均故障排查时间从 45 分钟降低至 20 分钟",
  projectStage: "已完成供应商初选，准备 PoC",
  industry: "智能制造",
  dataReadiness: 3,
  vendorReadiness: 4,
  acceptanceReadiness: 2,
  governanceReadiness: 2
};

export function calculateAssessmentScore(answer: AssessmentAnswer) {
  const readiness =
    answer.dataReadiness * 0.3 +
    answer.vendorReadiness * 0.2 +
    answer.acceptanceReadiness * 0.3 +
    answer.governanceReadiness * 0.2;

  return Math.round((readiness / 5) * 100);
}

export function assessmentRisks(answer: AssessmentAnswer): RiskItem[] {
  const risks: RiskItem[] = [];
  if (answer.acceptanceReadiness <= 2) {
    risks.push({
      id: "A-01",
      title: "验收标准尚未前置",
      description: "当前缺少业务、技术与合规三类联合指标，PoC 容易出现“效果不错但无法验收”。",
      level: "critical",
      status: "identified",
      owner: "项目负责人",
      dueDate: "PoC 启动前",
      mitigation: "建立测试集、通过门槛、复测规则和有条件通过机制。"
    });
  }
  if (answer.governanceReadiness <= 2) {
    risks.push({
      id: "A-02",
      title: "模型与数据变更缺乏治理",
      description: "模型、知识库、提示词和外部接口变更尚无统一留痕。",
      level: "high",
      status: "identified",
      owner: "信息化部门",
      dueDate: "正式实施前",
      mitigation: "建立版本台账、变更单和回归测试要求。"
    });
  }
  if (answer.dataReadiness <= 3) {
    risks.push({
      id: "A-03",
      title: "业务数据可用性需要抽样验证",
      description: "现有数据可能存在缺失、格式不一致和权限边界不清问题。",
      level: "high",
      status: "identified",
      owner: "数据治理组",
      dueDate: "两周内",
      mitigation: "完成数据清单、质量抽样和敏感信息边界评估。"
    });
  }
  return risks;
}
