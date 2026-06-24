import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { marketplaceRepository } from "@/lib/repositories/marketplace-repository";
import { ProjectCard } from "@/components/marketplace/project-card";
import { Reveal } from "@/components/ui/reveal.client";

export async function OpportunitiesSection() {
  const projects = await marketplaceRepository.listProjects({ sort: "updated-desc" });
  const featured = projects.slice(0, 6);

  return (
    <section className="section" id="opportunities">
      <div className="container">
        <Reveal>
          <div className="section-kicker">真实项目机会</div>
          <h2 className="section-title">正在寻找供应商的 AI 项目</h2>
          <p className="section-lead">
            以下为匿名化后的真实项目机会。客户已发布需求，供应商可查看范围与验收要求后提交结构化方案。
          </p>
        </Reveal>
        <div className="market-grid">
          {featured.map((project, index) => (
            <ProjectCard index={index} key={project.id} project={project} />
          ))}
        </div>
        <Reveal>
          <div className="hero-actions">
            <Link className="button button-primary" href="/marketplace">
              查看全部项目 <ArrowRight size={17} />
            </Link>
            <Link className="button button-secondary" href="/projects/new">
              发布项目
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
