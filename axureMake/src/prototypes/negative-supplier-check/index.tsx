/**
 * @name 负面分供商清单校验
 * @description 风控预警中心-分供商规则：校验分供商是否命中负面分供商清单。
 *              整页复用组件 src/components/risk-rule-config-page，本页只提供规则名称、规则说明、配置项与 3 个规则专有列。
 * @reference 规则截图：负面分供商清单校验
 */
import React from 'react';
import { Select, Switch } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import RiskRuleConfigPage, { DEFAULT_RULE_TREE } from '@/components/risk-rule-config-page';
import './style.css';

const CHECK_STAGE_OPTIONS = [
  { label: '报名资审', value: '报名资审' },
  { label: '定标/成交报告', value: '定标/成交报告' }
];

const ORG_OPTIONS = [
  { label: '中建一局', value: '中建一局' },
  { label: '中建一局一公司', value: '中建一局一公司' },
  { label: '测试组织-股份公司', value: '测试组织-股份公司' }
];

const SCOPE_OPTIONS = [
  { label: '本级', value: '本级' },
  { label: '本下级', value: '本下级' }
];

// 规则配置项默认值
const config = {
  orgScope: 'subordinate',
  subOrgConfig: 'disallow',
  warningLevel: 'medium',
  dedupe: 'no',
  ruleType: '合规风险'
};

// 必填列标题：统一在标题前加红色星号
const requiredTitle = (text: string) => (
  <span><span style={{ color: '#ff4d4f' }}>*</span>{text}</span>
);

// 规则特有的扩展列，追加在公共列之后（组件会在末尾自动追加「操作」列）
const extraColumns: ColumnsType<any> = [
  {
    title: requiredTitle('是否开启校验'),
    key: 'enabled',
    width: 130,
    render: () => <Switch checkedChildren="开" unCheckedChildren="关" defaultChecked />
  },
  {
    title: requiredTitle('校验阶段'),
    key: 'checkStage',
    width: 260,
    render: () => (
      <Select
        mode="multiple"
        placeholder="请选择校验阶段"
        style={{ width: '100%' }}
        defaultValue={['报名资审']}
        options={CHECK_STAGE_OPTIONS}
      />
    )
  },
  {
    title: requiredTitle('是否校验组织、范围'),
    key: 'checkOrgScope',
    width: 340,
    render: () => (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1">
          <span className="text-gray-600 whitespace-nowrap">组织:</span>
          <Select style={{ flex: 1, minWidth: 0 }} placeholder="请选择组织" defaultValue="中建一局" options={ORG_OPTIONS} />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-600 whitespace-nowrap">范围:</span>
          <Select style={{ flex: 1, minWidth: 0 }} placeholder="请选择范围" defaultValue="本级" options={SCOPE_OPTIONS} />
        </div>
      </div>
    )
  }
];

// 在默认规则树的「招投标」分组中追加本规则
const treeData = DEFAULT_RULE_TREE.map(group =>
  group.key === 'bidding'
    ? {
        ...group,
        children: [
          ...group.children,
          { title: '负面分供商清单校验', key: 'supplier_negative_check', type: '股', status: '启', isGuest: true, iconType: 'red' as const }
        ]
      }
    : group
);

const Component = function NegativeSupplierCheckPage() {
  return (
    <RiskRuleConfigPage
      ruleName="负面分供商清单校验"
      ruleDescription="检查分供商是否在负面分供商清单"
      defaultRuleEnabled
      config={config}
      extraColumns={extraColumns}
      treeData={treeData}
      defaultSelectedRuleKey="supplier_negative_check"
      tableScrollX={2030}
    />
  );
};

export default Component;
