import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  Download,
  Settings,
  Calendar,
  Home,
  ShoppingCart,
  FileText,
  BarChart3,
  Users,
  Shield,
  PanelLeftClose,
  PanelLeft,
  HelpCircle,
  Globe,
  Plus,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Info,
  CheckCircle,
  AlertCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import logoImage from '../../../assets/media/集采工作台logo图标.png';
import './style.css';

// 模拟数据
const mockTableData = [
  {
    id: '1',
    seq: 1,
    warningRule: '采购-最短报价时间',
    ruleLevel: '股份级',
    ruleType: '管理要求',
    warningLevel: '中风险',
    warningType: '预警',
    warningCount: 1,
    ruleConfig: '最短报价天数2天且 应急采购【需要】管控',
    currentData: '报价天数0天',
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
  },
  {
    id: '2',
    seq: 2,
    warningRule: '采购-最短报价时间',
    ruleLevel: '股份级',
    ruleType: '管理要求',
    warningLevel: '中风险',
    warningType: '预警',
    warningCount: 2,
    ruleConfig: '最短报价天数2天且 应急采购【需要】管控',
    currentData: '报价天数0天',
    releaseStatus: '未解除',
    releaseMethod: '-',
    orgName: '测试组织-股份公司-简称',
    businessNo: 'BBI202604170000750846',
    businessName: '课程演示',
    businessStatus: '投标截止',
    businessDomain: '云筑集采',
    category: '物资',
    businessType: '招投标-非招采购',
    businessLink: '发标',
    operator: '云小匠1',
    createTime: '2026-04-17 14:03:25',
    completeTime: '-',
    latestWarningTime: '2026-04-17 14:08:33',
  },
  {
    id: '3',
    seq: 3,
    warningRule: '采购-最短报价时间',
    ruleLevel: '股份级',
    ruleType: '管理要求',
    warningLevel: '中风险',
    warningType: '预警',
    warningCount: 2,
    ruleConfig: '最短报价天数2天且 应急采购【需要】管控',
    currentData: '报价天数257天',
    releaseStatus: '已解除',
    releaseMethod: '预警解除',
    orgName: '测试组织-股份公司-简称',
    businessNo: 'BBI202604170000716624',
    businessName: '课程演示',
    businessStatus: '投标中',
    businessDomain: '云筑集采',
    category: '物资',
    businessType: '招投标-非招采购',
    businessLink: '发标',
    operator: '云小匠1',
    createTime: '2026-04-17 13:36:38',
    completeTime: '-',
    latestWarningTime: '2026-04-17 13:42:52',
  },
  {
    id: '4',
    seq: 4,
    warningRule: '组织最低集中采购率',
    ruleLevel: '股份级',
    ruleType: '管理要求',
    warningLevel: '高风险',
    warningType: '预警',
    warningCount: 1,
    ruleConfig: '集中采购率>=90%',
    currentData: '集中采购率：90.00%',
    releaseStatus: '未解除',
    releaseMethod: '-',
    orgName: '测试组织-股份公司-简称',
    businessNo: 'BBI2026041600001694300',
    businessName: '回归工程量1',
    businessStatus: '投标中',
    businessDomain: '云筑集采',
    category: '劳务分包',
    businessType: '招投标-招标采购',
    businessLink: '约标',
    operator: 'jctest1',
    createTime: '2026-04-16 21:20:27',
    completeTime: '-',
    latestWarningTime: '2026-04-16 21:20:29',
  },
  {
    id: '5',
    seq: 5,
    warningRule: '组织最低公开采购率',
    ruleLevel: '股份级',
    ruleType: '管理要求',
    warningLevel: '低风险',
    warningType: '预警',
    warningCount: 1,
    ruleConfig: '公开招标率>=100%',
    currentData: '公开招标率：90.00%',
    releaseStatus: '未解除',
    releaseMethod: '-',
    orgName: '测试组织-股份公司-简称',
    businessNo: 'BBI2026041600001694300',
    businessName: '回归工程量1',
    businessStatus: '投标中',
    businessDomain: '云筑集采',
    category: '劳务分包',
    businessType: '招投标-招标采购',
    businessLink: '约标',
    operator: 'jctest1',
    createTime: '2026-04-16 21:20:27',
    completeTime: '-',
    latestWarningTime: '2026-04-16 21:20:29',
  },
  {
    id: '6',
    seq: 6,
    warningRule: '招标时长过长',
    ruleLevel: '局级',
    ruleType: '管理要求',
    warningLevel: '高风险',
    warningType: '预警',
    warningCount: 1,
    ruleConfig: '招标时长>10.0分钟',
    currentData: '招标时长27分钟',
    releaseStatus: '未解除',
    releaseMethod: '-',
    orgName: '测试组织-股份公司-简称',
    businessNo: 'BBI2026041600001714493',
    businessName: '回归1111',
    businessStatus: '招标完成',
    businessDomain: '云筑集采',
    category: '物资',
    businessType: '招投标-招标采购',
    businessLink: '定标',
    operator: 'jctest1',
    createTime: '2026-04-16 20:33:47',
    completeTime: '2026-04-16 21:09:31',
    latestWarningTime: '2026-04-16 21:09:32',
  },
  {
    id: '7',
    seq: 7,
    warningRule: '招标时长过短',
    ruleLevel: '局级',
    ruleType: '管理要求',
    warningLevel: '低风险',
    warningType: '预警',
    warningCount: 1,
    ruleConfig: '招标时长<20207.0分钟',
    currentData: '招标时长27分钟',
    releaseStatus: '未解除',
    releaseMethod: '-',
    orgName: '测试组织-股份公司-简称',
    businessNo: 'BBI2026041600001714493',
    businessName: '回归1111',
    businessStatus: '招标完成',
    businessDomain: '云筑集采',
    category: '物资',
    businessType: '招投标-招标采购',
    businessLink: '定标',
    operator: 'jctest1',
    createTime: '2026-04-16 20:33:47',
    completeTime: '2026-04-16 21:09:31',
    latestWarningTime: '2026-04-16 21:08:18',
  },
  {
    id: '8',
    seq: 8,
    warningRule: '信息重叠',
    ruleLevel: '股份级',
    ruleType: '合规风险',
    warningLevel: '中风险',
    warningType: '预警',
    warningCount: 1,
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
  },
  {
    id: '9',
    seq: 9,
    warningRule: '信息重叠',
    ruleLevel: '股份级',
    ruleType: '合规风险',
    warningLevel: '中风险',
    warningType: '预警',
    warningCount: 2,
    ruleConfig: '开启信息重叠校验',
    currentData: '彭才林,sup312,sup205mq监听测试11111 存在信...',
    releaseStatus: '存在信...',
    releaseMethod: '未解除',
    orgName: '测试组织-股份公司-简称',
    businessNo: 'BBI2026041600001714493',
    businessName: '回归1111',
    businessStatus: '招标完成',
    businessDomain: '云筑集采',
    category: '物资',
    businessType: '招投标-招标采购',
    businessLink: '定标',
    operator: 'jctest1',
    createTime: '2026-04-16 20:33:47',
    completeTime: '2026-04-16 21:09:31',
    latestWarningTime: '2026-04-16 21:08:18',
  },
  {
    id: '10',
    seq: 10,
    warningRule: '中标金额超概算金额校验',
    ruleLevel: '局级',
    ruleType: '合规风险',
    warningLevel: '中风险',
    warningType: '预警',
    warningCount: 1,
    ruleConfig: '中标金额超过招标概算金额比例≤10%且中标金额低于概算金额比例≤2%',
    currentData: '拟中标供应商平均合计为6099.00元,概算金额为1...',
    releaseStatus: '未解除',
    releaseMethod: '-',
    orgName: '测试组织-股份公司-简称',
    businessNo: 'BBI2026041600001714493',
    businessName: '回归1111',
    businessStatus: '招标完成',
    businessDomain: '云筑集采',
    category: '物资',
    businessType: '招投标-招标采购',
    businessLink: '定标',
    operator: 'jctest1',
    createTime: '2026-04-16 20:33:47',
    completeTime: '2026-04-16 21:09:31',
    latestWarningTime: '2026-04-16 21:08:18',
  },
];

