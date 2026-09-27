/**
 * @name 报名及资审汇总
 * @mode axure
 *
 * 参考资料：
 * - /rules/development-guide.md
 * - /src/components/centralized-procurement-layout/index.tsx
 * - /src/prototypes/registration-review-copy2-copy/index.tsx
 */

import React, { useState } from 'react';
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
import { Button, Input, Select, Radio, Checkbox, Table, Breadcrumb, Popover } from 'antd';
import CentralizedProcurementLayout from '../../components/centralized-procurement-layout';
import StepBar from '../../components/step-bar';
import './style.css';

// --- 静态数据 ---

interface RiskItem {
  id: string;
  type: 'intercept' | 'warning';
  tagText: string;
  content: string;
  detailLinkText?: string;
  onDetailClick?: () => void;
  rulesText?: string;
  rulesLinkText?: string;
  evidenceText?: string;
  evidenceLinkText?: string;
}

interface SupplierTag {
  text: string;
  type: 'change' | 'square' | 'risk';
  withInfo?: boolean;
  risks?: RiskItem[];
}

interface SupplierRow {
  id: number;
  name: string;
  tags: SupplierTag[];
  category: string;
  qualLevel: string;
  legalPerson: string;
  legalPhone: string;
  legalPhoneExtra?: string;
  authPerson: string;
  capital: string;
  companyType: string;
  address: string;
}

const SUPPLIERS: SupplierRow[] = [
  {
    id: 1,
    name: '钟犁sup200',
    tags: [
      { text: '变更历史', type: 'change', withInfo: true },
      { text: '圈', type: 'square' },
      { text: '本', type: 'square' },
      {
        text: '风险提醒',
        type: 'risk',
        risks: [
          {
            id: 'r1',
            type: 'intercept',
            tagText: '【拦截】',
            content: '结合招标信息及企业资质信息，系统检测到供应商缺少施工劳务资质、施工劳务不分等级(备案)资质、施工劳务不分等级（备案）资质，',
            rulesLinkText: '查看企业资质承接范围校验规则',
            evidenceText: '（校验依据：分供店铺-企业资质及第三方（建设库）',
            evidenceLinkText: '查看企业资质'
          },
          {
            id: 'r1-2',
            type: 'warning',
            tagText: '【预警】',
            content: '该分供商疑似与负面清单中的分供商存在”换马甲“嫌疑',
            detailLinkText: '查看详情'
          }
        ]
      }
    ],
    category: '[顶] 一级、5-3、5-3-1',
    qualLevel: '安全施工许可证',
    legalPerson: 'wyc',
    legalPhone: '19999999999',
    legalPhoneExtra: '变更历史',
    authPerson: '周庆勇(sup200)',
    capital: '3000万',
    companyType: '其他有限责任公司',
    address: '四川省成都市青羊区光华东三路486号3栋1单元9层913号'
  },
  {
    id: 2,
    name: '上海恒基建筑劳务有限公司',
    tags: [
      { text: '变更历史', type: 'change', withInfo: true },
      { text: '圈', type: 'square' },
      {
        text: '风险提醒',
        type: 'risk',
        risks: [
          {
            id: 'r2',
            type: 'intercept',
            tagText: '【拦截】',
            content: '结合招标信息及企业资质信息，系统检测到供应商缺少施工劳务资质，',
            rulesLinkText: '查看企业资质承接范围校验规则',
            evidenceText: '（校验依据：分供店铺-企业资质及第三方（建设库）',
            evidenceLinkText: '查看企业资质'
          }
        ]
      }
    ],
    category: '[顶] 一级、5-3、5-3-1',
    qualLevel: '--',
    legalPerson: 'sup205公司法人姓名',
    legalPhone: '17377267643',
    authPerson: 'sup205(sup205)',
    capital: '300万',
    companyType: '有限责任(自然人独资)',
    address: '海南省海口市龙华区西镇东村(苍峰路分加糖后面2排8号)'
  },
  {
    id: 3,
    name: 'sup199',
    tags: [
      {
        text: '风险提醒',
        type: 'risk',
        risks: [
          {
            id: 'r3',
            type: 'intercept',
            tagText: '【拦截】',
            content: '结合招标信息及企业资质信息，系统检测到供应商缺少施工劳务资质，',
            rulesLinkText: '查看企业资质承接范围校验规则',
            evidenceText: '（校验依据：分供店铺-企业资质及第三方（建设库）',
            evidenceLinkText: '查看企业资质'
          }
        ]
      }
    ],
    category: 'A级分类★、C级分类_瓜同样',
    qualLevel: '--',
    legalPerson: 'sup199',
    legalPhone: '19991010242',
    authPerson: '--',
    capital: '199万',
    companyType: '民营企业',
    address: '--'
  }
];

