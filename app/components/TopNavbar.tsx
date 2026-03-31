'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function TopNavbar() {
  const [studentName, setStudentName] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const name = localStorage.getItem('studentName');
    if (name) setStudentName(name);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('studentName');
    setStudentName(null);
    router.push('/login');
  };

  return (
    // حولنا fixed لـ absolute وشلنا الـ py-4 عشان يضل فوق وما ينزل معك
    <nav className="absolute top-0 left-0 right-0 z-[100] px-4 md:px-8 py-4" dir="rtl">
      <div className="max-w-7xl mx-auto flex justify-between items-center bg-slate-900/60 backdrop-blur-2xl border border-white/10 px-6 md:px-10 py-4 rounded-[2.5rem] shadow-2xl">
        
        {/* اللوجو */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-xl italic">ب</span>
          </div>
          <span className="text-2xl font-black italic hidden sm:block">بَصيرة</span>
        </Link>

        {/* روابط سريعة */}
        <div className="hidden md:flex items-center gap-10 font-bold text-slate-400">
          <Link href="/diagnose" className="hover:text-cyan-400 transition-colors italic">المختبرات</Link>
          <Link href="/diagnose/results" className="hover:text-cyan-400 transition-colors italic">التقارير</Link>
        </div>

        {/* بيانات البطل */}
        <div className="relative">
          {studentName ? (
            <div 
              className="flex items-center gap-4 cursor-pointer group bg-white/5 px-4 py-2 rounded-2xl border border-white/5"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="text-right hidden sm:block">
                <p className="text-[10px] text-cyan-500 font-mono tracking-widest leading-none mb-1">HERO</p>
                <p className="text-sm font-black text-white italic">{studentName}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-xl">🤖</div>
            </div>
          ) : (
            <Link href="/login" className="bg-cyan-600 px-8 py-3 rounded-2xl font-black italic transition-all">
              دخول 🛡️
            </Link>
          )}

          {/* القائمة المنسدلة */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                className="absolute left-0 mt-4 w-56 bg-slate-900 border border-white/10 p-6 rounded-[2.5rem] shadow-2xl z-[110]"
              >
                <Link href="/diagnose/results" className="block text-slate-300 hover:text-cyan-400 mb-4 font-bold italic">📊 نتائجي</Link>
                <button onClick={handleLogout} className="w-full text-right text-rose-500 font-bold border-t border-white/5 pt-4 italic">خروج ◀</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}