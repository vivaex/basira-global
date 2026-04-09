import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'مفتاح API غير متوفر. الرجاء إضافة GEMINI_API_KEY في ملف .env.local' },
        { status: 500 }
      );
    }

    const { weakAreas, parentStats, emotionalStats } = await req.json();

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `
أنت دكتور وخبير تشخيص إكلينيكي في منصة بصيرة (Basira).
مهمتك هي وصف "جرعة معرفية (Cognitive Pills)" مخصصة للطفل للعمل عليها لمدة 15 دقيقة يومياً بناءً على البيانات المتوفرة.
يجب توفير 3 جرعات (ألعاب مصغرة) مختارة لمناطق الضعف لديه.

البيانات التقنية المتوفرة من المختبرات:
1. أضعف المناطق المعرفية: ${JSON.stringify(weakAreas)}
2. تقييم الأهل الميداني (من 100%، الأقل يعني أسوأ): ${JSON.stringify(parentStats)}
3. المؤشرات الانفعالية والسلوكية للطفل (أثناء الاختبار): ${JSON.stringify(emotionalStats)}

الأقسام/المختبرات العلاجية المتوفرة في النظام التي يمكنك الاختيار منها:
- /diagnose/attention (التركيز والانتباه)
- /diagnose/memory-test (الذاكرة العاملة)
- /diagnose/motor (التآزر الحركي والبصري-الحركي)
- /diagnose/visual (الإدراك البصري المكاني)
- /diagnose/auditory (الوعي الصوتي والسمعي)
- /diagnose/math (المنطق الرقمي وعسر الحساب)
- /diagnose/language (البناء اللغوي والطلاقة)
- /diagnose/executive (الوظائف التنفيذية والمرونة المعرفية)

المطلوب:
مخرجات بصيغة JSON فقط:
{
  "pills": [
    {
      "category": "الاسم القصير للقسم باللغة الإنجليزية (مثل: attention)",
      "title": "عنوان جذاب للجرعة (مثال: تدريب التركيز المكثف)",
      "desc": "فقرة طبية-تربوية قصيرة مقنعة توضح لولي الأمر بدقة *لماذا* تم بناءً على تقارير الطفل (مثل تشتت الانتباه العالي أو ضعف التآزر) اختيار هذه اللعبة للطفل.",
      "icon": "أيقونة إيموجي واحدة معبرة",
      "link": "يجب أن يكون حصراً أحد الروابط المتوفرة في النظام",
      "color": "اختر تدرج tailwind مناسب (مثال: from-emerald-400 to-teal-500)"
    }
  ],
  "encouragement": "رسالة تحفيزية قصيرة لولي الأمر تبث الطمأنينة."
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const data = JSON.parse(responseText);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('AI Pills Generation Error:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ في النظام الاصطناعي.' },
      { status: 500 }
    );
  }
}
