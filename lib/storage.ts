// lib/storage.ts
import { 
  StudentProfile, 
  TestSession, 
  PreTestReadiness, 
  CaseStudy 
} from './types';
import { supabase } from './supabase';

export const KEYS = {
  CURRENT_ID: 'basira_current_profile_id',
  PROFILES:   'basira_profiles',
  LEGACY_PROFILE: 'basira_student_profile',
  SESSIONS:  'basira_test_sessions',
  PASSPORT:  'basira_learning_passport',
  PRE_TEST:  'basira_pre_test_readiness',
  CASE_STUDY:'basira_clinical_case_study',
} as const;

export function generateSessionId(): string {
  return crypto.randomUUID();
}

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

function isUUID(id: string): boolean {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(id);
}

export function getAllProfiles(): StudentProfile[] {
  if (typeof window === 'undefined') return [];
  
  const profilesRaw = localStorage.getItem(KEYS.PROFILES);
  let profiles: StudentProfile[] = [];

  if (profilesRaw) {
    try { 
      const parsed = JSON.parse(profilesRaw);
      if (Array.isArray(parsed)) {
        let changed = false;
        profiles = parsed.map(p => {
          let updatedP = { ...p };
          if (!isUUID(p.id)) {
            updatedP.id = crypto.randomUUID();
            changed = true;
          }
          if (!updatedP.preliminaryDiagnosis) {
            updatedP.preliminaryDiagnosis = {
              autismSpectrum: false,
              socialCommunication: false,
              anxietyDisorder: false,
              specialDisabilityNotes: '',
            };
            changed = true;
          }
          return updatedP;
        });
        
        if (changed) {
          localStorage.setItem(KEYS.PROFILES, JSON.stringify(profiles));
          // Update current ID if it was one of the migrated ones
          const currentId = localStorage.getItem(KEYS.CURRENT_ID);
          if (currentId && !isUUID(currentId)) {
            const migrated = profiles.find(p => p.name === localStorage.getItem('studentName'));
            if (migrated) localStorage.setItem(KEYS.CURRENT_ID, migrated.id);
          }
        }
      }
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
  
  // Trigger Cloud Sync
  syncProfileToCloud(updated).catch(err => console.warn('Cloud Sync Failed:', err));
}

export function getStudentProfile(): StudentProfile | null {
  const profiles = getAllProfiles();
  const currentId = getCurrentProfileId();
  const profile = currentId ? (profiles.find(p => p.id === currentId) || profiles[0]) : (profiles[0] || null);
  
  if (!profile) return null;

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
    id: crypto.randomUUID(),
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

export function createEmptyCaseStudy(): CaseStudy {
  return {
    profileId: '',
    generalInfo: {
      informantName: '',
      informantRelationship: '',
      reasonForReferral: '',
      clientStrength: '',
      clientChallenges: '',
    },
    medicalHistory: {
      pregnancyComplications: false,
      birthComplications: false,
      chronicIllnesses: '',
      currentMedications: '',
      visionIssues: false,
      hearingIssues: false,
    },
    developmentalHistory: {
      walkingAge: '',
      talkingAge: '',
      toiletTrainingAge: '',
      motorCoordination: 'average',
    },
    academicHistory: {
      currentSchool: '',
      currentGrade: '',
      repeatingGrades: false,
      favouriteSubjects: [],
      difficultSubjects: [],
    },
    behaviorAttention: {
      easilyDistracted: false,
      impulsive: false,
      aggressiveBehavior: false,
      socialInteraction: 'average',
    },
    familyBackground: {
      livingArrangement: '',
      siblingCount: 0,
      familyLearningDifficulties: false,
    },
    psychologicalInfo: {
      previousAssessments: '',
      therapiesReceived: '',
    },
    completedAt: new Date().toISOString()
  };
}

// ── Test Sessions ────────────────────────────

export function getAllTestSessions(): TestSession[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(KEYS.SESSIONS);
  if (!raw) return [];
  try { return JSON.parse(raw) as TestSession[]; }
  catch { return []; }
}

export function saveTestSession(session: TestSession): void {
  if (typeof window === 'undefined') return;
  const existing = getAllTestSessions();
  const idx = existing.findIndex(s => s.id === session.id);
  if (idx >= 0) existing[idx] = session;
  else existing.push(session);
  localStorage.setItem(KEYS.SESSIONS, JSON.stringify(existing));
  
  // Trigger Cloud Sync
  const profile = getStudentProfile();
  if (profile) {
    syncSessionToCloud(session, profile.id).catch(err => console.warn('Session Sync Failed:', err));
  }
}

// ── Case Study ───────────────────────────────

export function getCaseStudy(): CaseStudy | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(KEYS.CASE_STUDY);
  if (!raw) return null;
  try { return JSON.parse(raw) as CaseStudy; }
  catch { return null; }
}

export function saveCaseStudy(caseStudy: CaseStudy): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.CASE_STUDY, JSON.stringify(caseStudy));
  
  // Trigger Cloud Sync
  const profile = getStudentProfile();
  if (profile) {
    syncCaseStudyToCloud(profile.id, caseStudy).catch(err => console.warn('Case Study Sync Failed:', err));
  }
}

