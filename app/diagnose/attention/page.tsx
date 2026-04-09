'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLanguage } from '@/app/components/LanguageContext';
import SpeakButton from '@/app/components/ui/SpeakButton';

const ATTENTION_LABS = [
  { id: 'cpt', title: 'الانتباه المستمر (CPT)', desc: 'ركز طويلاً وأمسك الهدف دون تشتت', icon: '🎯', color: 'from-red-500 to-rose-600' },
  { id: 'stroop-reactor', title: 'مفاعل ستروب للانتباه', desc: 'تحدى عقلك لحل التضارب اللوني بسرعة فائقة (Stroop Effect)', icon: '🔋', color: 'from-fuchsia-500 to-cyan-600' },
  { id: 'divided-attention', title: 'الانتباه المتشعب', desc: 'لعبة القيام بمهمتين في نفس الوقت!', icon: '🤹', color: 'from-fuchsia-500 to-pink-600' },
  { id: 'attention-shifting', title: 'تبديل الانتباه', desc: 'انتقل بين القواعد بسرعة ومرونة', icon: '🔀', color: 'from-violet-500 to-purple-600' },
  { id: 'impulsivity', title: 'الاندفاعية', desc: 'فكر قبل أن تضغط! احذر الفخاخ', icon: '🛑', color: 'from-rose-500 to-orange-600' },
  { id: 'hyperactivity', title: 'فرط النشاط', desc: 'مقياس حركة الجهاز والجسم الذكي', icon: '⚡', color: 'from-blue-500 to-cyan-600' },
];

export default function AttentionHub() {
  const { language } = useLanguage();
  return (
    <main className="min-h-screen bg-slate-950 p-6 md:p-12 overflow-hidden relative" dir="rtl" style={{ fontFamily: 'var(--font-arabic)' }}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70%] h-[30%] bg-red-600/20 rounded-full blur-[150px] animate-pulse" />
      
      <div className="relative z-10 max-w-6xl mx-auto">
        <Link href="/diagnose" className="inline-block mb-12 bg-slate-800 text-white p-3 rounded-2xl hover:bg-slate-700 transition transform hover:scale-105">
          ◀ رجوع للمختبرات
        </Link>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <span className="text-6xl inline-block mb-4 animate-pulse">🎯</span>
          <div className="flex flex-col items-center gap-4 mb-4">
            <h1 className="text-5xl md:text-6xl font-black gap-3 justify-center flex">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-500">
                {language === 'ar' ? 'التركيز' : 'Deep'}
              </span> 
              <span className="text-white">{language === 'ar' ? 'العميق' : 'Focus'}</span>
            </h1>
            <SpeakButton 
              text={language === 'ar' 
                ? 'مختبر التركيز العميق. امتحن قدرتك على التركيز وتجاهل المشتتات المزعجة.' 
                : 'Deep Focus Lab. Test your ability to concentrate and ignore annoying distractions.'} 
              size="sm" 
            />
          </div>
          <p className="text-slate-400 text-xl font-medium">
            {language === 'ar' ? 'امتحن قدرتك على التركيز وتجاهل المشتتات المزعجة.' : 'Test your ability to concentrate and ignore annoying distractions.'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ATTENTION_LABS.map((lab, i) => (
            <Link key={lab.id} href={`/diagnose/attention/${lab.id}`}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.95 }}
                className="bg-slate-900 border-2 border-slate-800 rounded-[2rem] p-6 relative overflow-hidden group hover:border-red-500/50 transition-all"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${lab.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <div className={`w-16 h-16 rounded-2xl mb-4 flex items-center justify-center text-3xl bg-gradient-to-br ${lab.color} shadow`}>
                  {lab.icon}
                </div>
                <h2 className="text-2xl font-black text-white mb-2">{lab.title}</h2>
                <p className="text-slate-400">{lab.desc}</p>
                <div className="mt-6 flex justify-end">
                  <span className="bg-slate-800 px-4 py-2 rounded-full text-sm font-bold group-hover:bg-red-500 transition-colors">تحدي التركيز 🎯</span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}