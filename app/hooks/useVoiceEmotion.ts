'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { autoCorrelate, calculateEnergy, mapVoiceToEmotion, VoiceMetrics } from '@/lib/audioProcessor';

export function useVoiceEmotion() {
  const [metrics, setMetrics] = useState<VoiceMetrics>({
    pitch: 0,
    energy: 0,
    jitter: 0,
    emotion: 'neutral'
  });
  const [isRecording, setIsRecording] = useState(false);
  const [waveformData, setWaveformData] = useState<Uint8Array>(new Uint8Array(0));

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>(0);
  const pitchHistoryRef = useRef<number[]>([]);

  const startMonitoring = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      setIsRecording(true);
      processAudio();
    } catch (err) {
      console.error("Mic access denied or error:", err);
    }
  }, []);

  const stopMonitoring = useCallback(() => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsRecording(false);
    setMetrics({ pitch: 0, energy: 0, jitter: 0, emotion: 'neutral' });
  }, []);

  const processAudio = () => {
    if (!analyserRef.current || !isRecording) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const timeDomainData = new Float32Array(analyser.fftSize);
    const frequencyData = new Uint8Array(bufferLength);

    analyser.getFloatTimeDomainData(timeDomainData);
    analyser.getByteFrequencyData(frequencyData);
    setWaveformData(new Uint8Array(frequencyData)); // For visualizers

    // 1. Detect Pitch
    const pitch = autoCorrelate(timeDomainData, audioContextRef.current!.sampleRate);
    
    // 2. Calculate Energy
    const energy = calculateEnergy(timeDomainData);

    // 3. Track History for Jitter
    if (pitch > 0) {
      pitchHistoryRef.current.push(pitch);
      if (pitchHistoryRef.current.length > 10) pitchHistoryRef.current.shift();
    }

    // Calculate Jitter (Stability)
    let jitter = 0;
    if (pitchHistoryRef.current.length > 2) {
      const diffs = [];
      for (let i = 1; i < pitchHistoryRef.current.length; i++) {
        diffs.push(Math.abs(pitchHistoryRef.current[i] - pitchHistoryRef.current[i-1]));
      }
      jitter = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    }

    // 4. Determine Emotion
    const emotion = mapVoiceToEmotion(pitch, energy, jitter);

    setMetrics({
      pitch: pitch > 0 ? pitch : 0,
      energy,
      jitter,
      emotion
    });

    animationRef.current = requestAnimationFrame(processAudio);
  };

  // Re-sync loop when isRecording changes
  useEffect(() => {
    if (isRecording) {
      animationRef.current = requestAnimationFrame(processAudio);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRecording]);

  useEffect(() => {
    return () => stopMonitoring();
  }, [stopMonitoring]);

  return { 
    metrics, 
    isRecording, 
    startMonitoring, 
    stopMonitoring, 
    waveformData 
  };
}
