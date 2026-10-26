/**
 * 价格分析页的数据层。
 *
 * 业务诉求：编制采购清单时每一行都要能看到「参考价」，并且能穿透到一件商品
 * 过去的招采情况、签订合同情况。所以这里做两件事：
 *
 * 1. `refPriceOf` —— 参考价的唯一来源。采购清单的「参考价」列与价格分析页都调它，
 *    保证清单上写的价格和分析页看到的价格永远是同一个数。
 * 2. `buildAnalysis` —— 用一条确定性伪随机序列（种子取商品标识）生成该商品的
 *    历史合同集，所有图表（月度走势 / 区域分布 / 工程局占比 / 年度占比）都从
 *    同一份合同明细聚合，数字之间自洽，且同一商品每次进入看到的数据完全一致。
 *
 * 全部为演示用模拟数据，不接真实合同库。
 */

/** 价格分析的分析标的：从采购清单一行「参考价 · 查看详情」带过去的商品快照 */
export type PriceAnalysisSubject = {
  /** 比对与随机种子用：优先标准物料编码 */
  key: string;
  code?: string;
  name: string;
  spec: string;
  unit: string;
  category?: string;
  /**
   * 规格型号的原始属性原子（`牌号：HRB400E` 这种 KV）。
   * 商品条按「规格型号列老样子」展示 KV 标签，所以这里保留完整键值，
   * 不用 `spec` 那个只留值、给纯文本场景看的拼接串。
   */
  attrs?: string[];
};

export type AnalysisContract = {
  key: string;
  /** 合同编号 / 招标编号 */
  no: string;
  /** 采购项目（清单名称） */
  project: string;
  supplier: string;
  signDate: string;
  year: number;
  quantity: number;
  unitPrice: number;
  /** 合同金额（万元） */
  amount: number;
  region: string;
  bureau: string;
  /** 相对参考价的偏离（%），正数表示比参考价贵 */
  deviation: number;
  source: '合同' | '招标清单';
};

export type AnalysisGroup = { label: string; amount: number; ratio: number; count: number };

export type AnalysisPoint = { label: string; amount: number; price: number; count: number };

export type PriceAnalysis = {
  subject: PriceAnalysisSubject;
  ref: { price: number; unit: string; source: string; date: string; samples: number };
  stats: {
    refPrice: number;
    avgPrice: number;
    minPrice: number;
    maxPrice: number;
    contractCount: number;
    totalAmount: number;
    supplierCount: number;
    /** 最近 3 个月均价相对前 3 个月的涨跌幅（%） */
    recentTrend: number;
  };
  months: AnalysisPoint[];
  regions: AnalysisGroup[];
  bureaus: AnalysisGroup[];
  years: AnalysisGroup[];
  contracts: AnalysisContract[];
  /** 未经过筛的合同总数，年度图与「全部合同」口径用它 */
  allCount: number;
};

/**
 * 参考价种子。
 * 数值刻意与 `initialPrices` 里的历史成交价对齐 —— 清单上写 3860 的钢筋，
 * 分析页的参考价也必须落在同一水位，否则两个页面互相打脸。
 */
export const refPriceSeed: Record<
  string,
  { price: number; unit: string; source: string; date: string; samples: number }
