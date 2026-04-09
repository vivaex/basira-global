'use client';
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

export default function NeuralCore() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
      
      // Pulse effect
      const s = 1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.05;
      meshRef.current.scale.set(s, s, s);
    }
  });

  return (
    <Float speed={4} rotationIntensity={1} floatIntensity={2}>
      <Sphere
        ref={meshRef}
        args={[1, 64, 64]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <MeshDistortMaterial
          color={hovered ? '#22d3ee' : '#3b82f6'}
          speed={3}
          distort={0.4}
          radius={1}
          metalness={0.8}
          roughness={0.1}
          emissive={hovered ? '#22d3ee' : '#3b82f6'}
          emissiveIntensity={hovered ? 2 : 0.5}
        />
      </Sphere>
      
      {/* Outer shell 1 */}
      <mesh scale={1.2}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial 
          color="#a855f7" 
          wireframe 
          transparent 
          opacity={0.2} 
          emissive="#a855f7"
          emissiveIntensity={1}
        />
      </mesh>

      {/* Outer shell 2 (faster rotation) */}
      <mesh scale={1.5} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[1.2, 0.02, 16, 100]} />
        <meshStandardMaterial color="#22d3ee" transparent opacity={0.4} emissive="#22d3ee" emissiveIntensity={5} />
      </mesh>

      {/* Internal glow */}
      <pointLight color="#22d3ee" intensity={hovered ? 5 : 2} distance={5} />
    </Float>
  );
}
