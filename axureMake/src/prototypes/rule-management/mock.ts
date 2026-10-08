export interface RuleRecord {
  key: string;
  id: number;
  ruleCode: string;
  ruleName: string;
  businessDomain: string;
  businessType: string;
  checkType: 'system' | 'manual';
  organization: string;
  checkStandard?: string;
  checkStage?: string[];
  status: string;
  ruleLevel: string;
  ruleType: string;
  creator: string;
  createTime: string;
  remark: string;
}

export const orgTreeData = [
  {
    title: '中国建筑股份有限公司',
    value: 'cscec',
    key: 'cscec',
    children: [
      {
        title: '中国建筑一局（集团）有限公司',
        value: 'cscec-1',
        key: 'cscec-1',
        children: [
          { title: '一局建设发展公司', value: 'cscec-1-1', key: 'cscec-1-1' },
          { title: '一局华华工程公司', value: 'cscec-1-2', key: 'cscec-1-2' }
        ]
      },
      {
        title: '中国建筑二局有限公司',
        value: 'cscec-2',
        key: 'cscec-2',
        children: [
          { title: '二局华东公司', value: 'cscec-2-1', key: 'cscec-2-1' },
          { title: '二局华南公司', value: 'cscec-2-2', key: 'cscec-2-2' }
        ]
      },
      {
        title: '中国建筑三局集团有限公司',
        value: 'cscec-3',
        key: 'cscec-3',
        children: [
          { title: '三局工程总承包公司', value: 'cscec-3-1', key: 'cscec-3-1' },
          { title: '三局基建公司', value: 'cscec-3-2', key: 'cscec-3-2' }
        ]
      },
      {
        title: '中国建筑四局有限公司',
        value: 'cscec-4',
        key: 'cscec-4',
        children: [
          { title: '四局一公司', value: 'cscec-4-1', key: 'cscec-4-1' },
          { title: '四局建设公司', value: 'cscec-4-2', key: 'cscec-4-2' }
        ]
      },
      {
        title: '中国建筑第八工程局有限公司',
        value: 'cscec-8',
        key: 'cscec-8',
        children: [
          { title: '八局一公司', value: 'cscec-8-1', key: 'cscec-8-1' },
          { title: '八局上海公司', value: 'cscec-8-2', key: 'cscec-8-2' }
        ]
      }
    ]
  }
];

export const checkStageOptions = [
  {
    value: 'zhaobiao',
    label: '招标/采购阶段',
    children: [
      { value: 'yuebiao', label: '约标阶段' },
      { value: 'fabiao', label: '发标阶段' },
      { value: 'kaibiao', label: '开标阶段' },
      { value: 'pingbiao', label: '评标阶段' },
      { value: 'dingbiao', label: '定标阶段' }
    ]
  },
  {
    value: 'hetong',
    label: '合同阶段'
  }
];

