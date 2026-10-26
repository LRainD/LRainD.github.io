/**
 * 物料映射（历史招标清单 → 标准物料）。
 *
 * 业务问题：历史招标清单里的物料是当年的写法（「三级抗震螺纹钢 25 定尺9m」），
 * 和标准物料（「HRB400E 热轧带肋抗震钢筋 Φ25mm」）对不上，于是这批历史成交价
 * 只能躺在库里当死数据。这个模块就是让经办人把两者挂起来，价格才能按标准口径复用。
 *
 * 三件事：
 * 1. `parseBidSpec`：把历史描述解析成规格型号的 KV（规格型号是要跟着映射一起补进标准物料的）；
 * 2. `recommendStandards`：按属性一致度 + 名称相似度 + 历史叫法命中给候选，默认就把最像的排前面；
 * 3. `buildMapping`：把候选落成一条映射（含默认补全的规格型号 + 这条非标叫法），经办人再改。
 *
 * 打分是本地确定性的，不依赖模型通道：图谱类操作要能离线跑、要能复现，也便于演示时讲清「为什么推荐它」。
 */
import { initialPrices, initialStandards, type PriceRecord, type StandardMaterial } from './data';
import { parseAttr } from './similar';

/* ========== 类型 ========== */

/** 从历史描述里解析出的一条属性 */
export type ParsedAtom = { label: string; value: string; confidence: number };

/** 规格型号一行：source 标明它是沿用标准、解析补充还是人工改的（面板上要能看出来） */
export type AttributeRow = {
  label: string;
  value: string;
  source: 'standard' | 'ai' | 'manual';
};

/** 一条清单项的映射结果 */
export type MappingRecord = {
  /** 映射到的标准物料；null = 经办人判定标准库没有这件物料，转治理建档 */
  standardKey: string | null;
  /** 映射后要写进标准物料的规格型号 */
  attributes: AttributeRow[];
  /** 这条非标叫法，映射后登记为标准物料的历史叫法 */
  alias: string;
  /** 是否已复核确认（系统预映射出来的都是待复核） */
  confirmed: boolean;
  by: 'ai' | 'manual' | 'new';
  updatedAt: string;
};

export type BidItem = {
  key: string;
  idx: number;
  /** 历史清单里的原文描述 */
  raw: string;
  /** 清洗后的商品名（原文去掉规格尾巴） */
  name: string;
  /**
   * 历史清单里的规格型号——**只是一段文本**，各家写各家的（「25 定尺9m」「HRB400E Φ25」「Φ25 HRB400E」），
   * 不是标准库那种结构化的属性键值对。结构化是映射这一步的产物，不是历史数据的原貌。
   */
  spec: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  atoms: ParsedAtom[];
};

export type BidProject = {
  key: string;
  code: string;
  name: string;
  bureau: string;
  region: string;
  type: string;
  openDate: string;
  category: string;
  items: BidItem[];
};

export type MappingStatus = 'todo' | 'pending' | 'done' | 'new';

export type CandidateCompare = {
  label: string;
  mine: string;
  theirs: string;
  state: 'same' | 'diff' | 'missing' | 'extra';
};

export type MappingCandidate = {
  key: string;
  code: string;
  name: string;
  category: string;
  /** 综合匹配度 0~100 */
  score: number;
  /** 属性逐条对照，面板上直接展示「差在哪」 */
  compare: CandidateCompare[];
  reasons: string[];
  priceCount: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  priceUnit: string;
  /** 已经映射到这条标准的历史清单项（同一条标准可以被多条非标项映射 = 一对多） */
  linked: string[];
  synonyms: string[];
};

/* ========== 文本归一与相似度 ========== */

const norm = (text: string) =>
  text
    .replace(/[×xX*]/g, '×')
    .replace(/[（）]/g, m => (m === '（' ? '(' : ')'))
    .replace(/\s/g, '')
    .toLowerCase();

const stripUnit = (text: string) =>
  text
    .replace(/[ΦφØ⌀]/g, '')
    .replace(/(mm|cm|km|kg|kw|kva|kv|kwh|m|w|v|a|t|吨|米|个|只|套|片|台|樘|平方米|立方米|℃|k)/g, '')
    .replace(/[^\u4e00-\u9fa5a-z0-9.]/g, '');

