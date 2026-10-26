/**
 * 运营入库审核（列表）。
 *
 * 审核对象不是价格记录，而是**业务专家在专家治理工作台组装完成的商品**：
 * 商品名称、规格型号（属性名：值）、属性同义词、商品历史叫法。
 *
 * 每一条提交单先要看清「提交方式」：
 * - 新增建档：标准库里没有这件商品，通过 = 新开一条标准物料；
 * - 修改已有：专家组装时发现是同一件商品，关联了某条标准物料，通过 = 把变更合并进它。
 * 两者的审核口径完全不同（前者要防重复建档，后者要看改得对不对），所以列表单独成列并可筛选。
 *
 * 审核详情走独立页面 `review-detail`（`ReviewDetailPage`），不再用右侧抽屉。
 */
import React, { useMemo, useState } from 'react';
import { Alert, Button, Input, Segmented, Space, Table, Tag, Tooltip } from 'antd';
import { AuditOutlined, ExperimentOutlined, SearchOutlined } from '@ant-design/icons';
import type { ChangeType, MaterialSubmission, ReviewStatus } from './data';
import { useDemo } from './context';
import { PageHeader, Surface } from './shared';

const statusTag = (status: ReviewStatus) =>
  status === '待审核'
    ? <Tag color="processing">待审核</Tag>
    : status === '已通过'
      ? <Tag color="success">已通过</Tag>
      : <Tag color="error">已驳回</Tag>;

