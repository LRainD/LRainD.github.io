/**
 * @name 简版-审批
 * @mode axure
 *
 * 参考资料：
 * - /rules/development-guide.md
 * - /src/components/centralized-procurement-layout/index.tsx
 * - /src/prototypes/procurement-qa/index.tsx
 */

import React, { useState } from 'react';
import { Button, Checkbox, ConfigProvider, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import zhCN from 'antd/locale/zh_CN';
import {
  ClockCircleOutlined,
  QuestionCircleOutlined,
  SyncOutlined,
  UndoOutlined
} from '@ant-design/icons';
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  FileCheck,
  FileSpreadsheet,
  FileText,
  HardHat,
  Home,
  MessageSquare,
  Package,
  Phone,
  Settings,
  ShoppingCart,
  Users,
  Wallet
} from 'lucide-react';
import CentralizedProcurementLayout from '../../components/centralized-procurement-layout';
import type { MenuItem } from '../../components/centralized-procurement-layout';
import './style.css';

/** 提问截止时间（口径与「简版-发起澄清」一致） */
const QUESTION_DEADLINE = '2026-10-20 18:00:00';

/** 自动延时（只读展示）：是否勾选 + 审批通过后延时天数 */
const AUTO_DELAY_ENABLED = true;
const AUTO_DELAY_DAYS = 2;

/** 左侧菜单（与截图一致，收起态展示缩减字样） */
const SIDEBAR_ITEMS: MenuItem[] = [
  { key: 'cc-home', label: '首页', collapsedLabel: '首页', icon: <Home className="menu-icon" /> },
  { key: 'cc-purchase', label: '采购', collapsedLabel: '采购', icon: <ShoppingCart className="menu-icon" /> },
  { key: 'cc-supplier', label: '分供', collapsedLabel: '分供', icon: <Users className="menu-icon" /> },
  { key: 'cc-purchase-extra', label: '采购', collapsedLabel: '采购', icon: <FileText className="menu-icon" /> },
  { key: 'cc-bidding', label: '招标', collapsedLabel: '招标', icon: <FileText className="menu-icon" /> },
  { key: 'cc-project', label: '工程', collapsedLabel: '工程', icon: <HardHat className="menu-icon" /> },
  { key: 'cc-contact', label: '联系', collapsedLabel: '联系', icon: <Phone className="menu-icon" /> },
  { key: 'cc-contract', label: '合同', collapsedLabel: '合同', icon: <FileCheck className="menu-icon" /> },
  { key: 'cc-complaint', label: '投诉', collapsedLabel: '投诉', icon: <MessageSquare className="menu-icon" /> },
  { key: 'cc-arrears', label: '清欠', collapsedLabel: '清欠', icon: <Wallet className="menu-icon" /> },
  { key: 'cc-fulfill', label: '履约', collapsedLabel: '履约', icon: <ClipboardList className="menu-icon" /> },
  { key: 'cc-acceptance', label: '验收', collapsedLabel: '验收', icon: <BarChart3 className="menu-icon" /> },
  { key: 'cc-config', label: '配置', collapsedLabel: '配置', icon: <Settings className="menu-icon" /> },
  { key: 'cc-material', label: '物料', collapsedLabel: '物料', icon: <Package className="menu-icon" /> },
  { key: 'cc-approval', label: '审批', collapsedLabel: '审批', icon: <FileCheck className="menu-icon" /> },
  { key: 'cc-data', label: '数据', collapsedLabel: '数据', icon: <BarChart3 className="menu-icon" /> },
  { key: 'cc-template', label: '范本', collapsedLabel: '范本', icon: <BookOpen className="menu-icon" /> }
];

/** 审批流转记录 */
type ApprovalRow = {
  key: string;
  level: string;
  approver: string;
  approverKind: 'pill' | 'text';
  info: string[];
  time: string;
  result: string;
  resultKind: 'normal' | 'pending';
  duration: string;
  opinion: string;
};

