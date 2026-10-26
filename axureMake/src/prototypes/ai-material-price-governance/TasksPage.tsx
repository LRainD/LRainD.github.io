import React, { useState } from 'react';
import { Button, DatePicker, Form, Input, Modal, Popconfirm, Progress, Select, Space, Table, Tag, Tooltip } from 'antd';
import { CloudSyncOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import type { GovernanceTask } from './data';
import { useDemo } from './context';
import { PageHeader, Surface } from './shared';

export const TasksPage: React.FC = () => {
  const { tasks, createTask, setPage, openTask, resetDemo, storageUsage, submissions } = useDemo();
  /** 每个任务的待审核提交单条数：任务量列和「去审核」入口都要用 */
  const waitingOf = (taskKey: string) =>
    submissions.filter(item => item.taskKey === taskKey && item.status === '待审核').length;
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [form] = Form.useForm();
  const filtered = tasks.filter(item => !keyword || `${item.name}${item.category}${item.assignee}${item.source?.fileName ?? ''}`.includes(keyword));

  const submit = async () => {
    const values = await form.validateFields();
    createTask({
      key: `task-${Date.now()}`,
      name: values.name,
      category: values.category,
      bureau: values.bureau,
      assignee: values.assignee,
      deadline: values.deadline.format('YYYY-MM-DD'),
      total: Number(values.total),
      completed: 0,
      status: '进行中'
    });
    form.resetFields();
    setOpen(false);
  };

  const columns = [
    {
      title: '任务名称', dataIndex: 'name', key: 'name', width: 320,
      render: (value: string, record: GovernanceTask) => (
        <div>
          <div className="pg-task-name">
            {value}
            {record.source && <Tag color="blue" style={{ marginLeft: 6 }}>导入</Tag>}
          </div>
          {record.source && (
            <div className="pg-ai-sub">
              {record.source.fileName || '文本录入'}
              {record.source.sheetName ? ` · ${record.source.sheetName}` : ''} · {record.source.materials.length} 条
            </div>
          )}
        </div>
      )
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 90,
      render: (value: string) => <Tag color={value === '已完成' ? 'success' : value === '已逾期' ? 'error' : value === '待审核' ? 'gold' : 'processing'}>{value}</Tag>
    },
    { title: '品类', dataIndex: 'category', key: 'category', width: 120, ellipsis: true },
    { title: '工程局', dataIndex: 'bureau', key: 'bureau', width: 100 },
    { title: '业务专家', dataIndex: 'assignee', key: 'assignee', width: 90 },
    { title: '截止日期', dataIndex: 'deadline', key: 'deadline', width: 110 },
    {
      title: '任务量', key: 'amount', width: 116,
      render: (_: unknown, record: GovernanceTask) => (
        <div>
          <div>{record.completed} / {record.total}</div>
          {waitingOf(record.key) > 0 && <div className="pg-ai-sub">待审核 {waitingOf(record.key)} 条</div>}
        </div>
      )
    },
    {
      title: '治理进度', key: 'progress', width: 200,
      render: (_: unknown, record: GovernanceTask) => (
        <div className="pg-task-progress">
          <Progress
            percent={record.total ? Math.round((record.completed / record.total) * 100) : 0}
            status={record.status === '已逾期' ? 'exception' : record.status === '已完成' ? 'success' : 'active'}
          />
        </div>
      )
    },
    {
      title: '操作', key: 'action', width: 120, fixed: 'right' as const,
      render: (_: unknown, record: GovernanceTask) =>
        record.status === '已完成'
          ? <Button type="link" onClick={() => setPage('standards')}>查看成果</Button>
          : record.status === '待审核'
            ? <Button type="link" onClick={() => setPage('review')}>去审核</Button>
            : <Button type="link" onClick={() => openTask(record.key)}>{record.source ? '继续治理' : '去处理'}</Button>
    }
  ];

  return <>
    <PageHeader
      title="治理任务与进度"
      subtitle="管理员按品类和工程局分派治理任务，专家处理进度、截止时间和逾期情况全程可追踪"
      action={
        <Space>
          <Popconfirm
            title="清空本机数据？"
            description="导入批次、任务进度和新增标准物料都会恢复为初始演示数据。"
            okText="确认清空"
            okButtonProps={{ danger: true }}
            onConfirm={resetDemo}
          >
            <Button>重置演示数据</Button>
          </Popconfirm>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>创建治理任务</Button>
        </Space>
      }
    />
    <div className="pg-kpi-grid pg-kpi-grid-5">
      <Surface className="pg-kpi"><div className="pg-page-subtitle">全部任务</div><div className="pg-page-title">{tasks.length}</div></Surface>
      <Surface className="pg-kpi"><div className="pg-page-subtitle">进行中</div><div className="pg-page-title">{tasks.filter(item => item.status === '进行中').length}</div></Surface>
      <Surface className="pg-kpi"><div className="pg-page-subtitle">待审核</div><div className="pg-page-title">{tasks.filter(item => item.status === '待审核').length}</div></Surface>
      <Surface className="pg-kpi"><div className="pg-page-subtitle">已完成</div><div className="pg-page-title pg-positive">{tasks.filter(item => item.status === '已完成').length}</div></Surface>
      <Surface className="pg-kpi"><div className="pg-page-subtitle">已逾期</div><div className="pg-page-title pg-warning">{tasks.filter(item => item.status === '已逾期').length}</div></Surface>
    </div>
    <div className="pg-filter-bar">
      <Input prefix={<SearchOutlined />} placeholder="搜索任务、品类、专家或来源文件" value={keyword} onChange={event => setKeyword(event.target.value)} allowClear style={{ minWidth: 320 }} />
      <Select defaultValue="全部状态" options={['全部状态', '进行中', '待审核', '已完成', '已逾期'].map(value => ({ value, label: value }))} />
      <Tooltip title="导入批次、任务进度、标准物料均保存在浏览器 localStorage，刷新或重新打开页面后仍在">
        <span className="pg-storage-hint">
          <CloudSyncOutlined /> 本机已保存 {storageUsage.items} 项 · {Math.max(1, Math.round(storageUsage.bytes / 1024))} KB
          {storageUsage.savedAt ? ` · ${storageUsage.savedAt}` : ''}
        </span>
      </Tooltip>
    </div>
    <Surface><Table dataSource={filtered} columns={columns} rowKey="key" pagination={false} scroll={{ x: 1350 }} /></Surface>

    <Modal title="创建治理任务" open={open} onCancel={() => setOpen(false)} onOk={submit} okText="创建并通知专家" width={620}>
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="任务名称" rules={[{ required: true, message: '请输入任务名称' }]}><Input placeholder="例如：钢筋品类近五年数据治理" /></Form.Item>
        <Space size={16} style={{ display: 'flex' }}>
          <Form.Item name="category" label="治理品类" rules={[{ required: true }]} style={{ flex: 1 }}><Select options={['钢筋', '水泥', '管材', '灯具'].map(value => ({ value, label: value }))} /></Form.Item>
          <Form.Item name="bureau" label="工程局" rules={[{ required: true }]} style={{ flex: 1 }}><Select options={['中建八局', '中建三局', '中建五局'].map(value => ({ value, label: value }))} /></Form.Item>
        </Space>
        <Space size={16} style={{ display: 'flex' }}>
          <Form.Item name="assignee" label="业务专家" rules={[{ required: true }]} style={{ flex: 1 }}><Select options={['张工', '李敏', '王磊', '周颖'].map(value => ({ value, label: value }))} /></Form.Item>
          <Form.Item name="deadline" label="截止日期" rules={[{ required: true }]} style={{ flex: 1 }}><DatePicker style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="total" label="待治理数量" rules={[{ required: true }]} style={{ flex: 1 }}><Input type="number" min={1} placeholder="500" /></Form.Item>
        </Space>
      </Form>
    </Modal>
  </>;
};
