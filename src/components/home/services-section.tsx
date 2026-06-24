import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";
import { marketplaceRepository } from "@/lib/repositories/marketplace-repository";
import { Reveal } from "@/components/ui/reveal.client";

export async function ServicesSection() {
  const services = await marketplaceRepository.listServices();

  return (
    <section className="section" id="services">
      <div className="container">
        <Reveal>
          <div className="section-kicker">可下单的保障服务</div>
          <h2 className="section-title">从项目体检到全流程监理，按需下单</h2>
          <p className="section-lead">
            服务是平台的一部分，而非全部。每项服务都明确包含什么、不包含什么、周期与价格区间，以及最终交付物。
          </p>
        </Reveal>
        <div className="service-catalog-grid">
          {services.map((service, index) => (
            <Reveal delay={(index % 4) * 0.06} key={service.id}>
              <article className="card service-catalog-card">
                <div className="service-catalog-head">
                  <span className="service-category">{service.category}</span>
                  <h3>{service.name}</h3>
                </div>
                <p className="service-catalog-summary">{service.summary}</p>
                <ul className="service-includes">
                  {service.includes.slice(0, 4).map((item) => (
                    <li key={item}><Check size={13} /> {item}</li>
                  ))}
                </ul>
                {service.excludes.length > 0 ? (
                  <ul className="service-excludes">
                    {service.excludes.slice(0, 1).map((item) => (
                      <li key={item}><X size={13} /> {item}</li>
                    ))}
                  </ul>
                ) : null}
                <div className="service-catalog-meta">
                  <div>
                    <span className="muted">周期</span>
                    <strong>{service.duration}</strong>
                  </div>
                  <div>
                    <span className="muted">价格</span>
                    <strong>{service.priceRange}</strong>
                  </div>
                </div>
                <div className="service-catalog-foot">
                  <span className="service-deliverable">交付：{service.deliverables.slice(0, 2).join("、")}</span>
                  <Link className="link-arrow" href="/projects/new">
                    购买服务 <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <p className="service-checkout-note">
            演示环境：服务可生成订单并进入项目工作台，但不接入真实支付，也不会伪造支付成功。
          </p>
        </Reveal>
      </div>
    </section>
  );
}