// ── Cloud Sync (Supabase Implementation) ──────────

export async function syncProfileToCloud(profile: StudentProfile): Promise<void> {
  if (!supabase) return; // Prevent crash if Supabase is not initialized

  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;

  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: profile.id,
      name: profile.name,
      age: profile.age,
      gender: profile.gender,
      grade: profile.grade,
      coins: profile.coins,
      xp: profile.xp,
      level: profile.level,
      unlocked_items: profile.unlockedItems,
      equipped_items: profile.equippedItems,
      difficulties_in: profile.difficultiesIn,
      preliminary_diagnosis: profile.preliminaryDiagnosis,
      updated_at: new Date().toISOString(),
      sync_status: 'synced',
      user_id: userId // Linking to the authenticated user if available
    });
  if (error) throw error;
}

export async function syncSessionToCloud(session: TestSession, profileId: string): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase
    .from('test_sessions')
    .upsert({
      id: session.id,
      profile_id: profileId,
      test_id: session.testId,
      test_category: session.testCategory,
      test_title: session.testTitle,
      raw_score: session.rawScore,
      rounds: session.rounds,
      attention: session.attention,
      emotional: session.emotional,
      post_analysis: session.postAnalysis,
      completed_at: session.completedAt
    });
  if (error) throw error;
}

export async function syncCaseStudyToCloud(profileId: string, caseStudy: CaseStudy): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase
    .from('case_studies')
    .upsert({
      profile_id: profileId,
      general_info: caseStudy.generalInfo,
      medical_history: caseStudy.medicalHistory,
      developmental_history: caseStudy.developmentalHistory,
      academic_history: caseStudy.academicHistory,
      behavior_attention: caseStudy.behaviorAttention,
      family_background: caseStudy.familyBackground,
      psychological_info: caseStudy.psychologicalInfo,
      completed_at: caseStudy.completedAt || new Date().toISOString()
    });
  if (error) throw error;
}

export async function syncAllData(): Promise<{ success: boolean; error?: string }> {
  if (typeof window === 'undefined' || !supabase) return { success: false, error: 'Not in browser or Supabase missing' };
  
  const profiles = getAllProfiles();
  if (profiles.length === 0) return { success: true };

  const sessions = getAllTestSessions();
  const caseStudy = getCaseStudy();

  try {
    // 1. Sync all child profiles discovered on this device
    for (const p of profiles) {
      await syncProfileToCloud(p);
    }
    
    // 2. Sync sessions (the cloud will link them via profile_id correctly)
    for (const session of sessions) {
      const profileId = session.profileId || profiles[0]?.id;
      if (profileId) {
        await syncSessionToCloud(session, profileId);
      }
    }
    
    // 3. Sync case study (linked to the current/first profile for now)
    const currentProfileId = getCurrentProfileId() || profiles[0]?.id;
    if (caseStudy && currentProfileId) {
      await syncCaseStudyToCloud(currentProfileId, caseStudy);
    }

    return { success: true };
  } catch (e: any) {
    console.error('Basira Sync Failed:', e);
    return { success: false, error: e.message || 'Unknown sync error' };
  }
}
