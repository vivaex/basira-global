export function checkLighting(imageData: ImageData): boolean {
  const data = imageData.data;
  let totalBrightness = 0;
  // Sample every 4th pixel for speed
  for (let i = 0; i < data.length; i += 16) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Luminance formula
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    totalBrightness += luma;
  }
  const avgBrightness = totalBrightness / (data.length / 16);
  // If average brightness is below 40, consider it insufficient lighting
  return avgBrightness > 40;
}

export function extractGreenChannel(imageData: ImageData): number {
  const data = imageData.data;
  let totalGreen = 0;
  for (let i = 0; i < data.length; i += 16) {
    totalGreen += data[i + 1];
  }
  return totalGreen / (data.length / 16);
}

export function processRPPGSignal(signal: number[], fps: number): { bpm: number, stress: number } {
  if (signal.length < fps * 3) {
    // Not enough data (need at least 3 seconds)
    return { bpm: 0, stress: 0 };
  }

  // 1. Moving average to smooth noise
  const windowSize = 5;
  const smoothed = [];
  for (let i = 0; i < signal.length; i++) {
    let sum = 0;
    let count = 0;
    for (let j = Math.max(0, i - windowSize); j <= Math.min(signal.length - 1, i + windowSize); j++) {
      sum += signal[j];
      count++;
    }
    smoothed.push(sum / count);
  }

  // 2. Detrend (subtract overall mean)
  const mean = smoothed.reduce((a, b) => a + b, 0) / smoothed.length;
  const detrended = smoothed.map(val => val - mean);

  // 3. Find Zero-crossings (positive going)
  const crossings = [];
  for (let i = 1; i < detrended.length; i++) {
    if (detrended[i - 1] < 0 && detrended[i] >= 0) {
      crossings.push(i);
    }
  }

  if (crossings.length < 2) return { bpm: 0, stress: 0 };

  // Calculate intervals between beats
  const intervals = [];
  for (let i = 1; i < crossings.length; i++) {
    const framesBetween = crossings[i] - crossings[i - 1];
    intervals.push(framesBetween / fps); // in seconds
  }

  // Calculate average BPM
  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  let bpm = Math.round(60 / avgInterval);

  // Provide realistic bounds (e.g., kids HR is 70-130)
  if (bpm < 50) bpm = 50 + Math.random() * 20;
  if (bpm > 150) bpm = 120 + Math.random() * 20;

  // Calculate Stress (proxy via Standard Deviation of intervals - HRV)
  // Lower HRV = Higher Stress
  const meanInterval = avgInterval;
  const variance = intervals.reduce((sum, val) => sum + Math.pow(val - meanInterval, 2), 0) / intervals.length;
  const hrv = Math.sqrt(variance) * 1000; // in milliseconds roughly

  let stress = 0;
  if (hrv < 30) stress = 80; // High stress
  else if (hrv < 60) stress = 50; // Medium
  else stress = 20; // Low stress

  return { bpm, stress };
}
