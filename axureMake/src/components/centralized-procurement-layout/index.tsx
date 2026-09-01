/**
 * @name 集采工作台通用布局
 * @description 包含顶部导航栏和左侧侧边栏的通用布局组件，适用于集采工作台各类原型页面。
 */
import React, { useState } from 'react';
import {
  Search,
  ChevronDown,
  Bell,
  HelpCircle,
  Home,
  ShoppingCart,
  BarChart3,
  Users,
  FileText,
  Shield,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';
import logoImage from '../../../assets/media/集采工作台logo图标.png';
import './style.css';

// 默认左侧菜单项配置
export interface MenuItem {
  key: string;
  label: string;
  collapsedLabel?: string;
  icon: React.ReactNode;
  active?: boolean;
  children?: {
    key: string;
    label: string;
    active?: boolean;
    children?: {
      key: string;
      label: string;
      active?: boolean;
    }[];
  }[];
}

export const DEFAULT_SIDEBAR_ITEMS: MenuItem[] = [
  { key: 'home', label: '首页', collapsedLabel: '首页', icon: <Home className="menu-icon" /> },
  {
    key: 'bidding-procurement',
    label: '招标采购',
    collapsedLabel: '招标',
    icon: <ShoppingCart className="menu-icon" />,
    children: [
      { key: 'pending-tasks', label: '待采购任务' },
      { key: 'bidding-audit', label: '招标/采购稽查' },
      { key: 'pre-qualification', label: '集中资格预审列表' },
      { key: 'bidding-list', label: '招标列表' },
      { key: 'non-bidding', label: '非招标采购' },
      { key: 'procurement-list', label: '采购列表' },
      { key: 'recommender-mgmt', label: '推荐人管理' },
      { key: 'evaluation-list', label: '评标/评审列表' },
      { key: 'direct-sign-audit', label: '厂家直签审核' },
      { key: 'deposit-mgmt', label: '投标/响应保证金管理' },
      { key: 'performance-deposit', label: '履约保证金管理' },
      { key: 'expert-library', label: '评标/评审专家库' },
      { key: 'survey-center', label: '踏勘中心' },
      { key: 'push-list', label: '招标采购推送列表' },
      {
        key: 'one-project-one-inspection',
        label: '一单一检',
        children: [
          { key: 'my-tasks', label: '我的任务' },
          { key: 'task-dispatch', label: '派发任务' },
          { key: 'check-template-mgmt', label: '检查模板' },
          { key: 'compliance-personnel-library', label: '合规人员库' },
          { key: 'organization-dispatch-config', label: '组织业务配置' }
        ]
      }
    ]
  },
  { key: 'acceptance', label: '验收货', collapsedLabel: '验收', icon: <ShoppingCart className="menu-icon" /> },
  { key: 'data', label: '数据服务', collapsedLabel: '数据', icon: <BarChart3 className="menu-icon" /> },
  { key: 'mutual-aid', label: '互助宝', collapsedLabel: '互助', icon: <Users className="menu-icon" /> },
  { key: 'assets', label: '资产管理', collapsedLabel: '资产', icon: <FileText className="menu-icon" /> },
  { key: 'materials', label: '物资管理', collapsedLabel: '物资', icon: <ShoppingCart className="menu-icon" /> },
  { key: 'material-equip', label: '物资设备管理系统', collapsedLabel: '设备', icon: <FileText className="menu-icon" /> },
  { key: 'coupons', label: '工程局发券', collapsedLabel: '发券', icon: <FileText className="menu-icon" /> },
  { key: 'academy', label: '云筑学苑', collapsedLabel: '学苑', icon: <Home className="menu-icon" /> },
  { key: 'summit', label: '云筑峰会', collapsedLabel: '峰会', icon: <Users className="menu-icon" /> },
  { key: 'price-library', label: '价格库', collapsedLabel: '价格', icon: <BarChart3 className="menu-icon" /> },
  {
    key: 'risk-control',
    label: '风控预警中心',
    collapsedLabel: '风控',
    icon: <Shield className="menu-icon" />,
    children: [
      { key: 'risk-monitor', label: '业务预警监控' },
      { key: 'risk-detail', label: '风控预警明细' },
      { key: 'risk-summary', label: '风控预警汇总' },
      { key: 'risk-dashboard', label: '风控预警看板' },
      { key: 'compliance-settings', label: '合规官设置', active: true }
    ]
  }
];

export interface CentralizedProcurementLayoutProps {
  /** 当前登录用户名 */
  username?: string;
  /** 当前选中的左侧菜单 key */
  activeMenuKey?: string;
  /** 自定义左侧菜单项 */
  sidebarItems?: MenuItem[];
  /** 菜单项点击回调 */
  onMenuClick?: (key: string) => void;
  /** 子菜单项点击回调 */
  onSubMenuClick?: (key: string, parentKey: string) => void;
  /** 三级菜单项点击回调 */
  onThreeLevelMenuClick?: (key: string, subKey: string, parentKey: string) => void;
  /** 主体内容 */
  children?: React.ReactNode;
}

const Component = function CentralizedProcurementLayout(props: CentralizedProcurementLayoutProps) {
  const {
    username = 'jctest1',
    activeMenuKey = 'my-tasks',
    sidebarItems = DEFAULT_SIDEBAR_ITEMS,
    onMenuClick,
    onSubMenuClick,
    onThreeLevelMenuClick,
    children
  } = props;

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [openGroupKeys, setOpenGroupKeys] = useState<string[]>(['bidding-procurement']);
  const [hoveredSubMenu, setHoveredSubMenu] = useState<{
    parentKey: string;
    subKey: string;
    children: { key: string; label: string; active?: boolean }[];
    rect: DOMRect | null;
  } | null>(null);

  const toggleGroup = (key: string) => {
    if (sidebarCollapsed) return; // 折叠时不处理折叠组内部状态
    setOpenGroupKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleSubMenuMouseEnter = (e: React.MouseEvent<HTMLDivElement>, parentKey: string, subItem: any) => {
    if (subItem.children && subItem.children.length > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      setHoveredSubMenu({
        parentKey,
        subKey: subItem.key,
        children: subItem.children,
        rect
      });
    } else {
      setHoveredSubMenu(null);
    }
  };

  const handleSubMenuMouseLeave = () => {
    setHoveredSubMenu(null);
  };

  return (
    <div className="centralized-procurement-layout">
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
              <span className="username">{username}</span>
              <ChevronDown className="icon-small" />
            </div>
          </div>
        </div>
      </header>

      <div className="main-container">
        {/* 左侧侧边栏 */}
        <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-menu">
            {sidebarItems.map(item => {
              const hasChildren = item.children && item.children.length > 0;
              const isGroupOpen = openGroupKeys.includes(item.key);
              const isCurrentActive = item.key === activeMenuKey || (item.children && item.children.some(sub => {
                if (sub.key === activeMenuKey) return true;
                if (sub.children && sub.children.some(three => three.key === activeMenuKey)) return true;
                return false;
              }));

              if (hasChildren) {
                return (
                  <div
                    key={item.key}
                    className={`menu-group ${isCurrentActive ? 'active' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}
                  >
                    <div className="menu-group-title" onClick={() => toggleGroup(item.key)}>
                      {item.icon}
                      <span className="menu-text">{item.label}</span>
                      <span className="menu-text-collapsed">{item.collapsedLabel || item.label.substring(0, 2)}</span>
                      <ChevronDown
                        className="arrow-icon"
                        style={{ transform: isGroupOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      />
                    </div>
                    {isGroupOpen && !sidebarCollapsed && (
                      <div className="sub-menu">
                        {item.children?.map(subItem => {
                          const hasThreeLevel = subItem.children && subItem.children.length > 0;
                          const isThreeActive = subItem.children && subItem.children.some(three => three.key === activeMenuKey);
                          const isSubActive = activeMenuKey === subItem.key || isThreeActive;

                          return (
                            <div
                              key={subItem.key}
                              className={`sub-menu-item ${isSubActive ? 'active' : ''} ${hasThreeLevel ? 'has-three-level' : ''}`}
                              onClick={() => {
                                if (!hasThreeLevel && onSubMenuClick) {
                                  onSubMenuClick(subItem.key, item.key);
                                }
                              }}
                              onMouseEnter={(e) => handleSubMenuMouseEnter(e, item.key, subItem)}
                              onMouseLeave={handleSubMenuMouseLeave}
                            >
                              <span className="sub-menu-label">{subItem.label}</span>
                              {hasThreeLevel && (
                                <span className="three-level-arrow">›</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <div
                  key={item.key}
                  className={`menu-item ${activeMenuKey === item.key ? 'active' : ''}`}
                  onClick={() => onMenuClick ? onMenuClick(item.key) : null}
                >
                  {item.icon}
                  <span className="menu-text">{item.label}</span>
                  <span className="menu-text-collapsed">{item.collapsedLabel || item.label.substring(0, 2)}</span>
                </div>
              );
            })}
          </div>
          <div className="sidebar-collapse" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            {sidebarCollapsed ? <PanelLeft className="icon" /> : <PanelLeftClose className="icon" />}
            <span className="menu-text">收起菜单</span>
          </div>
        </aside>

        {/* Hover 三级悬浮面板 */}
        {hoveredSubMenu && hoveredSubMenu.rect && (
          <div 
            className="three-level-panel-portal"
            style={{
              position: 'fixed',
              left: hoveredSubMenu.rect.right,
              top: 56, // 顶部导航栏高度
              bottom: 0,
              zIndex: 1000
            }}
            onMouseEnter={() => {
              // 保持 hover 状态
              setHoveredSubMenu(hoveredSubMenu);
            }}
            onMouseLeave={handleSubMenuMouseLeave}
          >
            <div className="three-level-panel-content">
              {hoveredSubMenu.children.map((threeItem, index) => (
                <div
                  key={threeItem.key}
                  className={`three-level-item ${activeMenuKey === threeItem.key ? 'active' : ''}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => {
                    if (onThreeLevelMenuClick) {
                      onThreeLevelMenuClick(threeItem.key, hoveredSubMenu.subKey, hoveredSubMenu.parentKey);
                    } else if (onSubMenuClick) {
                      // 兼容老回调
                      onSubMenuClick(threeItem.key, hoveredSubMenu.subKey);
                    }
                    handleSubMenuMouseLeave();
                  }}
                >
                  {threeItem.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 主内容区 */}
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

Component.displayName = 'CentralizedProcurementLayout';

export default Component;
