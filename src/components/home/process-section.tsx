import { Reveal } from "@/components/ui/reveal.client";

const steps = [
  ["01", "需求检查", "把模糊想法转成可量化的业务目标、数据边界与验收标准。"],
  ["02", "供应商响应", "供应商浏览匿名项目，提交结构化方案、报价、工期与真实团队成员。"],
  ["03", "方案对比", "平台对方案做结构化对比，提示异常报价，核验团队真实交付经验。"],
  ["04", "团队核验", "核验候选团队的实际投入人员与案例，避免“承诺完整团队、实际仅一人”。"],
  ["05", "里程碑监理", "逐里程碑审查交付物，维护风险台账与问题闭环。"],
  ["06", "验收与证据归档", "联合业务、技术、数据与合规指标，形成可追责的验收结论。"]
];

export function ProcessSection() {
  return (
    <section className="section section-alt" id="method">
      <div className="container">
        <Reveal>
          <div className="section-kicker">平台如何保障交付</div>
          <h2 className="section-title">让每一次承诺都有证据，每一个里程碑都可检查</h2>
          <p className="section-lead">
            平台把需求、采购、测试、实施、验收与运营连接成统一治理流程。
          </p>
          <ol className="process-flow">
            {steps.map(([number, title, text]) => (
              <li className="process-step" key={number}>
                <span className="process-number">{number}</span>
                <div>
                  <strong>{title}</strong>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
