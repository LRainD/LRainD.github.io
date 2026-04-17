import React, { useState } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  Download,
  Settings,
  Home,
  ShoppingCart,
  FileText,
  BarChart3,
  Users,
  Shield,
  PanelLeftClose,
  PanelLeft,
  HelpCircle,
  Info,
  Calendar,
  Building2,
  User,
  FolderOpen,
  Tag,
  MoreHorizontal,
  Plus,
  ChevronRight,
} from 'lucide-react';
import { DatePicker, ConfigProvider, Select, Table, Checkbox, Button } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

const { RangePicker } = DatePicker;
import logoImage from '../../../assets/media/集采工作台logo图标.png';
import './style.css';

// 表格数据
const tableData = [
  {
    key: '1',
    seq: 1,
    changeType: '补录',
    planStatus: '招标/采购超期',
    contractCode: '0301001',
    category: '-',
    purchaseCategory: '专业分包',
    contentClass: '工程类合同-分包分供类合同-专业分包合同',
    subCategory: 'TJFB-001土石方工程分包合同(专业分包合同)',
    details: '土石方工程分包合同',
    useCollection: '否',
    isNew: '是',
  },
  {
    key: '2',
    seq: 2,
    changeType: '补录',
    planStatus: '招标/采购超期',
    contractCode: '0301006',
    category: '-',
    purchaseCategory: '专业分包',
    contentClass: '工程类合同-分包分供类合同-专业分包合同',
    subCategory: 'TJFB-006边坡支护工程分包合同(专业分包)',
    details: '边坡支护工程分包合同',
    useCollection: '否',
    isNew: '是',
  },
  {
    key: '3',
    seq: 3,
    changeType: '补录',
    planStatus: '招标/采购超期',
    contractCode: '0301017',
    category: '-',
    purchaseCategory: '专业分包',
    contentClass: '工程类合同-分包分供类合同-专业分包合同',
    subCategory: 'TJFB-019预制混凝土桩施工分包合同(专业分包)',
    details: '预制混凝土桩施工分包合同',
    useCollection: '否',
    isNew: '是',
  },
];

// 表格列定义
const columns = [
  {
    title: '序号',
    dataIndex: 'seq',
    key: 'seq',
    width: 60,
    align: 'center' as const,
  },
  {
    title: '合约包变更类型',
    dataIndex: 'changeType',
    key: 'changeType',
    width: 120,
    align: 'center' as const,
    render: (text: string) => (
      <span className="tag-blue">{text}</span>
    ),
  },
  {
    title: '计划执行状态',
    dataIndex: 'planStatus',
    key: 'planStatus',
    width: 120,
    align: 'center' as const,
    render: (text: string) => (
      <span className="tag-red-outline">{text}</span>
    ),
  },
  {
    title: '经济合约包编码',
    dataIndex: 'contractCode',
    key: 'contractCode',
    width: 140,
    align: 'center' as const,
  },
  {
    title: '合作品类',
    dataIndex: 'category',
    key: 'category',
    width: 100,
    align: 'center' as const,
  },
  {
    title: '招标/采购品类',
    dataIndex: 'purchaseCategory',
    key: 'purchaseCategory',
    width: 120,
    align: 'center' as const,
  },
  {
    title: '采购内容分类',
    dataIndex: 'contentClass',
    key: 'contentClass',
    width: 200,
  },
  {
    title: '分类/分部',
    dataIndex: 'subCategory',
    key: 'subCategory',
    width: 280,
  },
  {
    title: '采购内容详情',
    dataIndex: 'details',
    key: 'details',
    width: 180,
  },
  {
    title: '是否引用集采',
    dataIndex: 'useCollection',
    key: 'useCollection',
    width: 120,
    align: 'center' as const,
  },
  {
    title: '是',
    dataIndex: 'isNew',
    key: 'isNew',
    width: 80,
    align: 'center' as const,
  },
  {
    title: '操作',
    key: 'action',
    width: 80,
    align: 'center' as const,
    fixed: 'right' as const,
    render: () => (
      <MoreHorizontal className="action-icon-more" />
    ),
  },
];

