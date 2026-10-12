/**
 * @name 成交单位未在本下级库内
 * @description 风控预警中心-分供商规则：校验成交单位是否存在于所选组织范围的库内。
 *              整页复用组件 src/components/risk-rule-config-page，本页只提供规则名称、规则说明、配置项与 2 个规则专有列。
 * @reference 规则截图：成交单位未在本下级库内
 */
import React from 'react';
import { Select, TreeSelect } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import RiskRuleConfigPage, { DEFAULT_RULE_TREE } from '@/components/risk-rule-config-page';
import './style.css';

// 组织选择树
const ORGANIZATION_TREE = [
  {
    title: '中国建筑股份有限公司',
    value: '中国建筑股份有限公司',
    children: [
      {
        title: '中国建筑第四工程局有限公司',
        value: '中国建筑第四工程局有限公司',
        children: [
          { title: '第一建设有限公司', value: '中建四局第一建设有限公司' },
          { title: '第二建设有限公司', value: '中建四局第二建设有限公司' },
          { title: '安装工程有限公司', value: '中建四局安装工程有限公司' },
          { title: '建设发展有限公司', value: '中建四局建设发展有限公司' }
        ]
      },
      {
        title: '中国建筑第二工程局有限公司',
        value: '中国建筑第二工程局有限公司',
        children: [
          { title: '北京分公司', value: '中建二局北京分公司' },
          { title: '华东分公司', value: '中建二局华东分公司' }
        ]
      },
      {
        title: '中国建筑第三工程局有限公司',
        value: '中国建筑第三工程局有限公司',
        children: [
          { title: '总承包公司', value: '中建三局总承包公司' },
          { title: '基础设施公司', value: '中建三局基础设施公司' }
        ]
      }
    ]
  }
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
// 组织、范围合并为一列，样式参考「负面分供商清单校验」页
const extraColumns: ColumnsType<any> = [
  {
    title: requiredTitle('组织、范围'),
    key: 'orgScope',
    width: 320,
    render: () => (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1">
          <span className="text-gray-600 whitespace-nowrap">组织:</span>
          <TreeSelect
            treeData={ORGANIZATION_TREE}
            treeDefaultExpandAll
            treeCheckable
            showCheckedStrategy={TreeSelect.SHOW_PARENT}
            placeholder="请选择组织"
            style={{ flex: 1, minWidth: 0 }}
            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
          />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-600 whitespace-nowrap">范围:</span>
          <Select
            placeholder="请选择范围"
            style={{ flex: 1, minWidth: 0 }}
            defaultValue="本级"
            options={SCOPE_OPTIONS}
          />
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
          { title: '成交单位未在本下级库内', key: 'deal_unit_library_check', type: '股', status: '启', isGuest: true, iconType: 'red' as const }
        ]
      }
    : group
);

const Component = function DealUnitNotInSubLibraryCheckPage() {
  return (
    <RiskRuleConfigPage
      ruleName="成交单位未在本下级库内"
      ruleDescription="校验成交单位是否存在于所选组织范围的库内，未在本下级库内将会预警/拦截"
      defaultRuleEnabled
      config={config}
      extraColumns={extraColumns}
      treeData={treeData}
      defaultSelectedRuleKey="deal_unit_library_check"
      tableScrollX={1650}
    />
  );
};

export default Component;
