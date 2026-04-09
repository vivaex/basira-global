// lib/clinical.ts
import { 
  TestSession, 
  ClinicalSummary, 
  LearningPassport,
  SkillLevel,
  DifficultyLevel
} from './types';
import { getStudentProfile, getAllTestSessions } from './storage';

export const DOMAIN_MAPPING: Record<string, string> = {
  // Literacy / Dyslexia
  'reading-phonological': 'literacy',
  'reading-fluency':      'literacy',
  'reading-vocabulary':   'literacy',
  'spelling':             'literacy',
  'letter-formation':     'literacy',
  'copy-text':            'literacy',
  'auditory_rhyming':     'literacy',
  'auditory_phonemic_awareness': 'literacy',
  'writing_letter_formation':    'literacy',
  'writing_spelling':            'literacy',

  // Motor / VMI
  'vmi-canvas':           'motor',
  'shape-copying':        'motor',
  'finger-tapping':       'motor',
  'micro-tremor':         'motor',

  // Cognition / ADHD / Memory
  'hyperactivity':        'cognition',
  'gaze-stability':       'cognition',
  'attention':            'cognition',
  'cpt':                  'cognition',
  'working-memory':       'cognition',
  'cognitive-flexibility':'cognition',
  'planning':             'cognition',
  'math':                 'cognition',
  'auditory_memory':      'cognition',
  'auditory_speech_noise': 'literacy', // CAPD often correlates with literacy

  // Social / Emotional
  'social-recognition':   'social',
  'social_recognition':   'social',
  'empathy-scenarios':    'social',
  'empathy_scenarios':    'social',

  // Processing Speed
  'symbol-search':        'processing-speed',
  'visual-discrimination':'processing-speed',
  'saccadic-tracking':    'literacy',
};

export function getSkillLevelLabel(score: number): SkillLevel {
  if (score >= 85) return 'excellent';
  if (score >= 65) return 'average';
  if (score >= 40) return 'weak';
  return 'very_weak';
}

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  excellent: 'ممتاز',
  average:   'متوسط',
  weak:      'ضعيف',
  very_weak: 'ضعيف جدًا',
};

export const DIFFICULTY_LEVEL_LABELS: Record<string, string> = {
  none:     'لا توجد تحديات حالياً',
  mild:     'تحديات طفيفة',
  moderate: 'تحديات متوسطة',
  severe:   'تحديات تستدعي التدخل',
};

/**
 * Rule 7: Ethical Terminology Refinement
 * For ASD: Level of Support instead of Severity.
 * For Anxiety: Emotional Wellbeing instead of Disorder.
 */
export function getEthicalLabel(score: number, domainId?: string): string {
  const level = scoreToDifficultyLevel(score);
  
  if (domainId === 'autism' || domainId?.includes('autism')) {
    const supportLabels: Record<string, string> = {
      none: 'لا توجد مؤشرات دعم حالية',
      mild: 'مستوى الدعم المطلوب: بسيط',
      moderate: 'مستوى الدعم المطلوب: جوهري',
      severe: 'مستوى الدعم المطلوب: جوهري جداً'
    };
    return supportLabels[level];
  }

  if (domainId === 'anxiety' || domainId?.includes('wellbeing')) {
    const wellbeingLabels: Record<string, string> = {
      none: 'رفاهية وجدانية مستقرة',
      mild: 'تقلبات وجدانية عابرة',
      moderate: 'تحديات في التنظيم الانفعالي',
      severe: 'حاجة لدعم وجداني متخصص'
    };
    return wellbeingLabels[level];
  }

  return DIFFICULTY_LEVEL_LABELS[level];
}

export function scoreToDifficultyLevel(score: number): DifficultyLevel {
  if (score >= 75) return 'none';
  if (score >= 55) return 'mild';
  if (score >= 35) return 'moderate';
  return 'severe';
}

