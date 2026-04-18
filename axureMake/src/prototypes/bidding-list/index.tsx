/**
 * @name 招标列表
 * @mode axure
 */

import React from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  HelpCircle,
  Home,
  Shield,
  ShoppingCart,
  Users,
  BarChart3,
  FileText,
  Settings,
  MoreHorizontal,
  Star,
  Download,
  Layout,
  ChevronRight,
} from 'lucide-react';
import { ConfigProvider, Select, Input, Checkbox, Button, Table, Space, Tag } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import logoImage from '../../../assets/media/运营后台左上角logo.png';
import './style.css';

const Component: React.FC = () => {
  // 模拟表格数据
  const tableData = [
    {
      key: '1',
      status: '招标文件编制中',
      code: 'cscec202604160000040546',
      name: '11111',
      org: '中建四局华南建设有限公司',
      project: '培训实操项目10',
      area: '广东省广州市白云区',
      method: '公开招标',
      category: '物资',
      manager: '奥巴马',
    },
    {
      key: '2',
      status: '招标文件编制中',
      code: 'cscec202604160000020284',
      name: '私有库工程量',
      org: '中国建筑第一工程局有限公司',
      project: '区域联采',
      area: '西南大区',
      method: '公开招标',
      category: '劳务分包',
      manager: '奥巴马',
    },
    {
      key: '3',
      status: '投标中',
      code: 'cscec202604160000020159',
      name: '136工程量回归',
      org: '中建四局华南建设有限公司',
      project: '区域联采',
      area: '西南大区',
      method: '公开招标',
      category: '劳务分包',
      manager: '奥巴马',
    },
    {
      key: '4',
      status: '招标完成',
      code: 'cscec202604150000000555',
      name: '136回归',
      org: '中建四局华南建设有限公司',
      project: '区域联采',
      area: '西南大区',
      method: '公开招标',
      category: '物资',
      manager: '奥巴马',
    },
  ];

  const columns = [
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (text: string) => (
        <span className={`status-${text}`}>{text}</span>
      ),
    },
    {
      title: '招标编号',
      dataIndex: 'code',
      key: 'code',
      width: 200,
      render: (text: string) => (
        <div className="bidding-code-link">
          <span className="icon-blue-badge">136</span>
          {text}
        </div>
      ),
    },
    {
      title: '招标名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '组织机构',
      dataIndex: 'org',
      key: 'org',
      width: 200,
    },
    {
      title: '使用项目',
      dataIndex: 'project',
      key: 'project',
      width: 150,
    },
    {
      title: '区域',
      dataIndex: 'area',
      key: 'area',
      width: 150,
    },
    {
      title: '招标方式',
      dataIndex: 'method',
      key: 'method',
      width: 120,
    },
    {
      title: '招标品类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
    },
    {
      title: '经办人',
      dataIndex: 'manager',
      key: 'manager',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: () => (
        <div className="action-links">
          <span className="action-link">查看</span>
          <span className="action-link">更多 <ChevronDown className="icon-small" /></span>
        </div>
      ),
    },
  ];

  return (
    <ConfigProvider locale={zhCN}>
      <div className="bidding-list-page">
        {/* 顶部导航栏 */}
        <header className="top-header">
          <div className="header-left">
            <img src={logoImage} alt="集采工作台" className="logo-img" />
          </div>
          <div className="header-center">
            <div className="org-selector">
              <span>中国建筑股份...</span>
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
              <span className="nav-link"><Home className="icon-small" /> 云筑首页</span>
              <span className="nav-link"><Layout className="icon-small" /> 寻源工作台</span>
              <span className="nav-link highlight">发布招募需求</span>
              <span className="nav-link">与 切换新版</span>
            </div>
            <div className="header-actions">
              <div className="action-icon"><Star className="icon-small" /></div>
              <div className="action-icon"><Download className="icon-small" /></div>
              <div className="action-icon"><HelpCircle className="icon-small" /></div>
              <div className="action-icon">
                <Bell className="icon-small" />
                <span className="badge">71</span>
              </div>
              <div className="user-info">
                <div className="user-avatar">奥</div>
                <span className="username">奥巴马</span>
                <ChevronDown className="icon-small" />
              </div>
            </div>
          </div>
        </header>

        <div className="main-container">
          {/* 左侧侧边栏 */}
          <aside className="sidebar">
            <div className="sidebar-menu">
              <div className="menu-item">
                <Home className="menu-icon" />
                <span className="menu-text">首页</span>
              </div>
              <div className="menu-item">
                <Shield className="menu-icon" />
                <span className="menu-text">权限</span>
              </div>
              <div className="menu-item">
                <ShoppingCart className="menu-icon" />
                <span className="menu-text">采购</span>
              </div>
              <div className="menu-item">
                <Users className="menu-icon" />
                <span className="menu-text">分供</span>
              </div>
              <div className="menu-item active">
                <FileText className="menu-icon" />
                <span className="menu-text">招标</span>
              </div>
              <div className="menu-item">
                <Layout className="menu-icon" />
                <span className="menu-text">工程</span>
              </div>
              <div className="menu-item">
                <ShoppingCart className="menu-icon" />
                <span className="menu-text">联采</span>
              </div>
              <div className="menu-item">
                <FileText className="menu-icon" />
                <span className="menu-text">合同</span>
              </div>
              <div className="menu-item">
                <HelpCircle className="menu-icon" />
                <span className="menu-text">投诉</span>
              </div>
              <div className="menu-item">
                <ShoppingCart className="menu-icon" />
                <span className="menu-text">清欠</span>
              </div>
              <div className="menu-item">
                <ShoppingCart className="menu-icon" />
                <span className="menu-text">收验</span>
              </div>
            </div>
          </aside>

          {/* 主内容区 */}
          <main className="main-content">
            {/* 面包屑 */}
            <div className="breadcrumb-bar">
              <span>招标采购</span>
              <span className="breadcrumb-separator"><ChevronRight className="icon-small" /></span>
              <span className="breadcrumb-current">招标列表</span>
            </div>

            {/* 查询卡片 */}
            <div className="query-card">
              <div className="query-form-row">
                <div className="query-item">
                  <label>组织机构</label>
                  <div className="query-field-container">
                    <Select placeholder="全部" className="query-select" options={[{ value: 'all', label: '全部' }]} defaultValue="all" />
                    <Checkbox className="query-checkbox" checked>包含下级</Checkbox>
                  </div>
                </div>
                <div className="query-item">
                  <label>招标编号</label>
                  <div className="query-field-container">
                    <Input placeholder="请输入" className="query-input" />
                    <Checkbox className="query-checkbox">精确搜索</Checkbox>
                  </div>
                </div>
                <div className="query-item">
                  <label>招标名称</label>
                  <div className="query-field-container">
                    <Input placeholder="请输入" className="query-input" />
                  </div>
                </div>
                <div className="query-item">
                  <label>招标状态</label>
                  <div className="query-field-container">
                    <Select placeholder="全部" className="query-select" options={[{ value: 'all', label: '全部' }]} defaultValue="all" />
                    <Checkbox className="query-checkbox" checked>包含已废标</Checkbox>
                  </div>
                </div>
                <div className="query-item">
                  <label>招标方式</label>
                  <div className="query-field-container">
                    <Select placeholder="全部" className="query-select" options={[{ value: 'all', label: '全部' }]} defaultValue="all" />
                  </div>
                </div>
                <div className="query-item">
                  <label>合作品类</label>
                  <div className="query-field-container">
                    <Select placeholder="全部" className="query-select" options={[{ value: 'all', label: '全部' }]} defaultValue="all" />
                  </div>
                </div>
                <div className="query-item">
                  <label>经办人</label>
                  <div className="query-field-container">
                    <Input placeholder="请输入" className="query-input" />
                    <Checkbox className="query-checkbox" checked>本人经办</Checkbox>
                  </div>
                </div>
                <div className="query-actions">
                  <Button type="primary" className="btn-primary">查询</Button>
                  <Button>重置</Button>
                  <Button type="link">展开 <ChevronDown className="icon-small" /></Button>
                </div>
              </div>
            </div>

            {/* 操作工具栏 */}
            <div className="action-bar">
              <div className="action-buttons">
                <Button type="primary" className="btn-primary">开启招标</Button>
                <Button>从废旧物资申请发起招标</Button>
                <Button>从投标方推荐发起招标</Button>
                <Button>导出</Button>
                <Button icon={<Settings className="icon-small" />} />
              </div>
              <div className="action-stats">
                本页: 10条 总计: 1408条
              </div>
            </div>

            {/* 数据表格 */}
            <div className="table-wrapper">
              <Table 
                columns={columns} 
                dataSource={tableData} 
                pagination={false}
                scroll={{ x: 1500 }}
              />
            </div>
          </main>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default Component;
