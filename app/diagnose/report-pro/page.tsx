'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  getStudentProfile, 
  getAllTestSessions, 
  getCaseStudy,
  generateClinicalSummary,
  ClinicalSummary,
  StudentProfile,
  CaseStudy
} from '@/lib/studentProfile';
import { useLanguage } from '@/app/components/LanguageContext';

export default function ProfessionalReport() {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null);
  const [summary, setSummary] = useState<ClinicalSummary | null>(null);
  const [specialistNotes, setSpecialistNotes] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    const p = getStudentProfile();
    const sessions = getAllTestSessions();
    const cs = getCaseStudy();
    
    setProfile(p);
    setCaseStudy(cs);
    setSummary(generateClinicalSummary(sessions));
    
    const savedNotes = localStorage.getItem('basira_specialist_notes');
    if (savedNotes) setSpecialistNotes(savedNotes);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleSaveNotes = (val: string) => {
    setSpecialistNotes(val);
    localStorage.setItem('basira_specialist_notes', val);
  };

  if (!profile) return <div className="p-20 text-center text-slate-500">جاري تحميل البيانات السريرية...</div>;

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 md:px-0 font-sans" dir="rtl">
      
      {/* Action Bar (Hidden on Print) */}
      <div className="max-w-5xl mx-auto mb-8 flex justify-between items-center print:hidden">
         <Link href="/clinician/dashboard" className="text-slate-600 hover:text-cyan-600 font-bold flex items-center gap-2 transition-colors">
            <span>◀</span> لوحة التحكم السريرية
         </Link>
         <div className="flex gap-4">
             <button 
               onClick={handlePrint}
               className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-black transition active:scale-95 flex items-center gap-2"
             >
               <span>🖨️</span> طباعة التقرير الطبي
             </button>
         </div>
      </div>

      {/* THE REPORT CONTAINER */}
      <div className="max-w-[210mm] mx-auto bg-white shadow-2xl p-12 md:p-16 border border-slate-200 relative overflow-hidden print:shadow-none print:border-none print:p-0">
         
         {/* Medical Header */}
         <div className="border-b-[6px] border-slate-900 pb-8 mb-10 flex justify-between items-start">
            <div className="text-right">
               <h1 className="text-4xl font-black text-slate-900 mb-2 italic">بصيرة // Basira</h1>
               <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Clinical Diagnostic & Sovereign Intelligence Report</p>
               <div className="mt-4 inline-block bg-blue-600 text-white px-4 py-1 text-[10px] font-black uppercase rounded">Confidential Medical Record</div>
            </div>
            <div className="text-left font-mono text-[9px] text-slate-400 leading-relaxed uppercase">
               REPORT_ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}<br/>
               TIMESTAMP: {new Date().toLocaleString('en-GB')}<br/>
               ENGINE: V2.5.0_PRO<br/>
               ENCRYPTION: AES-256-SHA
            </div>
         </div>

         {/* Section: Patient Demographics */}
         <section className="mb-12">
            <h2 className="text-sm font-black bg-slate-900 text-white px-4 py-2 rounded mb-6 flex justify-between items-center">
                <span>أولاً: بيانات الحالة (Patient Profile)</span>
                <span className="font-mono opacity-50 uppercase text-[9px]">Module_Demographics</span>
            </h2>
            <div className="grid grid-cols-3 gap-6">
               <div className="border-r border-slate-100 pr-4">
                  <label className="text-[9px] text-slate-400 block uppercase font-black mb-1">الاسم الكامل</label>
                  <div className="font-black text-lg text-slate-900">{profile.name}</div>
               </div>
               <div className="border-r border-slate-100 pr-4">
                  <label className="text-[9px] text-slate-400 block uppercase font-black mb-1">العمر / الجنس</label>
                  <div className="font-bold text-lg text-slate-800">{profile.age || '—'} سنة / {profile.gender === 'male' ? 'ذكر' : profile.gender === 'female' ? 'أنثى' : 'غير محدد'}</div>
               </div>
               <div className="pr-4">
                  <label className="text-[9px] text-slate-400 block uppercase font-black mb-1">المرحلة الدراسية</label>
                  <div className="font-bold text-lg text-slate-800">{profile.grade || '—'}</div>
               </div>
            </div>
         </section>

         {/* Section: Clinical Case Study (Anamnesis) */}
         {caseStudy && (
            <section className="mb-12">
               <h2 className="text-sm font-black bg-slate-100 text-slate-900 px-4 py-2 rounded mb-6 flex justify-between items-center border-r-[4px] border-slate-900">
                   <span>ثانياً: التاريخ الطبي والنمائي (Anamnesis)</span>
                   <span className="font-mono opacity-50 uppercase text-[9px]">Module_History</span>
               </h2>
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <label className="text-[9px] text-slate-400 block uppercase font-black mb-2 italic">الخلفية الطبية المبكرة</label>
                        <ul className="text-xs space-y-1 font-bold text-slate-700">
                           <li className="flex justify-between"><span>مضاعفات حمل:</span> <span>{caseStudy.medicalHistory.pregnancyComplications === 'yes' ? 'نعم ⚠️' : 'لا'}</span></li>
                           <li className="flex justify-between"><span>نقص أكسجين:</span> <span>{caseStudy.medicalHistory.oxygenDeprivation === 'yes' ? 'نعم ⚠️' : 'لا'}</span></li>
                           <li className="flex justify-between"><span>خدج (Premature):</span> <span>{caseStudy.medicalHistory.prematureBirth === 'yes' ? 'نعم ⚠️' : 'لا'}</span></li>
                        </ul>
                     </div>
                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <label className="text-[9px] text-slate-400 block uppercase font-black mb-2 italic">التاريخ الوراثي</label>
                        <ul className="text-xs space-y-1 font-bold text-slate-700">
                           <li className="flex justify-between"><span>صعوبات تعلم عائلية:</span> <span>{caseStudy.familyBackground.historyLearningDisabilities === 'yes' ? 'نعم ⚠️' : 'لا'}</span></li>
                           <li className="flex justify-between"><span>ADHD عائلي:</span> <span>{caseStudy.familyBackground.historyAdhd === 'yes' ? 'نعم' : 'لا'}</span></li>
                        </ul>
                     </div>
                  </div>
                  <div className="space-y-4">
                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <label className="text-[9px] text-slate-400 block uppercase font-black mb-2 italic">المعالم النمائية</label>
                        <ul className="text-xs space-y-1 font-bold text-slate-700">
                           <li className="flex justify-between"><span>بدء الكلام:</span> <span>{caseStudy.developmentalHistory.firstWordAge || '—'} شهر</span></li>
                           <li className="flex justify-between"><span>بدء المشي:</span> <span>{caseStudy.developmentalHistory.walkingAge || '—'} شهر</span></li>
                           <li className="flex justify-between"><span>توازن حركي:</span> <span>{caseStudy.developmentalHistory.balanceIssues === 'yes' ? 'ضعيف' : 'طبيعي'}</span></li>
                        </ul>
                     </div>
                     <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                        <label className="text-[9px] text-blue-400 block uppercase font-black mb-2 italic">الشكوى الأكاديمية الرئيسية</label>
                        <p className="text-xs font-black text-blue-900 leading-relaxed italic">
                           "{caseStudy.academicHistory.hardestSubject ? `يعاني بشكل أساسي في ${caseStudy.academicHistory.hardestSubject}.` : 'لا توجد شكوى محددة.'} 
                           {caseStudy.finalQuestion.top3Challenges.length > 0 && ` أهم التحديات: ${caseStudy.finalQuestion.top3Challenges.join('، ')}.`}"
                        </p>
                     </div>
                  </div>
               </div>
            </section>
         )}

         {/* Section: Performance Quantitative */}
         <section className="mb-12 page-break-before">
            <h2 className="text-sm font-black bg-slate-900 text-white px-4 py-2 rounded mb-8 flex justify-between items-center">
                <span>ثالثاً: التحليل الرقمي للأداء (Quantitative Metrics)</span>
                <span className="font-mono opacity-50 uppercase text-[9px]">Module_Psychometrics</span>
            </h2>
            
            <div className="space-y-10 px-4">
               {summary && Object.entries(summary.domainScores).map(([domain, score]) => {
                  const ss = summary.domainStandardScores?.[domain];
                  const classification = !ss ? null : 
                    ss >= 130 ? 'باهر (Superior)' :
                    ss >= 115 ? 'فوق المتوسط (High Average)' :
                    ss >= 85  ? 'متوسط (Average)' :
                    ss >= 70  ? 'أقل من المتوسط (Low Average)' : 'ضعيف جداً (Extremely Low)';
                    
                  return (
                    <div key={domain} className="relative">
                       <div className="flex justify-between items-end mb-3">
                          <div className="flex flex-col">
                              <span className="font-black text-slate-900 text-[14px] uppercase tracking-wide flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                                  {t(`cat_${domain}` as any) || t(domain as any) || domain}
                              </span>
                              {classification && (
                                <span className="text-[10px] font-bold text-slate-500 mt-1 pr-3 italic">
                                  التصنيف السريري: {classification}
                                </span>
                              )}
                          </div>
                          <div className="text-right">
                             {ss ? (
                               <div className="flex flex-col items-end">
                                  <span className="font-mono text-2xl font-black text-blue-700">SS: {ss}</span>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Normal Mean: 100 (SD 15)</span>
                               </div>
                             ) : (
                               <span className="font-black text-lg text-slate-400">{score}%</span>
                             )}
                          </div>
                       </div>
                       
                       {/* Standard Score Gauge */}
                       <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                          {/* Normal Range Shading (85-115) */}
                          <div className="absolute inset-y-0 left-[40%] right-[40%] bg-blue-500/5 border-x border-blue-500/10" />
                          
                          {/* The Data Bar */}
                          <motion.div 
                             initial={{ width: 0 }} 
                             animate={{ width: ss ? `${(ss / 150) * 100}%` : `${score}%` }} 
                             transition={{ duration: 1.5, ease: "easeOut" }}
                             className={`h-full rounded-full shadow-[0_0_10px_rgba(37,99,235,0.2)] ${
                               ss ? (ss >= 115 ? 'bg-gradient-to-r from-blue-500 to-cyan-400' : ss >= 85 ? 'bg-blue-500' : 'bg-rose-500') :
                               (score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-rose-500')
                             }`}
                          />
                          
                          {/* Mean Line (100) */}
                          <div className="absolute top-0 bottom-0 left-[66.6%] w-0.5 bg-slate-400/30 z-10" />
                       </div>
                    </div>
                  );
               })}
            </div>
         </section>

         {/* Section: AI Clinical Findings */}
         <section className="mb-12">
            <h2 className="text-sm font-black bg-slate-100 text-slate-900 px-4 py-2 rounded mb-6 flex justify-between items-center border-r-[4px] border-slate-900">
                <span>رابعاً: الاستنتاجات السريرية الرقمية (Clinical Findings)</span>
                <span className="font-mono opacity-50 uppercase text-[9px]">Module_AI_Diagnosis</span>
            </h2>
            
            <div className="grid grid-cols-1 gap-3">
                {summary?.findings.map((f, i) => (
                    <div key={i} className="flex gap-4 items-start bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <span className="text-blue-600 font-bold mt-0.5">●</span>
                        <p className="text-slate-800 font-bold text-xs leading-relaxed">{f}</p>
                    </div>
                ))}
                {summary?.findings.length === 0 && <p className="text-center text-slate-400 italic py-4">لم يتم رصد مؤشرات سلبية واضحة.</p>}
            </div>
         </section>

         {/* Section: Recommendations */}
         <section className="mb-12">
            <h2 className="text-sm font-black bg-slate-900 text-white px-4 py-2 rounded mb-6 flex justify-between items-center">
                <span>خامساً: خطة التدخل المقترحة (Intervention Strategy)</span>
                <span className="font-mono opacity-50 uppercase text-[9px]">Module_Recommendations</span>
            </h2>
            
            <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200">
               <ul className="grid grid-cols-2 gap-4">
                  {summary?.recommendations.map((r, i) => (
                     <li key={i} className="flex gap-3 items-center text-slate-900 font-black text-[11px] bg-white p-3 rounded-lg shadow-sm border border-slate-100">
                        <span className="w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[9px]">✓</span>
                        {r}
                     </li>
                  ))}
               </ul>
            </div>
         </section>

         {/* Section: Specialist Clinical Analysis (Manual Input) */}
         <section className="mb-12 print:mt-12">
            <h2 className="text-sm font-black bg-slate-100 text-slate-900 px-4 py-2 rounded mb-6 flex justify-between items-center border-r-[4px] border-blue-600">
                <span>سادساً: التحليل السريري المعتمد (Specialist Analysis)</span>
                <span className="font-mono opacity-50 uppercase text-[9px]">Module_Expert_Opinion</span>
            </h2>
            
            <div className="relative group">
                <textarea 
                    value={specialistNotes}
                    onChange={(e) => handleSaveNotes(e.target.value)}
                    placeholder="قم بإضافة التشخيص النهائي، الملاحظات الإكلينيكية، أو التوصيات الخاصة هنا..."
                    className="w-full min-h-[180px] p-6 bg-slate-50/50 border-2 border-slate-100 rounded-2xl text-xs font-bold leading-relaxed focus:bg-white focus:border-blue-200 focus:outline-none transition-all resize-none print:border-none print:px-0 print:bg-transparent"
                />
                <div className="absolute bottom-4 left-4 text-[8px] font-mono text-slate-400 uppercase tracking-widest print:hidden">Clinician input active</div>
            </div>
         </section>

         {/* Disclaimer & Signatures */}
         <footer className="mt-20 pt-10 border-t-2 border-slate-900">
            <div className="flex justify-between items-end">
                <div className="max-w-md">
                    <p className="text-[10px] font-black text-slate-900 mb-2 uppercase">Disclaimer / إخلاء مسؤولية</p>
                    <p className="text-[9px] text-slate-500 leading-relaxed font-medium">
                        هذا التقرير تم توليده آلياً بناءً على استجابات الطالب وتحليل المؤشرات الحيوية عبر نظام "بصيرة". 
                        يُعتبر هذا التقرير أداة مساعدة للتشخيص الأولي ولا يغني عن التقييم السريري الشامل من قبل أخصائي معتمد في حالات التشخيص الطبي النهائي.
                    </p>
                </div>
                <div className="text-left">
                   <div className="mb-8 ml-8">
                       <div className="h-16 w-48 border-b-2 border-slate-300 relative">
                           <span className="absolute bottom-2 left-0 text-[10px] text-slate-300 font-mono italic">Electronic Signature Block</span>
                       </div>
                       <p className="text-[10px] font-black text-slate-900 mt-2">Certified Specialist Signature</p>
                   </div>
                   <div className="text-[9px] font-mono text-slate-400 uppercase tracking-[0.4em]">VERIFIED_REPORT_0x77A23BB91</div>
                </div>
            </div>
         </footer>

      </div>

      <style jsx global>{`
        @media print {
          body { background: white !important; margin: 0 !important; padding: 0 !important; }
          .print-hidden { display: none !important; }
          .page-break-before { page-break-before: always; }
          @page { size: A4; margin: 0; }
        }
      `}</style>

    </main>
  );
}

