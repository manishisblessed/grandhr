import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Environment } from '@react-three/drei';
import { motion } from 'framer-motion';

function FloatingBlob({ position, color, scale = 1, speed = 1, distort = 0.4 }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime() * speed;
    ref.current.rotation.x = Math.sin(t * 0.3) * 0.4;
    ref.current.rotation.y = Math.cos(t * 0.2) * 0.5;
  });
  return (
    <Float speed={1.4} rotationIntensity={0.6} floatIntensity={1.2} position={position}>
      <Sphere ref={ref} args={[1, 64, 64]} scale={scale}>
        <MeshDistortMaterial
          color={color}
          distort={distort}
          speed={2.4}
          roughness={0.15}
          metalness={0.4}
          opacity={0.85}
          transparent
        />
      </Sphere>
    </Float>
  );
}

/**
 * Background3D
 * Renders a soft animated 3D blob scene as an ambient background.
 * Auto-disables on prefers-reduced-motion.
 */
export function Background3D({ className = '' }) {
  const reduceMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  if (reduceMotion) return null;

  return (
    <div className={`pointer-events-none absolute inset-0 -z-10 ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 3, 5]} intensity={0.7} />
        <FloatingBlob position={[-2.5, 1.2, 0]} color="#8b5cf6" scale={1.6} speed={0.6} distort={0.45} />
        <FloatingBlob position={[2.3, -1.0, -1]} color="#6366f1" scale={1.2} speed={0.9} distort={0.55} />
        <FloatingBlob position={[0.4, 1.8, -2]} color="#a78bfa" scale={0.9} speed={1.2} distort={0.35} />
        <FloatingBlob position={[-1.6, -1.6, -1.5]} color="#ec4899" scale={0.7} speed={1.4} distort={0.5} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}

/**
 * MeshGradient
 * Pure CSS animated mesh gradient background. Lighter than 3D — use everywhere.
 */
export function MeshGradient({ className = '' }) {
  return (
    <div className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`} aria-hidden>
      <div className="absolute inset-0 bg-mesh" />
      <motion.div
        className="absolute -top-40 -left-40 size-[600px] rounded-full bg-primary/30 blur-[120px]"
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-40 -right-40 size-[600px] rounded-full bg-accent/30 blur-[120px]"
        animate={{ x: [0, -60, 0], y: [0, -40, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/3 right-1/4 size-[400px] rounded-full bg-pink-500/20 blur-[100px]"
        animate={{ x: [0, 30, -30, 0], y: [0, -20, 20, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
