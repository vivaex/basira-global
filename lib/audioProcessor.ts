/**
 * lib/audioProcessor.ts
 * Real-time audio signal processing for Voice Emotion AI.
 */

export interface VoiceMetrics {
  pitch: number;    // Fundamental frequency in Hz
  energy: number;   // Volume in dB or relative (0-100)
  jitter: number;   // Pitch instability
  emotion: 'confident' | 'stressed' | 'hesitant' | 'neutral';
}

/**
 * Autocorrelation algorithm to detect the fundamental frequency (F0)
 * Ideal for speech in typical room environments.
 */
export function autoCorrelate(buffer: Float32Array, sampleRate: number): number {
  // Perform a quick sanity check: is there enough signal?
  let size = buffer.length;
  let rms = 0;

  for (let i = 0; i < size; i++) {
    rms += buffer[i] * buffer[i];
  }
  rms = Math.sqrt(rms / size);

  if (rms < 0.01) return -1; // Signal too weak

  let r1 = 0, r2 = size - 1, thres = 0.2;
  for (let i = 0; i < size / 2; i++) {
    if (Math.abs(buffer[i]) < thres) {
      r1 = i;
      break;
    }
  }
  for (let i = 1; i < size / 2; i++) {
    if (Math.abs(buffer[size - i]) < thres) {
      r2 = size - i;
      break;
    }
  }

  buffer = buffer.slice(r1, r2);
  size = buffer.length;

  const c = new Array(size).fill(0);
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size - i; j++) {
      c[i] = c[i] + buffer[j] * buffer[j + i];
    }
  }

  let d = 0;
  while (c[d] > c[d + 1]) d++;
  
  let maxval = -1, maxpos = -1;
  for (let i = d; i < size; i++) {
    if (c[i] > maxval) {
      maxval = c[i];
      maxpos = i;
    }
  }

  let T0 = maxpos;

  // Interpolation for better precision
  let x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
  let a = (x1 + x3 - 2 * x2) / 2;
  let b = (x3 - x1) / 2;
  if (a) T0 = T0 - b / (2 * a);

  return sampleRate / T0;
}

/**
 * Calculate Root Mean Square energy and convert to relative score (0-100)
 */
export function calculateEnergy(buffer: Float32Array): number {
  let rms = 0;
  for (let i = 0; i < buffer.length; i++) {
    rms += buffer[i] * buffer[i];
  }
  rms = Math.sqrt(rms / buffer.length);
  // Normalize to 0-100 (logarithmic feeling)
  return Math.min(100, Math.max(0, 20 * Math.log10(rms * 10) + 50));
}

/**
 * Maps raw metrics to emotional states based on child-normalized baselines.
 * @param pitch Current pitch in Hz
 * @param energy Current energy (0-100)
 * @param jitter Stability of pitch
 */
export function mapVoiceToEmotion(
  pitch: number, 
  energy: number, 
  jitter: number
): VoiceMetrics['emotion'] {
  // Baseline for children: 250Hz - 450Hz
  // Stress often manifests as sudden pitch rises or extreme jitter
  
  if (energy < 15) return 'hesitant';
  if (jitter > 15 || (pitch > 450 && energy > 60)) return 'stressed';
  if (pitch > 200 && energy > 40 && jitter < 5) return 'confident';
  
  return 'neutral';
}
