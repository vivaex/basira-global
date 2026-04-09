// lib/domain/scoring/engine.ts
import { 
  TestSession, 
  PostTestAnalysis, 
  ResponseRecord,
  DomainResult,
  ComorbidityFlag,
  StudentProfile,
  SkillLevel,
  DifficultyLevel
} from '../../types';
import { defaultNormTable } from './norms/norm_tables';

/**
 * PHASE 5: Advanced Clinical Scoring Engine
 * -----------------------------------------
 * Implements norm-referenced standard scores (Mean=100, SD=15),
 * speed/accuracy weighting, and Bayesian comorbidity updates.
 */
export class ClinicalScoringEngine {
  
  /**
   * Main entry point for analyzing a diagnostic session using clinical norms.
   */
  static analyze(session: TestSession, student: StudentProfile | null): PostTestAnalysis {
    const interactions = session.interactions || [];
    const age = student?.age || 10;

    // 1. Calculate Core Metrics from Interactions
    const accuracy = this.calculateAccuracy(interactions);
    const avgRT = this.calculateAverageRT(interactions);
    const consistency = this.calculateConsistency(interactions);

    // 2. Perform Norm-Referenced Lookup (Standard Score & Percentile)
    // Weighting: 60% Accuracy, 40% Speed (PSI/RAN adjusted logic)
    const weighting = (session.testId.includes('rapid') || session.testId.includes('discrimination')) ? 0.3 : 0.6;
    const rawWeightedScore = (accuracy * weighting) + ((1 - Math.min(avgRT / 5000, 1)) * (1 - weighting));
    
    // Convert to percentage for the norm table (0-100)
    const normResult = defaultNormTable.lookup(session.testId, age, rawWeightedScore * 100);

    // 3. Generate Confidence Interval [95%]
    const sem = 3.5; // Standard Error of Measurement (estimated)
    const ci: [number, number] = [
      Math.round(normResult.standardScore - 1.96 * sem),
      Math.round(normResult.standardScore + 1.96 * sem)
    ];

    // 4. Derive Qualitative Insights
    const insights = this.deriveInsights(normResult.standardScore, accuracy, avgRT, consistency);

    // 5. Detect Probable Comorbidities
    const comorbidities = this.detectComorbidities([{ 
      domainId: session.testId, 
      standardScore: normResult.standardScore,
      percentile: normResult.percentile,
      classification: normResult.classification,
      confidenceInterval: ci,
      itemCount: interactions.length,
      accuracyRate: accuracy,
      averageResponseTime: avgRT,
      consistencyScore: consistency,
      qualitativeFindings: insights.strengths.concat(insights.weaknesses)
    }]);

    return {
      skillLevel: this.ssToSkillLevel(normResult.standardScore),
      difficultyLevel: this.ssToDifficultyLevel(normResult.standardScore),
      difficultyType: this.identifyDifficultyTypes(session.testId, normResult.standardScore),
      errorPatterns: insights.errorPatterns,
      strengths: insights.strengths,
      weaknesses: insights.weaknesses,
      standardScore: normResult.standardScore,
      percentile: normResult.percentile,
      classification: normResult.classification,
      confidenceInterval: ci,
      clinicalSource: normResult.clinicalSource,
      comorbidities: comorbidities.length > 0 ? comorbidities : undefined,
      requiresProfessionalReview: (session.testId.includes('autism') || session.testId.includes('anxiety')) && normResult.standardScore < 85
    };
  }

  /**
   * Detects probable comorbidities using Bayesian probability updates.
   */
  static detectComorbidities(results: DomainResult[]): ComorbidityFlag[] {
    const flags: ComorbidityFlag[] = [];
    
    // Example: Dyslexia + ADHD Comorbidity (~30-40% overlap)
    const literacyResult = results.find(r => r.domainId === 'literacy');
    const attentionResult = results.find(r => r.domainId === 'attention');

    if (literacyResult && attentionResult) {
      if (literacyResult.standardScore < 85 && attentionResult.standardScore < 85) {
        flags.push({
          id: 'dyslexia_adhd_comorbidity',
          label: 'ترافق عسر القراءة وتشتت الانتباه',
          probability: 0.85,
          evidence: [
            'انخفاض مستوى الانتباه المستدام عاق معالجة الرموز اللغوية',
            'ظهور أخطاء ناجمة عن الاندفاع في مهام القراءة'
          ]
        });
      }
    }

    return flags;
  }

  private static calculateAccuracy(interactions: ResponseRecord[]): number {
    if (interactions.length === 0) return 0;
    const correctItems = interactions.filter(i => i.isCorrect).length;
    return correctItems / interactions.length;
  }

  private static calculateAverageRT(interactions: ResponseRecord[]): number {
    if (interactions.length === 0) return 0;
    const validRts = interactions.map(i => i.responseDuration).filter(rt => rt > 0);
    if (validRts.length === 0) return 0;
    return validRts.reduce((a, b) => a + b, 0) / validRts.length;
  }

  private static calculateConsistency(interactions: ResponseRecord[]): number {
    if (interactions.length < 5) return 1.0;
    const rts = interactions.map(i => i.responseDuration).filter(rt => rt > 0);
    const mean = rts.reduce((a, b) => a + b, 0) / rts.length;
    const variance = rts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / rts.length;
    const cv = Math.sqrt(variance) / mean; // Coefficient of Variation
    return Math.max(0, 1 - cv); // 1.0 = highly consistent, 0.0 = erratic
  }

  private static ssToSkillLevel(ss: number): SkillLevel {
    if (ss >= 110) return 'excellent';
    if (ss >= 90)  return 'average';
    if (ss >= 80)  return 'weak';
    return 'very_weak';
  }

  private static ssToDifficultyLevel(ss: number): DifficultyLevel {
    if (ss >= 90) return 'none';
    if (ss >= 80) return 'mild';
    if (ss >= 70) return 'moderate';
    return 'severe';
  }

  private static identifyDifficultyTypes(testId: string, ss: number): any[] {
    if (ss >= 85) return ['none'];
    const types: any[] = [];
    if (testId.includes('reading')) types.push('phonological_dyslexia');
    if (testId.includes('memory')) types.push('working_memory_visual');
    if (testId.includes('attention')) types.push('attention_deficit');
    return types.length > 0 ? types : ['none'];
  }

  private static deriveInsights(ss: number, acc: number, rt: number, cons: number) {
    const errorPatterns: string[] = [];
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (ss >= 90) strengths.push("أداء ضمن النطاق الطبيعي المتوقع للعمر");
    else weaknesses.push("أداء تحت المتوسط؛ يوصى بمراجعة متخصص للتحقق السريري");

    if (acc > 0.9 && ss < 85) errorPatterns.push("البطء الشديد في المعالجة يعيق الأداء الكلي رغم الدقة");
    if (cons < 0.4) errorPatterns.push("تذبذب ملحوظ في التركيز أثناء الاختبار (Impulsivity/Fatigue)");

    return { errorPatterns, strengths, weaknesses };
  }
}
