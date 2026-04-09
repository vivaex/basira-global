'use client';
import { motion } from 'framer-motion';

export default function Cre8teraBackground() {
  return (
    <div className="fixed inset-0 z-0 bg-[#050505] overflow-hidden">
      {/* 1. Subdued Animated Grid */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.08 }}
        transition={{ duration: 2 }}
        className="absolute inset-0 grid-bg"
        style={{
          backgroundSize: '100px 100px',
          backgroundImage: `
            linear-gradient(rgba(34,211,238,0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,211,238,0.15) 1px, transparent 1px)
          `
        }}
      />

      {/* 2. Top Indigo Light Beam (Layered) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-[800px] pointer-events-none">
        {/* Deep Indigo Core */}
        <motion.div 
          animate={{ 
            opacity: [0.4, 0.6, 0.4],
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute top-[-300px] left-1/2 -translate-x-1/2 w-[1000px] h-[1000px]"
          style={{
            background: 'radial-gradient(50% 50% at 50% 50%, rgba(79, 70, 229, 0.25) 0%, rgba(79, 70, 229, 0) 100%)',
            filter: 'blur(100px)',
          }}
        />
        
        {/* Cyan Highlight Beam */}
        <motion.div 
          animate={{ 
            opacity: [0.3, 0.5, 0.3],
            y: [-20, 20, -20]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute top-[-150px] left-1/2 -translate-x-1/2 w-[600px] h-[800px]"
          style={{
            background: 'radial-gradient(50% 50% at 50% 0%, rgba(34, 211, 238, 0.2) 0%, rgba(34, 211, 238, 0) 100%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      {/* 3. Bottom Glowing Horizon Arc */}
      <div className="absolute bottom-[-15%] left-1/2 -translate-x-1/2 w-[160%] h-[50%] pointer-events-none">
        <motion.div 
          animate={{ 
            opacity: [0.5, 0.8, 0.5],
            y: [0, 8, 0]
          }}
          transition={{ 
            duration: 12, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="w-full h-full rounded-[100%] border-t-[2px] border-cyan-500/30"
          style={{
            background: 'radial-gradient(50% 50% at 50% 0%, rgba(6, 182, 212, 0.2) 0%, rgba(0, 0, 0, 0) 100%)',
            boxShadow: '0 -30px 100px -20px rgba(6, 182, 212, 0.4)',
          }}
        />
      </div>

      {/* 4. Atmospheric Grain/Noise Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.6] mix-blend-overlay">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* 5. Subtle Floating Particles (Optional for "Neural" feel) */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            opacity: 0, 
            x: Math.random() * 100 + '%', 
            y: Math.random() * 100 + '%' 
          }}
          animate={{ 
            opacity: [0, 0.2, 0],
            y: ['-5%', '5%'],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut"
          }}
          className="absolute w-1 h-1 bg-cyan-400/30 rounded-full blur-[1px]"
        />
      ))}
    </div>
  );
}