const Component: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('procurement');

  // 设置 dayjs 语言
  dayjs.locale('zh-cn');

  return (
    <ConfigProvider locale={zhCN}>
      <div className="plan-detail-page">
        {/* 顶部导航栏 */}
        <header className="top-header">
          <div className="header-left">
            <div className="logo">
              <img src={logoImage} alt="集采工作台" className="logo-img" />
            </div>
          </div>
          <div className="header-center">
            <div className="org-selector">
              <span>测试组织-股...</span>
              <ChevronDown className="icon-small" />
            </div>
            <div className="search-box">
              <Search className="icon-small" />
              <input type="text" placeholder="支持通过关键字搜索菜单" />
            </div>
          </div>
          <div className="header-right">
            <div className="lang-selector">
              <span className="lang-flag">🇨🇳</span>
              <span>简体中文</span>
              <ChevronDown className="icon-small" />
            </div>
            <div className="nav-links">
              <span className="nav-link">云筑首页</span>
              <span className="nav-link">寻源工作台</span>
              <span className="nav-link highlight">发布招募需求</span>
              <span className="nav-link">切换新版</span>
            </div>
            <div className="header-actions">
              <div className="action-icon">
                <HelpCircle className="icon" />
              </div>
              <div className="action-icon">
                <Bell className="icon" />
                <span className="badge">99+</span>
              </div>
              <div className="user-info">
                <span className="username">李金峰</span>
                <ChevronDown className="icon-small" />
              </div>
            </div>
          </div>
        </header>

        <div className="main-container">
          {/* 左侧侧边栏 */}
          <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-menu">
              <div className="menu-item">
                <Home className="menu-icon" />
                <span className="menu-text">首页</span>
                {sidebarCollapsed && <span className="menu-text-collapsed">首页</span>}
              </div>
              <div className="menu-item">
                <ShoppingCart className="menu-icon" />
                <span className="menu-text">验收货</span>
                {sidebarCollapsed && <span className="menu-text-collapsed">收验</span>}
              </div>
              <div className="menu-item">
                <BarChart3 className="menu-icon" />
                <span className="menu-text">数据服务</span>
                {sidebarCollapsed && <span className="menu-text-collapsed">数据</span>}
              </div>
              <div className="menu-item">
                <Users className="menu-icon" />
                <span className="menu-text">互助宝</span>
                {sidebarCollapsed && <span className="menu-text-collapsed">互助</span>}
              </div>
              <div className="menu-item">
                <FileText className="menu-icon" />
                <span className="menu-text">资产管理</span>
                {sidebarCollapsed && <span className="menu-text-collapsed">资产</span>}
              </div>
              <div className="menu-item">
                <ShoppingCart className="menu-icon" />
                <span className="menu-text">物资管理</span>
                {sidebarCollapsed && <span className="menu-text-collapsed">物资</span>}
              </div>
              <div className="menu-item">
                <FileText className="menu-icon" />
                <span className="menu-text">物资设备管理系统</span>
                {sidebarCollapsed && <span className="menu-text-collapsed">物资</span>}
              </div>
              <div className="menu-item">
                <FileText className="menu-icon" />
                <span className="menu-text">工程局发券</span>
                {sidebarCollapsed && <span className="menu-text-collapsed">工程</span>}
              </div>
              <div className="menu-item">
                <Home className="menu-icon" />
                <span className="menu-text">云筑学苑</span>
                {sidebarCollapsed && <span className="menu-text-collapsed">云筑</span>}
              </div>
              <div className="menu-item">
                <Users className="menu-icon" />
                <span className="menu-text">云筑峰会</span>
                {sidebarCollapsed && <span className="menu-text-collapsed">云筑</span>}
              </div>
              <div className="menu-item">
                <BarChart3 className="menu-icon" />
                <span className="menu-text">价格库</span>
                {sidebarCollapsed && <span className="menu-text-collapsed">价格</span>}
              </div>
              <div className={`menu-group active ${sidebarCollapsed ? 'collapsed' : ''}`}>
                <div className="menu-group-title">
                  <Shield className="menu-icon" />
                  <span className="menu-text">风控预警中心</span>
                  <ChevronDown className="arrow-icon" />
                  {sidebarCollapsed && <span className="menu-text-collapsed">风控</span>}
                </div>
                <div className="sub-menu">
                  <div className="sub-menu-item">业务预警监控</div>
                  <div className="sub-menu-item">风控预警明细</div>
                  <div className="sub-menu-item">风控预警汇总</div>
                  <div className="sub-menu-item">风控预警看板</div>
                </div>
              </div>
            </div>
            <div className="sidebar-collapse" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
              {sidebarCollapsed ? <PanelLeft className="icon" /> : <PanelLeftClose className="icon" />}
              <span className="menu-text">收起菜单</span>
            </div>
          </aside>

          {/* 主内容区 */}
          <main className="main-content">
            {/* 面包屑 */}
            <div className="breadcrumb">
              <span>采购计划管理</span>
              <span className="breadcrumb-separator">{'>'}</span>
              <span>项目采购总计划</span>
              <span className="breadcrumb-separator">{'>'}</span>
              <span className="current">计划详情</span>
            </div>

            {/* 页面标题 */}
            <div className="page-header">
              <h1 className="page-title">北京化工大学昌平校区研究生宿舍二期-发展授权</h1>
              <div className="page-actions">
                <Button className="btn-outline">查看联采结果</Button>
                <Button className="btn-outline">变更记录</Button>
              </div>
            </div>

            {/* 项目信息卡片 */}
            <div className="project-info-card">
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">项目名称：</span>
                  <span className="info-value highlight-blue">北京化工大学昌平校区研究生宿舍二期-发展授权</span>
                </div>
                <div className="info-item">
                  <span className="info-label">组织机构：</span>
                  <span className="info-value">发展公司经营管控中心</span>
                </div>
                <div className="info-item">
                  <span className="info-label">项目业态：</span>
                  <span className="info-value">施工项目-房屋建设项目-公共房屋建筑-教育设施</span>
                </div>
                <div className="info-item">
                  <span className="info-label">开工日期：</span>
                  <span className="info-value">2025-06-27</span>
                </div>
                <div className="info-item">
                  <span className="info-label">竣工日期：</span>
                  <span className="info-value">2026-05-05</span>
                </div>
                <div className="info-item">
                  <span className="info-label">类别：</span>
                  <span className="info-value">物资 + 分包</span>
                </div>
                <div className="info-item">
                  <span className="info-label">计划编号：</span>
                  <span className="info-value">ZJH20251211004614</span>
                </div>
                <div className="info-item">
                  <span className="info-label">计划创建人：</span>
                  <span className="info-value">吴越</span>
                </div>
                <div className="info-item">
                  <span className="info-label">计划创建时间：</span>
                  <span className="info-value">2025-12-11 14:10:01</span>
                </div>
                <div className="info-item">
                  <span className="info-label">经办人：</span>
                  <span className="info-value">吴越</span>
                </div>
              </div>
            </div>

            {/* 计划信息区域 */}
            <div className="plan-info-section">
              <div className="section-header">
                <div className="header-title">
                  <div className="section-title-bar"></div>
                  <span className="section-title">计划信息</span>
                </div>
                <div className="header-notice">
                   <div className="notice-inner">
                    <span className="notice-tag">互</span>
                    <span className="notice-text">互助宝存在有效供应商信息 <a>获取最新合约规划</a></span>
                    <ChevronDown className="notice-arrow" />
                   </div>
                </div>
              </div>

              {/* 标签页 */}
              <div className="tabs-container">
                <div 
                  className={`tab-item ${activeTab === 'procurement' ? 'active' : ''}`}
                  onClick={() => setActiveTab('procurement')}
                >
                  常规采购
                </div>
                <div className="tab-actions">
                  <Button type="primary" className="switch-view-btn">
                    切换框架视图
                  </Button>
                </div>
              </div>

              {/* 查询区域 */}
              <div className="query-section">
                <div className="query-main">
                  <div className="query-item">
                    <label>合作品类 <HelpCircle className="label-help" /></label>
                    <Select placeholder="请选择" style={{ width: 180 }} />
                  </div>
                  <div className="query-item">
                    <label>招标/采购品类</label>
                    <Select placeholder="请选择" style={{ width: 180 }} />
                  </div>
                  <div className="query-item">
                    <label>采购方式</label>
                    <Select placeholder="请选择" style={{ width: 180 }} />
                  </div>
                  <div className="query-item">
                    <label>分类/分部</label>
                    <Select placeholder="请选择" style={{ width: 180 }} />
                  </div>
                  <div className="query-buttons">
                    <Button type="primary" className="query-btn">查询</Button>
                    <Button className="reset-btn">重置</Button>
                    <Button type="link" className="expand-btn">
                      展开 <ChevronDown className="icon-small" />
                    </Button>
                  </div>
                </div>
                <div className="query-options">
                  <div className="query-toolbar">
                    <Button className="toolbar-btn">
                      <Settings className="icon-small" />
                    </Button>
                  </div>
                  <div className="query-checkboxes">
                    <Checkbox>按月归集项目计划</Checkbox>
                    <Checkbox>显示已作废条目</Checkbox>
                  </div>
                </div>
              </div>

              <div className="table-info-row">
                <span className="selected-count">共选中 0 条数据</span>
              </div>

              {/* 数据表格 */}
              <div className="table-container">
                <Table
                  columns={columns}
                  dataSource={tableData}
                  pagination={false}
                  scroll={{ x: 1800 }}
                  rowSelection={{
                    type: 'checkbox',
                  }}
                />
              </div>

              {/* 分页 */}
              <div className="pagination-section">
                <div className="pagination-left">
                  <span>共 3 条</span>
                </div>
              </div>
            </div>

            {/* 悬浮添加按钮 */}
            <div className="fab-button">
              <Plus className="fab-icon" />
            </div>
          </main>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default Component;
