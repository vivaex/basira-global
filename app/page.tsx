'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NetworkBackground from './components/NetworkBackground';
export default function BasiraSovereignV7() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const sections = [
    { 
      id: 'who', 
      title: 'مَن هي بَصيرة؟', 
      icon: '🛡️', 
      content: 'نحن المركز الرقمي السيادي الأول من نوعه، انطلقنا برؤية وطنية لسد الفجوة بين التشخيص الميداني والحلول الرقمية. بَصيرة منظومة متكاملة صممت لتمكين الأطفال عبر تكنولوجيا رصينة ومحمية بالكامل.'
    },
    { 
      id: 'what', 
      title: 'ماذا نفعل للأبطال؟', 
      icon: '⚡', 
      content: 'نقوم بتحويل رحلة التشخيص إلى تجربة ملهمة عبر مختبراتنا العشرة. نمنح كل طفل "الجواز التعليمي الرقمي الموحد" الذي يوثق تطوره ويرافقه في كل مراحل حياته الدراسية.'
    },
    { 
      id: 'why', 
      title: 'لماذا يختارنا الأهل؟', 
      icon: '💎', 
      content: 'دقة تصل لـ 70% في التنبؤ بالصعوبات، استخدام مستشعرات حيوية لتتبع استجابة الطفل اللحظية، وأمان سيادي يضمن تشفير كافة بيانات طفلك بخصوصية تامة لا يملك مفتاحها إلا أنت.'
    }
  ];

  return (
    <main className="min-h-screen text-slate-200 font-sans selection:bg-cyan-500/30 overflow-x-hidden relative" dir="rtl">
      
      {/* استدعاء الخلفية المتحركة */}
      <NetworkBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-16 md:pt-28 pb-32">
        
        {/* الهيدر: تم حل مشكلة "أكل الحروف" باستخدام leading و inline-block */}
        <header className="text-center mb-24 animate-in fade-in duration-1000">
          <h1 className="text-6xl md:text-8xl font-black mb-10 tracking-tight leading-[1.5] pb-4">
            منظومة <span className="inline-block px-4 py-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent italic drop-shadow-[0_0_30px_rgba(34,211,238,0.4)]">بَصيرة</span>
          </h1>
          <p className="text-slate-400 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed font-light italic">
            السيادة الرقمية في تشخيص وعلاج صعوبات التعلم بأدوات القرن الحادي والعشرين.
          </p>
        </header>

        {/* أزرار البطاقات - Glassmorphism */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(activeSection === s.id ? null : s.id)}
              className={`p-10 rounded-[3rem] border transition-all duration-700 flex flex-col items-center gap-6 group backdrop-blur-md
                ${activeSection === s.id 
                  ? 'bg-cyan-600/20 border-cyan-500 shadow-[0_0_40px_rgba(6,182,212,0.2)] scale-[1.02]' 
                  : 'bg-slate-900/40 border-white/10 hover:border-cyan-500/50 hover:bg-slate-900/60'}`}
            >
              <span className={`text-6xl transition-transform duration-700 ${activeSection === s.id ? 'scale-110 -rotate-12' : 'group-hover:scale-110'}`}>
                {s.icon}
              </span>
              <span className="text-2xl font-black italic">{s.title}</span>
            </button>
          ))}
        </div>

        {/* منطقة المحتوى المفصل */}
        <div className="relative mb-24 min-h-[250px]">
          {activeSection ? (
            <div className="w-full bg-[#0f172a]/80 backdrop-blur-2xl border border-white/10 p-12 rounded-[4rem] animate-in slide-in-from-bottom-10 fade-in duration-500 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
              <div className="flex items-center gap-6 mb-8">
                <span className="text-5xl p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">{sections.find(s => s.id === activeSection)?.icon}</span>
                <h3 className="text-4xl font-black italic text-cyan-400 underline decoration-cyan-900 underline-offset-8">
                    {sections.find(s => s.id === activeSection)?.title}
                </h3>
              </div>
              <p className="text-2xl md:text-3xl text-slate-300 leading-relaxed font-light italic text-justify">
                {sections.find(s => s.id === activeSection)?.content}
              </p>
            </div>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-slate-700 italic border-4 border-dotted border-white/5 rounded-[4rem] px-10 text-center text-xl">
              <p>اضغط على أحد المحاور السيادية أعلاه لاستكشاف تفاصيل المنظومة...</p>
            </div>
          )}
        </div>

        {/* زر الدخول النهائي */}
        <div className="text-center">
          <button 
            onClick={() => router.push('/diagnose')}
            className="group relative px-20 py-8 bg-cyan-600 text-3xl font-black rounded-[2.5rem] hover:bg-cyan-500 transition-all shadow-[0_0_60px_rgba(8,145,178,0.4)] active:scale-95"
          >
            <span className="flex items-center gap-6">
               دخول المنظومة السيادية 🛡️
               <div className="h-8 w-[2px] bg-white/20"></div>
               <span className="text-sm opacity-60 font-mono tracking-widest uppercase">Launch_V7</span>
            </span>
          </button>
        </div>

      </div>

      <footer className="mt-20 py-10 text-center opacity-20 font-mono text-xs tracking-[0.5em] uppercase">
        Sovereignty // Neural_Basira // 2026
      </footer>
    </main>
  );
}