> = {
  'STD-GJ-000128': { price: 3812, unit: '吨', source: '近 6 个月合同加权', date: '2026-09-05', samples: 46 },
  'STD-GJ-000129': { price: 3860, unit: '吨', source: '近 6 个月合同加权', date: '2026-09-28', samples: 38 },
  'STD-GJ-000130': { price: 3985, unit: '吨', source: '近 3 个月合同均价', date: '2026-08-09', samples: 21 },
  'STD-GJ-000131': { price: 4020, unit: '吨', source: '近 6 个月合同加权', date: '2026-07-26', samples: 17 },
  'STD-SN-000042': { price: 468, unit: '吨', source: '近 3 个月合同均价', date: '2026-08-22', samples: 52 },
  'STD-SN-000043': { price: 386, unit: '吨', source: '近 6 个月合同加权', date: '2026-06-30', samples: 34 },
  'STD-DQ-000307': { price: 96.5, unit: '个', source: '近 6 个月合同加权', date: '2026-07-09', samples: 28 },
  'STD-GC-000215': { price: 4680, unit: '吨', source: '近 3 个月合同均价', date: '2026-07-15', samples: 19 },
  'STD-GC-000216': { price: 5260, unit: '吨', source: '近 6 个月合同加权', date: '2026-07-02', samples: 15 },
  'STD-DL-000088': { price: 96.5, unit: '米', source: '近 6 个月合同加权', date: '2026-06-12', samples: 23 },
  'STD-QK-000051': { price: 268, unit: '立方米', source: '近 6 个月合同加权', date: '2026-05-28', samples: 31 },
  'STD-SL-000019': { price: 128, unit: '吨', source: '近 3 个月合同均价', date: '2026-05-11', samples: 26 },
  // 附件一：报价表.xls 导入的三条钢筋，参考价与 initialPrices 的成交价对齐
  'STD-GJ-000132': { price: 3950, unit: '吨', source: '近 6 个月合同加权', date: '2026-09-18', samples: 31 },
  'STD-GJ-000133': { price: 3940, unit: '吨', source: '近 6 个月合同加权', date: '2026-09-12', samples: 27 },
  'STD-GJ-000134': { price: 3855, unit: '吨', source: '近 3 个月合同均价', date: '2026-09-25', samples: 42 }
};

const pad = (value: number) => String(value).padStart(2, '0');

const ymd = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const monthLabel = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;

const round2 = (value: number) => Math.round(value * 100) / 100;

const round1 = (value: number) => Math.round(value * 10) / 10;

