/**
 * lib/pdfReport.ts — توليد تقرير PDF سريري لبصيرة Global
 * يستخدم: jsPDF + html2canvas
 * 
 * تحذير: هذا ملف client-only — يُستدعى فقط من مكونات 'use client'
 */

export interface PDFReportData {
  childName: string;
  childAge?: number | null;
  childGrade?: string;
  gender?: string;
  reportDate: string;
  referenceId: string;
  clinicName?: string;

  // النتائج
  domainScores: { id: string; title: string; score: number; status: string; icon: string }[];
  parentStats?: { label: string; val: number }[];
  teacherFormScore?: number | null;
  digitBackwardScore?: number | null;
  digitBackwardMaxSpan?: number | null;

  // التاريخ التطوري
  developmentalHistory?: Record<string, string>;

  // تقرير الذكاء الاصطناعي
  aiReport?: {
    diagnosisSummary?: string;
    strengths?: string[];
    challenges?: string[];
    treatmentPlan?: { phase: string; title: string; description: string }[];
    immediateNeeds?: string[];
  } | null;

  // تحذيرات
  professionalReviewRequired?: boolean;
}

export async function generateClinicalPDF(data: PDFReportData): Promise<void> {
  // Dynamic import — يتجنب SSR crash
  const { default: jsPDF } = await import('jspdf');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const H = 297;
  const margin = 20;
  let y = margin;

  // ── إعدادات اللغة العربية (LTR rendering مع نص rtl)
  // jsPDF لا يدعم RTL مباشرة — نستخدم النص كما هو ويُعرض بشكل جيد في معظم المتصفحات
  doc.setFont('helvetica');

  // ── Helper functions ──────────────────────────────────────────

  const newPage = () => {
    addFooter();
    doc.addPage();
    y = margin;
    addPageHeader();
  };

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > H - 30) newPage();
  };

  const addSection = (title: string, emoji: string = '') => {
    checkPageBreak(20);
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(margin, y, W - margin * 2, 10, 2, 2, 'F');
    doc.setTextColor(96, 165, 250);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`${emoji} ${title}`, margin + 4, y + 7);
    y += 14;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 200);
  };

  const addText = (text: string, fontSize = 10, color: [number, number, number] = [180, 180, 180]) => {
    doc.setFontSize(fontSize);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, W - margin * 2 - 4);
    checkPageBreak(lines.length * 6 + 2);
    doc.text(lines, margin + 4, y);
    y += lines.length * 6 + 2;
  };

  const addPageHeader = () => {
    // Header bar
    doc.setFillColor(2, 6, 23);
    doc.rect(0, 0, W, 18, 'F');
    doc.setFillColor(6, 182, 212);
    doc.rect(0, 0, 3, 18, 'F');
    doc.setTextColor(6, 182, 212);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Basira Global | Preliminary Screening Report', margin, 12);
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text(`REF: ${data.referenceId}`, W - margin, 12, { align: 'right' });
    y = 25;
  };

  const addFooter = () => {
    const pageNum = doc.getNumberOfPages();
    doc.setFillColor(2, 6, 23);
    doc.rect(0, H - 18, W, 18, 'F');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(
      'DISCLAIMER: This report is a PRELIMINARY DIGITAL SCREENING only. It does NOT constitute a clinical diagnosis. Refer to a licensed professional.',
      margin, H - 10, { maxWidth: W - margin * 2 }
    );
    doc.setTextColor(100, 116, 139);
    doc.text(`Page ${pageNum}`, W - margin, H - 10, { align: 'right' });
  };

  // ── صفحة 1: الغلاف ─────────────────────────────────────────────

  // خلفية داكنة
  doc.setFillColor(2, 6, 23);
  doc.rect(0, 0, W, H, 'F');

  // شريط الألوان
  doc.setFillColor(6, 182, 212);
  doc.rect(0, 0, W, 4, 'F');

  // عنوان
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('BASIRA GLOBAL', W / 2, 60, { align: 'center' });

  doc.setFontSize(14);
  doc.setTextColor(6, 182, 212);
  doc.text('Clinical Screening Report', W / 2, 72, { align: 'center' });
  doc.text('تقرير المسح السريري الأولي', W / 2, 82, { align: 'center' });

  // صندوق معلومات الطالب
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, 100, W - margin * 2, 60, 4, 4, 'F');
  doc.setDrawColor(30, 41, 59);
  doc.roundedRect(margin, 100, W - margin * 2, 60, 4, 4, 'S');

  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  const infoItems = [
    ['Student Name', data.childName],
    ['Age', data.childAge ? `${data.childAge} years` : 'N/A'],
    ['Grade', data.childGrade || 'N/A'],
    ['Report Date', data.reportDate],
    ['Clinic', data.clinicName || 'Basira Platform'],
    ['Reference No.', data.referenceId],
  ];

  infoItems.forEach(([label, val], i) => {
    const col = i % 2 === 0 ? margin + 6 : W / 2 + 4;
    const row = 110 + Math.floor(i / 2) * 14;
    doc.setTextColor(100, 116, 139);
    doc.text(`${label}:`, col, row);
    doc.setTextColor(226, 232, 240);
    doc.setFont('helvetica', 'bold');
    doc.text(val, col + 32, row);
    doc.setFont('helvetica', 'normal');
  });

  // تحذير مبدئي
  doc.setFillColor(180, 83, 9, 0.1);
  doc.roundedRect(margin, 175, W - margin * 2, 25, 3, 3, 'F');
  doc.setTextColor(251, 191, 36);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('⚠ IMPORTANT — FOR PROFESSIONAL USE ONLY', W / 2, 183, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.setFontSize(7.5);
  doc.text(
    'This is a PRELIMINARY DIGITAL SCREENING TOOL. Results are probabilistic indicators and must be interpreted by a qualified clinician.',
    W / 2, 191, { align: 'center', maxWidth: W - margin * 2 - 8 }
  );

  // شارات السريرية
  const badges = ['DSM-5-TR Aligned', 'WISC-V Proxy', 'CTOPP-2 Based', 'Conners-3 Adapted'];
  badges.forEach((b, i) => {
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(margin + i * 43, 215, 40, 8, 2, 2, 'F');
    doc.setTextColor(96, 165, 250);
    doc.setFontSize(6.5);
    doc.text(b, margin + i * 43 + 20, 220, { align: 'center' });
  });

  // ── صفحة 2: نتائج المجالات ──────────────────────────────────────

  doc.addPage();
  y = margin;
  addPageHeader();

  // صفحة 2 header
  doc.setFillColor(2, 6, 23);
  doc.rect(0, 0, W, H, 'F');

  addSection('DOMAIN PERFORMANCE SUMMARY | ملخص أداء المجالات', '📊');

  const scoredDomains = data.domainScores.filter(d => d.score > 0);

  if (scoredDomains.length > 0) {
    const colW = (W - margin * 2) / 2 - 3;
    scoredDomains.forEach((domain, i) => {
      const col = i % 2 === 0 ? margin : margin + colW + 6;
      if (i % 2 === 0) checkPageBreak(22);
      const rowY = y + Math.floor(0) * 0;

      const scoreColor: [number, number, number] =
        domain.score >= 85 ? [16, 185, 129] :
        domain.score >= 70 ? [245, 158, 11] :
        domain.score >= 50 ? [249, 115, 22] : [239, 68, 68];

      doc.setFillColor(15, 23, 42);
      doc.roundedRect(col, y - 4, colW, 18, 2, 2, 'F');

      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`${domain.icon} ${domain.title}`, col + 3, y + 3);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...scoreColor);
      doc.text(`${domain.score}%`, col + colW - 4, y + 3, { align: 'right' });

      // Progress bar
      doc.setFillColor(30, 41, 59);
      doc.roundedRect(col + 3, y + 6, colW - 6, 3, 1, 1, 'F');
      doc.setFillColor(...scoreColor);
      doc.roundedRect(col + 3, y + 6, (colW - 6) * (domain.score / 100), 3, 1, 1, 'F');

      doc.setFont('helvetica', 'normal');
      if (i % 2 === 1 || i === scoredDomains.length - 1) y += 22;
    });
  } else {
    addText('No domain scores recorded yet.', 9);
  }

  // ── صفحة 3: نتائج الذكاء الاصطناعي والتوصيات ──────────────────

  if (data.aiReport) {
    checkPageBreak(50);
    addSection('AI CLINICAL ANALYSIS | التحليل السريري', '🔬');

    if (data.aiReport.diagnosisSummary) {
      addText(data.aiReport.diagnosisSummary, 9, [203, 213, 225]);
      y += 4;
    }

    if (data.aiReport.strengths?.length) {
      checkPageBreak(20);
      addSection('STRENGTHS | نقاط القوة', '✨');
      data.aiReport.strengths.forEach(s => addText(`• ${s}`, 9, [52, 211, 153]));
      y += 4;
    }

    if (data.aiReport.challenges?.length) {
      checkPageBreak(20);
      addSection('CHALLENGES | التحديات', '⚠️');
      data.aiReport.challenges.forEach(c => addText(`• ${c}`, 9, [252, 165, 165]));
      y += 4;
    }

    if (data.aiReport.immediateNeeds?.length) {
      checkPageBreak(20);
      addSection('IMMEDIATE NEEDS | الاحتياجات الفورية', '🚨');
      data.aiReport.immediateNeeds.forEach(n => addText(`• ${n}`, 9, [253, 224, 71]));
      y += 4;
    }

    if (data.aiReport.treatmentPlan?.length) {
      checkPageBreak(20);
      addSection('TREATMENT ROADMAP | خارطة الطريق', '🚀');
      data.aiReport.treatmentPlan.forEach(plan => {
        checkPageBreak(20);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(129, 140, 248);
        doc.text(`[${plan.phase}] ${plan.title}`, margin + 4, y);
        y += 6;
        doc.setFont('helvetica', 'normal');
        addText(plan.description, 9, [148, 163, 184]);
        y += 2;
      });
    }
  }

  // ── نتائج الوالدين والمعلم ──────────────────────────────────────

  if (data.parentStats?.length) {
    checkPageBreak(40);
    addSection('PARENT OBSERVATION SUMMARY | ملاحظات الأهل', '👨‍👩‍👧');
    data.parentStats.forEach(p => {
      const barW = (W - margin * 2 - 50);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(p.label, margin + 4, y);
      doc.setFillColor(30, 41, 59);
      doc.roundedRect(margin + 52, y - 4, barW, 6, 1, 1, 'F');
      doc.setFillColor(6, 182, 212);
      doc.roundedRect(margin + 52, y - 4, barW * (p.val / 100), 6, 1, 1, 'F');
      doc.setTextColor(226, 232, 240);
      doc.setFont('helvetica', 'bold');
      doc.text(`${p.val}%`, margin + 52 + barW + 3, y);
      doc.setFont('helvetica', 'normal');
      y += 10;
    });
  }

  if (data.teacherFormScore !== null && data.teacherFormScore !== undefined) {
    checkPageBreak(15);
    addSection('TEACHER RATING | تقييم المعلم', '📋');
    addText(`Overall classroom concern score: ${data.teacherFormScore}%`, 9);
    y += 2;
  }

  // ── Digit Backward ──────────────────────────────────────────────

  if (data.digitBackwardScore !== null && data.digitBackwardScore !== undefined) {
    checkPageBreak(20);
    addSection('DIGIT SPAN BACKWARD (WISC-V WMI) | الذاكرة العاملة', '🧠');
    addText(`Raw accuracy score: ${data.digitBackwardScore}% | Max span recalled: ${data.digitBackwardMaxSpan ?? '?'} digits`, 9);
    addText('Reference: Average for age 8 = 4-5 digits backward (WISC-V Normative Data)', 8, [100, 116, 139]);
    y += 2;
  }

  // ── Professional Review Alert ───────────────────────────────────

  if (data.professionalReviewRequired) {
    checkPageBreak(30);
    doc.setFillColor(127, 29, 29);
    doc.roundedRect(margin, y, W - margin * 2, 25, 3, 3, 'F');
    doc.setTextColor(254, 202, 202);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('🩺 MANDATORY PROFESSIONAL REVIEW', W / 2, y + 8, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Results indicate concerns requiring immediate evaluation by a licensed child psychologist or specialist.', W / 2, y + 16, { align: 'center', maxWidth: W - margin * 2 - 10 });
    y += 30;
  }

  addFooter();

  // ── حفظ/تحميل ──────────────────────────────────────────────────

  const fileName = `Basira_Report_${data.childName.replace(/\s+/g, '_')}_${data.referenceId}.pdf`;
  doc.save(fileName);
}

/** توليد رقم مرجعي فريد للتقرير */
export function generateReportId(): string {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BSR-${date}-${rand}`;
}
