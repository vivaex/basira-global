'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function SovereignPassport() {
  const [name, setName] = useState('البطل');
  const [heroClass, setHeroClass] = useState('بطل صاعد');
  const [topSkill, setTopSkill] = useState('الذكاء العام');

  useEffect(() => {
    const savedName = localStorage.getItem('studentName');
    if (savedName) setName(savedName);

    // تحليل سريع لتحديد "رتبة البطل" بناءً على الألعاب
    const savedGames = localStorage.getItem('gameResults');
    if (savedGames) {
      const results = JSON.parse(savedGames);
      const scores = Object.entries(results).sort((a: any, b: any) => b[1] - a[1]);
      const top = scores[0];

      if (top) {
        if (top[0] === 'visual') { setHeroClass('بطل بصري سيادي'); setTopSkill('الإدراك المكاني'); }
        else if (top[0] === 'math') { setHeroClass('إستراتيجي منطقي'); setTopSkill('التحليل الرقمي'); }
        else if (top[0] === 'memory') { setHeroClass('حارس الذاكرة'); setTopSkill('الاستدعاء الفائق'); }
        else { setHeroClass('مستكشف سيادي'); setTopSkill('تعدد المواهب'); }
      }
    }
  }, []);

  return (
    <main className="min-h-screen bg-[#020617] text-white p-6 md:p-20 flex flex-col items-center justify-center relative overflow-hidden" dir="rtl">
      
      {/* خلفية حركية نيون */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/20 rounded-full blur-[180px] animate-pulse"></div>
      </div>

      <header className="mb-12 text-center relative z-10">
        <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-4">
          الجواز <span className="text-cyan-400 text-glow">التعليمي السيادي</span>
        </h1>
        <p className="text-slate-500 italic">البطاقة الرسمية المعتمدة من منظومة بَصيرة العالمية</p>
      </header>

      {/* بطاقة الجواز الهولوغرافية */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, rotateY: 30 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative w-full max-w-[600px] aspect-[1.6/1] group cursor-pointer"
      >
        {/* جسم البطاقة */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-black rounded-[2.5rem] border-2 border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-3xl group-hover:border-cyan-500/50 transition-all duration-500">
          
          {/* خطوط تقنية ونقوش نيون */}
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          <div className="absolute top-[-50%] left-[-50%] w-full h-full bg-cyan-500/5 rotate-45 blur-[100px]"></div>

          <div className="relative z-10 p-8 md:p-12 flex h-full items-center justify-between">
            
            {/* الجانب الأيمن: الصورة والاسم */}
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 bg-slate-800 rounded-3xl border-4 border-cyan-500/30 flex items-center justify-center text-6xl shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                  🤖
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-black font-black text-xs border-4 border-slate-900 shadow-xl">
                  V1
                </div>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-cyan-500 font-mono tracking-[0.5em] uppercase mb-1">Citizen_Hero</p>
                <h3 className="text-2xl md:text-3xl font-black italic text-white leading-tight">{name}</h3>
              </div>
            </div>

            {/* الجانب الأيسر: البيانات والـ QR */}
            <div className="flex flex-col items-end text-left h-full justify-between py-2">
              <div className="text-left w-full">
                <div className="mb-4">
                  <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">Hero_Class</p>
                  <p className="text-xl font-black text-cyan-400 italic leading-none">{heroClass}</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">Primary_Skill</p>
                  <p className="text-lg font-bold text-white italic leading-none">{topSkill}</p>
                </div>
              </div>

              {/* QR Code رمزي */}
              <div className="bg-white p-3 rounded-2xl shadow-xl hover:scale-110 transition-transform">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Basira_Report_Verified')] bg-cover bg-center grayscale contrast-200"></div>
              </div>
            </div>
          </div>

          {/* ختم السيادة السفلي */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-30">
            <span className="text-[8px] font-mono tracking-[0.8em] uppercase text-slate-400">Basira_Sovereign_Protocol // 2026</span>
          </div>
        </div>

        {/* لمعان هولوغرافي يتحرك */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none rounded-[2.5rem] group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
      </motion.div>

      {/* أزرار العمل */}
      <div className="mt-16 flex flex-wrap gap-6 justify-center relative z-20">
        <button onClick={() => window.print()} className="px-12 py-5 bg-white text-black font-black text-xl rounded-2xl hover:bg-cyan-500 hover:text-white transition-all shadow-2xl active:scale-95">
          طباعة الجواز 📄
        </button>
        <Link href="/diagnose/results" className="px-12 py-5 bg-slate-900 text-white font-black text-xl rounded-2xl border border-white/10 hover:bg-slate-800 transition-all text-center">
          العودة للتقرير ◀
        </Link>
      </div>

      <div className="mt-10 text-slate-700 font-mono text-[10px] uppercase tracking-widest italic animate-pulse">
        Encrypted_Digital_Hero_ID // SECURED_BY_BASIRA
      </div>

    </main>
  );
}