'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function DiagnosePage() {
  const [step, setStep] = useState<'choice' | 'external' | 'internal'>('choice');

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6 md:p-12 font-sans" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">قائمة التقييمات التفاعلية</h1>
        </div>

        {step === 'choice' && (
          <div className="grid md:grid-cols-2 gap-8 animate-in fade-in zoom-in duration-500">
            <div onClick={() => setStep('external')} className="bg-slate-800/50 p-10 rounded-[2.5rem] border-2 border-blue-500/10 hover:border-blue-500 cursor-pointer shadow-2xl group transition-all">
              <div className="text-7xl mb-6">📂</div>
              <h2 className="text-3xl font-bold mb-4 text-blue-300">تشخيص خارجي</h2>
              <p className="text-slate-400">ارفع تقريرك الطبي الحالي ليحلله النظام.</p>
            </div>
            <div onClick={() => setStep('internal')} className="bg-slate-800/50 p-10 rounded-[2.5rem] border-2 border-purple-500/10 hover:border-purple-500 cursor-pointer shadow-2xl group transition-all">
              <div className="text-7xl mb-6">🧪</div>
              <h2 className="text-3xl font-bold mb-4 text-purple-300">مختبر "بصيرة"</h2>
              <p className="text-slate-400">ابدأ الاختبارات التفاعلية لتقييم المهارات.</p>
            </div>
          </div>
        )}

        {step === 'internal' && (
          <div className="grid gap-6 max-w-3xl mx-auto animate-in slide-in-from-bottom-10">
            {/* اختبار الذاكرة */}
            <div className="bg-slate-800/80 p-8 rounded-3xl flex justify-between items-center border border-slate-700">
              <div className="text-right">
                <h3 className="text-2xl font-bold">اختبار الذاكرة البصرية</h3>
                <p className="text-slate-500">تقييم قوة حفظ الأشكال والترتيب</p>
              </div>
              <Link href="/diagnose/memory-test">
                <button className="bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-2xl font-bold transition shadow-lg">ابدأ الآن ✅</button>
              </Link>
            </div>

            {/* اختبار الانتباه */}
            <div className="bg-slate-800/80 p-8 rounded-3xl flex justify-between items-center border border-slate-700">
              <div className="text-right">
                <h3 className="text-2xl font-bold">اختبار الانتباه والسرعة</h3>
                <p className="text-slate-500">تقييم سرعة الاستجابة والتركيز</p>
              </div>
              <Link href="/diagnose/attention-test">
                <button className="bg-purple-600 hover:bg-purple-500 px-8 py-3 rounded-2xl font-bold transition shadow-lg">ابدأ الآن 🤖</button>
              </Link>
            </div>

            {/* اختبار الإدراك السمعي - تم تفعيله الآن! */}
            <div className="bg-slate-800/80 p-8 rounded-3xl flex justify-between items-center border border-green-500/30">
              <div className="text-right">
                <h3 className="text-2xl font-bold text-green-400">اختبار الإدراك السمعي</h3>
                <p className="text-slate-500">تقييم التمييز بين الكلمات المسموعة</p>
              </div>
              <Link href="/diagnose/auditory-test">
                <button className="bg-green-600 hover:bg-green-500 px-8 py-3 rounded-2xl font-bold transition shadow-lg">ابدأ الآن 🔊</button>
              </Link>
            </div>
            
            <button onClick={() => setStep('choice')} className="text-center text-slate-500 underline mt-6">العودة للخيارات</button>
          </div>
        )}
      </div>
    </main>
  );
}