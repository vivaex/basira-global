'use client';
import { useState } from 'react';
import Link from 'next/link';

// قائمة الأقسام الـ 10 مع أيقوناتها
const CATEGORIES = [
  { id: 'auditory', title: 'مهارات السمع', icon: '🎧', color: 'border-blue-500' },
  { id: 'visual', title: 'مهارات البصر', icon: '👁️', color: 'border-purple-500' },
  { id: 'motor', title: 'المهارات الحركية', icon: '✍️', color: 'border-orange-500' },
  { id: 'cognitive', title: 'الإدراك والمعالجة', icon: '🧠', color: 'border-pink-500' },
  { id: 'attention', title: 'اختبارات الانتباه', icon: '🎯', color: 'border-red-500' },
  { id: 'language', title: 'مهارات اللغة', icon: '💬', color: 'border-indigo-500' },
  { id: 'reading', title: 'اختبارات القراءة', icon: '📖', color: 'border-emerald-500' },
  { id: 'writing', title: 'مهارات الكتابة', icon: '🖋️', color: 'border-cyan-500' },
  { id: 'math', title: 'الرياضيات والعد', icon: '🔢', color: 'border-yellow-500' },
  { id: 'executive', title: 'المهارات التنفيذية', icon: '🧩', color: 'border-teal-500' },
];

export default function DiagnosticLab() {
  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 md:p-12 font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto">
        
        <header className="text-center mb-12 animate-in fade-in duration-700">
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
            مختبر التشخيص المتكامل
          </h1>
          <p className="text-slate-400 text-xl font-light">اختر المجال الذي ترغب في تقييمه الآن</p>
        </header>

        {/* شبكة الأقسام العشرة */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {CATEGORIES.map((cat) => (
            <Link key={cat.id} href={`/diagnose/${cat.id}`}>
              <div className={`bg-slate-900/50 p-6 rounded-[2rem] border-2 ${cat.color} hover:scale-105 transition-all cursor-pointer shadow-xl group text-center h-full flex flex-col justify-center`}>
                <div className="text-5xl mb-4 group-hover:animate-bounce">{cat.icon}</div>
                <h3 className="text-lg font-black text-white">{cat.title}</h3>
                <div className="mt-2 text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition">دخول المختبر ←</div>
              </div>
            </Link>
          ))}
        </div>

        {/* زر التقرير النهائي (يظهر في الأسفل دائماً) */}
        <div className="mt-16 text-center">
           <Link href="/diagnose/results">
              <button className="bg-slate-800 hover:bg-slate-700 text-blue-400 px-10 py-4 rounded-2xl font-bold border border-blue-500/20 transition shadow-2xl">
                📑 الانتقال لمركز النتائج والتقارير
              </button>
           </Link>
        </div>
      </div>
    </main>
  );
}