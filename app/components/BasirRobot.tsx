'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function BasirRobot({ mood = 'idle', message = '' }) {
  const [name, setName] = useState('أيها البطل');

  useEffect(() => {
    const savedName = localStorage.getItem('studentName');
    if (savedName) setName(savedName);
  }, []);

  return (
    <div className="fixed bottom-10 right-10 z-50 flex flex-col items-center gap-4 pointer-events-none">
      {/* فقاعة الكلام */}
      {message && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white text-slate-900 p-4 rounded-2xl rounded-br-none shadow-xl border-2 border-cyan-500 font-bold max-w-xs text-right relative mb-4 pointer-events-auto"
        >
          {message.replace('[NAME]', name)}
          <div className="absolute -bottom-2 right-4 w-4 h-4 bg-white border-r-2 border-b-2 border-cyan-500 rotate-45"></div>
        </motion.div>
      )}

      {/* الروبوت المتحرك */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="w-32 h-32 relative pointer-events-auto cursor-pointer"
      >
        {/* جسم الروبوت */}
        <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-blue-600 rounded-3xl shadow-lg shadow-cyan-500/30 flex items-center justify-center border-4 border-white/20">
          <div className="flex gap-4">
            {/* العيون بتضوي */}
            <motion.div 
              animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }}
              className="w-4 h-4 bg-white rounded-full shadow-[0_0_15px_white]"
            ></motion.div>
            <motion.div 
              animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }}
              className="w-4 h-4 bg-white rounded-full shadow-[0_0_15px_white]"
            ></motion.div>
          </div>
          {/* لمسات تكنولوجية */}
          <div className="absolute bottom-2 w-12 h-1 bg-cyan-200/50 rounded-full"></div>
        </div>
        {/* أنتل الروبوت */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-1 h-6 bg-cyan-400">
          <motion.div 
             animate={{ backgroundColor: ['#22d3ee', '#ef4444', '#22d3ee'] }} transition={{ duration: 1, repeat: Infinity }}
             className="w-3 h-3 rounded-full mx-auto -mt-2"
          ></motion.div>
        </div>
      </motion.div>
    </div>
  );
}