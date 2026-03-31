'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function LoginPortal() {
  const [name, setName] = useState('');
  const router = useRouter();

  const handleAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      localStorage.setItem('studentName', name);
      router.push('/diagnose');
    }
  };

  return (
    <main className="min-h-screen bg-[#020617] flex items-center justify-center p-6" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-slate-900/40 backdrop-blur-2xl border border-cyan-500/30 p-10 rounded-[3rem] shadow-2xl text-center"
      >
        <div className="text-6xl mb-6">🤖</div>
        <h1 className="text-3xl font-black mb-2 italic text-white">بوابة العبور الآمن</h1>
        <p className="text-slate-500 mb-8 font-light italic">أهلاً بك أيها البطل، عرفنا بنفسك للبدء.</p>
        
        <form onSubmit={handleAccess} className="space-y-6">
          <input 
            type="text" 
            placeholder="ادخل اسمك هنا..." 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-950 border-2 border-slate-800 focus:border-cyan-500 p-5 rounded-2xl outline-none text-center text-xl font-bold transition-all"
          />
          <button className="w-full bg-cyan-600 py-5 rounded-2xl font-black text-xl hover:bg-cyan-500 shadow-lg shadow-cyan-500/20 transition-all active:scale-95">
            تفعيل المنظومة 🛡️
          </button>
        </form>
      </motion.div>
    </main>
  );
}