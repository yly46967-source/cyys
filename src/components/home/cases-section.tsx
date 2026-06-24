import { ShieldCheck } from "lucide-react";
import { marketplaceRepository } from "@/lib/repositories/marketplace-repository";
import { Reveal } from "@/components/ui/reveal.client";

export async function CasesSection() {
  const stories = await marketplaceRepository.listCases();

  return (
    <section className="section section-alt" id="cases">
      <div className="container">
        <Reveal>
          <div className="section-kicker">匿名案例</div>
          <h2 className="section-title">企业 AI 项目，如何被买对、做稳、验清</h2>
          <p className="section-lead">
            两个脱敏后的真实项目案例，展示平台如何帮助企业重新遴选供应商、核查实际投入并形成可追责的证据链。
          </p>
        </Reveal>

        <div className="cases-grid">
          {stories.map((story) => (
            <Reveal key={story.id}>
              <article className="card case-card">
                <div className="case-card-head">
                  <span className="case-industry">{story.industryLabel}</span>
                  <span className="case-anon"><ShieldCheck size={13} /> 已匿名化</span>
                </div>
                <h3 className="case-title">{story.title}</h3>
                <p className="case-copy">{story.conversationalCopy}</p>

                <div className="case-block">
                  <h4>平台介入目标</h4>
                  <ul>
                    {story.objectives.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="case-columns">
                  <div className="case-block">
                    <h4>平台服务</h4>
                    <ul>
                      {story.services.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="case-block">
                    <h4>展示成果</h4>
                    <ul>
                      {story.outcomes.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <p className="case-note">{story.anonymousNote}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