/** 数字令牌：25 / 42.5 / 4×25+1×16 这类值主要靠数字对齐 */
const numbersOf = (text: string) => (text.match(/\d+(?:\.\d+)?/g) ?? []).join(',');

/** 属性值相似度：全等 1；包含 0.9；数字一致 0.85；去单位后一致 0.85；否则 0.2 */
export const valueSimilar = (mine: string, theirs: string) => {
  const a = norm(mine);
  const b = norm(theirs);
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.9;
  const numA = numbersOf(a);
  const numB = numbersOf(b);
  if (numA && numA === numB) return 0.85;
  const stripA = stripUnit(a);
  const stripB = stripUnit(b);
  if (stripA && stripA === stripB) return 0.85;
  return 0.2;
};

/** 中文按二元组算 Dice 系数：比整串比更宽容，「螺纹钢 25」也能和标准名对上一些 */
const bigrams = (text: string) => {
  const clean = text.replace(/[^\u4e00-\u9fa5a-z0-9]/gi, '').toLowerCase();
  const set = new Set<string>();
  for (let i = 0; i < clean.length - 1; i += 1) set.add(clean.slice(i, i + 2));
  return set;
};

const dice = (a: string, b: string) => {
  const setA = bigrams(a);
  const setB = bigrams(b);
  if (!setA.size || !setB.size) return 0;
  let hit = 0;
  setA.forEach(gram => {
    if (setB.has(gram)) hit += 1;
  });
  return (2 * hit) / (setA.size + setB.size);
};

/* ========== 历史描述的规格解析 ========== */

const diameter = (text: string) => {
  const phi = text.match(/[ΦφØ⌀]\s*(\d{1,2}(?:\.\d)?)/);
  if (phi) return phi[1];
  const bare = text.match(/(?:^|[\s（(])(\d{1,2})(?=\s|[）)]|$)/);
  return bare ? bare[1] : '';
};

const sectionOf = (text: string) => {
  const hit = text.match(/(\d+)\s*[×xX*]\s*(\d+)(?:\s*\+\s*(\d+)\s*[×xX*]\s*(\d+))?/);
  if (!hit) return '';
  return hit[3] ? `${hit[1]}×${hit[2]}+${hit[3]}×${hit[4]}` : `${hit[1]}×${hit[2]}`;
};

/**
 * 把一条历史描述解析成规格属性。
 *
 * 只覆盖演示涉及的几类主材（钢筋 / 水泥 / 管材 / 电缆 / 砌块 / 砂 / 灯具）；
 * 解析不出来的（成品门、断桥窗、桥架）就留空，正好演示「标准库也确实没有」的那条路。
 */
