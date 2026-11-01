'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  appendUnique,
  completionPercent,
  createEmptyRecord,
  createInitialStore,
  createSnapshot,
  generateLiteNote,
  hasMeaningfulDraft,
  isLiteStore,
  migrateLegacyOutcomeIds,
  LITE_STORAGE_KEY,
  missingFields,
  repairLegacyCombinedSafetyStatus,
} from '@/app/lib/lite-core';
import type { CustomCatalog, LiteIngredient, LiteRecord, LiteStore } from '@/app/lib/lite-types';
import { baselineGuides, getGuideEvidenceLabel } from '@/app/lib/baseline-guides';
import {
  customOutcomeSelectionPatch,
  filterOutcomesByKeywords,
  measurementStatusTransitionPatch,
  outcomeSelectionPatch,
} from '@/app/lib/outcome-picker';
import { rtss } from '@/app/lib/rtss';
import {
  domainTargetResetPatch,
  filterTargetsByKeywords,
  hasTargetDependentWork,
  repairStoredTargetSelection,
  targetDependentResetPatch,
} from '@/app/lib/target-picker';

const today = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
};

const decisionOptions = [
  { value: 'maintain', label: '유지', hint: '같은 수준으로 계속' },
  { value: 'progress', label: '진행', hint: '난이도·용량 높이기' },
  { value: 'adjust', label: '조정', hint: '방법·용량 바꾸기' },
  { value: 'hold', label: '보류·중단', hint: '안전·효과 다시 검토' },
] as const;

const measurementOptions = [
  { value: 'completed', label: '측정 완료' },
  { value: 'not_tested', label: '검사하지 않음' },
  { value: 'stopped', label: '검사 중단' },
] as const;

const safetyOptions = [
  { value: 'none', label: '이상반응 없음' },
  { value: 'event', label: '이상반응 있음' },
  { value: 'treatment_stopped', label: '치료 중단' },
  { value: 'not_delivered', label: '치료 미실시' },
] as const;

const ingredientByLabel = new Map(rtss.ingredients.map((ingredient) => [ingredient.name_kr, ingredient]));
const CUSTOM_TARGET_VALUE = '__custom_target__';
const CUSTOM_TARGET_PREFIX = 'custom:';
const CUSTOM_MECHANISM_VALUE = '__custom_mechanism__';
const CUSTOM_MECHANISM_PREFIX = 'custom-mechanism:';
const CUSTOM_OUTCOME_VALUE = '__custom_outcome__';
const CUSTOM_OUTCOME_PREFIX = 'custom-outcome:';

const outcomeLabel = (id: string) => {
  const outcome = rtss.outcomes.find((item) => item.id === id);
  const guide = baselineGuides[id];
  return guide?.plainName ?? outcome?.name_kr ?? '';
};

const outcomeSearchText = (id: string) => {
  const outcome = rtss.outcomes.find((item) => item.id === id);
  const guide = baselineGuides[id];
  return [
    guide?.plainName,
    guide?.fullName,
    guide?.purpose,
    guide?.scoreFormat,
    guide?.direction,
    outcome?.name_kr,
    outcome?.name_en,
  ].filter(Boolean).join(' ');
};

function mergeCustomCatalog(catalog: CustomCatalog, record: LiteRecord): CustomCatalog {
  let targets = catalog.targets;
  let ingredients = catalog.ingredients;
  let mechanisms = catalog.mechanisms;
  let outcomes = catalog.outcomes;

  if (!record.targetId) targets = appendUnique(targets, record.targetLabel);
  for (const ingredient of record.ingredients) {
    if (ingredient.custom) ingredients = appendUnique(ingredients, ingredient.label);
  }
  if (!record.mechanismId) mechanisms = appendUnique(mechanisms, record.mechanismLabel);
  if ((record.measurementStatus === 'completed' || record.measurementStatus === 'stopped') && !record.outcomeId) outcomes = appendUnique(outcomes, record.outcomeLabel);

  return { targets, ingredients, mechanisms, outcomes };
}

function repairStoredCatalogSelections(store: LiteStore): LiteStore {
  const targetRepairedDraft = repairStoredTargetSelection(
    store.draft,
    rtss.targets,
    rtss.domains.map((domain) => domain.id),
  );
  const safetyRepairedDraft = repairLegacyCombinedSafetyStatus(targetRepairedDraft);
  const mechanism = safetyRepairedDraft.mechanismId
    ? rtss.mechanisms.find((item) => item.id === safetyRepairedDraft.mechanismId)
    : undefined;
  const outcome = safetyRepairedDraft.outcomeId
    ? rtss.outcomes.find((item) => item.id === safetyRepairedDraft.outcomeId)
    : undefined;
  const ingredients = safetyRepairedDraft.ingredients.map((ingredient) => {
    if (ingredient.custom) return ingredient;
    const canonical = rtss.ingredients.find((item) => item.id === ingredient.id);
    return canonical
      ? { ...ingredient, label: canonical.name_kr }
      : { ...ingredient, custom: true };
  });
  const repairedDraft: LiteRecord = {
    ...safetyRepairedDraft,
    ingredients,
    mechanismId: mechanism?.id ?? '',
    mechanismLabel: mechanism?.name_kr ?? safetyRepairedDraft.mechanismLabel,
    outcomeId: outcome?.id ?? '',
    outcomeLabel: outcome
      ? (baselineGuides[outcome.id]?.plainName ?? outcome.name_kr)
      : safetyRepairedDraft.outcomeLabel,
  };

  return {
    ...store,
    draft: repairedDraft,
  };
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  textarea.remove();
  if (!copied) throw new Error('clipboard unavailable');
}

function FieldLabel({ title, help, htmlFor }: { title: string; help: string; htmlFor?: string }) {
  return (
    <div className="field-label">
      <label htmlFor={htmlFor}>{title}</label>
      <span>{help}</span>
    </div>
  );
}

function CustomBadge({ show }: { show: boolean }) {
  return show ? <span className="custom-badge">기관 검토 전 사용자 항목</span> : null;
}