export const ReviewPage: React.FC = () => {
  const { submissions, setPage, openReviewDetail, pendingReviewCount } = useDemo();
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [typeFilter, setTypeFilter] = useState<'all' | ChangeType>('all');
  const [keyword, setKeyword] = useState('');

  const counts = useMemo(() => ({
    pending: submissions.filter(item => item.status === '待审核').length,
    approved: submissions.filter(item => item.status === '已通过').length,
    rejected: submissions.filter(item => item.status === '已驳回').length,
    all: submissions.length,
    newCount: submissions.filter(item => item.changeType !== 'update').length,
    updateCount: submissions.filter(item => item.changeType === 'update').length
  }), [submissions]);

  const filtered = useMemo(
    () =>
      submissions
        .filter(item => {
          if (filter === 'pending' && item.status !== '待审核') return false;
          if (filter === 'approved' && item.status !== '已通过') return false;
          if (filter === 'rejected' && item.status !== '已驳回') return false;
          if (typeFilter !== 'all' && (item.changeType ?? 'new') !== typeFilter) return false;
          if (keyword) {
            const text = `${item.name}${item.sourceName}${item.category}${item.taskName}${item.submitter}${item.targetStandardCode ?? ''}`;
            if (!text.includes(keyword.trim())) return false;
          }
          return true;
        })
        // 待审核的排前面：审核页要优先处理还没结论的
        .sort((a, b) => (a.status === '待审核' ? 0 : 1) - (b.status === '待审核' ? 0 : 1)),
    [submissions, filter, typeFilter, keyword]
  );

  const columns = [
    {
      title: '组装后的商品', key: 'name', width: 280,
      render: (_: unknown, record: MaterialSubmission) => (
        <div>
          <div className="pg-rv-name">{record.name}</div>
          <div className="pg-ai-sub">原始描述：{record.sourceName}</div>
        </div>
      )
    },
    {
      title: '规格型号', key: 'spec', width: 250,
      render: (_: unknown, record: MaterialSubmission) => (
        <div className="pg-rv-spec">
          {record.atoms.filter(atom => atom.label !== '品类').map(atom => (
            <span key={atom.label}>
              <em>{atom.label}：</em>
              <b>{atom.value || '（空）'}</b>
            </span>
          ))}
        </div>
      )
    },
    {
      title: '状态', key: 'status', width: 92,
      render: (_: unknown, record: MaterialSubmission) => (
        <Tooltip title={record.status === '已驳回' ? `驳回原因：${record.comment ?? '未填写'}` : record.comment}>
          {statusTag(record.status)}
        </Tooltip>
      )
    },
    {
      title: '提交方式', key: 'changeType', width: 158,
      render: (_: unknown, record: MaterialSubmission) =>
        record.changeType === 'update' ? (
          <div className="pg-rv-type">
            <Tag color="purple">修改已有</Tag>
            <Tooltip title={record.targetStandardName}>
              <span className="pg-rv-type-target">{record.targetStandardCode ?? '目标标准'}</span>
            </Tooltip>
            <span className="pg-ai-sub">{record.changes.length} 项变更</span>
          </div>
        ) : (
          <div className="pg-rv-type">
            <Tag color="blue">新增建档</Tag>
            <span className="pg-ai-sub">标准库无此物料</span>
          </div>
        )
    },
    { title: '品类', dataIndex: 'category', key: 'category', width: 82, ellipsis: true },
    {
      title: '历史叫法', key: 'atoms', width: 148,
      render: (_: unknown, record: MaterialSubmission) => (
        <div className="pg-rv-count">
          <span>{record.atoms.length} 项属性</span>
          <span className="pg-ai-sub">
            商品 {record.synonyms.length} 条 · 属性 {record.atoms.reduce((sum, atom) => sum + atom.synonyms.length, 0)} 条
          </span>
        </div>
      )
    },
    {
      title: '来源任务', key: 'task', width: 190,
      render: (_: unknown, record: MaterialSubmission) => (
        <div>
          <div className="pg-rv-task">{record.taskName}</div>
          <div className="pg-ai-sub">{record.bureau} · {record.unit}</div>
        </div>
      )
    },
    {
      title: '提交人 / 时间', key: 'submitter', width: 140,
      render: (_: unknown, record: MaterialSubmission) => (
        <div>
          <div>{record.submitter}{record.attempt > 1 && <span className="pg-ai-sub"> · 第 {record.attempt} 次</span>}</div>
          <div className="pg-ai-sub">{record.submittedAt}</div>
        </div>
      )
    },
    {
      title: '操作', key: 'action', width: 104, fixed: 'right' as const,
      render: (_: unknown, record: MaterialSubmission) => (
        <Button type="link" size="small" icon={<AuditOutlined />} onClick={() => openReviewDetail(record.key)}>
          {record.status === '待审核' ? '审核' : '详情'}
        </Button>
      )
    }
  ];

  return <>
    <PageHeader
      title="运营入库审核"
      subtitle="审核业务专家组装完成的商品：核对商品名称、规格型号与历史叫法，通过后写入标准物料库，驳回退回专家治理工作台"
      action={
        <Space>
          {pendingReviewCount > 0 && <Tag color="processing">待审核 {pendingReviewCount} 条</Tag>}
          <Button onClick={() => setPage('governance')}>去治理工作台</Button>
        </Space>
      }
    />

    <Alert
      className="pg-review-note"
      showIcon
      type="info"
      title="先看「提交方式」再看内容：新增建档要确认标准库确实没有同一件商品；修改已有要确认变更合并进的是对的那条物料。通过后分别对应「新建标准」与「合并进原标准」。"
    />

    <div className="pg-kpi-grid pg-kpi-grid-4">
      <Surface className="pg-kpi"><div className="pg-page-subtitle">待审核</div><div className="pg-page-title pg-warning">{counts.pending}</div></Surface>
      <Surface className="pg-kpi"><div className="pg-page-subtitle">已通过入库</div><div className="pg-page-title pg-positive">{counts.approved}</div></Surface>
      <Surface className="pg-kpi"><div className="pg-page-subtitle">已驳回</div><div className="pg-page-title">{counts.rejected}</div></Surface>
      <Surface className="pg-kpi">
        <div className="pg-page-subtitle">提交单总数</div>
        <div className="pg-page-title">{counts.all}</div>
        <div className="pg-ai-sub">新增建档 {counts.newCount} · 修改已有 {counts.updateCount}</div>
      </Surface>
    </div>

    <div className="pg-filter-bar">
      <Segmented
        value={filter}
        onChange={value => setFilter(value as typeof filter)}
        options={[
          { label: `待审核 ${counts.pending}`, value: 'pending' },
          { label: `已通过 ${counts.approved}`, value: 'approved' },
          { label: `已驳回 ${counts.rejected}`, value: 'rejected' },
          { label: `全部 ${counts.all}`, value: 'all' }
        ]}
      />
      <Segmented
        size="small"
        value={typeFilter}
        onChange={value => setTypeFilter(value as typeof typeFilter)}
        options={[
          { label: '全部方式', value: 'all' },
          { label: `新增 ${counts.newCount}`, value: 'new' },
          { label: `修改 ${counts.updateCount}`, value: 'update' }
        ]}
      />
      <Input
        prefix={<SearchOutlined />}
        className="pg-filter-search"
        value={keyword}
        onChange={event => setKeyword(event.target.value)}
        placeholder="搜索商品名称、原始描述、来源任务、提交人或目标标准编码"
        allowClear
        style={{ minWidth: 320 }}
      />
      <span className="pg-ai-sub pg-filter-hint">按提交时间倒序，待审核优先</span>
    </div>

    <Surface>
      {filtered.length > 0 ? (
        <Table
          className="pg-review-table"
          dataSource={filtered}
          columns={columns}
          rowKey="key"
          pagination={false}
          scroll={{ x: 1430 }}
          rowClassName={record => (record.status === '已驳回' ? 'pg-abnormal-row' : '')}
        />
      ) : (
        <div className="pg-review-empty">
          <ExperimentOutlined />
          <div>{filter === 'pending' ? '审核队列是空的' : '当前筛选下没有记录'}</div>
          <div className="pg-ai-sub">
            {filter === 'pending'
              ? '业务专家在「专家治理工作台」组装属性并提交后，这里会出现待审核的商品。'
              : '换个筛选条件或搜索关键词试试。'}
          </div>
          {filter === 'pending' && (
            <Button type="primary" onClick={() => setPage('governance')}>去治理工作台</Button>
          )}
        </div>
      )}
    </Surface>
  </>;
};
