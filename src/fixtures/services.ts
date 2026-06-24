import type { ServiceProduct } from "@/types/domain";

/**
 * 可下单的保障服务产品（规格 4.2 / 第五章 / PDF 定价区间）。
 * 明确包含、不包含、周期、价格或询价方式、适用项目与最终交付物。
 */
export const services: ServiceProduct[] = [
  {
    id: "health-check",
    name: "AI 项目体检",
    category: "诊断",
    summary: "把模糊的 AI 想法转成可量化的业务目标、数据边界与项目路标。",
    includes: ["业务目标澄清", "数据与场景优先级梳理", "风险初筛", "项目路标建议"],
    excludes: ["不包含供应商开发实施", "不替代正式采购决策"],
    duration: "约 2 周",
    priceRange: "¥1.8–2.8 万",
    suitableFor: "想法阶段或刚立项、目标尚不清晰的项目",
    deliverables: ["体检报告", "场景优先级矩阵", "项目路标"]
  },
  {
    id: "vendor-screening",
    name: "供应商筛选与技术把关",
    category: "采购",
    summary: "建立可审计的评分标准，核验候选团队的真实交付经验与案例。",
    includes: ["评分规则设计", "团队与案例核验", "技术方案审查", "推荐结论"],
    excludes: ["不承担客户内部审批", "不直接签署合同"],
    duration: "约 2–3 周",
    priceRange: "¥2.8–4.8 万",
    suitableFor: "正在选择供应商、担心销售过度承诺的项目",
    deliverables: ["供应商评分矩阵", "技术审查意见", "候选推荐报告"]
  },
  {
    id: "rfp-support",
    name: "RFP 与比选支持",
    category: "采购",
    summary: "输出需求说明书与比选清单，建立方案结构化对比依据。",
    includes: ["需求说明书", "RFP 清单", "方案对比表", "异常报价提示"],
    excludes: ["不包含供应商开发实施"],
    duration: "约 2–3 周",
    priceRange: "¥2.8–4.8 万",
    suitableFor: "需要公开招募或定向比选的项目",
    deliverables: ["需求说明书", "比选对比表", "采购建议"]
  },
  {
    id: "poc-acceptance-design",
    name: "PoC 验收设计",
    category: "验收",
    summary: "在实施前定义测试样本、指标门槛、复测机制与失败退出条件。",
    includes: ["测试集设计", "指标与门槛", "复测规则", "通过 / 有条件通过 / 不通过机制"],
    excludes: ["不承担 PoC 阶段开发", "不替代业务最终决策"],
    duration: "约 3–4 周",
    priceRange: "¥3.8–6.8 万",
    suitableFor: "准备进入 PoC、验收标准尚未前置的项目",
    deliverables: ["PoC 验收方案", "测试样本与指标门槛", "复测与退出条件"]
  },
  {
    id: "supervision-lite",
    name: "实施监理 Lite",
    category: "监理",
    summary: "对关键里程碑进行监理，维护风险台账与问题闭环。",
    includes: ["里程碑审查", "风险台账", "问题闭环", "阶段性周报"],
    excludes: ["不包含全程驻场", "不承担开发任务"],
    duration: "约 2–3 个月",
    priceRange: "¥6.8–12 万",
    suitableFor: "已有供应商、希望控制关键节点的项目",
    deliverables: ["里程碑审查记录", "风险台账", "阶段周报"]
  },
  {
    id: "full-supervision",
    name: "全流程监理",
    category: "监理",
    summary: "覆盖项目体检、供应商评估、PoC 设计、里程碑监理、风险台账与验收的全程保障。",
    includes: [
      "项目体检",
      "供应商评估",
      "PoC 指标设计",
      "里程碑监理",
      "风险台账",
      "交付证据归档",
      "验收与复测",
      "争议支持"
    ],
    excludes: ["不替代客户内部决策", "不承担开发实施"],
    duration: "约 3–12 个月",
    priceRange: "¥15–40 万（按项目规模）",
    suitableFor: "高投入、高风险、强合规要求的企业 AI 项目",
    deliverables: ["全程监理记录", "证据链归档", "验收结论", "复盘报告"]
  },
  {
    id: "acceptance-evaluation",
    name: "验收评测",
    category: "验收",
    summary: "联合业务、技术、数据与合规指标，形成可追责的验收结论。",
    includes: ["业务 / 技术 / 合规联合验收", "定向复测", "验收结论"],
    excludes: ["不承担上线后运营", "不替代合规审计"],
    duration: "约 4–8 周",
    priceRange: "¥0.8–1.5 万 / 验收批次",
    suitableFor: "进入验收或上线、结论需要独立背书的项目",
    deliverables: ["验收报告", "复测记录", "通过 / 有条件通过 / 不通过结论"]
  },
  {
    id: "operation-companion",
    name: "运营陪跑",
    category: "运营",
    summary: "持续审查模型变更、真实使用率、SLA 与追加场景价值。",
    includes: ["模型变更审查", "使用率与 SLA 监控", "追加场景评估", "月度复盘"],
    excludes: ["不承担日常运维执行"],
    duration: "按年",
    priceRange: "按项目规模询价（年费的 3%–8%）",
    suitableFor: "已上线、需要持续保障与价值拓展的项目",
    deliverables: ["月度运营报告", "变更审查记录", "SLA 复盘"]
  }
];
