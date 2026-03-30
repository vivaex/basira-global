'use client';
import Link from 'next/link';

export default function FuturisticDiagnose() {
  const sections = [
    { id: 'math', title: 'الرياضيات', icon: '🔢', color: 'from-blue-600/20 to-blue-400/20', border: 'border-blue-500/50', text: 'text-blue-400' },
    { id: 'visual', title: 'البصر', icon: '👁️', color: 'from-purple-600/20 to-purple-400/20', border: 'border-purple-500/50', text: 'text-purple-400' },
    { id: 'attention', title: 'الانتباه', icon: '🎯', color: 'from-red-600/20 to-red-400/20', border: 'border-red-500/50', text: 'text-red-400' },
    { id: 'memory-test', title: 'الذاكرة', icon: '🧠', color: 'from-emerald-600/20 to-emerald-400/20', border: 'border-emerald-500/50', text: 'text-emerald-400' },
    { id: 'motor', title: 'الحركة', icon: '✍️', color: 'from-rose-600/20 to-rose-400/20', border: 'border-rose-500/50', text: 'text-rose-400' },
    { id: 'language', title: 'اللغة والقراءة', icon: '📖', color: 'from-indigo-600/20 to-indigo-400/20', border: 'border-indigo-500/50', text: 'text-indigo-400' },
    { id: 'auditory', title: 'السمع والإدراك', icon: '👂', color: 'from-cyan-600/20 to-cyan-400/20', border: 'border-cyan-500/50', text: 'text-cyan-400' },
    { id: 'executive', title: 'الوظائف التنفيذية', icon: '⚙️', color: 'from-fuchsia-600/20 to-fuchsia-400/20', border: 'border-fuchsia-500/50', text: 'text-fuchsia-400' },
    { id: 'cognitive', title: 'الإدراك والمعالجة', icon: '💡', color: 'from-amber-600/20 to-amber-400/20', border: 'border-amber-500/50', text: 'text-amber-400' },
    { id: 'writing', title: 'مهارات الكتابة', icon: '🖋️', color: 'from-teal-600/20 to-teal-400/20', border: 'border-teal-500/50', text: 'text-teal-400' },
  ];

  return (
    <main className="min-h-screen bg-[#050505] text-white p-6 md:p-16 font-sans relative" dir="rtl">
      {/* توهج خلفي درامي */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-20 text-right">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter italic bg-gradient-to-l from-white via-slate-400 to-slate-800 bg-clip-text text-transparent mb-4">
            بوابة بصيرة <span className="text-blue-500 underline decoration-blue-500/30">التشخيصية</span>
          </h1>
          <p className="text-slate-500 text-2xl font-light">نظام متكامل لتحليل القدرات العصبية والنمائية بلمسة ذكاء اصطناعي.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sections.map((s, i) => (
            <Link key={s.id} href={`/diagnose/${s.id}`} className={`${i === 0 || i === 7 ? 'lg:col-span-2' : ''} group`}>
              <div className={`h-full bg-gradient-to-br ${s.color} backdrop-blur-xl border-2 ${s.border} p-8 rounded-[2rem] transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(255,255,255,0.05)] relative overflow-hidden flex flex-col justify-between`}>
                <div className="absolute -right-4 -top-4 text-9xl opacity-5 group-hover:opacity-10 transition-opacity">
                    {s.icon}
                </div>
                <div>
                  <span className="text-5xl mb-6 block">{s.icon}</span>
                  <h2 className={`text-3xl font-black ${s.text} group-hover:text-white transition-colors`}>{s.title}</h2>
                </div>
                <div className="mt-12 flex justify-between items-center">
                    <span className="text-slate-500 text-sm font-mono tracking-widest uppercase">Start Mission</span>
                    <span className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">◀</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <footer className="mt-24 flex flex-col md:flex-row justify-between items-center border-t border-white/5 pt-12 gap-8">
            <Link href="/diagnose/results" className="group relative px-12 py-5 bg-white text-black font-black text-2xl rounded-2xl overflow-hidden transition-all hover:pr-16">
                <span className="relative z-10">عرض التقرير النهائي 📊</span>
                <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 group-hover:right-6 transition-all opacity-0 group-hover:opacity-100">◀</div>
            </Link>
            <div className="text-slate-600 font-mono text-sm tracking-tighter">BASIRA_SYSTEM_V4.0 // 2026</div>
        </footer>
      </div>
    </main>
  );
}