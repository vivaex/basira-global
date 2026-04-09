// lib/storage.ts
import { 
  StudentProfile, 
  TestSession, 
  PreTestReadiness, 
  LearningPassport, 
  CaseStudy,
  SkillLevel,
  DifficultyLevel
} from './types';

export const KEYS = {
  CURRENT_ID: 'basira_current_profile_id',
  PROFILES:   'basira_profiles',
  LEGACY_PROFILE: 'basira_student_profile',
  SESSIONS:  'basira_test_sessions',
  PASSPORT:  'basira_learning_passport',
  PRE_TEST:  'basira_pre_test_readiness',
  CASE_STUDY:'basira_clinical_case_study',
} as const;

// ── Profile Management ───────────────────────

export function getLevelFromXP(xp: number) {
  const level = Math.floor(Math.sqrt(xp / 100)) + 1;
  const currentLevelXP = Math.pow(level - 1, 2) * 100;
  const nextLevelXP = Math.pow(level, 2) * 100;
  const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  
  return {
    level,
    progress,
    nextLevelXP,
    currentLevelXP
  };
}

export function getAllProfiles(): StudentProfile[] {
  if (typeof window === 'undefined') return [];
  
  const legacy = localStorage.getItem(KEYS.LEGACY_PROFILE);
  const profilesRaw = localStorage.getItem(KEYS.PROFILES);
  
  let profiles: StudentProfile[] = [];
  if (profilesRaw) {
    try { 
      const parsed = JSON.parse(profilesRaw);
      if (Array.isArray(parsed)) {
        profiles = parsed.map(p => ({
          ...p,
          preliminaryDiagnosis: p.preliminaryDiagnosis || {
            autismSpectrum: false,
            socialCommunication: false,
            anxietyDisorder: false,
            specialDisabilityNotes: '',
          }
        }));
      }
    } catch(e) {}
  }
  
  if (legacy && profiles.length === 0) {
    try {
      const p = JSON.parse(legacy);
      p.id = p.id || 'default';
      p.xp = p.xp || 0;
      p.level = p.level || 1;
      p.preliminaryDiagnosis = p.preliminaryDiagnosis || {
        autismSpectrum: false,
        socialCommunication: false,
        anxietyDisorder: false,
        specialDisabilityNotes: '',
      };
      profiles = [p];
      localStorage.setItem(KEYS.PROFILES, JSON.stringify(profiles));
      localStorage.setItem(KEYS.CURRENT_ID, p.id);
      localStorage.removeItem(KEYS.LEGACY_PROFILE);
    } catch(e) {}
  }
  
  return profiles;
}

export function getCurrentProfileId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(KEYS.CURRENT_ID);
}

export function setCurrentProfileId(id: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.CURRENT_ID, id);
}

export function saveStudentProfile(profile: StudentProfile): void {
  if (typeof window === 'undefined') return;
  
  const profiles = getAllProfiles();
  const idx = profiles.findIndex(p => p.id === profile.id);
  
  const updated = { 
    ...profile, 
    level: getLevelFromXP(profile.xp || 0).level,
    updatedAt: new Date().toISOString() 
  };
  
  if (idx >= 0) profiles[idx] = updated;
  else profiles.push(updated);
  
  localStorage.setItem(KEYS.PROFILES, JSON.stringify(profiles));
  localStorage.setItem(KEYS.CURRENT_ID, updated.id);
  localStorage.setItem('studentName', updated.name); // backward compatibility
}

export function getStudentProfile(): StudentProfile | null {
  const profiles = getAllProfiles();
  const currentId = getCurrentProfileId();
  const profile = currentId ? (profiles.find(p => p.id === currentId) || profiles[0]) : (profiles[0] || null);
  
  if (!profile) return null;

  // Hydrate preliminaryDiagnosis for legacy profiles
  if (!profile.preliminaryDiagnosis) {
    profile.preliminaryDiagnosis = {
      autismSpectrum: false,
      socialCommunication: false,
      anxietyDisorder: false,
      specialDisabilityNotes: '',
    };
  }

  return profile;
}

