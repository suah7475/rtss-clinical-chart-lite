export interface SearchableOutcome {
  id: string;
  name_kr: string;
  name_en: string;
  icf_level: string;
  domains: string;
  note: string;
}

const normalize = (value: string) => value.normalize('NFKC').toLocaleLowerCase('ko-KR');

export function filterOutcomesByKeywords<T extends SearchableOutcome>(
  outcomes: T[],
  query: string,
  getGuideSearchText: (outcomeId: string) => string = () => '',
): T[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return outcomes;

  return outcomes.filter((outcome) => {
    const searchable = normalize([
      outcome.id,
      outcome.name_kr,
      outcome.name_en,
      outcome.icf_level,
      outcome.domains,
      outcome.note,
      getGuideSearchText(outcome.id),
    ].join(' '));
    return terms.every((term) => searchable.includes(term));
  });
}

export function outcomeSelectionPatch(outcomeId: string, outcomeLabel: string, defaultUnit: string) {
  return {
    outcomeId,
    outcomeLabel,
    outcomeValue: '',
    outcomeUnit: suggestedOutcomeUnit(defaultUnit),
    outcomeCondition: '',
    measurementReason: '',
  };
}

export function customOutcomeSelectionPatch(outcomeLabel: string) {
  return {
    outcomeId: '',
    outcomeLabel,
    outcomeValue: '',
    outcomeUnit: '',
    outcomeCondition: '',
    measurementReason: '',
  };
}

export function suggestedOutcomeUnit(defaultUnit: string) {
  const ambiguous = [',', ' 또는 ', '변수별', '도구별', '영역별', '%와'];
  return ambiguous.some((marker) => defaultUnit.includes(marker)) ? '' : defaultUnit;
}

type MeasurementStatus = '' | 'completed' | 'stopped' | 'not_tested';

export function measurementStatusTransitionPatch(nextStatus: MeasurementStatus) {
  if (nextStatus === 'completed') {
    return { measurementStatus: nextStatus, measurementReason: '' };
  }
  if (nextStatus === 'stopped') {
    return {
      measurementStatus: nextStatus,
      outcomeValue: '',
      outcomeUnit: '',
      outcomeCondition: '',
      measurementReason: '',
    };
  }
  return {
    measurementStatus: nextStatus,
    outcomeId: '',
    outcomeLabel: '',
    outcomeValue: '',
    outcomeUnit: '',
    outcomeCondition: '',
    measurementReason: '',
  };
}
