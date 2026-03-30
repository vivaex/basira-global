'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function FinalReport() {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const scores = {
        math: Number(localStorage.getItem('mathScore') || 0),
        attention: (Number(localStorage.getItem('selectiveScore') || 0) + Number(localStorage.getItem('sustainedScore') || 0)) / 2,
        memory: (Number(localStorage.getItem('spatialMemoryScore') || 0) + Number(localStorage.getItem('memorySequenceScore') || 0)) / 2,
        motor: (Number(localStorage.getItem('motorTappingScore') || 0) + (1000 / Number(localStorage.getItem('motorReactionScore') || 1000)) * 10) / 2,
        language: Number(localStorage.getItem('languagePhonologyScore') || 0),
        reading: Number(localStorage.getItem('readingCompScore') || 0),
        executive: (Number(localStorage.getItem('execFlexScore') || 0) + Number(localStorage.getItem('execInhibitionScore') || 0)) / 2,
      };
      setData(scores);
      setLoading(false);
    }
  }, []);

  // دالة تحليل الحالة بناءً على المعايير العالمية
  const getAnalysis = (score: number, type: string) => {
    if (score >= 80) return { status: 'ممتاز', color: 'text-green-400', advice: 'القدرات ضمن النطاق الطبيعي المرتفع. يُنصح ببرامج إثرائية لتطوير الموهبة.' };
    if (score >= 50) return { status: 'متوسط', color: 'text-yellow-400', advice: 'يوجد تذبذب في الأداء. يحتاج الطفل إلى تمارين تدعيمية لزيادة الثبات.' };
    return { status: 'بحاجة لتدخل', color: 'text-red-400', advice: `مؤشر دال على صعوبات في ${type}. يُنصح بمراجعة أخصائي لتطبيق خطة علاجية مكثفة.` };
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">جاري تحليل البيانات...</div>;

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-12 font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto">
        
        {/* هيدر التقرير الفخم */}
        <header className="bg-slate-900 p-10 rounded-[3rem] border-b-8 border-blue-600 shadow-2xl mb-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl">📄</div>
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">التقرير التشخيصي الشامل - بصيرة</h1>
          <p className="text-slate-400 text-xl italic font-light">نسخة معتمدة للتحليل الأولي للقدرات النمائية والتحصيلية</p>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* العمود الأول: بطاقات النتائج */}
          <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
            {Object.entries(data).map(([key, val]: any) => {
              const analysis = getAnalysis(val, key);
              return (
                <div key={key} className="bg-slate-900/50 p-8 rounded-[2.5rem] border-2 border-slate-800 hover:border-blue-500/50 transition-all shadow-xl">
                  <div className="flex justify-between items-start mb-6">
                     <h2 className="text-2xl font-black capitalize text-slate-300">
                        {key === 'math' ? '🔢 الرياضيات' : key === 'attention' ? '🎯 الانتباه' : key === 'memory' ? '🧠 الذاكرة' : key === 'motor' ? '✍️ الحركة' : key === 'language' ? '🗣️ اللغة' : key === 'reading' ? '📖 القراءة' : '⚙️ الوظائف التنفيذية'}
                     </h2>
                     <span className={`px-4 py-1 rounded-full text-sm font-bold ${analysis.color} bg-slate-950`}>{analysis.status}</span>
                  </div>
                  <div className="text-6xl font-black mb-4">{Math.round(val)}%</div>
                  <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ${val < 50 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${val}%` }}></div>
                  </div>
                  <p className="mt-6 text-sm text-slate-400 leading-relaxed">{analysis.advice}</p>
                </div>
              );
            })}
          </div>

          {/* العمود الثاني: الخطة العلاجية الذكية */}
          <div className="bg-slate-900 p-8 rounded-[3rem] border-4 border-emerald-500/20 shadow-2xl h-fit sticky top-8">
            <h3 className="text-3xl font-black mb-8 flex items-center gap-3">
               <span className="text-4xl">📋</span> الخطة العلاجية المقترحة
            </h3>
            
            <div className="space-y-8 text-right">
                {data.language < 50 && (
                  <section className="animate-in slide-in-from-right">
                    <h4 className="text-emerald-400 font-black mb-2">● مسار صعوبات القراءة (Dyslexia):</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">تطبيق منهج "أورتن-جيلينجهام" المعتمد عالمياً، والتركيز على الوعي الفونولوجي باستخدام الحواس المتعددة.</p>
                  </section>
                )}
                {data.attention < 50 && (
                  <section className="animate-in slide-in-from-right">
                    <h4 className="text-orange-400 font-black mb-2">● مسار تشتت الانتباه (ADHD):</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">استخدام "تقنية البومودورو" للدراسة، وتوفير بيئة خالية من المشتتات البصرية والسمعية مع فترات راحة حركية.</p>
                  </section>
                )}
                {data.executive < 50 && (
                  <section className="animate-in slide-in-from-right">
                    <h4 className="text-fuchsia-400 font-black mb-2">● مسار الوظائف التنفيذية:</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">تدريب الطفل على "الخرائط الذهنية" وجدولة المهام لتعزيز المرونة والقدرة على حل المشكلات.</p>
                  </section>
                )}
                <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 mt-8">
                    <p className="text-xs text-slate-500 italic leading-relaxed">
                        * ملاحظة: هذا التقرير هو تحليل أولي مبني على الأداء الرقمي، ولا يغني عن التشخيص السريري المباشر من قبل المختصين.
                    </p>
                </div>
            </div>

            <button onClick={() => window.print()} className="w-full mt-12 bg-emerald-600 hover:bg-emerald-500 py-5 rounded-2xl font-black text-xl transition-all shadow-lg">
                تحميل التقرير PDF ⬇️
            </button>
          </div>

        </div>

        <div className="mt-16 text-center">
            <Link href="/diagnose" className="text-slate-600 hover:text-white underline transition">العودة وإعادة الاختبارات</Link>
        </div>
      </div>
    </main>
  );
}