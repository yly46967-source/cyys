"use client";

import Link from "next/link";
import { ArrowRight, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useAssessmentStore } from "@/stores/assessment-store";
import { assessmentRisks, calculateAssessmentScore } from "@/lib/assessment";

export function AssessmentReport() {
  const answer = useAssessmentStore((state) => state.answer);
  const score = calculateAssessmentScore(answer);
  const risks = assessmentRisks(answer);

  return (
    <>
      <div className="workspace-title-row">
        <div>
          <div className="section-kicker">Assessment Report</div>
          <h1>项目体检报告</h1>
          <p className="muted">{answer.industry} · {answer.projectStage}</p>
        </div>
        <Link className="button button-primary" href="/workspace/demo/">
          进入项目工作台 <ArrowRight size={17} />
        </Link>
      </div>
      <div className="report-grid">
        <aside className="card panel">
          <div className="score-ring">
            <span className="score-number">{score}</span>
          </div>
          <h2 style={{ textAlign: "center" }}>中等成熟度</h2>
          <p className="hero-copy" style={{ fontSize: 14, textAlign: "center" }}>
            可以进入 PoC，但必须先补齐验收基线和治理留痕。
          </p>
        </aside>
        <section className="card panel">
          <h2>优先结论</h2>
          <div className="decision-banner" style={{ marginTop: 12 }}>
            <div>
              <strong>建议先做 3 周 PoC 验收设计</strong>
              <p className="muted">暂不建议直接签署全量建设合同。</p>
            </div>
            <span className="badge badge-warning"><AlertTriangle size={14} /> 有条件推进</span>
          </div>
          <div className="risk-list">
            {risks.map((risk) => (
              <article className="risk-row" key={risk.id}>
                <span className={`risk-dot risk-${risk.level}`} />
                <div>
                  <strong>{risk.title}</strong>
                  <p className="muted">{risk.description}</p>
                  <small className="muted">建议：{risk.mitigation}</small>
                </div>
                <span className={risk.level === "critical" ? "badge badge-danger" : "badge badge-warning"}>
                  {risk.level === "critical" ? "关键风险" : "高风险"}
                </span>
              </article>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 20, color: "#087a52" }}>
            <CheckCircle2 size={20} />
            <span>业务目标明确，可作为联合验收的第一层指标。</span>
          </div>
        </section>
      </div>
    </>
  );
}
