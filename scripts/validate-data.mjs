import { readFile } from 'node:fs/promises';

const source = new URL('../app/data/rtss-seed.json', import.meta.url);
const data = JSON.parse(await readFile(source, 'utf8'));

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
const linkIds = idSet(data.links, 'Link');
const outcomeIds = idSet(data.outcomes, 'Outcome');

assert(data.targets.every((target) => domainIds.has(target.domain)), '모든 Target의 Domain 참조 유효');
assert(data.targets.every((target) => target.measures.every((id) => outcomeIds.has(id))), '모든 Target의 평가도구 참조 유효');
assert(data.links.every((link) => targetIds.has(link.target)), '모든 Link의 Target 참조 유효');
assert(data.links.every((link) => domainIds.has(link.domain)), '모든 Link의 Domain 참조 유효');
assert(data.links.every((link) => link.primary_ingredients.every((id) => ingredientIds.has(id))), '모든 Link의 주 성분 참조 유효');
assert(data.links.every((link) => link.support_ingredients.every((id) => ingredientIds.has(id))), '모든 Link의 보조 성분 참조 유효');
assert(data.links.every((link) => link.mechanisms.every((id) => mechanismIds.has(id))), '모든 Link의 MoA 참조 유효');
assert(data.targets.every((target) => data.links.some((link) => link.target === target.id)), '모든 Target에 하나 이상의 Link 존재');
assert(linkIds.size === 97, '기본 Link 97개 확인');

console.log(`RTSS seed validation passed: ${checks.length} checks`);
console.log(`${data.domains.length} domains · ${data.targets.length} targets · ${data.ingredients.length} ingredients · ${data.mechanisms.length} MoA · ${data.links.length} links · ${data.outcomes.length} outcomes`);
