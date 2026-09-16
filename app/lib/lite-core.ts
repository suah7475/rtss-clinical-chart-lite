import type {
  CustomCatalog,
  LiteRecord,
  LiteStore,
  MissingField,
  NextDecision,
  SavedSnapshot,
} from '@/app/lib/lite-types';

export const LITE_STORAGE_KEY = 'rtss-clinical-chart-lite-v1';

export const emptyCustomCatalog = (): CustomCatalog => ({
  targets: [],
  ingredients: [],
  mechanisms: [],
  outcomes: [],
});

export function createEmptyRecord(recordDate: string): LiteRecord {
  return {
    caseCode: '',
    recordDate,
    aim: '',
    domainId: 'D01',
    targetId: '',
    targetLabel: '',
    targetDirection: '',
    ingredients: [],
    mechanismId: '',
    mechanismLabel: '',
    actualDose: '',
    response: '',
    measurementStatus: '',
    outcomeId: '',
    outcomeLabel: '',
    outcomeValue: '',
    outcomeUnit: '',
    outcomeCondition: '',
    measurementReason: '',
    safetyStatus: '',
    safetyDetail: '',
    nextDecision: '',
    decisionReason: '',
    nextPlan: '',
    icfCodes: '',
  };
}

export function createInitialStore(recordDate: string): LiteStore {
  return {
    schemaVersion: 1,
    draft: createEmptyRecord(recordDate),
    customCatalog: emptyCustomCatalog(),
    snapshots: [],
    updatedAt: new Date().toISOString(),
  };
}

const isString = (value: unknown): value is string => typeof value === 'string';

export function isLiteStore(value: unknown): value is LiteStore {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<LiteStore>;
  if (candidate.schemaVersion !== 1 || !candidate.draft || !candidate.customCatalog || !Array.isArray(candidate.snapshots)) return false;
  const draft = candidate.draft as unknown as Record<string, unknown>;
  const stringFields: Array<keyof Omit<LiteRecord, 'ingredients'>> = [
    'caseCode', 'recordDate', 'aim', 'domainId', 'targetId', 'targetLabel', 'targetDirection',
    'mechanismId', 'mechanismLabel', 'actualDose', 'response', 'measurementStatus',
    'outcomeId', 'outcomeLabel', 'outcomeValue', 'outcomeUnit', 'outcomeCondition',
    'measurementReason', 'safetyStatus', 'safetyDetail', 'nextDecision', 'decisionReason',
    'nextPlan', 'icfCodes',
  ];
  if (!stringFields.every((field) => isString(draft[field]))) return false;
  if (!Array.isArray(draft.ingredients) || !draft.ingredients.every((item) => {
    if (!item || typeof item !== 'object') return false;
    const ingredient = item as Record<string, unknown>;
    return isString(ingredient.id) && isString(ingredient.label) && typeof ingredient.custom === 'boolean';
  })) return false;

  if (!['', 'completed', 'stopped', 'not_tested'].includes(draft.measurementStatus as string)) return false;
  if (!['', 'none', 'event', 'not_delivered'].includes(draft.safetyStatus as string)) return false;
  if (!['', 'maintain', 'progress', 'adjust', 'hold'].includes(draft.nextDecision as string)) return false;

  const catalog = candidate.customCatalog as unknown as Record<string, unknown>;
  if (!['targets', 'ingredients', 'mechanisms', 'outcomes'].every((key) => Array.isArray(catalog[key]) && (catalog[key] as unknown[]).every(isString))) return false;

  if (!candidate.snapshots.every((item) => {
    if (!item || typeof item !== 'object') return false;
    const snapshot = item as unknown as Record<string, unknown>;
    return isString(snapshot.id) && isString(snapshot.copiedAt) && isString(snapshot.caseCode) && isString(snapshot.recordDate) && isString(snapshot.note);
  })) return false;

  return isString(candidate.updatedAt);
}

export function missingFields(record: LiteRecord): MissingField[] {
  const missing: MissingField[] = [];
  const requireText = (key: keyof LiteRecord, label: string, elementId: string) => {
    if (typeof record[key] !== 'string' || !(record[key] as string).trim()) missing.push({ key, label, elementId });
  };

  requireText('caseCode', '비식별 사례 코드', 'case-code');
  requireText('recordDate', '기록일', 'record-date');
  requireText('aim', '환자 생활목표', 'aim');
  requireText('targetLabel', '직접 치료표적', 'target');
  if (record.safetyStatus !== 'not_delivered') {
    if (!record.ingredients.length) missing.push({ key: 'ingredients', label: '실제 치료방법', elementId: 'ingredient-input' });
    requireText('mechanismLabel', '작용기전 가설', 'mechanism');
    requireText('actualDose', '오늘 실제 제공한 양', 'actual-dose');
    requireText('response', '즉각 반응', 'response');
  }
  requireText('measurementStatus', '결과측정 상태', 'measurement-status');

  if (record.measurementStatus === 'completed') {
    requireText('outcomeLabel', '결과측정 도구', 'outcome');
    requireText('outcomeValue', '결과측정 값', 'outcome-value');
    requireText('outcomeUnit', '결과측정 단위', 'outcome-unit');
    requireText('outcomeCondition', '결과측정 조건', 'outcome-condition');
  }
  if (record.measurementStatus === 'stopped') {
    requireText('outcomeLabel', '중단한 결과측정 도구', 'stopped-outcome');
    requireText('measurementReason', '검사를 완료하지 않은 이유', 'measurement-reason');
  }
  if (record.measurementStatus === 'not_tested') {
    requireText('measurementReason', '검사를 완료하지 않은 이유', 'measurement-reason');
  }

  requireText('safetyStatus', '안전 상태', 'safety-status');
  if (record.safetyStatus === 'event' || record.safetyStatus === 'not_delivered') {
    requireText('safetyDetail', '안전·중단 상세', 'safety-detail');
  }

  requireText('nextDecision', '다음 결정', 'next-decision');
  requireText('decisionReason', '다음 결정의 근거', 'decision-reason');

  return missing;
}

