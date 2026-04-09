'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLanguage } from '@/app/components/LanguageContext';
import SpeakButton from '@/app/components/ui/SpeakButton';

const COGNITIVE_LABS = [
  { id: 'categorization', title: 'التصنيف المنطقي', desc: 'أي عنصر لا ينتمي للمجموعة؟', icon: '📦', color: 'from-blue-400 to-cyan-500' },
  { id: 'cause-effect', title: 'السبب والنتيجة', desc: 'اربط كل سبب بنتيجته المنطقية', icon: '🔗', color: 'from-rose-400 to-red-500' },
  { id: 'analogies', title: 'القياس المنطقي (Analogies)', desc: 'يد : قفاز = قدم : ___ ؟', icon: '🧠', color: 'from-purple-400 to-pink-500' },
];

export default function CognitiveHub() {
  const { language } = useLanguage();
  return (
    <main className="min-h-screen bg-slate-950 p-6 md:p-12 overflow-hidden relative" dir="rtl" style={{ fontFamily: 'var(--font-arabic)' }}>
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-amber-500/20 rounded-full blur-[120px] animate-pulse" />
      
      <div className="relative z-10 max-w-6xl mx-auto">
        <Link href="/diagnose" className="inline-block mb-12 bg-slate-800 text-white p-3 rounded-2xl hover:bg-slate-700 transition transform hover:scale-105">
          ◀ رجوع للمختبرات
        </Link>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <span className="text-6xl inline-block mb-4 animate-spin-slow">🧠</span>
          <div className="flex flex-col items-center gap-4 mb-4">
            <h1 className="text-5xl md:text-6xl font-black mb-4 gap-3 justify-center flex">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                {language === 'ar' ? 'الإدراك' : 'Cognitive'}
              </span> 
              <span className="text-white">{language === 'ar' ? 'والمعالجة' : 'Processing'}</span>
            </h1>
            <SpeakButton 
              text={language === 'ar' 
                ? 'مختبر الإدراك والمعالجة. درب عقلك مع ألعاب التفكير السريع والتحليل الممتع.' 
                : 'Cognitive Processing Lab. Train your brain with fast thinking games and fun analysis.'} 
              size="sm" 
            />
          </div>
          <p className="text-slate-400 text-xl font-medium">
            {language === 'ar' ? 'درب عقلك مع ألعاب التفكير السريع والتحليل الممتع.' : 'Train your brain with fast thinking games and fun analysis.'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {COGNITIVE_LABS.map((lab, i) => (
            <Link key={lab.id} href={`/diagnose/cognitive/${lab.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="bg-slate-900 border-2 border-slate-800 rounded-[2rem] p-6 relative overflow-hidden group hover:border-amber-500/50 transition-all active:scale-95"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${lab.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <div className={`w-16 h-16 rounded-2xl mb-4 flex items-center justify-center text-3xl bg-gradient-to-br ${lab.color} shadow`}>
                  {lab.icon}
                </div>
                <h2 className="text-2xl font-black text-white mb-2">{lab.title}</h2>
                <p className="text-slate-400">{lab.desc}</p>
                <div className="mt-6 flex justify-start">
                  <span className="bg-slate-800 px-4 py-2 rounded-full text-xs font-bold group-hover:bg-amber-500 group-hover:text-black transition-colors">تحدَّ عقلك 🧠</span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}