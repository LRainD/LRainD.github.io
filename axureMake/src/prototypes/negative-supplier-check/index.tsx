/**
 * @name 负面分供商清单校验
 * @description 风控预警中心-分供商规则：校验分供商是否命中负面分供商清单。
 *              整页复用组件 src/components/risk-rule-config-page，本页只提供规则名称、规则说明、配置项与 3 个规则专有列。
 * @reference 规则截图：负面分供商清单校验
 */
import React, { useState } from 'react';
import { Button, Select, Switch, TreeSelect } from 'antd';
import { DeleteOutlined, MinusSquareOutlined, PlusSquareOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import RiskRuleConfigPage, { DEFAULT_RULE_TREE } from '@/components/risk-rule-config-page';
import './style.css';

const CHECK_STAGE_OPTIONS = [
  { label: '资格审查', value: '资格审查' },
  { label: '定标/成交报告', value: '定标/成交报告' }
];

const ORG_TREE_DATA = [
  {
    title: '中建安装',
    value: '中建安装',
    children: [
      { title: '中建安装一公司', value: '中建安装一公司' },
      { title: '中建安装二公司', value: '中建安装二公司' }
    ]
  },
  {
    title: '中建一局',
    value: '中建一局',
    children: [
      { title: '中建一局一公司', value: '中建一局一公司' },
      { title: '中建一局二公司', value: '中建一局二公司' },
      { title: '中建一局三公司', value: '中建一局三公司' }
    ]
  },
  {
    title: '测试组织-股份公司',
    value: '测试组织-股份公司'
  }
];

// 展开/收起使用 + - 方形图标
const orgSwitcherIcon = ({ expanded }: { expanded?: boolean }) =>
  expanded ? <MinusSquareOutlined /> : <PlusSquareOutlined />;

const SCOPE_OPTIONS = [
  { label: '本上级', value: '本上级' },
  { label: '本级', value: '本级' },
  { label: '本下级', value: '本下级' },
  { label: '本上级+本下级', value: '本上级+本下级' }
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

// 组织、范围组合项：一列内可设置多组，组织为单选
interface OrgScopeRow {
  id: string;
  org?: string;
  scope?: string;
}

// 「是否校验组织、范围」单元格：支持设置多组「组织 + 范围」，可添加 / 删除
const OrgScopeCell = () => {
  const [rows, setRows] = useState<OrgScopeRow[]>([
    { id: '1', org: '中建安装', scope: '本下级' }
  ]);

  const handleAddRow = () => {
    setRows((prev: OrgScopeRow[]) => [...prev, { id: Date.now().toString() }]);
  };

  const handleRemoveRow = (id: string) => {
    setRows((prev: OrgScopeRow[]) => prev.filter((row: OrgScopeRow) => row.id !== id));
  };

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row: OrgScopeRow) => (
        <div key={row.id} className="flex items-center gap-1">
          <TreeSelect
            treeData={ORG_TREE_DATA}
            treeDefaultExpandAll
            switcherIcon={orgSwitcherIcon}
            placeholder="请选择组织"
            defaultValue={row.org}
            style={{ flex: 1, minWidth: 0 }}
            popupMatchSelectWidth={false}
            styles={{ popup: { root: { minWidth: 260, maxHeight: 400, overflow: 'auto' } } }}
          />
          <Select
            placeholder="请选择范围"
            defaultValue={row.scope}
            options={SCOPE_OPTIONS}
            style={{ flex: 1, minWidth: 0 }}
          />
          <Button
            type="text"
            size="small"
            style={{ padding: 0, color: '#ff4d4f' }}
            icon={<DeleteOutlined />}
            onClick={() => handleRemoveRow(row.id)}
          />
        </div>
      ))}
      <Button size="small" onClick={handleAddRow}>
        添加
      </Button>
    </div>
  );
};

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
        defaultValue={['资格审查']}
        options={CHECK_STAGE_OPTIONS}
      />
    )
  },
  {
    title: requiredTitle('是否校验组织、范围'),
    key: 'checkOrgScope',
    width: 400,
    // 一列内可设置多组「组织 + 范围」，竖向排列，支持添加 / 删除
    render: () => <OrgScopeCell />
  }
];

// 在默认规则树的「招投标」分组中追加本规则
const treeData = DEFAULT_RULE_TREE.map(group =>
  group.key === 'bidding'
    ? {
        ...group,
        children: [
          ...group.children,
          { title: '棱镜分供商识别', key: 'supplier_negative_check', type: '股', status: '启', isGuest: true, iconType: 'red' as const }
        ]
      }
    : group
);

const Component = function NegativeSupplierCheckPage() {
  return (
    <RiskRuleConfigPage
      ruleName="棱镜分供商识别"
      ruleDescription="检查分供商是否为棱镜识别分供商"
      defaultRuleEnabled
      config={config}
      extraColumns={extraColumns}
      treeData={treeData}
      defaultSelectedRuleKey="supplier_negative_check"
      tableScrollX={2090}
    />
  );
};

export default Component;
