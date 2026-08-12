// بيانات مراحل النمو - مبنية على أطر عالمية معروفة (WHO / CDC "Learn the Signs. Act Early")
// المحتوى معاد صياغته بالعربية والإنجليزية لأغراض تعليمية وليس بديلاً عن التشخيص الطبي.
// Growth milestone data — based on well-known global frameworks (WHO / CDC "Learn the Signs. Act Early").
// Content is paraphrased for educational purposes and is not a substitute for medical diagnosis.

export interface Localized {
  ar: string;
  en: string;
}

export type Domain = 'gross_motor' | 'fine_motor' | 'language' | 'social_emotional' | 'cognitive';

export const DOMAIN_LABELS: Record<Domain, Localized> = {
  gross_motor: { ar: 'الحركة الكبرى', en: 'Gross Motor' },
  fine_motor: { ar: 'الحركة الدقيقة', en: 'Fine Motor' },
  language: { ar: 'اللغة والتواصل', en: 'Language & Communication' },
  social_emotional: { ar: 'المهارات الاجتماعية والعاطفية', en: 'Social & Emotional' },
  cognitive: { ar: 'المهارات الإدراكية والمعرفية', en: 'Cognitive' },
};

export interface AgeStage {
  id: string;
  label: Localized;
  minMonths: number;
  maxMonths: number;
}

export const AGE_STAGES: AgeStage[] = [
  { id: 'm1', label: { ar: 'الشهر الأول', en: 'Month 1' }, minMonths: 0, maxMonths: 1 },
  { id: 'm2', label: { ar: 'الشهر الثاني', en: 'Month 2' }, minMonths: 1, maxMonths: 2 },
  { id: 'm4', label: { ar: 'الشهر الرابع', en: 'Month 4' }, minMonths: 3, maxMonths: 4 },
  { id: 'm6', label: { ar: 'الشهر السادس', en: 'Month 6' }, minMonths: 5, maxMonths: 6 },
  { id: 'm9', label: { ar: 'الشهر التاسع', en: 'Month 9' }, minMonths: 8, maxMonths: 9 },
  { id: 'm12', label: { ar: 'السنة الأولى', en: 'Year 1 (12 months)' }, minMonths: 11, maxMonths: 12 },
  { id: 'm15', label: { ar: '15 شهر', en: '15 months' }, minMonths: 14, maxMonths: 15 },
  { id: 'm18', label: { ar: '18 شهر', en: '18 months' }, minMonths: 17, maxMonths: 18 },
  { id: 'm24', label: { ar: 'السنتان', en: '2 years' }, minMonths: 23, maxMonths: 24 },
  { id: 'm30', label: { ar: '30 شهر', en: '30 months' }, minMonths: 29, maxMonths: 30 },
  { id: 'y3', label: { ar: '3 سنوات', en: '3 years' }, minMonths: 35, maxMonths: 36 },
  { id: 'y4', label: { ar: '4 سنوات', en: '4 years' }, minMonths: 47, maxMonths: 48 },
  { id: 'y5', label: { ar: '5 سنوات', en: '5 years' }, minMonths: 59, maxMonths: 60 },
];

export interface Milestone {
  id: string;
  ageStageId: string;
  domain: Domain;
  title: Localized;
}

export interface RedFlag {
  id: string;
  ageStageId: string;
  domain: Domain;
  warningSign: Localized;
  possibleCauses: Localized[];
  severity: 'normal_variant_possible' | 'needs_evaluation' | 'urgent';
  specialist: Localized;
  notes: Localized;
}

