/**
 * @name 风控规则模板
 * @description 风控预警中心-规则管理页面示例：整个页面复用「风控规则配置页」组件。
 *              新规则页面通常只需修改规则名称、规则说明，以及该规则特有的扩展列。
 */
import React from 'react';
import { Input } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import RiskRuleConfigPage from '@/components/risk-rule-config-page';
import './style.css';

// 规则特有的扩展列：采购品类、采购类型&组织形式、招标方式&采购方式、预警类型、预警方式、通知方式、通知对象
// 这 7 个公共列已内置在组件中，这里只写本规则多出来的列
const extraColumns: ColumnsType<any> = [
  {
    title: <span><span style={{ color: '#ff4d4f' }}>*</span>最短回标/报价天数</span>,
    dataIndex: 'days',
    key: 'days',
    width: 150,
    render: () => (
      <div className="flex items-center gap-1">
        <Input defaultValue="5" style={{ flex: 1 }} />
        <span>天</span>
      </div>
    )
  }
];

// 如需调整公共列（换下拉选项 / 改默认选中值 / 隐藏某列），按列 key 传入 commonColumns，例如：
// const commonColumns = {
//   notifyMethod: { options: [{ label: '提示框', value: '提示框' }], defaultValue: '提示框' },
//   notifyTarget: { hidden: true }
// };

const Component = function RuleManagementPage() {
  return (
    <RiskRuleConfigPage
      // 新规则页面主要修改以下三处
      ruleName="招标-最短投标时间"
      ruleDescription="支持配置供应商最短投标/报价时间（比如2天），若经办人设置时间少于配置的天数，系统根据配置进行业务预警或拦截"
      extraColumns={extraColumns}
      // 选中左侧规则树中对应的规则
      defaultSelectedRuleKey="bid_time_limit"
    />
  );
};

export default Component;
