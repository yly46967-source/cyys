import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { Footer } from "@/components/layout/footer";
import { MarketplaceBrowser } from "@/components/marketplace/marketplace-browser.client";
import { marketplaceRepository } from "@/lib/repositories/marketplace-repository";

export const metadata: Metadata = {
  title: "项目市场",
  description: "浏览匿名化的企业 AI 项目机会，查看预算、周期、方案数量与保障等级。"
};

export default async function MarketplacePage() {
  const initialProjects = await marketplaceRepository.listProjects({ sort: "updated-desc" });

  return (
    <>
      <SiteHeader />
      <main className="marketplace-shell">
        <div className="container">
          <div className="marketplace-head">
            <div>
              <div className="section-kicker">项目市场</div>
              <h1 className="marketplace-title">正在寻找供应商的 AI 项目</h1>
              <p className="section-lead">
                浏览匿名化项目，按行业、阶段、预算与保障等级筛选，查看范围与验收要求后提交结构化方案。
              </p>
            </div>
            <Link className="button button-primary marketplace-publish" href="/projects/new">
              发布项目 <ArrowRight size={16} />
            </Link>
          </div>

          <MarketplaceBrowser initialProjects={initialProjects} />
        </div>
      </main>
      <Footer />
    </>
  );
}
