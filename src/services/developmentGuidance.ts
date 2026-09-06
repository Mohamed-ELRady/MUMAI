import { AGE_STAGES, MILESTONES, Milestone } from '../data/milestones';
import { Lang } from '../i18n/strings';
import { conceptsIn, hasPhrase } from './textMatch';

export interface DevelopmentGuidance {
  concepts: string[];
  lead: string;
  milestones: Milestone[];
  tips: string[];
  question: string;
  timing?: string;
}

// Follow the skill's prerequisites before its later form. Reference ages are
// checklist ages, never a prediction of the exact month a child will start.
const SPEECH = ['ms-m2-3', 'ms-m4-3', 'ms-m6-2-v2', 'ms-m9-2', 'ms-m12-2', 'ms-m15-2', 'ms-m18-1', 'ms-m24-1', 'ms-m30-1', 'ms-y3-1', 'ms-y4-1', 'ms-y5-1-v2'];
const SITTING = ['ms-m1-2', 'ms-m2-4', 'ms-m4-4', 'ms-m6-3', 'ms-m9-3-v2'];
const WALKING = [...SITTING, 'ms-m12-4', 'ms-m15-1', 'ms-m18-2-v2'];

export function referenceAge(item: Milestone): number {
  return AGE_STAGES.find((stage) => stage.id === item.ageStageId)?.maxMonths ?? 0;
}

function currentSkills(ids: string[], ageMonths: number): Milestone[] {
  const eligible = MILESTONES.filter((item) => ids.includes(item.id) && referenceAge(item) <= ageMonths);
  const latest = Math.max(0, ...eligible.map(referenceAge));
  return eligible.filter((item) => referenceAge(item) === latest);
}

export function asksAboutTiming(query: string): boolean {
  return ['امتى', 'متى', 'اي سن', 'عمر كام', 'when', 'what age'].some((phrase) => hasPhrase(query, phrase));
}