export const parseBidSpec = (raw: string): ParsedAtom[] => {
  const text = raw.trim();
  const upper = text.toUpperCase();
  const atoms: ParsedAtom[] = [];
  const push = (label: string, value: string, confidence = 90) => {
    if (!value) return;
    if (atoms.some(atom => atom.label === label)) return;
    atoms.push({ label, value, confidence });
  };

  // 钢筋：牌号能直接写，也常见「三级 / 二级」这种叫法
  if (/钢筋|螺纹钢|盘螺|盘圆|圆钢|线材/.test(text)) {
    push('品类', '钢筋', 98);
    const explicit = upper.match(/(HRB500E|HRB400E|HRB400|HRB335|HPB300)/)?.[1];
    const level = /三级/.test(text) ? '三级' : /二级/.test(text) ? '二级' : /一级/.test(text) ? '一级' : '';
    const grade =
      explicit ??
      (level === '三级'
        ? /抗震/.test(text)
          ? 'HRB400E'
          : 'HRB400'
        : level === '二级'
          ? 'HRB335'
          : level === '一级'
            ? 'HPB300'
            : '');
    push('牌号', grade, explicit ? 97 : level ? 86 : 70);
    const dia = diameter(text);
    push('直径', dia ? `Φ${dia}mm` : '', 90);
    if (/螺纹|带肋/.test(text)) push('外形', /月牙/.test(text) ? '热轧带肋（月牙纹）' : '热轧带肋', 88);
    else if (/光圆|圆钢|盘圆|线材/.test(text)) push('外形', '热轧光圆', 84);
    if (/抗震/.test(text)) push('特性', '抗震', 92);
    const length = text.match(/定尺\s*(\d+(?:\.\d+)?)\s*m/i)?.[1];
    if (length) push('定尺长度', `${length}m`, 80);
    return atoms;
  }

  // 水泥：P.O / P.C / P.S 三种写法 + 中文强度等级
  if (/水泥/.test(text)) {
    push('品类', '水泥', 98);
    const po = upper.match(/P\.?\s*O\s*([\d.]+)/);
    const pc = upper.match(/P\.?\s*C\s*([\d.]+)/);
    const ps = upper.match(/P\.?\s*S\s*([\d.]+)/);
    const grade = po?.[1] ?? pc?.[1] ?? ps?.[1] ?? text.match(/(\d{2}(?:\.\d)?)/)?.[1] ?? '';
    push('强度等级', grade.replace(/\.$/, ''), 94);
    const type = po || /普硅|普通硅酸盐/.test(text)
      ? '普通硅酸盐'
      : pc || /复合硅酸盐|复合水泥/.test(text)
        ? '复合硅酸盐'
        : ps || /矿渣/.test(text)
          ? '矿渣硅酸盐'
          : '';
    push('类型', type, 92);
    if (/袋装/.test(text)) push('包装', '袋装', 80);
    else if (/散装/.test(text)) push('包装', '散装', 80);
    return atoms;
  }

  // 管材：DN 口径 + 材质 + 镀锌 / 焊接
  if (/焊管|钢管|镀锌管|无缝管/.test(text)) {
    push('品类', '管材', 90);
    const dn = upper.match(/DN\s*(\d+)/)?.[1];
    push('公称直径', dn ? `DN${dn}` : '', 96);
    const material = upper.match(/(Q235B|Q235|Q345B|Q345|304|316L)/)?.[1];
    push('材质', material ?? '', 90);
    if (/镀锌/.test(text)) push('表面处理', '热镀锌', 92);
    else if (/黑管|焊管/.test(text)) push('表面处理', '黑管', 78);
    if (/无缝/.test(text)) push('连接方式', '无缝', 88);
    else if (/焊接|焊管/.test(text)) push('连接方式', '焊接', 90);
    return atoms;
  }

  // 电缆：型号 + 芯数截面 + 铜/铝芯
  if (/电缆|电线/.test(text) || /^(YJV|VV|BV|BVR)/.test(upper)) {
    push('品类', '电缆', 95);
    const model = upper.match(/(YJV22|YJV|VV22|VV|BVR|BV)/)?.[1];
    push('型号', model ?? '', 95);
    push('芯数截面', sectionOf(text), 94);
    if (/铜芯|铜/.test(text)) push('材质', '铜芯', 86);
    else if (/铝芯|铝/.test(text)) push('材质', '铝芯', 86);
    const voltage = text.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*kV/i);
    if (voltage) push('电压等级', `${voltage[1]}/${voltage[2]}kV`, 88);
    return atoms;
  }

  // 砌块：三个尺寸 + A 强度等级
  if (/加气块|加气混凝土|砌块/.test(text)) {
    push('品类', '加气混凝土砌块', 96);
    const size = text.match(/(\d{2,4})\s*[×xX*]\s*(\d{2,4})\s*[×xX*]\s*(\d{2,4})/);
    if (size) {
      push('长度', `${size[1]}mm`, 94);
      push('高度', `${size[2]}mm`, 94);
      push('厚度', `${size[3]}mm`, 94);
    }
    const grade = upper.match(/A(\d+\.?\d*)/)?.[1];
    push('强度等级', grade ? `A${grade}` : '', 88);
    return atoms;
  }

  // 砂石
  if (/砂/.test(text)) {
    push('品类', /机制/.test(text) ? '机制砂' : '砂', 94);
    const size = /粗砂/.test(text) ? '粗砂' : /中砂/.test(text) ? '中砂' : /细砂/.test(text) ? '细砂' : '';
    push('粒径', size, 90);
    const fineness = text.match(/细度模数\s*([\d.~\-]+)/)?.[1];
    push('细度模数', fineness ?? '', 86);
    return atoms;
  }

  // 灯具：「暖白」这类历史叫法统一归到标准库的「暖光」
  if (/灯/.test(text)) {
    push('品类', '节能灯', 84);
    const power = upper.match(/(\d+(?:\.\d+)?)\s*W\b/)?.[1];
    push('功率', power ? `${power}W` : '', 94);
    const socket = upper.match(/E(\d{2})/)?.[1];
    push('灯头口径', socket ? `E${socket}` : '', 92);
    const kelvin = upper.match(/(\d{4})\s*K/)?.[1];
    const temperature = /暖白|暖光/.test(text) ? '暖光' : /正白|白光/.test(text) ? '正白' : kelvin ? `${kelvin}K` : '';
    push('色温', temperature, 88);
    return atoms;
  }

  return atoms;
};

