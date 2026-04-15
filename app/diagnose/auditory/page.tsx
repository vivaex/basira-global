'use client';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { useLanguage } from '@/app/components/LanguageContext';
import SpeakButton from '@/app/components/ui/SpeakButton';

const AUDITORY_LABS = [
  { id: 'speech-in-noise', title: 'الاستماع المزدوج (APD)', desc: 'هل يمكنك التقاط الكلمة الصحيحة وسط الضجيج؟ مقياس المعالجة السمعية', icon: '🎧', color: 'from-cyan-400 to-blue-500' },
  { id: 'phonemic-awareness', title: 'الوعي الفونيمي (Elision)', desc: 'احذف حرفاً من الكلمة — ماذا يتبقى؟', icon: '🧩', color: 'from-purple-400 to-pink-500' },
  { id: 'auditory-memory', title: 'الذاكرة السمعية (Digit Span)', desc: 'استمع لسلسلة أرقام وأعدها بنفس الترتيب', icon: '🧠', color: 'from-green-400 to-emerald-600' },
  { id: 'voice-naming', title: 'مختبر النطق والصدى', desc: 'تسمية سريعة للأشياء عبر الميكروفون لتقييم مخارج الحروف', icon: '🎙️', color: 'from-blue-400 to-indigo-600' },
  { id: 'rhyming', title: 'القافية والسجع', desc: 'اختر الكلمة التي تقفّي مع الكلمة المعروضة', icon: '🎵', color: 'from-yellow-400 to-orange-500' },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.4 } }
};

export default function AuditoryHub() {
  const { language } = useLanguage();
  return (
    <main className="min-h-screen bg-slate-950 p-6 md:p-12 overflow-hidden relative" dir="rtl" style={{ fontFamily: 'var(--font-arabic)' }}>
      {/* Fun Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <Link href="/diagnose" className="bg-slate-800 text-white p-3 rounded-2xl hover:bg-slate-700 transition transform hover:scale-105">
            ◀ رجوع للمختبرات
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <span className="text-6xl inline-block mb-4 animate-bounce">👂</span>
          <div className="flex flex-col items-center gap-4 mb-4">
            <h1 className="text-5xl md:text-6xl font-black flex justify-center gap-3">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                {language === 'ar' ? 'ألعاب' : 'Smart'}
              </span>
              <span className="text-white">{language === 'ar' ? 'السمع الذكية' : 'Listening'}</span>
            </h1>
            <SpeakButton 
              text={language === 'ar' 
                ? 'مختبر ألعاب السمع الذكية. استمع، ركز، والعب! اختر تحديك السمعي المفضل.' 
                : 'Smart Listening Laboratory. Listen, focus, and play! Choose your favorite auditory challenge.'} 
              size="sm" 
            />
          </div>
          <p className="text-slate-400 text-xl font-medium">
            {language === 'ar' ? 'استمع، ركز، والعب! اختر تحديك السمعي المفضل.' : 'Listen, focus, and play! Choose your favorite auditory challenge.'}
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {AUDITORY_LABS.map((lab) => (
            <Link key={lab.id} href={`/diagnose/auditory/${lab.id}`}>
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.05, rotate: Math.random() * 2 - 1 }}
                whileTap={{ scale: 0.95 }}
                className="bg-slate-900 border-2 border-slate-800 rounded-[2rem] p-6 cursor-pointer relative overflow-hidden group hover:border-cyan-500/50 transition-colors"
                style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${lab.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                <div className={`w-20 h-20 rounded-2xl mb-6 flex items-center justify-center text-4xl bg-gradient-to-br ${lab.color} shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                  {lab.icon}
                </div>
                <h2 className="text-2xl font-black text-white mb-2">{lab.title}</h2>
                <p className="text-slate-400 font-medium">{lab.desc}</p>
                <div className="mt-8 flex justify-end">
                  <span className="bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-bold group-hover:bg-cyan-500 group-hover:text-slate-900 transition-colors">
                    العب الآن 🎮
                  </span>
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>
    </main>
  );
}