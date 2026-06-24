"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type {
  AssuranceTier,
  BudgetBand,
  Industry,
  MarketplaceProject,
  ProjectStatus
} from "@/types/domain";
import {
  ASSURANCE_OPTIONS,
  BUDGET_OPTIONS,
  INDUSTRY_OPTIONS,
  STAGE_OPTIONS
} from "@/lib/catalog";
import {
  filterProjects,
  type ProjectFilters,
  type ProjectSort
} from "@/lib/repositories/marketplace-repository";
import { ProjectCard } from "@/components/marketplace/project-card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";

interface FilterState {
  search: string;
  industries: Industry[];
  stages: ProjectStatus[];
  budgetBands: BudgetBand[];
  assuranceTiers: AssuranceTier[];
  hasVendor: "yes" | "no" | undefined;
}

const EMPTY_FILTERS: FilterState = {
  search: "",
  industries: [],
  stages: [],
  budgetBands: [],
  assuranceTiers: [],
  hasVendor: undefined
};

type Phase = "loaded" | "loading" | "error";

const SORT_OPTIONS: { value: ProjectSort; label: string }[] = [
  { value: "updated-desc", label: "最新更新" },
  { value: "budget-desc", label: "预算从高到低" },
  { value: "budget-asc", label: "预算从低到高" },
  { value: "deadline-asc", label: "响应截止" }
];

const VENDOR_OPTIONS: { value: "no" | "yes"; label: string }[] = [
  { value: "no", label: "仍在招募" },
  { value: "yes", label: "已选定供应商" }
];

function toQuery(filters: FilterState, sort: ProjectSort): ProjectFilters {
  return {
    search: filters.search,
    industries: filters.industries,
    stages: filters.stages,
    budgetBands: filters.budgetBands,
    assuranceTiers: filters.assuranceTiers,
    hasVendor: filters.hasVendor,
    sort
  };
}

export function MarketplaceBrowser({ initialProjects }: { initialProjects: MarketplaceProject[] }) {
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [sort, setSort] = useState<ProjectSort>("updated-desc");
  const [phase, setPhase] = useState<Phase>("loaded");

  const projects = useMemo(
    () => filterProjects(initialProjects, toQuery(filters, sort)),
    [initialProjects, filters, sort]
  );

  const reload = () => {
    setPhase("loading");
    setTimeout(() => setPhase("loaded"), 260);
  };

  const toggleMulti = <K extends keyof Omit<FilterState, "search" | "hasVendor">>(
    key: K,
    value: FilterState[K][number]
  ) => {
    setFilters((prev) => {
      const list = prev[key] as (typeof value)[];
      const next = list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value];
      return { ...prev, [key]: next };
    });
    setPhase("loaded");
  };

  const toggleVendor = (value: "yes" | "no") => {
    setFilters((prev) => ({
      ...prev,
      hasVendor: prev.hasVendor === value ? undefined : value
    }));
    setPhase("loaded");
  };

  const activeCount =
    filters.industries.length +
    filters.stages.length +
    filters.budgetBands.length +
    filters.assuranceTiers.length +
    (filters.hasVendor ? 1 : 0) +
    (filters.search.trim() ? 1 : 0);

  return (
    <div className="marketplace-browser">
      <div className="marketplace-toolbar">
        <label className="marketplace-search">
          <Search size={16} />
          <input
            onChange={(event) => {
              setFilters((prev) => ({ ...prev, search: event.target.value }));
              setPhase("loaded");
            }}
            placeholder="搜索项目标题、目标或类型"
            type="search"
            value={filters.search}
          />
        </label>
        <div className="marketplace-toolbar-right">
          <span className="marketplace-count">
            共 <strong>{projects.length}</strong> 个项目
          </span>
          <select
            aria-label="排序方式"
            className="select marketplace-sort"
            onChange={(event) => setSort(event.target.value as ProjectSort)}
            value={sort}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="filter-bar">
        <FilterRow label="行业">
          {INDUSTRY_OPTIONS.map((option) => (
            <ChipToggle
              active={filters.industries.includes(option.value)}
              key={option.value}
              label={option.label}
              onClick={() => toggleMulti("industries", option.value)}
            />
          ))}
        </FilterRow>
        <FilterRow label="阶段">
          {STAGE_OPTIONS.map((option) => (
            <ChipToggle
              active={filters.stages.includes(option.value)}
              key={option.value}
              label={option.label}
              onClick={() => toggleMulti("stages", option.value)}
            />
          ))}
        </FilterRow>
        <FilterRow label="保障">
          {ASSURANCE_OPTIONS.map((option) => (
            <ChipToggle
              active={filters.assuranceTiers.includes(option.value)}
              key={option.value}
              label={option.label}
              onClick={() => toggleMulti("assuranceTiers", option.value)}
            />
          ))}
        </FilterRow>
        <FilterRow label="预算">
          {BUDGET_OPTIONS.map((option) => (
            <ChipToggle
              active={filters.budgetBands.includes(option.value)}
              key={option.value}
              label={option.label}
              onClick={() => toggleMulti("budgetBands", option.value)}
            />
          ))}
        </FilterRow>
        <FilterRow label="供应商">
          {VENDOR_OPTIONS.map((option) => (
            <ChipToggle
              active={filters.hasVendor === option.value}
              key={option.value}
              label={option.label}
              onClick={() => toggleVendor(option.value)}
            />
          ))}
        </FilterRow>
        {activeCount > 0 ? (
          <button className="link-button filter-clear" onClick={() => setFilters(EMPTY_FILTERS)} type="button">
            清空全部筛选（{activeCount}）
          </button>
        ) : null}
      </div>

      {phase === "error" ? (
        <ErrorState
          description="演示异常态：列表加载失败。可点击下方“恢复正常”或“模拟加载”重试。"
          onRetry={reload}
        />
      ) : phase === "loading" ? (
        <LoadingState label="正在加载项目数据…" />
      ) : projects.length === 0 ? (
        <EmptyState
          action={
            <button className="button button-secondary" onClick={() => setFilters(EMPTY_FILTERS)} type="button">
              清空全部筛选
            </button>
          }
        />
      ) : (
        <div className="market-grid">
          {projects.map((project, index) => (
            <ProjectCard index={index} key={project.id} project={project} />
          ))}
        </div>
      )}

      <div className="marketplace-demo-bar">
        <span className="muted">演示工具：</span>
        <button className="link-button" onClick={reload} type="button">模拟加载</button>
        <button
          className="link-button"
          onClick={() => setPhase(phase === "error" ? "loaded" : "error")}
          type="button"
        >
          {phase === "error" ? "恢复正常" : "模拟异常"}
        </button>
      </div>
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="filter-row">
      <span className="filter-row-label">{label}</span>
      <div className="filter-chips">{children}</div>
    </div>
  );
}

function ChipToggle({
  active,
  label,
  onClick
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button className={`chip-toggle ${active ? "active" : ""}`} onClick={onClick} type="button">
      {label}
    </button>
  );
}
