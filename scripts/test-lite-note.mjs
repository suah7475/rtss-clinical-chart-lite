import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  appendUnique,
  completionPercent,
  createEmptyRecord,
  createInitialStore,
  generateLiteNote,
  isLiteStore,
  LITE_STORAGE_KEY,
  missingFields,
} from '../app/lib/lite-core.ts';
import { domainTargetResetPatch, filterTargetsByKeywords, repairStoredTargetSelection } from '../app/lib/target-picker.ts';

const seed = JSON.parse(readFileSync(new URL('../app/data/rtss-seed.json', import.meta.url), 'utf8'));

const completeRecord = {
  ...createEmptyRecord('2026-09-16'),
  caseCode: 'TEST-001',
  aim: '가족과 식탁에서 식사하기',
  domainId: 'D03',
  targetId: 'T040',
  targetLabel: '앉기→서기 전환',
  targetDirection: '독립성 증가',
  ingredients: [{ id: 'I027', label: '앉기-서기 반복 연습', custom: false }],
  mechanismId: 'M301',
  mechanismLabel: '반복 연습에 의한 암묵적 기술 습득',
  actualDose: '35회 · 접촉 도움',
  response: '무릎 붕괴 없이 완료',
  measurementStatus: 'completed',
  outcomeId: 'O06',
  outcomeLabel: '5회 앉았다 일어서기 검사',
  outcomeValue: '18.4',
  outcomeUnit: '초(s)',
  outcomeCondition: '표준 의자 · 팔 사용 없음',
  safetyStatus: 'none',
  nextDecision: 'progress',
  decisionReason: '독립 수행 80% 이상',
};

assert.equal(LITE_STORAGE_KEY, 'rtss-clinical-chart-lite-v1', '기존 앱과 분리된 저장 키를 사용한다');
assert.ok(missingFields(createEmptyRecord('2026-09-16')).length >= 10, '빈 기록은 필수항목 누락을 감지한다');
assert.deepEqual(missingFields(completeRecord), [], '완성된 회기 기록은 복사 가능하다');
assert.equal(completionPercent(completeRecord), 100, '완성된 기록은 100%로 표시한다');

const note = generateLiteNote(completeRecord);
assert.match(note, /환자 생활목표: 가족과 식탁에서 식사하기/, '생활목표를 기록문에 포함한다');
assert.match(note, /실제 치료방법: 앉기-서기 반복 연습/, '실제 치료방법을 기록문에 포함한다');
assert.match(note, /결과측정: 5회 앉았다 일어서기 검사 18.4 초\(s\)/, '측정값과 단위를 함께 기록한다');
assert.match(note, /안전: 이상반응 없음/, '선택한 안전 상태만 기록한다');
assert.doesNotMatch(note, /undefined|null/, '비어 있는 값을 임의 문자열로 만들지 않는다');

const notTested = {
  ...completeRecord,
  measurementStatus: 'not_tested',
  outcomeId: '',
  outcomeLabel: '',
  outcomeValue: '',
  outcomeUnit: '',
  outcomeCondition: '',
  measurementReason: '회기 시간 제한',
};
assert.deepEqual(missingFields(notTested), [], '검사하지 않은 회기도 이유가 있으면 기록할 수 있다');
assert.match(generateLiteNote(notTested), /검사하지 않음 · 이유: 회기 시간 제한/, '검사하지 않음을 0점과 구분한다');
assert.doesNotMatch(generateLiteNote(notTested), / 0/, '미측정을 0점으로 바꾸지 않는다');

const safetyEvent = { ...completeRecord, safetyStatus: 'event', safetyDetail: '' };
assert.ok(missingFields(safetyEvent).some((item) => item.key === 'safetyDetail'), '이상반응이 있으면 상세를 요구한다');

const notDelivered = {
  ...completeRecord,
  ingredients: [],
  mechanismId: '',
  mechanismLabel: '',
  actualDose: '',
  response: '',
  measurementStatus: 'not_tested',
  outcomeId: '',
  outcomeLabel: '',
  outcomeValue: '',
  outcomeUnit: '',
  outcomeCondition: '',
  measurementReason: '안전 문제로 검사하지 않음',
  safetyStatus: 'not_delivered',
  safetyDetail: '기립 전 어지럼을 호소해 활력징후 확인 후 간호사에게 인계함',
  nextDecision: 'hold',
  decisionReason: '안전 상태를 다시 확인할 때까지 보류',
};
assert.deepEqual(missingFields(notDelivered), [], '치료 미실시 회기는 허위 치료내용 없이 기록할 수 있다');
assert.doesNotMatch(generateLiteNote(notDelivered), /실제 치료방법|실제 제공량|즉각 반응/, '미실시 회기에 비어 있는 치료내용을 만들지 않는다');

const stoppedWithoutTool = { ...completeRecord, measurementStatus: 'stopped', outcomeLabel: '', measurementReason: '피로 호소' };
assert.ok(missingFields(stoppedWithoutTool).some((item) => item.key === 'outcomeLabel'), '검사 중단 시 중단한 도구명을 요구한다');
const stoppedWithTool = { ...stoppedWithoutTool, outcomeLabel: '6분 보행 검사' };
assert.match(generateLiteNote(stoppedWithTool), /6분 보행 검사 · 검사 중단 · 이유: 피로 호소/, '검사 중단 문장에 도구명과 이유를 함께 기록한다');

