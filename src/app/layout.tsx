import type { Metadata } from "next";
import "./globals.css";
import { ClientInfrastructure } from "@/components/infrastructure/client-infrastructure";
import { FeedbackHost } from "@/components/ui/feedback-host";
import { RoleProvider } from "@/components/home/role-context";

export const metadata: Metadata = {
  title: {
    default: "企业 AI 项目交易与交付保障平台",
    template: "%s｜AI 项目保障平台"
  },
  description:
    "发布 AI 项目、选择供应商、购买第三方保障服务，并在统一工作台中管理里程碑、风险、交付证据与验收。"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <RoleProvider>
          <ClientInfrastructure>{children}</ClientInfrastructure>
          <FeedbackHost />
        </RoleProvider>
      </body>
    </html>
  );
}
