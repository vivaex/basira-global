import { TestSession, getAllTestSessions, getStudentProfile, saveStudentProfile } from './studentProfile';
import { TranslationKey } from './translations';

export interface DailyMission {
  id: string;
  titleKey: TranslationKey;
  descKey: TranslationKey;
  targetCategory: string;
  requiredCount: number;
  rewardCoins: number;
  icon: string;
  path: string;
}

const MISSION_POOL: DailyMission[] = [
  { id: 'math_pro',      titleKey: 'm_math_title',    descKey: 'm_math_desc',    targetCategory: 'math',      requiredCount: 2, rewardCoins: 20, icon: '🔢', path: '/diagnose/math' },
  { id: 'reading_giant', titleKey: 'm_reading_title', descKey: 'm_reading_desc', targetCategory: 'reading',   requiredCount: 1, rewardCoins: 15, icon: '📖', path: '/diagnose/reading' },
  { id: 'focus_ninja',   titleKey: 'm_focus_title',   descKey: 'm_focus_desc',   targetCategory: 'attention', requiredCount: 2, rewardCoins: 25, icon: '🎯', path: '/diagnose/attention' },
  { id: 'motor_master',  titleKey: 'm_motor_title',   descKey: 'm_motor_desc',   targetCategory: 'motor',     requiredCount: 2, rewardCoins: 20, icon: '🏃‍♂️', path: '/diagnose/motor' },
  { id: 'social_star',   titleKey: 'm_social_title',  descKey: 'm_social_desc',  targetCategory: 'social',    requiredCount: 1, rewardCoins: 15, icon: '🎭', path: '/diagnose/social' },
  { id: 'memory_king',   titleKey: 'm_memory_title',  descKey: 'm_memory_desc',  targetCategory: 'cognitive', requiredCount: 1, rewardCoins: 15, icon: '🧠', path: '/diagnose/cognitive' },
];

/**
 * Deterministic mission generator based on current date
 */
export function getDailyMissions(): DailyMission[] {
  if (typeof window === 'undefined') return [];
  
  const today = new Date().toISOString().split('T')[0];
  const seed = today.split('-').reduce((a, b) => a + parseInt(b), 0);
  
  // Pick 3 missions based on seed
  const missions: DailyMission[] = [];
  for (let i = 0; i < 3; i++) {
    const idx = (seed + i * 7) % MISSION_POOL.length;
    // ensure no duplicates
    if (!missions.find(m => m.id === MISSION_POOL[idx].id)) {
        missions.push(MISSION_POOL[idx]);
    }
  }
  
  // Fallback if duplicates happened
  if (missions.length < 3) {
      missions.push(MISSION_POOL.find(p => !missions.includes(p)) || MISSION_POOL[0]);
  }

  return missions;
}

export function checkMissionProgress(mission: DailyMission, sessions: TestSession[]): { current: number, total: number, isClaimed: boolean } {
  const today = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter(s => s.completedAt.startsWith(today));
  
  const current = todaySessions.filter(s => {
      if (mission.id === 'reading_giant') return s.testCategory === 'reading' && s.rawScore >= 70;
      return s.testCategory === mission.targetCategory;
  }).length;

  const isClaimedKey = `basira_mission_claimed_${mission.id}_${today}`;
  const isClaimed = typeof window !== 'undefined' && localStorage.getItem(isClaimedKey) === 'true';

  return { current: Math.min(current, mission.requiredCount), total: mission.requiredCount, isClaimed };
}

export function claimMissionReward(mission: DailyMission): boolean {
  const today = new Date().toISOString().split('T')[0];
  const isClaimedKey = `basira_mission_claimed_${mission.id}_${today}`;
  
  if (typeof window === 'undefined' || localStorage.getItem(isClaimedKey) === 'true') return false;
  
  const profile = getStudentProfile();
  if (profile) {
    profile.coins = (profile.coins || 0) + mission.rewardCoins;
    saveStudentProfile(profile);
    localStorage.setItem(isClaimedKey, 'true');
    return true;
  }
  return false;
}
