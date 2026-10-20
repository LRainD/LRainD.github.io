// 负面企业清单模拟数据

// 模拟当前登录用户
export const currentUser = {
  name: 'jctest1',
};

// 录入来源选项
export const sourceOptions = [
  { label: '外部数据同步', value: '外部数据同步' },
  { label: '人工录入', value: '人工录入' },
];

// 组织机构选项
export const organizationOptions = [
  { label: '中建五洲工程装备有限公司', value: '中建五洲工程装备有限公司' },
  { label: '南京华建检测技术有限公司', value: '南京华建检测技术有限公司' },
  { label: '中建安装集团有限公司华北分公司', value: '中建安装集团有限公司华北分公司' },
  { label: '中建安装集团有限公司国际工程分公司', value: '中建安装集团有限公司国际工程分公司' },
  { label: '中建安装集团有限公司南方分公司', value: '中建安装集团有限公司南方分公司' },
  { label: '中建安装集团有限公司上海分公司', value: '中建安装集团有限公司上海分公司' },
  { label: '中建安装集团有限公司西安分公司', value: '中建安装集团有限公司西安分公司' },
];

// 管控情形与管控类别的对应关系
export const controlCategoryMap: Record<string, string> = {
  第2种管控情形: '云筑网总部禁用分供商',
  第3种管控情形: '评价不合格分供商',
  第4种管控情形: '合作不良',
  第5种管控情形: '涉诉涉裁风险分供商',
  第6种管控情形: '过程履约评价不良分供商',
  第7种管控情形: '报名关联行为分供商',
  第8种管控情形: '结算失信分供商',
  第9种管控情形: '人力专项排查分供商',
  第10种管控情形: '纪巡审认定违规分供商',
};

// 管控情形选项
export const controlSituationOptions = [
  ...Array.from({ length: 9 }, (_, index) => {
    const value = `第${index + 2}种管控情形`;
    return { label: value, value };
  }),
  { label: '其他管控情形', value: '其他管控情形' },
];

// 模拟企业信息库（新增时按企业名称或统一社会信用代码查询企业）
export const enterpriseRegistry = [
  { enterpriseName: '中建云筑建材贸易有限公司', creditCode: '91110108MA01W2XY3K' },
  { enterpriseName: '江苏宏图建设集团有限公司', creditCode: '91320100704917283X' },
  { enterpriseName: '河北诚信劳务分包有限公司', creditCode: '91130105782011564M' },
  { enterpriseName: '山东金鼎工程机械租赁有限公司', creditCode: '91370100MA3D5K9L2P' },
  { enterpriseName: '北京华信电力设备有限公司', creditCode: '91110105MA01Y7QR8T' },
  { enterpriseName: '深圳市恒泰消防工程有限公司', creditCode: '91440300MA5EK3M4X7' },
  { enterpriseName: '中建八局第一建设有限公司', creditCode: '91370100MA3B8H2K5D' },
  { enterpriseName: '青岛海纳电气工程有限公司', creditCode: '91370200MA3P7Q6R9W' },
];

// 导入模板列定义（用于模板下载预览）
export const TEMPLATE_COLUMNS = [
  { key: 'serialNumber', title: '序号', required: false, width: 70 },
  { key: 'organization', title: '列入组织', required: true, width: 180 },
  { key: 'controlSituation', title: '管控情形', required: true, width: 150 },
  { key: 'controlCategory', title: '管控类别', required: false, width: 200 },
  { key: 'enterpriseName', title: '企业名称', required: true, width: 190 },
  { key: 'creditCode', title: '统一社会信用代码（非必填）', required: false, width: 210 },
  { key: 'reason', title: '列入原因', required: true, width: 210 },
  { key: 'involvedPerson', title: '涉及人员', required: false, width: 120 },
  { key: 'contact', title: '涉及人员联系方式', required: false, width: 160 },
  { key: 'effectiveTime', title: '生效时间', required: true, width: 110 },
  { key: 'endTime', title: '结束时间', required: true, width: 110 },
  { key: 'remark', title: '备注', required: false, width: 160 },
];

// 导入模板示例数据
export const TEMPLATE_SAMPLE_ROWS = [
  {
    serialNumber: 1,
    enterpriseName: '中建云筑建材贸易有限公司',
    creditCode: '91110108MA01W2XY3K',
    organization: '中建五洲工程装备有限公司',
    controlSituation: '第2种管控情形',
    controlCategory: '云筑网总部禁用分供商',
    effectiveTime: '2026-03-12',
    endTime: '2027-03-11',
    reason: '被列为失信被执行人，未履行生效法律文书确定的义务',
    involvedPerson: '张伟',
    contact: '138****2106',
    remark: '已完成信用修复',
  },
  {
    serialNumber: 2,
    enterpriseName: '江苏宏图建设集团有限公司',
    creditCode: '91320100704917283X',
    organization: '南京华建检测技术有限公司',
    controlSituation: '第3种管控情形',
    controlCategory: '评价不合格分供商',
    effectiveTime: '2026-02-08',
    endTime: '长期',
    reason: '存在重大税收违法失信行为',
    involvedPerson: '李明',
    contact: '139****5278',
    remark: '',
  },
  {
    serialNumber: 3,
    enterpriseName: '河北诚信劳务分包有限公司',
    creditCode: '91130105782011564M',
    organization: '中建安装集团有限公司华北分公司',
    controlSituation: '第4种管控情形',
    controlCategory: '合作不良',
    effectiveTime: '2026-05-19',
    endTime: '2026-11-18',
    reason: '近一年内 3 次中标后无故放弃中标资格',
    involvedPerson: '王强',
    contact: '136****8093',
    remark: '',
  },
];

