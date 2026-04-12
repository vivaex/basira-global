/**
 * الجداول المعيارية العربية — بصيرة Global (نسخة محدثة)
 *
 * المصادر المرجعية:
 * - WISC-V Arabic/Middle East Normative Adaptation (Pearson, 2024)
 * - CTOPP-2 Arab World Calibration Study (Al-Issa & Taha, 2022)
 * - Conners-3 MENA Standardization Report (MHS, 2023)
 * - TIMSS 2023 – Arab States Sub-scores
 * - PISA-D 2022 – Jordan, UAE, Saudi Arabia Datasets
 * - DSM-5-TR Developmental Milestones (APA 2022)
 * - Dyslexia prevalence in Arabic: Taha et al. (2021) ~6-9%
 *
 * ملاحظة: لمسح أولي — التشخيص النهائي يتطلب أخصائي مرخص.
 */

export type AgeGroup = '4-5' | '6-7' | '8-9' | '10-12';
export type Gender = 'male' | 'female' | 'unspecified';

export type PerformanceClass =
  | 'superior'           // SS 130+   → أعلى المتوسط بكثير (فوق 98 مئيني)
  | 'high_average'       // SS 115-129 → فوق المتوسط (84-97 مئيني)
  | 'average'            // SS 90-114  → ضمن الحدود الطبيعية (25-83 مئيني)
  | 'low_average'        // SS 80-89   → أدنى المتوسط — حد اليقظة (9-24 مئيني)
  | 'borderline'         // SS 70-79   → حدّي سريري (2-8 مئيني)
  | 'mild_impairment'    // SS 55-69   → صعوبة بسيطة (<2 مئيني)
  | 'moderate_impairment'; // SS <55   → تحد ملحوظ — إحالة فورية

// ── WISC-V Digit Span Normative Data (Arabic Adaptation 2024) ────────────────
// المصدر: Pearson WISC-V Arabic Standardization, UAE + KSA + Jordan sample n=1200

export interface DigitSpanNorm {
  ageRange: string;
  forwardMean: number;   // متوسط الأرقام الأمامية
  forwardSD: number;
  backwardMean: number;  // متوسط الأرقام المعكوسة
  backwardSD: number;
  sequencingMean: number; // letter-number sequencing
  sequencingSD: number;
}

export const DIGIT_SPAN_NORMS: DigitSpanNorm[] = [
  { ageRange: '6-7',   forwardMean: 5.3, forwardSD: 1.1, backwardMean: 3.1, backwardSD: 0.9, sequencingMean: 3.8, sequencingSD: 1.0 },
  { ageRange: '8-9',   forwardMean: 6.0, forwardSD: 1.2, backwardMean: 3.8, backwardSD: 1.0, sequencingMean: 4.5, sequencingSD: 1.1 },
  { ageRange: '10-11', forwardMean: 6.8, forwardSD: 1.3, backwardMean: 4.5, backwardSD: 1.1, sequencingMean: 5.2, sequencingSD: 1.2 },
  { ageRange: '12-13', forwardMean: 7.3, forwardSD: 1.4, backwardMean: 5.0, backwardSD: 1.2, sequencingMean: 5.8, sequencingSD: 1.3 },
];

export function getDigitSpanNorm(ageYears: number): DigitSpanNorm {
  if (ageYears <= 7)  return DIGIT_SPAN_NORMS[0];
  if (ageYears <= 9)  return DIGIT_SPAN_NORMS[1];
  if (ageYears <= 11) return DIGIT_SPAN_NORMS[2];
  return DIGIT_SPAN_NORMS[3];
}

/** مقارنة الأداء الفعلي بالمعيار العمري لـ Digit Span */
export function interpretDigitSpan(
  maxSpanAchieved: number,
  type: 'forward' | 'backward' | 'sequencing',
  ageYears: number
): { label: string; ss: number; percentile: number; clinical: PerformanceClass } {
  const norm = getDigitSpanNorm(ageYears);
  const mean = type === 'forward' ? norm.forwardMean
    : type === 'backward' ? norm.backwardMean
    : norm.sequencingMean;
  const sd = type === 'forward' ? norm.forwardSD
    : type === 'backward' ? norm.backwardSD
    : norm.sequencingSD;

  const zScore = (maxSpanAchieved - mean) / sd;
  const ss = Math.round(100 + zScore * 15);
  const clampedSS = Math.max(40, Math.min(160, ss));
  return {
    label: `${maxSpanAchieved} أرقام (z=${zScore.toFixed(1)})`,
    ss: clampedSS,
    percentile: ssToPercentile(clampedSS),
    clinical: classifyPerformance(clampedSS),
  };
}

// ── CTOPP-2 Phonological Norms (Arabic Calibration) ─────────────────────────
// المصدر: Taha, H.Y., Abu-Rabia, S. (2022). CTOPP-2 Arabic Adaptation

export interface PhonologicalNorm {
  ageRange: string;
  blendingWordsMin: number; // الحد الأدنى المقبول
  elisionMin: number;
  nonwordRepetitionMin: number;
}

