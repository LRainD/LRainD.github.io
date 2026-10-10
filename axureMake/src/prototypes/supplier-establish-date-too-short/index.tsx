/**
 * @name 分供商成立日期过短
 * @description 风控预警中心-分供商规则：校验分供商的成立日期是否过短，支持个性化设置校验阶段与阈值天数。
 *              整页复用组件 src/components/risk-rule-config-page，本页只提供规则名称、规则说明、配置项与 2 个规则专有列。
 * @reference 规则截图：分供商成立日期过短
 */
import React from 'react';
import { InputNumber, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import RiskRuleConfigPage, { DEFAULT_RULE_TREE } from '@/components/risk-rule-config-page';
import './style.css';

const CHECK_STAGE_OPTIONS = [
  { label: '报名截止', value: '报名截止' },
  { label: '报价截止', value: '报价截止' },
  { label: '编制成交/定标报告', value: '编制成交/定标报告' }
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
    title: requiredTitle('校验阶段'),
    key: 'checkStage',
    width: 260,
    render: () => (
      <Select
        mode="multiple"
        placeholder="请选择校验阶段"
        style={{ width: '100%' }}
        defaultValue={['报名截止']}
        options={CHECK_STAGE_OPTIONS}
      />
    )
  },
  {
    title: requiredTitle('阈值天数'),
    key: 'thresholdDays',
    width: 180,
    render: () => (
      <InputNumber
        min={0}
        precision={0}
        step={1}
        suffix="天"
        placeholder="请输入阈值天数"
        style={{ width: '100%' }}
      />
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
          { title: '分供商成立日期过短', key: 'supplier_establish_date_check', type: '股', status: '启', isGuest: true, iconType: 'red' as const }
        ]
      }
    : group
);

const Component = function SupplierEstablishDateTooShortPage() {
  return (
    <RiskRuleConfigPage
      ruleName="分供商成立日期过短"
      ruleDescription="校验分供商的成立日期，成立时间过短（低于阈值天数）将会预警/拦截 数据来源：启信宝"
      defaultRuleEnabled
      config={config}
      extraColumns={extraColumns}
      treeData={treeData}
      defaultSelectedRuleKey="supplier_establish_date_check"
      tableScrollX={1750}
    />
  );
};

export default Component;
