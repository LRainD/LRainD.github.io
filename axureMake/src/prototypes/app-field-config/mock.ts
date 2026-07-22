export interface ApplicationItem {
  key: string;
  name: string;
  code: string;
  updateTime: string;
  updater: string;
}

export interface BusinessTypeNode {
  title: string;
  value: string;
  key: string;
  children?: BusinessTypeNode[];
}

export interface FieldConfigItem {
  key: string;
  displayName: string;
  fieldName: string;
  fieldType: 'field' | 'form';
  displayType: string;
  isNew?: boolean;
  description?: string;
  applicableTypes?: string[];
  label?: string;
  usedByTemplate?: boolean;
}

export const MOCK_DATA: FieldConfigItem[] = [
  {
    key: '1',
    displayName: '标段数量',
    fieldName: 'listCount',
    fieldType: 'field',
    displayType: 'editableInput',
    label: '数量类',
    usedByTemplate: true,
    applicableTypes: ['tender', 'tender-01', 'tender-01-01', 'tender-02', 'tender-02-01']
  },
  {
    key: '2',
    displayName: '申-供货周期（天数）',
    fieldName: 'applySupplyCycle',
    fieldType: 'field',
    displayType: 'editableInput',
    description: '<p>该字段用于标识供应商从申请到最终供货所需的<strong>总天数</strong>，单位为自然日。</p><ul><li>最小值：1</li><li>建议值：30 ~ 90</li></ul>'
  },
  {
    key: '3',
    displayName: '申-租赁时间（天数）',
    fieldName: 'applyLeaseTime',
    fieldType: 'field',
    displayType: 'editableInput',
    applicableTypes: ['contract', 'contract-01']
  },
  {
    key: '4',
    displayName: '12312',
    fieldName: '12312',
    fieldType: 'field',
    displayType: 'editableInput',
    description: '<p>特殊业务字段，仅在 <u>租赁类</u> 范本中展示。</p>'
  },
  {
    key: '5',
    displayName: '付款条款',
    fieldName: 'paymentTerms',
    fieldType: 'form',
    displayType: 'standardReplaceTag',
    label: '财务类',
    usedByTemplate: true,
    applicableTypes: ['supplier', 'supplier-01', 'supplier-02', 'supplier-03']
  }
];

export const FIELD_TYPE_OPTIONS = [
  { value: 'field', label: '字段' },
  { value: 'form', label: '表单' }
];

export const DISPLAY_TYPE_OPTIONS = [
  { value: 'editableInput', label: '可编辑输入框' },
  { value: 'standardReplaceTag', label: '标准替换标识' }
];

export const APP_MOCK_DATA: ApplicationItem[] = [
  {
    key: '1',
    name: '集采2.0-招标采购',
    code: 'PURCHASE_2_0',
    updateTime: '2026-07-21 10:30:00',
    updater: 'admin'
  },
  {
    key: '2',
    name: '合同中心应用',
    code: 'CONTRACT_CENTER',
    updateTime: '2026-07-20 16:45:00',
    updater: '幂律专属测试'
  },
  {
    key: '3',
    name: '招投标2.0应用',
    code: 'TENDER_APP',
    updateTime: '2026-07-18 09:12:00',
    updater: 'admin'
  },
  {
    key: '4',
    name: '分供商管理',
    code: 'PSUPS',
    updateTime: '2026-07-15 14:22:00',
    updater: 'jczjgftest'
  }
];

export const BUSINESS_TYPE_TREE: BusinessTypeNode[] = [
  {
    title: '招标应用',
    value: 'tender',
    key: 'tender',
    children: [
      {
        title: '公开招标',
        value: 'tender-01',
        key: 'tender-01',
        children: [
          { title: '劳务分包', value: 'tender-01-01', key: 'tender-01-01' },
          { title: '物资', value: 'tender-01-02', key: 'tender-01-02' }
        ]
      },
      {
        title: '邀请招标',
        value: 'tender-02',
        key: 'tender-02',
        children: [
          { title: '劳务分包', value: 'tender-02-01', key: 'tender-02-01' },
          { title: '物资', value: 'tender-02-02', key: 'tender-02-02' }
        ]
      },
      { title: '竞争性谈判', value: 'tender-03', key: 'tender-03' }
    ]
  },
  {
    title: '合同中心应用',
    value: 'contract',
    key: 'contract',
    children: [
      { title: '采购合同', value: 'contract-01', key: 'contract-01' },
      { title: '租赁合同', value: 'contract-02', key: 'contract-02' }
    ]
  },
  {
    title: '分供商管理',
    value: 'supplier',
    key: 'supplier',
    children: [
      { title: '准入评估', value: 'supplier-01', key: 'supplier-01' },
      { title: '绩效考核', value: 'supplier-02', key: 'supplier-02' },
      { title: '黑名单管理', value: 'supplier-03', key: 'supplier-03' }
    ]
  },
  {
    title: '废旧竞价',
    value: 'scrap',
    key: 'scrap'
  }
];
