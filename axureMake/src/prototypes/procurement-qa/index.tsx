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
  Radio,
  Table,
  Modal,
  Popover,
  Tooltip,
  DatePicker
} from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { ChevronDown, ChevronUp, Info, Plus, ArrowLeft } from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import CentralizedProcurementLayout from '../../components/centralized-procurement-layout';
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
  /** 是否设置提问截止时间：为「是」时才展示截止时间与自动延时 */
  const [deadlineEnabled, setDeadlineEnabled] = useState(true);
  const [questionDeadline, setQuestionDeadline] = useState<any>(null);
  // 自动延时
  const [autoDelay, setAutoDelay] = useState(false);
  const [delayDays, setDelayDays] = useState<number | null>(2);

  // 澄清列表数据
  const [clarifyDataSource, setClarifyDataSource] = useState([
    {
      key: '1',
      index: 1,
      clarifyTime: '2026-10-15 16:53:21',
      deadlineEnabled: '否',
      questionDeadline: '-',
      clarifyDesc: '23',
      attachCount: '0',
      attach: '--',
      status: '已澄清',
      action: '查看审批记录'
    },
    {
      key: '2',
      index: 2,
      clarifyTime: '2026-10-14 10:08:47',
      deadlineEnabled: '是',
      questionDeadline: '2026-10-20 18:00:00',
      clarifyDesc: '明确 HRB400E 螺纹钢的抗震性能指标要求，详见附件说明',
      attachCount: '1',
      attach: '澄清函.pdf',
      status: '已澄清',
      action: '查看审批记录'
    },
    {
      key: '3',
      index: 3,
      clarifyTime: '2026-10-13 09:32:15',
      deadlineEnabled: '否',
      questionDeadline: '-',
      clarifyDesc: '交货地点统一为天津港仓库，运输费用由采购方承担',
      attachCount: '0',
      attach: '--',
      status: '已澄清',
      action: '查看审批记录'
    },
    {
      key: '4',
      index: 4,
      clarifyTime: '2026-10-11 14:45:02',
      deadlineEnabled: '是',
      questionDeadline: '2026-10-18 12:00:00',
      clarifyDesc: '投标保证金缴纳方式调整为银行保函或电汇',
      attachCount: '2',
      attach: '保函模板.docx、付款说明.pdf',
      status: '审批中',
      action: '查看审批记录'
    }
  ]);

  // 提问列表数据
  const [askDataSource, setAskDataSource] = useState([
    {
      key: '1',
      index: 1,
      supplier: '北京中铁建材有限公司 (ACC2026001)',
      contact: '张经理 13800138000',
      askTime: '2026-04-16 09:12:45',
      askDesc: '请问HRB400E螺纹钢的抗震性能具体指标要求是怎样的？',
      attachCount: '1',
      attach: '疑问咨询函.pdf',
      status: '待回答 (限期：2026-04-18 18:00)',
      action: '回答 | 转发'
    },
    {
      key: '2',
      index: 2,
      supplier: '上海华东钢铁销售有限公司 (ACC2026002)',
      contact: '李工 13911223344',
      askTime: '2026-04-16 10:25:11',
      askDesc: '交货地点是否可以变更为天津港口仓库？',
      attachCount: '0',
      attach: '-',
      status: '已回答 (已于 2026-04-16 11:00 回答)',
      action: '查看详情'
    }
  ]);

  // 选择「有审批 / 无审批」后打开创建澄清弹窗
  const handleOpenClarify = (approval: boolean) => {
    setHasApproval(approval);
    setModeMenuOpen(false);
    setClarifyContent('');
    setDeadlineEnabled(true);
    setQuestionDeadline(null);
    setAutoDelay(false);
    setDelayDays(2);
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
      deadlineEnabled: deadlineEnabled ? '是' : '否',
      questionDeadline:
        deadlineEnabled && questionDeadline ? questionDeadline.format('YYYY-MM-DD HH:mm:ss') : '-',
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
          items={[
            { title: <span className="qa-breadcrumb-back"><ArrowLeft size={14} style={{ marginRight: 4 }} />采购列表</span> },
            { title: '澄清' }
          ]}
        />

        {/* 页面标题 + 倒计时 + 采购信息 */}
        <div className="qa-page-head">
          <div className="qa-title-area">
            <span className="qa-category-tag">物资</span>
            <h1 className="qa-title">澄清功能测试</h1>
          </div>

          <div className="qa-countdown-row">
            <span className="qa-countdown-label">距废除截止还剩：</span>
            <span className="qa-time-box">999996</span>
            <span className="qa-time-unit">天</span>
            <span className="qa-time-box">22</span>
            <span className="qa-time-unit">:</span>
            <span className="qa-time-box">32</span>
            <span className="qa-time-unit">:</span>
            <span className="qa-time-box">21</span>
          </div>

          <div className="qa-info-grid">
            <div className="qa-info-item">
              采购编号：<span className="qa-link">cscec202610150000020997</span>
            </div>
            <div className="qa-info-item">组织机构：中国建筑股份有限公司</div>
            <div className="qa-info-item">采购方式：询比采购</div>
            <div className="qa-info-item">
              项目：<span className="qa-link qa-link-inline">测试项目71704</span>
            </div>
            <div className="qa-info-item">品类：物资-钢材</div>
            <div className="qa-info-item">经办人：奥巴马</div>
          </div>
        </div>

        {/* 澄清大容器：白色底块，包裹标题栏 + 澄清列表 + 提问列表 */}
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
                    <span className="qa-section-note">所有的澄清均对所有的分供商可见</span>
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
                        { title: '是否设置提问截止时间', dataIndex: 'deadlineEnabled', key: 'deadlineEnabled', align: 'center' },
                        { title: '提问截止时间', dataIndex: 'questionDeadline', key: 'questionDeadline', align: 'center' },
                        { title: '澄清说明', dataIndex: 'clarifyDesc', key: 'clarifyDesc', align: 'center' },
                        { title: '附件数量', dataIndex: 'attachCount', key: 'attachCount', align: 'center' },
                        { title: '附件', dataIndex: 'attach', key: 'attach', align: 'center' },
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

              {/* 提问列表 */}
              <div className="qa-section">
                <div className="qa-section-head">
                  <div className="qa-section-head-left">
                    <span className="qa-title-bar" />
                    <h2 className="qa-section-title">提问列表</h2>
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
                          { title: '提问时间', dataIndex: 'askTime', key: 'askTime', width: 200, align: 'center' },
                          { title: '提问说明', dataIndex: 'askDesc', key: 'askDesc', width: 220, align: 'center' },
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
          width={680}
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
              <div className="clarify-label">是否设置提问截止时间：</div>
              <div className="clarify-control">
                <Radio.Group
                  value={deadlineEnabled}
                  onChange={(e) => setDeadlineEnabled(e.target.value)}
                >
                  <Radio value={true}>是</Radio>
                  <Radio value={false}>否</Radio>
                </Radio.Group>
              </div>
            </div>

            {deadlineEnabled && (
              <div className="clarify-form-item">
                <div className="clarify-label">提问截止时间：</div>
                <div className="clarify-control clarify-deadline-row">
                  <DatePicker
                    showTime
                    format="YYYY-MM-DD HH:mm:ss"
                    placeholder="请选择提问截止时间"
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
                        value={delayDays}
                        disabled={!autoDelay}
                        onChange={(val) => setDelayDays(val as number | null)}
                      />
                      <span className="clarify-delay-text">天</span>
                    </div>
                  )}
                  <div className="clarify-deadline-hint">
                    未设置时，分供商可在任意时间提问
                  </div>
                </div>
              </div>
            )}

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