/* ========== 种子：历史招标项目 ========== */

type SeedLine = [
  raw: string,
  name: string,
  unit: string,
  quantity: number,
  unitPrice: number,
  /** 规格型号原文；不给就从 raw 里把商品名抠掉，剩下的就是规格 */
  spec?: string
];

/** 历史规格型号：把原文里的商品名剥掉，剩下的就是那次招标自己写的规格 */
const specOf = (raw: string, name: string) => {
  const at = raw.indexOf(name);
  if (at < 0) return raw === name ? '' : raw;
  const rest = `${raw.slice(0, at)} ${raw.slice(at + name.length)}`.replace(/\s+/g, ' ').trim();
  return rest.replace(/^[·、,，:：\-—\s]+/, '').replace(/[·、,，:：\-—\s]+$/, '');
};

const buildProject = (
  meta: Omit<BidProject, 'items'>,
  lines: SeedLine[]
): BidProject => ({
  ...meta,
  items: lines.map((line, index) => ({
    key: `${meta.key}-${index + 1}`,
    idx: index + 1,
    raw: line[0],
    name: line[1],
    spec: line[5] ?? specOf(line[0], line[1]),
    unit: line[2],
    quantity: line[3],
    unitPrice: line[4],
    atoms: parseBidSpec(line[0])
  }))
});

