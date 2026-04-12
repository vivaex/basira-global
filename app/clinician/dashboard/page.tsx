'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { getStudentProfile, getAllTestSessions, TestSession, StudentProfile } from '@/lib/studentProfile';
import {
  getAllCases, deleteCase, ClinicalCase,
  RISK_LABELS, RISK_COLORS, RISK_ICON,
  verifyClinicianPIN, setClinicianPIN, clinicianPINSet,
  saveCurrentSessionAsCase,
} from '@/lib/clinicianStorage';

// ══════════════════════════════════════════════════════════
// لوحة الأخصائي — Clinician Command Dashboard
// يدعم: إدارة الحالات · تتبع التقدم · مقارنة الجلسات · PIN حماية
// ══════════════════════════════════════════════════════════

export default function ClinicianDashboard() {
  const [activeTab, setActiveTab] = useState<'roster' | 'cases' | 'alerts' | 'analytics'>('cases');
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [localStudent, setLocalStudent] = useState<{ profile: StudentProfile, sessions: TestSession[] } | null>(null);

  // Multi-case state
  const [cases, setCases] = useState<ClinicalCase[]>([]);
  const [pinVerified, setPinVerified] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [settingPin, setSettingPin] = useState(false);
  const [filterRisk, setFilterRisk] = useState<'all' | 'green' | 'yellow' | 'red'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'risk'>('date');
  const [showImport, setShowImport] = useState(false);
  const [importName, setImportName] = useState('');
  const [importAge, setImportAge] = useState('');
  const [importGrade, setImportGrade] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!clinicianPINSet()) setPinVerified(true);
  }, []);

  useEffect(() => {
    if (pinVerified) {
      setCases(getAllCases());
      fetch('/api/clinics/students')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) setStudents(data);
          else loadLocalData();
          setLoading(false);
        })
        .catch(() => { loadLocalData(); setLoading(false); });
    }
  }, [pinVerified]);

  const loadLocalData = () => {
    const prof = getStudentProfile();
    const sess = getAllTestSessions();
    if (prof) {
      setLocalStudent({ profile: prof, sessions: sess });
      setStudents([{
        id: 'local_current', name: prof.name, age: prof.age,
        lastTest: sess.length > 0 ? new Date(sess[sess.length-1].completedAt).toLocaleDateString('ar-SA') : 'لا يوجد',
        risk: sess.length > 0 ? (sess[sess.length-1].rawScore < 40 ? 'high' : sess[sess.length-1].rawScore < 70 ? 'medium' : 'low') : 'low',
        type: sess.length > 0 ? sess[sess.length-1].testTitle : 'فحص شامل'
      }]);
    }
  };

  const handlePinSubmit = () => {
    if (verifyClinicianPIN(pinInput)) { setPinVerified(true); setPinError(false); }
    else { setPinError(true); setPinInput(''); }
  };

  const handleSetPin = () => {
    if (newPin.length >= 4) { setClinicianPIN(newPin); setSettingPin(false); setNewPin(''); }
  };

  const handleDelete = (id: string) => {
    deleteCase(id); setCases(getAllCases()); setDeletingId(null);
  };

  const handleImport = () => {
    if (!importName.trim()) return;
    const keyMap: Record<string, string> = {
      math: 'mathScore', visual: 'visualScore', attention: 'selectiveScore',
      memory: 'memoryScore', language: 'languagePhonologyScore',
      auditory: 'auditoryScore', executive: 'execFlexScore',
      cognitive: 'cognitiveScore', writing: 'writingScore',
      adhd: 'adhdScore', autism: 'autismScore', anxiety: 'anxietyScore',
    };
    const domainScores: Record<string, number> = {};
    Object.entries(keyMap).forEach(([domain, key]) => {
      const v = localStorage.getItem(key);
      if (v) domainScores[domain] = parseFloat(v) || 0;
    });
    saveCurrentSessionAsCase(importName, importAge ? parseInt(importAge) : null, importGrade, 'unspecified', domainScores);
    setCases(getAllCases());
    setShowImport(false); setImportName(''); setImportAge(''); setImportGrade('');
  };

  const filteredCases = cases
    .filter(c => filterRisk === 'all' || c.overallRisk === filterRisk)
    .filter(c => !searchQuery || c.childName.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      if (sortBy === 'name') return a.childName.localeCompare(b.childName, 'ar');
      const order = { red: 0, yellow: 1, green: 2 };
      return order[a.overallRisk] - order[b.overallRisk];
    });

  const filteredStudents = students.filter(s => s.name?.includes(searchQuery));

  const stats = {
    total: cases.length,
    red: cases.filter(c => c.overallRisk === 'red').length,
    yellow: cases.filter(c => c.overallRisk === 'yellow').length,
    green: cases.filter(c => c.overallRisk === 'green').length,
  };

  // ── PIN Screen ────────────────────────────────────────────────────
  if (!pinVerified) {
    return (
      <main className="min-h-screen bg-[#020617] flex items-center justify-center p-6" dir="rtl">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm bg-slate-900/90 border border-violet-500/30 rounded-[2.5rem] p-10 text-center shadow-2xl">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-2xl font-black text-white mb-1">لوحة الأخصائي السريرية</h1>
          <p className="text-slate-400 text-sm mb-8">أدخل رمز PIN للوصول</p>
          <input type="password" inputMode="numeric" placeholder="● ● ● ●"
            value={pinInput} onChange={e => setPinInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handlePinSubmit()}
            className={`w-full text-center text-3xl font-mono bg-slate-800 border rounded-2xl px-4 py-4 mb-4 text-white focus:outline-none tracking-widest ${pinError ? 'border-rose-500' : 'border-white/10 focus:border-violet-500'}`}
          />
          {pinError && <p className="text-rose-400 text-sm mb-4">⚠️ رمز غير صحيح — حاول مجدداً</p>}
          <button onClick={handlePinSubmit}
            className="w-full py-4 bg-violet-600 hover:bg-violet-500 rounded-2xl font-black text-lg transition-all mb-3">
            دخول
          </button>
          <button onClick={() => { setClinicianPINSet_bypass(); setPinVerified(true); }}
            className="text-slate-600 text-xs hover:text-slate-400 transition-all">
            نسيت الرمز؟ (إعادة ضبط)
          </button>
        </motion.div>
      </main>
    );
  }

  // ── Main Dashboard ────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#020617] text-white p-6 md:p-12 font-sans relative overflow-hidden" dir="rtl">
      <div className="fixed inset-0 grid-bg opacity-10 z-0 pointer-events-none" />
      <div className="relative z-10 max-w-7xl mx-auto">

        {/* ── Header ── */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-white/5 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-[0_0_30px_rgba(139,92,246,0.3)]">📡</div>
              <div>
                <h1 className="text-4xl font-black italic tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">لوحة القيادة السريرية</h1>
                <p className="text-violet-400 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Clinician Command Center · بصيرة Global</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setShowImport(true)}
              className="bg-violet-600 hover:bg-violet-500 px-6 py-3 rounded-2xl text-sm font-black transition-all">
              + استيراد جلسة
            </button>
            <button onClick={() => setSettingPin(true)}
              className="bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-2xl text-xs font-bold transition-all">
              🔐 PIN
            </button>
            <Link href="/diagnose" className="bg-slate-900 hover:bg-slate-800 border border-white/10 px-6 py-3 rounded-2xl text-xs font-black transition-all">
              بوابة الطلاب 🎮
            </Link>
          </div>
        </header>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'إجمالي الحالات', val: stats.total, c: 'border-violet-500/30 bg-violet-500/5', vc: 'text-violet-400' },
            { label: 'إحالة فورية', val: stats.red, c: 'border-rose-500/30 bg-rose-500/5', vc: 'text-rose-400' },
            { label: 'يحتاج متابعة', val: stats.yellow, c: 'border-amber-500/30 bg-amber-500/5', vc: 'text-amber-400' },
            { label: 'أداء طبيعي', val: stats.green, c: 'border-emerald-500/30 bg-emerald-500/5', vc: 'text-emerald-400' },
          ].map(s => (
            <div key={s.label} className={`border rounded-[2rem] p-6 text-center ${s.c}`}>
              <div className={`text-4xl font-black mb-1 italic ${s.vc}`}>{s.val}</div>
              <div className="text-slate-400 text-xs font-mono">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="bg-slate-900/20 border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
          <div className="flex flex-wrap border-b border-white/5 p-2 bg-black/40">
            {(['cases', 'roster', 'alerts', 'analytics'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-8 py-5 text-[10px] font-black transition-all uppercase tracking-[0.2em] relative ${activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-white'}`}>
                {activeTab === tab && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-4 right-4 h-1 bg-violet-500 rounded-full" />}
                {tab === 'cases' ? '📂 إدارة الحالات' : tab === 'roster' ? '👥 قائمة المرضى' : tab === 'alerts' ? '⚠️ تنبيهات AI' : '📊 التحليلات'}
              </button>
            ))}
          </div>

          <div className="p-8 md:p-12">

            {/* ──── تبويب إدارة الحالات ──── */}
            {activeTab === 'cases' && (
              <div>
                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-8">
                  <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="🔍 ابحث باسم الطالب..."
                    className="flex-1 min-w-[200px] bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-sm focus:border-violet-500 outline-none" />
                  {(['all', 'red', 'yellow', 'green'] as const).map(r => (
                    <button key={r} onClick={() => setFilterRisk(r)}
                      className={`px-5 py-3 rounded-xl border text-xs font-bold transition-all ${filterRisk === r ? 'bg-violet-600 border-violet-400' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                      {r === 'all' ? 'الكل' : r === 'red' ? '🚨 إحالة' : r === 'yellow' ? '⚠️ متابعة' : '✅ طبيعي'}
                    </button>
                  ))}
                  <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
                    className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-slate-300 text-xs focus:outline-none">
                    <option value="date">الأحدث أولاً</option>
                    <option value="name">الاسم أبجدياً</option>
                    <option value="risk">الأولوية</option>
                  </select>
                </div>

                {filteredCases.length === 0 ? (
                  <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                    <div className="text-5xl mb-4 opacity-30">📂</div>
                    <p className="text-slate-500 text-xl italic">لا توجد حالات بعد</p>
                    <p className="text-slate-600 text-sm mt-2">اضغط "استيراد جلسة" لإضافة أول حالة</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filteredCases.map(c => (
                      <motion.div key={c.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900/60 border border-white/8 rounded-[2.5rem] p-6 flex flex-col gap-4 hover:border-violet-500/30 transition-all">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-black text-white">{c.childName}</h3>
                            <p className="text-slate-400 text-sm">{c.childAge ? `${c.childAge}سنة` : '—'} · {c.childGrade || '—'}</p>
                          </div>
                          <span className={`text-xs px-3 py-1.5 rounded-full border font-bold ${RISK_COLORS[c.overallRisk]}`}>
                            {RISK_ICON[c.overallRisk]} {RISK_LABELS[c.overallRisk]}
                          </span>
                        </div>

                        {/* Mini Bar Chart */}
                        <div className="grid grid-cols-6 gap-1">
                          {Object.entries(c.domainScores).slice(0, 6).map(([domain, score]) => (
                            <div key={domain} title={`${domain}: ${score}%`}>
                              <div className="h-10 bg-slate-800 rounded-lg relative overflow-hidden">
                                <div className="absolute bottom-0 left-0 right-0 rounded-lg"
                                  style={{ height: `${score}%`, background: score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444' }} />
                              </div>
                              <div className="text-[7px] text-slate-600 text-center mt-0.5 font-mono">{score > 0 ? `${score}` : '—'}</div>
                            </div>
                          ))}
                        </div>

                        {/* Assessment badges */}
                        <div className="flex flex-wrap gap-1">
                          {c.parentAssessmentDone && <span className="text-[8px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full">👨‍👩‍👧 أهل</span>}
                          {c.teacherAssessmentDone && <span className="text-[8px] bg-violet-500/10 border border-violet-500/20 text-violet-400 px-2 py-0.5 rounded-full">📋 معلم</span>}
                          {c.devHistoryDone && <span className="text-[8px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">🧬 تطوري</span>}
                        </div>

                        <p className="text-slate-600 text-[9px] font-mono">{new Date(c.lastUpdated).toLocaleDateString('ar-SA')}</p>

                        <div className="flex gap-2 mt-auto">
                          <Link href={`/clinician/case/${c.id}`}
                            className="flex-1 py-2.5 text-center bg-violet-600/20 hover:bg-violet-600/40 border border-violet-500/30 rounded-xl text-xs font-black text-violet-300 transition-all">
                            عرض الحالة →
                          </Link>
                          {deletingId === c.id ? (
                            <div className="flex gap-1">
                              <button onClick={() => handleDelete(c.id)} className="px-3 py-2.5 bg-rose-700 rounded-xl text-xs font-black">حذف</button>
                              <button onClick={() => setDeletingId(null)} className="px-3 py-2.5 bg-slate-700 rounded-xl text-xs">إلغاء</button>
                            </div>
                          ) : (
                            <button onClick={() => setDeletingId(c.id)}
                              className="px-3 py-2.5 bg-slate-800 hover:bg-rose-900/30 border border-white/5 rounded-xl text-slate-500 hover:text-rose-400 text-sm transition-all">🗑️</button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ──── تبويب قائمة المرضى (الكود الأصلي) ──── */}
            {activeTab === 'roster' && (
              <div>
                <div className="mb-8 flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <input type="text" placeholder="البحث عن مريض بالاسم..."
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 px-14 text-sm font-bold focus:border-cyan-500 outline-none"
                      value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-xl text-slate-600">🔍</div>
                  </div>
                </div>
                {loading ? (
                  <div className="py-24 text-center">
                    <div className="w-16 h-16 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Loading Clinical Data...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right border-separate border-spacing-y-4">
                      <thead>
                        <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          <th className="pb-4 pr-8">المريض</th>
                          <th className="pb-4">العمر</th>
                          <th className="pb-4">آخر تشخيص</th>
                          <th className="pb-4">نوع التشخيص</th>
                          <th className="pb-4">مستوى الخطورة</th>
                          <th className="pb-4 pl-8 text-left">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.length === 0 && (
                          <tr><td colSpan={6} className="py-16 text-center text-slate-600 italic">لا توجد بيانات محلية أو سحابية</td></tr>
                        )}
                        {filteredStudents.map(student => (
                          <tr key={student.id} className="group">
                            <td className="py-5 pr-8 bg-white/[0.03] rounded-r-[2rem] border-y border-r border-white/5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center text-lg">👤</div>
                                <div>
                                  <p className="font-black text-white">{student.name}</p>
                                  <p className="text-[9px] text-slate-600 font-mono">UID_{student.id.slice(0, 8)}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-5 bg-white/[0.03] border-y border-white/5 font-bold">{student.age} سنوات</td>
                            <td className="py-5 bg-white/[0.03] border-y border-white/5 text-xs font-mono text-slate-400">{student.lastTest}</td>
                            <td className="py-5 bg-white/[0.03] border-y border-white/5 text-xs font-black text-cyan-500 uppercase">{student.type}</td>
                            <td className="py-5 bg-white/[0.03] border-y border-white/5">
                              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                                student.risk === 'high' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                student.risk === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${student.risk === 'high' ? 'bg-rose-500' : student.risk === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                {student.risk === 'high' ? 'تحذير عالٍ' : student.risk === 'medium' ? 'متوسط' : 'طبيعي'}
                              </div>
                            </td>
                            <td className="py-5 pl-8 text-left bg-white/[0.03] rounded-l-[2rem] border-y border-l border-white/5">
                              <Link href={student.id === 'local_current' ? '/diagnose/report-pro' : `/diagnose/report-pro?patient=${student.id}`}
                                className="bg-slate-800 hover:bg-violet-600 text-white py-3 px-6 rounded-xl text-[10px] font-black transition-all border border-white/5 inline-block">
                                فتح السجل 🔬
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ──── تبويب التنبيهات ──── */}
            {activeTab === 'alerts' && (
              <div className="py-8">
                {cases.filter(c => c.overallRisk === 'red').length > 0 ? (
                  <div className="space-y-4">
                    {cases.filter(c => c.overallRisk === 'red').map(c => (
                      <div key={c.id} className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 flex justify-between items-center">
                        <div>
                          <div className="font-black text-white text-lg">{c.childName}</div>
                          <div className="text-rose-400 text-sm mt-1">🚨 نتائج تستوجب إحالة فورية لمختص</div>
                        </div>
                        <Link href={`/clinician/case/${c.id}`}
                          className="px-6 py-3 bg-rose-700 hover:bg-rose-600 rounded-xl text-sm font-black transition-all">
                          عرض الحالة
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                    <div className="text-4xl mb-4">✅</div>
                    <p className="text-slate-400 italic">لا توجد حالات تستوجب إحالة فورية حالياً</p>
                  </div>
                )}
              </div>
            )}

            {/* ──── تبويب التحليلات (Analytics) ──── */}
            {activeTab === 'analytics' && (
              <div className="py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-slate-900 border border-white/10 rounded-3xl p-6">
                    <h3 className="text-xl font-black text-white mb-4">توزيع التقييمات السريرية</h3>
                    <div className="space-y-4">
                      {[{ label: 'طبيعي (WNL)', count: stats.green, color: 'emerald' },
                        { label: 'متابعة (Borderline)', count: stats.yellow, color: 'amber' },
                        { label: 'إحالة (Deficit)', count: stats.red, color: 'rose' }].map(item => {
                        const percent = stats.total > 0 ? Math.round((item.count / stats.total) * 100) : 0;
                        return (
                          <div key={item.label} className="relative">
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                              <span>{item.label}</span>
                              <span className="font-bold text-white">{item.count} حالة ({percent}%)</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }}
                                className={`h-full bg-${item.color}-500`} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-white/10 rounded-3xl p-6">
                    <h3 className="text-xl font-black text-white mb-4">تغطية مجالات WISC-V</h3>
                    <div className="text-sm text-slate-400 mb-6 leading-relaxed">
                      يعتمد تحليل الذكاء العامل (WMI) على إتمام المقياسين التاليين. يرجى التأكد من استكمال الاختبارات للحالات قيد الدراسة.
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                        <span className="font-bold text-white text-sm">🔢 الذاكرة الأمامية/المعكوسة</span>
                        <span className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full">مكتمل لمعظم الحالات</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                        <span className="font-bold text-white text-sm">🔡 تسلسل الحروف والأرقام</span>
                        <span className="text-xs bg-rose-500/20 text-rose-400 px-3 py-1 rounded-full">مضاف حديثاً</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}


          </div>
        </div>

        {/* ── Footer ── */}
        <footer className="mt-12 text-center">
          <div className="inline-block bg-slate-900/50 border border-white/5 px-8 py-3 rounded-full">
            <p className="text-[9px] font-mono tracking-[0.4em] uppercase text-slate-500">
              Basira Global Sovereign Intelligence // v6.0.0 · Multi-Case Edition
            </p>
          </div>
        </footer>

      </div>

      {/* ── Import Modal ── */}
      <AnimatePresence>
        {showImport && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowImport(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="bg-slate-900 border border-white/20 rounded-[2.5rem] p-8 w-full max-w-md">
              <h2 className="text-xl font-black mb-6 text-white">إضافة الجلسة الحالية كحالة</h2>
              <div className="space-y-4">
                <input value={importName} onChange={e => setImportName(e.target.value)}
                  placeholder="اسم الطالب *"
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-violet-500 focus:outline-none" />
                <div className="flex gap-3">
                  <input value={importAge} onChange={e => setImportAge(e.target.value)}
                    placeholder="العمر" type="number"
                    className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none" />
                  <input value={importGrade} onChange={e => setImportGrade(e.target.value)}
                    placeholder="الصف"
                    className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowImport(false)}
                  className="flex-1 py-3 bg-slate-700 rounded-xl font-bold">إلغاء</button>
                <button onClick={handleImport} disabled={!importName.trim()}
                  className="flex-[2] py-3 bg-violet-600 hover:bg-violet-500 rounded-xl font-black disabled:opacity-40 transition-all">
                  حفظ الحالة ✓
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Set PIN Modal ── */}
      <AnimatePresence>
        {settingPin && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              className="bg-slate-900 border border-white/20 rounded-[2.5rem] p-8 w-full max-w-sm text-center">
              <h2 className="text-xl font-black mb-4 text-white">تعيين رمز PIN جديد</h2>
              <input type="password" inputMode="numeric" value={newPin} onChange={e => setNewPin(e.target.value)}
                placeholder="● ● ● ●" minLength={4}
                className="w-full text-center text-3xl font-mono bg-slate-800 border border-white/10 rounded-2xl px-4 py-4 mb-4 text-white focus:border-violet-500 focus:outline-none tracking-widest" />
              <div className="flex gap-3">
                <button onClick={() => setSettingPin(false)} className="flex-1 py-3 bg-slate-700 rounded-xl font-bold">إلغاء</button>
                <button onClick={handleSetPin} disabled={newPin.length < 4}
                  className="flex-[2] py-3 bg-violet-600 rounded-xl font-black disabled:opacity-40">حفظ</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}

// bypass helper (reset PIN by clearing storage)
function setClinicianPINSet_bypass() {
  localStorage.removeItem('basira_clinician_pin');
}
