import type { Metadata } from "next";
import { AlertTriangle, CheckCircle2, RotateCcw } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { WorkspaceTabs } from "@/components/layout/workspace-tabs";
import { ProjectHeading } from "@/components/workspace/project-heading";
import { demoRepository } from "@/lib/repositories/demo-repository";

export const metadata: Metadata = { title: "PoC 验收" };

const statusMeta = {
  passed: { label: "通过", className: "badge badge-success", icon: CheckCircle2 },
  warning: { label: "临界", className: "badge badge-warning", icon: AlertTriangle },
  failed: { label: "未通过", className: "badge badge-danger", icon: RotateCcw }
};

export default async function AcceptancePage() {
  const project = await demoRepository.getProject();
  return (
    <div className="workspace-body">
      <SiteHeader workspace />
      <main className="workspace-main">
        <div className="container">
          <ProjectHeading project={project} />
          <WorkspaceTabs active="acceptance" />
          <div className="decision-banner">
            <div>
              <strong>验收结论：有条件通过</strong>
              <p className="muted">
                核心业务价值已验证，但事实性错误率高于门槛。供应商需在 7 个工作日内整改并完成定向复测。
              </p>
            </div>
            <span className="badge badge-warning"><AlertTriangle size={14} /> Conditional Pass</span>
          </div>
          <section className="metric-grid">
            {project.metrics.map((metric) => {
              const meta = statusMeta[metric.status];
              const Icon = meta.icon;
              return (
                <article className="workspace-card metric-card" key={metric.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <strong>{metric.name}</strong>
                    <span className={meta.className}><Icon size={13} /> {meta.label}</span>
                  </div>
                  <div className="metric-value">{metric.value}{metric.unit}</div>
                  <span className="muted">
                    目标 {metric.direction === "higher" ? "≥" : "≤"} {metric.target}{metric.unit}
                  </span>
                </article>
              );
            })}
          </section>
          <section className="workspace-card panel" style={{ marginTop: 20 }}>
            <h2>整改与复测要求</h2>
            <div className="risk-list">
              {[
                "对 120 条高频故障样本执行定向回归测试，事实性错误率降至 3% 以下。",
                "补齐模型、知识库、提示词与阈值策略版本记录。",
                "对夜班工程师开展第二轮试用，采用率需连续两周达到 60% 以上。"
              ].map((item, index) => (
                <article className="risk-row" key={item}>
                  <span className="step-index">{index + 1}</span>
                  <strong>{item}</strong>
                  <span className="badge badge-info">待完成</span>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
