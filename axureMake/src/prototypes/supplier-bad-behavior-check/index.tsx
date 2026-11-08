/**
 * @name 分供商是否存在不良行为
 * @description 风控预警中心-规则管理：校验分供商在采购业务中是否存在不良行为记录。
 *              整页复用组件 src/components/risk-rule-config-page，本页只提供规则名称、配置项与 3 个规则专有列。
 * @reference 参照页面：禁用名录校验
 */
import React, { useState } from 'react';
import { Button, Select, Switch, TreeSelect } from 'antd';
import { MinusSquareOutlined, PlusSquareOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import RiskRuleConfigPage, { DEFAULT_RULE_TREE } from '@/components/risk-rule-config-page';
import './style.css';

// 组织选择树
const ORG_TREE_DATA = [
  {
    title: '中国建筑股份有限公司',
    value: '中国建筑股份有限公司',
    children: [
      { title: '中国建筑第四工程局有限公司', value: '中国建筑第四工程局有限公司' },
      { title: '中国建筑第二工程局有限公司', value: '中国建筑第二工程局有限公司' },
      { title: '中国建筑第三工程局有限公司', value: '中国建筑第三工程局有限公司' }
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
  { label: '本级', value: '本级' },
  { label: '本下级', value: '本下级' }
];

const CHECK_STAGE_OPTIONS = [
  { label: '报名-资审', value: '报名-资审' },
  { label: '资格审查', value: '资格审查' },
  { label: '定标/成交报告', value: '定标/成交报告' }
];

// 规则配置项默认值：与参照页面保持一致
const config = {
  orgScope: 'subordinate',
  subOrgConfig: 'allow',
  warningLevel: 'medium_high',
  detectScenes: ['warning'],
  dedupe: 'no',
  ruleType: '合规风险'
};

// 必填列标题：统一在标题前加红色星号
const requiredTitle = (text: string) => (
  <span><span style={{ color: '#ff4d4f' }}>*</span>{text}</span>
);

// 不良行为组织范围项：一列内可设置多组，组织为单选
interface OrgScopeRow {
  id: string;
  org?: string;
  scope?: string;
}

// 「不良行为组织范围」单元格：支持设置多组「组织 + 范围」，可添加
const OrgScopeCell = () => {
  const [rows, setRows] = useState<OrgScopeRow[]>([
    { id: '1', org: '中国建筑股份有限公司', scope: '本下级' }
  ]);

  const handleAddRow = () => {
    setRows((prev: OrgScopeRow[]) => [...prev, { id: Date.now().toString() }]);
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
            style={{ width: 100, flexShrink: 0 }}
          />
        </div>
      ))}
      <div>
        <Button size="small" onClick={handleAddRow}>
          添加
        </Button>
      </div>
    </div>
  );
};

// 规则特有的扩展列，追加在公共列之后（组件会在末尾自动追加「操作」列）
const extraColumns: ColumnsType<any> = [
  {
    title: requiredTitle('是否开启校验'),
    key: 'enabled',
    width: 140,
    render: () => <Switch checkedChildren="开" unCheckedChildren="关" defaultChecked />
  },
  {
    title: '不限制品类',
    key: 'ignoreCategory',
    width: 140,
    render: () => <Switch checkedChildren="开" unCheckedChildren="关" />
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
    title: requiredTitle('不良行为组织范围'),
    key: 'orgScope',
    width: 300,
    render: () => <OrgScopeCell />
  }
];

// 在默认规则树的「分供商」分组中追加本规则
const treeData = DEFAULT_RULE_TREE.map(group =>
  group.key === 'supplier'
    ? {
        ...group,
        children: [
          ...group.children,
          {
            title: '分供商是否存在不良行为',
            key: 'supplier_bad_behavior_check',
            type: '股',
            status: '启',
            isGuest: true,
            iconType: 'orange' as const
          }
        ]
      }
    : group
);

const Component = function SupplierBadBehaviorCheckPage() {
  return (
    <RiskRuleConfigPage
      ruleName="分供商是否存在不良行为"
      ruleDescription="校验分供商在报名-资审、资格审查及定标/成交报告环节是否存在不良行为记录"
      defaultRuleEnabled
      config={config}
      extraColumns={extraColumns}
      treeData={treeData}
      defaultSelectedRuleKey="supplier_bad_behavior_check"
      tableScrollX={2170}
    />
  );
};

export default Component;
