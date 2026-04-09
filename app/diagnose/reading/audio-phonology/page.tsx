'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  TestSession, 
  ResponseRecord,
  getStudentProfile, 
  saveTestSession 
} from '@/lib/studentProfile';
import { ClinicalScoringEngine } from '@/lib/domain/scoring/engine';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';

/**
 * Phonological Awareness (CTOPP-2 Compliance)
 * ---------------------------------------------
 * Rule 1: No visual text. Pure auditory-to-verbal processing.
 * Rule 5: Versions A (4-7), B (8-12), C (13-18).
 */

interface PhonologyTrial {
  prompt: string;
  expectedAnswer: string[]; // Support multiple variations
  taskType: 'isolation' | 'blending' | 'elision' | 'matching' | 'pseudo';
  difficulty: number;
}

const PHONOLOGY_STIMULI: Record<'A' | 'B' | 'C', PhonologyTrial[]> = {
  A: [ // Isolation & Sound Matching (Age 4-7)
    { prompt: 'اي كلمة تبدأ بصوت /س/؟ سمكة أم قطة؟', expectedAnswer: ['سمكة', 'سمكه'], taskType: 'matching', difficulty: 1 },
    { prompt: 'ما هو أول صوت في كلمة "باب"؟', expectedAnswer: ['ب', 'با'], taskType: 'isolation', difficulty: 1 },
    { prompt: 'ما هو الصوت الأخير في كلمة "بيت"؟', expectedAnswer: ['ت'], taskType: 'isolation', difficulty: 2 },
    { prompt: 'اجمع هذه الأصوات: /م/ + /ا/ .. ماذا تصبح؟', expectedAnswer: ['ما'], taskType: 'blending', difficulty: 1 },
    { prompt: 'ما هو الصوت الذي يتكرر في: "تمر"، "توت"؟', expectedAnswer: ['ت'], taskType: 'isolation', difficulty: 3 },
  ],
  B: [ // Elision & Blending (Age 8-12)
    { prompt: 'اجمع الأصوات التالية: /ق/ + /ل/ + /م/. ما الكلمة؟', expectedAnswer: ['قلم'], taskType: 'blending', difficulty: 2 },
    { prompt: 'قل كلمة "حصان" بدون الصوت الأخير.', expectedAnswer: ['حصا'], taskType: 'elision', difficulty: 3 },
    { prompt: 'قل كلمة "مفتاح" بدون مقطع "مفـ".', expectedAnswer: ['تاح'], taskType: 'elision', difficulty: 4 },
    { prompt: 'قل كلمة "مدرسة" بدون الصوت الأول.', expectedAnswer: ['درسة'], taskType: 'elision', difficulty: 4 },
    { prompt: 'اجمع الأصوات: /س/ + /م/ + /ا/ + /ء/.', expectedAnswer: ['سماء', 'سما'], taskType: 'blending', difficulty: 4 },
  ],
  C: [ // Pseudo-words & Rapid Manipulation (Age 13-18)
    { prompt: 'قل كلمة "كرسي" واستبدل الـ /ك/ بـ /د/.', expectedAnswer: ['درسي'], taskType: 'elision', difficulty: 5 },
    { prompt: 'قل الكلمة التالية بالمقلوب: "نـم".', expectedAnswer: ['من'], taskType: 'pseudo', difficulty: 5 },
    { prompt: 'قل كلمة "انطلاق" بدون مقطع "انـ".', expectedAnswer: ['طلاق'], taskType: 'elision', difficulty: 5 },
    { prompt: 'قل كلمة "استفهام" بدون مقطع "استـ".', expectedAnswer: ['فهام'], taskType: 'elision', difficulty: 5 },
  ]
};

