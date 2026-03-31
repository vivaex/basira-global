'use client';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  // تنسيقات الستايل "السيادي"
  const goldText = "bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-700 bg-clip-text text-transparent font-black";
  const glassPanel = "bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 shadow-2xl p-12 rounded-[3rem] transition-all hover:border-blue-500/30";

  const handleStartLab = () => {
    router.push('/diagnose');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-blue-500/30" dir="rtl">
      
      {/* 1. قسم الترحيب الرئيسي (Hero Section) */}
      <section className="relative h-[90vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        {/* خلفية سينمائية */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        
        <h1 className="text-6xl md:text-[7.5rem] font-black leading-[1.1] mb-8 relative animate-in fade-in slide-in-from-top-10 duration-1000">
          بَصيرة: السيادة في <br/> 
          <span className={goldText}>علاج صعوبات التعلم</span>
        </h1>
        
        <p className="text-xl md:text-3xl text-slate-400 max-w-4xl leading-relaxed italic mb-14 font-light">
          المنظومة الرقمية الأولى التي تجمع بين الحقيقة السريرية والذكاء الاصطناعي الوجداني لتأمين مستقبل أبطالنا.
        </p>

        <button 
          onClick={handleStartLab}
          className="group relative px-20 py-8 bg-blue-600 text-3xl font-black rounded-2xl hover:bg-blue-500 shadow-[0_0_50px_rgba(37,99,235,0.4)] border-b-[10px] border-blue-900 transition-all active:scale-95 active:border-b-0 overflow-hidden"
        >
          <span className="relative z-10">دخول المنظومة 🛡️</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
        </button>
      </section>

      {/* 2. قسم "من نحن ولماذا نحن" (Identity & Why Us) */}
      <section className="py-24 px-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* من نحن */}
        <div className={glassPanel}>
          <h2 className="text-4xl font-black mb-6 text-blue-500 italic underline decoration-2 underline-offset-8">من هي بَصيرة؟</h2>
          <p className="text-xl text-slate-300 leading-relaxed font-bold">
            نحن "المركز الرقمي السيادي الشامل". منظومة تقنية متطورة صُممت لسد الفجوة بين التشخيص الميداني والتدخل الرقمي، نهدف لتمكين الأطفال (أكاديمياً، نمائياً، وموهبياً) عبر تكنولوجيا رصينة.
          </p>
        </div>

        {/* ماذا نفعل */}
        <div className={glassPanel}>
          <h2 className="text-4xl font-black mb-6 text-blue-500 italic underline decoration-2 underline-offset-8">ماذا نفعل للأبطال؟</h2>
          <ul className="space-y-4 text-xl font-bold text-slate-300">
            <li className="flex items-center gap-4 hover:translate-x-[-5px] transition-transform">
              <span className="text-blue-500 text-2xl">✓</span> تشخيص مزدوج (داخلي/خارجي) فوري.
            </li>
            <li className="flex items-center gap-4 hover:translate-x-[-5px] transition-transform">
              <span className="text-blue-500 text-2xl">✓</span> جلسات علاجية تفاعلية مع الأفاتار "بصير".
            </li>
            <li className="flex items-center gap-4 hover:translate-x-[-5px] transition-transform">
              <span className="text-blue-500 text-2xl">✓</span> إصدار الجواز التعليمي الرقمي الموحد.
            </li>
          </ul>
        </div>

      </section>

      {/* 3. قسم القيم الجوهرية (Core Values) */}
      <section className="py-32 px-10 bg-[#03081a]/50 relative">
        <h2 className="text-5xl font-black text-center mb-20 italic">لماذا يختار الأهل بَصيرة؟</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {[
            { t: "دقة 70% رقمياً", d: "خوارزميات تعطي صورة واضحة وموثوقة عن حالة الطفل قبل التوجه للمراكز." },
            { t: "المستشعرات الحيوية", d: "تتبع العين والنبض الحيوي لتحليل استجابة الطفل اللحظية." },
            { t: "الأمان السيادي", d: "بيانات مشفرة بالكامل تضمن خصوصية السجل التعليمي للطفل." }
          ].map((item, i) => (
            <div key={i} className="p-12 border border-white/5 bg-slate-900/40 rounded-[2.5rem] hover:border-blue-500/50 hover:bg-slate-900/60 transition-all group">
              <h3 className="text-2xl font-black text-blue-400 mb-4 italic group-hover:scale-105 transition-transform">{item.t}</h3>
              <p className="text-lg text-slate-400 font-bold leading-relaxed">{item.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer الصغير الختامي */}
      <footer className="py-16 border-t border-white/5 text-center">
        <div className="mb-4 text-slate-500 font-mono tracking-widest text-sm">SYSTEM_LOG // BASIRA_GLOBAL_V4.0</div>
        <p className="text-slate-600 italic font-bold">
          منظومة بَصيرة العالمية © 2026 - السيادة في التعليم الخاص.
        </p>
      </footer>
    </div>
  );
}