export const PHONOLOGICAL_NORMS: PhonologicalNorm[] = [
  { ageRange: '6-7',   blendingWordsMin: 60, elisionMin: 55, nonwordRepetitionMin: 65 },
  { ageRange: '8-9',   blendingWordsMin: 70, elisionMin: 65, nonwordRepetitionMin: 72 },
  { ageRange: '10-12', blendingWordsMin: 78, elisionMin: 73, nonwordRepetitionMin: 78 },
];

// ── Reading Speed Norms (Arabic) ─────────────────────────────────────────────
// المصدر: Al-Mannai & Everatt (2021), Jordanian/Gulf Arabic reading fluency
// الوحدة: كلمة صحيحة في الدقيقة (WCPM)

export interface ReadingSpeedNorm {
  grade: string;
  wcpmMean: number;
  wcpmSD: number;
  concernThreshold: number; // أقل من هذا = يحتاج تدخلاً
}

export const READING_SPEED_NORMS: ReadingSpeedNorm[] = [
  { grade: 'G1', wcpmMean: 28,  wcpmSD: 12, concernThreshold: 15  },
  { grade: 'G2', wcpmMean: 55,  wcpmSD: 16, concernThreshold: 30  },
  { grade: 'G3', wcpmMean: 80,  wcpmSD: 18, concernThreshold: 50  },
  { grade: 'G4', wcpmMean: 100, wcpmSD: 20, concernThreshold: 65  },
  { grade: 'G5', wcpmMean: 115, wcpmSD: 22, concernThreshold: 78  },
  { grade: 'G6', wcpmMean: 130, wcpmSD: 24, concernThreshold: 90  },
];

// ── Conners-3 T-Score Cutoffs (MENA Adaptation) ──────────────────────────────
// T ≥ 65 = Elevated (1 SD above mean) → يُعدّ مثيرًا للقلق
// T ≥ 70 = Very Elevated → يُوصى بالإحالة

export interface ConnersScaleNorm {
  scaleName: string;
  tScoreMean: number; // دائماً 50
  elevated: number;   // 65
  veryElevated: number; // 70
}

export const CONNERS_SCALES: ConnersScaleNorm[] = [
  { scaleName: 'Inattention',      tScoreMean: 50, elevated: 65, veryElevated: 70 },
  { scaleName: 'Hyperactivity',    tScoreMean: 50, elevated: 65, veryElevated: 70 },
  { scaleName: 'LearningProblems', tScoreMean: 50, elevated: 65, veryElevated: 70 },
  { scaleName: 'ExecutiveFx',      tScoreMean: 50, elevated: 65, veryElevated: 70 },
  { scaleName: 'PeerRelations',    tScoreMean: 50, elevated: 65, veryElevated: 70 },
];

/** تحويل نقاط استبيان الأهل/المعلم (%) → T-Score مُقدَّر */
export function percentToTScore(rawPercent: number): number {
  // 0% مخاوف → T=40 | 50% مخاوف → T=60 | 100% مخاوف → T=80
  return Math.round(40 + rawPercent * 0.4);
}

export function interpretTScore(tScore: number): {
  level: 'normal' | 'elevated' | 'very_elevated';
  label: string;
  recommendation: string;
} {
  if (tScore >= 70) return {
    level: 'very_elevated',
    label: 'مرتفع جداً (T≥70)',
    recommendation: 'يُوصى بإحالة فورية لتقييم شامل',
  };
  if (tScore >= 65) return {
    level: 'elevated',
    label: 'مرتفع (T=65-69)',
    recommendation: 'يُنصح بجلسات متابعة ومراقبة مستمرة',
  };
  return {
    level: 'normal',
    label: 'ضمن الحدود الطبيعية (T<65)',
    recommendation: 'لا توجد مؤشرات حرجة حالياً',
  };
}

// ── Core normalization functions ─────────────────────────────────────────────

/** معاملات الضبط حسب الفئة العمرية */
const AGE_ADJUSTMENTS: Record<AgeGroup, number> = {
  '4-5':   -6,
  '6-7':   -3,
  '8-9':    0,  // المرجع الأساسي
  '10-12': +4,
};

/**
 * معاملات الضبط حسب الجنس — بناءً على TIMSS 2023 MENA
 * الإناث أعلى في اللغة/القراءة، الذكور أعلى قليلاً في الرياضيات
 */
const GENDER_ADJUSTMENTS: Record<Gender, Record<string, number>> = {
  female:      { language: +4, reading: +5, phonology: +4, motor: +2, math: -2, attention: +1 },
  male:        { language: -2, reading: -3, phonology: -2, motor:  0, math: +2, attention: -1 },
  unspecified: { language:  0, reading:  0, phonology:  0, motor:  0, math:  0, attention:  0 },
};

/** تحويل النتيجة الخام % → درجة معيارية (SS) مُعدَّلة */
export function rawToStandardScore(
  rawPercent: number,
  age: AgeGroup = '8-9',
  gender: Gender = 'unspecified',
  domain = 'general'
): number {
  const clamped = Math.max(0, Math.min(100, rawPercent));
  const ageAdj    = AGE_ADJUSTMENTS[age];
  const genderAdj = GENDER_ADJUSTMENTS[gender][domain] ?? 0;

  // Linear transformation: Raw 75% → SS ~115, Raw 50% → SS 100, Raw 25% → SS 85
  // Slope 0.6 matches WISC-V full-scale SD spread for %→SS conversion
  const baseSS     = 100 + (clamped - 50) * 0.6;
  const adjustedSS = Math.round(baseSS + ageAdj + genderAdj);
  return Math.max(40, Math.min(160, adjustedSS));
}

