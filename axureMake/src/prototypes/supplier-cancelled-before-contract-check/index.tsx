/**
 * @name 分供商在合同签订前已注销
 * @description 风控预警中心-合同规则：校验分供商在合同签订前是否已注销。
 *              整页复用组件 src/components/risk-rule-config-page，本页只提供规则名称、规则说明、配置项与 1 个规则专有列。
 * @reference 规则截图：分供商在合同签订前已注销
 */
import React from 'react';
import { Switch } from 'antd';
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
    title: requiredTitle('是否校验'),
    key: 'enableCheck',
    width: 130,
    render: () => <Switch defaultChecked checkedChildren="开" unCheckedChildren="关" />
  }
];

// 在默认规则树的「合同」分组中追加本规则
const treeData = DEFAULT_RULE_TREE.map(group =>
  group.key === 'contract'
    ? {
        ...group,
        children: [
          ...group.children,
          { title: '分供商在合同签订前已注销', key: 'supplier_cancelled_before_contract_check', type: '股', status: '启', isGuest: true, iconType: 'red' as const }
        ]
      }
    : group
);

const Component = function SupplierCancelledBeforeContractCheckPage() {
  return (
    <RiskRuleConfigPage
      ruleName="分供商在合同签订前已注销"
      ruleDescription="校验分供商在合同签订前是否已注销，已注销将会预警/拦截"
      defaultRuleEnabled
      config={config}
      extraColumns={extraColumns}
      treeData={treeData}
      defaultSelectedRuleKey="supplier_cancelled_before_contract_check"
      tableScrollX={1450}
    />
  );
};

export default Component;
