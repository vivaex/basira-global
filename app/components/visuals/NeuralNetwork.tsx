'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Html } from '@react-three/drei';
import * as THREE from 'three';

const INSIGHT_WORDS = ['بصيرة', 'رؤية', 'حكمة', 'ذكاء', 'إدراك', 'وعي'];

export default function NeuralNetwork({ count = 50, connectionMaxDist = 5 }) {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  // Use fixed-size buffers for performance and to stop WebGL Context Lost
  const [nodes, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const v = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 25;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
        v[i * 3] = (Math.random() - 0.5) * 0.015;
        v[i * 3 + 1] = (Math.random() - 0.5) * 0.015;
        v[i * 3 + 2] = (Math.random() - 0.5) * 0.008;
    }
    return [pos, v];
  }, [count]);

  const maxLines = count * 6; // Fixed upper limit for lines
  const linePositions = useMemo(() => new Float32Array(maxLines * 6), [maxLines]);

  useFrame((state, delta) => {
    const d = Math.min(delta, 0.1); // Cap delta to avoid jumps

    // 1. Update Node Positions
    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        nodes[i3] += velocities[i3] * d * 60;
        nodes[i3 + 1] += velocities[i3 + 1] * d * 60;
        nodes[i3 + 2] += velocities[i3 + 2] * d * 60;

        // Soft bounce / wrap
        if (Math.abs(nodes[i3]) > 18) velocities[i3] *= -1;
        if (Math.abs(nodes[i3 + 1]) > 12) velocities[i3 + 1] *= -1;
        if (nodes[i3 + 2] > 5 || nodes[i3 + 2] < -15) velocities[i3 + 2] *= -1;
    }

    if (pointsRef.current) {
        pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // 2. Update Synaptic Connections (Lines)
    let lineCount = 0;
    for (let i = 0; i < count && lineCount < maxLines; i++) {
        for (let j = i + 1; j < count && lineCount < maxLines; j++) {
            const dx = nodes[i * 3] - nodes[j * 3];
            const dy = nodes[i * 3 + 1] - nodes[j * 3 + 1];
            const dz = nodes[i * 3 + 2] - nodes[j * 3 + 2];
            const distSq = dx * dx + dy * dy + dz * dz;

            if (distSq < connectionMaxDist * connectionMaxDist) {
                const l6 = lineCount * 6;
                linePositions[l6] = nodes[i * 3];
                linePositions[l6 + 1] = nodes[i * 3 + 1];
                linePositions[l6 + 2] = nodes[i * 3 + 2];
                linePositions[l6 + 3] = nodes[j * 3];
                linePositions[l6 + 4] = nodes[j * 3 + 1];
                linePositions[l6 + 5] = nodes[j * 3 + 2];
                lineCount++;
            }
        }
    }

    if (linesRef.current) {
        linesRef.current.geometry.attributes.position.needsUpdate = true;
        linesRef.current.geometry.setDrawRange(0, lineCount * 2);
    }
  });

  const phrasePositions = useMemo(() => {
    return INSIGHT_WORDS.map((_, i) => [
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 5 - 8
    ] as [number, number, number]);
  }, []);

  return (
    <group>
      {/* Nodes (Neurons) */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute 
            attach="attributes-position" 
            args={[nodes, 3]} 
          />
        </bufferGeometry>
        <pointsMaterial 
          size={0.16} 
          color="#22d3ee" 
          transparent 
          opacity={0.8} 
          sizeAttenuation 
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Connections (Synapses) */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
            <bufferAttribute 
                attach="attributes-position" 
                args={[linePositions, 3]} 
            />
        </bufferGeometry>
        <lineBasicMaterial 
          color="#3b82f6" 
          transparent 
          opacity={0.3} 
          blending={THREE.AdditiveBlending}
          linewidth={1}
        />
      </lineSegments>

      {/* Flowing Insight Phrases - Using Html for 100% Arabic Compatibility */}
      {INSIGHT_WORDS.map((word, i) => (
        <Float 
          key={i} 
          position={phrasePositions[i]} 
          speed={0.8} 
          rotationIntensity={0} 
          floatIntensity={0.5}
        >
          <Html 
            center 
            distanceFactor={10} 
            className="pointer-events-none select-none opacity-40 hover:opacity-100 transition-opacity duration-1000"
          >
            <div 
              style={{
                color: '#a855f7',
                fontSize: '2rem',
                fontWeight: '900',
                whiteSpace: 'nowrap',
                direction: 'rtl',
                fontFamily: 'inherit',
                textShadow: '0 0 10px rgba(168,85,247,0.5)',
                userSelect: 'none'
              }}
            >
              {word}
            </div>
          </Html>
        </Float>
      ))}

      <pointLight color="#22d3ee" intensity={0.5} distance={25} />
    </group>
  );
}
