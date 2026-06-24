import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <strong>企业 AI 项目交易与交付保障平台</strong>
          <p className="muted">
            发布项目、选择供应商、购买第三方保障服务，并在统一工作台中管理里程碑、风险、交付证据与验收。
          </p>
        </div>
        <nav className="footer-nav" aria-label="页脚导航">
          <Link href="/marketplace">项目市场</Link>
          <Link href="/projects/new">发布项目</Link>
          <Link href="/#services">保障服务</Link>
          <Link href="/#cases">案例</Link>
          <Link href="/demo/assessment/">项目体检</Link>
        </nav>
      </div>
      <div className="container footer-bottom">
        演示环境 · 数据已匿名化处理 · 不含真实企业名称、合同金额与人员信息
      </div>
    </footer>
  );
}
