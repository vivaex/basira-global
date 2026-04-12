/**
 * lib/clinicianStorage.ts — تخزين وإدارة حالات المتعددة للأخصائي
 * يعمل مع localStorage لكل جلسة المتصفح (لا يتطلب Backend)
 * في الإصدار القادم: يمكن ربطه بـ Supabase
 */

export interface ClinicalCase {
  id: string;
  childName: string;
  childAge: number | null;
  childGrade: string;
  gender: 'male' | 'female' | 'unspecified';
  createdAt: string;
  lastUpdated: string;
  lastSessionDate: string | null;
  domainScores: Record<string, number>;
  overallRisk: 'green' | 'yellow' | 'red';
  notes: string;
  parentAssessmentDone: boolean;
  teacherAssessmentDone: boolean;
  devHistoryDone: boolean;
  snapshots: CaseSnapshot[];
  tags: string[];
}

export interface CaseSnapshot {
  date: string;
  domainScores: Record<string, number>;
  sessionCount: number;
  aiSummary?: string;
}

const STORAGE_KEY = 'basira_clinician_cases';
const PIN_KEY = 'basira_clinician_pin';

// ── PIN Management ─────────────────────────────────────────────────

export function setClinicianPIN(pin: string): void {
  localStorage.setItem(PIN_KEY, btoa(pin)); // base64 بسيط — ليس تشفيراً أمنياً
}

export function verifyClinicianPIN(pin: string): boolean {
  const stored = localStorage.getItem(PIN_KEY);
  if (!stored) return true; // لم يُضبط بعد
  return stored === btoa(pin);
}

export function clinicianPINSet(): boolean {
  return localStorage.getItem(PIN_KEY) !== null;
}

// ── Cases CRUD ─────────────────────────────────────────────────────

export function getAllCases(): ClinicalCase[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveCase(c: ClinicalCase): void {
  const cases = getAllCases().filter(x => x.id !== c.id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...cases, c]));
}

export function deleteCase(id: string): void {
  const cases = getAllCases().filter(x => x.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
}

export function getCaseById(id: string): ClinicalCase | null {
  return getAllCases().find(c => c.id === id) ?? null;
}

/** حفظ الجلسة الحالية كحالة جديدة */
export function saveCurrentSessionAsCase(
  childName: string,
  age: number | null,
  grade: string,
  gender: 'male' | 'female' | 'unspecified',
  domainScores: Record<string, number>,
  notes = ''
): ClinicalCase {
  const overallScore = Object.values(domainScores).filter(v => v > 0);
  const avg = overallScore.length ? overallScore.reduce((a, b) => a + b, 0) / overallScore.length : 0;
  const overallRisk: ClinicalCase['overallRisk'] =
    avg >= 75 ? 'green' : avg >= 50 ? 'yellow' : 'red';

  const newCase: ClinicalCase = {
    id: `case_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    childName,
    childAge: age,
    childGrade: grade,
    gender,
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    lastSessionDate: new Date().toISOString(),
    domainScores,
    overallRisk,
    notes,
    parentAssessmentDone: !!localStorage.getItem('parentAssessment'),
    teacherAssessmentDone: !!localStorage.getItem('teacherFormScore'),
    devHistoryDone: !!localStorage.getItem('developmentalHistory'),
    snapshots: [{
      date: new Date().toISOString(),
      domainScores,
      sessionCount: 1,
    }],
    tags: [],
  };

  saveCase(newCase);
  return newCase;
}

/** خطورة الحالة بالعربية */
export const RISK_LABELS: Record<ClinicalCase['overallRisk'], string> = {
  green:  'أداء طبيعي (WNL)',
  yellow: 'يحتاج متابعة',
  red:    'يستوجب إحالة فورية',
};

export const RISK_COLORS: Record<ClinicalCase['overallRisk'], string> = {
  green:  'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  yellow: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  red:    'text-rose-400 border-rose-500/30 bg-rose-500/10',
};

export const RISK_ICON: Record<ClinicalCase['overallRisk'], string> = {
  green: '✅', yellow: '⚠️', red: '🚨',
};
