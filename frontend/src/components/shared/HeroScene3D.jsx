import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Float,
  RoundedBox,
  MeshDistortMaterial,
  Sphere,
  Environment,
  Stars,
  ContactShadows,
} from '@react-three/drei';

function GlassCard({ position, rotation, color, label, scale = 1 }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.rotation.x = (rotation?.[0] || 0) + Math.sin(t * 0.4) * 0.05;
    ref.current.rotation.y = (rotation?.[1] || 0) + Math.cos(t * 0.3) * 0.05;
  });
  return (
    <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.8} position={position}>
      <RoundedBox ref={ref} args={[2.4, 1.6, 0.18]} radius={0.18} smoothness={4} scale={scale} rotation={rotation}>
        <meshPhysicalMaterial
          color={color}
          roughness={0.1}
          metalness={0.4}
          clearcoat={0.7}
          clearcoatRoughness={0.15}
          transmission={0.15}
          ior={1.4}
        />
      </RoundedBox>
    </Float>
  );
}

function FloatingOrb({ position, color, scale = 1 }) {
  return (
    <Float speed={1.5} rotationIntensity={0.6} floatIntensity={1.4} position={position}>
      <Sphere args={[0.6, 64, 64]} scale={scale}>
        <MeshDistortMaterial
          color={color}
          distort={0.45}
          speed={2.4}
          roughness={0.1}
          metalness={0.5}
          opacity={0.92}
          transparent
        />
      </Sphere>
    </Float>
  );
}

export default function HeroScene3D() {
  const reduceMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );
  if (reduceMotion) return null;

  return (
    <div className="absolute inset-0 -z-10 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0.5, 7], fov: 55 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <pointLight position={[-3, -2, -3]} intensity={0.6} color="#8b5cf6" />
        <pointLight position={[3, 2, 4]} intensity={0.8} color="#6366f1" />

        <GlassCard position={[-3.2, 0.6, 0]} rotation={[0.1, 0.4, -0.05]} color="#8b5cf6" />
        <GlassCard position={[2.6, -0.4, 0]} rotation={[-0.05, -0.5, 0.1]} color="#6366f1" />
        <GlassCard position={[0.2, 1.6, -1]} rotation={[0.2, 0.1, -0.2]} color="#ec4899" scale={0.7} />

        <FloatingOrb position={[3.6, 1.6, -1.5]} color="#a78bfa" scale={1.2} />
        <FloatingOrb position={[-3.6, -1.6, -1.5]} color="#22d3ee" scale={0.9} />
        <FloatingOrb position={[0, -1.8, -2]} color="#f59e0b" scale={0.7} />

        <Stars radius={50} depth={30} count={1500} factor={3} fade speed={0.6} />
        <ContactShadows position={[0, -2.4, 0]} opacity={0.4} scale={20} blur={2.4} far={4} color="#1e1b4b" />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