const APPROVAL_DATA: ApprovalRow[] = [
  {
    key: '1',
    level: '开始节点',
    approver: '奥巴马',
    approverKind: 'pill',
    info: ['组织：中国建筑股份有限公司', '账号：hehetest (177****0007)'],
    time: '2026-10-19 16:52:35',
    result: '已提交',
    resultKind: 'normal',
    duration: '0秒',
    opinion: '—'
  },
  {
    key: '2',
    level: '一级审批',
    approver: 'admin1',
    approverKind: 'pill',
    info: [
      '组织：中国建筑股份有限公司',
      '账号：jcadmin',
      '职位：无/请不要修改jcadmin账号的组织'
    ],
    time: '—',
    result: '审核中',
    resultKind: 'pending',
    duration: '28分钟',
    opinion: '—'
  },
  {
    key: '3',
    level: '流程结束',
    approver: '系统',
    approverKind: 'text',
    info: ['—'],
    time: '—',
    result: '未结束',
    resultKind: 'normal',
    duration: '—',
    opinion: '—'
  }
];

const APPROVAL_COLUMNS: ColumnsType<ApprovalRow> = [
  { title: '审批层级', dataIndex: 'level', key: 'level', width: 160 },
  {
    title: '审批人',
    dataIndex: 'approver',
    key: 'approver',
    width: 200,
    render: (text: string, record: ApprovalRow) =>
      record.approverKind === 'pill' ? (
        <span className="cc-approver-pill">{text}</span>
      ) : (
        <span className="cc-approver-text">{text}</span>
      )
  },
  {
    title: '审批人信息',
    dataIndex: 'info',
    key: 'info',
    width: 380,
    render: (lines: string[]) => (
      <div className="cc-info-lines">
        {lines.map((line, index) => (
          <div key={index}>{line}</div>
        ))}
      </div>
    )
  },
  { title: '处理时间', dataIndex: 'time', key: 'time', width: 200 },
  {
    title: '审批结果',
    dataIndex: 'result',
    key: 'result',
    width: 140,
    render: (text: string, record: ApprovalRow) => (
      <span className={record.resultKind === 'pending' ? 'cc-result-pending' : ''}>{text}</span>
    )
  },
  { title: '审批耗时', dataIndex: 'duration', key: 'duration', width: 150 },
  { title: '审批意见', dataIndex: 'opinion', key: 'opinion' }
];

