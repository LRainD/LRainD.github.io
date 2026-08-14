/**
 * @name 投标系统通用布局
 * @description 包含顶部导航栏和左侧菜单栏的通用布局组件
 */
import React from 'react';
import { 
  Search, ChevronDown, Home as HomeIcon, Monitor, ShoppingCart, Users, 
  HelpCircle, Download, AlertTriangle, Bell, Gavel, FileText, Banknote, 
  CheckCircle, List, Shield
} from 'lucide-react';
import logoImage from '../../../assets/picture/云筑蜂王logo.png';
import './style.css';

export interface BiddingLayoutProps {
  children: React.ReactNode;
  activeNav?: '寻源工作台' | '投标工作台';
  activeSidebar?: string;
}

const Component = function BiddingLayout({ 
  children, 
  activeNav = '投标工作台',
  activeSidebar = '投标'
}: BiddingLayoutProps) {
  return (
    <div className="h-screen flex flex-col bg-bg-page text-sm overflow-hidden font-sans">
      {/* Header */}
      <header className="h-[56px] bg-[#1a1a1a] flex items-center justify-between px-4 shrink-0 z-20 relative text-white">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-white font-bold text-xl italic tracking-wide">
            <img src={logoImage} alt="云筑蜂王" className="h-8 object-contain" />
          </div>
          
          <nav className="flex items-center gap-6 ml-8 text-sm font-medium">
            <span className={`cursor-pointer hover:text-primary transition-colors ${activeNav === '寻源工作台' ? 'text-primary border-b-2 border-primary pb-1 mt-1' : ''}`}>寻源工作台</span>
            <span className={`cursor-pointer hover:text-primary transition-colors ${activeNav === '投标工作台' ? 'text-primary border-b-2 border-primary pb-1 mt-1' : ''}`}>投标工作台</span>
          </nav>

          <div className="relative ml-4">
            <input 
              type="text" 
              placeholder="找商机、功能、服务、帮助" 
              className="pl-3 pr-8 py-1.5 bg-[#333] border-none rounded w-80 text-xs text-gray-300 focus:ring-1 focus:ring-primary outline-none"
            />
            <Search size={14} className="absolute right-2.5 top-2 text-gray-400" />
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-4 mr-4">
            {[
              { icon: <Users size={16}/>, label: '筑共赢' },
              { icon: <Monitor size={16}/>, label: '寻源平台' },
              { icon: <ShoppingCart size={16}/>, label: '行业工作台' },
              { icon: <HelpCircle size={16}/>, label: '帮助' },
              { icon: <Download size={16}/>, label: '下载' },
              { icon: <AlertTriangle size={16}/>, label: '投诉反馈' },
              { icon: <Bell size={16}/>, label: '会话' },
              { icon: <Bell size={16}/>, label: '消息', badge: '99+' },
            ].map((item, index) => (
              <span key={index} className="flex flex-col items-center gap-0.5 cursor-pointer hover:text-primary relative">
                <div className="w-5 h-5 flex items-center justify-center">{item.icon}</div>
                <span className="scale-90">{item.label}</span>
                {item.badge && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] px-1 rounded-full scale-75">{item.badge}</span>
                )}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 cursor-pointer hover:text-primary">
            <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white overflow-hidden border border-gray-600">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=sup201" alt="avatar" className="w-full h-full object-cover" />
            </div>
            <span className="text-gray-300">sup201 (sup201)</span>
            <ChevronDown size={14} className="text-gray-500"/>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[56px] bg-sidebar flex flex-col shrink-0 border-r border-border-base z-10">
          {[
            { icon: <HomeIcon size={18} />, label: '合作' },
            { icon: <Gavel size={18} />, label: '投标' },
            { icon: <Users size={18} />, label: '分供' },
            { icon: <FileText size={18} />, label: '合同' },
            { icon: <ShoppingCart size={18} />, label: '订单' },
            { icon: <Shield size={18} />, label: '筑易' },
            { icon: <ShoppingCart size={18} />, label: '物流' },
            { icon: <Banknote size={18} />, label: '资金' },
            { icon: <CheckCircle size={18} />, label: '废旧' },
            { icon: <Monitor size={18} />, label: '地磅' },
          ].map((item, index) => (
            <div 
              key={index} 
              className={`py-4 flex flex-col items-center gap-1 text-[11px] cursor-pointer transition-colors ${
                activeSidebar === item.label 
                  ? 'bg-sidebar-active text-primary border-r-2 border-primary' 
                  : 'hover:bg-gray-50 text-gray-600'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
          <div className="mt-auto py-4 flex justify-center cursor-pointer hover:bg-gray-50 border-t border-gray-100">
            <List size={18} className="text-gray-400"/>
          </div>
        </aside>

        {/* Main Content */}
        {children}
      </div>
    </div>
  );
};

export default Component;
