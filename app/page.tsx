'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BasiraSovereignV6() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const sections = [
    { 
      id: 'who', 
      title: 'مَن هي بَصيرة؟', 
      icon: '🛡️', 
      content: 'نحن المركز الرقمي السيادي الأول من نوعه، انطلقنا برؤية وطنية لسد الفجوة بين التشخيص الميداني والحلول الرقمية. بَصيرة ليست مجرد تطبيق، بل هي منظومة متكاملة صممتها عقول مختصة لتمكين الأطفال الذين يواجهون تحديات (أكاديمية، نمائية، أو حتى الموهوبين الذين يحتاجون رعاية خاصة) عبر تكنولوجيا رصينة ومحمية بالكامل.'
    },
    { 
      id: 'what', 
      title: 'ماذا نفعل للأبطال؟', 
      icon: '⚡', 
      content: 'نقوم بتحويل رحلة التشخيص المملة إلى تجربة تفاعلية ملهمة. من خلال مختبراتنا العشرة، نقدم تشخيصاً مزدوجاً يجمع بين الأداء المعرفي والرد الحركي. كما نمنح كل طفل "الجواز التعليمي الرقمي الموحد" الذي يوثق تطوره ويرافقه في كل مراحل حياته الدراسية، بالإضافة إلى جلسات مع الأفاتار الذكي "بصير" الذي يفهم مشاعر الطفل ويتفاعل معها.'
    },
    { 
      id: 'why', 
      title: 'لماذا يختارنا الأهل؟', 
      icon: '💎', 
      content: 'يختارنا الأهل لأننا نوفر "الحقيقة قبل التجربة". خوارزمياتنا تعطي دقة تصل لـ 70% في التنبؤ بالصعوبات النمائية، مما يوفر سنوات من الحيرة والبحث. نستخدم تقنيات متطورة مثل تتبع حركة العين (Eye Tracking) وتحليل النبض الحيوي لفهم ما لا يستطيع الطفل قوله. والأهم، أن بيانات طفلك مشفرة بـ "سيادة تامة" لا يملك مفتاحها إلا أنت.'
    }
  ];

  return (
    <main className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-cyan-500/30 overflow-x-hidden relative pb-20" dir="rtl">
      
      {/* حل مشكلة الخلفية والوهج */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-16 md:pt-28">
        
        {/* الهيدر: تم إضافة py-4 و leading-relaxed لحل مشكلة أكل الحروف */}
        <header className="text-center mb-20 animate-in fade-in slide-in-from-top-5 duration-1000">
          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tight leading-[1.3]">
            منظومة <span className="inline-block py-4 px-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent italic drop-shadow-sm">بَصيرة</span>
          </h1>
          <p className="text-slate-400 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed font-light italic">
            السيادة الرقمية في تشخيص وعلاج صعوبات التعلم <br className="hidden md:block" /> 
            بأدوات القرن الحادي والعشرين.
          </p>
        </header>

        {/* أزرار الاختيار: ديزاين أنحف وأرقى */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(activeSection === s.id ? null : s.id)}
              className={`p-10 rounded-[3rem] border-2 transition-all duration-500 flex flex-col items-center gap-6 group relative overflow-hidden
                ${activeSection === s.id 
                  ? 'bg-cyan-600/10 border-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.15)]' 
                  : 'bg-slate-900/40 border-slate-800/50 hover:border-slate-700'}`}
            >
              <span className={`text-6xl transition-transform duration-700 ${activeSection === s.id ? 'scale-110 -rotate-12' : 'group-hover:scale-110'}`}>
                {s.icon}
              </span>
              <span className="text-2xl font-black italic">{s.title}</span>
              
              {/* مؤشر تفاعلي */}
              <div className={`w-12 h-1 bg-cyan-500 rounded-full transition-all duration-500 ${activeSection === s.id ? 'opacity-100 w-20' : 'opacity-0'}`}></div>
            </button>
          ))}
        </div>

        {/* منطقة عرض المحتوى المفصل */}
        <div className="relative mb-24 min-h-[300px]">
          {activeSection ? (
            <div className="w-full bg-slate-900/40 backdrop-blur-2xl border border-white/5 p-12 rounded-[4rem] animate-in slide-in-from-bottom-10 fade-in duration-500 shadow-2xl">
              <div className="flex items-center gap-6 mb-8">
                <span className="text-6xl p-4 bg-cyan-500/10 rounded-3xl border border-cyan-500/20">
                    {sections.find(s => s.id === activeSection)?.icon}
                </span>
                <h3 className="text-4xl font-black italic text-white uppercase tracking-tighter">
                    {sections.find(s => s.id === activeSection)?.title}
                </h3>
              </div>
              <p className="text-2xl md:text-3xl text-slate-300 leading-[1.6] font-light italic text-justify">
                {sections.find(s => s.id === activeSection)?.content}
              </p>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-700 italic border-4 border-dotted border-slate-900/50 rounded-[4rem] px-10 text-center text-xl">
              <p>اختر أحد المحاور السيادية أعلاه لقراءة التفاصيل الكاملة للمنظومة...</p>
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
               <span className="text-sm opacity-60 font-mono tracking-widest uppercase">Launch_v6</span>
            </span>
          </button>
        </div>

      </div>

      <footer className="mt-32 text-center opacity-30 font-mono text-xs tracking-[0.5em] uppercase">
        Sovereignty // Intelligence // Future // Basira_2026
      </footer>
    </main>
  );
}