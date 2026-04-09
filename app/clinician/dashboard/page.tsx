'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import NetworkBackground from '@/app/components/NetworkBackground';
import { getStudentProfile, getAllTestSessions, TestSession, StudentProfile } from '@/lib/studentProfile';

export default function ClinicianDashboard() {
  const [activeTab, setActiveTab] = useState<'roster' | 'alerts' | 'clinic'>('roster');
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [localStudent, setLocalStudent] = useState<{ profile: StudentProfile, sessions: TestSession[] } | null>(null);

  useEffect(() => {
    // 1. Try to fetch from Cloud API
    fetch('/api/clinics/students')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
            setStudents(data);
        } else {
            // Fallback to Local Data if API is empty (Dev/Demo mode)
            loadLocalData();
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('API Fetch failed, using local fallback:', err);
        loadLocalData();
        setLoading(false);
      });
  }, []);

  const loadLocalData = () => {
    const prof = getStudentProfile();
    const sess = getAllTestSessions();
    if (prof) {
       setLocalStudent({ profile: prof, sessions: sess });
       setStudents([{
          id: 'local_current',
          name: prof.name,
          age: prof.age,
          lastTest: sess.length > 0 ? new Date(sess[sess.length-1].completedAt).toLocaleDateString('ar-SA') : 'لا يوجد',
          risk: sess.length > 0 ? (sess[sess.length-1].rawScore < 40 ? 'high' : sess[sess.length-1].rawScore < 70 ? 'medium' : 'low') : 'low',
          type: sess.length > 0 ? sess[sess.length-1].testTitle : 'فحص شامل'
       }]);
    }
  };

  const filtered = students.filter(s => s.name?.includes(searchQuery));

  return (
    <main className="min-h-screen bg-[#020617] text-white p-6 md:p-12 font-sans relative overflow-hidden" dir="rtl">
      {/* <NetworkBackground /> */}
      <div className="fixed inset-0 grid-bg opacity-10 z-0 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-white/5 pb-8">
            <div>
               <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-2xl shadow-[0_0_30px_rgba(6,182,212,0.3)]">📡</div>
                  <div>
                    <h1 className="text-4xl font-black italic tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">لوحة القيادة السريرية</h1>
                    <p className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Sovereign Diagnostic Command</p>
                  </div>
               </div>
            </div>
            <div className="flex gap-4">
                <Link href="/diagnose" className="bg-slate-900/80 backdrop-blur hover:bg-slate-800 border border-white/10 px-6 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2">بوابة الطلاب 🎮</Link>
                <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2">
                   <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                   {students.some(s => s.id === 'local_current') ? 'الوضع المحلي نشط' : 'متصل بالسحابة'}
                </div>
            </div>
        </header>

        {/* Clinical Stats Action Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group hover:border-cyan-500/30 transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-cyan-500/10 transition-all" />
                <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1">إجمالي الحالات</p>
                <p className="text-4xl font-black italic">{students.length}</p>
                <div className="text-[9px] text-slate-500 font-bold mt-4">+10% عن الشهر الماضي</div>
            </div>
            <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group hover:border-rose-500/30 transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-rose-500/10 transition-all" />
                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">تنبيهات عالية الخطورة</p>
                <p className="text-4xl font-black italic text-rose-500">{students.filter(s => s.risk === 'high').length}</p>
                <div className="text-[9px] text-slate-500 font-bold mt-4">تتطلب مراجعة فورية ⚠️</div>
            </div>
            <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 p-8 rounded-[2.5rem] md:col-span-2 flex items-center justify-between group hover:border-blue-500/30 transition-all">
                <div className="flex-1">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">كفاءة التشخيص الذكي</p>
                    <p className="text-4xl font-black italic">98.4<span className="text-lg text-slate-500 ml-1">%</span></p>
                    <div className="w-full bg-slate-800 h-1 rounded-full mt-4 overflow-hidden">
                        <div className="bg-blue-500 h-full w-[98.4%]" />
                    </div>
                </div>
                <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center text-4xl">🧠</div>
            </div>
        </div>

        {/* Patient Management Area */}
        <div className="bg-slate-900/20 backdrop-blur-3xl border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
           <div className="flex border-b border-white/5 p-2 bg-black/40">
              {['roster', 'alerts', 'clinic'].map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-10 py-5 text-[10px] font-black transition-all uppercase tracking-[0.2em] relative ${activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-white'}`}
                >
                  {activeTab === tab && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-4 right-4 h-1 bg-cyan-500 rounded-full" />}
                  {tab === 'roster' ? 'قائمة المرضى' : tab === 'alerts' ? 'تنبيهات AI' : 'إعدادات العيادة'}
                </button>
              ))}
           </div>

           <div className="p-8 md:p-12">
              <div className="mb-10 flex flex-col md:flex-row gap-6">
                 <div className="flex-1 relative group">
                    <input 
                      type="text" 
                      placeholder="البحث عن مريض بالاسم أو الكود التشخيصي..." 
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 px-14 text-sm font-bold focus:border-cyan-500 focus:bg-black/60 outline-none transition-all placeholder:text-slate-600"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-xl text-slate-600 group-focus-within:text-cyan-500 transition-colors">🔍</div>
                 </div>
                 <button className="bg-white text-black font-black px-12 py-5 rounded-2xl text-xs shadow-xl hover:bg-cyan-50 transition-all uppercase active:scale-95">+ مريض جديد</button>
              </div>

              {loading ? (
                <div className="py-24 text-center">
                   <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto mb-6" />
                   <p className="text-[10px] font-black tracking-[0.3em] text-slate-500 uppercase">Synchronizing clinical data stream...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                   <table className="w-full text-right border-separate border-spacing-y-4">
                      <thead>
                         <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                            <th className="pb-4 pr-8">المريض</th>
                            <th className="pb-4">العمر</th>
                            <th className="pb-4">آخر تشخيص</th>
                            <th className="pb-4">التشخيص الحركي/الإدراكي</th>
                            <th className="pb-4">مستوى الخطورة</th>
                            <th className="pb-4 pl-8 text-left">الإجراءات السريرية</th>
                         </tr>
                      </thead>
                      <tbody>
                         {filtered.length === 0 && (
                            <tr>
                               <td colSpan={6} className="py-24 text-center text-slate-700 font-black italic bg-black/10 rounded-[2rem] border border-dashed border-white/5">
                                  <div className="text-4xl mb-4 opacity-20">📂</div>
                                  لا توجد حالات مسجلة حالياً في المختبر السريري.
                               </td>
                            </tr>
                         )}
                         {filtered.map((student) => (
                           <tr key={student.id} className="group transition-all">
                              <td className="py-6 pr-8 bg-white/[0.03] rounded-r-[2rem] border-y border-r border-white/5 group-hover:bg-white/[0.06] transition-colors">
                                 <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center text-xl shadow-lg ring-2 ring-transparent group-hover:ring-cyan-500/20 transition-all">👤</div>
                                    <div>
                                       <p className="font-black italic text-lg text-white group-hover:text-cyan-400 transition-colors">{student.name}</p>
                                       <p className="text-[9px] text-slate-600 font-mono mt-0.5 uppercase tracking-widest">UID_{student.id.slice(0,8)}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="py-6 font-bold bg-white/[0.03] border-y border-white/5 group-hover:bg-white/[0.06]">{student.age} سنوات</td>
                              <td className="py-6 text-[11px] font-mono font-bold text-slate-400 bg-white/[0.03] border-y border-white/5 group-hover:bg-white/[0.06]">{student.lastTest}</td>
                              <td className="py-6 text-[11px] font-black italic text-cyan-500 bg-white/[0.03] border-y border-white/5 group-hover:bg-white/[0.06] uppercase tracking-wide">{student.type}</td>
                              <td className="py-6 bg-white/[0.03] border-y border-white/5 group-hover:bg-white/[0.06]">
                                 <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                    student.risk === 'high' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                                    student.risk === 'medium' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                 }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${student.risk === 'high' ? 'bg-rose-500' : student.risk === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                    {student.risk === 'high' ? 'تحذير ساش' : student.risk === 'medium' ? 'متوسط' : 'نطاق طبيعي'}
                                 </div>
                              </td>
                              <td className="py-6 pl-8 text-left bg-white/[0.03] rounded-l-[2rem] border-y border-l border-white/5 group-hover:bg-white/[0.06] transition-colors">
                                 <Link 
                                    href={student.id === 'local_current' ? '/diagnose/report-pro' : `/diagnose/report-pro?patient=${student.id}`} 
                                    className="bg-slate-800 hover:bg-cyan-500 text-white py-3 px-8 rounded-xl text-[10px] font-black transition-all border border-white/5 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] inline-block"
                                 >
                                    فتح السجل الكامل 🔬
                                 </Link>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
              )}
           </div>
        </div>

        <footer className="mt-16 text-center">
            <div className="inline-block bg-slate-900/50 backdrop-blur-xl border border-white/5 px-8 py-3 rounded-full">
                <p className="text-[9px] font-mono tracking-[0.4em] uppercase text-slate-500">
                    Basira Global Sovereign Intelligence // encrypted.diagnostic.v5.0.1
                </p>
            </div>
        </footer>
      </div>
    </main>
  );
}

