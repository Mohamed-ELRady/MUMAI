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
  optionalLabel: { ar: 'اختياري', en: 'Optional' },
  childPhotoLabel: { ar: 'صورة الطفل', en: "Child's photo" },
  addChildPhoto: { ar: 'إضافة صورة', en: 'Add photo' },
  changeChildPhoto: { ar: 'تغيير الصورة', en: 'Change photo' },
  removeChildPhoto: { ar: 'حذف الصورة', en: 'Remove photo' },
  photoPickerError: { ar: 'تعذّر اختيار الصورة. جرّبي صورة تانية.', en: 'The photo could not be selected. Try another image.' },
  bloodTypeLabel: { ar: 'فصيلة الدم', en: 'Blood type' },
  optionalProfileHint: { ar: 'ممكن تسيبي البيانات دي دلوقتي وتضيفيها في أي وقت.', en: 'You can skip these details now and add them at any time.' },
  invalidBirthDate: { ar: 'اختاري تاريخ ميلاد صحيح، النهارده أو قبله.', en: 'Choose a valid birthday, today or earlier.' },
  storageLoadError: { ar: 'تعذّر قراءة البيانات المحفوظة. جرّبي تاني لاسترجاعها قبل تسجيل بيانات جديدة.', en: 'Saved data could not be read. Retry to recover it before entering a new profile.' },
  storageSaveError: { ar: 'التغييرات ظاهرة، لكن لسه متحفظتش على الجهاز. جرّبي الحفظ تاني.', en: 'Your changes are visible but have not been saved on this device. Please retry.' },
  retryButton: { ar: 'إعادة المحاولة', en: 'Retry' },
  invalidStage: { ar: 'المرحلة دي مش موجودة. ارجعي لاختيار مرحلة من المتابعة.', en: 'This stage is unavailable. Go back and choose a stage from the tracker.' },
  startTrackingCta: { ar: 'ابدئي المتابعة', en: 'Start tracking' },
  saveChangesCta: { ar: 'حفظ التعديلات', en: 'Save changes' },
  editProfileTitle: { ar: 'تعديل بيانات الطفل', en: "Edit child's info" },
  defaultChildName: { ar: 'طفلي', en: 'my child' },
  addChildTitle: { ar: 'إضافة طفل', en: 'Add a child' },
  addChildCta: { ar: 'إضافة الطفل', en: 'Add child' },
  tryDemoCta: { ar: 'أو جرّبي الديمو ببيانات تجريبية', en: 'Or try the demo with sample data' },
  profilePrivacyHint: { ar: 'بيانات الطفل والصورة بتتحفظ محليًا على جهازك. تقدري تصدّريها أو تمسحيها بالكامل من مركز الخصوصية.', en: "The child's data and photo stay on this device. You can export or erase them from Privacy & data." },
  bloodTypeDisclaimer: { ar: 'فصيلة الدم مكتوبة حسب إدخالك وغير متحقق منها. ما تعتمديش عليها في الطوارئ أو نقل الدم.', en: 'Blood type is user-reported and unverified. Do not rely on it for emergencies or transfusions.' },

  // Home
  trackingGrowthOf: { ar: 'متابعة نمو', en: "Tracking" },
  editProfileButton: { ar: 'تعديل', en: 'Edit' },
  currentAgeLabel: { ar: 'العمر الحالي:', en: 'Current age:' },
  bloodTypeValue: { ar: 'فصيلة الدم: {type}', en: 'Blood type: {type}' },
  chatBanner: {
    ar: 'عندك سؤال عن مرحلة نمو معينة؟ اسألي المساعدة 💬',
    en: 'Have a question about a specific stage? Ask the assistant 💬',
  },
  skillsUnit: { ar: 'مهارة', en: 'skills' },
  stageTrackingProgress: { ar: '{recorded}/{total} متابعة · {achieved} بيعملها', en: '{recorded}/{total} recorded · {achieved} doing' },
  notDueYet: { ar: 'لسه مجاش وقتها', en: 'Not due yet' },
  currentStageBadge: { ar: 'المرحلة الحالية', en: 'Current stage' },
  weeklyPlanCard: { ar: 'خطة الأسبوع', en: 'Weekly plan' },
  weeklyPlanCardHint: { ar: '٣ لحظات لعب مناسبة لعمره', en: '3 age-appropriate play moments' },
  reportCard: { ar: 'تقرير الطبيب', en: 'Doctor report' },
  reportCardHint: { ar: 'ملخص المهارات والملاحظات', en: 'Skills and observations summary' },
  childrenCard: { ar: 'الأطفال', en: 'Children' },
  childrenCardHint: { ar: 'إضافة طفل أو التبديل بينهم', en: 'Add or switch child profiles' },
  timelineCard: { ar: 'سجل التطور', en: 'Development timeline' },
  timelineCardHint: { ar: 'المهارات والملاحظات بالتاريخ', en: 'Dated milestones and notes' },
  privacyCard: { ar: 'الخصوصية والبيانات', en: 'Privacy & data' },
  privacyCardHint: { ar: 'تصدير أو استيراد أو حذف بياناتك', en: 'Export, import, or erase your data' },
  demoBadge: { ar: 'بيانات تجريبية', en: 'Sample data' },

  // Stage detail
  stageDetailSubtitle: {
    ar: 'اختاري الوصف الأقرب لملاحظتك؛ الحالة مش تشخيص',
    en: 'Choose the closest family observation; this is not a diagnosis',
  },
  statusAchieved: { ar: 'بيعملها', en: 'Doing it' },
  statusEmerging: { ar: 'بيحاول', en: 'Trying' },
  statusNotObserved: { ar: 'لسه ملاحظتهاش', en: 'Not observed yet' },
  askAboutRemaining: { ar: 'فيه {n} مهارة محتاجة متابعة — اسألي عنها', en: '{n} skills need follow-up — ask about them' },
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
  chatSpecialistQuestion: { ar: 'أكشف عند دكتور تخصص إيه؟', en: 'Which specialist should we see?' },
  chatThinking: { ar: 'جاري تجهيز الرد…', en: 'Preparing a reply…' },
  clearChat: { ar: 'مسح المحادثة', en: 'Clear chat' },
  clearChatConfirm: { ar: 'هل تريدين مسح سجل المحادثة لهذا الطفل؟', en: "Clear this child's chat history?" },

  // Weekly plan
  weeklyPlanTitle: { ar: 'خطة الأسبوع', en: 'Weekly plan' },
  weeklyPlanIntro: { ar: '٣ لحظات قصيرة متفصلة على عمر طفلك والمهارات اللي بيمارسها. كرري كل لعبة وقت ما يكون مرتاح ومتفاعل.', en: 'Three short moments based on your child’s age and developing skills. Repeat each activity when your child is comfortable and engaged.' },
  weeklyFocus: { ar: 'بنركّز على:', en: 'Focus:' },
  weeklyDone: { ar: 'اتعملت الأسبوع ده', en: 'Done this week' },
  weeklyProgress: { ar: '{done} من {total} اتعملوا', en: '{done} of {total} done' },
  weeklySafety: { ar: 'كل الأنشطة تحت إشرافك. وقّفي النشاط لو طفلك تعب أو اتضايق، وماتجبريهوش على وضع أو حركة.', en: 'Supervise every activity. Stop if your child is tired or upset, and never force a position or movement.' },

  // Report
  reportTitle: { ar: 'تقرير الطبيب', en: 'Doctor report' },
  reportIntro: { ar: 'ملخص ملاحظاتك عن المرحلة الحالية. راجعيه قبل الطباعة أو المشاركة مع الطبيب.', en: 'A summary of your observations for the current stage. Review it before printing or sharing with the doctor.' },
  reportCounts: { ar: 'بيعملها {done} · بيحاول {emerging} · لسه ملاحظناهاش {notObserved}', en: 'Doing {done} · Trying {emerging} · Not observed {notObserved}' },
  reportObservations: { ar: 'ملاحظات الأسرة', en: 'Family observations' },
  reportObservationPlaceholder: { ar: 'مثال: بدأ يقول «با» من أسبوع، لكنه لا يلتفت للصوت الهادئ…', en: 'Example: Started saying “ba” last week, but does not turn toward quiet sounds…' },
  reportAddObservation: { ar: 'إضافة الملاحظة', en: 'Add observation' },
  reportNoObservations: { ar: 'لسه مفيش ملاحظات. اكتبي أمثلة واضحة وتاريخ بداية التغيير عشان تفيد الطبيب.', en: 'No observations yet. Add concrete examples and when a change began to help the doctor.' },
  reportQuestions: { ar: 'الأسئلة اللي سألتيها', en: 'Questions you asked' },
  reportNoQuestions: { ar: 'لسه مفيش أسئلة محفوظة من الشات.', en: 'No chat questions have been saved yet.' },
  reportDeleteObservation: { ar: 'حذف', en: 'Delete' },
  reportExport: { ar: 'طباعة أو حفظ PDF', en: 'Print or save PDF' },
  reportShare: { ar: 'مشاركة PDF', en: 'Share PDF' },
  reportExportError: { ar: 'تعذّر تجهيز التقرير. جرّبي مرة تانية.', en: 'The report could not be prepared. Try again.' },
  reportDisclaimer: { ar: 'التقرير بيلخّص ملاحظات الأسرة، ومش تشخيص أو اختبار نمو معتمد.', en: 'This report summarizes family observations; it is not a diagnosis or validated screening test.' },

  // Navigation
  backButton: { ar: 'رجوع', en: 'Back' },
  stageDetailTitle: { ar: 'تفاصيل المرحلة', en: 'Stage details' },
  childrenTitle: { ar: 'ملفات الأطفال', en: 'Child profiles' },
  addAnotherChild: { ar: 'إضافة طفل جديد', en: 'Add another child' },
  activeChild: { ar: 'الحالي', en: 'Active' },
  switchChild: { ar: 'اختيار', en: 'Select' },
  deleteChild: { ar: 'حذف الملف', en: 'Delete profile' },
  deleteChildConfirm: { ar: 'سيتم حذف بيانات هذا الطفل نهائيًا من الجهاز.', en: "This child's local data will be permanently erased." },
  timelineTitle: { ar: 'سجل التطور', en: 'Development timeline' },
  timelineEmpty: { ar: 'لسه مفيش أحداث. حدّثي حالة مهارة أو أضيفي ملاحظة.', en: 'No events yet. Update a milestone or add an observation.' },
  timelineObservation: { ar: 'ملاحظة عائلية', en: 'Family note' },
  privacyTitle: { ar: 'الخصوصية والبيانات', en: 'Privacy & data' },
  privacyIntro: { ar: 'بياناتك محفوظة محليًا في المتصفح أو التطبيق. لا يتم إنشاء حساب ولا رفع ملف الطفل تلقائيًا. عند استخدام المساعد المتصل فقط، يُرسل السؤال وسياق النمو اللازم لخدمة الـ API.', en: 'Your data is stored locally in this browser or app. No account is created and child profiles are not uploaded automatically. Only when the connected assistant is used, the question and necessary development context are sent to the API service.' },
  exportData: { ar: 'تصدير نسخة احتياطية', en: 'Export backup' },
  importData: { ar: 'استيراد نسخة احتياطية', en: 'Import backup' },
  deleteAllData: { ar: 'حذف كل البيانات', en: 'Erase all data' },
  deleteAllConfirm: { ar: 'سيتم حذف كل ملفات الأطفال والملاحظات والمحادثات من هذا الجهاز نهائيًا.', en: 'All child profiles, notes, and chats on this device will be permanently erased.' },
  dataExported: { ar: 'تم تجهيز النسخة الاحتياطية.', en: 'Backup is ready.' },
  dataImported: { ar: 'تم استيراد البيانات بنجاح.', en: 'Data imported successfully.' },
  dataImportError: { ar: 'الملف غير صالح أو لا يحتوي على نسخة MUMAI مدعومة.', en: 'This file is invalid or is not a supported MUMAI backup.' },
  cancelButton: { ar: 'إلغاء', en: 'Cancel' },
  confirmButton: { ar: 'تأكيد', en: 'Confirm' },

  // AI chat templates
  chatDisclaimer: {
    ar: 'ملحوظة: المعلومات دي للتوعية بس مش تشخيص طبي. أي قلق حقيقي على تطور طفلك يستأهل زيارة طبيب الأطفال.',
    en: "Note: this information is for awareness only, not a medical diagnosis. Any real concern about your child's development deserves a pediatrician visit.",
  },
} as const satisfies Record<string, LocalizedStr>;

export type StringKey = keyof typeof strings;

export default strings;
