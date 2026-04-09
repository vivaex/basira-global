// lib/domain/scoring/norms/norm_tables.ts
import { StandardScoreResult } from '../../../types';

/**
 * Interface for normalized score lookups.
 * Every diagnostic game must have a corresponding entry in a NormTable.
 */
export interface NormTable {
  /**
   * Looks up the standard score for a given domain, age, and raw score.
   * @param domainId The specific identifier for the cognitive construct (e.g., 'phonological-awareness')
   * @param age The student's age in years
   * @param rawScore The raw percentage (0-100) or count from the game
   * @returns A result containing standard score, percentile, and clinical classification
   */
  lookup(domainId: string, age: number, rawScore: number): StandardScoreResult;
}

/**
 * Standard Score classification based on WISC-V / CTOPP-2 thresholds.
 */
/**
 * Standard Score classification based on WISC-V / CTOPP-2 thresholds.
 */
export function getClassification(standardScore: number): string {
  if (standardScore >= 130) return 'Very Superior';
  if (standardScore >= 120) return 'Superior';
  if (standardScore >= 110) return 'High Average';
  if (standardScore >= 90)  return 'Average';
  if (standardScore >= 80)  return 'Low Average';
  if (standardScore >= 70)  return 'Borderline';
  return 'Extremely Low';
}

/**
 * Programmatic approximation of norm tables (Phase 3).
 * Uses a linear growth model to estimate means for cognitive development between ages 4-24.
 */
export class ApproximateNormTable implements NormTable {
  
  // Approximate means for different domains (at age 10)
  // These are placeholders for real empirical data
  private domainMeans: Record<string, { baseMean: number; growthRate: number }> = {
    'visual-discrimination': { baseMean: 60, growthRate: 2 },   // TVPS-4 Proxy
    'phonological-awareness': { baseMean: 50, growthRate: 3 },  // CTOPP-2 Proxy
    'rapid-naming':          { baseMean: 40, growthRate: 1.5 }, // RAN/RAS Proxy
    'working-memory':       { baseMean: 55, growthRate: 2.5 }, // WISC-V WMI Proxy
    'processing-speed':     { baseMean: 45, growthRate: 3 },   // WISC-V PSI Proxy
    'adhd-cpt':             { baseMean: 65, growthRate: 1.2 }, // CPT-3 Proxy
    'math-counting':        { baseMean: 50, growthRate: 3.5 }, // KeyMath-3 Proxy
    'motor-tapping':        { baseMean: 70, growthRate: 0.8 }, // Motor Index
    'subitizing':           { baseMean: 60, growthRate: 2.2 }, // Visual Enumeration
  };

  lookup(domainId: string, age: number, rawScore: number): StandardScoreResult {
    const domain = this.domainMeans[domainId] || { baseMean: 50, growthRate: 2 };
    
    // Simple linear approximation of Mean for a given age (clamped at 24)
    const effectiveAge = Math.min(age || 10, 24);
    const ageOffset = effectiveAge - 10;
    const mean = domain.baseMean + (ageOffset * domain.growthRate);
    
    // Standard Score = 100 + 15 * (Raw - Mean) / SD
    // Using a fixed SD of 15 for the programmatic approximation
    const sd = 15;
    const zScore = (rawScore - mean) / 10; // Scaling raw to a z-score relative to our proxy mean
    let standardScore = Math.round(100 + (zScore * 15));
    
    // Clamp standard scores to typical clinical range [40 - 160]
    standardScore = Math.max(40, Math.min(160, standardScore));

    // Percentile approximation (simplified)
    const percentile = this.estimatePercentile(standardScore);

    return {
      standardScore,
      percentile,
      classification: getClassification(standardScore),
      clinicalSource: this.getSourceName(domainId)
    };
  }

  private estimatePercentile(ss: number): number {
    // Normal CDF Approximation (Abramowitz & Stegun)
    const z = (ss - 100) / 15;
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp(-z * z / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    
    let percentile = z > 0 ? 1 - p : p;
    
    // Clamp and format
    let result = Math.round(percentile * 100);
    if (result < 1) return 1;
    if (result > 99) return 99;
    return result;
  }

  private getSourceName(domainId: string): string {
    const sources: Record<string, string> = {
      'visual-discrimination': 'TVPS-4 Proxy (Visual Perceptual)',
      'phonological-awareness': 'CTOPP-2 Proxy (Phonological)',
      'rapid-naming': 'RAN/RAS Proxy (Literacy Fluency)',
      'working-memory': 'WISC-V WMI Proxy (Working Memory)',
      'processing-speed': 'WISC-V PSI Proxy (Processing Speed)',
      'attention-vigilance': 'CPT-3 Proxy (Attention/Vigilance)',
      'adhd-cpt': 'CPT-3 Proxy (Attention/Vigilance)',
      'math-counting': 'KeyMath-3 Proxy (Numerical Logic)',
      'motor-tapping': 'Motor Precision Index',
      'subitizing': 'Visual Enumeration Protocol',
      'anxiety': 'Wellbeing Wellbeing Indicators (Generalized)',
      'autism': 'Autism Spectrum Support Level Index',
      'social_comm': 'Pragmatic Language Index',
    };
    return sources[domainId] || 'Clinical Assessment Proxy (Normalized)';
  }
}

export const defaultNormTable = new ApproximateNormTable();
