import { readFile } from 'node:fs/promises';

const source = new URL('../app/data/rtss-seed.json', import.meta.url);
const data = JSON.parse(await readFile(source, 'utf8'));
const guideSource = await readFile(new URL('../app/lib/baseline-guides.ts', import.meta.url), 'utf8');

const checks = [];
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
  checks.push(message);
};
const idSet = (items, label) => {
  const ids = new Set(items.map((item) => item.id));
  assert(ids.size === items.length, `${label}: 중복 ID 없음`);
  return ids;
};

const domainIds = idSet(data.domains, 'Domain');
const targetIds = idSet(data.targets, 'Target');
const ingredientIds = idSet(data.ingredients, 'Ingredient');
const mechanismIds = idSet(data.mechanisms, 'MoA');
idSet(data.links, 'Link');
const outcomeIds = idSet(data.outcomes, 'Outcome');

const expectedCounts = {
  domains: 12,
  targets: 85,
  ingredients: 114,
  mechanisms: 61,
  outcomes: 37,
  links: 97,
};
Object.entries(expectedCounts).forEach(([collection, count]) => {
  assert(data[collection].length === count, `${collection}: ${count}개 확인`);
});

const requireTextFields = (items, fields, label) => {
  assert(
    items.every((item) => fields.every((field) => typeof item[field] === 'string' && item[field].trim())),
    `${label}: 필수 텍스트 항목이 모두 채워짐`,
  );
};
const requireUniqueTextField = (items, field, label) => {
  const normalized = items.map((item) => item[field].normalize('NFKC').toLocaleLowerCase('ko-KR').trim());
  assert(new Set(normalized).size === normalized.length, `${label}: ${field} 중복 없음`);
};

requireTextFields(data.domains, ['id', 'kr', 'en', 'scope'], 'Domain');
requireTextFields(data.targets, ['id', 'domain', 'what_kr', 'what_en', 'direction'], 'Target');
requireTextFields(data.ingredients, ['id', 'name_kr', 'name_en', 'description'], 'Ingredient');
requireTextFields(data.mechanisms, ['id', 'name_kr', 'name_en', 'causal_chain'], 'MoA');
requireTextFields(data.outcomes, ['id', 'name_kr', 'name_en', 'icf_level'], 'Outcome');
requireTextFields(data.links, ['id', 'domain', 'target'], 'Link');
requireUniqueTextField(data.targets, 'what_kr', 'Target');
requireUniqueTextField(data.ingredients, 'name_kr', 'Ingredient');
requireUniqueTextField(data.mechanisms, 'name_kr', 'MoA');
requireUniqueTextField(data.outcomes, 'name_kr', 'Outcome');

assert(data.targets.every((target) => domainIds.has(target.domain)), '모든 Target의 Domain 참조 유효');
assert(data.targets.every((target) => target.measures.every((id) => outcomeIds.has(id))), '모든 Target의 평가도구 참조 유효');
assert(data.targets.every((target) => target.measures.length > 0), '모든 Target에 하나 이상의 결과측정 도구 연결');
assert(data.links.every((link) => targetIds.has(link.target)), '모든 Link의 Target 참조 유효');
assert(data.links.every((link) => domainIds.has(link.domain)), '모든 Link의 Domain 참조 유효');
assert(data.links.every((link) => link.primary_ingredients.every((id) => ingredientIds.has(id))), '모든 Link의 주 성분 참조 유효');
assert(data.links.every((link) => link.support_ingredients.every((id) => ingredientIds.has(id))), '모든 Link의 보조 성분 참조 유효');
assert(data.links.every((link) => link.mechanisms.every((id) => mechanismIds.has(id))), '모든 Link의 MoA 참조 유효');
assert(data.links.every((link) => link.primary_ingredients.length > 0 && link.mechanisms.length > 0), '모든 Link에 주 치료방법과 작용기전 연결');
assert(data.targets.every((target) => data.links.some((link) => link.target === target.id)), '모든 Target에 하나 이상의 Link 존재');
assert(
  data.links.every((link) => data.targets.find((target) => target.id === link.target)?.domain === link.domain),
  '모든 Link의 Domain이 연결된 Target의 Domain과 일치',
);
assert(data.domains.every((domain) => data.targets.some((target) => target.domain === domain.id)), '모든 Domain에 하나 이상의 Target 존재');

const targetLinkCounts = new Map();
data.links.forEach((link) => targetLinkCounts.set(link.target, (targetLinkCounts.get(link.target) ?? 0) + 1));
const extraLinkVariants = data.links.length - targetLinkCounts.size;
assert(extraLinkVariants === 12, '다중 Link 치료 구성 변형 12개 확인');
assert([...targetLinkCounts.values()].some((count) => count > 1), '다중 Link Target을 개별 변형으로 유지');
assert(
  [...targetLinkCounts.entries()].every(([targetId, count]) => data.links.filter((link) => link.target === targetId).length === count),
  '모든 Target의 Link 변형을 누락 없이 조회 가능',
);

const guideObjectStart = guideSource.indexOf('export const baselineGuides');
const guideObjectEnd = guideSource.indexOf('export const outcomeEasyNames', guideObjectStart);
assert(guideObjectStart >= 0 && guideObjectEnd > guideObjectStart, '기준선 가이드 자료 영역 확인');
const guideObjectSource = guideSource.slice(guideObjectStart, guideObjectEnd);
const guideIds = new Set([...guideObjectSource.matchAll(/^\s{2}(O\d{2}):\s*\{/gm)].map((match) => match[1]));
assert(data.outcomes.every((outcome) => guideIds.has(outcome.id)), '모든 Outcome에 기준선 가이드 존재');
assert([...guideIds].every((id) => outcomeIds.has(id)), '기준선 가이드에 고아 Outcome ID 없음');
assert(guideIds.size === expectedCounts.outcomes, '기준선 가이드 37개 확인');

console.log(`RTSS seed validation passed: ${checks.length} checks`);
console.log(`${data.domains.length} domains · ${data.targets.length} targets · ${data.ingredients.length} ingredients · ${data.mechanisms.length} MoA · ${data.links.length} links · ${data.outcomes.length} outcomes`);
