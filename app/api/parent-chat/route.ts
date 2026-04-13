import { NextRequest, NextResponse } from 'next/server';
import { apiGuard } from '@/lib/apiGuard';

// ──────────────────────────────────────────────────────────────
// API Route: /api/parent-chat
// مساعد بصيرة الذكي للأهل — Powered by Gemini
// ──────────────────────────────────────────────────────────────

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

export async function POST(req: NextRequest) {
  // Apply security guard (rate limiting, origin check)
  const guard = await apiGuard(req);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status ?? 429 });
  }

  const apiKey = process.env.CHATBOT_GEMINI_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'مفتاح الذكاء الاصطناعي غير متوفر' }, { status: 500 });
  }


  let body: { context: string; history: any[]; message: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 });
  }

  const { context, history, message } = body;

  if (!message || typeof message !== 'string' || message.length > 800) {
    return NextResponse.json({ error: 'رسالة غير صالحة' }, { status: 400 });
  }

  // Build conversation for Gemini: inject system context into the first turn
  const systemPreamble = {
    role: 'user',
    parts: [{ text: `[SYSTEM CONTEXT - لا تذكر هذا للمستخدم]\n${context}` }]
  };
  const systemAck = {
    role: 'model',
    parts: [{ text: 'فهمت. أنا جاهز لمساعدة الأهل بناءً على نتائج الطفل المقدمة.' }]
  };

  // Filter history to exclude the very first greeting pair we injected
  const conversationHistory = history.length > 1 ? history.slice(1) : [];

  const contents = [
    systemPreamble,
    systemAck,
    ...conversationHistory,
    { role: 'user', parts: [{ text: message }] }
  ];

  try {
    console.log(`[ParentChat] New request for child: ${context.split('\n').find(l => l.includes('الاسم'))?.split(':')[1]?.trim()}`);
    
    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
          topP: 0.9,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      }),
    });

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      console.error('[ParentChat] Gemini API Error:', JSON.stringify(data, null, 2));
      return NextResponse.json({ 
        error: `خطأ في محرك الذكاء الاصطناعي: ${data.error?.message || 'فشل غير معروف'}`,
        debug: data.error
      }, { status: geminiRes.status });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) {
      console.error('[ParentChat] No reply in Gemini response:', JSON.stringify(data, null, 2));
      throw new Error('لم يتم استلام رد صالح من المحرك. قد يكون السبب قيود السلامة.');
    }

    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error('[ParentChat] Exception:', err);
    return NextResponse.json(
      { error: `عذراً، حدث خطأ تقني: ${err.message}` },
      { status: 500 }
    );
  }
}