export function generateClinicalSummary(sessions: TestSession[]): ClinicalSummary {
  const domainTotals: Record<string, number[]> = { literacy: [], motor: [], cognition: [], social: [], visual: [] };
  const domainStandardScores: Record<string, number[]> = { literacy: [], motor: [], cognition: [], social: [], visual: [] };
  
  sessions.forEach(s => {
    const domain = DOMAIN_MAPPING[s.testId] || DOMAIN_MAPPING[s.testCategory];
    if (domain && domainTotals[domain]) {
      domainTotals[domain].push(s.rawScore);
      if (s.postAnalysis?.standardScore) {
        domainStandardScores[domain].push(s.postAnalysis.standardScore);
      }
    }
  });

  const domainScores: Record<string, number> = {};
  const domainSS: Record<string, number> = {};
  
  for (const d in domainTotals) {
     const scores = domainTotals[d];
     domainScores[d] = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
     
     const ssList = domainStandardScores[d];
     domainSS[d] = ssList.length > 0 ? Math.round(ssList.reduce((a, b) => a + b, 0) / ssList.length) : 0;
  }

  const findings: string[] = [];
  const recommendations: string[] = [];

  // Logic based on Standard Scores (SS < 85 is -1 SD)
  if (domainSS.literacy > 0 && domainSS.literacy < 85) {
    findings.push("انخفاض دال إحصائياً في الكفاءة الفونولوجية (SS: " + domainSS.literacy + ")، مما يشير إلى احتمالية وجود عسر قراءة (Dyslexia) يتطلب تدخل مكثف.");
    recommendations.push("تطبيق برنامج تدخل علاجي قائم على الوعي الفونولوجي (مثل Orton-Gillingham).");
  }
  
  if (domainSS.cognition > 0 && domainSS.cognition < 85) {
    findings.push("تراجع في مؤشر الذاكرة العاملة والوظائف التنفيذية (SS: " + domainSS.cognition + ")، وهو مؤشر سريري متكرر في حالات تشتت الانتباه (ADHD).");
    recommendations.push("استخدام استراتيجيات دعم الذاكرة العاملة (تجزئة المهام، القوائم البصرية) وتدريبات كبح الاندفاعية.");
  }

  if (domainSS.motor > 0 && domainSS.motor < 85) {
    findings.push("ضعف في مؤشر التآزر البصري الحركي (SS: " + domainSS.motor + ")، مما قد يؤثر على سرعة ودقة الكتابة اليدوية (Dysgraphia marker).");
    recommendations.push("إحالة للتقييم الوظيفي (Occupational Therapy) لتدريبات العضلات الدقيقة.");
  }

  // Fallback to raw scores for legacy tests
  if (findings.length === 0) {
    if (domainScores.social > 0 && domainScores.social < 65) {
      findings.push("رصد تحديات في التعرف على الانفعالات والسياق الاجتماعي (مؤشر تواصل اجتماعي).");
      recommendations.push("برامج تنمية المهارات الاجتماعية (Social Stories) والتدريب على تبادل الأدوار.");
    }
  }

  const frustrationEvents = sessions.reduce((sum, s) => sum + (s.emotional?.frustrationEvents ?? 0), 0);
  if (frustrationEvents > 4) {
     findings.push("رصد مستويات مرتفعة من اضطراب التنظيم الانفعالي أثناء أداء المهام، مما قد يشير إلى قلق الأداء (Test Anxiety).");
     recommendations.push("استخدام فنيات الاسترخاء التنفسي وتوفير بيئة اختبار غير ضاغطة.");
  }

  return { domainScores, findings, recommendations, domainStandardScores: domainSS };
}

export function buildLearningPassport(): LearningPassport {
  const profile = getStudentProfile();
  const sessions = getAllTestSessions();

  const progressByCategory: Record<string, number[]> = {};
  for (const s of sessions) {
    if (!progressByCategory[s.testCategory]) progressByCategory[s.testCategory] = [];
    progressByCategory[s.testCategory].push(s.rawScore);
  }

  let learningStyleGuess: LearningPassport['learningStyleGuess'] = 'unknown';
  const categories = Object.keys(progressByCategory);
  const avgScore = (cat: string) =>
    progressByCategory[cat]
      ? progressByCategory[cat].reduce((a, b) => a + b, 0) / progressByCategory[cat].length
      : 0;
  
  const visual  = avgScore('visual');
  const auditory = avgScore('auditory');
  const motor   = avgScore('motor');
  const max = Math.max(visual, auditory, motor);
  
  if (max > 70) {
    if (visual >= max) learningStyleGuess = 'visual';
    else if (auditory >= max) learningStyleGuess = 'auditory';
    else learningStyleGuess = 'kinesthetic';
  } else if (categories.length >= 3) {
    learningStyleGuess = 'mixed';
  }

  const motivators: string[] = [];
  const completedGoals = sessions
    .filter(s => s.rawScore >= 75)
    .map(s => `${s.testTitle} — ${s.rawScore}%`);

  const currentFocus = sessions
    .filter(s => s.rawScore < 60 && s.rawScore > 0)
    .map(s => s.testTitle);

  return {
    studentProfile: profile,
    sessions,
    progressByCategory,
    learningStyleGuess,
    weakFocusTimes: [],
    motivators,
    treatmentProgress: {
      completedGoals,
      currentFocus,
      teacherRecommendations: [],
    },
    generatedAt: new Date().toISOString(),
  };
}
