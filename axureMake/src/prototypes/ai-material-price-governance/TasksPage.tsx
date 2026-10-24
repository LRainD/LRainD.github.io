import React, { useState } from 'react';
import { Button, DatePicker, Form, Input, Modal, Progress, Select, Space, Table, Tag } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import type { GovernanceTask } from './data';
import { useDemo } from './context';
import { PageHeader, Surface } from './shared';

export const TasksPage: React.FC = () => {
  const { tasks, createTask, setPage } = useDemo();
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [form] = Form.useForm();
  const filtered = tasks.filter(item => !keyword || `${item.name}${item.category}${item.assignee}`.includes(keyword));

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
    { title: '任务名称', dataIndex: 'name', key: 'name', width: 260 },
    { title: '品类', dataIndex: 'category', key: 'category', width: 100 },
    { title: '工程局', dataIndex: 'bureau', key: 'bureau', width: 110 },
    { title: '业务专家', dataIndex: 'assignee', key: 'assignee', width: 100 },
    { title: '截止日期', dataIndex: 'deadline', key: 'deadline', width: 120 },
    { title: '任务量', key: 'amount', width: 120, render: (_: unknown, record: GovernanceTask) => `${record.completed} / ${record.total}` },
    { title: '治理进度', key: 'progress', width: 240, render: (_: unknown, record: GovernanceTask) => <div className="pg-task-progress"><Progress percent={Math.round(record.completed / record.total * 100)} status={record.status === '已逾期' ? 'exception' : record.status === '已完成' ? 'success' : 'active'} /></div> },
    { title: '状态', dataIndex: 'status', key: 'status', width: 100, render: (value: string) => <Tag color={value === '已完成' ? 'success' : value === '已逾期' ? 'error' : 'processing'}>{value}</Tag> },
    { title: '操作', key: 'action', width: 110, fixed: 'right' as const, render: (_: unknown, record: GovernanceTask) => record.status === '已完成' ? <Button type="link" onClick={() => setPage('standards')}>查看成果</Button> : <Button type="link" onClick={() => setPage('governance')}>去处理</Button> }
  ];

  return <>
    <PageHeader title="治理任务与进度" subtitle="管理员按品类和工程局分派治理任务，专家处理进度、截止时间和逾期情况全程可追踪" action={<Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>创建治理任务</Button>} />
    <div className="pg-kpi-grid">
      <Surface className="pg-kpi"><div className="pg-page-subtitle">全部任务</div><div className="pg-page-title">{tasks.length}</div></Surface>
      <Surface className="pg-kpi"><div className="pg-page-subtitle">进行中</div><div className="pg-page-title">{tasks.filter(item => item.status === '进行中').length}</div></Surface>
      <Surface className="pg-kpi"><div className="pg-page-subtitle">已完成</div><div className="pg-page-title pg-positive">{tasks.filter(item => item.status === '已完成').length}</div></Surface>
      <Surface className="pg-kpi"><div className="pg-page-subtitle">已逾期</div><div className="pg-page-title pg-warning">{tasks.filter(item => item.status === '已逾期').length}</div></Surface>
    </div>
    <div className="pg-filter-bar"><Input prefix={<SearchOutlined />} placeholder="搜索任务、品类或专家" value={keyword} onChange={event => setKeyword(event.target.value)} allowClear style={{ minWidth: 320 }} /><Select defaultValue="全部状态" options={['全部状态', '进行中', '已完成', '已逾期'].map(value => ({ value, label: value }))} /></div>
    <Surface><Table dataSource={filtered} columns={columns} rowKey="key" pagination={false} scroll={{ x: 1250 }} /></Surface>

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