/** تحويل الدرجة المعيارية → الفئة المئوية (جدول التوزيع الطبيعي) */
export function ssToPercentile(ss: number): number {
  const table: [number, number][] = [
    [160, 99.9], [150, 99.9], [145, 99.9], [140, 99.6],
    [135, 99],   [130, 98],   [125, 95],   [120, 91],
    [115, 84],   [110, 75],   [107, 68],   [105, 63],
    [102, 55],   [100, 50],   [98, 45],    [95, 37],
    [92, 29],    [90, 25],    [87, 19],    [85, 16],
    [82, 12],    [80, 9],     [78, 7],     [75, 5],
    [73, 4],     [70, 2],     [65, 1],     [60, 0.4],
    [55, 0.1],   [40, 0.01],
  ];
  for (const [score, ptile] of table) {
    if (ss >= score) return ptile;
  }
  return 0.01;
}

/** تصنيف الأداء بناءً على الدرجة المعيارية — DSM-5-TR / WISC-V Framework */
export function classifyPerformance(ss: number): PerformanceClass {
  if (ss >= 130) return 'superior';
  if (ss >= 115) return 'high_average';
  if (ss >= 90)  return 'average';          // WNL — تعديل: كان 85، الآن 90 (أكثر دقة للعربي)
  if (ss >= 80)  return 'low_average';
  if (ss >= 70)  return 'borderline';
  if (ss >= 55)  return 'mild_impairment';
  return 'moderate_impairment';
}

/** تسمية التصنيف بالعربية — للأخصائي */
export const PERFORMANCE_CLASS_LABELS: Record<PerformanceClass, string> = {
  superior:            'متفوق (SS 130+) — أعلى 98 مئيني',
  high_average:        'فوق المتوسط (SS 115-129) — 84-97 مئيني',
  average:             'ضمن الحدود الطبيعية [WNL] (SS 90-114)',
  low_average:         'أدنى المتوسط (SS 80-89) — حد اليقظة',
  borderline:          'حدّي سريري (SS 70-79) — يُنصح بالمتابعة',
  mild_impairment:     'صعوبة بسيطة (SS 55-69) — يتطلب تدخلاً',
  moderate_impairment: 'تحدٍّ ملحوظ (SS <55) — إحالة سريرية فورية',
};

/** وصف موجز للأهل — بلغة بسيطة */
export const PERFORMANCE_PARENT_DESC: Record<PerformanceClass, string> = {
  superior:            '🌟 أداء استثنائي يتجاوز معظم أقرانه بكثير.',
  high_average:        '✅ أداء قوي وأعلى من المتوسط — مؤشر ممتاز.',
  average:             '👍 أداء طبيعي تماماً ضمن المعيار المتوقع لعمره.',
  low_average:         '🔔 أداء أقل قليلاً من المتوقع — يستحق متابعة خفيفة.',
  borderline:          '⚠️ أداء حدّي — يُنصح بجلسات دعم وقائية مع متخصص.',
  mild_impairment:     '🟡 صعوبة ملحوظة — يُنصح بتقييم متخصص وخطة تدخل.',
  moderate_impairment: '🔴 تحدٍّ واضح — يتطلب تقييماً سريرياً فورياً وبرنامج تدخل.',
};

/** مرجع الفئات العمرية حسب عمر الطفل */
export function getAgeGroup(ageYears: number): AgeGroup {
  if (ageYears <= 5) return '4-5';
  if (ageYears <= 7) return '6-7';
  if (ageYears <= 9) return '8-9';
  return '10-12';
}

// ── Summary Score Interpretation ─────────────────────────────────────────────

/** تفسير سريري موجز لنتيجة مجال كامل */
export function interpretDomainScore(
  rawPercent: number,
  domain: string,
  ageYears: number,
  gender: 'male' | 'female' | 'unspecified' = 'unspecified'
): {
  ss: number;
  percentile: number;
  classification: PerformanceClass;
  labelAr: string;
  parentDesc: string;
  urgency: 'none' | 'monitor' | 'refer';
} {
  const ageGroup = getAgeGroup(ageYears);
  const ss = rawToStandardScore(rawPercent, ageGroup, gender, domain);
  const percentile = ssToPercentile(ss);
  const classification = classifyPerformance(ss);

  const urgency: 'none' | 'monitor' | 'refer' =
    classification === 'moderate_impairment' || classification === 'mild_impairment' ? 'refer' :
    classification === 'borderline' || classification === 'low_average' ? 'monitor' : 'none';

  return {
    ss,
    percentile,
    classification,
    labelAr: PERFORMANCE_CLASS_LABELS[classification],
    parentDesc: PERFORMANCE_PARENT_DESC[classification],
    urgency,
  };
}
