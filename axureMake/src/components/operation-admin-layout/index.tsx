/**
 * @name 运营后台统一布局
 * @description 运营后台页面通用外壳：左侧菜单栏、顶部导航栏、面包屑、机构信息栏。
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
  SettingOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  SolutionOutlined,
  TeamOutlined,
  ToolOutlined,
  UserOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { Layout, Menu, Select, type MenuProps } from 'antd';
import logoImage from '../../../assets/media/运营后台左上角logo.png';
import './style.css';

const { Sider, Content } = Layout;

// 运营后台左侧菜单默认数据
export const DEFAULT_MENU_ITEMS = [
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

export interface BreadcrumbItem {
  label: string;
  active?: boolean;
}

export interface OperationAdminLayoutProps {
  /** 当前选中的左侧菜单 key */
  activeMenuKey: string;
  /** 默认展开的左侧菜单组 key */
  defaultOpenKeys?: string[];
  /** 自定义左侧菜单项，默认使用 DEFAULT_MENU_ITEMS */
  menuItems?: MenuProps['items'];
  /** 面包屑数据 */
  breadcrumbItems?: BreadcrumbItem[];
  /** 是否显示顶部机构信息栏（平台下拉、机构编码、上级组织） */
  showOrgBar?: boolean;
  /** 机构选择值 */
  platform?: string;
  /** 机构编码 */
  orgCode?: string;
  /** 上级组织 */
  parentOrg?: string;
  /** 机构切换回调 */
  onPlatformChange?: (value: string) => void;
  /** 主体内容 */
  children?: React.ReactNode;
}

const Component = function OperationAdminLayout(props: OperationAdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  const {
    activeMenuKey,
    defaultOpenKeys = ['solution'],
    menuItems = DEFAULT_MENU_ITEMS,
    breadcrumbItems = [],
    showOrgBar = true,
    platform = '平台abc',
    orgCode = '0001',
    parentOrg = '-',
    onPlatformChange,
    children
  } = props;

  return (
    <Layout className="operation-admin-layout">
      {/* 左侧边栏 */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={200}
        collapsedWidth={60}
        className="operation-admin-sider"
      >
        <div className="operation-admin-logo">
          <img src={logoImage} alt="运营后台logo" className="operation-admin-logo-icon" />
          {!collapsed && <span className="operation-admin-logo-text">集采运营后台</span>}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[activeMenuKey]}
          defaultOpenKeys={defaultOpenKeys}
          items={menuItems}
          className="operation-admin-menu"
        />
        <div className="operation-admin-collapse" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </div>
      </Sider>

      {/* 主内容区 */}
      <Layout className="operation-admin-main">
        {/* 顶部导航栏 */}
        <div className="operation-admin-header">
          <div className="operation-admin-header-right">
            <span className="operation-admin-header-link">
              <DownloadOutlined className="operation-admin-header-link-icon" />
              下载中心
            </span>
            <span className="operation-admin-header-user">
              <UserOutlined className="operation-admin-header-user-icon" />
              <span>奥巴马</span>
              <span className="operation-admin-header-logout">[退出]</span>
            </span>
          </div>
        </div>

        {/* 面包屑导航栏 */}
        {breadcrumbItems.length > 0 && (
          <div className="operation-admin-breadcrumb">
            {breadcrumbItems.map((item, index) => (
              <React.Fragment key={index}>
                <span className={`operation-admin-breadcrumb-item ${item.active ? 'active' : ''}`}>
                  {item.label}
                </span>
                {index < breadcrumbItems.length - 1 && (
                  <span className="operation-admin-breadcrumb-separator">&gt;</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* 页面主体内容 */}
        <Content className="operation-admin-content">
          <div className="operation-admin-content-inner">
            {/* 顶部信息栏 */}
            {showOrgBar && (
              <div className="operation-admin-org-bar">
                <div className="operation-admin-org-select">
                  <Select
                    value={platform}
                    onChange={onPlatformChange}
                    options={[
                      { label: '平台abc', value: '平台abc' },
                      { label: '平台xyz', value: '平台xyz' }
                    ]}
                    className="operation-admin-platform-select"
                  />
                </div>
                <div className="operation-admin-org-details">
                  <span className="operation-admin-org-item">
                    <span className="operation-admin-org-label">机构编码：</span>
                    <span className="operation-admin-org-value">{orgCode}</span>
                  </span>
                  <span className="operation-admin-org-item">
                    <span className="operation-admin-org-label">上级组织：</span>
                    <span className="operation-admin-org-value">{parentOrg}</span>
                  </span>
                </div>
              </div>
            )}

            {/* 页面自定义内容 */}
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Component;