export default function AudioPhonologyTest() {
  const [currentTrial, setCurrentTrial] = useState<PhonologyTrial | null>(null);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const trialStartTime = useRef<number>(0);
  const isCorrectFound = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'ar-SA';
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.onresult = (event: any) => {
          const results = Array.from(event.results);
          const text = results.map((r: any) => r[0].transcript).join('').trim();
          setTranscript(text);
        };
        recognitionRef.current = recognition;
      }
    }
    return () => {
       try { recognitionRef.current?.stop(); } catch(e) {}
    };
  }, []);

  const generateTrial = useCallback((difficulty: number, ageVersion: 'A' | 'B' | 'C') => {
    const pool = PHONOLOGY_STIMULI[ageVersion].filter(t => t.difficulty <= difficulty + 1);
    const trial = pool[Math.floor(Math.random() * pool.length)];
    setCurrentTrial(trial);
    setTranscript('');
    isCorrectFound.current = false;
    trialStartTime.current = 0;
  }, []);

  const handleComplete = (score: number, metrics: any) => {
    const student = getStudentProfile();
    const session: TestSession = {
      id: `phonology-${Date.now()}`,
      testId: 'phonological-awareness',
      testCategory: 'literacy',
      testTitle: 'الوعي الصوتي (CTOPP-2)',
      domainId: 'phonological-awareness',
      interactions: metrics.interactions,
      rawScore: score,
      theta: metrics.finalTheta,
      completedAt: new Date().toISOString(),
      preTestReadiness: null,
      rounds: [],
      attention: { tabSwitchCount: 0, inactivityCount: 0, totalTestDurationMs: 300000 },
      emotional: { frustrationEvents: 0, impulsivityEvents: 0 },
      postAnalysis: null,
    };

    session.postAnalysis = ClinicalScoringEngine.analyze(session, student);
    saveTestSession(session);
  };

  return (
    <ClinicalPlayerEngine
      title="الوعي الصوتي (CTOPP-2)"
      category="literacy"
      domainId="phonological-awareness"
      description="تحليل الأصوات والدمج والحذف. مهارة أساسية للديسليكسيا."
      instruction="استمع جيداً للأصوات، ثم أجب بصوتك الواضح."
      icon="👂"
      color="indigo"
      onComplete={handleComplete}
    >
      {({ recordInteraction, difficulty, speak, isSpeaking, ageVersion }) => {
        // Fix: Use useEffect to generate trial instead of calling it in render body
        useEffect(() => {
          if (!currentTrial) {
            generateTrial(difficulty, ageVersion);
          }
        }, [currentTrial, difficulty, ageVersion, generateTrial]);

        if (!currentTrial) {
          return null;
        }

        const startTask = () => {
          speak(currentTrial.prompt, 'ar');
        };

        useEffect(() => {
          if (!isSpeaking && currentTrial && trialStartTime.current === 0) {
            trialStartTime.current = performance.now();
            try { recognitionRef.current?.start(); } catch(e) {}
          }
        }, [isSpeaking, currentTrial]);

        useEffect(() => {
          if (transcript && currentTrial && !isCorrectFound.current) {
             const isCorrect = currentTrial.expectedAnswer.some(ans => transcript.toLowerCase().includes(ans.toLowerCase()));
             
             if (isCorrect) {
                isCorrectFound.current = true;
                const now = performance.now();
                
                recordInteraction({
                  isCorrect: true,
                  timestampDisplayed: trialStartTime.current,
                  timestampResponded: now,
                  responseValue: transcript,
                  metadata: { taskType: currentTrial.taskType, prompt: currentTrial.prompt }
                });

                try { recognitionRef.current?.stop(); } catch(e) {}
                setTimeout(() => generateTrial(difficulty, ageVersion), 1000);
             }
          }
        }, [transcript, currentTrial, recordInteraction, difficulty, ageVersion, generateTrial]);

        return (
          <div className="flex flex-col items-center justify-center gap-10">
            <div className="text-[12rem] animate-float drop-shadow-2xl">👂</div>
            
            <div className={`p-12 rounded-[4rem] border-4 transition-all duration-700 min-w-[400px] text-center ${isSpeaking ? 'border-indigo-400 bg-indigo-500/10 scale-105' : 'border-white/10 bg-white/5'}`}>
               {!trialStartTime.current ? (
                 <button onClick={startTask} className="btn-primary px-16 py-8 text-3xl">
                   <span>إسـماع السؤال 🔊</span>
                 </button>
               ) : (
                 <div className="animate-fade-in">
                    <div className="flex justify-center gap-4 mb-6">
                       <span className="w-4 h-4 bg-emerald-500 rounded-full animate-ping" />
                       <span className="text-emerald-400 font-bold uppercase tracking-tighter">أنا أسمعك الآن...</span>
                    </div>
                    <p className="text-4xl font-mono text-white/50 italic">"{transcript || '...'}"</p>
                 </div>
               )}
            </div>

            <p className="high-contrast-text text-xl diagnostic-stimulus max-w-lg text-center opacity-70">
              ممنوع استخدام القراءة البصرية. اعتمد على حاسة السمع فقط.
            </p>
          </div>
        );
      }}
    </ClinicalPlayerEngine>
  );
}
