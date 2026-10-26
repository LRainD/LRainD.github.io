/**
 * 清单行 → 标准物料 的匹配。
 *
 * 两条通道：
 * 1. AI：把候选标准物料压成紧凑文本随 prompt 一起发给大模型，按批返回 code + 置信度 + 判断依据；
 * 2. 本地兜底：AI 通道不可用（未起 dev server / 网关报错）时按别名与规格关键词打分，
 *    保证「上传 → 解析 → 引用」这条演示动线不会整段失败。
 *
 * 注意：本文件只走 ai/llm.ts 的 HTTP 通道，不要引入任何 `import()` 动态导入。
 * 该页面会被导出为单文件 iife（ENTRY_KEY 单入口构建），iife 不支持代码分割，
 * 出现动态导入就会构建失败（导出时报 Failed to fetch code: Internal Server Error）。
 */
import type { AiConfig } from './config';
import { chatCompletion, extractJson } from './llm';
import type { RawItem } from './decompose';
import type { PriceRecord, StandardMaterial } from '../data';

export const MATCH_BATCH_SIZE = 10;

export type MatchOutcome = {
  /** 命中的标准物料编码；空字符串表示未匹配 */
  code: string;
  confidence: number;
  /** AI（或本地兜底）给出的匹配依据 */
  reason: string;
  /** 原文与标准物料之间的差异，用于提示人工核对 */
  gap: string;
};

export type MatchedRow = RawItem & MatchOutcome;

export type MatchCatalog = {
  standards: StandardMaterial[];
  prices: PriceRecord[];
};

const clamp = (value: unknown): number => {
  const num = Math.round(Number(value));
  if (!Number.isFinite(num)) return 0;
  return Math.min(100, Math.max(0, num));
};

/** 候选库压成单行文本：编码｜名称｜品类｜规格｜别名，省 token 又好读 */
const catalogLine = (item: StandardMaterial) =>
  `${item.code}｜${item.name}｜${item.category}｜规格:${item.attributes.join('、')}｜别名:${item.synonyms.join('、') || '无'}`;

const MATCH_SYSTEM = `你是建筑工程物资采购领域的标准物料匹配专家。给定一批「清单行」和一份「标准物料候选库」，为每一行选出最匹配的标准物料。

规则：
1. 只能从候选库中挑选，code 必须原样取自候选库；如果没有任何候选在品类 + 关键规格上成立，code 返回空字符串，不要勉强匹配。
2. 关键规格冲突即视为不匹配：牌号（HRB400E / HPB300）、直径、强度等级、公称直径、芯数截面、功率、砌块尺寸不一致时不要选它。
3. 写法差异属于同一物料：如「三级抗震螺纹钢20」= HRB400E Φ20mm、「普硅42.5」= P.O 42.5、「焊管DN100」= Q235B 焊接钢管 DN100，但必须在 reason 里写明归一依据。
4. confidence 取 0-100 整数：编码与规格完全对应 ≥90；靠别名/简称推断 70-89；只有品类一致 40-69；无匹配 0。
5. gap 写原文缺失或与标准物料不一致的地方（例如「原文未写牌号」「原文未写长度」），没有差异留空字符串。
6. 只输出 JSON，不要解释，不要 markdown 代码块。输出结构：
{"items":[{"idx":0,"code":"STD-GJ-000129","confidence":92,"reason":"归一依据","gap":""}]}`;

const buildUserPrompt = (rows: RawItem[], catalog: StandardMaterial[]) => {
  const payload = rows.map(row => ({
    idx: row.idx,
    name: row.raw,
    spec: row.spec,
    unit: row.unit,
    qty: row.quantity,
    price: row.price
  }));
  return `标准物料候选库（${catalog.length} 条）：
${catalog.map(catalogLine).join('\n')}

清单行（${rows.length} 条，请在输出中原样带回 idx）：
${JSON.stringify(payload)}`;
};

/** 抽取用于比对的数字规格：Φ25 / 42.5 / 4×25+1×16 / 600×200×200 都能拿到 */
const NUMERIC_TOKEN = /\d+(?:\.\d+)?/g;

const normalizeText = (text: string) =>
  text
    .toLowerCase()
    .replace(/[（(]/g, '(')
    .replace(/[）)]/g, ')')
    .replace(/[×*]/g, 'x')
    .replace(/\s+/g, '');

const numbersOf = (text: string) => {
  const hits: string[] = [];
  const matched = normalizeText(text).match(NUMERIC_TOKEN);
  if (matched) matched.forEach(value => hits.push(value.replace(/\.0+$/, '')));
  return hits;
};

const CATEGORY_WORDS = ['钢筋', '螺纹钢', '圆钢', '水泥', '钢管', '焊管', '镀锌', '电缆', '电线', '灯', '砌块', '加气块', '砂', '石子'];

/**
 * 本地兜底匹配：别名 > 品类词 + 规格数字。
 * 只保证「有明显对应关系」的行走得通，置信度上限 85，避免冒充 AI 结论。
 */
