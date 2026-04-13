import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { apiGuard } from '@/lib/apiGuard';

// ──────────────────────────────────────────────────────────────
// API Route: /api/parent-chat
// مساعد بصيرة الذكي للأهل — Powered by Gemini SDK
// ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Apply security guard (rate limiting, origin check)
  const guard = await apiGuard(req);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status ?? 429 });
  }

  // 2. Select the API Key (Matching the working analyze route)
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY is missing in Vercel settings' }, { status: 500 });
  }

  try {
    const { context, history, message } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }

    // 3. Initialize Gemini SDK (Using the exact same config as the working report)
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash', 
    });

    // 4. Start Chat (Simplified to standard SDK patterns)
    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: `CONTEXT:\n${context}` }] },
        { role: 'model', parts: [{ text: 'OK. I am Basira Assistant. I will help the parents based on this context.' }] },
        ...history.map((m: any) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content || '' }],
        })),
      ],
    });

    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    if (!reply) {
      throw new Error('لم يتم توليد رد. قد يكون السبب قيود الحماية التلقائية.');
    }

    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error('[ParentChat] SDK Error:', error);
    
    // Handle specific Quota/Rate Limit error from SDK
    if (error.message?.includes('429') || error.message?.includes('quota')) {
      return NextResponse.json({ 
        error: 'تم تجاوز حصة الاستخدام المؤقتة (Quota Exceeded). يُرجى الانتظار دقيقة واحدة ثم المحاولة.' 
      }, { status: 429 });
    }

    return NextResponse.json({ 
      error: `عذراً، حدث خطأ في التواصل مع المحرك: ${error.message}` 
    }, { status: 500 });
  }
}