/** 字符串哈希：把商品标识变成稳定的随机种子 */
const hashText = (text: string) => {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

/** mulberry32：轻量确定性随机，同种子必出同一序列 */
const seededRandom = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/**
 * 参考价：种子命中就用真实水位，否则按品类量级随机造一个（同样稳定）。
 *
 * `unit` 不传时用种子登记的单位——电缆是「元/米」、钢筋是「元/吨」，
 * 默认按吨兜底会把 96.5 元/米的电缆标成 96.5 元/吨，看着像白菜价。
 * 传了 unit 则以调用方为准（清单行有自己的计价单位）。
 */
export const refPriceOf = (key: string, unit?: string) => {
  const seeded = refPriceSeed[key];
  if (seeded) return { ...seeded, unit: unit || seeded.unit };

  const targetUnit = unit || '吨';
  const rand = seededRandom(hashText(`ref-${key}`));
  // 没登记的物料按计价单位的常见量级给基准，避免出现 3 元的钢筋
  const base =
    targetUnit === '吨'
      ? 300 + rand() * 4200
      : targetUnit === '米'
        ? 12 + rand() * 180
        : targetUnit === '立方米'
          ? 90 + rand() * 500
          : targetUnit === '个' || targetUnit === '套'
            ? 18 + rand() * 900
            : 50 + rand() * 800;
  return {
    price: round2(base),
    unit: targetUnit,
    source: '近 6 个月合同加权',
    date: ymd(new Date()),
    samples: 6 + Math.floor(rand() * 40)
  };
};

const PROJECTS = [
  '郑州航空港区安置房 A 区',
  '武汉光谷科技园二期',
  '南京江北新区综合管廊',
  '济南中央商务区超高层',
  '长沙梅溪湖商业综合体',
  '合肥新桥安置区三标段',
  '成都天府新区学校项目',
  '西安曲江文化中心',
  '深圳前海枢纽上盖',
  '郑州地铁 8 号线站房',
  '苏州工业园区研发楼',
  '雄安启动区市政道路',
  '青岛胶东机场配套',
  '重庆两江新区医院'
];

const REGIONS = ['河南', '湖北', '湖南', '江苏', '山东', '安徽', '广东', '四川', '陕西', '河北'];

const BUREAUS = ['中建三局', '中建八局', '中建五局', '中建二局', '中建一局', '中建四局'];

const STEEL_SUPPLIERS = ['中天钢铁', '沙钢集团', '安阳钢铁', '河钢集团', '永钢集团', '济源钢铁'];
const CEMENT_SUPPLIERS = ['海螺水泥', '冀东水泥', '华新水泥', '山水水泥', '天瑞水泥'];
const COMMON_SUPPLIERS = ['中建材供应链', '华润建材', '鑫方盛', '宏伟供应链', '中建科工物资'];

const suppliersOf = (subject: PriceAnalysisSubject) => {
  const text = `${subject.category ?? ''}${subject.name}`;
  if (/钢筋|钢材|钢管|型钢/.test(text)) return STEEL_SUPPLIERS;
  if (/水泥/.test(text)) return CEMENT_SUPPLIERS;
  return COMMON_SUPPLIERS;
};

/** 数量量级跟着计价单位走：一根钢筋按吨、一盏灯按个，别造出 3 吨节能灯 */
const quantityOf = (subject: PriceAnalysisSubject, price: number, rand: () => number) => {
  const unit = subject.unit;
  if (unit === '吨') {
    const base = price > 1000 ? 260 + rand() * 2400 : 900 + rand() * 6000;
    return Math.round(base / 10) * 10;
  }
  if (unit === '米') return Math.round((4000 + rand() * 36000) / 100) * 100;
  if (unit === '立方米') return Math.round((600 + rand() * 4200) / 10) * 10;
  if (unit === '个' || unit === '套') return Math.round((2500 + rand() * 18000) / 100) * 100;
  return Math.round((800 + rand() * 6000) / 10) * 10;
};

const pick = <T,>(list: T[], rand: () => number) => list[Math.floor(rand() * list.length) % list.length];

const anchorMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

const monthDiff = (from: Date, to: Date) =>
  (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());

export type AnalysisFilter = {
  bureau: string;
  region: string;
  /** 近 N 个月的合同；0 表示全部 */
  range: 6 | 12 | 24 | 0;
};

export const emptyFilter: AnalysisFilter = { bureau: '', region: '', range: 12 };

/**
 * 造一份该商品的历史合同集。
 * 合同单价随「距今年限」缓慢上抬，所以年度图会呈现一条温和的价格上行线，
 * 与月度走势的价格线是同一套口径。
 */
const buildContracts = (subject: PriceAnalysisSubject): AnalysisContract[] => {
  const key = subject.code || subject.key || subject.name;
  const rand = seededRandom(hashText(key));
  const ref = refPriceOf(key, subject.unit);
  const suppliers = suppliersOf(subject);
  const anchor = anchorMonth();
  const list: AnalysisContract[] = [];
  let seq = 0;

  const push = (signed: Date, source: '合同' | '招标清单') => {
    seq += 1;
    const monthsAgo = Math.max(0, monthDiff(signed, anchor));
    // 历史越久单价越低（每年约 -3%），叠加 ±4% 的个案波动
    const trend = 1 - monthsAgo * 0.0026;
    const noise = 1 + (rand() - 0.5) * 0.082;
    const unitPrice = round2(ref.price * trend * noise);
    const quantity = quantityOf(subject, unitPrice, rand);
    const amount = round1((unitPrice * quantity) / 10000);
    const deviation = round1(((unitPrice - ref.price) / ref.price) * 100);
    list.push({
      key: `${key}-c${seq}`,
      no: `${source === '合同' ? 'HT' : 'ZB'}-${signed.getFullYear()}-${String(6000 + Math.floor(rand() * 3999))}`,
      project: pick(PROJECTS, rand),
      supplier: pick(suppliers, rand),
      signDate: ymd(signed),
      year: signed.getFullYear(),
      quantity,
      unitPrice,
      amount,
      // 工程局与区域按序号轮转而不是纯随机：否则按单个工程局筛选时，
      // 随机分布会让某些月份一份合同都没有，走势图出现空洞
      region: REGIONS[(seq - 1) % REGIONS.length],
      bureau: BUREAUS[(seq - 1) % BUREAUS.length],
      deviation,
      source
    });
  };

  // 近 24 个月：每月 5~8 条，保证按单个工程局 / 单个区域筛选后仍有连续月份
  for (let back = 23; back >= 0; back -= 1) {
    const base = new Date(anchor.getFullYear(), anchor.getMonth() - back, 1);
    const count = 5 + Math.floor(rand() * 4);
    for (let index = 0; index < count; index += 1) {
      const day = 3 + Math.floor(rand() * 25);
      push(new Date(base.getFullYear(), base.getMonth(), day), rand() > 0.42 ? '合同' : '招标清单');
    }
  }

  // 更早的历史（4 年前 ~ 2 年前），用来撑起年度对比
  for (let index = 0; index < 16; index += 1) {
    const back = 25 + Math.floor(rand() * 23);
    const day = 3 + Math.floor(rand() * 25);
    push(new Date(anchor.getFullYear(), anchor.getMonth() - back, day), rand() > 0.5 ? '合同' : '招标清单');
  }

  return list.sort((a, b) => (a.signDate < b.signDate ? 1 : -1));
};

const groupBy = (
  contracts: AnalysisContract[],
  keyOf: (contract: AnalysisContract) => string,
  limit?: number
): AnalysisGroup[] => {
  const bucket = new Map<string, { amount: number; count: number }>();
  contracts.forEach(contract => {
    const label = keyOf(contract);
    const current = bucket.get(label) ?? { amount: 0, count: 0 };
    current.amount += contract.amount;
    current.count += 1;
    bucket.set(label, current);
  });
  const total = Array.from(bucket.values()).reduce((sum, item) => sum + item.amount, 0) || 1;
  const groups = Array.from(bucket.entries())
    .map(([label, value]) => ({
      label,
      amount: round1(value.amount),
      ratio: round1((value.amount / total) * 100),
      count: value.count
    }))
    .sort((a, b) => b.amount - a.amount);
  return limit ? groups.slice(0, limit) : groups;
};

const monthsOf = (contracts: AnalysisContract[], range: number): AnalysisPoint[] => {
  const anchor = anchorMonth();
  const count = range === 0 ? 24 : range;
  const points: AnalysisPoint[] = [];
  for (let back = count - 1; back >= 0; back -= 1) {
    const start = new Date(anchor.getFullYear(), anchor.getMonth() - back, 1);
    const end = new Date(anchor.getFullYear(), anchor.getMonth() - back + 1, 1);
    const bucket = contracts.filter(contract => {
      const date = new Date(`${contract.signDate}T00:00:00`);
      return date >= start && date < end;
    });
    const quantity = bucket.reduce((sum, item) => sum + item.quantity, 0);
    const amount = bucket.reduce((sum, item) => sum + item.amount, 0);
    const avg = bucket.length
      ? bucket.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) / (quantity || 1)
      : 0;
    points.push({
      label: monthLabel(start).slice(2),
      amount: round1(amount),
      price: round2(avg),
      count: bucket.length
    });
  }
  return points;
};

