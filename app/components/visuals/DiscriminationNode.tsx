'use client';
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface DiscriminationNodeProps {
  position: [number, number, number];
  type: 'torus' | 'octahedron' | 'dodecahedron' | 'icosahedron' | 'sphere';
  color: string;
  isOdd: boolean;
  onClick: () => void;
  difficulty: number; // 0 to 1
}

export default function DiscriminationNode({ 
  position, 
  type, 
  color, 
  isOdd, 
  onClick, 
  difficulty 
}: DiscriminationNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      
      // Basic rotation
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.x += 0.005;

      // Odd-one-out behavior: subtle differences
      if (isOdd) {
        // More pulsing or faster rotation
        meshRef.current.rotation.y += 0.02 * difficulty; 
        const s = 1 + Math.sin(t * (2 + difficulty * 2)) * 0.05;
        meshRef.current.scale.set(s, s, s);
      } else {
        const s = 1 + Math.sin(t) * 0.02;
        meshRef.current.scale.set(s, s, s);
      }
    }
  });

  const renderGeometry = () => {
    switch (type) {
      case 'torus': return <torusGeometry args={[0.4, 0.15, 16, 100]} />;
      case 'octahedron': return <octahedronGeometry args={[0.5]} />;
      case 'dodecahedron': return <dodecahedronGeometry args={[0.5]} />;
      case 'icosahedron': return <icosahedronGeometry args={[0.5]} />;
      case 'sphere': return <sphereGeometry args={[0.5, 32, 32]} />;
      default: return <icosahedronGeometry args={[0.5]} />;
    }
  };

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5} position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        {renderGeometry()}
        <MeshDistortMaterial
          color={hovered ? '#fff' : color}
          speed={hovered ? 4 : 2}
          distort={isOdd ? 0.4 : 0.2}
          radius={1}
          metalness={0.8}
          roughness={0.2}
          emissive={isOdd && hovered ? '#fff' : color}
          emissiveIntensity={hovered ? 2 : (isOdd ? 1.5 : 0.5)}
        />
      </mesh>

      {/* Hover Ring */}
      {hovered && (
        <mesh scale={1.3}>
          <torusGeometry args={[0.6, 0.01, 16, 100]} />
          <meshBasicMaterial color={isOdd ? '#facc15' : '#22d3ee'} transparent opacity={0.5} />
        </mesh>
      )}
    </Float>
  );
}