export const bidProjects: BidProject[] = [
  buildProject(
    {
      key: 'bid-2024-08812',
      code: 'ZB-2024-08812',
      name: '郑州航空港区安置房一期总承包工程',
      bureau: '中建八局',
      region: '河南省郑州市',
      type: '公开招标',
      openDate: '2024-11-08',
      category: '建材'
    },
    [
      ['三级抗震螺纹钢 25 定尺9m', '三级抗震螺纹钢', '吨', 860, 3720],
      ['三级抗震螺纹钢 20 定尺9m', '三级抗震螺纹钢', '吨', 640, 3680],
      ['HRB400E 盘螺 12', 'HRB400E 盘螺', '吨', 320, 3860],
      ['普硅水泥 42.5 袋装', '普硅水泥', '吨', 2400, 452],
      ['复合水泥 32.5 散装', '复合水泥', '吨', 1800, 386],
      ['机制中砂', '机制中砂', '吨', 3200, 132],
      ['加气块 600*200*200 A3.5', '加气块', '立方米', 2800, 265],
      ['焊管 DN100 Q235B', '焊管', '吨', 210, 4620],
      ['镀锌钢管 DN50', '镀锌钢管', '吨', 96, 5180],
      ['铜芯电缆 YJV 4*25+1*16', '铜芯电缆', '米', 2600, 94.5],
      ['成品木门 M1021 实木复合', '成品木门', '樘', 860, 780],
      ['断桥铝推拉窗 1500*1800', '断桥铝推拉窗', '平方米', 4200, 620]
    ]
  ),
  buildProject(
    {
      key: 'bid-2025-01147',
      code: 'ZB-2025-01147',
      name: '武汉光谷科技园 A 地块办公楼项目',
      bureau: '中建三局',
      region: '湖北省武汉市',
      type: '邀请招标',
      openDate: '2025-03-19',
      category: '建材'
    },
    [
      ['抗震螺纹钢 25（三级）', '抗震螺纹钢', '吨', 520, 3790],
      ['螺纹钢 22 三级', '螺纹钢', '吨', 380, 3760],
      ['HPB300 圆钢 8', 'HPB300 圆钢', '吨', 140, 4080],
      ['普通硅酸盐水泥 P.O42.5 散装', '普通硅酸盐水泥', '吨', 1600, 461],
      ['节能灯 22W E27 暖白', '螺旋节能灯', '个', 3200, 112, '22W E27 暖白'],
      ['YJV电缆 4x25+1x16 铜芯', 'YJV 铜芯电缆', '米', 1800, 96, '4x25+1x16 铜芯'],
      ['防火卷帘门 4.5m×4m', '防火卷帘门', '樘', 24, 3600],
      ['加气混凝土砌块 600*200*200', '加气混凝土砌块', '立方米', 1200, 258]
    ]
  ),
  buildProject(
    {
      key: 'bid-2025-03426',
      code: 'ZB-2025-03426',
      name: '长沙地铁 6 号线机电安装工程',
      bureau: '中建五局',
      region: '湖南省长沙市',
      type: '公开招标',
      openDate: '2025-06-11',
      category: '机电'
    },
    [
      ['螺纹钢筋 HRB400E Φ25', '螺纹钢筋', '吨', 720, 3810],
      ['盘圆 HPB300 Φ8', '盘圆', '吨', 260, 4120],
      ['焊管 DN100 黑管', '焊管', '吨', 180, 4700],
      ['热镀锌管 DN50', '热镀锌管', '吨', 120, 5240],
      ['电力电缆 YJV 4×25+1×16', '电力电缆', '米', 5400, 95.8],
      ['普硅水泥 42.5', '普硅水泥', '吨', 1300, 456],
      ['机制砂 中砂', '机制砂', '吨', 2600, 129],
      ['螺旋节能灯 22W E27', '螺旋节能灯', '个', 1800, 108],
      ['铝合金桥架 200*100', '铝合金桥架', '米', 3200, 86]
    ]
  ),
  buildProject(
    {
      key: 'bid-2025-05890',
      code: 'ZB-2025-05890',
      name: '济南西客站片区安置房二标段',
      bureau: '中建八局',
      region: '山东省济南市',
      type: '询比采购',
      openDate: '2025-07-24',
      category: '建材'
    },
    [
      ['三级钢 25 抗震', '三级钢', '吨', 460, 3740],
      ['三级钢 20 抗震', '三级钢', '吨', 380, 3700],
      ['水泥 P.O42.5 袋装', '水泥', '吨', 900, 468],
      ['加气块 600×200×200', '加气块', '立方米', 1500, 262],
      ['中砂', '中砂', '吨', 1800, 126],
      ['焊管 DN100', '焊管', '吨', 110, 4650],
      ['成品木门 实木复合 M1021', '成品木门', '樘', 420, 760]
    ]
  ),
  buildProject(
    {
      key: 'bid-2025-07315',
      code: 'ZB-2025-07315',
      name: '南京燕子矶新城医院建设项目',
      bureau: '中建三局',
      region: '江苏省南京市',
      type: '公开招标',
      openDate: '2025-09-02',
      category: '建材'
    },
    [
      ['HRB400E 抗震钢筋 Φ25', 'HRB400E 抗震钢筋', '吨', 680, 3860],
      ['HRB400E 抗震钢筋 Φ20', 'HRB400E 抗震钢筋', '吨', 520, 3812],
      ['HRB400E 抗震钢筋 Φ12', 'HRB400E 抗震钢筋', '吨', 240, 3985],
      ['盘圆 Φ8 HPB300', '盘圆', '吨', 160, 4020],
      ['P.O42.5 普通硅酸盐水泥 散装', '普通硅酸盐水泥', '吨', 1400, 470],
      ['P.C32.5 复合水泥', '复合水泥', '吨', 700, 390],
      ['加气块 A3.5 600*200*200', '加气块', '立方米', 1600, 270],
      ['节能灯 22W E27 暖光', '螺旋节能灯', '个', 2600, 116, '22W E27 暖光'],
      ['YJV 电缆 4×25+1×16', 'YJV 电力电缆', '米', 2800, 96.5, '4×25+1×16'],
      ['成品木门 M1021', '成品木门', '樘', 640, 785]
    ]
  ),
  buildProject(
    {
      key: 'bid-2024-06104',
      code: 'ZB-2024-06104',
      name: '合肥新站区标准厂房一期',
      bureau: '中建五局',
      region: '安徽省合肥市',
      type: '竞争性谈判',
      openDate: '2024-06-18',
      category: '建材'
    },
    [
      ['三级抗震螺纹钢 Φ25', '三级抗震螺纹钢', '吨', 380, 3690],
      ['普硅水泥 42.5', '普硅水泥', '吨', 800, 445],
      ['机制中砂', '机制中砂', '吨', 1400, 118],
      ['加气块 600*200*200', '加气块', '立方米', 900, 248],
      ['焊管 DN100 Q235B', '焊管', '吨', 76, 4520],
      ['镀锌管 DN50', '镀锌管', '吨', 42, 5060]
    ]
  )
];

