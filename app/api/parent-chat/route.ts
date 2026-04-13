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

  // 2. Select the best available API Key
  const apiKey = process.env.CHATBOT_GEMINI_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'مفتاح الذكاء الاصطناعي غير متوفر في الإعدادات' }, { status: 500 });
  }

  try {
    const { context, history, message } = await req.json();

    if (!message || typeof message !== 'string' || message.length > 1000) {
      return NextResponse.json({ error: 'رسالة غير صالحة أو طويلة جداً' }, { status: 400 });
    }

    // 3. Initialize Gemini SDK
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: context, // Use the context as a system instruction if supported, or prepended text
    });

    // 4. Start Chat with history
    const chat = model.startChat({
      history: history.map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.parts?.[0]?.text || m.content || '' }],
      })),
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.7,
      },
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

