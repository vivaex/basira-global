'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLanguage } from '@/app/components/LanguageContext';
import SpeakButton from '@/app/components/ui/SpeakButton';

const READING_LABS = [
  { id: 'word-reading', title: 'قراءة كلمات', desc: 'لعبة قراءة الكلمات السريعة والمضيئة', icon: '📖', color: 'from-emerald-400 to-teal-500' },
  { id: 'audio-phonology', title: 'تحليل شفرات الفضاء (صوتي)', desc: 'اقرأ الكلمات الفضائية بصوتك لتدمر الكويكبات! يقيس عسر القراءة الفعلي', icon: '🎤', color: 'from-cyan-400 to-blue-500' },
  { id: 'syllable-analysis', title: 'تحليل المقاطع', desc: 'قطّع الكلمة إلى أجزائها السحرية', icon: '✂️', color: 'from-lime-400 to-green-500' },
  { id: 'decoding', title: 'فك التشفير', desc: 'فك شفرة الحروف لتصل للكنز', icon: '🔓', color: 'from-amber-400 to-orange-500' },
  { id: 'reading-speed', title: 'سرعة القراءة', desc: 'هل أنت أسرع من الفهد الماهر؟', icon: '🐆', color: 'from-red-400 to-rose-500' },
  { id: 'reading-comprehension', title: 'فهم المقروء', desc: 'اقرأ القصة واكتشف نهايتها السرية', icon: '🧐', color: 'from-indigo-400 to-violet-500' },
  { id: 'ai-error-analysis', title: 'تحليل الأخطاء', desc: 'بالذكاء الاصطناعي والصوت (AI Voice)', icon: '🤖', color: 'from-fuchsia-400 to-pink-500' },
];

export default function ReadingHub() {
  const { language } = useLanguage();
  return (
    <main className="min-h-screen bg-slate-950 p-6 md:p-12 overflow-hidden relative" dir="rtl" style={{ fontFamily: 'var(--font-arabic)' }}>
      <div className="absolute bottom-[20%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/20 rounded-full blur-[150px] animate-pulse" />
      
      <div className="relative z-10 max-w-6xl mx-auto">
        <Link href="/diagnose" className="inline-block mb-12 bg-slate-800 text-white p-3 rounded-2xl hover:bg-slate-700 transition transform hover:scale-105">
          ◀ رجوع للمختبرات
        </Link>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <span className="text-6xl inline-block mb-4 animate-bounce">📖</span>
          <div className="flex flex-col items-center gap-4 mb-4">
            <h1 className="text-5xl md:text-6xl font-black gap-3 justify-center flex">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
                {language === 'ar' ? 'المهارات' : 'Reading'}
              </span> 
              <span className="text-white">{language === 'ar' ? 'القرائية' : 'Skills'}</span>
            </h1>
            <SpeakButton 
              text={language === 'ar' 
                ? 'مختبر المهارات القرائية. بوابة القراء الأبطال لفك شفرات الحروف واكتشاف العوالم!' 
                : 'Reading Skills Lab. The gateway for hero readers to decode letters and discover worlds!'} 
              size="sm" 
            />
          </div>
          <p className="text-slate-400 text-xl font-medium">بوابة القراء الأبطال لفك شفرات الحروف واكتشاف العوالم!</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {READING_LABS.map((lab, i) => (
            <Link key={lab.id} href={`/diagnose/reading/${lab.id}`}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}
                className="bg-slate-900 border-2 border-slate-800 rounded-[2rem] p-6 relative overflow-hidden group hover:border-emerald-500/50 transition-all"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${lab.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <div className={`w-16 h-16 rounded-2xl mb-4 flex items-center justify-center text-3xl bg-gradient-to-br ${lab.color} shadow`}>
                  {lab.icon}
                </div>
                <h2 className="text-2xl font-black text-white mb-2">{lab.title}</h2>
                <p className="text-slate-400">{lab.desc}</p>
                <div className="mt-6 flex justify-end">
                  <span className="bg-slate-800 px-4 py-2 rounded-full text-sm font-bold group-hover:bg-emerald-500 group-hover:text-black transition-colors">تحدي القراءة 📚</span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}