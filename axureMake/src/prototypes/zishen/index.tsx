/**
 * @name 报名及资审汇总
 *
 * 参考资料：
 * - /src/prototypes/zishen/design.md
 * - /src/components/centralized-procurement-layout/index.tsx
 * - /src/components/step-bar/index.tsx
 */

import React, { useMemo, useState } from 'react';
import {
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  List,
  ListOrdered,
  Image as ImageIcon,
  Link2,
  Table2,
  Undo2,
  Redo2,
  Highlighter,
  Palette,
  FileCheck2,
  X,
  Plus,
  Settings2,
  FileSpreadsheet,
  Bot
} from 'lucide-react';
import { Breadcrumb, Button, Checkbox, ConfigProvider, Input, Radio, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import CentralizedProcurementLayout from '../../components/centralized-procurement-layout';
import StepBar from '../../components/step-bar';
import { ATTACH_SUPPORT_FORMAT, SUPPLIER_ROWS, SupplierRow } from './mock';
import './style.css';

const MAIN_STEPS = ['采购发起', '采购响应', '文件开启', '采购评审', '采购成交'];

const SUB_STEPS = [
  '采购基本信息',
  '编制采购清单',
  '编制采购(资格预审)公告',
  '发布采购(资格预审)公告',
  '报名与资审汇总',
  '资审结果通知'
];

const TOOLBAR_GROUPS: { icon: React.ReactNode; label: string }[][] = [
  [
    { icon: <Bold size={14} />, label: '加粗' },
    { icon: <Italic size={14} />, label: '斜体' },
    { icon: <Underline size={14} />, label: '下划线' },
    { icon: <Strikethrough size={14} />, label: '删除线' }
  ],
  [
    { icon: <AlignLeft size={14} />, label: '左对齐' },
    { icon: <AlignCenter size={14} />, label: '居中' },
    { icon: <List size={14} />, label: '无序列表' },
    { icon: <ListOrdered size={14} />, label: '有序列表' }
  ],
  [
    { icon: <ImageIcon size={14} />, label: '插入图片' },
    { icon: <Link2 size={14} />, label: '插入链接' },
    { icon: <Table2 size={14} />, label: '插入表格' }
  ],
  [
    { icon: <Palette size={14} />, label: '字体颜色' },
    { icon: <Highlighter size={14} />, label: '背景色' }
  ],
  [
    { icon: <Undo2 size={14} />, label: '撤销' },
    { icon: <Redo2 size={14} />, label: '重做' }
  ]
];

const Component = () => {
  const [reportFormat, setReportFormat] = useState('template');
  const [remarkValues, setRemarkValues] = useState<Record<number, string>>({});
  const [qualifyPassedKeys, setQualifyPassedKeys] = useState<React.Key[]>(
    SUPPLIER_ROWS.filter((row) => row.qualified).map((row) => row.key)
  );
  const [freeDepositKeys, setFreeDepositKeys] = useState<React.Key[]>([]);
  const [publicity, setPublicity] = useState('private');
  const [autoPublish, setAutoPublish] = useState('no');
  const [publicityOpen, setPublicityOpen] = useState(true);
  const [autoPublishOpen, setAutoPublishOpen] = useState(true);
  const [recommendOpen, setRecommendOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [supplierName, setSupplierName] = useState('');

  const dataSource = useMemo(
    () => SUPPLIER_ROWS.filter((row) => row.name.includes(supplierName.trim())),
    [supplierName]
  );

  const columns: ColumnsType<SupplierRow> = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 52,
      align: 'center',
      onCell: () => ({ className: 'zsn-cell-center' })
    },
    {
      title: (
        <span className="zsn-th-with-arrow">
          分供商
          <ChevronDown size={12} />
        </span>
      ),
      dataIndex: 'name',
      key: 'name',
      width: 220,
      render: (_, record) => (
        <div className="zsn-supplier">
          <div className="zsn-supplier-main">
            <a className="zsn-link zsn-supplier-name">{record.name}</a>
            <div className="zsn-tag-row">
              {record.nameTags.map((tag) => (
                <span key={tag.text} className={`zsn-tag zsn-tag-${tag.type}`}>
                  {tag.text}
                  {tag.withInfo && <Info size={10} />}
                </span>
              ))}
            </div>
          </div>
          {record.subTags.length > 0 && (
            <div className="zsn-tag-row zsn-sub-tag-row">
              {record.subTags.map((tag) => (
                <span key={tag.text} className={`zsn-tag zsn-tag-${tag.type}`}>
                  {tag.text}
                </span>
              ))}
            </div>
          )}
        </div>
      )
    },
    {
      title: '公司性质',
      dataIndex: 'companyType',
      key: 'companyType',
      width: 140
    },
    {
      title: '注册地址',
      dataIndex: 'address',
      key: 'address',
      width: 220
    },
    {
      title: '管理员账号',
      dataIndex: 'adminAccount',
      key: 'adminAccount',
      width: 104
    },
    {
      title: '联系人',
      dataIndex: 'contact',
      key: 'contact',
      width: 92
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 124
    },
    {
      title: '报名状态',
      dataIndex: 'status',
      key: 'status',
      width: 84
    },
    {
      title: '签收/报名时间',
      key: 'time',
      width: 152,
      render: (_, record) =>
        record.status === '已报名' ? (
          <div className="zsn-time-cell">
            <span>报名时间：</span>
            <span>{record.applyTime}</span>
          </div>
        ) : (
          <div className="zsn-time-cell">
            <span>签收公告时间：</span>
            <span>{record.signTime}</span>
          </div>
        )
    },
    {
      title: '报名IP',
      key: 'ip',
      width: 150,
      render: (_, record) => (
        <div className="zsn-time-cell">
          {record.status === '已报名' ? (
            <>
              <span>
                签收公告：<span className="zsn-ip">{record.ackIp}</span>
              </span>
              <span>
                报名：<span className="zsn-ip">{record.applyIp}</span>
              </span>
            </>
          ) : (
            <span>
              签收公告：<span className="zsn-ip">{record.ackIp}</span>
            </span>
          )}
        </div>
      )
    },
    {
      title: '报名附件',
      key: 'attach',
      width: 120,
      render: (_, record) =>
        record.attachText === '未上传' ? (
          <span className="zsn-muted">{record.attachText}</span>
        ) : (
          <a className="zsn-link">{record.attachText}</a>
        )
    },
    {
      title: '资审备注',
      key: 'remark',
      width: 150,
      onCell: (record) =>
        record.status === '已报名' ? { className: 'zsn-cell-highlight' } : {},
      render: (_, record) => (
        <Input.TextArea
          className="zsn-remark-input"
          autoSize={{ minRows: 1, maxRows: 3 }}
          showCount
          maxLength={record.remarkMax ?? 1000}
          value={remarkValues[record.key] ?? record.remark ?? ''}
          onChange={(e) =>
            setRemarkValues((prev) => ({ ...prev, [record.key]: e.target.value }))
          }
        />
      )
    },
    {
      title: (
        <span className="zsn-th-inline">
          资审通过
          <Info size={12} className="zsn-th-info" />
        </span>
      ),
      key: 'qualified',
      width: 92,
      align: 'center',
      onCell: (record) =>
        record.status === '已报名' ? { className: 'zsn-cell-highlight' } : {},
      render: (_, record) => (
        <Checkbox
          className="zsn-checkbox"
          checked={qualifyPassedKeys.includes(record.key)}
          onChange={(e) =>
            setQualifyPassedKeys((prev) =>
              e.target.checked ? [...prev, record.key] : prev.filter((key) => key !== record.key)
            )
          }
        />
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 64,
      align: 'center',
      onCell: (record) =>
        record.status === '已报名' ? { className: 'zsn-cell-highlight' } : {},
      render: () => (
        <Tooltip title="资格审查">
          <button type="button" className="zsn-icon-btn">
            <FileCheck2 size={14} />
          </button>
        </Tooltip>
      )
    },
    {
      title: (
        <span className="zsn-th-inline zsn-th-wrap">
          免费响应保证金
          <Info size={12} className="zsn-th-info" />
        </span>
      ),
      key: 'freeDeposit',
      width: 118,
      align: 'center',
      onCell: (record) =>
        record.status === '已报名' ? { className: 'zsn-cell-highlight' } : {},
      render: (_, record) => (
        <Checkbox
          className="zsn-checkbox"
          checked={freeDepositKeys.includes(record.key)}
          onChange={(e) =>
            setFreeDepositKeys((prev) =>
              e.target.checked ? [...prev, record.key] : prev.filter((key) => key !== record.key)
            )
          }
        />
      )
    }
  ];

  const renderToolbar = () =>
    TOOLBAR_GROUPS.map((group, groupIndex) => (
      <React.Fragment key={groupIndex}>
        <div className="zsn-editor-group">
          {group.map((item) => (
            <Tooltip key={item.label} title={item.label}>
              <button type="button" className="zsn-editor-btn">
                {item.icon}
              </button>
            </Tooltip>
          ))}
        </div>
        {groupIndex < TOOLBAR_GROUPS.length - 1 && <span className="zsn-editor-divider" />}
      </React.Fragment>
    ));

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#0081cc',
          borderRadius: 2,
          fontSize: 12
        }
      }}
    >
      <CentralizedProcurementLayout
        username="奥巴马"
        activeMenuKey="procurement-list"
        defaultOpenGroupKeys={['bidding-procurement']}
        orgName="测试组织-股份公司"
      >
        <Breadcrumb
          className="zsn-breadcrumb"
          items={[{ title: '采购列表' }, { title: '报名及资审汇总' }]}
        />

        {/* 标题与操作 */}
        <div className="zsn-page-head">
          <div className="zsn-title-area">
            <span className="zsn-title-tag">询比</span>
            <h1 className="zsn-title">新建竞价采购</h1>
          </div>
          <div className="zsn-head-actions">
            <a className="zsn-head-tip">报价分项表太少，点击看看智能推荐分供商 &gt;&gt;</a>
            <Button type="primary" className="zsn-btn-risk" icon={<Bot size={14} />} iconPosition="end">
              一键风险解析
            </Button>
            <Button>上一步</Button>
            <Button>保存</Button>
            <Button type="primary">提交审批</Button>
            <Button type="primary" icon={<Bot size={14} />} iconPosition="end">
              并行采购响应作业
            </Button>
          </div>
        </div>

        {/* 截止时间与采购信息 */}
        <section className="zsn-card zsn-info-card">
          <div className="zsn-countdown-row">
            <span className="zsn-countdown-label">距离截止还剩：</span>
            <span className="zsn-time-box">999933</span>
            <span className="zsn-time-unit">天</span>
            <span className="zsn-time-box">23</span>
            <span className="zsn-time-unit">:</span>
            <span className="zsn-time-box">40</span>
            <span className="zsn-time-unit">:</span>
            <span className="zsn-time-box">41</span>
            <span className="zsn-deadline">报名已截止</span>
          </div>
          <div className="zsn-info-grid">
            <div className="zsn-info-item">
              采购编号：<span className="zsn-strong">cscec202608210000063225</span>
            </div>
            <div className="zsn-info-item">组织机构：中国建筑股份有限公司</div>
            <div className="zsn-info-item">采购方式：竞价采购</div>
            <div className="zsn-info-item">项目：测试项目89193</div>
            <div className="zsn-info-item">品类：物资-钢材</div>
            <div className="zsn-info-item">经办人：奥巴马</div>
            <div className="zsn-info-item" />
            <div className="zsn-info-item" />
          </div>
        </section>

        {/* 流程步骤条 */}
        <StepBar
          className="zsn-step-bar"
          mainSteps={MAIN_STEPS}
          currentMainStep="采购发起"
          subSteps={SUB_STEPS}
          currentSubStep="报名与资审汇总"
        />

        {/* 报名与资审汇总 */}
        <section className="zsn-card">
          <div className="zsn-card-head">
            <div className="zsn-card-head-left">
              <span className="zsn-title-bar" />
              <h2 className="zsn-card-title">报名与资审汇总</h2>
              <span className="zsn-card-sub">资审历时：--</span>
            </div>
            <div className="zsn-card-head-right">
              <span className="zsn-push-count">
                已推送0家
                <ChevronDown size={12} />
              </span>
              <a className="zsn-link">查看推送记录</a>
              <a className="zsn-link">报名情况导出</a>
              <a className="zsn-link">附件打包下载</a>
              <a className="zsn-link">自动辅助资审</a>
              <a className="zsn-link">导入资审结果</a>
              <Button type="primary" size="small" className="zsn-btn-sm">
                澄清
              </Button>
              <Button type="primary" size="small" className="zsn-btn-sm">
                答疑
              </Button>
              <button
                type="button"
                className="zsn-collapse-btn"
                onClick={() => setSummaryOpen((prev) => !prev)}
              >
                {summaryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          </div>

          {summaryOpen && (
            <>
              {/* 公告信息 */}
              <div className="zsn-announce-row">
                <div className="zsn-announce-left">
                  <span>公告发布时间：2026-08-21 17:28:31</span>
                  <span>已报名4家，未报名1家</span>
                  <span className="zsn-announce-deadline">
                    报名截止时间：2026-08-21 17:29:04
                    <a className="zsn-link">变更</a>
                    <a className="zsn-link">查看变更记录</a>
                  </span>
                </div>
                <div className="zsn-announce-right">
                  <span className="zsn-calc-item">
                    工商关联
                    <Info size={12} className="zsn-th-info" />
                    <span className="zsn-calc-status">数据计算中</span>
                  </span>
                  <span className="zsn-calc-sep">·</span>
                  <span className="zsn-calc-item">
                    经常同时报名
                    <Info size={12} className="zsn-th-info" />
                    <span className="zsn-calc-status">数据计算中</span>
                  </span>
                </div>
              </div>

              {/* 信息重叠提示 */}
              <div className="zsn-overlap-row">
                <div className="zsn-overlap-left">
                  <span className="zsn-overlap-label">
                    信息重叠
                    <Info size={12} className="zsn-th-info" />：
                  </span>
                  <span className="zsn-overlap-text">当前环节存在信息重叠，请查看重叠详情</span>
                  <a className="zsn-link">更新信息重叠信息</a>
                  <Info size={12} className="zsn-th-info" />
                </div>
                <div className="zsn-overlap-right">
                  <span>
                    分供商报告
                    <Info size={12} className="zsn-th-info" />：已生成：0家 已授权：0家
                  </span>
                  <a className="zsn-link">查看报告数据</a>
                  <span className="zsn-overlap-divider" />
                  <a className="zsn-link zsn-export-link">
                    导出资审结果表
                    <Info size={12} className="zsn-th-info" />
                  </a>
                </div>
              </div>

              {/* 筛选 */}
              <div className="zsn-filter-row">
                <span className="zsn-filter-label">分供商名称</span>
                <Input
                  className="zsn-filter-input"
                  placeholder="请输入分供商名称"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                />
                <Button type="primary">查询</Button>
                <Button onClick={() => setSupplierName('')}>重置</Button>
              </div>

              {/* 表格 */}
              <div className="zsn-table-tools">
                <Tooltip title="表格设置">
                  <button type="button" className="zsn-icon-btn">
                    <Settings2 size={14} />
                  </button>
                </Tooltip>
              </div>
              <div className="zsn-table-wrap">
                <Table<SupplierRow>
                  className="zsn-table"
                  columns={columns}
                  dataSource={dataSource}
                  pagination={false}
                  size="small"
                  bordered
                  scroll={{ x: 1800 }}
                  rowClassName={(record) =>
                    record.status === '未报名' ? 'zsn-row-unregistered' : ''
                  }
                />
              </div>
            </>
          )}
        </section>

        {/* 云筑分供商推荐 */}
        <section className="zsn-card">
          <div className="zsn-section-head" onClick={() => setRecommendOpen((prev) => !prev)}>
            <div className="zsn-card-head-left">
              <span className="zsn-title-bar" />
              <h2 className="zsn-card-title">云筑分供商推荐</h2>
            </div>
            {recommendOpen ? (
              <ChevronUp size={16} className="zsn-chevron" />
            ) : (
              <ChevronDown size={16} className="zsn-chevron" />
            )}
          </div>
          {recommendOpen && (
            <div className="zsn-empty-block">
              <FileSpreadsheet size={20} className="zsn-th-info" />
              <span className="zsn-muted">暂无推荐分供商</span>
            </div>
          )}
        </section>

        {/* 资审报告 */}
        <section className="zsn-card">
          <div className="zsn-report-body">
            <div className="zsn-report-row">
              <div className="zsn-report-left">
                <span className="zsn-required">*</span>
                <span className="zsn-report-label">资审报告格式：</span>
                <Radio.Group
                  value={reportFormat}
                  onChange={(e) => setReportFormat(e.target.value)}
                  options={[
                    { label: '范本', value: 'template' },
                    { label: '富文本', value: 'rich' }
                  ]}
                />
              </div>
              <button type="button" className="zsn-smart-btn">
                <Sparkles size={13} />
                智能推荐
              </button>
            </div>

            <div className="zsn-report-row zsn-report-editor-row">
              <div className="zsn-report-left">
                <span className="zsn-required">*</span>
                <span className="zsn-report-label">资审报告信息：</span>
              </div>
            </div>

            <div className="zsn-editor">
              <div className="zsn-editor-toolbar">
                {renderToolbar()}
                <span className="zsn-editor-divider" />
                <span className="zsn-editor-select">Arial</span>
                <span className="zsn-editor-select">16px</span>
                <span className="zsn-editor-select">段落</span>
                <span className="zsn-editor-divider" />
                <span className="zsn-editor-select">自定义样式</span>
              </div>
              <div className="zsn-editor-content">中建qp环境专用富文本</div>
            </div>

            <div className="zsn-attach-block">
              <div className="zsn-attach-title">
                <span className="zsn-required">*</span>
                <span className="zsn-report-label">附件（分供商不可见）</span>
              </div>
              <div className="zsn-attach-tip">
                <span>大小限制：500M</span>
                <span>支持格式：{ATTACH_SUPPORT_FORMAT}</span>
              </div>
              <div className="zsn-file-chip">
                <span className="zsn-file-chip-text">【公告】五环路(双流段)PPP项目施工工...</span>
                <button type="button" className="zsn-file-chip-close">
                  <X size={12} />
                </button>
              </div>
              <Button type="default" className="zsn-add-attach" icon={<Plus size={13} />}>
                添加附件
              </Button>
            </div>
          </div>
        </section>

        {/* 资审公示设置 */}
        <section className="zsn-card">
          <div className="zsn-section-head" onClick={() => setPublicityOpen((prev) => !prev)}>
            <div className="zsn-card-head-left">
              <span className="zsn-title-bar" />
              <h2 className="zsn-card-title">资审公示设置</h2>
            </div>
            {publicityOpen ? (
              <ChevronUp size={16} className="zsn-chevron" />
            ) : (
              <ChevronDown size={16} className="zsn-chevron" />
            )}
          </div>
          {publicityOpen && (
            <div className="zsn-section-body">
              <span className="zsn-required">*</span>
              <span className="zsn-report-label">是否公示：</span>
              <Radio.Group
                value={publicity}
                onChange={(e) => setPublicity(e.target.value)}
                options={[
                  { label: '公示', value: 'public' },
                  { label: '不公示', value: 'private' }
                ]}
              />
            </div>
          )}
        </section>

        {/* 自动发布资审结果设置 */}
        <section className="zsn-card zsn-card-last">
          <div className="zsn-section-head" onClick={() => setAutoPublishOpen((prev) => !prev)}>
            <div className="zsn-card-head-left">
              <span className="zsn-title-bar" />
              <h2 className="zsn-card-title">自动发布资审结果设置</h2>
            </div>
            {autoPublishOpen ? (
              <ChevronUp size={16} className="zsn-chevron" />
            ) : (
              <ChevronDown size={16} className="zsn-chevron" />
            )}
          </div>
          {autoPublishOpen && (
            <div className="zsn-section-body">
              <span className="zsn-required">*</span>
              <span className="zsn-report-label">是否自动发布资审结果：</span>
              <Radio.Group
                value={autoPublish}
                onChange={(e) => setAutoPublish(e.target.value)}
                options={[
                  { label: '是', value: 'yes' },
                  { label: '否', value: 'no' }
                ]}
              />
            </div>
          )}
        </section>
      </CentralizedProcurementLayout>
    </ConfigProvider>
  );
};

Component.displayName = 'ZishenRegistrationSummary';

export default Component;
