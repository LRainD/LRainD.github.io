/**
 * 相似标准匹配。
 *
 * 治理工作台（属性还可编辑）和入库审核页（查看专家提交的组装结果）都要回答同一个问题：
 * 「这条商品和标准物料库里的哪条最像、差在哪」。所以把比对逻辑抽到这里，两边共用。
 *
 * 比对前属性名会先归一：当前属性名 + 已登记同义词 + 内置常见写法（defaultAtomSynonyms），
 * 只要命中标准侧的属性名就算同一属性——这正是「历史文件写法不同、其实是同一规格」的落点。
 */
import {
  defaultAtomSynonyms,
  type PriceRecord,
  type StandardMaterial,
  type SubmissionChange
} from './data';

/** 参与比对的最小属性结构：Atom 与审核快照里的属性都能直接传入 */
export type ComparableAtom = { label: string; value: string; synonyms?: string[] };

export type CompareState = 'same' | 'diff' | 'missing' | 'extra';

export type SimilarCompare = {
  label: string;
  mine: string;
  theirs: string;
  state: CompareState;
};

/** 相似标准推荐的一条候选（列表行用概要，展开用明细） */
export type SimilarItem = {
  key: string;
  code: string;
  name: string;
  category: string;
  score: number;
  /** 属性名一致且值相同的条数 */
  same: number;
  /** 当前商品参与对比的属性条数 */
  total: number;
  compare: SimilarCompare[];
  priceCount: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  latest?: PriceRecord;
  /** 命中的商品历史叫法，说明这条标准就是历史文件里那种写法 */
  synonymHit: string | null;
  reason: string;
  synonyms: string[];
};

/** 标准物料的「牌号：HRB400E」→ { label, value }，用于和当前商品逐项对比 */
export const parseAttr = (text: string) => {
  const at = text.indexOf('：');
  if (at <= 0) return { label: '规格', value: text };
  return { label: text.slice(0, at), value: text.slice(at + 1) };
};

/** 比较属性值时的归一化：忽略空格与大小写，mm / MM 视为同一写法 */
export const normValue = (text: string) => text.replace(/\s/g, '').toLowerCase();

/** 属性名的全部写法：当前名 + 已登记同义词 + 内置常见写法（任一命中即视为同一属性） */
const aliasOf = (atom: ComparableAtom) => [
  atom.label,
  ...(atom.synonyms ?? []),
  ...(defaultAtomSynonyms[atom.label] ?? [])
];

/** 由标准库 + 价格记录算出相似候选：属性名支持同义词归一后再比对 */
export const buildSimilarItems = (
  standards: StandardMaterial[],
  prices: PriceRecord[],
  atoms: ComparableAtom[],
  materialSynonyms: string[]
): SimilarItem[] => {
  const pairs = atoms.filter(atom => atom.label !== '品类');
  if (!pairs.length) return [];
  return standards
    .map(std => {
      const attrs = std.attributes.map(parseAttr);
      const compare: SimilarCompare[] = [];
      const matched = new Set<string>();
      let score = 0;
      pairs.forEach(atom => {
        // 当前属性名 + 已登记同义词 + 内置常见写法，任一命中标准侧的属性名即算同一属性
        const alias = [atom.label, ...(atom.synonyms ?? []), ...(defaultAtomSynonyms[atom.label] ?? [])];
        const hit = attrs.find(attr => alias.includes(attr.label));
        if (!hit) {
          compare.push({ label: atom.label, mine: atom.value, theirs: '', state: 'missing' });
          return;
        }
        matched.add(hit.label);
        const same = normValue(hit.value) === normValue(atom.value);
        score += same ? 1 : 0.6;
        compare.push({ label: atom.label, mine: atom.value, theirs: hit.value, state: same ? 'same' : 'diff' });
      });
      attrs.forEach(attr => {
        if (!matched.has(attr.label)) {
          compare.push({ label: attr.label, mine: '', theirs: attr.value, state: 'extra' });
        }
      });

      const records = prices
        .filter(record => record.materialCode === std.code)
        .slice()
        .sort((a, b) => b.signDate.localeCompare(a.signDate));
      const values = records.map(record => record.unitPrice);
      const diffs = compare.filter(row => row.state === 'diff');
      const missing = compare.filter(row => row.state === 'missing');
      const extra = compare.filter(row => row.state === 'extra');
      const reason = (() => {
        if (!diffs.length && !missing.length && !extra.length) {
          return '属性与本商品逐项一致，入库前建议直接关联该标准物料，避免重复建档。';
        }
        const parts: string[] = [];
        if (diffs.length) {
          parts.push(
            `需确认的取值差异：${diffs.map(row => `${row.label}（当前 ${row.mine || '空'} / 标准 ${row.theirs}）`).join('；')}`
          );
        }
        if (missing.length) {
          parts.push(`本商品有、该标准没登记的属性：${missing.map(row => row.label).join('、')}，对齐后会补进该标准`);
        }
        if (extra.length) {
          parts.push(`该标准多出的属性：${extra.map(row => `${row.label}：${row.theirs}`).join('、')}`);
        }
        return parts.join('。');
      })();

      return {
        key: std.key,
        code: std.code,
        name: std.name,
        category: std.category,
        score: Math.round((score / pairs.length) * 100),
        same: compare.filter(row => row.state === 'same').length,
        total: pairs.length,
        compare,
        priceCount: records.length,
        avgPrice: values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0,
        minPrice: values.length ? Math.min(...values) : 0,
        maxPrice: values.length ? Math.max(...values) : 0,
        latest: records[0],
        synonymHit: materialSynonyms.find(word => std.synonyms.includes(word)) ?? null,
        reason,
        synonyms: std.synonyms
      };
    })
    .filter(item => item.score >= 40)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
};

