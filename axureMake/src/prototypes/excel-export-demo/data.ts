/**
 * Excel 导出预览演示 - 数据与规则定义
 *
 * 参考资料：
 * - /rules/design-guide.md
 * - /src/prototypes/excel-export-demo/spec.md
 */

export type NumFmt =
  | 'inherit'
  | 'general'
  | 'thousand'
  | 'currency'
  | 'percent'
  | 'decimal0'
  | 'decimal1'
  | 'decimal2'
  | 'decimal3';

export type CellAlign = 'left' | 'center' | 'right';

export interface ExcelColumn {
  /** 列 key */
  key: string;
  /** Excel 表头文案 */
  label: string;
  /** 系统字段名（用于字段说明表） */
  field: string;
  /** 列宽 px */
  width: number;
  /** 默认对齐 */
  align: CellAlign;
  /** 数据类型 */
  type: 'index' | 'text' | 'number' | 'currency' | 'percent' | 'date' | 'enum' | 'phone';
  /** 默认数字格式 */
  numFmt?: NumFmt;
  /** 格式化规则说明（用于字段说明表） */
  rule?: string;
}

export type CellValue = string | number | null;

/**
 * Excel 列定义（A~N，共 14 列）
 * 与 spec.md 2.2 字段表保持一致
 */
export const COLUMNS: ExcelColumn[] = [
  { key: 'seq', label: '序号', field: 'seq', width: 56, align: 'center', type: 'index', rule: '整型，居中' },
  {
    key: 'projectName',
    label: '采购项目名称',
    field: 'projectName',
    width: 200,
    align: 'left',
    type: 'text',
    rule: '左对齐，超 30 字截断',
  },
  {
    key: 'projectCode',
    label: '采购编号',
    field: 'projectCode',
    width: 150,
    align: 'left',
    type: 'text',
    rule: '强制文本格式，防科学计数',
  },
  { key: 'orgName', label: '采购单位', field: 'orgName', width: 150, align: 'left', type: 'text', rule: '左对齐' },
  {
    key: 'purchaseMethod',
    label: '采购方式',
    field: 'purchaseMethod',
    width: 100,
    align: 'center',
    type: 'enum',
    rule: '枚举中文，居中',
  },
  {
    key: 'budgetAmount',
    label: '预算金额(元)',
    field: 'budgetAmount',
    width: 140,
    align: 'right',
    type: 'currency',
    numFmt: 'currency',
    rule: '#,##0.00，右对齐，≥500 万红字加粗',
  },
  {
    key: 'bidAmount',
    label: '中标金额(元)',
    field: 'bidAmount',
    width: 140,
    align: 'right',
    type: 'currency',
    numFmt: 'currency',
    rule: '#,##0.00，右对齐',
  },
  {
    key: 'savingRate',
    label: '节资率',
    field: 'savingRate',
    width: 90,
    align: 'right',
    type: 'percent',
    numFmt: 'percent',
    rule: '0.00%，公式 =(预算-中标)/预算，负数红色',
  },
  {
    key: 'bidOpenDate',
    label: '开标日期',
    field: 'bidOpenDate',
    width: 110,
    align: 'center',
    type: 'date',
    rule: 'yyyy-MM-dd，居中，空值显示 -',
  },
  {
    key: 'supplierName',
    label: '中标供应商',
    field: 'supplierName',
    width: 170,
    align: 'left',
    type: 'text',
    rule: '左对齐',
  },
  { key: 'owner', label: '项目负责人', field: 'owner', width: 100, align: 'center', type: 'text', rule: '居中' },
  {
    key: 'ownerPhone',
    label: '联系电话',
    field: 'ownerPhone',
    width: 120,
    align: 'center',
    type: 'phone',
    rule: '中间 4 位脱敏为 ****',
  },
  {
    key: 'riskLevel',
    label: '风险等级',
    field: 'riskLevel',
    width: 90,
    align: 'center',
    type: 'enum',
    rule: '条件格式：高红 / 中黄 / 低绿',
  },
  {
    key: 'remark',
    label: '备注',
    field: 'remark',
    width: 180,
    align: 'left',
    type: 'text',
    rule: '超 200 字截断，末尾加（已截断）',
  },
];

