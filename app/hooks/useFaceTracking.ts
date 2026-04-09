'use client';
import { useState, useRef, useCallback } from 'react';

export function useFaceTracking(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [tremorScore, setTremorScore] = useState(0); 
  const [gazeMetrics, setGazeMetrics] = useState({ x: 0, y: 0, jitter: 0 });
  const [blinkCount, setBlinkCount] = useState(0);
  const [hasFace, setHasFace] = useState(false);

  const faceLandmarkerRef = useRef<any>(null);
  const animationRef = useRef<number>(0);
  const isTrackingRef = useRef(false);
  const lastNosePos = useRef<{x:number, y:number} | null>(null);
  const lastEyelidDist = useRef(0);
  const lastUpdateRef = useRef(0);
  const currentFaceStateRef = useRef(false);
  
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

            // 3. Blink Detection (Eyelids: 159 upper, 145 lower) - High frequency needed, but we can still optimize
            const dist = Math.abs(landmarks[159].y - landmarks[145].y);
            if (lastEyelidDist.current > 0.015 && dist < 0.010) {
                // Rapid closure detected
                setBlinkCount(c => c + 1);
            }
            lastEyelidDist.current = dist;

        } else {
            if (currentFaceStateRef.current) {
                setHasFace(false);
                currentFaceStateRef.current = false;
            }
        }
    } catch (error) { }

    animationRef.current = requestAnimationFrame(detectFace);
  }, [videoRef]);

  const startTracking = useCallback(async () => {
    if (!isModelLoaded) await initModel();
    if (isTrackingRef.current) return;
    isTrackingRef.current = true;
    setTremorScore(0);
    setBlinkCount(0);
    lastNosePos.current = null;
    detectFace();
  }, [isModelLoaded, initModel, detectFace]);

  const stopTracking = useCallback(() => {
    isTrackingRef.current = false;
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    lastNosePos.current = null;
    currentFaceStateRef.current = false;
    setHasFace(false);
  }, []);

  return { isModelLoaded, tremorScore, gazeMetrics, blinkCount, hasFace, startTracking, stopTracking };
}