/** 全部历史清单项，用于统计「这条标准已经被多少条非标物料映射过」 */
export const allBidItems: BidItem[] = bidProjects.reduce<BidItem[]>((list, project) => list.concat(project.items), []);

export const bidOf = (itemKey: string) => bidProjects.find(project => project.items.some(item => item.key === itemKey)) ?? null;

/* ========== 推荐候选 ========== */

const today = () => {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

/** 属性名归一：解析用的属性名 + 内置历史写法，都算同一个属性 */
const labelAliases = (label: string) => {
  const aliases: Record<string, string[]> = {
    直径: ['规格', 'Φ径', '断面直径', '公称直径'],
    公称直径: ['DN', '口径', '直径'],
    强度等级: ['标号', '强度标号', '等级'],
    类型: ['品种', '水泥品种'],
    型号: ['规格型号', '电缆型号'],
    芯数截面: ['芯数×截面', '规格', '截面'],
    灯头口径: ['灯头型号', '螺口规格', '接口'],
    色温: ['光色', '灯光颜色'],
    定尺长度: ['定尺', '单件长度', '长度']
  };
  return [label, ...(aliases[label] ?? [])];
};

/**
 * 给一条历史清单项找最匹配的标准物料。
 *
 * 打分口径（可解释，面板上直接写给人看）：
 * - 属性一致度 60%：逐条属性按值比对（全等 / 包含 / 数字一致 分别给分），标准侧多出的属性轻微扣分；
 * - 名称相似度 20%：中文二元组 Dice，处理「三级抗震螺纹钢」vs「热轧带肋抗震钢筋」这类差异；
 * - 历史叫法命中 10%：标准物料登记过的历史叫法出现在原文里，是很强的证据；
 * - 品类命中 10%：品类对不上基本不会是真命天子；
 * - 全部属性逐条一致再加 10 分兜底，避免「完全对得上却因为名称写法不同只给 70 分」。
 */
export const recommendStandards = (
  item: BidItem,
  standards: StandardMaterial[],
  prices: PriceRecord[],
  mapping: Record<string, MappingRecord> = {}
): MappingCandidate[] => {
  const pairs = item.atoms.filter(atom => atom.label !== '品类');
  const category = item.atoms.find(atom => atom.label === '品类')?.value ?? '';
  const rawNorm = norm(item.raw);

  const candidates = standards
    .map(standard => {
      const attrs = standard.attributes.map(parseAttr);
      const compare: CandidateCompare[] = [];
      const matched = new Set<string>();
      let sumRatio = 0;
      let matchedCount = 0;
      let mismatchCount = 0;
      let sameCount = 0;

      pairs.forEach(atom => {
        const aliases = labelAliases(atom.label);
        const hit = attrs.find(attr => aliases.includes(attr.label));
        if (!hit) {
          compare.push({ label: atom.label, mine: atom.value, theirs: '', state: 'missing' });
          return;
        }
        matched.add(hit.label);
        const ratio = valueSimilar(atom.value, hit.value);
        matchedCount += 1;
        sumRatio += ratio;
        if (ratio >= 0.85) sameCount += 1;
        else mismatchCount += 1;
        compare.push({
          label: atom.label,
          mine: atom.value,
          theirs: hit.value,
          state: ratio >= 0.85 ? 'same' : 'diff'
        });
      });
      attrs.forEach(attr => {
        if (!matched.has(attr.label)) compare.push({ label: attr.label, mine: '', theirs: attr.value, state: 'extra' });
      });

      const extras = compare.filter(row => row.state === 'extra').length;
      /**
       * 一致度 = 双方都声明的属性的平均相似度 × 覆盖度系数。
       * 「标准侧多出的属性」和「清单里有、标准没登记（如定尺长度）」都不算分歧——前者是标准更细，
       * 后者正是映射后要补进去的内容，不该因此把正确候选压下去。
       */
      const avgRatio = matchedCount ? sumRatio / matchedCount : 0;
      const coverage = pairs.length ? matchedCount / pairs.length : 0;
      const attrRatio = avgRatio * (0.7 + 0.3 * coverage);
      const nameRatio = dice(item.name, standard.name);
      const synonymHit = standard.synonyms.some(word => word && rawNorm.includes(norm(word)));
      const categoryHit = Boolean(category && standard.category.includes(category));
      /** 双方都声明的属性没有分歧、且至少对上两条（只有一条属性时放宽）→ 强证据 */
      const strong = mismatchCount === 0 && matchedCount > 0 && (pairs.length <= 1 || matchedCount >= 2);

      const base = attrRatio * 0.62 + nameRatio * 0.18 + (synonymHit ? 0.1 : 0) + (categoryHit ? 0.1 : 0);
      const score = Math.min(99, Math.round(base * 100) + (strong ? 10 : 0));

      const reasons: string[] = [];
      if (strong) reasons.push('规格属性逐条一致');
      else if (sameCount) reasons.push(`${sameCount}/${pairs.length} 条属性取值一致`);
      if (synonymHit) reasons.push('命中了该标准登记过的历史叫法');
      if (categoryHit) reasons.push('品类一致');
      if (nameRatio >= 0.4) reasons.push('名称写法高度接近');
      const diffs = compare.filter(row => row.state === 'diff');
      const missing = compare.filter(row => row.state === 'missing');
      if (diffs.length) reasons.push(`需确认：${diffs.map(row => `${row.label}（清单 ${row.mine} / 标准 ${row.theirs}）`).join('；')}`);
      if (missing.length) reasons.push(`标准未登记：${missing.map(row => row.label).join('、')}，映射后可补进去`);
      if (extras) reasons.push(`标准多出：${compare.filter(row => row.state === 'extra').map(row => row.label).join('、')}`);
      if (!reasons.length) reasons.push('仅名称有少量字面接近，建议人工核对');

      const records = prices.filter(record => record.materialCode === standard.code);
      const values = records.map(record => record.unitPrice);
      const linked = allBidItems
        .filter(other => other.key !== item.key && mapping[other.key]?.standardKey === standard.key && mapping[other.key]?.confirmed)
        .map(other => other.raw);

      return {
        key: standard.key,
        code: standard.code,
        name: standard.name,
        category: standard.category,
        score,
        compare,
        reasons,
        priceCount: records.length,
        avgPrice: values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0,
        minPrice: values.length ? Math.min(...values) : 0,
        maxPrice: values.length ? Math.max(...values) : 0,
        priceUnit: records[0]?.unit ?? item.unit,
        linked,
        synonyms: standard.synonyms
      } as MappingCandidate;
    })
    .filter(candidate => candidate.score >= 35)
    .sort((a, b) => b.score - a.score);

  return candidates.slice(0, 4);
};

/** 自动映射的门槛：低于这个分不硬塞，留给人工判定（也可以直接转治理建档） */
export const AUTO_MAP_THRESHOLD = 68;

/* ========== 映射记录 ========== */

/**
 * 把候选落成映射记录：规格型号默认取「标准已有的 + 解析出来但标准没登记的」。
 * 后者就是「映射上之后要补充规格型号」——系统先帮你补好，经办人再改。
 */
export const buildMapping = (
  item: BidItem,
  standard: StandardMaterial,
  options: { by?: MappingRecord['by']; confirmed?: boolean } = {}
): MappingRecord => {
  const attributes: AttributeRow[] = standard.attributes.map(text => {
    const attr = parseAttr(text);
    return { label: attr.label, value: attr.value, source: 'standard' as const };
  });
  item.atoms
    .filter(atom => atom.label !== '品类')
    .forEach(atom => {
      const aliases = labelAliases(atom.label);
      const hit = attributes.find(row => aliases.includes(row.label));
      if (hit) {
        // 标准里已有同名属性但值不同：以标准值为准，把差异留在参照区给人看，不悄悄改标准
        return;
      }
      attributes.push({ label: atom.label, value: atom.value, source: 'ai' });
    });

  return {
    standardKey: standard.key,
    attributes,
    alias: item.name,
    confirmed: options.confirmed ?? false,
    by: options.by ?? 'ai',
    updatedAt: today()
  };
};

/** 标准库里没有 → 标记为新物料，规格型号直接带解析结果，提交后可以转治理建档 */
export const buildNewMaterialMapping = (item: BidItem): MappingRecord => ({
  standardKey: null,
  attributes: item.atoms.map(atom => ({ label: atom.label, value: atom.value, source: 'ai' as const })),
  alias: item.name,
  confirmed: true,
  by: 'new',
  updatedAt: today()
});

/** 对某个项目跑一遍自动映射（只给达到门槛的项），返回待写入的记录 */
export const autoMapProject = (
  project: BidProject,
  standards: StandardMaterial[],
  prices: PriceRecord[],
  options: { confirmThreshold?: number; onlyMissing?: Record<string, MappingRecord> } = {}
) => {
  const records: Array<{ itemKey: string; record: MappingRecord }> = [];
  project.items.forEach(item => {
    if (options.onlyMissing?.[item.key]) return;
    const best = recommendStandards(item, standards, prices, options.onlyMissing ?? {})[0];
    if (!best || best.score < AUTO_MAP_THRESHOLD) return;
    const standard = standards.find(std => std.key === best.key);
    if (!standard) return;
    const confirmed = options.confirmThreshold !== undefined && best.score >= options.confirmThreshold;
    records.push({ itemKey: item.key, record: buildMapping(item, standard, { by: 'ai', confirmed }) });
  });
  return records;
};

/** 演示种子：2024 年的两个项目已经映射过（一个全部完成、一个做了一半），其余待处理 */
export const initialMappings = (
  standards: StandardMaterial[] = initialStandards,
  prices: PriceRecord[] = initialPrices
): Record<string, MappingRecord> => {
  const mapping: Record<string, MappingRecord> = {};
  const done = bidProjects.find(project => project.key === 'bid-2024-06104');
  const partial = bidProjects.find(project => project.key === 'bid-2024-08812');

  if (done) {
    autoMapProject(done, standards, prices, { confirmThreshold: 0 }).forEach(entry => {
      mapping[entry.itemKey] = entry.record;
    });
  }
  if (partial) {
    // 预映射全部落库，但只确认前几条：列表上「映射中」与「待复核」两种状态都能看到
    autoMapProject(partial, standards, prices).forEach((entry, index) => {
      mapping[entry.itemKey] = { ...entry.record, confirmed: index < 6 };
    });
  }
  return mapping;
};

/* ========== 统计与状态 ========== */

export const statusOf = (record: MappingRecord | undefined): MappingStatus => {
  if (!record) return 'todo';
  if (record.by === 'new') return 'new';
  return record.confirmed ? 'done' : 'pending';
};

export const statusText: Record<MappingStatus, string> = {
  todo: '未映射',
  pending: '待复核',
  done: '已确认',
  new: '转治理建档'
};

export const projectStats = (project: BidProject, mapping: Record<string, MappingRecord>) => {
  const total = project.items.length;
  let done = 0;
  let pending = 0;
  let fresh = 0;
  let amount = 0;
  project.items.forEach(item => {
    const record = mapping[item.key];
    const status = statusOf(record);
    if (status === 'done') done += 1;
    else if (status === 'pending') pending += 1;
    else if (status === 'new') fresh += 1;
    // 只有真正挂到标准物料上的历史价才算「可归集」；标记新物料的那条还没进标准口径
    if (record?.confirmed && record.standardKey) amount += item.quantity * item.unitPrice;
  });
  return {
    total,
    done,
    pending,
    newMaterial: fresh,
    todo: total - done - pending - fresh,
    /** 已确认映射的清单项 = 可归入标准口径的历史成交价条数 */
    reusable: done,
    coverage: total ? Math.round(((done + fresh) / total) * 100) : 0,
    amount
  };
};

export const overallStats = (mapping: Record<string, MappingRecord>) => {
  return bidProjects.reduce(
    (sum, project) => {
      const stats = projectStats(project, mapping);
      return {
        projects: sum.projects + 1,
        items: sum.items + stats.total,
        done: sum.done + stats.done,
        pending: sum.pending + stats.pending,
        newMaterial: sum.newMaterial + stats.newMaterial,
        reusable: sum.reusable + stats.reusable,
        amount: sum.amount + stats.amount
      };
    },
    { projects: 0, items: 0, done: 0, pending: 0, newMaterial: 0, reusable: 0, amount: 0 }
  );
};

/** 项目列表状态：全确认 = 已映射；有映射记录 = 映射中；否则待映射 */
export const projectStatusOf = (project: BidProject, mapping: Record<string, MappingRecord>) => {
  const stats = projectStats(project, mapping);
  const handled = stats.done + stats.newMaterial;
  if (handled >= stats.total) return 'done' as const;
  if (stats.done + stats.pending + stats.newMaterial > 0) return 'doing' as const;
  return 'todo' as const;
};

export const projectStatusText = { todo: '待映射', doing: '映射中', done: '已映射' } as const;
