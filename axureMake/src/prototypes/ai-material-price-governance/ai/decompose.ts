/**
 * 字段映射 + AI 原子化拆解。
 * - 表格文件：先用表头做字段映射，再按批把物料交给大模型拆解
 * - 文本文件（PDF）：每行作为候选物料直接拆解
 */
import type { AiConfig } from './config';
import { chatCompletion, extractJson, type StreamProgress } from './llm';
import type { SheetTable } from './extract';

export type FieldKey = 'name' | 'spec' | 'unit' | 'quantity' | 'price';

export const FIELD_DEFS: Array<{ key: FieldKey; label: string; aliases: string[]; hint: string }> = [
  { key: 'name', label: '物料名称', aliases: ['物料名称', '材料名称', '商品名称', '产品名称', '设备名称', '清单名称', '名称', '品名', '材料', '设备'], hint: '必填，拆解主依据' },
  // 报价表常把规格写在「项目特征」里，清单表则用「规格型号」；别名按具体→宽泛排序
  { key: 'spec', label: '规格型号', aliases: ['规格型号', '规格及型号', '规格描述', '项目特征描述', '特征描述', '项目特征', '技术参数', '规格', '型号', '参数', '特征'], hint: '影响拆解质量' },
  { key: 'unit', label: '计量单位', aliases: ['计量单位', '单位名称', '计价单位', '单位'], hint: '选填' },
  { key: 'quantity', label: '数量', aliases: ['工程数量', '采购数量', '需求数量', '工程量', '数量'], hint: '选填，用于体量统计' },
  { key: 'price', label: '含税单价', aliases: ['含税单价', '综合单价', '含税价', '单价', '报价', '价格'], hint: '选填，用于价格比对' }
];

export const emptyMapping = (): Record<FieldKey, string> => ({ name: '', spec: '', unit: '', quantity: '', price: '' });

export const MAX_ITEMS = 30;
export const BATCH_SIZE = 8;

export type RawItem = {
  key: string;
  idx: number;
  raw: string;
  spec: string;
  unit: string;
  quantity: string;
  price: string;
};

export type AtomResult = { label: string; value: string; confidence: number };

export type DecomposeStatus = 'pending' | 'running' | 'done' | 'error';

export type DecomposedItem = RawItem & {
  name: string;
  category: string;
  atoms: AtomResult[];
  confidence: number;
  status: DecomposeStatus;
  error?: string;
};

const clamp = (value: unknown): number => {
  const num = Math.round(Number(value));
  if (!Number.isFinite(num)) return 80;
  return Math.min(100, Math.max(0, num));
};

const dedupe = (headers: string[]) => Array.from(new Set(headers.filter(Boolean)));

/** 基于表头关键词的本地映射，作为 AI 识别失败时的兜底 */
export const guessMapping = (headers: string[]): Record<FieldKey, string> => {
  const result = emptyMapping();
  const used = new Set<string>();
  const normalized = headers.map(header => ({ header, text: header.replace(/\s+/g, '') }));
  // 「单价」会命中「不含税单价」，加了否定词的表头必须等价的别名才允许匹配
  const negated = (text: string) => /不含|未含|除税/.test(text);

  FIELD_DEFS.forEach(def => {
    let hit: { header: string; text: string } | undefined;
    // 按别名从具体到宽泛逐层尝试，避免「单价」抢先命中「单价-不含税单价」
    for (const alias of def.aliases) {
      hit = normalized.find(item => !used.has(item.header) && item.text === alias);
      if (hit) break;
    }
    if (!hit) {
      for (const alias of def.aliases) {
        const candidates = normalized.filter(
          item =>
            !used.has(item.header) &&
            item.text.includes(alias) &&
            (!negated(item.text) || negated(alias))
        );
        // 同分时取最短表头：「单价-含税单价」比「单价-不含税单价」更贴近「含税单价」
        hit = candidates.sort((a, b) => a.text.length - b.text.length)[0];
        if (hit) break;
      }
    }
    if (hit) {
      result[def.key] = hit.header;
      used.add(hit.header);
    }
  });
  return result;
};

const cellAt = (row: string[], headers: string[], header?: string) => {
  if (!header) return '';
  const index = headers.indexOf(header);
  if (index < 0) return '';
  return (row[index] || '').trim();
};

/**
 * 非物料行：清单里的合计行、质量标准、付款/发票/供货条款、签章落款等。
 * 这类行也带「名称」，不剔除会被当成物料送去拆解，既浪费 token 又污染治理结果。
 */
const NOISE_ROW =
  /^(合计|小计|总计|总价|含税合计|不含税合计|质量标准|质量要求|技术要求|付款方式|付款条件|结算方式|发票|税金|税率|供货时间|交货期|交货时间|其它事项|其他事项|其它说明|其他说明|备注|说明|编制|审核|批准|制表|供应商|供货商|联系人|联系电话|电话|签字|盖章|报价时间|报价日期|日期|买方|卖方|甲方|乙方|项目名称|工程名称|工程概况|注[:：]?|一、|二、|三、)/;

