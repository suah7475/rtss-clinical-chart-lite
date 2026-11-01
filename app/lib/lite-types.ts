export type RecoveryPhase = '' | 'hyperacute' | 'acute' | 'early_subacute' | 'late_subacute' | 'chronic';

export type MeasurementStatus = '' | 'completed' | 'stopped' | 'not_tested';
export type SafetyStatus = '' | 'none' | 'event' | 'treatment_stopped' | 'not_delivered';
export type NextDecision = '' | 'maintain' | 'progress' | 'adjust' | 'hold';

export interface LiteIngredient {
  id: string;
  label: string;
  custom: boolean;
}

export interface LiteRecord {
  caseCode: string;
  recordDate: string;
  aim: string;
  domainId: string;
  targetId: string;
  targetLabel: string;
  targetDirection: string;
  ingredients: LiteIngredient[];
  mechanismId: string;
  mechanismLabel: string;
  actualDose: string;
  response: string;
  measurementStatus: MeasurementStatus;
  outcomeId: string;
  outcomeLabel: string;
  outcomeValue: string;
  outcomeUnit: string;
  outcomeCondition: string;
  measurementReason: string;
  safetyStatus: SafetyStatus;
  safetyDetail: string;
  nextDecision: NextDecision;
  decisionReason: string;
  nextPlan: string;
  icfCodes: string;
}

export interface CustomCatalog {
  targets: string[];
  ingredients: string[];
  mechanisms: string[];
  outcomes: string[];
}

export interface SavedSnapshot {
  id: string;
  copiedAt: string;
  caseCode: string;
  recordDate: string;
  note: string;
}

export interface LiteStore {
  schemaVersion: 1;
  /** 저장 당시 기준정보 DB 버전. 없으면 v3.2 이전 자료입니다. */
  dataVersion?: string;
  draft: LiteRecord;
  customCatalog: CustomCatalog;
  snapshots: SavedSnapshot[];
  updatedAt: string;
}

export interface MissingField {
  key: keyof LiteRecord | 'ingredients';
  label: string;
  elementId: string;
}
