import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  Check,
  CircleDollarSign,
  Clock,
  FileText,
  Users,
  X
} from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { Footer } from "@/components/layout/footer";
import { ProjectActions } from "@/components/projects/project-actions.client";
import { marketplaceRepository } from "@/lib/repositories/marketplace-repository";
import { assuranceLabel, budgetRangeText, durationText, statusLabel, tierToneClass } from "@/lib/catalog";

interface Props {
  params: Promise<{ projectId: string }>;
}

export function generateStaticParams() {
  return marketplaceRepository.getProjectIds().map((projectId) => ({ projectId }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { projectId } = await params;
  const project = await marketplaceRepository.getProject(projectId);
  if (!project) return { title: "未找到项目" };
  return {
    title: project.title,
    description: project.businessGoal
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { projectId } = await params;
  const project = await marketplaceRepository.getProject(projectId);
  if (!project) notFound();

  const stats = [
    { icon: CircleDollarSign, label: "预算", value: budgetRangeText(project) },
    { icon: Clock, label: "预计周期", value: durationText(project) },
    {
      icon: FileText,
      label: "已收到方案",
      value: project.hasVendor ? "已选定供应商" : `${project.proposalCount} 份`
    },
    { icon: CalendarClock, label: "响应截止", value: project.proposalDeadline }
  ];

  return (
    <>
      <SiteHeader />
      <main className="project-shell">
        <div className="container">
          <nav className="breadcrumb" aria-label="路径">
            <Link href="/marketplace">项目市场</Link>
            <span aria-hidden="true">/</span>
            <span>{project.industryLabel}</span>
          </nav>

          <div className="project-head">
            <div>
              <div className="project-head-tags">
                <span className={`tier-pill ${tierToneClass(project.assuranceTier)}`}>{assuranceLabel(project.assuranceTier)}</span>
                <span className="project-status">{statusLabel(project.status)}</span>
                <span className="project-head-industry">{project.industryLabel} · {project.projectType}</span>
              </div>
              <h1 className="project-title">{project.title}</h1>
              <p className="section-lead">{project.businessGoal}</p>
            </div>
          </div>

          <section className="project-stats">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div className="project-stat" key={stat.label}>
                  <Icon size={16} />
                  <div>
                    <span className="muted">{stat.label}</span>
                    <strong>{stat.value}</strong>
                  </div>
                </div>
              );
            })}
          </section>

          <div className="project-layout">
            <div className="project-main">
              <article className="card detail-card">
                <h2>项目背景</h2>
                <p className="muted">{project.background}</p>
                <h3 className="detail-subtitle">业务目标</h3>
                <p className="muted">{project.businessGoal}</p>
              </article>

              <article className="card detail-card">
                <h2>项目范围</h2>
                <ScopeList icon={<Check size={14} />} items={project.scope.must} title="必须完成" tone="ok" />
                <ScopeList items={project.scope.optional} title="可选范围" tone="info" />
                <ScopeList icon={<X size={14} />} items={project.scope.excluded} title="明确不包含" tone="muted" />
                <div className="detail-facts">
                  <div>
                    <span className="muted">第三方系统</span>
                    <p>{project.scope.thirdPartySystems.join("、")}</p>
                  </div>
                  <div>
                    <span className="muted">数据范围</span>
                    <p>{project.scope.dataScope}</p>
                  </div>
                  <div>
                    <span className="muted">交付环境</span>
                    <p>{project.scope.deliveryEnvironment}</p>
                  </div>
                </div>
              </article>

              <article className="card detail-card">
                <h2>验收要求</h2>
                <div className="acceptance-grid">
                  <AcceptGroup items={project.acceptance.businessMetrics} title="业务指标" />
                  <AcceptGroup items={project.acceptance.technicalMetrics} title="技术指标" />
                  <AcceptGroup items={project.acceptance.complianceMetrics} title="合规指标" />
                  <AcceptGroup items={project.acceptance.documentation} title="文档与知识转移" />
                </div>
              </article>

              <article className="card detail-card detail-risk">
                <h2><AlertTriangle size={18} /> 平台风险提示</h2>
                {project.riskHints.length === 0 ? (
                  <p className="muted">平台当前未识别到需要前置处理的重大风险。</p>
                ) : (
                  <ul className="risk-hint-list">
                    {project.riskHints.map((hint) => (
                      <li key={hint.id}>
                        <strong>{hint.title}</strong>
                        <p className="muted">{hint.description}</p>
                        <p className="risk-hint-rec">建议：{hint.recommendation}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </article>

              <article className="card detail-card">
                <h2><Users size={18} /> 供应商响应</h2>
                <p className="muted">
                  该项目已收到 <strong>{project.proposalCount}</strong> 份方案。
                  {project.openForProposals
                    ? " 仍在接受结构化方案：方案摘要、总报价、工期、里程碑、实际投入成员、风险假设与是否接受审计。"
                    : " 当前不再接受新的方案响应。"}
                </p>
              </article>
            </div>

            <aside className="project-aside">
              <ProjectActions project={project} />
              <Link className="button button-secondary project-back" href="/marketplace">
                <ArrowLeft size={15} /> 返回项目市场
              </Link>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function ScopeList({
  items,
  title,
  tone,
  icon
}: {
  items: string[];
  title: string;
  tone: "ok" | "info" | "muted";
  icon?: React.ReactNode;
}) {
  if (items.length === 0) return null;
  return (
    <div className={`scope-list scope-${tone}`}>
      <h3 className="detail-subtitle">{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{icon}{item}</li>
        ))}
      </ul>
    </div>
  );
}

function AcceptGroup({ items, title }: { items: string[]; title: string }) {
  return (
    <div className="accept-group">
      <h3 className="detail-subtitle">{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
