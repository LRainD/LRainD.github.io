import React, { useState } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  Download,
  Home,
  ShoppingCart,
  FileText,
  BarChart3,
  Users,
  Shield,
  PanelLeftClose,
  PanelLeft,
  HelpCircle,
  Building2,
} from 'lucide-react';
import { ConfigProvider, Tag } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

import logoImage from '../../../assets/media/集采工作台logo图标.png';
import './style.css';

// 分供商基本信息
const supplierBasicInfo = {
  supplierId: 'SUP202604170001',
  supplierName: 'XXX建材有限公司',
  supplierType: '核心分供商',
  businessStatus: '正常经营',
};

// 命中风控规则数据 - 只保留信息重叠相关
const hitRiskRules = [
  {
    id: '1',
    seq: 1,
    warningRule: '核心分供商信息重叠风险',
    ruleLevel: '股份级',
    ruleType: '合规风险',
    warningLevel: '高风险',
    warningType: '预警',
    warningCount: 1,
    ruleConfig: '核心分供商存在信息重叠风险',
    currentData: '核心分供商: XXX有限公司 邮箱: 123456@qq.com',
    releaseStatus: '未解除',
    releaseMethod: '-',
    orgName: '测试组织-股份公司-简称',
    businessNo: 'BBI202604170000751870',
    businessName: '课程演示',
    businessStatus: '招标文件编制中',
    businessDomain: '云筑集采',
    category: '物资',
    businessType: '招投标-非招采购',
    businessLink: '发标',
    operator: '云小匠1',
    createTime: '2026-04-17 14:06:40',
    completeTime: '-',
    latestWarningTime: '2026-04-17 14:10:46',
    overlapDetails: [
      { supplierId: 'SUP202304120089', supplierName: 'YYY建材有限公司', overlapType: '邮箱重叠', overlapValue: '123456@qq.com' },
      { supplierId: 'SUP202305210156', supplierName: 'ZZZ贸易有限公司', overlapType: '电话重叠', overlapValue: '13800138000' },
    ],
  },
  {
    id: '2',
    seq: 2,
    warningRule: '信息重叠',
    ruleLevel: '股份级',
    ruleType: '合规风险',
    warningLevel: '中风险',
    warningType: '预警',
    warningCount: 2,
    ruleConfig: '开启信息重叠校验',
    currentData: 'sup209,sup208,钟莉sup201 存在信息重叠',
    releaseStatus: '未解除',
    releaseMethod: '-',
    orgName: '测试组织-股份公司-简称',
    businessNo: 'BBI2026041600001692041',
    businessName: 'qiqi-直接',
    businessStatus: '定标审批中',
    businessDomain: '云筑集采',
    category: '物资',
    businessType: '招投标-非招采购',
    businessLink: '定标',
    operator: 'jctest1',
    createTime: '2026-04-16 20:46:50',
    completeTime: '-',
    latestWarningTime: '2026-04-16 21:09:07',
    overlapDetails: [
      { supplierId: 'SUP202201000045', supplierName: '钟莉建材商行', overlapType: '法人重叠', overlapValue: '钟莉' },
      { supplierId: 'SUP202202000078', supplierName: 'sup208工程有限公司', overlapType: '地址重叠', overlapValue: '广州市天河区XXX路' },
    ],
  },
];

const Component: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  dayjs.locale('zh-cn');

  const getWarningLevelColor = (level: string) => {
    switch (level) {
      case '高风险':
        return 'text-red-600';
      case '中风险':
        return 'text-orange-500';
      case '低风险':
        return 'text-green-500';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <ConfigProvider locale={zhCN}>
      <div className="supplier-risk-detail">
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
                <span className="username">jctest1</span>
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
              <div className={`menu-group active ${sidebarCollapsed ? 'collapsed' : ''}`}>
                <div className="menu-group-title">
                  <Shield className="menu-icon" />
                  <span className="menu-text">风控预警中心</span>
                  <ChevronDown className="arrow-icon" />
                  {sidebarCollapsed && <span className="menu-text-collapsed">风控</span>}
                </div>
                <div className="sub-menu">
                  <div className="sub-menu-item">业务预警监控</div>
                  <div className="sub-menu-item active">风控预警明细</div>
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
              <span>风控预警中心</span>
              <span className="separator">/</span>
              <span>风控预警明细</span>
              <span className="separator">/</span>
              <span className="current">分供商风控详情</span>
            </div>

            {/* 分供商基本信息卡片 - 简化版 */}
            <div className="supplier-header-card">
              <div className="supplier-header-main">
                <div className="supplier-icon">
                  <Building2 className="icon-large" />
                </div>
                <div className="supplier-header-info">
                  <div className="supplier-name-row">
                    <h1 className="supplier-name">{supplierBasicInfo.supplierName}</h1>
                    <Tag color="blue">{supplierBasicInfo.supplierType}</Tag>
                    <Tag color="green">{supplierBasicInfo.businessStatus}</Tag>
                  </div>
                  <div className="supplier-code">分供商编号：{supplierBasicInfo.supplierId}</div>
                </div>
              </div>
            </div>

            {/* 风控规则命中情况 - 表格样式 */}
            <div className="table-section">
              <div className="table-header">
                <div className="table-title">风控规则命中情况</div>
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="fixed-left">序号</th>
                      <th>预警规则</th>
                      <th>规则级别</th>
                      <th>规则类型</th>
                      <th>预警级别</th>
                      <th>预警类型</th>
                      <th>预警次数</th>
                      <th>规则配置</th>
                      <th>当前数据</th>
                      <th>解除状态</th>
                      <th>解除方式</th>
                      <th>组织名称</th>
                      <th>业务编号</th>
                      <th>业务名称</th>
                      <th>业务状态</th>
                      <th>业务域</th>
                      <th>品类</th>
                      <th>业务类型</th>
                      <th>业务环节</th>
                      <th>操作人</th>
                      <th>业务创建时间</th>
                      <th>业务完成时间</th>
                      <th>最新预警时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hitRiskRules.map((row) => (
                      <React.Fragment key={row.id}>
                        <tr>
                          <td className="fixed-left">{row.seq}</td>
                          <td>
                            <span className="link-blue">{row.warningRule}</span>
                          </td>
                          <td>{row.ruleLevel}</td>
                          <td>{row.ruleType}</td>
                          <td className={getWarningLevelColor(row.warningLevel)}>{row.warningLevel}</td>
                          <td>{row.warningType}</td>
                          <td>{row.warningCount}</td>
                          <td>{row.ruleConfig}</td>
                          <td>{row.currentData}</td>
                          <td>
                            <Tag color={row.releaseStatus === '未解除' ? 'error' : 'success'}>
                              {row.releaseStatus}
                            </Tag>
                          </td>
                          <td>{row.releaseMethod}</td>
                          <td>{row.orgName}</td>
                          <td>{row.businessNo}</td>
                          <td>{row.businessName}</td>
                          <td>{row.businessStatus}</td>
                          <td>{row.businessDomain}</td>
                          <td>{row.category}</td>
                          <td>{row.businessType}</td>
                          <td>{row.businessLink}</td>
                          <td>{row.operator}</td>
                          <td>{row.createTime}</td>
                          <td>{row.completeTime}</td>
                          <td>{row.latestWarningTime}</td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 底部操作栏 */}
            <div className="bottom-action-bar">
              <button className="btn btn-primary">发起退出</button>
            </div>
          </main>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default Component;
