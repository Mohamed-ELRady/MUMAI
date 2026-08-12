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
  startTrackingCta: { ar: 'ابدئي المتابعة', en: 'Start tracking' },
  defaultChildName: { ar: 'طفلي', en: 'my child' },

  // Home
  trackingGrowthOf: { ar: 'متابعة نمو', en: "Tracking" },
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
  askAboutRemaining: { ar: 'لسه فيه {n} مهارة معملهاش؟ اسألي عنها', en: "{n} skills not done yet? Ask about them" },
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
    ar: 'أهلاً! اسأليني عن أي مهارة أو حاجة لاحظتيها على {name} في المرحلة العمرية دي، وهساعدك أفهم هل ده طبيعي ولا محتاج متابعة طبيب.',
    en: "Hi! Ask me about any skill or anything you've noticed about {name} at this age, and I'll help you understand whether it's normal or needs a doctor's follow-up.",
  },
  chatPlaceholder: { ar: 'اكتبي سؤالك هنا...', en: 'Type your question here...' },
  sendButton: { ar: 'إرسال', en: 'Send' },

  // Navigation
  backButton: { ar: 'رجوع', en: 'Back' },
  stageDetailTitle: { ar: 'تفاصيل المرحلة', en: 'Stage details' },

  // AI chat templates
  chatDisclaimer: {
    ar: 'ملحوظة: المعلومات دي للتوعية بس مش تشخيص طبي. أي قلق حقيقي على تطور طفلك يستأهل زيارة طبيب الأطفال.',
    en: "Note: this information is for awareness only, not a medical diagnosis. Any real concern about your child's development deserves a pediatrician visit.",
  },
  chatNoMatch: {
    ar: 'معنديش معلومة دقيقة كفاية عن السؤال ده بالتحديد. ممكن تقوليلي إيه بالظبط اللي لاحظتيه على {name} (مثلاً: مش بيمشي، مش بيتكلم، مش بيستجيب لصوته) وهساعدك أقرب ما يكون؟',
    en: "I don't have specific enough information about this exact question. Could you tell me exactly what you've noticed about {name} (e.g. not walking, not talking, not responding to sounds) so I can help more precisely?",
  },
  chatRedFlagIntro: { ar: 'بالنسبة لـ{name}، دي أهم النقاط المتعلقة بسؤالك:', en: "Regarding {name}, here are the key points about your question:" },
  chatSignLabel: { ar: 'العلامة:', en: 'Sign:' },
  chatNoteLabel: { ar: 'ملاحظة:', en: 'Note:' },
  chatMilestoneIntro: {
    ar: 'دي بعض المهارات المتوقعة في المرحلة العمرية دي واللي ممكن تكون مرتبطة بسؤالك:',
    en: 'Here are some expected skills at this age that may relate to your question:',
  },
  chatMilestoneOutro: {
    ar: 'لو {name} لسه معملش المهارة دي، ده وارد جدًا يكون طبيعي خصوصًا لو قريب من حدود المرحلة، لكن لو استمر تأخره كام أسبوع كلمي طبيب الأطفال للاطمئنان.',
    en: "If {name} hasn't done this skill yet, that's quite possibly normal especially near the edge of the stage, but if the delay continues for a few weeks, check with the pediatrician for peace of mind.",
  },
} as const satisfies Record<string, LocalizedStr>;

export type StringKey = keyof typeof strings;

export default strings;
