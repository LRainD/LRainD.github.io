import React, { useState } from 'react';
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
  Wallet,
  Shield,
  ChevronsLeft,
  ChevronsRight,
  Headset,
  UserCog,
  Smartphone,
  Search,
  Building2,
  ListVideo,
  HelpCircle,
  Bell,
  Check,
  Plus,
  Upload,
  Trash2,
  X,
  Clock,
  Circle,
  CheckCircle2,
  Square,
  CheckSquare
} from 'lucide-react';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import './style.css';

/**
 * @name 编制采购公告
 * @mode axure
 *
 * 参考资料：
 * - /rules/development-guide.md
 * - /skills/axure-export-workflow/SKILL.md
 */
const Component = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [autoPublish, setAutoPublish] = useState(false);
  const [hoursAfterApproval, setHoursAfterApproval] = useState('');

  return (
    <div className="bg-background-light dark:bg-background-dark text-gray-800 dark:text-gray-200 font-sans h-screen flex overflow-hidden">
      {/* Sidebar */}
      <aside className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} bg-sidebar-light dark:bg-sidebar-dark flex-shrink-0 flex flex-col text-white transition-all duration-300 overflow-visible`}>
        <div className="h-14 flex items-center justify-center font-bold text-xl tracking-wide bg-white text-blue-500 w-64 relative z-50">
          <img src={logoImage} alt="集采工作台" className="h-8" />
        </div>
        <nav className="flex-1 overflow-y-auto py-2 text-sm custom-scrollbar">
          <div className="px-4 py-2 hover:bg-white/10 cursor-pointer flex items-center justify-center group relative">
            <Home className="w-[18px] h-[18px] flex-shrink-0" />
            <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100'}`}>首页</span>
            {isSidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                首页
              </div>
            )}
          </div>
          <div className="px-4 py-2 hover:bg-white/10 cursor-pointer flex items-center justify-center group relative">
            <UserPlus className="w-[18px] h-[18px] flex-shrink-0" />
            <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100'}`}>权限申请菜单测试</span>
            {isSidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                权限申请菜单测试
              </div>
            )}
          </div>
          <div className="px-4 py-2 hover:bg-white/10 cursor-pointer flex items-center justify-center group relative">
            <ShoppingCart className="w-[18px] h-[18px] flex-shrink-0" />
            <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100'}`}>采购列表</span>
            {isSidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                采购列表
              </div>
            )}
          </div>
          <div className="px-4 py-2 hover:bg-white/10 cursor-pointer flex items-center justify-center group relative">
            <Store className="w-[18px] h-[18px] flex-shrink-0" />
            <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100'}`}>分供商管理</span>
            {!isSidebarCollapsed && <ChevronDown className="w-4 h-4 ml-auto" />}
            {isSidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                分供商管理
              </div>
            )}
          </div>
          <div className="px-4 py-2 hover:bg-white/10 cursor-pointer flex items-center justify-center group relative">
            <Calendar className="w-[18px] h-[18px] flex-shrink-0" />
            <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100'}`}>采购计划管理</span>
            {!isSidebarCollapsed && <ChevronDown className="w-4 h-4 ml-auto" />}
            {isSidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                采购计划管理
              </div>
            )}
          </div>
          <div className="bg-black/10 pb-1">
            <div className="px-4 py-2 hover:bg-white/10 cursor-pointer flex items-center justify-center group relative">
              <Gavel className="w-[18px] h-[18px] flex-shrink-0" />
              <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100'}`}>招标采购</span>
              {!isSidebarCollapsed && <ChevronUp className="w-4 h-4 ml-auto" />}
              {isSidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  招标采购
                </div>
              )}
            </div>
            {!isSidebarCollapsed && (
              <>
                <div className="pl-12 pr-4 py-2 text-xs opacity-80 hover:text-white hover:bg-white/5 cursor-pointer">
                  待采购任务
                </div>
                <div className="pl-12 pr-4 py-2 text-xs opacity-80 hover:text-white hover:bg-white/5 cursor-pointer">
                  招标/采购稽查
                </div>
                <div className="pl-12 pr-4 py-2 text-xs opacity-80 hover:text-white hover:bg-white/5 cursor-pointer">
                  集中资格预审列表
                </div>
                <div className="pl-12 pr-4 py-2 text-xs opacity-80 hover:text-white hover:bg-white/5 cursor-pointer">
                  招标列表
                </div>
                <div className="pl-12 pr-4 py-2 text-xs opacity-80 hover:text-white hover:bg-white/5 cursor-pointer nav-item-active font-medium">
                  非招标采购
                </div>
                <div className="pl-12 pr-4 py-2 text-xs opacity-80 hover:text-white hover:bg-white/5 cursor-pointer">
                  采购列表
                </div>
              </>
            )}
          </div>
          <div className="px-4 py-2 hover:bg-white/10 cursor-pointer flex items-center justify-center group relative">
            <Users className="w-[18px] h-[18px] flex-shrink-0" />
            <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100'}`}>推荐人管理</span>
            {isSidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                推荐人管理
              </div>
            )}
          </div>
          <div className="px-4 py-2 hover:bg-white/10 cursor-pointer flex items-center justify-center group relative">
            <FileCheck className="w-[18px] h-[18px] flex-shrink-0" />
            <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100'}`}>评标/评审专家列表</span>
            {isSidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                评标/评审专家列表
              </div>
            )}
          </div>
          <div className="px-4 py-2 hover:bg-white/10 cursor-pointer flex items-center justify-center group relative">
            <Wallet className="w-[18px] h-[18px] flex-shrink-0" />
            <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100'}`}>投标/响应保证金管理</span>
            {isSidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                投标/响应保证金管理
              </div>
            )}
          </div>
          <div className="px-4 py-2 hover:bg-white/10 cursor-pointer flex items-center justify-center group relative">
            <Shield className="w-[18px] h-[18px] flex-shrink-0" />
            <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100'}`}>履约保证金管理</span>
            {isSidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                履约保证金管理
              </div>
            )}
          </div>
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center space-x-2"></div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <select className="appearance-none bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-1 pl-3 pr-8 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                <option>中国建筑股份...</option>
              </select>
              <ChevronDown className="absolute right-2 top-2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
            <div className="relative">
              <input className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-xs py-1.5 px-3 rounded w-48 focus:outline-none focus:border-primary" placeholder="支持通过关键字搜索菜单" type="text" />
              <Search className="absolute right-2 top-2 text-gray-400 w-[14px] h-[14px]" />
            </div>
            <div className="flex items-center text-xs text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
              <span className="w-4 h-3 bg-red-600 rounded-sm mr-1"></span>
              简体中文
              <ChevronDown className="w-[14px] h-[14px] ml-1" />
            </div>
            <div className="flex items-center space-x-4 text-gray-500 dark:text-gray-400">
              <div className="flex items-center cursor-pointer hover:text-primary">
                <Building2 className="w-[18px] h-[18px] mr-1" />
                <span className="text-xs">云筑首页</span>
              </div>
              <div className="flex items-center cursor-pointer hover:text-primary">
                <ListVideo className="w-[18px] h-[18px] mr-1" />
                <span className="text-xs">寻源工作台</span>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-400 border-l border-gray-200 dark:border-gray-600 pl-4">
              <HelpCircle className="w-[18px] h-[18px] cursor-pointer hover:text-primary" />
              <div className="relative cursor-pointer hover:text-primary">
                <Bell className="w-[18px] h-[18px]" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-4 h-3 flex items-center justify-center rounded-full">37</span>
              </div>
              <div className="flex items-center cursor-pointer hover:text-primary">
                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 mr-1 overflow-hidden">
                  <img alt="Avatar" className="w-full h-full object-cover" src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20user%20avatar&image_size=square" />
                </div>
                <span className="text-xs">奥巴马</span>
                <ChevronDown className="w-[14px] h-[14px] ml-0.5" />
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-gray-900">
          {/* 面包屑导航栏 */}
          <div className="breadcrumb-bar">
            <div className="breadcrumb-nav">
              <span className="breadcrumb-item">采购列表</span>
              <span className="breadcrumb-separator">&gt;</span>
              <span className="breadcrumb-item active">编制采购公告</span>
            </div>
          </div>

          {/* 内容区域 */}
          <div className="p-4">

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-sm mr-2">物资</span>
                <h1 className="text-lg font-bold text-gray-800 dark:text-white">XXX项目物资采购</h1>
              </div>
              <div className="flex items-center space-x-2">
                <button className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-4 py-1.5 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-600">上一步</button>
                <button className="bg-primary text-white px-4 py-1.5 rounded text-sm hover:bg-primary-dark shadow-sm">保存</button>
                <button className="bg-primary text-white px-4 py-1.5 rounded text-sm hover:bg-primary-dark shadow-sm">下一步</button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded shadow-sm p-4 mb-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-4 text-sm">
                <span className="text-gray-600 dark:text-gray-400 mr-2">距废除截止还剩：</span>
                <div className="flex items-center space-x-1 font-mono text-primary">
                  <span className="border border-primary px-1 rounded">999996</span>
                  <span className="text-gray-500">天</span>
                  <span className="border border-primary px-1 rounded">23</span>
                  <span className="text-gray-500">:</span>
                  <span className="border border-primary px-1 rounded">58</span>
                  <span className="text-gray-500">:</span>
                  <span className="border border-primary px-1 rounded">10</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-y-2 text-xs text-gray-600 dark:text-gray-400">
                <div>采购编号：<span className="text-blue-500 hover:underline cursor-pointer">cscec2026040100000021220</span></div>
                <div>组织机构：中国建筑股份有限公司</div>
                <div>采购方式：询比采购</div>
                <div>项目：<span className="text-blue-500 hover:underline cursor-pointer">测试项目41927</span></div>
                <div>品类：物资-钢材</div>
                <div>经办人：奥巴马</div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-sm mb-4 border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* 步骤条 */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-medium">1</div>
                    <span className="ml-2 text-sm font-medium text-primary">编制采购公告</span>
                  </div>
                  <div className="w-16 h-px bg-primary mx-2"></div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 flex items-center justify-center text-xs font-medium">2</div>
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">选择分供商</span>
                  </div>
                  <div className="w-16 h-px bg-gray-200 dark:bg-gray-600 mx-2"></div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 flex items-center justify-center text-xs font-medium">3</div>
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">审批</span>
                  </div>
                </div>
              </div>

              <div className="p-4">
                {/* 是否自动发布公告 */}
                <div className="mb-4 flex items-center">
                  <span className="text-red-500 mr-1">*</span>
                  <span className="text-gray-700 dark:text-gray-300 text-sm mr-2">是否自动发布公告</span>
                  <HelpCircle className="w-[14px] h-[14px] text-gray-400 mr-2" />
                  <span className="mr-2">：</span>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="autoPublish"
                        className="mr-1"
                        checked={autoPublish}
                        onChange={() => setAutoPublish(true)}
                      />
                      <span className="text-sm">是</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="autoPublish"
                        className="mr-1"
                        checked={!autoPublish}
                        onChange={() => setAutoPublish(false)}
                      />
                      <span className="text-sm">否</span>
                    </label>
                  </div>
                  <div className="ml-auto flex items-center">
                    <span className="text-red-500 mr-1">*</span>
                    <span className="text-gray-700 dark:text-gray-300 text-sm mr-2">预计报名截止时间</span>
                    <span className="mr-2">：</span>
                    {autoPublish ? (
                      <>
                        <span className="text-gray-700 dark:text-gray-300 text-sm mr-2">公告审批通过后</span>
                        <input
                          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-2 py-1 text-sm w-20 focus:border-primary outline-none mr-2"
                          type="text"
                          placeholder="请输入"
                          value={hoursAfterApproval}
                          onChange={(e) => setHoursAfterApproval(e.target.value)}
                        />
                        <span className="text-gray-700 dark:text-gray-300 text-sm">小时</span>
                      </>
                    ) : (
                      <DatePicker
                        showTime
                        format="YYYY-MM-DD HH:mm:ss"
                        placeholder="请选择日期"
                        style={{ width: 200 }}
                      />
                    )}
                  </div>
                </div>

                {/* 采购公告格式 */}
                <div className="mb-4 flex items-center">
                  <span className="text-red-500 mr-1">*</span>
                  <span className="text-gray-700 dark:text-gray-300 text-sm mr-2">采购公告格式：</span>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" name="announcementFormat" className="mr-1" defaultChecked />
                      <span className="text-sm">范本</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" name="announcementFormat" className="mr-1" />
                      <span className="text-sm">富文本</span>
                    </label>
                  </div>
                </div>

                {/* 公告内容 */}
                <div className="mb-4">
                  <div className="flex items-center">
                    <span className="text-red-500 mr-1">*</span>
                    <span className="text-gray-700 dark:text-gray-300 text-sm mr-2">公告内容：</span>
                    <button className="bg-primary text-white text-xs px-3 py-1 rounded flex items-center">
                      去生成 &gt;&gt;
                    </button>
                  </div>
                </div>
                <div className="mb-4 flex items-start">
                  <div className="flex-shrink-0 flex flex-col items-center justify-center mr-2 pt-1" style={{ width: '120px' }}>
                    <div className="w-full text-center text-gray-700 dark:text-gray-300 text-sm">公告附件</div>
                    <div className="w-full text-center text-gray-400 text-xs whitespace-nowrap mt-1">（仅内部可见）</div>
                  </div>
                  <div className="flex-1 flex items-start pt-1">
                    <span className="text-gray-400 text-xs">：</span>
                    <div className="flex-1">
                      <div className="text-gray-400 text-xs">大小限制：1024M 支持格式：.jpeg .jpg .gif .png .doc .docx .xls .xlsx .txt .pdf .rar .zip .7z .tar .jar .dwg .dws .dwt .dxf .csv</div>
                      <button className="mt-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs px-3 py-1.5 rounded flex items-center hover:bg-gray-50 dark:hover:bg-gray-700">
                        <Plus className="w-[14px] h-[14px] mr-1" /> 添加附件
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mb-2 flex items-start">
                  <div className="flex-shrink-0 flex flex-col items-center justify-center mr-2 pt-1" style={{ width: '120px' }}>
                    <div className="w-full flex items-center justify-center text-red-500 text-sm">
                      <span className="mr-1">*</span>
                      <span>公告附件</span>
                    </div>
                    <div className="text-red-500 text-xs whitespace-nowrap mt-1 text-center w-full">（供应商可见）</div>
                  </div>
                  <div className="flex-1 flex items-start pt-1">
                    <span className="text-gray-400 text-xs">：</span>
                    <div className="flex-1">
                      <div className="text-gray-400 text-xs">大小限制：1024M 支持格式：.jpeg .jpg .gif .png .doc .docx .xls .xlsx .txt .pdf .rar .zip .7z .tar .jar .dwg .dws .dwt .dxf .csv</div>
                      <button className="mt-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs px-3 py-1.5 rounded flex items-center hover:bg-gray-50 dark:hover:bg-gray-700">
                        <Plus className="w-[14px] h-[14px] mr-1" /> 添加附件
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 资格审查附件组成 */}
            <div className="bg-white dark:bg-gray-800 rounded shadow-sm mb-4 border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-1 h-4 bg-primary mr-2"></div>
                  <h2 className="font-bold text-gray-800 dark:text-white text-sm">资格审查附件组成</h2>
                </div>
                <ChevronUp className="w-5 h-5 text-gray-400 cursor-pointer" />
              </div>
              <div className="p-4">
                <div className="flex items-center">
                  <span className="text-gray-700 dark:text-gray-300 text-sm mr-2">是否设定资格审查附件组成</span>
                  <HelpCircle className="w-[14px] h-[14px] text-gray-400 mr-2" />
                  <span className="mr-2">：</span>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" name="attachmentGroup" className="mr-1" />
                      <span className="text-sm">是</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" name="attachmentGroup" className="mr-1" defaultChecked />
                      <span className="text-sm">否</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* 分供商报名要求 */}
            <div className="bg-white dark:bg-gray-800 rounded shadow-sm mb-4 border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-1 h-4 bg-primary mr-2"></div>
                  <h2 className="font-bold text-gray-800 dark:text-white text-sm">分供商报名要求</h2>
                </div>
                <ChevronUp className="w-5 h-5 text-gray-400 cursor-pointer" />
              </div>
              <div className="p-4">
                <div className="mb-4 flex items-center">
                  <span className="text-gray-700 dark:text-gray-300 text-sm mr-2">分供商来源</span>
                  <HelpCircle className="w-[14px] h-[14px] text-gray-400 mr-2" />
                  <span className="mr-2">：</span>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" name="supplierSource" className="mr-1" defaultChecked />
                      <span className="text-sm">云筑网</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" name="supplierSource" className="mr-1" />
                      <span className="text-sm">云筑网+外部</span>
                    </label>
                  </div>
                </div>
                <div className="mb-4 flex items-center">
                  <span className="text-gray-700 dark:text-gray-300 text-sm mr-2">分供商类别</span>
                  <HelpCircle className="w-[14px] h-[14px] text-gray-400 mr-2" />
                  <span className="mr-2">：</span>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input type="checkbox" className="mr-1" />
                      <span className="text-sm">生产厂家</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input type="checkbox" className="mr-1" />
                      <span className="text-sm">经销商</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input type="checkbox" className="mr-1" />
                      <span className="text-sm">贸易商</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input type="checkbox" className="mr-1" />
                      <span className="text-sm">租赁商</span>
                    </label>
                  </div>
                </div>
                <div className="mb-4 flex items-center">
                  <span className="text-gray-700 dark:text-gray-300 text-sm mr-2">分供商等级</span>
                  <HelpCircle className="w-[14px] h-[14px] text-gray-400 mr-2" />
                  <span className="mr-2">：</span>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input type="checkbox" className="mr-1" />
                      <span className="text-sm">战略</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input type="checkbox" className="mr-1" />
                      <span className="text-sm">优秀</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input type="checkbox" className="mr-1" />
                      <span className="text-sm">合格</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input type="checkbox" className="mr-1" />
                      <span className="text-sm">新准入</span>
                    </label>
                  </div>
                </div>
                <div className="mb-4 flex items-center">
                  <span className="text-gray-700 dark:text-gray-300 text-sm mr-2">分供商性质</span>
                  <HelpCircle className="w-[14px] h-[14px] text-gray-400 mr-2" />
                  <span className="mr-2">：</span>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input type="checkbox" className="mr-1" />
                      <span className="text-sm">内部单位</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input type="checkbox" className="mr-1" />
                      <span className="text-sm">外部单位</span>
                    </label>
                  </div>
                </div>
                <div className="mb-4 flex items-center">
                  <span className="text-gray-700 dark:text-gray-300 text-sm mr-2">报名时需要缴纳投标/响应保证金</span>
                  <HelpCircle className="w-[14px] h-[14px] text-gray-400 mr-2" />
                  <span className="mr-2">：</span>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" name="depositRequired" className="mr-1" />
                      <span className="text-sm">是</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" name="depositRequired" className="mr-1" defaultChecked />
                      <span className="text-sm">否</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* 分供商推荐设置 */}
            <div className="bg-white dark:bg-gray-800 rounded shadow-sm mb-4 border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-1 h-4 bg-primary mr-2"></div>
                  <h2 className="font-bold text-gray-800 dark:text-white text-sm">分供商推荐设置</h2>
                </div>
                <ChevronUp className="w-5 h-5 text-gray-400 cursor-pointer" />
              </div>
              <div className="p-4">
                <div className="flex items-center">
                  <span className="text-gray-700 dark:text-gray-300 text-sm mr-2">推荐分供商</span>
                  <HelpCircle className="w-[14px] h-[14px] text-gray-400 mr-2" />
                  <span className="mr-2">：</span>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" name="recommendSupplier" className="mr-1" />
                      <span className="text-sm">是</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" name="recommendSupplier" className="mr-1" defaultChecked />
                      <span className="text-sm">否</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* 采购清单 */}
            <div className="bg-white dark:bg-gray-800 rounded shadow-sm mb-4 border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-1 h-4 bg-primary mr-2"></div>
                  <h2 className="font-bold text-gray-800 dark:text-white text-sm">采购清单</h2>
                </div>
                <ChevronUp className="w-5 h-5 text-gray-400 cursor-pointer" />
              </div>
              <div className="p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      <th className="px-3 py-2 text-left font-medium">序号</th>
                      <th className="px-3 py-2 text-left font-medium">物资名称</th>
                      <th className="px-3 py-2 text-left font-medium">规格型号</th>
                      <th className="px-3 py-2 text-left font-medium">单位</th>
                      <th className="px-3 py-2 text-left font-medium">数量</th>
                      <th className="px-3 py-2 text-left font-medium">控制价（元）</th>
                      <th className="px-3 py-2 text-left font-medium">税率</th>
                      <th className="px-3 py-2 text-left font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700 dark:text-gray-300">
                    <tr className="border-b border-gray-100 dark:border-gray-700">
                      <td className="px-3 py-2">1</td>
                      <td className="px-3 py-2">钢筋</td>
                      <td className="px-3 py-2">HRB400 Φ12</td>
                      <td className="px-3 py-2">吨</td>
                      <td className="px-3 py-2">100</td>
                      <td className="px-3 py-2">4,500.00</td>
                      <td className="px-3 py-2">13%</td>
                      <td className="px-3 py-2">
                        <button className="text-blue-500 hover:underline text-xs">编辑</button>
                        <button className="text-red-500 hover:underline text-xs ml-2">删除</button>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 dark:border-gray-700">
                      <td className="px-3 py-2">2</td>
                      <td className="px-3 py-2">钢筋</td>
                      <td className="px-3 py-2">HRB400 Φ16</td>
                      <td className="px-3 py-2">吨</td>
                      <td className="px-3 py-2">200</td>
                      <td className="px-3 py-2">4,400.00</td>
                      <td className="px-3 py-2">13%</td>
                      <td className="px-3 py-2">
                        <button className="text-blue-500 hover:underline text-xs">编辑</button>
                        <button className="text-red-500 hover:underline text-xs ml-2">删除</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="mt-2 text-center">
                  <button className="text-primary hover:text-primary-dark text-xs">添加</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Component;
