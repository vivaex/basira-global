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
    <main className="min-h-screen bg-[#020617] text-white p-6 md:p-20 relative overflow-x-hidden" dir="rtl">
      
      {/* تأثيرات خلفية نيون */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        <header className="mb-20 text-center">
          <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter mb-4">
            منظومة <span className="text-cyan-400">بَصيرة</span>
          </h1>
          <p className="text-slate-500 text-2xl font-light italic tracking-widest uppercase">Sovereign_Diagnostic_Hub</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* 1. كرت مختبر الأهل (في البداية) */}
          <Link href="/diagnose/parent-hub" className="md:col-span-2 lg:col-span-3 group">
            <div className="bg-gradient-to-r from-cyan-900/40 via-slate-900/60 to-blue-900/40 backdrop-blur-2xl border-2 border-cyan-500/30 p-12 rounded-[4rem] flex flex-col md:flex-row items-center justify-between shadow-2xl transition-all hover:border-cyan-400">
               <div className="flex items-center gap-8 text-right">
                 <span className="text-8xl group-hover:rotate-12 transition-transform">👨‍👩‍👧‍👦</span>
                 <div>
                    <h2 className="text-4xl font-black italic mb-2">مختبر الرصد الوالدي</h2>
                    <p className="text-cyan-400 text-lg italic">رصد السلوك المنزلي والنمائي للبطل</p>
                 </div>
               </div>
               <div className="mt-8 md:mt-0 px-12 py-5 bg-cyan-600 rounded-[2rem] font-black text-xl group-hover:bg-cyan-500 shadow-xl transition-all">
                  دخول الأهل ◀
               </div>
            </div>
          </Link>

          {/* 2. الـ 10 مختبرات الخاصة بالطفل */}
          {labs.map((lab) => (
            <Link key={lab.id} href={`/diagnose/${lab.id}`} className="group">
              <div className={`bg-gradient-to-br ${lab.color} to-slate-900/60 border border-white/5 p-10 rounded-[3rem] h-full flex flex-col items-center text-center hover:border-cyan-500/50 transition-all backdrop-blur-md shadow-lg`}>
                <span className="text-7xl mb-6 group-hover:scale-110 transition-transform">{lab.icon}</span>
                <h3 className="text-2xl font-black italic">{lab.title}</h3>
                <p className="text-slate-500 mt-2 text-[10px] font-mono tracking-widest">SECTOR_{lab.id.toUpperCase()}</p>
              </div>
            </Link>
          ))}

          {/* 3. الخانة المفقودة: كرت النتائج النهائية الشاملة (في النهاية) */}
          <Link href="/diagnose/results" className="md:col-span-2 lg:col-span-3 group mt-10">
            <div className="bg-white/5 backdrop-blur-3xl border-2 border-white/10 p-14 rounded-[5rem] flex flex-col items-center justify-center text-center shadow-2xl hover:bg-white hover:text-black transition-all duration-700">
               <span className="text-8xl mb-6 group-hover:rotate-[360deg] transition-all duration-1000">📊</span>
               <h2 className="text-5xl font-black italic mb-4">عرض التقرير والنتائج النهائية</h2>
               <p className="text-slate-500 group-hover:text-black/60 text-xl font-light italic italic max-w-2xl">
                 بعد انتهاء البطل من الألعاب وإكمال الأهل للرصد الميداني، اضغط هنا لإصدار التشخيص السيادي الكامل والخطة العلاجية.
               </p>
               <div className="mt-10 px-20 py-6 bg-cyan-600 text-white rounded-[2.5rem] font-black text-2xl group-hover:bg-black group-hover:text-cyan-400 shadow-2xl transition-all">
                  إصدار التشخيص النهائي 🛡️
               </div>
            </div>
          </Link>

        </div>
      </div>

      <footer className="mt-32 py-10 text-center opacity-10 font-mono text-xs tracking-[1em] uppercase">
        Sovereign_Hub_Interface // 2026
      </footer>
    </main>
  );
}