export const buildAnalysis = (
  subject: PriceAnalysisSubject,
  filter: AnalysisFilter = emptyFilter
): PriceAnalysis => {
  const key = subject.code || subject.key || subject.name;
  const ref = refPriceOf(key, subject.unit);
  const all = buildContracts(subject);

  const anchor = anchorMonth();
  const filtered = all.filter(contract => {
    if (filter.bureau && contract.bureau !== filter.bureau) return false;
    if (filter.region && contract.region !== filter.region) return false;
    if (filter.range) {
      const monthsAgo = monthDiff(new Date(`${contract.signDate}T00:00:00`), anchor);
      if (monthsAgo >= filter.range) return false;
    }
    return true;
  });

  const quantity = filtered.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = round1(filtered.reduce((sum, item) => sum + item.amount, 0));
  const avgPrice = quantity
    ? round2(filtered.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) / quantity)
    : ref.price;
  const prices = filtered.length ? filtered.map(item => item.unitPrice) : [ref.price];

  // 近期涨跌：最近 3 个月均价 vs 之前 3 个月均价
  const months = monthsOf(filtered, filter.range);
  const tail = months.slice(-3).filter(item => item.price > 0);
  const prev = months.slice(-6, -3).filter(item => item.price > 0);
  const avgOf = (list: AnalysisPoint[]) =>
    list.length ? list.reduce((sum, item) => sum + item.price, 0) / list.length : 0;
  const tailAvg = avgOf(tail);
  const prevAvg = avgOf(prev);
  const recentTrend = prevAvg && tailAvg ? round1(((tailAvg - prevAvg) / prevAvg) * 100) : 0;

  return {
    subject,
    ref,
    stats: {
      refPrice: ref.price,
      avgPrice,
      minPrice: round2(Math.min(...prices)),
      maxPrice: round2(Math.max(...prices)),
      contractCount: filtered.length,
      totalAmount,
      supplierCount: new Set(filtered.map(item => item.supplier)).size,
      recentTrend
    },
    months,
    regions: groupBy(filtered, contract => contract.region),
    bureaus: groupBy(filtered, contract => contract.bureau),
    years: groupBy(all, contract => `${contract.year}`).sort((a, b) => (a.label < b.label ? -1 : 1)),
    contracts: filtered,
    allCount: all.length
  };
};

