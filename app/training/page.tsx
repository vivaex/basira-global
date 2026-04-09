'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const TRAINING_LABS = [
  {
    id: 'train-stop',
    title: 'تحدي كابح القطار (Go/No-Go)',
    desc: 'مخصص لتدريب الفص الجبهي لكبح الاندفاعية وتعزيز الانتباه والتركيز.',
    icon: '🚂',
    target: 'ADHD وفرط الحركة',
    color: 'from-rose-500 to-orange-500',
    grid: 'bg-rose-500/10 border-rose-500/30'
  },
  {
    id: 'letter-catch',
    title: 'صائد الكلمات المغناطيسي',
    desc: 'تدريب التمييز البصري وسرعة المعالجة للحروف المتشابهة والمربكة.',
    icon: '🧲',
    target: 'عسر القراءة (Dyslexia)',
    color: 'from-blue-500 to-cyan-500',
    grid: 'bg-blue-500/10 border-blue-500/30'
  },
  {
    id: 'number-balance',
    title: 'ميزان الكتل الذهبية',
    desc: 'بناء الحس الرقمي (Quantity Sense) وفهم موازنة الأرقام ككميات ملموسة.',
    icon: '⚖️',
    target: 'عسر الحساب (Dyscalculia)',
    color: 'from-emerald-500 to-teal-500',
    grid: 'bg-emerald-500/10 border-emerald-500/30'
  }
];

export default function TrainingDashboard() {
  return (
    <main className="min-h-screen bg-[#020617] text-white p-6 md:p-12 overflow-x-hidden font-sans" dir="rtl">
      {/* Dynamic Backgrounds */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-emerald-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-rose-600/10 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mixed-blend-overlay"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Navigation / Header */}
        <div className="flex items-center justify-between mb-16">
          <Link href="/" className="px-6 py-3 bg-slate-800/80 border border-white/10 rounded-2xl font-bold text-slate-300 hover:text-white transition backdrop-blur-md">
            🏠 العودة للرئيسية
          </Link>
          <div className="bg-emerald-500/10 border border-emerald-500/30 px-6 py-3 rounded-full flex items-center gap-3">
            <span className="text-2xl">💪</span>
            <span className="font-black text-emerald-400 tracking-wide text-lg">صالة التدريب اليومي</span>
          </div>
        </div>

        {/* Title Area */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
            العلاج باللعب الموجه
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            مجموعة من الألعاب العلاجية المصممة بعناية بناءً على مبادئ <span className="text-emerald-400 font-bold">اللدونة العصبية (Neuroplasticity)</span> لاستهداف جذور الصعوبات وحلها.
          </p>
        </motion.div>

        {/* Game Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {TRAINING_LABS.map((lab, i) => (
            <motion.div
              key={lab.id}
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: i * 0.15, type: "spring", stiffness: 100 }}
              className="relative group h-full"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${lab.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[3rem] blur-xl`} />
              <Link href={`/training/${lab.id}`} className="block h-full">
                <div className={`h-full ${lab.grid} border p-8 rounded-[3rem] backdrop-blur-2xl transition duration-500 transform group-hover:-translate-y-2 flex flex-col items-center text-center relative z-10 bg-slate-900/60`}>
                  
                  <div className={`w-24 h-24 mb-6 rounded-full flex items-center justify-center text-5xl bg-gradient-to-br ${lab.color} shadow-2xl transform group-hover:scale-110 transition duration-500`}>
                    {lab.icon}
                  </div>
                  
                  <div className="bg-slate-950/80 border border-white/10 px-4 py-1.5 rounded-full text-xs font-bold text-slate-300 mb-6 flex items-center justify-center gap-2">
                    🎯 الهدف: <span className="text-white">{lab.target}</span>
                  </div>

                  <h3 className="text-3xl font-black text-white mb-4">{lab.title}</h3>
                  <p className="text-slate-400 text-lg leading-relaxed flex-grow">{lab.desc}</p>
                  
                  <button className="mt-8 px-8 py-3 w-full bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-lg group-hover:bg-white group-hover:text-black transition duration-300">
                    بدء التدريب ⚡
                  </button>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
