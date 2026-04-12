'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { generateClinicalPDF, generateReportId, PDFReportData } from '@/lib/pdfReport';

interface PDFReportButtonProps {
  data: Omit<PDFReportData, 'reportDate' | 'referenceId'>;
  className?: string;
}

export default function PDFReportButton({ data, className = '' }: PDFReportButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const handleExport = async () => {
    setStatus('loading');
    try {
      const fullData: PDFReportData = {
        ...data,
        reportDate: new Date().toLocaleDateString('ar-SA', {
          year: 'numeric', month: 'long', day: 'numeric'
        }),
        referenceId: generateReportId(),
      };
      await generateClinicalPDF(fullData);
      setStatus('done');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      console.error('PDF generation failed:', err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <motion.button
      id="pdf-export-btn"
      onClick={handleExport}
      disabled={status === 'loading'}
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: status === 'idle' ? 1.02 : 1 }}
      className={`relative flex items-center justify-center gap-3 px-8 py-5 rounded-[2rem] font-black text-xl transition-all overflow-hidden ${
        status === 'loading' ? 'bg-slate-700 cursor-not-allowed' :
        status === 'done'    ? 'bg-emerald-600 shadow-[0_0_30px_rgba(16,185,129,0.5)]' :
        status === 'error'   ? 'bg-rose-700' :
        'bg-gradient-to-r from-rose-600 to-orange-600 shadow-[0_0_30px_rgba(239,68,68,0.4)] hover:shadow-[0_0_50px_rgba(239,68,68,0.6)]'
      } ${className}`}
    >
      {/* shimmer effect on idle */}
      {status === 'idle' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: [-300, 300] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
        />
      )}

      <span className="text-2xl">
        {status === 'loading' ? '⏳' :
         status === 'done'    ? '✅' :
         status === 'error'   ? '❌' : '📄'}
      </span>

      <span className="relative z-10">
        {status === 'loading' ? 'جاري توليد التقرير...' :
         status === 'done'    ? 'تم! تحقق من مجلد التنزيلات' :
         status === 'error'   ? 'حدث خطأ — حاول مرة أخرى' :
         'تصدير التقرير السريري PDF'}
      </span>

      {status === 'idle' && (
        <span className="text-sm opacity-70 font-normal">للطبيب / للمعلم</span>
      )}

      {status === 'loading' && (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      )}
    </motion.button>
  );
}