export function developmentGuidance(query: string, age: number, lang: Lang, latestQuestion = query): DevelopmentGuidance[] {
  const concepts = conceptsIn(query);
  const say = (ar: string, en: string) => lang === 'ar' ? ar : en;
  const plans: DevelopmentGuidance[] = [];
  const timing = asksAboutTiming(latestQuestion);

  if (concepts.includes('speech') || concepts.includes('babbling')) {
    const wordsBeforeExpected = concepts.includes('speech') && age < 12;
    plans.push({
      concepts: ['speech', 'babbling'],
      lead: wordsBeforeExpected
        ? say('الكلام بكلمات واضحة لسه مش متوقّع عادة في السن ده. دلوقتي بنشجّع التواصل والأصوات اللي بتمهّد للكلام، وغياب الكلمات لوحده مش معناه تأخر.',
          'Meaningful words are not usually expected yet at this age. Focus on communication and the sounds that come before words; having no words alone does not establish a delay.')
        : age < 12
          ? say('المناغاة وتبادل الأصوات خطوات بتجهّز للكلام. نتابع شكل التواصل المناسب لعمره، من غير ما نطلب منه كلمات واضحة.',
            'Cooing, babbling and taking turns with sounds prepare for speech. Focus on communication appropriate to this age without expecting meaningful words yet.')
          : say('في السن ده نتابع الكلمات اللي بيستخدمها بمعنى، مش مجرد تكرار أصوات. نبدأ بمهارات الكلام المناسبة لعمره:',
            'At this age, look at words used with meaning, beyond repeated sounds. Start with the speech skills appropriate to this age:'),
      milestones: currentSkills(SPEECH, age),
      tips: age < 12 ? [
        say('قلّدي أصواته، وبعدها اسكتي شوية واديه فرصة يرد؛ خلوها تبادل أصوات ممتع.',
          'Copy your baby’s sounds, then pause and give them a turn to respond.'),
        say('اتكلمي معاه وشّ لوش أثناء تغيير الهدوم واللعب، وسمّي الحاجة اللي بيبص لها.',
          'Talk face to face during dressing and play, and name what your baby is looking at.'),
        say('غنّيله واقرؤوا كتاب صور بسيط سوا. الهدف إنه يتفاعل، من غير ضغط عشان يكرر كلمة.',
          'Sing and enjoy a simple picture book together. Invite interaction without pressure to repeat words.'),
      ] : [
        say('سمّي الأشياء اللي مهتم بيها، واستني رده بكلمة أو إشارة من غير امتحان أو إلحاح.',
          'Name things your child is interested in and wait for a word or gesture without quizzing or pressure.'),
        say('لو قال كلمة، ابني عليها تعبير أطول بسيط؛ مثلًا «مية» تبقى «عايز مية».',
          'Build on a word with a short phrase: for example, expand “water” to “want water”.'),
        say('اقرؤوا كتاب صور سوا واتكلموا عن اللي بيشاور عليه، وخلي له دور في الحوار.',
          'Share a picture book, talk about what your child points to, and let them take a turn in the conversation.'),
      ],
      question: age < 12
        ? say('هو دلوقتي بيطلع أصوات وبيبادلك المناغاة؟ وبيستجيب لصوتك؟',
          'Does your baby make sounds, take turns vocalizing with you, and respond to your voice?')
        : say('إيه الكلمات أو الإشارات اللي بيستخدمها دلوقتي من نفسه؟',
          'Which words or gestures does your child currently use spontaneously?'),
      timing: timing ? say('للتوقيت التقريبي: من مهارات السنة إنه ينادي ماما أو بابا بمعنى، وعند 15 شهر يحاول كلمة أو كلمتين غيرهم. دي أعمار مرجعية لمهارات معظم الأطفال، مش موعد ثابت لكل طفل.',
        'For timing: the 12-month checklist includes a meaningful name for a parent; at 15 months, trying one or two other words. These are reference ages for most children, not a fixed start date for every child.') : undefined,
    });
  }

  if (concepts.includes('walking')) {
    plans.push({
      concepts: ['walking', 'sitting', 'standing'],
      lead: age < 12
        ? say('المشي لوحده لسه مش متوقّع عادة في السن ده. نساعده يبني مهارات الحركة اللي بتيجي قبله، بدل تدريبه على خطوات قبل ما يكون مستعد.',
          'Independent walking is not usually expected yet at this age. Support the movement skills that come first, following your baby’s readiness.')
        : age < 15
          ? say('المشي بيتطور تدريجيًا. في المرحلة دي نتابع الوقوف والمشي وهو ماسك في أثاث ثابت، والخطوات لوحده ممكن تكون لسه بتبدأ.',
            'Walking develops gradually. At this stage, look for pulling to stand and moving while holding stable furniture; independent steps may still be emerging.')
          : say('في السن ده نتابع الخطوات المستقلة والتوازن، ونقارن بالمهارة المناسبة لعمره:',
            'At this age, look at independent steps and balance, using the relevant skill for this age:'),
      milestones: currentSkills(WALKING, age),
      tips: age < 9 ? [
        say('وفّري لعب على الأرض تحت إشرافك يناسب اللي يقدر يعمله، زي الوصول للعبة والتقلب، من غير إجباره على الوقوف.',
          'Offer supervised floor play suited to current abilities, such as reaching for a toy and rolling, without forcing standing.'),
      ] : [
        say('اعملي مساحة آمنة على الأرض واتبعي محاولاته للحركة. لو بدأ يقف، خلي الأثاث اللي يستند عليه ثابت وآمن.',
          'Create a safe floor space and follow your child’s attempts to move. If they pull up, ensure furniture used for support is stable and safe.'),
      ],
      question: age < 9
        ? say('بيعمل إيه دلوقتي: بيثبّت راسه، بيتقلب، ولا بدأ يسند نفسه وهو قاعد؟',
          'What can your baby do now: hold their head steady, roll, or support themselves while sitting?')
        : say('بيسحب نفسه للوقوف أو بيتحرك وهو ماسك في الأثاث؟ وجرّب ياخد خطوات لوحده؟',
          'Does your child pull up or move while holding furniture? Have they tried independent steps?'),
      timing: timing ? say('الدليل بيذكر بضع خطوات مستقلة عند 15 شهر، والمشي من غير مساندة عند 18 شهر. دي مراجع للمتابعة، مش مواعيد ثابتة لبدء المشي.',
        'The guide lists a few independent steps at 15 months and walking without support at 18 months. These are monitoring references, not fixed starting dates.') : undefined,
    });
  } else if (concepts.includes('sitting')) {
    plans.push({
      concepts: ['sitting'],
      lead: age < 6
        ? say('الجلوس لوحده لسه مش متوقّع عادة في السن ده. الأول بنركز على التحكم في الرأس والجسم حسب مرحلته.',
          'Sitting independently is not usually expected yet at this age. First focus on head and body control appropriate to this stage.')
        : age < 9
          ? say('في المرحلة دي الجلوس بيتطور: نتابع إنه يسند نفسه بيديه. الجلوس من غير مساندة والوصول للقعدة بنفسه ممكن يكونوا لسه بيتطوروا.',
            'Sitting is developing: look for supporting the body with the hands. Unsupported sitting and getting into sitting may still be emerging.')
          : say('الجلوس من غير مساندة من المهارات المناسبة لعمره بالفعل. لو لسه مش بيقدر يعمله، ناقشي ده مع طبيب الأطفال.',
            'Sitting without support is already appropriate to this age. If your child cannot do it yet, discuss this with the pediatrician.'),
      milestones: currentSkills(SITTING, age),
      tips: [say('خلي اللعب على الأرض تحت إشرافك، وادعمي جسمه بالقدر اللي محتاجه. اتبعي قدرته وراحته من غير إجباره على وضع مش مستعد له.',
        'Use supervised floor play and provide the support your baby needs. Follow their ability and comfort without forcing a position they are not ready for.')],
      question: say('بيثبّت راسه؟ وبيقدر يسند نفسه بإيديه وهو قاعد، ولا محتاجك تسندي جسمه طول الوقت؟',
        'Can your baby hold their head steady and support themselves with their hands while sitting, or do they need you to support their body throughout?'),
      timing: timing ? say('الدليل بيذكر الاستناد على اليدين أثناء الجلوس عند 6 شهور، والجلوس من غير مساندة والوصول للقعدة عند 9 شهور. دي أعمار مرجعية للمتابعة، مش موعد ثابت لكل طفل.',
        'The guide lists supporting the body with the hands while sitting at 6 months, and sitting unsupported and getting into sitting at 9 months. These are reference ages, not fixed start dates.') : undefined,
    });
  }
  return plans;
}
