'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function TopNavbar() {
  const [studentName, setStudentName] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  // جلب بيانات الطالب عند التحميل
  useEffect(() => {
    const name = localStorage.getItem('studentName');
    if (name) setStudentName(name);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('studentName');
    setStudentName(null);
    router.push('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-4" dir="rtl">
      <div className="max-w-7xl mx-auto flex justify-between items-center bg-slate-900/40 backdrop-blur-2xl border border-white/10 px-8 py-3 rounded-[2rem] shadow-2xl">
        
        {/* اللوجو والاسم */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-cyan-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(8,145,178,0.4)] group-hover:rotate-12 transition-transform">
            <span className="text-white font-black text-xl">ب</span>
          </div>
          <span className="text-2xl font-black italic tracking-tighter hidden md:block">
            بَصيرة <span className="text-cyan-500 font-mono text-xs opacity-50 uppercase tracking-[0.3em]">Global</span>
          </span>
        </Link>

        {/* روابط التنقل السريع */}
        <div className="hidden md:flex items-center gap-8 font-bold text-slate-400">
          <Link href="/diagnose" className="hover:text-cyan-400 transition-colors">المختبرات</Link>
          <Link href="/diagnose/results" className="hover:text-cyan-400 transition-colors">التقارير</Link>
          <span className="w-[1px] h-4 bg-white/10"></span>
        </div>

        {/* منطقة تسجيل الدخول / بيانات الطالب */}
        <div className="relative">
          {studentName ? (
            <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <div className="text-right hidden sm:block">
                <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">البطل الحالي</p>
                <p className="text-lg font-black text-white italic">{studentName}</p>
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-cyan-500/50 p-1 group-hover:border-cyan-400 transition-colors">
                <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center text-xl">🤖</div>
              </div>
            </div>
          ) : (
            <Link href="/login" className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-xl font-black transition-all shadow-lg shadow-cyan-900/20 active:scale-95">
              تسجيل دخول
            </Link>
          )}

          {/* القائمة المنسدلة للبيانات (Dropdown) */}
          <AnimatePresence>
            {isMenuOpen && studentName && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                className="absolute left-0 mt-4 w-64 bg-slate-900 border border-white/10 p-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-3xl"
              >
                <div className="mb-6 pb-4 border-b border-white/5">
                  <p className="text-xs text-slate-500 mb-1 font-mono uppercase tracking-widest">الحالة السيادية</p>
                  <p className="text-cyan-400 font-bold italic">جاهز للمهمة (Active)</p>
                </div>
                <div className="space-y-4">
                  <Link href="/diagnose/results" className="block text-slate-300 hover:text-white transition-colors font-bold">📊 استعراض نتائجي</Link>
                  <button onClick={handleLogout} className="w-full text-right text-rose-500 hover:text-rose-400 font-bold transition-colors pt-4 border-t border-white/5">
                    خروج من المنظومة ◀
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}