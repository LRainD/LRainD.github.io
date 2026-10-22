/**
 * @name 过程中初次判断数据
 * @mode axure
 *
 * 参考资料：
 * - /rules/development-guide.md
 * - /src/components/centralized-procurement-layout/index.tsx
 * - /src/prototypes/registration-review-copy2-copy/index.tsx
 */

import React, { useState, useRef, useMemo } from 'react';
import {
  Bot,
  Info,
  ChevronUp,
  ChevronDown,
  Plus,
  Sparkles,
  Headset,
  UserCog,
  Smartphone,
  RefreshCw,
  CheckCircle
} from 'lucide-react';
import complianceOfficerIcon from '../../../assets/picture/数字合规官.png';
import { Button, Input, Select, Radio, Checkbox, Table, Breadcrumb, Popover } from 'antd';
import CentralizedProcurementLayout from '../../components/centralized-procurement-layout';
import StepBar from '../../components/step-bar';
import ComplianceModal, { ComplianceHandle } from '../../components/compliance-modal';
import { AIAssistantPanel } from '../../components/ai-assistant-panel';
import { SUPPLIERS, RISK_DATA, ATTACH_SUPPORT_FORMAT } from './mock';
import './style.css';

const Component = () => {
  const complianceRef = useRef<ComplianceHandle>(null);
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'summary' | 'vest-detail'>('summary');
  const [reportFormat, setReportFormat] = useState('template');
  const [publicity, setPublicity] = useState('public');
  const [autoPublish, setAutoPublish] = useState('yes');
  const [publicityOpen, setPublicityOpen] = useState(true);
  const [autoPublishOpen, setAutoPublishOpen] = useState(true);
  const [supplierName, setSupplierName] = useState('');
  const [qualifyPassed, setQualifyPassed] = useState('all');
  const [remarks, setRemarks] = useState<Record<number, string>>({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [qualifyPassedKeys, setQualifyPassedKeys] = useState<Record<number, boolean>>({});
  const [freeDepositKeys, setFreeDepositKeys] = useState<Record<number, boolean>>({});

  const riskData = useMemo(
    () =>
      RISK_DATA.map((item) =>
        item.displayIndex === 1
          ? { ...item, onDetailClick: () => setViewMode('vest-detail') }
          : item
      ),
    []
  );

  return (
    <CentralizedProcurementLayout
      username="jctest1"
      activeMenuKey="registration-review-summary"
      defaultOpenGroupKeys={['bidding-procurement']}
    >
      <ComplianceModal
        ref={complianceRef}
        showDisposalFields={false}
        showReleaseFields
        demoBranchSelect
        riskData={riskData}
      />
      {/* 面包屑 */}
      <Breadcrumb
        className="rrs-breadcrumb"
        items={
          viewMode === 'summary'
            ? [
              { title: '采购过程' },
              { title: '招标列表' },
              { title: '报名与资审汇总' }
            ]
            : [
              { title: '风控预警' },
              { title: '负面清单换马甲检测详情' }
            ]
        }
      />

      {/* 页面标题与操作 */}
      <div className="rrs-page-head">
        <div className="rrs-title-area">
          <span className="rrs-category-tag">物资</span>
          <h1 className="rrs-title">
            {viewMode === 'summary' ? 'qiqi-劳务分包其他类' : '棱镜识别“换马甲”检测”'}
          </h1>
        </div>
        {viewMode === 'summary' ? (
          <div className="rrs-head-actions">
            <Button type="primary" icon={<Bot size={14} />} iconPosition="end">
              一键风险解析
            </Button>
            <Button>上一步</Button>
            <Button>保存</Button>
            <Button type="primary" onClick={() => complianceRef.current?.startFlow()}>
              提交审批
            </Button>
            <Button type="primary" icon={<Bot size={14} />} iconPosition="end">
              并行采购响应作业
            </Button>
          </div>
        ) : (
          <div className="rrs-head-actions">
            <Button onClick={() => setViewMode('summary')}>返回汇总页</Button>
          </div>
        )}
      </div>

      {viewMode === 'vest-detail' ? (
        /* 马甲检测详情页内容 */
        <div className="rrs-vest-detail-container">
          {/* 顶栏卡片：倒计时与项目信息 */}
          <div className="rrs-card">
            <div className="rrs-info-section rrs-vest-info">
              <div className="rrs-countdown-row">
                <span className="rrs-countdown-label">距废标截止还剩：</span>
                <span className="rrs-time-box">9422</span>
                <span className="rrs-time-unit">天</span>
                <span className="rrs-time-box">23</span>
                <span className="rrs-time-unit">:</span>
                <span className="rrs-time-box">34</span>
                <span className="rrs-time-unit">:</span>
                <span className="rrs-time-box">18</span>
              </div>
              <div className="rrs-info-grid rrs-vest-grid">
                <div className="rrs-info-item">
                  招标编号：<span className="rrs-link">BBI202502240000250452</span>
                </div>
                <div className="rrs-info-item">组织机构：测试组织-股份公司</div>
                <div className="rrs-info-item">招标方式：公开招标</div>
                <div className="rrs-info-item">项目：测试20250211</div>
                <div className="rrs-info-item">品类：物资-有色金属</div>
                <div className="rrs-info-item">经办人：jctest1</div>
              </div>
            </div>
          </div>

          {/* 负面清单换马甲检测详情卡片 */}
          <div className="rrs-card">
            <div className="rrs-card-head">
              <div className="rrs-card-head-left">
                <span className="rrs-title-bar" />
                <h2 className="rrs-card-title">棱镜识别“换马甲”检测详情</h2>
              </div>
              <div className="rrs-card-head-right">
                <ChevronUp size={16} className="rrs-muted cursor-pointer" />
              </div>
            </div>

            <div className="rrs-vest-content">
              <div className="rrs-vest-subhead">
                当前分供商（<strong>sup202</strong>）与 <strong>4</strong> 家负面清单分供商存在关联关系，详情如下：
              </div>

              <table className="rrs-vest-native-table">
                <thead>
                  <tr>
                    <th style={{ width: 160 }} className="text-center">分供商名称</th>
                    <th style={{ width: 180 }} className="text-center">
                      “马甲”分供商 <Info size={12} className="rrs-muted inline ml-1" />
                    </th>
                    <th>
                      检测详情 <Info size={12} className="rrs-muted inline ml-1" />
                    </th>
                    <th style={{ width: 160 }} className="text-center">列入组织</th>
                    <th style={{ width: 180 }} className="text-center">列入原因</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td rowSpan={4} className="text-center font-bold text-base align-middle bg-white" style={{ borderRight: '1px solid #f0f0f0' }}>
                      sup202
                    </td>
                    <td className="text-center py-4 border-b border-gray-100">
                      <div className="text-red-500 font-medium">上海恒基建筑劳务有限公司</div>
                      <div className="text-red-500 text-xs">(负面清单分供商)</div>
                    </td>
                    <td className="py-4 border-b border-gray-100">
                      <div className="rrs-overlap-section">
                        <div className="rrs-overlap-summary">
                          <span className="font-semibold text-red-500">概述：</span>
                          <span className="text-red-500">分供商之间股权关系发生变更，但企业法人/董监高（含历史董监高）相同成员股权占比之和超过50%</span>
                        </div>
                        <div className="rrs-overlap-detail">
                          <span className="font-semibold text-red-500">详情：</span>
                          <div className="rrs-flow-chart">
                            <span className="rrs-node-red">sup202</span>
                            <div className="rrs-arrow-item">
                              <span className="rrs-arrow-text">50%<br />(董事长)</span>
                              <svg width="80" height="12" viewBox="0 0 80 12" className="rrs-arrow-svg">
                                <path d="M 4 6 L 76 6 M 4 6 L 11 1.5 M 4 6 L 11 10.5" stroke="#ff4d4f" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                            <span className="rrs-node-person">张三</span>
                            <div className="rrs-arrow-item">
                              <span className="rrs-arrow-text">50%<br />(法人)</span>
                              <svg width="80" height="12" viewBox="0 0 80 12" className="rrs-arrow-svg">
                                <path d="M 4 6 L 76 6 M 76 6 L 69 1.5 M 76 6 L 69 10.5" stroke="#ff4d4f" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                            <span className="rrs-node-red">上海恒基建筑劳务有限公司</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-4 border-b border-gray-100 text-gray-700">
                      中建一局第一建筑有限公司
                    </td>
                    <td className="text-center py-4 border-b border-gray-100 text-gray-700">
                      工程质量事故 / 违约退场
                    </td>
                  </tr>
                  <tr>
                    <td className="text-center py-4 border-b border-gray-100">
                      <div className="text-red-500 font-medium">北京金泰商贸有限公司</div>
                      <div className="text-red-500 text-xs">(年报邮箱信息重叠关联)</div>
                    </td>
                    <td className="py-4 border-b border-gray-100">
                      <div className="rrs-overlap-section">
                        <div className="rrs-overlap-summary">
                          <span className="font-semibold text-red-500">概述：</span>
                          <span className="text-red-500">检测到该供应商与负面清单分供商使用了相同的联系人邮箱地址</span>
                        </div>
                        <div className="rrs-overlap-detail">
                          <span className="font-semibold text-red-500">详情：</span>
                          <div className="rrs-flow-chart">
                            <span className="rrs-node-red">sup202</span>
                            <div className="rrs-arrow-item">
                              <span className="rrs-arrow-text">重叠邮箱<br />(contact@jintai-trade.com)</span>
                              <svg width="140" height="12" viewBox="0 0 140 12" className="rrs-arrow-svg">
                                <path d="M 4 6 L 136 6 M 4 6 L 11 1.5 M 4 6 L 11 10.5 M 136 6 L 129 1.5 M 136 6 L 129 10.5" stroke="#ff4d4f" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                            <span className="rrs-node-red">北京金泰商贸有限公司</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-4 border-b border-gray-100 text-gray-700">
                      中国建筑第八工程局
                    </td>
                    <td className="text-center py-4 border-b border-gray-100 text-gray-700">
                      合同纠纷
                    </td>
                  </tr>
                  <tr>
                    <td className="text-center py-4 border-b border-gray-100">
                      <div className="text-red-500 font-medium">成都科锐科技有限公司</div>
                      <div className="text-red-500 text-xs">(报名联系方式信息重叠关联)</div>
                    </td>
                    <td className="py-4 border-b border-gray-100">
                      <div className="rrs-overlap-section">
                        <div className="rrs-overlap-summary">
                          <span className="font-semibold text-red-500">概述：</span>
                          <span className="text-red-500">检测到该供应商报名时填写的联系电话与负面清单分供商注册/报名电话完全一致</span>
                        </div>
                        <div className="rrs-overlap-detail">
                          <span className="font-semibold text-red-500">详情：</span>
                          <div className="rrs-flow-chart">
                            <span className="rrs-node-red">sup202</span>
                            <div className="rrs-arrow-item">
                              <span className="rrs-arrow-text">重叠手机号<br />(138****8888)</span>
                              <svg width="140" height="12" viewBox="0 0 140 12" className="rrs-arrow-svg">
                                <path d="M 4 6 L 136 6 M 4 6 L 11 1.5 M 4 6 L 11 10.5 M 136 6 L 129 1.5 M 136 6 L 129 10.5" stroke="#ff4d4f" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                            <span className="rrs-node-red">成都科锐科技有限公司</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-4 border-b border-gray-100 text-gray-700">
                      中建交通建设集团
                    </td>
                    <td className="text-center py-4 border-b border-gray-100 text-gray-700">
                      安全生产违规
                    </td>
                  </tr>
                  <tr>
                    <td className="text-center py-4">
                      <div className="text-red-500 font-medium">广东正和建筑工程有限公司</div>
                      <div className="text-red-500 text-xs">(董监高关联)</div>
                    </td>
                    <td className="py-4">
                      <div className="rrs-overlap-section">
                        <div className="rrs-overlap-summary">
                          <span className="font-semibold text-red-500">概述：</span>
                          <span className="text-red-500">检测到该供应商的高级管理人员（监事）在负面清单分供商中同时担任董事职务</span>
                        </div>
                        <div className="rrs-overlap-detail">
                          <span className="font-semibold text-red-500">详情：</span>
                          <div className="rrs-flow-chart">
                            <span className="rrs-node-red">sup202</span>
                            <div className="rrs-arrow-item">
                              <span className="rrs-arrow-text">担任监事</span>
                              <svg width="80" height="12" viewBox="0 0 80 12" className="rrs-arrow-svg">
                                <path d="M 4 6 L 76 6 M 4 6 L 11 1.5 M 4 6 L 11 10.5" stroke="#ff4d4f" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                            <span className="rrs-node-person">李四</span>
                            <div className="rrs-arrow-item">
                              <span className="rrs-arrow-text">担任董事</span>
                              <svg width="80" height="12" viewBox="0 0 80 12" className="rrs-arrow-svg">
                                <path d="M 4 6 L 76 6 M 76 6 L 69 1.5 M 76 6 L 69 10.5" stroke="#ff4d4f" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                            <span className="rrs-node-red">广东正和建筑工程有限公司</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-4 text-gray-700">
                      中建二局第三建筑工程有限公司
                    </td>
                    <td className="text-center py-4 text-gray-700">
                      商业贿赂/不正当竞争
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* 汇总页内容 */
        <div>

          {/* 采购基本信息 */}
          <div className="rrs-card">
            <div className="rrs-info-section">
              <div className="rrs-info-grid">
                <div className="rrs-info-item">
                  采购编号：<span className="rrs-link">BBI2026092200001585800</span>
                </div>
                <div className="rrs-info-item">组织机构：新-测试二级</div>
                <div className="rrs-info-item">采购方式：竞价采购</div>
                <div className="rrs-info-item">项目：战略采购</div>
                <div className="rrs-info-item">品类：劳务分包-其他类</div>
                <div className="rrs-info-item">经办人：jctest1</div>
              </div>
              <span className="rrs-deadline">报名已截止</span>
            </div>
          </div>

          {/* 步骤条 */}
      <StepBar
        className="rrs-step-bar"
        currentMainStep="采购发起"
        currentSubStep="报名与资审汇总"
        subSteps={[
          '采购基本信息',
          '编制采购清单',
          '编制采购(资格预审)公告',
          '发布采购(资格预审)公告',
          '提交审批',
          '报名与资审汇总',
          '资审结果通知'
        ]}
        onSubStepChange={(_, step) => {
          const label = typeof step === 'string' ? step : step.label;
          if (label === '提交审批') {
            complianceRef.current?.showRiskWarning();
          }
        }}
      />

          {/* 报名与资审汇总 */}
          <div className="rrs-card">
            <div className="rrs-card-head">
              <div className="rrs-card-head-left">
                <span className="rrs-title-bar" />
                <h2 className="rrs-card-title">报名与资审汇总</h2>
                <Button type="link" size="small">查看资审合格标准</Button>
                <span className="rrs-muted">资审历时：--</span>
              </div>
              <div className="rrs-card-head-right">
                <span className="rrs-push-count">
                  已推送0家
                  <ChevronDown size={12} />
                </span>
                <Button type="link" size="small">查看推送记录</Button>
                <Button type="link" size="small">报名情况导出</Button>
                <Button type="link" size="small">附件打包下载</Button>
                <Button type="link" size="small">自动辅助资审</Button>
                <Button type="link" size="small">导入资审结果</Button>
                <Button type="primary" size="small">澄清</Button>
                <Button type="primary" size="small">答疑</Button>
              </div>
            </div>

            {/* 公告信息 */}
            <div className="rrs-announce-row">
              <div className="rrs-announce-left">
                <span>公告发布时间：2026-09-22 20:28:16</span>
                <span>已报名2家，未报名1家</span>
                <span>
                  报名截止时间：2026-09-22 20:29:00
                  <a className="rrs-link">变更</a>
                  <a className="rrs-link">查看变更记录</a>
                </span>
              </div>
              <div className="rrs-announce-right">
                <span className="rrs-inline-icon">
                  关联关系识别：支持工商关联
                  <Info size={12} />
                  、经常同时报名
                  <Info size={12} />
                </span>
                <a className="rrs-link">立即查询</a>
                <span className="rrs-muted rrs-inline-icon">
                  （剩余数量：50家11个，500家0个）
                  <Info size={12} />
                </span>
              </div>
            </div>

            {/* 信息重叠提示 */}
            <div className="rrs-overlap-row">
              <div className="rrs-overlap-left">
                <span className="rrs-overlap-label">
                  信息重叠
                  <Info size={12} />
                  ：
                </span>
                <span className="rrs-overlap-text">当前环节存在信息重叠，请查看重叠详情</span>
                <Button type="link" size="small" icon={<Info size={12} />} iconPosition="end">
                  更新信息重叠信息
                </Button>
              </div>
              <div className="rrs-overlap-right">
                <span className="rrs-inline-icon">
                  分供商报告
                  <Info size={12} />
                  ：已生成：0家 已授权：0家
                </span>
                <a className="rrs-link">查看报告数据</a>
              </div>
            </div>

            {/* 筛选区 */}
            <div className="rrs-filter-row">
              <span className="rrs-filter-label">分供商名称</span>
              <Input
                className="rrs-filter-input"
                placeholder="请输入分供商名称"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
              />
              <span className="rrs-filter-label">资格审查条件项是否通过</span>
              <Select
                className="rrs-filter-select"
                value={qualifyPassed}
                onChange={(value) => setQualifyPassed(value)}
                options={[
                  { value: 'all', label: '全部' },
                  { value: 'pass', label: '通过' },
                  { value: 'fail', label: '未通过' }
                ]}
              />
              <div className="rrs-filter-actions">
                <Button type="primary">查询</Button>
                <Button>重置</Button>
              </div>
            </div>

            {/* 供应商表格 */}
            <div className="rrs-table-wrap">
              <Table
                dataSource={SUPPLIERS}
                rowKey="id"
                pagination={false}
                size="small"
                bordered
                rowSelection={{
                  selectedRowKeys,
                  onChange: (newSelectedKeys) => setSelectedRowKeys(newSelectedKeys)
                }}
                columns={[
                  {
                    title: '序号',
                    dataIndex: 'id',
                    key: 'id',
                    width: 50,
                    align: 'center',
                    render: (_, __, index) => index + 1
                  },
                  {
                    title: '分供商',
                    dataIndex: 'name',
                    key: 'name',
                    width: 210,
                    render: (name, record) => (
                      <div className="rrs-supplier">
                        <span className="rrs-link rrs-supplier-name">{name}</span>
                        <div className="rrs-tag-row">
                          {record.tags.map((tag) => {
                            if (tag.type === 'risk' && tag.risks && tag.risks.length > 0) {
                              const popoverContent = (
                                <div className="rrs-risk-popover">
                                  <ul className="rrs-risk-list">
                                    {tag.risks.map((risk) => (
                                      <li key={risk.id} className="rrs-risk-item">
                                        <span className={`rrs-risk-tag ${risk.type === 'warning' ? 'rrs-risk-tag-warning' : 'rrs-risk-tag-intercept'}`}>
                                          {risk.tagText}
                                        </span>
                                        <span className="rrs-risk-content">{risk.content}</span>
                                        {risk.detailLinkText && (
                                          <a
                                            className="rrs-link rrs-risk-link"
                                            onClick={() => setViewMode('vest-detail')}
                                          >
                                            {risk.detailLinkText}
                                          </a>
                                        )}
                                        {risk.rulesLinkText && (
                                          <a className="rrs-link rrs-risk-link">{risk.rulesLinkText}</a>
                                        )}
                                        {risk.evidenceText && (
                                          <span className="rrs-risk-evidence">{risk.evidenceText}</span>
                                        )}
                                        {risk.evidenceLinkText && (
                                          <a className="rrs-link rrs-risk-link">{risk.evidenceLinkText}</a>
                                        )}
                                        {risk.evidenceText && <span>）</span>}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              );

                              return (
                                <Popover
                                  key={tag.text}
                                  content={popoverContent}
                                  trigger="hover"
                                  placement="topLeft"
                                  overlayClassName="rrs-risk-popover-overlay"
                                >
                                  <span className={`rrs-tag rrs-tag-${tag.type} cursor-pointer`}>
                                    {tag.text}
                                  </span>
                                </Popover>
                              );
                            }

                            return (
                              <span key={tag.text} className={`rrs-tag rrs-tag-${tag.type}`}>
                                {tag.text}
                                {tag.withInfo && <Info size={10} />}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )
                  },
                  {
                    title: (
                      <div className="rrs-th-inner">
                        <span>自定义分类</span>
                        <span className="rrs-th-refresh">
                          <RefreshCw size={11} />
                          刷新
                        </span>
                        <Info size={12} className="rrs-th-info" />
                      </div>
                    ),
                    dataIndex: 'category',
                    key: 'category',
                    width: 160
                  },
                  {
                    title: (
                      <div className="rrs-th-inner">
                        <span>资质及资质等级</span>
                        <span className="rrs-th-refresh">
                          <RefreshCw size={11} />
                          刷新
                        </span>
                        <Info size={12} className="rrs-th-info" />
                      </div>
                    ),
                    dataIndex: 'qualLevel',
                    key: 'qualLevel',
                    width: 130
                  },
                  {
                    title: '法人信息',
                    dataIndex: 'legalPerson',
                    key: 'legalPerson',
                    width: 120
                  },
                  {
                    title: '法人手机号',
                    dataIndex: 'legalPhone',
                    key: 'legalPhone',
                    width: 130,
                    render: (phone, record) => (
                      <div className="rrs-phone">
                        <span>{phone}</span>
                        {record.legalPhoneExtra && (
                          <a className="rrs-link rrs-phone-extra">{record.legalPhoneExtra}</a>
                        )}
                      </div>
                    )
                  },
                  {
                    title: '授权人信息',
                    dataIndex: 'authPerson',
                    key: 'authPerson',
                    width: 140
                  },
                  {
                    title: '注册资金（万元）',
                    dataIndex: 'capital',
                    key: 'capital',
                    width: 110,
                    align: 'center'
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
                    width: 230
                  },
                  {
                    title: '资审备注',
                    dataIndex: 'remark',
                    key: 'remark',
                    width: 170,
                    render: (_, record) => (
                      <Input
                        size="small"
                        showCount
                        maxLength={1000}
                        className="rrs-remark-input"
                        value={remarks[record.id] || ''}
                        onChange={(e) =>
                          setRemarks((prev) => ({ ...prev, [record.id]: e.target.value }))
                        }
                      />
                    )
                  },
                  {
                    title: '资审通过',
                    key: 'qualifyPassed',
                    width: 90,
                    align: 'center',
                    render: (_, record) => (
                      <Checkbox
                        checked={!!qualifyPassedKeys[record.id]}
                        onChange={(e) =>
                          setQualifyPassedKeys((prev) => ({ ...prev, [record.id]: e.target.checked }))
                        }
                      />
                    )
                  },
                  {
                    title: '操作',
                    key: 'action',
                    width: 110,
                    render: () => (
                      <Button type="link" size="small" className="rrs-qualify-btn" icon={<CheckCircle size={14} />}>
                        资格审查
                      </Button>
                    )
                  },
                  {
                    title: '免费响应保证金',
                    key: 'freeDeposit',
                    width: 130,
                    align: 'center',
                    render: (_, record) => (
                      <Checkbox
                        checked={!!freeDepositKeys[record.id]}
                        onChange={(e) =>
                          setFreeDepositKeys((prev) => ({ ...prev, [record.id]: e.target.checked }))
                        }
                      />
                    )
                  }
                ]}
              />
            </div>
          </div>

          {/* 资审报告 */}
          <div className="rrs-card">
            <div className="rrs-report-body">
              <div className="rrs-report-row">
                <div className="rrs-report-left">
                  <span className="rrs-required">*</span>
                  <span className="rrs-report-label">资审报告格式：</span>
                  <Radio.Group
                    value={reportFormat}
                    onChange={(e) => setReportFormat(e.target.value)}
                    options={[
                      { label: '范本', value: 'template' },
                      { label: '富文本', value: 'rich' }
                    ]}
                  />
                </div>
                <Button type="primary" icon={<Sparkles size={14} />}>
                  智能推荐
                  <Info size={12} style={{ marginLeft: 4 }} />
                </Button>
              </div>

              <div className="rrs-report-row">
                <div className="rrs-report-left">
                  <span className="rrs-required">*</span>
                  <span className="rrs-report-label">资审报告信息：</span>
                  <Button type="primary" size="small">去生成 &gt;&gt;</Button>
                </div>
              </div>

              <div className="rrs-report-row rrs-report-row-top">
                <div className="rrs-report-left rrs-attach-block">
                  <div className="rrs-attach-title">
                    <span className="rrs-required">*</span>
                    <span className="rrs-report-label">
                      附件（分供商不可见）
                    </span>
                  </div>
                  <div className="rrs-attach-tip">
                    <span className="rrs-muted">大小限制：500M</span>
                    <span className="rrs-muted">支持格式：{ATTACH_SUPPORT_FORMAT}</span>
                  </div>
                  <Button type="dashed" icon={<Plus size={13} />}>
                    添加附件
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* 资审公示设置 */}
          <div className="rrs-card">
            <div className="rrs-section-head" onClick={() => setPublicityOpen(!publicityOpen)}>
              <div className="rrs-card-head-left">
                <span className="rrs-title-bar" />
                <h2 className="rrs-card-title">资审公示设置</h2>
              </div>
              {publicityOpen ? (
                <ChevronUp size={18} className="rrs-chevron" />
              ) : (
                <ChevronDown size={18} className="rrs-chevron" />
              )}
            </div>
            {publicityOpen && (
              <div className="rrs-section-body">
                <span className="rrs-required">*</span>
                <span className="rrs-report-label">是否公示：</span>
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
          </div>

          {/* 自动发布资审结果设置 */}
          <div className="rrs-card rrs-card-last">
            <div className="rrs-section-head" onClick={() => setAutoPublishOpen(!autoPublishOpen)}>
              <div className="rrs-card-head-left">
                <span className="rrs-title-bar" />
                <h2 className="rrs-card-title">自动发布资审结果设置</h2>
              </div>
              {autoPublishOpen ? (
                <ChevronUp size={18} className="rrs-chevron" />
              ) : (
                <ChevronDown size={18} className="rrs-chevron" />
              )}
            </div>
            {autoPublishOpen && (
              <div className="rrs-section-body">
                <span className="rrs-required">*</span>
                <span className="rrs-report-label">是否自动发布资审结果：</span>
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
          </div>
        </div>
      )}

      {/* 右侧悬浮助手 */}
      {viewMode === 'summary' && (
        <AIAssistantPanel
          isOpen={isAIPanelOpen}
          onOpen={() => setIsAIPanelOpen(true)}
          onClose={() => setIsAIPanelOpen(false)}
          onRiskNodeClick={(nodeKey) => {
            if (nodeKey === 'registration-summary') {
              complianceRef.current?.showRiskWarning({ withInitialData: true });
            } else if (nodeKey === 'list') {
              setViewMode('summary');
            }
          }}
        />
      )}
    </CentralizedProcurementLayout>
  );
};

Component.displayName = 'RegistrationReviewSummary';

export default Component;
