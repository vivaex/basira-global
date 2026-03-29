'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DiagnosePage() {
  const [step, setStep] = useState<'choice' | 'external' | 'internal'>('choice');
  const [done, setDone] = useState({ mem: false, att: false, aud: false });

  useEffect(() => {
    setDone({
      mem: localStorage.getItem('memoryDone') === 'true',
      att: localStorage.getItem('attentionDone') === 'true',
      aud: localStorage.getItem('auditoryDone') === 'true'
    });
  }, [step]);

  const allFinished = done.mem && done.att && done.aud;

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6 md:p-12 font-sans" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-black text-center mb-12 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent italic">بوابة بصيرة للتقييم</h1>

        {step === 'choice' && (
          <div className="grid md:grid-cols-2 gap-8 animate-in zoom-in">
            <div onClick={() => setStep('external')} className="bg-slate-800/50 p-10 rounded-[2.5rem] border-2 border-blue-500/10 hover:border-blue-500 cursor-pointer shadow-xl transition-all group">
              <div className="text-7xl mb-4 group-hover:scale-110 transition">📂</div>
              <h2 className="text-2xl font-bold mb-2">تشخيص خارجي</h2>
              <p className="text-slate-400">تحليل التقارير الطبية السابقة.</p>
            </div>
            <div onClick={() => setStep('internal')} className="bg-slate-800/50 p-10 rounded-[2.5rem] border-2 border-purple-500/10 hover:border-purple-500 cursor-pointer shadow-xl transition-all group">
              <div className="text-7xl mb-4 group-hover:scale-110 transition">🧪</div>
              <h2 className="text-2xl font-bold mb-2">مختبر التقييم</h2>
              <p className="text-slate-400">الاختبارات التفاعلية الذكية.</p>
            </div>
          </div>
        )}

        {step === 'internal' && (
          <div className="space-y-6 max-w-2xl mx-auto animate-in slide-in-from-bottom-10">
            {/* بطاقة الذاكرة */}
            <div className={`p-6 rounded-3xl flex justify-between items-center border-2 ${done.mem ? 'border-green-500 bg-green-500/5' : 'border-slate-700 bg-slate-800'}`}>
              <div className="text-right">
                <h3 className="text-xl font-bold">1. الذاكرة البصرية</h3>
                {done.mem && <span className="text-green-400 font-bold text-sm">✅ تم الإنجاز</span>}
              </div>
              <Link href="/diagnose/memory-test">
                <button className={`px-6 py-2 rounded-xl font-bold ${done.mem ? 'bg-slate-700' : 'bg-blue-600 hover:bg-blue-500'}`}>
                  {done.mem ? 'إعادة الاختبار' : 'ابدأ الآن'}
                </button>
              </Link>
            </div>

            {/* بطاقة الانتباه */}
            <div className={`p-6 rounded-3xl flex justify-between items-center border-2 ${done.att ? 'border-green-500 bg-green-500/5' : 'border-slate-700 bg-slate-800'}`}>
              <div className="text-right">
                <h3 className="text-xl font-bold">2. الانتباه والسرعة</h3>
                {done.att && <span className="text-green-400 font-bold text-sm">✅ تم الإنجاز</span>}
              </div>
              <Link href="/diagnose/attention-test">
                <button className={`px-6 py-2 rounded-xl font-bold ${done.att ? 'bg-slate-700' : 'bg-purple-600 hover:bg-purple-500'}`}>
                  {done.att ? 'إعادة الاختبار' : 'ابدأ الآن'}
                </button>
              </Link>
            </div>

            {/* بطاقة السمع */}
            <div className={`p-6 rounded-3xl flex justify-between items-center border-2 ${done.aud ? 'border-green-500 bg-green-500/5' : 'border-slate-700 bg-slate-800'}`}>
              <div className="text-right">
                <h3 className="text-xl font-bold">3. الإدراك السمعي</h3>
                {done.aud && <span className="text-green-400 font-bold text-sm">✅ تم الإنجاز</span>}
              </div>
              <Link href="/diagnose/auditory-test">
                <button className={`px-6 py-2 rounded-xl font-bold ${done.aud ? 'bg-slate-700' : 'bg-green-600 hover:bg-green-500'}`}>
                  {done.aud ? 'إعادة الاختبار' : 'ابدأ الآن'}
                </button>
              </Link>
            </div>

            {/* زر التقرير النهائي - يظهر فقط إذا خلصوا الثلاثة */}
            {allFinished ? (
              <Link href="/diagnose/results" className="block mt-12 animate-bounce">
                <button className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 px-8 py-6 rounded-3xl font-black text-2xl shadow-2xl">
                  عرض التقرير والتشخيص النهائي 📑🔥
                </button>
              </Link>
            ) : (
              <p className="text-center text-slate-500 mt-10 italic">أكمل جميع الاختبارات لتفعيل التقرير التشخيصي</p>
            )}

            <button onClick={() => setStep('choice')} className="w-full text-slate-600 underline mt-4">رجوع</button>
          </div>
        )}
      </div>
    </main>
  );
}