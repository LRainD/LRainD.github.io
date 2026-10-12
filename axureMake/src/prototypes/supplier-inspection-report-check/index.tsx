/**
 * @name 分供商是否存在有效考察报告
 * @description 风控预警中心-招投标规则：校验分供商是否存在有效的考察报告。
 *              整页复用组件 src/components/risk-rule-config-page，本页只提供规则名称、规则说明、配置项与 3 个规则专有列。
 * @reference 规则截图：分供商是否存在有效考察报告
 */
import React, { useState } from 'react';
import { Button, Select, Switch, TreeSelect } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import RiskRuleConfigPage, { DEFAULT_RULE_TREE } from '@/components/risk-rule-config-page';
import './style.css';

const CHECK_STAGE_OPTIONS = [
  { label: '报名资审', value: '报名资审' },
  { label: '定标/成交报告', value: '定标/成交报告' }
];

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

// 组织、范围组合项：一列内可设置多组
interface OrgScopeRow {
  id: string;
  org?: string[];
  scope?: string;
}

// 「是否校验组织、范围」单元格：支持设置多组「组织 + 范围」，可添加 / 删除
const OrgScopeCell = () => {
  const [rows, setRows] = useState<OrgScopeRow[]>([{ id: '1', scope: '本下级' }]);

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
            treeData={ORGANIZATION_TREE}
            treeDefaultExpandAll
            treeCheckable
            showCheckedStrategy={TreeSelect.SHOW_PARENT}
            placeholder="请选择"
            style={{ flex: 1, minWidth: 0 }}
            popupMatchSelectWidth={false}
            styles={{ popup: { root: { minWidth: 320, maxHeight: 400, overflow: 'auto' } } }}
          />
          <Select
            placeholder="请选择"
            style={{ flex: 1, minWidth: 0 }}
            defaultValue={row.scope}
            options={SCOPE_OPTIONS}
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
        defaultValue={['报名资审']}
        options={CHECK_STAGE_OPTIONS}
      />
    )
  },
  {
    title: requiredTitle('是否校验组织、范围'),
    key: 'checkOrgScope',
    width: 360,
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
          { title: '分供商是否存在有效考察报告', key: 'supplier_inspection_report_check', type: '股', status: '启', isGuest: true, iconType: 'red' as const }
        ]
      }
    : group
);

const Component = function SupplierInspectionReportCheckPage() {
  return (
    <RiskRuleConfigPage
      ruleName="分供商是否存在有效考察报告"
      ruleDescription="校验分供商是否存在有效的考察报告，无有效考察报告将会预警/拦截"
      defaultRuleEnabled
      config={config}
      extraColumns={extraColumns}
      treeData={treeData}
      defaultSelectedRuleKey="supplier_inspection_report_check"
      tableScrollX={2050}
    />
  );
};

export default Component;
