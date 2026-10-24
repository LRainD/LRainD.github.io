export type PageKey = 'purchase-list' | 'overview' | 'import' | 'governance' | 'standards' | 'price-review' | 'inquiry' | 'tasks';

export type Atom = { key: string; label: string; value: string; confidence: number };
export type MaterialItem = {
  key: string;
  sourceName: string;
  category: string;
  bureau: string;
  unit: string;
  atoms: Atom[];
  selectedAtomKeys: string[];
  confidence: number;
};

export type StandardMaterial = {
  key: string;
  code: string;
  name: string;
  category: string;
  attributes: string[];
  synonyms: string[];
  prices: number;
  updatedAt: string;
};

export type PriceRecord = {
  key: string;
  materialCode: string;
  materialName: string;
  unitPrice: number;
  unit: string;
  source: '合同' | '招标清单';
  sourceNo: string;
  brand: string;
  bureau: string;
  region: string;
  signDate: string;
  confidence: number;
  abnormal?: boolean;
};

export type GovernanceTask = {
  key: string;
  name: string;
  category: string;
  bureau: string;
  assignee: string;
  deadline: string;
  total: number;
  completed: number;
  status: '进行中' | '已完成' | '已逾期';
};

export const pageItems: Array<{ key: PageKey; label: string }> = [
  { key: 'purchase-list', label: '编制采购清单' },
  { key: 'overview', label: '治理总览' },
  { key: 'import', label: '数据源接入' },
  { key: 'governance', label: 'AI治理工作台' },
  { key: 'standards', label: '标准物料库' },
  { key: 'price-review', label: '价格入库审核' },
  { key: 'inquiry', label: '智能询价' },
  { key: 'tasks', label: '任务追踪' }
];

export const governanceMaterials: MaterialItem[] = [
  {
    key: 'm1', sourceName: 'HRB400E Φ25mm 热轧带肋抗震钢筋', category: '钢筋', bureau: '中建八局', unit: '吨', confidence: 96,
    atoms: [
      { key: 'category', label: '品类', value: '钢筋', confidence: 99 },
      { key: 'grade', label: '牌号', value: 'HRB400E', confidence: 98 },
      { key: 'diameter', label: '直径', value: 'Φ25mm', confidence: 97 },
      { key: 'shape', label: '外形', value: '热轧带肋', confidence: 91 },
      { key: 'feature', label: '特性', value: '抗震', confidence: 88 }
    ],
    selectedAtomKeys: ['category', 'grade', 'diameter', 'shape', 'feature']
  },
  {
    key: 'm2', sourceName: '三级抗震螺纹钢 20', category: '钢筋', bureau: '中建三局', unit: '吨', confidence: 78,
    atoms: [
      { key: 'category', label: '品类', value: '钢筋', confidence: 96 },
      { key: 'grade', label: '牌号', value: 'HRB400E', confidence: 72 },
      { key: 'diameter', label: '直径', value: 'Φ20mm', confidence: 83 },
      { key: 'shape', label: '外形', value: '热轧带肋', confidence: 76 },
      { key: 'feature', label: '特性', value: '抗震', confidence: 81 }
    ],
    selectedAtomKeys: ['category', 'grade', 'diameter', 'shape', 'feature']
  },
  {
    key: 'm3', sourceName: '螺旋节能灯 22W E27 暖光', category: '灯具', bureau: '中建五局', unit: '个', confidence: 93,
    atoms: [
      { key: 'category', label: '品类', value: '节能灯', confidence: 99 },
      { key: 'power', label: '功率', value: '22W', confidence: 98 },
      { key: 'socket', label: '灯头口径', value: 'E27', confidence: 95 },
      { key: 'temperature', label: '色温', value: '暖光', confidence: 90 }
    ],
    selectedAtomKeys: ['category', 'power', 'socket', 'temperature']
  }
];

