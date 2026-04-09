'use client';
import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text, MeshDistortMaterial, Html } from '@react-three/drei';
import * as THREE from 'three';

const LABS = [
  { id: 'math', title: 'مختبر الحساب', icon: '🔢', color: '#3b82f6' },
  { id: 'visual', title: 'مختبر البصر', icon: '👁️', color: '#22d3ee' },
  { id: 'attention', title: 'مختبر الانتباه', icon: '🎯', color: '#f59e0b' },
  { id: 'social', title: 'مختبر التواصل', icon: '🤝', color: '#ec4899' },
  { id: 'reading', title: 'مختبر القراءة', icon: '📖', color: '#8b5cf6' },
  { id: 'motor', title: 'مختبر الحركة', icon: '🏃', color: '#10b981' },
  { id: 'language', title: 'مختبر اللغة', icon: '🗣️', color: '#6366f1' },
  { id: 'auditory', title: 'مختبر السمع', icon: '👂', color: '#ef4444' },
  { id: 'executive', title: 'مختبر التنفيذ', icon: '🧠', color: '#06b6d4' },
  { id: 'cognitive', title: 'مختبر الإدراك', icon: '💡', color: '#fbbf24' },
  { id: 'writing', title: 'مختبر الكتابة', icon: '✏️', color: '#a855f7' },
];

const INSIGHT_WORDS = ['حكمة', 'رؤية', 'بَصيرة', 'ذكاء', 'إدراك', 'وعي'];

function DiagnosticNode({ lab, position, index }: { lab: typeof LABS[0], position: [number, number, number], index: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
        const t = state.clock.getElapsedTime();
        meshRef.current.position.y += Math.sin(t + index) * 0.005;
        meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh
          ref={meshRef}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={() => window.location.href = `/diagnose/${lab.id}`}
        >
          <icosahedronGeometry args={[0.5, 1]} />
          <MeshDistortMaterial
            color={hovered ? '#fff' : lab.color}
            speed={hovered ? 4 : 2}
            distort={0.3}
            radius={1}
            metalness={0.8}
            roughness={0.2}
            emissive={lab.color}
            emissiveIntensity={hovered ? 5 : 1}
          />
        </mesh>

        {/* Emoji Icon */}
        <Text
          position={[0, 0, 0.6]}
          fontSize={0.4}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {lab.icon}
        </Text>

        {/* Arabic Title */}
        <Html position={[0, -0.8, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
           <div className={`px-3 py-1 rounded-full whitespace-nowrap text-[10px] font-black italic bg-slate-900/80 border border-white/20 text-white transition-opacity duration-300 ${hovered ? 'opacity-100 scale-110' : 'opacity-0 scale-90'}`}>
              {lab.title}
           </div>
        </Html>
      </Float>
    </group>
  );
}

export default function DiagnosticNodes() {
  const nodePositions = useMemo(() => {
    return LABS.map((_, i) => {
      const angle = (i / LABS.length) * Math.PI * 2;
      const radius = 6 + Math.random() * 2;
      return [
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 6,
        Math.sin(angle) * radius - 5,
      ] as [number, number, number];
    });
  }, []);

  const insightPositions = useMemo(() => {
    return INSIGHT_WORDS.map((_, i) => {
        return [
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 5 - 10,
        ] as [number, number, number];
    });
  }, []);

  return (
    <group>
      {LABS.map((lab, i) => (
        <DiagnosticNode key={lab.id} lab={lab} position={nodePositions[i]} index={i} />
      ))}

      {/* Floating Arabic Insight Words */}
      {INSIGHT_WORDS.map((word, i) => (
        <Float key={i} position={insightPositions[i]} speed={1} rotationIntensity={0.2}>
          <Text
            fontSize={0.5}
            color="#22d3ee"
            font="/fonts/inter-v12-latin-900.woff" // Fallback if no specific arabic font
            fillOpacity={0.3}
            anchorX="center"
            anchorY="middle"
          >
            {word}
          </Text>
        </Float>
      ))}
    </group>
  );
}
