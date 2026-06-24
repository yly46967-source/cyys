"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock, FileText, Layers, Wallet } from "lucide-react";
import type { MarketplaceProject } from "@/types/domain";
import { assuranceLabel, budgetRangeText, durationText, statusLabel, tierToneClass } from "@/lib/catalog";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function ProjectCard({ project, index = 0 }: { project: MarketplaceProject; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.07, 0.42), ease: EASE }}
      whileHover={{ y: -5 }}
      style={{ height: "100%" }}
    >
      <Link className="card project-card" href={`/projects/${project.id}`}>
        <div className="project-card-head">
          <span className={`tier-pill ${tierToneClass(project.assuranceTier)}`}>
            {assuranceLabel(project.assuranceTier)}
          </span>
          <span className="project-status">{statusLabel(project.status)}</span>
        </div>
        <h3 className="project-card-title">{project.title}</h3>
        <p className="project-card-meta">
          <Layers size={14} /> {project.industryLabel} · {project.projectType}
        </p>
        <p className="project-card-copy">{project.businessGoal}</p>
        <dl className="project-card-stats">
          <div>
            <dt><Wallet size={13} /> 预算</dt>
            <dd>{budgetRangeText(project)}</dd>
          </div>
          <div>
            <dt><Clock size={13} /> 周期</dt>
            <dd>{durationText(project)}</dd>
          </div>
          <div>
            <dt><FileText size={13} /> 方案</dt>
            <dd>{project.hasVendor ? "已选定" : `${project.proposalCount} 份`}</dd>
          </div>
        </dl>
        <div className="project-card-foot">
          <span className="project-card-assurance">{project.assuranceSummary}</span>
          <span className="project-card-link">
            查看详情 <ArrowRight size={15} />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
