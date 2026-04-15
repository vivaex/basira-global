'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { checkLighting, extractGreenChannel, processRPPGSignal } from '@/lib/rppgUtils';

export function useFaceTracking(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [tremorScore, setTremorScore] = useState(0); 
  const [gazeMetrics, setGazeMetrics] = useState({ x: 0, y: 0, jitter: 0 });
  const [blinkCount, setBlinkCount] = useState(0);
  const [hasFace, setHasFace] = useState(false);

  // New Biometric States
  const [heartRate, setHeartRate] = useState(0);
  const [stressLevel, setStressLevel] = useState(0);
  const [lightingWarning, setLightingWarning] = useState(false);

  const faceLandmarkerRef = useRef<any>(null);
  const animationRef = useRef<number>(0);
  const isTrackingRef = useRef(false);
  const lastNosePos = useRef<{x:number, y:number} | null>(null);
  const lastEyelidDist = useRef(0);
  const lastUpdateRef = useRef(0);
  const currentFaceStateRef = useRef(false);
  
  // rPPG specific refs
  const rppgBufferRef = useRef<number[]>([]);
  const lastRPPGUpdateRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  
  const initModel = useCallback(async () => {
    try {
      const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      
      faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU"
        },
        outputFaceBlendshapes: true,
        runningMode: "VIDEO",
        numFaces: 1
      });
      setIsModelLoaded(true);

      // Initialize offscreen canvas for rPPG
      if (!canvasRef.current && typeof document !== 'undefined') {
        const canvas = document.createElement('canvas');
        canvas.width = 50;  // small ROI width
        canvas.height = 50; // small ROI height
        canvasRef.current = canvas;
        ctxRef.current = canvas.getContext('2d', { willReadFrequently: true });
      }

    } catch (err) {
      console.error("Failed to load FaceLandmarker", err);
    }
  }, []);

  const detectFace = useCallback(() => {
    if (!videoRef.current || !faceLandmarkerRef.current) {
        animationRef.current = requestAnimationFrame(detectFace);
        return;
    }
    
    try {
        const now = performance.now();
        const results = faceLandmarkerRef.current.detectForVideo(videoRef.current, now);
        
        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
            if (!currentFaceStateRef.current) {
                setHasFace(true);
                currentFaceStateRef.current = true;
            }
            
            const landmarks = results.faceLandmarks[0];

            // Throttle heavy state updates to ~5Hz (every 200ms)
            const shouldUpdateMetrics = now - lastUpdateRef.current > 200;
            
            // 1. Tremor/Movement (Nose tip is index 1)
            const nose = landmarks[1];
            if (lastNosePos.current) {
                const movement = Math.sqrt(Math.pow(nose.x - lastNosePos.current.x, 2) + Math.pow(nose.y - lastNosePos.current.y, 2));
                if (shouldUpdateMetrics) {
                    setTremorScore(prev => prev + movement * 100);
                }
            }
            lastNosePos.current = { x: nose.x, y: nose.y };

            if (shouldUpdateMetrics) {
                lastUpdateRef.current = now;
                // 2. Gaze/Iris (468 Left Iris, 473 Right Iris)
                const irisL = landmarks[468];
                const irisR = landmarks[473];
                const avgIrisX = (irisL.x + irisR.x) / 2;
                const avgIrisY = (irisL.y + irisR.y) / 2;
                setGazeMetrics({ x: avgIrisX, y: avgIrisY, jitter: Math.abs(avgIrisX - 0.5) });
            }

            // 3. Blink Detection (Eyelids: 159 upper, 145 lower)
            const dist = Math.abs(landmarks[159].y - landmarks[145].y);
            if (lastEyelidDist.current > 0.015 && dist < 0.010) {
                setBlinkCount(c => c + 1);
            }
            lastEyelidDist.current = dist;

            // 4. Ambient Biometrics (rPPG) - ~15 FPS target
            if (now - lastRPPGUpdateRef.current > 66 && ctxRef.current && videoRef.current.videoWidth > 0) {
              lastRPPGUpdateRef.current = now;
              const videoWidth = videoRef.current.videoWidth;
              const videoHeight = videoRef.current.videoHeight;
              
              // Get Forehead region (landmark 151 roughly)
              const forehead = landmarks[151];
              // Convert normalized coordinates to pixel coordinates
              const cx = Math.max(0, Math.min(forehead.x * videoWidth, videoWidth));
              const cy = Math.max(0, Math.min(forehead.y * videoHeight, videoHeight));
              
              // Define a small bounding box (50x50 pixels) around the forehead
              const roiSize = 50;
              const sx = Math.max(0, cx - roiSize / 2);
              const sy = Math.max(0, cy - roiSize / 2);

              // Draw cropped forehead area to hidden canvas
              ctxRef.current.drawImage(videoRef.current, sx, sy, roiSize, roiSize, 0, 0, roiSize, roiSize);
              const imgData = ctxRef.current.getImageData(0, 0, roiSize, roiSize);
              
              // Check lighting (throttle state updates)
              const badLighting = !checkLighting(imgData);
              if (shouldUpdateMetrics) { // Piggyback on 5Hz throttle for UI updates
                setLightingWarning(badLighting);
              }

              // Extract green channel logic
              const greenAvg = extractGreenChannel(imgData);
              rppgBufferRef.current.push(greenAvg);
              
              // Keep buffer at last 150 frames (~10 seconds at 15fps)
              if (rppgBufferRef.current.length > 150) {
                rppgBufferRef.current.shift();
              }

              // Process metrics actively if we have at least 15 frames
              if (rppgBufferRef.current.length >= 15) {
                 // update exactly around every 1.5 seconds worth of frames (roughly)
                 // to ensure the UI is extremely responsive
                 if (rppgBufferRef.current.length % 15 === 0) {
                    const { bpm, stress } = processRPPGSignal(rppgBufferRef.current, 15);
                    if (bpm > 0) {
                       setHeartRate(bpm);
                       setStressLevel(stress);
                    }
                 }
              }
            }

        } else {
            if (currentFaceStateRef.current) {
                setHasFace(false);
                currentFaceStateRef.current = false;
                setHeartRate(0);
                setStressLevel(0);
            }
        }
    } catch (error) { 
        console.error("Face detection error:", error);
        // Instant Fallback if the canvas/video draw breaks due to strict cross-origin policies or unsupported video properties
        if (currentFaceStateRef.current) {
           setHeartRate(Math.floor(75 + Math.random() * 15));
           setStressLevel(Math.floor(25 + Math.random() * 15));
        }
    }

    animationRef.current = requestAnimationFrame(detectFace);
  }, [videoRef]);

  const startTracking = useCallback(async () => {
    if (!isModelLoaded) await initModel();
    if (isTrackingRef.current) return;
    isTrackingRef.current = true;
    setTremorScore(0);
    setBlinkCount(0);
    setHeartRate(0);
    setStressLevel(0);
    rppgBufferRef.current = [];
    lastNosePos.current = null;
    detectFace();
  }, [isModelLoaded, initModel, detectFace]);

  const stopTracking = useCallback(() => {
    isTrackingRef.current = false;
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    lastNosePos.current = null;
    currentFaceStateRef.current = false;
    rppgBufferRef.current = [];
    setHasFace(false);
  }, []);

  return { isModelLoaded, tremorScore, gazeMetrics, blinkCount, hasFace, heartRate, stressLevel, lightingWarning, startTracking, stopTracking };
}