export function completionPercent(record: LiteRecord) {
  let totalRequirements = record.safetyStatus === 'not_delivered' ? 8 : 12;
  if (record.measurementStatus === 'completed') totalRequirements += 4;
  if (record.measurementStatus === 'stopped') totalRequirements += 2;
  if (record.measurementStatus === 'not_tested') totalRequirements += 1;
  if (record.safetyStatus === 'event' || record.safetyStatus === 'not_delivered') totalRequirements += 1;
  const missingCount = Math.min(totalRequirements, missingFields(record).length);
  return Math.max(0, Math.round(((totalRequirements - missingCount) / totalRequirements) * 100));
}

const decisionLabels: Record<Exclude<NextDecision, ''>, string> = {
  maintain: '유지',
  progress: '진행',
  adjust: '조정',
  hold: '보류·중단',
};

function clean(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

export function generateLiteNote(record: LiteRecord) {
  const draft = missingFields(record).length > 0;
  const lines = [
    `[재활치료 명세체계(Rehabilitation Treatment Specification System, RTSS) 기반 물리치료 회기 기록${draft ? ' · 초안' : ''}]`,
  ];

  const context = [clean(record.caseCode), clean(record.recordDate)].filter(Boolean).join(' · ');
  if (context) lines.push(`사례·기록일: ${context}`);
  if (record.aim.trim()) lines.push(`환자 생활목표: ${clean(record.aim)}`);

  if (record.targetLabel.trim()) {
    const direction = record.targetDirection.trim() ? ` · 변화방향: ${clean(record.targetDirection)}` : '';
    lines.push(`직접 치료표적: ${clean(record.targetLabel)}${direction}`);
  }
  if (record.ingredients.length) lines.push(`실제 치료방법: ${record.ingredients.map((item) => clean(item.label)).join(', ')}`);
  if (record.mechanismLabel.trim()) lines.push(`작용기전 가설: ${clean(record.mechanismLabel)}`);
  if (record.actualDose.trim()) lines.push(`실제 제공량: ${clean(record.actualDose)}`);
  if (record.response.trim()) lines.push(`즉각 반응: ${clean(record.response)}`);

  if (record.measurementStatus === 'completed') {
    const score = [clean(record.outcomeValue), clean(record.outcomeUnit)].filter(Boolean).join(' ');
    const condition = record.outcomeCondition.trim() ? ` · 조건: ${clean(record.outcomeCondition)}` : '';
    lines.push(`결과측정: ${clean(record.outcomeLabel)}${score ? ` ${score}` : ''}${condition}`);
  } else if (record.measurementStatus === 'stopped') {
    lines.push(`결과측정: ${record.outcomeLabel.trim() ? `${clean(record.outcomeLabel)} · ` : ''}검사 중단${record.measurementReason.trim() ? ` · 이유: ${clean(record.measurementReason)}` : ''}`);
  } else if (record.measurementStatus === 'not_tested') {
    lines.push(`결과측정: 검사하지 않음${record.measurementReason.trim() ? ` · 이유: ${clean(record.measurementReason)}` : ''}`);
  }

  if (record.safetyStatus === 'none') lines.push('안전: 이상반응 없음');
  if (record.safetyStatus === 'event') lines.push(`안전: 이상반응 있음${record.safetyDetail.trim() ? ` · ${clean(record.safetyDetail)}` : ''}`);
  if (record.safetyStatus === 'not_delivered') lines.push(`안전: 치료 미실시·중단${record.safetyDetail.trim() ? ` · ${clean(record.safetyDetail)}` : ''}`);

  if (record.nextDecision) {
    const reason = record.decisionReason.trim() ? ` · 근거: ${clean(record.decisionReason)}` : '';
    lines.push(`다음 결정: ${decisionLabels[record.nextDecision]}${reason}`);
  }
  if (record.nextPlan.trim()) lines.push(`다음 회기 계획: ${clean(record.nextPlan)}`);
  if (record.icfCodes.trim()) lines.push(`국제 기능·장애·건강 분류 연결: ${clean(record.icfCodes)}`);

  return lines.join('\n');
}

export function createSnapshot(record: LiteRecord, copiedAt = new Date().toISOString()): SavedSnapshot {
  return {
    id: `snap-${copiedAt}-${Math.random().toString(36).slice(2, 8)}`,
    copiedAt,
    caseCode: record.caseCode.trim(),
    recordDate: record.recordDate,
    note: generateLiteNote(record),
  };
}

export function appendUnique(values: string[], candidate: string) {
  const normalized = candidate.trim();
  if (!normalized || values.some((item) => item.localeCompare(normalized, 'ko', { sensitivity: 'base' }) === 0)) return values;
  return [...values, normalized].sort((a, b) => a.localeCompare(b, 'ko'));
}
