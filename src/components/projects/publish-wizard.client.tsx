"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleDollarSign,
  Clock,
  RotateCcw,
  ShieldCheck
} from "lucide-react";
import type { AssuranceTier, Industry, PublishDraft, PublishResult } from "@/types/domain";
import { INDUSTRY_OPTIONS, assuranceLabel } from "@/lib/catalog";
import { confirmDialog } from "@/components/ui/dialog";
import { SuccessResult } from "@/components/ui/states";
import { toast } from "@/components/ui/toast";
import { submitDemoPublish } from "@/lib/repositories/publish-repository";

const STORAGE_KEY = "assurance-demo-publish-draft";
const STEP_LABELS = ["项目信息", "范围与验收", "保障等级", "确认提交"];

const DEFAULT_DRAFT: PublishDraft = {
  title: "",
  industry: "manufacturing",
  projectType: "",
  background: "",
  businessGoal: "",
  budgetMin: null,
  budgetMax: null,
  durationWeeks: null,
  mustScope: "",
  excludedScope: "",
  acceptanceMetrics: "",
  assuranceTier: "standard",
  contactName: "",
  contactPhone: ""
};

const TIER_DETAILS: Record<
  AssuranceTier,
  { price: string; includes: string[]; excludes: string[] }
> = {
  basic: {
    price: "平台基础服务费，按发布计",
    includes: ["发布项目", "接收方案和报价", "基础消息通知", "客户自行选择和管理供应商"],
    excludes: ["不含平台需求检查", "不含方案结构化对比与团队核验"]
  },
  standard: {
    price: "+ ¥2.8–4.8 万（优选保障）",
    includes: [
      "平台检查需求完整度",
      "供应商身份与案例基础核验",
      "方案结构化对比",
      "异常报价提示",
      "推荐 3 家候选供应商"
    ],
    excludes: ["不含里程碑监理与验收复测"]
  },
  full: {
    price: "+ ¥15–40 万（全程保障，按规模）",
    includes: [
      "项目体检",
      "供应商评估",
      "PoC 指标设计",
      "里程碑监理",
      "风险台账",
      "交付证据归档",
      "验收与复测",
      "争议支持"
    ],
    excludes: ["不替代客户内部决策"]
  }
};

function loadDraft(): PublishDraft {
  if (typeof window === "undefined") return DEFAULT_DRAFT;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DRAFT;
    return { ...DEFAULT_DRAFT, ...(JSON.parse(raw) as Partial<PublishDraft>) };
  } catch {
    return DEFAULT_DRAFT;
  }
}

