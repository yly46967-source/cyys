"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/marketplace", label: "项目市场" },
  { href: "/#services", label: "保障服务" },
  { href: "/#cases", label: "案例" },
  { href: "/#method", label: "如何保障" }
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mobile-nav">
      <button
        aria-expanded={open}
        aria-label={open ? "关闭菜单" : "打开菜单"}
        className="mobile-nav-toggle"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      {open ? (
        <nav className="mobile-nav-panel" aria-label="移动端导航">
          {links.map((link) => (
            <Link
              href={link.href}
              key={link.href}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link className="button button-primary mobile-nav-cta" href="/projects/new" onClick={() => setOpen(false)}>
            发布项目
          </Link>
        </nav>
      ) : null}
    </div>
  );
}
