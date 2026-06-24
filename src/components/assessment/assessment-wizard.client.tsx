"use client";

import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAssessmentStore } from "@/stores/assessment-store";

const steps = ["业务目标", "项目阶段", "准备度评估", "确认生成"];

export function AssessmentWizard() {
  const router = useRouter();
  const { step, answer, setStep, updateAnswer, reset } = useAssessmentStore();

  const next = () => {
    if (step === steps.length - 1) {
      router.push("/demo/assessment/report/");
      return;
    }
    setStep(Math.min(step + 1, steps.length - 1));
  };

  return (
    <div className="assessment-layout">
      <aside className="assessment-steps" aria-label="体检步骤">
        {steps.map((label, index) => (
          <div className={`step-item ${step === index ? "active" : ""}`} key={label}>
            <span className="step-index">{index + 1}</span>
            <span>{label}</span>
          </div>
        ))}
      </aside>

      <section className="card assessment-card">
        <h1 className="form-step-title">{steps[step]}</h1>
        {step === 0 && (
          <>
            <div className="field">
              <label htmlFor="industry">行业</label>
              <select
                className="select"
                id="industry"
                value={answer.industry}
                onChange={(event) => updateAnswer({ industry: event.target.value })}
              >
                <option>智能制造</option>
                <option>政务与国企</option>
                <option>医疗健康</option>
                <option>金融服务</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="businessGoal">可量化业务目标</label>
              <textarea
                className="textarea"
                id="businessGoal"
                value={answer.businessGoal}
                onChange={(event) => updateAnswer({ businessGoal: event.target.value })}
              />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="field">
              <label htmlFor="projectStage">当前阶段</label>
              <select
                className="select"
                id="projectStage"
                value={answer.projectStage}
                onChange={(event) => updateAnswer({ projectStage: event.target.value })}
              >
                <option>只有初步想法</option>
                <option>正在调研供应商</option>
                <option>已完成供应商初选，准备 PoC</option>
                <option>正在实施</option>
                <option>准备验收或上线</option>
              </select>
            </div>
            <div className="card service-card" style={{ marginTop: 24 }}>
              <h3 style={{ marginTop: 0 }}>演示项目</h3>
              <p>制造业设备知识助手 · 预算 180 万元 · 准备进入 PoC。</p>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="range-grid">
              {[
                ["数据准备度", "dataReadiness"],
                ["供应商准备度", "vendorReadiness"],
                ["验收准备度", "acceptanceReadiness"],
                ["治理准备度", "governanceReadiness"]
              ].map(([label, key]) => (
                <div className="range-field" key={key}>
                  <label htmlFor={key}>{label}</label>
                  <input
                    id={key}
                    max="5"
                    min="1"
                    type="range"
                    value={answer[key as keyof typeof answer] as number}
                    onChange={(event) => updateAnswer({ [key]: Number(event.target.value) })}
                  />
                  <strong>{answer[key as keyof typeof answer]}</strong>
                </div>
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="card service-card" style={{ marginTop: 24 }}>
              <h3 style={{ marginTop: 0 }}>{answer.industry} · {answer.projectStage}</h3>
              <p>{answer.businessGoal}</p>
            </div>
          </>
        )}

        <div className="assessment-actions">
          <div>
            {step > 0 ? (
              <button className="button button-secondary" onClick={() => setStep(step - 1)} type="button">
                <ArrowLeft size={17} /> 上一步
              </button>
            ) : (
              <button className="button button-ghost" onClick={reset} type="button">
                <RotateCcw size={16} /> 重置演示
              </button>
            )}
          </div>
          <button
            className="button button-primary"
            disabled={!answer.businessGoal.trim()}
            onClick={next}
            type="button"
          >
            {step === steps.length - 1 ? "生成报告" : "继续"}
            <ArrowRight size={17} />
          </button>
        </div>
      </section>
    </div>
  );
}
