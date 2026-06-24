"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

/**
 * 移动端（<768px）或用户偏好减少动效时，不加载 Three.js，仅显示静态海报；
 * 桌面端才挂载 3D 风险核心作为背景。
 * 使用 useSyncExternalStore 订阅媒体查询，避免 setState-in-effect。
 */
const QUERY = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";

const AssuranceScene = dynamic(() => import("./assurance-scene.client"), {
  ssr: false,
  loading: () => (
    <div className="scene-poster" aria-hidden="true">
      <div className="poster-core" />
    </div>
  )
});

function subscribe(callback: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

function Poster() {
  return (
    <div className="scene-poster" aria-hidden="true">
      <div className="poster-core" />
    </div>
  );
}

export function HeroBackground() {
  const allowHeavy = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return <div className="scene-shell">{allowHeavy ? <AssuranceScene /> : <Poster />}</div>;
}