const isNoiseRow = (text: string) => {
  const flatText = text.replace(/\s+/g, '');
  if (!flatText) return true;
  if (NOISE_ROW.test(flatText)) return true;
  // 表单标签行：以冒号结尾（响应单位（盖章）：/ 报价人：/ 日期：）—— 名称列会被误读成物料
  if (/[：:]$/.test(flatText)) return true;
  // 签章、经办类落款行
  if (/(盖章|签字|签名|报价单位|响应单位|投标单位|编制人|审核人|负责人)/.test(flatText)) return true;
  // 纯数字 / 纯符号行（序号、页码残留）
  return /^[\d.\-—–_/、,，:：()（）]+$/.test(flatText);
};

export type RawItemResult = { items: RawItem[]; skipped: string[] };

export const buildRawItems = (table: SheetTable, mapping: Record<FieldKey, string>): RawItemResult => {
  const headers = table.headers;
  const items: RawItem[] = [];
  const skipped: string[] = [];
  table.rows.forEach(row => {
    const name = cellAt(row, headers, mapping.name);
    const fallback = row.filter(cell => cell !== '').slice(0, 3).join(' ');
    const raw = (mapping.name ? name : '') || fallback;
    if (!raw) return;
    if (isNoiseRow(raw)) {
      skipped.push(raw.slice(0, 20));
      return;
    }
    items.push({
      key: `raw-${items.length}`,
      idx: items.length,
      raw,
      spec: cellAt(row, headers, mapping.spec),
      unit: cellAt(row, headers, mapping.unit),
      quantity: cellAt(row, headers, mapping.quantity),
      price: cellAt(row, headers, mapping.price)
    });
  });
  return { items: items.slice(0, MAX_ITEMS), skipped };
};

export const buildItemsFromLines = (lines: string[]): RawItem[] =>
  lines
    .map(line => line.trim())
    .filter(line => line && !isNoiseRow(line))
    .slice(0, MAX_ITEMS)
    .map((raw, index) => ({ key: `raw-${index}`, idx: index, raw, spec: '', unit: '', quantity: '', price: '' }));

const MAPPING_SYSTEM = `你是招投标与物资采购场景的表格结构识别助手。
请从给定表头与样例行中，判断业务字段对应的列名：
- name：物料/材料名称列
- spec：规格型号或技术参数列
- unit：计量单位列
- quantity：数量列
- price：含税单价或综合单价列
规则：只能使用给定表头中的原始文字作为列名；无法判断的字段返回空字符串，不要臆造列名。
只输出 JSON，不要解释，不要 markdown 代码块。输出结构：
{"mapping":{"name":"列名","spec":"列名","unit":"列名","quantity":"列名","price":"列名"}}`;

export const mapColumnsWithAi = async (params: {
  config: AiConfig;
  headers: string[];
  samples: string[][];
  signal?: AbortSignal;
}): Promise<Record<FieldKey, string>> => {
  const headers = dedupe(params.headers);
  const user = `表头：${JSON.stringify(headers)}\n样例行：${JSON.stringify(params.samples.slice(0, 3))}`;
  const content = await chatCompletion({
    config: params.config,
    system: MAPPING_SYSTEM,
    user,
    maxTokens: 2000,
    temperature: 0,
    signal: params.signal
  });
  const parsed = extractJson<{ mapping?: Record<string, unknown> }>(content);
  const mapping = emptyMapping();
  (Object.keys(mapping) as FieldKey[]).forEach(key => {
    const value = String(parsed?.mapping?.[key] ?? '').trim();
    if (value && headers.includes(value)) mapping[key] = value;
  });
  return mapping;
};

const ATOM_SYSTEM = `你是建筑工程与物资采购领域的物料标准化专家。你的任务是把原始物料描述拆解为“原子属性”——即可以独立比价、可以组合成标准物料名的最小属性单元。

规则：
1. 每条物料输出 3-8 个原子属性，第一个属性必须是“品类”。
2. label 使用 2-6 个中文字，例如：品类、材质、牌号、直径、壁厚、长度、宽度、厚度、强度等级、功率、电压、灯头口径、色温、防护等级、连接方式、表面处理、执行标准、特性、安装方式、压力、用途。
3. value 必须归一化、可枚举，不包含品牌、产地、供应商：Φ25mm、22W、E27、HRB400E、P.O 42.5、Q235B、DN100、2.0MPa、暖光、嵌入式。
4. 品牌、产地、供应商、价格、数量、单位不要作为原子属性。
5. confidence 为 0-100 的整数；原文缺失、靠行业经验推断的属性必须 ≤75。
6. 只输出 JSON，不要解释，不要 markdown 代码块。

归一化硬约束（同一品类必须写法一致）：
- 区间统一用波浪号：Φ8~Φ10mm（禁止 Φ8-10mm、Φ8至Φ10mm）；单一规格保留 Φ25mm。
- 「XX以内」表示上限：牌号 HRB400以内 → ≤HRB400；直径 Φ10以内 → ≤Φ10mm。
- 「XX及以上」表示下限：Φ28及以上 → ≥Φ28mm。
- 「综合」「/」表示可选牌号集：HRB400/HRB400E综合 → HRB400/HRB400E。
- 不要输出「综合」「以内」「以上」这类原词作为属性值，必须转成 ≤ ≥ ~ 符号。
- 同品类物料输出同一组属性：钢筋固定为 品类、牌号、直径、表面形状、用途（HPB300 表面形状为光圆，HRB400/HRB500 为带肋；无牌号时按直径推断并降低置信度）。
- 原文没写牌号时不要猜具体牌号，省略牌号属性，该条整体置信度 ≤70。
- 用途按固定枚举取值：建筑结构配筋、围护结构、装饰面层、安装辅材；同一类物料用同一个值，不要写变体。
- 原文没有、纯靠常识补的属性（如用途）置信度 ≤75，不要给 90 以上。

输出结构：
{"items":[{"idx":0,"category":"品类","atoms":[{"label":"品类","value":"钢筋","confidence":99}],"confidence":0}]}`;

