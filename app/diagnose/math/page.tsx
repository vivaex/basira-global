'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLanguage } from '@/app/components/LanguageContext';
import SpeakButton from '@/app/components/ui/SpeakButton';

const MATH_LABS = [
  { id: 'subitizing', title: 'التخمين السريع (Subitizing)', desc: 'لمحة سريعة! كم عدد النقاط المضيئة؟ (يكتشف عسر الحساب)', icon: '✨', color: 'from-blue-500 to-indigo-600' },
  { id: 'comparison', title: 'مقارنة الكميات (ANS)', desc: 'تقدير الكميات دون عدها لتقييم الحس العددي التلقائي', icon: '⚖️', color: 'from-cyan-500 to-blue-600' },
  { id: 'counting', title: 'التسلسل العددي (Sequencing)', desc: 'اكتشاف القاعدة الرياضية للتسلسل وإكمال السلسلة', icon: '🧮', color: 'from-amber-500 to-yellow-500' },
  { id: 'patterns', title: 'الأنماط والمنطق', desc: 'تحليل الأنماط المنطقية المعقدة (KeyMath-3)', icon: '🔄', color: 'from-purple-500 to-violet-600' },
];

export default function MathHub() {
  const { language } = useLanguage();
  return (
    <main className="min-h-screen bg-slate-950 p-6 md:p-12 overflow-hidden relative" dir="rtl" style={{ fontFamily: 'var(--font-arabic)' }}>
      <div className="absolute top-[30%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[150px] animate-pulse" />
      
      <div className="relative z-10 max-w-6xl mx-auto">
        <Link href="/diagnose" className="inline-block mb-12 bg-slate-800 text-white p-3 rounded-2xl hover:bg-slate-700 transition transform hover:scale-105">
          ◀ رجوع للمختبرات
        </Link>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <span className="text-6xl inline-block mb-4 animate-bounce">🔢</span>
          <div className="flex flex-col items-center gap-4 mb-4">
            <h1 className="text-5xl md:text-6xl font-black gap-3 justify-center flex">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">
                {language === 'ar' ? 'المنطق' : 'Math'}
              </span> 
              <span className="text-white">{language === 'ar' ? 'الرقمي' : 'Logic'}</span>
            </h1>
            <SpeakButton 
              text={language === 'ar' 
                ? 'مختبر المنطق الرقمي. أرقام، ألعاب، وتحديات! هيا لنرى مهاراتك.' 
                : 'Math Logic Lab. Numbers, games, and challenges! Let\'s see your skills.'} 
              size="sm" 
            />
          </div>
          <p className="text-slate-400 text-xl font-medium">
            {language === 'ar' ? 'أرقام، ألعاب، وتحديات! هيا لنرى مهاراتك.' : 'Numbers, games, and challenges! Let\'s see your skills.'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MATH_LABS.map((lab, i) => (
            <Link key={lab.id} href={`/diagnose/math/${lab.id}`}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}
                className="bg-slate-900 border-2 border-slate-800 rounded-[2rem] p-6 relative overflow-hidden group hover:border-blue-500/50 transition-all h-full"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${lab.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <div className={`w-16 h-16 rounded-2xl mb-4 flex items-center justify-center text-3xl bg-gradient-to-br ${lab.color} shadow`}>
                  {lab.icon}
                </div>
                <h2 className="text-2xl font-black text-white mb-2">{lab.title}</h2>
                <p className="text-slate-400">{lab.desc}</p>
                <div className="mt-6 flex justify-end">
                  <span className="bg-slate-800 px-4 py-2 rounded-full text-sm font-bold group-hover:bg-blue-500 transition-colors">ابحث والعب 🔢</span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}