'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLanguage } from '@/app/components/LanguageContext';
import SpeakButton from '@/app/components/ui/SpeakButton';

const SOCIAL_LABS = [
  { id: 'social-recognition', title: 'تمييز المشاعر (AI Robot)', desc: 'اكتشف مشاعر الروبوت بصير من تعابير وجهه!', icon: '🤖', color: 'from-pink-500 to-rose-600' },
  { id: 'empathy-scenarios', title: 'مواقف التعاطف', desc: 'اقرأ الموقف واختر الشعور والتصرف المناسب', icon: '🤝', color: 'from-violet-500 to-purple-600' },
];

export default function SocialHub() {
  const { language } = useLanguage();
  return (
    <main className="min-h-screen bg-slate-950 p-6 md:p-12 overflow-hidden relative" dir="rtl" style={{ fontFamily: 'var(--font-arabic)' }}>
      <div className="absolute top-[20%] left-[-10%] w-[50%] h-[50%] bg-pink-600/20 rounded-full blur-[150px] animate-pulse" />
      
      <div className="relative z-10 max-w-6xl mx-auto">
        <Link href="/diagnose" className="inline-block mb-12 bg-slate-800 text-white p-3 rounded-2xl hover:bg-slate-700 transition transform hover:scale-105">
          ◀ رجوع للمختبرات
        </Link>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <span className="text-6xl inline-block mb-4 animate-bounce">🎭</span>
          <div className="flex flex-col items-center gap-4 mb-4">
            <h1 className="text-5xl md:text-6xl font-black gap-3 justify-center flex">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">
                {language === 'ar' ? 'الذكاء' : 'Social'}
              </span> 
              <span className="text-white">{language === 'ar' ? 'الاجتماعي' : 'Intelligence'}</span>
            </h1>
            <SpeakButton 
              text={language === 'ar' 
                ? 'مختبر الذكاء الاجتماعي. اكتشف مشاعر الآخرين وتعلّم التعاطف مع المواقف الاجتماعية.' 
                : 'Social Intelligence Lab. Discover others\' emotions and learn empathy in social situations.'} 
              size="sm" 
            />
          </div>
          <p className="text-slate-400 text-xl font-medium">اكتشف مشاعر الآخرين وتعلّم التعاطف مع المواقف الاجتماعية.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {SOCIAL_LABS.map((lab, i) => (
            <Link key={lab.id} href={`/diagnose/social/${lab.id}`}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}
                className="bg-slate-900 border-2 border-slate-800 rounded-[2rem] p-8 relative overflow-hidden group hover:border-pink-500/50 transition-all h-full"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${lab.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <div className={`w-20 h-20 rounded-3xl mb-6 flex items-center justify-center text-4xl bg-gradient-to-br ${lab.color} shadow`}>
                  {lab.icon}
                </div>
                <h2 className="text-3xl font-black text-white mb-3">{lab.title}</h2>
                <p className="text-slate-400 text-lg mb-8">{lab.desc}</p>
                <div className="flex justify-start">
                  <span className="bg-slate-800 px-6 py-3 rounded-full text-md font-bold group-hover:bg-pink-500 transition-colors">ابدأ التحدي 🎭</span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