/** 列字母 A~Z（本表 14 列足够） */
export const colLetter = (i: number): string => String.fromCharCode(65 + i);

/**
 * 18 条采购项目数据（节资率由公式计算，此处不落库）
 * 数据顺序：序号 / 项目名称 / 编号 / 单位 / 方式 / 预算 / 中标 / 节资率 / 开标日期 / 供应商 / 负责人 / 电话 / 风险 / 备注
 */
export const ROWS: CellValue[][] = [
  [1, '中建八局总部办公用品框架采购', 'ZJJT-2026-0001', '中建八局第一建设有限公司', '公开招标', 4860000, 4512300, null, '2026-03-12', '得力集团有限公司', '张海涛', '13800138001', '低', '年度框架协议，覆盖总部 23 个部门'],
  [2, '华东区域建筑钢筋集中采购', 'ZJJT-2026-0002', '中建三局华东分公司', '公开招标', 128600000, 121900000, null, '2026-03-18', '江苏沙钢集团', '李成', '13912345678', '中', '需提供第三方检测报告及质保书'],
  [3, '西南片区商品混凝土供应', 'ZJJT-2026-0003', '中建二局西南分公司', '邀请招标', 76400000, 79850000, null, '2026-03-21', '成都建工混凝土有限公司', '王磊', '13708765432', '高', '中标价高于预算基准价，需说明原因并补充审批'],
  [4, '集团总部云计算资源框架采购', 'ZJJT-2026-0004', '中建数字科技有限公司', '询比价', 32000000, 29600000, null, '2026-03-25', '阿里云计算有限公司', '陈静', '13611112222', '中', '含 3 年运维，单价随用量阶梯下浮'],
  [5, '北方区域脚手架租赁集采', 'ZJJT-2026-0005', '中建一局北方分公司', '竞争性谈判', 15200000, 15180000, null, '2026-03-28', '北京城建租赁有限公司', '赵鹏', '13500668899', '低', '租赁周期 18 个月，含进出场运输'],
  [6, '智慧工地终端设备采购', 'ZJJT-2026-0006', '中建八局第二建设有限公司', '公开招标', 8900000, 8420000, null, '2026-04-02', '杭州海康威视数字技术股份有限公司', '刘敏', '13755556666', '低', '设备需接入集团智慧工地平台'],
  [7, '中建大厦电梯维保服务', 'ZJJT-2026-0007', '中建集团物业管理有限公司', '单一来源', 2300000, 2530000, null, '2026-04-06', '通力电梯有限公司', '孙浩', '13866778899', '高', '单一来源采购未附价格合理性说明，待补充'],
  [8, '华中区域塔吊租赁集采', 'ZJJT-2026-0008', '中建三局华中分公司', '公开招标', 41700000, 39900000, null, '2026-04-11', '中联重科租赁有限公司', '周文', '13911110000', '中', '投标人数量 3 家，满足开标条件'],
  [9, '集团办公家具框架采购', 'ZJJT-2026-0009', '中建集团总部后勤服务中心', '邀请招标', 6800000, 6150000, null, '2026-04-15', '震旦家具（中国）有限公司', '吴迪', '13022223333', '低', '含安装与 5 年质保'],
  [
    10,
    '施工现场安全防护用品采购',
    'ZJJT-2026-0010',
    '中建二局第一建设工程有限责任公司',
    '询比价',
    3600000,
    3480000,
    null,
    '2026-04-18',
    '3M 中国有限公司',
    '郑好',
    '13144445555',
    '低',
    '该项目为集团年度框架协议采购，覆盖 12 家二级单位与 36 个在建项目，供应商需提供全国范围内 48 小时到货服务，合同期 24 个月，含三次免费上门巡检与更换服务；同时需承诺产品有效期不少于 24 个月，到货时提供批次检验报告、合格证及质保书，任一省份出现断供将按合同总金额 10% 计罚。（已截断）',
  ],
  [11, '集团数据中心机房改造', 'ZJJT-2026-0011', '中建数字科技有限公司', '公开招标', 22500000, 23880000, null, '2026-04-22', '华为技术有限公司', '冯磊', '13266667777', '高', '变更工程量超 6%，触发风控预警'],
  [12, '华南区域幕墙工程分包', 'ZJJT-2026-0012', '中建三局华南分公司', '公开招标', 168000000, 156800000, null, '2026-04-26', '江河创建集团股份有限公司', '何静', '13388889999', '中', '分包金额超 1.5 亿，需集团总部审批'],
  [13, '集团车辆租赁服务', 'ZJJT-2026-0013', '中建集团总部后勤服务中心', '竞争性磋商', 4200000, 4050000, null, '2026-04-29', '一嗨租车服务有限公司', '罗宇', '13499990000', '低', '含驾驶员服务与保险费'],
  [14, '通用软件正版化授权', 'ZJJT-2026-0014', '中建数字科技有限公司', '单一来源', 5600000, 5880000, null, '2026-05-06', '微软（中国）有限公司', '高翔', '13512340987', '中', '单价按集团年采购量谈判，较市场价下浮 8%'],
  [15, '东北区域保温材料采购', 'ZJJT-2026-0015', '中建一局东北分公司', '邀请招标', 9300000, 8760000, null, '2026-05-09', '亚士创能科技（上海）股份有限公司', '邓超', '13633334444', '低', '冬期施工，需保证 72 小时内供货'],
  [16, '集团档案数字化服务', 'ZJJT-2026-0016', '中建集团总部档案管理中心', '询比价', 1850000, 1720000, null, '2026-05-13', '汉王科技股份有限公司', '秦芳', '13777778888', '低', '含扫描、编目与数据入库'],
  [17, '新能源充电设施建设', 'ZJJT-2026-0017', '中建八局第一建设有限公司', '公开招标', 12400000, 11950000, null, '2026-05-16', '特来电新能源股份有限公司', '沈磊', '13855556666', '中', '含 60 个车位充电桩及平台接入'],
  [18, '中建集团 2026 年度办公耗材框架采购', 'ZJJT-2026-0018', '中建集团总部后勤服务中心', '框架协议', 7150000, 6980000, null, '2026-05-20', '齐心集团股份有限公司', '叶青', '13900001111', '低', '按季度结算，支持线上商城下单'],
];

