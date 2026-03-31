'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BasiraModernHome() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const sections = [
    { 
      id: 'who', 
      title: 'مَن هي بَصيرة؟', 
      icon: '🛡️', 
      content: 'نحن "المركز الرقمي السيادي الشامل". منظومة تقنية متطورة صُممت لسد الفجوة بين التشخيص الميداني والتدخل الرقمي، نهدف لتمكين الأطفال (أكاديمياً، نمائياً، وموهبياً) عبر تكنولوجيا رصينة ومحمية بالكامل.'
    },
    { 
      id: 'what', 
      title: 'ماذا نفعل للأبطال؟', 
      icon: '⚡', 
      content: 'نقدم تشخيصاً مزدوجاً فورياً، وجلسات علاجية تفاعلية مع الأفاتار "بصير"، بالإضافة إلى إصدار الجواز التعليمي الرقمي الموحد الذي يرافق الطفل في مسيرته الدراسية.'
    },
    { 
      id: 'why', 
      title: 'لماذا يختارنا الأهل؟', 
      icon: '💎', 
      content: 'دقة تصل لـ 70% رقمياً، استخدام مستشعرات حيوية لتتبع استجابة الطفل اللحظية، وأمان سيادي يضمن تشفير كافة بيانات السجل التعليمي والنمائي بخصوصية تامة.'
    }
  ];

  return (
    <main className="min-h-screen bg-[#0a0f1a] text-slate-200 font-sans selection:bg-cyan-500/30 overflow-hidden relative" dir="rtl">
      
      {/* خلفية ناعمة مريحة للعين */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-900/30 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 md:py-24">
        
        {/* الهيدر: أصغر وأرقى */}
        <header className="text-center mb-16 animate-in fade-in slide-in-from-top-5 duration-700">
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
            منظومة <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent italic">بَصيرة</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            السيادة في تشخيص وعلاج صعوبات التعلم بأدوات القرن الحادي والعشرين.
          </p>
        </header>

        {/* نظام الأزرار التفاعلية (The Interactive Hub) */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(activeSection === s.id ? null : s.id)}
              className={`p-8 rounded-[2.5rem] border-2 transition-all duration-500 flex flex-col items-center gap-4 group
                ${activeSection === s.id 
                  ? 'bg-cyan-600/20 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.2)]' 
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}`}
            >
              <span className={`text-5xl transition-transform duration-500 ${activeSection === s.id ? 'scale-110 rotate-12' : 'group-hover:scale-110'}`}>
                {s.icon}
              </span>
              <span className="text-2xl font-black italic">{s.title}</span>
              <span className={`text-sm font-mono ${activeSection === s.id ? 'text-cyan-400' : 'text-slate-600'}`}>
                {activeSection === s.id ? 'إغلاق التفاصيل ▲' : 'عرض الشرح ▼'}
              </span>
            </button>
          ))}
        </div>

        {/* منطقة عرض المحتوى الديناميكية (Dynamic Content Area) */}
        <div className="min-h-[200px] mb-20 flex justify-center">
          {activeSection ? (
            <div className="w-full max-w-4xl bg-slate-900/60 backdrop-blur-xl border border-white/10 p-10 rounded-[3rem] animate-in zoom-in-95 fade-in duration-300 shadow-2xl">
              <h3 className="text-3xl font-black text-cyan-400 mb-6 italic flex items-center gap-4">
                {sections.find(s => s.id === activeSection)?.icon}
                {sections.find(s => s.id === activeSection)?.title}
              </h3>
              <p className="text-xl md:text-2xl text-slate-300 leading-relaxed font-light italic">
                {sections.find(s => s.id === activeSection)?.content}
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center text-slate-600 italic border-2 border-dashed border-slate-800 rounded-[3rem] px-20">
              اضغط على أحد الخيارات أعلاه لاستكشاف تفاصيل المنظومة...
            </div>
          )}
        </div>

        {/* زر الدخول الرئيسي - مريح وبارز */}
        <div className="text-center">
          <button 
            onClick={() => router.push('/diagnose')}
            className="group relative px-16 py-6 bg-cyan-600 text-2xl font-black rounded-3xl hover:bg-cyan-500 transition-all shadow-[0_0_40px_rgba(8,145,178,0.3)] active:scale-95"
          >
            <span className="flex items-center gap-4">
               دخول المنظومة السيادية 🛡️
               <span className="text-sm opacity-50 group-hover:translate-x-[-5px] transition-transform font-mono">GO_CORE_V5</span>
            </span>
          </button>
        </div>

      </div>

      {/* فوتر هادئ */}
      <footer className="mt-20 py-10 border-t border-white/5 text-center text-slate-700 text-sm font-mono">
        BASIRA_SYSTEM_2026 // SOVEREIGN_EDITION
      </footer>
    </main>
  );
}