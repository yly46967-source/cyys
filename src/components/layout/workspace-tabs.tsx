import Link from "next/link";

const tabs = [
  { href: "/workspace/demo/", label: "项目总览", key: "overview" },
  { href: "/workspace/demo/vendors/", label: "供应商评估", key: "vendors" },
  { href: "/workspace/demo/acceptance/", label: "PoC 验收", key: "acceptance" }
];

export function WorkspaceTabs({ active }: { active: string }) {
  return (
    <nav className="workspace-tabs" aria-label="项目功能导航">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          className={`workspace-tab ${active === tab.key ? "active" : ""}`}
          href={tab.href}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