export const mockRuleData: RuleRecord[] = [
  {
    key: '1',
    id: 1,
    ruleCode: 'validRegistrationsNumber',
    ruleName: '最少有效报名分供商数量',
    businessDomain: '云筑集采',
    businessType: '招投标',
    checkType: 'system',
    organization: '',
    status: '启用',
    ruleLevel: '股份级',
    ruleType: '合规风险',
    creator: 'admin11',
    createTime: '2026-10-07 13:02:50',
    remark: '-'
  },
  {
    key: '2',
    id: 2,
    ruleCode: 'switchShellVerify',
    ruleName: '换马甲校验',
    businessDomain: '云筑集采',
    businessType: '招投标',
    checkType: 'system',
    organization: '',
    status: '启用',
    ruleLevel: '分公司级',
    ruleType: '合规风险',
    creator: 'admin11',
    createTime: '2026-09-30 11:09:45',
    remark: '部分被列入黑名单或存在不良行为（如围标串标、履约失信）的分供商可能通过股权变更、企业重组、法人替换等方式"换马甲"，以新身份重新参与投标，规避监管风险。在报名与资审汇总、编制发标/成交报告环节检查是否为换马甲分供商'
  },
  {
    key: '3',
    id: 3,
    ruleCode: 'bogusCscecVerify',
    ruleName: '非中建分供商校验',
    businessDomain: '云筑集采',
    businessType: '招投标',
    checkType: 'system',
    organization: '',
    status: '启用',
    ruleLevel: '分公司级',
    ruleType: '合规风险',
    creator: 'admin11',
    createTime: '2026-09-30 09:55:14',
    remark: '报名与资审汇总、编制发标/成交报告环节，检查分供商是否名称中含「中建」字样，但与中建集团无隶属或授权关系。数据来源：用户中心'
  },
  {
    key: '4',
    id: 4,
    ruleCode: 'environmentalPunishmentVerify',
    ruleName: '环保处罚',
    businessDomain: '云筑集采',
    businessType: '招投标',
    checkType: 'system',
    organization: '',
    status: '启用',
    ruleLevel: '分公司级',
    ruleType: '合规风险',
    creator: 'admin11',
    createTime: '2026-09-24 11:40:36',
    remark: '-'
  },
  {
    key: '5',
    id: 5,
    ruleCode: 'manualSiteSafetyInspection',
    ruleName: '现场安全设施人工抽查校验',
    businessDomain: '云筑集采',
    businessType: '招投标',
    checkType: 'manual',
    organization: '中国建筑四局有限公司（包含下级）',
    checkStandard: '检查现场安全防护设施及安全隐患整改记录是否符合要求。',
    status: '启用',
    ruleLevel: '分公司级',
    ruleType: '合规风险',
    creator: 'inspector01',
    createTime: '2026-09-20 14:22:10',
    remark: '需要合规巡检人员到项目现场实地查看安全防护设施、安全隐患整改记录并手动录入核验结果。'
  },
  {
    key: '6',
    id: 6,
    ruleCode: 'adjustPriceNumberLimit',
    ruleName: '调价次数限制',
    businessDomain: '云筑集采',
    businessType: '招投标',
    checkType: 'system',
    organization: '',
    status: '启用',
    ruleLevel: '股份级',
    ruleType: '合规风险',
    creator: 'admin11',
    createTime: '2026-08-31 18:06:27',
    remark: '-'
  },
  {
    key: '7',
    id: 7,
    ruleCode: 'manualQualificationDocumentCheck',
    ruleName: '特殊资质原件人工复核',
    businessDomain: '云筑集采',
    businessType: '招投标',
    checkType: 'manual',
    organization: '中国建筑第八工程局有限公司',
    checkStandard: '核验特种行业许可证及相关原件印鉴是否真实有效。',
    status: '启用',
    ruleLevel: '股份级',
    ruleType: '合规风险',
    creator: 'auditor02',
    createTime: '2026-08-28 10:15:00',
    remark: '对特定高风险项目投标人的特种行业许可证、原件印鉴等由资审小组进行人工现场审查确认。'
  },
  {
    key: '8',
    id: 8,
    ruleCode: 'cgAdjustPriceNumberLimit',
    ruleName: '采购调价次数限制',
    businessDomain: '云筑集采',
    businessType: '招投标',
    checkType: 'system',
    organization: '',
    status: '启用',
    ruleLevel: '股份级',
    ruleType: '合规风险',
    creator: 'admin11',
    createTime: '2026-08-31 18:05:57',
    remark: '-'
  },
  {
    key: '9',
    id: 9,
    ruleCode: 'deregisteringVerification',
    ruleName: '注销企业校验',
    businessDomain: '云筑集采',
    businessType: '招投标',
    checkType: 'system',
    organization: '',
    status: '启用',
    ruleLevel: '股份级',
    ruleType: '合规风险',
    creator: 'admin11',
    createTime: '2026-08-26 17:41:09',
    remark: '此规则主要配置报名/投标时是否需要校验供应商是否为注销企业'
  },
  {
    key: '10',
    id: 10,
    ruleCode: 'bidEvaluationRuleVerify',
    ruleName: '文件是否明确评标办法及评标规则',
    businessDomain: '云筑集采',
    businessType: '招投标',
    checkType: 'system',
    organization: '',
    status: '启用',
    ruleLevel: '分公司级',
    ruleType: '合规风险',
    creator: 'admin11',
    createTime: '2026-08-26 11:02:51',
    remark: '-'
  }
];
