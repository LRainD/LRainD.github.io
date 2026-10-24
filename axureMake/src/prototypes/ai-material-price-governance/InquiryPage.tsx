import React, { useState } from 'react';
import { Alert, Button, Checkbox, Input, Select, Space, Table, Tag, message } from 'antd';
import { DownloadOutlined, ExperimentOutlined, FilterOutlined, SendOutlined } from '@ant-design/icons';
import { inquirySeed } from './data';
import { useDemo } from './context';
import { Confidence, PageHeader, Surface } from './shared';

type InquiryRow = {
  key: string;
  sourceName: string;
  standardName: string;
  confidence: number;
  quantity: string;
  range: string;
  median: string;
  samples: number;
  status: '已匹配' | '待治理';
};

const results: InquiryRow[] = [
  { key: '1', sourceName: 'HRB400E抗震螺纹钢 Φ25', standardName: 'HRB400E 热轧带肋抗震钢筋 Φ25mm', confidence: 97, quantity: '120 吨', range: '¥3,760–3,980/吨', median: '¥3,868/吨', samples: 28, status: '已匹配' },
  { key: '2', sourceName: 'P.O42.5普通硅酸盐水泥', standardName: 'P.O 42.5 普通硅酸盐水泥', confidence: 95, quantity: '800 吨', range: '¥438–486/吨', median: '¥466/吨', samples: 51, status: '已匹配' },
  { key: '3', sourceName: '精装修客房吊顶轻钢龙骨', standardName: '-', confidence: 48, quantity: '3,200 ㎡', range: '-', median: '-', samples: 0, status: '待治理' }
];

export const InquiryPage: React.FC = () => {
  const { submitUnmatched } = useDemo();
  const [content, setContent] = useState(inquirySeed);
  const [parsed, setParsed] = useState(false);
  const [region, setRegion] = useState('华中地区');
  const [period, setPeriod] = useState('近6个月');
  const [onlyWinning, setOnlyWinning] = useState(false);

  const columns = [
    { title: '询价物料', dataIndex: 'sourceName', key: 'sourceName', width: 240, render: (value: string, record: InquiryRow) => <><b>{value}</b><div className="pg-page-subtitle">数量：{record.quantity}</div></> },
    { title: '匹配标准物料', dataIndex: 'standardName', key: 'standardName', width: 310 },
    { title: '匹配度', dataIndex: 'confidence', key: 'confidence', width: 120, render: (value: number) => <Confidence value={value} /> },
    { title: '参考价区间', dataIndex: 'range', key: 'range', width: 170, render: (value: string) => <span className="pg-range">{value}</span> },
    { title: '中位参考价', dataIndex: 'median', key: 'median', width: 140 },
    { title: '价格分布', key: 'distribution', width: 150, render: (_: unknown, record: InquiryRow) => record.samples ? <div className="pg-distribution" title={`${record.samples} 条脱敏历史样本`}>{[12, 18, 25, 20, 28, 16, 22, 14].map((height, index) => <span key={index} className="pg-dot" style={{ height }} />)}</div> : '-' },
    { title: '样本', dataIndex: 'samples', key: 'samples', width: 80, render: (value: number) => value ? `${value} 条` : '-' },
    { title: '状态', dataIndex: 'status', key: 'status', width: 90, render: (value: string) => <Tag color={value === '已匹配' ? 'success' : 'warning'}>{value}</Tag> },
    { title: '操作', key: 'action', width: 120, render: (_: unknown, record: InquiryRow) => record.status === '待治理' ? <Button type="link" icon={<SendOutlined />} onClick={submitUnmatched}>提交治理</Button> : <Button type="link" onClick={() => message.info('已展开 5 条脱敏历史价格样本')}>查看样本</Button> }
  ];

  return <>
    <PageHeader title="智能询价" subtitle="输入非标询价清单，AI 自动匹配标准物料及真实历史签约价格，未匹配项回流治理" action={<Button icon={<DownloadOutlined />} disabled={!parsed} onClick={() => message.success('询价参考单已生成')}>导出参考单</Button>} />
    <div className="pg-two-column">
      <Surface title="询价清单" extra={<Tag color="blue">支持粘贴 / Excel</Tag>}>
        <Input.TextArea className="pg-inquiry-input" value={content} onChange={event => setContent(event.target.value)} placeholder="每行输入一条物料描述，可附带数量与单位" />
        <Space style={{ marginTop: 12 }}><Button onClick={() => setContent(inquirySeed)}>载入演示清单</Button><Button type="primary" icon={<ExperimentOutlined />} onClick={() => { setParsed(true); message.success('已识别 3 条物料，2 条完成标准匹配'); }}>AI 解析并匹配</Button></Space>
      </Surface>
      <Surface title={<Space><FilterOutlined />参考范围</Space>}>
        <Space direction="vertical" style={{ width: '100%' }} size={12}>
          <Select value={region} onChange={setRegion} style={{ width: '100%' }} options={['华中地区', '全国', '河南省', '湖北省', '湖南省'].map(value => ({ value, label: `区域：${value}` }))} />
          <Select value={period} onChange={setPeriod} style={{ width: '100%' }} options={['近3个月', '近6个月', '近1年', '近3年'].map(value => ({ value, label: `时间：${value}` }))} />
          <Select defaultValue="跨局脱敏参考" style={{ width: '100%' }} options={[{ value: '跨局脱敏参考', label: '工程局：跨局脱敏参考' }, { value: '仅本局', label: '工程局：仅本局' }]} />
          <Checkbox checked={onlyWinning} onChange={event => setOnlyWinning(event.target.checked)}>只看中标价</Checkbox>
        </Space>
      </Surface>
    </div>

    {parsed ? <>
      <Alert showIcon type="success" message={`匹配范围：${region} · ${period}${onlyWinning ? ' · 仅中标价' : ' · 合同价优先'}。价格为脱敏参考区间，不展示具体合同条款。`} style={{ marginBottom: 12 }} />
      <div className="pg-result-summary"><div>清单数量<br /><b>3 条</b></div><div>成功匹配<br /><b className="pg-positive">2 条 · 66.7%</b></div><div>待治理<br /><b className="pg-warning">1 条</b></div></div>
      <Surface><Table dataSource={results} columns={columns} rowKey="key" pagination={false} scroll={{ x: 1350 }} /></Surface>
    </> : <Surface><div className="pg-empty-action"><ExperimentOutlined style={{ fontSize: 32, color: '#9aa4ad' }} /><h3>等待解析询价清单</h3><p className="pg-page-subtitle">AI 将完成物料识别、标准匹配、历史价格筛选与参考区间计算</p></div></Surface>}
  </>;
};
