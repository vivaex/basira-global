'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllTestSessions, getStudentProfile } from '@/lib/studentProfile';

interface Mission {
    id: string;
    title: string;
    category: string;
    icon: string;
    completed: boolean;
}

export default function DailyDrillView({ onClose }: { onClose: () => void }) {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 mins

    useEffect(() => {
        // 1. Calculate top 3 weak areas for the daily mission
        const sessions = getAllTestSessions();
        const profile = getStudentProfile();
        
        // Mocking task selection logic based on scores
        const categoryStats: Record<string, number> = {};
        sessions.forEach(s => {
            if (!categoryStats[s.testCategory]) categoryStats[s.testCategory] = 0;
            categoryStats[s.testCategory] = (categoryStats[s.testCategory] + s.rawScore) / 2;
        });

        const ALL_LABS = [
            { id: 'selective-attention', title: 'تحدي التركيز', category: 'attention', icon: '🎯' },
            { id: 'math-logic', title: 'المنطق الرقمي', category: 'math', icon: '🔢' },
            { id: 'working-memory', title: 'ذاكرة العمل', category: 'memory', icon: '🧠' },
            { id: 'social-recognition', title: 'مختبر المشاعر', category: 'social', icon: '🎭' },
            { id: 'visual-discrimination', title: 'التمييز البصري', category: 'visual', icon: '👁️' },
        ];

        // Pick 3: Focus on lowest scores if available, otherwise random
        const sortedLabs = [...ALL_LABS].sort((a, b) => (categoryStats[a.category] || 0) - (categoryStats[b.category] || 0));
        const dailySelection = sortedLabs.slice(0, 3).map(lab => ({
            ...lab,
            completed: sessions.some(s => s.testId === lab.id && new Date(s.completedAt).toDateString() === new Date().toDateString())
        }));

        setMissions(dailySelection);
        setLoading(false);

        const timer = setInterval(() => {
            setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    if (loading) return null;

    const allCompleted = missions.every(m => m.completed);

    return (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-xl"
        >
            <div className="relative w-full max-w-4xl bg-slate-900 border-2 border-cyan-500/30 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(6,182,212,0.2)]">
                
                {/* Header */}
                <div className="bg-gradient-to-r from-cyan-600 to-blue-700 p-8 text-center relative">
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white text-2xl">✕</button>
                    <div className="text-5xl mb-4">💊</div>
                    <h2 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter">مهمة الـ 15 دقيقة اليومية</h2>
                    <p className="text-cyan-100 mt-2 font-bold opacity-80">أكمل التحديات الثلاثة لرفع مستوى ذكائك وجمع النجوم! ✨</p>
                </div>

                <div className="p-8 md:p-12">
                    <div className="flex justify-between items-center mb-10 bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50">
                        <div className="text-left">
                            <div className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-1">Time Remaining</div>
                            <div className={`text-4xl font-black font-mono ${timeLeft < 300 ? 'text-rose-500 animate-pulse' : 'text-emerald-400'}`}>
                                {formatTime(timeLeft)}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-1">Overall Progress</div>
                            <div className="text-3xl font-black text-white">{missions.filter(m => m.completed).length} / 3</div>
                        </div>
                    </div>

                    <div className="grid gap-6">
                        {missions.map((mission, i) => (
                            <motion.div 
                                key={mission.id}
                                initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}
                                className={`flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all ${
                                    mission.completed 
                                    ? 'bg-emerald-500/10 border-emerald-500/40 opacity-70' 
                                    : 'bg-slate-800 border-slate-700 hover:border-cyan-500/50'
                                }`}
                            >
                                <div className="flex items-center gap-6">
                                    <div className="text-5xl">{mission.icon}</div>
                                    <div>
                                        <h4 className="text-2xl font-black text-white leading-none mb-2">{mission.title}</h4>
                                        <p className="text-slate-500 font-bold text-sm uppercase tracking-widest italic">{mission.category} mission</p>
                                    </div>
                                </div>
                                {mission.completed ? (
                                    <div className="bg-emerald-500 text-black font-black px-6 py-2 rounded-full text-sm">مكتمل ✅</div>
                                ) : (
                                    <Link 
                                        href={`/diagnose/${mission.category}/${mission.id}`}
                                        className="bg-cyan-500 text-black font-black px-8 py-3 rounded-2xl hover:bg-white transition-colors text-lg"
                                    >
                                        انطلق 🚀
                                    </Link>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    {allCompleted && (
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            className="mt-10 p-8 bg-emerald-500 rounded-[2.5rem] text-center shadow-[0_0_50px_rgba(16,185,129,0.4)]"
                        >
                            <h3 className="text-3xl font-black text-black mb-2">تهانينا يا بطل! 🤩🏆</h3>
                            <p className="text-black/80 font-bold">لقد أتممت برنامجك العلاجي لليوم بنجاح ساحق. أراك غداً!</p>
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
