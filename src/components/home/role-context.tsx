"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { ViewerRole } from "@/types/domain";

interface RoleContextValue {
  role: ViewerRole;
  setRole: (role: ViewerRole) => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

const STORAGE_KEY = "assurance-viewer-role";

/** 演示用视角切换：客户 / 供应商。无真实鉴权，仅本地持久化。 */
export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<ViewerRole>("client");

  const setRole = (next: ViewerRole) => {
    setRoleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // 忽略隐私模式或存储不可用。
    }
  };

  const value = useMemo(() => ({ role, setRole }), [role]);
  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useViewerRole(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    throw new Error("useViewerRole 必须在 RoleProvider 内使用");
  }
  return ctx;
}
