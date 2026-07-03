/**
 * @name 运营解决方案配置-工商关联规则
 */
import React, { useState } from 'react';
import {
  AuditOutlined,
  CheckCircleOutlined,
  ContainerOutlined,
  DownloadOutlined,
  FileProtectOutlined,
  FileTextOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  SettingOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  SolutionOutlined,
  TeamOutlined,
  ToolOutlined,
  UserOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { Input, Layout, Menu, Radio, Switch, Tree } from 'antd';
import logoImage from '../../../assets/media/运营后台左上角logo.png';
import './style.css';

const { Sider, Content } = Layout;

// 左侧菜单项 - 运营后台风格（与 solution-config 保持一致）
const menuItems = [
  { key: 'supplier_mgmt', icon: <TeamOutlined />, label: '分供商管理' },
  { key: 'template_mgmt', icon: <FileTextOutlined />, label: '模板管理' },
  { key: 'procurement_plan', icon: <ShoppingCartOutlined />, label: '采购计划管理' },
  { key: 'bidding', icon: <AuditOutlined />, label: '招标采购' },
  { key: 'config_mgmt', icon: <SettingOutlined />, label: '配置管理' },
  { key: 'identity_mgmt', icon: <SafetyCertificateOutlined />, label: '身份管理' },
  {
    key: 'solution',
    icon: <SolutionOutlined />,
    label: '解决方案',
    children: [
      { key: 'param_level_config', label: '参数层级配置' },
      { key: 'product_solution_config', label: '产品解决方案配置' },
      { key: 'operation_solution_config', label: '运营解决方案配置' }
    ]
  },
  { key: 'contract_mgmt', icon: <FileProtectOutlined />, label: '合同管理' },
  { key: 'performance_mgmt', icon: <CheckCircleOutlined />, label: '履约管理' },
  { key: 'inspection', icon: <ContainerOutlined />, label: '收验货' },
  { key: 'marketing_mgmt', icon: <ShopOutlined />, label: '营销管理' },
  { key: 'operation_tools', icon: <ToolOutlined />, label: '运营工具' },
  {
    key: 'risk_warning_center',
    icon: <WarningOutlined />,
    label: '风控预警中心',
    children: [
      { key: 'field_config', label: '字段配置' },
      { key: 'rule_config', label: '规则配置' },
      { key: 'scene_mgmt', label: '场景管理' },
      { key: 'warning_config', label: '预警配置' },
      { key: 'operation_mgmt', label: '运营管理' },
      { key: 'rule_mgmt', label: '规则管理' },
      { key: 'notification_center', label: '通知中心' },
      { key: 'log_center', label: '日志中心' }
    ]
  }
];

// 树形数据 - 左侧组成列表
const treeData = [
  {
    title: '蜜蜂工作台',
    key: 'bee-workbench'
  },
  {
    title: '采购商工作台',
    key: 'buyer-workbench',
    children: [
      { title: '收验货管理', key: 'receipt-mgmt' },
      { title: '驻场（废弃）', key: 'site-deprecated' },
      { title: '投诉管理', key: 'complaint-mgmt' },
      { title: '项目权限管理', key: 'project-permission' },
      { title: '文档模板中心', key: 'doc-template' },
      { title: '采购计划管理', key: 'procurement-plan' },
      { title: '合同管理', key: 'contract-mgmt' },
      { title: '履约管理', key: 'performance-mgmt' },
      {
        title: '招标管理',
        key: 'bidding-mgmt',
        children: [
          { title: '招标/询价列表', key: 'bidding-list' },
          { title: '价格', key: 'price' },
          { title: '保证金管理', key: 'deposit-mgmt' },
          { title: '联采通知/邀约', key: 'joint-notice' },
          { title: '踏勘', key: 'survey' },
          { title: '事件设置', key: 'event-settings' },
          { title: '惩罚性赔偿', key: 'penalty-compensation' },
          { title: '电子招投标', key: 'e-bidding' },
          { title: '候补退出', key: 'candidate-exit' },
          { title: '废标管理', key: 'abandon-mgmt' },
          { title: '约标', key: 'appointment-bid' }
        ]
      }
    ]
  },
  { title: '是否开启数据治理', key: 'data-governance', tag: 'NEW' }
];

// 树节点标题渲染 - 支持 NEW 标签
const renderTreeTitle = (node: any) => {
  return (
    <span className="tree-node-title">
      <span className="tree-node-label">{node.title}</span>
      {node.tag && <span className="tree-node-tag">{node.tag}</span>}
    </span>
  );
};

// 处理树数据，添加 title 渲染
const processTreeData = (data: any[]): any[] => {
  return data.map(node => ({
    ...node,
    title: renderTreeTitle(node),
    children: node.children ? processTreeData(node.children) : undefined
  }));
};

const tabItems = [
  { key: 'config', label: '方案配置' },
  { key: 'distribute', label: '配置下发' },
  { key: 'func-desc', label: '功能说明' },
  { key: 'operation-log', label: '操作日志' }
];

const Component = function SolutionRelationRuleConfig() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('config');
  const [displayContent, setDisplayContent] = useState('all');
  const [scopeType, setScopeType] = useState('current');
  const [globalEnabled, setGlobalEnabled] = useState(true);
  const [maxLevel, setMaxLevel] = useState('3');
  const [keepRelation, setKeepRelation] = useState('keep');
  const [queryRule, setQueryRule] = useState('manual');

  const [expandedKeys, setExpandedKeys] = useState<string[]>([
    'buyer-workbench',
    'bidding-mgmt'
  ]);
  const [selectedTreeKeys, setSelectedTreeKeys] = useState<string[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);

  return (
    <Layout className="solution-relation-rule-page">
      {/* 左侧边栏 */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={200}
        collapsedWidth={60}
        className="left-sidebar"
      >
        <div className="logo">
          <img src={logoImage} alt="运营后台logo" className="logo-icon" />
          {!collapsed && <span className="logo-text">集采运营后台</span>}
        </div>
        <Menu
          mode="inline"
          selectedKeys={['operation_solution_config']}
          defaultOpenKeys={['solution']}
          items={menuItems}
          className="sidebar-menu"
        />
        <div className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </div>
      </Sider>

      {/* 主内容区 */}
      <Layout className="main-layout">
        {/* 顶部导航栏 */}
        <div className="top-header">
          <div className="header-right">
            <span className="header-link">
              <DownloadOutlined className="header-link-icon" />
              下载中心
            </span>
            <span className="header-user">
              <UserOutlined className="header-user-icon" />
              <span>奥巴马</span>
              <span className="header-logout">[退出]</span>
            </span>
          </div>
        </div>

        {/* 面包屑导航栏 */}
        <div className="breadcrumb-bar">
          <span className="breadcrumb-item">解决方案</span>
          <span className="breadcrumb-separator">&gt;</span>
          <span className="breadcrumb-item active">运营解决方案配置</span>
        </div>

        {/* 页面主体内容 */}
        <Content className="main-content">
          <div className="content-wrapper">
            {/* 顶部信息栏 */}
            <div className="org-info-bar">
              <div className="org-select-wrap">
                <select
                  className="org-select"
                  value="平台abc"
                  onChange={() => {}}
                >
                  <option value="平台abc">平台abc</option>
                  <option value="平台xyz">平台xyz</option>
                </select>
              </div>
              <div className="org-details">
                <span className="org-info-item">
                  <span className="org-label">机构编码：</span>
                  <span className="org-value">0001</span>
                </span>
                <span className="org-info-item">
                  <span className="org-label">上级组织：</span>
                  <span className="org-value">-</span>
                </span>
              </div>
            </div>

            {/* 主体内容：左右布局 */}
            <div className="main-body">
              {/* 左侧树形列表 */}
              <div className="left-panel tree-panel">
                {/* 展示内容筛选 */}
                <div className="display-filter">
                  <span className="filter-label">展示内容：</span>
                  <Radio.Group
                    value={displayContent}
                    onChange={e => setDisplayContent(e.target.value)}
                  >
                    <Radio value="all">全部解决方案</Radio>
                    <Radio value="distributed">下发客户的解决方案</Radio>
                  </Radio.Group>
                </div>
                <div className="tree-search">
                  <Input
                    prefix={<SearchOutlined />}
                    placeholder="请输入关键字"
                    className="tree-search-input"
                  />
                </div>
                <Tree
                  className="composition-tree"
                  treeData={processTreeData(treeData)}
                  checkable
                  expandedKeys={expandedKeys}
                  selectedKeys={selectedTreeKeys}
                  checkedKeys={checkedKeys}
                  onExpand={keys => setExpandedKeys(keys as string[])}
                  onSelect={keys => setSelectedTreeKeys(keys as string[])}
                  onCheck={keys => setCheckedKeys(keys as string[])}
                  showLine={{ showLeafIcon: false }}
                  showIcon={false}
                />
              </div>

              {/* 右侧内容区 */}
              <div className="right-panel">
                <div className="right-panel-inner">
                  {/* Tab 导航 */}
                  <div className="tab-nav">
                    {tabItems.map(tab => (
                      <button
                        key={tab.key}
                        className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab 内容 */}
                  <div className="tab-content">
                    <div className="section-header">
                      <div className="section-title-bar">
                        <div className="title-indicator" />
                        <h2 className="section-title">资质围标识别-工商关联规则</h2>
                      </div>
                      <Switch
                        size="small"
                        checked={globalEnabled}
                        onChange={setGlobalEnabled}
                      />
                    </div>

                    <div className="param-desc">
                      <span className="desc-label">参数说明：</span>
                      根据组织配置工商关联识别的限制规则
                    </div>

                    <div className="scope-row">
                      <span className="scope-label">适用组织范围：</span>
                      <Radio.Group
                        value={scopeType}
                        onChange={e => setScopeType(e.target.value)}
                      >
                        <Radio value="current">本级</Radio>
                        <Radio value="subordinate">本下级</Radio>
                      </Radio.Group>
                    </div>

                    <div className="form-area">
                      <div className="form-row">
                        <div className="form-label">
                          <span className="required">*</span>
                          <span className="form-number">1.</span>
                          <span>最大查询层级</span>
                          <span className="level-bracket">[]</span>
                        </div>
                        <Input
                          className="level-input"
                          value={maxLevel}
                          onChange={e => setMaxLevel(e.target.value)}
                        />
                        <div className="form-helper">
                          层级说明：<br />
                          A-B：1层级；<br />
                          A-B-C：2层级；<br />
                          A-B-C-D：3层级。
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-label">
                          <span className="required">*</span>
                          <span className="form-number">2.</span>
                          <span>层级为1时是否保留人员关联关系</span>
                        </div>
                        <Radio.Group
                          value={keepRelation}
                          onChange={e => setKeepRelation(e.target.value)}
                        >
                          <Radio value="keep">保留</Radio>
                          <Radio value="discard">不保留</Radio>
                        </Radio.Group>
                      </div>

                      <div className="form-row">
                        <div className="form-label">
                          <span className="required">*</span>
                          <span className="form-number">3.</span>
                          <span>开通时长服务查询规则</span>
                        </div>
                        <Radio.Group
                          value={queryRule}
                          onChange={e => setQueryRule(e.target.value)}
                        >
                          <Radio value="auto">报名截止自动查询</Radio>
                          <Radio value="manual">手动查询</Radio>
                        </Radio.Group>
                      </div>
                    </div>
                  </div>

                  <div className="footer-actions">
                    <button className="submit-btn">提交</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Component;
