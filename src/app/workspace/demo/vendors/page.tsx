import type { Metadata } from "next";
import { CheckCircle2, TriangleAlert } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { WorkspaceTabs } from "@/components/layout/workspace-tabs";
import { ProjectHeading } from "@/components/workspace/project-heading";
import { demoRepository } from "@/lib/repositories/demo-repository";

export const metadata: Metadata = { title: "供应商评估" };

const dimensionLabels = {
  businessFit: "业务适配",
  technical: "技术方案",
  dataSecurity: "数据安全",
  testability: "可验收性",
  delivery: "交付能力"
};

export default async function VendorsPage() {
  const project = await demoRepository.getProject();
  return (
    <div className="workspace-body">
      <SiteHeader workspace />
      <main className="workspace-main">
        <div className="container">
          <ProjectHeading project={project} />
          <WorkspaceTabs active="vendors" />
          <div className="decision-banner">
            <div>
              <strong>评估建议：优先选择云启智能科技</strong>
              <p className="muted">综合能力 86 分，接受版本审计与联合验收；报价虽高，但风险调整后总成本最低。</p>
            </div>
            <span className="badge badge-success"><CheckCircle2 size={14} /> 推荐进入商务谈判</span>
          </div>
          <section className="vendor-list">
            {project.vendors.map((vendor) => (
              <article className="workspace-card vendor-card" key={vendor.id}>
                <div>
                  <span className={vendor.recommended ? "badge badge-success" : "badge badge-info"}>
                    {vendor.recommended ? "首选方案" : "备选方案"}
                  </span>
                  <h2>{vendor.name}</h2>
                  <div className="vendor-score">{vendor.score}</div>
                  <span className="muted">综合评分 / 100</span>
                </div>
                <div className="dimension-bars">
                  {Object.entries(vendor.dimensions).map(([key, value]) => (
                    <div className="dimension-row" key={key}>
                      <span>{dimensionLabels[key as keyof typeof dimensionLabels]}</span>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${(value / 20) * 100}%` }} />
                      </div>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>
                <div>
                  <strong>¥{(vendor.quote / 10000).toFixed(0)} 万 · {vendor.durationWeeks} 周</strong>
                  <p className="muted">优势：{vendor.strengths.join("、")}</p>
                  <p style={{ color: "#a2620e" }}><TriangleAlert size={14} /> {vendor.concerns.join("；")}</p>
                </div>
              </article>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}
