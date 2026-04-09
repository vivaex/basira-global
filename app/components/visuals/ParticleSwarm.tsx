'use client';
import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function ParticleSwarm({ count = 800 }) {
  const meshRef = useRef<THREE.Points>(null);
  const { mouse, viewport } = useThree();

  const [positions, speeds, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const speed = new Float32Array(count);
    const col = new Float32Array(count * 3);
    const colorChoices = [
      new THREE.Color('#06b6d4'), // Cyan
      new THREE.Color('#3b82f6'), // Blue
      new THREE.Color('#a855f7'), // Purple
      new THREE.Color('#ffffff'), // White
    ];

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
      speed[i] = 1 + Math.random();
      
      const c = colorChoices[Math.floor(Math.random() * colorChoices.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return [pos, speed, col];
  }, [count]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    const posAttr = meshRef.current.geometry.attributes.position;
    
    // Convert mouse to world coords roughly
    const mx = (mouse.x * viewport.width) / 2;
    const my = (mouse.y * viewport.height) / 2;

    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        
        // Natural drift
        posAttr.array[i3] += Math.sin(t * speeds[i] * 0.2) * 0.01;
        posAttr.array[i3 + 1] += Math.cos(t * speeds[i] * 0.15) * 0.01;

        // Mouse attraction/repulsion
        const dx = posAttr.array[i3] - mx;
        const dy = posAttr.array[i3 + 1] - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 4) {
          const force = (4 - dist) / 4;
          posAttr.array[i3] += dx / dist * force * 0.05;
          posAttr.array[i3 + 1] += dy / dist * force * 0.05;
        }

        // Keep within bounds
        if (posAttr.array[i3] > 15) posAttr.array[i3] = -15;
        if (posAttr.array[i3] < -15) posAttr.array[i3] = 15;
        if (posAttr.array[i3 + 1] > 15) posAttr.array[i3 + 1] = -15;
        if (posAttr.array[i3 + 1] < -15) posAttr.array[i3 + 1] = 15;
    }
    
    posAttr.needsUpdate = true;
    meshRef.current.rotation.z += delta * 0.05;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute 
          attach="attributes-position" 
          count={count} 
          array={positions} 
          itemSize={3} 
          args={[positions, 3]}
        />
        <bufferAttribute 
          attach="attributes-color" 
          count={count} 
          array={colors} 
          itemSize={3} 
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.08} 
        vertexColors 
        transparent 
        opacity={0.6} 
        sizeAttenuation 
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