/** 导出筛选条件（演示用） */
export const EXPORT_FILTERS = [
  { label: '所属组织', value: '中建集团总部 / 全部二级单位' },
  { label: '采购方式', value: '全部' },
  { label: '开标日期', value: '2026-03-01 ~ 2026-05-31' },
  { label: '风险等级', value: '全部' },
  { label: '关键词', value: '（未输入）' },
];

export const EXPORT_FILE_NAME = '采购项目信息表_20261014153847.xlsx';

/** 字段说明 Sheet：列 ↔ 字段 ↔ 规则 */
export interface FieldSpec {
  col: string;
  label: string;
  field: string;
  type: string;
  rule: string;
  sample: string;
}

export const FIELD_SPECS: FieldSpec[] = [
  { col: 'A', label: '序号', field: 'seq', type: '整型', rule: '居中，从 1 递增', sample: '1' },
  { col: 'B', label: '采购项目名称', field: 'projectName', type: '文本', rule: '左对齐，超 30 字截断', sample: '中建八局总部办公用品框架采购' },
  { col: 'C', label: '采购编号', field: 'projectCode', type: '文本', rule: '强制文本格式，避免科学计数', sample: 'ZJJT-2026-0001' },
  { col: 'D', label: '采购单位', field: 'orgName', type: '文本', rule: '左对齐', sample: '中建八局第一建设有限公司' },
  { col: 'E', label: '采购方式', field: 'purchaseMethod', type: '枚举', rule: '转中文枚举，居中', sample: '公开招标' },
  { col: 'F', label: '预算金额(元)', field: 'budgetAmount', type: '金额', rule: '#,##0.00；≥500 万红字加粗', sample: '4,860,000.00' },
  { col: 'G', label: '中标金额(元)', field: 'bidAmount', type: '金额', rule: '#,##0.00，右对齐', sample: '4,512,300.00' },
  { col: 'H', label: '节资率', field: 'savingRate', type: '百分比', rule: '0.00%，按 (预算-中标)/预算 重算，负数红色', sample: '7.15%' },
  { col: 'I', label: '开标日期', field: 'bidOpenDate', type: '日期', rule: 'yyyy-MM-dd，空值 -', sample: '2026-03-12' },
  { col: 'J', label: '中标供应商', field: 'supplierName', type: '文本', rule: '使用供应商全称，与主数据一致', sample: '得力集团有限公司' },
  { col: 'K', label: '项目负责人', field: 'owner', type: '文本', rule: '居中，取业务主责人', sample: '张海涛' },
  { col: 'L', label: '联系电话', field: 'ownerPhone', type: '文本', rule: '中间 4 位脱敏', sample: '138****8001' },
  { col: 'M', label: '风险等级', field: 'riskLevel', type: '枚举', rule: '条件格式三色底：高 / 中 / 低', sample: '低' },
  { col: 'N', label: '备注', field: 'remark', type: '长文本', rule: '超 200 字截断 + （已截断）', sample: '年度框架协议，覆盖总部 23 个部门' },
  { col: '—', label: '合计行', field: '—（公式）', type: '公式', rule: '=SUM(F2:F19)、=SUM(G2:G19)，节资率按总额重算', sample: '合计 / 618,300,000.00' },
];

