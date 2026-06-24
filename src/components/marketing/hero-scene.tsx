"use client";

import dynamic from "next/dynamic";

const AssuranceScene = dynamic(() => import("./assurance-scene.client"), {
  ssr: false,
  loading: () => (
    <div className="scene-poster" aria-hidden="true">
      <div className="poster-core" />
    </div>
  )
});

export function HeroScene() {
  return (
    <div className="scene-shell">
      <AssuranceScene />
    </div>
  );
}