export const MILESTONES: Milestone[] = [
  // الشهر الأول (المولود الجديد)
  { id: 'ms-m1-1', ageStageId: 'm1', domain: 'gross_motor', title: { ar: 'يحرك ذراعيه ورجليه بشكل عفوي', en: 'Moves arms and legs spontaneously' } },
  { id: 'ms-m1-2', ageStageId: 'm1', domain: 'gross_motor', title: { ar: 'يرفع رأسه للحظات وهو على بطنه', en: 'Briefly lifts head during tummy time' } },
  { id: 'ms-m1-3', ageStageId: 'm1', domain: 'cognitive', title: { ar: 'يركّز نظره على وجه قريب منه (20-30 سم)', en: 'Focuses on a face 8-12 inches away' } },
  { id: 'ms-m1-4', ageStageId: 'm1', domain: 'language', title: { ar: 'ينتبه أو يفزع من الأصوات العالية المفاجئة', en: 'Reacts or startles to sudden loud sounds' } },
  { id: 'ms-m1-5', ageStageId: 'm1', domain: 'social_emotional', title: { ar: 'يهدأ عند حمله أو سماع صوت مألوف', en: 'Calms down when held or hears a familiar voice' } },

  // شهر 2
  { id: 'ms-m2-1', ageStageId: 'm2', domain: 'social_emotional', title: { ar: 'يبتسم عند رؤية وجه شخص مألوف (ابتسامة اجتماعية)', en: 'Smiles at a familiar face (social smile)' } },
  { id: 'ms-m2-2', ageStageId: 'm2', domain: 'social_emotional', title: { ar: 'يهدأ مؤقتًا عند حمله أو التحدث إليه', en: 'Calms temporarily when held or spoken to' } },
  { id: 'ms-m2-3', ageStageId: 'm2', domain: 'language', title: { ar: 'يصدر أصوات غير البكاء (مناغاة بسيطة)', en: 'Makes sounds other than crying (early cooing)' } },
  { id: 'ms-m2-4', ageStageId: 'm2', domain: 'gross_motor', title: { ar: 'يرفع رأسه قليلاً وهو مستلقٍ على بطنه', en: 'Lifts head slightly during tummy time' } },
  { id: 'ms-m2-5', ageStageId: 'm2', domain: 'cognitive', title: { ar: 'يتابع الأشياء المتحركة بعينيه', en: 'Follows moving objects with eyes' } },

  // شهر 4
  { id: 'ms-m4-1', ageStageId: 'm4', domain: 'social_emotional', title: { ar: 'يبتسم من تلقاء نفسه ليلفت الانتباه', en: 'Smiles on his own to get attention' } },
  { id: 'ms-m4-2', ageStageId: 'm4', domain: 'social_emotional', title: { ar: 'يقلد بعض تعبيرات الوجه', en: 'Copies some facial expressions' } },
  { id: 'ms-m4-3', ageStageId: 'm4', domain: 'language', title: { ar: 'يصدر أصواتًا مناغاة متنوعة ويضحك بصوت عالٍ', en: 'Makes varied cooing sounds and laughs out loud' } },
  { id: 'ms-m4-4', ageStageId: 'm4', domain: 'gross_motor', title: { ar: 'يمسك رأسه بثبات دون دعم', en: 'Holds head steady without support' } },
  { id: 'ms-m4-5', ageStageId: 'm4', domain: 'fine_motor', title: { ar: 'يمسك لعبة ويحركها', en: 'Holds a toy and shakes it' } },
  { id: 'ms-m4-6', ageStageId: 'm4', domain: 'cognitive', title: { ar: 'يتابع الأشياء بعينيه من جانب لآخر', en: 'Tracks objects with eyes side to side' } },

  // شهر 6
  { id: 'ms-m6-1', ageStageId: 'm6', domain: 'social_emotional', title: { ar: 'يعرف الوجوه المألوفة ويبدي انزعاجًا من الغرباء', en: 'Knows familiar faces and shows wariness of strangers' } },
  { id: 'ms-m6-2', ageStageId: 'm6', domain: 'language', title: { ar: 'يستجيب لاسمه ويصدر أصوات مقاطع (با-با، ما-ما دون قصد)', en: 'Responds to his name and babbles syllables (ba-ba, ma-ma, without meaning yet)' } },
  { id: 'ms-m6-3', ageStageId: 'm6', domain: 'gross_motor', title: { ar: 'يجلس دون مساندة', en: 'Sits without support' } },
  { id: 'ms-m6-4', ageStageId: 'm6', domain: 'gross_motor', title: { ar: 'يتدحرج من بطنه لظهره والعكس', en: 'Rolls from tummy to back and back to tummy' } },
  { id: 'ms-m6-5', ageStageId: 'm6', domain: 'fine_motor', title: { ar: 'ينقل شيئًا من يد لأخرى', en: 'Passes a toy from one hand to the other' } },

  // شهر 9
  { id: 'ms-m9-1', ageStageId: 'm9', domain: 'social_emotional', title: { ar: 'يخاف من الغرباء ويتعلق بالوالدين (قلق الانفصال)', en: 'Is wary of strangers and clings to parents (separation anxiety)' } },
  { id: 'ms-m9-2', ageStageId: 'm9', domain: 'language', title: { ar: 'يفهم كلمة "لا" ويردد مقاطع صوتية', en: 'Understands "no" and repeats sound syllables' } },
  { id: 'ms-m9-3', ageStageId: 'm9', domain: 'gross_motor', title: { ar: 'يزحف ويقف ممسكًا بشيء', en: 'Crawls and pulls to stand holding onto something' } },
  { id: 'ms-m9-4', ageStageId: 'm9', domain: 'fine_motor', title: { ar: 'يستخدم إصبعيه (السبابة والإبهام) لالتقاط أشياء صغيرة', en: 'Uses fingers (pincer grasp) to pick up small objects' } },
  { id: 'ms-m9-5', ageStageId: 'm9', domain: 'cognitive', title: { ar: 'يبحث عن شيء أخفيته أمامه', en: 'Looks for an object hidden in front of him' } },

  // 12 شهر
  { id: 'ms-m12-1', ageStageId: 'm12', domain: 'social_emotional', title: { ar: 'يلعب ألعاب تفاعلية بسيطة مثل "باي باي"', en: 'Plays simple interactive games like "bye-bye"' } },
  { id: 'ms-m12-2', ageStageId: 'm12', domain: 'language', title: { ar: 'يقول كلمة واحدة أو أكثر بمعنى واضح (ماما/بابا)', en: 'Says one or more words with clear meaning (mama/baba)' } },
  { id: 'ms-m12-3', ageStageId: 'm12', domain: 'language', title: { ar: 'يشير للأشياء التي يريدها', en: 'Points to things he wants' } },
  { id: 'ms-m12-4', ageStageId: 'm12', domain: 'gross_motor', title: { ar: 'يقف بمفرده ويمشي وهو ممسك بالأثاث', en: 'Stands alone and walks holding onto furniture' } },
  { id: 'ms-m12-5', ageStageId: 'm12', domain: 'cognitive', title: { ar: 'يستكشف الأشياء بطرق مختلفة (يهزها، يرميها)', en: 'Explores objects in different ways (shakes, throws)' } },

  // 15 شهر
  { id: 'ms-m15-1', ageStageId: 'm15', domain: 'gross_motor', title: { ar: 'يمشي بمفرده دون مساعدة', en: 'Walks alone without assistance' } },
  { id: 'ms-m15-2', ageStageId: 'm15', domain: 'language', title: { ar: 'يقول 3 كلمات أو أكثر', en: 'Says 3 or more words' } },
  { id: 'ms-m15-3', ageStageId: 'm15', domain: 'social_emotional', title: { ar: 'يظهر تعلقًا واضحًا بمقدم الرعاية ويقلد أفعال الكبار', en: "Shows clear attachment to caregiver and copies adults' actions" } },
  { id: 'ms-m15-4', ageStageId: 'm15', domain: 'cognitive', title: { ar: 'يستخدم الأشياء بشكل صحيح (يشرب من الكوب، يمشط شعره)', en: 'Uses objects correctly (drinks from a cup, brushes hair)' } },

  // 18 شهر
  { id: 'ms-m18-1', ageStageId: 'm18', domain: 'language', title: { ar: 'يقول حوالي 10 كلمات أو أكثر', en: 'Says about 10 or more words' } },
  { id: 'ms-m18-2', ageStageId: 'm18', domain: 'gross_motor', title: { ar: 'يجري ويصعد السلم بمساعدة', en: 'Runs and climbs stairs with help' } },
  { id: 'ms-m18-3', ageStageId: 'm18', domain: 'fine_motor', title: { ar: 'يأكل بالملعقة ويشرب من الكوب بمفرده', en: 'Eats with a spoon and drinks from a cup by himself' } },
  { id: 'ms-m18-4', ageStageId: 'm18', domain: 'social_emotional', title: { ar: 'يشير لجزء من جسمه عند سؤاله', en: 'Points to a body part when asked' } },

  // 24 شهر
  { id: 'ms-m24-1', ageStageId: 'm24', domain: 'language', title: { ar: 'يكوّن جملًا من كلمتين (عايز مية)', en: 'Forms two-word sentences ("want water")' } },
  { id: 'ms-m24-2', ageStageId: 'm24', domain: 'language', title: { ar: 'يتبع تعليمات من خطوتين', en: 'Follows two-step instructions' } },
  { id: 'ms-m24-3', ageStageId: 'm24', domain: 'gross_motor', title: { ar: 'يركض بثبات ويركل الكرة', en: 'Runs steadily and kicks a ball' } },
  { id: 'ms-m24-4', ageStageId: 'm24', domain: 'fine_motor', title: { ar: 'يبني برجًا من 4 مكعبات أو أكثر', en: 'Builds a tower of 4 or more blocks' } },
  { id: 'ms-m24-5', ageStageId: 'm24', domain: 'social_emotional', title: { ar: 'يقلد سلوك الآخرين ويلعب بجانب أطفال آخرين', en: 'Copies others and plays alongside other children' } },

  // 30 شهر
  { id: 'ms-m30-1', ageStageId: 'm30', domain: 'language', title: { ar: 'يستخدم جملًا من 2-4 كلمات ويسمي أشياء مألوفة', en: 'Uses 2-4 word sentences and names familiar objects' } },
  { id: 'ms-m30-2', ageStageId: 'm30', domain: 'fine_motor', title: { ar: 'يمسك القلم ويحاول الرسم بخطوط', en: 'Holds a pen and attempts to draw lines' } },
  { id: 'ms-m30-3', ageStageId: 'm30', domain: 'cognitive', title: { ar: 'يفرز الأشكال والألوان', en: 'Sorts shapes and colors' } },
  { id: 'ms-m30-4', ageStageId: 'm30', domain: 'social_emotional', title: { ar: 'يبدي استقلالية ويحاول القيام بمهام بنفسه', en: 'Shows independence and tries to do tasks by himself' } },

  // 3 سنوات
  { id: 'ms-y3-1', ageStageId: 'y3', domain: 'language', title: { ar: 'يتحدث بجمل من 3 كلمات أو أكثر ويفهمه الغرباء غالبًا', en: 'Speaks in 3+ word sentences and is understood by strangers most of the time' } },
  { id: 'ms-y3-2', ageStageId: 'y3', domain: 'gross_motor', title: { ar: 'يصعد وينزل السلم بالتناوب، يقفز بقدمين', en: 'Climbs and descends stairs alternating feet, jumps with both feet' } },
  { id: 'ms-y3-3', ageStageId: 'y3', domain: 'fine_motor', title: { ar: 'يرسم دائرة ويقلب صفحات الكتاب واحدة تلو الأخرى', en: 'Draws a circle and turns book pages one at a time' } },
  { id: 'ms-y3-4', ageStageId: 'y3', domain: 'social_emotional', title: { ar: 'يلعب مع أطفال آخرين ويشارك أحيانًا', en: 'Plays with other children and shares occasionally' } },
  { id: 'ms-y3-5', ageStageId: 'y3', domain: 'cognitive', title: { ar: 'يفهم مفاهيم "نفس/مختلف" ويكمل ألغاز بسيطة', en: 'Understands "same/different" and completes simple puzzles' } },

  // 4 سنوات
  { id: 'ms-y4-1', ageStageId: 'y4', domain: 'language', title: { ar: 'يحكي قصة قصيرة ويستخدم جملًا من 4 كلمات فأكثر', en: 'Tells a short story and uses 4+ word sentences' } },
  { id: 'ms-y4-2', ageStageId: 'y4', domain: 'gross_motor', title: { ar: 'يقفز على قدم واحدة ويمسك الكرة', en: 'Hops on one foot and catches a ball' } },
  { id: 'ms-y4-3', ageStageId: 'y4', domain: 'fine_motor', title: { ar: 'يرسم شخصًا بـ2-4 أجزاء ويستخدم المقص', en: 'Draws a person with 2-4 parts and uses scissors' } },
  { id: 'ms-y4-4', ageStageId: 'y4', domain: 'social_emotional', title: { ar: 'يفضل اللعب التفاعلي مع أطفال آخرين ويتقمص أدوارًا', en: 'Prefers interactive play with other children and role-plays' } },
  { id: 'ms-y4-5', ageStageId: 'y4', domain: 'cognitive', title: { ar: 'يعد حتى 4 ويسمي بعض الألوان', en: 'Counts to 4 and names some colors' } },

  // 5 سنوات
  { id: 'ms-y5-1', ageStageId: 'y5', domain: 'language', title: { ar: 'يتحدث بوضوح تام ويستخدم جملًا مركبة، يعرف اسمه وعنوانه', en: 'Speaks clearly, uses compound sentences, knows his name and address' } },
  { id: 'ms-y5-2', ageStageId: 'y5', domain: 'gross_motor', title: { ar: 'يقفز، يتأرجح، يقف على قدم واحدة لثوانٍ', en: 'Hops, swings, stands on one foot for a few seconds' } },
  { id: 'ms-y5-3', ageStageId: 'y5', domain: 'fine_motor', title: { ar: 'يكتب بعض الحروف ويرسم شخصًا بتفاصيل أكثر', en: 'Writes some letters and draws a person with more detail' } },
  { id: 'ms-y5-4', ageStageId: 'y5', domain: 'social_emotional', title: { ar: 'يميز الواقع عن الخيال ويظهر استقلالية أكبر', en: 'Tells reality from make-believe and shows greater independence' } },
  { id: 'ms-y5-5', ageStageId: 'y5', domain: 'cognitive', title: { ar: 'يعد حتى 10 ويفهم المفاهيم اليومية (الوقت، العد)', en: 'Counts to 10 and understands everyday concepts (time, counting)' } },
];