export default function Home() {
  const [store, setStore] = useState<LiteStore>(() => createInitialStore(today()));
  const [hydrated, setHydrated] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'checking' | 'saved' | 'error' | 'conflict' | 'recovery'>('checking');
  const [invalidStoredRaw, setInvalidStoredRaw] = useState('');
  const [attemptedCopy, setAttemptedCopy] = useState(false);
  const [copying, setCopying] = useState(false);
  const [ingredientInput, setIngredientInput] = useState('');
  const [targetSearch, setTargetSearch] = useState('');
  const [customTargetMode, setCustomTargetMode] = useState(false);
  const [selectedLinkId, setSelectedLinkId] = useState('');
  const [selectedLinkMechanismId, setSelectedLinkMechanismId] = useState('');
  const [mechanismSearch, setMechanismSearch] = useState('');
  const [customMechanismMode, setCustomMechanismMode] = useState(false);
  const [outcomeSearch, setOutcomeSearch] = useState('');
  const [customOutcomeMode, setCustomOutcomeMode] = useState(false);
  const [toast, setToast] = useState('');
  const latestSerialized = useRef('');
  const saveStatusRef = useRef(saveStatus);
  const toastTimer = useRef<number | undefined>(undefined);

  const record = store.draft;
  const missing = useMemo(() => missingFields(record), [record]);
  const note = useMemo(() => generateLiteNote(record), [record]);
  const completeness = useMemo(() => completionPercent(record), [record]);
  const stepOneDone = Boolean(record.caseCode.trim() && record.recordDate && record.aim.trim());
  const stepTwoDone = Boolean(record.targetLabel.trim() && (record.safetyStatus === 'not_delivered' || (record.ingredients.length && record.mechanismLabel.trim() && record.actualDose.trim() && record.response.trim())));
  const stepThreeDone = !missing.some((item) => ['measurementStatus', 'outcomeLabel', 'outcomeValue', 'outcomeUnit', 'outcomeCondition', 'measurementReason', 'safetyStatus', 'safetyDetail', 'nextDecision', 'decisionReason'].includes(item.key));
  const activeStep = !stepOneDone ? 1 : !stepTwoDone ? 2 : 3;

  const targets = useMemo(
    () => rtss.targets.filter((target) => target.domain === record.domainId),
    [record.domainId],
  );
  const selectedTarget = useMemo(
    () => rtss.targets.find((target) => target.id === record.targetId),
    [record.targetId],
  );
  const filteredTargets = useMemo(
    () => filterTargetsByKeywords(targets, targetSearch, outcomeSearchText),
    [targets, targetSearch],
  );
  const filteredCustomTargets = useMemo(() => {
    const terms = targetSearch.normalize('NFKC').toLocaleLowerCase('ko-KR').split(/\s+/).filter(Boolean);
    return store.customCatalog.targets.filter((label) => {
      const normalized = label.normalize('NFKC').toLocaleLowerCase('ko-KR');
      return terms.every((term) => normalized.includes(term));
    });
  }, [store.customCatalog.targets, targetSearch]);
  const selectedTargetOutsideResults = Boolean(
    selectedTarget
    && selectedTarget.domain === record.domainId
    && !filteredTargets.some((target) => target.id === selectedTarget.id),
  );
  const selectedCustomOutsideResults = Boolean(
    record.targetLabel
    && !record.targetId
    && !filteredCustomTargets.includes(record.targetLabel),
  );
  const totalTargetOptionCount = targets.length + store.customCatalog.targets.length;
  const filteredTargetOptionCount = filteredTargets.length + filteredCustomTargets.length;
  const showCustomTargetInput = customTargetMode || Boolean(record.targetLabel && !record.targetId);
  const targetSelectionValue = record.targetId
    || (record.targetLabel && !record.targetId ? `${CUSTOM_TARGET_PREFIX}${record.targetLabel}` : '')
    || (customTargetMode ? CUSTOM_TARGET_VALUE : '');
  const selectedLinks = useMemo(
    () => rtss.links.filter((link) => link.target === record.targetId),
    [record.targetId],
  );
  const selectedLink = useMemo(
    () => selectedLinks.find((link) => link.id === selectedLinkId) ?? selectedLinks[0],
    [selectedLinkId, selectedLinks],
  );
  const linkPrimaryIngredients = useMemo(
    () => (selectedLink?.primary_ingredients ?? []).map((id) => rtss.ingredients.find((item) => item.id === id)).filter(Boolean),
    [selectedLink],
  );
  const linkSupportIngredients = useMemo(
    () => (selectedLink?.support_ingredients ?? []).map((id) => rtss.ingredients.find((item) => item.id === id)).filter(Boolean),
    [selectedLink],
  );
  const linkMechanisms = useMemo(
    () => (selectedLink?.mechanisms ?? []).map((id) => rtss.mechanisms.find((item) => item.id === id)).filter(Boolean),
    [selectedLink],
  );
  const selectedLinkMechanism = useMemo(
    () => linkMechanisms.find((mechanism) => mechanism?.id === selectedLinkMechanismId) ?? linkMechanisms[0],
    [linkMechanisms, selectedLinkMechanismId],
  );
  const selectedMechanism = useMemo(
    () => rtss.mechanisms.find((mechanism) => mechanism.id === record.mechanismId),
    [record.mechanismId],
  );
  const filteredMechanisms = useMemo(() => {
    const terms = mechanismSearch.normalize('NFKC').toLocaleLowerCase('ko-KR').split(/\s+/).filter(Boolean);
    if (!terms.length) return rtss.mechanisms;
    return rtss.mechanisms.filter((mechanism) => {
      const searchable = [
        mechanism.id,
        mechanism.name_kr,
        mechanism.name_en,
        mechanism.level,
        mechanism.category,
        mechanism.causal_chain,
        mechanism.operating_conditions,
        mechanism.typical_targets,
        mechanism.doc_phrase,
      ].join(' ').normalize('NFKC').toLocaleLowerCase('ko-KR');
      return terms.every((term) => searchable.includes(term));
    });
  }, [mechanismSearch]);
  const filteredCustomMechanisms = useMemo(() => {
    const terms = mechanismSearch.normalize('NFKC').toLocaleLowerCase('ko-KR').split(/\s+/).filter(Boolean);
    return store.customCatalog.mechanisms.filter((label) => {
      const normalized = label.normalize('NFKC').toLocaleLowerCase('ko-KR');
      return terms.every((term) => normalized.includes(term));
    });
  }, [mechanismSearch, store.customCatalog.mechanisms]);
  const selectedMechanismOutsideResults = Boolean(
    selectedMechanism && !filteredMechanisms.some((mechanism) => mechanism.id === selectedMechanism.id),
  );
  const selectedCustomMechanismOutsideResults = Boolean(
    record.mechanismLabel
    && !record.mechanismId
    && !filteredCustomMechanisms.includes(record.mechanismLabel),
  );
  const totalMechanismOptionCount = rtss.mechanisms.length + store.customCatalog.mechanisms.length;
  const filteredMechanismOptionCount = filteredMechanisms.length + filteredCustomMechanisms.length;
  const showCustomMechanismInput = customMechanismMode || Boolean(record.mechanismLabel && !record.mechanismId);
  const mechanismSelectionValue = record.mechanismId
    || (record.mechanismLabel && !record.mechanismId ? `${CUSTOM_MECHANISM_PREFIX}${record.mechanismLabel}` : '')
    || (customMechanismMode ? CUSTOM_MECHANISM_VALUE : '');
  const recommendedOutcomes = useMemo(
    () => (selectedTarget?.measures ?? []).map((id) => rtss.outcomes.find((item) => item.id === id)).filter(Boolean),
    [selectedTarget],
  );
  const selectedOutcome = useMemo(
    () => rtss.outcomes.find((outcome) => outcome.id === record.outcomeId),
    [record.outcomeId],
  );
  const filteredOutcomes = useMemo(
    () => filterOutcomesByKeywords(rtss.outcomes, outcomeSearch, outcomeSearchText),
    [outcomeSearch],
  );
  const filteredCustomOutcomes = useMemo(() => {
    const terms = outcomeSearch.normalize('NFKC').toLocaleLowerCase('ko-KR').split(/\s+/).filter(Boolean);
    return store.customCatalog.outcomes.filter((label) => {
      const normalized = label.normalize('NFKC').toLocaleLowerCase('ko-KR');
      return terms.every((term) => normalized.includes(term));
    });
  }, [store.customCatalog.outcomes, outcomeSearch]);
  const selectedOutcomeOutsideResults = Boolean(
    selectedOutcome && !filteredOutcomes.some((outcome) => outcome.id === selectedOutcome.id),
  );
  const selectedCustomOutcomeOutsideResults = Boolean(
    record.outcomeLabel
    && !record.outcomeId
    && !filteredCustomOutcomes.includes(record.outcomeLabel),
  );
  const totalOutcomeOptionCount = rtss.outcomes.length + store.customCatalog.outcomes.length;
  const filteredOutcomeOptionCount = filteredOutcomes.length + filteredCustomOutcomes.length;
  const showCustomOutcomeInput = customOutcomeMode || Boolean(record.outcomeLabel && !record.outcomeId);
  const outcomeSelectionValue = record.outcomeId
    || (record.outcomeLabel && !record.outcomeId ? `${CUSTOM_OUTCOME_PREFIX}${record.outcomeLabel}` : '')
    || (customOutcomeMode ? CUSTOM_OUTCOME_VALUE : '');
  const selectedGuide = record.outcomeId ? baselineGuides[record.outcomeId] : undefined;

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      let raw: string | null = null;
      try {
        raw = localStorage.getItem(LITE_STORAGE_KEY);
      } catch {
        setSaveStatus('error');
        setHydrated(true);
        return;
      }
      if (raw) {
        try {
          const parsed: unknown = JSON.parse(raw);
          if (isLiteStore(parsed)) {
            const repaired = repairStoredCatalogSelections(migrateLegacyOutcomeIds(parsed));
            setStore(repaired);
            latestSerialized.current = JSON.stringify(repaired);
            setSaveStatus('saved');
          } else {
            setInvalidStoredRaw(raw);
            setSaveStatus('recovery');
          }
        } catch {
          setInvalidStoredRaw(raw);
          setSaveStatus('recovery');
        }
      } else {
        setSaveStatus('saved');
      }
      setHydrated(true);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!hydrated || saveStatus === 'conflict' || saveStatus === 'recovery') return;
    let nextStatus: 'saved' | 'error' = 'saved';
    try {
      const serialized = JSON.stringify(store);
      localStorage.setItem(LITE_STORAGE_KEY, serialized);
      latestSerialized.current = serialized;
    } catch {
      nextStatus = 'error';
    }
    queueMicrotask(() => setSaveStatus(nextStatus));
  }, [store, hydrated, saveStatus]);

  useEffect(() => {
    saveStatusRef.current = saveStatus;
  }, [saveStatus]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.storageArea !== localStorage || event.key !== LITE_STORAGE_KEY || !event.newValue) return;
      if (event.newValue !== latestSerialized.current) {
        saveStatusRef.current = 'conflict';
        setSaveStatus('conflict');
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => () => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
  }, []);

  const announce = (message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 2600);
  };

  const updateDraft = (patch: Partial<LiteRecord>) => {
    setStore((current) => ({
      ...current,
      draft: { ...current.draft, ...patch },
      updatedAt: new Date().toISOString(),
    }));
  };

  const invalid = (key: string) => attemptedCopy && missing.some((item) => item.key === key);

  const confirmTargetDependentReset = () => (
    !(hasTargetDependentWork(record) || ingredientInput.trim())
    || window.confirm('치료표적을 바꾸면 현재 표적에 연결된 치료방법·작용기전·결과측정·다음 결정이 초기화됩니다. 계속할까요?')
  );

  const resetTargetDependentUi = () => {
    setIngredientInput('');
    setSelectedLinkId('');
    setSelectedLinkMechanismId('');
    setMechanismSearch('');
    setCustomMechanismMode(false);
    setOutcomeSearch('');
    setCustomOutcomeMode(false);
    setAttemptedCopy(false);
  };

  const selectBuiltInTarget = (targetId: string) => {
    const exact = rtss.targets.find((target) => target.id === targetId && target.domain === record.domainId);
    if (!exact) return;
    const targetChanged = record.targetId !== exact.id || record.targetLabel !== exact.what_kr;
    if (targetChanged && !confirmTargetDependentReset()) return;
    const currentIcfWasAutoFilled = Boolean(selectedTarget?.icf && record.icfCodes.trim() === selectedTarget.icf.trim());
    updateDraft({
      ...(targetChanged ? targetDependentResetPatch() : {}),
      targetId: exact.id,
      targetLabel: exact.what_kr,
      targetDirection: exact.direction,
      domainId: exact.domain,
      icfCodes: !record.icfCodes.trim() || currentIcfWasAutoFilled ? exact.icf : record.icfCodes,
    });
    if (targetChanged) resetTargetDependentUi();
    setCustomTargetMode(false);
  };

  const beginCustomTarget = (value = '') => {
    const targetChanged = Boolean(record.targetId || record.targetLabel !== value);
    if (targetChanged && !confirmTargetDependentReset()) return;
    const currentIcfWasAutoFilled = Boolean(selectedTarget?.icf && record.icfCodes.trim() === selectedTarget.icf.trim());
    updateDraft({
      ...(targetChanged ? targetDependentResetPatch() : {}),
      targetId: '',
      targetLabel: value,
      targetDirection: '',
      icfCodes: currentIcfWasAutoFilled ? '' : record.icfCodes,
    });
    if (targetChanged) resetTargetDependentUi();
    setCustomTargetMode(true);
  };

  const editCustomTarget = (value: string) => {
    const targetChangedWithWork = value !== record.targetLabel && hasTargetDependentWork(record);
    if (targetChangedWithWork && !confirmTargetDependentReset()) return;
    updateDraft({
      ...(targetChangedWithWork ? targetDependentResetPatch() : {}),
      targetId: '',
      targetLabel: value,
      targetDirection: '',
    });
    if (targetChangedWithWork) resetTargetDependentUi();
  };

  const clearTargetSelection = () => {
    if ((record.targetId || record.targetLabel) && !confirmTargetDependentReset()) return;
    updateDraft({
      ...targetDependentResetPatch(),
      ...domainTargetResetPatch(record.domainId, record.icfCodes, selectedTarget?.icf),
    });
    resetTargetDependentUi();
    setCustomTargetMode(false);
  };

  const handleDomainChange = (nextDomainId: string) => {
    if (nextDomainId === record.domainId) return;
    if (!confirmTargetDependentReset()) return;
    updateDraft({
      ...targetDependentResetPatch(),
      ...domainTargetResetPatch(nextDomainId, record.icfCodes, selectedTarget?.icf),
    });
    resetTargetDependentUi();
    setTargetSearch('');
    setCustomTargetMode(false);
  };

  const handleTargetSelection = (value: string) => {
    if (!value) {
      clearTargetSelection();
      return;
    }
    if (value === CUSTOM_TARGET_VALUE) {
      beginCustomTarget();
      return;
    }
    if (value.startsWith(CUSTOM_TARGET_PREFIX)) {
      beginCustomTarget(value.slice(CUSTOM_TARGET_PREFIX.length));
      return;
    }
    selectBuiltInTarget(value);
  };

  const selectBuiltInMechanism = (mechanismId: string) => {
    const exact = rtss.mechanisms.find((mechanism) => mechanism.id === mechanismId);
    if (!exact) return;
    updateDraft({ mechanismId: exact.id, mechanismLabel: exact.name_kr });
    setCustomMechanismMode(false);
  };

  const beginCustomMechanism = (value = '') => {
    updateDraft({ mechanismId: '', mechanismLabel: value });
    setCustomMechanismMode(true);
  };

  const editCustomMechanism = (value: string) => {
    updateDraft({ mechanismId: '', mechanismLabel: value });
  };

  const handleMechanismSelection = (value: string) => {
    if (!value) {
      updateDraft({ mechanismId: '', mechanismLabel: '' });
      setCustomMechanismMode(false);
      return;
    }
    if (value === CUSTOM_MECHANISM_VALUE) {
      beginCustomMechanism();
      return;
    }
    if (value.startsWith(CUSTOM_MECHANISM_PREFIX)) {
      beginCustomMechanism(value.slice(CUSTOM_MECHANISM_PREFIX.length));
      return;
    }
    selectBuiltInMechanism(value);
  };

  const confirmOutcomeChange = () => (
    !(record.outcomeValue.trim()
      || record.outcomeUnit.trim()
      || record.outcomeCondition.trim()
      || (record.measurementStatus === 'stopped' && record.measurementReason.trim()))
    || window.confirm('결과측정 도구를 바꾸면 입력한 값·단위·측정 조건·검사 중단 이유가 초기화됩니다. 계속할까요?')
  );

  const selectBuiltInOutcome = (outcomeId: string) => {
    const exact = rtss.outcomes.find((outcome) => outcome.id === outcomeId);
    if (!exact) return;
    const outcomeChanged = record.outcomeId !== exact.id;
    if (outcomeChanged && !confirmOutcomeChange()) return;
    const guide = baselineGuides[exact.id];
    if (!outcomeChanged) {
      updateDraft({ outcomeLabel: guide?.plainName ?? exact.name_kr });
      setCustomOutcomeMode(false);
      return;
    }
    updateDraft(outcomeSelectionPatch(
      exact.id,
      guide?.plainName ?? exact.name_kr,
      guide?.defaultUnit ?? '',
    ));
    setCustomOutcomeMode(false);
  };

  const beginCustomOutcome = (value = '') => {
    const outcomeChanged = Boolean(record.outcomeId || record.outcomeLabel !== value);
    if (outcomeChanged && !confirmOutcomeChange()) return;
    if (!outcomeChanged) {
      updateDraft({ outcomeId: '', outcomeLabel: value });
    } else {
      updateDraft(customOutcomeSelectionPatch(value));
    }
    setCustomOutcomeMode(true);
  };

  const editCustomOutcome = (value: string) => {
    const outcomeChangedWithWork = value !== record.outcomeLabel
      && Boolean(
        record.outcomeValue.trim()
        || record.outcomeUnit.trim()
        || record.outcomeCondition.trim()
        || (record.measurementStatus === 'stopped' && record.measurementReason.trim()),
      );
    if (outcomeChangedWithWork && !confirmOutcomeChange()) return;
    updateDraft(outcomeChangedWithWork
      ? customOutcomeSelectionPatch(value)
      : { outcomeId: '', outcomeLabel: value });
  };

  const clearOutcomeSelection = () => {
    if ((record.outcomeId || record.outcomeLabel) && !confirmOutcomeChange()) return;
    updateDraft(customOutcomeSelectionPatch(''));
    setCustomOutcomeMode(false);
  };

  const handleOutcomeSelection = (value: string) => {
    if (!value) {
      clearOutcomeSelection();
      return;
    }
    if (value === CUSTOM_OUTCOME_VALUE) {
      beginCustomOutcome();
      return;
    }
    if (value.startsWith(CUSTOM_OUTCOME_PREFIX)) {
      beginCustomOutcome(value.slice(CUSTOM_OUTCOME_PREFIX.length));
      return;
    }
    selectBuiltInOutcome(value);
  };

  const handleMeasurementStatusChange = (nextStatus: LiteRecord['measurementStatus']) => {
    if (nextStatus === record.measurementStatus) return;
    const hasMeasurementWork = Boolean(
      record.outcomeLabel.trim()
      || record.outcomeValue.trim()
      || record.outcomeUnit.trim()
      || record.outcomeCondition.trim()
      || record.measurementReason.trim(),
    );
    if (hasMeasurementWork && !window.confirm('결과측정 상태를 바꾸면 현재 상태에 맞지 않는 값·단위·조건·이유가 정리됩니다. 계속할까요?')) return;
    updateDraft(measurementStatusTransitionPatch(nextStatus));
    setOutcomeSearch('');
    if (nextStatus === 'not_tested') setCustomOutcomeMode(false);
  };

  const handleSafetyStatusChange = (nextStatus: LiteRecord['safetyStatus']) => {
    if (nextStatus === record.safetyStatus) return;
    const hasTreatmentWork = Boolean(
      record.ingredients.length
      || ingredientInput.trim()
      || record.mechanismLabel.trim()
      || record.actualDose.trim()
      || record.response.trim(),
    );
    const clearsTreatmentWork = nextStatus === 'not_delivered' && hasTreatmentWork;
    const clearsSafetyDetail = Boolean(record.safetyDetail.trim());
    if ((clearsTreatmentWork || clearsSafetyDetail) && !window.confirm(
      clearsTreatmentWork && clearsSafetyDetail
        ? '안전 상태를 바꾸면 기존 안전 상세와 입력한 치료방법·작용기전·제공량·반응이 초기화됩니다. 계속할까요?'
        : clearsTreatmentWork
          ? '‘치료 미실시’를 선택하면 입력한 치료방법·작용기전·제공량·반응이 초기화됩니다. 계속할까요?'
          : '안전 상태를 바꾸면 입력한 안전 상세가 초기화됩니다. 계속할까요?',
    )) return;
    updateDraft({
      safetyStatus: nextStatus,
      safetyDetail: '',
      ...(nextStatus === 'not_delivered' ? {
        ingredients: [],
        mechanismId: '',
        mechanismLabel: '',
        actualDose: '',
        response: '',
      } : {}),
    });
    if (nextStatus === 'not_delivered') {
      setIngredientInput('');
      setMechanismSearch('');
      setCustomMechanismMode(false);
    }
  };

  const addIngredient = (label = ingredientInput) => {
    if (record.safetyStatus === 'not_delivered') {
      announce('치료 미실시 상태입니다. 안전 상태를 바꾼 뒤 치료방법을 입력하세요.');
      return;
    }
    const cleaned = label.trim();
    if (!cleaned) return;
    const exact = ingredientByLabel.get(cleaned);
    const next: LiteIngredient = { id: exact?.id ?? `custom-${cleaned}`, label: cleaned, custom: !exact };
    if (!record.ingredients.some((item) => item.label.localeCompare(cleaned, 'ko', { sensitivity: 'base' }) === 0)) {
      updateDraft({ ingredients: [...record.ingredients, next] });
    }
    if (!exact) {
      setStore((current) => ({
        ...current,
        customCatalog: {
          ...current.customCatalog,
          ingredients: appendUnique(current.customCatalog.ingredients, cleaned),
        },
        updatedAt: new Date().toISOString(),
      }));
    }
    setIngredientInput('');
  };

  const removeIngredient = (id: string) => {
    updateDraft({ ingredients: record.ingredients.filter((item) => item.id !== id) });
  };

  const applyReference = () => {
    if (record.safetyStatus === 'not_delivered') {
      announce('치료 미실시 상태입니다. 안전 상태를 바꾼 뒤 참고안을 적용하세요.');
      return;
    }
    const primary = linkPrimaryIngredients.map((item) => ({ id: item!.id, label: item!.name_kr, custom: false }));
    const hasTreatmentWork = Boolean(record.ingredients.length || record.mechanismLabel.trim() || record.actualDose.trim() || record.response.trim());
    if (hasTreatmentWork && !window.confirm('현재 치료방법·작용기전·제공량·반응을 선택한 표적의 참고안으로 바꿀까요? 실제 시행 내용은 다시 확인해 입력해야 합니다.')) return;
    updateDraft({
      ingredients: primary,
      mechanismId: selectedLinkMechanism?.id ?? '',
      mechanismLabel: selectedLinkMechanism?.name_kr ?? '',
      actualDose: '',
      response: '',
    });
    setMechanismSearch('');
    setCustomMechanismMode(false);
    announce('선택한 표적의 핵심 참고안을 적용했습니다. 실제 제공량과 반응을 입력하세요.');
  };

  const chooseRecommendedOutcome = (id: string) => {
    selectBuiltInOutcome(id);
  };

  const copyCurrentNote = async () => {
    if (copying) return;
    if (saveStatusRef.current === 'conflict') {
      announce('다른 탭의 변경이 감지되었습니다. 먼저 최신 자료를 다시 열어 주세요.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (saveStatusRef.current === 'recovery') {
      announce('기존 저장자료를 먼저 백업하거나 새로 시작해 주세요.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setAttemptedCopy(true);
    if (ingredientInput.trim()) {
      const ingredientField = document.getElementById('ingredient-input');
      ingredientField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.setTimeout(() => ingredientField?.focus(), 350);
      announce('입력 중인 치료방법은 ‘추가’를 눌러 기록에 포함해 주세요.');
      return;
    }
    const currentMissing = missingFields(record);
    if (currentMissing.length) {
      let firstMissingId = currentMissing[0].elementId;
      if (currentMissing[0].key === 'targetLabel' && showCustomTargetInput) firstMissingId = 'target-custom';
      if (currentMissing[0].key === 'mechanismLabel' && showCustomMechanismInput) firstMissingId = 'mechanism-custom';
      if (currentMissing[0].key === 'outcomeLabel' && showCustomOutcomeInput) {
        firstMissingId = record.measurementStatus === 'stopped' ? 'stopped-outcome-custom' : 'outcome-custom';
      }
      const first = document.getElementById(firstMissingId);
      first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.setTimeout(() => first?.focus(), 350);
      announce(`복사 전 ${currentMissing[0].label}부터 확인해 주세요.`);
      return;
    }

    setCopying(true);
    try {
      await copyText(note);
      const statusAfterCopy = String(saveStatusRef.current);
      if (statusAfterCopy === 'conflict' || statusAfterCopy === 'recovery') {
        announce('문장은 복사했지만 저장상태가 변경되어 최근 기록에는 보관하지 않았습니다.');
        return;
      }
      if (statusAfterCopy === 'error') {
        announce('문장은 복사했지만 이 기기에 저장되지 않았습니다. 브라우저 저장 설정을 확인해 주세요.');
        return;
      }
      const snapshot = createSnapshot(record);
      setStore((current) => ({
        ...current,
        customCatalog: mergeCustomCatalog(current.customCatalog, record),
        snapshots: [snapshot, ...current.snapshots].slice(0, 20),
        updatedAt: new Date().toISOString(),
      }));
      announce('차트 문장을 복사하고 최근 기록에 추가했습니다.');
    } catch {
      announce('자동 복사가 되지 않았습니다. 미리보기 문장을 직접 선택해 복사해 주세요.');
    } finally {
      setCopying(false);
    }
  };

  const startNewRecord = () => {
    const hasWork = hasMeaningfulDraft(record, today()) || Boolean(ingredientInput.trim());
    if (hasWork && !window.confirm('현재 입력을 비우고 새 기록을 시작할까요? 최근에 복사한 기록은 보관됩니다.')) return;
    setStore((current) => ({
      ...current,
      draft: createEmptyRecord(today()),
      updatedAt: new Date().toISOString(),
    }));
    setIngredientInput('');
    setTargetSearch('');
    setCustomTargetMode(false);
    setSelectedLinkId('');
    setSelectedLinkMechanismId('');
    setMechanismSearch('');
    setCustomMechanismMode(false);
    setOutcomeSearch('');
    setCustomOutcomeMode(false);
    setAttemptedCopy(false);
    announce('새 기록을 시작했습니다.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadDemo = () => {
    const hasWork = hasMeaningfulDraft(record, today()) || Boolean(ingredientInput.trim());
    if (hasWork && !window.confirm('현재 입력을 합성 예시로 바꿀까요? 최근에 복사한 기록은 보관됩니다.')) return;
    const target = rtss.targets.find((item) => item.id === 'T040')!;
    const link = rtss.links.find((item) => item.target === target.id)!;
    const ingredient = rtss.ingredients.find((item) => item.id === link.primary_ingredients[0])!;
    const mechanism = rtss.mechanisms.find((item) => item.id === link.mechanisms[0])!;
    const guide = baselineGuides.O06;
    updateDraft({
      caseCode: 'DEMO-LITE-001',
      recordDate: today(),
      aim: '집에서 가족과 함께 식탁에 앉아 식사하기',
      domainId: target.domain,
      targetId: target.id,
      targetLabel: target.what_kr,
      targetDirection: target.direction,
      ingredients: [{ id: ingredient.id, label: ingredient.name_kr, custom: false }],
      mechanismId: mechanism.id,
      mechanismLabel: mechanism.name_kr,
      actualDose: '좌석 높이 48cm에서 앉기-서기 35회 · 마비측 발을 뒤에 배치 · 손 지지 없이 접촉 도움',
      response: '마지막 5회에서 몸통 전방 이동이 늦어졌으나 무릎 붕괴 없이 완료함',
      measurementStatus: 'completed',
      outcomeId: 'O06',
      outcomeLabel: guide?.plainName ?? '5회 앉았다 일어서기 검사',
      outcomeValue: '18.4',
      outcomeUnit: guide?.defaultUnit ?? '초(s)',
      outcomeCondition: '표준 의자 · 팔 사용 없음 · 접촉 도움 · 2회 중 빠른 값',
      measurementReason: '',
      safetyStatus: 'none',
      safetyDetail: '',
      nextDecision: 'progress',
      decisionReason: '35회 동안 무릎 붕괴가 없고 마지막 반복에서만 속도가 저하됨',
      nextPlan: '같은 좌석 높이에서 독립 수행 80%를 확인한 뒤 좌석을 3cm 낮춤',
      icfCodes: target.icf,
    });
    setTargetSearch('');
    setCustomTargetMode(false);
    setSelectedLinkId('');
    setSelectedLinkMechanismId('');
    setMechanismSearch('');
    setCustomMechanismMode(false);
    setOutcomeSearch('');
    setCustomOutcomeMode(false);
    setAttemptedCopy(false);
    announce('합성 예시를 불러왔습니다. 실제 개인정보를 입력하지 마세요.');
  };

  const copySavedNote = async (savedNote: string) => {
    try {
      await copyText(savedNote);
      announce('보관된 기록을 다시 복사했습니다.');
    } catch {
      announce('복사할 수 없습니다. 보관된 문장을 직접 선택해 주세요.');
    }
  };

  const downloadInvalidStorage = () => {
    if (!invalidStoredRaw) return;
    const blob = new Blob([invalidStoredRaw], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `RTSS_Lite_복구용_원문_${today()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    announce('기존 저장자료 원문을 내려받았습니다.');
  };

  const discardInvalidStorage = () => {
    if (!window.confirm('기존 저장자료 원문을 내려받았는지 확인해 주세요. 손상되거나 지원되지 않는 저장자료를 지우고 새로 시작할까요?')) return;
    try {
      localStorage.removeItem(LITE_STORAGE_KEY);
      const next = createInitialStore(today());
      setStore(next);
      setInvalidStoredRaw('');
      setSaveStatus('saved');
      latestSerialized.current = JSON.stringify(next);
      setIngredientInput('');
      setTargetSearch('');
      setCustomTargetMode(false);
      setSelectedLinkId('');
      setSelectedLinkMechanismId('');
      setMechanismSearch('');
      setCustomMechanismMode(false);
      setOutcomeSearch('');
      setCustomOutcomeMode(false);
      setAttemptedCopy(false);
      announce('새 기록으로 시작합니다.');
    } catch {
      setSaveStatus('error');
      announce('기존 저장자료를 지우지 못했습니다. 브라우저 저장 설정을 확인해 주세요.');
    }
  };

  const renderOutcomePicker = (id: 'outcome' | 'stopped-outcome', title: string, help: string) => {
    const searchId = `${id}-search`;
    const customInputId = `${id}-custom`;
    const selectedOutsideRecommendations = Boolean(
      selectedOutcome
      && recommendedOutcomes.length
      && !recommendedOutcomes.some((outcome) => outcome?.id === selectedOutcome.id),
    );

    return (
      <div className={`field target-picker outcome-picker ${invalid('outcomeLabel') ? 'invalid' : ''}`}>
        <FieldLabel title={title} help={help} htmlFor={searchId} />
        <div className="target-search-box">
          <input
            id={searchId}
            type="search"
            value={outcomeSearch}
            onChange={(event) => setOutcomeSearch(event.target.value)}
            maxLength={100}
            placeholder="예: BBS, 10m, 균형, 일상생활"
            aria-label={`${title} 검색`}
          />
          {outcomeSearch && <button type="button" onClick={() => setOutcomeSearch('')} aria-label={`${title} 검색어 지우기`}>지우기</button>}
        </div>
        <div className="target-result-meta" aria-live="polite">
          <span>{totalOutcomeOptionCount}개 중 {filteredOutcomeOptionCount}개 검색됨</span>
          <span>한글·영문·약어·ICF 영역·설명 검색</span>
        </div>
        <select
          id={id}
          value={outcomeSelectionValue}
          onChange={(event) => handleOutcomeSelection(event.target.value)}
          aria-label={`${title} 선택 목록`}
          aria-invalid={invalid('outcomeLabel') || undefined}
          aria-describedby={invalid('outcomeLabel') ? `${id}-error` : undefined}
        >
          <option value="">결과측정 도구를 선택하세요 · 기본 {rtss.outcomes.length}개</option>
          {selectedOutcomeOutsideResults && selectedOutcome && (
            <optgroup label="현재 선택 · 검색 결과와 별도">
              <option value={selectedOutcome.id}>{outcomeLabel(selectedOutcome.id)} · {selectedOutcome.name_en}</option>
            </optgroup>
          )}
          {selectedCustomOutcomeOutsideResults && (
            <optgroup label="현재 선택 · 기관 검토 전 사용자 항목">
              <option value={`${CUSTOM_OUTCOME_PREFIX}${record.outcomeLabel}`}>{record.outcomeLabel}</option>
            </optgroup>
          )}
          {filteredOutcomes.length > 0 && (
            <optgroup label={`전체 결과측정 도구 · ${filteredOutcomes.length}개`}>
              {filteredOutcomes.map((outcome) => (
                <option key={outcome.id} value={outcome.id}>{outcomeLabel(outcome.id)} · {outcome.name_en}</option>
              ))}
            </optgroup>
          )}
          {filteredCustomOutcomes.length > 0 && (
            <optgroup label="기관 검토 전 사용자 항목">
              {filteredCustomOutcomes.map((label) => <option key={`custom-outcome-${label}`} value={`${CUSTOM_OUTCOME_PREFIX}${label}`}>{label}</option>)}
            </optgroup>
          )}
          {!filteredOutcomeOptionCount && outcomeSearch && <option value="__no_outcome_result__" disabled>검색 결과가 없습니다</option>}
          <option value={CUSTOM_OUTCOME_VALUE}>목록에 없음 · 직접 입력</option>
        </select>
        {showCustomOutcomeInput && (
          <input
            id={customInputId}
            value={record.outcomeLabel}
            onChange={(event) => editCustomOutcome(event.target.value)}
            maxLength={180}
            placeholder="검사 또는 추적 항목의 전체 이름"
            aria-label={`${title} 직접 입력`}
            aria-invalid={invalid('outcomeLabel') || undefined}
            aria-describedby={invalid('outcomeLabel') ? `${id}-error` : undefined}
          />
        )}
        <div className="field-meta">
          <CustomBadge show={Boolean(record.outcomeLabel && !record.outcomeId)} />
          <span>기본 목록 {rtss.outcomes.length}개{store.customCatalog.outcomes.length ? ` · 사용자 항목 ${store.customCatalog.outcomes.length}개` : ''}</span>
        </div>
        {selectedOutsideRecommendations && <p className="picker-caution">현재 표적의 빠른 추천 목록 밖의 도구입니다. 임상적으로 타당하면 그대로 사용할 수 있습니다.</p>}
        {invalid('outcomeLabel') && <em id={`${id}-error`}>{title}를 선택하거나 입력해 주세요.</em>}
      </div>
    );
  };

  return (
    <>
      <div className="privacy-strip">
        <span>교육·파일럿용</span>
        <p>이름·등록번호·연락처를 입력하지 마세요. 전자의무기록과 전자서명을 대체하지 않습니다.</p>
      </div>

      <header className="app-header">
        <div className="brand-block">
          <span className="brand-mark" aria-hidden="true">R</span>
          <div>
            <strong>RTSS Lite</strong>
            <span>빠른 물리치료 회기 기록</span>
          </div>
        </div>
        <div className="header-actions">
          <span className={`save-state ${saveStatus}`}>
            <i aria-hidden="true" />
            <span className="save-desktop">
              {saveStatus === 'checking' && '저장 확인 중'}
              {saveStatus === 'saved' && '이 기기에 자동저장됨'}
              {saveStatus === 'error' && '자동저장 실패'}
              {saveStatus === 'conflict' && '다른 탭의 변경 감지'}
              {saveStatus === 'recovery' && '기존 저장자료 확인 필요'}
            </span>
            <span className="save-mobile">
              {saveStatus === 'checking' && '확인 중'}
              {saveStatus === 'saved' && '저장됨'}
              {saveStatus === 'error' && '저장 실패'}
              {saveStatus === 'conflict' && '충돌 감지'}
              {saveStatus === 'recovery' && '자료 확인'}
            </span>
          </span>
          {saveStatus === 'conflict' && <button className="text-button" type="button" onClick={() => window.location.reload()}>최신 자료 다시 열기</button>}
          <button className="button quiet" type="button" onClick={loadDemo}>합성 예시</button>
          <button className="button secondary" type="button" onClick={startNewRecord}>새 기록</button>
        </div>
      </header>

      {saveStatus === 'recovery' && (
        <section className="recovery-banner" aria-live="polite">
          <div><strong>기존 저장자료를 자동으로 열 수 없습니다.</strong><p>원문을 먼저 보관한 뒤 새 기록으로 시작할 수 있습니다. 확인 전에는 자동저장과 문장 복사를 중단합니다.</p></div>
          <div><button className="button secondary" type="button" onClick={downloadInvalidStorage}>기존 자료 원문 받기</button><button className="button primary" type="button" onClick={discardInvalidStorage}>원문 확인 후 새로 시작</button></div>
        </section>
      )}

      <main className="page-shell">
        <section className="intro" aria-labelledby="page-title">
          <div>
            <span className="eyebrow">회기 기록 한 장</span>
            <h1 id="page-title">목표에서 다음 결정까지,<br />{' '}세 단계로 기록합니다.</h1>
          </div>
          <p>직접 치료표적, 실제 치료방법, 작용기전 가설과 제공량을 남기고 결과를 다음 계획으로 연결합니다.</p>
        </section>

        <nav className="step-nav" aria-label="기록 단계">
          <a className={stepOneDone ? 'done' : activeStep === 1 ? 'active' : ''} href="#step-1"><b>{stepOneDone ? '✓' : '1'}</b><span>환자 생활목표</span></a>
          <span aria-hidden="true" />
          <a className={stepTwoDone ? 'done' : activeStep === 2 ? 'active' : ''} href="#step-2"><b>{stepTwoDone ? '✓' : '2'}</b><span>오늘의 치료</span></a>
          <span aria-hidden="true" />
          <a className={stepThreeDone ? 'done' : activeStep === 3 ? 'active' : ''} href="#step-3"><b>{stepThreeDone ? '✓' : '3'}</b><span>결과·다음 결정</span></a>
        </nav>

        <div className="workspace">
          <div className="form-column">
            <section className="step-card" id="step-1">
              <div className="step-heading">
                <span className="step-number">01</span>
                <div><h2>환자 생활목표</h2><p>환자가 실제 생활에서 다시 하고 싶은 일을 먼저 적습니다.</p></div>
              </div>
              <div className="field-grid two-col">
                <div className={`field ${invalid('caseCode') ? 'invalid' : ''}`}>
                  <FieldLabel title="비식별 사례 코드" help="이름 대신 기관 내 임시 코드만 사용" htmlFor="case-code" />
                  <input id="case-code" value={record.caseCode} onChange={(event) => updateDraft({ caseCode: event.target.value })} maxLength={40} placeholder="예: PT-2026-014" />
                  {invalid('caseCode') && <em>사례 코드를 입력해 주세요.</em>}
                </div>
                <div className={`field ${invalid('recordDate') ? 'invalid' : ''}`}>
                  <FieldLabel title="기록일" help="오늘 치료를 시행한 날짜" htmlFor="record-date" />
                  <input id="record-date" type="date" value={record.recordDate} onChange={(event) => updateDraft({ recordDate: event.target.value })} />
                </div>
              </div>
              <div className={`field ${invalid('aim') ? 'invalid' : ''}`}>
                <FieldLabel title="환자 생활목표" help="치료실 밖의 실제 활동을 환자 관점으로 한 문장에 작성" htmlFor="aim" />
                <textarea id="aim" value={record.aim} onChange={(event) => updateDraft({ aim: event.target.value })} maxLength={240} rows={3} placeholder="예: 집에서 가족과 함께 식탁에 앉아 식사하기" />
                {invalid('aim') && <em>환자가 중요하게 생각하는 생활목표를 적어 주세요.</em>}
              </div>
            </section>

            <section className="step-card" id="step-2">
              <div className="step-heading">
                <span className="step-number">02</span>
                <div><h2>오늘의 치료</h2><p>이 회기에 직접 바꾸려 한 한 가지와 실제로 제공한 치료를 적습니다.</p></div>
              </div>

              <div className="field-grid two-col domain-target">
                <div className="field compact-field">
                  <FieldLabel title="임상영역" help="선택지를 먼저 좁힙니다" htmlFor="domain" />
                  <select id="domain" value={record.domainId} onChange={(event) => handleDomainChange(event.target.value)}>
                    {rtss.domains.map((domain) => <option key={domain.id} value={domain.id}>{domain.kr}</option>)}
                  </select>
                </div>
                <div className={`field target-picker ${invalid('targetLabel') ? 'invalid' : ''}`}>
                  <FieldLabel title="직접 치료표적" help="관련 키워드로 찾은 뒤 목록에서 선택합니다" htmlFor="target-search" />
                  <div className="target-search-box">
                    <input
                      id="target-search"
                      type="search"
                      value={targetSearch}
                      onChange={(event) => setTargetSearch(event.target.value)}
                      maxLength={80}
                      placeholder="검색: 보행, 균형, 속도, 평가도구, ICF 코드"
                      autoComplete="off"
                    />
                    {targetSearch && <button type="button" onClick={() => setTargetSearch('')} aria-label="치료표적 검색어 지우기">지우기</button>}
                  </div>
                  <div className="target-result-meta" aria-live="polite">
                    <span>{totalTargetOptionCount}개 중 {filteredTargetOptionCount}개 검색됨</span>
                    <span>한글·영문·변화방향·평가도구·ICF 검색</span>
                  </div>
                  <select
                    id="target"
                    aria-label="직접 치료표적 선택 목록"
                    value={targetSelectionValue}
                    onChange={(event) => handleTargetSelection(event.target.value)}
                    aria-invalid={invalid('targetLabel') || undefined}
                    aria-describedby={invalid('targetLabel') ? 'target-error' : undefined}
                  >
                    <option value="">치료표적을 선택하세요</option>
                    {selectedTargetOutsideResults && selectedTarget && (
                      <optgroup label="현재 선택 · 검색 결과와 별도">
                        <option value={selectedTarget.id}>{selectedTarget.what_kr} · {selectedTarget.direction}</option>
                      </optgroup>
                    )}
                    {selectedCustomOutsideResults && (
                      <optgroup label="현재 선택 · 기관 검토 전 사용자 항목">
                        <option value={`${CUSTOM_TARGET_PREFIX}${record.targetLabel}`}>{record.targetLabel}</option>
                      </optgroup>
                    )}
                    {filteredTargets.length > 0 && (
                      <optgroup label={`기본 치료표적 · ${filteredTargets.length}개 검색됨`}>
                        {filteredTargets.map((target) => (
                          <option key={target.id} value={target.id}>{target.what_kr} · {target.direction}</option>
                        ))}
                      </optgroup>
                    )}
                    {filteredCustomTargets.length > 0 && (
                      <optgroup label="기관 검토 전 사용자 항목">
                        {filteredCustomTargets.map((label) => <option key={`custom-${label}`} value={`${CUSTOM_TARGET_PREFIX}${label}`}>{label}</option>)}
                      </optgroup>
                    )}
                    {!filteredTargetOptionCount && targetSearch && <option value="__no_target_result__" disabled>검색 결과가 없습니다</option>}
                    <option value={CUSTOM_TARGET_VALUE}>목록에 없음 · 직접 입력</option>
                  </select>
                  {showCustomTargetInput && (
                    <input
                      id="target-custom"
                      value={record.targetLabel}
                      onChange={(event) => editCustomTarget(event.target.value)}
                      maxLength={180}
                      placeholder="새 치료표적을 구체적으로 입력"
                      aria-label="새 직접 치료표적 입력"
                      aria-invalid={invalid('targetLabel') || undefined}
                      aria-describedby={invalid('targetLabel') ? 'target-error' : undefined}
                    />
                  )}
                  <div className="field-meta"><CustomBadge show={Boolean(record.targetLabel && !record.targetId)} />{record.targetDirection && <span>변화방향 · {record.targetDirection}</span>}</div>
                  {invalid('targetLabel') && <em id="target-error">직접 치료표적을 선택하거나 입력해 주세요.</em>}
                </div>
              </div>

              {selectedLink && (
                <aside className="reference-suggestion" aria-label="치료 구성 참고안">
                  {selectedLinks.length > 1 && (
                    <label className="reference-variant">
                      <span>이 표적의 치료 구성 참고안 {selectedLinks.length}개</span>
                      <select value={selectedLink.id} onChange={(event) => setSelectedLinkId(event.target.value)} aria-label="치료 구성 참고안 선택">
                        {selectedLinks.map((link, index) => {
                          const primaryNames = link.primary_ingredients
                            .map((id) => rtss.ingredients.find((item) => item.id === id)?.name_kr)
                            .filter(Boolean)
                            .slice(0, 2)
                            .join(', ');
                          return <option key={link.id} value={link.id}>{index + 1}. {primaryNames || link.id} · {link.strength.split(' | ')[0] || '참고안'}</option>;
                        })}
                      </select>
                    </label>
                  )}
                  {linkMechanisms.length > 1 && (
                    <label className="reference-variant">
                      <span>기록에 적용할 작용기전 {linkMechanisms.length}개 중 선택</span>
                      <select value={selectedLinkMechanism?.id ?? ''} onChange={(event) => setSelectedLinkMechanismId(event.target.value)} aria-label="참고안 작용기전 선택">
                        {linkMechanisms.map((mechanism) => <option key={mechanism!.id} value={mechanism!.id}>{mechanism!.name_kr}</option>)}
                      </select>
                    </label>
                  )}
                  <div className="reference-copy">
                    <span>선택한 표적의 구성 참고안 · {selectedLink.id}</span>
                    <strong>{linkPrimaryIngredients.map((item) => item!.name_kr).join(', ')}</strong>
                    <p>{selectedLinkMechanism?.doc_phrase ?? selectedLinkMechanism?.name_kr}</p>
                  </div>
                  <div className="reference-detail">
                    <span>보조 선택지 · {linkSupportIngredients.map((item) => item!.name_kr).join(', ') || '없음'}</span>
                    <span>문헌·기관 용량 참고 · {selectedLink.recommended_dose || '기관 기준 확인'}</span>
                  </div>
                  <button className="button reference-button" type="button" onClick={applyReference} disabled={record.safetyStatus === 'not_delivered'}>핵심 구성 가져오기</button>
                  <small>자동 처방이 아닙니다. 환자 상태와 실제 시행 내용에 맞게 수정하세요.</small>
                </aside>
              )}

              {record.safetyStatus === 'not_delivered' && <p className="treatment-disabled-notice">현재 안전 상태가 ‘치료 미실시’라 치료내용 입력이 잠겨 있습니다. 치료를 시행했다면 안전 상태를 먼저 바꿔 주세요.</p>}

              <div className={`field ${invalid('ingredients') || (attemptedCopy && ingredientInput.trim()) ? 'invalid' : ''}`}>
                <FieldLabel title="실제 치료방법" help="목록에 없는 방법도 입력한 뒤 ‘추가’를 누를 수 있습니다" htmlFor="ingredient-input" />
                <div className="add-row">
                  <input id="ingredient-input" list="ingredient-options" value={ingredientInput} onChange={(event) => setIngredientInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addIngredient(); } }} maxLength={180} placeholder="예: 앉기-서기 반복 연습" disabled={record.safetyStatus === 'not_delivered'} />
                  <datalist id="ingredient-options">
                    {rtss.ingredients.map((item) => <option key={item.id} value={item.name_kr}>{item.description}</option>)}
                    {store.customCatalog.ingredients.map((label) => <option key={`custom-${label}`} value={label}>기관 검토 전 사용자 항목</option>)}
                  </datalist>
                  <button className="button add-button" type="button" onClick={() => addIngredient()} disabled={record.safetyStatus === 'not_delivered'}>추가</button>
                </div>
                <div className="field-meta"><span>기본 목록 {rtss.ingredients.length}개{store.customCatalog.ingredients.length ? ` · 사용자 항목 ${store.customCatalog.ingredients.length}개` : ''}</span></div>
                {record.ingredients.length > 0 && <div className="chips">{record.ingredients.map((item) => <span className={item.custom ? 'chip custom' : 'chip'} key={item.id}>{item.label}{item.custom && <small>기관 검토 전</small>}<button type="button" aria-label={`${item.label} 삭제`} onClick={() => removeIngredient(item.id)}>×</button></span>)}</div>}
                {attemptedCopy && ingredientInput.trim() ? <em>입력 중인 치료방법은 ‘추가’를 눌러 기록에 포함해 주세요.</em> : invalid('ingredients') && <em>실제로 시행한 치료방법을 하나 이상 추가해 주세요.</em>}
              </div>

              <div className={`field target-picker mechanism-picker ${invalid('mechanismLabel') ? 'invalid' : ''}`}>
                <FieldLabel title="작용기전 가설" help="왜 이 치료가 표적을 바꿀 것으로 보는지에 대한 가설" htmlFor="mechanism-search" />
                <div className="target-search-box">
                  <input
                    id="mechanism-search"
                    type="search"
                    value={mechanismSearch}
                    onChange={(event) => setMechanismSearch(event.target.value)}
                    maxLength={100}
                    placeholder="예: 운동학습, 근력, 피드백, 통증"
                    aria-label="작용기전 가설 검색"
                    disabled={record.safetyStatus === 'not_delivered'}
                  />
                  {mechanismSearch && <button type="button" onClick={() => setMechanismSearch('')} aria-label="작용기전 검색어 지우기">지우기</button>}
                </div>
                <div className="target-result-meta" aria-live="polite">
                  <span>{totalMechanismOptionCount}개 중 {filteredMechanismOptionCount}개 검색됨</span>
                  <span>한글·영문·분류·인과경로·설명 검색</span>
                </div>
                <select
                  id="mechanism"
                  value={mechanismSelectionValue}
                  onChange={(event) => handleMechanismSelection(event.target.value)}
                  aria-label="작용기전 가설 선택 목록"
                  aria-invalid={invalid('mechanismLabel') || undefined}
                  aria-describedby={invalid('mechanismLabel') ? 'mechanism-error' : undefined}
                  disabled={record.safetyStatus === 'not_delivered'}
                >
                  <option value="">작용기전을 선택하세요 · 기본 {rtss.mechanisms.length}개</option>
                  {selectedMechanismOutsideResults && selectedMechanism && (
                    <optgroup label="현재 선택 · 검색 결과와 별도">
                      <option value={selectedMechanism.id}>{selectedMechanism.name_kr} · {selectedMechanism.name_en}</option>
                    </optgroup>
                  )}
                  {selectedCustomMechanismOutsideResults && (
                    <optgroup label="현재 선택 · 기관 검토 전 사용자 항목">
                      <option value={`${CUSTOM_MECHANISM_PREFIX}${record.mechanismLabel}`}>{record.mechanismLabel}</option>
                    </optgroup>
                  )}
                  {filteredMechanisms.length > 0 && (
                    <optgroup label={`전체 작용기전 · ${filteredMechanisms.length}개`}>
                      {filteredMechanisms.map((mechanism) => (
                        <option key={mechanism.id} value={mechanism.id}>{mechanism.name_kr} · {mechanism.name_en}</option>
                      ))}
                    </optgroup>
                  )}
                  {filteredCustomMechanisms.length > 0 && (
                    <optgroup label="기관 검토 전 사용자 항목">
                      {filteredCustomMechanisms.map((label) => <option key={`custom-mechanism-${label}`} value={`${CUSTOM_MECHANISM_PREFIX}${label}`}>{label}</option>)}
                    </optgroup>
                  )}
                  {!filteredMechanismOptionCount && mechanismSearch && <option value="__no_mechanism_result__" disabled>검색 결과가 없습니다</option>}
                  <option value={CUSTOM_MECHANISM_VALUE}>목록에 없음 · 직접 입력</option>
                </select>
                {showCustomMechanismInput && (
                  <input
                    id="mechanism-custom"
                    value={record.mechanismLabel}
                    onChange={(event) => editCustomMechanism(event.target.value)}
                    maxLength={220}
                    placeholder="예상되는 변화 과정을 한 문장으로 입력"
                    aria-label="새 작용기전 가설 직접 입력"
                    aria-invalid={invalid('mechanismLabel') || undefined}
                    aria-describedby={invalid('mechanismLabel') ? 'mechanism-error' : undefined}
                    disabled={record.safetyStatus === 'not_delivered'}
                  />
                )}
                <div className="field-meta">
                  <CustomBadge show={Boolean(record.mechanismLabel && !record.mechanismId)} />
                  <span>기본 목록 {rtss.mechanisms.length}개{store.customCatalog.mechanisms.length ? ` · 사용자 항목 ${store.customCatalog.mechanisms.length}개` : ''}</span>
                </div>
                {invalid('mechanismLabel') && <em id="mechanism-error">예상되는 변화 과정을 한 문장으로 적어 주세요.</em>}
              </div>

              <div className="field-grid two-col">
                <div className={`field ${invalid('actualDose') ? 'invalid' : ''}`}>
                  <FieldLabel title="오늘 실제 제공한 양" help="반복·시간·강도·도움·휴식을 가능한 만큼 구체적으로" htmlFor="actual-dose" />
                  <textarea id="actual-dose" value={record.actualDose} onChange={(event) => updateDraft({ actualDose: event.target.value })} maxLength={500} rows={4} placeholder="예: 35회 · 좌석 48cm · 접촉 도움 · 10회마다 1분 휴식" disabled={record.safetyStatus === 'not_delivered'} />
                  {invalid('actualDose') && <em>계획량이 아니라 실제로 제공한 양을 적어 주세요.</em>}
                </div>
                <div className={`field ${invalid('response') ? 'invalid' : ''}`}>
                  <FieldLabel title="즉각 반응" help="수행 변화, 피로, 통증, 필요한 도움을 관찰 그대로" htmlFor="response" />
                  <textarea id="response" value={record.response} onChange={(event) => updateDraft({ response: event.target.value })} maxLength={500} rows={4} placeholder="예: 마지막 5회에서 속도 저하, 무릎 붕괴 없이 완료" disabled={record.safetyStatus === 'not_delivered'} />
                  {invalid('response') && <em>치료 직후 관찰한 반응을 적어 주세요.</em>}
                </div>
              </div>
            </section>

            <section className="step-card" id="step-3">
              <div className="step-heading">
                <span className="step-number">03</span>
                <div><h2>결과·다음 결정</h2><p>측정하지 않음과 실제 0점을 구분하고, 관찰을 다음 회기 결정으로 연결합니다.</p></div>
              </div>

              <fieldset className={`field choice-field ${invalid('measurementStatus') ? 'invalid' : ''}`} id="measurement-status" tabIndex={-1}>
                <legend>결과측정 상태 <span>오늘 측정 여부를 반드시 하나 선택</span></legend>
                <div className="choice-grid three">
                  {measurementOptions.map((option) => <label key={option.value} className={record.measurementStatus === option.value ? 'choice selected' : 'choice'}><input type="radio" name="measurement-status" value={option.value} checked={record.measurementStatus === option.value} onChange={() => handleMeasurementStatusChange(option.value)} /><span>{option.label}</span></label>)}
                </div>
                {invalid('measurementStatus') && <em>측정 완료, 검사하지 않음, 검사 중단 중 하나를 선택해 주세요.</em>}
              </fieldset>

              {record.measurementStatus === 'completed' && (
                <div className="measurement-panel">
                  {recommendedOutcomes.length > 0 && <div className="quick-picks"><span>이 표적에 연결된 평가</span>{recommendedOutcomes.map((outcome) => <button key={outcome!.id} type="button" onClick={() => chooseRecommendedOutcome(outcome!.id)}>{outcomeLabel(outcome!.id)}</button>)}</div>}
                  {renderOutcomePicker('outcome', '결과측정 도구', '전체 목록에서 검사 또는 추적 항목 선택')}
                  <div className="field-grid score-grid">
                    <div className={`field ${invalid('outcomeValue') ? 'invalid' : ''}`}>
                      <FieldLabel title="값" help="원점수" htmlFor="outcome-value" />
                      <input id="outcome-value" value={record.outcomeValue} onChange={(event) => updateDraft({ outcomeValue: event.target.value })} maxLength={60} placeholder="예: 18.4" />
                    </div>
                    <div className={`field ${invalid('outcomeUnit') ? 'invalid' : ''}`}>
                      <FieldLabel title="단위" help="점, 초, 미터 등" htmlFor="outcome-unit" />
                      <input id="outcome-unit" value={record.outcomeUnit} onChange={(event) => updateDraft({ outcomeUnit: event.target.value })} maxLength={60} placeholder="예: 초(s)" />
                    </div>
                    <div className={`field ${invalid('outcomeCondition') ? 'invalid' : ''}`}>
                      <FieldLabel title="측정 조건" help="도구·도움·지시·환경" htmlFor="outcome-condition" />
                      <input id="outcome-condition" value={record.outcomeCondition} onChange={(event) => updateDraft({ outcomeCondition: event.target.value })} maxLength={320} placeholder="예: 표준 의자 · 팔 사용 없음 · 접촉 도움" />
                    </div>
                  </div>

                  {selectedGuide && (
                    <details className="guide-card">
                      <summary><span>기준선 기록 도움말</span><small>{getGuideEvidenceLabel(selectedGuide)}</small></summary>
                      <div className="guide-body">
                        <div><strong>{selectedGuide.fullName}</strong><p>{selectedGuide.purpose}</p></div>
                        <dl><div><dt>점수 형식</dt><dd>{selectedGuide.scoreFormat}</dd></div><div><dt>좋아지는 방향</dt><dd>{selectedGuide.direction}</dd></div></dl>
                        <p className="guide-example"><b>기록 예시</b> · {selectedGuide.example}</p>
                        <ul>{selectedGuide.recording.map((item) => <li key={item}>{item}</li>)}</ul>
                        {selectedGuide.referenceValues.length > 0 && <strong className="guide-subtitle">해석 참고값</strong>}
                        {selectedGuide.referenceValues.map((item) => <p className="evidence-line" key={`${item.label}-${item.value}`}><b>{item.label}</b> · {item.value} <span>{item.population}</span></p>)}
                        {selectedGuide.changeValues.length > 0 && <strong className="guide-subtitle">변화량 참고값</strong>}
                        {selectedGuide.changeValues.map((item) => <p className="evidence-line" key={`change-${item.label}-${item.value}`}><b>{item.label}</b> · {item.value} <span>{item.population}</span></p>)}
                        {selectedGuide.cautions.map((caution) => <p className="guide-caution" key={caution}>{caution}</p>)}
                        <p className="guide-caution">참고값은 자동 판정이나 처방이 아닙니다. 대상군·시기·검사 절차가 원문과 맞는지 확인하세요.</p>
                        <div className="source-links">{selectedGuide.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label}</a>)}</div>
                      </div>
                    </details>
                  )}
                </div>
              )}

              {record.measurementStatus === 'stopped' && (
                <div className="measurement-panel stopped-panel">
                  {recommendedOutcomes.length > 0 && <div className="quick-picks"><span>이 표적에 연결된 평가</span>{recommendedOutcomes.map((outcome) => <button key={outcome!.id} type="button" onClick={() => chooseRecommendedOutcome(outcome!.id)}>{outcomeLabel(outcome!.id)}</button>)}</div>}
                  {renderOutcomePicker('stopped-outcome', '중단한 결과측정 도구', '전체 목록에서 중단한 검사를 선택')}
                </div>
              )}

              {(record.measurementStatus === 'not_tested' || record.measurementStatus === 'stopped') && (
                <div className={`field ${invalid('measurementReason') ? 'invalid' : ''}`}>
                  <FieldLabel title={record.measurementStatus === 'stopped' ? '검사 중단 이유' : '검사하지 않은 이유'} help="0점으로 바꾸지 않고 실제 상태를 기록" htmlFor="measurement-reason" />
                  <input id="measurement-reason" value={record.measurementReason} onChange={(event) => updateDraft({ measurementReason: event.target.value })} maxLength={320} placeholder="예: 회기 시간 제한으로 공식 검사를 시행하지 않음" />
                </div>
              )}

              <fieldset className={`field choice-field ${invalid('safetyStatus') ? 'invalid' : ''}`} id="safety-status" tabIndex={-1}>
                <legend>안전 상태 <span>관찰한 사실만 기록</span></legend>
                <div className="choice-grid four">
                  {safetyOptions.map((option) => <label key={option.value} className={record.safetyStatus === option.value ? 'choice selected' : 'choice'}><input type="radio" name="safety-status" value={option.value} checked={record.safetyStatus === option.value} onChange={() => handleSafetyStatusChange(option.value)} /><span>{option.label}</span></label>)}
                </div>
              </fieldset>

              {(record.safetyStatus === 'event' || record.safetyStatus === 'treatment_stopped' || record.safetyStatus === 'not_delivered') && (
                <div className={`field ${invalid('safetyDetail') ? 'invalid' : ''}`}>
                  <FieldLabel
                    title={record.safetyStatus === 'not_delivered' ? '치료 미실시 상세' : record.safetyStatus === 'treatment_stopped' ? '치료 중단 상세' : '이상반응 상세'}
                    help={record.safetyStatus === 'not_delivered' ? '치료하지 않은 이유와 필요한 인계 내용을 구체적으로' : '중단 또는 증상의 시점, 조치와 인계 내용을 구체적으로'}
                    htmlFor="safety-detail"
                  />
                  <textarea id="safety-detail" value={record.safetyDetail} onChange={(event) => updateDraft({ safetyDetail: event.target.value })} maxLength={600} rows={3} placeholder="관찰 내용과 조치를 작성" />
                </div>
              )}

              <fieldset className={`field choice-field ${invalid('nextDecision') ? 'invalid' : ''}`} id="next-decision" tabIndex={-1}>
                <legend>다음 결정 <span>다음 회기에서 무엇을 할지 선택</span></legend>
                <div className="choice-grid four">
                  {decisionOptions.map((option) => <label key={option.value} className={record.nextDecision === option.value ? 'choice selected' : 'choice'}><input type="radio" name="next-decision" value={option.value} checked={record.nextDecision === option.value} onChange={() => updateDraft({ nextDecision: option.value })} /><span><b>{option.label}</b><small>{option.hint}</small></span></label>)}
                </div>
              </fieldset>

              <div className={`field ${invalid('decisionReason') ? 'invalid' : ''}`}>
                <FieldLabel title="결정 근거" help="오늘의 반응·측정값과 다음 결정을 연결" htmlFor="decision-reason" />
                <textarea id="decision-reason" value={record.decisionReason} onChange={(event) => updateDraft({ decisionReason: event.target.value })} maxLength={500} rows={3} placeholder="예: 독립 수행이 80% 이상 유지되어 다음 회기 난이도 진행" />
              </div>

              <details className="optional-details">
                <summary>생활·환경 연결과 다음 회기 세부계획 <span>선택</span></summary>
                <div className="optional-grid">
                  <div className="field">
                    <FieldLabel title="국제 기능·장애·건강 분류 연결" help="코드를 아는 경우에만 입력" htmlFor="icf-codes" />
                    <input id="icf-codes" value={record.icfCodes} onChange={(event) => updateDraft({ icfCodes: event.target.value })} maxLength={160} placeholder="예: d4104, b7300, e1201" />
                  </div>
                  <div className="field">
                    <FieldLabel title="다음 회기 세부계획" help="구체적인 진행·회귀 기준이 있으면 작성" htmlFor="next-plan" />
                    <textarea id="next-plan" value={record.nextPlan} onChange={(event) => updateDraft({ nextPlan: event.target.value })} maxLength={500} rows={3} placeholder="예: 성공률 80% 이상이면 좌석을 3cm 낮춤" />
                  </div>
                </div>
              </details>
            </section>
          </div>

          <aside className="preview-column" aria-label="차트 문장 미리보기">
            <div className="preview-card">
              <div className="preview-heading">
                <div><span className="eyebrow">실시간 미리보기</span><h2>차트 문장</h2></div>
                <div className="completion"><strong>{completeness}%</strong><span>작성 완료</span></div>
              </div>
              <div className="progress-track"><span style={{ width: `${completeness}%` }} /></div>

              {missing.length > 0 ? (
                <div className="missing-callout"><strong>복사 전 확인할 {missing.length}개 항목</strong><p>{missing.slice(0, 3).map((item) => item.label).join(' · ')}{missing.length > 3 ? ' 외' : ''}</p></div>
              ) : (
                <div className="ready-callout"><strong>복사할 준비가 되었습니다.</strong><span>복사하면 최근 기록에 자동 보관됩니다.</span></div>
              )}

              <button className="button primary copy-button" type="button" onClick={copyCurrentNote} disabled={copying}>{copying ? '복사 중…' : '차트 문장 복사'}</button>
              <pre tabIndex={0}>{note}</pre>
              <p className="preview-foot">빈 항목을 정상 소견으로 채우지 않습니다. 새로 입력한 용어는 이 기기의 추천 목록에 ‘기관 검토 전’ 항목으로 저장됩니다.</p>
            </div>

            <details className="history-card">
              <summary><span>최근 복사 기록</span><b>{store.snapshots.length}</b></summary>
              <div className="history-list">
                {store.snapshots.length === 0 && <p>아직 보관된 기록이 없습니다.</p>}
                {store.snapshots.map((snapshot) => (
                  <article key={snapshot.id}>
                    <div><strong>{snapshot.caseCode}</strong><span>{snapshot.recordDate} · {new Date(snapshot.copiedAt).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div>
                    <p>{snapshot.note.split('\n').slice(2, 4).join(' · ')}</p>
                    <button type="button" onClick={() => void copySavedNote(snapshot.note)}>다시 복사</button>
                  </article>
                ))}
              </div>
            </details>
          </aside>
        </div>
      </main>

      <div className="mobile-copy-bar">
        <span>{missing.length ? `복사 전 ${missing.length}개 확인` : '차트 문장 준비 완료'}</span>
        <button type="button" onClick={copyCurrentNote} disabled={copying}>{copying ? '복사 중…' : missing.length ? '확인하기' : '문장 복사'}</button>
      </div>
      <div className={toast ? 'toast show' : 'toast'} role="status" aria-live="polite">{toast}</div>
    </>
  );
}
