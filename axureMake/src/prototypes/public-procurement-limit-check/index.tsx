/**
 * @name 达到公开采购限额，未按要求进行公开和公示
 * @description 风控预警中心-采购规则：校验采购项目概算金额达到公开采购限额时，是否按要求进行公开和公示。
 *              整页复用组件 src/components/risk-rule-config-page，本页只提供规则名称、规则说明、配置项与 1 个规则专有列。
 * @reference 规则截图：达到公开采购限额，未按要求进行公开和公示
 */
import React from 'react';
import { InputNumber } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import RiskRuleConfigPage, { DEFAULT_RULE_TREE } from '@/components/risk-rule-config-page';
import './style.css';

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
    title: requiredTitle('概算金额阈值（元）'),
    key: 'budgetAmountThreshold',
    width: 200,
    render: () => (
      <InputNumber
        min={0}
        precision={0}
        step={1}
        placeholder="请输入概算金额阈值"
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
          { title: '达到公开采购限额，未按要求进行公开和公示', key: 'public_procurement_limit_check', type: '股', status: '启', isGuest: true, iconType: 'red' as const }
        ]
      }
    : group
);

const Component = function PublicProcurementLimitCheckPage() {
  return (
    <RiskRuleConfigPage
      ruleName="达到公开采购限额，未按要求进行公开和公示"
      ruleDescription="校验采购项目概算金额是否达到公开采购限额，概算金额大于等于阈值时必须按要求进行公开和公示，未按要求公开公示将会预警/拦截"
      defaultRuleEnabled
      config={config}
      extraColumns={extraColumns}
      treeData={treeData}
      defaultSelectedRuleKey="public_procurement_limit_check"
      tableScrollX={1500}
    />
  );
};

export default Component;
