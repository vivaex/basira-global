'use client';
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface NodeProps {
  position: [number, number, number];
  color: string;
  label: string;
  speed: number;
  url: string;
  Geometry: any;
}

function SkillNode({ position, color, label, speed, url, Geometry }: NodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y += Math.sin(state.clock.getElapsedTime() * speed) * 0.005;
      meshRef.current.rotation.z += 0.005;
      meshRef.current.rotation.y += 0.01;
    }
  });

  const handleClick = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh
          ref={meshRef}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={handleClick}
          onPointerDown={handleClick}
        >
          <Geometry args={[0.6, 16, 100]} />
          <MeshDistortMaterial
            color={hovered ? '#fff' : color}
            speed={hovered ? 5 : 2}
            distort={hovered ? 0.5 : 0.3}
            radius={1}
            metalness={0.9}
            roughness={0.1}
            emissive={color}
            emissiveIntensity={hovered ? 4 : 1}
          />
        </mesh>
        
        {/* Glow Aura */}
        {hovered && (
          <mesh scale={1.4}>
            <Geometry args={[0.6, 16, 100]} />
            <meshStandardMaterial color={color} transparent opacity={0.15} wireframe />
          </mesh>
        )}

        <Text
          position={[0, 1.2, 0]}
          fontSize={0.25}
          color="white"
          font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZJhjp-Ek4_OcA.woff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="rgba(0,0,0,0.5)"
        >
          {label}
        </Text>
      </Float>
    </group>
  );
}

export default function SkillNodes() {
  const skills = [
    { 
      label: 'FRONTEND', 
      color: '#22d3ee', 
      position: [3.5, 2.5, -2] as [number, number, number], 
      speed: 1.2,
      url: '/clinician',
      Geometry: (props: any) => <torusGeometry {...props} args={[0.5, 0.15, 16, 100]} />
    },
    { 
      label: 'BACKEND', 
      color: '#3b82f6', 
      position: [-3.5, 1.5, -1] as [number, number, number], 
      speed: 0.8,
      url: '/diagnose',
      Geometry: (props: any) => <octahedronGeometry {...props} args={[0.7]} />
    },
    { 
      label: 'AI / ML', 
      color: '#a855f7', 
      position: [2.5, -2.5, 1] as [number, number, number], 
      speed: 1.5,
      url: '/diagnose/results',
      Geometry: (props: any) => <dodecahedronGeometry {...props} args={[0.7]} />
    },
    { 
      label: 'FULLSTACK', 
      color: '#6366f1', 
      position: [-2.5, -2.5, -2] as [number, number, number], 
      speed: 1.0,
      url: '/diagnose/report-pro',
      Geometry: (props: any) => <icosahedronGeometry {...props} args={[0.7]} />
    },
  ];

  return (
    <group>
      {skills.map((skill, index) => (
        <SkillNode key={index} {...skill} />
      ))}
    </group>
  );
}
