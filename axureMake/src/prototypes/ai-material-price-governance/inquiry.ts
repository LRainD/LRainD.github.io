/**
 * 智能询价的数据层。
 *
 * 询价干的事是「拿别人的报价来问价」：用户贴一段询价清单，或者上传一份供应商报价表，
 * 系统把每一行匹配到标准物料，再用「这件商品当前的价格画像」（`analysisData.priceProfileOf`）
 * 判断这个报价是高是低。
 *
 * 价格画像与采购清单的参考价、价格分析页的图表共用同一份历史合同集，
 * 所以这里不造任何独立的价格数字——询价页说「偏高 5%」，点进价格分析看到的也是这个结论。
 */
import type { AnalysisFilter, PriceProfile, PriceAnalysisSubject } from './analysisData';

/** 询价条目的来源：手工粘贴 / 上传文件 */
export type InquirySource = 'paste' | 'file';

export type InquiryRow = {
  key: string;
  /** 询价原文（名称，通常带规格） */
  raw: string;
  spec: string;
  unit: string;
  quantityText: string;
  quantity: number;
  /** 报价原文（可能带单位或货币符号） */
  quoteText: string;
  /** 报价单价；0 表示没写报价 */
  quote: number;
  source: InquirySource;
  /** 来源名称：文件名 / 「手工录入」 */
  sourceName: string;
  /** 匹配结果（与 ai/match 的 MatchedRow 对齐） */
  code: string;
  confidence: number;
  reason: string;
  gap: string;
};

/** 报价水位判定：与参考区间 P25~P75 比，而不是与参考价单点比 */
export type Verdict = 'high' | 'slightly-high' | 'fair' | 'slightly-low' | 'low' | 'unknown';
export const VERDICT_LABEL: Record<Verdict, string> = {
  high: '明显偏高',
  'slightly-high': '偏高',
  fair: '合理',
  'slightly-low': '偏低',
  low: '明显偏低',
  unknown: '无报价'
};

/** 涨跌配色沿用国内习惯：贵了暖色、便宜了绿色 */
export const verdictColor = (verdict: Verdict) =>
  verdict === 'high'
    ? '#c4320a'
    : verdict === 'slightly-high'
      ? '#d46b08'
      : verdict === 'fair'
        ? '#0b6ba8'
        : verdict === 'slightly-low'
          ? '#16835b'
          : verdict === 'low'
            ? '#0f6b4a'
            : '#8b929c';

const toNumber = (text: string) => {
  const value = Number(String(text).replace(/[,，\s]/g, ''));
  return Number.isFinite(value) ? value : 0;
};

/**
 * 计量单位归一。
 *
 * 同一件商品，报价表里常写「t」，标准物料与清单里写「吨」；电缆写「m」、清单写「米」。
 * 直接拿字符串比会让「单位不一致」误报，判定跟着掉成无报价——演示时上传一份正经报价表
 * 却整列显示「单位不一致」，看着像系统坏了。这里只做同义归并，
 * 不做任何换算（元/千克 ↔ 元/吨 的折算率是采购口径的事，原型不猜）。
 */
const UNIT_ALIAS: Record<string, string> = {
  t: '吨',
  吨: '吨',
  kg: '千克',
  千克: '千克',
  公斤: '千克',
  m: '米',
  米: '米',
  m2: '平方米',
  '㎡': '平方米',
  平方米: '平方米',
  平米: '平方米',
  m3: '立方米',
  'm³': '立方米',
  立方米: '立方米',
  只: '个',
  个: '个',
  套: '套',
  台: '台'
};

export const normalizeUnit = (unit: string) => {
  const text = String(unit || '').trim();
  if (!text) return '';
  return UNIT_ALIAS[text.toLowerCase()] ?? UNIT_ALIAS[text] ?? text;
};

/** 两边的计价单位是否可直接比较（只做同义归并，不做换算） */
export const sameUnit = (left: string, right: string) => normalizeUnit(left) === normalizeUnit(right);

const NUMBER = String.raw`(\d[\d,]*(?:\.\d+)?)`;
const UNIT_WORDS = '吨|千克|kg|公斤|米|m2|m3|㎡|m|平方米|立方米|立方米|个|套|台|根|块|袋|卷|件|樘|盏|只|张|组|处|项';

/** 行尾的报价：`¥3,980` / `3980元` / `3980元/吨` / `3980 元/ 吨` */
const PRICE_TAIL = new RegExp(String.raw`\s*(?:[¥￥]\s*${NUMBER}|([\d,]+(?:\.\d+)?)\s*元(?:\s*\/\s*([^\s,，;；|/]+))?)\s*$`);

/** 行尾的数量：`120吨` / `3,200 ㎡` */
const QTY_TAIL = new RegExp(String.raw`\s*${NUMBER}\s*(${UNIT_WORDS})\s*$`, 'i');

/** 行尾裸数字：清单里常见的「120 3980」写法 */
const NUM_TAIL = new RegExp(String.raw`\s*${NUMBER}\s*$`);

/**
 * 解析一行询价文本。
 * 从行尾往前剥：先剥报价（带「元」或 ¥ 时最可靠），再剥数量，剩下的是物料名称。
 */
