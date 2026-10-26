/**
 * 物料映射（二级菜单 `material-mapping`）。
 *
 * 为什么要有这一页：历史招标清单里的物料是当年的写法，和标准物料对不上，
 * 这批成交价就只能在库里躺着。经办人在这里把「历史清单项」挂到「标准物料」上，
 * 历史价格才归到标准口径，价格分析与智能询价才用得上。
 *
 * 不画流程图，直接给一张招标列表：一眼看到哪个项目还没映射、映射到几成、能放出多少历史价格。
 */
import React, { useMemo, useState } from 'react';
import { Button, Input, Segmented, Select, Space, Table, Tag, Tooltip } from 'antd';
import { ArrowRightOutlined, BranchesOutlined, LinkOutlined, SearchOutlined } from '@ant-design/icons';
import { useDemo } from './context';
import { PageHeader, Surface } from './shared';
import {
  bidProjects,
  overallStats,
  projectStats,
  projectStatusOf,
  projectStatusText,
  type BidProject
} from './mapping';

const money = (value: number) =>
  value.toLocaleString('zh-CN', { maximumFractionDigits: 0 });

/** 金额到万就换单位，表里塞不下 12 位数字 */
const compactMoney = (value: number) =>
  value >= 10000 ? `${(value / 10000).toLocaleString('zh-CN', { maximumFractionDigits: 1 })} 万元` : `${money(value)} 元`;

const Progress: React.FC<{ done: number; total: number; pending: number; fresh: number }> = ({
  done,
  total,
  pending,
  fresh
}) => {
  const percent = (value: number) => (total ? Math.round((value / total) * 100) : 0);
  return (
    <div className="mp-progress">
      <div className="mp-bar">
        <span className="mp-bar-done" style={{ width: `${percent(done)}%` }} />
        <span className="mp-bar-fresh" style={{ width: `${percent(fresh)}%` }} />
        <span className="mp-bar-pending" style={{ width: `${percent(pending)}%` }} />
      </div>
      <div className="mp-progress-text">
        <b>{done + fresh}</b>/{total} 条
        {pending > 0 && <span className="mp-progress-pending">· 待复核 {pending}</span>}
        {fresh > 0 && <span className="mp-progress-fresh">· 转治理 {fresh}</span>}
      </div>
    </div>
  );
};

