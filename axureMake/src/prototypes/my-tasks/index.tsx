/**
 * @name 我的任务
 * @description 集采工作台核心办理入口，统一承载检查执行、不合规处置、整改复核和申诉处理任务。
 */

import React, { useState } from 'react';
import {
  Table,
  Tabs,
  Tag,
  Space,
  Button,
  Input,
  Select,
  DatePicker,
  Breadcrumb,
  Badge,
  ConfigProvider
} from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import {
  SearchOutlined,
  ReloadOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';

dayjs.locale('zh-cn');
import CentralizedProcurementLayout from '../../components/centralized-procurement-layout';
import './style.css';

const { RangePicker } = DatePicker;

const mockTasks = [
  {
    id: 'TASK-20260901-001',
    type: '自查',
    bidNo: 'cscec202608310000004851',
    bidName: '某办公楼建设项目钢材采购招标',
    contractName: '某办公楼建设项目钢材采购合同',
    contractNo: 'HT-2026-001',
    reviewCompleteTime: '2026-08-31 15:00:00',
    status: '自查待处置',
    pendingAction: '不合规项整改',
    issueCount: 3,
    timeLeft: '2天 5小时',
    isOverdue: false,
    updateTime: '2026-09-01 10:00:00',
  },
  {
    id: 'TASK-20260901-002',
    type: '互查',
    bidNo: 'cscec202608310000004852',
    bidName: '某高速公路工程水泥供应采购招标',
    contractName: '某高速公路工程水泥供应合同',
    contractNo: 'HT-2026-002',
    reviewCompleteTime: '2026-08-31 15:30:00',
    status: '互查待复核',
    pendingAction: '整改材料复核',
    issueCount: 1,
    timeLeft: '0天 2小时',
    isOverdue: true,
    updateTime: '2026-09-01 09:30:00',
  },
  {
    id: 'TASK-20260901-003',
    type: '稽查',
    bidNo: 'cscec202608310000004853',
    bidName: '某大型场馆机电安装分包项目招标',
    contractName: '某大型场馆机电安装分包合同',
    contractNo: 'HT-2026-003',
    reviewCompleteTime: '2026-08-30 14:00:00',
    status: '稽查复核不通过',
    pendingAction: '继续整改',
    issueCount: 5,
    timeLeft: '5天 0小时',
    isOverdue: false,
    updateTime: '2026-08-31 16:00:00',
  },
  {
    id: 'TASK-20260901-004',
    type: '自查',
    bidNo: 'cscec202608310000004854',
    bidName: '某住宅小区园林绿化工程项目采购',
    contractName: '某住宅小区园林绿化工程合同',
    contractNo: 'HT-2026-004',
    reviewCompleteTime: '2026-08-31 17:30:00',
    status: '自查待处理',
    pendingAction: '执行检查',
    issueCount: 0,
    timeLeft: '1天 12小时',
    isOverdue: false,
    updateTime: '2026-09-01 11:00:00',
  },
  {
    id: 'TASK-20260901-005', type: '自查', bidNo: 'cscec202608310000004855', bidName: '某商业综合体消防工程采购招标', contractName: '某商业综合体消防工程采购合同', contractNo: 'HT-2026-005', reviewCompleteTime: '2026-08-31 14:00:00', status: '自查中', pendingAction: '继续检查', issueCount: 0, timeLeft: '0天 8小时', isOverdue: false, updateTime: '2026-09-01 10:20:00'
  },
  {
    id: 'TASK-20260901-006', type: '自查', bidNo: 'cscec202608300000004856', bidName: '某研发中心弱电智能化采购招标', contractName: '某研发中心弱电智能化采购合同', contractNo: 'HT-2026-006', reviewCompleteTime: '2026-08-30 09:30:00', status: '自查申诉中', pendingAction: '查看申诉进度', issueCount: 2, timeLeft: '1天 6小时', isOverdue: false, updateTime: '2026-09-01 08:50:00'
  },
  {
    id: 'TASK-20260901-007', type: '互查', bidNo: 'cscec202608300000004857', bidName: '某医院综合大楼精装修采购招标', contractName: '某医院综合大楼精装修采购合同', contractNo: 'HT-2026-007', reviewCompleteTime: '2026-08-30 11:00:00', status: '互查待处理', pendingAction: '执行检查', issueCount: 0, timeLeft: '2天 3小时', isOverdue: false, updateTime: '2026-09-01 09:10:00'
  },
  {
    id: 'TASK-20260901-008', type: '互查', bidNo: 'cscec202608290000004858', bidName: '某保障房项目混凝土采购招标', contractName: '某保障房项目混凝土采购合同', contractNo: 'HT-2026-008', reviewCompleteTime: '2026-08-29 16:00:00', status: '互查待处置', pendingAction: '不合规项整改', issueCount: 2, timeLeft: '0天 4小时', isOverdue: true, updateTime: '2026-09-01 09:45:00'
  },
  {
    id: 'TASK-20260901-009', type: '稽查', bidNo: 'cscec202608290000004859', bidName: '某轨道交通项目盾构机租赁采购招标', contractName: '某轨道交通项目盾构机租赁采购合同', contractNo: 'HT-2026-009', reviewCompleteTime: '2026-08-29 10:00:00', status: '稽查待处理', pendingAction: '执行检查', issueCount: 0, timeLeft: '3天 0小时', isOverdue: false, updateTime: '2026-09-01 08:30:00'
  },
  {
    id: 'TASK-20260901-010', type: '稽查', bidNo: 'cscec202608280000004860', bidName: '某市政道路沥青采购招标', contractName: '某市政道路沥青采购合同', contractNo: 'HT-2026-010', reviewCompleteTime: '2026-08-28 15:20:00', status: '已稽查', pendingAction: '查看任务记录', issueCount: 0, timeLeft: '-', isOverdue: false, updateTime: '2026-08-31 17:10:00'
  }
];

const taskStatusesByType = {
  自查: ['自查待派发', '自查待处理', '自查中', '自查回退审批中', '自查已收回', '自查待处置', '自查待复核', '自查复核不通过', '自查申诉中', '已自查'],
  互查: ['互查待派发', '互查待处理', '互查中', '互查回退审批中', '互查待处置', '互查待复核', '互查复核不通过', '互查申诉中', '已互查'],
  稽查: ['稽查待派发', '稽查待处理', '稽查中', '稽查回退审批中', '稽查待处置', '稽查待复核', '稽查复核不通过', '稽查申诉中', '已稽查']
};

const statusTabLabels = {
  all: '全部',
  inspection: '待检查',
  review: '待复核',
  rectification: '待整改',
  appeal: '待处理申诉'
};

const getStatusTabStatuses = (type: keyof typeof taskStatusesByType, statusTab: keyof typeof statusTabLabels) => {
  const statuses = taskStatusesByType[type];
  if (statusTab === 'inspection') return statuses.filter(status => status === `${type}待处理` || status === `${type}中`);
  if (statusTab === 'review') return statuses.filter(status => status === `${type}待复核`);
  if (statusTab === 'rectification') return statuses.filter(status => status === `${type}待处置` || status === `${type}复核不通过`);
  if (statusTab === 'appeal') return statuses.filter(status => status === `${type}申诉中`);
  return statuses;
};

const getTaskAction = (status: string) => {
  if (['自查待处理', '自查中', '互查待处理', '互查中', '稽查待处理', '稽查中'].includes(status)) return '检查';
  if (['自查待处置', '自查复核不通过', '互查待处置', '互查复核不通过', '稽查待处置', '稽查复核不通过'].includes(status)) return '整改';
  if (['自查待复核', '互查待复核', '稽查待复核'].includes(status)) return '复核';
  return '查看';
};

const MyTasks: React.FC = () => {
  const [activeTab, setActiveTab] = useState('self');
  const [activeStatusTabs, setActiveStatusTabs] = useState({
    self: 'all',
    mutual: 'all',
    audit: 'all'
  });

  // 实际生效的筛选条件（针对各页签分别管理其筛选状态）
  const [filterValues, setFilterValues] = useState({
    self: {
      id: '',
      bidNo: '',
      bidName: '',
      contractName: '',
      contractNo: '',
      status: undefined as string | undefined,
      dateRange: null as any
    },
    mutual: {
      id: '',
      bidNo: '',
      bidName: '',
      contractName: '',
      contractNo: '',
      status: undefined as string | undefined,
      dateRange: null as any
    },
    audit: {
      id: '',
      bidNo: '',
      bidName: '',
      contractName: '',
      contractNo: '',
      status: undefined as string | undefined,
      dateRange: null as any
    }
  });

  // 输入框状态管理也针对页签隔离，不同页签有独立的搜索输入状态
  const [searchStates, setSearchStates] = useState({
    self: { id: '', bidNo: '', bidName: '', contractName: '', contractNo: '', status: undefined as string | undefined, dateRange: null as any },
    mutual: { id: '', bidNo: '', bidName: '', contractName: '', contractNo: '', status: undefined as string | undefined, dateRange: null as any },
    audit: { id: '', bidNo: '', bidName: '', contractName: '', contractNo: '', status: undefined as string | undefined, dateRange: null as any }
  });

  const getSearchState = (tab: string) => {
    return searchStates[tab as keyof typeof searchStates] || searchStates.self;
  };

  const updateSearchState = (tab: string, key: string, value: any) => {
    setSearchStates(prev => ({
      ...prev,
      [tab]: {
        ...prev[tab as keyof typeof searchStates],
        [key]: value
      }
    }));
  };

  const handleSearch = () => {
    const currentSearch = searchStates[activeTab as keyof typeof searchStates];
    setFilterValues(prev => ({
      ...prev,
      [activeTab]: { ...currentSearch }
    }));
  };

  const handleReset = () => {
    setSearchStates(prev => ({
      ...prev,
      [activeTab]: {
        id: '',
        bidNo: '',
        bidName: '',
        contractName: '',
        contractNo: '',
        status: undefined,
        dateRange: null
      }
    }));
    setFilterValues(prev => ({
      ...prev,
      [activeTab]: {
        id: '',
        bidNo: '',
        bidName: '',
        contractName: '',
        contractNo: '',
        status: undefined,
        dateRange: null
      }
    }));
  };

  const currentSearchState = getSearchState(activeTab);
  const currentFilter = filterValues[activeTab as keyof typeof filterValues] || filterValues.self;
  const currentType = activeTab === 'self' ? '自查' : activeTab === 'mutual' ? '互查' : '稽查';
  const currentStatusTab = activeStatusTabs[activeTab as keyof typeof activeStatusTabs] as keyof typeof statusTabLabels;
  const statusTabStatuses = getStatusTabStatuses(currentType, currentStatusTab);
  const filteredTasks = mockTasks.filter(t => {
    if (t.type !== currentType) return false;
    if (currentStatusTab !== 'all' && !statusTabStatuses.includes(t.status)) return false;
    if (currentFilter.id && !t.id.toLowerCase().includes(currentFilter.id.toLowerCase())) return false;
    if (currentFilter.bidNo && !t.bidNo.toLowerCase().includes(currentFilter.bidNo.toLowerCase())) return false;
    if (currentFilter.bidName && !t.bidName.toLowerCase().includes(currentFilter.bidName.toLowerCase())) return false;
    if (currentFilter.contractName && !t.contractName.toLowerCase().includes(currentFilter.contractName.toLowerCase())) return false;
    if (currentFilter.contractNo && !t.contractNo.toLowerCase().includes(currentFilter.contractNo.toLowerCase())) return false;
    if (currentFilter.status && t.status !== currentFilter.status) return false;
    if (currentFilter.dateRange && currentFilter.dateRange[0] && currentFilter.dateRange[1]) {
      const updateDate = new Date(t.updateTime);
      const startDate = currentFilter.dateRange[0].toDate();
      const endDate = currentFilter.dateRange[1].toDate();
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      if (updateDate < startDate || updateDate > endDate) return false;
    }
    return true;
  });

  const handleTaskAction = (record: typeof mockTasks[number]) => {
    const action = getTaskAction(record.status);
    window.location.href = `/prototypes/task-execution?taskId=${encodeURIComponent(record.id)}&mode=${encodeURIComponent(action)}`;
  };

  const columns = [
    {
      title: '序号',
      key: 'index',
      width: 70,
      align: 'center' as const,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: '任务编号',
      dataIndex: 'id',
      key: 'id',
      width: 180,
    },
    {
      title: '任务类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => {
        let color = 'blue';
        if (type === '互查') color = 'orange';
        if (type === '稽查') color = 'purple';
        return <Tag color={color}>{type}</Tag>;
      }
    },
    {
      title: '招标/采购编号',
      dataIndex: 'bidNo',
      key: 'bidNo',
      width: 220,
    },
    {
      title: '招标/采购名称',
      dataIndex: 'bidName',
      key: 'bidName',
      width: 250,
      ellipsis: true,
    },
    {
      title: '合同名称',
      dataIndex: 'contractName',
      key: 'contractName',
      width: 250,
      ellipsis: true,
    },
    {
      title: '合同编号',
      dataIndex: 'contractNo',
      key: 'contractNo',
      width: 150,
    },
    {
      title: '评审完成时间',
      dataIndex: 'reviewCompleteTime',
      key: 'reviewCompleteTime',
      width: 180,
    },
    {
      title: '当前状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        let color = 'default';
        if (status.endsWith('待处理') || status.endsWith('中')) color = 'processing';
        if (status.includes('待处置') || status.includes('复核不通过')) color = 'warning';
        if (status.includes('申诉') || status.includes('回退')) color = 'error';
        if (['已自查', '已互查', '已稽查'].includes(status)) color = 'success';
        return <Badge status={color as any} text={status} />;
      }
    },
    {
      title: '待本人处理事项',
      dataIndex: 'pendingAction',
      key: 'pendingAction',
      width: 150,
    },
    {
      title: '问题统计',
      dataIndex: 'issueCount',
      key: 'issueCount',
      width: 100,
      render: (count: number) => (
        <span style={{ color: count > 0 ? '#ff4d4f' : 'inherit', fontWeight: count > 0 ? 600 : 400 }}>
          {count} 个不合规项
        </span>
      )
    },
    {
      title: '剩余时限',
      key: 'timeLeft',
      width: 180,
      render: (_: any, record: any) => (
        <Space>
          <ClockCircleOutlined style={{ color: record.isOverdue ? '#ff4d4f' : '#8c8c8c' }} />
          <span style={{ color: record.isOverdue ? '#ff4d4f' : 'inherit' }}>
            {record.timeLeft}
            {record.isOverdue && <Tag color="error" style={{ marginLeft: 8 }}>已超时</Tag>}
          </span>
        </Space>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button type="link" size="small" onClick={() => handleTaskAction(record)}>{getTaskAction(record.status)}</Button>
        </Space>
      ),
    },
  ];

  const tabItems = [
    { key: 'self', label: '自查任务' },
    { key: 'mutual', label: '互查任务' },
    { key: 'audit', label: '稽查任务' },
  ];

  return (
    <ConfigProvider locale={zhCN}>
      <CentralizedProcurementLayout activeMenuKey="my-tasks">
        <div className="my-tasks-page">
          <div className="page-header">
            <Breadcrumb items={[
              { title: '首页' },
              { title: '招标采购' },
              { title: '一单一检' },
              { title: '我的任务' },
            ]} />
          </div>

          <div className="list-card" style={{ background: '#fff', padding: 24, borderRadius: 4, boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)' }}>
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab} 
              items={tabItems.map(tab => ({
                ...tab,
                children: (
                  <div className="tab-content-wrapper">
                    <div className="search-filters" style={{ marginBottom: 16, padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <Space wrap size={[16, 16]}>
                        <div className="filter-item">
                          <span className="filter-label">任务搜索：</span>
                          <Input 
                            placeholder="搜索任务编号" 
                            prefix={<SearchOutlined />} 
                            style={{ width: 200 }} 
                            value={currentSearchState.id}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSearchState(activeTab, 'id', e.target.value)}
                          />
                        </div>
                        <div className="filter-item">
                          <span className="filter-label">招标/采购编号：</span>
                          <Input 
                            placeholder="请输入编号" 
                            style={{ width: 200 }} 
                            value={currentSearchState.bidNo}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSearchState(activeTab, 'bidNo', e.target.value)}
                          />
                        </div>
                        <div className="filter-item">
                          <span className="filter-label">招标/采购名称：</span>
                          <Input 
                            placeholder="请输入名称" 
                            style={{ width: 200 }} 
                            value={currentSearchState.bidName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSearchState(activeTab, 'bidName', e.target.value)}
                          />
                        </div>
                        <div className="filter-item">
                          <span className="filter-label">合同名称：</span>
                          <Input 
                            placeholder="请输入合同名称" 
                            style={{ width: 200 }} 
                            value={currentSearchState.contractName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSearchState(activeTab, 'contractName', e.target.value)}
                          />
                        </div>
                        <div className="filter-item">
                          <span className="filter-label">合同编号：</span>
                          <Input 
                            placeholder="请输入合同编号" 
                            style={{ width: 200 }} 
                            value={currentSearchState.contractNo}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSearchState(activeTab, 'contractNo', e.target.value)}
                          />
                        </div>
                        <div className="filter-item">
                          <span className="filter-label">任务状态：</span>
                          <Select 
                            placeholder="全部状态" 
                            style={{ width: 160 }} 
                            allowClear
                            value={currentSearchState.status}
                            onChange={(val: string | undefined) => updateSearchState(activeTab, 'status', val)}
                            options={taskStatusesByType[currentType].map(status => ({ value: status, label: status }))}
                          />
                        </div>
                        <div className="filter-item">
                          <span className="filter-label">更新时间：</span>
                          <RangePicker 
                            style={{ width: 260 }} 
                            value={currentSearchState.dateRange}
                            onChange={(val: any) => updateSearchState(activeTab, 'dateRange', val)}
                            placeholder={['开始日期', '结束日期']}
                          />
                        </div>
                        <Space>
                          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>查询</Button>
                          <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
                        </Space>
                      </Space>
                    </div>
                    <Tabs
                      activeKey={currentStatusTab}
                      onChange={(key) => setActiveStatusTabs(prev => ({ ...prev, [activeTab]: key }))}
                      items={(Object.keys(statusTabLabels) as Array<keyof typeof statusTabLabels>).map(key => ({
                        key,
                        label: `${statusTabLabels[key]} (${key === 'all' ? mockTasks.filter(task => task.type === currentType).length : mockTasks.filter(task => task.type === currentType && getStatusTabStatuses(currentType, key).includes(task.status)).length})`
                      }))}
                    />
                    <Table 
                      columns={columns} 
                      dataSource={filteredTasks}
                      rowKey="id"
                      scroll={{ x: 1850 }}
                      pagination={{
                        total: filteredTasks.length,
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total: number) => `共 ${total} 条记录`,
                      }}
                    />
                  </div>
                )
              }))}
              className="task-tabs"
            />
          </div>
        </div>
      </CentralizedProcurementLayout>
    </ConfigProvider>
  );
};

export default MyTasks;
