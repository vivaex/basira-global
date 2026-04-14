export type EngineType = 'QUIZ' | 'MEMORY' | 'CANVAS' | 'REACTION' | 'AI_CAMERA' | 'VOICE';

export interface TestRound {
  prompt?: string;
  options?: string[];
  correct?: string | number;
  timeLimit?: number;
  voicePrompt?: string;
  pattern?: number[];
  mood?: 'happy' | 'sad' | 'angry' | 'thinking' | 'idle';
  stimulus?: string;
  isTarget?: boolean; // For Reaction/CPT (Go vs No-Go)
  targetPath?: { x: number, y: number }[]; // For Drawing validation
}

export interface TestConfig {
  id: string;
  title: string;
  engine: EngineType;
  instructions: string;
  rounds: TestRound[];
}

export const DIAGNOSTIC_TESTS: Record<string, TestConfig> = {

  // ══════════════════════════════════════════════════════════════
  //  ATTENTION (الانتباه) — 6 sub-tests
  // ══════════════════════════════════════════════════════════════

  'cpt': {
    id: 'cpt', title: 'الانتباه المستمر CPT', engine: 'REACTION', instructions: 'اختبار الأداء المستمر (Continuous Performance Test). ستظهر أرقام متتابعة. اضغط فقط عندما ترى الرقم (7). لا تضغط على أي رقم آخر! هذا يقيس قدرتك على الانتباه المتواصل.', rounds: [
      { prompt: 'ظهر الرقم: 5 — هل تضغط؟', stimulus: '5', timeLimit: 2, isTarget: false },
      { prompt: 'ظهر الرقم: 7 — اضغط الآن!', stimulus: '7', timeLimit: 1.5, isTarget: true },
      { prompt: 'ظهر الرقم: 3 — لا تندفع!', stimulus: '3', timeLimit: 2, isTarget: false },
      { prompt: 'ظهر الرقم: 7 — سريعاً!', stimulus: '7', timeLimit: 1, isTarget: true },
      { prompt: 'ظهر الرقم: 9 — كن حذراً!', stimulus: '9', timeLimit: 1.5, isTarget: false },
    ]
  },

  'selective-attention': {
    id: 'selective-attention', title: 'ستروب: الانتباه الانتقائي', engine: 'QUIZ', instructions: 'اختبار ستروب (Stroop Effect). ستظهر كلمات ملونة. يجب أن تختار اللون الذي كُتبت به الكلمة وتتجاهل معناها! ركز جيداً.', rounds: [
      { prompt: '🎨 كلمة (أحـمـر) مكتوبة باللون الأزرق. ما هو لون الخط؟', options: ['أزرق 🟦', 'أحمر 🔴', 'أخضر 🟢'], correct: 'أزرق 🟦' },
      { prompt: '🎨 كلمة (أخـضـر) مكتوبة باللون الأصفر. ما لون الخط؟', options: ['أخضر 🟢', 'أصفر 🟡', 'أزرق 🟦'], correct: 'أصفر 🟡' },
      { prompt: '🎨 كلمة (أبـيـض) مكتوبة باللون الأحمر. ما لون الخط؟', options: ['أبيض ⬜', 'أسود ⬛', 'أحمر 🔴'], correct: 'أحمر 🔴' },
      { prompt: '🎨 كلمة (أصـفـر) مكتوبة باللون الأخضر. ما لون الخط؟', options: ['أصفر 🟡', 'أخضر 🟢', 'بنفسجي 🟣'], correct: 'أخضر 🟢' },
    ]
  },

  'divided-attention': {
    id: 'divided-attention', title: 'الانتباه المتشعب', engine: 'QUIZ', instructions: 'سنختبر قدرتك على الانتباه لشيئين في نفس الوقت! ستسمع كلمة وتحل مسألة حسابية معاً.', rounds: [
      { prompt: '🎧 استمع للكلمة (شمس)، ثم أجب: ما ناتج 2+3؟ وما الكلمة؟', options: ['5 ☀️ شمس', '4 🌙 قمر', '5 🌙 قمر'], correct: '5 ☀️ شمس', voicePrompt: 'شَمْس' },
      { prompt: '🎧 استمع للكلمة (نجمة)، ثم أجب: ما ناتج 4+1؟ وما الكلمة؟', options: ['5 ⭐ نجمة', '6 ☀️ شمس', '5 🌙 قمر'], correct: '5 ⭐ نجمة', voicePrompt: 'نَجْمَة' },
      { prompt: '🎧 استمع للكلمة (ورد)، ثم أجب: ما ناتج 3+3؟ وما الكلمة؟', options: ['6 🌹 ورد', '5 🌻 عباد شمس', '7 🌷 زهرة'], correct: '6 🌹 ورد', voicePrompt: 'وَرْد' },
    ]
  },

  'attention-shifting': {
    id: 'attention-shifting', title: 'مرونة الانتباه (Task Switching)', engine: 'QUIZ', instructions: 'تتغير القاعدة فجأة كل جولة! مرة نصنف حسب اللون، ومرة حسب الشكل، ومرة حسب النوع. مرونة عقلك هي سر النجاح.', rounds: [
      { prompt: '🔴 القاعدة: صنف حسب اللون → 🍎 تفاحة حمراء', options: ['أحمر 🔴', 'فاكهة 🍏', 'دائري ⭕'], correct: 'أحمر 🔴' },
      { prompt: '📐 القاعدة: صنف حسب الشكل → 📦 صندوق أزرق', options: ['أزرق 🟦', 'مربع 🔳', 'ثقيل ⚖️'], correct: 'مربع 🔳' },
      { prompt: '🐾 القاعدة: صنف حسب النوع → 🐘 فيل رمادي ضخم', options: ['رمادي 🔘', 'ضخم 🧱', 'حيوان 🐾'], correct: 'حيوان 🐾' },
      { prompt: '🎨 القاعدة: عودة للون! → 🌊 بحر عميق', options: ['أزرق 🟦', 'ماء 💧', 'طبيعة 🌿'], correct: 'أزرق 🟦' },
    ]
  },

  'impulsivity': {
    id: 'impulsivity', title: 'كبح الاندفاعية (Go/No-Go)', engine: 'QUIZ', instructions: 'قاعدة بسيطة: اضغط (اذهب) عند رؤية الضوء الأخضر، و(توقف) عند رؤية الضوء الأحمر. لا تندفع!', rounds: [
      { prompt: '🟢 ضوء أخضر!', options: ['اذهب ✅', 'توقف 🛑'], correct: 'اذهب ✅' },
      { prompt: '🟢 ضوء أخضر!', options: ['اذهب ✅', 'توقف 🛑'], correct: 'اذهب ✅' },
      { prompt: '🔴 ضوء أحمر!', options: ['اذهب ✅', 'توقف 🛑'], correct: 'توقف 🛑' },
      { prompt: '🟢 ضوء أخضر!', options: ['اذهب ✅', 'توقف 🛑'], correct: 'اذهب ✅' },
      { prompt: '🔴 ضوء أحمر! (لا تندفع!)', options: ['اذهب ✅', 'توقف 🛑'], correct: 'توقف 🛑' },
    ]
  },

  'hyperactivity': {
    id: 'hyperactivity', title: 'فرط النشاط (Hyperactivity)', engine: 'AI_CAMERA', instructions: 'مقياس حركة الجهاز والجسم الذكي. سنقوم بقياس الحركات الدقيقة للرأس والكتفين وحركة الجهاز لرصد مؤشرات فرط النشاط الجسدي. اجلس بثبات تام أمام الكاميرا وأمسك الجهاز بهدوء.', rounds: [
      { prompt: '🧘 وضعية الاستعداد... اجلس بانتصاب ووجهك للكاميرا.', timeLimit: 5 },
      { prompt: '🛑 تحدي التركيز! لا تتحرك أبداً ولا تهز الجهاز لمدة 15 ثانية.', timeLimit: 15 },
      { prompt: '✨ أحسنت! جولة أخيرة من الثبات العميق (10 ثوانٍ).', timeLimit: 10 },
    ]
  },

  'gaze-stability': {
    id: 'gaze-stability', title: 'ثبات النظرة (Gaze Stability)', engine: 'AI_CAMERA', instructions: 'اختبار التركيز البصري. ركز نظرك على النقطة الخضراء في منتصف الشاشة ولا تحيد عنها. هذا يقيس التشتت البصري والشرود الذهني.', rounds: [
      { prompt: '🟢 ركز على النبوءة الخضراء.. لا تنظر بعيداً.', timeLimit: 10 },
      { prompt: '⚖️ واصل التركيز.. نحن نقيس ثبات حدقة العين.', timeLimit: 10 },
    ]
  },

  'saccadic-tracking': {
    id: 'saccadic-tracking',
    title: 'التتبع السريع (Saccadic Tracking)',
    engine: 'AI_CAMERA',
    instructions: 'اختبار سرعة انتقال العين. اتبع الرموز التي ستظهر على الشاشة.',
    rounds: [
      { prompt: '👁️ تابع النقطة بعينيك فقط — لا تحرك رأسك' },
      { prompt: '👁️ النقطة تتحرك أسرع — حافظ على التركيز' },
      { prompt: '👁️ المرحلة الأخيرة — ثبات مطلق' },
    ]
  },

  'rapid-naming': {
    id: 'rapid-naming',
    title: 'تسمية الألوان السريعة (RAN) ⚡',
    engine: 'QUIZ',
    instructions: 'أنظر إلى الألوان التي ستظهر على الشاشة وقم بتسميتها بأسرع ما يمكن وبدقة عالية. هذا الاختبار يقيس سرعة استرجاع المعلومات اللفظية من الدماغ.',
    rounds: [
      { prompt: '🔴 سمِّ اللون الظاهر بأسرع ما يمكن:', options: ['أحمر', 'أزرق', 'أخضر', 'أصفر'], correct: 'أحمر', voicePrompt: 'سمِّ اللون الظاهر بأسرع ما يمكن' },
      { prompt: '🔵 سمِّ اللون التالي:', options: ['أحمر', 'أزرق', 'أخضر', 'أصفر'], correct: 'أزرق' },
      { prompt: '🟢 سمِّ اللون التالي:', options: ['أحمر', 'أزرق', 'أخضر', 'أصفر'], correct: 'أخضر' },
      { prompt: '🟡 سمِّ اللون التالي:', options: ['أحمر', 'أزرق', 'أخضر', 'أصفر'], correct: 'أصفر' },
    ]
  },

'symbol-search': {
  id: 'symbol-search', title: 'البحث عن الرموز (Symbol Search) 🔍', engine: 'QUIZ', instructions: 'هل الرمز الموجود في جهة اليمين موجود أيضاً ضمن الرموز في جهة اليسار؟ أجب بنعم أو لا بأسرع ما يمكن. هذا يقيس سرعة المعالجة البصرية.', rounds: [
    { prompt: '🔍 هل يوجد (★) هنا: [★, ●, ■]؟', options: ['نعم ✅', 'لا ❌'], correct: 'نعم ✅' },
    { prompt: '🔍 هل يوجد (▲) هنا: [◆, ●, ★]؟', options: ['نعم ✅', 'لا ❌'], correct: 'لا ❌' },
    { prompt: '🔍 هل يوجد (■) هنا: [■, ▲, ★]؟', options: ['نعم ✅', 'لا ❌'], correct: 'نعم ✅' },
    { prompt: '🔍 هل يوجد (◆) هنا: [●, ■, ★]؟', options: ['نعم ✅', 'لا ❌'], correct: 'لا ❌' },
  ]
},

  'decoding': {
    id: 'decoding',
    title: 'فك التشفير الصوتي',
    engine: 'QUIZ',
    instructions: 'سنعرض عليك كلمات. اختر الصورة التي تمثل الكلمة المعروضة. هذا يقيس سرعة تعرفك على الكلمات.',
    rounds: [
      { prompt: '📖 اقرأ الكلمة: (شَجَرَة) — ما الصورة الصحيحة؟', options: ['🌳 شجرة', '🌊 بحر', '🏠 بيت'], correct: '🌳 شجرة' },
      { prompt: '📖 اقرأ الكلمة: (قِطَّة) — ما الصورة الصحيحة؟', options: ['🐕 كلب', '🐈 قطة', '🐦 عصفور'], correct: '🐈 قطة' },
      { prompt: '📖 اقرأ الكلمة: (سَيَّارَة) — ما الصورة الصحيحة؟', options: ['🚗 سيارة', '🚂 قطار', '✈️ طائرة'], correct: '🚗 سيارة' },
      { prompt: '📖 اقرأ الكلمة: (زَهْرَة) — ما الصورة الصحيحة؟', options: ['🌻 زهرة', '🍎 تفاحة', '🌙 قمر'], correct: '🌻 زهرة' },
    ]
  },

  'nonsense-words': { id: 'nonsense-words', title: 'قراءة كلمات لا معنى لها', engine: 'QUIZ', instructions: 'هذه كلمات مخترعة ليس لها معنى. اقرأها بصوتك الداخلي ثم اختر الشكل الصوتي الصحيح. هذا يقيس مهارة فك التشفير الصوتي (Phonological Decoding).', rounds: [
    { prompt: '👽 اقرأ: (بَرْتَم). كم مقطع صوتي فيها؟', options: ['مقطعان 2️⃣', 'ثلاثة 3️⃣', 'واحد 1️⃣'], correct: 'مقطعان 2️⃣' },
    { prompt: '👽 اقرأ: (نُوشَلِيك). ما الحرف الأول؟', options: ['ن', 'و', 'ش'], correct: 'ن' },
    { prompt: '👽 اقرأ: (كَلْفَض). ما الحرف الأخير؟', options: ['ض', 'ف', 'ك'], correct: 'ض' },
  ]},

  'syllable-analysis': { id: 'syllable-analysis', title: 'تحليل المقاطع الصوتية', engine: 'QUIZ', instructions: 'قطّع الكلمة إلى مقاطعها الصوتية. مثلاً: (مَدْرَسَة) = مَدْ / رَ / سَة.', rounds: [
    { prompt: '✂️ قطّع كلمة (كِتَاب) إلى مقاطع:', options: ['كِ / تَا / ب ✅', 'كِتَ / اب', 'ك / ي / ت / ا / ب'], correct: 'كِ / تَا / ب ✅' },
    { prompt: '✂️ قطّع كلمة (مَوْز) إلى مقاطع:', options: ['مَوْ / ز ✅', 'م / و / ز', 'مَ / وْز'], correct: 'مَوْ / ز ✅' },
    { prompt: '✂️ كم مقطع في كلمة (فَرَاشَة)؟', options: ['3 مقاطع ✅', '4 مقاطع', '2 مقطعان'], correct: '3 مقاطع ✅' },
  ]},



  'phonemic-blending': {
    id: 'phonemic-blending',
    title: 'الدمج الصوتي',
    engine: 'QUIZ',
    instructions: 'سنعطيك حروفاً متفرقة. رتبها لتكوّن كلمة صحيحة! هذا يقيس مهارة الدمج الصوتي (Phonemic Blending).',
    rounds: [
      { prompt: '🔓 رتب الحروف: (ب - ا - ب) ما الكلمة؟', options: ['باب 🚪', 'بابا 👨', 'أبب'], correct: 'باب 🚪' },
      { prompt: '🔓 رتب الحروف: (ش - م - س) ما الكلمة؟', options: ['شمس ☀️', 'مشس', 'سمش'], correct: 'شمس ☀️' },
      { prompt: '🔓 رتب الحروف: (ق - ل - م) ما الكلمة؟', options: ['قلم ✏️', 'ملق', 'لقم'], correct: 'قلم ✏️' },
    ]
  },

  'reading-speed': { id: 'reading-speed', title: 'سرعة القراءة (Fluency Test)', engine: 'REACTION', instructions: 'ستظهر جملة قصيرة. اقرأها بصوت عالٍ وواضح أمام الميكروفون فور ظهورها. هذا يقيس طلاقة وسرعة القراءة.', rounds: [
    { prompt: '📖 اقرأ: "ذهب الولد إلى المدرسة"', timeLimit: 5 },
    { prompt: '📖 اقرأ: "القطة تلعب في الحديقة"', timeLimit: 4 },
    { prompt: '📖 اقرأ: "أحب أن أقرأ الكتب الملونة كل يوم"', timeLimit: 6 },
  ]},

  'reading-comprehension': { id: 'reading-comprehension', title: 'فهم المقروء (Comprehension)', engine: 'QUIZ', instructions: 'اقرأ القصة القصيرة ثم أجب عن الأسئلة. هذا يقيس عمق الفهم القرائي.', rounds: [
    { prompt: '📚 "ذهب سامي إلى السوق واشترى تفاحاً وموزاً." — ماذا اشترى سامي؟', options: ['تفاح وموز 🍎🍌', 'خبز وحليب 🍞🥛', 'سمك ولحم 🐟🥩'], correct: 'تفاح وموز 🍎🍌' },
    { prompt: '📚 "كانت ليلى حزينة لأن قطتها مريضة." — لماذا حزنت ليلى؟', options: ['لأن قطتها مريضة 🐱💊', 'لأنها ضاعت 🔍', 'لأنها جائعة 🍽️'], correct: 'لأن قطتها مريضة 🐱💊' },
    { prompt: '📚 "يحب أحمد الرسم أكثر من الرياضيات." — ما هواية أحمد المفضلة؟', options: ['الرسم 🎨', 'الرياضيات 🔢', 'القراءة 📖'], correct: 'الرسم 🎨' },
  ]},

  'ai-error-analysis': { id: 'ai-error-analysis', title: 'تحليل أخطاء القراءة (AI)', engine: 'AI_CAMERA', instructions: 'اقرأ الجملة بصوت عالٍ أمام الميكروفون. الذكاء الاصطناعي سيحلل نطقك ويكتشف الأخطاء الصوتية.', rounds: [
    { prompt: '🎤 اقرأ بصوت عالٍ: "ذَهَبَ الوَلَدُ إلى البَيْت"', voicePrompt: 'ذَهَبَ الوَلَدُ إلى البَيْت' },
    { prompt: '🎤 اقرأ بصوت عالٍ: "الشَّمْسُ تُشْرِقُ كُلَّ صَبَاح"', voicePrompt: 'الشَّمْسُ تُشْرِقُ كُلَّ صَبَاح' },
  ]},

  // ══════════════════════════════════════════════════════════════
  //  MATH (الرياضيات) — sub-tests for dyscalculia
  // ══════════════════════════════════════════════════════════════

  'number-sense': { id: 'number-sense', title: 'الحس الرقمي (Quantity Estimation)', engine: 'QUIZ', instructions: 'حدد الكمية الأقرب بالنظر دون عد. هذا يقيس "الحس العددي" الفطري.', rounds: [
    { prompt: '🍎 أيهما أكثر؟', options: ['🍎🍎🍎🍎🍎🍎🍎 (7)', '🍎🍎🍎 (3)'], correct: '🍎🍎🍎🍎🍎🍎🍎 (7)' },
    { prompt: '⭐ أيهما أكثر؟', options: ['⭐⭐⭐⭐ (4)', '⭐⭐⭐⭐⭐⭐⭐⭐⭐ (9)'], correct: '⭐⭐⭐⭐⭐⭐⭐⭐⭐ (9)' },
    { prompt: '🟢 رتب من الأصغر للأكبر: 8، 3، 5', options: ['3 → 5 → 8 ✅', '8 → 5 → 3', '5 → 3 → 8'], correct: '3 → 5 → 8 ✅' },
  ]},

  'basic-operations': { id: 'basic-operations', title: 'الاسترجاع الحسابي السريع', engine: 'QUIZ', instructions: 'أجب عن هذه المسائل بسرعة! هذا يقيس قدرة الذاكرة على استرجاع الحقائق الحسابية.', rounds: [
    { prompt: '➕ ما ناتج 3 + 4 ؟', options: ['7 ✅', '6', '8'], correct: '7 ✅' },
    { prompt: '➖ ما ناتج 9 - 3 ؟', options: ['5', '6 ✅', '7'], correct: '6 ✅' },
    { prompt: '✖️ ما ناتج 2 × 5 ؟', options: ['8', '10 ✅', '12'], correct: '10 ✅' },
    { prompt: '➗ ما ناتج 8 ÷ 2 ؟', options: ['4 ✅', '3', '6'], correct: '4 ✅' },
  ]},

  'math-word-problems': { id: 'math-word-problems', title: 'المسائل اللفظية', engine: 'QUIZ', instructions: 'اقرأ المسألة وحلها. هذا يقيس فهم المفاهيم الرياضية وليس فقط الحساب.', rounds: [
    { prompt: '🧮 عند سارة 5 تفاحات، أعطتها أمها 3. كم أصبح لديها؟', options: ['8 تفاحات 🍎', '2 تفاحات', '15 تفاحة'], correct: '8 تفاحات 🍎' },
    { prompt: '🧮 في الصف 12 طالباً، خرج 4. كم بقي؟', options: ['8 طلاب 👦', '16 طالباً', '4 طلاب'], correct: '8 طلاب 👦' },
  ]},

  'pattern-recognition': { id: 'pattern-recognition', title: 'التعرف على الأنماط', engine: 'QUIZ', instructions: 'أكمل النمط الرياضي! هذا يقيس التفكير المنطقي التسلسلي.', rounds: [
    { prompt: '🔢 ما العدد التالي؟ 2, 4, 6, 8, ___', options: ['10 ✅', '9', '12'], correct: '10 ✅' },
    { prompt: '🔢 ما العدد التالي؟ 1, 3, 5, 7, ___', options: ['8', '9 ✅', '10'], correct: '9 ✅' },
    { prompt: '🔢 ما العدد التالي؟ 10, 20, 30, ___', options: ['40 ✅', '35', '50'], correct: '40 ✅' },
  ]},

  // ══════════════════════════════════════════════════════════════
  //  VISUAL (البصر المكاني) — unique visual tests
  // ══════════════════════════════════════════════════════════════

  'visual-discrimination': { id: 'visual-discrimination', title: 'التمييز البصري (b/d/p/q)', engine: 'QUIZ', instructions: 'ابحث عن الحرف أو الشكل المختلف في كل سطر. هذا يقيس قدرتك على التمييز البصري الدقيق.', rounds: [
    { prompt: '🔍 أي حرف مختلف؟ b b d b', options: ['الثالث (d) 3️⃣', 'الأول 1️⃣', 'الرابع 4️⃣'], correct: 'الثالث (d) 3️⃣' },
    { prompt: '🔍 أي شكل مختلف؟ ◆ ◆ ◇ ◆', options: ['الثالث 3️⃣', 'الأول 1️⃣', 'الثاني 2️⃣'], correct: 'الثالث 3️⃣' },
    { prompt: '🔍 أي حرف مختلف؟ ع ع غ ع', options: ['الثالث (غ) 3️⃣', 'الأول 1️⃣', 'الرابع 4️⃣'], correct: 'الثالث (غ) 3️⃣' },
  ]},

  'visual-closure': { id: 'visual-closure', title: 'الإغلاق البصري (Visual Closure)', engine: 'QUIZ', instructions: 'سنعرض عليك أشكالاً ناقصة. ما هو الشكل المكتمل؟ هذا يقيس قدرة الدماغ على إكمال الأنماط.', rounds: [
    { prompt: '🧩 شكل ناقص: نصف دائرة مفتوحة من الأعلى. ما الشكل الكامل؟', options: ['دائرة ⭕', 'مربع ◻️', 'مثلث 🔺'], correct: 'دائرة ⭕' },
    { prompt: '🧩 شكل ناقص: ثلاثة أضلاع فقط. ما الشكل الكامل؟', options: ['مربع ◻️', 'دائرة ⭕', 'مثلث 🔺'], correct: 'مربع ◻️' },
    { prompt: '🧩 حرف ناقص: ينقصه عمود أيسر (_ ا). ما الحرف؟', options: ['ل (لام)', 'أ (ألف)', 'ك (كاف)'], correct: 'ل (لام)' },
  ]},

  'spatial-orientation': { id: 'spatial-orientation', title: 'التوجه المكاني (Spatial Orientation)', engine: 'QUIZ', instructions: 'حدد اتجاه الشكل أو الحرف بدقة. هذا يقيس الإدراك المكاني.', rounds: [
    { prompt: '🧭 أين يتجه السهم؟ ←', options: ['يسار ⬅️', 'يمين ➡️', 'أعلى ⬆️'], correct: 'يسار ⬅️' },
    { prompt: '🧭 أيهما انعكاس لحرف (b)؟', options: ['d ✅', 'p', 'q'], correct: 'd ✅' },
    { prompt: '🧭 أي صورة مقلوبة رأسياً؟ 🙂', options: ['🙃 مقلوبة', '😀 طبيعية', '😊 مائلة'], correct: '🙃 مقلوبة' },
  ]},

  'visual-tracking': { id: 'visual-tracking', title: 'التتبع البصري (Eye Tracking AI)', engine: 'AI_CAMERA', instructions: 'ثبّت نظرك على النقطة المتحركة. الكاميرا سترصد استقرار عينيك.', rounds: [
    { prompt: '👁️ تابع النقطة بعينيك فقط — لا تحرك رأسك' },
    { prompt: '👁️ النقطة تتحرك أسرع — حافظ على التركيز' },
    { prompt: '👁️ المرحلة الأخيرة — ثبات مطلق' },
  ]},

  // ══════════════════════════════════════════════════════════════
  //  MOTOR (الحركي) — fine motor skills
  // ══════════════════════════════════════════════════════════════

  'line-tracking': { id: 'line-tracking', title: 'تتبع المسار (Beery VMI)', engine: 'CANVAS', instructions: 'ارسم بإصبعك أو الفأرة على المسار المحدد بدقة. هذا يقيس التآزر البصري الحركي.', rounds: [
    { prompt: '✍️ ارسم خطاً مستقيماً أفقياً من اليمين لليسار' },
    { prompt: '✍️ ارسم دائرة مغلقة تماماً' },
    { prompt: '✍️ ارسم مثلثاً بثلاث زوايا واضحة' },
  ]},

  'shape-copying': { id: 'shape-copying', title: 'نسخ الأشكال الهندسية', engine: 'CANVAS', instructions: 'حاول نسخ الشكل المعروض بأكبر دقة ممكنة. هذا يقيس النضج الحركي الدقيق.', rounds: [
    { prompt: '📐 انسخ هذا الشكل: مربع □' },
    { prompt: '📐 انسخ هذا الشكل: معين ◇' },
    { prompt: '📐 انسخ هذا الشكل: نجمة ★' },
  ]},

  'finger-tapping': { id: 'finger-tapping', title: 'سرعة النقر (Finger Tapping)', engine: 'REACTION', instructions: 'انقر بأسرع ما يمكن! هذا يقيس سرعة المعالجة الحركية.', rounds: [
    { prompt: '⚡ انقر بأسرع ما تستطيع! (5 ثوانٍ)', timeLimit: 5 },
    { prompt: '⚡ أسرع! حاول تجاوز رقمك! (5 ثوانٍ)', timeLimit: 5 },
  ]},

  'micro-tremor': { id: 'micro-tremor', title: 'مؤشر التململ (ADHD Tremor)', engine: 'AI_CAMERA', instructions: 'اجلس باعتدال وابقَ ثابتاً. الكاميرا سترصد أي حركة لا إرادية.', rounds: [
    { prompt: '🧘 ابقَ ثابتاً تماماً... جاري الرصد' },
    { prompt: '🧘 استمر بالثبات... 20 ثانية' },
  ]},

  // ══════════════════════════════════════════════════════════════
  //  LANGUAGE (اللغة) — language processing
  // ══════════════════════════════════════════════════════════════

  'vocabulary': { id: 'vocabulary', title: 'الثروة اللغوية (Vocabulary)', engine: 'QUIZ', instructions: 'اختر معنى الكلمة الصحيح. هذا يقيس عمق المعرفة اللغوية.', rounds: [
    { prompt: '📚 ما معنى كلمة (شجاع)؟', options: ['لا يخاف 🦁', 'يحب الطعام 🍕', 'ينام كثيراً 😴'], correct: 'لا يخاف 🦁' },
    { prompt: '📚 ما معنى كلمة (كريم)؟', options: ['يعطي الآخرين 🤲', 'يركض سريعاً 🏃', 'يبكي كثيراً 😢'], correct: 'يعطي الآخرين 🤲' },
    { prompt: '📚 ما عكس كلمة (طويل)؟', options: ['قصير ✅', 'سمين', 'جميل'], correct: 'قصير ✅' },
  ]},

  'sentence-building': { id: 'sentence-building', title: 'بناء الجمل (Syntax)', engine: 'QUIZ', instructions: 'رتب الكلمات لتكوّن جملة صحيحة. هذا يقيس الوعي النحوي.', rounds: [
    { prompt: '🏗️ رتب: (المدرسة - إلى - ذهبت - سارة)', options: ['ذهبت سارة إلى المدرسة ✅', 'إلى ذهبت المدرسة سارة', 'سارة المدرسة إلى ذهبت'], correct: 'ذهبت سارة إلى المدرسة ✅' },
    { prompt: '🏗️ رتب: (الكتاب - يقرأ - أحمد)', options: ['يقرأ أحمد الكتاب ✅', 'الكتاب أحمد يقرأ', 'أحمد الكتاب يقرأ'], correct: 'يقرأ أحمد الكتاب ✅' },
  ]},

  'verbal-fluency': { id: 'verbal-fluency', title: 'الطلاقة اللفظية (AI Voice)', engine: 'AI_CAMERA', instructions: 'اذكر أكبر عدد من الحيوانات في 30 ثانية! الذكاء الاصطناعي سيحلل طلاقتك.', rounds: [
    { prompt: '🎤 اذكر حيوانات بأسرع ما يمكن خلال 30 ثانية!', timeLimit: 30 },
  ]},

  // ══════════════════════════════════════════════════════════════
  //  AUDITORY (السمعي) — auditory processing
  // ══════════════════════════════════════════════════════════════

  'sound-discrimination': { id: 'sound-discrimination', title: 'التمييز السمعي (Wepman)', engine: 'QUIZ', instructions: 'استمع لزوج من الكلمات. هل هما متطابقتان أم مختلفتان؟', rounds: [
    { prompt: '👂 استمع: (كَلْب — قَلْب)', options: ['مختلفتان ❌', 'متطابقتان 🟰'], correct: 'مختلفتان ❌', voicePrompt: 'كَلْب، قَلْب' },
    { prompt: '👂 استمع: (باب — باب)', options: ['متطابقتان 🟰', 'مختلفتان ❌'], correct: 'متطابقتان 🟰', voicePrompt: 'باب، باب' },
    { prompt: '👂 استمع: (تِين — طِين)', options: ['مختلفتان ❌', 'متطابقتان 🟰'], correct: 'مختلفتان ❌', voicePrompt: 'تِين، طِين' },
    { prompt: '👂 استمع: (سار — صار)', options: ['مختلفتان ❌', 'متطابقتان 🟰'], correct: 'مختلفتان ❌', voicePrompt: 'سار، صار' },
  ]},

  'phonemic-awareness': { id: 'phonemic-awareness', title: 'الوعي الفونيمي (Elision)', engine: 'QUIZ', instructions: 'احذف حرفاً من الكلمة وأخبرني ماذا يتبقى.', rounds: [
    { prompt: '🏔️ كلمة (جَبَل) بدون الحرف (ج) = ؟', options: ['بَل ✅', 'لَب', 'جَب'], correct: 'بَل ✅', voicePrompt: 'جَبَل' },
    { prompt: '🐟 كلمة (سَمَك) بدون الحرف (س) = ؟', options: ['مَك ✅', 'كَم', 'سَم'], correct: 'مَك ✅', voicePrompt: 'سَمَك' },
    { prompt: '🏠 كلمة (بَيْت) بدون الحرف (ب) = ؟', options: ['يْت ✅', 'بَي', 'تَب'], correct: 'يْت ✅', voicePrompt: 'بَيْت' },
  ]},

  'auditory-memory': { id: 'auditory-memory', title: 'الذاكرة السمعية (Digit Span)', engine: 'QUIZ', instructions: 'استمع لسلسلة الأرقام ثم أعد ترتيبها بنفس التسلسل.', rounds: [
    { prompt: '🔊 استمع: 3 — 7 — 1. ما الترتيب الصحيح؟', options: ['3, 7, 1 ✅', '1, 3, 7', '7, 1, 3'], correct: '3, 7, 1 ✅', voicePrompt: 'ثلاثة، سبعة، واحد' },
    { prompt: '🔊 استمع: 5 — 2 — 9 — 4. ما الترتيب؟', options: ['5, 2, 9, 4 ✅', '4, 9, 2, 5', '2, 5, 4, 9'], correct: '5, 2, 9, 4 ✅', voicePrompt: 'خمسة، اثنان، تسعة، أربعة' },
  ]},

  'rhyming': { id: 'rhyming', title: 'القافية والسجع (Rhyming)', engine: 'QUIZ', instructions: 'اختر الكلمة التي تقفّي مع الكلمة المعروضة (نفس الصوت الأخير).', rounds: [
    { prompt: '🎵 أي كلمة تقفّي مع (كتاب)؟', options: ['حساب 📖', 'قلم ✏️', 'بيت 🏠'], correct: 'حساب 📖' },
    { prompt: '🎵 أي كلمة تقفّي مع (قمر)؟', options: ['شجر 🌳', 'سماء ☁️', 'نجمة ⭐'], correct: 'شجر 🌳' },
    { prompt: '🎵 أي كلمة تقفّي مع (زهور)؟', options: ['عصفور 🐦', 'شمس ☀️', 'ماء 💧'], correct: 'عصفور 🐦' },
  ]},

  // ══════════════════════════════════════════════════════════════
  //  EXECUTIVE (الوظائف التنفيذية) — prefrontal cortex
  // ══════════════════════════════════════════════════════════════

  'inhibition': { id: 'inhibition', title: 'كبح الاستجابة (Inhibition)', engine: 'QUIZ', instructions: 'اختبار سريع: اضغط "نعم" فقط عندما ترى حيواناً. اضغط "لا" إذا كان شيئاً آخر!', rounds: [
    { prompt: '🐕 كلب — هل هذا حيوان؟', options: ['نعم ✅', 'لا ❌'], correct: 'نعم ✅' },
    { prompt: '🚗 سيارة — هل هذا حيوان؟', options: ['نعم ✅', 'لا ❌'], correct: 'لا ❌' },
    { prompt: '🐈 قطة — هل هذا حيوان؟', options: ['نعم ✅', 'لا ❌'], correct: 'نعم ✅' },
    { prompt: '🌳 شجرة — هل هذا حيوان؟', options: ['نعم ✅', 'لا ❌'], correct: 'لا ❌' },
    { prompt: '🐘 فيل — هل هذا حيوان؟', options: ['نعم ✅', 'لا ❌'], correct: 'نعم ✅' },
  ]},

  'working-memory': { id: 'working-memory', title: 'كورسي: الذاكرة العاملة المكانية', engine: 'MEMORY', instructions: 'ستومض مكعبات بترتيب معين. احفظ النمط واضغطه بنفس التسلسل.', rounds: [
    { prompt: '🧠 المستوى 1: 3 مكعبات', pattern: [3, 7, 1], timeLimit: 5 }, 
    { prompt: '🧠 المستوى 2: 4 مكعبات', pattern: [5, 2, 8, 4], timeLimit: 7 },
    { prompt: '🧠 المستوى 3: 5 مكعبات', pattern: [9, 1, 6, 3, 8], timeLimit: 9 }
  ]},

  'cognitive-flexibility': { id: 'cognitive-flexibility', title: 'ويسكونسن: المرونة المعرفية', engine: 'QUIZ', instructions: 'تتغير قاعدة التصنيف — مرة بالشكل، ومرة بالعدد، ومرة باللون. تكيّف سريعاً!', rounds: [
    { prompt: '⭐ صنف (نجمتان حمراوتان) بناءً على الشكل:', options: ['ثلاث نجوم ⭐⭐⭐', 'دائرتان 🔵🔵', 'مثلثان 🔺🔺'], correct: 'ثلاث نجوم ⭐⭐⭐' },
    { prompt: '🔄 تغيرت القاعدة! صنف (نجمتان حمراوتان) بناءً على العدد:', options: ['دائرتان 🔵🔵', 'نجمة واحدة ⭐', 'أربع مربعات 🟦🟦🟦🟦'], correct: 'دائرتان 🔵🔵' },
    { prompt: '🎨 تغيرت للون! صنف (مربع أصفر):', options: ['دائرة صفراء 🟡', 'مثلث أحمر 🔺', 'مربع أزرق 🟦'], correct: 'دائرة صفراء 🟡' },
  ]},

  'planning': { id: 'planning', title: 'التخطيط الحركي (متاهة)', engine: 'CANVAS', instructions: 'ارسم أقصر مسار يصل البداية بالنهاية. هذا يقيس قدرة التخطيط.', rounds: [
    { prompt: '🏰 ارسم مساراً من ⬇️ البداية إلى 🏁 النهاية في خط مستقيم' },
    { prompt: '🏰 ارسم مساراً متعرجاً حول العوائق' },
    { prompt: '🏰 ارسم أقصر مسار ممكن عبر المتاهة' },
  ]},

  // ══════════════════════════════════════════════════════════════
  //  COGNITIVE (الإدراك العام) — general cognition
  // ══════════════════════════════════════════════════════════════

  'categorization': { id: 'categorization', title: 'التصنيف المنطقي', engine: 'QUIZ', instructions: 'صنف العناصر في مجموعاتها الصحيحة. هذا يقيس التفكير التصنيفي.', rounds: [
    { prompt: '🧩 أي عنصر لا ينتمي للمجموعة؟ 🍎🍌🥕🍇', options: ['🥕 جزرة (خضار)', '🍎 تفاحة', '🍇 عنب'], correct: '🥕 جزرة (خضار)' },
    { prompt: '🧩 أي عنصر لا ينتمي؟ 🐕🐈🌳🐟', options: ['🌳 شجرة (نبات)', '🐕 كلب', '🐟 سمكة'], correct: '🌳 شجرة (نبات)' },
    { prompt: '🧩 أي عنصر لا ينتمي؟ ✈️🚗🚂🍕', options: ['🍕 بيتزا (طعام)', '✈️ طائرة', '🚂 قطار'], correct: '🍕 بيتزا (طعام)' },
  ]},

  'cause-effect': { id: 'cause-effect', title: 'السبب والنتيجة', engine: 'QUIZ', instructions: 'اربط كل سبب بنتيجته المنطقية. هذا يقيس التفكير الاستنتاجي.', rounds: [
    { prompt: '🤔 إذا نسيت مظلتك وأمطرت، ماذا سيحدث؟', options: ['ستبتل 🌧️', 'ستنام 😴', 'ستأكل 🍽️'], correct: 'ستبتل 🌧️' },
    { prompt: '🤔 إذا لم تدرس للامتحان، ماذا قد يحدث؟', options: ['درجات منخفضة 📉', 'ستسافر ✈️', 'ستلعب 🎮'], correct: 'درجات منخفضة 📉' },
    { prompt: '🤔 إذا سقيت الزرع يومياً، ماذا سيحدث؟', options: ['سينمو 🌱', 'سيطير 🕊️', 'سيتحدث 🗣️'], correct: 'سينمو 🌱' },
  ]},

  'analogies': { id: 'analogies', title: 'القياس المنطقي (Analogies)', engine: 'QUIZ', instructions: 'أكمل العلاقة المنطقية: كلمة هي لـ... كما كلمة هي لـ...', rounds: [
    { prompt: '🧠 يد : قفاز = قدم : ___', options: ['حذاء 👟', 'قبعة 🎩', 'خاتم 💍'], correct: 'حذاء 👟' },
    { prompt: '🧠 ليل : قمر = نهار : ___', options: ['شمس ☀️', 'نجمة ⭐', 'سحابة ☁️'], correct: 'شمس ☀️' },
    { prompt: '🧠 سمك : ماء = طيور : ___', options: ['سماء 🌤️', 'أرض 🌍', 'ثلج ❄️'], correct: 'سماء 🌤️' },
  ]},

  // ══════════════════════════════════════════════════════════════
  //  WRITING (الكتابة) — dysgraphia
  // ══════════════════════════════════════════════════════════════

  'letter-formation': { id: 'letter-formation', title: 'تشكيل الحروف', engine: 'CANVAS', instructions: 'ارسم الحرف المطلوب بأفضل شكل ممكن. هذا يقيس دقة التشكيل الحركي.', rounds: [
    { prompt: '✍️ ارسم حرف (ب) بشكل واضح وكبير' },
    { prompt: '✍️ ارسم حرف (ع) بشكل متصل' },
    { prompt: '✍️ ارسم كلمة (بيت) بخط واضح' },
  ]},

  'copy-text': { id: 'copy-text', title: 'نسخ النصوص', engine: 'CANVAS', instructions: 'انسخ الجملة كما هي بأفضل خط ممكن. هذا يقيس سرعة ودقة النسخ.', rounds: [
    { prompt: '📝 انسخ: "أنا أحب القراءة"' },
    { prompt: '📝 انسخ: "العلم نور والجهل ظلام"' },
  ]},

  'spelling': { id: 'spelling', title: 'الإملاء والتهجئة', engine: 'QUIZ', instructions: 'اختر التهجئة الصحيحة للكلمة المسموعة.', rounds: [
    { prompt: '✏️ ما التهجئة الصحيحة لكلمة (مدرسة)؟', options: ['مدرسة ✅', 'مدرصة', 'مضرسة'], correct: 'مدرسة ✅', voicePrompt: 'مَدْرَسَة' },
    { prompt: '✏️ ما التهجئة الصحيحة لكلمة (صديق)؟', options: ['صديق ✅', 'سديق', 'ضديق'], correct: 'صديق ✅', voicePrompt: 'صَدِيق' },
    { prompt: '✏️ ما التهجئة الصحيحة لكلمة (مستشفى)؟', options: ['مستشفى ✅', 'مسطشفى', 'مستسفا'], correct: 'مستشفى ✅', voicePrompt: 'مُسْتَشْفَى' },
  ]},

  // ══════════════════════════════════════════════════════════════
  //  SOCIAL-EMOTIONAL (الاجتماعي)
  // ══════════════════════════════════════════════════════════════

  'social-recognition': { id: 'social-recognition', title: 'تمييز المشاعر (Social AI)', engine: 'QUIZ', instructions: 'الروبوت "بصير" سيغير تعابيره. اكتشف شعوره الحالي!', rounds: [
    { prompt: '🤖 انظر إلى عيون بصير.. كيف يشعر الآن؟', options: ['سعيد ومتحمس ✨', 'حزين وهادئ 💙', 'غاضب جداً 💢'], correct: 'سعيد ومتحمس ✨', mood: 'happy' },
    { prompt: '🤖 تغيرت عيون بصير.. ما شعوره؟', options: ['أفكر بعمق 🧠', 'أشعر بالحزن 😢', 'أنا سعيد 🟢'], correct: 'أشعر بالحزن 😢', mood: 'sad' },
    { prompt: '🤖 بصير يتحرك بسرعة.. بماذا يشعر؟', options: ['متحمس للعب ⚡', 'غاضب ومنفعل 😡', 'يفكر في لغز 🔍'], correct: 'غاضب ومنفعل 😡', mood: 'angry' },
    { prompt: '🤖 عيون بصير تدور.. ماذا يفعل؟', options: ['نائم 💤', 'غاضب 🔴', 'يفكر في حل المسألة 💡'], correct: 'يفكر في حل المسألة 💡', mood: 'thinking' },
  ]},

  'empathy-scenarios': { id: 'empathy-scenarios', title: 'مواقف التعاطف', engine: 'QUIZ', instructions: 'اقرأ الموقف واختر الشعور المناسب. هذا يقيس مهارة التعاطف.', rounds: [
    { prompt: '📖 صديقك سقط وجرح ركبته. كيف يشعر؟', options: ['يتألم 😣', 'سعيد 😊', 'جائع 🍕'], correct: 'يتألم 😣' },
    { prompt: '📖 حصلت أختك على جائزة. كيف تشعر؟', options: ['فخور بها 🥳', 'غاضب 😡', 'حزين 😢'], correct: 'فخور بها 🥳' },
    { prompt: '📖 طفل جديد في الصف يجلس وحيداً. ماذا تفعل؟', options: ['أدعوه للعب معي 🤝', 'أتجاهله 🚶', 'أضحك عليه 😂'], correct: 'أدعوه للعب معي 🤝' },
  ]},

  'voice-naming': {
    id: 'voice-naming',
    title: 'مختبر النطق والصدى (Voice Lab)',
    engine: 'VOICE',
    instructions: 'انظر إلى الصورة التي سيعرضها "علي" ثم قل اسمها بصوت واضح أمام الميكروفون. سنختبر طلاقتك ومخارج الحروف لديك.',
    rounds: [
      { stimulus: '✏️', prompt: 'ما هذا؟ قل الاسم بصوت واضح.', correct: 'قلم' },
      { stimulus: '🍎', prompt: 'ما لون هذه الفاكهة؟ سمِّها:', correct: 'تفاحة' },
      { stimulus: '🚗', prompt: 'ما هذه الوسيلة؟', correct: 'سيارة' },
      { stimulus: '🌙', prompt: 'ماذا نرى في السماء ليلاً؟', correct: 'قمر' },
      { stimulus: '🐪', prompt: 'ما اسم هذا الحيوان؟', correct: 'جمل' },
      { stimulus: '🌳', prompt: 'ما هذه؟', correct: 'شجرة' },
      { stimulus: '🐈', prompt: 'ما اسم هذا الكائن الأليف؟', correct: 'قطة' },
      { stimulus: '🍊', prompt: 'ما اسم هذه الفاكهة؟', correct: 'برتقال' },
      { stimulus: '🍌', prompt: 'قل اسم هذه الفاكهة:', correct: 'موز' },
      { stimulus: '🏠', prompt: 'أين نعيش؟', correct: 'بيت' },
    ]
  },

};

export function getTestConfig(id: string): TestConfig {
  if (DIAGNOSTIC_TESTS[id]) return DIAGNOSTIC_TESTS[id];
  
  return {
    id: id, 
    title: 'التقييم التشخيصي: ' + id.replace(/-/g, ' '), 
    engine: 'REACTION', 
    instructions: 'اختبار سريري (CPT) لرد الفعل. اضغط بأسرع ما يمكن فور ظهور الإشارة.',
    rounds: [
      { prompt: '🎯 المرحلة 1: الانتباه المباشر', timeLimit: 3 },
      { prompt: '🎯 المرحلة 2: تعميق الملاحظة', timeLimit: 2 },
      { prompt: '🎯 المرحلة 3: رصد الاندفاعية', timeLimit: 1.5 },
    ]
  };
}
