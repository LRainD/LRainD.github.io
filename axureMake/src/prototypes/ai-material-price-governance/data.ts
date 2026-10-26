export type PageKey =
  | 'purchase-list'
  | 'overview'
  | 'import'
  | 'governance'
  | 'standards'
  | 'standards-edit'
  | 'review'
  | 'review-detail'
  | 'material-mapping'
  | 'mapping-detail'
  | 'analysis'
  | 'inquiry'
  | 'tasks';

export type Atom = {
  key: string;
  label: string;
  value: string;
  confidence: number;
  /**
   * 属性名同义词 / 历史叫法。
   * 历史文件里同一个规格属性常写成「规格」「Φ直径」「断面直径」，
   * 登记到这里后续拆解与匹配会自动归并到同一属性。
   */
  synonyms?: string[];
};
export type MaterialItem = {
  key: string;
  sourceName: string;
  category: string;
  bureau: string;
  unit: string;
  atoms: Atom[];
  selectedAtomKeys: string[];
  confidence: number;
  /** 商品名称的同义词 / 历史叫法，可以有多条（历史文件的不同写法） */
  synonyms?: string[];
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
  /** 属性级同义词：属性名 → 历史叫法，随确认入库一起落到标准物料上 */
  attributeSynonyms?: Record<string, string[]>;
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

export type PriceDecision = '采用' | '存疑' | '不采用';

/** 组装结果（专家提交的入库申请）的审核状态 */
export type ReviewStatus = '待审核' | '已通过' | '已驳回';

/**
 * 提交方式：这次提交是「新开一条标准物料」，还是「修改标准库里已有的那条」。
 *
 * 业务上这两种情况都会发生：专家组装时常常发现标准库里已经有同一件商品，
 * 只是属性值要改、属性要补、或者历史叫法要加 —— 那就不能重复建档，应当合并进原物料。
 */
export type ChangeType = 'new' | 'update';

/** 变更明细的类型：改属性值 / 新增属性 / 新增属性同义词 / 新增商品历史叫法 */
export type ChangeKind = 'value' | 'add-atom' | 'atom-synonym' | 'name-synonym';

/** 相对目标标准物料的一条差异，审核页按它逐条核对「到底改了什么」 */
export type SubmissionChange = {
  kind: ChangeKind;
  /** 属性名：value / atom-synonym 记标准侧属性名；add-atom 记提交侧属性名 */
  label?: string;
  /** 提交侧属性名与标准侧写法不同时，记下另一种叫法，便于审核对照 */
  alias?: string;
  /** 标准库现值（改值前的值） */
  before?: string;
  /** 本次提交的值 */
  after?: string;
  /** 本次新增的历史叫法 */
  words?: string[];
};

/** 审核对象：业务专家在治理工作台组装完成、等待审核的一件商品快照 */
export type MaterialSubmission = {
  key: string;
  /** 所属治理任务；null 表示内置演示物料 */
  taskKey: string | null;
  taskName: string;
  /** 来源物料 key，同一物料重复提交时覆盖同一条记录 */
  materialKey: string;
  /** 来源原始描述，审核时用来对照专家有没有组装跑偏 */
  sourceName: string;
  /** 组装结果：勾选属性值拼接出的商品名称 */
  name: string;
  category: string;
  unit: string;
  bureau: string;
  /** 参与组装的属性：属性名 + 属性值 + 该属性的历史叫法，审核逐条核对 */
  atoms: Array<{ label: string; value: string; synonyms: string[] }>;
  /** 商品名称的历史叫法，通过后一起写入标准物料 */
  synonyms: string[];
  /** 新增建档 or 修改已有标准物料 */
  changeType: ChangeType;
  /** changeType=update 时被修改的标准物料：key / 编码 / 名称都存快照，审核页不用再查 */
  targetStandardKey?: string;
  targetStandardCode?: string;
  targetStandardName?: string;
  /** 相对目标标准的差异明细（提交时算好并快照）；新增建档时为空数组 */
  changes: SubmissionChange[];
  submitter: string;
  submittedAt: string;
  /** 第几次提交：驳回后重新提交会累加，审核页可以看到改了几版 */
  attempt: number;
  status: ReviewStatus;
  /** 审核意见 / 驳回原因（驳回必填） */
  comment?: string;
  reviewer?: string;
  reviewedAt?: string;
  /** 通过后写入的标准物料 */
  standardKey?: string;
  standardCode?: string;
};

/** 导入任务携带的原始批次：任务追踪 → 治理工作台靠它取到"这一次"的真实数据 */
export type TaskSource = {
  fileName: string;
  sheetName?: string;
  createdAt: string;
  /** 本次导入并完成 AI 拆解的物料，顺序即治理顺序 */
  materials: MaterialItem[];
  /** 已确认入库的物料 key，用于计算进度与定位下一条 */
  confirmedKeys: string[];
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
  /** 待审核：物料已全部提交、等审核专家确认入库 */
  status: '进行中' | '待审核' | '已完成' | '已逾期';
  /** 有值表示这是「数据源接入」产生的导入任务 */
  source?: TaskSource;
};

/**
 * 常见属性名的历史写法。
 * 导入/AI 拆解时自动带出，专家在治理工作台里可以增删——
 * 这是「历史文件描述不同、其实是同一规格属性」的归并依据。
 */
export const defaultAtomSynonyms: Record<string, string[]> = {
  品类: ['材料类别', '物料类别'],
  牌号: ['钢种', '牌号等级'],
  直径: ['规格', 'Φ径', '断面直径'],
  规格: ['规格型号', '型号'],
  规格型号: ['规格', '型号'],
  外形: ['表面形状', '外形特征'],
  特性: ['性能', '特殊要求'],
  材质: ['材料', '材质说明'],
  强度等级: ['标号', '强度标号'],
  公称直径: ['DN', '口径'],
  壁厚: ['管壁厚度'],
  功率: ['瓦数', '额定功率'],
  灯头口径: ['灯头型号', '螺口规格'],
  色温: ['光色', '灯光颜色'],
  长度: ['单件长度'],
  厚度: ['板厚'],
  品牌: ['厂商', '生产厂家'],
  执行标准: ['标准号', '国标'],
  表面处理: ['镀层', '涂装'],
  单位: ['计量单位']
};

/**
 * 二级菜单按「数据从哪来 → 谁整理 → 谁审核 → 沉淀成标准库 → 业务怎么用 → 最后看整体」排：
 * 接入清洗 → 专家任务 → 专家组装 → 运营入库审核 → 标准物料库 → 采购清单 → 物料映射 → 价格分析 → 智能询价 → 治理总览。
 * 演示按菜单从上往下走一遍就是完整闭环，不要让「治理总览」占着第一位。
 */
export const pageItems: Array<{ key: PageKey; label: string; hidden?: boolean }> = [
  { key: 'import', label: '数据接入清洗' },
  { key: 'tasks', label: '专家任务' },
  { key: 'governance', label: '专家治理工作台' },
  { key: 'review', label: '运营入库审核' },
  { key: 'review-detail', label: '审核组装结果', hidden: true },
  { key: 'standards', label: '标准物料库' },
  { key: 'standards-edit', label: '编辑标准物料', hidden: true },
  { key: 'purchase-list', label: '编制采购清单' },
  { key: 'material-mapping', label: '物料映射' },
  { key: 'mapping-detail', label: '清单映射', hidden: true },
  { key: 'analysis', label: '价格分析' },
  { key: 'inquiry', label: '智能询价' },
  { key: 'overview', label: '治理总览' }
];

export const governanceMaterials: MaterialItem[] = [
  {
    // 演示「修改已有物料」的那条：标准库已有 STD-GJ-000129（Φ25mm），
    // 专家组装时补了一条执行标准、把外形写细成「月牙纹」、并登记了历史叫法。
    key: 'm1', sourceName: 'HRB400E Φ25mm 热轧带肋抗震钢筋', category: '钢筋', bureau: '中建八局', unit: '吨', confidence: 96,
    synonyms: ['三级抗震钢25', '抗震螺纹25', 'HRB400E抗震钢25', 'HRB400E Φ25mm 热轧带肋抗震钢筋'],
    atoms: [
      { key: 'category', label: '品类', value: '钢筋', confidence: 99, synonyms: ['材料类别', '物料类别'] },
      { key: 'grade', label: '牌号', value: 'HRB400E', confidence: 98, synonyms: ['钢种', '牌号等级', '钢材牌号'] },
      { key: 'diameter', label: '直径', value: 'Φ25mm', confidence: 97, synonyms: ['规格', 'Φ径', '断面直径'] },
      { key: 'shape', label: '外形', value: '热轧带肋（月牙纹）', confidence: 91, synonyms: ['表面形状', '外形特征'] },
      { key: 'feature', label: '特性', value: '抗震', confidence: 88, synonyms: ['性能', '特殊要求'] },
      { key: 'standard', label: '执行标准', value: 'GB/T 1499.2-2018', confidence: 100, synonyms: [] }
    ],
    selectedAtomKeys: ['category', 'grade', 'diameter', 'shape', 'feature', 'standard']
  },
  {
    key: 'm2', sourceName: '三级抗震螺纹钢 20', category: '钢筋', bureau: '中建三局', unit: '吨', confidence: 78,
    synonyms: ['HRB400E Φ20 抗震钢筋', '抗震螺纹钢20'],
    atoms: [
      { key: 'category', label: '品类', value: '钢筋', confidence: 96, synonyms: ['材料类别'] },
      { key: 'grade', label: '牌号', value: 'HRB400E', confidence: 72, synonyms: ['钢种'] },
      { key: 'diameter', label: '直径', value: 'Φ20mm', confidence: 83, synonyms: ['规格'] },
      { key: 'shape', label: '外形', value: '热轧带肋', confidence: 76 },
      { key: 'feature', label: '特性', value: '抗震', confidence: 81, synonyms: ['性能'] }
    ],
    selectedAtomKeys: ['category', 'grade', 'diameter', 'shape', 'feature']
  },
  {
    key: 'm3', sourceName: '螺旋节能灯 22W E27 暖光', category: '灯具', bureau: '中建五局', unit: '个', confidence: 93,
    synonyms: ['22W螺旋灯 E27 暖白', '节能灯泡22瓦'],
    atoms: [
      { key: 'category', label: '品类', value: '节能灯', confidence: 99, synonyms: ['灯具类别'] },
      { key: 'power', label: '功率', value: '22W', confidence: 98, synonyms: ['瓦数', '额定功率'] },
      { key: 'socket', label: '灯头口径', value: 'E27', confidence: 95, synonyms: ['灯头型号', '螺口规格'] },
      { key: 'temperature', label: '色温', value: '暖光', confidence: 90, synonyms: ['光色', '灯光颜色'] }
    ],
    selectedAtomKeys: ['category', 'power', 'socket', 'temperature']
  }
];

/**
 * 标准物料库种子数据。
 * 编制采购清单页的「附件引用」会把清单行匹配到这里的物料上，
 * 因此需要覆盖常见品类（钢筋 / 水泥 / 管材 / 电气 / 砌体 / 砂石），否则 AI 无候选可选。
 *
 * 末尾三条（STD-GJ-000132~134）来自 `doc/example/附件一：报价表.xls`
 * ——中建三局西南公司全国区域钢筋采购的报价清单。
 * 目的是让「智能询价 → 上传报价表」这条演示动线一上传就能匹配到标准物料：
 * 报价表里的三项是「高线 / 盘螺 / 螺纹钢（含圆钢、高强螺纹钢）」按直径区间报价，
 * 所以标准侧也按区间建档，原文的区间写法与清单名称一并登记进历史叫法，
 * 本地兜底匹配靠它命中（不依赖大模型通道也能跑通演示）。
 */
export const initialStandards: StandardMaterial[] = [
  { key: 's1', code: 'STD-GJ-000128', name: 'HRB400E 热轧带肋抗震钢筋 Φ20mm', category: '建材 / 钢材 / 钢筋', attributes: ['牌号：HRB400E', '直径：Φ20mm', '外形：热轧带肋', '特性：抗震'], synonyms: ['三级抗震钢20', 'E标螺纹钢20', '螺纹钢20'], prices: 36, updatedAt: '2026-10-20', attributeSynonyms: { 牌号: ['钢种', '牌号等级'], 直径: ['规格', 'Φ径', '断面直径'], 外形: ['表面形状'], 特性: ['性能'] } },
  { key: 's2', code: 'STD-GJ-000129', name: 'HRB400E 热轧带肋抗震钢筋 Φ25mm', category: '建材 / 钢材 / 钢筋', attributes: ['牌号：HRB400E', '直径：Φ25mm', '外形：热轧带肋', '特性：抗震'], synonyms: ['三级抗震钢25', '抗震螺纹25', '螺纹钢25'], prices: 28, updatedAt: '2026-10-21', attributeSynonyms: { 牌号: ['钢种'], 直径: ['规格', 'Φ径'], 外形: ['表面形状'] } },
  { key: 's3', code: 'STD-SN-000042', name: 'P.O 42.5 普通硅酸盐水泥', category: '建材 / 水泥及制品 / 水泥', attributes: ['强度等级：42.5', '类型：普通硅酸盐'], synonyms: ['普硅42.5', 'PO425水泥'], prices: 51, updatedAt: '2026-10-18' },
  { key: 's4', code: 'STD-DQ-000307', name: 'E27 螺旋节能灯 22W 暖光', category: '电气 / 灯具 / 节能灯', attributes: ['功率：22W', '灯头口径：E27', '色温：暖光'], synonyms: ['大瓦数暖灯', 'E27暖白灯'], prices: 12, updatedAt: '2026-10-17' },
  { key: 's5', code: 'STD-GJ-000130', name: 'HRB400E 热轧带肋抗震钢筋 Φ12mm', category: '建材 / 钢材 / 钢筋', attributes: ['牌号：HRB400E', '直径：Φ12mm', '外形：热轧带肋', '特性：抗震'], synonyms: ['三级抗震钢12', '螺纹钢12'], prices: 24, updatedAt: '2026-10-20' },
  { key: 's6', code: 'STD-GJ-000131', name: 'HPB300 热轧光圆钢筋 Φ8mm', category: '建材 / 钢材 / 钢筋', attributes: ['牌号：HPB300', '直径：Φ8mm', '外形：热轧光圆'], synonyms: ['一级圆钢8', '盘圆8', '线材8'], prices: 19, updatedAt: '2026-10-15' },
  { key: 's7', code: 'STD-SN-000043', name: 'P.C 32.5 复合硅酸盐水泥', category: '建材 / 水泥及制品 / 水泥', attributes: ['强度等级：32.5', '类型：复合硅酸盐'], synonyms: ['复合32.5', 'PC325水泥'], prices: 33, updatedAt: '2026-10-16' },
  { key: 's8', code: 'STD-GC-000215', name: 'Q235B 焊接钢管 DN100', category: '建材 / 管材 / 焊接钢管', attributes: ['材质：Q235B', '公称直径：DN100', '连接方式：焊接', '表面处理：黑管'], synonyms: ['焊管100', 'DN100钢管'], prices: 41, updatedAt: '2026-10-19', attributeSynonyms: { 材质: ['材料', '管材'], 公称直径: ['口径', 'DN'], 连接方式: ['接口形式'], 表面处理: ['涂装', '镀层'] } },
  { key: 's9', code: 'STD-GC-000216', name: 'Q235B 热镀锌钢管 DN50', category: '建材 / 管材 / 镀锌钢管', attributes: ['材质：Q235B', '公称直径：DN50', '表面处理：热镀锌'], synonyms: ['镀锌管50', 'DN50镀锌钢管'], prices: 27, updatedAt: '2026-10-19' },
  { key: 's10', code: 'STD-DL-000088', name: 'YJV 交联聚乙烯电缆 4×25+1×16', category: '电气 / 电线电缆 / 电力电缆', attributes: ['型号：YJV', '芯数截面：4×25+1×16', '电压等级：0.6/1kV', '材质：铜芯'], synonyms: ['YJV4*25+1*16', '铜芯电缆4x25'], prices: 16, updatedAt: '2026-10-14', attributeSynonyms: { 型号: ['规格型号', '电缆型号'], 芯数截面: ['芯数×截面', '规格'], 电压等级: ['额定电压'] } },
  { key: 's11', code: 'STD-QK-000051', name: '蒸压加气混凝土砌块 600×200×200', category: '建材 / 砌体材料 / 加气块', attributes: ['长度：600mm', '高度：200mm', '厚度：200mm', '强度等级：A3.5'], synonyms: ['加气块200', '轻质砌块'], prices: 22, updatedAt: '2026-10-13' },
  { key: 's12', code: 'STD-SL-000019', name: '机制砂 中砂 细度模数2.3~3.0', category: '建材 / 砂石骨料 / 砂', attributes: ['品类：机制砂', '粒径：中砂', '细度模数：2.3~3.0'], synonyms: ['中砂', '机制中砂'], prices: 18, updatedAt: '2026-10-12' },
  /* ---- 以下三条来自 附件一：报价表.xls（中建三局西南公司全国区域钢筋采购） ---- */
  { key: 's13', code: 'STD-GJ-000132', name: '高线 HPB300 Φ6~Φ12 热轧光圆', category: '建材 / 钢材 / 高线（盘条）', attributes: ['牌号：HPB300', '直径：Φ6~Φ12', '外形：热轧光圆', '计量方式：过磅'], synonyms: ['高线HPB300', '高线HPB300 Φ6-Φ12', '高线6-12', '盘圆HPB300'], prices: 26, updatedAt: '2026-10-24', attributeSynonyms: { 直径: ['规格', 'Φ径', '断面直径'], 外形: ['表面形状'], 计量方式: ['计量规则', '计量单位'] } },
  { key: 's14', code: 'STD-GJ-000133', name: '盘螺 HRB400E Φ6~Φ12 热轧带肋', category: '建材 / 钢材 / 盘螺', attributes: ['牌号：HRB400E', '直径：Φ6~Φ12', '外形：热轧带肋（盘卷）', '计量方式：过磅'], synonyms: ['盘螺HRB400E', '盘螺HRB400E Φ6-Φ12', '盘螺6-12'], prices: 21, updatedAt: '2026-10-24', attributeSynonyms: { 牌号: ['钢种'], 直径: ['规格', 'Φ径'], 计量方式: ['计量规则', '计量单位'] } },
  { key: 's15', code: 'STD-GJ-000134', name: '螺纹钢 HRB400E / HRB500E Φ12~Φ40 理计', category: '建材 / 钢材 / 钢筋', attributes: ['牌号：HRB400E/HRB500E', '直径：Φ12~Φ40', '外形：热轧带肋', '计量方式：理计'], synonyms: ['螺纹钢HRB400E', '螺纹钢HRB500E', '高强螺纹钢', '螺纹钢HRB400E、HRB500E、圆钢、高强螺纹钢'], prices: 34, updatedAt: '2026-10-24', attributeSynonyms: { 牌号: ['钢种', '牌号等级'], 直径: ['规格', 'Φ径', '断面直径'], 外形: ['表面形状'], 计量方式: ['计量规则'] } }
];

export const initialPrices: PriceRecord[] = [
  { key: 'p1', materialCode: 'STD-GJ-000129', materialName: 'HRB400E 热轧带肋抗震钢筋 Φ25mm', unitPrice: 3860, unit: '吨', source: '合同', sourceNo: 'HT-2026-08312', brand: '安钢', bureau: '中建八局', region: '河南省郑州市', signDate: '2026-09-28', confidence: 97 },
  { key: 'p2', materialCode: 'STD-GJ-000129', materialName: 'HRB400E 热轧带肋抗震钢筋 Φ25mm', unitPrice: 3928, unit: '吨', source: '招标清单', sourceNo: 'ZB-2026-12098', brand: '河钢', bureau: '中建三局', region: '湖北省武汉市', signDate: '2026-09-16', confidence: 92 },
  { key: 'p3', materialCode: 'STD-SN-000042', materialName: 'P.O 42.5 普通硅酸盐水泥', unitPrice: 468, unit: '吨', source: '合同', sourceNo: 'HT-2026-07931', brand: '海螺', bureau: '中建五局', region: '湖南省长沙市', signDate: '2026-08-22', confidence: 95 },
  { key: 'p4', materialCode: 'STD-DQ-000307', materialName: 'E27 螺旋节能灯 22W 暖光', unitPrice: 118, unit: '个', source: '招标清单', sourceNo: 'ZB-2026-10881', brand: '欧普', bureau: '中建八局', region: '山东省济南市', signDate: '2026-07-09', confidence: 61, abnormal: true },
  { key: 'p5', materialCode: 'STD-GJ-000128', materialName: 'HRB400E 热轧带肋抗震钢筋 Φ20mm', unitPrice: 3812, unit: '吨', source: '合同', sourceNo: 'HT-2026-08177', brand: '沙钢', bureau: '中建三局', region: '江苏省南京市', signDate: '2026-09-05', confidence: 96 },
  { key: 'p6', materialCode: 'STD-GJ-000128', materialName: 'HRB400E 热轧带肋抗震钢筋 Φ20mm', unitPrice: 3756, unit: '吨', source: '招标清单', sourceNo: 'ZB-2026-11742', brand: '永钢', bureau: '中建八局', region: '河南省郑州市', signDate: '2026-08-18', confidence: 93 },
  { key: 'p7', materialCode: 'STD-GJ-000130', materialName: 'HRB400E 热轧带肋抗震钢筋 Φ12mm', unitPrice: 3985, unit: '吨', source: '招标清单', sourceNo: 'ZB-2026-11801', brand: '安钢', bureau: '中建五局', region: '湖南省长沙市', signDate: '2026-08-09', confidence: 94 },
  { key: 'p8', materialCode: 'STD-GJ-000131', materialName: 'HPB300 热轧光圆钢筋 Φ8mm', unitPrice: 4020, unit: '吨', source: '合同', sourceNo: 'HT-2026-07655', brand: '华鑫', bureau: '中建三局', region: '湖北省武汉市', signDate: '2026-07-26', confidence: 90 },
  { key: 'p9', materialCode: 'STD-SN-000043', materialName: 'P.C 32.5 复合硅酸盐水泥', unitPrice: 386, unit: '吨', source: '合同', sourceNo: 'HT-2026-07088', brand: '冀东', bureau: '中建八局', region: '河北省石家庄市', signDate: '2026-06-30', confidence: 91 },
  { key: 'p10', materialCode: 'STD-GC-000215', materialName: 'Q235B 焊接钢管 DN100', unitPrice: 4680, unit: '吨', source: '招标清单', sourceNo: 'ZB-2026-10930', brand: '友发', bureau: '中建五局', region: '天津市', signDate: '2026-07-15', confidence: 88 },
  { key: 'p11', materialCode: 'STD-GC-000216', materialName: 'Q235B 热镀锌钢管 DN50', unitPrice: 5260, unit: '吨', source: '合同', sourceNo: 'HT-2026-07421', brand: '华岐', bureau: '中建八局', region: '山东省济南市', signDate: '2026-07-02', confidence: 89 },
  { key: 'p12', materialCode: 'STD-DL-000088', materialName: 'YJV 交联聚乙烯电缆 4×25+1×16', unitPrice: 96.5, unit: '米', source: '合同', sourceNo: 'HT-2026-06890', brand: '远东', bureau: '中建三局', region: '江苏省无锡市', signDate: '2026-06-12', confidence: 92 },
  { key: 'p13', materialCode: 'STD-QK-000051', materialName: '蒸压加气混凝土砌块 600×200×200', unitPrice: 268, unit: '立方米', source: '招标清单', sourceNo: 'ZB-2026-10655', brand: '恒基', bureau: '中建五局', region: '安徽省合肥市', signDate: '2026-05-28', confidence: 87 },
  { key: 'p14', materialCode: 'STD-SL-000019', materialName: '机制砂 中砂 细度模数2.3~3.0', unitPrice: 128, unit: '吨', source: '合同', sourceNo: 'HT-2026-06412', brand: '本地砂场', bureau: '中建八局', region: '河南省郑州市', signDate: '2026-05-11', confidence: 84 },
  /* 报价表新增三条标准物料的历史成交价：与 analysisData.refPriceSeed 同一水位，两边不会互相打脸 */
  { key: 'p15', materialCode: 'STD-GJ-000132', materialName: '高线 HPB300 Φ6~Φ12 热轧光圆', unitPrice: 3968, unit: '吨', source: '合同', sourceNo: 'HT-2026-08256', brand: '中天钢铁', bureau: '中建三局', region: '四川省成都市', signDate: '2026-09-18', confidence: 94 },
  { key: 'p16', materialCode: 'STD-GJ-000132', materialName: '高线 HPB300 Φ6~Φ12 热轧光圆', unitPrice: 3942, unit: '吨', source: '招标清单', sourceNo: 'ZB-2026-11960', brand: '安钢', bureau: '中建八局', region: '河南省郑州市', signDate: '2026-08-26', confidence: 90 },
  { key: 'p17', materialCode: 'STD-GJ-000133', materialName: '盘螺 HRB400E Φ6~Φ12 热轧带肋', unitPrice: 3955, unit: '吨', source: '合同', sourceNo: 'HT-2026-08190', brand: '沙钢', bureau: '中建三局', region: '四川省成都市', signDate: '2026-09-12', confidence: 93 },
  { key: 'p18', materialCode: 'STD-GJ-000133', materialName: '盘螺 HRB400E Φ6~Φ12 热轧带肋', unitPrice: 3918, unit: '吨', source: '招标清单', sourceNo: 'ZB-2026-11875', brand: '永钢', bureau: '中建五局', region: '湖南省长沙市', signDate: '2026-09-02', confidence: 89 },
  { key: 'p19', materialCode: 'STD-GJ-000134', materialName: '螺纹钢 HRB400E / HRB500E Φ12~Φ40 理计', unitPrice: 3872, unit: '吨', source: '合同', sourceNo: 'HT-2026-08401', brand: '河钢', bureau: '中建八局', region: '四川省成都市', signDate: '2026-09-25', confidence: 96 },
  { key: 'p20', materialCode: 'STD-GJ-000134', materialName: '螺纹钢 HRB400E / HRB500E Φ12~Φ40 理计', unitPrice: 3836, unit: '吨', source: '招标清单', sourceNo: 'ZB-2026-12140', brand: '济源钢铁', bureau: '中建三局', region: '湖北省武汉市', signDate: '2026-08-30', confidence: 92 }
];

export const initialTasks: GovernanceTask[] = [
  { key: 't1', name: '钢筋品类近五年数据治理', category: '钢筋', bureau: '中建八局', assignee: '张工', deadline: '2026-11-15', total: 500, completed: 128, status: '进行中' },
  { key: 't2', name: '水泥价格数据入库复核', category: '水泥', bureau: '中建五局', assignee: '李敏', deadline: '2026-10-28', total: 240, completed: 196, status: '进行中' },
  { key: 't3', name: '管材标准物料首批建库', category: '管材', bureau: '中建三局', assignee: '王磊', deadline: '2026-10-20', total: 360, completed: 242, status: '已逾期' },
  { key: 't4', name: '灯具规格原子化治理', category: '灯具', bureau: '中建八局', assignee: '周颖', deadline: '2026-10-18', total: 180, completed: 180, status: '已完成' }
];

/**
 * 智能询价的演示清单已迁到 `inquiry.ts`（带报价，才能演示贵/便宜判定）。
 */

/**
 * 内置演示的「已提交待审核」记录。
 * 治理工作台的确认动作不再直接写标准库，而是生成这类提交单，由入库审核页决定是否入库。
 * 这里预置三条：两条待审核（一条新增建档、一条修改已有物料）、一条已驳回
 * ——「新增 vs 修改」两种提交方式一进审核页就能看到对比。
 *
 * 注意：`changes` 是提交时按目标标准物料算出来的 diff，种子这里留空数组，
 * 由 `storage.createInitialState` 调 `diffStandardChanges` 现算，避免手写 diff 与算法跑偏。
 */
export const initialSubmissions: MaterialSubmission[] = [
  {
    key: 'sub-seed-1',
    taskKey: null,
    taskName: '内置演示 · 钢筋品类',
    materialKey: 'm2',
    sourceName: '三级抗震螺纹钢 20',
    name: '钢筋 HRB400E Φ20mm 热轧带肋 抗震',
    category: '钢筋',
    unit: '吨',
    bureau: '中建三局',
    changeType: 'new',
    atoms: [
      { label: '品类', value: '钢筋', synonyms: ['材料类别'] },
      { label: '牌号', value: 'HRB400E', synonyms: ['钢种'] },
      { label: '直径', value: 'Φ20mm', synonyms: ['规格'] },
      { label: '外形', value: '热轧带肋', synonyms: [] },
      { label: '特性', value: '抗震', synonyms: ['性能'] }
    ],
    synonyms: ['HRB400E Φ20 抗震钢筋', '抗震螺纹钢20', '三级抗震螺纹钢 20'],
    changes: [],
    submitter: '张工',
    submittedAt: '2026-10-25 10:12',
    attempt: 1,
    status: '待审核'
  },
  {
    key: 'sub-seed-2',
    taskKey: null,
    taskName: '内置演示 · 灯具品类',
    materialKey: 'm3',
    sourceName: '螺旋节能灯 22W E27 暖光',
    name: '节能灯 22W E27 暖光',
    category: '灯具',
    unit: '个',
    bureau: '中建五局',
    changeType: 'new',
    atoms: [
      { label: '品类', value: '节能灯', synonyms: ['灯具类别'] },
      { label: '功率', value: '22W', synonyms: ['瓦数', '额定功率'] },
      { label: '灯头口径', value: 'E27', synonyms: ['灯头型号', '螺口规格'] },
      { label: '色温', value: '暖光', synonyms: ['光色', '灯光颜色'] }
    ],
    synonyms: ['22W螺旋灯 E27 暖白', '节能灯泡22瓦'],
    changes: [],
    submitter: '周颖',
    submittedAt: '2026-10-24 17:40',
    attempt: 1,
    status: '已驳回',
    comment: '色温只写「暖光」无法入库：标准库按 2700K / 3000K 建档，请补成 3000K 并在历史叫法里保留「暖光」。',
    reviewer: '审核专家 · 王敏',
    reviewedAt: '2026-10-24 18:05'
  },
  {
    // 同一个钢筋 Φ25 在标准库里已有 STD-GJ-000129：专家组装时发现是同一件主材，
    // 于是关联该标准按「修改」提交 —— 补一条执行标准、修一处外形写法、加两组历史叫法。
    key: 'sub-seed-3',
    taskKey: null,
    taskName: '内置演示 · 钢筋品类',
    materialKey: 'm1',
    sourceName: 'HRB400E Φ25mm 热轧带肋抗震钢筋',
    name: '钢筋 HRB400E Φ25mm 热轧带肋 月牙纹 抗震 GB/T 1499.2-2018',
    category: '钢筋',
    unit: '吨',
    bureau: '中建八局',
    changeType: 'update',
    targetStandardKey: 's2',
    targetStandardCode: 'STD-GJ-000129',
    targetStandardName: 'HRB400E 热轧带肋抗震钢筋 Φ25mm',
    atoms: [
      { label: '品类', value: '钢筋', synonyms: ['材料类别', '物料类别'] },
      { label: '牌号', value: 'HRB400E', synonyms: ['钢种', '牌号等级', '钢材牌号'] },
      { label: '直径', value: 'Φ25mm', synonyms: ['规格', 'Φ径', '断面直径'] },
      { label: '外形', value: '热轧带肋（月牙纹）', synonyms: ['表面形状', '外形特征'] },
      { label: '特性', value: '抗震', synonyms: ['性能', '特殊要求'] },
      { label: '执行标准', value: 'GB/T 1499.2-2018', synonyms: [] }
    ],
    synonyms: ['三级抗震钢25', '抗震螺纹25', 'HRB400E抗震钢25', 'HRB400E Φ25mm 热轧带肋抗震钢筋'],
    changes: [],
    submitter: '张工',
    submittedAt: '2026-10-25 11:36',
    attempt: 1,
    status: '待审核'
  }
];