export const parseInquiryLine = (line: string, index: number, sourceName = '手工录入'): InquiryRow | null => {
  let rest = line.trim();
  if (!rest) return null;

  let quote = 0;
  let quoteText = '';
  let quoteUnit = '';

  const priceMatch = rest.match(PRICE_TAIL);
  if (priceMatch) {
    const value = priceMatch[1] ?? priceMatch[2];
    quote = toNumber(value);
    quoteUnit = (priceMatch[3] ?? '').trim();
    quoteText = rest.slice(priceMatch.index).trim();
    rest = rest.slice(0, priceMatch.index).trim();
  }

  let quantity = 0;
  let unit = '';
  const qtyMatch = rest.match(QTY_TAIL);
  if (qtyMatch) {
    quantity = toNumber(qtyMatch[1]);
    unit = qtyMatch[2];
    rest = rest.slice(0, qtyMatch.index).trim();
  }

  // 没有「元」的写法：「HRB400E 钢筋 120 3980」——末段裸数字按报价处理
  if (!quote) {
    const numMatch = rest.match(NUM_TAIL);
    if (numMatch && rest.slice(0, numMatch.index).trim()) {
      quote = toNumber(numMatch[1]);
      rest = rest.slice(0, numMatch.index).trim();
    }
  }

  const raw = rest.replace(/\s{2,}/g, ' ').trim();
  if (!raw) return null;

  return {
    key: `inq-${index}-${raw.slice(0, 8)}`,
    raw,
    spec: '',
    unit: quoteUnit || unit,
    quantityText: quantity ? `${quantity.toLocaleString('zh-CN')} ${unit || quoteUnit}`.trim() : '',
    quantity,
    quoteText,
    quote,
    source: 'paste',
    sourceName,
    code: '',
    confidence: 0,
    reason: '',
    gap: ''
  };
};

/** 批量解析粘贴文本：跳过空行与明显不是物料的说明行 */
export const parseInquiryText = (text: string, sourceName = '手工录入'): InquiryRow[] =>
  text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    // 「注：」「备注：」「合计」这类不是询价条目
    .filter(line => !/^(注[:：]|备注|说明|合计|小计|总计|报价说明)/.test(line))
    .slice(0, 30)
    .map((line, index) => parseInquiryLine(line, index, sourceName))
    .filter((row): row is InquiryRow => Boolean(row));

/** 由标准物料的匹配结果补齐行上的名称与规格 */
export const withSubject = (
  row: InquiryRow,
  subject: PriceAnalysisSubject
): PriceAnalysisSubject => ({
  ...subject,
  key: subject.code || row.code || row.raw,
  name: subject.name || row.raw,
  spec: subject.spec || row.spec,
  unit: subject.unit || row.unit
});

/**
 * 报价判定。
 * 不是「比参考价高一点就算贵」——参考价是单点，成交价本身有区间，
 * 所以只有跳出 P25~P75 才算偏离，±10% 以外才升级成「明显」。
 */
export const verdictOf = (quote: number, profile: PriceProfile | null): Verdict => {
  if (!quote || !profile) return 'unknown';
  const { low, high } = profile;
  if (quote > high * 1.1) return 'high';
  if (quote > high) return 'slightly-high';
  if (quote < low * 0.9) return 'low';
  if (quote < low) return 'slightly-low';
  return 'fair';
};

/** 相对参考价的偏离（%）：表里「偏离」列用它 */
export const deviationOf = (quote: number, profile: PriceProfile | null) => {
  if (!quote || !profile?.ref.price) return 0;
  return Math.round(((quote - profile.ref.price) / profile.ref.price) * 1000) / 10;
};

/**
 * 议价空间估算（万元）：只对「明显高于参考价」的部分计价，
 * 并且按报价与参考价的差额算，不用区间上沿——避免把正常波动也算成可省的钱。
 */
export const savingOf = (rows: InquiryRow[], profiles: Map<string, PriceProfile>) =>
  rows.reduce((sum, row) => {
    const profile = profiles.get(row.key);
    if (!profile || !row.quote || !row.quantity) return sum;
    if (verdictOf(row.quote, profile) !== 'high') return sum;
    return sum + ((row.quote - profile.ref.price) * row.quantity) / 10000;
  }, 0);

/**
 * 演示用询价清单：报价有高有低，最后一条故意未匹配，用来演示「提交治理」。
 * 单位与标准物料的计价单位保持一致（钢材按吨、电缆按米），
 * 否则参考价会拿「元/吨」的价去比「元/米」的报价，判定必然失真。
 */
export const inquirySeed = `HRB400E抗震螺纹钢 Φ25  120吨  3980元/吨
P.O42.5普通硅酸盐水泥  800吨  452元/吨
Q235B焊接钢管 DN100  80吨  5400元/吨
YJV铜芯电缆 4×25+1×16  800米  88元/米
精装修客房吊顶轻钢龙骨  3200㎡  36元/㎡`;

/* ------------------------------ 本地快照 ------------------------------ */

/**
 * 询价结果存本机，不存服务端。
 * 目的只有一个：点「价格分析」跳走再回来，或者刷新页面，手上这单询价还在。
 * 与 `storage.ts` 一个套路：带 version、读写 try/catch、坏数据静默丢弃。
 */
export const INQUIRY_STORAGE_KEY = 'ampg:inquiry:v1';
const INQUIRY_STORAGE_VERSION = 1;

export type PersistedInquiry = {
  version: number;
  text: string;
  fileName: string;
  filter: AnalysisFilter;
  stageText: string;
  rows: InquiryRow[];
};

export const loadInquiry = (): PersistedInquiry | null => {
  try {
    const raw = localStorage.getItem(INQUIRY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedInquiry;
    if (parsed.version !== INQUIRY_STORAGE_VERSION || !Array.isArray(parsed.rows)) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const saveInquiry = (state: Omit<PersistedInquiry, 'version'>) => {
  try {
    localStorage.setItem(
      INQUIRY_STORAGE_KEY,
      JSON.stringify({ version: INQUIRY_STORAGE_VERSION, ...state })
    );
  } catch {
    // 隐私模式 / 配额满：纯内存运行，不影响演示
  }
};

export const clearInquiry = () => {
  try {
    localStorage.removeItem(INQUIRY_STORAGE_KEY);
  } catch {
    // 同上
  }
};
