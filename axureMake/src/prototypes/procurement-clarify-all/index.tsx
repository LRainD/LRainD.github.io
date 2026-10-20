/**
 * @name 详版-发起澄清
 * @mode axure
 *
 * 参考资料：
 * - /rules/development-guide.md
 * - /src/components/centralized-procurement-layout/index.tsx
 * - /src/prototypes/procurement-clarify-detail/index.tsx
 */

import React, { useState } from 'react';
import { Button, ConfigProvider, Input } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  FileCheck,
  FileText,
  HardHat,
  Home,
  MessageSquare,
  Package,
  Phone,
  Plus,
  Settings,
  ShoppingCart,
  Users,
  Wallet,
  X
} from 'lucide-react';
import CentralizedProcurementLayout from '../../components/centralized-procurement-layout';
import type { MenuItem } from '../../components/centralized-procurement-layout';
import './style.css';

/** 左侧菜单（收起态，与截图一致） */
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

/** 澄清记录中的分供商阅读状态行 */
type ReadRow = {
  text: string;
  /** 行右侧操作链接 */
  actions?: string[];
};

/** 澄清记录 */
type ClarifyRecord = {
  key: string;
  question: string;
  time: string;
  readRows: ReadRow[];
  /** 记录状态（如：已撤回） */
  status?: string;
};

const RECORDS: ClarifyRecord[] = [
  {
    key: '1',
    question: '根据股份管理要求，进行澄清',
    time: '2026-10-20 09:33:13',
    readRows: [
      {
        text: '未读分供商(2)：重庆蓝雄科技有限公司、sup203',
        actions: ['撤回', '查看详情']
      }
    ]
  },
  {
    key: '2',
    question: '问题已撤回',
    time: '2026-10-20 09:30:27',
    readRows: [{ text: '未读分供商(2)：重庆蓝雄科技有限公司、sup203' }],
    status: '已撤回'
  },
  {
    key: '3',
    question: '123',
    time: '2026-10-20 09:29:36',
    readRows: [
      { text: '已读未回分供商(1)：sup203', actions: ['查看详情'] },
      { text: '未读分供商(1)：sup205-qi变更测试one', actions: ['查看详情'] }
    ]
  }
];

const Component = () => {
  const [bodyOpen, setBodyOpen] = useState(true);
  const [askOpen, setAskOpen] = useState(true);
  const [recordOpen, setRecordOpen] = useState(true);

  // 已选分供商
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>(['sup203', '重庆蓝雄科技有限公司']);
  const [questionText, setQuestionText] = useState('');

  const removeSupplier = (name: string) => {
    setSelectedSuppliers(selectedSuppliers.filter(item => item !== name));
  };

  return (
    <ConfigProvider locale={zhCN}>
      <CentralizedProcurementLayout
        username="奥巴马"
        orgName="中国建筑股份..."
        activeMenuKey=""
        sidebarItems={SIDEBAR_ITEMS}
        defaultCollapsed
      >
        {/* 页头：面包屑 + 标题 + 倒计时 + 采购信息 */}
        <div className="cl-head">
          <div className="cl-breadcrumb">
            <span className="cl-crumb-link">采购列表</span>
            <span className="cl-crumb-sep">&gt;</span>
            <span className="cl-crumb-current">澄清</span>
          </div>

          <div className="cl-title-row">
            <span className="cl-category-tag">物资</span>
            <h1 className="cl-title">斯里兰卡卢比</h1>
          </div>

          <div className="cl-head-divider" />

          <div className="cl-countdown-row">
            <span className="cl-countdown-label">距废除截止还剩：</span>
            <span className="cl-time-box">999937</span>
            <span className="cl-time-unit">天</span>
            <span className="cl-time-box">07</span>
            <span className="cl-time-unit">:</span>
            <span className="cl-time-box">12</span>
            <span className="cl-time-unit">:</span>
            <span className="cl-time-box">00</span>
          </div>

          <div className="cl-info-grid">
            <div className="cl-info-item">
              采购编号：<span className="cl-link">cscec202608210000063225</span>
            </div>
            <div className="cl-info-item">组织机构：中国建筑股份有限公司</div>
            <div className="cl-info-item">采购方式：竞价采购</div>
            <div className="cl-info-item">
              项目：<span className="cl-link">测试项目89193</span>
            </div>
            <div className="cl-info-item">品类：物资-钢材</div>
            <div className="cl-info-item">经办人：奥巴马</div>
          </div>
        </div>

        {/* 全部澄清 */}
        <div className="cl-card">
          <div className="cl-card-head">
            <div className="cl-card-head-left">
              <span className="cl-card-bar" />
              <span className="cl-card-title">全部澄清</span>
            </div>
            <div className="cl-card-head-right">
              <Button type="primary" className="cl-export-btn">
                导出全部澄清
              </Button>
              <span className="cl-collapse" onClick={() => setBodyOpen(!bodyOpen)}>
                {bodyOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </span>
            </div>
          </div>

          {bodyOpen && (
            <div className="cl-section-list">
              {/* 提问 */}
              <div className="cl-section">
                <div className="cl-section-head">
                  <div className="cl-section-head-left">
                    <span className="cl-title-bar" />
                    <span className="cl-section-title">提问</span>
                  </div>
                  <span className="cl-collapse" onClick={() => setAskOpen(!askOpen)}>
                    {askOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </span>
                </div>

                {askOpen && (
                  <div className="cl-ask-body">
                    <div className="cl-chip-row">
                      <span className="cl-chip-label">已选分供商：</span>
                      {selectedSuppliers.map(name => (
                        <span className="cl-chip" key={name}>
                          <span className="cl-chip-text">{name}</span>
                          <X size={12} className="cl-chip-close" onClick={() => removeSupplier(name)} />
                        </span>
                      ))}
                      <span className="cl-link cl-select-link">选择分供商</span>
                    </div>

                    <Input.TextArea
                      className="cl-textarea"
                      rows={4}
                      value={questionText}
                      onChange={e => setQuestionText(e.target.value)}
                    />
                    <div className="cl-count">{questionText.length} / 500</div>

                    <div className="cl-ask-footer">
                      <Button icon={<Plus size={14} />} className="cl-attach-btn">
                        添加附件
                      </Button>
                      <Button type="primary" className="cl-submit-btn">
                        提交
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* 澄清记录 */}
              <div className="cl-section">
                <div className="cl-section-head">
                  <div className="cl-section-head-left">
                    <span className="cl-title-bar" />
                    <span className="cl-section-title">澄清记录(3)</span>
                  </div>
                  <span className="cl-collapse" onClick={() => setRecordOpen(!recordOpen)}>
                    {recordOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </span>
                </div>

                {recordOpen && (
                  <div className="cl-record-list">
                    {RECORDS.map(record => (
                      <div className="cl-record" key={record.key}>
                        <div className="cl-record-label">采购商 提问：</div>
                        <div className="cl-record-question">{record.question}</div>
                        <div className="cl-record-time">{record.time}</div>

                        {record.readRows.map((row, index) => (
                          <div className="cl-read-row" key={index}>
                            <span className="cl-read-text">{row.text}</span>
                            {row.actions && (
                              <span className="cl-read-actions">
                                {row.actions.map(action => (
                                  <span className="cl-link" key={action}>
                                    {action}
                                  </span>
                                ))}
                              </span>
                            )}
                            {!row.actions && record.status && index === record.readRows.length - 1 && (
                              <span className="cl-record-status">{record.status}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CentralizedProcurementLayout>
    </ConfigProvider>
  );
};

Component.displayName = 'ProcurementClarifyAll';

export default Component;