export interface RuleGroup {
  title: string;
  icon: string;
  items: string[];
}

/** 导出规则 Sheet 内容 */
export const EXPORT_RULES: RuleGroup[] = [
  {
    title: '入口与权限',
    icon: 'key',
    items: [
      '入口：采购项目列表页右上角「导出 Excel」，导出对象 = 当前筛选条件下的全部数据（不分页）',
      '权限：采购管理员、运营管理员可导出；普通用户仅可导出本组织数据',
      '导出行为写入操作日志：导出人、时间、条数、筛选条件、文件名校验码',
    ],
  },
  {
    title: '文件与表头',
    icon: 'file',
    items: [
      '文件名规则：采购项目信息表_{yyyyMMddHHmmss}.xlsx，格式为 .xlsx（Excel 2007+，WPS 可直接打开）',
      '首行表头：加粗 + 浅灰底 + 冻结首行 + 自动筛选按钮 + 全表细边框',
      '列宽：按内容自适应，最小 8 字符、最大 40 字符；超长文本列固定 40 字符并截断',
    ],
  },
  {
    title: '数值与日期',
    icon: 'hash',
    items: [
      '金额统一为元（不折算万元），格式 #,##0.00，表头标注单位',
      '节资率百分比保留 2 位小数；负数（中标价超预算）显示红色',
      '日期统一 yyyy-MM-dd（不导出时分秒）；空值统一显示 "-"',
      '编号类字段强制文本格式，避免被 Excel 识别为大数字或日期而变形',
    ],
  },
  {
    title: '脱敏与安全',
    icon: 'shield',
    items: [
      '手机号中间 4 位脱敏：138****8001；邮箱仅保留姓名首字母 + 域名',
      '身份证、银行账号等敏感字段默认不导出，如需导出须走审批',
      '导出文件不加水印，但超过 1 万条的导出记录需保留 90 天可追溯',
    ],
  },
  {
    title: '合计与统计',
    icon: 'sigma',
    items: [
      '末行追加「合计」行：预算金额、中标金额使用 =SUM() 公式，便于业务在 Excel 内继续核算',
      '合计行加粗 + 上框线，不参与筛选与排序（Excel 中通过表格结构保证）',
      '节资率合计行按总额重算，不使用各行的算术平均',
    ],
  },
  {
    title: '边界与异常',
    icon: 'alert',
    items: [
      '单次导出上限 50,000 条；超出提示「当前 N 条超出单次上限，将按每批 20,000 条拆分为压缩包」',
      '导出结果为空时提示「当前筛选条件下无数据」，不生成空文件',
      '超过 3 秒的导出展示进度条，支持取消；取消后不产生文件与日志',
      '导出失败给出行级原因定位入口（如字段值超长、编码异常）',
    ],
  },
];

