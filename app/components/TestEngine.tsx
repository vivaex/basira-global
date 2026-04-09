'use client';
import { useLanguage } from '@/app/components/LanguageContext';
import { useTTS } from '@/hooks/useTTS';
import SpeakButton from '@/app/components/ui/SpeakButton';
import BasirRobot from '@/app/components/BasirRobot';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { getTestConfig, TestConfig } from '@/lib/testsData';
import { saveTestSession, generateSessionId, RoundDetail, getStudentProfile, saveStudentProfile } from '@/lib/studentProfile';
import { useFaceTracking } from '@/app/hooks/useFaceTracking';
import { useSpeechAnalysis } from '@/app/hooks/useSpeechAnalysis';

export default function TestEngine({ testId, category }: { testId: string, category: string }) {
  const { language } = useLanguage();
  const { speak: speakTTS, isSpeaking } = useTTS();
  const [config, setConfig] = useState<TestConfig | null>(null);
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'result'>('lobby');
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  // --- Live Attention & Clinical Metrics ---
  const tabSwitchCount = useRef(0);
  const inactivityCount = useRef(0);
  const frustrationEvents = useRef(0);
  const impulsivityEvents = useRef(0);
  const lastActiveTime = useRef<number>(Date.now());
  const roundDetails = useRef<RoundDetail[]>([]);
  const testStartTime = useRef<number>(Date.now());
  const [robotMessage, setRobotMessage] = useState('');
  const lastRobotTime = useRef<number>(0);

  // 1. REACTION ENGINE
  const [reactionStartTime, setReactionStartTime] = useState<number>(0);
  const [reactionTargetVisible, setReactionTargetVisible] = useState(false);
  const [reactionTime, setReactionTime] = useState<number | null>(null);

  // 2. MEMORY ENGINE
  const [isMemoryShowing, setIsMemoryShowing] = useState(false);
  const [activeMemoryNum, setActiveMemoryNum] = useState<number | null>(null);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const lastAnsweredRoundRef = useRef<number | null>(null);

  // 3. CANVAS ENGINE
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnPath, setDrawnPath] = useState<{x:number, y:number}[]>([]);
  const [strokesCount, setStrokesCount] = useState(0);

  // 4. CAMERA ENGINE (AI ML FaceMesh)
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraAccess, setCameraAccess] = useState(false);
  const [cameraProgress, setCameraProgress] = useState(0);
  const { 
    isModelLoaded, tremorScore, gazeMetrics, blinkCount, hasFace, 
    startTracking, stopTracking 
  } = useFaceTracking(videoRef);
  
  const [aiSessionData, setAiSessionData] = useState({ 
    maxTremor: 0, 
    blinkTotal: 0, 
    gazeStabilityRatio: 0 
  });
  const [targetPos, setTargetPos] = useState({ x: 0.5, y: 0.5 });

  // Refs to avoid infinite loop with AI Camera dependency
  const tremorRef = useRef(tremorScore);
  const gazeJitterRef = useRef(gazeMetrics.jitter);
  useEffect(() => {
    tremorRef.current = tremorScore;
    gazeJitterRef.current = gazeMetrics.jitter;
  });

  const [deviceMotionScore, setDeviceMotionScore] = useState(0);
  const deviceMotionRef = useRef(0);

  useEffect(() => {
    if (gameState !== 'playing' || config?.engine !== 'AI_CAMERA') return;

    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (acc) {
        const totalAccel = Math.sqrt((acc.x || 0)**2 + (acc.y || 0)**2 + (acc.z || 0)**2);
        const delta = Math.abs(totalAccel - 9.8);
        if (delta > 0.5) {
          deviceMotionRef.current += delta * 5; // Reduced factor for balance
          setDeviceMotionScore(prev => prev + delta * 5);
        }
      }
    };

    const requestPermissionAndStart = async () => {
      if (typeof DeviceMotionEvent !== 'undefined' && typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        try {
          const response = await (DeviceMotionEvent as any).requestPermission();
          if (response === 'granted') {
            window.addEventListener('devicemotion', handleMotion);
          }
        } catch (err) { console.error("Motion Permission Denied", err); }
      } else {
        window.addEventListener('devicemotion', handleMotion);
      }
    };

    requestPermissionAndStart();
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [gameState, config]);

  // 5. NLP SPEECH ENGINE
  const { isListening, transcript, startListening, stopListening } = useSpeechAnalysis();

  useEffect(() => {
    setConfig(getTestConfig(testId));
  }, [testId]);

  // Handle Voice Match for NLP Quiz Answers
  useEffect(() => {
    if (gameState !== 'playing' || config?.engine !== 'QUIZ' || !transcript) return;
    
    const currentRoundOptions = config.rounds[round]?.options;
    if (currentRoundOptions) {
        const matchedOpt = currentRoundOptions.find(opt => 
            transcript.includes(opt) || opt.includes(transcript) || transcript.includes(config.rounds[round].correct as string)
        );
        if (matchedOpt) {
            stopListening();
            handleAnswer(matchedOpt);
        }
    }
  }, [transcript, gameState, round, config, stopListening]);

  // --- Clinical Tracking: Tab/Inactivity ---
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    testStartTime.current = Date.now();
    lastActiveTime.current = Date.now();

    const handleVisibilityChange = () => {
      if (document.hidden) tabSwitchCount.current += 1;
    };

    const resetInactivity = () => {
      lastActiveTime.current = Date.now();
    };

    const inactivityInterval = setInterval(() => {
       const now = Date.now();
       if (now - lastActiveTime.current > 8000) {
          inactivityCount.current += 1;
          const timeSinceLastMsg = now - lastRobotTime.current;
          if (timeSinceLastMsg > 5000) {
              setRobotMessage("أين ذهبت يا بطل؟ ركز معي لنكمل التحدي! 🤖✨");
              lastRobotTime.current = now;
              setTimeout(() => setRobotMessage(''), 4000);
          }
          lastActiveTime.current = now;
       }
    }, 3000);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("mousemove", resetInactivity);
    window.addEventListener("touchstart", resetInactivity);
    window.addEventListener("keydown", resetInactivity);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("mousemove", resetInactivity);
      window.removeEventListener("touchstart", resetInactivity);
      window.removeEventListener("keydown", resetInactivity);
      clearInterval(inactivityInterval);
    };
  }, [gameState]);

  // Handle Game Loop Starts
  useEffect(() => {
    if (gameState !== 'playing' || !config) return;

    const isRoundResolved = { current: false };

    if (config.engine === 'REACTION') {
      setReactionTargetVisible(false);
      setReactionTime(null);
      
      const delay = Math.random() * 2000 + 1000;
      const currentRound = config.rounds[round];
      
      // Stimulus timer
      const t = setTimeout(() => {
        setReactionTargetVisible(true);
        setReactionStartTime(Date.now());
      }, delay);

      // Auto-advance timer (Go/No-Go logic)
      const timeoutLimit = 3000 + delay; // Exactly 3 seconds wait after stimulus
      const autoPass = setTimeout(() => {
          if (gameState === 'playing' && lastAnsweredRoundRef.current !== round) { 
             // If No-Go (isTarget: false), timeout is a SUCCESS.
             // If Go (isTarget: true), timeout is a MISS.
             const isCorrect = currentRound.isTarget === false;
             handleAnswer('timeout', isCorrect);
          }
      }, timeoutLimit);

      return () => { 
        clearTimeout(t); 
        clearTimeout(autoPass); 
      };
    }

    if (config.engine === 'REACTION' && testId === 'reading-speed') {
      // Start listening as soon as the target text is visible
      if (reactionTargetVisible) {
        startListening();
      } else {
        stopListening();
      }
    }

    if (config.id === 'reading-speed' && transcript && !feedback) {
      // Normalize and compare
      const normalize = (t: string) => t.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()""📖“”]/g,"").replace(/\s+/g, ' ').trim();
      const promptText = normalize(config.rounds[round].prompt || '');
      const userText = normalize(transcript);
      
      // Clinical Heuristic: If transcript contains at least 50% of prompt words
      const promptWords = promptText.split(' ');
      const matchedWords = promptWords.filter(w => userText.includes(w));
      
      if (matchedWords.length >= Math.ceil(promptWords.length * 0.5) && userText.length > 3) {
         // Prevent double triggering
         const currentRound = config.rounds[round];
         const ms = Date.now() - reactionStartTime;
         setReactionTime(ms);
         const isCorrect = true; // Use true since we matched
         stopListening();
         handleAnswer(ms, isCorrect);
      }
    }

    if (config.engine === 'MEMORY') {
      let isMounted = true;
      setUserSequence([]);
      setIsMemoryShowing(true);
      setActiveMemoryNum(null);
      const pattern = config.rounds[round].pattern;
      if (pattern) {
        (async () => {
          await new Promise(r => setTimeout(r, 800));
          for (let i = 0; i < pattern.length; i++) {
            if (!isMounted) return;
            setActiveMemoryNum(pattern[i]);
            await new Promise(r => setTimeout(r, 700));
            if (!isMounted) return;
            setActiveMemoryNum(null);
            await new Promise(r => setTimeout(r, 300));
          }
          if (!isMounted) return;
          setIsMemoryShowing(false);
        })();
      }
      return () => { isMounted = false; };
    }

    if (config.engine === 'AI_CAMERA') {
      startCamera();
      let p = 0;
      setCameraProgress(0);
      const limitRaw = config.rounds[round].timeLimit || 10;
      const step = 100 / (limitRaw * 2);
      const t = setInterval(() => {
        p += step;
        setCameraProgress(Math.min(p, 100));
        if (p >= 100) {
          clearInterval(t);
          const totalCombinedScore = tremorRef.current + deviceMotionRef.current;
          const isFailed = totalCombinedScore > 500 || (gazeJitterRef.current > 0.4); 
          handleAnswer('ai_capture_done', !isFailed);
        }

        // Saccadic Movement: Move the target dot every 2 seconds
        if (config.id === 'saccadic-tracking' && p % 20 === 0) {
           setTargetPos({ x: Math.random() * 0.6 + 0.2, y: Math.random() * 0.6 + 0.2 });
        }
      }, 500); 
      return () => clearInterval(t);
    }
  }, [gameState, round, config]);

  const speak = (text: string) => {
    speakTTS(text);
  };

  const handleAnswer = (choice: any, customCorrect?: boolean) => {
    if (!config || lastAnsweredRoundRef.current === round) return;
    lastAnsweredRoundRef.current = round;
    let isCorrect = customCorrect;
    const answerTime = Date.now() - (lastActiveTime.current || Date.now());

    if (config.engine === 'QUIZ') {
      isCorrect = choice === config.rounds[round].correct;
      stopListening();
    }

    if (!isCorrect) frustrationEvents.current += 1;
    if (answerTime < 500 && !isCorrect) {
       impulsivityEvents.current += 1;
       const now = Date.now();
       if (now - lastRobotTime.current > 4000) {
          setRobotMessage("تمهل قليلاً يا بطل.. فكر قبل الاختيار! 🧠💡");
          lastRobotTime.current = now;
          setTimeout(() => setRobotMessage(''), 3000);
       }
    }

    roundDetails.current.push({
      roundIndex: round,
      isCorrect: !!isCorrect,
      timeSpentMs: answerTime,
      errorType: !isCorrect ? (answerTime < 500 ? 'too_fast' : 'wrong_answer') : null
    });

    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) setScore(s => s + 1);
    lastActiveTime.current = Date.now();

    setTimeout(() => {
      setFeedback(null);
      if (round + 1 < config.rounds.length) {
        setRound(r => r + 1);
      } else {
        const finalResults = [...roundDetails.current];
        const correctCount = finalResults.filter(r => r.isCorrect).length;
        const pct = Math.round((correctCount / config.rounds.length) * 100);
        localStorage.setItem(`${config.id}_score`, pct.toString());
        saveTestSession({
          id: generateSessionId(config.id),
          testId: config.id,
          testCategory: category,
          testTitle: config.title,
          preTestReadiness: null,
          rounds: finalResults,
          attention: { tabSwitchCount: tabSwitchCount.current, inactivityCount: inactivityCount.current, totalTestDurationMs: Date.now() - testStartTime.current },
          emotional: { frustrationEvents: frustrationEvents.current, impulsivityEvents: impulsivityEvents.current },
          rawScore: pct,
          postAnalysis: null,
          completedAt: new Date().toISOString()
        });
        const profile = getStudentProfile();
        if (profile) {
           const coinsEarned = Math.floor(pct / 10);
           profile.coins = (profile.coins || 0) + coinsEarned;
           saveStudentProfile(profile);
        }
        if (pct >= 80) setRobotMessage("بطل حقيقي! 🏆 لقد أبهرتني بتركيزك العالي! ✨");
        else if (pct >= 50) setRobotMessage("أداء جيد جداً! 🌟 واصل التدريب لتصبح أقوى.");
        else setRobotMessage("لا بأس يا بطل، المحاولة القادمة ستكون أفضل بالتأكيد! 💪🌈");
        setGameState('result');
      }
    }, 1500);
  };

  const handleReactionClick = () => {
    const currentRound = config?.rounds[round];
    if (!reactionTargetVisible) {
      handleAnswer(0, false);
      return;
    }
    if (currentRound?.isTarget === false) {
       handleAnswer(0, false);
       return;
    }
    const ms = Date.now() - reactionStartTime;
    setReactionTime(ms);
    const timeLimitS = currentRound?.timeLimit || 2;
    const isCorrect = ms < (timeLimitS * 1000);
    handleAnswer(ms, isCorrect);
  };

  const handleMemoryClick = (num: number) => {
    if (isMemoryShowing) return;
    const expectedPattern = config?.rounds[round].pattern;
    if (!expectedPattern) return;
    const newSeq = [...userSequence, num];
    setUserSequence(newSeq);
    if (newSeq.length === expectedPattern.length) {
      const isCorrect = newSeq.every((v, i) => v === expectedPattern[i]);
      handleAnswer(newSeq, isCorrect);
    } else {
      const isStillCorrect = newSeq.every((v, i) => v === expectedPattern[i]);
      if (!isStillCorrect) handleAnswer(newSeq, false);
    }
  };

  const startDrawing = (e: any) => {
    setIsDrawing(true);
    setStrokesCount(s => s + 1);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
       ctx.beginPath();
       const rect = canvasRef.current!.getBoundingClientRect();
       const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
       const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
       const x = clientX - rect.left;
       const y = clientY - rect.top;
       ctx.moveTo(x, y);
       setDrawnPath(prev => [...prev, {x, y}]);
    }
  };
  const draw = (e: any) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
       const rect = canvasRef.current!.getBoundingClientRect();
       const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
       const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
       const x = clientX - rect.left;
       const y = clientY - rect.top;
       ctx.lineTo(x, y);
       ctx.strokeStyle = '#06b6d4';
       ctx.lineWidth = 4;
       ctx.lineCap = 'round';
       ctx.stroke();
       setDrawnPath(prev => [...prev, {x, y}]);
    }
  };
  const stopDrawing = () => { setIsDrawing(false); };
  const submitDrawing = () => { 
    let isCorrect = true;
    let totalLen = 0;
    for(let i=1; i<drawnPath.length; i++) {
        totalLen += Math.sqrt(Math.pow(drawnPath[i].x - drawnPath[i-1].x, 2) + Math.pow(drawnPath[i].y - drawnPath[i-1].y, 2));
    }
    if (totalLen < 50 || drawnPath.length < 5) isCorrect = false;
    let minX=Infinity, maxX=-Infinity, minY=Infinity, maxY=-Infinity;
    drawnPath.forEach(p => {
        if(p.x < minX) minX=p.x; if(p.x > maxX) maxX=p.x;
        if(p.y < minY) minY=p.y; if(p.y > maxY) maxY=p.y;
    });
    if ((maxX - minX) < 20 && (maxY - minY) < 20) isCorrect = false;
    handleAnswer('canvas', isCorrect); 
    setDrawnPath([]);
    setStrokesCount(0);
    if (canvasRef.current) canvasRef.current.getContext('2d')?.clearRect(0,0,500,300);
  };

  const startCamera = async () => {
    if (streamRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraAccess(true);
      startTracking();
    } catch (e) {
      setCameraAccess(false);
      streamRef.current = null;
    }
  };
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraAccess(false);
  }, []);

  useEffect(() => {
    if (gameState !== 'playing') {
      stopCamera();
      stopTracking();
    }
  }, [gameState, stopCamera, stopTracking]);

  if (!config) return <div className="text-white text-center mt-20">Loading Engine...</div>;
  const currentRound = config.rounds[round];

  return (
    <main className="min-h-screen bg-[#020617] p-6 flex flex-col items-center justify-center font-sans overflow-hidden relative" dir="rtl">
      <div className={`absolute inset-0 z-0 opacity-30 ${
        config.engine === 'QUIZ' ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900 to-black' : 
        config.engine === 'MEMORY' ? 'bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-emerald-900 to-black' :
        config.engine === 'REACTION' ? 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900 to-black' :
        'bg-gradient-to-tr from-purple-900 to-black'}`} 
      />

      <div className="relative z-10 w-full max-w-4xl bg-slate-900/80 backdrop-blur-2xl border border-slate-700/50 rounded-[3rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <AnimatePresence mode="wait">
          
          {gameState === 'lobby' && (
            <motion.div key="lobby" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-7xl mb-6">🎮</div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-6 uppercase tracking-wider">{config.title}</h1>
              
              <div className="relative text-lg text-slate-300 font-medium mb-10 bg-slate-800/60 p-8 rounded-3xl border border-slate-700/50">
                <div className="absolute top-4 right-4">
                  <SpeakButton text={config.instructions} size="sm" />
                </div>
                {config.instructions}
              </div>

              <button onClick={() => setGameState('playing')} className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-2xl font-black py-6 rounded-3xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all">بدء التحدي 🚀</button>
              <Link href={`/diagnose/${category}`} className="block mt-8 text-slate-500 font-bold hover:text-slate-300 transition-colors">◀ العودة للخلف</Link>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div key="playing" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="text-center w-full">
              <div className="flex justify-between items-center mb-8 text-slate-400 font-black border-b border-white/10 pb-4">
                <span className="bg-slate-800 px-4 py-1 rounded-full text-xs tracking-widest">STAGE {round + 1} / {config.rounds.length}</span>
                <span className="text-emerald-400 bg-emerald-900/30 px-4 py-1 rounded-full">POINTS: {score}</span>
              </div>

              {config.engine === 'QUIZ' && currentRound && (
                <div>
                  <div className="flex items-center justify-center gap-4 mb-10">
                    <h2 className="text-3xl font-black text-white leading-tight">{currentRound.prompt}</h2>
                    <SpeakButton text={currentRound.prompt || ''} size="md" />
                  </div>
                  
                  <div className="flex justify-center gap-4 mb-10">
                     {currentRound.voicePrompt && (
                        <button onClick={() => speak(currentRound.voicePrompt!)} className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 p-5 rounded-[2rem] text-4xl hover:bg-indigo-500/40 animate-bounce">🔊 استمع</button>
                     )}
                     <button onClick={isListening ? stopListening : startListening} className={`p-5 rounded-[2rem] text-4xl border ${isListening ? 'bg-rose-500/30 text-rose-300 border-rose-500 animate-pulse' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                        {isListening ? '🎙️ أستمع..' : '🎤 أجب'}
                     </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentRound.options?.map((opt, i) => (
                      <button key={i} disabled={!!feedback} onClick={() => handleAnswer(opt)} className={`group py-8 px-6 rounded-[2.5rem] border-[3px] border-slate-700/50 bg-slate-800/80 text-white hover:border-cyan-500 hover:bg-slate-800 transition-all ${feedback ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}>
                        <span className="text-2xl font-black tracking-tight">{opt}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {config.engine === 'REACTION' && currentRound && (
                <div className="py-20 flex flex-col items-center justify-center">
                  <div className="flex items-center gap-4 mb-6">
                    <h3 className="text-3xl font-black text-cyan-400 uppercase tracking-wider">{currentRound.prompt}</h3>
                    <SpeakButton text={currentRound.prompt || ''} size="sm" />
                  </div>
                  {config.id === 'reading-speed' ? (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={reactionTargetVisible ? { scale: 1, opacity: 1 } : {}}
                      className="w-full max-w-2xl bg-slate-800/60 backdrop-blur-xl border-4 border-emerald-500/50 rounded-[4rem] p-12 text-center shadow-[0_0_50px_rgba(16,185,129,0.2)]"
                    >
                       <div className="flex justify-center items-center gap-4 mb-8">
                          <span className={`w-4 h-4 rounded-full ${isListening ? 'bg-emerald-500 animate-ping' : 'bg-slate-600'}`} />
                          <span className="text-emerald-400 font-black tracking-tighter uppercase text-sm">
                            {isListening ? 'أنا أسمعك الآن.. اقرأ الجملة' : 'في انتظار البدء..'}
                          </span>
                       </div>

                       <div className="bg-black/40 rounded-[2.5rem] p-8 border border-white/5 min-h-[140px] flex items-center justify-center">
                          <p className="text-4xl md:text-5xl font-black text-white leading-relaxed italic">
                             {transcript ? `"${transcript}"` : '...'}
                          </p>
                       </div>

                       {feedback === 'correct' && (
                         <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-6 text-emerald-400 text-6xl">✨ أحسنت!</motion.div>
                       )}
                    </motion.div>
                  ) : (
                    <motion.button 
                      animate={reactionTargetVisible ? { scale: [1, 1.2, 1] } : {}}
                      onClick={handleReactionClick} disabled={!!feedback}
                      className={`w-64 h-64 rounded-full font-black text-6xl text-white shadow-2xl border-8 ${reactionTargetVisible ? 'bg-emerald-500 border-emerald-300' : 'bg-red-500 border-red-800'}`}
                    >
                      {reactionTargetVisible ? (currentRound?.stimulus || '⚡ الآن!') : '...'}
                    </motion.button>
                  )}
                </div>
              )}

              {config.engine === 'MEMORY' && currentRound && (
                <div>
                   <div className="flex items-center justify-center gap-4 mb-4">
                     <h3 className="text-3xl text-cyan-400 font-black">{currentRound.prompt}</h3>
                     <SpeakButton text={currentRound.prompt || ''} size="sm" />
                   </div>
                   <div className="grid grid-cols-3 gap-4 max-w-[300px] mx-auto p-6 bg-slate-900 rounded-[3rem] border border-white/5 shadow-2xl">
                      {[1,2,3,4,5,6,7,8,9].map(num => (
                        <button key={num} onClick={() => handleMemoryClick(num)} disabled={isMemoryShowing || !!feedback || userSequence.includes(num)} className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl text-2xl font-black transition-all ${isMemoryShowing && activeMemoryNum === num ? 'bg-cyan-400 text-slate-900 scale-110' : userSequence.includes(num) ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 border-2 border-slate-700/50'}`}>
                          {num}
                        </button>
                      ))}
                   </div>
                </div>
              )}

              {config.engine === 'CANVAS' && currentRound && (
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-4 mb-6">
                    <h3 className="text-3xl text-cyan-400 font-black">{currentRound.prompt}</h3>
                    <SpeakButton text={currentRound.prompt || ''} size="sm" />
                  </div>
                  <div className="relative bg-slate-950 border-4 border-slate-800 rounded-[3rem] overflow-hidden">
                    <canvas ref={canvasRef} width={500} height={300} className="touch-none cursor-crosshair" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} />
                  </div>
                  <button onClick={submitDrawing} className="mt-8 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black py-4 px-12 rounded-3xl text-xl hover:scale-105 transition-transform uppercase tracking-widest">SUBMIT SCAN</button>
                </div>
              )}

              {config.engine === 'AI_CAMERA' && currentRound && (
                <div className="py-8 flex flex-col items-center">
                   <div className="flex justify-between w-full mb-8">
                      <div className="bg-slate-800/80 px-6 py-2 rounded-full border border-slate-700/50 flex gap-3 items-center">
                         <span className={`w-3 h-3 rounded-full animate-pulse ${hasFace ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                         <span className="text-[10px] font-black tracking-widest uppercase">{hasFace ? 'Target Locked' : 'Searching..'}</span>
                      </div>
                      <div className="bg-slate-800/80 px-6 py-2 rounded-full border border-slate-700/50 flex gap-4 text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
                         <span>Blks: {blinkCount}</span>
                         <span>Trmr: {Math.round(tremorScore)}</span>
                         <span>DevM: {Math.round(deviceMotionScore)}</span>
                      </div>
                   </div>

                   <div className="relative w-full max-w-xl aspect-video bg-black rounded-[3rem] border-4 border-slate-800 overflow-hidden shadow-2xl">
                      <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-1000 ${cameraAccess ? 'opacity-40' : 'opacity-0'}`} />
                      <div className="absolute inset-0 pointer-events-none">
                         <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-cyan-400 opacity-40" />
                         <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-cyan-400 opacity-40" />
                         <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-cyan-400 opacity-40" />
                         <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-cyan-400 opacity-40" />
                         <motion.div animate={{ top: ['0%', '100%', '0%'] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute left-0 right-0 h-1 bg-cyan-400/20 blur-sm" />
                         <AnimatePresence>
                           {(config.id === 'saccadic-tracking' || config.id === 'gaze-stability') && (
                              <motion.div 
                                initial={{ opacity:0, scale:0 }} animate={{ opacity:1, scale:1 }}
                                className="absolute w-12 h-12 border-2 border-cyan-500 rounded-full flex items-center justify-center z-30"
                                style={{ top: `${targetPos.y * 100}%`, left: `${targetPos.x * 100}%`, transform: 'translate(-50%, -50%)' }}
                              >
                                 <div className="w-4 h-4 bg-cyan-400 rounded-full shadow-[0_0_20px_#22d3ee] animate-ping" />
                                 <div className="w-2 h-2 bg-white rounded-full absolute" />
                              </motion.div>
                           )}
                           {hasFace && (
                             <motion.div initial={{ opacity:0, scale:0 }} animate={{ opacity:1, scale:1 }} className="absolute border-2 border-emerald-500/50 rounded-full w-20 h-20 flex items-center justify-center translate-x-[-50%] translate-y-[-50%]" style={{ top: `${gazeMetrics.y * 100}%`, left: `${(1 - gazeMetrics.x) * 100}%` }}>
                                <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]" />
                             </motion.div>
                           )}
                         </AnimatePresence>
                      </div>
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 text-cyan-400 text-[9px] font-mono tracking-widest uppercase">Basira Diagnostic AI // SCAN_LIVE</div>
                   </div>
                   <div className="mt-10 text-center">
                      <h3 className="text-3xl font-black text-white italic mb-2 tracking-tight">{currentRound.prompt}</h3>
                      <div className="w-full h-2 bg-slate-800 rounded-full mt-6 overflow-hidden max-w-sm mx-auto">
                        <motion.div animate={{ width: `${cameraProgress}%` }} className="h-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.8)]" />
                      </div>
                   </div>
                </div>
              )}
            </motion.div>
          )}

          {gameState === 'result' && (
            <motion.div key="result" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center p-8">
              <div className="text-7xl mb-8">🏆</div>
              <h2 className="text-5xl font-black text-white mb-4">اكتمل التقييم!</h2>
              
              <div className="flex flex-col items-center gap-4 my-8">
                <div className="text-[6rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 drop-shadow-xl">
                  {Math.round((score / config.rounds.length) * 100)}%
                </div>
                <SpeakButton text={`${language === 'ar' ? 'اكتمل التقييم! أحسنت يا بطل. نتيجتك هي' : 'Evaluation Complete! Great job. Your score is'} ${Math.round((score / config.rounds.length) * 100)}%`} size="md" />
              </div>

              <Link href={`/diagnose/${category}`} className="block w-full bg-slate-800 hover:bg-slate-700 text-white text-2xl font-black py-6 rounded-3xl border-2 border-slate-700 transition active:scale-95">حفظ وإغلاق 🔙</Link>
            </motion.div>
          )}
        </AnimatePresence>

        {gameState !== 'playing' && (
          <BasirRobot mood={feedback === 'correct' ? 'happy' : feedback === 'wrong' ? 'sad' : (currentRound?.mood || 'happy')} message={robotMessage} />
        )}
      </div>
    </main>
  );
}
