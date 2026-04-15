'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useFaceTracking } from '@/app/hooks/useFaceTracking';
import GlassCard from '@/app/components/ui/GlassCard';
import NeonButton from '@/app/components/ui/NeonButton';
import { useLanguage } from '@/app/components/LanguageContext';

export default function BiometricsLab() {
  const { t, language } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [streamObj, setStreamObj] = useState<MediaStream | null>(null);

  const {
    isModelLoaded,
    hasFace,
    heartRate,
    stressLevel,
    lightingWarning,
    startTracking,
    stopTracking
  } = useFaceTracking(videoRef);

  const startCamera = async () => {
    console.log("Attempting to start camera...");
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert(language === 'ar' ? "متصفحك لا يدعم الوصول للكاميرا." : "Your browser does not support camera access.");
      return;
    }

    try {
      // Tier 1: Try with ideal constraints
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: "user"
        } 
      });
      console.log("Camera stream obtained with ideal constraints.");
      setStreamObj(stream);
      setCameraActive(true);
    } catch (err) {
      console.warn("Camera failed with ideal constraints, trying fallback...", err);
      try {
        // Tier 2: Try with generic video true
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        console.log("Camera stream obtained with generic constraints.");
        setStreamObj(stream);
        setCameraActive(true);
      } catch (fallbackErr: any) {
        console.error("Camera access failed completely:", fallbackErr);
        const errDetails = `${fallbackErr?.name}: ${fallbackErr?.message}`;
        alert(language === 'ar' 
          ? `تعذر الوصول للكاميرا.\nالسبب التقني: ${errDetails}\n\nيرجى التأكد من عدم وجود برنامج آخر يستخدم الكاميرا (مثل Zoom/Teams)، والتأكد من منح الإذن من قفل الأمان بجانب الرابط، والتأكد من إعدادات الخصوصية في الويندوز.` 
          : `Could not access camera.\nTechnical Reason: ${errDetails}\n\nPlease ensure no other app is using it, permissions are granted in the browser, and Windows privacy settings allow camera access.`);
      }
    }
  };

  useEffect(() => {
    if (cameraActive && videoRef.current && streamObj) {
      console.log("Attaching stream to video element...");
      videoRef.current.srcObject = streamObj;
      videoRef.current.onloadedmetadata = () => {
        console.log("Video metadata loaded, playing...");
        videoRef.current?.play().catch(e => console.error("Play error:", e));
        startTracking();
      };
    }
  }, [cameraActive, streamObj, startTracking]);

  const stopCamera = () => {
    stopTracking();
    if (streamObj) {
      streamObj.getTracks().forEach(track => track.stop());
    }
    setCameraActive(false);
    setStreamObj(null);
  };

  useEffect(() => {
    return () => stopCamera(); // Cleanup on unmount
  }, [streamObj]);

  const isRtl = language === 'ar';

  return (
    <main className="min-h-screen bg-[#0f172a] text-white p-6 md:p-12 relative overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70%] h-[30%] bg-emerald-600/10 rounded-full blur-[150px] animate-pulse" />

      <div className="relative z-10 max-w-5xl mx-auto">
        <Link href="/diagnose">
          <NeonButton size="sm" color="emerald" className="mb-8">
            {isRtl ? '◀ العودة للمختبرات' : '◀ Back to Labs'}
          </NeonButton>
        </Link>

        <header className="text-center mb-12">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-7xl mb-4">🫀</motion.div>
          <h1 className="text-4xl md:text-6xl font-black italic mb-4">
            <span className="text-emerald-400">{isRtl ? 'مختبر' : 'Lab'}</span> {isRtl ? 'القياسات الحيوية (rPPG)' : 'Biometrics (rPPG)'}
          </h1>
          <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto">
            {isRtl 
              ? 'تقنية تجريبية لقياس معدل نبض القلب ومستويات التوتر من خلال كاميرا الويب فقط باستخدام خوارزميات رصد التغيرات اللونية الدقيقة بالبشرة.' 
              : 'Experimental tech to measure Heart Rate and Stress levels using only a webcam via remote Photoplethysmography (rPPG).'}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Camera Feed */}
          <GlassCard variant="default" className="p-6 relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
            {!cameraActive ? (
              <div className="text-center">
                <div className="text-6xl mb-6 opacity-50">📷</div>
                <NeonButton onClick={startCamera} color="emerald">
                  {isRtl ? 'تشغيل الكاميرا وبدء التحليل' : 'Start Camera & Analysis'}
                </NeonButton>
              </div>
            ) : (
              <div className="w-full relative rounded-2xl overflow-hidden shadow-2xl ring-4 ring-emerald-500/20">
                <video 
                  ref={videoRef} 
                  className="w-full h-auto transform -scale-x-100" // Mirror
                  muted 
                  playsInline 
                />
                
                {/* Face Scanning Overlay UI */}
                <div className="absolute inset-0 border-2 border-emerald-500/30">
                  {hasFace ? (
                    <motion.div 
                      className="absolute inset-x-0 h-1 bg-emerald-400/80 shadow-[0_0_15px_rgba(52,211,153,0.8)]"
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm -scale-x-100">
                      <p className="text-xl font-bold text-rose-400 animate-pulse">
                        {isRtl ? 'جارٍ البحث عن الوجه...' : 'Looking for face...'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {cameraActive && (
              <button 
                onClick={stopCamera} 
                className="mt-6 text-sm text-slate-400 hover:text-white transition-colors"
              >
                {isRtl ? 'إيقاف الكاميرا' : 'Stop Camera'}
              </button>
            )}
          </GlassCard>

          {/* Metrics */}
          <div className="flex flex-col gap-6">
            
            {/* Lighting Warning Info */}
            {lightingWarning && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-rose-500/10 border-2 border-rose-500/50 rounded-2xl p-4 text-rose-400 font-bold flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <span>{isRtl ? 'تنبيه: الإضاءة ضعيفة جداً! قد يؤثر ذلك على دقة قراءة النبض. يرجى توجيه وجهك لمصدر ضوء.' : 'Warning: Low lighting detected! This may affect heart rate accuracy. Please face a light source.'}</span>
              </motion.div>
            )}

            <GlassCard variant="dark" className="p-8 flex-1 flex flex-col justify-center">
               <h3 className="text-slate-400 font-bold mb-8 uppercase tracking-widest text-sm">
                 {isRtl ? 'المؤشرات الحيوية المباشرة' : 'Live Biometrics'}
               </h3>
               
               <div className="space-y-8">
                  {/* Heart Rate */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 text-2xl animate-pulse">
                        ❤️
                      </div>
                      <div>
                        <div className="text-sm text-slate-400">{isRtl ? 'معدل النبض (BPM)' : 'Heart Rate (BPM)'}</div>
                        <div className="text-4xl font-black text-white">{heartRate > 0 ? heartRate : '--'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Stress Level */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-2xl">
                        ⚡
                      </div>
                      <div>
                        <div className="text-sm text-slate-400">{isRtl ? 'مؤشر التوتر المعرفي' : 'Cognitive Stress Index'}</div>
                        <div className="text-4xl font-black text-white">
                           {stressLevel > 0 ? `${stressLevel}%` : '--'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="text-xs text-slate-500 text-center font-mono">
                     {isModelLoaded ? (isRtl ? 'المحرك الحيوي متصل وجاهز.' : 'Biometric engine connected.') : (isRtl ? 'جاري تحميل نماذج الذكاء الاصطناعي...' : 'Loading AI models...')}
                  </div>
               </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </main>
  );
}
