import type { MarketplaceProject } from "@/types/domain";

/**
 * 项目市场演示数据。全部匿名化：
 * - 不含真实企业、团队、人员名称；
 * - 合同金额以区间或"面议"呈现；
 * - 项目 A / B 来源于规格第十章的两个匿名案例。
 */
export const marketplaceProjects: MarketplaceProject[] = [
  {
    id: "maritime-knowledge-rfp",
    title: "港航行业知识智能化项目 · 供应商重新遴选",
    industry: "maritime",
    industryLabel: "港航与海事科技",
    projectType: "知识智能化 / 供应商重新遴选",
    status: "evaluating",
    background:
      "客户此前推进 AI 项目时，原交付方在销售阶段对能力和范围作出过度承诺。进入收尾阶段后，数据治理、业务流程、系统集成、模型效果与验收标准等关键问题逐渐暴露，多项交付难以完成，项目无法顺利收尾。客户决定在平台重新遴选供应商。",
    businessGoal:
      "重新梳理项目目标与边界，识别前期失败原因，建立新一轮供应商评分标准，并将验收标准前置，确保新一轮合作可落地、可验收。",
    budgetMin: null,
    budgetMax: null,
    durationWeeks: [12, 16],
    assuranceTier: "standard",
    assuranceSummary: "供应商评估 + 技术把关",
    proposalCount: 4,
    hasVendor: false,
    openForProposals: true,
    proposalDeadline: "2026-07-18",
    publishedAt: "2026-06-09",
    updatedAt: "2026-06-22",
    scope: {
      must: [
        "完成历史项目复盘与风险诊断报告",
        "重构需求边界与验收标准",
        "对候选供应商进行技术与交付能力评估",
        "输出供应商评分矩阵与推荐结论"
      ],
      optional: ["PoC 验收指标设计", "合同关键条款风险审查"],
      excluded: ["不包含新一轮系统的具体开发实施", "不替代客户内部采购决策"],
      thirdPartySystems: ["既有 OA 与文档系统（只读对接）"],
      dataScope: "客户提供的脱敏历史工单与知识文档样本",
      deliveryEnvironment: "平台工作台在线交付，证据归档于平台"
    },
    acceptance: {
      businessMetrics: ["形成可执行的供应商选择依据", "排除过度承诺但证据不足的候选方"],
      technicalMetrics: ["关键技术风险与交付边界被明确记录", "候选方案具备可落地条件"],
      complianceMetrics: ["数据使用与隐私边界得到确认"],
      documentation: ["风险诊断报告", "供应商评分矩阵", "新一轮验收标准建议"]
    },
    riskHints: [
      {
        id: "RH-01",
        title: "原项目验收标准未前置",
        description: "前期缺少业务、技术与合规三类联合指标，导致“效果不错但无法验收”。",
        recommendation: "在遴选前先明确测试集、通过门槛与复测机制。"
      },
      {
        id: "RH-02",
        title: "候选方承诺与证据不匹配",
        description: "部分候选方在销售阶段对能力和范围作出过度承诺，但缺乏可核验的交付证据。",
        recommendation: "建议购买平台“供应商评估 + 技术把关”服务，将选择依据从销售表达转为真实交付证据。"
      }
    ]
  },
  {
    id: "smart-city-delivery-supervision",
    title: "城市治理 AI 工程项目 · 履约监理",
    industry: "smart_city",
    industryLabel: "智慧城市与数字治理",
    projectType: "实施监理 / 资源投入核查",
    status: "in_progress",
    background:
      "客户的一项 AI 工程项目由外部供应商负责实施。供应商前期表示将投入完整交付团队，但实际项目中仅有极少人员承担主要工作，实际资源投入与承诺严重不符，导致交付数量不足、质量偏低、里程碑持续偏差。",
    businessGoal:
      "持续核查实际投入人员，审查每个里程碑交付物，比对计划产出与实际产出，跟踪问题整改，在延期和质量风险扩大前及时预警。",
    budgetMin: 600000,
    budgetMax: 900000,
    durationWeeks: [20, 28],
    assuranceTier: "full",
    assuranceSummary: "全程保障：里程碑监理 + 风险台账 + 验收",
    proposalCount: 0,
    hasVendor: true,
    openForProposals: false,
    proposalDeadline: "2026-06-30",
    publishedAt: "2026-05-20",
    updatedAt: "2026-06-23",
    scope: {
      must: [
        "建立承诺投入与实际投入对比台账",
        "逐里程碑审查交付物完整性与质量",
        "维护风险台账与问题闭环记录",
        "输出周报与阶段验收建议"
      ],
      optional: ["交付物定量缺口分析", "整改责任人与时间跟踪"],
      excluded: ["不直接替换供应商人员", "不承担客户内部绩效考核"],
      thirdPartySystems: ["供应商实施环境（只读核查）", "客户项目管理系统"],
      dataScope: "里程碑交付记录、人员投入记录、缺陷与整改记录",
      deliveryEnvironment: "平台工作台归档证据，输出可追责的证据链"
    },
    acceptance: {
      businessMetrics: ["交付缺口被量化并关联责任人", "高风险事项有明确整改时间"],
      technicalMetrics: ["里程碑按期率与一次通过率被持续记录"],
      complianceMetrics: ["敏感数据访问与处理符合约定边界"],
      documentation: ["周报", "风险台账", "阶段验收建议", "资源投入对比表"]
    },
    riskHints: [
      {
        id: "RH-01",
        title: "实际投入远低于承诺",
        description: "承诺完整团队，实际主要由 1–2 人推进，产出节奏与质量难以支撑里程碑。",
        recommendation: "要求供应商补充资源并接受平台对实际投入的持续核查。"
      },
      {
        id: "RH-02",
        title: "里程碑持续偏差",
        description: "2 个里程碑存在交付缺口，质量偏低。",
        recommendation: "建立缺口清单与整改时限，逾期纳入风险台账并预警客户。"
      },
      {
        id: "RH-03",
        title: "问题闭环缺乏留痕",
        description: "历史问题多通过口头沟通推进，缺少可追责记录。",
        recommendation: "所有问题、责任与整改要求在平台工作台留痕归档。"
      }
    ]
  },
  {
    id: "manufacturing-knowledge-base",
    title: "制造业设备知识助手（公开招募）",
    industry: "manufacturing",
    industryLabel: "智能制造",
    projectType: "企业知识库 / AI 助手",
    status: "open",
    background:
      "客户新发布面向设备维护与产线工程师的企业知识助手项目，整合维修手册、故障工单与专家经验，降低排障时间。已有明确预算、周期与验收标准，尚未购买全流程监理。",
    businessGoal: "将关键设备问题平均排查时间下降 40% 以上，并形成可审计的知识调用链。",
    budgetMin: 150000,
    budgetMax: 250000,
    durationWeeks: [8, 12],
    assuranceTier: "basic",
    assuranceSummary: "基础发布（客户后续可加购保障）",
    proposalCount: 2,
    hasVendor: false,
    openForProposals: true,
    proposalDeadline: "2026-07-10",
    publishedAt: "2026-06-15",
    updatedAt: "2026-06-21",
    scope: {
      must: [
        "知识库构建与检索问答",
        "对接既有工单与文档系统",
        "权限分级与操作审计"
      ],
      optional: ["移动端排障入口", "知识贡献激励"],
      excluded: ["不包含底层模型自研", "不承担既有数据治理"],
      thirdPartySystems: ["MES 系统（只读）", "文档管理系统"],
      dataScope: "脱敏维修手册与历史工单",
      deliveryEnvironment: "客户内网部署，验收样本由客户提供"
    },
    acceptance: {
      businessMetrics: ["关键问题召回率 ≥ 90%", "平均排查时间下降 ≥ 40%"],
      technicalMetrics: ["平均响应时延 ≤ 2 秒", "高风险违规输出为 0"],
      complianceMetrics: ["敏感工艺参数最小权限控制"],
      documentation: ["部署文档", "模型与知识库版本台账", "用户操作手册"]
    },
    riskHints: [
      {
        id: "RH-01",
        title: "历史工单数据质量不稳定",
        description: "部分工单缺少标准故障码，可能影响检索召回率与验收样本代表性。",
        recommendation: "建议加购“项目体检”补齐数据治理与验收基线。"
      }
    ]
  },
  {
    id: "finance-risk-engine",
    title: "智能风控规则与模型引擎",
    industry: "finance",
    industryLabel: "金融服务",
    projectType: "风控引擎 / 模型治理",
    status: "open",
    background:
      "客户希望搭建可解释、可审计的风控规则与模型引擎，替代部分人工审核。对合规与模型版本留痕要求较高。",
    businessGoal: "在保持人工复核前提下，将初审自动化率提升至 60% 以上，并满足合规审计要求。",
    budgetMin: 300000,
    budgetMax: 500000,
    durationWeeks: [10, 14],
    assuranceTier: "standard",
    assuranceSummary: "优选保障：需求检查 + 方案结构化对比",
    proposalCount: 3,
    hasVendor: false,
    openForProposals: true,
    proposalDeadline: "2026-07-22",
    publishedAt: "2026-06-12",
    updatedAt: "2026-06-20",
    scope: {
      must: ["规则与模型双轨引擎", "模型版本与决策留痕", "审计报表"],
      optional: ["实时指标监控", "灰度发布"],
      excluded: ["不包含核心账务系统改造"],
      thirdPartySystems: ["核心交易系统（只读）", "风控数据中台"],
      dataScope: "脱敏交易与样本标签",
      deliveryEnvironment: "金融云部署，符合监管要求"
    },
    acceptance: {
      businessMetrics: ["初审自动化率 ≥ 60%", "误杀率不超过约定阈值"],
      technicalMetrics: ["决策可追溯至模型与规则版本", "接口可用率 ≥ 99.9%"],
      complianceMetrics: ["模型治理与数据合规留痕完整"],
      documentation: ["模型治理文档", "审计手册", "上线评审记录"]
    },
    riskHints: [
      {
        id: "RH-01",
        title: "模型可解释性与合规留痕要求高",
        description: "金融场景对决策可解释和版本留痕要求严格，方案需前置设计。",
        recommendation: "建议加购“PoC 验收设计”，将可解释性与合规指标纳入验收。"
      }
    ]
  },
  {
    id: "healthcare-record-structuring",
    title: "病历结构化与辅助编码",
    industry: "healthcare",
    industryLabel: "医疗健康",
    projectType: "病历结构化 / NLP",
    status: "evaluating",
    background:
      "客户需将非结构化病历结构化并辅助疾病编码，提升病案质量与统计效率。已收到多家方案，正在评估。",
    businessGoal: "结构化字段准确率达到约定阈值，编码辅助采纳率达到 70% 以上。",
    budgetMin: 200000,
    budgetMax: 350000,
    durationWeeks: [10, 14],
    assuranceTier: "standard",
    assuranceSummary: "优选保障：方案对比 + 团队核验",
    proposalCount: 5,
    hasVendor: false,
    openForProposals: false,
    proposalDeadline: "2026-07-05",
    publishedAt: "2026-05-28",
    updatedAt: "2026-06-19",
    scope: {
      must: ["病历结构化抽取", "疾病编码辅助", "质量抽检报表"],
      optional: ["DRG 分组建议"],
      excluded: ["不承担临床诊断责任"],
      thirdPartySystems: ["HIS 系统（只读）"],
      dataScope: "脱敏历史病历样本",
      deliveryEnvironment: "院内部署，数据不出院"
    },
    acceptance: {
      businessMetrics: ["结构化字段准确率 ≥ 92%", "编码辅助采纳率 ≥ 70%"],
      technicalMetrics: ["批量处理吞吐满足约定"],
      complianceMetrics: ["数据脱敏与访问审计合规"],
      documentation: ["质量评估报告", "部署与运维文档"]
    },
    riskHints: [
      {
        id: "RH-01",
        title: "评测样本代表性不足",
        description: "候选方提供的测试集可能与真实分布存在偏差，影响准确率结论。",
        recommendation: "由平台协助建立独立评测样本，避免“自评自验”。"
      }
    ]
  },
  {
    id: "government-service-qa",
    title: "政务办事智能问答",
    industry: "government",
    industryLabel: "政务与国企",
    projectType: "智能问答 / 知识库",
    status: "open",
    background:
      "客户希望构建面向公众办事的智能问答，覆盖高频办事指南，降低窗口咨询压力。对内容准确性与合规要求高。",
    businessGoal: "高频问题首答准确率达到约定阈值，转人工率下降。",
    budgetMin: 100000,
    budgetMax: 180000,
    durationWeeks: [6, 10],
    assuranceTier: "basic",
    assuranceSummary: "基础发布",
    proposalCount: 1,
    hasVendor: false,
    openForProposals: true,
    proposalDeadline: "2026-07-15",
    publishedAt: "2026-06-18",
    updatedAt: "2026-06-22",
    scope: {
      must: ["办事指南知识库", "多轮问答与转人工", "内容审核后台"],
      optional: ["多端适配"],
      excluded: ["不承担审批系统改造"],
      thirdPartySystems: ["政务办事系统（接口对接）"],
      dataScope: "公开办事指南与高频问答",
      deliveryEnvironment: "政务云部署"
    },
    acceptance: {
      businessMetrics: ["首答准确率 ≥ 88%", "转人工率下降 ≥ 20%"],
      technicalMetrics: ["并发响应满足峰值要求"],
      complianceMetrics: ["内容安全与信息发布合规"],
      documentation: ["知识库维护手册", "运维文档"]
    },
    riskHints: [
      {
        id: "RH-01",
        title: "内容准确性风险",
        description: "政务答复错误可能造成误导，需严格的内容审核与兜底。",
        recommendation: "建议加购“验收评测”，对答复准确性与合规性进行独立复测。"
      }
    ]
  },
  {
    id: "logistics-demand-forecast",
    title: "区域运力需求预测（已完成验收）",
    industry: "logistics",
    industryLabel: "物流与供应链",
    projectType: "需求预测 / 时序模型",
    status: "completed",
    background:
      "客户已完成区域运力需求预测项目，经平台独立验收后交付。此处展示已完成的保障流程与验收结论。",
    businessGoal: "将运力调度偏差率降低至约定阈值以内。",
    budgetMin: 250000,
    budgetMax: 400000,
    durationWeeks: [12, 16],
    assuranceTier: "full",
    assuranceSummary: "全程保障：PoC 设计 + 监理 + 验收",
    proposalCount: 0,
    hasVendor: true,
    openForProposals: false,
    proposalDeadline: "2026-04-30",
    publishedAt: "2026-02-10",
    updatedAt: "2026-05-30",
    scope: {
      must: ["多区域需求预测", "调度建议接口", "效果复盘"],
      optional: ["异常事件修正"],
      excluded: ["不承担实际运力调度执行"],
      thirdPartySystems: ["调度系统（接口）"],
      dataScope: "脱敏历史运单与外部数据",
      deliveryEnvironment: "私有云部署"
    },
    acceptance: {
      businessMetrics: ["调度偏差率下降至约定阈值", "预测可用率满足业务要求"],
      technicalMetrics: ["模型版本与数据快照可追溯"],
      complianceMetrics: ["数据使用符合授权范围"],
      documentation: ["验收报告", "复盘报告", "运维文档"]
    },
    riskHints: []
  },
  {
    id: "finance-quant-research",
    title: "机构投研知识助手",
    industry: "finance",
    industryLabel: "金融服务",
    projectType: "知识助手 / 投研",
    status: "open",
    background:
      "客户的研究团队每天处理大量研报、公告与新闻，信息分散、检索低效。希望构建投研知识助手，辅助分析师快速获取结论与依据。",
    businessGoal: "将单条投研问题的人工检索时长压缩 50% 以上，并保留可追溯的引用链。",
    budgetMin: 300000,
    budgetMax: 500000,
    durationWeeks: [10, 14],
    assuranceTier: "standard",
    assuranceSummary: "优选保障：需求检查 + 方案结构化对比",
    proposalCount: 3,
    hasVendor: false,
    openForProposals: true,
    proposalDeadline: "2026-07-20",
    publishedAt: "2026-06-10",
    updatedAt: "2026-06-22",
    scope: {
      must: ["研报与公告知识库", "带引用的问答", "权限与审计"],
      optional: ["行情数据接入"],
      excluded: ["不提供投资建议", "不承担交易执行"],
      thirdPartySystems: ["研报管理系统（只读）"],
      dataScope: "脱敏历史研报与公开公告",
      deliveryEnvironment: "金融云部署，符合监管要求"
    },
    acceptance: {
      businessMetrics: ["检索时长下降 ≥ 50%", "引用准确率 ≥ 90%"],
      technicalMetrics: ["平均响应时延 ≤ 3 秒"],
      complianceMetrics: ["数据使用与留痕符合合规要求"],
      documentation: ["部署文档", "引用链审计说明"]
    },
    riskHints: [
      {
        id: "RH-01",
        title: "投研结论易出现幻觉",
        description: "金融场景对事实性要求高，模型编造数据会带来严重误导。",
        recommendation: "建议加购“PoC 验收设计”，将事实性与引用准确率纳入独立验收。"
      }
    ]
  },
  {
    id: "healthcare-imaging-diagnosis",
    title: "医学影像辅助诊断（多病种）",
    industry: "healthcare",
    industryLabel: "医疗健康",
    projectType: "影像 AI / 辅助诊断",
    status: "evaluating",
    background:
      "客户希望构建覆盖多种疾病的医学影像辅助诊断系统，辅助影像科医生提高读片效率与一致性。项目对准确率、可解释性与合规要求极高。",
    businessGoal: "在指定病种上达到与高年资医生相当的辅助敏感度，并输出可解释依据。",
    budgetMin: 600000,
    budgetMax: 1000000,
    durationWeeks: [16, 22],
    assuranceTier: "full",
    assuranceSummary: "全程保障：PoC 设计 + 监理 + 验收",
    proposalCount: 5,
    hasVendor: false,
    openForProposals: false,
    proposalDeadline: "2026-07-08",
    publishedAt: "2026-05-25",
    updatedAt: "2026-06-21",
    scope: {
      must: ["多病种影像识别", "可解释热力图", "多中心评测"],
      optional: ["结构化报告生成"],
      excluded: ["不替代医生最终诊断", "不承担临床责任"],
      thirdPartySystems: ["PACS / HIS（只读对接）"],
      dataScope: "脱敏历史影像与标注",
      deliveryEnvironment: "院内部署，数据不出院"
    },
    acceptance: {
      businessMetrics: ["辅助敏感度达到约定阈值", "医生读片效率提升"],
      technicalMetrics: ["单张影像推理时延 ≤ 5 秒", "模型版本可追溯"],
      complianceMetrics: ["数据脱敏与访问审计合规"],
      documentation: ["多中心评测报告", "可解释性说明", "部署运维文档"]
    },
    riskHints: [
      {
        id: "RH-01",
        title: "评测样本代表性与标注质量",
        description: "影像数据标注一致性直接影响模型效果结论的可信度。",
        recommendation: "由平台协助建立独立评测样本与标注复核机制。"
      }
    ]
  },
  {
    id: "retail-smart-assortment",
    title: "智能选品与自动补货",
    industry: "retail",
    industryLabel: "零售与电商",
    projectType: "需求预测 / 补货",
    status: "in_progress",
    background:
      "客户的连锁门店缺货与积压并存，人工补货依赖经验。希望引入需求预测与自动补货建议，降低缺货率与库存周转天数。",
    businessGoal: "缺货率下降 30% 以上，库存周转天数下降 15% 以上。",
    budgetMin: 400000,
    budgetMax: 700000,
    durationWeeks: [14, 18],
    assuranceTier: "standard",
    assuranceSummary: "优选保障：里程碑监理 Lite",
    proposalCount: 0,
    hasVendor: true,
    openForProposals: false,
    proposalDeadline: "2026-06-15",
    publishedAt: "2026-04-20",
    updatedAt: "2026-06-23",
    scope: {
      must: ["门店级需求预测", "自动补货建议", "效果复盘报表"],
      optional: ["促销联动修正"],
      excluded: ["不承担实际采购执行"],
      thirdPartySystems: ["ERP / WMS（接口）"],
      dataScope: "脱敏历史销售与库存数据",
      deliveryEnvironment: "零售云部署"
    },
    acceptance: {
      businessMetrics: ["缺货率下降 ≥ 30%", "周转天数下降 ≥ 15%"],
      technicalMetrics: ["预测 MAPE 达到约定阈值"],
      complianceMetrics: ["数据使用符合授权范围"],
      documentation: ["效果复盘报告", "运维文档"]
    },
    riskHints: [
      {
        id: "RH-01",
        title: "实际投入疑似低于承诺",
        description: "实施阶段算法人员投入不稳定，里程碑存在延期风险。",
        recommendation: "要求供应商披露真实投入并由平台持续核查。"
      }
    ]
  },
  {
    id: "logistics-route-optimization",
    title: "城配路径与调度优化",
    industry: "logistics",
    industryLabel: "物流与供应链",
    projectType: "运筹优化 / 调度",
    status: "contracting",
    background:
      "客户的城配车队调度依赖人工，空驶率高、时效不稳定。希望通过运筹优化模型生成更优路径与调度方案。",
    businessGoal: "单车日均配送量提升，平均单趟行驶里程下降 10% 以上。",
    budgetMin: 350000,
    budgetMax: 550000,
    durationWeeks: [12, 16],
    assuranceTier: "standard",
    assuranceSummary: "优选保障：方案对比 + 技术把关",
    proposalCount: 4,
    hasVendor: false,
    openForProposals: false,
    proposalDeadline: "2026-07-02",
    publishedAt: "2026-05-18",
    updatedAt: "2026-06-20",
    scope: {
      must: ["路径优化引擎", "调度看板", "异常重排"],
      optional: ["实时交通修正"],
      excluded: ["不承担司机端 App 开发"],
      thirdPartySystems: ["TMS / 地图服务（接口）"],
      dataScope: "脱敏历史运单与车辆数据",
      deliveryEnvironment: "物流云部署"
    },
    acceptance: {
      businessMetrics: ["单车日均配送量提升", "单趟里程下降 ≥ 10%"],
      technicalMetrics: ["求解满足业务时限约束"],
      complianceMetrics: ["车辆与司机数据脱敏"],
      documentation: ["算法说明", "部署文档"]
    },
    riskHints: [
      {
        id: "RH-01",
        title: "线上效果与离线测算偏差",
        description: "离线路径优化效果好，但线上受交通与异常订单影响可能打折。",
        recommendation: "约定线上 A/B 验收指标与观察周期。"
      }
    ]
  },
  {
    id: "education-personalized-learning",
    title: "K12 个性化学习路径",
    industry: "education",
    industryLabel: "教育与培训",
    projectType: "个性化推荐 / 学习",
    status: "open",
    background:
      "客户希望为学生生成个性化学习路径与练习推荐，基于学情数据动态调整难度与内容，提升学习效率。",
    businessGoal: "目标知识点掌握率提升，练习无效重复下降。",
    budgetMin: 120000,
    budgetMax: 200000,
    durationWeeks: [8, 12],
    assuranceTier: "basic",
    assuranceSummary: "基础发布",
    proposalCount: 2,
    hasVendor: false,
    openForProposals: true,
    proposalDeadline: "2026-07-12",
    publishedAt: "2026-06-14",
    updatedAt: "2026-06-22",
    scope: {
      must: ["学情画像", "学习路径推荐", "难度自适应"],
      optional: ["家长端报告"],
      excluded: ["不提供教学内容生产"],
      thirdPartySystems: ["题库与学习系统（接口）"],
      dataScope: "脱敏历史学情与答题数据",
      deliveryEnvironment: "教育云部署，未成年人数据合规"
    },
    acceptance: {
      businessMetrics: ["知识点掌握率提升", "无效练习下降"],
      technicalMetrics: ["推荐响应满足峰值并发"],
      complianceMetrics: ["未成年人信息保护合规"],
      documentation: ["推荐逻辑说明", "运维文档"]
    },
    riskHints: [
      {
        id: "RH-01",
        title: "未成年人数据合规要求高",
        description: "涉及未成年人个人信息，合规与监护同意是前置条件。",
        recommendation: "明确数据采集与使用边界，纳入合规验收。"
      }
    ]
  },
  {
    id: "government-smart-approval",
    title: "政务智能审批辅助",
    industry: "government",
    industryLabel: "政务与国企",
    projectType: "智能审批 / 文档理解",
    status: "accepting",
    background:
      "客户希望对常见政务审批事项引入智能辅助，自动抽取材料要素、预填表单并提示补正，减轻窗口工作量。",
    businessGoal: "常见事项窗口受理时长下降 40% 以上，一次性通过率提升。",
    budgetMin: 800000,
    budgetMax: 1200000,
    durationWeeks: [18, 24],
    assuranceTier: "full",
    assuranceSummary: "全程保障：PoC + 监理 + 验收",
    proposalCount: 0,
    hasVendor: true,
    openForProposals: false,
    proposalDeadline: "2026-05-30",
    publishedAt: "2026-02-15",
    updatedAt: "2026-06-19",
    scope: {
      must: ["材料要素抽取", "表单预填与补正提示", "审批留痕"],
      optional: ["跨事项知识库"],
      excluded: ["不承担最终审批决定"],
      thirdPartySystems: ["政务审批系统（接口）"],
      dataScope: "脱敏历史办件材料",
      deliveryEnvironment: "政务云部署"
    },
    acceptance: {
      businessMetrics: ["受理时长下降 ≥ 40%", "一次性通过率提升"],
      technicalMetrics: ["要素抽取准确率达到约定阈值"],
      complianceMetrics: ["信息发布与数据安全合规"],
      documentation: ["验收报告", "运维与应急手册"]
    },
    riskHints: []
  },
  {
    id: "manufacturing-visual-qc",
    title: "产线视觉质检（已完成验收）",
    industry: "manufacturing",
    industryLabel: "智能制造",
    projectType: "视觉 AI / 质检",
    status: "completed",
    background:
      "客户已完成产线外观视觉质检项目，经平台独立验收后交付。此处展示已完成的保障流程与验收结论。",
    businessGoal: "将外观缺陷漏检率降至约定阈值以内，减少人工复检工作量。",
    budgetMin: 500000,
    budgetMax: 800000,
    durationWeeks: [14, 18],
    assuranceTier: "full",
    assuranceSummary: "全程保障：验收评测 + 复测",
    proposalCount: 0,
    hasVendor: true,
    openForProposals: false,
    proposalDeadline: "2026-04-10",
    publishedAt: "2026-01-20",
    updatedAt: "2026-05-28",
    scope: {
      must: ["缺陷识别模型", "产线工位集成", "复检流转"],
      optional: ["缺陷归类统计"],
      excluded: ["不承担机械改造"],
      thirdPartySystems: ["MES / 相机采集（接口）"],
      dataScope: "脱敏历史缺陷样本",
      deliveryEnvironment: "车间边缘部署"
    },
    acceptance: {
      businessMetrics: ["漏检率降至约定阈值", "人工复检下降"],
      technicalMetrics: ["单工位推理满足产线节拍"],
      complianceMetrics: ["产线数据不出厂"],
      documentation: ["验收报告", "复测记录", "运维文档"]
    },
    riskHints: []
  },
  {
    id: "retail-ecommerce-cs",
    title: "电商智能客服与工单",
    industry: "retail",
    industryLabel: "零售与电商",
    projectType: "智能客服 / 工单",
    status: "open",
    background:
      "客户的电商客服咨询量大、重复问题多。希望引入智能客服处理常见咨询并自动流转工单，降低人工压力。",
    businessGoal: "常见问题首答解决率达到约定阈值，人工坐席接待量下降。",
    budgetMin: 200000,
    budgetMax: 350000,
    durationWeeks: [8, 12],
    assuranceTier: "standard",
    assuranceSummary: "优选保障：需求检查 + 方案对比",
    proposalCount: 3,
    hasVendor: false,
    openForProposals: true,
    proposalDeadline: "2026-07-16",
    publishedAt: "2026-06-11",
    updatedAt: "2026-06-23",
    scope: {
      must: ["意图识别与多轮对话", "工单自动流转", "知识库管理"],
      optional: ["情绪识别与人工优先"],
      excluded: ["不承担订单系统改造"],
      thirdPartySystems: ["电商与工单系统（接口）"],
      dataScope: "脱敏历史会话与商品信息",
      deliveryEnvironment: "电商云部署"
    },
    acceptance: {
      businessMetrics: ["首答解决率达到约定阈值", "人工接待量下降"],
      technicalMetrics: ["并发会话满足峰值"],
      complianceMetrics: ["会话数据脱敏合规"],
      documentation: ["知识库维护手册", "运维文档"]
    },
    riskHints: [
      {
        id: "RH-01",
        title: "促销期流量峰值",
        description: "大促期间咨询量陡增，系统需具备弹性与降级方案。",
        recommendation: "约定峰值压测指标与降级策略。"
      }
    ]
  },
  {
    id: "finance-aml-graph",
    title: "反洗钱资金图谱",
    industry: "finance",
    industryLabel: "金融服务",
    projectType: "图计算 / 风险挖掘",
    status: "evaluating",
    background:
      "客户希望构建资金流转图谱，识别可疑交易链路与隐藏关联账户，提升反洗钱预警质量。",
    businessGoal: "可疑链路识别覆盖率提升，误报率下降。",
    budgetMin: 450000,
    budgetMax: 650000,
    durationWeeks: [14, 18],
    assuranceTier: "standard",
    assuranceSummary: "优选保障：方案对比 + 团队核验",
    proposalCount: 4,
    hasVendor: false,
    openForProposals: false,
    proposalDeadline: "2026-07-05",
    publishedAt: "2026-05-22",
    updatedAt: "2026-06-18",
    scope: {
      must: ["资金图谱构建", "可疑链路挖掘", "预警与留痕"],
      optional: ["实体消歧"],
      excluded: ["不承担上报与合规裁定"],
      thirdPartySystems: ["反洗钱与核心系统（只读）"],
      dataScope: "脱敏历史交易与账户关系",
      deliveryEnvironment: "金融内网部署"
    },
    acceptance: {
      businessMetrics: ["可疑链路覆盖率提升", "误报率下降"],
      technicalMetrics: ["图查询满足业务时限"],
      complianceMetrics: ["数据使用与审计合规"],
      documentation: ["算法说明", "审计手册"]
    },
    riskHints: [
      {
        id: "RH-01",
        title: "图规模与查询性能",
        description: "资金图谱节点规模大，查询性能影响可用性。",
        recommendation: "约定性能基线与压测方案。"
      }
    ]
  },
  {
    id: "healthcare-triage",
    title: "智能问诊分诊助手",
    industry: "healthcare",
    industryLabel: "医疗健康",
    projectType: "对话 AI / 分诊",
    status: "reviewing",
    background:
      "客户希望为互联网医院提供智能问诊分诊，引导患者描述症状并推荐科室，提升导诊效率。",
    businessGoal: "分诊科室推荐准确率达到约定阈值，减少错误导诊。",
    budgetMin: 150000,
    budgetMax: 250000,
    durationWeeks: [8, 12],
    assuranceTier: "basic",
    assuranceSummary: "基础发布",
    proposalCount: 1,
    hasVendor: false,
    openForProposals: true,
    proposalDeadline: "2026-07-10",
    publishedAt: "2026-06-16",
    updatedAt: "2026-06-22",
    scope: {
      must: ["症状多轮对话", "科室推荐", "安全兜底与转人工"],
      optional: ["健康档案联动"],
      excluded: ["不提供诊断与处方"],
      thirdPartySystems: ["互联网医院系统（接口）"],
      dataScope: "脱敏历史问诊记录",
      deliveryEnvironment: "医疗云部署"
    },
    acceptance: {
      businessMetrics: ["科室推荐准确率达到约定阈值"],
      technicalMetrics: ["对话响应满足并发"],
      complianceMetrics: ["医疗信息合规与免责声明"],
      documentation: ["对话逻辑说明", "运维文档"]
    },
    riskHints: [
      {
        id: "RH-01",
        title: "安全兜底不足可能误导患者",
        description: "分诊错误或漏掉急症可能带来风险。",
        recommendation: "强化急症识别与转人工机制，纳入验收。"
      }
    ]
  },
  {
    id: "smart-city-traffic-forecast",
    title: "城市交通流量预测",
    industry: "smart_city",
    industryLabel: "智慧城市与数字治理",
    projectType: "时序预测 / 交通",
    status: "in_progress",
    background:
      "客户希望对主干路网进行短时交通流量预测，辅助信号优化与拥堵预警。项目正在实施，实际投入存在偏差。",
    businessGoal: "短时流量预测误差控制在约定阈值内，支撑信号优化。",
    budgetMin: 300000,
    budgetMax: 500000,
    durationWeeks: [14, 18],
    assuranceTier: "standard",
    assuranceSummary: "优选保障：里程碑监理 Lite",
    proposalCount: 0,
    hasVendor: true,
    openForProposals: false,
    proposalDeadline: "2026-06-10",
    publishedAt: "2026-04-10",
    updatedAt: "2026-06-23",
    scope: {
      must: ["短时流量预测", "拥堵预警", "信号优化建议接口"],
      optional: ["事件影响修正"],
      excluded: ["不承担信号机改造"],
      thirdPartySystems: ["交通感知与信号系统（接口）"],
      dataScope: "脱敏历史卡口与浮动车数据",
      deliveryEnvironment: "政务/城市云部署"
    },
    acceptance: {
      businessMetrics: ["预测误差达到约定阈值", "拥堵预警及时率"],
      technicalMetrics: ["模型版本与数据快照可追溯"],
      complianceMetrics: ["出行数据脱敏合规"],
      documentation: ["效果复盘", "运维文档"]
    },
    riskHints: [
      {
        id: "RH-01",
        title: "里程碑持续偏差",
        description: "2 个里程碑存在交付缺口，需补充资源并整改。",
        recommendation: "建立缺口清单与整改时限，逾期纳入风险台账。"
      }
    ]
  },
  {
    id: "logistics-warehouse-anomaly",
    title: "仓储作业异常检测",
    industry: "logistics",
    industryLabel: "物流与供应链",
    projectType: "异常检测 / 仓储",
    status: "open",
    background:
      "客户希望对仓储作业数据（出入库、盘点、搬运）进行异常检测，及时发现错放、漏扫与损耗。",
    businessGoal: "仓储异常发现时效提升，损耗率下降。",
    budgetMin: 100000,
    budgetMax: 180000,
    durationWeeks: [6, 10],
    assuranceTier: "basic",
    assuranceSummary: "基础发布",
    proposalCount: 1,
    hasVendor: false,
    openForProposals: true,
    proposalDeadline: "2026-07-14",
    publishedAt: "2026-06-17",
    updatedAt: "2026-06-22",
    scope: {
      must: ["作业异常检测", "告警与工单", "趋势看板"],
      optional: ["视频联动复核"],
      excluded: ["不承担硬件改造"],
      thirdPartySystems: ["WMS（接口）"],
      dataScope: "脱敏历史仓储作业数据",
      deliveryEnvironment: "物流云部署"
    },
    acceptance: {
      businessMetrics: ["异常发现时效提升", "损耗率下降"],
      technicalMetrics: ["检测满足准实时要求"],
      complianceMetrics: ["作业数据脱敏"],
      documentation: ["检测规则说明", "运维文档"]
    },
    riskHints: []
  },
  {
    id: "education-essay-grading",
    title: "作文自动批改与反馈",
    industry: "education",
    industryLabel: "教育与培训",
    projectType: "NLP / 自动批改",
    status: "paused",
    background:
      "客户希望对中小学作文进行自动批改与分项反馈，减轻教师批改负担。项目因预算评审暂时暂停。",
    businessGoal: "批改覆盖主要评分维度，教师批改时长下降。",
    budgetMin: 80000,
    budgetMax: 150000,
    durationWeeks: [8, 12],
    assuranceTier: "basic",
    assuranceSummary: "基础发布（已暂停）",
    proposalCount: 0,
    hasVendor: false,
    openForProposals: false,
    proposalDeadline: "2026-06-20",
    publishedAt: "2026-05-10",
    updatedAt: "2026-06-18",
    scope: {
      must: ["分项评分", "批改反馈生成", "教师复核入口"],
      optional: ["学情归因"],
      excluded: ["不承担最终成绩评定"],
      thirdPartySystems: ["教学平台（接口）"],
      dataScope: "脱敏历史作文样本",
      deliveryEnvironment: "教育云部署"
    },
    acceptance: {
      businessMetrics: ["批改维度覆盖率", "教师批改时长下降"],
      technicalMetrics: ["评分一致性达到约定阈值"],
      complianceMetrics: ["学生数据合规"],
      documentation: ["评分规则说明", "运维文档"]
    },
    riskHints: [
      {
        id: "RH-01",
        title: "项目暂停中",
        description: "因预算评审暂停，恢复时间待定。",
        recommendation: "恢复后重新确认范围与验收标准。"
      }
    ]
  },
  {
    id: "government-public-opinion",
    title: "网络舆情监测与归因",
    industry: "government",
    industryLabel: "政务与国企",
    projectType: "舆情监测 / NLP",
    status: "warranty",
    background:
      "客户已上线舆情监测系统，进入质保运营期。系统对热点事件进行实时监测、情感分析与归因。",
    businessGoal: "热点舆情发现时效满足约定 SLA，误报率可控。",
    budgetMin: 250000,
    budgetMax: 400000,
    durationWeeks: [10, 14],
    assuranceTier: "standard",
    assuranceSummary: "优选保障：运营陪跑",
    proposalCount: 0,
    hasVendor: true,
    openForProposals: false,
    proposalDeadline: "2026-05-15",
    publishedAt: "2026-02-28",
    updatedAt: "2026-06-17",
    scope: {
      must: ["实时舆情采集", "情感与归因分析", "预警与报告"],
      optional: ["传播路径分析"],
      excluded: ["不承担处置决策"],
      thirdPartySystems: ["舆情数据源（接口）"],
      dataScope: "公开网络数据",
      deliveryEnvironment: "政务云部署"
    },
    acceptance: {
      businessMetrics: ["热点发现时效达到 SLA", "误报率可控"],
      technicalMetrics: ["采集与分析满足峰值"],
      complianceMetrics: ["数据来源与使用合规"],
      documentation: ["运营手册", "SLA 复盘"]
    },
    riskHints: []
  },
  {
    id: "manufacturing-predictive-maintenance",
    title: "关键设备预测性维护",
    industry: "manufacturing",
    industryLabel: "智能制造",
    projectType: "预测性维护 / IoT",
    status: "open",
    background:
      "客户希望对关键产线设备进行预测性维护，基于振动、温度等传感数据提前发现故障征兆，降低非计划停机。",
    businessGoal: "非计划停机时长下降 30% 以上，备件预测准确率提升。",
    budgetMin: 400000,
    budgetMax: 600000,
    durationWeeks: [12, 16],
    assuranceTier: "standard",
    assuranceSummary: "优选保障：需求检查 + 方案对比",
    proposalCount: 3,
    hasVendor: false,
    openForProposals: true,
    proposalDeadline: "2026-07-18",
    publishedAt: "2026-06-09",
    updatedAt: "2026-06-23",
    scope: {
      must: ["传感数据接入", "故障预警模型", "工单与留痕"],
      optional: ["剩余寿命预测"],
      excluded: ["不承担设备改造与备件采购"],
      thirdPartySystems: ["IoT 平台 / MES（接口）"],
      dataScope: "脱敏历史传感与维修记录",
      deliveryEnvironment: "边缘 + 云部署"
    },
    acceptance: {
      businessMetrics: ["非计划停机下降 ≥ 30%", "备件预测准确率提升"],
      technicalMetrics: ["预警提前量达到约定阈值"],
      complianceMetrics: ["产线数据不出厂"],
      documentation: ["模型说明", "运维文档"]
    },
    riskHints: [
      {
        id: "RH-01",
        title: "故障样本不平衡",
        description: "真实故障样本稀少，模型易偏向多数类。",
        recommendation: "约定少数类召回率指标与复核机制。"
      }
    ]
  },
  {
    id: "maritime-port-scheduling",
    title: "港口作业智能调度",
    industry: "maritime",
    industryLabel: "港航与海事科技",
    projectType: "运筹优化 / 调度",
    status: "evaluating",
    background:
      "客户希望对港口泊位、岸桥与堆场进行联合智能调度，提升装卸效率与资源利用率。项目复杂度高、约束多。",
    businessGoal: "船舶平均在港时间下降，岸桥利用率提升。",
    budgetMin: 700000,
    budgetMax: 1100000,
    durationWeeks: [18, 24],
    assuranceTier: "full",
    assuranceSummary: "全程保障：供应商评估 + PoC + 监理",
    proposalCount: 4,
    hasVendor: false,
    openForProposals: true,
    proposalDeadline: "2026-07-22",
    publishedAt: "2026-05-15",
    updatedAt: "2026-06-21",
    scope: {
      must: ["泊位/岸桥/堆场联合调度", "仿真验证", "调度看板"],
      optional: ["天气与潮汐联动"],
      excluded: ["不承担闸口与集卡调度改造"],
      thirdPartySystems: ["TOS / 设备控制系统（接口）"],
      dataScope: "脱敏历史作业与船舶数据",
      deliveryEnvironment: "港口私有云部署"
    },
    acceptance: {
      businessMetrics: ["平均在港时间下降", "岸桥利用率提升"],
      technicalMetrics: ["求解满足作业时限约束"],
      complianceMetrics: ["作业与商务数据脱敏"],
      documentation: ["算法说明", "仿真报告", "运维文档"]
    },
    riskHints: [
      {
        id: "RH-01",
        title: "调度问题复杂度高",
        description: "多资源联合调度求解难度大，候选方案可行性需严格验证。",
        recommendation: "要求候选方提供可复现仿真与历史案例核验。"
      }
    ]
  },
  {
    id: "retail-churn-prediction",
    title: "会员流失预测与挽回（已完成）",
    industry: "retail",
    industryLabel: "零售与电商",
    projectType: "流失预测 / 运营",
    status: "completed",
    background:
      "客户已完成会员流失预测项目，识别高流失风险会员并触发挽回运营。经平台验收后交付。",
    businessGoal: "高价值会员流失率下降，挽回触达效率提升。",
    budgetMin: 180000,
    budgetMax: 300000,
    durationWeeks: [10, 14],
    assuranceTier: "standard",
    assuranceSummary: "优选保障：验收评测",
    proposalCount: 0,
    hasVendor: true,
    openForProposals: false,
    proposalDeadline: "2026-04-25",
    publishedAt: "2026-01-15",
    updatedAt: "2026-05-20",
    scope: {
      must: ["流失风险评分", "挽回策略推荐", "效果归因"],
      optional: ["生命周期分群"],
      excluded: ["不承担营销执行"],
      thirdPartySystems: ["CRM / 营销系统（接口）"],
      dataScope: "脱敏历史会员行为数据",
      deliveryEnvironment: "零售云部署"
    },
    acceptance: {
      businessMetrics: ["高价值会员流失率下降", "挽回效率提升"],
      technicalMetrics: ["评分稳定可复现"],
      complianceMetrics: ["会员数据使用合规"],
      documentation: ["验收报告", "运维文档"]
    },
    riskHints: []
  },
  {
    id: "finance-robo-advisor",
    title: "智能投顾及合规留痕",
    industry: "finance",
    industryLabel: "金融服务",
    projectType: "智能投顾 / 模型治理",
    status: "open",
    background:
      "客户希望面向零售客户推出智能投顾，提供风险匹配的资产建议，并对模型决策与合规进行严格留痕。",
    businessGoal: "在合规前提下提升客户适当性匹配效率与建议采纳率。",
    budgetMin: null,
    budgetMax: null,
    durationWeeks: [16, 22],
    assuranceTier: "full",
    assuranceSummary: "全程保障：PoC 设计 + 合规验收",
    proposalCount: 2,
    hasVendor: false,
    openForProposals: true,
    proposalDeadline: "2026-07-25",
    publishedAt: "2026-06-08",
    updatedAt: "2026-06-23",
    scope: {
      must: ["适当性匹配", "资产建议生成", "决策留痕与审计"],
      optional: ["组合再平衡"],
      excluded: ["不承担实际交易与清算"],
      thirdPartySystems: ["账户与行情系统（接口）"],
      dataScope: "脱敏客户画像与产品数据",
      deliveryEnvironment: "金融云部署，强合规"
    },
    acceptance: {
      businessMetrics: ["适当性匹配准确率", "建议采纳率提升"],
      technicalMetrics: ["决策可追溯至模型版本"],
      complianceMetrics: ["适当性与信息披露合规留痕"],
      documentation: ["模型治理文档", "合规审计手册"]
    },
    riskHints: [
      {
        id: "RH-01",
        title: "适当性与合规风险",
        description: "投顾建议须严格匹配客户风险承受能力，否则存在合规风险。",
        recommendation: "将适当性与披露纳入独立验收与复测。"
      }
    ]
  },
  {
    id: "healthcare-drug-interaction",
    title: "药物相互作用预警",
    industry: "healthcare",
    industryLabel: "医疗健康",
    projectType: "知识图谱 / 预警",
    status: "accepting",
    background:
      "客户已实施药物相互作用预警系统，在开具处方时自动提示潜在风险。项目进入验收阶段。",
    businessGoal: "高风险相互作用预警覆盖率提升，误报率可控。",
    budgetMin: 350000,
    budgetMax: 550000,
    durationWeeks: [12, 16],
    assuranceTier: "standard",
    assuranceSummary: "优选保障：验收评测 + 复测",
    proposalCount: 0,
    hasVendor: true,
    openForProposals: false,
    proposalDeadline: "2026-06-28",
    publishedAt: "2026-03-20",
    updatedAt: "2026-06-22",
    scope: {
      must: ["药物图谱构建", "处方实时预警", "医生处置留痕"],
      optional: ["循证依据展示"],
      excluded: ["不替代医生处方决定"],
      thirdPartySystems: ["HIS / 电子病历（接口）"],
      dataScope: "脱敏药品与处方数据",
      deliveryEnvironment: "院内部署"
    },
    acceptance: {
      businessMetrics: ["高风险预警覆盖率提升", "误报率可控"],
      technicalMetrics: ["实时预警满足开方时延"],
      complianceMetrics: ["药品与处方数据合规"],
      documentation: ["验收报告", "复测记录"]
    },
    riskHints: []
  },
  {
    id: "smart-city-environment-monitor",
    title: "区域环境质量预警（已取消）",
    industry: "smart_city",
    industryLabel: "智慧城市与数字治理",
    projectType: "时序预测 / 环境",
    status: "cancelled",
    background:
      "客户原计划构建区域环境质量预警项目，因预算调整与优先级变化，项目已取消。",
    businessGoal: "（已取消）原目标为环境质量预警与污染溯源。",
    budgetMin: null,
    budgetMax: null,
    durationWeeks: [10, 14],
    assuranceTier: "basic",
    assuranceSummary: "基础发布（已取消）",
    proposalCount: 0,
    hasVendor: false,
    openForProposals: false,
    proposalDeadline: "2026-05-30",
    publishedAt: "2026-03-05",
    updatedAt: "2026-06-05",
    scope: {
      must: [],
      optional: [],
      excluded: ["项目已取消，无交付范围"],
      thirdPartySystems: [],
      dataScope: "—",
      deliveryEnvironment: "—"
    },
    acceptance: {
      businessMetrics: [],
      technicalMetrics: [],
      complianceMetrics: [],
      documentation: []
    },
    riskHints: []
  }
];
