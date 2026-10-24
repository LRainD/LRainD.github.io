import React, { useMemo, useState } from 'react';
import { Alert, Button, Drawer, Dropdown, Input, Space, Table, Tag } from 'antd';
import { CheckOutlined, DownOutlined, EyeOutlined, QuestionCircleOutlined, SearchOutlined, StopOutlined } from '@ant-design/icons';
import type { PriceRecord } from './data';
import { useDemo } from './context';
import { Confidence, PageHeader, Surface } from './shared';

export const PriceReviewPage: React.FC = () => {
  const { prices, priceDecisions, decidePrice, setPage } = useDemo();
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [keyword, setKeyword] = useState('');
  const [detail, setDetail] = useState<PriceRecord | null>(null);
  const filtered = useMemo(() => prices.filter(item => !keyword || `${item.materialName}${item.sourceNo}${item.brand}`.includes(keyword)), [prices, keyword]);

  const columns = [
    { title: '标准物料', dataIndex: 'materialName', key: 'materialName', width: 300, render: (value: string, record: PriceRecord) => <><div><b>{value}</b></div><div className="pg-page-subtitle">{record.materialCode}</div></> },
    { title: '含税单价', dataIndex: 'unitPrice', key: 'unitPrice', width: 120, render: (value: number, record: PriceRecord) => <span className="pg-price">¥{value.toLocaleString()}/{record.unit}</span> },
    { title: '来源', dataIndex: 'source', key: 'source', width: 100, render: (value: string) => <Tag color={value === '合同' ? 'blue' : 'cyan'}>{value}</Tag> },
    { title: '来源单据', dataIndex: 'sourceNo', key: 'sourceNo', width: 150 },
    { title: '品牌', dataIndex: 'brand', key: 'brand', width: 90 },
    { title: '工程局 / 地区', key: 'org', width: 190, render: (_: unknown, record: PriceRecord) => <><div>{record.bureau}</div><div className="pg-page-subtitle">{record.region}</div></> },
    { title: '签约/中标日期', dataIndex: 'signDate', key: 'signDate', width: 130 },
    { title: 'AI 匹配置信度', dataIndex: 'confidence', key: 'confidence', width: 140, render: (value: number) => <Confidence value={value} /> },
    { title: '审核状态', key: 'decision', width: 100, render: (_: unknown, record: PriceRecord) => {
      const value = priceDecisions[record.key];
      return value ? <Tag color={value === '采用' ? 'success' : value === '存疑' ? 'warning' : 'default'}>{value}</Tag> : <Tag>待审核</Tag>;
    }},
    { title: '操作', key: 'action', width: 260, fixed: 'right' as const, render: (_: unknown, record: PriceRecord) => <Space size={2}>
      <Button type="link" icon={<CheckOutlined />} onClick={() => decidePrice([record.key], '采用')}>采用</Button>
      <Button type="link" icon={<QuestionCircleOutlined />} onClick={() => decidePrice([record.key], '存疑')}>存疑</Button>
      <Button type="link" danger icon={<StopOutlined />} onClick={() => decidePrice([record.key], '不采用')}>不采用</Button>
      <Button type="link" icon={<EyeOutlined />} onClick={() => setDetail(record)}>溯源</Button>
    </Space> }
  ];

  const applyBatch = (decision: '采用' | '存疑' | '不采用') => {
    if (!selectedKeys.length) return;
    decidePrice(selectedKeys.map(String), decision);
    setSelectedKeys([]);
  };

  return <>
    <PageHeader title="价格入库审核" subtitle="专家确认 AI 匹配的合同价与招标清单价格，异常值和低置信度记录优先处理" action={<Button onClick={() => setPage('standards')}>查看标准物料</Button>} />
    <Alert className="pg-review-note" showIcon type="info" message="价格与品牌来源优先级：合同文本 > 招标清单。跨工程局数据仅展示脱敏摘要，不开放合同原文。" />
    <div className="pg-filter-bar">
      <Input prefix={<SearchOutlined />} value={keyword} onChange={event => setKeyword(event.target.value)} placeholder="搜索物料、来源单号或品牌" allowClear style={{ minWidth: 320 }} />
      <Dropdown menu={{ items: [
        { key: '采用', label: '批量采用' }, { key: '存疑', label: '批量标记存疑' }, { key: '不采用', label: '批量不采用' }
      ], onClick: ({ key }) => applyBatch(key as '采用' | '存疑' | '不采用') }}>
        <Button disabled={!selectedKeys.length}>批量处理（{selectedKeys.length}）<DownOutlined /></Button>
      </Dropdown>
      <Space className="pg-price-summary"><span>待审核 <b>{prices.filter(item => !priceDecisions[item.key]).length}</b></span><span>异常 <b className="pg-warning">{prices.filter(item => item.abnormal).length}</b></span></Space>
    </div>
    <Surface>
      <Table
        dataSource={filtered}
        columns={columns}
        rowKey="key"
        rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys }}
        rowClassName={record => record.abnormal ? 'pg-abnormal-row' : ''}
        pagination={false}
        scroll={{ x: 1550 }}
      />
    </Surface>
    <Drawer open={Boolean(detail)} onClose={() => setDetail(null)} title="价格来源与清洗记录" size="large">
      {detail && <div className="pg-detail-list">
        <div className="pg-detail-row"><span className="pg-detail-label">来源单据</span><span>{detail.source} · {detail.sourceNo}</span></div>
        <div className="pg-detail-row"><span className="pg-detail-label">原始摘录</span><span>{detail.materialName}，品牌 {detail.brand}，含税单价 ¥{detail.unitPrice}/{detail.unit}</span></div>
        <div className="pg-detail-row"><span className="pg-detail-label">清洗动作</span><span>货币统一为人民币；计量单位统一为“{detail.unit}”；税价关系已校验</span></div>
        <div className="pg-detail-row"><span className="pg-detail-label">AI 关联</span><span>{detail.materialCode} · <Confidence value={detail.confidence} /></span></div>
        <div className="pg-detail-row"><span className="pg-detail-label">安全策略</span><span>合同名称、甲乙方及具体条款已脱敏，仅展示可用于决策的价格维度</span></div>
        {detail.abnormal && <Alert type="warning" showIcon message="该价格高于同规格近 6 个月中位价 3.2σ，建议标记存疑并补充复核。" />}
      </div>}
    </Drawer>
  </>;
};
