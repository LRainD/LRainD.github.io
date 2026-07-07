/**
 * @name AI工坊侧边栏
 * @description 云筑AI工坊系列页面通用左侧边栏，包含 LOGO、工具菜单、服务菜单、通知、展开/收起与用户入口。
 */
import React from 'react';
import {
  Home,
  Building2,
  AlertTriangle,
  FileCheck,
  Link2,
  Sparkles,
  LayoutGrid,
  HelpCircle,
  Bell,
  User,
  ChevronDown,
  Menu,
  type LucideIcon
} from 'lucide-react';
import './style.css';

export interface AiWorkshopSidebarProps {
  /** 是否收起 */
  collapsed: boolean;
  /** 收起状态变化回调 */
  onCollapseChange: (collapsed: boolean) => void;
  /** 当前激活的菜单 key */
  activeMenuKey?: string;
  /** LOGO 图片地址 */
  logoImage: string;
  /** 应用名称 */
  title?: string;
  /** 用户名 */
  username?: string;
  /** 通知未读数 */
  notificationCount?: number;
  /** 点击菜单项回调 */
  onMenuClick?: (key: string) => void;
}

interface MenuItem {
  key: string;
  icon: LucideIcon;
  label: string;
}

const HOME_ITEM: MenuItem = { key: 'home', icon: Home, label: '主页' };

const TOOL_ITEMS: MenuItem[] = [
  { key: 'enterprise', icon: Building2, label: '企业检测' },
  { key: 'risk', icon: AlertTriangle, label: '风险解析' },
  { key: 'bid', icon: FileCheck, label: '投标智检' },
  { key: 'relation', icon: Link2, label: '企业关联' },
  { key: 'clear', icon: Sparkles, label: '智能清标' }
];

const SERVICE_ITEMS: MenuItem[] = [
  { key: 'market', icon: LayoutGrid, label: '应用市场' },
  { key: 'help', icon: HelpCircle, label: '帮助中心' }
];

const Component = function AiWorkshopSidebar(props: AiWorkshopSidebarProps) {
  const {
    collapsed,
    onCollapseChange,
    activeMenuKey,
    logoImage,
    title = '云筑AI工坊',
    username = 'yzw_liurundong',
    notificationCount = 0,
    onMenuClick
  } = props;

  const HomeIcon = HOME_ITEM.icon;

  return (
    <aside
      className={`ai-workshop-sidebar ${collapsed ? 'ai-workshop-sidebar--collapsed' : ''}`}
    >
      {/* LOGO区域 */}
      <div className="ai-workshop-sidebar__logo">
        {collapsed ? (
          <div className="ai-workshop-sidebar__logo-collapsed">
            <img
              src={logoImage}
              alt={title}
              className="ai-workshop-sidebar__logo-icon"
            />
          </div>
        ) : (
          <div className="ai-workshop-sidebar__logo-expanded">
            <img
              src={logoImage}
              alt={title}
              className="ai-workshop-sidebar__logo-icon"
            />
            <span className="ai-workshop-sidebar__logo-text">{title}</span>
          </div>
        )}
      </div>

      {/* 主页 - 独立区域 */}
      <div className="ai-workshop-sidebar__home">
        <nav className="ai-workshop-sidebar__nav">
          <button
            className="ai-workshop-sidebar__menu-item ai-workshop-sidebar__menu-item--home"
            onClick={() => onMenuClick?.(HOME_ITEM.key)}
          >
            <HomeIcon className="ai-workshop-sidebar__icon" />
            {!collapsed && <span>{HOME_ITEM.label}</span>}
          </button>
        </nav>
      </div>

      {/* 工具模块 */}
      <div className="ai-workshop-sidebar__tools">
        {!collapsed && (
          <div className="ai-workshop-sidebar__section-title">工具</div>
        )}
        <nav className="ai-workshop-sidebar__nav ai-workshop-sidebar__nav--menu">
          {TOOL_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === activeMenuKey;
            return (
              <button
                key={item.key}
                className={`ai-workshop-sidebar__menu-item ${isActive ? 'ai-workshop-sidebar__menu-item--active' : ''}`}
                onClick={() => onMenuClick?.(item.key)}
              >
                <Icon className="ai-workshop-sidebar__icon" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* 服务模块 */}
        {!collapsed && (
          <div className="ai-workshop-sidebar__section-title">服务</div>
        )}
        <nav className="ai-workshop-sidebar__nav ai-workshop-sidebar__nav--service">
          {SERVICE_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                className="ai-workshop-sidebar__menu-item"
                onClick={() => onMenuClick?.(item.key)}
              >
                <Icon className="ai-workshop-sidebar__icon" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 底部工具栏 */}
      <div className="ai-workshop-sidebar__footer">
        {/* 消息通知 - 收起时显示在上方 */}
        {collapsed && (
          <div className="ai-workshop-sidebar__notification-wrapper">
            <button className="ai-workshop-sidebar__notification">
              <Bell className="ai-workshop-sidebar__icon" />
              {notificationCount > 0 && (
                <span className="ai-workshop-sidebar__badge">{notificationCount}</span>
              )}
            </button>
          </div>
        )}

        {/* 展开/收起按钮 */}
        <div className="ai-workshop-sidebar__collapse-bar">
          <button
            onClick={() => onCollapseChange(!collapsed)}
            className="ai-workshop-sidebar__collapse-btn"
            aria-label={collapsed ? '展开侧边栏' : '收起侧边栏'}
          >
            <Menu className="ai-workshop-sidebar__icon" />
          </button>
          {!collapsed && (
            <button className="ai-workshop-sidebar__notification">
              <Bell className="ai-workshop-sidebar__icon" />
              {notificationCount > 0 && (
                <span className="ai-workshop-sidebar__badge">{notificationCount}</span>
              )}
            </button>
          )}
        </div>

        {/* 用户信息 */}
        <button className="ai-workshop-sidebar__user">
          <div className="ai-workshop-sidebar__avatar">
            <User className="ai-workshop-sidebar__avatar-icon" />
          </div>
          {!collapsed && (
            <>
              <span className="ai-workshop-sidebar__username">{username}</span>
              <ChevronDown className="ai-workshop-sidebar__icon" />
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Component;
