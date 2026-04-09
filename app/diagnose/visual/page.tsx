'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLanguage } from '@/app/components/LanguageContext';
import SpeakButton from '@/app/components/ui/SpeakButton';

const VISUAL_LABS = [
  { id: 'discrimination', title: 'التمييز البصري', desc: 'كشف الاختلافات الدقيقة والحروف المقلوبة (WISC-PSI)', icon: '🔍', color: 'from-violet-400 to-fuchsia-500' },
  { id: 'figure-ground', title: 'الإدراك البصري (الشكل والأرضية)', desc: 'البحث عن الأهداف وسط خلفية مزدحمة ومشتتة', icon: '🕵️‍♂️', color: 'from-orange-400 to-amber-500' },
  { id: 'tracking', title: 'التتبع البصري الحركي', desc: 'مطاردة الأهداف المتحركة لتقييم التآزر البصري', icon: '👁️‍🗨️', color: 'from-blue-400 to-indigo-600' },
];

export default function VisualHub() {
  const { language } = useLanguage();
  return (
    <main className="min-h-screen bg-slate-950 p-6 md:p-12 overflow-hidden relative" dir="rtl" style={{ fontFamily: 'var(--font-arabic)' }}>
      {/* Background */}
      <div className="absolute top-0 right-[-20%] w-[60%] h-[60%] bg-violet-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-fuchsia-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 max-w-6xl mx-auto">
        <Link href="/diagnose" className="inline-block mb-12 bg-slate-800 text-white p-3 rounded-2xl hover:bg-slate-700 transition transform hover:scale-105">
          ◀ رجوع للمختبرات
        </Link>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <span className="text-6xl inline-block mb-4 animate-pulse">👁️</span>
          <div className="flex flex-col items-center gap-4 mb-4">
            <h1 className="text-5xl md:text-6xl font-black gap-3 justify-center flex">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-500">
                {language === 'ar' ? 'البصر' : 'Visual'}
              </span> 
              <span className="text-white">{language === 'ar' ? 'والمكان' : 'Spatial'}</span>
            </h1>
            <SpeakButton 
              text={language === 'ar' 
                ? 'مختبر البصر والمكان. اكتشف العالم من حولك بدقة ووضوح. جاهز للتحدي البصري؟' 
                : 'Visual and Spatial Lab. Discover the world around you with precision and clarity. Ready for the visual challenge?'} 
              size="sm" 
            />
          </div>
          <p className="text-slate-400 text-xl font-medium">
            {language === 'ar' ? 'اكتشف العالم من حولك بدقة ووضوح. جاهز للتحدي البصري؟' : 'Discover the world around you with precision and clarity. Ready for the visual challenge?'}
          </p>
        </motion.div>

        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ staggerChildren: 0.1 }}>
          {VISUAL_LABS.map((lab, i) => (
            <Link key={lab.id} href={`/diagnose/visual/${lab.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, type: 'spring' }}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="bg-slate-900 border-2 border-slate-800 rounded-[2rem] p-6 relative overflow-hidden group hover:border-violet-500/50 transition-all"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${lab.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                <div className={`w-20 h-20 rounded-2xl mb-6 flex items-center justify-center text-4xl bg-gradient-to-br ${lab.color} shadow-lg group-hover:scale-110 transition-transform`}>
                  {lab.icon}
                </div>
                <h2 className="text-2xl font-black text-white mb-2">{lab.title}</h2>
                <p className="text-slate-400 font-medium">{lab.desc}</p>
                <div className="mt-8 text-left">
                  <span className="bg-slate-800 px-4 py-2 rounded-full text-sm font-bold group-hover:bg-violet-500 transition-colors inline-block">العب 👁️‍🗨️</span>
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>
    </main>
  );
}