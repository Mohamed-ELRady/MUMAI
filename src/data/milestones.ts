// Reference links and review notes: docs/medical-sources.md
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
  { id: 'm2', label: { ar: 'الشهر الثاني', en: 'Month 2' }, minMonths: 2, maxMonths: 2 },
  { id: 'm4', label: { ar: 'الشهر الرابع', en: 'Month 4' }, minMonths: 4, maxMonths: 4 },
  { id: 'm6', label: { ar: 'الشهر السادس', en: 'Month 6' }, minMonths: 6, maxMonths: 6 },
  { id: 'm9', label: { ar: 'الشهر التاسع', en: 'Month 9' }, minMonths: 9, maxMonths: 9 },
  { id: 'm12', label: { ar: 'السنة الأولى', en: 'Year 1 (12 months)' }, minMonths: 12, maxMonths: 12 },
  { id: 'm15', label: { ar: '15 شهر', en: '15 months' }, minMonths: 15, maxMonths: 15 },
  { id: 'm18', label: { ar: '18 شهر', en: '18 months' }, minMonths: 18, maxMonths: 18 },
  { id: 'm24', label: { ar: 'السنتان', en: '2 years' }, minMonths: 24, maxMonths: 24 },
  { id: 'm30', label: { ar: '30 شهر', en: '30 months' }, minMonths: 30, maxMonths: 30 },
  { id: 'y3', label: { ar: '3 سنوات', en: '3 years' }, minMonths: 36, maxMonths: 36 },
  { id: 'y4', label: { ar: '4 سنوات', en: '4 years' }, minMonths: 48, maxMonths: 48 },
  { id: 'y5', label: { ar: '5 سنوات', en: '5 years' }, minMonths: 60, maxMonths: 60 },
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
  { id: 'ms-m6-1', ageStageId: 'm6', domain: 'social_emotional', title: { ar: 'يعرف الوجوه المألوفة', en: 'Recognizes familiar people' } },
  { id: 'ms-m6-2-v2', ageStageId: 'm6', domain: 'language', title: { ar: 'يتبادل الأصوات معك ويصدر أصوات مناغاة', en: 'Takes turns vocalizing with you and makes cooing sounds' } },
  { id: 'ms-m6-3', ageStageId: 'm6', domain: 'gross_motor', title: { ar: 'يسند نفسه بيديه أثناء الجلوس', en: 'Supports himself with his hands while sitting' } },
  { id: 'ms-m6-4', ageStageId: 'm6', domain: 'gross_motor', title: { ar: 'يتقلب من بطنه إلى ظهره', en: 'Rolls from his tummy onto his back' } },
  { id: 'ms-m6-5-v2', ageStageId: 'm6', domain: 'fine_motor', title: { ar: 'يمد يده ليمسك لعبة يريدها', en: 'Reaches out to grasp a toy he wants' } },

  // شهر 9
  { id: 'ms-m9-1', ageStageId: 'm9', domain: 'social_emotional', title: { ar: 'يخاف من الغرباء ويتعلق بالوالدين (قلق الانفصال)', en: 'Is wary of strangers and clings to parents (separation anxiety)' } },
  { id: 'ms-m9-2', ageStageId: 'm9', domain: 'language', title: { ar: 'يردد مقاطع صوتية مثل با با وما ما', en: 'Babbles repeated syllables such as ba-ba and ma-ma' } },
  { id: 'ms-m9-3-v2', ageStageId: 'm9', domain: 'gross_motor', title: { ar: 'يجلس من غير مساندة ويصل لوضع الجلوس بنفسه', en: 'Sits unsupported and gets into a sitting position' } },
  { id: 'ms-m9-4-v2', ageStageId: 'm9', domain: 'fine_motor', title: { ar: 'ينقل الأشياء بين يديه ويستخدم أصابعه لجمع الطعام نحوه', en: 'Transfers objects between hands and rakes food toward himself with his fingers' } },
  { id: 'ms-m9-5', ageStageId: 'm9', domain: 'cognitive', title: { ar: 'يبحث عن شيء أخفيته أمامه', en: 'Looks for an object hidden in front of him' } },

  { id: 'ms-m9-6', ageStageId: 'm9', domain: 'social_emotional', title: { ar: 'ينظر إليك لما تناديه باسمه', en: 'Looks toward you when you call his name' } },

  // 12 شهر
  { id: 'ms-m12-1', ageStageId: 'm12', domain: 'social_emotional', title: { ar: 'يلعب ألعاب تفاعلية بسيطة مثل "باي باي"', en: 'Plays simple interactive games like "bye-bye"' } },
  { id: 'ms-m12-2', ageStageId: 'm12', domain: 'language', title: { ar: 'يقول كلمة واحدة أو أكثر بمعنى واضح (ماما/بابا)', en: 'Says one or more words with clear meaning (mama/baba)' } },
  { id: 'ms-m12-3-v2', ageStageId: 'm12', domain: 'language', title: { ar: 'يفهم كلمة لا ويتوقف للحظة عند سماعها', en: 'Pauses briefly when told no' } },
  { id: 'ms-m12-4', ageStageId: 'm12', domain: 'gross_motor', title: { ar: 'يسحب نفسه للوقوف ويمشي ممسكًا بالأثاث', en: 'Pulls himself up and walks while holding furniture' } },
  { id: 'ms-m12-5', ageStageId: 'm12', domain: 'cognitive', title: { ar: 'يستكشف الأشياء بطرق مختلفة (يهزها، يرميها)', en: 'Explores objects in different ways (shakes, throws)' } },

  // 15 شهر
  { id: 'ms-m15-1', ageStageId: 'm15', domain: 'gross_motor', title: { ar: 'يأخذ بضع خطوات بمفرده', en: 'Takes a few steps independently' } },
  { id: 'ms-m15-2', ageStageId: 'm15', domain: 'language', title: { ar: 'يحاول يقول كلمة أو كلمتين غير ماما وبابا', en: 'Attempts one or two words beyond mama and dada' } },
  { id: 'ms-m15-3', ageStageId: 'm15', domain: 'social_emotional', title: { ar: 'يظهر تعلقًا واضحًا بمقدم الرعاية ويقلد أفعال الكبار', en: "Shows clear attachment to caregiver and copies adults' actions" } },
  { id: 'ms-m15-4', ageStageId: 'm15', domain: 'cognitive', title: { ar: 'يستخدم الأشياء بشكل صحيح (يشرب من الكوب، يمشط شعره)', en: 'Uses objects correctly (drinks from a cup, brushes hair)' } },

  // 18 شهر
  { id: 'ms-m18-1', ageStageId: 'm18', domain: 'language', title: { ar: 'يحاول يقول 3 كلمات أو أكثر غير ماما وبابا', en: 'Attempts at least three words beyond mama and dada' } },
  { id: 'ms-m18-2-v2', ageStageId: 'm18', domain: 'gross_motor', title: { ar: 'يمشي بمفرده من غير ما يمسك في شخص أو شيء', en: 'Walks independently without holding anyone or anything' } },
  { id: 'ms-m18-3', ageStageId: 'm18', domain: 'fine_motor', title: { ar: 'يحاول يستخدم الملعقة ويشرب من كوب مفتوح، وقد يسكب بعضه', en: 'Attempts to use a spoon and drinks from an open cup, with some spills' } },
  { id: 'ms-m18-4-v2', ageStageId: 'm18', domain: 'social_emotional', title: { ar: 'يشير لشيء ليلفت انتباهك إليه', en: 'Points something out to share his interest with you' } },

  // 24 شهر
  { id: 'ms-m24-1', ageStageId: 'm24', domain: 'language', title: { ar: 'يكوّن جملًا من كلمتين (عايز مية)', en: 'Forms two-word sentences ("want water")' } },
  { id: 'ms-m24-2-v2', ageStageId: 'm24', domain: 'language', title: { ar: 'يشير لجزأين على الأقل من جسمه عند سؤاله', en: 'Identifies at least two body parts by pointing when asked' } },
  { id: 'ms-m24-3', ageStageId: 'm24', domain: 'gross_motor', title: { ar: 'يركض بثبات ويركل الكرة', en: 'Runs steadily and kicks a ball' } },
  { id: 'ms-m24-4-v2', ageStageId: 'm24', domain: 'fine_motor', title: { ar: 'يأكل باستخدام الملعقة', en: 'Uses a spoon to eat' } },
  { id: 'ms-m24-5-v2', ageStageId: 'm24', domain: 'social_emotional', title: { ar: 'يلاحظ لما حد يكون زعلان أو متألم', en: 'Notices when another person is upset or hurt' } },

  // 30 شهر
  { id: 'ms-m30-1', ageStageId: 'm30', domain: 'language', title: { ar: 'يستخدم جملًا من 2-4 كلمات ويسمي أشياء مألوفة', en: 'Uses 2-4 word sentences and names familiar objects' } },
  { id: 'ms-m30-2', ageStageId: 'm30', domain: 'fine_motor', title: { ar: 'يمسك القلم ويحاول الرسم بخطوط', en: 'Holds a pen and attempts to draw lines' } },
  { id: 'ms-m30-3-v2', ageStageId: 'm30', domain: 'cognitive', title: { ar: 'يتبع تعليمات من خطوتين ويعرف لونًا واحدًا على الأقل', en: 'Carries out two-step instructions and recognizes at least one color' } },
  { id: 'ms-m30-4', ageStageId: 'm30', domain: 'social_emotional', title: { ar: 'يبدي استقلالية ويحاول القيام بمهام بنفسه', en: 'Shows independence and tries to do tasks by himself' } },

  // 3 سنوات
  { id: 'ms-y3-1', ageStageId: 'y3', domain: 'language', title: { ar: 'يتحدث بجمل من 3 كلمات أو أكثر ويفهمه الغرباء غالبًا', en: 'Speaks in 3+ word sentences and is understood by strangers most of the time' } },
  { id: 'ms-y3-2', ageStageId: 'y3', domain: 'gross_motor', title: { ar: 'يصعد وينزل السلم بالتناوب، يقفز بقدمين', en: 'Climbs and descends stairs alternating feet, jumps with both feet' } },
  { id: 'ms-y3-3', ageStageId: 'y3', domain: 'fine_motor', title: { ar: 'يرسم دائرة ويقلب صفحات الكتاب واحدة تلو الأخرى', en: 'Draws a circle and turns book pages one at a time' } },
  { id: 'ms-y3-4', ageStageId: 'y3', domain: 'social_emotional', title: { ar: 'يلعب مع أطفال آخرين ويشارك أحيانًا', en: 'Plays with other children and shares occasionally' } },
  { id: 'ms-y3-5', ageStageId: 'y3', domain: 'cognitive', title: { ar: 'يفهم مفاهيم "نفس/مختلف" ويكمل ألغاز بسيطة', en: 'Understands "same/different" and completes simple puzzles' } },

  // 4 سنوات
  { id: 'ms-y4-1', ageStageId: 'y4', domain: 'language', title: { ar: 'يحكي قصة قصيرة ويستخدم جملًا من 4 كلمات فأكثر', en: 'Tells a short story and uses 4+ word sentences' } },
  { id: 'ms-y4-2', ageStageId: 'y4', domain: 'gross_motor', title: { ar: 'يمسك كرة كبيرة معظم المحاولات', en: 'Catches a large ball on most attempts' } },
  { id: 'ms-y4-3', ageStageId: 'y4', domain: 'fine_motor', title: { ar: 'يرسم شخصًا بثلاثة أجزاء أو أكثر ويمسك القلم بأصابعه', en: 'Draws a person with at least three body parts and holds a pencil with his fingers' } },
  { id: 'ms-y4-4', ageStageId: 'y4', domain: 'social_emotional', title: { ar: 'يفضل اللعب التفاعلي مع أطفال آخرين ويتقمص أدوارًا', en: 'Prefers interactive play with other children and role-plays' } },
  { id: 'ms-y4-5', ageStageId: 'y4', domain: 'cognitive', title: { ar: 'يسمي بعض الألوان ويعرف ما يأتي بعد ذلك في قصة مألوفة', en: 'Names some colors and predicts what happens next in a familiar story' } },

  // 5 سنوات
  { id: 'ms-y5-1-v2', ageStageId: 'y5', domain: 'language', title: { ar: 'يحكي قصة من حدثين أو أكثر ويستمر في حوار متبادل', en: 'Tells a story with at least two events and keeps a conversation going' } },
  { id: 'ms-y5-2', ageStageId: 'y5', domain: 'gross_motor', title: { ar: 'يقفز على قدم واحدة', en: 'Hops using one foot' } },
  { id: 'ms-y5-3', ageStageId: 'y5', domain: 'fine_motor', title: { ar: 'يكتب بعض الحروف ويرسم شخصًا بتفاصيل أكثر', en: 'Writes some letters and draws a person with more detail' } },
  { id: 'ms-y5-4-v2', ageStageId: 'y5', domain: 'social_emotional', title: { ar: 'يتبع قواعد اللعبة ويتبادل الأدوار مع الأطفال', en: 'Follows game rules and takes turns with other children' } },
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
    id: 'rf-m4-1',
    ageStageId: 'm4',
    domain: 'gross_motor',
    warningSign: { ar: 'لا يستطيع تثبيت رأسه عند حمله', en: "Can't hold his head steady when picked up" },
    possibleCauses: [
      { ar: 'تفاوت طبيعي محتاج وقت أطول', en: 'Natural variation needing more time' },
      { ar: 'ضعف عضلي', en: 'Muscle weakness' },
      { ar: 'مشكلة عصبية عضلية نادرة', en: 'A rare neuromuscular issue' },
    ],
    severity: 'needs_evaluation',
    specialist: { ar: 'طبيب أطفال / أخصائي علاج طبيعي للأطفال', en: 'Pediatrician / pediatric physical therapist' },
    notes: {
      ar: 'عادة بيتقيّم في الفحص الدوري القادم لو مفيش علامات تانية مصاحبة.',
      en: 'This is usually assessed at the next routine checkup if not accompanied by other signs.',
    },
  },
  {
    id: 'rf-m4-2',
    ageStageId: 'm4',
    domain: 'cognitive',
    warningSign: { ar: 'لا يتابع الأشياء المتحركة بعينيه إطلاقًا', en: "Doesn't track moving objects with his eyes at all" },
    possibleCauses: [
      { ar: 'مشكلة بصرية تحتاج فحص', en: 'A vision problem needing a check-up' },
      { ar: 'تأخر بسيط في التطور البصري', en: 'A mild delay in visual development' },
      { ar: 'يحتاج وقتًا أطول للتركيز', en: 'Needs more time to focus' },
    ],
    severity: 'needs_evaluation',
    specialist: { ar: 'طبيب عيون أطفال / طبيب أطفال', en: 'Pediatric ophthalmologist / pediatrician' },
    notes: {
      ar: 'فحص النظر المبكر مهم لأن أي مشكلة بصرية غير مكتشفة تؤثر على التطور الحركي والإدراكي لاحقًا.',
      en: "Early vision screening matters because an undetected vision problem affects motor and cognitive development later on.",
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
    id: 'rf-m6-3',
    ageStageId: 'm6',
    domain: 'cognitive',
    warningSign: { ar: 'لا يحاول الوصول للأشياء القريبة منه', en: "Doesn't try to reach for nearby objects" },
    possibleCauses: [
      { ar: 'تفاوت طبيعي بين الأطفال', en: 'Natural variation between children' },
      { ar: 'ضعف بصري أو حركي', en: 'A vision or motor problem' },
      { ar: 'تأخر إدراكي مبكر', en: 'An early cognitive delay' },
    ],
    severity: 'needs_evaluation',
    specialist: { ar: 'طبيب أطفال', en: 'Pediatrician' },
    notes: {
      ar: 'الوصول للأشياء علامة مبكرة على التناسق بين البصر والحركة.',
      en: 'Reaching for objects is an early sign of hand-eye coordination.',
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
    warningSign: { ar: 'لا يجلس من غير مساندة عند 9 شهور', en: 'Cannot sit unsupported at 9 months' },
    possibleCauses: [
      { ar: 'اختلاف في التطور الحركي يحتاج تقييمًا', en: 'Variation in motor development that needs assessment' },
      { ar: 'ضعف عضلي', en: 'Muscle weakness' },
      { ar: 'مشكلة عصبية عضلية تحتاج تقييم', en: 'A neuromuscular issue needing evaluation' },
    ],
    severity: 'needs_evaluation',
    specialist: { ar: 'طبيب أطفال / أخصائي علاج طبيعي للأطفال', en: 'Pediatrician / pediatric physical therapist' },
    notes: {
      ar: 'الجلوس من غير مساندة من مهارات 9 شهور. لو مش موجود، ناقشيه مع طبيب الأطفال.',
      en: 'Discuss missing independent sitting at 9 months with the pediatrician.',
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
    severity: 'needs_evaluation',
    specialist: { ar: 'طبيب أطفال لتقييم النمو الحركي', en: 'Pediatrician for motor development assessment' },
    notes: {
      ar: 'عدم الوقوف حتى مع الدعم يستحق مناقشته مع طبيب الأطفال؛ لا تنتظري سن المشي المستقل لو عندك قلق.',
      en: 'Inability to stand even with support deserves discussion with the pediatrician; do not wait for independent walking if you are concerned.',
    },
  },
  {
    id: 'rf-m12-3',
    ageStageId: 'm12',
    domain: 'social_emotional',
    warningSign: { ar: 'لا يلعب أي لعبة تفاعلية ولا يقلد حركات بسيطة', en: "Doesn't play any interactive game and doesn't imitate simple actions" },
    possibleCauses: [
      { ar: 'تفاوت طبيعي', en: 'Natural variation' },
      { ar: 'قلة فرص التفاعل', en: 'Limited opportunities for interaction' },
      { ar: 'مؤشر يستدعي تقييمًا ضمن طيف التوحد', en: 'A sign warranting evaluation within the autism spectrum' },
    ],
    severity: 'needs_evaluation',
    specialist: { ar: 'طبيب أطفال / أخصائي نمو أطفال', en: 'Pediatrician / child development specialist' },
    notes: {
      ar: 'التقليد المبكر أساس مهم لتعلم اللغة والمهارات الاجتماعية لاحقًا.',
      en: 'Early imitation is an important foundation for later language and social skills.',
    },
  },
  {
    id: 'rf-m15-1',
    ageStageId: 'm15',
    domain: 'language',
    warningSign: { ar: 'لا يقول أي كلمة مفردة حتى الآن', en: "Doesn't say any single word yet" },
    possibleCauses: [
      { ar: 'تأخر لغوي شائع ويُستدرك غالبًا', en: 'A common language delay that often catches up' },
      { ar: 'ضعف سمع', en: 'Hearing loss' },
      { ar: 'تأخر نمائي أوسع', en: 'A broader developmental delay' },
    ],
    severity: 'needs_evaluation',
    specialist: { ar: 'أخصائي تخاطب + طبيب أطفال', en: 'Speech-language therapist + pediatrician' },
    notes: {
      ar: 'لو مصحوب بغياب الإشارة أو التواصل بالعين، يستحق تقييمًا أشمل بدون تأخير.',
      en: 'If accompanied by an absence of pointing or eye contact, it warrants a broader evaluation without delay.',
    },
  },
  {
    id: 'rf-m15-2',
    ageStageId: 'm15',
    domain: 'social_emotional',
    warningSign: { ar: 'لا يشير للأشياء ولا يظهر اهتمامًا بمشاركة الآخرين ما يعجبه', en: "Doesn't point to things or show interest in sharing what interests him with others" },
    possibleCauses: [
      { ar: 'فروق فردية في الطباع', en: 'Individual temperament differences' },
      { ar: 'تأخر لغوي مصاحب', en: 'An accompanying language delay' },
      { ar: 'مؤشر يستدعي تقييمًا ضمن طيف التوحد', en: 'A sign warranting evaluation within the autism spectrum' },
    ],
    severity: 'needs_evaluation',
    specialist: { ar: 'طبيب أطفال / أخصائي نمو أطفال', en: 'Pediatrician / child development specialist' },
    notes: {
      ar: 'الإشارة المشتركة (joint attention) من أهم علامات التواصل الاجتماعي المبكر.',
      en: 'Joint attention (shared pointing) is one of the most important early social communication signs.',
    },
  },
  {
    id: 'rf-m18-1',
    ageStageId: 'm18',
    domain: 'language',
    warningSign: { ar: 'لا يحاول يقول 3 كلمات غير ماما وبابا، أو لا يفهم أمرًا بسيطًا من خطوة واحدة', en: 'Does not attempt three words beyond mama and dada, or does not understand a simple one-step direction' },
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
      { ar: 'تأخر لغوي يحتاج تقييمًا عبر كل اللغات المستخدمة', en: 'A language delay requiring assessment across all languages used' },
      { ar: 'ضعف سمعي', en: 'Hearing loss' },
      { ar: 'اضطراب في التواصل يحتاج تقييمًا متخصصًا', en: 'A communication disorder needing specialized evaluation' },
    ],
    severity: 'needs_evaluation',
    specialist: { ar: 'أخصائي تخاطب وسمعيات + طبيب أطفال', en: 'Speech and hearing therapist + pediatrician' },
    notes: {
      ar: 'التعرّض لأكتر من لغة لا يسبب تأخر اللغة بحد ذاته. التقييم يراعي مهارات الطفل في كل لغاته.',
      en: 'Exposure to multiple languages does not itself cause language delay. Assessment considers skills across all of the child’s languages.',
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
    id: 'rf-m30-1',
    ageStageId: 'm30',
    domain: 'language',
    warningSign: { ar: 'مفرداته لسه قليلة جدًا ومش بتزيد بمرور الوقت', en: "Vocabulary is still very limited and isn't growing over time" },
    possibleCauses: [
      { ar: 'تأخر لغوي يحتاج متابعة', en: 'A language delay needing follow-up' },
      { ar: 'ضعف سمعي غير مكتشف', en: 'Undetected hearing loss' },
      { ar: 'بيئة بها تحفيز لغوي محدود', en: 'An environment with limited language stimulation' },
    ],
    severity: 'needs_evaluation',
    specialist: { ar: 'أخصائي تخاطب + طبيب أطفال', en: 'Speech-language therapist + pediatrician' },
    notes: {
      ar: 'نمو المفردات المستمر مهم أكتر من العدد المطلق في هذا العمر.',
      en: 'Continued vocabulary growth matters more than the exact word count at this age.',
    },
  },
  {
    id: 'rf-m30-2',
    ageStageId: 'm30',
    domain: 'fine_motor',
    warningSign: { ar: 'لا يستطيع بناء برج بسيط من مكعبات أو مسك القلم إطلاقًا', en: "Can't stack a simple block tower or hold a pen at all" },
    possibleCauses: [
      { ar: 'تفاوت طبيعي محتاج تمرين أكتر', en: 'Natural variation needing more practice' },
      { ar: 'ضعف في التناسق الحركي الدقيق', en: 'Weakness in fine motor coordination' },
      { ar: 'تأخر نمائي أوسع', en: 'A broader developmental delay' },
    ],
    severity: 'needs_evaluation',
    specialist: { ar: 'طبيب أطفال / أخصائي علاج وظيفي', en: 'Pediatrician / occupational therapist' },
    notes: {
      ar: 'التآزر بين اليد والعين بيتطور تدريجيًا؛ الفحص مفيد لو مصحوب بتأخر في مجالات تانية.',
      en: 'Hand-eye coordination develops gradually; evaluation is useful if accompanied by delay in other areas.',
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
    id: 'rf-y4-2',
    ageStageId: 'y4',
    domain: 'language',
    warningSign: { ar: 'كلامه غير مفهوم لغرباء ولا يحكي جملة من 4 كلمات', en: "Speech isn't understood by strangers and he doesn't form 4-word sentences" },
    possibleCauses: [
      { ar: 'اضطراب نطق يحتاج متابعة', en: 'An articulation disorder needing follow-up' },
      { ar: 'تأخر لغوي أوسع', en: 'A broader language delay' },
      { ar: 'ضعف سمعي بسيط غير مكتشف', en: 'Mild undetected hearing loss' },
    ],
    severity: 'needs_evaluation',
    specialist: { ar: 'أخصائي تخاطب', en: 'Speech-language therapist' },
    notes: {
      ar: 'الوضوح المتوقع في هذا العمر إن يفهمه معظم الغرباء تقريبًا.',
      en: 'By this age, speech is expected to be understood by most strangers.',
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
  {
    id: 'rf-y5-2',
    ageStageId: 'y5',
    domain: 'social_emotional',
    warningSign: { ar: 'لا يتفاعل مع أطفال آخرين ولا يشارك في لعب تخيلي بسيط', en: "Doesn't interact with other children and doesn't engage in simple pretend play" },
    possibleCauses: [
      { ar: 'طبع خجول طبيعي', en: 'A naturally shy temperament' },
      { ar: 'صعوبة اجتماعية تستحق تقييمًا', en: 'A social difficulty worth evaluating' },
      { ar: 'مؤشر ضمن طيف التوحد', en: 'A sign within the autism spectrum' },
    ],
    severity: 'needs_evaluation',
    specialist: { ar: 'أخصائي نمو أطفال / طبيب نفسي أطفال', en: 'Child development specialist / child psychologist' },
    notes: {
      ar: 'الاستعداد الاجتماعي مهم قبل دخول المدرسة، وده وقت مناسب للتقييم لو فيه قلق حقيقي.',
      en: 'Social readiness matters before school, and this is a good time to evaluate if there is a real concern.',
    },
  },
];
