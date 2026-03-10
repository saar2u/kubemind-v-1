import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';

const AICore = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.5, 1]} />
        <meshPhysicalMaterial color="#ffffff" emissive="#00D4FF" emissiveIntensity={0.2} wireframe={true} transparent={true} opacity={0.4} />
      </mesh>
      <Sphere args={[1.1, 32, 32]}>
        <MeshDistortMaterial color="#8B5CF6" emissive="#00D4FF" emissiveIntensity={0.5} attach="material" distort={0.4} speed={2} transparent={true} opacity={0.3} />
      </Sphere>
    </Float>
  );
};

// New Text-based orbiting nodes
const OrbitingText = ({ label, radius, speed, offset = 0, color }: { label: string, radius: number, speed: number, offset?: number, color: string }) => {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime() * speed + offset;
      groupRef.current.position.x = Math.cos(t) * radius;
      groupRef.current.position.z = Math.sin(t) * radius;
      groupRef.current.position.y = Math.sin(t * 2) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={3} rotationIntensity={0} floatIntensity={1.5}>
        <Billboard>
          <Text
            fontSize={0.5}
            fontWeight="bold"
            color={color}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#ffffff"
          >
            {label}
          </Text>
        </Billboard>
      </Float>
    </group>
  );
};

const HeroScene = () => {
  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
      
      <AICore />
      
      {/* Replaced broken logos with clear, bold text */}
      <OrbitingText label="AWS" color="#FF9900" radius={3.2} speed={0.5} offset={0} />
      <OrbitingText label="Azure" color="#0089D6" radius={3.2} speed={0.5} offset={Math.PI * (2/3)} />
      <OrbitingText label="GCP" color="#00C896" radius={3.2} speed={0.5} offset={Math.PI * (4/3)} />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.18, 3.22, 64]} />
        <meshBasicMaterial color="#00D4FF" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
      
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
    </>
  );
};

export default function Hero3D() {
  return (
    <div className="w-full h-full min-h-[500px] relative z-10 cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 1.5, 7], fov: 45 }} dpr={[1, 2]}>
        <HeroScene />
      </Canvas>
    </div>
  );
}
