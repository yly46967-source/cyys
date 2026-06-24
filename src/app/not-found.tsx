import Link from "next/link";

export default function NotFound() {
  return (
    <main className="assessment-shell">
      <div className="container">
        <div className="card assessment-card">
          <div className="section-kicker">404</div>
          <h1>没有找到这个页面</h1>
          <p className="section-lead">返回首页或进入演示工作台继续体验。</p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/">返回首页</Link>
            <Link className="button button-secondary" href="/workspace/demo/">演示工作台</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