const buildBatchPrompt = (batch: RawItem[]) => {
  const payload = batch.map(item => ({
    idx: item.idx,
    raw: item.raw,
    spec: item.spec,
    unit: item.unit
  }));
  return `请拆解以下 ${batch.length} 条物料（spec 为表格中的规格型号列，可能为空；请在输出中原样带回 idx）：
${JSON.stringify(payload)}`;
};

const normalizeItem = (ai: any, raw: RawItem): DecomposedItem => {
  const rawAtoms = Array.isArray(ai?.atoms) ? ai.atoms : [];
  const atoms: AtomResult[] = rawAtoms
    .filter(
      (atom: any) =>
        atom && typeof atom.label === 'string' && typeof atom.value === 'string' && atom.label.trim() && atom.value.trim()
    )
    .map((atom: any) => ({
      label: atom.label.trim().slice(0, 12),
      value: atom.value.trim().slice(0, 40),
      confidence: clamp(atom.confidence)
    }))
    .slice(0, 8);

  const category =
    String(ai?.category ?? '').trim() || atoms.find(atom => atom.label === '品类')?.value || '';
  if (category && !atoms.some(atom => atom.label === '品类')) {
    atoms.unshift({ label: '品类', value: category, confidence: clamp(ai?.confidence ?? 90) });
  }

  const confidence = clamp(
    ai?.confidence ?? (atoms.length ? atoms.reduce((sum, atom) => sum + atom.confidence, 0) / atoms.length : 0)
  );
  const name = atoms.map(atom => atom.value).join(' ') || String(ai?.name ?? '').trim() || raw.raw;

  return {
    ...raw,
    name,
    category: category || atoms[0]?.value || '',
    atoms,
    confidence,
    status: atoms.length ? 'done' : 'error',
    error: atoms.length ? undefined : 'AI 未返回原子属性'
  };
};

export type DecomposeOptions = {
  config: AiConfig;
  items: RawItem[];
  signal?: AbortSignal;
  onBatchStart?: (batchIndex: number, totalBatches: number, batch: RawItem[]) => void;
  onProgress?: (progress: StreamProgress) => void;
  onBatchDone?: (batchIndex: number, results: DecomposedItem[]) => void;
};

/** 串行分批调用大模型，逐批回传结果，便于前端展示真实进度 */
export const decomposeItems = async (options: DecomposeOptions): Promise<void> => {
  const { config, items, signal, onBatchStart, onProgress, onBatchDone } = options;
  const batches: RawItem[][] = [];
  for (let index = 0; index < items.length; index += BATCH_SIZE) {
    batches.push(items.slice(index, index + BATCH_SIZE));
  }

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex += 1) {
    if (signal?.aborted) {
      const abort = new Error('已停止解析');
      abort.name = 'AbortError';
      throw abort;
    }
    const batch = batches[batchIndex];
    onBatchStart?.(batchIndex, batches.length, batch);

    try {
      const content = await chatCompletion({
        config,
        system: ATOM_SYSTEM,
        user: buildBatchPrompt(batch),
        maxTokens: 8000,
        temperature: 0.1,
        signal,
        onProgress
      });
      const parsed = extractJson<{ items?: any[] }>(content);
      const aiItems = Array.isArray(parsed?.items) ? parsed.items : [];
      const results = batch.map((item, position) => {
        const matched =
          aiItems.find(candidate => Number(candidate?.idx) === item.idx) ?? aiItems[position] ?? null;
        if (!matched) {
          return {
            ...item,
            name: '',
            category: '',
            atoms: [],
            confidence: 0,
            status: 'error' as DecomposeStatus,
            error: 'AI 未返回该条结果'
          };
        }
        return normalizeItem(matched, item);
      });
      onBatchDone?.(batchIndex, results);
    } catch (error) {
      if ((error as Error).name === 'AbortError') throw error;
      const reason = (error as Error).message || '调用失败';
      onBatchDone?.(
        batchIndex,
        batch.map(item => ({
          ...item,
          name: '',
          category: '',
          atoms: [],
          confidence: 0,
          status: 'error' as DecomposeStatus,
          error: reason
        }))
      );
    }
  }
};