/** 默认标的：标准库里钢筋 Φ25，一进价格分析页先看它，不会是空页面 */
export const defaultAnalysisSubject: PriceAnalysisSubject = {
  key: 'STD-GJ-000129',
  code: 'STD-GJ-000129',
  name: 'HRB400E 热轧带肋抗震钢筋 Φ25mm',
  spec: 'HRB400E / Φ25mm / 热轧带肋 / 抗震',
  unit: '吨',
  category: '建材 / 钢材 / 钢筋',
  attrs: ['牌号：HRB400E', '直径：Φ25mm', '外形：热轧带肋', '特性：抗震']
};

/**
 * 规格型号标签。
 * 有属性原子就用 KV 原样展示（与标准物料库、治理工作台一致）；
 * 来自手工录入或历史清单、只有一段拼接串的，退回按分隔符拆成单值标签。
 */
export const specTagsOf = (subject: PriceAnalysisSubject): string[] => {
  if (subject.attrs?.length) return subject.attrs;
  return (subject.spec || '')
    .split(/\s*[/／|｜、]\s*/)
    .map(item => item.trim())
    .filter(Boolean);
};

/** 分位点：给「参考区间」用，排序后线性插值 */
const quantile = (sorted: number[], ratio: number) => {
  if (!sorted.length) return 0;
  const position = (sorted.length - 1) * ratio;
  const base = Math.floor(position);
  const rest = position - base;
  const next = sorted[base + 1] ?? sorted[base];
  return round2(sorted[base] + rest * (next - sorted[base]));
};

/** 智能询价要的「一件商品的当前价格画像」：参考价 + 区间 + 中位 + 样本 + 趋势 */
export type PriceProfile = {
  ref: { price: number; unit: string; source: string; date: string; samples: number };
  /** 参考区间下沿（成交价 P25） */
  low: number;
  /** 参考区间上沿（成交价 P75） */
  high: number;
  median: number;
  avg: number;
  /** 区间内参与计算的合同数 */
  count: number;
  /** 近 3 个月相对前 3 个月的涨跌（%） */
  trend: number;
  /** 月度均价序列，给行内迷你走势用 */
  spark: AnalysisPoint[];
};

/**
 * 价格画像：与价格分析页同源同口径。
 * 内部直接复用 `buildAnalysis` 的合同集算分位数，所以询价页看到的参考区间
 * 和跳过去的价格分析页看到的是同一批合同，不会各说各话。
 */
export const priceProfileOf = (
  subject: PriceAnalysisSubject,
  filter: AnalysisFilter = emptyFilter
): PriceProfile => {
  const analysis = buildAnalysis(subject, filter);
  const prices = analysis.contracts.map(contract => contract.unitPrice).sort((a, b) => a - b);
  const low = quantile(prices, 0.25);
  const high = quantile(prices, 0.75);
  const fallback = analysis.stats.avgPrice || analysis.ref.price;
  return {
    ref: analysis.ref,
    // 样本太少时 P25/P75 可能相等，给一条 ±3% 的窄带，否则页面上是一条线看不出区间
    low: low || round2(fallback * 0.97),
    high: high && high > low ? high : round2((low || fallback) * 1.03),
    median: quantile(prices, 0.5) || fallback,
    avg: analysis.stats.avgPrice,
    count: prices.length,
    trend: analysis.stats.recentTrend,
    spark: analysis.months
  };
};

export const ANALYSIS_REGIONS = REGIONS;
export const ANALYSIS_BUREAUS = BUREAUS;
