import type { Metadata } from "next";
import { AlertTriangle, CircleDollarSign, Gauge, ListChecks } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { WorkspaceTabs } from "@/components/layout/workspace-tabs";
import { ProjectHeading } from "@/components/workspace/project-heading";
import { demoRepository } from "@/lib/repositories/demo-repository";

export const metadata: Metadata = { title: "项目指挥中心" };

export default async function WorkspaceOverviewPage() {
  const project = await demoRepository.getProject();
  const highRiskCount = project.risks.filter((risk) => ["critical", "high"].includes(risk.level)).length;

  return (
    <div className="workspace-body">
      <SiteHeader workspace />
      <main className="workspace-main">
        <div className="container">
          <ProjectHeading project={project} />
          <WorkspaceTabs active="overview" />
          <section className="stat-grid">
            {[
              ["项目健康度", `${project.healthScore}/100`, Gauge],
              ["预算规模", `¥${(project.budget / 10000).toFixed(0)}万`, CircleDollarSign],
              ["整体进度", `${project.progress}%`, ListChecks],
              ["高风险项", `${highRiskCount} 项`, AlertTriangle]
            ].map(([label, value, Icon]) => {
              const IconComponent = Icon as typeof Gauge;
              return (
                <article className="workspace-card stat-card" key={label as string}>
                  <IconComponent color="#3f7cf2" size={20} />
                  <div className="stat-value">{value as string}</div>
                  <div className="stat-label">{label as string}</div>
                </article>
              );
            })}
          </section>

          <div className="dashboard-grid">
            <section className="workspace-card panel">
              <h2>关键风险台账</h2>
              <div className="risk-list">
                {project.risks.map((risk) => (
                  <article className="risk-row" key={risk.id}>
                    <span className={`risk-dot risk-${risk.level}`} />
                    <div>
                      <strong>{risk.title}</strong>
                      <p className="muted">{risk.description}</p>
                      <small className="muted">责任人：{risk.owner} · 截止：{risk.dueDate}</small>
                    </div>
                    <span className={risk.level === "critical" ? "badge badge-danger" : risk.level === "high" ? "badge badge-warning" : "badge badge-info"}>
                      {risk.level === "critical" ? "关键" : risk.level === "high" ? "高" : "中"}
                    </span>
                  </article>
                ))}
              </div>
            </section>

            <aside className="workspace-card panel">
              <h2>里程碑与证据链</h2>
              <div className="timeline">
                {project.milestones.map((milestone) => (
                  <article className="timeline-row" key={milestone.id}>
                    <span className={`risk-dot ${milestone.status === "completed" ? "risk-low" : milestone.status === "current" ? "risk-high" : "risk-medium"}`} />
                    <div>
                      <strong>{milestone.name}</strong>
                      <p className="muted">{milestone.date}</p>
                    </div>
                    <span className="badge badge-info">{milestone.evidenceCount} 份证据</span>
                  </article>
                ))}
              </div>
              <div style={{ marginTop: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span className="muted">整体进度</span><strong>{project.progress}%</strong>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${project.progress}%` }} />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
