'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLanguage } from '@/app/components/LanguageContext';
import GlassCard from '@/app/components/ui/GlassCard';
import NeonButton from '@/app/components/ui/NeonButton';
import SpeakButton from '@/app/components/ui/SpeakButton';

const ATTENTION_TESTS = [
  { 
    id: 'search', 
    title: 'مستكشف الكون (Cosmic Search)', 
    desc: 'اختبار الانتباه الانتقائي ومهارات المسح البصري السريع.', 
    icon: '🔭', 
    color: 'cyan',
    criteria: 'Selective Attention'
  },
  { 
    id: 'tracking', 
    title: 'ملاح المسار (Object Tracking)', 
    desc: 'اختبار الانتباه المستدام والقدرة على تتبع كائنات متعددة.', 
    icon: '🛰️', 
    color: 'indigo',
    criteria: 'Sustained Attention'
  },
];

export default function AttentionHub() {
  const { t, language } = useLanguage();

  return (
    <main className="min-h-screen bg-[#020617] text-white p-6 md:p-12 relative overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70%] h-[30%] bg-cyan-600/10 rounded-full blur-[150px] animate-pulse" />
       
       <div className="relative z-10 max-w-5xl mx-auto">
          <Link href="/diagnose">
            <NeonButton size="sm" color="cyan" className="mb-12">
               {language === 'ar' ? '◀ العودة للمختبرات' : '◀ Back to Labs'}
            </NeonButton>
          </Link>

          <header className="text-center mb-20">
             <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-8xl mb-6">🔭</motion.div>
             <div className="flex flex-col items-center gap-4 mb-4">
                <h1 className="text-5xl md:text-7xl font-black italic">
                   <span className="text-cyan-500">مختبرات</span> الانتباه
                </h1>
                <SpeakButton 
                  text={language === 'ar' 
                    ? 'مختبرات الانتباه. سلسلة من المهام لتقييم كفاءة الانتباه والتركيز المرئي.' 
                    : 'Attention Labs. A series of tasks to assess attention efficiency and visual focus.'} 
                  size="sm" 
                />
             </div>
             <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto">
                {language === 'ar' 
                  ? 'سلسلة من المهام لتقييم كفاءة الانتباه والتركيز المرئي.' 
                  : 'A series of tasks to assess attention efficiency and visual focus.'}
             </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {ATTENTION_TESTS.map((test, i) => (
                <Link key={test.id} href={`/diagnose/attention_prob/${test.id}`} className="no-underline">
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
                              {language === 'ar' ? 'بدء المهمة' : 'Start Task'} →
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
