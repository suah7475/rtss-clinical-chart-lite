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

const seed = rawSeed as RtssSeed;

export const rtss = seed;

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
