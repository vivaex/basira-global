'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLanguage } from '@/app/components/LanguageContext';
import GlassCard from '@/app/components/ui/GlassCard';
import NeonButton from '@/app/components/ui/NeonButton';
import SpeakButton from '@/app/components/ui/SpeakButton';

const ADHD_TESTS = [
  { 
    id: 'speed-trap', 
    title: 'فخ السرعة (Speed Trap)', 
    desc: 'اختبار الاستجابات الاندفاعية وكبح الاندفاع (Go/No-Go).', 
    icon: '⚡', 
    color: 'rose',
    criteria: 'DSM-5: Impulse Control'
  },
  { 
    id: 'cpt', 
    title: 'التركيز المستمر (Focus Vigilance)', 
    desc: 'اختبار اليقظة والانتباه المستدام لفترات طويلة (CPT).', 
    icon: '🎯', 
    color: 'cyan',
    criteria: 'CPT-3 Standard'
  },
  { 
    id: 'hyperactivity', 
    title: 'فرط النشاط (Hyperactivity)', 
    desc: 'مقياس حركة الجهاز والجسم الذكي لرصد التململ الحركي.', 
    icon: '⚡', 
    color: 'indigo',
    criteria: 'Smart Sensor Analysis'
  },
];

export default function ADHDHub() {
  const { t, language } = useLanguage();

  return (
    <main className="min-h-screen bg-[#020617] text-white p-6 md:p-12 relative overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70%] h-[30%] bg-pink-600/10 rounded-full blur-[150px] animate-pulse" />
       
       <div className="relative z-10 max-w-5xl mx-auto">
          <Link href="/diagnose">
            <NeonButton size="sm" color="rose" className="mb-12">
               {language === 'ar' ? '◀ العودة للمختبرات' : '◀ Back to Labs'}
            </NeonButton>
          </Link>

          <header className="text-center mb-20">
             <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-8xl mb-6">⚡</motion.div>
             <div className="flex flex-col items-center gap-4 mb-4">
                <h1 className="text-5xl md:text-7xl font-black italic">
                   <span className="text-rose-500">مختبرات</span> ADHD
                </h1>
                <SpeakButton 
                  text={language === 'ar' 
                    ? 'مختبرات إيه دي إتش دي. سلسلة من المهام العيادية لتقييم الاندفاعية وتشتت الانتباه.' 
                    : 'ADHD Labs. A series of clinical tasks for assessing impulsivity and distraction.'} 
                  size="sm" 
                />
             </div>
             <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto">
                {language === 'ar' 
                  ? 'سلسلة من المهام العيادية المبنية على معايير تشخيصية عالمية لتقييم الاندفاعية وتشتت الانتباه.' 
                  : 'A series of clinical tasks based on global diagnostic criteria for assessing impulsivity and distraction.'}
             </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {ADHD_TESTS.map((test, i) => (
                <Link key={test.id} href={`/diagnose/adhd/${test.id}`} className="no-underline">
                   <motion.div
                     initial={{ opacity: 0, y: 30 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: i * 0.1 }}
                     className="group relative"
                   >
                     <GlassCard variant="playful" color={test.color as any} className="p-10 border-2 hover:scale-[1.02] transition-transform duration-500 h-full cursor-pointer overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all" />
                        <div className="text-6xl mb-6">{test.icon}</div>
                        <h2 className="text-3xl font-black text-white mb-3 italic">{test.title}</h2>
                        <p className="text-slate-400 mb-8 leading-relaxed">{test.desc}</p>
                        
                        <div className="flex justify-between items-center mt-auto pt-6 border-t border-white/5">
                           <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{test.criteria}</span>
                           <span className="bg-white/5 px-4 py-2 rounded-xl text-xs font-black group-hover:bg-white group-hover:text-black transition-all">
                              {language === 'ar' ? 'بدء الاختبار' : 'Start Test'} →
                           </span>
                        </div>
                     </GlassCard>
                   </motion.div>
                </Link>
             ))}
          </div>
       </div>
    </main>
  );
}