/** 评审要点 Sheet：需求走查清单 */
export interface ReviewItem {
  id: string;
  question: string;
  status: '已确认' | '待确认';
  owner: string;
  note: string;
}

export const REVIEW_ITEMS: ReviewItem[] = [
  { id: '1', question: '导出范围是当前筛选全部数据，还是仅当前页？', status: '已确认', owner: '产品 / 业务', note: '按当前筛选条件的全部数据导出，不分页' },
  { id: '2', question: '是否导出全部 14 个字段，还是提供字段勾选？', status: '已确认', owner: '产品', note: '一期导出全部字段；二期支持按导出模板裁剪字段' },
  { id: '3', question: '是否需要「合计」行？', status: '已确认', owner: '业务', note: '需要，金额列用 SUM 公式，便于二次核算' },
  { id: '4', question: '脱敏范围是否与后台列表展示一致？', status: '待确认', owner: '安全 / 合规', note: '待确认：导出（离线文件）是否允许比列表页展示更少脱敏' },
  { id: '5', question: '大额导出是否需要审批流？', status: '待确认', owner: '安全 / 合规', note: '待确认：单次超 3 万条是否触发导出审批' },
  { id: '6', question: '超限分批的阈值与批次大小', status: '已确认', owner: '研发', note: '上限 5 万条，每批 2 万条，打包 zip 下载' },
  { id: '7', question: '导出耗时与进度反馈方式', status: '已确认', owner: '研发', note: '同步导出 ≤3 秒；>3 秒转异步任务，站内信 + 下载中心通知' },
  { id: '8', question: '是否需要导出模板配置（列顺序、别名）？', status: '待确认', owner: '产品', note: '待确认：是否纳入二期，与「报表模板」能力合并' },
];

/** 演示脚本（评审现场口播顺序） */
export interface DemoStep {
  step: string;
  title: string;
  action: string;
  focus: string;
}

export const DEMO_SCRIPT: DemoStep[] = [
  { step: '01', title: '讲背景', action: '打开业务列表页，指出筛选条件', focus: '导出对象 = 当前筛选的全部数据，不是当前页' },
  { step: '02', title: '点导出', action: '点击「导出 Excel」，播放三段导出进度', focus: '交互反馈、进度提示、超限分批提示' },
  { step: '03', title: '看结果', action: '切到本页 Excel 预览，逐列讲格式', focus: '金额千分位、日期格式、脱敏、条件格式、长文本截断' },
  { step: '04', title: '点交互', action: '点表头筛选、改数字格式、双击备注单元格', focus: '导出的文件是可继续加工的"活表格"，不是图片' },
  { step: '05', title: '对规则', action: '打开「导出需求说明」抽屉 / 切到「导出规则」Sheet', focus: '边界与异常：空数据、超限、失败原因定位' },
  { step: '06', title: '过待确认', action: '切到「评审要点」Sheet', focus: '逐条过待确认项，现场定 owner 与时间点' },
];
