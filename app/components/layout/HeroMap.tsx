'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface Lab {
  id: string;
  title: string;
  icon: string;
  accent: string;
  glow: string;
  bg: string;
}

interface HeroMapProps {
  labs: Lab[];
  progress: Record<string, number>;
}

export default function HeroMap({ labs, progress }: HeroMapProps) {
  // Winding path coordinates for 11 points in a responsive SVG viewbox (0 0 1000 1200)
  const points = [
    { x: 200, y: 100 },  // Math
    { x: 500, y: 150 },  // Visual
    { x: 800, y: 200 },  // Attention
    { x: 850, y: 400 },  // Social
    { x: 500, y: 450 },  // Reading
    { x: 150, y: 500 },  // Motor
    { x: 100, y: 700 },  // Language
    { x: 400, y: 750 },  // Auditory
    { x: 750, y: 800 },  // Executive
    { x: 850, y: 1000 }, // Cognitive
    { x: 500, y: 1100 }, // Writing
  ];

  return (
    <div className="relative w-full max-w-5xl mx-auto py-20 overflow-visible" dir="rtl">
      {/* SVG Path Background */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 1200" fill="none">
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, ease: "easeInOut" }}
          d={`M ${points[0].x} ${points[0].y} 
             C 400 50, 600 250, ${points[2].x} ${points[2].y}
             S 900 350, ${points[3].x} ${points[3].y}
             S 600 400, ${points[4].x} ${points[4].y}
             S 100 450, ${points[5].x} ${points[5].y}
             S 50 650, ${points[6].x} ${points[6].y}
             S 300 700, ${points[7].x} ${points[7].y}
             S 700 750, ${points[8].x} ${points[8].y}
             S 950 950, ${points[9].x} ${points[9].y}
             S 600 1050, ${points[10].x} ${points[10].y}`}
          stroke="url(#map-gradient)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray="20 20"
          className="opacity-30"
        />
        <defs>
          <linearGradient id="map-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>

      {/* Lab Islands */}
      {labs.map((lab, i) => {
        const point = points[i];
        if (!point) return null; // Prevent crash if more labs than points
        const score = progress[lab.id] || 0;
        const isUnlocked = i === 0 || (progress[labs[i - 1].id] ?? 0) > 0;

        return (
          <motion.div
            key={lab.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.15, type: 'spring' }}
            style={{ 
              position: 'absolute', 
              left: `${(point.x / 1000) * 100}%`, 
              top: `${(point.y / 1200) * 100}%`,
              transform: 'translate(-50%, -50%)'
            }}
            className="z-20 group"
          >
            <Link href={`/diagnose/${lab.id}`} className="block relative focus:outline-none">
              <motion.div
                whileHover={{ scale: 1.1, y: -10 }}
                className={`relative w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] flex flex-col items-center justify-center border-4 transition-all duration-500 shadow-2xl ${
                  isUnlocked 
                    ? 'bg-slate-900/80 backdrop-blur-xl border-white/20 group-hover:border-white/40' 
                    : 'bg-slate-950 border-slate-900 opacity-60 grayscale'
                }`}
                style={{
                  boxShadow: score > 0 ? `0 0 40px ${lab.glow}` : 'none',
                }}
              >
                {/* Floating "Island" Animation */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="flex flex-col items-center"
                >
                  <span className="text-4xl md:text-5xl mb-2">{lab.icon}</span>
                  <p className="text-[10px] md:text-xs font-black text-white italic text-center px-2">{lab.title}</p>
                </motion.div>

                {/* Score badge */}
                {score > 0 && (
                  <div className="absolute -top-3 -right-3 bg-emerald-500 text-black text-[10px] font-black w-8 h-8 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-lg">
                    {score}%
                  </div>
                )}

                {/* Lock icon for non-unlocked */}
                {!isUnlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-[2.5rem]">
                    <span className="text-2xl opacity-50">🔒</span>
                  </div>
                )}
              </motion.div>
              
              {/* Pulse effect for next target */}
              {isUnlocked && score === 0 && (
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 -z-10 rounded-[2.5rem] bg-cyan-400 blur-xl"
                />
              )}
            </Link>
          </motion.div>
        );
      })}

      {/* Spacer for bottom */}
      <div className="h-[1100px]" />
    </div>
  );
}
