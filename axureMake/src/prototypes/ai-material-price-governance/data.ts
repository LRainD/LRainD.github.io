export type PageKey = 'overview' | 'import' | 'workbench' | 'library' | 'price-audit' | 'inquiry' | 'tasks';

export interface MaterialRecord {
  key: string;
  id: string;
  name: string;
  category: string;
  atoms: string[];
  synonyms: string[];
  status: string;
  prices: number;
  expert: string;
  updatedAt: string;
}

export interface PriceRecord {
  key: string;
  material: string;
  price: number;
  unit: string;
  source: string;
  document: string;
  bureau: string;
  region: string;
  date: string;
  confidence: number;
  status: string;
}

export interface TaskRecord {
  key: string;
  name: string;
  category: string;
  bureau: string;
  assignee: string;
  deadline: string;
  progress: number;
  status: string;
  total: number;
}

export const materialRecords: MaterialRecord[] = [
  { key: '1', id: 'MAT-GB-000238', name: 'HRB400E Φ25mm 热轧带肋抗震钢筋', category: '建材 / 钢材 / 钢筋', atoms: ['牌号：HRB400E', '直径：25mm', '外形：热轧带肋', '特性：抗震'], synonyms: ['三级抗震钢', '25厘E标螺纹钢', 'HRB400E钢筋25'], status: '已生效', prices: 38, expert: '张建国', updatedAt: '2026-10-22 14:30' },
  { key: '2', id: 'MAT-DQ-000086', name: '22W E27 螺旋节能灯（暖光）', category: '电气 / 灯具 / 光源', atoms: ['类型：螺旋节能灯', '功率：22W', '灯头口径：E27', '色温：暖光'], synonyms: ['大瓦数暖光灯', 'E27螺旋灯22瓦'], status: '已生效', prices: 16, expert: '刘晓梅', updatedAt: '2026-10-21 16:12' },
  { key: '3', id: 'MAT-SN-000119', name: 'P.O 42.5 普通硅酸盐水泥（散装）', category: '建材 / 水泥 / 通用水泥', atoms: ['强度等级：P.O 42.5', '包装：散装', '类型：普通硅酸盐'], synonyms: ['425散水泥', 'PO42.5水泥'], status: '已生效', prices: 52, expert: '王海峰', updatedAt: '2026-10-20 10:08' },
  { key: '4', id: 'MAT-GC-000305', name: 'DN100 热镀锌钢管（国标）', category: '管材 / 金属管 / 镀锌钢管', atoms: ['公称直径：DN100', '工艺：热镀锌', '标准：国标'], synonyms: ['4寸镀锌管', 'DN100国标钢管'], status: '待审核', prices: 9, expert: '周志强', updatedAt: '2026-10-22 09:45' },
  { key: '5', id: 'MAT-FS-000177', name: 'SBS改性沥青防水卷材 4mm II型', category: '建材 / 防水 / 防水卷材', atoms: ['材质：SBS改性沥青', '厚度：4mm', '型号：II型'], synonyms: ['SBS卷材4厚', '4mm改性沥青卷材'], status: '已生效', prices: 27, expert: '陈莉', updatedAt: '2026-10-19 18:20' }
];

export const priceRecords: PriceRecord[] = [
  { key: 'p1', material: 'HRB400E Φ25mm 热轧带肋抗震钢筋', price: 3860, unit: '吨', source: '合同文本', document: '华东区域钢材联合采购合同', bureau: '中建八局', region: '上海市', date: '2026-09-18', confidence: 96, status: '待审核' },
  { key: 'p2', material: 'HRB400E Φ25mm 热轧带肋抗震钢筋', price: 3915, unit: '吨', source: '合同文本', document: '临港新城项目钢筋采购合同', bureau: '中建二局', region: '上海市', date: '2026-09-25', confidence: 91, status: '待审核' },
  { key: 'p3', material: 'HRB400E Φ25mm 热轧带肋抗震钢筋', price: 3798, unit: '吨', source: '招标清单', document: '浦东机场扩建项目招标清单', bureau: '中建三局', region: '上海市', date: '2026-08-12', confidence: 87, status: '待审核' },
  { key: 'p4', material: 'P.O 42.5 普通硅酸盐水泥（散装）', price: 475, unit: '吨', source: '合同文本', document: '华南片区水泥采购框架协议', bureau: '中建四局', region: '广东省', date: '2026-09-02', confidence: 94, status: '待审核' },
  { key: 'p5', material: 'P.O 42.5 普通硅酸盐水泥（散装）', price: 462, unit: '吨', source: '招标清单', document: '深圳湾项目水泥招标清单', bureau: '中建一局', region: '广东省', date: '2026-08-21', confidence: 82, status: '价格存疑' }
];

export const taskRecords: TaskRecord[] = [
  { key: 't1', name: '钢筋品类标准化治理（华东试点）', category: '钢筋', bureau: '中建八局', assignee: '张建国', deadline: '2026-11-15', progress: 72, status: '进行中', total: 500 },
  { key: 't2', name: '水泥历史物料治理', category: '水泥', bureau: '中建四局', assignee: '王海峰', deadline: '2026-11-08', progress: 46, status: '进行中', total: 320 },
  { key: 't3', name: '管材标准属性补全', category: '管材', bureau: '中建二局', assignee: '周志强', deadline: '2026-10-20', progress: 81, status: '已逾期', total: 180 },
  { key: 't4', name: '灯具物料标准化一期', category: '灯具', bureau: '中建三局', assignee: '刘晓梅', deadline: '2026-10-18', progress: 100, status: '已完成', total: 240 },
  { key: 't5', name: '防水材料同义词清洗', category: '防水材料', bureau: '中建一局', assignee: '陈莉', deadline: '2026-11-22', progress: 28, status: '进行中', total: 210 }
];

export const governanceCases = [
  {
    id: 'RAW-202610-00861',
    original: '三级抗震钢 25厘 E标螺纹钢，热轧带肋',
    category: '钢筋',
    source: '华东区域钢材联合采购清单.xlsx',
    atoms: [
      { key: 'category', label: '品类', value: '钢筋', confidence: 99 },
      { key: 'grade', label: '牌号', value: 'HRB400E', confidence: 94 },
      { key: 'diameter', label: '直径', value: '25mm', confidence: 97 },
      { key: 'shape', label: '外形', value: '热轧带肋', confidence: 91 },
      { key: 'feature', label: '特性', value: '抗震', confidence: 88 }
    ]
  },
  {
    id: 'RAW-202610-00862',
    original: '螺旋节能灯 22W E27 暖白光',
    category: '灯具',
    source: '办公区机电安装采购合同.pdf',
    atoms: [
      { key: 'category', label: '品类', value: '灯泡', confidence: 98 },
      { key: 'type', label: '类型', value: '螺旋节能灯', confidence: 96 },
      { key: 'power', label: '功率', value: '22W', confidence: 99 },
      { key: 'socket', label: '灯头口径', value: 'E27', confidence: 95 },
      { key: 'color', label: '色温', value: '暖光', confidence: 76 }
    ]
  }
];
