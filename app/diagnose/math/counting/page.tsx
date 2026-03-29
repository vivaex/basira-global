'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CountingTest() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [question, setQuestion] = useState<{ seq: (number | string)[], answer: number, options: number[] }>({ seq: [], answer: 0, options: [] });

  const generateQuestion = () => {
    if (level > 10) {
      localStorage.setItem('countingScore', score.toString());
      setGameState('result');
      return;
    }

    const start = Math.floor(Math.random() * 20);
    const step = level > 5 ? 2 : 1; // زيادة الصعوبة بعد المستوى 5
    const seq = [start, start + step, start + step * 2, start + step * 3];
    const missingIdx = Math.floor(Math.random() * 4);
    const answer = seq[missingIdx];
    const displaySeq = [...seq];
    displaySeq[missingIdx] = '?';

    // توليد خيارات
    const options = [answer, answer + 1, answer - 1, answer + step + 1].sort(() => 0.5 - Math.random());
    
    setQuestion({ seq: displaySeq, answer, options });
    setGameState('playing');
  };

  const handleAnswer = (choice: number) => {
    if (choice === question.answer) setScore(s => s + 10);
    setLevel(l => l + 1);
    generateQuestion();
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6" dir="rtl">
      <div className="bg-slate-900 p-10 rounded-[3rem] border-4 border-yellow-500/20 shadow-2xl max-w-2xl w-full text-center">
        {gameState === 'start' && (
          <div>
            <h1 className="text-4xl font-black mb-6 text-yellow-400">تحدي الرقم المفقود 🔍</h1>
            <p className="text-xl text-slate-400 mb-8 font-light">هل تستطيع معرفة الرقم الذي هرب من السلسلة؟</p>
            <button onClick={generateQuestion} className="bg-yellow-600 px-12 py-4 rounded-2xl font-bold text-xl">بدء السباق! 🏃‍♂️</button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="animate-in fade-in">
            <div className="mb-10 text-slate-500 font-bold">المستوى {level} / 10</div>
            <div className="flex justify-center gap-4 mb-12">
              {question.seq.map((num, i) => (
                <div key={i} className={`w-20 h-20 flex items-center justify-center rounded-2xl text-4xl font-black shadow-lg border-2 
                  ${num === '?' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400 animate-bounce' : 'bg-slate-800 border-slate-700'}`}>
                  {num}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {question.options.map((opt, i) => (
                <button key={i} onClick={() => handleAnswer(opt)} className="bg-slate-800 hover:bg-yellow-600 p-6 rounded-2xl text-3xl font-bold transition-all active:scale-95">
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {gameState === 'result' && (
          <div className="animate-in zoom-in">
            <h2 className="text-5xl font-black text-green-400 mb-8">بطل الأرقام!</h2>
            <div className="text-8xl font-black mb-10">{score}</div>
            <Link href="/diagnose/math" className="text-slate-500 underline">العودة لمختبر الرياضيات</Link>
          </div>
        )}
      </div>
    </main>
  );
}