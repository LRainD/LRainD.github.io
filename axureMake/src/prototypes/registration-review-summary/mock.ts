// --- 静态数据 ---

export interface RiskItem {
  id: string;
  type: 'intercept' | 'warning';
  tagText: string;
  content: string;
  detailLinkText?: string;
  onDetailClick?: () => void;
  rulesText?: string;
  rulesLinkText?: string;
  evidenceText?: string;
  evidenceLinkText?: string;
}

export interface SupplierTag {
  text: string;
  type: 'change' | 'square' | 'risk';
  withInfo?: boolean;
  risks?: RiskItem[];
}

export interface SupplierRow {
  id: number;
  name: string;
  tags: SupplierTag[];
  category: string;
  qualLevel: string;
  legalPerson: string;
  legalPhone: string;
  legalPhoneExtra?: string;
  authPerson: string;
  capital: string;
  companyType: string;
  address: string;
}

export interface RiskSupplierReasoning {
  supplierName: string;
  reasoning: string;
}

export interface RiskDataItem {
  id: number;
  displayIndex: number;
  name: string;
  scene: string;
  status: string;
  info: string;
  detailLinkText?: string;
  onDetailClick?: () => void;
  suggestion: string;
  mode: string;
  description: string;
  attachments: string[];
  selected: boolean;
  ruleName: string;
  reasoning: string;
  suppliers?: RiskSupplierReasoning[];
}

export const SUPPLIERS: SupplierRow[] = [
  {
    id: 1,
    name: '钟犁sup200',
    tags: [
      { text: '变更历史', type: 'change', withInfo: true },
      { text: '圈', type: 'square' },
      { text: '本', type: 'square' },
      {
        text: '风险提醒',
        type: 'risk',
        risks: [
          {
            id: 'r1',
            type: 'intercept',
            tagText: '【拦截】',
            content: '结合招标信息及企业资质信息，系统检测到供应商缺少施工劳务资质、施工劳务不分等级(备案)资质、施工劳务不分等级（备案）资质，',
            rulesLinkText: '查看企业资质承接范围校验规则',
            evidenceText: '（校验依据：分供店铺-企业资质及第三方（建设库）',
            evidenceLinkText: '查看企业资质'
          },
          {
            id: 'r1-2',
            type: 'warning',
            tagText: '【预警】',
            content: '该分供商疑似与负面清单中的分供商存在”换马甲“嫌疑',
            detailLinkText: '查看详情'
          }
        ]
      }
    ],
    category: '[顶] 一级、5-3、5-3-1',
    qualLevel: '安全施工许可证',
    legalPerson: 'wyc',
    legalPhone: '19999999999',
    legalPhoneExtra: '变更历史',
    authPerson: '周庆勇(sup200)',
    capital: '3000万',
    companyType: '其他有限责任公司',
    address: '四川省成都市青羊区光华东三路486号3栋1单元9层913号'
  },
  {
    id: 2,
    name: '上海恒基建筑劳务有限公司',
    tags: [
      { text: '变更历史', type: 'change', withInfo: true },
      { text: '圈', type: 'square' },
      {
        text: '风险提醒',
        type: 'risk',
        risks: [
          {
            id: 'r2',
            type: 'intercept',
            tagText: '【拦截】',
            content: '结合招标信息及企业资质信息，系统检测到供应商缺少施工劳务资质，',
            rulesLinkText: '查看企业资质承接范围校验规则',
            evidenceText: '（校验依据：分供店铺-企业资质及第三方（建设库）',
            evidenceLinkText: '查看企业资质'
          },
          {
            id: 'r2-2',
            type: 'warning',
            tagText: '【预警】',
            content: '棱镜分供商识别：该分供商被{列入组织}因{管控类别}、{列入组织}因{管控类别}列入名单'
          }
        ]
      }
    ],
    category: '[顶] 一级、5-3、5-3-1',
    qualLevel: '--',
    legalPerson: 'sup205公司法人姓名',
    legalPhone: '17377267643',
    authPerson: 'sup205(sup205)',
    capital: '300万',
    companyType: '有限责任(自然人独资)',
    address: '海南省海口市龙华区西镇东村(苍峰路分加糖后面2排8号)'
  },
  {
    id: 3,
    name: 'sup199',
    tags: [
      {
        text: '风险提醒',
        type: 'risk',
        risks: [
          {
            id: 'r3',
            type: 'intercept',
            tagText: '【拦截】',
            content: '结合招标信息及企业资质信息，系统检测到供应商缺少施工劳务资质，',
            rulesLinkText: '查看企业资质承接范围校验规则',
            evidenceText: '（校验依据：分供店铺-企业资质及第三方（建设库）',
            evidenceLinkText: '查看企业资质'
          }
        ]
      }
    ],
    category: 'A级分类★、C级分类_瓜同样',
    qualLevel: '--',
    legalPerson: 'sup199',
    legalPhone: '19991010242',
    authPerson: '--',
    capital: '199万',
    companyType: '民营企业',
    address: '--'
  }
];

