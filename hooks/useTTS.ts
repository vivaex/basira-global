import { useCallback, useState, useRef, useEffect } from 'react';

// Aggressive sanitization to strip emojis and punctuation that often crash problematic TTS engines
const sanitizeText = (text: string, lang: 'ar' | 'en') => {
  let cleaned = text
    .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '') // Emojis
    .replace(/[()\[\]{}""'']/g, ' ') // Brackets/Quotes
    .replace(/[«»“”„]/g, ' ') // Fancy quotes
    .replace(/[،؛؟?!.,]/g, ' '); // Punctuation

  // Rule 4: Language-specific stripping
  // Many Windows engines (Naayf, Hoda) crash on mixed content or diacritics.
  if (lang === 'ar') {
    // Strip English letters
    cleaned = cleaned.replace(/[a-zA-Z]/g, ' ');
    // Strip Arabic diacritics (Harakat) - High risk for synthesis-failed
    cleaned = cleaned.replace(/[\u064B-\u0652\u0653\u0654\u0655\u0670]/g, '');
  } else {
    // Strip Arabic letters if we are in English mode
    cleaned = cleaned.replace(/[\u0600-\u06FF]/g, ' ');
  }

  return cleaned.replace(/\s+/g, ' ').trim();
};

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout| null>(null);
  const retryRef = useRef<boolean>(false);

  // Synchronize state and pre-load voices
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    // Initial load
    loadVoices();

    // Chrome and other browsers load voices asynchronously
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      window.speechSynthesis.onvoiceschanged = null;
      window.speechSynthesis.cancel();
    };
  }, []);

  const getBestVoice = useCallback((lang: 'ar' | 'en') => {
    const list = window.speechSynthesis.getVoices();
    
    if (lang === 'ar') {
      return list.find(v => v.lang === 'ar-SA' || v.name.includes('Saudi')) || 
             list.find(v => v.lang === 'ar-EG' || v.name.includes('Egypt')) || 
             list.find(v => (v.lang.startsWith('ar') && !v.name.includes('Google'))) || // Try local-first
             list.find(v => v.lang.startsWith('ar')) || null;
    } else {
      return list.find(v => v.lang === 'en-US' || v.name.includes('United States')) || 
             list.find(v => v.lang === 'en-GB' || v.name.includes('United Kingdom')) || 
             list.find(v => v.lang.startsWith('en')) || null;
    }
  }, []);

  const speak = useCallback((text: string, lang: 'ar' | 'en' = 'ar', useFallback: boolean = false) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    if (!text || text.trim() === '') return;

    // Reset retry flag if this is a fresh manual call
    if (!useFallback) retryRef.current = false;

    // Clear any pending state
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    try {
      // Chrome/Edge "wake up"
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      // Hard cancel any existing synthesis to reset the audio buffer
      window.speechSynthesis.cancel();
      
      // Rule 5: Warm-up the engine with a silent space (Fix for some Windows drivers)
      const warmUp = new SpeechSynthesisUtterance(' ');
      warmUp.volume = 0;
      window.speechSynthesis.speak(warmUp);

      // Increased buffer delay (500ms) for Windows audio service stability
      timeoutRef.current = setTimeout(() => {
        const cleanText = sanitizeText(text, lang);
        
        // Simple chunking logic - split by explicit punctuation
        const chunks = cleanText.split(/[.،؛?؟!]+/).filter(c => c.trim().length > 0);
        
        if (chunks.length === 0 && cleanText) chunks.push(cleanText);
        
        let currentChunkIndex = 0;

        const speakNextChunk = () => {
          if (currentChunkIndex >= chunks.length) {
            setIsSpeaking(false);
            utteranceRef.current = null;
            return;
          }

          const chunk = chunks[currentChunkIndex].trim();
          if (!chunk) {
            currentChunkIndex++;
            speakNextChunk();
            return;
          }

          const utterance = new SpeechSynthesisUtterance(chunk);
          utteranceRef.current = utterance;

          const voice = useFallback ? null : getBestVoice(lang);
          if (voice) {
            utterance.voice = voice;
            utterance.lang = voice.lang;
          } else {
            utterance.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
          }

          utterance.rate = 0.95;
          utterance.pitch = 1.0;

          utterance.onstart = () => setIsSpeaking(true);
          utterance.onend = () => {
            currentChunkIndex++;
            speakNextChunk();
          };

          // Rule 1: Fallback safety - some drivers fail to fire onend
          const safetyTimer = setTimeout(() => {
             console.warn("TTS Safety Timeout Triggered");
             currentChunkIndex++;
             speakNextChunk();
          }, 8000);

          utterance.onerror = (e: any) => {
            clearTimeout(safetyTimer);
            if (e.error === 'interrupted') return;
            console.error(`TTS Chunk Error: ${e.error} | Text: "${chunk.substring(0, 20)}..."`);
            
            // If primary voice failed, try one more time with fallback
            if (!retryRef.current && !useFallback) {
              retryRef.current = true;
              speak(text, lang, true);
            } else {
              // Move to next chunk instead of stopping entirely if fallback also fails
              currentChunkIndex++;
              speakNextChunk();
            }
          };

          window.speechSynthesis.speak(utterance);
        };

        speakNextChunk();
      }, 50);

    } catch (error) {
      console.error('TTS Fail:', error);
      setIsSpeaking(false);
    }
  }, [getBestVoice]);

  const stop = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      utteranceRef.current = null;
    }
  }, []);

  return { speak, stop, isSpeaking, voicesCount: voices.length };
}
