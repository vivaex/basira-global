'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ──────────────────────────────────────────────────────────────
// ParentAIConcierge — مساعد بصيرة الذكي للأهل
// يقرأ نتائج الطفل الفعلية ويجيب على أسئلة الأهل
// ──────────────────────────────────────────────────────────────

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Props {
  childName: string;
  childResults: { id: string; title: string; score: number; status: string }[];
  studentProfile?: any;
  aiReport?: any;
}

const SUGGESTED_QUESTIONS = [
  'ماذا تعني نتائج ابني بشكل مبسط؟',
  'كيف أساعد طفلي على تحسين تركيزه في البيت؟',
  'هل يحتاج ابني لزيارة أخصائي؟',
  'ما الأنشطة التي تقوي الذاكرة لعمره؟',
  'كيف أتحدث مع معلمه عن هذه النتائج؟',
];

export default function ParentAIConcierge({ childName, childResults, studentProfile, aiReport }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Greeting on first open
  useEffect(() => {
    if (isOpen && !hasGreeted) {
      setHasGreeted(true);
      const completedTests = childResults.filter(r => r.score > 0);
      const weakAreas = childResults.filter(r => r.score > 0 && r.score < 60).map(r => r.title);
      
      const greeting = `مرحباً بك! 👋 أنا مساعد بصيرة الذكي، هنا لأساعدك على فهم نتائج ${childName}.

📊 **ملخص سريع:**
- أكمل ${completedTests.length} من ${childResults.length} اختباراً
${weakAreas.length > 0 ? `- المجالات التي تحتاج اهتماماً: ${weakAreas.join('، ')}` : '- النتائج العامة إيجابية ✅'}

يمكنك سؤالي عن أي شيء تريد فهمه من النتائج، أو كيف تدعم طفلك في المنزل. كيف أقدر أساعدك؟`;

      setTimeout(() => {
        setMessages([{ role: 'assistant', content: greeting, timestamp: new Date() }]);
      }, 300);
    }
  }, [isOpen, hasGreeted, childName, childResults]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 400);
  }, [isOpen]);

  const buildContext = () => {
    const tested = childResults.filter(r => r.score > 0);
    const strong = tested.filter(r => r.score >= 75).map(r => `${r.title}: ${r.score}%`).join(', ');
    const weak = tested.filter(r => r.score < 60).map(r => `${r.title}: ${r.score}%`).join(', ');
    const moderate = tested.filter(r => r.score >= 60 && r.score < 75).map(r => `${r.title}: ${r.score}%`).join(', ');

    return `
أنت مساعد ذكي متخصص في صعوبات التعلم وتطور الأطفال. اسمك "مساعد بصيرة". دورك هو مساعدة أولياء الأمور على فهم نتائج أطفالهم وتقديم نصائح عملية بلغة عربية بسيطة وودية.

معلومات الطفل:
- الاسم: ${childName}
- العمر: ${studentProfile?.age || 'غير محدد'} سنة
- الصف: ${studentProfile?.grade || 'غير محدد'}

نتائج الاختبارات:
- المجالات القوية: ${strong || 'لا توجد بيانات كافية'}
- المجالات المتوسطة: ${moderate || 'لا توجد'}
- المجالات التي تحتاج دعماً: ${weak || 'لا توجد'}

${aiReport ? `التحليل السريري الذكي: ${JSON.stringify(aiReport).slice(0, 500)}` : ''}

قواعد مهمة في ردودك:
1. استخدم لغة بسيطة وودية مع الأهل — لا تستخدم مصطلحات تقنية معقدة
2. كن إيجابياً ومشجعاً دائماً
3. اذكر دائماً أن هذه نتائج مساعِدة وليست تشخيصاً طبياً نهائياً
4. قدّم اقتراحات عملية وقابلة للتطبيق في البيت
5. إذا سألوا عن شيء يحتاج تدخلاً متخصصاً، وجّههم لاستشارة الأخصائيين المختصين
6. ردودك يجب أن تكون باللغة العربية دائماً
7. اجعل الردود مختصرة (3-5 جمل) ما لم يطلبوا التفصيل
`;
  };

  const sendMessage = async (question?: string) => {
    const userMessage = question || input.trim();
    if (!userMessage || isTyping) return;

    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage, timestamp: new Date() }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const conversationHistory = newMessages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content
      }));

      const res = await fetch('/api/parent-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: buildContext(),
          history: conversationHistory,
          message: userMessage,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        // Handle specific status codes with better Arabic messages
        if (res.status === 429) {
          throw new Error('تم تجاوز حصة الاستخدام (Quota). يرجى الانتظار دقيقة واحدة ثم المحاولة.');
        }
        if (res.status === 403) {
          throw new Error('تم حظر الاتصال لأسباب أمنية (Security Block). يرجى التأكد من رابط الموقع.');
        }
        throw new Error(data.error || 'فشل الاتصال بمحرك الذكاء الاصطناعي');
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply,
        timestamp: new Date()
      }]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ عفواً: ${err.message}`,
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatContent = (text: string) => {
    // Bold text between **
    return text.split('\n').map((line, i) => {
      const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return <p key={i} className={`${line.startsWith('-') ? 'mr-2' : ''} mb-1`} dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(prev => !prev)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-8 left-8 z-[100] w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 shadow-[0_0_30px_rgba(6,182,212,0.5)] flex items-center justify-center text-2xl border-2 border-white/20"
        title="مساعد بصيرة الذكي"
      >
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? '✕' : '🤖'}
        </motion.span>
        {/* Pulse ring */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full border-2 border-cyan-400/50 animate-ping" />
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-28 left-8 z-[100] w-[380px] max-w-[calc(100vw-2rem)] max-h-[75vh] flex flex-col bg-[#0d1117] border border-white/10 rounded-[2rem] shadow-[0_0_60px_rgba(6,182,212,0.15)] overflow-hidden"
            dir="rtl"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-900/60 to-indigo-900/60 border-b border-white/10 px-5 py-4 flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center text-lg shrink-0">
                🤖
              </div>
              <div>
                <div className="text-white font-black text-sm">مساعد بصيرة الذكي</div>
                <div className="text-cyan-400 text-[10px] font-mono">للأهل فقط · نتائج {childName}</div>
              </div>
              <div className="mr-auto flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-[10px] font-mono">متصل</span>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {messages.length === 0 && (
                <div className="text-center text-slate-600 text-sm py-8">
                  <div className="text-4xl mb-3">👋</div>
                  جاري تحضير المساعد...
                </div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-cyan-600/20 border border-cyan-500/30 text-cyan-100 rounded-br-sm'
                      : 'bg-slate-800/80 border border-white/10 text-slate-200 rounded-bl-sm'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <div className="space-y-0.5">{formatContent(msg.content)}</div>
                    ) : (
                      msg.content
                    )}
                    <div className={`text-[9px] mt-2 font-mono ${msg.role === 'user' ? 'text-cyan-500' : 'text-slate-600'}`}>
                      {msg.timestamp.toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-end"
                >
                  <div className="bg-slate-800/80 border border-white/10 px-4 py-3 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1 items-center">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-cyan-400 rounded-full"
                          animate={{ y: [-3, 3, -3] }}
                          transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                        />
                      ))}
                      <span className="text-slate-500 text-[10px] font-mono mr-2">يفكر...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions (only if few messages) */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2 shrink-0">
                <div className="text-[10px] text-slate-500 font-mono mb-2">أسئلة مقترحة:</div>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_QUESTIONS.slice(0, 3).map(q => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="text-[10px] bg-slate-800 hover:bg-cyan-900/40 border border-slate-700 hover:border-cyan-500/50 text-slate-400 hover:text-cyan-300 px-2.5 py-1.5 rounded-xl transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="border-t border-white/10 p-3 shrink-0 bg-[#0d1117]">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="اسألني عن نتائج طفلك..."
                  disabled={isTyping}
                  className="flex-1 bg-slate-900 border border-white/10 focus:border-cyan-500/50 text-white text-sm px-4 py-2.5 rounded-xl outline-none placeholder:text-slate-600 transition-all disabled:opacity-50"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isTyping}
                  className="w-10 h-10 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:opacity-40 rounded-xl flex items-center justify-center transition-all shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 rotate-180">
                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                  </svg>
                </button>
              </div>
              <div className="text-[9px] text-slate-700 text-center mt-2 font-mono">
                يعمل بتقنية Gemini AI · للإرشاد فقط وليس للتشخيص الطبي
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