export function createEmptyProfile(): StudentProfile {
  return {
    id: `profile_${Date.now()}`,
    name: '', age: null, gender: 'not_specified',
    grade: '', primaryLanguage: 'العربية', otherLanguages: [],
    hasHearingIssues: 'no', hasVisionIssues: 'no',
    wearsGlasses: false, wearsHearingAid: false,
    hasSeizureHistory: false, takesMedication: false, medicationNotes: '',
    difficultiesIn: { reading: false, writing: false, math: false, comprehension: false, attention: false },
    problemStartedWhen: '', hardestSubjects: [], currentAcademicLevel: 'average',
    excessiveMovement: 'no', losesConcentrationQuickly: 'no',
    forgetsInstructions: 'no', testAnxiety: 'no', completesHomework: 'sometimes',
    familyLearningDifficulties: false, familyADHDOrAutism: false, familyNotes: '',
    coins: 0, xp: 0, level: 1, unlockedItems: [], 
    equippedItems: { skin: 'default', hat: 'none', accessory: 'none' },
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    preliminaryDiagnosis: {
      autismSpectrum: false,
      socialCommunication: false,
      anxietyDisorder: false,
      specialDisabilityNotes: '',
    },
  };
}

export function awardXP(amount: number): void {
  const profile = getStudentProfile();
  if (profile) {
    profile.xp = (profile.xp || 0) + amount;
    saveStudentProfile(profile);
  }
}

// ── Pre-Test Readiness ───────────────────────

export function savePreTestReadiness(readiness: PreTestReadiness): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.PRE_TEST, JSON.stringify(readiness));
}

export function getLastPreTestReadiness(): PreTestReadiness | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(KEYS.PRE_TEST);
  if (!raw) return null;
  try { return JSON.parse(raw) as PreTestReadiness; }
  catch { return null; }
}

export function createDefaultReadiness(): PreTestReadiness {
  return {
    studentState: 'okay', ateFood: true, sleptWell: true,
    roomIsQuiet: true, lightingAdequate: true,
    micAvailable: false, cameraAvailable: false,
    internetQuality: 'unknown', timestamp: new Date().toISOString(),
  };
}

// ── Test Sessions ────────────────────────────

export function saveTestSession(session: TestSession): void {
  if (typeof window === 'undefined') return;
  const existing = getAllTestSessions();
  const idx = existing.findIndex(s => s.id === session.id);
  if (idx >= 0) existing[idx] = session;
  else existing.push(session);
  localStorage.setItem(KEYS.SESSIONS, JSON.stringify(existing));
  syncAllData().catch(err => console.warn('Sync failed:', err));
}

export function getAllTestSessions(): TestSession[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(KEYS.SESSIONS);
  if (!raw) return [];
  try { return JSON.parse(raw) as TestSession[]; }
  catch { return []; }
}

export function getSessionsByCategory(category: string): TestSession[] {
  return getAllTestSessions().filter(s => s.testCategory === category);
}

export function getLatestSessionByCategory(category: string): TestSession | null {
  const sessions = getSessionsByCategory(category);
  if (sessions.length === 0) return null;
  return sessions.sort((a, b) =>
    new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  )[0];
}