export function PublishWizard() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<PublishDraft>(DEFAULT_DRAFT);
  const [hydrated, setHydrated] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<PublishResult | null>(null);

  // 仅在客户端加载已保存草稿，避免与服务端渲染不一致。
  // 这是 React 官方推荐的水合后读取本地存储的模式，故在此关闭该规则。
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setDraft(loadDraft());
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // 自动保存草稿。
  useEffect(() => {
    if (!hydrated || result) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // 忽略存储不可用。
    }
  }, [draft, hydrated, result]);

  // 离开未保存提醒（提交后不再提醒）。
  useEffect(() => {
    if (!hydrated || result) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hydrated, result]);

  const update = useCallback(
    <K extends keyof PublishDraft>(key: K, value: PublishDraft[K]) => {
      setDraft((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: "" }));
    },
    []
  );

  const completion = useMemo(() => {
    const checks = [
      draft.title.trim(),
      draft.projectType.trim(),
      draft.businessGoal.trim(),
      draft.background.trim(),
      draft.budgetMin !== null || draft.budgetMax !== null,
      draft.durationWeeks !== null,
      draft.mustScope.trim(),
      draft.acceptanceMetrics.trim(),
      draft.contactName.trim(),
      draft.contactPhone.trim()
    ];
    const done = checks.filter(Boolean).length;
    return Math.round((done / checks.length) * 100);
  }, [draft]);

  const validateStep = (current: number): boolean => {
    const next: Record<string, string> = {};
    if (current === 0) {
      if (!draft.title.trim()) next.title = "请填写项目标题";
      if (!draft.projectType.trim()) next.projectType = "请填写项目类型";
      if (!draft.businessGoal.trim()) next.businessGoal = "请填写业务目标";
      if (!draft.background.trim()) next.background = "请填写项目背景";
    }
    if (current === 1) {
      if (draft.budgetMin === null && draft.budgetMax === null) {
        next.budgetMax = "请填写预算（或选择面议后留空）";
      }
      if (draft.durationWeeks === null || draft.durationWeeks <= 0) {
        next.durationWeeks = "请填写预计周期";
      }
      if (!draft.mustScope.trim()) next.mustScope = "请描述必须完成的范围";
      if (!draft.acceptanceMetrics.trim()) next.acceptanceMetrics = "请填写验收指标";
    }
    if (current === 3) {
      if (!draft.contactName.trim()) next.contactName = "请填写联系人";
      if (!draft.contactPhone.trim()) next.contactPhone = "请填写联系方式";
    }
    setErrors((prev) => ({ ...prev, ...next }));
    return Object.keys(next).length === 0;
  };

  const next = async () => {
    if (!validateStep(step)) {
      toast.error("请补齐当前步骤的必填项");
      return;
    }
    if (step === STEP_LABELS.length - 1) {
      const confirmed = await confirmDialog({
        title: "确认发布项目？",
        description: `将以「${assuranceLabel(draft.assuranceTier)}」发布，并进入平台审核。`,
        details: [
          "提交后项目进入平台审核中状态，审核通过后在项目市场展示。",
          "可在工作台随时撤回或补充信息（撤回前供应商可能已查看）。",
          "下一步：平台顾问核查需求完整度并分配对接。",
          "演示环境：已跳过真实支付，未伪造支付成功。"
        ],
        confirmLabel: "确认发布",
        cancelLabel: "再检查一下"
      });
      if (!confirmed) return;
      const published = submitDemoPublish(draft);
      setResult(published);
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // 忽略。
      }
      toast.success("项目已提交", "已进入平台审核，可在工作台跟踪。");
      return;
    }
    setStep((current) => Math.min(current + 1, STEP_LABELS.length - 1));
  };

  const reset = async () => {
    const confirmed = await confirmDialog({
      title: "清空草稿？",
      description: "将清除当前已填写的项目信息，且无法撤销。",
      tone: "danger",
      confirmLabel: "清空",
      cancelLabel: "保留"
    });
    if (!confirmed) return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // 忽略。
    }
    setDraft(DEFAULT_DRAFT);
    setErrors({});
    setStep(0);
    toast.info("草稿已清空");
  };

  if (result) {
    const tier = TIER_DETAILS[result.assuranceTier];
    return (
      <SuccessResult
        eyebrow="项目已提交"
        title={result.title}
        description="项目已进入平台审核。审核通过后将在项目市场展示，供应商可提交结构化方案。"
      >
        <dl className="publish-result-meta">
          <div><dt>项目编号</dt><dd>{result.projectCode}</dd></div>
          <div><dt>保障等级</dt><dd>{assuranceLabel(result.assuranceTier)}</dd></div>
          <div><dt>当前状态</dt><dd>平台审核中</dd></div>
          <div><dt>服务费用</dt><dd>{tier.price}</dd></div>
        </dl>
        <p className="publish-payment-note">
          演示环境：已跳过真实支付，未伪造支付成功。
        </p>
        <div className="hero-actions">
          <Link className="button button-primary" href="/marketplace">
            去项目市场查看 <ArrowRight size={16} />
          </Link>
          <Link className="button button-secondary" href="/workspace/demo/">
            进入演示工作台
          </Link>
          <button
            className="button button-ghost"
            onClick={() => {
              setResult(null);
              setDraft(DEFAULT_DRAFT);
              setStep(0);
            }}
            type="button"
          >
            <RotateCcw size={15} /> 再发一个项目
          </button>
        </div>
      </SuccessResult>
    );
  }

  return (
    <div className="assessment-layout publish-layout">
      <aside className="assessment-steps" aria-label="发布步骤">
        <div className="publish-progress">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${completion}%` }} />
          </div>
          <span className="muted">完成度 {completion}%（草稿已自动保存）</span>
        </div>
        {STEP_LABELS.map((label, index) => (
          <button
            className={`step-item ${step === index ? "active" : ""} publish-step-link`}
            key={label}
            onClick={() => index < step && setStep(index)}
            type="button"
          >
            <span className="step-index">{step > index ? <Check size={13} /> : index + 1}</span>
            <span>{label}</span>
          </button>
        ))}
      </aside>

      <section className="card assessment-card publish-card">
        <h1 className="form-step-title">{STEP_LABELS[step]}</h1>
        {step === 0 && (
          <>
            <Field label="项目标题" required error={errors.title}>
              <input
                className="input"
                onChange={(event) => update("title", event.target.value)}
                placeholder="例如：港航行业知识智能化项目"
                value={draft.title}
              />
            </Field>
            <div className="publish-row">
              <Field label="行业" error={errors.industry}>
                <select
                  className="select"
                  onChange={(event) => update("industry", event.target.value as Industry)}
                  value={draft.industry}
                >
                  {INDUSTRY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="项目类型" required error={errors.projectType}>
                <input
                  className="input"
                  onChange={(event) => update("projectType", event.target.value)}
                  placeholder="例如：知识库 / AI 助手"
                  value={draft.projectType}
                />
              </Field>
            </div>
            <Field label="业务目标" required error={errors.businessGoal}>
              <textarea
                className="textarea"
                onChange={(event) => update("businessGoal", event.target.value)}
                placeholder="可量化的业务目标，例如：将平均排障时间降低 40%"
                rows={2}
                value={draft.businessGoal}
              />
            </Field>
            <Field label="项目背景" required error={errors.background}>
              <textarea
                className="textarea"
                onChange={(event) => update("background", event.target.value)}
                placeholder="当前业务现状与本次项目的背景"
                rows={3}
                value={draft.background}
              />
            </Field>
          </>
        )}

        {step === 1 && (
          <>
            <div className="publish-row">
              <Field label="预算下限（万元，可留空表示面议）" error={errors.budgetMin}>
                <input
                  className="input"
                  inputMode="numeric"
                  onChange={(event) =>
                    update("budgetMin", event.target.value === "" ? null : Number(event.target.value))
                  }
                  type="number"
                  value={draft.budgetMin ?? ""}
                />
              </Field>
              <Field label="预算上限（万元）" error={errors.budgetMax}>
                <input
                  className="input"
                  inputMode="numeric"
                  onChange={(event) =>
                    update("budgetMax", event.target.value === "" ? null : Number(event.target.value))
                  }
                  type="number"
                  value={draft.budgetMax ?? ""}
                />
              </Field>
              <Field label="预计周期（周）" required error={errors.durationWeeks}>
                <input
                  className="input"
                  inputMode="numeric"
                  onChange={(event) =>
                    update("durationWeeks", event.target.value === "" ? null : Number(event.target.value))
                  }
                  type="number"
                  value={draft.durationWeeks ?? ""}
                />
              </Field>
            </div>
            <Field label="必须完成的范围" required error={errors.mustScope}>
              <textarea
                className="textarea"
                onChange={(event) => update("mustScope", event.target.value)}
                placeholder="逐条描述必须交付的内容"
                rows={3}
                value={draft.mustScope}
              />
            </Field>
            <Field label="明确不包含的内容" error={errors.excludedScope}>
              <textarea
                className="textarea"
                onChange={(event) => update("excludedScope", event.target.value)}
                placeholder="例如：不含底层模型自研、不含既有数据治理"
                rows={2}
                value={draft.excludedScope}
              />
            </Field>
            <Field label="验收指标" required error={errors.acceptanceMetrics} hint="业务、技术、合规三类指标，将作为联合验收依据。">
              <textarea
                className="textarea"
                onChange={(event) => update("acceptanceMetrics", event.target.value)}
                placeholder="例如：召回率 ≥ 90%；响应时延 ≤ 2 秒；高风险违规输出为 0"
                rows={3}
                value={draft.acceptanceMetrics}
              />
            </Field>
          </>
        )}

        {step === 2 && (
          <>
            <div className="tier-choice-grid">
              {(Object.keys(TIER_DETAILS) as AssuranceTier[]).map((tier) => {
                const detail = TIER_DETAILS[tier];
                const selected = draft.assuranceTier === tier;
                return (
                  <button
                    className={`card tier-choice ${selected ? "selected" : ""}`}
                    key={tier}
                    onClick={() => update("assuranceTier", tier)}
                    type="button"
                  >
                    <div className="tier-choice-head">
                      <span className={`tier-pill tier-${tier}`}>{assuranceLabel(tier)}</span>
                      {selected ? <Check size={16} /> : null}
                    </div>
                    <p className="tier-choice-price"><CircleDollarSign size={13} /> {detail.price}</p>
                    <ul className="tier-choice-includes">
                      {detail.includes.map((item) => (
                        <li key={item}><Check size={12} /> {item}</li>
                      ))}
                    </ul>
                    <ul className="tier-choice-excludes">
                      {detail.excludes.map((item) => (
                        <li key={item}>不含：{item}</li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="publish-summary">
              <SummaryRow icon={<ShieldCheck size={14} />} label="项目标题" value={draft.title || "（未填写）"} />
              <SummaryRow icon={<Clock size={14} />} label="保障等级" value={assuranceLabel(draft.assuranceTier)} />
              <SummaryRow icon={<CircleDollarSign size={14} />} label="预算" value={budgetSummary(draft)} />
              <SummaryRow icon={<Clock size={14} />} label="预计周期" value={draft.durationWeeks ? `${draft.durationWeeks} 周` : "（未填写）"} />
            </div>
            <div className="publish-row">
              <Field label="联系人" required error={errors.contactName}>
                <input
                  className="input"
                  onChange={(event) => update("contactName", event.target.value)}
                  value={draft.contactName}
                />
              </Field>
              <Field label="联系方式" required error={errors.contactPhone}>
                <input
                  className="input"
                  onChange={(event) => update("contactPhone", event.target.value)}
                  placeholder="邮箱或电话"
                  value={draft.contactPhone}
                />
              </Field>
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
                <RotateCcw size={16} /> 清空草稿
              </button>
            )}
          </div>
          <button className="button button-primary" onClick={next} type="button">
            {step === STEP_LABELS.length - 1 ? "确认发布" : "保存并继续"}
            <ArrowRight size={17} />
          </button>
        </div>
      </section>
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
    <div className="field">
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

function SummaryRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="summary-row">
      <span className="muted">{icon} {label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function budgetSummary(draft: PublishDraft): string {
  const toWan = (value: number) => `${Math.round(value)}`;
  if (draft.budgetMin === null && draft.budgetMax === null) return "面议";
  if (draft.budgetMin !== null && draft.budgetMax !== null) {
    return `¥${toWan(draft.budgetMin)}–${toWan(draft.budgetMax)} 万`;
  }
  return `约 ¥${toWan((draft.budgetMin ?? draft.budgetMax) as number)} 万`;
}
