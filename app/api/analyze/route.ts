import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  StudentProfile,
  TestSession,
  CaseStudy,
  getSkillLevelLabel,
  scoreToDifficultyLevel,
} from '@/lib/studentProfile';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

function buildCaseStudySummary(cs: CaseStudy | null): string {
  if (!cs || !cs.completedAt) return 'لم يتم تعبئة دراسة الحالة السريرية من قبل الأهل.';
  return `
[التاريخ الطبي والنمائي]:
- مضاعفات حمل: ${cs.medicalHistory.pregnancyComplications} / ولادة مبكرة: ${cs.medicalHistory.prematureBirth} / نقص أكسجين: ${cs.medicalHistory.oxygenDeprivation}
- تاريخ صرع/تشنجات: ${cs.medicalHistory.seizures} / أدوية فرط الحركة: ${cs.medicalHistory.adhdMedications}
- تأخر مشي: ${cs.developmentalHistory.walkingAge} شهر / تأخر نطق: ${cs.developmentalHistory.speechDelay} / مشاكل نطق: ${cs.developmentalHistory.pronunciationIssues}

[البيئة الأسرية]:
- تاريخ عائلي: صعوبات تعلم(${cs.familyBackground.historyLearningDisabilities}), عسر قراءة(${cs.familyBackground.historyDyslexia}), ADHD(${cs.familyBackground.historyAdhd}), توحد(${cs.familyBackground.historyAutism})
- استقرار أسري (والدين): ${cs.familyBackground.livesWithBothParents} / خلافات تؤثر: ${cs.familyBackground.familyConflicts} / متابعة الواجبات: ${cs.familyBackground.homeworkFollowUp}

[الأداء الأكاديمي والوظائف التنفيذية]:
- التهرب ورفض الدراسة: ${cs.academicHistory.refusesStudying} / إحباط: ${cs.academicHistory.feelsFrustrated} / بطء مقارنة بالزملاء: ${cs.academicHistory.needsExtraTime}
- تنظيم الحقيبة: ${cs.executiveFunction.organizesBag} / نسيان المهام: ${cs.executiveFunction.forgetsAssignments} / صعوبة تخطيط: ${cs.executiveFunction.planningDifficulty}

[المؤشرات السريرية - عسر القراءة والكتابة والحساب]:
- يعاني من قلب الحروف (ب/د): ${cs.dyslexiaIndicators.reversesLetters} / بطء مقلق في القراءة: ${cs.dyslexiaIndicators.readsVerySlowly}
- خط سيء/تشنج بالمسكة: ${cs.dysgraphiaIndicators.wrongPenGrip} / أخطاء إملائية مفرطة: ${cs.dysgraphiaIndicators.frequentSpellingMistakes}
- يخلط بالأرقام: ${cs.dyscalculiaIndicators.mixesNumbers} / صعوبة استيعاب رموز (+-): ${cs.dyscalculiaIndicators.cantUnderstandSymbols}

[الجانب النفسي]:
- التوتر والقلق: ${cs.psychologicalInfo.anxiety} / الخوف من الامتحانات: ${cs.psychologicalInfo.examFear} / تنمر دائم: ${cs.psychologicalInfo.bullied}

[أهم 3 تحديات حالية حددها الأهل]:
${cs.finalQuestion.top3Challenges.join('، ') || 'لم يحدد'}
`.trim();
}

// Build a rich contextual summary from session data
function buildSessionSummary(sessions: TestSession[]): string {
  if (!sessions || sessions.length === 0) return 'لا توجد جلسات تفصيلية محفوظة.';

  return sessions.map(s => {
    const avgTime = s.rounds.length > 0
      ? Math.round(s.rounds.reduce((a, r) => a + r.timeSpentMs, 0) / s.rounds.length)
      : 0;
    const errorTypes = s.rounds.filter(r => !r.isCorrect).map(r => r.errorType).filter(Boolean);
    const wrongFast = errorTypes.filter(e => e === 'too_fast').length;
    const wrongSlow = errorTypes.filter(e => e === 'too_slow').length;
    const wrongAns  = errorTypes.filter(e => e === 'wrong_answer').length;

    return `
• ${s.testTitle} (${s.testCategory}): ${s.rawScore}% | متوسط وقت السؤال: ${avgTime}ms
  - أخطاء: ${wrongAns} إجابة خاطئة / ${wrongFast} تسرّع / ${wrongSlow} تجاوز وقت
  - غياب التركيز: ${s.attention.tabSwitchCount} مرة | فترات توقف: ${s.attention.inactivityCount}
  - أحداث إحباط: ${s.emotional.frustrationEvents} | تسرع عاطفي: ${s.emotional.impulsivityEvents}
  - حالة الطالب قبل الاختبار: ${s.preTestReadiness?.studentState ?? 'غير محدد'}`.trim();
  }).join('\n');
}

