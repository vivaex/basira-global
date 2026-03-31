'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function TopNavbar() {
  const [studentName, setStudentName] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  // جلب اسم الطالب من المتصفح
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
    // "fixed" هي اللي بتخليه ثابت فوق ما يتحرك
    <nav className="fixed top-0 left-0 right-0 z-[100] px-4 md:px-8 py-4 pointer-events-none" dir="rtl">
      <div className="max-w-7xl mx-auto flex justify-between items-center bg-slate-900/60 backdrop-blur-2xl border border-white/10 px-6 md:px-10 py-4 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] pointer-events-auto">
        
        {/* اللوجو */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-cyan-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(8,145,178,0.5)] group-hover:rotate-12 transition-all">
            <span className="text-white font-black text-xl italic">ب</span>
          </div>
          <span className="text-2xl font-black italic tracking-tighter hidden sm:block">بَصيرة</span>
        </Link>

        {/* روابط سريعة (تختفي في الشاشات الصغيرة) */}
        <div className="hidden md:flex items-center gap-10 font-bold text-slate-400">
          <Link href="/diagnose" className="hover:text-cyan-400 transition-colors italic">المختبرات</Link>
          <Link href="/diagnose/results" className="hover:text-cyan-400 transition-colors italic">التقارير</Link>
        </div>

        {/* بيانات البطل / تسجيل الدخول */}
        <div className="relative">
          {studentName ? (
            <div 
              className="flex items-center gap-4 cursor-pointer group bg-white/5 px-4 py-2 rounded-2xl border border-white/5 hover:border-cyan-500/50 transition-all"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="text-right hidden xs:block">
                <p className="text-[10px] text-cyan-500 font-mono uppercase tracking-widest leading-none mb-1">Active_Hero</p>
                <p className="text-sm font-black text-white italic">{studentName}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xl shadow-lg">
                🤖
              </div>
            </div>
          ) : (
            <Link href="/login" className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-2xl font-black transition-all shadow-xl active:scale-95 italic">
              دخول المنظومة 🛡️
            </Link>
          )}

          {/* القائمة المنسدلة */}
          <AnimatePresence>
            {isMenuOpen && studentName && (
              <motion.div 
                initial={{ opacity: 0, y: 15, scale: 0.95 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                className="absolute left-0 mt-4 w-60 bg-slate-900/95 backdrop-blur-3xl border border-white/10 p-6 rounded-[2.5rem] shadow-2xl"
              >
                <div className="space-y-4">
                  <Link href="/diagnose/results" className="block text-slate-300 hover:text-cyan-400 transition-colors font-bold text-lg italic">📊 عرض نتائجي</Link>
                  <button 
                    onClick={handleLogout} 
                    className="w-full text-right text-rose-500 hover:text-rose-400 font-bold transition-colors pt-4 border-t border-white/5 italic"
                  >
                    تسجيل الخروج ◀
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