// 导入模板类型：中建安装 / 通用
export const TEMPLATE_TYPE_OPTIONS = [
  { label: '中建安装', value: 'cscecInstall' },
  { label: '通用', value: 'general' },
];

// 中建安装特有的模板字段列
export const CSCEC_INSTALL_ONLY_TEMPLATE_KEYS = [
  'controlSituation',
  'controlCategory',
  'involvedPerson',
  'contact',
];

// 通用模板列定义：不包含中建安装特有字段
export const GENERAL_TEMPLATE_COLUMNS = TEMPLATE_COLUMNS.filter(
  (column) => !CSCEC_INSTALL_ONLY_TEMPLATE_KEYS.includes(column.key)
);

// 各类型模板的下载文件名称
export const TEMPLATE_FILE_NAMES: Record<string, string> = {
  cscecInstall: '负面企业清单导入模板（中建安装）.xlsx',
  general: '负面企业清单导入模板（通用）.xlsx',
};

// 初始负面企业清单数据
export const initialData = [
  {
    id: '1',
    enterpriseName: '中建云筑建材贸易有限公司',
    creditCode: '91110108MA01W2XY3K',
    source: '外部数据同步',
    organization: '中建五洲工程装备有限公司',
    controlSituation: '第2种管控情形',
    controlCategory: '云筑网总部禁用分供商',
    includeDate: '2026-03-12',
    effectiveTime: '2026-03-12',
    endTime: '2027-03-11',
    isLongTerm: false,
    attachments: ['失信信息公示.pdf'],
    reason: '企业被列为失信被执行人，未履行生效法律文书确定的义务',
    involvedPerson: '张伟',
    contact: '138****2106',
    remark: '已完成信用修复',
    creator: '系统同步',
    updater: 'jctest1',
    createTime: '2026-03-12 08:30:00',
    updateTime: '2026-05-27 13:01:08',
  },
  {
    id: '2',
    enterpriseName: '江苏宏图建设集团有限公司',
    creditCode: '91320100704917283X',
    source: '外部数据同步',
    organization: '南京华建检测技术有限公司',
    controlSituation: '第3种管控情形',
    controlCategory: '评价不合格分供商',
    includeDate: '2026-02-08',
    effectiveTime: '2026-02-08',
    endTime: '',
    isLongTerm: true,
    attachments: ['税务风险说明.docx'],
    reason: '存在重大税收违法失信行为，被税务部门列入黑名单',
    involvedPerson: '李明',
    contact: '139****5278',
    remark: '长期有效，需人工复核后移出',
    creator: '系统同步',
    updater: 'jctest1',
    createTime: '2026-02-08 10:12:00',
    updateTime: '2026-05-26 17:59:22',
  },
  {
    id: '3',
    enterpriseName: '河北诚信劳务分包有限公司',
    creditCode: '91130105782011564M',
    source: '人工录入',
    organization: '中建安装集团有限公司华北分公司',
    controlSituation: '第4种管控情形',
    controlCategory: '合作不良',
    includeDate: '2026-05-19',
    effectiveTime: '2026-05-19',
    endTime: '2026-11-18',
    isLongTerm: false,
    attachments: [],
    reason: '近一年内发生 3 次中标后无故放弃中标资格',
    involvedPerson: '王强',
    contact: '136****8093',
    remark: '',
    creator: 'jctest1',
    updater: 'jctest1',
    createTime: '2026-05-19 15:40:00',
    updateTime: '2026-05-19 15:40:00',
  },
  {
    id: '4',
    enterpriseName: '山东金鼎工程机械租赁有限公司',
    creditCode: '91370100MA3D5K9L2P',
    source: '人工录入',
    organization: '中建安装集团有限公司国际工程分公司',
    controlSituation: '第5种管控情形',
    controlCategory: '涉诉涉裁风险分供商',
    includeDate: '2026-01-15',
    effectiveTime: '2026-01-15',
    endTime: '2027-01-14',
    isLongTerm: false,
    attachments: ['行政处罚决定书.pdf'],
    reason: '因安全生产责任事故被主管部门行政处罚',
    remark: '处罚决定书编号：鲁建安监〔2026〕012 号',
    creator: '王管理(wangguanli)',
    updater: 'jctest1',
    createTime: '2026-01-15 09:20:00',
    updateTime: '2026-04-02 11:08:35',
  },
  {
    id: '5',
    enterpriseName: '北京华信电力设备有限公司',
    creditCode: '91110105MA01Y7QR8T',
    source: '外部数据同步',
    organization: '中建安装集团有限公司南方分公司',
    controlSituation: '第6种管控情形',
    controlCategory: '过程履约评价不良分供商',
    includeDate: '2025-11-06',
    effectiveTime: '2025-11-06',
    endTime: '',
    isLongTerm: true,
    attachments: ['案件核查记录.pdf'],
    reason: '存在向评标专家行贿的犯罪记录',
    remark: '企业已完成整改并通过复核',
    creator: '系统同步',
    updater: 'admin',
    createTime: '2025-11-06 14:05:00',
    updateTime: '2026-05-20 09:15:00',
  },
  {
    id: '6',
    enterpriseName: '深圳市恒泰消防工程有限公司',
    creditCode: '91440300MA5EK3M4X7',
    source: '外部数据同步',
    organization: '中建安装集团有限公司上海分公司',
    controlSituation: '第7种管控情形',
    controlCategory: '报名关联行为分供商',
    includeDate: '2025-12-24',
    effectiveTime: '2025-12-24',
    endTime: '2026-12-23',
    isLongTerm: false,
    attachments: [],
    reason: '被市场监管部门列入严重违法失信企业名单',
    remark: '',
    creator: '系统同步',
    updater: 'admin',
    createTime: '2025-12-24 16:45:00',
    updateTime: '2026-03-18 10:22:41',
  },
];
