import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { AssessmentWizard } from "@/components/assessment/assessment-wizard.client";

export const metadata: Metadata = { title: "AI 项目体检" };

export default function AssessmentPage() {
  return (
    <>
      <SiteHeader />
      <main className="assessment-shell">
        <div className="container">
          <AssessmentWizard />
        </div>
      </main>
    </>
  );
}