export const MappingPage: React.FC = () => {
  const { mapping, openBidProject } = useDemo();
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<'all' | 'todo' | 'doing' | 'done'>('all');
  const [year, setYear] = useState('all');

  const stats = useMemo(() => overallStats(mapping), [mapping]);

  const rows = useMemo(
    () =>
      bidProjects
        .map(project => ({
          project,
          stats: projectStats(project, mapping),
          status: projectStatusOf(project, mapping)
        }))
        .filter(row => {
          if (status !== 'all' && row.status !== status) return false;
          if (year !== 'all' && !row.project.openDate.startsWith(year)) return false;
          if (!keyword.trim()) return true;
          const text = `${row.project.code}${row.project.name}${row.project.bureau}${row.project.region}${row.project.category}`;
          return text.includes(keyword.trim());
        }),
    [mapping, status, year, keyword]
  );

  const counts = useMemo(() => {
    const base = { todo: 0, doing: 0, done: 0 };
    bidProjects.forEach(project => {
      base[projectStatusOf(project, mapping)] += 1;
    });
    return base;
  }, [mapping]);

  const columns = [
    {
      title: '招标编号',
      key: 'code',
      width: 132,
      render: (_: unknown, row: { project: BidProject }) => (
        <span className="mp-code">{row.project.code}</span>
      )
    },
    {
      title: '招标项目',
      key: 'name',
      width: 292,
      render: (_: unknown, row: { project: BidProject }) => (
        <div className="mp-project">
          <div className="mp-project-name">{row.project.name}</div>
          <div className="mp-project-meta">
            <Tag className="mp-cat">{row.project.category}</Tag>
            <span>{row.project.region}</span>
            <span>{row.project.type}</span>
          </div>
        </div>
      )
    },
    { title: '采购组织', key: 'bureau', width: 92, render: (_: unknown, row: { project: BidProject }) => row.project.bureau },
    { title: '开标日期', key: 'date', width: 106, render: (_: unknown, row: { project: BidProject }) => row.project.openDate },
    {
      title: '清单条数',
      key: 'total',
      width: 92,
      align: 'right' as const,
      render: (_: unknown, row: { stats: ReturnType<typeof projectStats> }) => (
        <span className="mp-num">
          <b>{row.stats.total}</b> 条
        </span>
      )
    },
    {
      title: '映射进度',
      key: 'progress',
      width: 188,
      render: (_: unknown, row: { stats: ReturnType<typeof projectStats> }) => (
        <Progress done={row.stats.done} total={row.stats.total} pending={row.stats.pending} fresh={row.stats.newMaterial} />
      )
    },
    {
      title: '可复用历史价',
      key: 'reusable',
      width: 132,
      render: (_: unknown, row: { stats: ReturnType<typeof projectStats> }) =>
        row.stats.reusable ? (
          <Tooltip title={`已确认映射 ${row.stats.reusable} 条，涉及金额 ${compactMoney(row.stats.amount)}`}>
            <span className="mp-reuse">
              <LinkOutlined />
              {row.stats.reusable} 条
              <em>{compactMoney(row.stats.amount)}</em>
            </span>
          </Tooltip>
        ) : (
          <span className="mp-muted">—</span>
        )
    },
    {
      title: '状态',
      key: 'status',
      width: 104,
      render: (_: unknown, row: { status: keyof typeof projectStatusText; stats: ReturnType<typeof projectStats> }) =>
        row.status === 'done' ? (
          <Tag color="success">已映射</Tag>
        ) : row.status === 'doing' ? (
          <Tag color="processing">映射中</Tag>
        ) : (
          <Tag>待映射</Tag>
        )
    },
    {
      title: '操作',
      key: 'action',
      width: 108,
      fixed: 'right' as const,
      render: (_: unknown, row: { project: BidProject; status: keyof typeof projectStatusText }) => (
        <Button type="link" size="small" onClick={() => openBidProject(row.project.key)}>
          {row.status === 'done' ? '查看' : '映射'}
          <ArrowRightOutlined />
        </Button>
      )
    }
  ];

  return (
    <>
      <PageHeader
        title="物料映射"
        subtitle="把历史招标清单里的非标物料挂到标准物料上，历史成交价才能按标准口径被价格分析与智能询价复用"
        action={
          <Space size={8}>
            {stats.pending > 0 && <Tag color="processing">待复核 {stats.pending} 条</Tag>}
            <Tag color="blue">清单项 {stats.items} 条</Tag>
          </Space>
        }
      />

      <div className="mp-note">
        <BranchesOutlined />
        <span>
          标准物料与非标物料是<b>一对多</b>：同一件标准物料可以对应多条历史写法（三级抗震螺纹钢 25 / HRB400E 抗震钢 Φ25 / 螺纹钢25（三级））。
          映射时系统会先把规格型号解析好并推荐最匹配的标准，经办人只需复核或改判；确认后的历史叫法会记进标准物料，下次遇到同样写法直接命中。
        </span>
      </div>

      <div className="pg-kpi-grid pg-kpi-grid-4 mp-kpi">
        <Surface className="pg-kpi">
          <div className="pg-page-subtitle">历史招标项目</div>
          <div className="pg-page-title">{stats.projects}</div>
          <div className="pg-ai-sub">共 {stats.items} 条清单项待归集</div>
        </Surface>
        <Surface className="pg-kpi">
          <div className="pg-page-subtitle">待复核映射</div>
          <div className="pg-page-title pg-warning">{stats.pending}</div>
          <div className="pg-ai-sub">系统已预映射，等经办人确认</div>
        </Surface>
        <Surface className="pg-kpi">
          <div className="pg-page-subtitle">已映射清单项</div>
          <div className="pg-page-title pg-positive">{stats.done}</div>
          <div className="pg-ai-sub">
            覆盖率 {stats.items ? Math.round(((stats.done + stats.newMaterial) / stats.items) * 100) : 0}% · 转治理{' '}
            {stats.newMaterial} 条
          </div>
        </Surface>
        <Surface className="pg-kpi">
          <div className="pg-page-subtitle">可复用历史成交价</div>
          <div className="pg-page-title">{stats.reusable}</div>
          <div className="pg-ai-sub">涉及金额 {compactMoney(stats.amount)}</div>
        </Surface>
      </div>

      <div className="pg-filter-bar">
        <Segmented
          value={status}
          onChange={value => setStatus(value as typeof status)}
          options={[
            { label: `全部 ${bidProjects.length}`, value: 'all' },
            { label: `待映射 ${counts.todo}`, value: 'todo' },
            { label: `映射中 ${counts.doing}`, value: 'doing' },
            { label: `已映射 ${counts.done}`, value: 'done' }
          ]}
        />
        <Select
          value={year}
          onChange={setYear}
          style={{ minWidth: 132 }}
          options={[
            { value: 'all', label: '全部年份' },
            { value: '2025', label: '2025 年' },
            { value: '2024', label: '2024 年' }
          ]}
        />
        <Input
          prefix={<SearchOutlined />}
          className="pg-filter-search"
          value={keyword}
          onChange={event => setKeyword(event.target.value)}
          placeholder="搜索招标编号、项目名称、采购组织或区域"
          allowClear
          style={{ minWidth: 300 }}
        />
        <span className="pg-ai-sub pg-filter-hint">按开标日期倒序，未映射优先</span>
      </div>

      <Surface>
        <Table
          className="mp-table"
          dataSource={rows}
          columns={columns}
          rowKey={row => row.project.key}
          pagination={false}
          scroll={{ x: 1300 }}
          onRow={row => ({ onClick: () => openBidProject(row.project.key) })}
          rowClassName={row => (row.status === 'todo' ? 'mp-row-todo' : '')}
        />
      </Surface>
    </>
  );
};