export const RED_FLAGS: RedFlag[] = [
  {
    id: 'rf-m1-1',
    ageStageId: 'm1',
    domain: 'language',
    warningSign: { ar: 'لا يستجيب إطلاقًا للأصوات العالية المفاجئة', en: 'Does not respond at all to sudden loud sounds' },
    possibleCauses: [
      { ar: 'رد فعل خافت طبيعي عند بعض المواليد', en: 'A naturally mild reflex in some newborns' },
      { ar: 'ضعف سمع خلقي', en: 'Congenital hearing loss' },
      { ar: 'الطفل نائم بعمق وقت الملاحظة', en: 'The baby was in deep sleep during observation' },
    ],
    severity: 'needs_evaluation',
    specialist: { ar: 'طبيب أطفال (فحص السمع الروتيني للمواليد إن لم يكن قد تم)', en: 'Pediatrician (routine newborn hearing screening if not already done)' },
    notes: {
      ar: 'كل المواليد يفترض أن يخضعوا لفحص سمع أولي في المستشفى بعد الولادة مباشرة؛ لو معملتوش تأكدي من عمله.',
      en: 'All newborns should get an initial hearing screening at the hospital right after birth; if it wasn\'t done, make sure to get it done.',
    },
  },
  {
    id: 'rf-m1-2',
    ageStageId: 'm1',
    domain: 'gross_motor',
    warningSign: { ar: 'جسمه رخو جدًا (لا مقاومة) أو متيبس جدًا بشكل غير معتاد', en: 'Body is unusually floppy (no resistance) or unusually stiff' },
    possibleCauses: [
      { ar: 'تفاوت طبيعي في توتر العضلات بين المواليد', en: 'Natural variation in muscle tone among newborns' },
      { ar: 'ولادة مبكرة', en: 'Premature birth' },
      { ar: 'مشكلة عصبية عضلية تحتاج تقييمًا', en: 'A neuromuscular issue that needs evaluation' },
    ],
    severity: 'needs_evaluation',
    specialist: { ar: 'طبيب أطفال حديثي الولادة', en: 'Neonatologist / pediatrician' },
    notes: {
      ar: 'يُقيَّم هذا غالبًا في الفحوصات الدورية الأولى للمولود، فلا داعي للقلق الشديد بمفرده.',
      en: 'This is usually assessed during the first routine newborn checkups, so there is no need for severe worry on its own.',
    },
  },
  {
    id: 'rf-m2-1',
    ageStageId: 'm2',
    domain: 'social_emotional',
    warningSign: { ar: 'لا يبتسم للناس أبدًا حتى الآن', en: 'Does not smile at people at all yet' },
    possibleCauses: [
      { ar: 'اختلاف طبيعي في وتيرة النمو بين الأطفال', en: 'Natural variation in development pace between children' },
      { ar: 'مشكلة في الرؤية تمنعه من التعرف على الوجوه', en: 'A vision problem preventing him from recognizing faces' },
      { ar: 'تأخر عام في النمو', en: 'General developmental delay' },
    ],
    severity: 'needs_evaluation',
    specialist: { ar: 'طبيب أطفال (لتقييم أولي وتحويل لطبيب عيون أو أعصاب عند الحاجة)', en: 'Pediatrician (initial evaluation, with referral to ophthalmology or neurology if needed)' },
    notes: {
      ar: 'الابتسامة الاجتماعية عادة تظهر بين 6-8 أسابيع، فالتأخر البسيط شائع لكنه يستحق المتابعة إذا استمر بعد الشهرين.',
      en: 'The social smile usually appears between 6-8 weeks, so a slight delay is common but worth following up if it persists past 2 months.',
    },
  },
  {
    id: 'rf-m2-2',
    ageStageId: 'm2',
    domain: 'gross_motor',
    warningSign: { ar: 'لا يستطيع رفع رأسه إطلاقًا وهو على بطنه', en: 'Cannot lift his head at all during tummy time' },
    possibleCauses: [
      { ar: 'ضعف عام في العضلات', en: 'General muscle weakness' },
      { ar: 'يحتاج وقتًا أطول للتمرن (طبيعي أحيانًا)', en: 'Needs more practice time (sometimes normal)' },
      { ar: 'مشكلة عصبية عضلية نادرة', en: 'A rare neuromuscular issue' },
    ],
    severity: 'needs_evaluation',
    specialist: { ar: 'طبيب أطفال / أخصائي علاج طبيعي للأطفال', en: 'Pediatrician / pediatric physical therapist' },
    notes: {
      ar: 'يفضل مراقبة الأمر في الفحص الدوري القادم إذا لم يصاحبه علامات أخرى.',
      en: 'It is best to monitor this at the next routine checkup if not accompanied by other signs.',
    },
  },
  {
    id: 'rf-m6-1',
    ageStageId: 'm6',
    domain: 'social_emotional',
    warningSign: { ar: 'لا يبدي أي تعبيرات فرح أو ابتسام واضح', en: 'Shows no clear expressions of joy or smiling' },
    possibleCauses: [
      { ar: 'تأخر في التطور الاجتماعي', en: 'Delay in social development' },
      { ar: 'مشكلة في السمع أو البصر', en: 'A hearing or vision problem' },
      { ar: 'أعراض مبكرة ضمن طيف التوحد (نادرة في هذا العمر لكن تستحق المتابعة)', en: 'Early signs within the autism spectrum (rare at this age but worth follow-up)' },
    ],
    severity: 'needs_evaluation',
    specialist: { ar: 'طبيب أطفال (وقد يحول لأخصائي نمو أطفال)', en: 'Pediatrician (may refer to a child development specialist)' },
    notes: {
      ar: 'مؤشر واحد بمفرده لا يعني تشخيصًا، لكنه يستدعي فحصًا شاملاً.',
      en: 'A single sign alone does not mean a diagnosis, but it warrants a comprehensive check-up.',
    },
  },
  {
    id: 'rf-m6-2',
    ageStageId: 'm6',
    domain: 'gross_motor',
    warningSign: { ar: 'لا يستطيع الجلوس حتى بمساعدة', en: 'Cannot sit even with support' },
    possibleCauses: [
      { ar: 'تفاوت طبيعي بين الأطفال', en: 'Natural variation between children' },
      { ar: 'انخفاض توتر العضلات (Hypotonia)', en: 'Low muscle tone (hypotonia)' },
      { ar: 'ولادة مبكرة تؤثر على الجدول الزمني للنمو', en: 'Premature birth affecting the developmental timeline' },
    ],
    severity: 'needs_evaluation',
    specialist: { ar: 'طبيب أطفال / أخصائي علاج طبيعي', en: 'Pediatrician / physical therapist' },
    notes: {
      ar: 'إذا كان الطفل خديجًا يُحسب عمره المعدّل (Corrected age) وليس عمره الفعلي عند تقييم المراحل.',
      en: 'If the child was premature, use the corrected age rather than the actual age when assessing milestones.',
    },
  },
  {
    id: 'rf-m9-1',
    ageStageId: 'm9',
    domain: 'language',
    warningSign: { ar: 'لا يصدر أي مقاطع صوتية (با-با، دا-دا) ولا يستجيب لاسمه', en: 'Makes no babbling sounds (ba-ba, da-da) and does not respond to his name' },
    possibleCauses: [
      { ar: 'ضعف سمع محتمل', en: 'Possible hearing loss' },
      { ar: 'تأخر لغوي بسيط شائع', en: 'A common mild language delay' },
      { ar: 'قلة التحفيز اللغوي في المحيط', en: 'Limited language stimulation in the environment' },
    ],
    severity: 'needs_evaluation',
    specialist: { ar: 'طبيب أنف وأذن وحنجرة لفحص السمع + أخصائي تخاطب', en: 'ENT for a hearing test + speech-language therapist' },
    notes: {
      ar: 'فحص السمع أول خطوة مهمة لأن أي ضعف سمعي غير مكتشف يؤثر مباشرة على اللغة لاحقًا.',
      en: 'A hearing test is the important first step, since undetected hearing loss directly affects language later on.',
    },
  },
  {
    id: 'rf-m9-2',
    ageStageId: 'm9',
    domain: 'gross_motor',
    warningSign: { ar: 'لا يستطيع تحمل وزنه على رجليه أو لا يزحف إطلاقًا', en: 'Cannot bear weight on his legs or does not crawl at all' },
    possibleCauses: [
      { ar: 'تفاوت طبيعي (بعض الأطفال يتخطون الزحف)', en: 'Natural variation (some children skip crawling)' },
      { ar: 'ضعف عضلي', en: 'Muscle weakness' },
      { ar: 'مشكلة عصبية عضلية تحتاج تقييم', en: 'A neuromuscular issue needing evaluation' },
    ],
    severity: 'needs_evaluation',
    specialist: { ar: 'طبيب أطفال / أخصائي علاج طبيعي للأطفال', en: 'Pediatrician / pediatric physical therapist' },
    notes: {
      ar: 'تخطي الزحف بحد ذاته طبيعي عند كثير من الأطفال، لكن غياب تحمل الوزن على الرجلين يستحق الفحص.',
      en: 'Skipping crawling by itself is normal for many children, but the inability to bear weight on the legs is worth checking.',
    },
  },
  {
    id: 'rf-m12-1',
    ageStageId: 'm12',
    domain: 'language',
    warningSign: { ar: 'لا يقول أي كلمة، ولا يشير، ولا يستخدم إيماءات مثل التلويح', en: 'Says no words, does not point, and does not use gestures like waving' },
    possibleCauses: [
      { ar: 'تأخر لغوي وحيد (شائع وغالبًا يُستدرك)', en: 'An isolated language delay (common and often catches up)' },
      { ar: 'ضعف سمع', en: 'Hearing loss' },
      { ar: 'مؤشر مبكر محتمل ضمن طيف التوحد', en: 'A possible early sign within the autism spectrum' },
    ],
    severity: 'needs_evaluation',
    specialist: { ar: 'طبيب أطفال لتقييم شامل، وقد يحول لأخصائي تخاطب أو أخصائي نمو أطفال', en: 'Pediatrician for a comprehensive evaluation, possibly referring to a speech therapist or child development specialist' },
    notes: {
      ar: 'غياب الإيماءات (وليس الكلام فقط) هو المؤشر الأهم الذي يستدعي تقييمًا مبكرًا.',
      en: 'The absence of gestures (not just speech) is the most important sign that warrants early evaluation.',
    },
  },
  {
    id: 'rf-m12-2',
    ageStageId: 'm12',
    domain: 'gross_motor',
    warningSign: { ar: 'لا يقف حتى بدعم ولا يحاول المشي بمساعدة', en: 'Does not stand even with support and does not attempt to walk with help' },
    possibleCauses: [
      { ar: 'تفاوت طبيعي (المشي المستقل يظهر بين 9-18 شهر)', en: 'Natural variation (independent walking appears between 9-18 months)' },
      { ar: 'ضعف عضلي', en: 'Muscle weakness' },
      { ar: 'خلل عصبي عضلي نادر', en: 'A rare neuromuscular disorder' },
    ],
    severity: 'normal_variant_possible',
    specialist: { ar: 'طبيب أطفال (للمتابعة الروتينية أولاً)', en: 'Pediatrician (for routine follow-up first)' },
    notes: {
      ar: 'المدى الطبيعي للمشي واسع جدًا؛ القلق يبدأ فعليًا إذا لم يمشِ الطفل عند 18 شهرًا.',
      en: 'The normal range for walking is very wide; real concern starts if the child still isn\'t walking by 18 months.',
    },
  },
  {
    id: 'rf-m18-1',
    ageStageId: 'm18',
    domain: 'language',
    warningSign: { ar: 'أقل من 6 كلمات في مفرداته، أو لا يقلد الآخرين', en: 'Fewer than 6 words in his vocabulary, or does not imitate others' },
    possibleCauses: [
      { ar: 'تأخر لغوي بسيط شائع الحدوث', en: 'A common mild language delay' },
      { ar: 'ضعف سمع لم يُكتشف بعد', en: 'Undetected hearing loss' },
      { ar: 'تأخر نمائي أوسع', en: 'A broader developmental delay' },
    ],
    severity: 'needs_evaluation',
    specialist: { ar: 'أخصائي تخاطب + طبيب أطفال', en: 'Speech-language therapist + pediatrician' },
    notes: {
      ar: 'التقييم المبكر للغة عند 18 شهرًا يحسن كثيرًا من نتائج التدخل المبكر إن وجدت مشكلة.',
      en: 'Early language evaluation at 18 months greatly improves outcomes of early intervention if an issue is found.',
    },
  },
  {
    id: 'rf-m18-2',
    ageStageId: 'm18',
    domain: 'social_emotional',
    warningSign: { ar: 'لا ينظر في عين من حوله، ولا يهتم باللعب التفاعلي مثل "باي باي"', en: 'Does not make eye contact and shows no interest in interactive play like "bye-bye"' },
    possibleCauses: [
      { ar: 'فروق فردية في الطباع (خجل مثلاً)', en: 'Individual temperament differences (e.g. shyness)' },
      { ar: 'مؤشر يستدعي تقييمًا ضمن طيف التوحد', en: 'A sign warranting evaluation within the autism spectrum' },
      { ar: 'مشكلة سمعية أو بصرية', en: 'A hearing or vision problem' },
    ],
    severity: 'needs_evaluation',
    specialist: { ar: 'طبيب أطفال / أخصائي نمو أطفال للتقييم الشامل', en: 'Pediatrician / child development specialist for a comprehensive evaluation' },
    notes: {
      ar: 'يفضل عدم الانتظار — كلما بدأ التقييم والتدخل مبكرًا كانت النتائج أفضل.',
      en: 'It is best not to wait — the earlier evaluation and intervention start, the better the outcomes.',
    },
  },
  {
    id: 'rf-m24-1',
    ageStageId: 'm24',
    domain: 'language',
    warningSign: { ar: 'لا يستخدم جملًا من كلمتين ولا يفهم تعليمات بسيطة', en: 'Does not use two-word sentences and does not understand simple instructions' },
    possibleCauses: [
      { ar: 'تأخر لغوي (قد يكون مؤقتًا خصوصًا في بيئات ثنائية اللغة)', en: 'A language delay (may be temporary, especially in bilingual environments)' },
      { ar: 'ضعف سمعي', en: 'Hearing loss' },
      { ar: 'اضطراب في التواصل يحتاج تقييمًا متخصصًا', en: 'A communication disorder needing specialized evaluation' },
    ],
    severity: 'needs_evaluation',
    specialist: { ar: 'أخصائي تخاطب وسمعيات + طبيب أطفال', en: 'Speech and hearing therapist + pediatrician' },
    notes: {
      ar: 'في البيئات ثنائية اللغة قد يكون التأخر الظاهري طبيعيًا، لكن يستحق تقييمًا للتفريق.',
      en: 'In bilingual environments the apparent delay may be normal, but it is still worth an evaluation to tell the difference.',
    },
  },
  {
    id: 'rf-m24-2',
    ageStageId: 'm24',
    domain: 'gross_motor',
    warningSign: { ar: 'لا يمشي بثبات أو يمشي على أطراف أصابعه بشكل مستمر', en: 'Does not walk steadily or walks on tiptoes constantly' },
    possibleCauses: [
      { ar: 'تفاوت طبيعي في اكتساب المهارة', en: 'Natural variation in acquiring the skill' },
      { ar: 'شد في وتر أخيل', en: 'Tightness in the Achilles tendon' },
      { ar: 'اضطراب عصبي عضلي يحتاج تقييمًا', en: 'A neuromuscular disorder needing evaluation' },
    ],
    severity: 'needs_evaluation',
    specialist: { ar: 'طبيب أطفال / أخصائي علاج طبيعي أو عظام أطفال', en: 'Pediatrician / pediatric physical therapist or orthopedist' },
    notes: {
      ar: 'المشي على الأصابع بشكل عابر شائع، لكن استمراره يستحق الفحص.',
      en: 'Occasional toe-walking is common, but if it persists it is worth checking.',
    },
  },
  {
    id: 'rf-y3-1',
    ageStageId: 'y3',
    domain: 'language',
    warningSign: { ar: 'كلامه غير مفهوم حتى لأفراد الأسرة، أو يفقد مهارات كان يمتلكها', en: 'Speech is not understood even by family members, or he loses skills he once had' },
    possibleCauses: [
      { ar: 'اضطراب نطق وظيفي', en: 'A functional articulation disorder' },
      { ar: 'مشكلة سمعية', en: 'A hearing problem' },
      { ar: 'فقدان مهارات مكتسبة يستدعي تقييمًا عاجلاً بغض النظر عن السبب', en: 'Loss of previously acquired skills warrants urgent evaluation regardless of cause' },
    ],
    severity: 'urgent',
    specialist: { ar: 'طبيب أطفال فورًا (فقدان مهارات مكتسبة أمر يستحق أولوية) + أخصائي تخاطب', en: 'Pediatrician immediately (loss of acquired skills is a priority) + speech-language therapist' },
    notes: {
      ar: 'فقدان مهارة كان الطفل يمتلكها من قبل يختلف عن مجرد التأخر، ويستدعي تقييمًا سريعًا دائمًا.',
      en: 'Losing a skill the child previously had is different from simple delay, and always warrants prompt evaluation.',
    },
  },
  {
    id: 'rf-y3-2',
    ageStageId: 'y3',
    domain: 'social_emotional',
    warningSign: { ar: 'لا يلعب مع أطفال آخرين ولا يظهر اهتمامًا بأي تفاعل اجتماعي', en: 'Does not play with other children and shows no interest in any social interaction' },
    possibleCauses: [
      { ar: 'طبع انطوائي طبيعي', en: 'A naturally introverted temperament' },
      { ar: 'قلق اجتماعي', en: 'Social anxiety' },
      { ar: 'مؤشر ضمن طيف التوحد يستدعي تقييمًا متخصصًا', en: 'A sign within the autism spectrum warranting specialized evaluation' },
    ],
    severity: 'needs_evaluation',
    specialist: { ar: 'أخصائي نمو أطفال / طبيب نفسي أطفال', en: 'Child development specialist / child psychologist' },
    notes: {
      ar: 'الفرق بين الخجل الطبيعي وانعدام الاهتمام الاجتماعي الكامل هو ما يحدده التقييم المتخصص.',
      en: 'A specialized evaluation is what distinguishes normal shyness from a complete lack of social interest.',
    },
  },
  {
    id: 'rf-y4-1',
    ageStageId: 'y4',
    domain: 'gross_motor',
    warningSign: { ar: 'يقع كثيرًا ويجد صعوبة واضحة في صعود ونزول السلم', en: 'Falls frequently and has clear difficulty going up and down stairs' },
    possibleCauses: [
      { ar: 'تفاوت طبيعي في التناسق الحركي', en: 'Natural variation in motor coordination' },
      { ar: 'ضعف عضلي', en: 'Muscle weakness' },
      { ar: 'اضطراب في التوازن أو التناسق يحتاج تقييمًا', en: 'A balance or coordination disorder needing evaluation' },
    ],
    severity: 'needs_evaluation',
    specialist: { ar: 'طبيب أطفال / أخصائي علاج طبيعي', en: 'Pediatrician / physical therapist' },
    notes: {
      ar: 'يُقارن دومًا بمدى تكرار السقوط ومدى تأثيره على الأنشطة اليومية.',
      en: 'This is always judged by how often falls happen and how much they affect daily activities.',
    },
  },
  {
    id: 'rf-y5-1',
    ageStageId: 'y5',
    domain: 'cognitive',
    warningSign: { ar: 'لا يستطيع اتباع تعليمات من خطوتين ولا يهتم بالتفاعل مع الأطفال الآخرين', en: 'Cannot follow two-step instructions and shows no interest in interacting with other children' },
    possibleCauses: [
      { ar: 'تأخر إدراكي يستدعي تقييمًا قبل دخول المدرسة', en: 'A cognitive delay warranting evaluation before starting school' },
      { ar: 'صعوبة انتباه', en: 'Attention difficulty' },
      { ar: 'مشكلة سمعية أو لغوية أساسية', en: 'An underlying hearing or language problem' },
    ],
    severity: 'needs_evaluation',
    specialist: { ar: 'أخصائي نمو أطفال / تقييم الاستعداد المدرسي', en: 'Child development specialist / school-readiness assessment' },
    notes: {
      ar: 'هذا العمر مهم للتقييم قبل دخول المدرسة لضمان دعم أي احتياج مبكرًا.',
      en: 'This age is important for pre-school evaluation to ensure any needs are supported early.',
    },
  },
];
