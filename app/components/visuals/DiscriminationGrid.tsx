// app/components/visuals/DiscriminationGrid.tsx
'use client';
import { useMemo } from 'react';
import DiscriminationNode from './DiscriminationNode';

interface DiscriminationGridProps {
  targets: Array<{ 
    type: 'torus' | 'octahedron' | 'dodecahedron' | 'icosahedron' | 'sphere', 
    color: string 
  }>;
  options: Array<{ 
    type: 'torus' | 'octahedron' | 'dodecahedron' | 'icosahedron' | 'sphere', 
    color: string, 
    isMatch: boolean 
  }>;
  onSelect: (isCorrect: boolean) => void;
  difficulty: number;
}

export default function DiscriminationGrid({
  targets,
  options,
  onSelect,
  difficulty
}: DiscriminationGridProps) {
  
  const targetSpacing = 2.0;
  const optionSpacing = 1.5;

  return (
    <group>
      {/* TARGETS (Stimulus Group) */}
      <group position={[0, 2.5, 0]}>
        {targets.map((t, i) => (
          <DiscriminationNode
            key={`target-${i}`}
            position={[(i - (targets.length - 1) / 2) * targetSpacing, 0, 0]}
            type={t.type}
            color={t.color}
            isOdd={false}
            difficulty={difficulty * 0.5} 
            onClick={() => {}} // Reference only
          />
        ))}
        {/* Helper Label (Invisible in 3D but helpful for layout) */}
        <mesh position={[0, 1.2, 0]}>
           <planeGeometry args={[4, 0.1]} />
           <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.5} />
        </mesh>
      </group>

      {/* OPTIONS (Search Group) */}
      <group position={[0, -1, 0]}>
        {options.map((opt, i) => (
          <DiscriminationNode
            key={`option-${i}`}
            position={[(i - (options.length - 1) / 2) * optionSpacing, 0, 0]}
            type={opt.type}
            color={opt.color}
            isOdd={opt.isMatch}
            difficulty={difficulty}
            onClick={() => onSelect(opt.isMatch)}
          />
        ))}
      </group>
    </group>
  );
}
