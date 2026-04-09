'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLanguage } from '@/app/components/LanguageContext';
import SpeakButton from '@/app/components/ui/SpeakButton';

const LANGUAGE_LABS = [
  { id: 'vocabulary', title: 'الثروة اللغوية', desc: 'اختر المعنى الصحيح للكلمات وعكسها', icon: '📚', color: 'from-blue-500 to-indigo-600' },
  { id: 'sentence-building', title: 'بناء الجمل (Syntax)', desc: 'رتب الكلمات المبعثرة لتصنع جملة صحيحة', icon: '🧩', color: 'from-cyan-500 to-blue-600' },
  { id: 'verbal-fluency', title: 'الطلاقة اللفظية (AI)', desc: 'اذكر أكبر عدد من الكلمات في 30 ثانية — بالصوت!', icon: '🗣️', color: 'from-indigo-500 to-violet-600' },
];

export default function LanguageHub() {
  const { language } = useLanguage();
  return (
    <main className="min-h-screen bg-slate-950 p-6 md:p-12 overflow-hidden relative" dir="rtl" style={{ fontFamily: 'var(--font-arabic)' }}>
      <div className="absolute top-10 right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[150px] animate-pulse" />
      
      <div className="relative z-10 max-w-6xl mx-auto">
        <Link href="/diagnose" className="inline-block mb-12 bg-slate-800 text-white p-3 rounded-2xl hover:bg-slate-700 transition transform hover:scale-105">
          ◀ رجوع للمختبرات
        </Link>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <span className="text-6xl inline-block mb-4 animate-bounce">💬</span>
          <div className="flex flex-col items-center gap-4 mb-4">
            <h1 className="text-5xl md:text-7xl font-black gap-3 justify-center flex">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">
                {language === 'ar' ? 'البناء' : 'Language'}
              </span> 
              <span className="text-white">{language === 'ar' ? 'اللغوي' : 'Build'}</span>
            </h1>
            <SpeakButton 
              text={language === 'ar' 
                ? 'مختبر البناء اللغوي. عش متعة الكلمات، وتحدث بطلاقة، واكتشف سحر اللغة!' 
                : 'Language Build Lab. Experience the joy of words, speak fluently, and discover the magic of language!'} 
              size="sm" 
            />
          </div>
          <p className="text-slate-400 text-xl font-medium">عش متعة الكلمات، وتحدث بطلاقة، واكتشف سحر اللغة!</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LANGUAGE_LABS.map((lab, i) => (
            <Link key={lab.id} href={`/diagnose/language/${lab.id}`}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05, rotate: 1 }} whileTap={{ scale: 0.95 }}
                className="bg-slate-900 border-2 border-slate-800 rounded-[2rem] p-6 relative overflow-hidden group hover:border-indigo-500/50 transition-all"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${lab.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <div className={`w-16 h-16 rounded-2xl mb-4 flex items-center justify-center text-3xl bg-gradient-to-br ${lab.color} shadow`}>
                  {lab.icon}
                </div>
                <h2 className="text-2xl font-black text-white mb-2">{lab.title}</h2>
                <p className="text-slate-400">{lab.desc}</p>
                <div className="mt-6 flex justify-end">
                  <span className="bg-slate-800 px-4 py-2 rounded-full text-sm font-bold group-hover:bg-indigo-500 transition-colors">تحدث 💬</span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}