// 统计数据
const statisticsData = {
  warningCount: {
    total: 1721,
    intercepted: 37,
    warned: 1684,
    interceptRate: '2.16%',
    warnRate: '97.85%',
  },
  businessWarning: {
    total: 1046,
    bidding: { count: 877, warning: 1480, intercept: 37, rate: '83.84%' },
    contract: { count: 161, warning: 192, intercept: 0, rate: '15.39%' },
    performance: { count: 8, warning: 12, intercept: 0, rate: '0.76%' },
  },
  warningRelease: {
    releaseRate: '4.59%',
    released: 48,
    unreleased: 998,
  },
};

const Component: React.FC = () => {
  const [isQueryExpanded, setIsQueryExpanded] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 表格列定义
  const columns = [
    { title: '序号', dataIndex: 'seq', width: 60, fixed: 'left' },
    { title: '预警规则', dataIndex: 'warningRule', width: 180, fixed: 'left' },
    { title: '规则等级', dataIndex: 'ruleLevel', width: 100 },
    { title: '规则类型', dataIndex: 'ruleType', width: 100 },
    { title: '预警级别', dataIndex: 'warningLevel', width: 100 },
    { title: '预警类型', dataIndex: 'warningType', width: 80 },
    { title: '预警次数', dataIndex: 'warningCount', width: 80 },
    { title: '规则配置', dataIndex: 'ruleConfig', width: 280 },
    { title: '当前数据', dataIndex: 'currentData', width: 200 },
    { title: '预警解除状态', dataIndex: 'releaseStatus', width: 120 },
    { title: '解除方式', dataIndex: 'releaseMethod', width: 100 },
    { title: '组织机构', dataIndex: 'orgName', width: 180 },
    {
      title: '业务编号',
      dataIndex: 'businessNo',
      width: 200,
      render: (text: string) => (
        <a className="text-blue-600 hover:text-blue-800 cursor-pointer">{text}</a>
      ),
    },
    { title: '业务名称', dataIndex: 'businessName', width: 120 },
    { title: '业务状态', dataIndex: 'businessStatus', width: 120 },
    { title: '业务域', dataIndex: 'businessDomain', width: 100 },
    { title: '品类', dataIndex: 'category', width: 100 },
    { title: '业务类型', dataIndex: 'businessType', width: 140 },
    { title: '业务环节', dataIndex: 'businessLink', width: 80 },
    { title: '经办人', dataIndex: 'operator', width: 100 },
    { title: '业务创建时间', dataIndex: 'createTime', width: 160 },
    { title: '业务完成时间', dataIndex: 'completeTime', width: 160 },
    { title: '最新预警时间', dataIndex: 'latestWarningTime', width: 160 },
  ];

  // 预警级别标签颜色
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
    <div className="business-warning-monitor">
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
              {!sidebarCollapsed && <span>首页</span>}
            </div>
            <div className="menu-item">
              <ShoppingCart className="menu-icon" />
              {!sidebarCollapsed && <span>验收货</span>}
            </div>
            <div className="menu-item">
              <BarChart3 className="menu-icon" />
              {!sidebarCollapsed && <span>数据服务</span>}
            </div>
            <div className="menu-item">
              <Users className="menu-icon" />
              {!sidebarCollapsed && <span>互助宝</span>}
            </div>
            <div className="menu-item">
              <FileText className="menu-icon" />
              {!sidebarCollapsed && <span>资产管理</span>}
            </div>
            <div className="menu-item">
              <ShoppingCart className="menu-icon" />
              {!sidebarCollapsed && <span>物资管理</span>}
            </div>
            <div className="menu-item">
              <FileText className="menu-icon" />
              {!sidebarCollapsed && <span>物资设备管理系统</span>}
            </div>
            <div className="menu-item">
              <FileText className="menu-icon" />
              {!sidebarCollapsed && <span>工程局发券</span>}
            </div>
            <div className="menu-item">
              <Home className="menu-icon" />
              {!sidebarCollapsed && <span>云筑学苑</span>}
            </div>
            <div className="menu-item">
              <Users className="menu-icon" />
              {!sidebarCollapsed && <span>云筑峰会</span>}
            </div>
            <div className="menu-item">
              <BarChart3 className="menu-icon" />
              {!sidebarCollapsed && <span>价格库</span>}
            </div>
            <div className="menu-group active">
              <div className="menu-group-title">
                <Shield className="menu-icon" />
                {!sidebarCollapsed && (
                  <>
                    <span>风控预警中心</span>
                    <ChevronDown className="arrow-icon" />
                  </>
                )}
              </div>
              {!sidebarCollapsed && (
                <div className="sub-menu">
                  <div className="sub-menu-item active">业务预警监控</div>
                  <div className="sub-menu-item">风控预警明细</div>
                  <div className="sub-menu-item">风控预警汇总</div>
                  <div className="sub-menu-item">风控预警看板</div>
                </div>
              )}
            </div>
          </div>
          <div className="sidebar-collapse" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            {sidebarCollapsed ? <PanelLeft className="icon" /> : <PanelLeftClose className="icon" />}
            {!sidebarCollapsed && <span>收起菜单</span>}
          </div>
        </aside>

        {/* 主内容区 */}
        <main className="main-content">
          {/* 面包屑 */}
          <div className="breadcrumb">
            <span>风控预警中心</span>
            <span className="separator">&gt;</span>
            <span className="current">业务预警监控</span>
          </div>

          {/* 查询区域 */}
          <div className="query-section">
            <div className="query-header">
              <span className="query-title">查询</span>
              <div className="query-toggle" onClick={() => setIsQueryExpanded(!isQueryExpanded)}>
                {isQueryExpanded ? (
                  <>
                    <span>收起</span>
                    <ArrowUp className="icon-small" />
                  </>
                ) : (
                  <>
                    <span>展开</span>
                    <ArrowDown className="icon-small" />
                  </>
                )}
              </div>
            </div>
            
            {isQueryExpanded && (
              <div className="query-form">
                <div className="query-row">
                  <div className="query-item">
                    <label>组织机构</label>
                    <div className="select-box with-checkbox">
                      <span>测试组织-股份公司</span>
                      <div className="checkbox-wrapper">
                        <input type="checkbox" checked readOnly />
                        <span className="checkbox-label">包含下级</span>
                      </div>
                      <ChevronDown className="icon-small" />
                    </div>
                  </div>
                  <div className="query-item">
                    <label>预警规则</label>
                    <div className="select-box placeholder">
                      <span>请选择预警规则</span>
                      <ChevronDown className="icon-small" />
                    </div>
                  </div>
                  <div className="query-item">
                    <label>业务域</label>
                    <div className="select-box">
                      <span>云筑集采</span>
                      <ChevronDown className="icon-small" />
                    </div>
                  </div>
                </div>
                
                <div className="query-row">
                  <div className="query-item">
                    <label>业务类型</label>
                    <div className="select-box placeholder">
                      <span>请选择</span>
                      <ChevronDown className="icon-small" />
                    </div>
                  </div>
                  <div className="query-item">
                    <label>业务编号</label>
                    <input type="text" placeholder="请输入业务编号" />
                  </div>
                  <div className="query-item">
                    <label>业务名称</label>
                    <input type="text" placeholder="请输入业务名称" />
                  </div>
                </div>
                
                <div className="query-row">
                  <div className="query-item">
                    <label>业务环节</label>
                    <div className="select-box placeholder">
                      <span>请选择环节</span>
                      <ChevronDown className="icon-small" />
                    </div>
                  </div>
                  <div className="query-item">
                    <label>业务状态</label>
                    <input type="text" placeholder="请输入业务状态" />
                  </div>
                  <div className="query-item">
                    <label>业务创建时间</label>
                    <div className="date-range">
                      <input type="text" placeholder="开始日期" />
                      <span>—</span>
                      <input type="text" placeholder="结束日期" />
                      <Calendar className="icon-small" />
                    </div>
                  </div>
                </div>
                
                <div className="query-row">
                  <div className="query-item">
                    <label>业务完成时间</label>
                    <div className="date-range">
                      <input type="text" placeholder="开始日期" />
                      <span>—</span>
                      <input type="text" placeholder="结束日期" />
                      <Calendar className="icon-small" />
                    </div>
                  </div>
                  <div className="query-item">
                    <label>经办人</label>
                    <input type="text" placeholder="请输入经办人名称" />
                  </div>
                  <div className="query-item">
                    <label>规则等级</label>
                    <div className="select-box placeholder">
                      <span>请选择规则等级</span>
                      <ChevronDown className="icon-small" />
                    </div>
                  </div>
                </div>
                
                <div className="query-row">
                  <div className="query-item">
                    <label>规则类型</label>
                    <div className="select-box placeholder">
                      <span>请选择规则类型</span>
                      <ChevronDown className="icon-small" />
                    </div>
                  </div>
                  <div className="query-item">
                    <label>预警级别</label>
                    <div className="select-box placeholder">
                      <span>请选择预警级别</span>
                      <ChevronDown className="icon-small" />
                    </div>
                  </div>
                  <div className="query-item">
                    <label>预警类型</label>
                    <div className="select-box placeholder">
                      <span>请选择预警类型</span>
                      <ChevronDown className="icon-small" />
                    </div>
                  </div>
                </div>
                
                <div className="query-row">
                  <div className="query-item">
                    <label>预警解除状态</label>
                    <div className="select-box">
                      <span>全部</span>
                      <ChevronDown className="icon-small" />
                    </div>
                  </div>
                  <div className="query-item">
                    <label>解除方式</label>
                    <div className="select-box placeholder">
                      <span>请选择解除方式</span>
                      <ChevronDown className="icon-small" />
                    </div>
                  </div>
                  <div className="query-item">
                    <label>预警时间</label>
                    <div className="date-range">
                      <input type="text" value="2026-01-17" readOnly />
                      <span>—</span>
                      <input type="text" value="2026-04-17" readOnly />
                      <Calendar className="icon-small" />
                    </div>
                  </div>
                </div>
                
                <div className="query-row last-row">
                  <div className="query-item checkbox-item">
                    <input type="checkbox" />
                    <label>包含已废标/已废除数据</label>
                  </div>
                </div>
                
                <div className="query-actions">
                  <button className="btn btn-primary">查询</button>
                  <button className="btn btn-default">重置</button>
                </div>
              </div>
            )}
          </div>

          {/* 统计卡片区域 */}
          <div className="statistics-section">
            <div className="stat-card green">
              <div className="stat-header">
                <span className="stat-title">预警次数统计</span>
                <span className="stat-subtitle">(1,721次)</span>
                <Info className="info-icon" />
              </div>
              <div className="stat-content">
                <div className="stat-row">
                  <span className="stat-label">拦截</span>
                  <span className="stat-value">37次, {statisticsData.warningCount.interceptRate}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">预警</span>
                  <span className="stat-value">1,684次, {statisticsData.warningCount.warnRate}</span>
                </div>
              </div>
            </div>
            
            <div className="stat-card orange">
              <div className="stat-header">
                <span className="stat-title">业务预警统计</span>
                <span className="stat-subtitle">(1,046次)</span>
                <Info className="info-icon" />
              </div>
              <div className="stat-content">
                <div className="stat-row">
                  <span className="stat-label">招投标</span>
                  <span className="stat-value">877次（预警：1,480次，拦截：37次）, {statisticsData.businessWarning.bidding.rate}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">合同</span>
                  <span className="stat-value">161次（预警：192次，拦截：0次）, {statisticsData.businessWarning.contract.rate}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">履约</span>
                  <span className="stat-value">8次（预警：12次，拦截：0次）, {statisticsData.businessWarning.performance.rate}</span>
                </div>
              </div>
            </div>
            
            <div className="stat-card blue">
              <div className="stat-header">
                <span className="stat-title">预警解除统计</span>
                <span className="stat-subtitle">(预警解除率：4.59%)</span>
                <Info className="info-icon" />
              </div>
              <div className="stat-content">
                <div className="stat-row">
                  <span className="stat-label">已解除</span>
                  <span className="stat-value">48次, 4.59%</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">未解除</span>
                  <span className="stat-value">998次, 95.41%</span>
                </div>
              </div>
            </div>
          </div>

          {/* 操作栏 */}
          <div className="toolbar">
            <div className="toolbar-left">
              <button className="btn btn-text">
                <Download className="icon-small" />
                导出
              </button>
              <button className="btn btn-text">
                <Settings className="icon-small" />
              </button>
            </div>
          </div>

          {/* 提示信息 */}
          <div className="notice-bar">
            <Info className="notice-icon" />
            <span>注：同一个业务订单可能多次触发某个预警规则，业务单据创建过程中仅记录触发预警的预警规则且预警次数为1</span>
          </div>

          {/* 数据表格 */}
          <div className="table-section">
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="fixed-left" style={{ width: 60 }}>序号</th>
                    <th className="fixed-left" style={{ width: 180 }}>预警规则</th>
                    <th style={{ width: 100 }}>规则等级</th>
                    <th style={{ width: 100 }}>规则类型</th>
                    <th style={{ width: 100 }}>预警级别</th>
                    <th style={{ width: 80 }}>预警类型</th>
                    <th style={{ width: 80 }}>预警次数</th>
                    <th style={{ width: 280 }}>规则配置</th>
                    <th style={{ width: 200 }}>当前数据</th>
                    <th style={{ width: 120 }}>预警解除状态</th>
                    <th style={{ width: 100 }}>解除方式</th>
                    <th style={{ width: 180 }}>组织机构</th>
                    <th style={{ width: 200 }}>业务编号</th>
                    <th style={{ width: 120 }}>业务名称</th>
                    <th style={{ width: 120 }}>业务状态</th>
                    <th style={{ width: 100 }}>业务域</th>
                    <th style={{ width: 100 }}>品类</th>
                    <th style={{ width: 140 }}>业务类型</th>
                    <th style={{ width: 80 }}>业务环节</th>
                    <th style={{ width: 100 }}>经办人</th>
                    <th style={{ width: 160 }}>业务创建时间</th>
                    <th style={{ width: 160 }}>业务完成时间</th>
                    <th style={{ width: 160 }}>最新预警时间</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTableData.map((row) => (
                    <tr key={row.id}>
                      <td className="fixed-left">{row.seq}</td>
                      <td className="fixed-left">{row.warningRule}</td>
                      <td>{row.ruleLevel}</td>
                      <td>{row.ruleType}</td>
                      <td className={getWarningLevelColor(row.warningLevel)}>{row.warningLevel}</td>
                      <td>{row.warningType}</td>
                      <td>{row.warningCount}</td>
                      <td>{row.ruleConfig}</td>
                      <td>{row.currentData}</td>
                      <td>{row.releaseStatus}</td>
                      <td>{row.releaseMethod}</td>
                      <td>{row.orgName}</td>
                      <td>
                        <a className="link-blue">{row.businessNo}</a>
                      </td>
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 分页 */}
          <div className="pagination-section">
            <div className="pagination-left">
              <span>第 1-10 条/总共 1046 条</span>
            </div>
            <div className="pagination-center">
              <button className="page-btn" disabled>&lt;</button>
              <button className="page-btn active">1</button>
              <button className="page-btn">2</button>
              <button className="page-btn">3</button>
              <button className="page-btn">4</button>
              <button className="page-btn">5</button>
              <span className="page-ellipsis">...</span>
              <button className="page-btn">105</button>
              <button className="page-btn">&gt;</button>
            </div>
            <div className="pagination-right">
              <span>10 条/页</span>
              <span>跳至</span>
              <input type="text" className="page-input" />
              <span>页</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Component;
