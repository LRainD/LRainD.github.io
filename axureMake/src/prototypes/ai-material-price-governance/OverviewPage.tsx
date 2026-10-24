import React from 'react';
import { Badge, Button, Progress, Space, Statistic, Table, Tag } from 'antd';
import { ArrowRightOutlined, DatabaseOutlined, RobotOutlined } from '@ant-design/icons';
import { pageItems, type PageKey } from './data';
import { useDemo } from './context';
import { PageHeader, Surface } from './shared';

const flowDetails = [
  ['接入数据', 'Excel / 合同 / 招标清单'],
  ['AI 拆解', '抽取规格与属性原子'],
  ['专家治理', '勾选、组装、确认'],
  ['标准建库', '映射同义词和版本'],
  ['价格入库', '专家审核权威价格'],
  ['业务应用', '投标报价与智能询价']
];

export const OverviewPage: React.FC = () => {
  const { setPage, pendingCount, standardCount, validPriceCount, tasks } = useDemo();
  const taskColumns = [
    { title: '治理任务', dataIndex: 'name', key: 'name' },
    { title: '品类', dataIndex: 'category', key: 'category', width: 90 },
    { title: '专家', dataIndex: 'assignee', key: 'assignee', width: 90 },
    {
      title: '进度', key: 'progress', width: 190,
      render: (_: unknown, record: typeof tasks[number]) => <Progress percent={Math.round(record.completed / record.total * 100)} size="small" />
    },
    { title: '状态', dataIndex: 'status', key: 'status', width: 90, render: (value: string) => <Tag color={value === '已完成' ? 'success' : value === '已逾期' ? 'error' : 'processing'}>{value}</Tag> }
  ];

  return <>
    <PageHeader title="AI 物料标准化与价格治理" subtitle="让非标物料变成可复用标准，让沉睡在合同中的价格成为询价依据" action={<Space><Button onClick={() => setPage('tasks')}>查看任务</Button><Button type="primary" icon={<DatabaseOutlined />} onClick={() => setPage('import')}>接入数据</Button></Space>} />
    <div className="pg-kpi-grid">
      <Surface className="pg-kpi"><Statistic title="已生效标准物料" value={standardCount} /><div className="pg-kpi-note"><span className="pg-positive">本月新增 436</span> · 覆盖 126 个品类</div></Surface>
      <Surface className="pg-kpi"><Statistic title="有效历史价格" value={validPriceCount} /><div className="pg-kpi-note">合同来源 72% · 招标清单 28%</div></Surface>
      <Surface className="pg-kpi"><Statistic title="待治理物料" value={pendingCount} /><div className="pg-kpi-note"><span className="pg-warning">低置信度 164 条</span> · 优先人工处理</div></Surface>
      <Surface className="pg-kpi"><Statistic title="AI 拆解准确率" value={91.6} suffix="%" precision={1} /><div className="pg-kpi-note"><span className="pg-positive">较上月 +2.8%</span> · 专家反馈持续回流</div></Surface>
    </div>

    <Surface title={<Space><RobotOutlined />业务闭环</Space>} extra={<Badge status="processing" text="试点运行中" />} style={{ marginBottom: 14 }}>
      <div className="pg-flow">
        {flowDetails.map(([label, desc], index) => {
          const target = ['import', 'import', 'governance', 'standards', 'price-review', 'inquiry'][index] as PageKey;
          return <div className="pg-flow-step" key={label} onClick={() => setPage(target)}>
            <span className="pg-flow-num">{index + 1}</span><div className="pg-flow-label">{label}</div><div className="pg-flow-desc">{desc}</div>
          </div>;
        })}
      </div>
    </Surface>

    <div className="pg-two-column">
      <Surface title="重点治理任务" extra={<Button type="link" onClick={() => setPage('tasks')}>全部任务 <ArrowRightOutlined /></Button>}>
        <Table dataSource={tasks.slice(0, 3)} columns={taskColumns} rowKey="key" pagination={false} size="small" />
      </Surface>
      <Surface title="待办提醒">
        <div className="pg-detail-list">
          <div className="pg-detail-row"><span className="pg-detail-label">价格复核</span><span className="pg-detail-value"><b>32</b> 条低置信度或异常价格待确认</span></div>
          <div className="pg-detail-row"><span className="pg-detail-label">治理逾期</span><span className="pg-detail-value"><b className="pg-warning">1</b> 个任务已超过截止时间</span></div>
          <div className="pg-detail-row"><span className="pg-detail-label">数据质量</span><span className="pg-detail-value">本周发现 18 条单位换算异常</span></div>
        </div>
        <Button type="primary" block style={{ marginTop: 16 }} onClick={() => setPage('price-review')}>立即处理价格审核</Button>
      </Surface>
    </div>
  </>;
};
