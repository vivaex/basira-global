'use client';
import { motion } from 'framer-motion';

/**
 * AmbientBackground
 * A premium atmospheric background featuring slow-drifting glowing orbs 
 * and a subtle grain texture overlay. Designed for deep dark UI contexts.
 */
export default function AmbientBackground() {
  return (
    <div className="fixed inset-0 z-[-10] bg-[#050508] overflow-hidden pointer-events-none">
      {/* Orb 1: Electric Blue */}
      <motion.div
        animate={{
          x: [-50, 50, -50],
          y: [-30, 30, -30],
          scale: [1, 1.08, 0.96, 1],
          opacity: [0.4, 0.65, 0.35, 0.4],
        }}
        transition={{
          duration: 80,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-[-150px] left-[-150px] w-[700px] h-[700px] rounded-full"
        style={{
          background: 'radial-gradient(circle, #0EA5FF 0%, transparent 75%)',
          filter: 'blur(150px)',
          willChange: 'transform, opacity',
        }}
      />

      {/* Orb 2: Deep Violet/Purple */}
      <motion.div
        animate={{
          x: [50, -50, 50],
          y: [40, -40, 40],
          scale: [0.95, 1.05, 1, 0.95],
          opacity: [0.35, 0.6, 0.45, 0.35],
        }}
        transition={{
          duration: 90,
          repeat: Infinity,
          ease: "linear",
          delay: -30,
        }}
        className="absolute bottom-[-150px] right-[-150px] w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, #7C3AED 0%, transparent 75%)',
          filter: 'blur(150px)',
          willChange: 'transform, opacity',
        }}
      />

      {/* Orb 3: Cyan */}
      <motion.div
        animate={{
          x: [-40, 40, -40],
          y: [50, -50, 50],
          scale: [1.02, 0.98, 1.06, 1.02],
          opacity: [0.5, 0.3, 0.65, 0.5],
        }}
        transition={{
          duration: 70,
          repeat: Infinity,
          ease: "linear",
          delay: -15,
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, #00D4FF 0%, transparent 75%)',
          filter: 'blur(140px)',
          willChange: 'transform, opacity',
        }}
      />

      {/* Grain Texture Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none mix-blend-overlay"
        style={{ opacity: 0.04 }}
      >
        <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <filter id="noiseFilter">
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency="0.65" 
              numOctaves="3" 
              stitchTiles="stitch" 
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>
    </div>
  );
}
