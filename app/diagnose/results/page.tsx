'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ComprehensiveSovereignReport() {
  const [name, setName] = useState('أيها البطل');

  useEffect(() => {
    const savedName = localStorage.getItem('studentName');
    if (savedName) setName(savedName);
  }, []);

  const labs = [
    { id: 'math', title: 'الرياضيات', score: 85, icon: '🔢', status: 'متفوق' },
    { id: 'visual', title: 'البصر', score: 70, icon: '👁️', status: 'مستقر' },
    { id: 'attention', title: 'الانتباه', score: 62, icon: '🎯', status: 'بحاجة لدعم' },
    { id: 'memory', title: 'الذاكرة', score: 92, icon: '🧠', status: 'عبقري' },
    { id: 'motor', title: 'الحركة', icon: '✍️', score: 88, status: 'ممتاز' },
    { id: 'language', title: 'اللغة', icon: '📖', score: 75, status: 'مستقر' },
    { id: 'auditory', title: 'السمع', icon: '👂', score: 80, status: 'جيد جداً' },
    { id: 'executive', title: 'الوظائف', icon: '⚙️', score: 55, status: 'تحدي حرج' },
    { id: 'cognitive', title: 'الإدراك', icon: '💡', score: 82, status: 'جيد جداً' },
    { id: 'writing', title: 'الكتابة', icon: '🖋️', score: 90, status: 'متفوق' },
  ];

  return (
    <main className="min-h-screen bg-[#020617] text-slate-200 p-6 md:p-16 font-sans relative" dir="rtl">
      
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        <header className="mb-16 border-b border-white/5 pb-10">
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-4 leading-tight">
            التقرير <span className="text-cyan-400">الفني المعمق</span>
          </h1>
          <p className="text-slate-500 text-2xl font-light italic">
            تحليل المسار السيادي للبطل: <span className="text-white font-bold">{name}</span>
          </p>
        </header>

        {/* أولاً: ملخص الخانات العشرة */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-16">
          {labs.map((lab) => (
            <div key={lab.id} className="bg-slate-900/40 border border-white/10 p-6 rounded-[2.5rem] text-center backdrop-blur-md">
              <span className="text-4xl mb-2 block">{lab.icon}</span>
              <h3 className="text-sm font-bold text-slate-400 mb-1">{lab.title}</h3>
              <div className="text-2xl font-black text-white">{lab.score}%</div>
              <div className="text-[10px] uppercase tracking-widest text-cyan-500 mt-2">{lab.status}</div>
            </div>
          ))}
        </div>

        {/* ثانياً: التقييم الدقيق (التحليل الفني) */}
        <section className="grid md:grid-cols-2 gap-10 mb-16">
          <div className="bg-slate-900/60 border-2 border-cyan-500/20 p-12 rounded-[4rem] shadow-2xl">
            <h2 className="text-3xl font-black mb-8 italic text-white flex items-center gap-4">
               <span className="text-4xl">🧬</span> التحليل العصب-نفسي
            </h2>
            <div className="space-y-6 text-xl leading-relaxed text-slate-300 italic font-light">
              <p>• <strong className="text-white">نقاط القوة السيادية:</strong> يظهر البطل تفوقاً حاداً في الذاكرة العاملة والآزر الحركي، مما يشير إلى قدرة عالية على تعلم المهارات المعقدة بسرعة إذا تم تقديمها بصرياً.</p>
              <p>• <strong className="text-white">الفجوات النمائية:</strong> هناك هبوط ملحوظ في "الوظائف التنفيذية" (55%)، وهذا يفسر الصعوبة في تنظيم الوقت أو البدء بالمهام الدراسية بشكل مستقل.</p>
              <p>• <strong className="text-white">الاستنتاج السريري:</strong> حالة الطفل لا تندرج تحت "عجز التعلم" بل هي "تفاوت نمائي" يحتاج لمسار تنظيمي لرفع كفاءة الفص الجبهي المسؤول عن التركيز.</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600/20 to-transparent border-2 border-white/10 p-12 rounded-[4rem] shadow-2xl">
            <h2 className="text-3xl font-black mb-8 italic text-white flex items-center gap-4">
               <span className="text-4xl">🚀</span> خارطة الطريق (الخطوات القادمة)
            </h2>
            <div className="space-y-8">
              <div className="flex gap-6 items-start">
                <span className="bg-cyan-500 text-black font-black w-10 h-10 rounded-full flex items-center justify-center shrink-0">1</span>
                <div>
                  <h4 className="text-xl font-bold text-white mb-1">المسار العلاجي الرقمي</h4>
                  <p className="text-slate-400">البدء فوراً بـ 15 جلسة "تعديل انتباه" عبر مختبر بصيرة لرفع النسبة من 62% إلى 80%.</p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <span className="bg-cyan-500 text-black font-black w-10 h-10 rounded-full flex items-center justify-center shrink-0">2</span>
                <div>
                  <h4 className="text-xl font-bold text-white mb-1">الدعم الأكاديمي المخصص</h4>
                  <p className="text-slate-400">اعتماد استراتيجية "الخرائط الذهنية" في تدريس الرياضيات للاستفادة من قوة الذاكرة البصرية لديه.</p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <span className="bg-cyan-500 text-black font-black w-10 h-10 rounded-full flex items-center justify-center shrink-0">3</span>
                <div>
                  <h4 className="text-xl font-bold text-white mb-1">التقييم الدوري</h4>
                  <p className="text-slate-400">إعادة فحص "الوظائف التنفيذية" بعد 3 أشهر لمراقبة التطور العصبي الناتج عن التدريب.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* أزرار العمل السيادية */}
        <div className="flex flex-col md:flex-row gap-6 justify-center">
            <button className="px-12 py-7 bg-white text-black font-black text-2xl rounded-[2rem] hover:bg-cyan-500 hover:text-white transition-all shadow-2xl active:scale-95">
                تفعيل خطة التدريب 🛡️
            </button>
            <button className="px-12 py-7 bg-slate-900 text-white font-black text-2xl rounded-[2rem] border border-white/10 hover:bg-slate-800 transition-all">
                تحميل الملف الفني الكامل (PDF)
            </button>
        </div>

      </div>

      <footer className="mt-20 py-10 border-t border-white/5 text-center text-slate-700 font-mono text-sm tracking-widest uppercase">
        Sovereign_Technical_Protocol // Basira_2026
      </footer>
    </main>
  );
}