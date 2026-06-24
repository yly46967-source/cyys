import { cases } from "@/fixtures/cases";
import { marketplaceProjects } from "@/fixtures/marketplace-projects";
import { services } from "@/fixtures/services";
import type {
  AssuranceTier,
  BudgetBand,
  CaseStory,
  Industry,
  MarketplaceProject,
  ProjectStatus,
  ServiceProduct
} from "@/types/domain";

export type ProjectSort = "updated-desc" | "budget-desc" | "budget-asc" | "deadline-asc";

export interface ProjectFilters {
  search?: string;
  industries?: Industry[];
  /** “阶段”筛选：传入阶段档位代表状态。 */
  stages?: ProjectStatus[];
  budgetBands?: BudgetBand[];
  assuranceTiers?: AssuranceTier[];
  hasVendor?: "yes" | "no";
  sort?: ProjectSort;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function matchesBudget(
  project: MarketplaceProject,
  bands: BudgetBand[]
): boolean {
  if (bands.length === 0) return true;
  const isNegotiable = project.budgetMin === null && project.budgetMax === null;
  return bands.some((band) => {
    if (band === "negotiable") return isNegotiable;
    if (isNegotiable) return false;
    const option = BUDGET_BAND_RANGES[band];
    if (!option) return false;
    const min = project.budgetMin ?? 0;
    const max = project.budgetMax ?? project.budgetMin ?? 0;
    return min < option.hi && max > option.lo;
  });
}

const BUDGET_BAND_RANGES: Record<Exclude<BudgetBand, "negotiable">, { lo: number; hi: number }> = {
  lt10: { lo: 0, hi: 100_000 },
  "10to30": { lo: 100_000, hi: 300_000 },
  "30to60": { lo: 300_000, hi: 600_000 },
  "60plus": { lo: 600_000, hi: Number.POSITIVE_INFINITY }
};

const STATUS_STAGE_GROUPS: Record<ProjectStatus, ProjectStatus[]> = {
  open: ["open", "reviewing"],
  reviewing: ["open", "reviewing"],
  evaluating: ["evaluating", "contracting"],
  contracting: ["evaluating", "contracting"],
  in_progress: ["in_progress"],
  accepting: ["accepting", "warranty"],
  warranty: ["accepting", "warranty"],
  completed: ["completed"],
  draft: ["draft"],
  paused: ["paused"],
  cancelled: ["cancelled"]
};

function sortProjects(list: MarketplaceProject[], sort?: ProjectSort): MarketplaceProject[] {
  const budgetOf = (project: MarketplaceProject) =>
    project.budgetMin ?? project.budgetMax ?? 0;
  switch (sort) {
    case "budget-desc":
      return [...list].sort((a, b) => budgetOf(b) - budgetOf(a));
    case "budget-asc":
      return [...list].sort((a, b) => budgetOf(a) - budgetOf(b));
    case "deadline-asc":
      return [...list].sort(
        (a, b) => a.proposalDeadline.localeCompare(b.proposalDeadline)
      );
    case "updated-desc":
    default:
      return [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
}

/** 纯函数：对给定项目集合做筛选与排序（供服务端与客户端共用）。 */
export function filterProjects(
  source: MarketplaceProject[],
  filters: ProjectFilters = {}
): MarketplaceProject[] {
  const {
    search,
    industries = [],
    stages = [],
    budgetBands = [],
    assuranceTiers = [],
    hasVendor,
    sort
  } = filters;

  const keyword = search?.trim().toLowerCase();
  const allowedStatuses = stages.flatMap((stage) => STATUS_STAGE_GROUPS[stage] ?? [stage]);

  const result = source.filter((project) => {
    if (keyword) {
      const haystack = `${project.title} ${project.background} ${project.businessGoal} ${project.projectType}`.toLowerCase();
      if (!haystack.includes(keyword)) return false;
    }
    if (industries.length > 0 && !industries.includes(project.industry)) return false;
    if (allowedStatuses.length > 0 && !allowedStatuses.includes(project.status)) return false;
    if (assuranceTiers.length > 0 && !assuranceTiers.includes(project.assuranceTier)) return false;
    if (hasVendor === "yes" && !project.hasVendor) return false;
    if (hasVendor === "no" && project.hasVendor) return false;
    if (!matchesBudget(project, budgetBands)) return false;
    return true;
  });

  return sortProjects(result, sort);
}

export const marketplaceRepository = {
  /** 列表查询：在内存中对演示数据做筛选与排序。 */
  async listProjects(filters: ProjectFilters = {}): Promise<MarketplaceProject[]> {
    return filterProjects(clone(marketplaceProjects), filters);
  },

  async getProject(id: string): Promise<MarketplaceProject | null> {
    const found = marketplaceProjects.find((project) => project.id === id);
    return found ? clone(found) : null;
  },

  /** 同步取全部 ID，供 generateStaticParams 使用。 */
  getProjectIds(): string[] {
    return marketplaceProjects.map((project) => project.id);
  },

  async listServices(): Promise<ServiceProduct[]> {
    return clone(services);
  },

  async getService(id: string): Promise<ServiceProduct | null> {
    const found = services.find((service) => service.id === id);
    return found ? clone(found) : null;
  },

  async listCases(): Promise<CaseStory[]> {
    return clone(cases);
  },

  async getCase(id: string): Promise<CaseStory | null> {
    const found = cases.find((story) => story.id === id);
    return found ? clone(found) : null;
  }
};