const ATTACH_SUPPORT_FORMAT =
  '.jpeg .jpg .gif .png .doc .docx .xls .xlsx .txt .pdf .rar .zip .7z .tar .jar .dwg .dws .dwt .dxf .csv';

const Component = () => {
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

  return (
    <CentralizedProcurementLayout
      username="jctest1"
      activeMenuKey="registration-review-summary"
      defaultOpenGroupKeys={['bidding-procurement']}
    >
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
                { title: <a onClick={() => setViewMode('summary')}>采购过程</a> },
                { title: <a onClick={() => setViewMode('summary')}>招标列表</a> },
                { title: <a onClick={() => setViewMode('summary')}>报名与资审汇总</a> },
                { title: '马甲检测详情页' }
              ]
        }
      />

      {/* 页面标题与操作 */}
      <div className="rrs-page-head">
        <div className="rrs-title-area">
          <span className="rrs-category-tag">物资</span>
          <h1 className="rrs-title">
            {viewMode === 'summary' ? 'qiqi-劳务分包其他类' : 'qiqi-马甲检测'}
          </h1>
        </div>
        {viewMode === 'summary' ? (
          <div className="rrs-head-actions">
            <Button type="primary" icon={<Bot size={14} />} iconPosition="end">
              一键风险解析
            </Button>
            <Button>上一步</Button>
            <Button>保存</Button>
            <Button type="primary">提交审批</Button>
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

          {/* 马甲检测详情卡片 */}
          <div className="rrs-card">
            <div className="rrs-card-head">
              <div className="rrs-card-head-left">
                <span className="rrs-title-bar" />
                <h2 className="rrs-card-title">马甲检测详情</h2>
              </div>
              <div className="rrs-card-head-right">
                <ChevronUp size={16} className="rrs-muted cursor-pointer" />
              </div>
            </div>

            <div className="rrs-vest-content">
              <div className="rrs-vest-subhead">
                当前分供商（<strong>sup202</strong>）与 <strong>1</strong> 家禁用/不良/不合格等负面行为的分供商存在关联关系，详情如下：
              </div>

              <table className="rrs-vest-native-table">
                <thead>
                  <tr>
                    <th style={{ width: 200 }} className="text-center">分供商名称</th>
                    <th style={{ width: 200 }} className="text-center">
                      “马甲”分供商 <Info size={12} className="rrs-muted inline ml-1" />
                    </th>
                    <th>
                      重叠详情 <Info size={12} className="rrs-muted inline ml-1" />
                    </th>
                    <th style={{ width: 120 }} className="text-center">管控程度</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td rowSpan={2} className="text-center font-bold text-base align-middle bg-white" style={{ borderRight: '1px solid #f0f0f0' }}>
                      sup202
                    </td>
                    <td className="text-center py-4 border-b border-gray-100">
                      <div className="text-red-500 font-medium">aaa公司</div>
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
                            <span className="rrs-node-red">xxx公司</span>
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
                            <span className="rrs-node-red">aaa公司</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td rowSpan={2} className="text-center align-middle bg-white" style={{ borderLeft: '1px solid #f0f0f0' }}>
                      <span className="text-red-500 font-medium">强管控</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-center py-4">
                      <div className="text-red-500 font-medium">bbb商贸</div>
                    <div className="text-red-500 text-xs">(邮箱信息重叠关联)</div>
                  </td>
                  <td className="py-4">
                    <div className="rrs-overlap-section">
                      <div className="rrs-overlap-summary">
                        <span className="font-semibold text-red-500">概述：</span>
                        <span className="text-red-500">检测到该供应商与多名受限供应商使用了相同的联系人邮箱地址</span>
                      </div>
                      <div className="rrs-overlap-detail">
                        <span className="font-semibold text-red-500">详情：</span>
                        <div className="rrs-flow-chart">
                          <span className="rrs-node-red">bbb商贸</span>
                          <div className="rrs-arrow-item">
                            <span className="rrs-arrow-text">重叠邮箱<br />(contact@partner-trade.com)</span>
                            <svg width="140" height="12" viewBox="0 0 140 12" className="rrs-arrow-svg">
                              <path d="M 4 6 L 136 6 M 4 6 L 11 1.5 M 4 6 L 11 10.5 M 136 6 L 129 1.5 M 136 6 L 129 10.5" stroke="#ff4d4f" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                          <span className="rrs-node-red">ccc建材 / ddd工程</span>
                        </div>
                      </div>
                    </div>
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
        <div className="rrs-side-helper">
          <div className="rrs-helper-item">
            <Headset size={18} />
            <span>联系客服</span>
          </div>
          <div className="rrs-helper-item">
            <UserCog size={18} />
            <span>权限助手</span>
          </div>
          <div className="rrs-helper-item">
            <Smartphone size={18} />
            <span>掌上作业</span>
          </div>
        </div>
      )}
    </CentralizedProcurementLayout>
  );
};

Component.displayName = 'RegistrationReviewSummary';

export default Component;
