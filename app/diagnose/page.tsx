'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LabsDashboard() {
  const labs = [
    { id: 'math', title: 'المنطق الرقمي', icon: '🔢', color: 'from-blue-600/20' },
    { id: 'visual', title: 'البصر المكاني', icon: '👁️', color: 'from-purple-600/20' },
    { id: 'attention', title: 'التركيز العميق', icon: '🎯', color: 'from-red-600/20' },
    { id: 'memory', title: 'الذاكرة السيادية', icon: '🧠', color: 'from-emerald-600/20' },
    { id: 'motor', title: 'التآزر الحركي', icon: '✍️', color: 'from-rose-600/20' },
    { id: 'language', title: 'البناء اللغوي', icon: '📖', color: 'from-indigo-600/20' },
    { id: 'auditory', title: 'الرصد السمعي', icon: '👂', color: 'from-cyan-600/20' },
    { id: 'executive', title: 'الوظائف العليا', icon: '⚙️', color: 'from-fuchsia-600/20' },
    { id: 'cognitive', title: 'الإدراك العام', icon: '💡', color: 'from-amber-600/20' },
    { id: 'writing', title: 'التعبير الكتابي', icon: '🖋️', color: 'from-teal-600/20' },
  ];

  return (
    <main className="min-h-screen bg-[#020617] text-white p-6 md:p-20 relative overflow-hidden" dir="rtl">
      <div className="max-w-7xl mx-auto relative z-10">
        
        <header className="mb-16 text-center">
          <h1 className="text-5xl md:text-7xl font-black italic mb-4">مختبرات <span className="text-cyan-400 text-glow">بَصيرة</span></h1>
          <p className="text-slate-400 text-xl font-light italic">اختر قطاع الفحص لبدء المهمة السيادية.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* كرت مختبر الأهل المميز */}
          <Link href="/diagnose/parent-hub" className="md:col-span-2 lg:col-span-3 group">
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="bg-gradient-to-r from-cyan-900/40 via-slate-900/60 to-blue-900/40 backdrop-blur-2xl border-2 border-cyan-500/30 p-12 rounded-[4rem] flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden transition-all hover:border-cyan-400"
            >
               <div className="flex items-center gap-8">
                 <span className="text-8xl group-hover:rotate-12 transition-transform">👨‍👩‍👧‍👦</span>
                 <div className="text-right">
                    <h2 className="text-4xl font-black italic mb-2">مختبر الرصد الوالدي</h2>
                    <p className="text-cyan-400 text-lg italic">رصد السلوك المنزلي والنمائي للبطل</p>
                 </div>
               </div>
               <div className="mt-8 md:mt-0 px-12 py-5 bg-cyan-600 rounded-[2rem] font-black text-xl shadow-xl group-hover:bg-cyan-500 transition-all">
                  دخول الأهل ◀
               </div>
            </motion.div>
          </Link>

          {/* باقي مختبرات الأطفال */}
          {labs.map((lab) => (
            <Link key={lab.id} href={`/diagnose/${lab.id}`} className="group">
              <div className={`bg-gradient-to-br ${lab.color} to-slate-900/60 border border-white/5 p-10 rounded-[3rem] h-full flex flex-col items-center text-center hover:border-white/20 transition-all backdrop-blur-md`}>
                <span className="text-6xl mb-6 group-hover:scale-110 transition-transform">{lab.icon}</span>
                <h3 className="text-2xl font-black italic">{lab.title}</h3>
                <p className="text-slate-500 mt-2 text-xs font-mono uppercase tracking-widest">Sector_{lab.id}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}