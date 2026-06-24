import Link from "next/link";
import { ArrowRight, CheckCircle2, LifeBuoy, Radar, ShieldAlert } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { Footer } from "@/components/layout/footer";
import { HeroBackground } from "@/components/marketing/hero-background.client";
import { Reveal } from "@/components/ui/reveal.client";
import { OpportunitiesSection } from "@/components/home/opportunities-section";
import { ProcessSection } from "@/components/home/process-section";
import { CasesSection } from "@/components/home/cases-section";
import { ServicesSection } from "@/components/home/services-section";
import { RoleEntriesSection } from "@/components/home/role-entries-section";

const secondaryEntries = [
  { icon: Radar, label: "需要供应商筛选", href: "/#services" },
  { icon: ShieldAlert, label: "项目已经出现风险", href: "/#services" },
  { icon: LifeBuoy, label: "先做项目体检", href: "/demo/assessment/" }
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero hero-platform">
          <div className="hero-scene-bg" aria-hidden="true">
            <HeroBackground />
          </div>
          <div className="container hero-content">
            <Reveal y={18}>
              <span className="eyebrow">企业 AI 项目交易与交付保障</span>
              <h1>
                发布 AI 项目，
                <span className="gradient-text">找到真正能交付的团队</span>
              </h1>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="hero-copy">
                从需求发布、供应商筛选到实施监理和验收，平台帮助企业把 AI 项目买对、做稳、验清、跑起来。让每一次承诺都有证据，让每一个里程碑都可检查。
              </p>
            </Reveal>
            <Reveal delay={0.16}>
              <div className="hero-actions">
                <Link className="button button-primary" href="/projects/new">
                  发布项目 <ArrowRight size={17} />
                </Link>
                <Link className="button button-secondary" href="/marketplace">
                  浏览项目
                </Link>
              </div>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="hero-secondary">
                {secondaryEntries.map(({ icon: Icon, label, href }) => (
                  <Link className="hero-secondary-item" href={href} key={label}>
                    <Icon size={15} /> {label}
                  </Link>
                ))}
              </div>
              <div className="hero-proof">
                <span><CheckCircle2 size={15} color="#43e3a4" /> 独立第三方视角</span>
                <span><CheckCircle2 size={15} color="#43e3a4" /> 全流程证据链</span>
                <span><CheckCircle2 size={15} color="#43e3a4" /> 业务与技术联合验收</span>
              </div>
            </Reveal>
          </div>
        </section>

        <OpportunitiesSection />
        <ProcessSection />
        <CasesSection />
        <ServicesSection />
        <RoleEntriesSection />
      </main>
      <Footer />
    </>
  );
}
