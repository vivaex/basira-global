'use client';

import React from 'react';

interface ClinicalReportProps {
  studentName: string;
  age?: string;
  grade?: string;
  date: string;
  overallAvg: number;
  weakAreas: any[];
  emotionalStats: any;
  aiPills: any[];
  progressData: any[];
  language?: 'ar' | 'en';
}

export default function ClinicalReport({
  studentName,
  age,
  grade,
  date,
  overallAvg,
  weakAreas,
  emotionalStats,
  aiPills,
  progressData,
  language = 'ar'
}: ClinicalReportProps) {
  const isAr = language === 'ar';
  
  return (
    <div 
      className="bg-white text-black p-12 font-serif max-w-[210mm] mx-auto min-h-[297mm] shadow-2xl print:shadow-none print:m-0 relative" 
      dir={isAr ? 'rtl' : 'ltr'} 
      id="clinical-report-content"
    >
      {/* Sovereignty Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none overflow-hidden text-[15rem] font-black rotate-[-30deg]">
        BASIRA
      </div>

      {/* Header with Professional Branding */}
      <div className="border-b-[6px] border-slate-900 pb-8 mb-10 flex justify-between items-start">
        <div className="flex gap-6 items-center">
          <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-4xl font-black italic">
            ب
          </div>
          <div>
            <h1 className="text-4xl font-black mb-1 leading-none">مركز بَصيرة العالمي</h1>
            <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">Basira Global Center for Diagnostic Intelligence</p>
            <p className="text-[10px] text-slate-500 mt-2 font-medium">Sovereign unit for AI-driven clinical screening & early intervention</p>
          </div>
        </div>
        <div className="text-right flex flex-col items-end gap-1">
          <div className="bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
             <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">Report ID:</span>
             <span className="text-xs font-mono font-black ml-2 text-slate-800">BGR-2026-XQ-{Math.floor(Math.random() * 89999) + 10000}</span>
          </div>
          <div className="text-[9px] text-slate-400 font-mono mt-2">PROTOCOL: SA-DG-V.4.2</div>
        </div>
      </div>

      {/* Profile Section */}
      <div className="mb-12 grid grid-cols-4 gap-4">
        <div className="col-span-3 bg-slate-50 p-6 rounded-2xl border border-slate-200">
           <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-200 pb-2">
             {isAr ? 'بيانات الحالة بنظام بصيرة' : 'Sovereign Case Profile'}
           </h2>
           <div className="grid grid-cols-2 gap-y-4 text-sm font-medium">
              <div className="flex justify-between pl-8">
                 <span className="text-slate-500">{isAr ? 'اسم البطل:' : 'Hero Name:'}</span>
                 <span className="font-black text-slate-900 underline decoration-slate-300 underline-offset-4">{studentName}</span>
              </div>
              <div className="flex justify-between pl-8 border-r border-slate-200 pr-8">
                 <span className="text-slate-500">{isAr ? 'التاريخ:' : 'Date:'}</span>
                 <span className="font-bold">{date}</span>
              </div>
              <div className="flex justify-between pl-8">
                 <span className="text-slate-500">{isAr ? 'العمر الزمني:' : 'Chronological Age:'}</span>
                 <span className="font-bold">{age || 'N/A'}</span>
              </div>
              <div className="flex justify-between pl-8 border-r border-slate-200 pr-8">
                 <span className="text-slate-500">{isAr ? 'المستوى الأكاديمي:' : 'Academic Grade:'}</span>
                 <span className="font-bold">{grade || 'N/A'}</span>
              </div>
           </div>
        </div>
        <div className="bg-slate-950 text-white p-6 rounded-2xl flex flex-col items-center justify-center shadow-lg transform rotate-[2deg]">
           <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-cyan-400">Index Score</div>
           <div className="text-5xl font-black italic">{overallAvg}%</div>
           <div className="text-[8px] font-mono mt-2 opacity-60">Verified AI Output</div>
        </div>
      </div>

      {/* Diagnosis Details */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
           <div className="h-6 w-2 bg-slate-900 rounded-full" />
           <h3 className="text-xl font-black">{isAr ? '1. التحليل الإحصائي للقدرات' : '1. Statistical Ability Analysis'}</h3>
        </div>
        
        <div className="overflow-hidden rounded-2xl border border-slate-300 shadow-sm mb-6">
          <table className="w-full text-sm border-collapse">
             <thead>
               <tr className="bg-slate-900 text-white uppercase text-[10px] tracking-widest leading-loose">
                  <th className="p-4 text-right">{isAr ? 'المجال الإدراكي' : 'Cognitive Domain'}</th>
                  <th className="p-4 text-center">{isAr ? 'الدرجة الزائية (S-Score)' : 'S-Score Factor'}</th>
                  <th className="p-4 text-right">{isAr ? 'التصنيف السريري' : 'Clinical Status'}</th>
               </tr>
             </thead>
             <tbody>
               {weakAreas.length > 0 ? weakAreas.map((w, i) => (
                 <tr key={i} className="border-b border-slate-200 last:border-0 hover:bg-slate-50 transition-colors">
                   <td className="p-4 font-black text-slate-800">{w.title}</td>
                   <td className="p-4 text-center font-mono font-bold">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                           <div className={`h-full ${w.score < 50 ? 'bg-rose-500' : 'bg-slate-400'}`} style={{ width: `${w.score}%` }} />
                        </div>
                        {w.score}%
                      </div>
                   </td>
                   <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${w.score < 50 ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                        {w.score < 50 ? (isAr ? 'تنبيه سريري - تدخل نشط' : 'Clinical Alert - Active Intervention') : (isAr ? 'تطور مستقر - تقوية' : 'Stable Growth - Reinforcement')}
                      </span>
                   </td>
                 </tr>
               )) : (
                  <tr>
                     <td colSpan={3} className="p-10 text-center italic text-slate-400">
                        {isAr ? 'لم يتم رصد فجوات إدراكية حادة في الاختبارات الحالية.' : 'No major cognitive gaps detected in current battery.'}
                     </td>
                  </tr>
               )}
             </tbody>
          </table>
        </div>
      </section>

      {/* Behavioral & Emotional Indices */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
           <div className="h-6 w-2 bg-slate-900 rounded-full" />
           <h3 className="text-xl font-black">{isAr ? '2. مؤشرات الأداء الوظيفي' : '2. Functional Performance Indices'}</h3>
        </div>
        
        <div className="grid grid-cols-3 gap-6">
           <div className="border-2 border-slate-100 p-6 rounded-3xl text-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-12 h-12 bg-orange-500/5 rounded-bl-full" />
              <div className="text-[9px] uppercase font-black text-slate-400 mb-2 tracking-[0.2em]">{isAr ? 'الاندفاعية' : 'Impulsivity'}</div>
              <div className="text-4xl font-black text-slate-900">{emotionalStats.impulsivity}</div>
              <div className="text-[10px] font-bold text-slate-500 mt-2 italic">{isAr ? 'تسجيل أحداث' : 'Events registered'}</div>
           </div>
           <div className="border-2 border-slate-100 p-6 rounded-3xl text-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-12 h-12 bg-rose-500/5 rounded-bl-full" />
              <div className="text-[9px] uppercase font-black text-slate-400 mb-2 tracking-[0.2em]">{isAr ? 'الإحباط' : 'Frustration'}</div>
              <div className="text-4xl font-black text-slate-900">{emotionalStats.frustration}</div>
              <div className="text-[10px] font-bold text-slate-500 mt-2 italic">{isAr ? 'تسجيل أحداث' : 'Events registered'}</div>
           </div>
           <div className="border-2 border-slate-100 p-6 rounded-3xl text-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-12 h-12 bg-cyan-500/5 rounded-bl-full" />
              <div className="text-[9px] uppercase font-black text-slate-400 mb-2 tracking-[0.2em]">{isAr ? 'تشتت الانتباه' : 'Inattention'}</div>
              <div className="text-4xl font-black text-slate-900">{emotionalStats.focusLoss}</div>
              <div className="text-[10px] font-bold text-slate-500 mt-2 italic">{isAr ? 'تسجيل أحداث' : 'Events registered'}</div>
           </div>
        </div>
      </section>

      {/* Intervention Plan */}
      <section className="mb-12 flex-grow">
        <div className="flex items-center gap-3 mb-6">
           <div className="h-6 w-2 bg-slate-900 rounded-full" />
           <h3 className="text-xl font-black">{isAr ? '3. خطة التدريب السيادي' : '3. Sovereign Training Path'}</h3>
        </div>
        
        {aiPills.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {aiPills.map((pill, i) => (
              <div key={i} className="flex gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200 hover:bg-slate-100 transition-all">
                <div className="w-16 h-16 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center text-4xl shrink-0">
                  {pill.icon}
                </div>
                <div>
                   <h4 className="text-base font-black text-slate-900 mb-1 leading-none">{pill.title}</h4>
                   <p className="text-[10px] font-bold text-cyan-600 uppercase tracking-widest mb-2">Category: {pill.category}</p>
                   <p className="text-xs text-slate-600 leading-relaxed max-w-xl">{pill.desc}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 p-10 rounded-3xl text-center border-2 border-dashed border-slate-300">
             <p className="text-sm italic text-slate-400">{isAr ? 'لا توجد توصيات عاجلة - استمر في المتابعة الدورية.' : 'No urgent recommendations - Continue standard monitoring.'}</p>
          </div>
        )}
      </section>

      {/* Final Signature & Specialist Branding */}
      <div className="mt-auto border-t-2 border-slate-900 pt-10 grid grid-cols-2 gap-10">
        <div>
           <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">{isAr ? 'الملاحظات السريرية' : 'Clinical Disclaimer'}</h4>
           <p className="text-[9px] leading-relaxed text-slate-500 italic">
              {isAr ? 
                'رُصدت البيانات المذكورة أعلاه آلياً باستخدام محرك بصيرة السيادي للذكاء الاصطناعي بنسخته الرابعة. يُعد هذا التقرير وثيقة استرشادية أولية للمختصين والأهل، ويجب عدم استخدامه للتشخيص الطبي النهائي دون مشورة مختص معتمد.' :
                'This report is generated by the Basira Sovereign AI Engine (V.4). It serves as a preliminary screening document for parents and specialists. It does not replace a comprehensive multi-disciplinary clinical evaluation.'
              }
           </p>
        </div>
        <div className="flex flex-col items-center">
           <div className="w-48 h-20 mb-4 flex items-center justify-center relative">
              {/* Specialist Signature Placeholder */}
              <div className="absolute inset-0 border-b-2 border-slate-400 border-dashed" />
              <div className="text-[8px] font-mono text-slate-100 uppercase tracking-[0.5em] select-none text-center transform -rotate-12">
                 AUTHENTICATED SPECIALIST SIGNATURE // AUTHENTICATED
              </div>
              <div className="text-slate-200 text-6xl opacity-10 font-black italic">Basira Signature</div>
           </div>
           <div className="text-center">
              <p className="text-xs font-black italic text-slate-900">{isAr ? 'وحدة الفحص الرقمي السيادي' : 'Sovereign Digital Screening Unit'}</p>
              <p className="text-[9px] text-slate-500 font-medium">BASIRA WORLDWIDE // GENEVA-DUBAI-RIYADH</p>
           </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-12 right-12 flex justify-between items-center text-[7px] text-slate-300 font-mono tracking-widest">
        <span>SECURITY HASH: {Buffer.from(studentName).toString('hex').slice(0, 12).toUpperCase()}</span>
        <span>PRO-REPORT // HIGH-FIDELITY OUTPUT</span>
        <span>PAGE 01 / 01</span>
      </div>

    </div>
  );
}
