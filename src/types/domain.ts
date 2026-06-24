export type RiskLevel = "critical" | "high" | "medium" | "low";
export type RiskStatus = "identified" | "assessing" | "mitigating" | "monitoring" | "closed";
export type MetricStatus = "passed" | "warning" | "failed";

export interface AssessmentAnswer {
  businessGoal: string;
  projectStage: string;
  industry: string;
  dataReadiness: number;
  vendorReadiness: number;
  acceptanceReadiness: number;
  governanceReadiness: number;
}

export interface RiskItem {
  id: string;
  title: string;
  description: string;
  level: RiskLevel;
  status: RiskStatus;
  owner: string;
  dueDate: string;
  mitigation: string;
}

export interface VendorEvaluation {
  id: string;
  name: string;
  shortName: string;
  recommended: boolean;
  score: number;
  quote: number;
  durationWeeks: number;
  dimensions: {
    businessFit: number;
    technical: number;
    dataSecurity: number;
    testability: number;
    delivery: number;
  };
  strengths: string[];
  concerns: string[];
}

export interface PocMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  status: MetricStatus;
  direction: "higher" | "lower";
}

export interface Milestone {
  id: string;
  name: string;
  status: "completed" | "current" | "upcoming";
  date: string;
  evidenceCount: number;
}

export interface DemoProject {
  id: string;
  name: string;
  organization: string;
  industry: string;
  budget: number;
  stage: string;
  progress: number;
  healthScore: number;
  decision: "passed" | "conditional_pass" | "rejected" | "needs_retest";
  summary: string;
  risks: RiskItem[];
  vendors: VendorEvaluation[];
  metrics: PocMetric[];
  milestones: Milestone[];
}

/* ------------------------------------------------------------------ */
/* 平台型产品：项目市场 / 项目详情 / 发布 / 保障服务 / 案例             */
/* ------------------------------------------------------------------ */

/** 保障等级：发布项目时选择，对应规格第五章。 */
export type AssuranceTier = "basic" | "standard" | "full";

/** 项目生命周期状态，对应规格 7.3。 */
export type ProjectStatus =
  | "draft"
  | "reviewing"
  | "open"
  | "evaluating"
  | "contracting"
  | "in_progress"
  | "accepting"
  | "warranty"
  | "completed"
  | "paused"
  | "cancelled";

/** 行业枚举（匿名化）。 */
export type Industry =
  | "manufacturing"
  | "maritime"
  | "smart_city"
  | "finance"
  | "healthcare"
  | "government"
  | "retail"
  | "logistics"
  | "education";

/** 预算区间筛选档位。 */
export type BudgetBand = "lt10" | "10to30" | "30to60" | "60plus" | "negotiable";

/** 演示视角：决定项目详情页展示哪一类入口（无真实鉴权）。 */
export type ViewerRole = "client" | "vendor";

export interface ProjectScope {
  must: string[];
  optional: string[];
  excluded: string[];
  thirdPartySystems: string[];
  dataScope: string;
  deliveryEnvironment: string;
}

export interface AcceptanceRequirement {
  businessMetrics: string[];
  technicalMetrics: string[];
  complianceMetrics: string[];
  documentation: string[];
}

/** 平台对项目的独立风险提示，对应规格 8.4。 */
export interface RiskHint {
  id: string;
  title: string;
  description: string;
  recommendation: string;
}

/** 市场中的匿名项目。 */
export interface MarketplaceProject {
  id: string;
  title: string;
  industry: Industry;
  industryLabel: string;
  projectType: string;
  status: ProjectStatus;
  background: string;
  businessGoal: string;
  budgetMin: number | null;
  budgetMax: number | null;
  durationWeeks: [number, number];
  assuranceTier: AssuranceTier;
  assuranceSummary: string;
  proposalCount: number;
  hasVendor: boolean;
  openForProposals: boolean;
  proposalDeadline: string;
  publishedAt: string;
  updatedAt: string;
  scope: ProjectScope;
  acceptance: AcceptanceRequirement;
  riskHints: RiskHint[];
}

/** 可下单的保障服务产品，对应规格 4.2 / 第五章。 */
export interface ServiceProduct {
  id: string;
  name: string;
  category: string;
  summary: string;
  includes: string[];
  excludes: string[];
  duration: string;
  priceRange: string;
  suitableFor: string;
  deliverables: string[];
}

/** 匿名案例，对应规格第十章。 */
export interface CaseStory {
  id: string;
  title: string;
  industryLabel: string;
  background: string;
  objectives: string[];
  services: string[];
  outcomes: string[];
  conversationalCopy: string;
  anonymousNote: string;
}

/** 供应商结构化方案草稿，对应规格 8.5。 */
export interface ProposalDraft {
  projectId: string;
  vendorName: string;
  summary: string;
  quote: number | null;
  durationWeeks: number | null;
  milestones: string;
  teamMembers: string;
  assumptions: string;
  exclusions: string;
  auditAccepted: boolean;
  versionTrailAccepted: boolean;
}

/** 发布项目草稿，对应规格 4.1 / 第五章。 */
export interface PublishDraft {
  title: string;
  industry: Industry;
  projectType: string;
  background: string;
  businessGoal: string;
  budgetMin: number | null;
  budgetMax: number | null;
  durationWeeks: number | null;
  mustScope: string;
  excludedScope: string;
  acceptanceMetrics: string;
  assuranceTier: AssuranceTier;
  contactName: string;
  contactPhone: string;
}

/** 发布成功后生成的演示订单结果。 */
export interface PublishResult {
  projectCode: string;
  title: string;
  assuranceTier: AssuranceTier;
  status: ProjectStatus;
  submittedAt: string;
}
