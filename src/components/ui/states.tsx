import type { ReactNode } from "react";
import { AlertTriangle, Inbox, RefreshCw } from "lucide-react";

/** 骨架加载：用于列表 / 卡片的占位。 */
export function LoadingState({ count = 6, label = "正在加载项目数据…" }: { count?: number; label?: string }) {
  return (
    <div className="state-block" aria-busy="true" aria-live="polite">
      <span className="state-eyebrow">{label}</span>
      <div className="market-grid">
        {Array.from({ length: count }).map((_, index) => (
          <div className="card skeleton-card" key={index}>
            <div className="skeleton-line skeleton-line-lg" />
            <div className="skeleton-line" />
            <div className="skeleton-line skeleton-line-sm" />
            <div className="skeleton-pills">
              <span className="skeleton-pill" />
              <span className="skeleton-pill" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmptyState({
  title = "没有匹配的项目",
  description = "试着放宽筛选条件，或清空全部筛选重新查看。",
  action
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="state-block empty-state">
      <Inbox size={34} />
      <h3>{title}</h3>
      <p className="muted">{description}</p>
      {action ? <div className="hero-actions">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = "加载失败",
  description = "演示数据未能加载，可以重试一次。",
  onRetry
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="state-block error-state">
      <AlertTriangle size={34} />
      <h3>{title}</h3>
      <p className="muted">{description}</p>
      {onRetry ? (
        <div className="hero-actions">
          <button className="button button-secondary" onClick={onRetry} type="button">
            <RefreshCw size={16} /> 重新加载
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function SuccessResult({
  eyebrow,
  title,
  description,
  children
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="state-block success-result">
      <div className="success-mark">✓</div>
      {eyebrow ? <div className="section-kicker">{eyebrow}</div> : null}
      <h2>{title}</h2>
      {description ? <p className="muted">{description}</p> : null}
      {children}
    </div>
  );
}
