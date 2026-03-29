'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DetailedResults() {
  const [sc, setSc] = useState({ mem: 0, att: 0, aud: 0 });

  useEffect(() => {
    setSc({
      mem: Number(localStorage.getItem('memoryScore') || 0),
      att: Number(localStorage.getItem('attentionScore') || 0),
      aud: Number(localStorage.getItem('auditoryScore') || 0),
    });
  }, []);

  // دالة توليد الخطة العلاجية والتشخيص
  const generatePlan = () => {
    const report = {
      analysis: [] as string[],
      plan: [] as string[],
      strengths: [] as string[]
    };

    // 1. تحليل الذاكرة البصرية
    if (sc.mem < 30) {
      report.analysis.push("يواجه الطفل تحدياً في الاحتفاظ بالصور الذهنية للرموز، مما قد يؤثر على سرعة القراءة وسهولة الإملاء.");
      report.plan.push("ممارسة ألعاب 'أين الشكل المختفي؟' يومياً لمدة 10 دقائق.");
      report.plan.push("استخدام استراتيجية 'الرسم للكلمات'؛ أي رسم صورة بسيطة بجانب كل كلمة صعبة.");
    } else {
      report.strengths.push("امتلاك ذاكرة بصرية قوية تساعده على حفظ الوجوه والأشكال الهندسية ببراعة.");
    }

    // 2. تحليل الانتباه والسرعة
    if (sc.att < 50) {
      report.analysis.push("هناك تشتت عند وجود مثيرات بصرية متعددة، مع ميل للاندفاع في الإجابة قبل التأكد.");
      report.plan.push("تقليل وقت الشاشات (ألعاب الفيديو السريعة) واستبدالها بأنشطة فك وتركيب (مثل الليغو أو الروبوتات).");
      report.plan.push("ممارسة الرياضات التي تتطلب تركيزاً لحظياً مثل التايكوندو أو كرة القدم.");
    } else {
      report.strengths.push("سرعة رد فعل ممتازة وقدرة عالية على تجاهل المشتتات المحيطة.");
    }

    // 3. تحليل الإدراك السمعي
    if (sc.aud < 40) {
      report.analysis.push("صعوبة في معالجة الأصوات اللغوية المتشابهة، مما قد يسبب خلطاً بين الحروف عند الكتابة.");
      report.plan.push("الاستماع لقصص صوتية ثم طلب إعادة سرد أحداثها بالترتيب.");
      report.plan.push("تمارين التمييز الصوتي (مثلاً: ما الفرق بين صوت السين والصاد؟).");
    } else {
      report.strengths.push("إدراك سمعي حاد وقدرة متميزة على اتباع التعليمات اللفظية المعقدة.");
    }

    return report;
  };

  const fullReport = generatePlan();

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-16 font-sans" dir="rtl">
      <div className="max-w-4xl mx-auto">
        
        {/* هيدر التقرير */}
        <div className="bg-slate-900 p-10 rounded-[3rem] border-b-8 border-blue-600 shadow-2xl mb-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-8xl">📑</div>
          <h1 className="text-5xl font-black mb-4">تقرير بصيرة الشامل</h1>
          <p className="text-blue-400 text-xl font-bold italic underline">تاريخ التشخيص: {new Date().toLocaleDateString('ar-EG')}</p>
        </div>

        {/* سكورات ملونة */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-slate-900/80 p-6 rounded-3xl border border-blue-500/20 text-center">
                <span className="text-slate-500 block mb-2">الذاكرة البصرية</span>
                <span className="text-5xl font-black text-blue-400">{sc.mem}</span>
            </div>
            <div className="bg-slate-900/80 p-6 rounded-3xl border border-purple-500/20 text-center">
                <span className="text-slate-500 block mb-2">سرعة الانتباه</span>
                <span className="text-5xl font-black text-purple-400">{sc.att}</span>
            </div>
            <div className="bg-slate-900/80 p-6 rounded-3xl border border-green-500/20 text-center">
                <span className="text-slate-500 block mb-2">الإدراك السمعي</span>
                <span className="text-5xl font-black text-green-400">{sc.aud}</span>
            </div>
        </div>

        <div className="space-y-8">
            {/* قسم التحليل */}
            <section className="bg-slate-900 p-10 rounded-[2.5rem] border-r-8 border-purple-500 shadow-xl">
                <h2 className="text-3xl font-black mb-6 flex items-center gap-3 text-purple-400">🔍 التحليل والتشخيص:</h2>
                <ul className="space-y-4 text-xl text-slate-300 leading-relaxed list-disc list-inside">
                    {fullReport.analysis.map((item, i) => <li key={i}>{item}</li>)}
                    {fullReport.analysis.length === 0 && <li>جميع مؤشرات المعالجة المعرفية تقع ضمن النطاق الطبيعي والممتاز.</li>}
                </ul>
            </section>

            {/* قسم نقاط القوة */}
            <section className="bg-slate-900 p-10 rounded-[2.5rem] border-r-8 border-green-500 shadow-xl">
                <h2 className="text-3xl font-black mb-6 flex items-center gap-3 text-green-400">🌟 نقاط القوة لدى الطفل:</h2>
                <ul className="space-y-4 text-xl text-slate-300 leading-relaxed list-disc list-inside">
                    {fullReport.strengths.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
            </section>

            {/* الخطة العلاجية */}
            <section className="bg-blue-900/20 p-10 rounded-[2.5rem] border-2 border-blue-500/30 shadow-2xl relative">
                <div className="absolute -top-5 left-10 bg-blue-600 text-white px-6 py-2 rounded-full font-black">الخطة المستقبلية</div>
                <h2 className="text-3xl font-black mb-8 text-blue-300">🛠️ خطوات التحسين المقترحة:</h2>
                <div className="space-y-6">
                    {fullReport.plan.map((item, i) => (
                        <div key={i} className="flex gap-4 items-start bg-slate-900/60 p-5 rounded-2xl">
                            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">{i+1}</span>
                            <p className="text-xl text-slate-200">{item}</p>
                        </div>
                    ))}
                    {fullReport.plan.length === 0 && <p className="text-xl text-green-400 font-bold">يُنصح بالاستمرار في تطوير المهارات المتقدمة، مثل تعلم لغة ثانية أو البدء بمبادئ البرمجة والعمليات المنطقية.</p>}
                </div>
            </section>
        </div>

        {/* أزرار الأكشن */}
        <div className="mt-16 flex flex-wrap gap-4 justify-center no-print">
            <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-500 px-12 py-5 rounded-2xl font-black text-xl shadow-lg transition-all">طباعة التقرير (PDF) 📄</button>
            <Link href="/" className="bg-slate-800 hover:bg-slate-700 px-12 py-5 rounded-2xl font-black text-xl transition-all">العودة للرئيسية</Link>
        </div>

        <p className="text-center text-slate-600 mt-10 text-sm italic">بصيرة v1.0 - تم التوليد بواسطة محرك التشخيص الذكي</p>
      </div>
    </main>
  );
}