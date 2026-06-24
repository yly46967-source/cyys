import type { DemoProject } from "@/types/domain";

export function ProjectHeading({ project }: { project: DemoProject }) {
  return (
    <div className="workspace-title-row">
      <div>
        <div className="section-kicker">{project.organization}</div>
        <h1>{project.name}</h1>
        <p className="muted">{project.summary}</p>
      </div>
      <span className="badge badge-warning">当前阶段：{project.stage}</span>
    </div>
  );
}
