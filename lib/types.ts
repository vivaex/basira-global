// lib/types.ts
// Central Type definitions for Basira

export type Gender = 'male' | 'female' | 'not_specified';
export type AcademicLevel = 'excellent' | 'good' | 'average' | 'weak' | 'very_weak';
export type YesNoSometimes = 'yes' | 'no' | 'sometimes';

export interface StudentProfile {
  id: string;
  name: string;
  age: number | null;
  gender: Gender;
  grade: string;
  primaryLanguage: string;
  otherLanguages: string[];
  hasHearingIssues: YesNoSometimes;
  hasVisionIssues: YesNoSometimes;
  wearsGlasses: boolean;
  wearsHearingAid: boolean;
  hasSeizureHistory: boolean;
  takesMedication: boolean;
  medicationNotes: string;
  difficultiesIn: {
    reading: boolean;
    writing: boolean;
    math: boolean;
    comprehension: boolean;
    attention: boolean;
  };
  problemStartedWhen: string;
  hardestSubjects: string[];
  currentAcademicLevel: AcademicLevel;
  excessiveMovement: YesNoSometimes;
  losesConcentrationQuickly: YesNoSometimes;
  forgetsInstructions: YesNoSometimes;
  testAnxiety: YesNoSometimes;
  completesHomework: YesNoSometimes;
  familyLearningDifficulties: boolean;
  familyADHDOrAutism: boolean;
  familyNotes: string;
  preliminaryDiagnosis: {
    autismSpectrum: boolean;
    socialCommunication: boolean;
    anxietyDisorder: boolean;
    specialDisabilityNotes: string;
  };
  coins: number;
  xp: number;
  level: number;
  unlockedItems: string[];
  equippedItems: {
    skin: string;
    hat: string;
    accessory: string;
  };
  createdAt: string;
  updatedAt: string;
  clinicId?: string;
  specialistId?: string;
  syncStatus?: 'synced' | 'local_only' | 'pending';
}

export interface Clinic {
  id: string;
  name: string;
  licenseNumber: string;
  location: string;
  contactEmail: string;
  logo?: string;
}

export interface Specialist {
  id: string;
  name: string;
  role: 'doctor' | 'therapist' | 'special_ed';
  email: string;
  clinicId: string;
  licenseNumber: string;
}

export interface PreTestReadiness {
  studentState: 'comfortable' | 'tired' | 'okay';
  ateFood: boolean;
  sleptWell: boolean;
  roomIsQuiet: boolean;
  lightingAdequate: boolean;
  micAvailable: boolean;
  cameraAvailable: boolean;
  internetQuality: 'good' | 'weak' | 'unknown';
  timestamp: string;
}

export type ErrorType = 'wrong_answer' | 'too_fast' | 'too_slow' | 'skipped';

export interface RoundDetail {
  roundIndex: number;
  isCorrect: boolean;
  errorType: ErrorType | null;
  timeSpentMs: number;
  reactionTimeMs?: number;
  strokeCount?: number;
  avgStrokeSpeedPx?: number;
  speechClarity?: number;
  stutterCount?: number;
}

export interface AttentionMetrics {
  tabSwitchCount: number;
  inactivityCount: number;
  totalTestDurationMs: number;
}

export interface EmotionalIndicators {
  frustrationEvents: number;
  impulsivityEvents: number;
}

export type SkillLevel = 'excellent' | 'average' | 'weak' | 'very_weak';
export type DifficultyType =
  | 'phonological_dyslexia'
  | 'visual_dyslexia'
  | 'dysgraphia_motor'
  | 'dyscalculia_conceptual'
  | 'attention_deficit'
  | 'working_memory_visual'
  | 'working_memory_verbal'
  | 'executive_dysfunction'
  | 'autism_spectrum'
  | 'social_communication'
  | 'anxiety_disorder'
  | 'none';

export type DifficultyLevel = 'none' | 'mild' | 'moderate' | 'severe';

export interface StandardScoreResult {
  standardScore: number;
  percentile: number;
  classification: string;
  clinicalSource: string;
}

export interface PostTestAnalysis {
  skillLevel: SkillLevel;
  difficultyLevel: DifficultyLevel;
  difficultyType: DifficultyType[];
  errorPatterns: string[];
  strengths: string[];
  weaknesses: string[];
  standardScore: number;
  percentile: number;
  classification: string;
  confidenceInterval?: [number, number];
  clinicalSource?: string;
  comorbidities?: ComorbidityFlag[];
  requiresProfessionalReview?: boolean;
}

export interface ResponseRecord {
  gameId: string;
  domainId: string;
  trialNumber: number;
  itemDifficulty: number;
  timestampDisplayed: number;
  timestampFirstTouch: number;
  timestampResponded: number;
  responseValue: any;
  isCorrect: boolean;
  hesitationDuration: number;
  responseDuration: number;
  selfCorrected: boolean;
  metadata: Record<string, any>;
}

export interface DomainResult {
  domainId: string;
  standardScore: number;
  percentile: number;
  classification: string;
  confidenceInterval: [number, number];
  itemCount: number;
  accuracyRate: number;
  averageResponseTime: number;
  consistencyScore: number;
  qualitativeFindings: string[];
}

export interface ComorbidityFlag {
  id: string;
  label: string;
  probability: number;
  evidence: string[];
}

