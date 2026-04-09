'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLanguage } from '@/app/components/LanguageContext';
import SpeakButton from '@/app/components/ui/SpeakButton';

const MOTOR_LABS = [
  { id: 'vmi-canvas', title: 'لوحة التتبع (Beery VMI)', desc: 'تتبع الشكل الهندسي بدقة مجهرية لتقييم التآزر الحركي البصري', icon: '✍️', color: 'from-rose-400 to-pink-500' },
  { id: 'shape-copying', title: 'نسخ الأشكال الهندسية', desc: 'انسخ المربع والمعين والنجمة بأعلى دقة', icon: '📐', color: 'from-orange-400 to-amber-500' },
  { id: 'finger-tapping', title: 'سرعة النقر (Finger Tapping)', desc: 'انقر بأسرع ما يمكن لقياس السرعة الحركية', icon: '⚡', color: 'from-purple-400 to-indigo-500' },
  { id: 'micro-tremor', title: 'رصد التململ (AI Tremor)', desc: 'ابقَ ثابتاً — الكاميرا ترصد أي حركة لا إرادية', icon: '🌡️', color: 'from-blue-400 to-cyan-500' },
];

export default function MotorHub() {
  const { language } = useLanguage();
  return (
    <main className="min-h-screen bg-slate-950 p-6 md:p-12 overflow-hidden relative" dir="rtl" style={{ fontFamily: 'var(--font-arabic)' }}>
      {/* Background */}
      <div className="absolute top-10 left-[-10%] w-[50%] h-[50%] bg-pink-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-rose-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1.5s' }} />

      <div className="relative z-10 max-w-6xl mx-auto">
        <Link href="/diagnose" className="inline-block mb-12 bg-slate-800 text-white p-3 rounded-2xl hover:bg-slate-700 transition transform hover:scale-105">
          ◀ رجوع للمختبرات
        </Link>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <span className="text-6xl inline-block mb-4 animate-bounce">🏃‍♂️</span>
          <div className="flex flex-col items-center gap-4 mb-4">
            <h1 className="text-5xl md:text-7xl font-black gap-3 justify-center flex">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-500">
                {language === 'ar' ? 'التآزر' : 'Motor'}
              </span> 
              <span className="text-white">{language === 'ar' ? 'الحركي' : 'Coordination'}</span>
            </h1>
            <SpeakButton 
              text={language === 'ar' 
                ? 'مختبر التآزر الحركي. العب بأصابعك ويدك، ودعنا نرى مدى إتقانك للتحكم!' 
                : 'Motor Coordination Lab. Play with your fingers and hand, and let\'s see your mastery of control!'} 
              size="sm" 
            />
          </div>
          <p className="text-slate-400 text-xl font-medium">العب بأصابعك ويدك، ودعنا نرى مدى إتقانك للتحكم!</p>
        </motion.div>

        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOTOR_LABS.map((lab, i) => (
            <Link key={lab.id} href={`/diagnose/motor/${lab.id}`}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}
                className="bg-slate-900 border-2 border-slate-800 rounded-[2rem] p-6 relative overflow-hidden group hover:border-pink-500/50 transition-all"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${lab.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center text-3xl bg-gradient-to-br ${lab.color} shadow-lg`}>
                  {lab.icon}
                </div>
                <h2 className="text-2xl font-black text-white mb-2">{lab.title}</h2>
                <p className="text-slate-400 font-medium">{lab.desc}</p>
                <div className="mt-6 flex justify-end">
                  <span className="bg-slate-800 px-4 py-2 rounded-full text-sm font-bold group-hover:bg-rose-500 transition-colors">دخول 🚀</span>
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>
    </main>
  );
}