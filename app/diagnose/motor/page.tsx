'use client';
import Link from 'next/link';

export default function DiagnosePage() {
  const sections = [
    { id: 'math', title: 'الرياضيات', icon: '🔢', color: 'bg-blue-600' },
    { id: 'visual', title: 'البصر', icon: '👁️', color: 'bg-purple-600' },
    { id: 'attention', title: 'الانتباه', icon: '🎯', color: 'bg-red-600' },
    { id: 'memory-test', title: 'الذاكرة', icon: '🧠', color: 'bg-emerald-600' },
    { id: 'motor', title: 'الحركة', icon: '✍️', color: 'bg-rose-600' },
    { id: 'language', title: 'اللغة والقراءة', icon: '📖', color: 'bg-indigo-600' },
    { id: 'auditory', title: 'السمع والإدراك', icon: '👂', color: 'bg-cyan-600' },
    { id: 'executive', title: 'الوظائف التنفيذية', icon: '⚙️', color: 'bg-fuchsia-600' },
    { id: 'cognitive', title: 'الإدراك والمعالجة', icon: '💡', color: 'bg-amber-600' },
    { id: 'writing', title: 'مهارات الكتابة', icon: '🖋️', color: 'bg-teal-600' },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8 md:p-20 font-sans" dir="rtl">
      <h1 className="text-5xl font-black text-center mb-16 italic underline decoration-blue-500">بوابة بصيرة للتشخيص</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {sections.map((s) => (
          <Link key={s.id} href={`/diagnose/${s.id}`}>
            <div className={`${s.color} p-8 rounded-[2rem] text-center hover:scale-105 transition-all cursor-pointer shadow-xl h-full flex flex-col items-center justify-center`}>
              <span className="text-6xl mb-4">{s.icon}</span>
              <h2 className="text-xl font-bold">{s.title}</h2>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-20 text-center">
        <Link href="/diagnose/results" className="bg-white text-black px-10 py-4 rounded-xl font-black text-xl">عرض التقرير النهائي 📊</Link>
      </div>
    </main>
  );
}