export const ATTACH_SUPPORT_FORMAT =
  '.jpeg .jpg .gif .png .doc .docx .xls .xlsx .txt .pdf .rar .zip .7z .tar .jar .dwg .dws .dwt .dxf .csv';

export const RISK_DATA: RiskDataItem[] = [
  {
    id: 0,
    displayIndex: 1,
    name: '负面清单分供商换马甲',
    scene: '风控预警',
    status: '待处置',
    info: '经大模型与关联关系排查，检测到报名供应商“钟犁sup200”疑似与负面清单中的分供商存在“换马甲”嫌疑。',
    detailLinkText: '查看详情',
    suggestion: '建议查看关系图谱及重叠详情，核实企业高级管理人员、股东关系及历史重叠信息。',
    mode: '及时处置',
    description: '',
    attachments: [],
    selected: true,
    ruleName: '负面清单分供商“换马甲”识别规则 v1.0',
    reasoning: '系统自动比对分供商股权穿透图、高管履历及负面清单库，发现该供应商与历史黑名单企业存在高比例高管重叠与同地址注册特征。',
    suppliers: [
      {
        supplierName: '钟犁sup200 (与 4 家负面清单分供商存在关联)',
        reasoning: '【股权穿透关联】企业法人/董监高与负面清单企业“上海恒基建筑劳务有限公司”相同成员股权占比之和超过50%。\n【年报邮箱关联】检测到联系人邮箱与黑名单企业“北京金泰商贸有限公司”完全重叠。\n【报名电话关联】检测到报名填写的联系电话与黑名单企业“成都科锐科技有限公司”完全重叠。\n【董监高任职关联】检测到高级管理人员（监事李四）在“广东正和建筑工程有限公司”中同时担任董事职务。'
      }
    ]
  },
  {
    id: 8,
    displayIndex: 2,
    name: '棱镜分供商识别',
    scene: '风控预警',
    status: '待处置',
    info: '本次选中的分供商中存在 1 家分供商为棱镜识别分供商：1、上海恒基建筑劳务有限公司 被中建一局第一建筑有限公司因工程质量事故 / 违约退场列入名单',
    suggestion: '建议对分供商进行核实',
    mode: '及时处置',
    description: '',
    attachments: [],
    selected: false,
    ruleName: '棱镜分供商识别规则 v1.0',
    reasoning: ''
  },
  {
    id: 1,
    displayIndex: 3,
    name: '报名附件是否满足公告要求',
    scene: '风控预警',
    status: '待处置',
    info: '经大模型深度解析，发现有3家供应商上传的报名附件不满足招标公告中的硬性资质与业绩要求。',
    suggestion: '建议进入审查依据查看各供应商的具体缺失项，并要求其限期重新上传或予以淘汰。',
    mode: '及时处置',
    description: '',
    attachments: [],
    selected: false,
    ruleName: '报名附件合规性大模型深度审查规则 v1.0',
    reasoning: '系统调用大模型对所有已报名供应商上传的PDF附件进行OCR及语义解析，并与招标公告中的“第三章 供应商资质要求”进行逐项比对，发现部分供应商存在严重缺失。',
    suppliers: [
      {
        supplierName: 'sup101 (中建某某建设有限公司)',
        reasoning: '【营业执照】有效。\n【资质证书】公告要求“建筑工程施工总承包一级”，实际上传资质为“建筑工程施工总承包二级”，资质等级不达标。\n【安全生产许可证】有效。\n【财务审计报告】缺失 2024 年度的审计报告，仅提供了 2023 年度报告。'
      },
      {
        supplierName: 'sup105 (北京某某装饰工程有限公司)',
        reasoning: '【营业执照】有效。\n【资质证书】未上传“建筑装修装饰工程专业承包一级”证书，仅上传了营业执照。\n【业绩证明】公告要求“近三年具有单项合同额 500 万以上的同类项目业绩不少于 2 个”，实际上传的业绩合同额分别为 320 万和 410 万，均未达到 500 万门槛。'
      },
      {
        supplierName: 'sup203 (上海某某实业发展有限公司)',
        reasoning: '【营业执照】有效。\n【安全生产许可证】已于 2026 年 6 月 30 日到期，当前处于失效状态，不满足“在有效期内”的硬性要求。\n【信誉要求】经大模型检索信用中国，该企业无严重失信记录。'
      }
    ]
  },
  {
    id: 2,
    displayIndex: 4,
    name: '法人失信被执行人',
    scene: '风控预警',
    status: '待处置',
    info: '经系统检测，以下供应商法人存在失信被执行记录：sup101 (李华)，请核实风险。',
    suggestion: '建议根据组织管理要求进行处理，必要时要求供应商提供合规证明。',
    mode: '及时处置',
    description: '',
    attachments: [],
    selected: false,
    ruleName: '法人信用准入限制规则 v2.1',
    reasoning: '【数据检索】系统自动检索到供应商 sup101 的法人代表为“李华”。\n【外部校验】调用最高人民法院失信被执行人名单接口，匹配到身份证号与姓名一致的失信记录，立案时间为 2025-11-12，执行标的为 1,200,000 元。\n【风险评估】法人代表存在失信记录，可能导致企业合同履约风险、资金链断裂风险，属于高风险事件。\n【规则判定】触发“法人失信一票否决/限制准入”规则，处置状态设为“待处置”，处置模式为“及时处置”。'
  },
  {
    id: 3,
    displayIndex: 5,
    name: '工商状态变更预警',
    scene: '风控预警',
    status: '待处置',
    info: '发现供应商 sup105 工商状态变更为“经营异常”，可能影响履约能力。',
    suggestion: '核实异常原因，评估对当前采购项目的风险影响。',
    mode: '事后处置',
    description: '',
    attachments: [],
    selected: false,
    ruleName: '工商存续状态实时监控规则 v1.0',
    reasoning: '【数据检索】监控到供应商 sup105 的工商登记状态发生变更。\n【变更识别】状态由“存续”变更为“经营异常”，异常原因为“未按规定期限公示年度报告”。\n【风险评估】经营异常可能意味着企业内部管理混乱或经营出现困难，会间接影响采购履约。\n【规则判定】触发“工商状态异常预警”规则，处置状态设为“待处置”，处置模式为“事后处置”。'
  },
  {
    id: 4,
    displayIndex: 6,
    name: '信息重叠',
    scene: '风控预警',
    status: '待处置',
    info: '当前供应商存在多项信息重叠，是否继续当前操作？涉及信息重叠的供应商如下：sup203, 彭才林, 钟莉, sup201, sup300, sup247, sup330, sup332',
    suggestion: '建议根据组织管理要求进行处理',
    mode: '事后处置',
    description: '',
    attachments: [],
    selected: false,
    ruleName: '关联关系与信息重叠审计规则 v3.2',
    reasoning: '【关系挖掘】分析当前投标供应商的工商背景、历史投标记录、联系电话、邮箱及IP地址。\n【重叠识别】发现 sup203, 彭才林, 钟莉, sup201, sup300, sup247, sup330, sup332 之间存在电话号码重叠、IP地址重叠或高管交叉任职。\n【风险评估】存在围标、串标或关联交易的潜在风险，严重违反招投标公平公正原则。\n【规则判定】触发“多方信息重叠预警”规则，处置状态设为“待处置”，处置模式为“事后处置”。'
  },
  {
    id: 5,
    displayIndex: 7,
    name: '严重失信违法企业',
    scene: '风控预警',
    status: '待处置',
    info: '有1个供应商存在严重违法或失信被执行人，如下：sup330;',
    suggestion: '建议根据组织管理要求进行处理',
    mode: '事后处置',
    description: '',
    attachments: [],
    selected: false,
    ruleName: '企业严重违法失信名单筛查规则 v2.0',
    reasoning: '【数据检索】检索供应商 sup330 的企业信用信息公示系统记录。\n【违法识别】该企业被列入“严重违法失信企业名单（黑名单）”。\n【风险评估】严重违法失信企业在法律、行政、金融等多方面受到联合惩戒，履约能力极低，合作风险极大。\n【规则判定】触发“严重失信违法企业禁入”规则，处置状态设为“待处置”，处置模式为“事后处置”。'
  },
  {
    id: 6,
    displayIndex: 8,
    name: '企业经营状态异常',
    scene: '风控预警',
    status: '待处置',
    info: '有2个供应商企业经营状态异常，如下：sup247, sup330;',
    suggestion: '建议根据组织管理要求进行处理',
    mode: '事后处置',
    description: '',
    attachments: [],
    selected: false,
    ruleName: '企业经营异常名录筛查规则 v1.5',
    reasoning: '【数据检索】检索供应商 sup247 和 sup330 的最新工商数据。\n【异常识别】两家企业均被列入工商部门的经营异常名录。\n【风险评估】经营异常可能导致企业无法正常开具发票、账户被冻结等，影响项目进度。\n【规则判定】触发“企业经营状态异常预警”规则，处置状态设为“待处置”，处置模式为“事后处置”。'
  },
  {
    id: 7,
    displayIndex: 9,
    name: '招标企业资质校验',
    scene: '风控预警',
    status: '待处置',
    info: '您勾选的供应商有2个不满足企业资质承接范围校验，如下：彭才林, sup300; 查看企业资质承接范围校验规则',
    suggestion: '建议根据组织管理要求进行处理',
    mode: '及时处置',
    description: '',
    attachments: [],
    selected: false,
    ruleName: '招标资质与承接范围匹配规则 v4.0',
    reasoning: '【资质比对】读取本次招标项目要求的资质等级（如：建筑工程施工总承包一级）。\n【供应商校验】校验供应商 彭才林 和 sup300 的资质证书。\n【不匹配识别】发现其资质等级为二级，或承接范围不包含本项目所属专业。\n【风险评估】资质不符属于合规性硬伤，可能导致项目无法通过政府审批或面临安全质量风险。\n【规则判定】触发“资质不满足承接范围”规则，处置状态设为“待处置”，处置模式为“及时处置”。'
  }
];
