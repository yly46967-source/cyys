import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { AssessmentReport } from "@/components/assessment/assessment-report.client";

export const metadata: Metadata = { title: "项目体检报告" };

export default function AssessmentReportPage() {
  return (
    <div className="workspace-body">
      <SiteHeader workspace />
      <main className="workspace-main">
        <div className="container">
          <AssessmentReport />
        </div>
      </main>
    </div>
  );
}
