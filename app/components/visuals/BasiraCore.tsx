'use client';
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

export default function BasiraCore() {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    if (meshRef.current) {
      meshRef.current.rotation.x = t * 0.15;
      meshRef.current.rotation.y = t * 0.2;
      const s = 1 + Math.sin(t * 1.5) * 0.03;
      meshRef.current.scale.set(s, s, s);
    }
    
    if (ringRef1.current) {
      ringRef1.current.rotation.z = t * 0.4;
      ringRef1.current.rotation.x = t * 0.2;
    }
    
    if (ringRef2.current) {
      ringRef2.current.rotation.z = -t * 0.3;
      ringRef2.current.rotation.y = t * 0.15;
    }
  });

  return (
    <group>
      <Float speed={3} rotationIntensity={0.5} floatIntensity={1}>
        {/* Core "Insight" Sphere */}
        <Sphere
          ref={meshRef}
          args={[1, 32, 32]} // Reduced segments for performance
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <MeshDistortMaterial
            color={hovered ? '#06b6d4' : '#1d4ed8'}
            speed={2}
            distort={hovered ? 0.4 : 0.25}
            radius={1}
            metalness={0.9}
            roughness={0.1}
            emissive={hovered ? '#22d3ee' : '#1e3a8a'}
            emissiveIntensity={hovered ? 3 : 1.2}
          />
        </Sphere>
        
        {/* Inner Glow Light */}
        <pointLight color="#22d3ee" intensity={hovered ? 8 : 3} distance={5} />
        
        {/* Rotating "Iris" Rings */}
        <mesh ref={ringRef1} scale={1.3}>
          <torusGeometry args={[1.1, 0.015, 8, 48]} />
          <meshStandardMaterial 
            color="#22d3ee" 
            emissive="#22d3ee" 
            emissiveIntensity={10} 
            transparent 
            opacity={0.6} 
          />
        </mesh>
        
        <mesh ref={ringRef2} scale={1.5} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.2, 0.012, 8, 48]} />
          <meshStandardMaterial 
            color="#a855f7" 
            emissive="#a855f7" 
            emissiveIntensity={8} 
            transparent 
            opacity={0.4} 
          />
        </mesh>

        {/* Outer Wireframe Shell (Visual depth without high poly cost) */}
        <mesh scale={1.8}>
          <icosahedronGeometry args={[1.1, 1]} />
          <meshStandardMaterial 
            color="#ffffff" 
            wireframe 
            transparent 
            opacity={0.05} 
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </Float>
    </group>
  );
}
