import type { DemoProject } from "@/types/domain";

export const demoProject: DemoProject = {
  id: "demo",
  name: "制造业设备知识助手",
  organization: "华东精密制造集团",
  industry: "智能制造",
  budget: 1_800_000,
  stage: "PoC 验收",
  progress: 64,
  healthScore: 72,
  decision: "conditional_pass",
  summary:
    "面向设备维护与产线工程师的企业知识助手，整合维修手册、故障工单与专家经验，降低排障时间并形成可审计的知识调用链。",
  risks: [
    {
      id: "R-01",
      title: "历史工单数据质量不稳定",
      description: "约 18% 的工单缺少标准故障码，可能影响检索召回率与验收样本代表性。",
      level: "critical",
      status: "mitigating",
      owner: "数据治理组",
      dueDate: "2026-06-28",
      mitigation: "补充故障码映射规则，并对高频设备建立人工复核样本集。"
    },
    {
      id: "R-02",
      title: "供应商未提供完整模型变更记录",
      description: "当前版本只记录应用发布版本，模型与提示词版本不可追溯。",
      level: "high",
      status: "assessing",
      owner: "供应商 A",
      dueDate: "2026-06-25",
      mitigation: "上线前补齐模型、知识库、提示词和阈值策略版本台账。"
    },
    {
      id: "R-03",
      title: "夜班场景采用率偏低",
      description: "夜班工程师试用率仅 42%，低于试点目标。",
      level: "high",
      status: "monitoring",
      owner: "业务推广组",
      dueDate: "2026-07-02",
      mitigation: "增加班前培训和故障处理入口二维码，观察两周采用率。"
    },
    {
      id: "R-04",
      title: "敏感设备参数需最小权限控制",
      description: "部分工艺参数不应对外协人员开放。",
      level: "medium",
      status: "mitigating",
      owner: "信息安全组",
      dueDate: "2026-06-30",
      mitigation: "按组织、角色和设备区域增加知识库权限过滤。"
    }
  ],
  vendors: [
    {
      id: "vendor-a",
      name: "云启智能科技",
      shortName: "云启",
      recommended: true,
      score: 86,
      quote: 1_680_000,
      durationWeeks: 18,
      dimensions: {
        businessFit: 18,
        technical: 14,
        dataSecurity: 12,
        testability: 9,
        delivery: 9
      },
      strengths: ["制造业案例完整", "PoC 测试方案清晰", "接受审计与模型版本留痕"],
      concerns: ["报价最高", "需补充夜班推广方案"]
    },
    {
      id: "vendor-b",
      name: "矩阵认知实验室",
      shortName: "矩阵",
      recommended: false,
      score: 74,
      quote: 1_320_000,
      durationWeeks: 16,
      dimensions: {
        businessFit: 14,
        technical: 15,
        dataSecurity: 9,
        testability: 7,
        delivery: 7
      },
      strengths: ["模型能力较强", "响应速度快"],
      concerns: ["数据出境说明不充分", "项目管理与知识转移方案偏弱"]
    },
    {
      id: "vendor-c",
      name: "工业智联解决方案",
      shortName: "智联",
      recommended: false,
      score: 68,
      quote: 980_000,
      durationWeeks: 12,
      dimensions: {
        businessFit: 15,
        technical: 10,
        dataSecurity: 10,
        testability: 6,
        delivery: 6
      },
      strengths: ["价格最低", "熟悉现有 MES 系统"],
      concerns: ["未提供可复现测试集", "里程碑与验收边界模糊", "关键成员稳定性存疑"]
    }
  ],
  metrics: [
    { id: "M-01", name: "关键问题召回率", value: 91.2, target: 90, unit: "%", status: "passed", direction: "higher" },
    { id: "M-02", name: "回答准确率", value: 87.4, target: 88, unit: "%", status: "warning", direction: "higher" },
    { id: "M-03", name: "事实性错误率", value: 3.8, target: 3, unit: "%", status: "failed", direction: "lower" },
    { id: "M-04", name: "平均响应时延", value: 1.7, target: 2, unit: "秒", status: "passed", direction: "lower" },
    { id: "M-05", name: "试用人员采用率", value: 68, target: 65, unit: "%", status: "passed", direction: "higher" },
    { id: "M-06", name: "高风险违规输出", value: 0, target: 0, unit: "项", status: "passed", direction: "lower" }
  ],
  milestones: [
    { id: "S-01", name: "项目体检与场景筛选", status: "completed", date: "2026-05-10", evidenceCount: 8 },
    { id: "S-02", name: "供应商评估与 RFP", status: "completed", date: "2026-05-24", evidenceCount: 14 },
    { id: "S-03", name: "PoC 设计与实施", status: "current", date: "2026-06-30", evidenceCount: 21 },
    { id: "S-04", name: "上线验收与运营陪跑", status: "upcoming", date: "2026-07-20", evidenceCount: 0 }
  ]
};
