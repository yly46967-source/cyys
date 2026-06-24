import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { Footer } from "@/components/layout/footer";
import { PublishWizard } from "@/components/projects/publish-wizard.client";

export const metadata: Metadata = {
  title: "发布项目",
  description: "多步骤发布企业 AI 项目，选择保障等级。草稿自动保存，演示环境不接入真实支付。"
};

export default function NewProjectPage() {
  return (
    <>
      <SiteHeader />
      <main className="assessment-shell">
        <div className="container">
          <div className="publish-topnav">
            <Link className="button button-ghost" href="/marketplace">
              <ArrowLeft size={15} /> 返回项目市场
            </Link>
          </div>
          <PublishWizard />
        </div>
      </main>
      <Footer />
    </>
  );
}