export const matchLocally = (row: RawItem, catalog: StandardMaterial[]): MatchOutcome => {
  const text = normalizeText(`${row.raw} ${row.spec}`);
  const rowNumbers = numbersOf(text);

  let best: { item: StandardMaterial; score: number; reason: string } | null = null;

  catalog.forEach(item => {
    let score = 0;
    const reasons: string[] = [];

    const alias = item.synonyms.find(word => {
      const normalized = normalizeText(word);
      return normalized.length >= 3 && text.includes(normalized);
    });
    if (alias) {
      score += 50;
      reasons.push(`命中历史叫法「${alias}」`);
    }

    const categoryHit = CATEGORY_WORDS.find(word => text.includes(word) && item.category.includes(word));
    if (categoryHit) {
      score += 20;
      reasons.push(`品类词「${categoryHit}」一致`);
    }

    const itemNumbers = numbersOf(`${item.name} ${item.attributes.join(' ')}`);
    const shared = Array.from(new Set(itemNumbers.filter(value => rowNumbers.includes(value))));
    if (shared.length) {
      score += Math.min(30, shared.length * 15);
      reasons.push(`规格 ${shared.join('、')} 对上`);
    }

    if (score > (best?.score ?? 0)) best = { item, score, reason: reasons.join('；') };
  });

  if (!best) return { code: '', confidence: 0, reason: '本地兜底未找到候选', gap: '' };
  const picked: { item: StandardMaterial; score: number; reason: string } = best;
  if (picked.score < 35) {
    return { code: '', confidence: 0, reason: '本地兜底相似度过低，未匹配', gap: '' };
  }
  return {
    code: picked.item.code,
    confidence: Math.min(85, 40 + picked.score),
    reason: `本地兜底：${picked.reason}`,
    gap: 'AI 通道不可用，建议人工复核'
  };
};

export type MatchOptions = {
  config: AiConfig;
  rows: RawItem[];
  catalog: StandardMaterial[];
  signal?: AbortSignal;
  /** 每批返回后回调，便于前端逐批刷新表格 */
  onBatchDone?: (batchIndex: number, totalBatches: number, rows: MatchedRow[]) => void;
};

/**
 * 串行分批调用大模型完成匹配。
 * 单批失败不中断整体流程，该批自动降级为本地兜底并标注原因。
 */
export const matchRowsWithAi = async (options: MatchOptions): Promise<MatchedRow[]> => {
  const { config, rows, catalog, signal, onBatchDone } = options;
  const result: MatchedRow[] = [];
  const totalBatches = Math.ceil(rows.length / MATCH_BATCH_SIZE);

  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex += 1) {
    if (signal?.aborted) {
      const abort = new Error('已停止解析');
      abort.name = 'AbortError';
      throw abort;
    }
    const batch = rows.slice(batchIndex * MATCH_BATCH_SIZE, (batchIndex + 1) * MATCH_BATCH_SIZE);

    let outcomes: MatchOutcome[] = [];
    try {
      const content = await chatCompletion({
        config,
        system: MATCH_SYSTEM,
        user: buildUserPrompt(batch, catalog),
        // deepseek-flash 是推理模型，token 大量消耗在 reasoning 上，给少了正文会为空
        maxTokens: 8000,
        temperature: 0,
        signal
      });
      const parsed = extractJson<{ items?: any[] }>(content);
      const aiItems = Array.isArray(parsed?.items) ? parsed.items : [];
      outcomes = batch.map((row, position) => {
        const matched = aiItems.find(candidate => Number(candidate?.idx) === row.idx) ?? aiItems[position];
        if (!matched) {
          return { code: '', confidence: 0, reason: 'AI 未返回该行结果', gap: '' };
        }
        const code = String(matched.code ?? '').trim();
        const exists = catalog.some(item => item.code === code);
        return {
          // 模型偶尔会编造编码，命中不到候选库一律按未匹配处理
          code: exists ? code : '',
          confidence: exists ? clamp(matched.confidence) : 0,
          reason: String(matched.reason ?? '').trim().slice(0, 60),
          gap: String(matched.gap ?? '').trim().slice(0, 60)
        };
      });
    } catch (error) {
      if ((error as Error).name === 'AbortError') throw error;
      outcomes = batch.map(row => matchLocally(row, catalog));
    }

    const matchedRows = batch.map((row, index) => ({ ...row, ...outcomes[index] }));
    result.push(...matchedRows);
    onBatchDone?.(batchIndex, totalBatches, matchedRows);
  }

  return result;
};

export type CatalogDetail = {
  material: StandardMaterial;
  records: PriceRecord[];
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  latestDate: string;
};

/** 把编码还原成「物料 + 历史价格」明细，供引用弹窗展开行展示 */
export const buildCatalogMap = (catalog: MatchCatalog): Map<string, CatalogDetail> => {
  const map = new Map<string, CatalogDetail>();
  catalog.standards.forEach(material => {
    const records = catalog.prices.filter(record => record.materialCode === material.code);
    const prices = records.map(record => record.unitPrice);
    const avgPrice = prices.length ? prices.reduce((sum, price) => sum + price, 0) / prices.length : 0;
    map.set(material.code, {
      material,
      records: records.slice().sort((a, b) => b.signDate.localeCompare(a.signDate)),
      avgPrice,
      minPrice: prices.length ? Math.min(...prices) : 0,
      maxPrice: prices.length ? Math.max(...prices) : 0,
      latestDate: records.length ? records.slice().sort((a, b) => b.signDate.localeCompare(a.signDate))[0].signDate : ''
    });
  });
  return map;
};
