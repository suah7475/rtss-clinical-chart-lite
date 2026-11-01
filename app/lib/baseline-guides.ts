import type { RecoveryPhase } from '@/app/lib/lite-types';

export type GuideValue = {
  label: string;
  value: string;
  population: string;
  note?: string;
  appliesTo?: string[];
  appliesToDominance?: string[];
  appliesToProtocol?: string[];
  phases?: RecoveryPhase[];
  minOnsetDays?: number;
  maxOnsetDays?: number;
};

export type GuideSource = {
  label: string;
  url: string;
};

export type BaselineGuide = {
  id: string;
  plainName: string;
  fullName: string;
  purpose: string;
  scoreFormat: string;
  defaultUnit: string;
  direction: string;
  example: string;
  recording: string[];
  referenceValues: GuideValue[];
  changeValues: GuideValue[];
  cautions: string[];
  sources: GuideSource[];
};

export const generalBaselineSources: GuideSource[] = [
  {
    label: '미국심장협회·미국뇌졸중협회 2026 뇌졸중 재활 지침',
    url: 'https://professional.heart.org/en/guidelines-statements/2026-guideline-for-adult-stroke-rehabilitation-and-recovery-a-guideline-fromstr0000000000000536',
  },
  {
    label: '미국 신경계 물리치료학회 핵심 결과측정 지침',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6023606/',
  },
  {
    label: '캐나다 뇌졸중 모범진료 권고: 초기 재활평가',
    url: 'https://www.strokebestpractices.ca/recommendations/stroke-rehabilitation-planning/1-initial-stroke-rehabilitation-screening-and-assessment',
  },
  {
    label: '세계보건기구 국제 기능·장애·건강 분류',
    url: 'https://www.who.int/standards/classifications/international-classification-of-functioning-disability-and-health',
  },
  {
    label: '뇌졸중 회복시기 표준용어 국제 합의',
    url: 'https://doi.org/10.1177/1747493017711816',
  },
];

export const strokeRecoveryPhases = [
  { id: 'hyperacute', range: '0–24시간', label: '초급성기' },
  { id: 'acute', range: '1–7일', label: '급성기' },
  { id: 'early_subacute', range: '7일–3개월', label: '초기 아급성기' },
  { id: 'late_subacute', range: '3–6개월', label: '후기 아급성기' },
  { id: 'chronic', range: '6개월 초과', label: '만성기' },
] satisfies Array<{ id: Exclude<RecoveryPhase, ''>; range: string; label: string }>;

export const baselinePrinciples = [
  {
    number: '01',
    title: '목표와 연결된 도구를 고릅니다',
    text: '몸의 기능만 보지 말고, 환자의 생활목표에 맞는 활동·참여와 환경도 함께 확인합니다.',
  },
  {
    number: '02',
    title: '원점수와 조건을 함께 남깁니다',
    text: '날짜, 값, 단위 또는 총점, 속도 지시, 보조도구·보조기, 신체적 도움, 중단 사유를 기록합니다.',
  },
  {
    number: '03',
    title: '공식 절차와 안전을 먼저 지킵니다',
    text: '공식 검사절차와 환자 안전을 우선합니다. 가능한 범위에서 같은 방법으로 재평가하고, 달라진 도구·버전·장비·환경·도움은 모두 씁니다.',
  },
  {
    number: '04',
    title: '숫자는 대상군을 맞춰 해석합니다',
    text: '측정오차를 넘는 변화와 환자가 체감할 만한 변화는 서로 다릅니다. 정확한 발병 후 기간, 초기 중증도와 기준점수가 연구 대상과 맞는 값만 참고합니다.',
  },
];

export const baselineGlossary = [
  {
    term: '치료 시작 전 기준값(기준선)',
    abbreviation: 'Baseline',
    meaning: '치료 전 환자의 출발점입니다. 이후 값과 비교하려면 측정 조건까지 같아야 합니다.',
  },
  {
    term: '발병 후 회복시기',
    abbreviation: '뇌졸중 회복·재활 국제 합의(Stroke Recovery and Rehabilitation Roundtable)',
    meaning: '발병 후 실제 시간으로 나눈 넓은 연구용 구분입니다. 급성기 병동·입원재활 같은 진료장소 이름과 다르며, 같은 시기라도 각 연구의 정확한 기간을 다시 확인해야 합니다.',
  },
  {
    term: '측정오차를 넘는 최소 변화',
    abbreviation: 'Minimal Detectable Change, MDC',
    meaning: '우연한 측정오차만으로 보기 어려운 최소 변화입니다. 좋아졌다는 임상 의미를 자동으로 뜻하지는 않습니다.',
  },
  {
    term: '환자에게 의미 있는 최소 변화',
    abbreviation: 'Minimal Clinically Important Difference, MCID',
    meaning: '환자보고, 치료사 판단 또는 기능 변화처럼 연구에서 정한 외부 기준과 연결된 변화 추정치입니다. 해당 개인에게 중요한 변화가 보장된다는 뜻은 아닙니다.',
  },
  {
    term: '분류 참고값',
    abbreviation: 'Cut point',
    meaning: '연구에서 집단을 구분하기 위해 제시한 값입니다. 단독으로 진단·낙상 예측·치료 결정을 하면 안 됩니다.',
  },
  {
    term: '실제 환경에서의 수행',
    abbreviation: '국제 기능·장애·건강 분류(ICF)의 수행(performance)',
    meaning: '병동·가정처럼 현재 생활환경에서 실제로 하는 정도입니다.',
  },
  {
    term: '표준 환경에서의 능력',
    abbreviation: '국제 기능·장애·건강 분류(ICF)의 능력(capacity)',
    meaning: '환경 영향을 줄이거나 표준화했을 때 할 수 있는 정도입니다.',
  },
];

const anptCore: GuideSource = {
  label: '미국 신경계 물리치료학회 핵심 결과측정 빠른 안내',
  url: 'https://www.neuropt.org/docs/default-source/cpgs/core-outcome-measures/adults-with-neurological-conditions-quick-reference_final.pdf?sfvrsn=c4585243_2',
};

const rehabMeasures = (slug: string, label: string): GuideSource => ({
  label,
  url: `https://www.sralab.org/rehabilitation-measures/${slug}`,
});

const commonRecording = [
  '측정 날짜와 뇌졸중 후 경과시기를 남깁니다.',
  '보조도구·보조기, 신체적 도움, 구두·시각 단서와 안전감독 수준을 남깁니다.',
  '검사 자체를 하지 않았거나 공식 채점과 무관하게 중단했다면 임의로 0점이나 정상값을 넣지 않습니다. 다만 공식 채점규칙이 수행 불가를 0점으로 정한 도구에서는 “도구 규정상 유효 0점”으로 기록하고 도움 수준과 사유를 함께 남깁니다.',
];

export const outcomeDetailPrompts: Record<string, string> = {
  O01: '속도 지시(예: 평소 보행속도)',
  O02: '결과항목(예: 6분 총 보행거리)',
  O05: '설문 판(예: 16문항 한국어판)',
  O07: '속도 지시(예: 표준 평소속도)',
  O09: '검사방법·근육·쪽(예: 휴대용 근력계 · 오른쪽 무릎폄)',
  O10: '관절·쪽·능동/수동(예: 오른쪽 발목 · 능동 발등굽힘)',
  O11: '근육군·관절·쪽(예: 오른쪽 발목 발바닥굽힘근)',
  O12: '검사영역·쪽(예: 상지 운동영역 · 오른쪽 마비측)',
  O13: '검사한 쪽(예: 오른쪽 마비측)',
  O14: '검사한 손(예: 오른손 · 마비측)',
  O15: '하위영역·판(예: 움직임의 질 · 14문항판)',
  O16: '검사한 손(예: 오른손 · 마비측)',
  O17: '도구 판(예: Verheyden판)',
  O18: '도구 판(예: 14항목 0–28점판)',
  O19: '보행 변수(예: 보폭 또는 입각기 비율)',
  O20: '측정 지표(예: 심박수 또는 보그 운동자각도)',
  O21: '감각검사·부위·쪽(예: 관절위치감각 · 오른쪽 엄지)',
  O22: '검사명(예: 별 지우기 검사)',
  O23: '통증 부위·상황(예: 오른쪽 어깨 · 움직임 시)',
  O24: '도구·판·영역(예: 수정 바델지수 Shah판 · 총점)',
  O25: '점수 형식(예: 개별 목표 · 5단계 원등급)',
  O28: '도구 판(예: 13문항 원판 · 총점)',
  O29: '주 결과변수(예: 보행속도 이중과제 비용)',
  O30: '하위결과(예: 15개 시간과제 중앙값)',
  O31: '기관 과제명과 결과변수',
  O32: '측정방법(예: 8자형 손 둘레)',
  O33: '관찰 부위·쪽·과제',
  O34: '검사한 손과 결과항목(예: 오른손 · 총 수행시간)',
  O35: '기관 과제명과 결과변수',
  O36: '프로그램·기록방법(예: 원격 상지 과제 앱 · 앱 기록)',
  O37: '측정기기·목표대(예: 가슴 심박계 · 60–80% 여유심박)',
  O38: '영역·판(예: 이동영역 · 3.0판)',
  O39: '결과항목(예: 전체 15개 항목 총점)',
};

/** 한쪽 팔·손·다리 또는 한쪽 통증처럼 측정 쪽이 결과의 일부인 도구입니다. */
export const outcomesRequiringLaterality = new Set([
  'O09', 'O10', 'O11', 'O12', 'O13', 'O14', 'O15', 'O16',
  'O21', 'O30', 'O31', 'O32', 'O33', 'O34', 'O35',
]);

/** 현재 연결된 변화값이 검사한 쪽의 우세손 여부에 따라 달라지는 도구입니다. */
export const outcomesRequiringDominance = new Set(['O13', 'O15', 'O16']);

