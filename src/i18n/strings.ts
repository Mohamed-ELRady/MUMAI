export type Lang = 'ar' | 'en';

export interface LocalizedStr {
  ar: string;
  en: string;
}

const strings = {
  appName: { ar: 'MUMAI', en: 'MUMAI' },

  // Onboarding
  onboardingTitle: { ar: 'أهلاً بيكِ في MUMAI 👶', en: 'Welcome to MUMAI 👶' },
  onboardingSubtitle: {
    ar: 'هنتابع مع بعض كل مرحلة من مراحل نمو طفلك خطوة بخطوة',
    en: "We'll track every stage of your child's growth together, step by step",
  },
  childNameLabel: { ar: 'اسم الطفل', en: "Child's name" },
  childNamePlaceholder: { ar: 'مثلاً: يوسف', en: 'e.g. Youssef' },
  birthDateLabel: { ar: 'تاريخ الميلاد', en: 'Date of birth' },
  invalidBirthDate: { ar: 'اختاري تاريخ ميلاد صحيح، النهارده أو قبله.', en: 'Choose a valid birthday, today or earlier.' },
  storageLoadError: { ar: 'تعذّر قراءة البيانات المحفوظة. جرّبي تاني لاسترجاعها قبل تسجيل بيانات جديدة.', en: 'Saved data could not be read. Retry to recover it before entering a new profile.' },
  storageSaveError: { ar: 'التغييرات ظاهرة، لكن لسه متحفظتش على الجهاز. جرّبي الحفظ تاني.', en: 'Your changes are visible but have not been saved on this device. Please retry.' },
  retryButton: { ar: 'إعادة المحاولة', en: 'Retry' },
  invalidStage: { ar: 'المرحلة دي مش موجودة. ارجعي لاختيار مرحلة من المتابعة.', en: 'This stage is unavailable. Go back and choose a stage from the tracker.' },
  startTrackingCta: { ar: 'ابدئي المتابعة', en: 'Start tracking' },
  saveChangesCta: { ar: 'حفظ التعديلات', en: 'Save changes' },
  editProfileTitle: { ar: 'تعديل بيانات الطفل', en: "Edit child's info" },
  defaultChildName: { ar: 'طفلي', en: 'my child' },

  // Home
  trackingGrowthOf: { ar: 'متابعة نمو', en: "Tracking" },
  editProfileButton: { ar: 'تعديل', en: 'Edit' },
  currentAgeLabel: { ar: 'العمر الحالي:', en: 'Current age:' },
  chatBanner: {
    ar: 'عندك سؤال عن مرحلة نمو معينة؟ اسألي المساعدة 💬',
    en: 'Have a question about a specific stage? Ask the assistant 💬',
  },
  skillsUnit: { ar: 'مهارة', en: 'skills' },
  notDueYet: { ar: 'لسه مجاش وقتها', en: 'Not due yet' },
  currentStageBadge: { ar: 'المرحلة الحالية', en: 'Current stage' },

  // Stage detail
  stageDetailSubtitle: {
    ar: 'علّمي على المهارات اللي طفلك بيعملها في المرحلة دي',
    en: 'Check off the skills your child is doing at this stage',
  },
  askAboutRemaining: { ar: 'فيه {n} مهارة لسه مش متعلّم عليها — اسألي عنها', en: '{n} unchecked skills — ask about them' },
  showRedFlags: { ar: 'عرض علامات تستحق انتباه في المرحلة دي ({n})', en: 'Show signs worth attention at this stage ({n})' },
  hideRedFlags: { ar: 'إخفاء علامات تستحق انتباه في المرحلة دي ({n})', en: 'Hide signs worth attention at this stage ({n})' },
  possibleCausesLabel: { ar: 'الأسباب المحتملة:', en: 'Possible causes:' },
  assessmentLabel: { ar: 'التقييم:', en: 'Assessment:' },
  specialistLabel: { ar: 'التخصص المناسب:', en: 'Recommended specialist:' },

  // Severity
  severityNormalVariant: { ar: 'غالبًا ضمن التفاوت الطبيعي', en: 'Likely within normal variation' },
  severityNeedsEvaluation: { ar: 'يستحق تقييم طبي', en: 'Worth a medical evaluation' },
  severityUrgent: { ar: 'يستدعي استشارة سريعة', en: 'Needs a prompt consultation' },

  // Chat
  chatTitle: { ar: 'اسألي المساعدة', en: 'Ask the assistant' },
  chatIntro: {
    ar: 'أهلاً! نقدر نراجع سوا مهارات نمو {name} والأسئلة اللي عندك عن الكلام والحركة والتواصل. احكيلي إيه اللي لاحظتيه، أو اختاري سؤال من الاقتراحات.',
    en: 'Hi! We can review {name}’s development and your questions about speech, movement and communication. Tell me what you have noticed, or choose a suggested question.',
  },
  chatPlaceholder: { ar: 'اكتبي سؤالك هنا...', en: 'Type your question here...' },
  sendButton: { ar: 'إرسال', en: 'Send' },
  chatLocal: { ar: 'دليل النمو المحلي — متاح من غير اتصال', en: 'Local development guide — available offline' },
  chatProxy: { ar: 'رد من المساعد المتصل', en: 'Reply from the connected assistant' },
  chatConnectionFailed: { ar: 'تعذّر الاتصال بالمساعد؛ الرد من دليل النمو المحلي.', en: 'The assistant is unavailable; this reply uses the local development guide.' },
  chatError: { ar: 'حصل خطأ أثناء الرد. سؤالك رجع لخانة الكتابة عشان تقدري تحاولي تاني.', en: 'Something went wrong. Your question is back in the input so you can retry.' },
  chatOverviewQuestion: { ar: 'إيه المهارات المناسبة لعمره؟', en: 'What milestones fit this age?' },
  chatSpeechQuestion: { ar: 'إزاي أساعده يتكلم؟', en: 'How can I help with speech?' },
  chatBabblingQuestion: { ar: 'إزاي أشجّع المناغاة والتواصل؟', en: 'How can I encourage babbling and communication?' },
  chatRemainingQuestion: { ar: 'إيه المهارات المتبقية في المرحلة دي؟', en: 'What are the remaining skills in this stage?' },
  chatThinking: { ar: 'جاري تجهيز الرد…', en: 'Preparing a reply…' },

  // Navigation
  backButton: { ar: 'رجوع', en: 'Back' },
  stageDetailTitle: { ar: 'تفاصيل المرحلة', en: 'Stage details' },

  // AI chat templates
  chatDisclaimer: {
    ar: 'ملحوظة: المعلومات دي للتوعية بس مش تشخيص طبي. أي قلق حقيقي على تطور طفلك يستأهل زيارة طبيب الأطفال.',
    en: "Note: this information is for awareness only, not a medical diagnosis. Any real concern about your child's development deserves a pediatrician visit.",
  },
} as const satisfies Record<string, LocalizedStr>;

export type StringKey = keyof typeof strings;

export default strings;
