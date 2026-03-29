'use client';
import { useState } from 'react';

export default function DiagnosePage() {
  const [step, setStep] = useState('choice'); // 'choice', 'external', 'internal'

  return (
    <main className="min-h-screen bg-slate-900 text-white p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12 text-blue-400">بوابة التشخيص المزدوج</h1>

        {step === 'choice' && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* خيار التشخيص الخارجي */}
            <div onClick={() => setStep('external')} className="bg-slate-800 p-8 rounded-3xl border-2 border-blue-500/20 hover:border-blue-500 cursor-pointer transition-all shadow-xl">
              <div className="text-5xl mb-4">📂</div>
              <h2 className="text-2xl font-bold mb-4">تشخيص خارجي جاهز</h2>
              <p className="text-slate-400">إذا كان لديك تقرير طبي أو تربوي سابق، قم برفعه ليقوم النظام بتحليله فوراً.</p>
            </div>

            {/* خيار التشخيص الداخلي */}
            <div onClick={() => setStep('internal')} className="bg-slate-800 p-8 rounded-3xl border-2 border-purple-500/20 hover:border-purple-500 cursor-pointer transition-all shadow-xl">
              <div className="text-5xl mb-4">🧪</div>
              <h2 className="text-2xl font-bold mb-4">بدء التقييم الداخلي</h2>
              <p className="text-slate-400">لا تملك تشخيصاً؟ ابدأ اختباراتنا الذكية لتقييم (الذاكرة، الانتباه، والقراءة).</p>
            </div>
          </div>
        )}

        {step === 'external' && (
          <div className="bg-slate-800 p-10 rounded-3xl text-center shadow-2xl border border-blue-500">
            <h2 className="text-2xl font-bold mb-6">رفع التقرير الطبي</h2>
            <div className="border-2 border-dashed border-slate-600 p-12 rounded-2xl mb-6 hover:border-blue-400 transition cursor-pointer">
              <p className="text-slate-400 font-medium">اسحب الملف هنا أو اضغط للاختيار (PDF, JPG)</p>
            </div>
            <button onClick={() => setStep('choice')} className="text-blue-400 hover:underline">العودة للخيارات</button>
          </div>
        )}

        {step === 'internal' && (
          <div className="bg-slate-800 p-10 rounded-3xl text-center shadow-2xl border border-purple-500">
            <h2 className="text-2xl font-bold mb-6 text-purple-300">بدء اختبارات "بصيرة" الذكية</h2>
            <div className="grid grid-cols-1 gap-4 mb-8">
              <div className="bg-slate-700/50 p-4 rounded-xl text-right">✅ اختبار الذاكرة البصرية</div>
              <div className="bg-slate-700/50 p-4 rounded-xl text-right">✅ اختبار الانتباه والتركيز</div>
              <div className="bg-slate-700/50 p-4 rounded-xl text-right">✅ اختبار الإدراك السمعي</div>
            </div>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-4 rounded-full font-bold text-xl transition shadow-lg">
              ابدأ الاختبار الآن (بواسطة AI)
            </button>
            <br />
            <button onClick={() => setStep('choice')} className="mt-6 text-slate-400 hover:underline">العودة للخيارات</button>
          </div>
        )}
      </div>
    </main>
  );
}