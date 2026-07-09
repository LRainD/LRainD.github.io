/**
 * @name 招标基础信息
 * @description 集采工作台-招标基础信息页，高保真还原截图：左侧蓝色菜单、顶部操作栏、招标信息卡、截标倒计时、问题线索。
 */
import React, { useState } from 'react';
import './style.css';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import logoImage from '../../../assets/media/集采工作台logo图标.png';
import {
  Home,
  UserPlus,
  ShoppingCart,
  Store,
  ChevronDown,
  ChevronUp,
  Calendar,
  Gavel,
  Users,
  FileCheck,
  ShieldCheck,
  Wallet,
  Shield,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Building2,
  ListVideo,
  Send,
  RefreshCcw,
  Star,
  CloudDownload,
  HelpCircle,
  Bell,
  ChevronLeft
} from 'lucide-react';

const Component = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // 倒计时（静态演示）
  const countdown = { days: '999996', hours: '04', minutes: '45', seconds: '19' };

  // 问题线索表格数据
  type ClueItem = {
    key: string;
    category: string;
    clue: string;
    verified: string;
    investigation: string;
    rectified: string;
    progress: string;
    accountabilityCount: number;
    transfer: string;
  };

  const clueData: ClueItem[] = [
    {
      key: '1',
      category: '应招未招-累计合同金额达到标准未公开招标',
      clue: 'xx',
      verified: '否',// 是否属实
      investigation: '给的问题线索核查情况',// 问题线索核查情况
      rectified: '是',// 是否整改
      progress: '',
      accountabilityCount: 0,
      transfer: '',
    },
    {
      key: '2',
      category: '围标串标_中标人与投标人存在关联关系',
      clue: 'XX工程有限公司和XX有限公司投标，周XX在广州XX任职董事同时在XX工程有限公司任职执行董事、总经理，而XX有限公司，且XX程有限公司中标。',
      verified: '是',
      investigation: '线索单位存在关联关系',
      rectified: '否',
      progress: '6月30日前对采购负责人进行通报批评',
      accountabilityCount: 1,
      transfer: '未移送',
    },
  ];

  const clueColumns: ColumnsType<ClueItem> = [
    {
      title: '序号',
      dataIndex: 'key',
      align: 'center',
      width: 60,
      render: (_value, _record, index) => index + 1,
    },
    {
      title: '问题分类',
      dataIndex: 'category',
      align: 'center',
      width: 120,
    },
    {
      title: '主要问题线索',
      dataIndex: 'clue',
      width: 260,
      onCell: () => ({ style: { whiteSpace: 'normal', wordBreak: 'break-all' } }),
    },
    {
      title: '企业核实处置情况',
      children: [
        {
          title: '是否属实',
          dataIndex: 'verified',
          align: 'center',
          width: 100,
        },
        {
          title: '问题线索核查情况',
          dataIndex: 'investigation',
          ellipsis: true,
          width: 180,
        },
        {
          title: '是否完成整改',
          dataIndex: 'rectified',
          align: 'center',
          width: 120,
        },
        {
          title: '整改进展情况',
          dataIndex: 'progress',
          ellipsis: true,
          width: 180,
        },
        {
          title: '追责人次',
          dataIndex: 'accountabilityCount',
          align: 'center',
          width: 90,
          render: (value) => (value === 0 ? '-' : value),
        },
        {
          title: '问题移送情况',
          dataIndex: 'transfer',
          ellipsis: true,
          width: 160,
        },
      ],
    },
  ];

  const renderSidebarItem = (icon: React.ReactNode, label: string, active?: boolean) => (
    <div className={`px-4 py-2 cursor-pointer flex items-center group relative ${active ? 'nav-item-active' : 'hover:bg-white/10'}`}>
      {icon}
      <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100'}`}>{label}</span>
      {isSidebarCollapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">{label}</div>
      )}
    </div>
  );

  return (
    <div className="bg-background-light text-text-main font-sans h-screen flex overflow-hidden">
      {/* 左侧边栏 */}
      <aside className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} bg-sidebar-light flex-shrink-0 flex flex-col text-white transition-all duration-300 overflow-visible`}>
        <div className="h-14 flex items-center justify-center font-bold text-xl tracking-wide bg-white text-blue-500 w-64 relative z-50">
          <img src={logoImage} alt="集采工作台" className="h-8" />
        </div>
        <nav className="flex-1 overflow-y-auto py-2 text-sm custom-scrollbar">
          {renderSidebarItem(<Home className="w-[18px] h-[18px] flex-shrink-0" />, '首页')}
          {renderSidebarItem(<UserPlus className="w-[18px] h-[18px] flex-shrink-0" />, '权限申请菜单测试')}
          {renderSidebarItem(<ShoppingCart className="w-[18px] h-[18px] flex-shrink-0" />, '采购列表')}
          <div className="px-4 py-2 hover:bg-white/10 cursor-pointer flex items-center group relative">
            <Store className="w-[18px] h-[18px] flex-shrink-0" />
            <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100'}`}>分供商管理</span>
            {!isSidebarCollapsed && <ChevronDown className="w-4 h-4 ml-auto" />}
          </div>
          <div className="px-4 py-2 hover:bg-white/10 cursor-pointer flex items-center group relative">
            <Calendar className="w-[18px] h-[18px] flex-shrink-0" />
            <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100'}`}>采购计划管理</span>
            {!isSidebarCollapsed && <ChevronDown className="w-4 h-4 ml-auto" />}
          </div>
          <div className="bg-black/10 pb-1">
            <div className="px-4 py-2 hover:bg-white/10 cursor-pointer flex items-center group relative">
              <Gavel className="w-[18px] h-[18px] flex-shrink-0" />
              <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100'}`}>招标采购</span>
              {!isSidebarCollapsed && <ChevronUp className="w-4 h-4 ml-auto" />}
            </div>
            {!isSidebarCollapsed && (
              <>
                <div className="pl-12 pr-4 py-2 text-xs opacity-80 hover:text-white hover:bg-white/5 cursor-pointer">待采购任务</div>
                <div className="pl-12 pr-4 py-2 text-xs opacity-80 hover:text-white hover:bg-white/5 cursor-pointer">招标/采购稽查</div>
                <div className="pl-12 pr-4 py-2 text-xs opacity-80 hover:text-white hover:bg-white/5 cursor-pointer">集中资格预审列表</div>
                <div className="pl-12 pr-4 py-2 text-xs opacity-80 hover:text-white hover:bg-white/5 cursor-pointer">招标列表</div>
                <div className="pl-12 pr-4 py-2 text-xs opacity-80 hover:text-white hover:bg-white/5 cursor-pointer nav-item-active font-medium">非招标采购</div>
                <div className="pl-12 pr-4 py-2 text-xs opacity-80 hover:text-white hover:bg-white/5 cursor-pointer">采购列表</div>
              </>
            )}
          </div>
          {renderSidebarItem(<Users className="w-[18px] h-[18px] flex-shrink-0" />, '推荐人管理')}
          {renderSidebarItem(<FileCheck className="w-[18px] h-[18px] flex-shrink-0" />, '评标/评审专家列表')}
          {renderSidebarItem(<ShieldCheck className="w-[18px] h-[18px] flex-shrink-0" />, '厂家直签审核')}
          {renderSidebarItem(<Wallet className="w-[18px] h-[18px] flex-shrink-0" />, '投标/响应保证金管理')}
          {renderSidebarItem(<Shield className="w-[18px] h-[18px] flex-shrink-0" />, '履约保证金管理')}
        </nav>
        <div
          className="p-4 border-t border-white/10 flex items-center cursor-pointer hover:bg-white/10 justify-center"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        >
          {isSidebarCollapsed ? (
            <ChevronsRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronsLeft className="w-5 h-5 mr-3" />
              <span className="text-sm">收起菜单</span>
            </>
          )}
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* 顶部导航栏 */}
        <header className="h-14 bg-white border-b border-border-light flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center space-x-2"></div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <select className="appearance-none bg-gray-50 border border-gray-300 text-gray-700 py-1 pl-3 pr-8 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                <option>中国建筑股份...</option>
              </select>
              <ChevronDown className="absolute right-2 top-2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
            <div className="relative">
              <input className="bg-gray-50 border border-gray-300 text-gray-700 text-xs py-1.5 px-3 rounded w-48 focus:outline-none focus:border-primary" placeholder="支持通过关键字搜索菜单" type="text" />
              <Search className="absolute right-2 top-2 text-gray-400 w-[14px] h-[14px]" />
            </div>
            <div className="flex items-center text-xs text-gray-600 border border-gray-300 rounded px-2 py-1 cursor-pointer hover:bg-gray-50">
              <span className="w-4 h-3 bg-red-600 rounded-sm mr-1"></span>
              简体中文
              <ChevronDown className="w-[14px] h-[14px] ml-1" />
            </div>
            <div className="flex items-center space-x-4 text-gray-500">
              <div className="flex items-center cursor-pointer hover:text-primary">
                <Building2 className="w-[18px] h-[18px] mr-1" />
                <span className="text-xs">云筑首页</span>
              </div>
              <div className="flex items-center cursor-pointer hover:text-primary">
                <ListVideo className="w-[18px] h-[18px] mr-1" />
                <span className="text-xs">寻源工作台</span>
              </div>
              <div className="flex items-center cursor-pointer hover:text-primary">
                <Send className="w-[18px] h-[18px] mr-1" />
                <span className="text-xs">发布招募需求</span>
              </div>
              <div className="flex items-center cursor-pointer hover:text-primary">
                <RefreshCcw className="w-[18px] h-[18px] mr-1" />
                <span className="text-xs">切换新版</span>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-gray-500 border-l border-gray-200 pl-4">
              <Star className="w-[18px] h-[18px] cursor-pointer hover:text-primary" />
              <CloudDownload className="w-[18px] h-[18px] cursor-pointer hover:text-primary" />
              <HelpCircle className="w-[18px] h-[18px] cursor-pointer hover:text-primary" />
              <div className="relative cursor-pointer hover:text-primary">
                <Bell className="w-[18px] h-[18px]" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-4 h-3 flex items-center justify-center rounded-full">37</span>
              </div>
              <div className="flex items-center cursor-pointer hover:text-primary">
                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 mr-1 overflow-hidden">
                  <img alt="Avatar" className="w-full h-full object-cover" src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20user%20avatar&image_size=square" />
                </div>
                <span className="text-xs">admin11</span>
                <ChevronDown className="w-[14px] h-[14px] ml-0.5" />
              </div>
            </div>
          </div>
        </header>

        {/* 可滚动内容 */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50">
          {/* 面包屑 */}
          <div className="breadcrumb-bar">
            <div className="breadcrumb-nav">
              <span className="breadcrumb-item">招标采购</span>
              <span className="breadcrumb-separator">&gt;</span>
              <span className="breadcrumb-item active">招标基础信息</span>
            </div>
          </div>

          <div className="p-4">
            {/* 标题栏 */}
            <div className="bg-white rounded-sm border border-border-light px-4 py-3 mb-3 flex items-center justify-between">
              <div className="flex items-center">
                <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-sm mr-2">物资</span>
                <h1 className="text-base font-bold text-gray-800">资格预审到投标中的自检-不要动</h1>
              </div>
              <button className="flex items-center border border-gray-300 text-gray-700 text-xs px-3 py-1.5 rounded hover:bg-gray-50">
                <ChevronLeft className="w-3 h-3 mr-1" />
                返回
              </button>
            </div>

            {/* 招标信息卡 */}
            <div className="bg-white rounded-sm border border-border-light p-4 mb-3">
              <div className="flex items-center mb-3 text-sm">
                <span className="text-gray-600 mr-2">距离截标截止还剩：</span>
                <div className="flex items-center space-x-1 font-mono text-primary">
                  <span className="countdown-box">{countdown.days}</span>
                  <span className="text-gray-500">天</span>
                  <span className="countdown-box">{countdown.hours}</span>
                  <span className="text-gray-500">:</span>
                  <span className="countdown-box">{countdown.minutes}</span>
                  <span className="text-gray-500">:</span>
                  <span className="countdown-box">{countdown.seconds}</span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-y-2 gap-x-4 text-xs text-gray-600">
                <div>招标编号：<span className="text-blue-500 hover:underline cursor-pointer">cscec202607080000022813</span></div>
                <div>组织机构：中国建筑股份有限公司</div>
                <div>招标方式：公开招标</div>
                <div>项目：<span className="text-blue-500 hover:underline cursor-pointer">测试项目35245</span></div>
                <div>品类：物资-钢材</div>
                <div>经办人：admin11</div>
              </div>
            </div>

            {/* 问题线索 */}
            <div className="bg-white rounded-sm border border-border-light">
              <div className="section-header">
                <div className="w-1 h-4 bg-primary mr-2"></div>
                <h2 className="font-bold text-gray-800 text-sm">问题线索</h2>
              </div>
              <div className="p-4">
                <Table
                  columns={clueColumns}
                  dataSource={clueData}
                  pagination={false}
                  size="small"
                  bordered
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Component;