assert.deepEqual(appendUnique(['기존 항목'], '기존 항목'), ['기존 항목'], '사용자 항목 중복을 만들지 않는다');
assert.deepEqual(appendUnique(['기존 항목'], '새 항목'), ['기존 항목', '새 항목'], '새 사용자 항목을 재사용 목록에 추가한다');

const initial = createInitialStore('2026-09-16');
assert.equal(isLiteStore(initial), true, '정상 Lite 저장자료를 인식한다');
assert.equal(isLiteStore({ schemaVersion: 2 }), false, '알 수 없는 저장 형식을 거부한다');
assert.equal(isLiteStore({ schemaVersion: 1, draft: { caseCode: '부분자료', recordDate: '2026-09-16', aim: '', ingredients: [], targetLabel: '', mechanismLabel: '' }, customCatalog: {}, snapshots: [], updatedAt: '' }), false, '불완전한 저장자료를 정상자료로 열지 않는다');

const expectedTargetCounts = [14, 6, 9, 8, 6, 12, 7, 1, 5, 2, 10, 5];
assert.deepEqual(
  seed.domains.map((domain) => seed.targets.filter((target) => target.domain === domain.id).length),
  expectedTargetCounts,
  '모든 임상영역에서 직접 치료표적 선택 목록을 제공한다',
);

const walkingTargets = seed.targets.filter((target) => target.domain === 'D01');
const balanceTargets = seed.targets.filter((target) => target.domain === 'D02');
const outcomeNames = new Map(seed.outcomes.map((outcome) => [outcome.id, `${outcome.name_kr} ${outcome.name_en}`]));
const outcomeNameForId = (id) => outcomeNames.get(id) ?? '';
assert.deepEqual(filterTargetsByKeywords(walkingTargets, '발끌림', outcomeNameForId).map((target) => target.id), ['T031'], '한글 관련어로 치료표적을 찾는다');
assert.deepEqual(filterTargetsByKeywords(walkingTargets, 'dual', outcomeNameForId).map((target) => target.id), ['T036'], '영문 관련어로 치료표적을 찾는다');
assert.ok(filterTargetsByKeywords(walkingTargets, '10m', outcomeNameForId).some((target) => target.id === 'T028'), '연결된 평가도구 이름으로 치료표적을 찾는다');
assert.ok(filterTargetsByKeywords(walkingTargets, 'b770 속도', outcomeNameForId).some((target) => target.id === 'T028'), 'ICF 코드와 변화방향을 함께 검색한다');
assert.ok(filterTargetsByKeywords(walkingTargets, 'FGA', outcomeNameForId).some((target) => target.id === 'T034'), 'FGA 평가도구 약어로 치료표적을 찾는다');
assert.ok(filterTargetsByKeywords(walkingTargets, 'TUG', outcomeNameForId).some((target) => target.id === 'T038'), 'TUG 평가도구 약어로 치료표적을 찾는다');
assert.ok(filterTargetsByKeywords(walkingTargets, 'FAC', outcomeNameForId).some((target) => target.id === 'T034'), 'FAC 평가도구 약어로 치료표적을 찾는다');
assert.ok(filterTargetsByKeywords(balanceTargets, 'BBS', outcomeNameForId).some((target) => target.id === 'T022'), 'BBS 평가도구 약어로 치료표적을 찾는다');

assert.deepEqual(
  domainTargetResetPatch('D01', 'd4104', 'd4104'),
  { domainId: 'D01', targetId: '', targetLabel: '', targetDirection: '', icfCodes: '' },
  '임상영역 변경 시 이전 표적과 자동 입력 ICF를 초기화한다',
);
assert.equal(domainTargetResetPatch('D01', 'd999', 'd4104').icfCodes, 'd999', '치료사가 직접 입력한 ICF는 영역 변경 시 보존한다');

const domainIds = seed.domains.map((domain) => domain.id);
const canonicalTarget = seed.targets.find((target) => target.id === 'T040');
const repairedLabels = repairStoredTargetSelection(
  { domainId: canonicalTarget.domain, targetId: canonicalTarget.id, targetLabel: '이전 표적명', targetDirection: '이전 방향', icfCodes: canonicalTarget.icf },
  seed.targets,
  domainIds,
);
assert.deepEqual(
  [repairedLabels.targetLabel, repairedLabels.targetDirection],
  [canonicalTarget.what_kr, canonicalTarget.direction],
  '저장된 표적 ID에 맞춰 표적명과 변화방향을 최신 자료로 정규화한다',
);
assert.equal(
  repairStoredTargetSelection({ ...repairedLabels, domainId: 'D99' }, seed.targets, domainIds).domainId,
  canonicalTarget.domain,
  '유효하지 않은 임상영역은 유효한 표적의 영역으로 복구한다',
);
assert.equal(
  repairStoredTargetSelection({ ...repairedLabels, targetId: 'T999', targetLabel: '손상값' }, seed.targets, domainIds).targetId,
  '',
  '존재하지 않는 표적 ID는 선택 상태에서 제거한다',
);
assert.equal(
  repairStoredTargetSelection({ ...repairedLabels, domainId: 'D99', targetId: '', targetLabel: '' }, seed.targets, domainIds).domainId,
  'D01',
  '임상영역과 표적이 모두 유효하지 않으면 기본 영역으로 복구한다',
);

console.log('RTSS Lite note tests passed: 37 checks');