function buildProfileSummary(profile: StudentProfile | null): string {
  if (!profile) return 'لا يوجد ملف طالب محفوظ.';

  const difficulties = Object.entries(profile.difficultiesIn)
    .filter(([, v]) => v)
    .map(([k]) => ({ reading: 'القراءة', writing: 'الكتابة', math: 'الحساب', comprehension: 'الفهم', attention: 'الانتباه' }[k]))
    .join(', ');

  return `
الاسم: ${profile.name} | العمر: ${profile.age ?? '?'} | الصف: ${profile.grade}
الصعوبات المذكورة: ${difficulties || 'لا شيء'}
مشاكل سمعية: ${profile.hasHearingIssues} | مشاكل بصرية: ${profile.hasVisionIssues}
أدوية منتظمة: ${profile.takesMedication ? 'نعم — ' + (profile.medicationNotes || 'لم يُحدد') : 'لا'}
حركة زائدة: ${profile.excessiveMovement} | يفقد التركيز بسرعة: ${profile.losesConcentrationQuickly}
ينسى التعليمات: ${profile.forgetsInstructions} | قلق الامتحانات: ${profile.testAnxiety}
تاريخ عائلي لصعوبات التعلم: ${profile.familyLearningDifficulties ? 'نعم' : 'لا'}
تاريخ ADHD/توحد عائلي: ${profile.familyADHDOrAutism ? 'نعم' : 'لا'}
التشخيصات المبدئية الحالية (الأب): التوحد(${profile.preliminaryDiagnosis?.autismSpectrum ?? false}), التواصل الاجتماعي(${profile.preliminaryDiagnosis?.socialCommunication ?? false}), القلق(${profile.preliminaryDiagnosis?.anxietyDisorder ?? false})
ملاحظات الإعاقة الخاصة: ${profile.preliminaryDiagnosis?.specialDisabilityNotes || 'لا يوجد'}`.trim();
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'مفتاح API غير متوفر. الرجاء إضافة GEMINI_API_KEY في ملف .env.local' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const {
      name,
      childResults,
      parentStats,
      studentProfile,
      sessions,
      caseStudy,
    }: {
      name: string;
      childResults: any[];
      parentStats: any[];
      studentProfile?: StudentProfile | null;
      sessions?: TestSession[];
      caseStudy?: CaseStudy | null;
    } = body;

    // Build enriched context strings
    const profileSummary = buildProfileSummary(studentProfile ?? null);
    const sessionSummary = buildSessionSummary(sessions ?? []);
    const caseStudySummary = buildCaseStudySummary(caseStudy ?? null);

    // Build scorecard with skill / difficulty levels
    const SKILL_LABELS: Record<string, string> = { excellent: 'ممتاز', average: 'متوسط', weak: 'ضعيف', very_weak: 'ضعيف جدًا' };
    const DIFF_LABELS: Record<string, string>  = { none: 'لا توجد صعوبة', mild: 'صعوبة بسيطة', moderate: 'صعوبة متوسطة', severe: 'صعوبة شديدة' };
    const scorecardText = childResults.map(lab => {
      const skillLevel = getSkillLevelLabel(lab.score);
      const diffLevel  = scoreToDifficultyLevel(lab.score);
      return `${lab.title}: ${lab.score}% — المستوى: ${SKILL_LABELS[skillLevel]} — الصعوبة: ${DIFF_LABELS[diffLevel]}`;
    }).join('\n');

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `
أنت خبير إكلينيكي وتشخيصي في "منظومة بصيرة" (Basira).
تخصصك: تشخيص صعوبات التعلم، ADHD، والتقييمات النمائية العصبية بمعايير DSM-5، WIAT، WISC، CTOPP، وأطر Orton-Gillingham.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔷 ملف الطالب الأساسي:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${profileSummary}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔷 دراسة الحالة السريرية المعمقة (Anamnesis - مدخلات الأهل):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${caseStudySummary}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔷 نتائج مختبرات بصيرة (الأداء الفعلي للطالب - Machine Data):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${scorecardText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔷 بيانات الجلسات الحية (المرحلة 3 — البيانات أثناء الاختبار):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${sessionSummary}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔷 رصد الأهل المنزلي (المرحلة 4):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${JSON.stringify(parentStats, null, 2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 المطلوب منك:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
قم بالرد بـ JSON فقط بالهيكل التالي:

{
  "diagnosisSummary": "ملخص تشخيصي دقيق (4-5 جمل) يشرح الحالة وأبرز الصعوبات والقدرات.",

  "difficultyTypes": [
    { "type": "اسم نوع الصعوبة الدقيق (مثل: عسر قراءة صوتي، عسر كتابة حركي، ضعف ذاكرة عاملة...)", "confidence": "عالي/متوسط/محتمل", "evidence": "ما يدل عليه من النتائج" }
  ],

  "strengths": ["نقطة قوة 1", "نقطة قوة 2", "نقطة قوة 3"],
  "challenges": ["تحدي 1", "تحدي 2", "تحدي 3"],

  "skillLevels": {
    "math": "ممتاز/متوسط/ضعيف/ضعيف جدًا",
    "visual": "...",
    "attention": "...",
    "reading": "...",
    "motor": "...",
    "language": "...",
    "auditory": "...",
    "executive": "...",
    "cognitive": "...",
    "writing": "..."
  },

  "attentionProfile": "تحليل الانتباه بناءً على بيانات غياب التركيز وفترات التوقف والتسرع (3-4 جمل).",

  "treatmentPlan": [
    { "phase": "المرحلة الأولى (الأسابيع 1-4)", "title": "عنوان", "description": "تفاصيل التدخل.", "sessionsPerWeek": 3 },
    { "phase": "المرحلة الثانية (الأسابيع 5-8)", "title": "عنوان", "description": "تفاصيل التدخل.", "sessionsPerWeek": 2 }
  ],

  "immediateNeeds": ["ما يحتاجه الطفل فورًا هذا الأسبوع 1", "احتياج فوري 2"],

  "parentGuide": {
    "homeActivities": ["نشاط منزلي 1", "نشاط منزلي 2", "نشاط منزلي 3"],
    "strengthsToReinforce": ["نقطة قوة يجب تعزيزها 1", "نقطة قوة 2"],
    "warningSignsToWatch": ["علامة تحتاج متابعة 1", "علامة 2"]
  },

  "teacherRecommendations": [
    "توصية للمعلم 1",
    "توصية للمعلم 2",
    "توصية للمعلم 3"
  ],

  "followUp": "كيف تتم المتابعة الدورية وما المؤشرات التي يراقبها الأهل والمعلم."
}

قواعد التفسير والمقارنة (ضروري جداً):
1. **الدمج السريري**: يجب دمج مدخلات الأهل (دراسة الحالة السريرية - Anamnesis) مع الأداء الفعلي الرقمي المستخلص من نتائج ألعاب المختبر (Machine Data) لتكوين تشخيص واحد مترابط.
2. **تأكيد المؤشرات**: إذا ذكر الأهل مؤشرات واضحة (مثل: قلب الحروف، الخلط بين الأرقام، تشنج مسكة القلم، أو تأخر النطق)، قم بتأكيد التشخيص واستخدامه كـ (Evidence) إذا تطابقت هذه الملاحظات مع درجات اختبار القراءة، الكتابة، الحساب واللغة.
3. **توجيه الخطة**: استخدم التحديات الـ 3 الأكثر إلحاحاً التي حددها الأهل كمستهدفات أساسية في "الاحتياجات الفورية".
4. **ربط التاريخ الوراثي**: اربط التاريخ العائلي (صعوبات تعلم، توحد، فرط حركة) بمدى قابلية الطالب وتفسير بطء الأداء، واذكره كسبب محتمل في التشخيص.
5. **معادلات التشخيص**:
   - ضعف القراءة + ضعف الصوتيات + ضعف السمعي = مؤشر Dyslexia صوتية
   - ضعف القراءة + ضعف البصري = مؤشر Dyslexia بصرية
   - ضعف الكتابة + خبط الحركي (motor) = مؤشر Dysgraphia حركية
   - ضعف الحساب + خلط الأرقام (حسب الباسبورت) = مؤشر Dyscalculia
   - ضعف الانتباه + الوظائف العليا + كثرة غياب التركيز في الألعاب = مؤشر ADHD
   - ضعف التواصل الاجتماعي + ضعف التعبير اللغوي + غياب التواصل البصري (Eye Contact) في التاريخ النمائي = مؤشر اضطراب طيف توحد (Autism) أو تواصل اجتماعي.
   - كثرة أحداث الإحباط + قلق الامتحانات + التوتر المذكور في التاريخ النفسي = مؤشر اضطراب قلق (Anxiety).

النص كله باللغة العربية، بأسلوب طبي-تربوي احترافي ومتعاطف.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const aiData = JSON.parse(responseText);

    return NextResponse.json(aiData);
  } catch (error: any) {
    console.error('AI Analysis Error:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ غير متوقع أثناء المعالجة' },
      { status: 500 }
    );
  }
}
