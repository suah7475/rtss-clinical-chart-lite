import rawSeed from '@/app/data/rtss-seed.json';

export interface Domain {
  id: string;
  kr: string;
  en: string;
  scope: string;
  groups: string;
}

export interface Target {
  id: string;
  domain: string;
  group: 'OF' | 'SH' | 'REP';
  subtype: string;
  what_kr: string;
  what_en: string;
  direction: string;
  icf: string;
  measures: string[];
  note: string;
}

export interface Ingredient {
  id: string;
  category: string;
  name_kr: string;
  name_en: string;
  description: string;
  dosing_parameters: string;
  recommended_dose: string;
  refs: string;
}

export interface Mechanism {
  id: string;
  level: string;
  category: string;
  name_kr: string;
  name_en: string;
  causal_chain: string;
  operating_conditions: string;
  typical_targets: string;
  evidence_level: string;
  refs: string;
  doc_phrase: string;
}

export interface Link {
  id: string;
  domain: string;
  target: string;
  primary_ingredients: string[];
  support_ingredients: string[];
  mechanisms: string[];
  recommended_dose: string;
  progression: string;
  guideline_recs: string;
  refs: string;
  strength: string;
  note: string;
}

export interface Outcome {
  id: string;
  name_kr: string;
  name_en: string;
  icf_level: string;
  domains: string;
  note: string;
}

interface RtssSeed {
  groups: Record<string, { en: string; kr: string; definition: string }>;
  domains: Domain[];
  targets: Target[];
  ingredients: Ingredient[];
  mechanisms: Mechanism[];
  links: Link[];
  outcomes: Outcome[];
  references: Array<{ id: string; citation: string; type: string; url: string; key_points: string }>;
}

const v21IcfCorrections: Record<string, string> = {
  T004: 'b7300',
  T018: 'b156',
  T035: 'd465, e1201',
  T039: 'd4107, d4100, d4103',
  T053: 'd6601, e310, e340',
  T054: 'pf',
  T055: 'd5702',
  T057: 'pf',
  T060: 'pf, d5702, e1201',
  T069: 'pf, e310, e340',
};

const seed = rawSeed as RtssSeed;

export const rtss = {
  ...seed,
  targets: seed.targets.map((target) => ({
    ...target,
    icf: v21IcfCorrections[target.id] ?? target.icf,
  })),
  outcomes: [
    ...seed.outcomes,
    {
      id: 'O36',
      name_kr: '뇌졸중 영향 척도',
      name_en: 'Stroke Impact Scale (SIS)',
      icf_level: '신체기능·활동·참여',
      domains: '전체',
      note: '환자보고 결과. 문항·버전과 측정조건을 함께 기록',
    },
    {
      id: 'O37',
      name_kr: '미국 국립보건원 뇌졸중 척도',
      name_en: 'NIH Stroke Scale (NIHSS)',
      icf_level: '신체기능',
      domains: '전체',
      note: '신경학적 중증도 지표이며 물리치료 반응 단독 지표로 해석하지 않음',
    },
  ],
};

export const groupLabel = (group: string) =>
  group === 'OF' ? '몸의 기능' : group === 'SH' ? '기술·습관' : '생각·지식·동기';

export const icfComponent = (code: string): 'b' | 's' | 'd' | 'e' | 'pf' => {
  const normalized = code.trim().toLowerCase();
  if (normalized.startsWith('pf')) return 'pf';
  if (normalized.startsWith('s')) return 's';
  if (normalized.startsWith('d')) return 'd';
  if (normalized.startsWith('e')) return 'e';
  return 'b';
};

export const splitIcfCodes = (raw: string) =>
  raw.match(/(?:^|\b)(?:[bsde]\d+|pf)(?:\b|$)/gi)?.map((item) => item.trim().toLowerCase()) ?? [];