/* ========== 新增建档 vs 修改已有物料 ========== */

/**
 * 算出「本次组装结果」相对某条标准物料的差异。
 *
 * 业务场景：专家组装时发现标准库里已有同一件商品，这次不是新建，而是给那条物料打补丁——
 * 可能只是改属性值，可能补了新属性，也可能只是登记了历史叫法。
 * 提交时用它算一次并快照进提交单，审核页因此能逐条核对「到底改了什么」。
 *
 * 约定：
 * - 「品类」不参与比较：它体现在标准物料的品类路径里，不是规格属性；
 * - 提交值为空的属性视为「本次不改这一项」，不会把标准库里的值清空；
 * - 同义词只记「标准侧还没有的」，避免审核页被已有的历史叫法噪音淹没。
 */
export const diffStandardChanges = (
  atoms: ComparableAtom[],
  materialSynonyms: string[],
  standard: StandardMaterial
): SubmissionChange[] => {
  const pairs = atoms.filter(atom => atom.label !== '品类');
  const attrs = standard.attributes.map(parseAttr);
  const changes: SubmissionChange[] = [];

  pairs.forEach(atom => {
    const value = atom.value.trim();
    const alias = aliasOf(atom);
    const hit = attrs.find(attr => alias.includes(attr.label));

    if (!hit) {
      // 标准里没有这条属性 → 新增属性（值为空则不提交，避免落成「待补充」噪声）
      if (value) changes.push({ kind: 'add-atom', label: atom.label, after: value });
      return;
    }
    if (!value) return;

    if (normValue(hit.value) !== normValue(value)) {
      changes.push({
        kind: 'value',
        label: hit.label,
        alias: hit.label === atom.label ? undefined : atom.label,
        before: hit.value,
        after: value
      });
    }

    // 属性同义词：标准侧已登记的 + 内置常见写法都算「已有」，只报新增的
    const known = new Set([
      ...(standard.attributeSynonyms?.[hit.label] ?? []),
      ...(defaultAtomSynonyms[hit.label] ?? [])
    ]);
    const fresh = (atom.synonyms ?? []).map(word => word.trim()).filter(word => word && !known.has(word));
    if (fresh.length) changes.push({ kind: 'atom-synonym', label: hit.label, words: fresh });
  });

  // 商品名称的历史叫法：同理只报新增
  const freshName = materialSynonyms
    .map(word => word.trim())
    .filter(word => word && !standard.synonyms.includes(word));
  if (freshName.length) changes.push({ kind: 'name-synonym', words: freshName });

  return changes;
};

/** 变更类型的展示名：治理台的提交确认框、审核页的变更表共用同一套口径 */
export const changeKindText: Record<SubmissionChange['kind'], string> = {
  value: '改值',
  'add-atom': '新增属性',
  'atom-synonym': '属性同义词',
  'name-synonym': '商品叫法'
};

export type ChangeSummary = {
  /** 改了几条属性值 */
  value: number;
  /** 新增了几条属性 */
  addAtom: number;
  /** 新增了几条历史叫法（属性级 + 商品级合计） */
  synonym: number;
  /** 明细条数，0 表示与目标标准完全一致 */
  total: number;
};

export const summarizeChanges = (changes: SubmissionChange[]): ChangeSummary => ({
  value: changes.filter(change => change.kind === 'value').length,
  addAtom: changes.filter(change => change.kind === 'add-atom').length,
  synonym: changes.reduce(
    (sum, change) => sum + (change.kind === 'atom-synonym' || change.kind === 'name-synonym' ? change.words?.length ?? 0 : 0),
    0
  ),
  total: changes.length
});

/** 「改值 1 项 · 新增属性 1 项 · 新增历史叫法 2 条」这类一句话摘要，治理台与审核页共用 */
export const describeChanges = (changes: SubmissionChange[]) => {
  const summary = summarizeChanges(changes);
  const parts: string[] = [];
  if (summary.value) parts.push(`改值 ${summary.value} 项`);
  if (summary.addAtom) parts.push(`新增属性 ${summary.addAtom} 项`);
  if (summary.synonym) parts.push(`新增历史叫法 ${summary.synonym} 条`);
  return parts.length ? parts.join(' · ') : '与目标标准一致，无属性变更';
};

/**
 * 把提交结果合并进目标标准物料。
 *
 * 通过审核时只合「属性 / 属性同义词 / 商品历史叫法」并刷新更新时间；
 * 标准编码、名称、品类路径、价格记录都保持不变 —— 这是「修改」与「新建」的关键区别。
 */
export const mergeStandard = (
  standard: StandardMaterial,
  atoms: ComparableAtom[],
  synonyms: string[],
  today: string
): StandardMaterial => {
  const attributes = standard.attributes.slice();
  const attributeSynonyms: Record<string, string[]> = { ...(standard.attributeSynonyms ?? {}) };

  atoms
    .filter(atom => atom.label !== '品类' && atom.value.trim())
    .forEach(atom => {
      const value = atom.value.trim();
      const alias = aliasOf(atom);
      const at = attributes.findIndex(text => alias.includes(parseAttr(text).label));
      const label = at >= 0 ? parseAttr(attributes[at]).label : atom.label;
      if (at >= 0) attributes[at] = `${label}：${value}`;
      else attributes.push(`${label}：${value}`);

      const words = (atom.synonyms ?? []).map(word => word.trim()).filter(Boolean);
      if (words.length) {
        attributeSynonyms[label] = Array.from(new Set([...(attributeSynonyms[label] ?? []), ...words]));
      }
    });

  return {
    ...standard,
    attributes,
    synonyms: Array.from(new Set([...standard.synonyms, ...synonyms.map(word => word.trim()).filter(Boolean)])),
    attributeSynonyms,
    updatedAt: today
  };
};
