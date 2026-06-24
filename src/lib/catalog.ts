import type {
  AssuranceTier,
  BudgetBand,
  Industry,
  MarketplaceProject,
  ProjectStatus
} from "@/types/domain";

/** 行业选项（用于筛选与展示）。 */
export const INDUSTRY_OPTIONS: { value: Industry; label: string }[] = [
  { value: "manufacturing", label: "智能制造" },
  { value: "maritime", label: "港航与海事科技" },
  { value: "smart_city", label: "智慧城市与数字治理" },
  { value: "finance", label: "金融服务" },
  { value: "healthcare", label: "医疗健康" },
  { value: "government", label: "政务与国企" },
  { value: "retail", label: "零售与电商" },
  { value: "logistics", label: "物流与供应链" },
  { value: "education", label: "教育与培训" }
];

/**
 * “阶段”筛选档位：映射到项目生命周期状态（规格 7.2 / 7.3）。
 * 展示为阶段名称，底层匹配具体状态。
 */
export const STAGE_OPTIONS: {
  value: ProjectStatus;
  label: string;
  statuses: ProjectStatus[];
}[] = [
  { value: "open", label: "招募中", statuses: ["open", "reviewing"] },
  { value: "evaluating", label: "评估中", statuses: ["evaluating", "contracting"] },
  { value: "in_progress", label: "实施中", statuses: ["in_progress"] },
  { value: "accepting", label: "验收中", statuses: ["accepting", "warranty"] },
  { value: "completed", label: "已完成", statuses: ["completed"] }
];

/** 预算区间档位（单位：元）。 */
export const BUDGET_OPTIONS: {
  value: BudgetBand;
  label: string;
  lo: number;
  hi: number;
  negotiable: boolean;
}[] = [
  { value: "lt10", label: "10 万以内", lo: 0, hi: 100_000, negotiable: false },
  { value: "10to30", label: "10–30 万", lo: 100_000, hi: 300_000, negotiable: false },
  { value: "30to60", label: "30–60 万", lo: 300_000, hi: 600_000, negotiable: false },
  { value: "60plus", label: "60 万以上", lo: 600_000, hi: Number.POSITIVE_INFINITY, negotiable: false },
  { value: "negotiable", label: "面议", lo: 0, hi: 0, negotiable: true }
];

/** 保障等级选项。 */
export const ASSURANCE_OPTIONS: { value: AssuranceTier; label: string; short: string }[] = [
  { value: "basic", label: "基础发布", short: "基础" },
  { value: "standard", label: "优选保障", short: "优选" },
  { value: "full", label: "全程保障", short: "全程" }
];

const STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: "草稿",
  reviewing: "平台审核中",
  open: "开放响应",
  evaluating: "方案评估中",
  contracting: "合同确认中",
  in_progress: "执行中",
  accepting: "验收中",
  warranty: "质保 / 运营期",
  completed: "已完成",
  paused: "已暂停",
  cancelled: "已取消"
};

export function statusLabel(status: ProjectStatus): string {
  return STATUS_LABELS[status] ?? status;
}

export function assuranceLabel(tier: AssuranceTier): string {
  return ASSURANCE_OPTIONS.find((option) => option.value === tier)?.label ?? tier;
}

/** 保障等级对应的徽标样式类（用于卡片、详情、发布向导统一配色）。 */
export function tierToneClass(tier: AssuranceTier): string {
  return `tier-${tier}`;
}

/** 渲染预算区间：面议或 ¥xx–yy 万。 */
export function budgetRangeText(project: Pick<MarketplaceProject, "budgetMin" | "budgetMax">): string {
  if (project.budgetMin === null && project.budgetMax === null) return "面议";
  const toWan = (value: number) => `${Math.round(value / 10_000)}`;
  if (project.budgetMin !== null && project.budgetMax !== null) {
    return `¥${toWan(project.budgetMin)}–${toWan(project.budgetMax)} 万`;
  }
  const single = (project.budgetMin ?? project.budgetMax) as number;
  return `约 ¥${toWan(single)} 万`;
}

/** 渲染周期：xx–yy 周。 */
export function durationText(project: Pick<MarketplaceProject, "durationWeeks">): string {
  const [min, max] = project.durationWeeks;
  return `${min}–${max} 周`;
}
