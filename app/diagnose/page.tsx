'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function DiagnosePage() {
  const [step, setStep] = useState<'choice' | 'external' | 'internal'>('choice');

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6 md:p-12 font-sans" dir="rtl">
      <div className="max-w-5xl mx-auto">
        
        {/* هيدر البوابة */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            بوابة التشخيص المزدوج
          </h1>
          <p className="text-slate-400 text-xl font-light">اختر المسار المناسب لبدء تقييم مهارات الطفل</p>
        </div>

        {step === 'choice' && (
          <div className="grid md:grid-cols-2 gap-8 animate-in fade-in zoom-in duration-500">
            {/* بطاقة التشخيص الخارجي */}
            <div onClick={() => setStep('external')} className="bg-slate-800/50 p-10 rounded-[2.5rem] border-2 border-blue-500/10 hover:border-blue-500 hover:bg-slate-800 transition-all cursor-pointer shadow-2xl group">
              <div className="text-7xl mb-6 group-hover:scale-110 transition">📂</div>
              <h2 className="text-3xl font-bold mb-4 text-blue-300">تشخيص خارجي</h2>
              <p className="text-slate-400 text-lg leading-relaxed">لديك تقرير طبي سابق؟ ارفعه هنا ليقوم الذكاء الاصطناعي بتحليله فوراً.</p>
            </div>

            {/* بطاقة التقييم الداخلي */}
            <div onClick={() => setStep('internal')} className="bg-slate-800/50 p-10 rounded-[2.5rem] border-2 border-purple-500/10 hover:border-purple-500 hover:bg-slate-800 transition-all cursor-pointer shadow-2xl group">
              <div className="text-7xl mb-6 group-hover:scale-110 transition">🧪</div>
              <h2 className="text-3xl font-bold mb-4 text-purple-300">مختبر "بصيرة"</h2>
              <p className="text-slate-400 text-lg leading-relaxed">ابدأ سلسلة اختباراتنا التفاعلية لتقييم الذاكرة، الانتباه، والسرعة.</p>
            </div>
          </div>
        )}

        {step === 'external' && (
          <div className="bg-slate-800 p-12 rounded-[3rem] text-center shadow-2xl border border-blue-500/30 animate-in slide-in-from-bottom-10">
            <h2 className="text-3xl font-bold mb-8 text-blue-300">مركز رفع الملفات</h2>
            <div className="border-4 border-dashed border-slate-700 p-16 rounded-[2rem] mb-8 hover:border-blue-500 transition duration-300">
              <p className="text-slate-500 text-xl font-bold">قريباً.. رفع ملفات الـ PDF والتحليل الذكي 🧠</p>
            </div>
            <button onClick={() => setStep('choice')} className="bg-slate-700 px-10 py-3 rounded-xl font-bold hover:bg-slate-600 transition">العودة للخيارات</button>
          </div>
        )}

        {step === 'internal' && (
          <div className="bg-slate-800 p-8 md:p-12 rounded-[3rem] shadow-2xl border border-purple-500/30 animate-in slide-in-from-bottom-10">
            <h2 className="text-3xl font-bold mb-10 text-purple-300 text-center">قائمة التقييمات التفاعلية</h2>
            <div className="grid gap-6 max-w-2xl mx-auto">
              
              {/* اختبار الذاكرة البصرية */}
              <div className="bg-slate-900/60 p-6 rounded-2xl flex justify-between items-center border border-slate-700 hover:border-blue-500 transition-all">
                <div>
                  <h3 className="text-xl font-bold">اختبار الذاكرة البصرية</h3>
                  <p className="text-slate-500 text-sm">تقييم قوة حفظ الأشكال والترتيب</p>
                </div>
                <Link href="/diagnose/memory-test">
                  <button className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-xl font-bold transition shadow-lg">ابدأ الآن ✅</button>
                </Link>
              </div>

              {/* اختبار الانتباه والسرعة */}
              <div className="bg-slate-900/60 p-6 rounded-2xl flex justify-between items-center border border-slate-700 hover:border-purple-500 transition-all">
                <div>
                  <h3 className="text-xl font-bold">اختبار الانتباه والسرعة</h3>
                  <p className="text-slate-500 text-sm">تقييم سرعة الاستجابة والتركيز</p>
                </div>
                <Link href="/diagnose/attention-test">
                  <button className="bg-purple-600 hover:bg-purple-500 px-6 py-2 rounded-xl font-bold transition shadow-lg">ابدأ الآن 🤖</button>
                </Link>
              </div>

              <div className="bg-slate-900/30 p-6 rounded-2xl flex justify-between items-center border border-slate-800 opacity-50 grayscale">
                <div>
                  <h3 className="text-xl font-bold">اختبار الإدراك السمعي</h3>
                  <p className="text-slate-500 text-sm">قريباً في الإصدار القادم..</p>
                </div>
              </div>
            </div>
            <div className="text-center mt-12">
               <button onClick={() => setStep('choice')} className="text-slate-500 hover:text-white underline">العودة للخيارات</button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}