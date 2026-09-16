export interface SearchableTarget {
  what_kr: string;
  what_en: string;
  direction: string;
  icf: string;
  note: string;
  subtype: string;
  measures: string[];
}

export interface CanonicalTargetSelection {
  id: string;
  domain: string;
  what_kr: string;
  direction: string;
  icf: string;
}

export interface StoredTargetSelection {
  domainId: string;
  targetId: string;
  targetLabel: string;
  targetDirection: string;
  icfCodes: string;
}

export interface TargetDependentRecord {
  ingredients: unknown[];
  mechanismLabel: string;
  actualDose: string;
  response: string;
  measurementStatus: string;
  outcomeLabel: string;
  outcomeValue: string;
  outcomeUnit: string;
  outcomeCondition: string;
  measurementReason: string;
  nextDecision: string;
  decisionReason: string;
  nextPlan: string;
}

function normalizeKeyword(value: string) {
  return value.normalize('NFKC').toLocaleLowerCase('ko-KR').replace(/\s+/g, ' ').trim();
}

export function filterTargetsByKeywords<T extends SearchableTarget>(
  targets: T[],
  query: string,
  outcomeLabelForId: (id: string) => string = () => '',
) {
  const terms = normalizeKeyword(query).split(' ').filter(Boolean);
  if (!terms.length) return targets;

  return targets.filter((target) => {
    const outcomeLabels = target.measures.map(outcomeLabelForId);
    const searchableText = normalizeKeyword([
      target.what_kr,
      target.what_en,
      target.direction,
      target.icf,
      target.note,
      target.subtype,
      ...outcomeLabels,
    ].join(' '));

    return terms.every((term) => searchableText.includes(term));
  });
}

export function domainTargetResetPatch(nextDomainId: string, currentIcfCodes: string, selectedTargetIcf?: string) {
  const currentIcfWasAutoFilled = Boolean(
    selectedTargetIcf?.trim() && currentIcfCodes.trim() === selectedTargetIcf.trim(),
  );

  return {
    domainId: nextDomainId,
    targetId: '',
    targetLabel: '',
    targetDirection: '',
    icfCodes: currentIcfWasAutoFilled ? '' : currentIcfCodes,
  };
}

export function targetDependentResetPatch() {
  return {
    ingredients: [],
    mechanismId: '',
    mechanismLabel: '',
    actualDose: '',
    response: '',
    measurementStatus: '' as const,
    outcomeId: '',
    outcomeLabel: '',
    outcomeValue: '',
    outcomeUnit: '',
    outcomeCondition: '',
    measurementReason: '',
    nextDecision: '' as const,
    decisionReason: '',
    nextPlan: '',
  };
}

export function hasTargetDependentWork(record: TargetDependentRecord) {
  return Boolean(
    record.ingredients.length
    || record.mechanismLabel.trim()
    || record.actualDose.trim()
    || record.response.trim()
    || record.measurementStatus
    || record.outcomeLabel.trim()
    || record.outcomeValue.trim()
    || record.outcomeUnit.trim()
    || record.outcomeCondition.trim()
    || record.measurementReason.trim()
    || record.nextDecision
    || record.decisionReason.trim()
    || record.nextPlan.trim(),
  );
}

export function repairStoredTargetSelection<T extends StoredTargetSelection>(
  record: T,
  targets: CanonicalTargetSelection[],
  validDomainIds: string[],
  fallbackDomainId = 'D01',
): T {
  const storedTarget = targets.find((target) => target.id === record.targetId);
  const domainIsValid = validDomainIds.includes(record.domainId);

  if (!domainIsValid && storedTarget) {
    return {
      ...record,
      domainId: storedTarget.domain,
      targetLabel: storedTarget.what_kr,
      targetDirection: storedTarget.direction,
    };
  }

  if (!domainIsValid) {
    return {
      ...record,
      ...domainTargetResetPatch(fallbackDomainId, record.icfCodes, storedTarget?.icf),
    };
  }

  if (!record.targetId) return record;

  if (!storedTarget || storedTarget.domain !== record.domainId) {
    return {
      ...record,
      ...domainTargetResetPatch(record.domainId, record.icfCodes, storedTarget?.icf),
    };
  }

  if (record.targetLabel === storedTarget.what_kr && record.targetDirection === storedTarget.direction) return record;

  return {
    ...record,
    targetLabel: storedTarget.what_kr,
    targetDirection: storedTarget.direction,
  };
}