export const outcomeProtocolSuggestions: Record<string, string[]> = {
  O07: ['원 연구 핵심 절차 · 좌면 높이 44 cm·팔걸이 높이 64 cm 의자 · 3 m · 평소속도 · 연습 1회 후 1분 간격 2회 평균'],
};

export const outcomeDetailOptions: Record<string, string[]> = {
  O15: ['사용량 · 14문항판', '움직임의 질 · 14문항판', '사용량 · 28문항판', '움직임의 질 · 28문항판'],
  O24: ['수정 바델지수 Shah판 · 총점', '기능독립측정 · 총점', '기능독립측정 · 운동영역', '기능독립측정 · 인지영역'],
  O25: ['개별 목표 · 5단계 원등급', '여러 목표 합산 · T점수'],
  O28: ['13문항 원판 · 총점', '13문항 4점판 · 총점'],
  O38: ['근력영역 · 3.0판', '손기능영역 · 3.0판', '일상생활영역 · 3.0판', '이동영역 · 3.0판', '의사소통영역 · 3.0판', '감정영역 · 3.0판', '기억·사고영역 · 3.0판', '사회참여영역 · 3.0판', '회복정도 문항 · 3.0판'],
};

export function getGuideEvidenceLabel(guide: BaselineGuide) {
  if (!guide.sources.length) return '기관 프로토콜 필요';
  if (guide.sources.some((source) => /공식|표준화된 검사 절차/.test(source.label))) return '공식 절차·문헌 근거';
  return '문헌상 참고 근거';
}

