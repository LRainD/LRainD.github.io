/**
 * @name 业务预警监控（运营后台）
 *
 * 参考资料：
 * - /rules/development-guide.md
 * - /skills/screenshot-page-workflow/SKILL.md
 * - /src/components/operation-admin-layout/index.tsx
 * - /src/prototypes/business-warning-monitor/index.tsx
 */

import React, { useState } from 'react';
import {
  ContainerOutlined,
  DownOutlined,
  ExclamationCircleFilled,
  InfoCircleOutlined,
  SafetyOutlined,
  SettingOutlined,
  ShopOutlined,
  ToolOutlined,
  UpOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { Button, Checkbox, ConfigProvider, Select, Table, type TableColumnsType } from 'antd';
import zhCN from 'antd/locale/zh_CN';

import OperationAdminLayout from '../../components/operation-admin-layout';
import './style.css';

// --- 左侧菜单 ---

const menuItems = [
  { key: 'receiving', icon: <ContainerOutlined />, label: '收验货' },
  { key: 'marketing_mgmt', icon: <ShopOutlined />, label: '营销管理' },
  { key: 'risk_warning', icon: <WarningOutlined />, label: '风控预警' },
  { key: 'operation_tools', icon: <ToolOutlined />, label: '运营工具' },
  {
    key: 'risk_warning_center',
    icon: <SafetyOutlined />,
    label: '风控预警中心',
    children: [
      { key: 'warning_check', label: '预警核查' },
      { key: 'field_config', label: '字段配置' },
      { key: 'rule_config', label: '规则配置' },
      { key: 'scene_mgmt', label: '场景管理' },
      { key: 'warning_config', label: '预警配置' },
      { key: 'operation_mgmt', label: '运营管理' },
      { key: 'rule_mgmt', label: '规则管理' },
      { key: 'disposal_mgmt', label: '处置管理' },
      { key: 'notification_center', label: '通知中心' },
      { key: 'business_warning_monitor', label: '业务预警监控' },
      { key: 'disposal_record', label: '处置记录' },
      { key: 'risk_item_warning', label: '风险项预警' },
      { key: 'business_risk_report', label: '业务风险报表' },
      { key: 'bidding', label: '招投标' },
      { key: 'procurement_audit', label: '采购稽查' },
      { key: 'risk_warning_dashboard', label: '风控预警看板' },
      { key: 'inspection_config', label: '业务巡检配置' },
      { key: 'business_risk_detection', label: '业务风险检测' }
    ]
  }
];

// --- 基础数据 ---

// 组织机构选项
const organizationOptions = [
  { label: '测试组织-股份公司', value: '测试组织-股份公司' },
  { label: '测试组织-局级公司', value: '测试组织-局级公司' },
  { label: '测试组织-分子公司', value: '测试组织-分子公司' }
];

// 业务域选项
const businessDomainOptions = [{ label: '云筑集采', value: '云筑集采' }];

// 预警规则选项
const warningRuleOptions = [
  { label: '拟中标供应商数量校验', value: '拟中标供应商数量校验' },
  { label: '最短报名天数', value: '最短报名天数' },
  { label: '招标/采购公告需用模板化生成', value: '招标/采购公告需用模板化生成' },
  { label: '最小评标人数', value: '最小评标人数' }
];

// --- 统计数据 ---

const warningCountStats = {
  total: '3,035',
  rows: [
    { label: '拦截：', value: '6次，0.20%' },
    { label: '预警：', value: '3,029次，99.80%' }
  ]
};

const businessWarningStats = {
  total: '954',
  pairs: [
    { label: '招投标：', value: '686次（预警：2,575次, 拦截：6次）, 71.91%' },
    { label: '供应商：', value: '0次（预警：0次, 拦截：0次）, 0.00%' }
  ],
  rows: [
    { label: '合同：', value: '261次（预警：445次, 拦截：0次）, 27.36%' },
    { label: '履约：', value: '7次（预警：9次, 拦截：0次）, 0.73%' }
  ]
};

const warningReleaseStats = {
  rate: '15.09%',
  rows: [
    { label: '已解除：', value: '144次，15.09%' },
    { label: '未解除：', value: '810次，84.91%' }
  ]
};

// --- 列表数据 ---

interface WarningRecord {
  key: string;
  seq: number;
  businessNo: string;
  ruleType: string;
  warningLevel: string;
  warningType: string;
  warningCount: number;
  ruleConfig: React.ReactNode;
  currentData: string;
  releaseStatus: string;
  releaseMethod: string;
  disposalNo: string;
  action: string;
}

const tableData: WarningRecord[] = [
  {
    key: '1',
    seq: 1,
    businessNo: 'BBI202607130000240068',
    ruleType: '管理要求',
    warningLevel: '中风险',
    warningType: '预警',
    warningCount: 1,
    ruleConfig: '拟中标供应商数量：3家，投标供应商数量≥5家（N+2）',
    currentData: '投标供应商数量 0 家',
    releaseStatus: '未解除',
    releaseMethod: '-',
    disposalNo: '-',
    action: '-'
  },
  {
    key: '2',
    seq: 2,
    businessNo: 'BBI202606150000770204',
    ruleType: '管理要求',
    warningLevel: '中风险',
    warningType: '预警',
    warningCount: 12,
    ruleConfig: '最短报名天数：8天',
    currentData: '报名天数7天',
    releaseStatus: '未解除',
    releaseMethod: '-',
    disposalNo: '-',
    action: '-'
  },
  {
    key: '3',
    seq: 3,
    businessNo: 'BBI202606150000770204',
    ruleType: '合规风险',
    warningLevel: '中风险',
    warningType: '预警',
    warningCount: 24,
    ruleConfig: '招标/采购公告需用模板化生成',
    currentData: '本次招标/采购公告非模板化生成',
    releaseStatus: '未解除',
    releaseMethod: '-',
    disposalNo: '-',
    action: '-'
  },
  {
    key: '4',
    seq: 4,
    businessNo: 'BBI202606160000440002',
    ruleType: '合规风险',
    warningLevel: '中风险',
    warningType: '预警',
    warningCount: 58,
    ruleConfig: '劳务清单不应存在机械设备/主材/周材',
    currentData: '本次劳务分包采购清单存在机械设备',
    releaseStatus: '未解除',
    releaseMethod: '-',
    disposalNo: '-',
    action: '-'
  },
  {
    key: '5',
    seq: 5,
    businessNo: 'BBI202606160000440002',
    ruleType: '合规风险',
    warningLevel: '中风险',
    warningType: '预警',
    warningCount: 52,
    ruleConfig: '非招采购不能包含招标、开标、评标、中标、约标、发标、定标、投标字样',
    currentData: '此节点存在1个带标校供应商字样',
    releaseStatus: '未解除',
    releaseMethod: '-',
    disposalNo: '-',
    action: '-'
  },
  {
    key: '6',
    seq: 6,
    businessNo: 'BBI202610160000632522',
    ruleType: '管理要求',
    warningLevel: '低风险',
    warningType: '预警',
    warningCount: 1,
    ruleConfig: '最小评标人数：3人且需要为奇数',
    currentData: '评标人数：2人',
    releaseStatus: '未解除',
    releaseMethod: '-',
    disposalNo: '-',
    action: '-'
  },
  {
    key: '7',
    seq: 7,
    businessNo: 'BBI202610160000559369',
    ruleType: '管理要求',
    warningLevel: '低风险',
    warningType: '预警',
    warningCount: 1,
    ruleConfig: '最小评标人数：3人且需要为奇数',
    currentData: '评标人数：2人',
    releaseStatus: '未解除',
    releaseMethod: '-',
    disposalNo: '-',
    action: '-'
  },
  {
    key: '8',
    seq: 8,
    businessNo: 'BBI202606050000140099',
    ruleType: '合规风险',
    warningLevel: '中风险',
    warningType: '预警',
    warningCount: 4,
    ruleConfig: '调价轮次需与招标文件描述一致',
    currentData: '本次招标已经发起3次调价',
    releaseStatus: '未解除',
    releaseMethod: '-',
    disposalNo: '-',
    action: '-'
  },
  {
    key: '9',
    seq: 9,
    businessNo: 'BBI2026092200001571538',
    ruleType: '合规风险',
    warningLevel: '中风险',
    warningType: '预警',
    warningCount: 27,
    ruleConfig: '招标/采购文件需用模板化生成',
    currentData: '本次招标/采购文件非模板化生成',
    releaseStatus: '未解除',
    releaseMethod: '-',
    disposalNo: '-',
    action: '-'
  },
  {
    key: '10',
    seq: 10,
    businessNo: 'BBI2026092200001571538',
    ruleType: '管理要求',
    warningLevel: '中风险',
    warningType: '预警',
    warningCount: 27,
    ruleConfig: '最短报价天数10天且 应急采购【需要】管控',
    currentData: '报价天数2天',
    releaseStatus: '未解除',
    releaseMethod: '-',
    disposalNo: '-',
    action: '-'
  }
];

const columns: TableColumnsType<WarningRecord> = [
  { title: '序号', dataIndex: 'seq', width: 64, align: 'center' },
  {
    title: '业务编号',
    dataIndex: 'businessNo',
    width: 200,
    render: (value: string) => <a className="bwm-link">{value}</a>
  },
  { title: '规则类型', dataIndex: 'ruleType', width: 100 },
  { title: '预警级别', dataIndex: 'warningLevel', width: 100 },
  { title: '预警类型', dataIndex: 'warningType', width: 90 },
  { title: '预警次数', dataIndex: 'warningCount', width: 90, align: 'center' },
  { title: '规则配置', dataIndex: 'ruleConfig', width: 330 },
  {
    title: '当前数据',
    dataIndex: 'currentData',
    width: 210,
    render: (value: string) => (
      <span className="bwm-cell-ellipsis" title={value}>
        {value}
      </span>
    )
  },
  { title: '预警解除状态', dataIndex: 'releaseStatus', width: 120 },
  { title: '解除方式', dataIndex: 'releaseMethod', width: 100 },
  { title: '处置编号', dataIndex: 'disposalNo', width: 100 },
  { title: '操作', dataIndex: 'action', width: 80, align: 'center' }
];

// --- Component ---

const Component: React.FC = () => {
  const [queryExpanded, setQueryExpanded] = useState(true);

  return (
    <ConfigProvider locale={zhCN}>
      <OperationAdminLayout
        activeMenuKey="business_warning_monitor"
        defaultOpenKeys={['risk_warning_center']}
        menuItems={menuItems as any}
        showOrgBar={false}
      >
        <div className="bwm-page">
          {/* 面包屑 */}
          <div className="bwm-breadcrumb">
            <span className="bwm-breadcrumb-item">风控预警中心</span>
            <span className="bwm-breadcrumb-separator">&gt;</span>
            <span className="bwm-breadcrumb-item current">业务预警监控</span>
          </div>

          {/* 查询区域 */}
          <div className="bwm-card bwm-query-card">
            <div className="bwm-query-header">
              <div className="bwm-query-title">
                <span className="bwm-title-bar" />
                <span>查询</span>
              </div>
              <span className="bwm-query-toggle" onClick={() => setQueryExpanded((prev) => !prev)}>
                {queryExpanded ? <UpOutlined /> : <DownOutlined />}
              </span>
            </div>

            {queryExpanded && (
              <div className="bwm-query-body">
                <div className="bwm-query-field">
                  <span className="bwm-query-label">组织机构</span>
                  <div className="bwm-query-control">
                    <Select
                      defaultValue="测试组织-股份公司"
                      options={organizationOptions}
                      style={{ width: 240 }}
                    />
                    <Checkbox defaultChecked>包含下级</Checkbox>
                  </div>
                </div>

                <div className="bwm-query-field">
                  <span className="bwm-query-label">预警规则</span>
                  <div className="bwm-query-control">
                    <Select
                      placeholder="请选择预警规则"
                      options={warningRuleOptions}
                      allowClear
                      style={{ width: 240 }}
                    />
                  </div>
                </div>

                <div className="bwm-query-field">
                  <span className="bwm-query-label">业务域</span>
                  <div className="bwm-query-control">
                    <Select defaultValue="云筑集采" options={businessDomainOptions} style={{ width: 240 }} />
                  </div>
                </div>

                <div className="bwm-query-actions">
                  <Button type="primary">查询</Button>
                  <Button>重置</Button>
                  <Button type="link" onClick={() => setQueryExpanded((prev) => !prev)}>
                    {queryExpanded ? '收起' : '展开'}
                    {queryExpanded ? <UpOutlined /> : <DownOutlined />}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* 统计卡片 */}
          <div className="bwm-stats">
            <div className="bwm-card bwm-stat-card">
              <div className="bwm-stat-header">
                <span className="bwm-title-bar" />
                <span className="bwm-stat-title">预警次数统计</span>
                <span className="bwm-stat-subtitle">({warningCountStats.total}次)</span>
                <InfoCircleOutlined className="bwm-stat-info" />
              </div>
              <div className="bwm-stat-body">
                {warningCountStats.rows.map((row) => (
                  <div className="bwm-stat-row" key={row.label}>
                    <span className="bwm-stat-label">{row.label}</span>
                    <span className="bwm-stat-value">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bwm-card bwm-stat-card">
              <div className="bwm-stat-header">
                <span className="bwm-title-bar" />
                <span className="bwm-stat-title">业务预警统计</span>
                <span className="bwm-stat-subtitle">({businessWarningStats.total}次)</span>
                <InfoCircleOutlined className="bwm-stat-info" />
              </div>
              <div className="bwm-stat-body">
                <div className="bwm-stat-row bwm-stat-row-split">
                  {businessWarningStats.pairs.map((pair) => (
                    <div className="bwm-stat-row" key={pair.label}>
                      <span className="bwm-stat-label">{pair.label}</span>
                      <span className="bwm-stat-value">{pair.value}</span>
                    </div>
                  ))}
                </div>
                {businessWarningStats.rows.map((row) => (
                  <div className="bwm-stat-row" key={row.label}>
                    <span className="bwm-stat-label">{row.label}</span>
                    <span className="bwm-stat-value">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bwm-card bwm-stat-card">
              <div className="bwm-stat-header">
                <span className="bwm-title-bar" />
                <span className="bwm-stat-title">预警解除统计</span>
                <span className="bwm-stat-subtitle">(预警解除率：{warningReleaseStats.rate})</span>
                <InfoCircleOutlined className="bwm-stat-info" />
              </div>
              <div className="bwm-stat-body">
                {warningReleaseStats.rows.map((row) => (
                  <div className="bwm-stat-row" key={row.label}>
                    <span className="bwm-stat-label">{row.label}</span>
                    <span className="bwm-stat-value">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 工具栏、提示与数据表格 */}
          <div className="bwm-card bwm-table-card">
            <div className="bwm-toolbar">
              <div className="bwm-export-group">
                <button type="button" className="bwm-export-button">
                  导出
                </button>
                <button type="button" className="bwm-export-icon-button">
                  <SettingOutlined />
                </button>
              </div>
              <div className="bwm-notice">
                <ExclamationCircleFilled className="bwm-notice-icon" />
                <div className="bwm-notice-text">
                  <div>注：同一个业务订单可能多次触发某个预警规则，业务单据创建过程中仅记录触发预警的预警规则且预警次数为1。</div>
                  <div>
                    批量风险处置需要确保是同一业务编号 且 处置状态为未处置 且 风险解除状态为未解除的预警风险数据 才能批量发起风险处置。
                  </div>
                </div>
              </div>
            </div>

            <Table<WarningRecord>
              className="bwm-table"
              columns={columns}
              dataSource={tableData}
              rowKey="key"
              scroll={{ x: 1560 }}
              pagination={{
                total: 954,
                defaultPageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                pageSizeOptions: ['10', '20', '50', '100'],
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/总共 ${total} 条`
              }}
            />
          </div>
        </div>
      </OperationAdminLayout>
    </ConfigProvider>
  );
};

export default Component;
