/**
 * @name 简版-发起澄清
 * @mode axure
 *
 * 参考资料：
 * - /rules/development-guide.md
 * - /src/components/centralized-procurement-layout/index.tsx
 * - /src/prototypes/procurement-qa/index.tsx
 */

import React, { useState } from 'react';
import {
  Breadcrumb,
  Button,
  ConfigProvider,
  Input,
  InputNumber,
  Select,
  Checkbox,
  Table,
  Modal,
  Popover,
  Tooltip,
  DatePicker
} from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { ChevronDown, ChevronUp, Info, Plus } from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import CentralizedProcurementLayout from '../../components/centralized-procurement-layout';
import { askListData, clarifyListData, clarifyPageInfo, type AskRecord, type ClarifyRecord } from './mock';
import './style.css';

dayjs.locale('zh-cn');

const Component = () => {
  const [supplierName, setSupplierName] = useState('');
  const [supplierStatus, setSupplierStatus] = useState<string | undefined>(undefined);
  const [bodyOpen, setBodyOpen] = useState(true);
  const [clarifyListOpen, setClarifyListOpen] = useState(true);
  const [askListOpen, setAskListOpen] = useState(true);

  // 新建澄清弹窗状态
  const [newClarifyVisible, setNewClarifyVisible] = useState(false);
  const [modeMenuOpen, setModeMenuOpen] = useState(false);
  // 是否走审批流程（用于演示不同分支）
  const [hasApproval, setHasApproval] = useState(true);
  const [clarifyContent, setClarifyContent] = useState('');
  const [questionDeadline, setQuestionDeadline] = useState<any>(null);
  // 自动延时
  const [autoDelay, setAutoDelay] = useState(false);
  const [delayValue, setDelayValue] = useState<number | null>(2);
  const [delayUnit, setDelayUnit] = useState<'day' | 'hour'>('day');

  // 澄清列表数据
  const [clarifyDataSource, setClarifyDataSource] = useState<ClarifyRecord[]>(clarifyListData);

  // 回答列表数据
  const [askDataSource, setAskDataSource] = useState<AskRecord[]>(askListData);

  // 选择「有审批 / 无审批」后打开创建澄清弹窗
  const handleOpenClarify = (approval: boolean) => {
    setHasApproval(approval);
    setModeMenuOpen(false);
    setClarifyContent('');
    setQuestionDeadline(null);
    setAutoDelay(false);
    setDelayValue(2);
    setDelayUnit('day');
    setNewClarifyVisible(true);
  };

  const handleCreateClarify = () => {
    if (!clarifyContent.trim()) {
      return;
    }
    const newRecord = {
      key: String(clarifyDataSource.length + 1),
      index: clarifyDataSource.length + 1,
      clarifyTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      questionDeadline: questionDeadline ? questionDeadline.format('YYYY-MM-DD HH:mm:ss') : '-',
      clarifyDesc: clarifyContent,
      attachCount: '0',
      attach: '--',
      status: '已澄清',
      action: '查看审批记录'
    };
    setClarifyDataSource([newRecord, ...clarifyDataSource]);
    setClarifyContent('');
    setNewClarifyVisible(false);
  };

  return (
    <ConfigProvider locale={zhCN}>
      <CentralizedProcurementLayout
        username="奥巴马"
        activeMenuKey="procurement-list"
        defaultOpenGroupKeys={['bidding-procurement']}
      >
        {/* 面包屑 */}
        <Breadcrumb
          className="qa-breadcrumb"
          separator={<span className="qa-breadcrumb-sep">›</span>}
          items={[
            { title: <span className="qa-breadcrumb-parent">采购列表</span> },
            { title: <span className="qa-breadcrumb-current">澄清</span> }
          ]}
        />

        {/* 页面标题 + 倒计时 + 采购信息 */}
        <div className="qa-page-head">
          <div className="qa-title-area">
            <span className="qa-category-tag">{clarifyPageInfo.category}</span>
            <h1 className="qa-title">{clarifyPageInfo.title}</h1>
          </div>

          <div className="qa-countdown-row">
            <span className="qa-countdown-label">距废除截止还剩：</span>
            <span className="qa-time-box">{clarifyPageInfo.countdown.days}</span>
            <span className="qa-time-unit">天</span>
            <span className="qa-time-box">{clarifyPageInfo.countdown.hours}</span>
            <span className="qa-time-unit">:</span>
            <span className="qa-time-box">{clarifyPageInfo.countdown.minutes}</span>
            <span className="qa-time-unit">:</span>
            <span className="qa-time-box">{clarifyPageInfo.countdown.seconds}</span>
          </div>

          <div className="qa-info-grid">
            <div className="qa-info-item">
              采购编号：<span className="qa-link">{clarifyPageInfo.items.procurementNo}</span>
            </div>
            <div className="qa-info-item">组织机构：{clarifyPageInfo.items.organization}</div>
            <div className="qa-info-item">采购方式：{clarifyPageInfo.items.procurementMethod}</div>
            <div className="qa-info-item">
              项目：<span className="qa-link qa-link-inline">{clarifyPageInfo.items.projectName}</span>
            </div>
            <div className="qa-info-item">品类：{clarifyPageInfo.items.categoryName}</div>
            <div className="qa-info-item">经办人：{clarifyPageInfo.items.operator}</div>
          </div>
        </div>

        {/* 澄清大容器：白色底块，包裹标题栏 + 澄清列表 + 回答列表 */}
        <div className="qa-main-card">
          <div className="qa-main-head">
            <div className="qa-main-head-left">
              <span className="qa-main-bar" />
              <span className="qa-main-label">全部澄清</span>
              <span className="qa-main-text">
                当前澄清模式为“简版模式”，该模式不支持对特定问题（或者选择特定分供商）进行回答（或展示信息），仅支持公开、全量的信息展示
              </span>
            </div>
            <div className="qa-main-head-right">
              <Popover
                open={modeMenuOpen}
                onOpenChange={setModeMenuOpen}
                trigger="click"
                placement="bottomRight"
                arrow={false}
                content={
                  <div className="qa-mode-menu">
                    <div className="qa-mode-menu-title">请选择澄清方式（产品演示分支用，非需求）</div>
                    <div className="qa-mode-item" onClick={() => handleOpenClarify(true)}>
                      <span className="qa-mode-item-name">有审批</span>
                      <span className="qa-mode-item-desc">需审批通过后生效，可设置自动延时</span>
                    </div>
                    <div className="qa-mode-item" onClick={() => handleOpenClarify(false)}>
                      <span className="qa-mode-item-name">无审批</span>
                      <span className="qa-mode-item-desc">提交后直接生效</span>
                    </div>
                  </div>
                }
              >
                <Button type="primary" icon={<Plus size={14} />}>
                  新建澄清
                </Button>
              </Popover>
              <span className="qa-collapse-icon" onClick={() => setBodyOpen(!bodyOpen)}>
                {bodyOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </span>
            </div>
          </div>

          {bodyOpen && (
            <div className="qa-section-list">
              {/* 澄清列表 */}
              <div className="qa-section">
                <div className="qa-section-head">
                  <div className="qa-section-head-left">
                    <span className="qa-title-bar" />
                    <h2 className="qa-section-title">澄清列表</h2>
                    <span className="qa-section-note">所有的澄清均对所有的分供商可见;回答截止时间以最新的澄清设置的回答截止时间为准，超过时间后分供商不可回答</span>
                  </div>
                  <div className="qa-section-head-right">
                    <span className="qa-collapse-icon" onClick={() => setClarifyListOpen(!clarifyListOpen)}>
                      {clarifyListOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </div>
                </div>

                {clarifyListOpen && (
                  <div className="qa-table-wrap">
                    <Table
                      dataSource={clarifyDataSource}
                      rowKey="key"
                      pagination={false}
                      size="small"
                      bordered
                      scroll={{ x: 1440 }}
                      columns={[
                        { title: '', dataIndex: 'index', key: 'index', width: 60, align: 'center' },
                        { title: '澄清时间（审批通过时间）', dataIndex: 'clarifyTime', key: 'clarifyTime', align: 'center' },
                        { title: '回答截止时间', dataIndex: 'questionDeadline', key: 'questionDeadline', align: 'center' },
                        { title: '澄清说明', dataIndex: 'clarifyDesc', key: 'clarifyDesc', align: 'center' },
                        { title: '附件数量', dataIndex: 'attachCount', key: 'attachCount', align: 'center' },
                        {
                          title: '附件',
                          dataIndex: 'attach',
                          key: 'attach',
                          align: 'center',
                          render: (_: string, record: any) =>
                            record.attachCount !== '0' ? (
                              <Button type="link" size="small" className="qa-attach-btn">
                                查看附件
                              </Button>
                            ) : (
                              '--'
                            )
                        },
                        { title: '状态', dataIndex: 'status', key: 'status', align: 'center' },
                        {
                          title: '操作',
                          dataIndex: 'action',
                          key: 'action',
                          align: 'center',
                          render: (text) => <span className="qa-link">{text}</span>
                        }
                      ]}
                    />
                  </div>
                )}
              </div>

              {/* 回答列表 */}
              <div className="qa-section">
                <div className="qa-section-head">
                  <div className="qa-section-head-left">
                    <span className="qa-title-bar" />
                    <h2 className="qa-section-title">回答列表</h2>
                  </div>
                  <div className="qa-section-head-right">
                    <Button>整体打包下载</Button>
                    <span className="qa-collapse-icon" onClick={() => setAskListOpen(!askListOpen)}>
                      {askListOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </div>
                </div>

                {askListOpen && (
                  <>
                    <div className="qa-filter-row">
                      <span className="qa-filter-label">分供商名称</span>
                      <Input
                        className="qa-filter-input"
                        placeholder="请输入名称"
                        value={supplierName}
                        onChange={(e) => setSupplierName(e.target.value)}
                      />
                      <span className="qa-filter-label">状态</span>
                      <Select
                        className="qa-filter-select"
                        placeholder="请选择"
                        allowClear
                        value={supplierStatus}
                        onChange={(value) => setSupplierStatus(value)}
                        options={[
                          { value: 'pending', label: '待回答' },
                          { value: 'answered', label: '已回答' }
                        ]}
                      />
                      <div className="qa-filter-actions">
                        <Button type="primary">查询</Button>
                        <Button
                          onClick={() => {
                            setSupplierName('');
                            setSupplierStatus(undefined);
                          }}
                        >
                          重置
                        </Button>
                      </div>
                    </div>

                    <div className="qa-table-wrap">
                      <Table
                        dataSource={askDataSource.filter(item => {
                          if (supplierName && !item.supplier.includes(supplierName)) return false;
                          if (supplierStatus && !item.status.includes(supplierStatus === 'pending' ? '待回答' : '已回答')) return false;
                          return true;
                        })}
                        rowKey="key"
                        pagination={false}
                        size="small"
                        bordered
                        scroll={{ x: 1580 }}
                        columns={[
                          { title: '', dataIndex: 'index', key: 'index', width: 60, align: 'center' },
                          { title: '分供商名称（账号）', dataIndex: 'supplier', key: 'supplier', width: 320, align: 'center' },
                          { title: '联系方式', dataIndex: 'contact', key: 'contact', width: 200, align: 'center' },
                          { title: '回答时间', dataIndex: 'askTime', key: 'askTime', width: 200, align: 'center' },
                          { title: '回答说明', dataIndex: 'askDesc', key: 'askDesc', width: 220, align: 'center' },
                          { title: '附件数量', dataIndex: 'attachCount', key: 'attachCount', width: 120, align: 'center' },
                          { title: '附件', dataIndex: 'attach', key: 'attach', width: 140, align: 'center' },
                          {
                            title: (
                              <span className="qa-th-with-icon">
                                状态
                                <Info size={12} className="qa-th-info" />
                              </span>
                            ),
                            dataIndex: 'status',
                            key: 'status',
                            width: 160,
                            align: 'center'
                          },
                          { title: '操作', dataIndex: 'action', key: 'action', width: 160, align: 'center' }
                        ]}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 创建澄清弹窗 */}
        <Modal
          title={
            <div className="custom-modal-title">
              <span className="modal-title-bar" />
              <span>创建澄清</span>
            </div>
          }
          open={newClarifyVisible}
          onCancel={() => setNewClarifyVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setNewClarifyVisible(false)} className="modal-cancel-btn">
              取 消
            </Button>,
            <Button key="submit" type="primary" onClick={handleCreateClarify} className="modal-submit-btn">
              {hasApproval ? '提交审批' : '提交'}
            </Button>
          ]}
          width={720}
          className="create-clarify-modal"
          centered
        >
          <div className="clarify-form">
            <div className="clarify-form-item">
              <div className="clarify-label">
                <span className="required-star">*</span>澄清说明：
              </div>
              <div className="clarify-control">
                <Input.TextArea
                  rows={4}
                  maxLength={200}
                  placeholder="请输入"
                  value={clarifyContent}
                  onChange={(e) => setClarifyContent(e.target.value)}
                  className="clarify-textarea"
                />
                <div className="word-count">{clarifyContent.length} / 200</div>
              </div>
            </div>

            <div className="clarify-form-item">
              <div className="clarify-label">
                <span className="required-star">*</span>回答截止时间：
              </div>
              <div className="clarify-control clarify-deadline-row">
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  placeholder="请选择回答截止时间"
                  value={questionDeadline}
                  onChange={(val) => setQuestionDeadline(val)}
                  className={hasApproval ? 'clarify-deadline-picker' : 'clarify-deadline-picker-full'}
                />
                {hasApproval && (
                  <div className="clarify-delay">
                    <Checkbox
                      checked={autoDelay}
                      onChange={(e) => setAutoDelay(e.target.checked)}
                    >
                      自动延时
                    </Checkbox>
                    <Tooltip
                      placement="top"
                      rootClassName="clarify-delay-tooltip"
                      styles={{
                        body: { backgroundColor: '#333', color: 'rgba(255, 255, 255, 0.92)' }
                      }}
                      title={
                        <div className="clarify-delay-tip">
                          <p className="clarify-delay-tip-line">勾选自动延时设置时间后，</p>
                          <p className="clarify-delay-tip-line">
                            若【审核通过时间+延长时间】早于【截止时间】，则最终截止时间为【截止时间】。如截止时间为
                            2024-10-01 12:00，延长时间设置 3 小时，审批通过时间为 2024-10-01 8:00，那最终截止时间为
                            2024-10-01 12:00。
                          </p>
                          <p className="clarify-delay-tip-line">
                            若【审核通过时间+延长时间】晚于【截止时间】，则最终截止时间为【审核通过时间+延长时间】。如截止时间为
                            2024-10-01 12:00，延长时间设置 3 小时，审批通过时间为 2024-10-01 16:00，那最终截止时间为
                            2024-10-01 19:00。
                          </p>
                        </div>
                      }
                    >
                      <QuestionCircleOutlined className="clarify-delay-help" />
                    </Tooltip>
                    <span className="clarify-delay-colon">：</span>
                    <span className="clarify-delay-text">审批通过后</span>
                    <InputNumber
                      className="clarify-delay-input"
                      min={1}
                      max={999}
                      precision={0}
                      value={delayValue}
                      disabled={!autoDelay}
                      onChange={(val) => setDelayValue(val as number | null)}
                    />
                    <Select
                      className="clarify-delay-unit"
                      value={delayUnit}
                      disabled={!autoDelay}
                      onChange={(val) => setDelayUnit(val)}
                      options={[
                        { value: 'day', label: '天' },
                        { value: 'hour', label: '小时' }
                      ]}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="clarify-form-item">
              <div className="clarify-label">澄清附件：</div>
              <div className="clarify-control">
                <Button icon={<Plus size={14} />} className="upload-btn">
                  添加附件
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      </CentralizedProcurementLayout>
    </ConfigProvider>
  );
};

Component.displayName = 'ProcurementClarify';

export default Component;
