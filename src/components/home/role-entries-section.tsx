import Link from "next/link";
import { ArrowRight, Briefcase, Building2 } from "lucide-react";
import { Reveal } from "@/components/ui/reveal.client";

export function RoleEntriesSection() {
  return (
    <section className="section" id="roles">
      <div className="container">
        <Reveal>
          <div className="section-kicker">两类角色，一个平台</div>
          <h2 className="section-title">无论你是客户还是供应商</h2>
        </Reveal>
        <div className="role-grid">
          <Reveal>
            <article className="card role-card">
              <span className="role-icon"><Building2 size={22} /></span>
              <h3>我是企业客户</h3>
              <p className="muted">发布项目、购买保障服务、对比供应商方案，并在工作台管理里程碑、风险与验收。</p>
              <ul className="role-links">
                <li><Link href="/projects/new">发布项目 <ArrowRight size={14} /></Link></li>
                <li><Link href="/#services">购买保障服务 <ArrowRight size={14} /></Link></li>
                <li><Link href="/#cases">查看案例 <ArrowRight size={14} /></Link></li>
              </ul>
            </article>
          </Reveal>
          <Reveal delay={0.08}>
            <article className="card role-card">
              <span className="role-icon"><Briefcase size={22} /></span>
              <h3>我是项目供应商</h3>
              <p className="muted">浏览真实项目机会，提交结构化方案与报价，披露真实团队，通过履约数据建立可信能力画像。</p>
              <ul className="role-links">
                <li><Link href="/marketplace">浏览可响应项目 <ArrowRight size={14} /></Link></li>
                <li><Link href="/projects/new">了解发布流程 <ArrowRight size={14} /></Link></li>
                <li><Link href="/#method">查看评估规则 <ArrowRight size={14} /></Link></li>
              </ul>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
