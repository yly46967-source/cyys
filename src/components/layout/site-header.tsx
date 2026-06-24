import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { MobileNav } from "@/components/layout/mobile-nav.client";

export function SiteHeader({ workspace = false }: { workspace?: boolean }) {
  return (
    <header className={workspace ? "workspace-header site-header" : "site-header"}>
      <div className="container header-inner">
        <Link className="brand" href="/">
          <span className="brand-mark"><ShieldCheck size={18} /></span>
          <span>AI 项目保障平台</span>
        </Link>
        <nav className="main-nav" aria-label="主导航">
          {workspace ? (
            <>
              <Link href="/workspace/demo/">项目总览</Link>
              <Link href="/workspace/demo/vendors/">供应商评估</Link>
              <Link href="/workspace/demo/acceptance/">PoC 验收</Link>
            </>
          ) : (
            <>
              <Link href="/marketplace">项目市场</Link>
              <Link href="/#services">保障服务</Link>
              <Link href="/#cases">案例</Link>
              <Link href="/#method">如何保障</Link>
            </>
          )}
        </nav>
        {workspace ? (
          <Link className="button button-primary header-workspace-cta" href="/demo/assessment/">
            重新体检
          </Link>
        ) : (
          <div className="header-cta-row">
            <Link className="button button-secondary header-cta-compact" href="/marketplace">
              浏览项目
            </Link>
            <Link className="button button-primary" href="/projects/new">
              发布项目
            </Link>
            <MobileNav />
          </div>
        )}
      </div>
    </header>
  );
}
