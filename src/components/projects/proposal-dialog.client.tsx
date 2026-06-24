"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { ProposalDraft } from "@/types/domain";
import { confirmDialog } from "@/components/ui/dialog";
import { SuccessResult } from "@/components/ui/states";
import { toast } from "@/components/ui/toast";
import { submitDemoProposal } from "@/lib/repositories/proposal-repository";

interface Props {
  projectId: string;
  projectTitle: string;
  open: boolean;
  onClose: () => void;
}

const EMPTY: ProposalDraft = {
  projectId: "",
  vendorName: "",
  summary: "",
  quote: null,
  durationWeeks: null,
  milestones: "",
  teamMembers: "",
  assumptions: "",
  exclusions: "",
  auditAccepted: false,
  versionTrailAccepted: false
};

export function ProposalDialog({ projectId, projectTitle, open, onClose }: Props) {
  const [draft, setDraft] = useState<ProposalDraft>({ ...EMPTY, projectId });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!open) return null;

  const update = <K extends keyof ProposalDraft>(key: K, value: ProposalDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!draft.vendorName.trim()) next.vendorName = "请填写企业或团队名称";
    if (!draft.summary.trim()) next.summary = "请填写方案摘要";
    if (draft.quote === null || draft.quote <= 0) next.quote = "请填写有效报价";
    if (draft.durationWeeks === null || draft.durationWeeks <= 0) next.durationWeeks = "请填写工期";
    if (!draft.teamMembers.trim()) next.teamMembers = "请披露实际投入成员";
    if (!draft.auditAccepted) next.auditAccepted = "需接受平台审计";
    if (!draft.versionTrailAccepted) next.versionTrailAccepted = "需接受版本留痕";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error("请补齐必填项", "标红的字段为结构化方案必填内容。");
      return;
    }
    const confirmed = await confirmDialog({
      title: "确认提交方案？",
      description: "方案将提交给客户与平台顾问评估。",
      details: [
        "提交后客户可在工作台对比你的方案与报价。",
        "可由你主动撤回并重新提交（撤回前客户可能已查看）。",
        "下一步：平台顾问核查团队真实投入与相关案例。"
      ],
      confirmLabel: "提交方案",
      cancelLabel: "再改改"
    });
    if (!confirmed) return;

    submitDemoProposal({ ...draft, projectId });
    setSubmitted(true);
    toast.success("方案已提交", "客户与平台顾问将收到通知。");
  };

  const handleClose = () => {
    setSubmitted(false);
    setDraft({ ...EMPTY, projectId });
    setErrors({});
    onClose();
  };

  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true" aria-label="提交方案">
      <div className="dialog dialog-wide">
        <button className="dialog-close" onClick={handleClose} type="button" aria-label="关闭">
          <X size={18} />
        </button>

        {submitted ? (
          <SuccessResult
            eyebrow="方案已提交"
            title="你的方案已进入评估"
            description="客户与平台顾问将在工作台对比方案、核查团队真实投入与相关案例。"
          >
            <div className="hero-actions">
              <button className="button button-primary" onClick={handleClose} type="button">
                返回项目详情
              </button>
            </div>
          </SuccessResult>
        ) : (
          <>
            <div className="dialog-proposal-head">
              <h2>提交结构化方案</h2>
              <p className="muted">{projectTitle}</p>
            </div>

            <div className="proposal-form">
              <Field label="企业 / 团队名称" required error={errors.vendorName}>
                <input
                  className="input"
                  onChange={(event) => update("vendorName", event.target.value)}
                  value={draft.vendorName}
                />
              </Field>

              <Field label="方案摘要" required error={errors.summary}>
                <textarea
                  className="textarea"
                  onChange={(event) => update("summary", event.target.value)}
                  placeholder="技术路线、关键交付与差异化能力"
                  rows={3}
                  value={draft.summary}
                />
              </Field>

              <div className="proposal-row">
                <Field label="总报价（元）" required error={errors.quote}>
                  <input
                    className="input"
                    inputMode="numeric"
                    onChange={(event) =>
                      update("quote", event.target.value === "" ? null : Number(event.target.value))
                    }
                    placeholder="例如 1680000"
                    type="number"
                    value={draft.quote ?? ""}
                  />
                </Field>
                <Field label="工期（周）" required error={errors.durationWeeks}>
                  <input
                    className="input"
                    inputMode="numeric"
                    onChange={(event) =>
                      update(
                        "durationWeeks",
                        event.target.value === "" ? null : Number(event.target.value)
                      )
                    }
                    type="number"
                    value={draft.durationWeeks ?? ""}
                  />
                </Field>
              </div>

              <Field label="里程碑拆分" error={errors.milestones}>
                <textarea
                  className="textarea"
                  onChange={(event) => update("milestones", event.target.value)}
                  placeholder="例如：M1 需求确认 / M2 PoC / M3 上线验收"
                  rows={2}
                  value={draft.milestones}
                />
              </Field>

              <Field
                label="实际投入成员（角色 · 投入占比）"
                required
                error={errors.teamMembers}
                hint="请披露真实投入人员，平台将据此核查承诺兑现率。"
              >
                <textarea
                  className="textarea"
                  onChange={(event) => update("teamMembers", event.target.value)}
                  placeholder="例如：项目经理 100% / 架构师 60% / 算法工程师 2 人 100%"
                  rows={2}
                  value={draft.teamMembers}
                />
              </Field>

              <div className="proposal-row">
                <Field label="风险假设" error={errors.assumptions}>
                  <textarea
                    className="textarea"
                    onChange={(event) => update("assumptions", event.target.value)}
                    rows={2}
                    value={draft.assumptions}
                  />
                </Field>
                <Field label="不包含内容" error={errors.exclusions}>
                  <textarea
                    className="textarea"
                    onChange={(event) => update("exclusions", event.target.value)}
                    rows={2}
                    value={draft.exclusions}
                  />
                </Field>
              </div>

              <div className="proposal-checks">
                <label className="filter-option">
                  <input
                    checked={draft.auditAccepted}
                    onChange={(event) => update("auditAccepted", event.target.checked)}
                    type="checkbox"
                  />
                  <span>接受平台对团队投入与交付过程的独立审计</span>
                </label>
                {errors.auditAccepted ? <p className="field-error">{errors.auditAccepted}</p> : null}
                <label className="filter-option">
                  <input
                    checked={draft.versionTrailAccepted}
                    onChange={(event) => update("versionTrailAccepted", event.target.checked)}
                    type="checkbox"
                  />
                  <span>接受模型、知识库与提示词的版本留痕</span>
                </label>
                {errors.versionTrailAccepted ? (
                  <p className="field-error">{errors.versionTrailAccepted}</p>
                ) : null}
              </div>
            </div>

            <div className="dialog-actions">
              <button className="button button-secondary" onClick={handleClose} type="button">
                取消
              </button>
              <button className="button button-primary" onClick={handleSubmit} type="button">
                提交方案
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  hint,
  children
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="field proposal-field">
      <label>
        {label}
        {required ? <span className="field-required">*</span> : null}
      </label>
      {children}
      {hint ? <span className="field-hint">{hint}</span> : null}
      {error ? <span className="field-error">{error}</span> : null}
    </div>
  );
}
