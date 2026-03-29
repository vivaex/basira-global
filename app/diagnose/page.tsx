'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function DiagnosePage() {
  const [step, setStep] = useState<'choice' | 'external' | 'internal'>('choice');

  return (
    <main className="min-h-screen bg-slate-900 text-white p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black text-center mb-12 text-blue-400 tracking-tighter">بوابة التشخيص الذكي</h1>

        {step === 'choice' && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* خيار التشخيص الخارجي */}
            <div onClick={() => setStep('external')} className="bg-slate-800 p-8 rounded-3xl border-2 border-blue-500/20 hover:border-blue-500 cursor-pointer transition-all shadow-xl group">
              <div className="text-6xl mb-4 group-hover:scale-110 transition">📂</div>
              <h2 className="text-2xl font-bold mb-4 text-blue-300">تشخيص خارجي جاهز</h2>
              <p className="text-slate-400">ارفع تقريرك الطبي أو التربوي الحالي ليقوم النظام بتحليله.</p>
            </div>

            {/* خيار التشخيص الداخلي */}
            <div onClick={() => setStep('internal')} className="bg-slate-800 p-8 rounded-3xl border-2 border-purple-500/20 hover:border-purple-500 cursor-pointer transition-all shadow-xl group">
              <div className="text-6xl mb-4 group-hover:scale-110 transition">🧪</div>
              <h2 className="text-2xl font-bold mb-4 text-purple-300">تقييم "بصيرة" الداخلي</h2>
              <p className="text-slate-400">ابدأ اختبارات الذكاء الاصطناعي لتقييم المهارات النمائية والأكاديمية.</p>
            </div>
          </div>
        )}

        {step === 'external' && (
          <div className="bg-slate-800 p-10 rounded-3xl text-center shadow-2xl border border-blue-500">
            <h2 className="text-2xl font-bold mb-6">رفع التقرير الطبي</h2>
            <div className="border-2 border-dashed border-slate-600 p-12 rounded-2xl mb-6">
              <p className="text-slate-400">قريباً: رفع ملفات PDF و الصور</p>
            </div>
            <button onClick={() => setStep('choice')} className="text-blue-400 hover:underline">العودة للخيارات</button>
          </div>
        )}

        {step === 'internal' && (
          <div className="bg-slate-800 p-10 rounded-3xl text-center shadow-2xl border border-purple-500">
            <h2 className="text-2xl font-bold mb-6 text-purple-300">مختبر التقييم الرقمي</h2>
            <div className="space-y-4 mb-8">
              <div className="bg-slate-700/50 p-4 rounded-xl text-right flex justify-between">
                <span>اختبار الذاكرة البصرية</span>
                <span className="text-green-400">متاح الآن ✅</span>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-xl text-right opacity-50 flex justify-between">
                <span>اختبار الانتباه والتركيز</span>
                <span>قريباً..</span>
              </div>
            </div>
            
            {/* الربط السحري مع اللعبة */}
            <Link href="/diagnose/memory-test">
              <button className="w-full bg-purple-600 hover:bg-purple-500 text-white px-10 py-5 rounded-2xl font-black text-xl transition shadow-lg animate-bounce">
                ابدأ اختبار الذاكرة الآن 🚀
              </button>
            </Link>
            
            <br />
            <button onClick={() => setStep('choice')} className="mt-6 text-slate-400 hover:underline">العودة للخيارات</button>
          </div>
        )}
      </div>
    </main>
  );
}