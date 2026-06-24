"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Briefcase, Building2, Lock } from "lucide-react";
import type { MarketplaceProject } from "@/types/domain";
import { useViewerRole } from "@/components/home/role-context";
import { ProposalDialog } from "@/components/projects/proposal-dialog.client";

export function ProjectActions({ project }: { project: MarketplaceProject }) {
  const { role, setRole } = useViewerRole();
  const [proposalOpen, setProposalOpen] = useState(false);

  return (
    <div className="project-actions">
      <div className="role-switch" role="group" aria-label="演示视角">
        <button
          className={`role-switch-btn ${role === "client" ? "active" : ""}`}
          onClick={() => setRole("client")}
          type="button"
        >
          <Building2 size={15} /> 客户视角
        </button>
        <button
          className={`role-switch-btn ${role === "vendor" ? "active" : ""}`}
          onClick={() => setRole("vendor")}
          type="button"
        >
          <Briefcase size={15} /> 供应商视角
        </button>
      </div>

      {role === "client" ? (
        <div className="action-card">
          <div>
            <strong>你是该项目的客户</strong>
            <p className="muted">
              进入项目工作台，对比已收到的方案、确认里程碑并管理验收。
            </p>
          </div>
          <div className="action-card-buttons">
            <Link className="button button-primary" href="/workspace/demo/">
              进入项目管理 <ArrowRight size={15} />
            </Link>
            <Link className="button button-secondary" href="/#services">
              购买保障服务
            </Link>
          </div>
        </div>
      ) : (
        <div className="action-card">
          <div>
            <strong>你是供应商</strong>
            <p className="muted">
              {project.openForProposals
                ? "提交结构化方案、报价、工期与真实投入成员。"
                : "该项目当前不接受新的方案响应。"}
            </p>
          </div>
          <div className="action-card-buttons">
            <button
              className="button button-primary"
              disabled={!project.openForProposals}
              onClick={() => setProposalOpen(true)}
              type="button"
            >
              {project.openForProposals ? (
                <>提交方案 <ArrowRight size={15} /></>
              ) : (
                <><Lock size={15} /> 暂不接收方案</>
              )}
            </button>
            <Link className="button button-secondary" href="/#method">
              查看评估规则
            </Link>
          </div>
        </div>
      )}

      <ProposalDialog
        onClose={() => setProposalOpen(false)}
        open={proposalOpen}
        projectId={project.id}
        projectTitle={project.title}
      />
    </div>
  );
}
