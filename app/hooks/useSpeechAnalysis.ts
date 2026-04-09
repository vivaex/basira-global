'use client';
import { useState, useRef, useCallback } from 'react';

export function useSpeechAnalysis() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn("Speech API is not supported in this browser.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interTranscript += event.results[i][0].transcript;
        }
      }
      
      setTranscript(finalTranscript || interTranscript);
    };

    recognition.onend = () => setIsListening(false);
    
    recognition.onerror = (e: any) => {
       console.error("Speech error", e);
       setIsListening(false);
    };

    try {
        recognition.start();
        recognitionRef.current = recognition;
        setIsListening(true);
        setTranscript('');
    } catch(err) {
        console.error("Could not start recognition", err);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  return { isListening, transcript, startListening, stopListening };
}