export const initialStandards: StandardMaterial[] = [
  { key: 's1', code: 'STD-GJ-000128', name: 'HRB400E 热轧带肋抗震钢筋 Φ20mm', category: '建材 / 钢材 / 钢筋', attributes: ['牌号：HRB400E', '直径：Φ20mm', '外形：热轧带肋', '特性：抗震'], synonyms: ['三级抗震钢20', 'E标螺纹钢20'], prices: 36, updatedAt: '2026-10-20' },
  { key: 's2', code: 'STD-GJ-000129', name: 'HRB400E 热轧带肋抗震钢筋 Φ25mm', category: '建材 / 钢材 / 钢筋', attributes: ['牌号：HRB400E', '直径：Φ25mm', '外形：热轧带肋', '特性：抗震'], synonyms: ['三级抗震钢25', '抗震螺纹25'], prices: 28, updatedAt: '2026-10-21' },
  { key: 's3', code: 'STD-SN-000042', name: 'P.O 42.5 普通硅酸盐水泥', category: '建材 / 水泥及制品 / 水泥', attributes: ['强度等级：42.5', '类型：普通硅酸盐'], synonyms: ['普硅42.5', 'PO425水泥'], prices: 51, updatedAt: '2026-10-18' },
  { key: 's4', code: 'STD-DQ-000307', name: 'E27 螺旋节能灯 22W 暖光', category: '电气 / 灯具 / 节能灯', attributes: ['功率：22W', '灯头口径：E27', '色温：暖光'], synonyms: ['大瓦数暖灯', 'E27暖白灯'], prices: 12, updatedAt: '2026-10-17' }
];

export const initialPrices: PriceRecord[] = [
  { key: 'p1', materialCode: 'STD-GJ-000129', materialName: 'HRB400E 热轧带肋抗震钢筋 Φ25mm', unitPrice: 3860, unit: '吨', source: '合同', sourceNo: 'HT-2026-08312', brand: '安钢', bureau: '中建八局', region: '河南省郑州市', signDate: '2026-09-28', confidence: 97 },
  { key: 'p2', materialCode: 'STD-GJ-000129', materialName: 'HRB400E 热轧带肋抗震钢筋 Φ25mm', unitPrice: 3928, unit: '吨', source: '招标清单', sourceNo: 'ZB-2026-12098', brand: '河钢', bureau: '中建三局', region: '湖北省武汉市', signDate: '2026-09-16', confidence: 92 },
  { key: 'p3', materialCode: 'STD-SN-000042', materialName: 'P.O 42.5 普通硅酸盐水泥', unitPrice: 468, unit: '吨', source: '合同', sourceNo: 'HT-2026-07931', brand: '海螺', bureau: '中建五局', region: '湖南省长沙市', signDate: '2026-08-22', confidence: 95 },
  { key: 'p4', materialCode: 'STD-DQ-000307', materialName: 'E27 螺旋节能灯 22W 暖光', unitPrice: 118, unit: '个', source: '招标清单', sourceNo: 'ZB-2026-10881', brand: '欧普', bureau: '中建八局', region: '山东省济南市', signDate: '2026-07-09', confidence: 61, abnormal: true }
];

export const initialTasks: GovernanceTask[] = [
  { key: 't1', name: '钢筋品类近五年数据治理', category: '钢筋', bureau: '中建八局', assignee: '张工', deadline: '2026-11-15', total: 500, completed: 128, status: '进行中' },
  { key: 't2', name: '水泥价格数据入库复核', category: '水泥', bureau: '中建五局', assignee: '李敏', deadline: '2026-10-28', total: 240, completed: 196, status: '进行中' },
  { key: 't3', name: '管材标准物料首批建库', category: '管材', bureau: '中建三局', assignee: '王磊', deadline: '2026-10-20', total: 360, completed: 242, status: '已逾期' },
  { key: 't4', name: '灯具规格原子化治理', category: '灯具', bureau: '中建八局', assignee: '周颖', deadline: '2026-10-18', total: 180, completed: 180, status: '已完成' }
];

export const inquirySeed = `HRB400E抗震螺纹钢 Φ25  120吨\nP.O42.5普通硅酸盐水泥  800吨\n精装修客房吊顶轻钢龙骨  3200㎡`;
