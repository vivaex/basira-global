'use client';
import { Canvas } from '@react-three/fiber';
import { Environment, PerspectiveCamera, Float } from '@react-three/drei';
import { Suspense, useMemo } from 'react';
import * as THREE from 'three';
import BasiraCore from './BasiraCore';
import DiagnosticNodes from './DiagnosticNodes';
import NeuralNetwork from './NeuralNetwork';

export default function ThreeExperience() {
  return (
    <div className="fixed inset-0 z-[1] pointer-events-none transition-opacity duration-1000">
      <Canvas 
        shadows 
        dpr={[1, 1.5]} // Performance first: cap dpr
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true
        }}
      >
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={45} />
          
          {/* Clinical Lighting Setup */}
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={2} color="#22d3ee" />
          <pointLight position={[-10, -10, -10]} intensity={1} color="#a855f7" />
          <spotLight position={[0, 5, 10]} angle={0.3} penumbra={1} intensity={5} color="#ffffff" castShadow />
          
          <group position={[0, 0, 0]}>
             <BasiraCore />
             <DiagnosticNodes />
             <NeuralNetwork count={80} connectionMaxDist={5} />
          </group>
          
          {/* Subtle background atmosphere */}
          <Environment preset="night" />
          
          {/* Performance Optimization: Avoid heavy post-processing */}
        </Suspense>
      </Canvas>
    </div>
  );
}