export function generateSessionId(testId: string): string {
  return `${testId}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ── Case Study ───────────────────────────────

export function saveCaseStudy(caseStudy: CaseStudy): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.CASE_STUDY, JSON.stringify(caseStudy));
}

export function getCaseStudy(): CaseStudy | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(KEYS.CASE_STUDY);
  if (!raw) return null;
  try { return JSON.parse(raw) as CaseStudy; }
  catch { return null; }
}

export function createEmptyCaseStudy(): CaseStudy {
  return {
    generalInfo: { fullName: '', age: '', gender: '', grade: '', schoolSystem: '', homeLanguages: '', readingLanguages: '' },
    medicalHistory: { pregnancyComplications: 'no', prematureBirth: 'no', birthType: '', oxygenDeprivation: 'no', highFevers: 'no', severeJaundice: 'no', seizures: 'no', glandHormoneIssues: 'no', hearingLoss: 'no', hearingAid: 'no', visionLoss: 'no', glasses: 'no', previousCheckups: 'no', chronicMedications: 'no', adhdMedications: 'no' },
    developmentalHistory: { sittingAge: '', walkingAge: '', balanceIssues: 'no', fineMotorIssues: 'no', firstWordAge: '', speechDelay: 'no', pronunciationIssues: 'no', eyeContact: 'yes', playsWithKids: 'yes', fearsNewSituations: 'no' },
    academicHistory: { difficultyStart: '', startedInFirstGrade: 'no', hardestSubject: '', readingStruggle: 'no', mixesLetters: 'no', writesSlowly: 'no', countingStruggle: 'no', memorizedTimesTable: 'no', understandsButCantSolve: 'no', spellingIssues: 'no', needsExtraTime: 'no', feelsFrustrated: 'no', refusesStudying: 'no' },
    behaviorAttention: { movesA_lot: 'no', interruptsOthers: 'no', forgetsInstructions: 'no', cantSitLong: 'no', easilyDistracted: 'no', delaysHomework: 'no', getsAngryFast: 'no', testAnxiety: 'no' },
    familyBackground: { historyLearningDisabilities: 'no', historyDyslexia: 'no', historyAdhd: 'no', historyAutism: 'no', historyHighIntelligence: 'no', livesWithBothParents: 'yes', familyConflicts: 'no', frequentSchoolChanges: 'no', homeworkFollowUp: 'yes', dailyStudyHours: '' },
    psychologicalInfo: { anxiety: 'no', examFear: 'no', schoolEvasion: 'no', feelsLessIntelligent: 'no', bullied: 'no', selfConfidence: 'yes' },
    dyslexiaIndicators: { mixesSimilarLetters: 'no', reversesLetters: 'no', readsVerySlowly: 'no', losesPlaceWhileReading: 'no' },
    dysgraphiaIndicators: { illegibleHandwriting: 'no', frequentSpellingMistakes: 'no', wrongPenGrip: 'no', writesSlowly: 'no', strugglesCopyingSentences: 'no' },
    dyscalculiaIndicators: { countingDifficulty: 'no', mixesNumbers: 'no', basicOperationsDifficulty: 'no', getsLostSolvingMath: 'no', cantUnderstandSymbols: 'no' },
    executiveFunction: { organizesBag: 'yes', knowsStepsOrder: 'yes', losesItems: 'no', forgetsAssignments: 'no', planningDifficulty: 'no' },
    finalQuestion: { top3Challenges: [] },
    completedAt: null
  };
}

// ── Cloud Sync (Supabase Integration) ───────────────────
import { supabase } from './supabase';

export async function syncAllData(): Promise<{ success: boolean; error?: string }> {
  if (typeof window === 'undefined') return { success: false };
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: false, error: 'No active session' };

  const profile = getStudentProfile();
  const sessions = getAllTestSessions();

  try {
    // 1. Sync Profile
    if (profile) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          full_name: profile.name,
          date_of_birth: null, // To be mapped from profile if available
          gender: profile.gender,
          grade_level: profile.grade,
          primary_language: profile.primaryLanguage,
          updated_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;
    }

    // 2. Sync Sessions
    if (sessions.length > 0) {
      const sessionData = sessions.map(s => ({
        id: (s.id && s.id.includes('_')) ? undefined : s.id, // Safer check
        user_id: session.user.id,
        status: 'completed' as const,
        age_group: (profile?.age || 0) < 6 ? 'early_childhood' : (profile?.age || 0) < 12 ? 'middle_childhood' : 'adolescent',
        started_at: s.completedAt, 
        completed_at: s.completedAt,
        metadata: {
          testId: s.testId,
          testCategory: s.testCategory,
          testTitle: s.testTitle,
          rawScore: s.rawScore,
          attention: s.attention,
          emotional: s.emotional
        }
      }));

      // If we don't have valid UUIDs in local storage yet, we might prefer 'insert' or a different conflict target
      const { error: sessionsError } = await supabase
        .from('assessment_sessions')
        .upsert(sessionData); // Remove onConflict: 'id' if we're not sure they are UUIDs, Supabase will handle it if ID is provided

      if (sessionsError) {
        console.error('Sessions Sync Error details:');
        console.dir(sessionsError);
        throw sessionsError;
      }
    }

    return { success: true };
  } catch (e: any) {
    console.error('Supabase Sync failed fully. Object details below:');
    console.dir(e);
    return { success: false, error: e.message || 'Unknown sync error' };
  }
}
