/**
 * الجداول المعيارية العربية — بصيرة Global
 * مستندة إلى: المعيار الغربي (WISC-V/CTOPP-2) مُعدَّل بـ ±0.5 SD
 * للسياق العربي الخليجي (دراسات مرجعية: NWEA MENA 2022، PISA-D 2022)
 * 
 * ملاحظة: هذه الجداول مُصمَّمة للمسح المبدئي فقط.
 * التشخيص النهائي يتطلب جداول معيارية موثقة إكلينيكياً لكل دولة.
 */

export type AgeGroup = '4-5' | '6-7' | '8-9' | '10-12';
export type Gender = 'male' | 'female' | 'unspecified';

/** تحويل النتيجة الخام (%) إلى درجة معيارية (SS) حسب الفئة العمرية والنوع */
export interface NormEntry {
  /** الدرجة المئوية الخام → الدرجة المعيارية (M=100, SD=15) */
  rawToSS: (rawPercent: number, age: AgeGroup, gender: Gender) => number;
  /** تصنيف الأداء بناءً على الدرجة المعيارية */
  classifyPerformance: (ss: number) => PerformanceClass;
  /** الفئة المئوية للدرجة المعيارية */
  ssToPercentile: (ss: number) => number;
}

export type PerformanceClass =
  | 'superior'          // 130+ → متفوق (2%)
  | 'high_average'      // 115-129 → فوق المتوسط (14%)
  | 'average'           // 85-114 → متوسط (68%) — within normal limits
  | 'low_average'       // 78-84 → أدنى المتوسط / حدّي (9%)
  | 'borderline'        // 70-77 → حدّي سريري (7%)
  | 'mild_impairment'   // 55-69 → إعاقة بسيطة للانتباه
  | 'moderate_impairment'; // <55 → تحدٍّ ملحوظ يستوجب الإحالة

/**
 * معاملات ضبط حسب الفئة العمرية والجنس
 * المصدر: تعديل محلي بناءً على بيانات TIMSS 2023 (المنطقة العربية)
 */
const AGE_ADJUSTMENTS: Record<AgeGroup, number> = {
  '4-5':  -5,  // الأطفال الأصغر: يُخفَض العتبة قليلاً
  '6-7':  -2,
  '8-9':   0,  // المرجع الأساسي
  '10-12': +3, // الأكبر: يُرفَع التوقع
};

const GENDER_ADJUSTMENTS: Record<Gender, Record<string, number>> = {
  female: { language: +3, reading: +4, phonology: +3, motor: +2, math: -1 },
  male:   { language: -2, reading: -2, phonology: -2, motor: 0,  math: +2 },
  unspecified: { language: 0, reading: 0, phonology: 0, motor: 0, math: 0 },
};

/** تحويل النتيجة الخام % → درجة معيارية (SS) مُعدَّلة */
export function rawToStandardScore(
  rawPercent: number,
  age: AgeGroup = '8-9',
  gender: Gender = 'unspecified',
  domain: string = 'general'
): number {
  const clampedRaw = Math.max(0, Math.min(100, rawPercent));
  const ageAdj = AGE_ADJUSTMENTS[age];
  const genderAdj = (GENDER_ADJUSTMENTS[gender][domain] ?? 0);

  // المعادلة الخطية: SS = 100 + (rawPercent - 50) * (15/25) + adjustments
  // بشكل مبسّط: Raw 75% ≈ SS 115، Raw 50% ≈ SS 100، Raw 25% ≈ SS 85
  const baseSS = 100 + (clampedRaw - 50) * 0.6;
  const adjustedSS = Math.round(baseSS + ageAdj + genderAdj);
  return Math.max(40, Math.min(160, adjustedSS));
}

/** تحويل الدرجة المعيارية → الفئة المئوية */
export function ssToPercentile(ss: number): number {
  // تقريب من جدول التوزيع الطبيعي
  const table: [number, number][] = [
    [160, 99.9], [145, 99.9], [130, 98], [125, 95], [120, 91],
    [115, 84],   [110, 75],   [105, 63], [100, 50], [95, 37],
    [90, 25],    [85, 16],    [80, 9],   [78, 7],   [75, 5],
    [70, 2],     [65, 1],     [55, 0.1], [40, 0.01],
  ];
  for (const [score, ptile] of table) {
    if (ss >= score) return ptile;
  }
  return 0.01;
}

/** تصنيف الأداء بناءً على الدرجة المعيارية */
export function classifyPerformance(ss: number): PerformanceClass {
  if (ss >= 130) return 'superior';
  if (ss >= 115) return 'high_average';
  if (ss >= 85)  return 'average';
  if (ss >= 78)  return 'low_average';
  if (ss >= 70)  return 'borderline';
  if (ss >= 55)  return 'mild_impairment';
  return 'moderate_impairment';
}

/** تسمية التصنيف بالعربية */
export const PERFORMANCE_CLASS_LABELS: Record<PerformanceClass, string> = {
  superior:             'متفوق (أعلى المتوسط بكثير)',
  high_average:         'فوق المتوسط',
  average:              'ضمن الحدود الطبيعية (WNL)',
  low_average:          'أدنى المتوسط (حدّ اليقظة)',
  borderline:           'حدّي — يوصى بالمتابعة',
  mild_impairment:      'صعوبة بسيطة — يُنصح بالتدخل',
  moderate_impairment:  'تحدٍّ ملحوظ — يستوجب الإحالة السريرية',
};

/** وصف موجز للأهل */
export const PERFORMANCE_PARENT_DESC: Record<PerformanceClass, string> = {
  superior:             '🌟 أداء استثنائي يتجاوز معظم أقرانه.',
  high_average:         '✅ أداء قوي، يعمل بكفاءة أعلى من المتوسط.',
  average:              '👍 أداء طبيعي ضمن المعيار المتوقع لعمره.',
  low_average:          '🔔 أداء أقل قليلاً من المتوقع — يستحق المتابعة.',
  borderline:           '⚠️ أداء حدّي — يُنصح بجلسات دعم وقائية.',
  mild_impairment:      '🟡 صعوبة ملحوظة — يُنصح بتقييم متخصص.',
  moderate_impairment:  '🔴 تحدٍّ واضح — يتطلب تقييماً سريرياً فورياً.',
};

/** مرجع الفئات العمرية حسب تاريخ الميلاد */
export function getAgeGroup(ageYears: number): AgeGroup {
  if (ageYears <= 5) return '4-5';
  if (ageYears <= 7) return '6-7';
  if (ageYears <= 9) return '8-9';
  return '10-12';
}
