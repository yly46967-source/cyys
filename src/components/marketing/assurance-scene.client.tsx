"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Instances, Instance, OrbitControls } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

function RiskField() {
  const group = useRef<THREE.Group>(null);
  const points = useMemo(
    () =>
      Array.from({ length: 38 }, (_, index) => {
        const angle = index * 2.399;
        const radius = 2.25 + (index % 5) * 0.22;
        return [
          Math.cos(angle) * radius,
          ((index % 9) - 4) * 0.27,
          Math.sin(angle) * radius
        ] as const;
      }),
    []
  );

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.05;
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.08;
  });

  return (
    <group ref={group}>
      <Instances limit={points.length}>
        <sphereGeometry args={[0.055, 10, 10]} />
        <meshStandardMaterial color="#ff7b75" emissive="#ff554d" emissiveIntensity={1.4} />
        {points.map((position, index) => (
          <Instance key={index} position={position} scale={index % 7 === 0 ? 1.8 : 1} />
        ))}
      </Instances>
    </group>
  );
}

function Core() {
  const core = useRef<THREE.Mesh>(null);
  useFrame((state, delta) => {
    if (!core.current) return;
    core.current.rotation.x += delta * 0.08;
    core.current.rotation.y += delta * 0.12;
    core.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 1.4) * 0.035);
  });

  return (
    <Float speed={1.3} rotationIntensity={0.24} floatIntensity={0.3}>
      <mesh ref={core}>
        <icosahedronGeometry args={[1.06, 5]} />
        <meshPhysicalMaterial
          color="#2d9fd1"
          emissive="#0a7fb4"
          emissiveIntensity={0.55}
          roughness={0.18}
          metalness={0.42}
          transmission={0.16}
          clearcoat={1}
        />
      </mesh>
      {[1.5, 1.9, 2.32].map((radius, index) => (
        <mesh key={radius} rotation={[index * 0.72, index * 0.45, index * 0.3]}>
          <torusGeometry args={[radius, 0.018 + index * 0.006, 12, 128]} />
          <meshStandardMaterial
            color={index === 2 ? "#82edca" : "#4de2ff"}
            emissive={index === 2 ? "#2dbb84" : "#199cbd"}
            emissiveIntensity={1.8}
          />
        </mesh>
      ))}
    </Float>
  );
}

function SceneContent() {
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 5, 5]} intensity={3.2} color="#d6f6ff" />
      <pointLight position={[-3, -2, 2]} intensity={24} color="#336dff" />
      <Suspense fallback={null}>
        <Core />
        <RiskField />
        <Environment preset="city" />
      </Suspense>
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.22} />
    </>
  );
}

export default function AssuranceScene() {
  return (
    <div className="scene-canvas" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.2, 6.8], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <SceneContent />
      </Canvas>
    </div>
  );
}