const Component = () => {
  const [detailOpen, setDetailOpen] = useState(true);
  const [approvalOpen, setApprovalOpen] = useState(true);

  return (
    <ConfigProvider locale={zhCN}>
      <CentralizedProcurementLayout
        username="奥巴马"
        orgName="中国建筑股份有限公司"
        activeMenuKey=""
        sidebarItems={SIDEBAR_ITEMS}
        defaultCollapsed
      >
        {/* 页头：标题 + 倒计时 + 采购信息 */}
        <div className="cc-head">
          <div className="cc-head-inner">
            <div className="cc-title-row">
              <span className="cc-category-tag">专业分包</span>
              <h1 className="cc-title">测试简版澄清答疑</h1>
            </div>
          </div>

          <div className="cc-head-divider" />

          <div className="cc-head-inner">
            <div className="cc-countdown-row">
              <span className="cc-countdown-label">距废除截止还剩：</span>
              <span className="cc-time-box">999845</span>
              <span className="cc-time-unit">天</span>
              <span className="cc-time-box">18</span>
              <span className="cc-time-unit">:</span>
              <span className="cc-time-box">09</span>
              <span className="cc-time-unit">:</span>
              <span className="cc-time-box">29</span>
            </div>

            <div className="cc-info-grid">
              <div className="cc-info-item">
                采购编号：<span className="cc-link">cscec202605210000040575</span>
              </div>
              <div className="cc-info-item">组织机构：中国建筑股份有限公司</div>
              <div className="cc-info-item">采购方式：询比采购</div>
              <div className="cc-info-item">
                项目：<span className="cc-link cc-link-inline">测试项目93138</span>
              </div>
              <div className="cc-info-item">品类：专业分包-地基基础工程专业承包</div>
              <div className="cc-info-item">经办人：奥巴马</div>
            </div>
          </div>
        </div>

        {/* 澄清详情 */}
        <div className="cc-card">
          <div className="cc-card-head">
            <div className="cc-card-head-left">
              <span className="cc-bar" />
              <span className="cc-card-title">澄清详情</span>
            </div>
            <span className="cc-collapse" onClick={() => setDetailOpen(!detailOpen)}>
              {detailOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </div>

          {detailOpen && (
            <div className="cc-detail-body">
              <div className="cc-field">
                <span className="cc-field-label">澄清说明：</span>
                <span className="cc-field-value">123</span>
              </div>

              <div className="cc-field cc-field-center">
                <span className="cc-field-label">提问截止时间：</span>
                <span className="cc-field-value cc-deadline-row">
                  <span className="cc-deadline-text">{QUESTION_DEADLINE}</span>
                  <span className="cc-delay">
                    <Checkbox checked={AUTO_DELAY_ENABLED} disabled>
                      自动延时
                    </Checkbox>
                    <Tooltip
                      placement="top"
                      rootClassName="cc-delay-tooltip"
                      styles={{
                        body: { backgroundColor: '#333', color: 'rgba(255, 255, 255, 0.92)' }
                      }}
                      title={
                        <div className="cc-delay-tip">
                          <p className="cc-delay-tip-line">勾选自动延时设置时间后，</p>
                          <p className="cc-delay-tip-line">
                            若【审核通过时间+延长时间】早于【截止时间】，则最终截止时间为【截止时间】。如截止时间为
                            2024-10-01 12:00，延长时间设置 3 小时，审批通过时间为 2024-10-01 8:00，那最终截止时间为
                            2024-10-01 12:00。
                          </p>
                          <p className="cc-delay-tip-line">
                            若【审核通过时间+延长时间】晚于【截止时间】，则最终截止时间为【审核通过时间+延长时间】。如截止时间为
                            2024-10-01 12:00，延长时间设置 3 小时，审批通过时间为 2024-10-01 16:00，那最终截止时间为
                            2024-10-01 19:00。
                          </p>
                        </div>
                      }
                    >
                      <QuestionCircleOutlined className="cc-delay-help" />
                    </Tooltip>
                    <span className="cc-delay-colon">：</span>
                    <span className="cc-delay-text">审批通过后</span>
                    <span className="cc-delay-days">{AUTO_DELAY_DAYS}</span>
                    <span className="cc-delay-text">天</span>
                  </span>
                </span>
              </div>

              <div className="cc-field">
                <span className="cc-field-label">澄清附件：</span>
                <span className="cc-field-value">
                  <span className="cc-file-chip">
                    <FileSpreadsheet size={15} className="cc-file-icon" />
                    斯里兰卡卢比_资审结果导入.xlsx
                  </span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 审批记录 */}
        <div className="cc-card">
          <div className="cc-card-head">
            <div className="cc-card-head-left">
              <span className="cc-bar" />
              <span className="cc-card-title">审批记录</span>
            </div>
            <div className="cc-card-head-right">
              <span className="cc-style-switch">
                <SyncOutlined />
                切换样式
              </span>
              <span className="cc-collapse" onClick={() => setApprovalOpen(!approvalOpen)}>
                {approvalOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </span>
            </div>
          </div>

          {approvalOpen && (
            <div className="cc-approval-body">
              <div className="cc-flow-row">
                <span className="cc-flow-name">审批流名称:FETEST-澄清提问简版</span>
                <div className="cc-flow-actions">
                  <Button className="cc-btn-urge" icon={<ClockCircleOutlined />}>
                    催办/分享
                  </Button>
                  <Button className="cc-btn-revoke" icon={<UndoOutlined />}>
                    撤销申请
                  </Button>
                </div>
              </div>

              <Table<ApprovalRow>
                className="cc-table"
                dataSource={APPROVAL_DATA}
                columns={APPROVAL_COLUMNS}
                rowKey="key"
                pagination={false}
                bordered
                size="middle"
                scroll={{ x: 1430 }}
              />
            </div>
          )}
        </div>
      </CentralizedProcurementLayout>
    </ConfigProvider>
  );
};

Component.displayName = 'ProcurementClarifyDetail';

export default Component;
