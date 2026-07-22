/**
 * @name 范本系统管理后台统一布局
 * @description 范本系统管理后台通用外壳：左侧菜单栏、顶部导航栏（含 logo + tabs + 环境标签）。
 */
import React from 'react';
import {
  FileTextOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { Layout, Menu, Tag, type MenuProps } from 'antd';
import logoImage from '../../../assets/picture/云筑网带文字logo.png';
import './style.css';

const { Sider, Content } = Layout;

// 范本系统管理后台左侧菜单默认数据
export const DEFAULT_MENU_ITEMS: MenuProps['items'] = [
  { key: 'contract_type', icon: <FileTextOutlined />, label: '业务类型' },
  { key: 'system_fields', icon: <SettingOutlined />, label: '系统字段' }
];

export interface TabItem {
  label: string;
  active?: boolean;
}

export interface TemplateAdminLayoutProps {
  /** 当前选中的左侧菜单 key */
  activeMenuKey: string;
  /** 自定义左侧菜单项，默认使用 DEFAULT_MENU_ITEMS */
  menuItems?: MenuProps['items'];
  /** 顶部 tabs */
  tabs?: TabItem[];
  /** 右上角环境标签文字 */
  envTag?: string;
  /** 主体内容 */
  children?: React.ReactNode;
}

const Component = function TemplateAdminLayout(props: TemplateAdminLayoutProps) {
  const {
    activeMenuKey,
    menuItems = DEFAULT_MENU_ITEMS,
    tabs = [
      { label: '模板库' },
      { label: '管理后台', active: true }
    ],
    envTag = '专用测试勿动',
    children
  } = props;

  return (
    <Layout className="template-admin-layout">
      {/* 顶部导航栏 */}
      <div className="template-admin-header">
        <div className="template-admin-header-left">
          <img src={logoImage} alt="云筑网" className="template-admin-logo" />
        </div>
        <div className="template-admin-header-tabs">
          {tabs.map((tab, index) => (
            <span
              key={index}
              className={`template-admin-tab ${tab.active ? 'active' : ''}`}
            >
              {tab.label}
            </span>
          ))}
        </div>
        <div className="template-admin-header-right">
          <Tag color="processing" className="template-admin-env-tag">{envTag}</Tag>
        </div>
      </div>

      <Layout className="template-admin-body">
        {/* 左侧边栏 */}
        <Sider width={200} className="template-admin-sider">
          <Menu
            mode="inline"
            selectedKeys={[activeMenuKey]}
            items={menuItems}
            className="template-admin-menu"
          />
        </Sider>

        {/* 主内容区 */}
        <Content className="template-admin-content">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Component;
