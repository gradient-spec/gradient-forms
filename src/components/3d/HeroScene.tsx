import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function DimensionalFormPanel({ position, rotation, scale = [3.2, 2.0, 0.08] }: { position: [number, number, number], rotation: [number, number, number], scale?: [number, number, number] }) {
  const mesh = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    mesh.current.rotation.x = rotation[0] + Math.sin(t * 0.5) * 0.04;
    mesh.current.rotation.y = rotation[1] + Math.cos(t * 0.4) * 0.04;
    mesh.current.position.y = position[1] + Math.sin(t * 0.8) * 0.1;
  });

  return (
    <mesh ref={mesh} position={position} rotation={rotation}>
      <boxGeometry args={scale} />
      <meshPhysicalMaterial
        color="#1A2332"
        roughness={0.2}
        metalness={0.4}
        transmission={0.4}
        thickness={0.6}
        transparent
        opacity={0.9}
        clearcoat={0.8}
        clearcoatRoughness={0.2}
      />
    </mesh>
  );
}

function AtmosphericOrb() {
  const orbRef = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    orbRef.current.rotation.z = t * 0.2;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.8}>
      <Sphere ref={orbRef} args={[1.5, 64, 64]} position={[0, 0, -1.5]}>
        <meshStandardMaterial
          color="#121820"
          roughness={0.3}
          metalness={0.8}
          emissive="#186215"
          emissiveIntensity={0.35}
          wireframe={false}
        />
      </Sphere>
    </Float>
  );
}

function StructuralParticles() {
  const pointsRef = useRef<THREE.Points>(null!);
  const count = 180;
  const positions = React.useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.03;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#829580"
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export const HeroScene: React.FC = () => {
  return (
    <div className="w-full h-full min-h-[440px] relative rounded-2xl overflow-hidden bg-[#121820] border border-[#2A3647] shadow-neo">
      {/* Volumetric Dark Atmosphere Fallback */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F14] via-[#121820] to-[#0B0F14] pointer-events-none z-0 opacity-90" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#186215]/15 rounded-full blur-[100px] pointer-events-none" />

      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 45 }}
        className="z-10 relative cursor-grab active:cursor-grabbing"
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 10]} intensity={1.2} color="#ffffff" />
        <pointLight position={[-8, -8, -8]} intensity={0.8} color="#240C5C" />
        <pointLight position={[6, 6, 6]} intensity={1.0} color="#186215" />

        <AtmosphericOrb />

        <DimensionalFormPanel position={[-2.0, 0.9, 0.8]} rotation={[0.15, 0.25, -0.05]} />
        <DimensionalFormPanel position={[2.2, -0.7, 1.2]} rotation={[-0.1, -0.25, 0.08]} />
        <DimensionalFormPanel position={[0, -1.8, 0.4]} rotation={[0.08, 0, 0]} scale={[2.8, 1.6, 0.08]} />

        <StructuralParticles />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} maxPolarAngle={Math.PI / 1.9} minPolarAngle={Math.PI / 2.4} />
      </Canvas>
    </div>
  );
};
