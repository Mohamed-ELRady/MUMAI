import { formatAge } from '../data/ageHelpers';
import { AGE_STAGES, DOMAIN_LABELS, MILESTONES } from '../data/milestones';
import { Lang } from '../i18n/strings';
import { BabyProfile, MilestoneStatus, Observation, SavedQuestion } from '../store/persistedState';

const esc = (value: string) => value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));

export interface ReportData {
  profile: BabyProfile;
  ageMonths: number;
  lang: Lang;
  milestoneStatuses: Record<string, MilestoneStatus>;
  observations: Observation[];
  savedQuestions?: SavedQuestion[];
  generatedAt?: Date;
}

export function statusCounts(statuses: Record<string, MilestoneStatus>, stageId: string) {
  const ids = MILESTONES.filter((item) => item.ageStageId === stageId).map((item) => item.id);
  return {
    achieved: ids.filter((id) => statuses[id] === 'achieved').length,
    emerging: ids.filter((id) => statuses[id] === 'emerging').length,
    notObserved: ids.filter((id) => statuses[id] === 'not_observed').length,
    unrecorded: ids.filter((id) => !statuses[id]).length,
    total: ids.length,
  };
}

export function generateReportHtml(data: ReportData): string {
  const { profile, ageMonths, lang, milestoneStatuses, observations } = data;
  const rtl = lang === 'ar';
  const stage = [...AGE_STAGES].reverse().find((item) => ageMonths >= item.minMonths) ?? AGE_STAGES[0];
  const availableStages = new Set(AGE_STAGES.filter((item) => item.minMonths <= ageMonths).map((item) => item.id));
  const milestones = MILESTONES.filter((item) => item.ageStageId === stage.id || (availableStages.has(item.ageStageId) && milestoneStatuses[item.id]));
  const date = (data.generatedAt ?? new Date()).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB');
  const labels = rtl ? {
    title: 'ملخص متابعة النمو', child: 'الطفل', age: 'العمر', generated: 'تاريخ التقرير', stage: 'المرحلة المرجعية',
    achieved: 'بيعملها', emerging: 'بيحاول', notObserved: 'لسه ملاحظناهاش', unrecorded: 'لم تُسجّل', notes: 'ملاحظات الأسرة', noNotes: 'لا توجد ملاحظات مسجلة.',
    questions: 'أسئلة الأسرة المسجلة', noQuestions: 'لا توجد أسئلة مسجلة.', sources: 'المرجع', disclaimer: 'هذا ملخص لملاحظات الأسرة، وليس تشخيصًا أو أداة فحص طبي. شاركي أي قلق أو فقدان مهارة مع طبيب الأطفال.',
  } : {
    title: 'Development tracking summary', child: 'Child', age: 'Age', generated: 'Report date', stage: 'Reference stage',
    achieved: 'Doing it', emerging: 'Trying', notObserved: 'Not observed yet', unrecorded: 'Not recorded', notes: 'Family observations', noNotes: 'No observations recorded.',
    questions: 'Saved family questions', noQuestions: 'No questions recorded.', sources: 'Reference', disclaimer: 'This summarizes family observations. It is not a diagnosis or validated screening tool. Share any concern or loss of skills with the pediatrician.',
  };
  const statusLabel = (status?: MilestoneStatus) => status === 'achieved' ? labels.achieved : status === 'emerging' ? labels.emerging : status === 'not_observed' ? labels.notObserved : labels.unrecorded;
  const rows = milestones.map((item) => `<tr><td>${esc(AGE_STAGES.find((entry) => entry.id === item.ageStageId)?.label[lang] ?? '')}</td><td>${esc(DOMAIN_LABELS[item.domain][lang])}</td><td>${esc(item.title[lang])}</td><td><span class="status ${milestoneStatuses[item.id] ?? 'unrecorded'}">${esc(statusLabel(milestoneStatuses[item.id]))}</span></td></tr>`).join('');
  const noteRows = observations.slice().reverse().map((item) => {
    const milestone = item.milestoneId ? MILESTONES.find((entry) => entry.id === item.milestoneId) : undefined;
    return `<li><time>${esc(new Date(item.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB'))}</time><p>${esc(item.text)}</p>${milestone ? `<small>${esc(milestone.title[lang])}</small>` : ''}</li>`;
  }).join('');
  const questionRows = (data.savedQuestions ?? []).slice().reverse().map((item) => `<li><time>${esc(new Date(item.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB'))}</time><p>${esc(item.text)}</p></li>`).join('');
  return `<!doctype html><html dir="${rtl ? 'rtl' : 'ltr'}" lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><style>
  @page{margin:28px}*{box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;color:#3A2E2A;margin:0;line-height:1.55}header{border-bottom:4px solid #7FB3A8;padding-bottom:18px;margin-bottom:22px}h1{margin:0;color:#C96A5C;font-size:28px}.meta{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:14px}.meta div{background:#F7F3F0;padding:8px 12px;border-radius:8px}table{width:100%;border-collapse:collapse;font-size:12px}th,td{padding:9px;border-bottom:1px solid #E7DDD7;text-align:${rtl ? 'right' : 'left'}th{background:#FBEAE4}.status{font-weight:700}.achieved{color:#35785A}.emerging{color:#9A6917}.not_observed{color:#B3433F}.unrecorded{color:#8A7A74}h2{font-size:17px;margin-top:24px}ul{padding-${rtl ? 'right' : 'left'}:20px}li{margin-bottom:12px}li p{margin:2px 0}time,small{color:#776963;font-size:11px}.notice{margin-top:24px;padding:12px;border:1px solid #E0A63A;background:#FFF9E9;font-size:11px}.source{font-size:10px;color:#776963;margin-top:12px}</style></head><body>
  <header><h1>MUMAI · ${labels.title}</h1><div class="meta"><div><b>${labels.child}:</b> ${esc(profile.name)}</div><div><b>${labels.age}:</b> ${esc(formatAge(ageMonths, lang))}</div><div><b>${labels.stage}:</b> ${esc(stage.label[lang])}</div><div><b>${labels.generated}:</b> ${esc(date)}</div></div></header>
  <table><thead><tr><th>${rtl ? 'المرحلة' : 'Stage'}</th><th>${rtl ? 'المجال' : 'Domain'}</th><th>${rtl ? 'المهارة' : 'Skill'}</th><th>${rtl ? 'ملاحظة الأسرة' : 'Family status'}</th></tr></thead><tbody>${rows}</tbody></table>
  <h2>${labels.notes}</h2>${noteRows ? `<ul>${noteRows}</ul>` : `<p>${labels.noNotes}</p>`}
  <h2>${labels.questions}</h2>${questionRows ? `<ul>${questionRows}</ul>` : `<p>${labels.noQuestions}</p>`}
  <div class="notice">${labels.disclaimer}</div><p class="source">${labels.sources}: CDC Learn the Signs. Act Early — https://www.cdc.gov/act-early/milestones/</p></body></html>`;
}