export interface TestSession {
  id: string;
  testId: string;
  testCategory: string;
  testTitle: string;
  preTestReadiness: PreTestReadiness | null;
  rounds: RoundDetail[];
  interactions?: ResponseRecord[]; // New granular data
  attention: AttentionMetrics;
  emotional: EmotionalIndicators;
  rawScore: number;
  theta?: number; // Ability estimate from IRT
  domainId?: string; // Primary domain being measured
  postAnalysis: PostTestAnalysis | null;
  completedAt: string;
}

export interface LearningPassport {
  studentProfile: StudentProfile | null;
  sessions: TestSession[];
  progressByCategory: Record<string, number[]>;
  learningStyleGuess: 'visual' | 'auditory' | 'kinesthetic' | 'mixed' | 'unknown';
  weakFocusTimes: string[];
  motivators: string[];
  treatmentProgress: {
    completedGoals: string[];
    currentFocus: string[];
    teacherRecommendations: string[];
  };
  generatedAt: string;
}

export interface CaseStudy {
  generalInfo: {
    fullName: string;
    age: string;
    gender: 'male' | 'female' | '';
    grade: string;
    schoolSystem: string;
    homeLanguages: string;
    readingLanguages: string;
  };
  medicalHistory: {
    pregnancyComplications: YesNoSometimes;
    prematureBirth: YesNoSometimes;
    birthType: 'natural' | 'cesarean' | '';
    oxygenDeprivation: YesNoSometimes;
    highFevers: YesNoSometimes;
    severeJaundice: YesNoSometimes;
    seizures: YesNoSometimes;
    glandHormoneIssues: YesNoSometimes;
    hearingLoss: YesNoSometimes;
    hearingAid: YesNoSometimes;
    visionLoss: YesNoSometimes;
    glasses: YesNoSometimes;
    previousCheckups: YesNoSometimes;
    chronicMedications: YesNoSometimes;
    adhdMedications: YesNoSometimes;
  };
  developmentalHistory: {
    sittingAge: string;
    walkingAge: string;
    balanceIssues: YesNoSometimes;
    fineMotorIssues: YesNoSometimes;
    firstWordAge: string;
    speechDelay: YesNoSometimes;
    pronunciationIssues: YesNoSometimes;
    eyeContact: YesNoSometimes;
    playsWithKids: YesNoSometimes;
    fearsNewSituations: YesNoSometimes;
  };
  academicHistory: {
    difficultyStart: string;
    startedInFirstGrade: YesNoSometimes;
    hardestSubject: string;
    readingStruggle: YesNoSometimes;
    mixesLetters: YesNoSometimes;
    writesSlowly: YesNoSometimes;
    countingStruggle: YesNoSometimes;
    memorizedTimesTable: YesNoSometimes;
    understandsButCantSolve: YesNoSometimes;
    spellingIssues: YesNoSometimes;
    needsExtraTime: YesNoSometimes;
    feelsFrustrated: YesNoSometimes;
    refusesStudying: YesNoSometimes;
  };
  behaviorAttention: {
    movesA_lot: YesNoSometimes;
    interruptsOthers: YesNoSometimes;
    forgetsInstructions: YesNoSometimes;
    cantSitLong: YesNoSometimes;
    easilyDistracted: YesNoSometimes;
    delaysHomework: YesNoSometimes;
    getsAngryFast: YesNoSometimes;
    testAnxiety: YesNoSometimes;
  };
  familyBackground: {
    historyLearningDisabilities: YesNoSometimes;
    historyDyslexia: YesNoSometimes;
    historyAdhd: YesNoSometimes;
    historyAutism: YesNoSometimes;
    historyHighIntelligence: YesNoSometimes;
    livesWithBothParents: YesNoSometimes;
    familyConflicts: YesNoSometimes;
    frequentSchoolChanges: YesNoSometimes;
    homeworkFollowUp: YesNoSometimes;
    dailyStudyHours: string;
  };
  psychologicalInfo: {
    anxiety: YesNoSometimes;
    examFear: YesNoSometimes;
    schoolEvasion: YesNoSometimes;
    feelsLessIntelligent: YesNoSometimes;
    bullied: YesNoSometimes;
    selfConfidence: YesNoSometimes;
  };
  dyslexiaIndicators: {
    mixesSimilarLetters: YesNoSometimes;
    reversesLetters: YesNoSometimes;
    readsVerySlowly: YesNoSometimes;
    losesPlaceWhileReading: YesNoSometimes;
  };
  dysgraphiaIndicators: {
    illegibleHandwriting: YesNoSometimes;
    frequentSpellingMistakes: YesNoSometimes;
    wrongPenGrip: YesNoSometimes;
    writesSlowly: YesNoSometimes;
    strugglesCopyingSentences: YesNoSometimes;
  };
  dyscalculiaIndicators: {
    countingDifficulty: YesNoSometimes;
    mixesNumbers: YesNoSometimes;
    basicOperationsDifficulty: YesNoSometimes;
    getsLostSolvingMath: YesNoSometimes;
    cantUnderstandSymbols: YesNoSometimes;
  };
  executiveFunction: {
    organizesBag: YesNoSometimes;
    knowsStepsOrder: YesNoSometimes;
    losesItems: YesNoSometimes;
    forgetsAssignments: YesNoSometimes;
    planningDifficulty: YesNoSometimes;
  };
  finalQuestion: {
    top3Challenges: string[];
  };
  completedAt: string | null;
}

export interface ClinicalSummary {
  domainScores: Record<string, number>;
  domainStandardScores?: Record<string, number>;
  findings: string[];
  recommendations: string[];
}