export const baselineGuides: Record<string, BaselineGuide> = {
  O01: {
    id: 'O01',
    plainName: '10미터 보행속도 검사',
    fullName: '10미터 보행 검사(10-Meter Walk Test, 10MWT)',
    purpose: '짧은 거리에서 평소 속도 또는 가능한 빠른 속도로 걷는 능력을 봅니다.',
    scoreFormat: '기관이 정한 한 가지 표준 절차만 사용합니다. 교육용 기본 예시는 미국 신경계 물리치료학회 절차로, 10미터 보행로의 가운데 6미터를 재고 평소 속도와 가능한 빠른 속도에서 각각 2회 평균을 냅니다. 기관이 뇌졸중 국제 합의 절차를 채택했다면 14미터 보행로의 가운데 10미터를 평소 속도로 3회 재되, 두 절차를 섞지 않습니다.',
    defaultUnit: '미터/초(m/s)',
    direction: '값이 클수록 보행속도가 빠릅니다.',
    example: '0.52 m/s · 평소 속도 2회 평균 · 4점 지팡이 · 발목보조기 · 접촉 도움',
    recording: [
      '평소 속도인지 가능한 빠른 속도인지 구분합니다.',
      '각 시행의 시간과 평균 속도, 실제로 시간을 잰 거리와 전체 보행로 길이를 남깁니다.',
      ...commonRecording,
    ],
    referenceValues: [
      { label: '가정 안 보행 범위', value: '0.4 m/s 미만', population: '뇌졸중 성인 연구의 보행 분류', note: '생활환경과 도움 수준을 함께 봅니다.' },
      { label: '제한된 지역사회 보행 범위', value: '0.4–0.8 m/s', population: '뇌졸중 성인 연구의 보행 분류' },
      { label: '지역사회 보행 범위', value: '0.8 m/s 초과', population: '뇌졸중 성인 연구의 보행 분류' },
    ],
    changeValues: [
      { label: '측정오차를 넘는 최소 변화', value: '0.11 m/s', population: '급성기 뇌졸중', phases: ['acute'] },
      { label: '측정오차를 넘는 최소 변화', value: '평소 속도 0.18 m/s · 빠른 속도 0.13 m/s', population: '발병 6개월 이후 만성기 뇌졸중', phases: ['chronic'] },
      { label: '의미 있는 최소 변화 추정', value: '0.16 m/s', population: '아급성기 뇌졸중', phases: ['early_subacute', 'late_subacute'] },
    ],
    cautions: [
      '속도 구간은 진단이나 독립보행 허가 기준이 아닙니다. 균형, 지구력, 환경, 실제 도움 수준을 함께 판단합니다.',
      '가운데 6미터와 가운데 10미터처럼 서로 다른 절차, 또는 서로 다른 속도 지시로 잰 값은 직접 비교하지 않습니다.',
      '공식 포켓 가이드는 보행 불가, 전적 도움, 다리를 앞으로 옮기거나 몸을 전진시키는 도움이 필요하면 0 m/s를 유효 점수로 기록하도록 합니다. 이때 “도구 규정상 유효 0점”을 선택하고 실제 도움 수준을 씁니다.',
      '안전 문제·환자 거부 등으로 검사 자체를 하지 않은 경우에는 0 m/s로 바꾸지 말고 해당 검사 상태와 이유를 기록합니다.',
    ],
    sources: [
      { label: '10미터 보행 검사 공식 포켓 가이드(2026 개정)', url: 'https://neuropt-website-documents.s3.amazonaws.com/docs/default-source/cpgs/core-outcome-measures/10mwt-pocket-guide-rev-0226.pdf?sfvrsn=90145143_1' },
      { label: '보행속도와 가정·지역사회 보행 분류 원 연구', url: 'https://pubmed.ncbi.nlm.nih.gov/7762050/' },
      { label: '2024 뇌졸중 보행 결과측정 국제 합의', url: 'https://pubmed.ncbi.nlm.nih.gov/37824730/' },
    ],
  },
  O02: {
    id: 'O02',
    plainName: '6분 걷기 검사',
    fullName: '6분 보행 검사(6-Minute Walk Test, 6MWT)',
    purpose: '6분 동안 실제로 걸을 수 있는 거리를 통해 보행 지구력과 이동 능력을 봅니다.',
    scoreFormat: '표준화된 평탄한 보행로에서 6분 동안 걸은 총거리를 기록합니다. 서서 쉬는 동안에는 시간이 계속됩니다. 앉아서 쉬어야 하면 검사를 종료하고 그때까지의 거리를 검사값으로 기록합니다.',
    defaultUnit: '미터(m)',
    direction: '거리가 길수록 보행 지구력이 좋습니다.',
    example: '214 m/6분 · 12 m 보행로 · 앞바퀴 보행기 · 가까운 감독 · 1회 서서 휴식 20초',
    recording: [
      '보행로 길이와 회전 지점, 표준 격려 문구 사용 여부를 남깁니다.',
      '휴식 횟수·형태·시간, 조기 중단 사유를 남깁니다.',
      ...commonRecording,
    ],
    referenceValues: [],
    changeValues: [
      { label: '측정오차를 넘는 최소 변화', value: '36.6 m 또는 약 13%', population: '만성기 경도–중등도 보행 가능 뇌졸중 표본', phases: ['chronic'], minOnsetDays: 183 },
      { label: '측정오차를 넘는 최소 변화', value: '61 m', population: '발병 30–150일 아급성기 뇌졸중 표본', phases: ['early_subacute', 'late_subacute'], minOnsetDays: 30, maxOnsetDays: 150 },
      { label: '의미 있는 최소 변화 추정', value: '약 34 m', population: '6개월 이후 만성기 뇌졸중 표본', phases: ['chronic'], minOnsetDays: 183 },
      { label: '의미 있는 최소 변화 추정', value: '44 m', population: '발병 2–6개월, 기준 보행속도 0.4 m/s 미만이며 3 m를 최대 도움(maximum assistance)보다 적은 도움으로 걸을 수 있었던 표본', note: '수정 랭킨 척도(Modified Rankin Scale) 변화를 바깥 기준으로 삼은 추정이며 구분 정확도는 중간 정도(곡선아래면적 0.72)였습니다.', phases: ['early_subacute', 'late_subacute'], minOnsetDays: 61, maxOnsetDays: 183 },
    ],
    cautions: [
      '보행로 길이, 회전 횟수, 격려 방식이 결과에 영향을 줍니다. 다른 방법으로 잰 값은 직접 비교하지 않습니다.',
      '심혈관·호흡기 안전기준과 기관 중단기준을 우선합니다. 참고 변화값은 모든 환자에게 공통인 처방 기준이 아닙니다.',
      '앉아서 쉬어 검사가 끝났지만 그때까지 거리를 공식 점수로 기록하는 경우에는 “도구 규정에 따른 조기종료·유효 점수”를 선택합니다. 안전 문제·환자 거부 등 공식 점수가 아닌 종료와 구분합니다.',
      '공식 포켓 가이드는 보행 불가, 전적 도움, 다리를 앞으로 옮기거나 몸을 전진시키는 도움이 필요하면 0 m를 유효 점수로 기록하도록 합니다. 이때 “도구 규정상 유효 0점”을 선택하고 실제 도움 수준을 씁니다.',
      '안전 문제·환자 거부 등으로 검사 자체를 하지 않은 경우에는 0 m로 바꾸지 말고 해당 검사 상태와 이유를 기록합니다.',
    ],
    sources: [
      { label: '6분 보행 검사 공식 포켓 가이드', url: 'https://www.neuropt.org/docs/default-source/cpgs/core-outcome-measures/6mwt-pocket-guide-proof9.pdf?sfvrsn=9ee25043_0' },
      { label: '뇌졸중 6분 보행 검사의 의미 있는 변화 원 연구', url: 'https://pubmed.ncbi.nlm.nih.gov/30138230/' },
    ],
  },
  O03: {
    id: 'O03',
    plainName: '버그 균형 검사',
    fullName: '버그 균형 척도(Berg Balance Scale, BBS)',
    purpose: '앉기, 일어서기, 손 뻗기, 방향 바꾸기처럼 일상 동작에서 정적·동적 균형을 봅니다.',
    scoreFormat: '14개 항목을 각 0–4점으로 채점하여 0–56점으로 합산합니다.',
    defaultUnit: '/56점',
    direction: '점수가 높을수록 검사 과제를 더 독립적으로 수행합니다.',
    example: '28/56점 · 보조도구 없음 · 가까운 감독 · 신체적 도움 없음',
    recording: [
      '총점과 함께 신체적 도움, 보조도구, 완료하지 못한 항목을 남깁니다.',
      '같은 지시·장비·신발·안전조건으로 재평가합니다.',
      ...commonRecording,
    ],
    referenceValues: [],
    changeValues: [
      { label: '측정오차를 넘는 최소 변화', value: '약 6점(90% 신뢰)', population: '입원 뇌졸중 표본' },
      { label: '측정오차를 넘는 최소 변화', value: '약 5점', population: '만성기 뇌졸중 표본', phases: ['chronic'] },
      { label: '의미 있는 최소 변화 추정', value: '약 5점', population: '아급성기 입원 뇌졸중, 특히 보행에 도움이 필요한 표본', phases: ['early_subacute', 'late_subacute'] },
    ],
    cautions: [
      '45점 같은 한 개의 경계값만으로 개인의 낙상위험을 판단하지 않습니다.',
      '고기능 환자에서는 천장효과가 있을 수 있으므로 보행 중 균형 도구를 함께 고려합니다.',
    ],
    sources: [
      rehabMeasures('berg-balance-scale', '버그 균형 척도 측정 특성 정리'),
      { label: '뇌졸중 버그 균형 척도의 변화 해석 원 연구', url: 'https://pubmed.ncbi.nlm.nih.gov/11552860/' },
      { label: '단일 경계값의 낙상 예측 한계 연구', url: 'https://pubmed.ncbi.nlm.nih.gov/18218822/' },
      { label: '아급성기 의미 있는 변화 외부검증 연구(2026)', url: 'https://pubmed.ncbi.nlm.nih.gov/42567244/' },
    ],
  },
  O04: {
    id: 'O04',
    plainName: '여러 상황에서의 보행 균형 검사',
    fullName: '기능적 보행 평가(Functional Gait Assessment, FGA)',
    purpose: '속도 바꾸기, 머리 돌리기, 장애물 넘기 등 다양한 상황의 보행 균형을 봅니다.',
    scoreFormat: '10개 항목을 각 0–3점으로 채점하여 0–30점으로 합산합니다.',
    defaultUnit: '/30점',
    direction: '점수가 높을수록 다양한 상황에서 보행 균형이 좋습니다.',
    example: '17/30점 · 일자 지팡이 · 신체적 도움 없이 가까운 감독',
    recording: ['사용한 보조도구와 각 항목의 가장 낮은 해당 채점기준을 기록합니다.', ...commonRecording],
    referenceValues: [],
    changeValues: [
      { label: '측정오차를 넘는 최소 변화', value: '4.2점; 실제 기록에서는 5점 이상', population: '급성·아급성·만성 뇌졸중 표본' },
    ],
    cautions: ['표준 기능적 보행 평가는 사람의 신체적 도움 없이 시행합니다. 안전을 위해 신체적 도움이 필요했다면 유효한 표준 총점처럼 해석하지 말고 도움과 완료 범위를 기록합니다. 흔한 22점 경계값은 일반 노인 자료이므로 뇌졸중에 자동 적용하지 않습니다.'],
    sources: [
      { label: '기능적 보행 평가 공식 포켓 가이드', url: 'https://www.neuropt.org/docs/default-source/cpgs/core-outcome-measures/function-gait-assessment-pocket-guide-proof9-%282%29.pdf?sfvrsn=b4f35043_0' },
      rehabMeasures('functional-gait-assessment', '기능적 보행 평가 측정 특성 정리'),
    ],
  },
  O05: {
    id: 'O05',
    plainName: '활동별 균형 자신감 설문',
    fullName: '활동특이적 균형 자신감 척도(Activities-specific Balance Confidence Scale, ABC Scale)',
    purpose: '환자가 여러 일상활동을 넘어지지 않고 할 수 있다고 얼마나 자신하는지 묻습니다.',
    scoreFormat: '각 활동의 자신감을 0%에서 100%로 답하고 평균을 냅니다. 사용한 번역본과 문항 수를 기록합니다.',
    defaultUnit: '%',
    direction: '점수가 높을수록 균형 자신감이 높습니다.',
    example: '42% · 16문항 한국어판 · 치료사 읽어주기 없이 자가응답',
    recording: ['자가응답인지 대리응답인지, 읽기·의사소통 도움과 설문 버전을 남깁니다.', ...commonRecording],
    referenceValues: [],
    changeValues: [
      { label: '예비 의미 있는 최소 변화 추정', value: '+15.6%p', population: '아급성기 뇌졸중 표본; 추가 검증 필요', phases: ['early_subacute', 'late_subacute'] },
    ],
    cautions: ['번역본과 대상군에 따라 변화값이 달라 예비값을 자동판정에 쓰지 않습니다. 대리응답은 환자응답과 구분하고 균형 수행검사와 함께 해석합니다.'],
    sources: [
      anptCore,
      rehabMeasures('activities-specific-balance-confidence-scale', '활동별 균형 자신감 척도 측정 특성 정리'),
      { label: '아급성기 예비 의미 있는 변화 연구(2025)', url: 'https://pubmed.ncbi.nlm.nih.gov/40368361/' },
    ],
  },
  O06: {
    id: 'O06',
    plainName: '5회 앉았다 일어서기 검사',
    fullName: '5회 앉았다 일어서기 검사(Five Times Sit-to-Stand Test, 5TSTS)',
    purpose: '의자에서 5번 연속으로 일어섰다 앉는 데 걸리는 시간을 봅니다.',
    scoreFormat: '팔을 가슴에 모으고 5회를 가능한 빠르고 안전하게 수행한 시간을 0.1초 단위로 기록합니다.',
    defaultUnit: '초(s)',
    direction: '시간이 짧을수록 수행이 빠릅니다.',
    example: '15.8초 · 43 cm 의자 · 팔 사용 없음 · 신체적 도움 없음',
    recording: ['의자 높이·등받이, 팔 사용, 발 위치, 도움과 보조도구를 남깁니다.', '5회를 표준 방법으로 완료하지 못했다면 유효한 5회 검사값처럼 기록하지 말고, 완료 횟수·시간·보상·도움을 서술합니다.', ...commonRecording],
    referenceValues: [
      { label: '연구상 집단 구분 참고', value: '12초 초과', population: '만성기 뇌졸중과 건강 대조군 구분', note: '낙상위험 경계값이 아닙니다.', phases: ['chronic'] },
    ],
    changeValues: [],
    cautions: ['뇌졸중에 공통 적용할 확립된 최소 변화값이 없어, 같은 의자와 같은 방법으로 관찰한 변화와 질적 수행을 함께 기록합니다.'],
    sources: [
      { label: '5회 앉았다 일어서기 공식 포켓 가이드', url: 'https://www.neuropt.org/docs/default-source/cpgs/core-outcome-measures/5tsts-pocket-guide-v2-proof9-%282%2938db36a5390366a68a96ff00001fc240.pdf?sfvrsn=f4d85043_0' },
      rehabMeasures('five-times-sit-stand-test', '5회 앉았다 일어서기 측정 특성 정리'),
    ],
  },
  O07: {
    id: 'O07',
    plainName: '일어나서 3미터 걸어 돌아오기 검사',
    fullName: '일어나 걸어가기 검사(Timed Up and Go Test, TUG)',
    purpose: '의자에서 일어나 3미터를 걷고 돌아와 앉는 전체 이동 시간을 봅니다.',
    scoreFormat: '등을 등받이에 댄 시작자세부터 다시 앉을 때까지의 시간을 초로 기록합니다.',
    defaultUnit: '초(s)',
    direction: '시간이 짧을수록 이동 수행이 빠릅니다.',
    example: '24.3초 · 팔걸이 의자 46 cm · 일자 지팡이 · 가까운 감독',
    recording: ['의자 높이·팔걸이, 신발, 보조도구, 도움, 회전 방향과 속도 지시를 남깁니다. 표준 평소속도가 아닌 빠른속도 지시를 사용했다면 “수정 절차”라고 명시합니다.', '23% 참고값을 보려면 원 연구의 핵심 조건인 좌면 높이 44 cm·팔걸이 높이 64 cm 의자, 3 m, 평소속도, 연습 1회 뒤 1분 간격 2회 평균 절차를 선택합니다.', ...commonRecording],
    referenceValues: [],
    changeValues: [
      { label: '개인 변화가 측정오차를 넘을 가능성이 큰 상대 변화', value: '기준선 시간보다 23% 초과 감소', population: '발병 6–46개월, 지역사회 거주, 경도–중등도 편마비이며 보조도구 유무와 관계없이 최소 300 m를 걸을 수 있었던 50명', note: '원 연구의 핵심 절차는 좌면 높이 44 cm·팔걸이 높이 64 cm 의자, 3 m, 평소속도, 연습 1회 뒤 1분 간격 2회 평균입니다. 예: 기준선 20초라면 4.6초를 초과해 단축.', appliesToProtocol: ['원 연구 핵심 절차 · 좌면 높이 44 cm·팔걸이 높이 64 cm 의자 · 3 m · 평소속도 · 연습 1회 후 1분 간격 2회 평균'], phases: ['chronic'], minOnsetDays: 183, maxOnsetDays: 1400 },
    ],
    cautions: ['한 개의 시간 경계값만으로 낙상위험이나 독립보행을 결정하지 않습니다.', '평소속도와 빠른속도 수정 절차의 값을 직접 비교하지 않습니다.', '23% 참고값은 원 연구 절차와 같은 경우에만 표시됩니다. 단일 시행, 다른 의자 높이·휴식 간격·속도 지시에 대신 적용하지 않습니다.'],
    sources: [
      rehabMeasures('timed-up-and-go', '일어나 걸어가기 검사 측정 특성 정리'),
      { label: '만성기 뇌졸중 측정오차 연구', url: 'https://pubmed.ncbi.nlm.nih.gov/15788341/' },
      { label: '만성기 뇌졸중 측정오차 원문', url: 'https://www.medicaljournals.se/jrm/content_files/download.php?doi=10.1080%2F16501970410017215' },
    ],
  },
  O08: {
    id: 'O08',
    plainName: '보행 도움 수준 분류',
    fullName: '기능적 보행 분류(Functional Ambulation Category, FAC)',
    purpose: '걷는 동안 다른 사람이 어느 정도 신체적으로 도와야 하는지를 6단계로 분류합니다.',
    scoreFormat: '0점(기능적 보행 불가)부터 5점(독립 보행)까지의 순서형 점수입니다.',
    defaultUnit: '/5점',
    direction: '점수가 높을수록 사람의 신체적 도움을 덜 필요로 합니다.',
    example: '3/5점 · 균형을 위한 접촉이나 신체적 도움 없이 구두감독 필요',
    recording: ['점수만 쓰지 말고 실제 신체적 도움·감독 수준, 보조도구와 환경을 함께 남깁니다.', ...commonRecording],
    referenceValues: [],
    changeValues: [],
    cautions: ['단계 간 간격이 같다고 가정해 평균을 내거나 1점 변화를 동일한 크기로 해석하지 않습니다. 보조도구 독립성과 사람 도움 독립성을 구분합니다.'],
    sources: [rehabMeasures('functional-ambulation-category', '기능적 보행 분류 측정 특성 정리')],
  },
  O09: {
    id: 'O09',
    plainName: '근력 검사',
    fullName: '도수근력검사(Manual Muscle Testing, MMT) 또는 휴대용 근력계(Hand-Held Dynamometry, HHD)',
    purpose: '특정 근육 또는 움직임에서 힘을 내는 능력을 봅니다.',
    scoreFormat: '도수근력검사는 보통 0–5 순서형 점수, 휴대용 근력계는 뉴턴(N) 또는 킬로그램힘(kgf)으로 기록합니다.',
    defaultUnit: '점, N 또는 kgf',
    direction: '일반적으로 값이 클수록 힘이 큽니다.',
    example: '무릎폄 128 N · 앉은 자세 · 무릎 60° · 벨트고정 · 3회 평균',
    recording: ['검사 움직임과 쪽, 자세·관절각도, 고정법, 검사자 힘 제공 방향, 장비, 시행 횟수와 평균/최댓값을 남깁니다.', ...commonRecording],
    referenceValues: [],
    changeValues: [],
    cautions: ['도수근력검사와 근력계 값은 서로 바꿔 쓸 수 없습니다. 근육·자세·장비마다 변화값이 달라 공통 기준을 제시하지 않습니다.'],
    sources: [],
  },
  O10: {
    id: 'O10',
    plainName: '관절 움직임 범위 검사',
    fullName: '관절각도계 관절가동범위(Goniometric Range of Motion, ROM)',
    purpose: '관절이 수동 또는 능동으로 움직이는 각도를 봅니다.',
    scoreFormat: '시작각도와 끝각도를 도(°)로 기록하고, 능동인지 수동인지 구분합니다.',
    defaultUnit: '도(°)',
    direction: '목표 움직임에 따라 증가 또는 감소 방향이 다릅니다.',
    example: '오른쪽 발목 능동 발등굽힘 2° · 무릎 폄 · 장축 기준 · 통증 없음',
    recording: ['관절·쪽, 능동/수동, 자세, 인접관절 위치, 기준점, 통증과 끝느낌을 남깁니다.', ...commonRecording],
    referenceValues: [],
    changeValues: [],
    cautions: ['정상범위는 측정 자세와 개인 특성에 따라 다릅니다. 반대쪽 또는 기관 표준과 비교하되 기능목표와 함께 해석합니다.'],
    sources: [],
  },
  O11: {
    id: 'O11',
    plainName: '수동 움직임 저항 검사',
    fullName: '수정 애시워스 척도(Modified Ashworth Scale, MAS)',
    purpose: '검사자가 관절을 수동으로 움직일 때 느끼는 저항을 등급으로 기록합니다.',
    scoreFormat: '0, 1, 1+, 2, 3, 4의 순서형 등급을 사용합니다. 1+를 숫자 1.5로 바꾸지 않습니다.',
    defaultUnit: '등급',
    direction: '등급이 높을수록 수동 움직임에서 느껴지는 저항이 큽니다.',
    example: '오른쪽 발목 발바닥굽힘근 1+ · 바로누운 자세 · 무릎 폄 · 빠른 수동 움직임',
    recording: ['관절·근육군·쪽, 환자 자세, 인접관절 위치, 움직임 속도와 검사자를 남깁니다.', ...commonRecording],
    referenceValues: [],
    changeValues: [],
    cautions: ['이 검사는 순수한 경직만을 재는 검사가 아니라 수동 움직임 저항을 봅니다. 뇌졸중에서 검사자 간 일치도가 제한적이므로 단독 해석하지 않습니다.'],
    sources: [
      { label: '미국물리치료협회 애시워스 척도 안내', url: 'https://www.apta.org/patient-care/evidence-based-practice-resources/test-measures/ashworth-scale-as-and-modified-ashworth-scale-mas' },
      rehabMeasures('ashworth-scale-modified-ashworth-scale', '수정 애시워스 척도 측정 특성 정리'),
    ],
  },
  O12: {
    id: 'O12',
    plainName: '뇌졸중 상지 운동회복 검사',
    fullName: '푸글-마이어 상지 운동평가(Fugl-Meyer Assessment–Upper Extremity, FMA-UE)',
    purpose: '뇌졸중 후 팔과 손의 선택적 움직임과 운동 회복 정도를 봅니다.',
    scoreFormat: '상지 운동영역을 각 항목 0–2점으로 채점해 0–66점으로 합산합니다.',
    defaultUnit: '/66점',
    direction: '점수가 높을수록 상지 운동수행이 좋습니다.',
    example: '31/66점 · 오른쪽 마비측 · 상지 운동영역만 시행 · 표준 지시',
    recording: ['평가한 쪽과 사용한 영역을 명시합니다. 전체 푸글-마이어 점수와 상지 운동점수를 섞지 않습니다.', ...commonRecording],
    referenceValues: [],
    changeValues: [
      { label: '측정오차를 넘는 최소 변화', value: '6.82점', population: '급성기부터 6주까지 중등도–중증 상지마비 표본', phases: ['acute', 'early_subacute'] },
      { label: '의미 있는 최소 변화 추정', value: '약 9–13점', population: '급성기부터 6주까지; 환자·임상가 기준에 따라 다름', phases: ['acute', 'early_subacute'] },
      { label: '치료사 판단상 중요한 변화 범위', value: '약 4.25–7.25점', population: '안정된 만성기·기준 28–50점·6주 과제훈련 표본', note: '하나의 보편적 최소 변화값이 아니며 판단 영역에 따라 다릅니다.', phases: ['chronic'] },
    ],
    cautions: ['급성기 9–13점과 만성기 4.25–7.25점을 서로 바꾸어 적용하지 않습니다. 만성기 값은 치료사의 여러 변화영역 판단에 따른 범위이고 판별력이 높지 않아 단일 자동판정값으로 사용하지 않습니다. 표준 교육을 받은 평가자가 공식 지침을 사용합니다.'],
    sources: [
      { label: '푸글-마이어 상지평가 2026 국제 표준 매뉴얼', url: 'https://doi.org/10.1177/15459683251412300' },
      { label: '급성기 상지 변화값 연구', url: 'https://doi.org/10.1177/15459683231186985' },
      { label: '만성기 뇌졸중 상지 임상적으로 중요한 변화 원 연구', url: 'https://pubmed.ncbi.nlm.nih.gov/22282773/' },
    ],
  },
  O13: {
    id: 'O13',
    plainName: '팔과 손의 과제수행 검사',
    fullName: '액션 리서치 암 테스트(Action Research Arm Test, ARAT)',
    purpose: '잡기, 쥐기, 집기와 큰 팔 움직임 과제를 통해 상지 활동능력을 봅니다.',
    scoreFormat: '19개 항목을 각 0–3점으로 채점해 0–57점으로 합산합니다.',
    defaultUnit: '/57점',
    direction: '점수가 높을수록 팔과 손의 과제수행이 좋습니다.',
    example: '24/57점 · 오른쪽 마비측 · 표준 도구와 테이블 높이 · 신체적 도움 없음',
    recording: ['평가한 쪽, 공식 도구·테이블 배치, 시간 제한, 대체동작과 완료하지 못한 항목을 남깁니다.', ...commonRecording],
    referenceValues: [],
    changeValues: [
      { label: '의미 있는 최소 변화 추정', value: '12점', population: '발병 약 10–26일 입원재활 표본 · 검사한 마비측이 우세손', appliesToDominance: ['검사한 쪽이 우세손'], phases: ['early_subacute'] },
      { label: '의미 있는 최소 변화 추정', value: '17점', population: '발병 약 10–26일 입원재활 표본 · 검사한 마비측이 비우세손', appliesToDominance: ['검사한 쪽이 비우세손'], phases: ['early_subacute'] },
      { label: '의미 있는 최소 변화 추정', value: '약 5점', population: '발병 10–28일 경도–중등도 상지마비 표본; 최근 별도 연구', phases: ['early_subacute'] },
    ],
    cautions: ['초기 중증도와 회복시기에 따라 바닥·천장효과와 변화기준이 달라집니다. 공식 채점지침을 우선합니다.'],
    sources: [
      rehabMeasures('action-research-arm-test', '액션 리서치 암 테스트 측정 특성 정리'),
      { label: '초기 뇌졸중 우세손별 의미 있는 변화 연구', url: 'https://doi.org/10.1016/j.apmr.2008.02.022' },
      { label: '초기 경도–중등도 상지마비 의미 있는 변화 연구', url: 'https://doi.org/10.1186/s12984-024-01512-9' },
      { label: '표준화된 검사 절차', url: 'https://doi.org/10.1177/1545968307305353' },
    ],
  },
  O14: {
    id: 'O14',
    plainName: '상자 안 블록 옮기기 검사',
    fullName: '상자와 블록 검사(Box and Block Test, BBT)',
    purpose: '한 손으로 1분 동안 옮긴 블록 수를 통해 손의 큰 움직임 민첩성을 봅니다.',
    scoreFormat: '한 번에 한 개씩 칸막이를 넘어 옮긴 블록 수를 60초 동안 셉니다. 양손을 따로 검사합니다.',
    defaultUnit: '개/분',
    direction: '옮긴 블록 수가 많을수록 손의 큰 움직임 민첩성이 좋습니다.',
    example: '오른손 18개/분 · 마비측 · 표준 상자 · 앉은 자세 · 연습 후 1회',
    recording: ['검사한 쪽, 우세손·마비측, 15초 연습 시행, 상자 방향, 떨어뜨린 블록과 규칙 위반을 남깁니다.', ...commonRecording],
    referenceValues: [],
    changeValues: [
      { label: '측정오차를 넘는 최소 변화 참고', value: '5.5개/분; 실무상 6개/분 이상', population: '혼합 회복시기·같은 평가자·3회 평균·기준선에서 최소 1개 수행 가능 표본' },
    ],
    cautions: ['5.5개/분은 3회 평균과 최소 1개 수행이 가능했던 표본의 값이므로 1회 검사나 0점 환자에게 그대로 적용하지 않습니다. 중증 상지마비, 특히 푸글-마이어 상지점수 18점 이하에서는 바닥효과가 커 변화에 둔감할 수 있습니다.'],
    sources: [
      { label: '상자와 블록 검사 공식 절차', url: 'https://www.sralab.org/sites/default/files/2017-06/Box%20and%20Blocks%20Test%20Instructions.pdf' },
      { label: '뇌졸중 상지검사의 최소실제변화 연구', url: 'https://doi.org/10.1177/1545968308331146' },
      { label: '중증 상지마비 바닥효과 연구(2026)', url: 'https://doi.org/10.1016/j.arrct.2026.100623' },
    ],
  },
  O15: {
    id: 'O15',
    plainName: '마비측 팔의 실제 사용 설문',
    fullName: '운동활동일지(Motor Activity Log, MAL)',
    purpose: '환자가 일상생활에서 마비측 팔을 얼마나 자주, 얼마나 잘 사용하는지 묻습니다.',
    scoreFormat: '지난 7일의 사용량과 움직임의 질을 각각 0–5점으로 면담합니다. 14문항판·28문항판 등 버전과 평가 가능한 문항 수를 기록하고 두 영역을 따로 보고합니다.',
    defaultUnit: '/5점',
    direction: '점수가 높을수록 마비측 팔을 더 많이 또는 더 잘 사용한다고 보고합니다.',
    example: '사용량 1.8/5, 움직임의 질 2.1/5 · 14문항판 · 환자 면담',
    recording: ['사용한 문항판, 사용량/움직임의 질, 환자 또는 대리응답, 회상기간과 실제로 팔을 사용할 기회가 있었는지 남깁니다.', ...commonRecording],
    referenceValues: [],
    changeValues: [
      { label: '움직임의 질에서 의미 있는 최소 변화 추정', value: '1.0점', population: '발병 약 10–26일 입원재활 표본 · 검사한 마비측이 우세손; 사용량 영역에는 확정값 없음', appliesTo: ['움직임의 질', 'quality of movement', 'qom'], appliesToDominance: ['검사한 쪽이 우세손'], phases: ['early_subacute'] },
      { label: '움직임의 질에서 의미 있는 최소 변화 추정', value: '1.1점', population: '발병 약 10–26일 입원재활 표본 · 검사한 마비측이 비우세손; 사용량 영역에는 확정값 없음', appliesTo: ['움직임의 질', 'quality of movement', 'qom'], appliesToDominance: ['검사한 쪽이 비우세손'], phases: ['early_subacute'] },
    ],
    cautions: ['입원 직후처럼 실제 사용 기회가 없었다면 낮은 점수를 “비사용”으로 단정하지 않습니다. 자가보고와 검사실 수행은 다를 수 있고, 설문 버전과 대상군이 다른 변화값을 섞지 않습니다.'],
    sources: [
      rehabMeasures('motor-activity-log', '운동활동일지 측정 특성 정리'),
      { label: '초기 뇌졸중 우세손별 의미 있는 변화 연구', url: 'https://doi.org/10.1016/j.apmr.2008.02.022' },
    ],
  },
  O16: {
    id: 'O16',
    plainName: '악력 검사',
    fullName: '악력계 검사(Grip Dynamometry)',
    purpose: '손으로 쥐는 힘을 수치로 봅니다.',
    scoreFormat: '같은 악력계와 손잡이 위치에서 여러 번 측정하고 평균 또는 최댓값을 명시합니다.',
    defaultUnit: 'kgf 또는 N',
    direction: '값이 클수록 악력이 큽니다.',
    example: '오른손 8.4 kgf · 손잡이 2단 · 앉은 자세 · 3회 평균',
    recording: ['손, 우세손·마비측, 자세, 어깨·팔꿈치·손목 위치, 손잡이 단계, 장비, 시행 수와 평균/최댓값을 남깁니다.', ...commonRecording],
    referenceValues: [],
    changeValues: [
      { label: '측정오차를 넘는 최소 변화 참고', value: '2.9 kg', population: '뇌졸중 환자의 더 마비된 손; 3–7일 재검사 표본' },
      { label: '의미 있는 최소 변화 추정', value: '5.0 kg', population: '초기 뇌졸중 · 검사한 쪽이 우세손; Jamar 손잡이 3번을 사용한 표본', appliesToDominance: ['검사한 쪽이 우세손'] },
      { label: '의미 있는 최소 변화 추정', value: '6.2 kg', population: '초기 뇌졸중 · 검사한 쪽이 비우세손; Jamar 손잡이 3번을 사용한 표본', appliesToDominance: ['검사한 쪽이 비우세손'] },
    ],
    cautions: ['장비와 손잡이 위치, 자세, 성별·연령·체격에 따라 값이 달라집니다. 제시된 변화값은 같은 장비·조건과 유사한 대상군에서만 참고합니다.'],
    sources: [
      rehabMeasures('hand-held-dynamometer-grip-strength', '악력계 표준 조건과 측정 특성 정리'),
      { label: '뇌졸중 상지검사의 최소실제변화 연구', url: 'https://doi.org/10.1177/1545968308331146' },
      { label: '초기 뇌졸중 우세손별 의미 있는 변화 연구', url: 'https://doi.org/10.1016/j.apmr.2008.02.022' },
    ],
  },
  O17: {
    id: 'O17',
    plainName: '앉은 자세 몸통조절 검사',
    fullName: '체간손상척도(Trunk Impairment Scale, TIS)',
    purpose: '앉은 자세의 정적·동적 균형과 몸통 협응을 봅니다.',
    scoreFormat: 'Verheyden판은 정적 앉기 0–7점, 동적 앉기 0–10점, 협응 0–6점을 합해 0–23점으로 기록합니다. 이름이 같은 다른 판과 혼동하지 않도록 버전을 씁니다.',
    defaultUnit: '/23점',
    direction: '점수가 높을수록 몸통조절이 좋습니다.',
    example: '12/23점 · 원 체간손상척도 · 발 지지 · 신체적 도움 없음',
    recording: ['Verheyden판 등 정확한 버전, 발·팔 지지, 신체적 도움과 검사한 영역을 남깁니다.', ...commonRecording],
    referenceValues: [],
    changeValues: [],
    cautions: ['2004년에 서로 다른 두 검사가 같은 이름으로 발표되었습니다. 반드시 버전을 기록합니다. 최신 체계적 검토에서 측정특성 근거의 확실성이 대부분 매우 낮아 보편적 변화값을 제시하지 않습니다.'],
    sources: [
      { label: 'Verheyden 체간손상척도 원 연구', url: 'https://doi.org/10.1191/0269215504cr733oa' },
      { label: '체간손상척도 측정특성 체계적 문헌고찰(2026)', url: 'https://doi.org/10.1093/ptj/pzag066' },
    ],
  },
  O18: {
    id: 'O18',
    plainName: '여러 균형체계 종합검사',
    fullName: '간이 균형평가시스템검사(Mini-Balance Evaluation Systems Test, Mini-BESTest)',
    purpose: '예측적 자세조절, 반응적 자세조절, 감각통합, 동적 보행을 함께 봅니다.',
    scoreFormat: '14개 항목을 각 0–2점으로 채점해 0–28점으로 합산합니다.',
    defaultUnit: '/28점',
    direction: '점수가 높을수록 여러 균형체계의 수행이 좋습니다.',
    example: '15/28점 · 발목보조기 착용 · 보행 항목 일자 지팡이 · 가까운 감독',
    recording: ['보조도구·보조기와 각 항목의 신체적 도움, 완료하지 못한 항목을 남깁니다.', ...commonRecording],
    referenceValues: [],
    changeValues: [
      { label: '측정오차를 넘는 최소 변화', value: '3.2점', population: '외래 뇌졸중 표본' },
      { label: '의미 있는 변화 추정', value: '작은 변화 4점 · 큰 변화 5점', population: '외래 뇌졸중 표본' },
      { label: '의미 있는 최소 변화 추정', value: '3.8점; 실무상 약 4점', population: '초기 아급성기 입원 뇌졸중 표본', phases: ['early_subacute'] },
    ],
    cautions: ['낙상위험은 총점 하나가 아니라 낙상력, 보행, 환경과 함께 판단합니다.'],
    sources: [
      { label: '외래 뇌졸중 Mini-BESTest 변화값 원 연구', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8273365/' },
      { label: '초기 아급성기 의미 있는 변화 연구', url: 'https://academic.oup.com/ptj/article/104/4/pzae017/7608111' },
    ],
  },
  O19: {
    id: 'O19',
    plainName: '보행의 시간·거리 변수와 영상 관찰',
    fullName: '보행 시공간 변수와 영상 관찰 분석(Gait Spatiotemporal and Video Observational Analysis)',
    purpose: '걸음 수, 보폭, 보행주기, 좌우 대칭과 발 끌림처럼 특정 보행 특징을 반복해서 봅니다.',
    scoreFormat: '한 번에 한 변수의 원값을 기록합니다. 예: 속도 m/s, 분당 걸음 수, 보폭 cm, 발 끌림 횟수/10걸음.',
    defaultUnit: '변수별 단위',
    direction: '선택한 변수와 치료목표에 따라 좋아지는 방향이 다릅니다.',
    example: '발 끌림 4회/10걸음 · 평소 속도 · 전면/측면 60 fps 영상 · 발목보조기 착용',
    recording: ['관찰할 변수를 치료 전에 한 문장으로 정의합니다.', '카메라 위치·초당 프레임 수, 보행거리, 속도 지시, 분석한 걸음 수와 보조·도움을 남깁니다.', ...commonRecording],
    referenceValues: [], changeValues: [],
    cautions: ['서로 다른 변수나 촬영 조건의 값을 합치지 않습니다. 기관 내 관찰 기준과 평가자 교육을 먼저 합의합니다.'],
    sources: [],
  },
  O20: {
    id: 'O20',
    plainName: '심박수와 운동 자각강도',
    fullName: '심박수(Heart Rate, HR)와 보그 운동자각도(Rating of Perceived Exertion, RPE)',
    purpose: '운동 중 심혈관 반응과 환자가 느끼는 힘든 정도를 함께 봅니다.',
    scoreFormat: '심박수는 분당 박동수, 운동자각도는 사용한 보그 척도(6–20 또는 0–10)를 명시합니다.',
    defaultUnit: '회/분(bpm), /20 또는 /10',
    direction: '운동 강도와 상태에 따라 목표 방향이 달라집니다.',
    example: '휴식 78→훈련 중 112회/분 · 보그 6–20척도 13점 · 베타차단제 복용',
    recording: ['휴식/운동/회복 시점, 측정장비, 보그 척도 버전, 증상, 약물과 중단 사유를 남깁니다.', ...commonRecording],
    referenceValues: [],
    changeValues: [],
    cautions: ['개별 심혈관 상태와 약물이 심박수 반응을 바꿀 수 있습니다. 기관의 활력징후·운동 중단 기준을 우선합니다.'],
    sources: [],
  },
  O21: {
    id: 'O21',
    plainName: '관절 위치감각·촉각 검사',
    fullName: '감각평가: 관절위치감각 오차와 촉각 변별(Sensory Assessment: Joint Position Sense and Tactile Discrimination)',
    purpose: '눈을 감은 상태에서 관절 위치나 피부 자극을 얼마나 정확히 알아차리는지 봅니다.',
    scoreFormat: '관절위치감각은 재현 오차의 도(°), 촉각은 맞힌 수/전체 시행 또는 정확률로 기록합니다.',
    defaultUnit: '도(°), 정답 수/시행 수 또는 %',
    direction: '위치 재현 오차는 작을수록, 촉각 정답률은 높을수록 좋습니다.',
    example: '오른쪽 엄지발가락 위치감각 7/10회 정답 · 눈가림 · 위/아래 무작위 제시',
    recording: ['검사 부위·쪽, 눈가림, 자극 종류·강도, 시행 수, 무작위 순서와 답변방식을 남깁니다.', ...commonRecording],
    referenceValues: [], changeValues: [],
    cautions: ['검사방법마다 척도와 오차가 달라 공통 변화값을 제시하지 않습니다. 실어증·편측무시·인지상태가 응답에 미친 영향을 기록합니다.'],
    sources: [],
  },
  O22: {
    id: 'O22',
    plainName: '시각적 무시 검사',
    fullName: '별 지우기 검사와 선 이등분 검사(Star Cancellation and Line Bisection Tests)',
    purpose: '한쪽 공간의 자극을 놓치거나 선의 가운데를 치우쳐 표시하는지 봅니다.',
    scoreFormat: '별 지우기는 찾은 표적 수와 좌·우 누락 수, 선 이등분은 실제 중심에서 벗어난 거리 또는 비율을 기록합니다.',
    defaultUnit: '개수, mm 또는 %',
    direction: '누락 수와 중심 오차가 작을수록 편향이 적습니다.',
    example: '별 지우기 49/54개 · 왼쪽 누락 5개/오른쪽 0개 · 책상 중앙 배치',
    recording: ['정확한 검사판 버전, 종이 크기·배치, 시야·안경, 지시와 단서, 좌우 누락을 따로 남깁니다.', ...commonRecording],
    referenceValues: [], changeValues: [],
    cautions: ['두 검사의 점수를 서로 바꿔 쓰지 않습니다. 시야결손, 시력, 실어증과 운동제한을 함께 고려합니다.'],
    sources: [],
  },
  O23: {
    id: 'O23',
    plainName: '통증 숫자척도',
    fullName: '통증 숫자평가척도(Numeric Rating Scale, NRS)',
    purpose: '환자가 느끼는 통증 강도를 숫자로 표현합니다.',
    scoreFormat: '보통 0점은 통증 없음, 10점은 상상할 수 있는 가장 심한 통증으로 묻습니다.',
    defaultUnit: '/10점',
    direction: '점수가 높을수록 보고한 통증이 심합니다.',
    example: '오른쪽 어깨 움직임 시 6/10점, 휴식 시 2/10점 · 지난 24시간 기준',
    recording: ['부위, 휴식/움직임, 회상기간, 질문 문구, 통증 양상과 의사소통 도움을 남깁니다.', ...commonRecording],
    referenceValues: [],
    changeValues: [],
    cautions: ['의미 있는 변화값은 통증 질환과 연구에 따라 다르므로 한 숫자를 모든 뇌졸중 환자에게 적용하지 않습니다.'],
    sources: [rehabMeasures('numeric-pain-rating-scale', '통증 숫자평가척도 측정 특성 정리')],
  },
  O24: {
    id: 'O24',
    plainName: '일상생활 독립도 검사',
    fullName: '수정 바델지수(Modified Barthel Index, MBI) 또는 기능독립측정(Functional Independence Measure, FIM)',
    purpose: '식사, 이동, 옷 입기 같은 일상생활에서 필요한 도움 정도를 봅니다.',
    scoreFormat: '두 도구는 항목과 총점이 다릅니다. 도구명·버전·총점 분모와 운동/인지 하위점수를 구분합니다.',
    defaultUnit: '도구별 총점',
    direction: '일반적으로 점수가 높을수록 일상생활 독립도가 높습니다.',
    example: '수정 바델지수 62/100점 · 실제 병동 수행 · 보행기 사용',
    recording: ['수정 바델지수와 기능독립측정을 섞지 말고, 버전·총점 분모·평가 환경·실제 도움 수준을 남깁니다.', ...commonRecording],
    referenceValues: [],
    changeValues: [
      { label: '측정오차를 넘는 최소 변화', value: '15.4점', population: '수정 바델지수 0–100점 Shah판; 만성기 뇌졸중 표본', appliesTo: ['수정 바델', 'modified barthel', 'mbi'], phases: ['chronic'] },
      { label: '의미 있는 최소 변화 추정', value: '총점 22점', population: '기능독립측정; 장기 급성기병원 입원–퇴원 뇌졸중 표본', appliesTo: ['기능독립측정 · 총점'] },
      { label: '의미 있는 최소 변화 추정', value: '운동영역 17점', population: '기능독립측정; 장기 급성기병원 입원–퇴원 뇌졸중 표본', appliesTo: ['기능독립측정 · 운동영역'] },
      { label: '의미 있는 최소 변화 추정', value: '인지영역 3점', population: '기능독립측정; 장기 급성기병원 입원–퇴원 뇌졸중 표본', appliesTo: ['기능독립측정 · 인지영역'] },
    ],
    cautions: ['수정 바델지수와 기능독립측정은 서로 다른 도구입니다. 0–20점과 0–100점 바델지수의 변화값을 단순 환산하지 않습니다. 기능독립측정은 교육·인증과 사용권을 확인한 뒤 사용합니다.'],
    sources: [
      { label: '수정 바델지수 Shah판 원 연구', url: 'https://doi.org/10.1016/0895-4356(89)90065-6' },
      { label: '만성기 수정 바델지수 최소 변화 연구', url: 'https://doi.org/10.1080/09638288.2020.1814429' },
      { label: '기능독립측정 입원–퇴원 의미 있는 변화 연구', url: 'https://doi.org/10.1016/j.apmr.2005.08.130' },
    ],
  },
  O25: {
    id: 'O25',
    plainName: '개인 목표달성 척도',
    fullName: '목표달성척도(Goal Attainment Scaling, GAS)',
    purpose: '환자와 합의한 개인 목표의 예상 결과와 실제 달성 정도를 단계로 봅니다.',
    scoreFormat: '치료 전에 −2부터 +2까지 관찰 가능한 다섯 단계를 정의합니다. 0은 기대한 결과이며, 여러 목표를 합칠 때는 사용한 계산법을 명시합니다.',
    defaultUnit: '−2~+2 단계 또는 T점수',
    direction: '점수가 높을수록 사전에 합의한 기대수준보다 더 많이 달성했습니다.',
    example: '화장실 이동 −1 · 기대수준 0은 20 m를 지팡이와 감독으로 이동',
    recording: ['목표, 기간, 각 단계의 관찰 가능한 조건, 중요도·난이도 가중치와 평가자를 치료 전에 남깁니다.', ...commonRecording],
    referenceValues: [],
    changeValues: [],
    cautions: ['결과를 본 뒤 단계를 바꾸지 않습니다. −2를 무조건 기준선으로 두기보다 현재 상태와 기대수준을 명확히 정의합니다.'],
    sources: [
      { label: '목표달성척도 원 연구', url: 'https://doi.org/10.1007/BF01530764' },
      { label: '재활에서 목표달성척도 사용 실무지침', url: 'https://doi.org/10.1177/0269215508101742' },
    ],
  },
  O26: {
    id: 'O26', plainName: '설명 후 이해 확인', fullName: '티치백·퀴즈·직접 시연을 이용한 지식 확인(Knowledge Check)',
    purpose: '환자나 보호자가 설명을 자기 말로 되풀이하거나 직접 해 보게 하여 이해한 내용을 확인합니다.',
    scoreFormat: '사전에 정한 핵심 항목 중 스스로 정확히 설명·시연한 수를 전체 항목 수와 함께 기록합니다.', defaultUnit: '정답 수/전체 또는 %', direction: '정확히 설명·시연한 비율이 높을수록 이해가 좋습니다.',
    example: '낙상예방 핵심 4항목 중 3항목 독립 설명 · 1항목은 한 번 단서 후 설명',
    recording: ['질문·시연 과제와 합격기준을 치료 전에 정합니다.', '환자/보호자, 통역·의사소통 도움, 단서의 종류와 횟수를 남깁니다.', ...commonRecording],
    referenceValues: [], changeValues: [], cautions: ['“이해함”만 쓰지 말고 실제로 확인한 질문·행동과 필요한 단서를 기록합니다. 기관 교육내용마다 달라 공통 변화값은 없습니다.'], sources: [],
  },
  O27: {
    id: 'O27', plainName: '가정운동 실천 기록', fullName: '가정운동프로그램 이행 기록(Home Exercise Program Adherence Log)',
    purpose: '계획한 가정운동을 실제로 얼마나 수행했는지 봅니다.',
    scoreFormat: '완료한 회기 또는 반복 수를 계획한 수로 나누어 비율을 계산하고, 기간과 운동 항목을 함께 씁니다.', defaultUnit: '% 또는 완료/계획', direction: '비율이 높을수록 계획한 운동을 더 많이 수행했습니다.',
    example: '지난 7일 5/7회(71%) · 앉기-서기 · 환자 일지 · 통증으로 2회 미실시',
    recording: ['기록기간, 계획한 빈도·반복, 실제 수행, 확인방법과 미실시 사유를 남깁니다.', ...commonRecording],
    referenceValues: [], changeValues: [], cautions: ['자가기록·앱·보호자 보고는 정확도가 다릅니다. 수행률만으로 동작의 질이나 안전을 판단하지 않습니다.'], sources: [],
  },
  O28: {
    id: 'O28', plainName: '뇌졸중 후 활동·자기관리 자신감 설문', fullName: '뇌졸중 자기효능감 설문(Stroke Self-Efficacy Questionnaire, SSEQ)',
    purpose: '환자가 활동과 자기관리를 해낼 수 있다고 느끼는 자신감을 봅니다.',
    scoreFormat: '13문항 원판은 각 0–10점, 총 0–130점입니다. 라쉬분석으로 다듬은 4점판은 각 0–3점, 총 0–39점이므로 버전을 반드시 기록합니다.', defaultUnit: '/130점 또는 /39점', direction: '점수가 높을수록 자기효능감이 높습니다.',
    example: '27/39점 · 13문항 4점판 · 환자 자가응답 · 지난 1주 기준',
    recording: ['정확한 번역본·점수판, 활동/자기관리 하위영역, 회상기간, 환자/대리응답과 도움을 남깁니다.', ...commonRecording],
    referenceValues: [], changeValues: [], cautions: ['0–130점판과 0–39점판을 직접 비교하지 않습니다. 검증된 한국어판과 사용조건을 기관에서 확인합니다.'],
    sources: [{ label: '뇌졸중 자기효능감 설문 라쉬분석 개정 연구', url: 'https://www.medicaljournals.se/jrm/content/html/10.2340/16501977-1789' }],
  },
  O29: {
    id: 'O29', plainName: '두 과제를 함께 할 때의 수행 저하율', fullName: '이중과제 비용(Dual-Task Cost, DTC)',
    purpose: '걷기 같은 주 과제에 인지 또는 운동 과제를 더했을 때 수행이 얼마나 달라지는지 봅니다.',
    scoreFormat: '단일과제와 이중과제의 원값을 먼저 기록한 뒤, 높을수록 좋은 변수인지 낮을수록 좋은 변수인지에 맞는 공식을 명시합니다.', defaultUnit: '%와 각 원값 단위', direction: '보통 비용의 절댓값이 작을수록 이중과제 영향이 적지만, 계산 부호와 변수 방향을 함께 봅니다.',
    example: '보행속도 단일 0.62→이중 0.49 m/s · 비용 21.0% · 연속 3 빼기 과제',
    recording: ['주 과제·부 과제, 우선순위 지시, 계산공식, 단일/이중 원값, 정답률과 보조·도움을 남깁니다.', ...commonRecording],
    referenceValues: [], changeValues: [], cautions: ['시간처럼 낮을수록 좋은 변수와 속도처럼 높을수록 좋은 변수는 공식 방향이 다릅니다. 기존 “(단일−이중)/단일”을 모든 변수에 자동 적용하지 않습니다.'], sources: [],
  },
  O30: {
    id: 'O30', plainName: '울프 상지 운동기능 검사', fullName: '울프 운동기능검사(Wolf Motor Function Test, WMFT)',
    purpose: '시간 제한이 있는 여러 과제로 팔의 기능수행 속도와 움직임의 질을 봅니다.',
    scoreFormat: '표준판은 15개 시간 과제와 2개 근력 과제를 포함합니다. 수행시간과 기능능력 등급을 따로 기록하고 사용한 판을 씁니다.', defaultUnit: '초, 기능능력 /5점, 근력 단위', direction: '수행시간은 짧을수록, 기능능력 등급과 근력은 높을수록 좋습니다.',
    example: '15개 시간과제 중앙값 18.4초 · 기능능력 평균 2.7/5 · 오른쪽 마비측',
    recording: ['판·항목 수, 검사한 쪽, 120초 제한 적용, 중앙값/평균 계산, 근력 항목의 단위를 남깁니다.', ...commonRecording],
    referenceValues: [], changeValues: [], cautions: ['시간·기능능력·근력 점수를 하나로 합치지 않습니다. 검사 판과 분석법에 따라 결과가 달라 공식 매뉴얼을 사용합니다.'],
    sources: [rehabMeasures('wolf-motor-function-test', '울프 운동기능검사 측정 특성 정리')],
  },
  O31: {
    id: 'O31', plainName: '팔 근지구력 검사', fullName: '상지 근지구력 검사(Upper-Extremity Endurance Test)',
    purpose: '정해진 팔 자세를 유지하거나 같은 들기 과제를 반복할 수 있는 시간을 봅니다.',
    scoreFormat: '기관에서 정한 한 가지 과제를 사용하고, 유지시간·반복 수·무게 중 한 원값을 기록합니다.', defaultUnit: '초, 회 또는 kg', direction: '목표에 따라 유지시간·반복·무게가 증가하면 지구력이 향상된 것으로 볼 수 있습니다.',
    example: '어깨 90° 굽힘 8.2초 유지 · 0.5 kg · 팔꿈치 폄 · 몸통 보상 시작 시 종료',
    recording: ['쪽, 시작 자세·관절각도, 무게, 종료기준, 보상·통증·피로와 단서를 남깁니다.', ...commonRecording],
    referenceValues: [], changeValues: [], cautions: ['이 데이터베이스의 항목은 단일 표준검사가 아니라 임상 과제입니다. 기관 프로토콜을 고정하기 전에는 환자 간 기준값으로 비교하지 않습니다.'], sources: [],
  },
  O32: {
    id: 'O32', plainName: '손 부종 둘레 검사', fullName: '8자형 손 둘레 측정(Figure-of-Eight Hand Circumference)',
    purpose: '손의 일정한 뼈 기준점을 따라 줄자로 둘레를 재어 부종 변화를 봅니다.',
    scoreFormat: '같은 기준점과 줄자 장력으로 센티미터 값을 기록하고 양손을 따로 씁니다.', defaultUnit: 'cm', direction: '부종 감소가 목표라면 둘레가 작아지는 방향을 봅니다.',
    example: '오른손 42.8 cm · 8자형 기준점 · 오전 9시 · 팔 10분 거상 후',
    recording: ['쪽, 해부학적 기준점, 줄자 종류·장력, 시간대, 손 위치, 거상·압박 후 경과를 남깁니다.', ...commonRecording],
    referenceValues: [], changeValues: [], cautions: ['기관마다 기준점이 다르면 값이 달라집니다. 피부상태와 통증을 함께 확인하고 같은 검사자가 같은 방법으로 재평가합니다.'], sources: [],
  },
  O33: {
    id: 'O33', plainName: '어깨뼈 움직임과 보상 관찰', fullName: '견갑 리듬 관찰(Scapular Rhythm Observation)',
    purpose: '팔을 들 때 어깨 으쓱, 몸통 기울임과 어깨뼈 움직임 같은 보상을 봅니다.',
    scoreFormat: '사전에 정의한 동작과 반복 수에서 보상이 나타난 횟수 또는 등급을 기록합니다.', defaultUnit: '횟수/반복 또는 기관 등급', direction: '보상 감소가 목표라면 정의한 보상 횟수가 적을수록 좋습니다.',
    example: '앞으로 팔 들기 10회 중 어깨 으쓱 6회 · 60° 이상을 보상으로 정의 · 정면 영상',
    recording: ['동작, 범위·무게, 보상 정의, 반복 수, 촬영 방향과 평가자를 남깁니다.', ...commonRecording],
    referenceValues: [], changeValues: [], cautions: ['정의하지 않은 “움직임 좋아짐”을 점수로 만들지 않습니다. 평가자 간 기준을 맞추고 영상 조건을 고정합니다.'], sources: [],
  },
  O34: {
    id: 'O34', plainName: '젭슨-테일러 손기능 검사', fullName: '젭슨-테일러 손기능검사(Jebsen-Taylor Hand Function Test, JTHFT)',
    purpose: '글쓰기, 카드 뒤집기, 작은 물건 집기 등 일상과 비슷한 손 과제를 완료하는 시간을 봅니다.',
    scoreFormat: '7개 하위과제를 양손에서 따로 시행하고 각 과제의 완료시간과 총시간을 초로 기록합니다. 과제당 최대시간은 120초입니다.', defaultUnit: '초(s)', direction: '시간이 짧을수록 손기능 과제수행이 빠릅니다.',
    example: '오른손 작은 물건 집기 34.2초 · 총시간 286초 · 마비측 · 표준 도구',
    recording: ['검사한 손과 순서, 각 하위과제 시간, 120초 제한, 완료하지 못한 항목과 도구를 남깁니다.', ...commonRecording],
    referenceValues: [], changeValues: [], cautions: ['주로 속도를 보며 움직임의 질을 직접 나타내지 않습니다. 하위과제나 도구를 바꾸면 표준 총점과 비교하지 않습니다.'],
    sources: [rehabMeasures('jebsen-taylor-hand-function-test', '젭슨-테일러 손기능검사 절차와 측정 특성 정리')],
  },
  O35: {
    id: 'O35', plainName: '고리·원뿔 옮기기 시간', fullName: '고리 또는 원뿔 옮기기 과제(Ring or Cone Transfer Task)',
    purpose: '기관에서 만든 반복 옮기기 과제로 팔의 도달·잡기·놓기 수행을 추적합니다.',
    scoreFormat: '정해진 물체 수를 옮긴 총시간, 성공 수와 오류 수를 각각 기록합니다.', defaultUnit: '초, 성공 수/전체', direction: '같은 조건에서 시간과 오류는 작을수록, 성공 수는 많을수록 좋습니다.',
    example: '원뿔 7개 29.9초 · 30 cm 거리 · 오른손 · 앉은 자세 · 몸통 고정 없음',
    recording: ['물체 종류·수·크기·무게, 시작·도착 위치와 거리, 손, 자세, 시간 시작·종료기준과 보상을 남깁니다.', ...commonRecording],
    referenceValues: [], changeValues: [], cautions: ['표준화된 평가도구가 아닌 기관 과제입니다. 이 사례 안에서 같은 조건의 반복측정에만 사용하고 검증된 도구를 함께 고려합니다.'], sources: [],
  },
  O36: {
    id: 'O36', plainName: '원격·자기관리 프로그램 실천 기록', fullName: '원격·자기관리 프로그램 이행 기록(Tele/Self-managed Program Adherence Log)',
    purpose: '원격재활이나 자기관리 프로그램을 처방한 용량대로 실제로 수행했는지 봅니다.',
    scoreFormat: '기록기간 동안 완료한 회기·시간·반복 수를 계획한 값과 나란히 쓰고 비율을 계산합니다.', defaultUnit: '% 또는 완료/계획', direction: '비율이 높을수록 처방한 용량을 더 많이 수행했습니다.',
    example: '지난 7일 5/6회(83%) · 회기당 평균 52분 · 반복 410회 · 앱 기록 · 1회 피로로 중단',
    recording: ['프로그램·과제 이름, 기록기간, 계획한 빈도·시간·반복, 실제 수행값, 기록방법(앱·일지·보호자 보고)과 미실시 사유를 남깁니다.', ...commonRecording],
    referenceValues: [], changeValues: [], cautions: ['앱 로그와 자가보고는 정확도가 다릅니다. 수행률만으로 동작의 질이나 안전을 판단하지 않고, 원격 수행 중 이상반응 확인 방법을 함께 기록합니다.'], sources: [],
  },
  O37: {
    id: 'O37', plainName: '목표 심박대 유지 시간·걸음 수', fullName: '목표 심박대 체류 시간·보수(Time in Target Heart-rate Zone / Step Count by Activity Monitor)',
    purpose: '고강도 보행훈련이나 유산소 운동에서 실제로 전달된 강도와 양을 확인합니다.',
    scoreFormat: '목표 심박대에 머문 시간(분)과 회기 걸음 수를 각각 기록하고 목표대 기준을 함께 씁니다.', defaultUnit: '분, 걸음', direction: '같은 목표대 기준에서 체류 시간과 걸음 수가 많을수록 전달 용량이 큽니다.',
    example: '목표대 60–80% 여유심박 28분 · 1,450보 · 가슴 심박계 · 지상·트레드밀 혼합',
    recording: ['목표대 계산식(여유심박·최대심박·운동자각도), 측정기기와 착용 위치, 회기 전체 시간, 체류 시간, 걸음 수와 안전 중단 기준을 남깁니다.', ...commonRecording],
    referenceValues: [], changeValues: [], cautions: ['베타차단제 복용 등으로 심박 반응이 둔하면 운동자각도를 함께 씁니다. 기기마다 걸음 수가 달라 같은 기기로만 비교합니다.'], sources: [],
  },
  O38: {
    id: 'O38',
    plainName: '뇌졸중이 생활에 미친 영향 설문',
    fullName: '뇌졸중 영향 척도(Stroke Impact Scale, SIS)',
    purpose: '환자가 느끼는 힘, 손기능, 이동, 일상활동, 의사소통, 감정, 기억, 사회참여의 영향을 봅니다.',
    scoreFormat: '59문항 8개 영역을 각각 0–100점으로 환산하며, 회복정도 문항 0–100점은 따로 기록합니다.',
    defaultUnit: '영역별 /100점',
    direction: '영역점수가 높을수록 해당 영역에서 환자가 보고한 건강상태가 좋습니다.',
    example: '이동영역 54/100점 · 3.0판 · 환자 직접응답 · 회복정도 60/100점',
    recording: ['척도 버전, 영역명과 영역점수, 회복정도 문항, 환자/대리응답, 응답 도움을 남깁니다.', ...commonRecording],
    referenceValues: [],
    changeValues: [
      { label: '개인 측정오차를 넘는 최소 변화', value: '24.0점', population: '만성기 뇌졸중 3주 치료 표본; 근력 영역', appliesTo: ['근력', 'strength'], phases: ['chronic'] },
      { label: '개인 측정오차를 넘는 최소 변화', value: '17.3점', population: '만성기 뇌졸중 3주 치료 표본; 일상생활 영역', appliesTo: ['일상생활', 'activities of daily living', 'adl'], phases: ['chronic'] },
      { label: '개인 측정오차를 넘는 최소 변화', value: '15.1점', population: '만성기 뇌졸중 3주 치료 표본; 이동 영역', appliesTo: ['이동', 'mobility'], phases: ['chronic'] },
      { label: '개인 측정오차를 넘는 최소 변화', value: '25.9점', population: '만성기 뇌졸중 3주 치료 표본; 손기능 영역', appliesTo: ['손기능', 'hand function'], phases: ['chronic'] },
    ],
    cautions: ['8개 영역점수를 임의로 하나의 총점으로 합치지 않습니다. 집단 평균 변화용 중요차이 값을 개인 자동판정에 사용하지 않고, 변화값은 영역·회복시기별로 확인합니다.'],
    sources: [
      rehabMeasures('stroke-impact-scale', '뇌졸중 영향 척도 측정 특성 정리'),
      { label: '뇌졸중 영향 척도 영역별 변화 연구', url: 'https://doi.org/10.1177/1545968309356295' },
    ],
  },
  O39: {
    id: 'O39',
    plainName: '뇌졸중 신경학적 중증도 검사',
    fullName: '미국 국립보건원 뇌졸중 척도(National Institutes of Health Stroke Scale, NIHSS)',
    purpose: '의식, 눈운동, 시야, 운동, 감각, 언어 등 급성 신경학적 결손의 중증도를 봅니다.',
    scoreFormat: '표준 항목을 합해 0–42점으로 기록합니다.',
    defaultUnit: '/42점',
    direction: '점수가 높을수록 신경학적 결손이 심합니다.',
    example: '8/42점 · 평가시각 09:20 · 인증 교육 이수 평가자 · 표준 지시',
    recording: ['평가 날짜·시각, 교육받은 평가자, 검사 완료 여부와 점수에 영향을 준 언어·의식·삽관 상태를 남깁니다.', ...commonRecording],
    referenceValues: [],
    changeValues: [],
    cautions: ['물리치료 반응을 단독으로 판단하는 결과지표가 아닙니다. 공식 교육과 최신 기관 뇌졸중 프로토콜을 따릅니다.'],
    sources: [
      { label: '미국 국립신경질환뇌졸중연구소 공식 지침', url: 'https://www.ninds.nih.gov/sites/default/files/migrate-documents/nih_stroke_scale_booklet_508c.pdf' },
      { label: '미국 국립보건원 뇌졸중 척도 원 연구', url: 'https://doi.org/10.1161/01.STR.20.7.864' },
    ],
  },
};

export const outcomeEasyNames: Record<string, string> = {
  O19: '보행의 시간·거리 변수와 영상 관찰',
  O21: '관절 위치감각·촉각 검사',
  O22: '시각적 무시 검사',
  O26: '설명 후 이해 확인',
  O27: '가정운동 실천 기록',
  O28: '뇌졸중 자기효능감 설문',
  O29: '두 과제를 함께 할 때의 수행 저하율',
  O30: '울프 상지 운동기능 검사',
  O31: '팔 근지구력 검사',
  O32: '손 부종 둘레 검사',
  O33: '어깨뼈 움직임 관찰',
  O34: '젭슨-테일러 손기능 검사',
  O35: '고리·원뿔 옮기기 시간',
  O36: '원격·자기관리 프로그램 실천 기록',
  O37: '목표 심박대 유지 시간·걸음 수',
};

export function getBaselineGuide(outcomeId: string): BaselineGuide | undefined {
  return baselineGuides[outcomeId];
}

export function getEasyOutcomeName(outcomeId: string, fallback: string): string {
  return baselineGuides[outcomeId]?.plainName ?? outcomeEasyNames[outcomeId] ?? fallback;
}
