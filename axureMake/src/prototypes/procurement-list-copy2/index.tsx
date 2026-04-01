import React, { useState, useEffect, useRef } from 'react';
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
  Bot,
  Headset,
  UserCog,
  Smartphone,
  Search,
  Building2,
  ListVideo,
  Send,
  RefreshCcw,
  Star,
  CloudDownload,
  HelpCircle,
  Bell,
  Check,
  Plus,
  Upload,
  Trash2,
  X,
  AlertCircle,
  Edit,
  CheckCircle,
  Clock,
  Circle,
  CheckCircle2,
  Info,
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
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCheckingModalOpen, setIsCheckingModalOpen] = useState(false);
  const [isConfirmCheckModalOpen, setIsConfirmCheckModalOpen] = useState(false);
  const [isInterceptModalOpen, setIsInterceptModalOpen] = useState(false);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [autoPublish, setAutoPublish] = useState(false);
  const [hoursAfterApproval, setHoursAfterApproval] = useState('');

  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      type: 'text',
      text: '您好，我是您的数字合规官。今天是2026年02月04日，请问有什么可以帮您？您可以询问关于项目的“风险”情况。',
    },
  ]);
  const [chatInputValue, setChatInputValue] = useState('');
  const chatHistoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatMessages, isChatOpen]);

  const handleSendMessage = () => {
    if (!chatInputValue.trim()) return;

    const newUserMsg = {
      id: Date.now(),
      sender: 'user',
      type: 'text',
      text: chatInputValue,
    };

    setChatMessages((prev: any) => [...prev, newUserMsg]);
    setChatInputValue('');

    if (chatInputValue.includes('风险')) {
      setTimeout(() => {
        setChatMessages((prev: any) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'bot',
            type: 'risk-nodes',
            text: '',
          },
        ]);
      }, 500);
    } else {
      setTimeout(() => {
        setChatMessages((prev: any) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'bot',
            type: 'text',
            text: '我尚未掌握此信息。作为数字合规官，我主要协助识别与应对数据、隐私及监管相关的合规风险',
          },
        ]);
      }, 500);
    }
  };

  const [expandedNodes, setExpandedNodes] = useState<{ [key: string]: boolean }>({});

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev: { [key: string]: boolean }) => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

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
            <ShieldCheck className="w-[18px] h-[18px] flex-shrink-0" />
            <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100'}`}>厂家直签审核</span>
            {isSidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                厂家直签审核
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
              <div className="flex items-center cursor-pointer hover:text-primary">
                <Send className="w-[18px] h-[18px] mr-1" />
                <span className="text-xs">发布招募需求</span>
              </div>
              <div className="flex items-center cursor-pointer hover:text-primary">
                <RefreshCcw className="w-[18px] h-[18px] mr-1" />
                <span className="text-xs">切换新版</span>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-400 border-l border-gray-200 dark:border-gray-600 pl-4">
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
                <button onClick={() => setIsConfirmCheckModalOpen(true)} className="bg-primary text-white px-4 py-1.5 rounded text-sm hover:bg-primary-dark shadow-sm">下一步</button>
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
              <div className="step-container">
                <div className="step-item active">采购发起</div>
                <div className="step-item">采购响应</div>
                <div className="step-item">文件开启</div>
                <div className="step-item">采购评审</div>
                <div className="step-item">采购成交</div>
              </div>
              <div className="sub-step-container">
                <div className="sub-step-items">
                  <div className="sub-step-item">
                    <span className="sub-step-label active">采购基本信息</span>
                    <div className="sub-step-dot completed">
                      <Check className="w-3 h-3 text-white stroke-[3]" />
                    </div>
                  </div>
                  <div className="sub-step-item">
                    <span className="sub-step-label active">编制采购清单</span>
                    <div className="sub-step-dot completed">
                      <Check className="w-3 h-3 text-white stroke-[3]" />
                    </div>
                  </div>
                  <div className="sub-step-item">
                    <span className="sub-step-label current">编制采购(资格预审)公告</span>
                    <div className="sub-step-dot current"></div>
                  </div>
                  <div className="sub-step-item">
                    <span className="sub-step-label">发布采购(资格预审)公告</span>
                    <div className="sub-step-dot"></div>
                  </div>
                  <div className="sub-step-item">
                    <span className="sub-step-label">报名与资审汇总</span>
                    <div className="sub-step-dot"></div>
                  </div>
                  <div className="sub-step-item">
                    <span className="sub-step-label">资审结果通知</span>
                    <div className="sub-step-dot"></div>
                  </div>
                </div>
                <div className="sub-step-line-container">
                  <div className="sub-step-line active" style={{ flex: '0 0 40%' }}></div>
                  <div className="sub-step-line"></div>
                </div>
              </div>
            </div>

            {/* 编制采购(资格预审)公告 */}
            <div className="bg-white dark:bg-gray-800 rounded shadow-sm mb-4 border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-1 h-4 bg-primary mr-2"></div>
                  <h2 className="font-bold text-gray-800 dark:text-white text-sm">编制采购(资格预审)公告</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="text-gray-500 hover:text-gray-700 text-xs flex items-center">
                    加密设置 <HelpCircle className="w-[14px] h-[14px] ml-1" />
                  </button>
                  <ChevronUp className="w-5 h-5 text-gray-400 cursor-pointer" />
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center">
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
                  </div>
                  <div className="flex items-center">
                    <span className="text-red-500 mr-1">*</span>
                    <span className="text-gray-700 dark:text-gray-300 text-sm mr-2">预计报名截止时间：</span>
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
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <span className="text-red-500 mr-1">*</span>
                    <span className="text-gray-700 dark:text-gray-300 text-sm mr-2">采购公告格式：</span>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center cursor-pointer">
                        <input type="radio" name="noticeFormat" className="mr-1" defaultChecked />
                        <span className="text-sm">范本</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input type="radio" name="noticeFormat" className="mr-1" />
                        <span className="text-sm">富文本</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <span className="text-red-500 mr-1">*</span>
                    <span className="text-gray-700 dark:text-gray-300 text-sm mr-2">公告内容：</span>
                    <button className="bg-primary text-white text-xs px-3 py-1 rounded flex items-center">
                      去生成 &gt;&gt;
                    </button>
                  </div>
                </div>
                <div className="mb-4 flex items-center">
                  <div className="flex-shrink-0 text-right mr-2" style={{ width: '100px' }}>
                    <div className="text-gray-700 dark:text-gray-300 text-sm">公告附件</div>
                    <div className="text-gray-400 text-xs whitespace-nowrap">（仅内部可见）</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-400 text-xs">：大小限制：1024M 支持格式：.jpeg .jpg .gif .png .doc .docx .xls .xlsx .txt .pdf .rar .zip .7z .tar .jar .dwg .dws .dwt .dxf .csv</div>
                    <button className="mt-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs px-3 py-1.5 rounded flex items-center hover:bg-gray-50 dark:hover:bg-gray-700">
                      <Plus className="w-[14px] h-[14px] mr-1" /> 添加附件
                    </button>
                  </div>
                </div>
                <div className="mb-2 flex items-center">
                  <div className="flex-shrink-0 text-right mr-2" style={{ width: '100px' }}>
                    <div className="text-red-500 text-sm">
                      <span>*</span>
                      <span>公告附件</span>
                    </div>
                    <div className="text-red-500 text-xs whitespace-nowrap">（供应商可见）</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-400 text-xs">：大小限制：1024M 支持格式：.jpeg .jpg .gif .png .doc .docx .xls .xlsx .txt .pdf .rar .zip .7z .tar .jar .dwg .dws .dwt .dxf .csv</div>
                    <button className="mt-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs px-3 py-1.5 rounded flex items-center hover:bg-gray-50 dark:hover:bg-gray-700">
                      <Plus className="w-[14px] h-[14px] mr-1" /> 添加附件
                    </button>
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

            {/* 资格审查条件 */}
            <div className="bg-white dark:bg-gray-800 rounded shadow-sm mb-4 border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-1 h-4 bg-primary mr-2"></div>
                  <h2 className="font-bold text-gray-800 dark:text-white text-sm">资格审查条件</h2>
                  <span className="text-primary text-xs ml-2 cursor-pointer">智能资审条件推荐，点击查看！</span>
                </div>
                <ChevronUp className="w-5 h-5 text-gray-400 cursor-pointer" />
              </div>
              <div className="p-4">
                <div className="flex items-center">
                  <span className="text-gray-700 dark:text-gray-300 text-sm mr-2">是否设定资格审查条件：</span>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" name="qualificationCondition" className="mr-1" />
                      <span className="text-sm">是</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" name="qualificationCondition" className="mr-1" defaultChecked />
                      <span className="text-sm">否</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* 供应商履约设置 */}
            <div className="bg-white dark:bg-gray-800 rounded shadow-sm mb-4 border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-1 h-4 bg-primary mr-2"></div>
                  <h2 className="font-bold text-gray-800 dark:text-white text-sm">供应商履约设置</h2>
                </div>
                <ChevronUp className="w-5 h-5 text-gray-400 cursor-pointer" />
              </div>
              <div className="p-4">
                <div className="flex items-center">
                  <span className="text-red-500 mr-1">*</span>
                  <span className="text-gray-700 dark:text-gray-300 text-sm mr-2">供应商履约金额展示</span>
                  <HelpCircle className="w-[14px] h-[14px] text-gray-400 mr-1" />
                  <span className="mr-2">：</span>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" name="performanceDisplay" className="mr-1" />
                      <span className="text-sm">是</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" name="performanceDisplay" className="mr-1" defaultChecked />
                      <span className="text-sm">否</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* 采购方联系方式 */}
            <div className="bg-white dark:bg-gray-800 rounded shadow-sm mb-4 border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-1 h-4 bg-primary mr-2"></div>
                  <h2 className="font-bold text-gray-800 dark:text-white text-sm">采购方联系方式</h2>
                  <HelpCircle className="w-[14px] h-[14px] text-gray-400 ml-1" />
                </div>
                <ChevronUp className="w-5 h-5 text-gray-400 cursor-pointer" />
              </div>
              <div className="p-4">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                    <tr>
                      <th className="p-2 text-center w-16">序号</th>
                      <th className="p-2"><span className="text-red-500">*</span> 联系人</th>
                      <th className="p-2"><span className="text-red-500">*</span> 联系方式</th>
                      <th className="p-2 text-center w-20">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="p-2 text-center">1</td>
                      <td className="p-2">
                        <input className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700" type="text" defaultValue="奥巴马（账号: hehetest）" />
                      </td>
                      <td className="p-2">
                        <input className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700" type="text" defaultValue="17700000007" />
                      </td>
                      <td className="p-2 text-center">
                        <button className="text-primary hover:text-primary-dark text-xs">删除</button>
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

      {/* Chat Sidebar - 右侧滑出式聊天面板 */}
      <div className={`fixed top-0 right-0 h-full z-50 flex transition-transform duration-300 ease-in-out ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* 聊天面板主体 */}
        <div className="w-[480px] h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-700">
          {/* 头部 */}
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">数字合规官</h2>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  <span className="text-xs text-slate-400">在线</span>
                </div>
              </div>
            </div>
            <button
              className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100/80 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-all duration-200 shadow-sm border border-white/20"
              onClick={() => setIsChatOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 聊天内容区 */}
          <div className="flex-1 overflow-y-auto p-5 chat-container" ref={chatHistoryRef}>
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 mb-6 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                {msg.sender === 'bot' && (
                  <div className="flex-shrink-0">
                    <img alt="Digital Officer Mascot" className="w-9 h-9 rounded-full ring-2 ring-primary/20" src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=digital%20compliance%20officer%20mascot%20avatar&image_size=square" />
                  </div>
                )}
                {msg.sender === 'user' ? (
                  <div className="bg-primary text-white px-4 py-2.5 rounded-2xl rounded-tr-none max-w-[85%] shadow-sm text-sm">
                    {msg.text}
                  </div>
                ) : msg.type === 'text' ? (
                  <div className="space-y-2">
                    <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 dark:border-slate-700 max-w-[95%]">
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                        {msg.text}
                      </p>
                    </div>
                  </div>
                ) : msg.type === 'risk-nodes' ? (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1">
                    <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 dark:border-slate-700">
                      <p className="font-semibold text-slate-800 dark:text-white mb-3 text-sm">为您检测到以下合规预警节点：</p>
                      <div className="space-y-3">
                        {/* Node 1 */}
                        <div className="relative group bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between cursor-pointer" onClick={() => toggleNode('node1')}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                              <Edit className="w-5 h-5 text-orange-500" />
                            </div>
                            <div>
                              <h3 className="text-slate-800 dark:text-white font-medium text-sm">采购发起</h3>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-slate-400">已完成 3个子项</span>
                                <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded">预警</span>
                              </div>
                            </div>
                          </div>
                          {expandedNodes['node1'] ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                        {expandedNodes['node1'] && (
                          <div className="pl-8 space-y-2 relative animate-in slide-in-from-top-2">
                            <div className="absolute left-3 top-0 bottom-4 w-px bg-slate-200 dark:bg-slate-700"></div>
                            <div className="relative bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700 flex items-center justify-between cursor-pointer" onClick={() => setIsInterceptModalOpen(true)}>
                              <div className="absolute -left-5 top-1/2 w-5 h-px bg-slate-200 dark:bg-slate-700"></div>
                              <span className="text-sm text-slate-700 dark:text-slate-200">编制采购清单</span>
                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div className="relative bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700 cursor-pointer" onClick={() => setIsInterceptModalOpen(true)}>
                              <div className="absolute -left-5 top-1/2 w-5 h-px bg-slate-200 dark:bg-slate-700"></div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-700 dark:text-slate-200">发布采购公告</span>
                              </div>
                              <div className="mt-1.5 flex items-center gap-2">
                                <span className="text-[11px] text-slate-400">检测到2项校验规则不通过</span>
                                <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded">预警</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          {/* 输入区 */}
          <div className="px-5 pb-5 pt-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <div className="relative flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm"
                  placeholder="请输入您的问题，例如：查看当前风险"
                  type="text"
                  value={chatInputValue}
                  onChange={(e: any) => setChatInputValue(e.target.value)}
                  onKeyDown={(e: any) => {
                    if (e.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors" onClick={handleSendMessage}>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar pb-1">
              <button className="whitespace-nowrap px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-xs text-slate-500 hover:border-primary hover:text-primary transition-colors bg-slate-50 dark:bg-slate-800" onClick={() => { setChatInputValue('查看合规风险'); setTimeout(handleSendMessage, 100); }}>查看合规风险</button>
              <button className="whitespace-nowrap px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-xs text-slate-500 hover:border-primary hover:text-primary transition-colors bg-slate-50 dark:bg-slate-800" onClick={() => { setChatInputValue('项目状态查询'); setTimeout(handleSendMessage, 100); }}>项目状态查询</button>
            </div>
          </div>
        </div>
      </div>

      {/* 遮罩层 - 仅视觉提示，不拦截点击 */}
      {isChatOpen && (
        <div
          className="fixed inset-0 bg-black/5 z-40 transition-opacity duration-300 pointer-events-none"
        />
      )}

      {/* Confirm Check Modal */}
      {isConfirmCheckModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex gap-4 mb-6">
              <div className="flex-shrink-0">
                <Info className="w-12 h-12 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">开始合规检测</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  是否确定开始合规检测？
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 px-6 py-2 rounded-md font-medium shadow-md transition-all" onClick={() => setIsConfirmCheckModalOpen(false)}>
                取消
              </button>
              <button className="bg-primary hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium shadow-md transition-all" onClick={() => { setIsConfirmCheckModalOpen(false); setIsCheckingModalOpen(true); }}>
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checking Modal */}
      {isCheckingModalOpen && !isWarningModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-4xl shadow-2xl rounded-xl overflow-hidden relative">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <span className="text-gray-800 dark:text-gray-200 font-medium text-lg">合规检测</span>
              </div>
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" onClick={() => setIsCheckingModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8">
              <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4 cursor-pointer" onClick={() => setIsWarningModalOpen(true)}>
                  数字合规官正在检测中，请稍等...
                </h1>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  <span>系统正在进行业务风险分析（最晚2026-02-10 18:18:18结束）</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center">
                  <img alt="Digital Compliance Officer at desk" className="w-full h-full object-cover opacity-90" src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=digital%20compliance%20officer%20working%20at%20desk&image_size=landscape_16_9" />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent pointer-events-none"></div>
                </div>
                <div className="flex flex-col gap-6">
                  <div className="stepper-item relative flex items-center gap-4">
                    <div className="stepper-line"></div>
                    <div className="z-10 bg-white dark:bg-[#1E1E1E] rounded-full">
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-primary font-medium">招采信息及分供商信息收集</span>
                      <CheckCircle className="w-[18px] h-[18px] text-green-500" />
                    </div>
                  </div>
                  <div className="stepper-item relative flex items-center gap-4">
                    <div className="stepper-line"></div>
                    <div className="z-10 bg-white dark:bg-[#1E1E1E] rounded-full">
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-primary font-medium">分供商风险信息扫描</span>
                      <CheckCircle className="w-[18px] h-[18px] text-green-500" />
                    </div>
                  </div>
                  <div className="stepper-item relative flex items-center gap-4">
                    <div className="stepper-line"></div>
                    <div className="z-10 bg-white dark:bg-[#1E1E1E] rounded-full">
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-primary font-medium">招采方风险信息扫描</span>
                      <CheckCircle className="w-[18px] h-[18px] text-green-500" />
                    </div>
                  </div>
                  <div className="stepper-item relative flex items-center gap-4">
                    <div className="stepper-line"></div>
                    <div className="z-10 bg-white dark:bg-[#1E1E1E] rounded-full">
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-primary font-medium">总体风险评级分析</span>
                      <CheckCircle className="w-[18px] h-[18px] text-green-500" />
                    </div>
                  </div>
                  <div className="stepper-item relative flex items-center gap-4">
                    <div className="stepper-line"></div>
                    <div className="z-10 bg-white dark:bg-[#1E1E1E] rounded-full">
                      <Circle className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">风险应对建议生成</span>
                      <Clock className="w-[18px] h-[18px] text-gray-400" />
                    </div>
                  </div>
                  <div className="stepper-item relative flex items-center gap-4">
                    <div className="stepper-line"></div>
                    <div className="z-10 bg-white dark:bg-[#1E1E1E] rounded-full">
                      <Circle className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">风险报告生成</span>
                      <Clock className="w-[18px] h-[18px] text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* 重新检测按钮 - 常显在右下角 */}
            <div className="absolute bottom-6 right-6 flex flex-col items-end gap-2">
              {/* 聊天气泡提示 - 数据变化时显示 */}
              <div className="bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700 rounded-lg px-3 py-2 text-xs text-orange-700 dark:text-orange-300 max-w-[200px] relative mb-1">
                <div className="absolute bottom-[-6px] right-8 w-3 h-3 bg-orange-50 dark:bg-orange-900/30 border-r border-b border-orange-200 dark:border-orange-700 transform rotate-45"></div>
                检测到您的信息发生变化，建议重新检测
              </div>
              <button
                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 shadow-sm"
                onClick={() => {
                  // 重新检测逻辑：关闭当前弹窗，重新发起检测
                  setIsCheckingModalOpen(false);
                  setTimeout(() => setIsCheckingModalOpen(true), 100);
                }}
              >
                <RefreshCcw className="w-4 h-4" />
                重新检测
              </button>
            </div>
            <div className="h-1 bg-gray-100 dark:bg-zinc-800 w-full">
              <div className="h-full bg-primary w-[66%] transition-all duration-1000"></div>
            </div>
          </div>
        </div>
      )}

      {/* Warning Modal (Switched from Checking) */}
      {isWarningModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 w-full max-w-6xl rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">合规检测</h2>
              </div>
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" onClick={() => { setIsWarningModalOpen(false); setIsCheckingModalOpen(false); }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-4 bg-orange-50 dark:bg-orange-900/20 border-b border-orange-100 dark:border-orange-800/30 flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                本次共完成 <span className="text-primary font-bold">X</span> 个业务风险项检测，通过 <span className="text-green-600 font-bold">X</span> 个检测项，未通过 <span className="text-red-500 font-bold">Y</span> 个检测项，检测通过比例 <span className="text-primary font-bold">100%</span>。请确认是否继续操作？
              </div>
              <button className="bg-primary hover:bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-medium transition-all flex items-center gap-1 shadow-sm">
                <CloudDownload className="w-[14px] h-[14px] mr-1" />
                下载风险明细
              </button>
            </div>
            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-blue-50 dark:bg-gray-700 text-primary dark:text-blue-300 text-sm">
                    <th className="px-6 py-3 font-semibold border-b border-blue-100 dark:border-gray-600 w-16 text-center whitespace-nowrap">序号</th>
                    <th className="px-6 py-3 font-semibold border-b border-blue-100 dark:border-gray-600 w-28 whitespace-nowrap">检测场景</th>
                    <th className="px-6 py-3 font-semibold border-b border-blue-100 dark:border-gray-600">风险预警名称</th>
                    <th className="px-6 py-3 font-semibold border-b border-blue-100 dark:border-gray-600 w-24 whitespace-nowrap">检测结果</th>
                    <th className="px-6 py-3 font-semibold border-b border-blue-100 dark:border-gray-600">风险预警信息</th>
                    <th className="px-6 py-3 font-semibold border-b border-blue-100 dark:border-gray-600">处置建议</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-700 dark:text-gray-300 divide-y divide-gray-100 dark:divide-gray-700">
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4 text-center text-gray-400">1</td>
                    <td className="px-6 py-4 text-gray-500">合规自查</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="bg-orange-400 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap flex items-center justify-center">预警</span>
                        <span className="font-medium">劳务清单内容校验</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">未通过</td>
                    <td className="px-6 py-4 leading-relaxed">本次劳务分包采购清单【清单名称】中存在机械设备：挖掘机</td>
                    <td className="px-6 py-4 leading-relaxed">建议删除本次采购清单【清单名称】中XX、YY行数据</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 px-8 py-2 rounded font-medium shadow-md active:scale-95 transition-all" onClick={() => { setIsWarningModalOpen(false); setIsCheckingModalOpen(false); }}>
                取消
              </button>
              <button className="bg-primary hover:bg-blue-600 text-white px-8 py-2 rounded font-medium shadow-md active:scale-95 transition-all" onClick={() => { setIsWarningModalOpen(false); setIsCheckingModalOpen(false); }}>
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Intercept Modal */}
      {isInterceptModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 w-full max-w-6xl rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">合规检测</h2>
              </div>
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" onClick={() => setIsInterceptModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-4 bg-orange-50 dark:bg-orange-900/20 border-b border-orange-100 dark:border-orange-800/30 flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                本次共完成 <span className="text-primary font-bold">X</span> 个业务风险项检测，通过 <span className="text-green-600 font-bold">X</span> 个检测项，未通过 <span className="text-red-500 font-bold">Y</span> 个检测项，检测通过比例 <span className="text-primary font-bold">XX%</span>。
                <span className="ml-2 text-red-500 font-medium italic underline underline-offset-4">存在拦截项请先完成风险处置</span>
              </div>
              <button className="bg-primary hover:bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-medium transition-all flex items-center gap-1 shadow-sm">
                <CloudDownload className="w-[14px] h-[14px] mr-1" />
                下载风险明细
              </button>
            </div>
            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-blue-50 dark:bg-gray-700 text-primary dark:text-blue-300 text-sm">
                    <th className="px-6 py-3 font-semibold border-b border-blue-100 dark:border-gray-600 w-16 text-center whitespace-nowrap">序号</th>
                    <th className="px-6 py-3 font-semibold border-b border-blue-100 dark:border-gray-600">风险预警名称</th>
                    <th className="px-6 py-3 font-semibold border-b border-blue-100 dark:border-gray-600 w-24 whitespace-nowrap">检测结果</th>
                    <th className="px-6 py-3 font-semibold border-b border-blue-100 dark:border-gray-600">风险预警信息</th>
                    <th className="px-6 py-3 font-semibold border-b border-blue-100 dark:border-gray-600">处置建议</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-700 dark:text-gray-300 divide-y divide-gray-100 dark:divide-gray-700">
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4 text-center text-gray-400">1</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap flex items-center justify-center">拦截</span>
                        <span className="font-medium">模板生成校验</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">未通过</td>
                    <td className="px-6 py-4 leading-relaxed">本次采购公告不是通过范本生成</td>
                    <td className="px-6 py-4 leading-relaxed">采购公告必须通过范本生成</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
              <button className="bg-primary hover:bg-blue-600 text-white px-8 py-2 rounded font-medium shadow-md active:scale-95 transition-all" onClick={() => setIsInterceptModalOpen(false)}>
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Component;
