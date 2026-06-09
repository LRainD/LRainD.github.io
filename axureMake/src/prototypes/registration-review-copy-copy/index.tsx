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
  CheckSquare,
  FileText,
  Download,
  ChevronRight,
  Filter,
  RotateCcw,
  MessageSquare,
  FileSpreadsheet,
  Printer,
  ChevronLeft,
  MoreHorizontal,
  Eye,
  FileDown
} from 'lucide-react';
import { Select } from 'antd';
import './style.css';

/**
 * @name 附件组成-报名与资审汇总
 * @mode axure
 */
const Component = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('material');
  const [searchValue, setSearchValue] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [reviewResults, setReviewResults] = useState([
    { id: 1, item: '营业执照有效性校验', importance: '必须符合', result: '通过', requirement: '营业执照须在有效期内且已完成年检', suggestion: '' },
    { id: 2, item: '安全生产许可证校验', importance: '必须符合', result: '未通过', requirement: '须持有有效的安全生产许可证', suggestion: '安全生产许可证已过期，请供应商及时办理续期并重新上传' },
    { id: 3, item: '授权委托书签章校验', importance: '必须符合', result: '待核实', requirement: '授权委托书须加盖公章及法人签字', suggestion: '系统超时，未能完成自动校验，请人工核实' },
  ]);

  const [isCheckDetailModalOpen, setIsCheckDetailModalOpen] = useState(false);
  const [selectedAttachmentId, setSelectedAttachmentId] = useState<number | null>(null);

  // 模拟供应商数据
  const suppliers = [
    {
      id: 1,
      name: 'sup202',
      level: '一级',
      company: '公建工程施工总承包(一级)；施工劳务资质(不分等级)、商标注册证(特级)、环境管理体系认证(特级)、映射全部(甲级)',
      legalPerson: 'gamalihu',
      phone: '13800138605',
      regTime: '2017-06-07 15:23:06',
      authPerson: 'gamalihu(sup202)',
      capital: '',
      companyType: '',
      address: '',
      qualifications: '0/1000',
      adminAccount: '',
      contact: '',
      status: 'pending'
    },
    {
      id: 2,
      name: '成都永鸿翔建筑机械有限公司',
      level: '',
      company: '',
      legalPerson: 'sup312',
      phone: '13800138183',
      regTime: '2019-05-10 00:00:00',
      authPerson: '--',
      capital: '',
      companyType: '',
      address: '',
      qualifications: '0/1000',
      adminAccount: '',
      contact: '',
      status: 'pending'
    },
    {
      id: 3,
      name: 'sup200',
      level: '一级',
      company: '质量管理体系认证(特级)、安全生产许可证(一级)',
      legalPerson: 'sup200',
      phone: '18602815113',
      regTime: '',
      authPerson: 'sup200(sup200)',
      capital: '',
      companyType: '',
      address: '',
      qualifications: '0/1000',
      adminAccount: '',
      contact: '',
      status: 'pending'
    },
    {
      id: 4,
      name: 'sup203',
      level: '一级',
      company: '',
      legalPerson: '',
      phone: '',
      regTime: '',
      authPerson: '',
      capital: '',
      companyType: '',
      address: '',
      qualifications: '',
      adminAccount: '',
      contact: '',
      status: 'pending'
    }
  ];

  // 弹窗中的审查附件数据
  const reviewAttachments = [
    { id: 1, name: '授权委托书（非法人投标需上传代理人社保证明）', template: '采购公告授权委托书模板.docx', file: '报名资料.pdf', checkStatus: '异常' },
    { id: 2, name: '营业执照', template: '', file: '报名资料.pdf', checkStatus: '通过' },
    { id: 3, name: '资质证书', template: '', file: '报名资料.pdf', checkStatus: '通过' },
    { id: 4, name: '安全施工许可证', template: '', file: '报名资料.pdf', checkStatus: '异常' },
    { id: 5, name: '其他附件', template: '', file: '报名资料.pdf', checkStatus: '通过' },
  ];

  // 附件检测详情数据
  const attachmentCheckDetails = [
    {
      id: 1,
      attachmentId: 1,
      checks: [
        { id: 1, item: '是否盖章', result: '未通过', detail: '未检测到盖章，请核实' },
        { id: 2, item: '法人签字', result: '通过', detail: '' },
        { id: 3, item: '有效期校验', result: '通过', detail: '' },
      ]
    },
    {
      id: 2,
      attachmentId: 4,
      checks: [
        { id: 1, item: '是否加盖公章', result: '通过', detail: '' },
        { id: 2, item: '有效期校验', result: '未通过', detail: '证件已过期，有效期至 2025-12-31' },
        { id: 3, item: '颁发机构核验', result: '通过', detail: '' },
      ]
    },
  ];

  // 弹窗中的资格审查条件数据
  const reviewConditions = [
    { id: 1, category: '企业名单', type: '风险类', intensity: '强制条件', method: '系统', source: '第三方数据', issuer: '--', result: '通过', reason: '', basis: '', operation: '--' },
    { id: 2, category: '企业名单', type: '风险类', intensity: '强制条件', method: '系统', source: '第三方数据', issuer: '--', result: '通过', reason: '', basis: '', operation: '--' },
    { id: 3, category: '名单', type: '风险类', intensity: '强制条件', method: '系统', source: '第三方数据', issuer: '--', result: '通过', reason: '', basis: '', operation: '--' },
    { id: 4, category: '违法', type: '风险类', intensity: '强制条件', method: '系统', source: '第三方数据', issuer: '--', result: '通过', reason: '', basis: '', operation: '--' },
    { id: 5, category: '营', type: '风险类', intensity: '强制条件', method: '系统', source: '云筑网', issuer: '--', result: '通过', reason: '', basis: '', operation: '--' },
    { id: 6, category: '用工程施工级', type: '能力类', intensity: '强制条件', method: '系统', source: '第三方数据', issuer: '市政公用工程施工总承包:四川省住房和城乡建设厅', result: '通过', reason: '', basis: '', operation: '--' },
    { id: 7, category: '', type: '风险类', intensity: '强制条件', method: '系统', source: '第三方数据', issuer: '--', result: '通过', reason: '', basis: '', operation: '--' },
  ];



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
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">首页</div>
            )}
          </div>
          <div className="px-4 py-2 hover:bg-white/10 cursor-pointer flex items-center justify-center group relative">
            <UserPlus className="w-[18px] h-[18px] flex-shrink-0" />
            <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100'}`}>权限申请菜单测试</span>
            {isSidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">权限申请菜单测试</div>
            )}
          </div>
          <div className="px-4 py-2 hover:bg-white/10 cursor-pointer flex items-center justify-center group relative">
            <ShoppingCart className="w-[18px] h-[18px] flex-shrink-0" />
            <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100'}`}>采购列表</span>
            {isSidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">采购列表</div>
            )}
          </div>
          <div className="px-4 py-2 hover:bg-white/10 cursor-pointer flex items-center justify-center group relative">
            <Store className="w-[18px] h-[18px] flex-shrink-0" />
            <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100'}`}>分供商管理</span>
            {!isSidebarCollapsed && <ChevronDown className="w-4 h-4 ml-auto" />}
            {isSidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">分供商管理</div>
            )}
          </div>
          <div className="px-4 py-2 hover:bg-white/10 cursor-pointer flex items-center justify-center group relative">
            <Calendar className="w-[18px] h-[18px] flex-shrink-0" />
            <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100'}`}>采购计划管理</span>
            {!isSidebarCollapsed && <ChevronDown className="w-4 h-4 ml-auto" />}
            {isSidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">采购计划管理</div>
            )}
          </div>
          <div className="bg-black/10 pb-1">
            <div className="px-4 py-2 hover:bg-white/10 cursor-pointer flex items-center justify-center group relative">
              <Gavel className="w-[18px] h-[18px] flex-shrink-0" />
              <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100'}`}>招标采购</span>
              {!isSidebarCollapsed && <ChevronUp className="w-4 h-4 ml-auto" />}
              {isSidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">招标采购</div>
              )}
            </div>
            {!isSidebarCollapsed && (
              <>
                <div className="pl-12 pr-4 py-2 text-xs opacity-80 hover:text-white hover:bg-white/5 cursor-pointer">待采购任务</div>
                <div className="pl-12 pr-4 py-2 text-xs opacity-80 hover:text-white hover:bg-white/5 cursor-pointer">招标/采购稽查</div>
                <div className="pl-12 pr-4 py-2 text-xs opacity-80 hover:text-white hover:bg-white/5 cursor-pointer">集中资格预审列表</div>
                <div className="pl-12 pr-4 py-2 text-xs opacity-80 hover:text-white hover:bg-white/5 cursor-pointer">招标列表</div>
                <div className="pl-12 pr-4 py-2 text-xs opacity-80 hover:text-white hover:bg-white/5 cursor-pointer">非招标采购</div>
                <div className="pl-12 pr-4 py-2 text-xs opacity-80 hover:text-white hover:bg-white/5 cursor-pointer nav-item-active font-medium">采购列表</div>
              </>
            )}
          </div>
          <div className="px-4 py-2 hover:bg-white/10 cursor-pointer flex items-center justify-center group relative">
            <Users className="w-[18px] h-[18px] flex-shrink-0" />
            <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100'}`}>推荐人管理</span>
            {isSidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">推荐人管理</div>
            )}
          </div>
          <div className="px-4 py-2 hover:bg-white/10 cursor-pointer flex items-center justify-center group relative">
            <FileCheck className="w-[18px] h-[18px] flex-shrink-0" />
            <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100'}`}>评标/评审专家列表</span>
            {isSidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">评标/评审专家列表</div>
            )}
          </div>
          <div className="px-4 py-2 hover:bg-white/10 cursor-pointer flex items-center justify-center group relative">
            <ShieldCheck className="w-[18px] h-[18px] flex-shrink-0" />
            <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100'}`}>厂家直签审核</span>
            {isSidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">厂家直签审核</div>
            )}
          </div>
          <div className="px-4 py-2 hover:bg-white/10 cursor-pointer flex items-center justify-center group relative">
            <Wallet className="w-[18px] h-[18px] flex-shrink-0" />
            <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100'}`}>投标/响应保证金管理</span>
            {isSidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">投标/响应保证金管理</div>
            )}
          </div>
          <div className="px-4 py-2 hover:bg-white/10 cursor-pointer flex items-center justify-center group relative">
            <Shield className="w-[18px] h-[18px] flex-shrink-0" />
            <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100'}`}>履约保证金管理</span>
            {isSidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">履约保证金管理</div>
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
              <span className="breadcrumb-item active">报名与资审汇总</span>
            </div>
          </div>

          {/* 内容区域 */}
          <div className="p-4">
            {/* 顶部信息栏 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-sm mr-2">物资</span>
                <h1 className="text-lg font-bold text-gray-800 dark:text-white">资审采购履约信用分</h1>
              </div>
              <div className="flex items-center space-x-2">
                <button className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-4 py-1.5 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-600">上一步</button>
                <button className="bg-primary text-white px-4 py-1.5 rounded text-sm hover:bg-primary-dark shadow-sm">保存</button>
                <button className="bg-primary text-white px-4 py-1.5 rounded text-sm hover:bg-primary-dark shadow-sm">提交审批</button>
                <button className="bg-primary text-white px-4 py-1.5 rounded text-sm hover:bg-primary-dark shadow-sm">并行采购作业</button>
              </div>
            </div>

            {/* 倒计时和基本信息 */}
            <div className="bg-white dark:bg-gray-800 rounded shadow-sm p-4 mb-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400 mr-2">距废除截止还剩：</span>
                  <div className="flex items-center space-x-1 font-mono text-primary">
                    <span className="border border-primary px-1 rounded">999864</span>
                    <span className="text-gray-500">天</span>
                    <span className="border border-primary px-1 rounded">19</span>
                    <span className="text-gray-500">:</span>
                    <span className="border border-primary px-1 rounded">01</span>
                    <span className="text-gray-500">:</span>
                    <span className="border border-primary px-1 rounded">09</span>
                  </div>
                </div>
                <span className="text-red-500 text-sm font-medium">报名已截止</span>
              </div>
              <div className="grid grid-cols-4 gap-y-2 text-xs text-gray-600 dark:text-gray-400">
                <div>采购编号：<span className="text-blue-500 hover:underline cursor-pointer">cscec202601230000001264</span></div>
                <div>组织机构：中建三局第一建筑有限公司</div>
                <div>采购方式：询比采购</div>
                <div>项目：战略采购</div>
                <div>品类：物资-有色金属</div>
                <div>经办人：奥巴马</div>
              </div>
            </div>

            {/* 步骤条 */}
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
                    <span className="sub-step-label active">编制采购(资格预审)公告</span>
                    <div className="sub-step-dot completed">
                      <Check className="w-3 h-3 text-white stroke-[3]" />
                    </div>
                  </div>
                  <div className="sub-step-item">
                    <span className="sub-step-label active">发布采购(资格预审)公告</span>
                    <div className="sub-step-dot completed">
                      <Check className="w-3 h-3 text-white stroke-[3]" />
                    </div>
                  </div>
                  <div className="sub-step-item">
                    <span className="sub-step-label current">报名与资审汇总</span>
                    <div className="sub-step-dot current"></div>
                  </div>
                  <div className="sub-step-item">
                    <span className="sub-step-label">资审结果通知</span>
                    <div className="sub-step-dot"></div>
                  </div>
                </div>
                <div className="sub-step-line-container">
                  <div className="sub-step-line active" style={{ flex: '0 0 80%' }}></div>
                  <div className="sub-step-line"></div>
                </div>
              </div>
            </div>

            {/* 报名与资审汇总 */}
            <div className="bg-white dark:bg-gray-800 rounded shadow-sm mb-4 border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-1 h-4 bg-primary mr-2"></div>
                  <h2 className="font-bold text-gray-800 dark:text-white text-sm">报名与资审汇总</h2>
                  <span className="text-xs text-gray-400 ml-2">资审历时：--</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">已推送0家</span>
                  <button className="text-primary text-xs border border-primary px-2 py-1 rounded hover:bg-blue-50">查看推送记录</button>
                  <button className="text-primary text-xs border border-primary px-2 py-1 rounded hover:bg-blue-50">报名情况导出</button>
                  <button className="text-primary text-xs border border-primary px-2 py-1 rounded hover:bg-blue-50">附件打包下载</button>
                  <button className="text-primary text-xs border border-primary px-2 py-1 rounded hover:bg-blue-50">自动辅助资审</button>
                  <button className="text-primary text-xs border border-primary px-2 py-1 rounded hover:bg-blue-50">导入资审结果</button>
                  <button className="bg-primary text-white text-xs px-3 py-1.5 rounded hover:bg-primary-dark">澄清</button>
                  <button className="bg-primary text-white text-xs px-3 py-1.5 rounded hover:bg-primary-dark">答疑</button>
                </div>
              </div>

              {/* 公告信息 */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span>公告发布时间：2026-01-23 17:44:52</span>
                    <span>已报名5家，未报名0家</span>
                    <span>报名截止时间：2026-01-26 16:48:00 <span className="text-blue-500 cursor-pointer">变更</span> <span className="text-blue-500 cursor-pointer">查看变更记录</span></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>工商关联0家</span>
                    <span>经常同时报名0家</span>
                  </div>
                </div>
              </div>

              {/* 信息重叠提示 */}
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-yellow-50 dark:bg-yellow-900/10">
                <div className="flex items-center text-xs">
                  <span className="text-yellow-600 dark:text-yellow-400 font-medium">信息重叠：</span>
                  <span className="text-yellow-600 dark:text-yellow-400 ml-1">当前环节存在信息重叠，请查看重叠详情</span>
                  <button className="ml-2 text-primary border border-primary px-2 py-0.5 rounded text-xs bg-white dark:bg-gray-700">更新信息重叠信息</button>
                </div>
              </div>

              {/* 分供商报告 */}
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs">
                <div className="flex items-center">
                  <span className="text-gray-500">分供商报告：</span>
                  <span className="text-gray-500 ml-1">已生成：0家 已授权：0家</span>
                  <span className="text-blue-500 cursor-pointer ml-2">查看报告数据</span>
                </div>
              </div>

              {/* 搜索筛选 */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-4">
                <div className="flex items-center text-xs">
                  <span className="text-gray-500 mr-2">分供商名称</span>
                  <input
                    className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs w-48 focus:border-primary outline-none"
                    type="text"
                    placeholder="请输入分供商名称"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                  />
                </div>
                <div className="flex items-center text-xs">
                  <span className="text-gray-500 mr-2">资格审查条件是否通过</span>
                  <select
                    className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs focus:border-primary outline-none"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">全部</option>
                    <option value="passed">已通过</option>
                    <option value="failed">未通过</option>
                  </select>
                </div>
                <button className="bg-primary text-white text-xs px-4 py-1.5 rounded hover:bg-primary-dark">查询</button>
                <button className="text-gray-500 text-xs px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50">重置</button>
              </div>

              {/* 供应商表格 */}
              <div className="overflow-x-auto" style={{ maxWidth: '100%' }}>
                <table className="text-xs text-left text-gray-600 dark:text-gray-300" style={{ minWidth: '1600px', tableLayout: 'fixed' }}>
                  <colgroup>
                    <col style={{ width: '40px' }} />
                    <col style={{ width: '50px' }} />
                    <col style={{ width: '220px' }} />
                    <col style={{ width: '60px' }} />
                    <col style={{ width: '100px' }} />
                    <col style={{ width: '110px' }} />
                    <col style={{ width: '130px' }} />
                    <col style={{ width: '130px' }} />
                    <col style={{ width: '120px' }} />
                    <col style={{ width: '80px' }} />
                    <col style={{ width: '120px' }} />
                    <col style={{ width: '100px' }} />
                    <col style={{ width: '100px' }} />
                    <col style={{ width: '80px' }} />
                    <col style={{ width: '100px' }} />
                  </colgroup>
                  <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium">
                    <tr>
                      <th className="p-2 text-center border-r border-gray-200 dark:border-gray-600">
                        <input className="rounded border-gray-300 text-primary focus:ring-primary" type="checkbox" />
                      </th>
                      <th className="p-2 text-center border-r border-gray-200 dark:border-gray-600">序号</th>
                      <th className="p-2 border-r border-gray-200 dark:border-gray-600">分供商</th>
                      <th className="p-2 border-r border-gray-200 dark:border-gray-600">质等级</th>
                      <th className="p-2 border-r border-gray-200 dark:border-gray-600">法人信息</th>
                      <th className="p-2 border-r border-gray-200 dark:border-gray-600">法人手机号</th>
                      <th className="p-2 border-r border-gray-200 dark:border-gray-600">注册时间</th>
                      <th className="p-2 border-r border-gray-200 dark:border-gray-600">授权人信息</th>
                      <th className="p-2 border-r border-gray-200 dark:border-gray-600">注册资金（万元）</th>
                      <th className="p-2 border-r border-gray-200 dark:border-gray-600">公司性质</th>
                      <th className="p-2 border-r border-gray-200 dark:border-gray-600">注册地址</th>
                      <th className="p-2 border-r border-gray-200 dark:border-gray-600">相关资质</th>
                      <th className="p-2 border-r border-gray-200 dark:border-gray-600">管理员账号</th>
                      <th className="p-2 border-r border-gray-200 dark:border-gray-600">联系人</th>
                      <th className="p-2 sticky right-0 bg-gray-100 dark:bg-gray-700 z-10 shadow-[-2px_0_4px_rgba(0,0,0,0.05)]">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {suppliers.map((supplier, index) => (
                      <tr key={supplier.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="p-2 text-center">
                          <input className="rounded border-gray-300 text-primary focus:ring-primary" type="checkbox" />
                        </td>
                        <td className="p-2 text-center">{index + 1}</td>
                        <td className="p-2">
                          <div className="flex flex-col">
                            <span className="text-blue-500 font-medium truncate">{supplier.name}</span>
                            {supplier.level && (
                              <span className="text-green-500 text-[10px]">{supplier.level}</span>
                            )}
                            <span className="text-gray-400 text-[10px] truncate">{supplier.company}</span>
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center space-x-1">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                          </div>
                        </td>
                        <td className="p-2 truncate">{supplier.legalPerson}</td>
                        <td className="p-2 truncate">{supplier.phone}</td>
                        <td className="p-2 truncate">{supplier.regTime}</td>
                        <td className="p-2 truncate">{supplier.authPerson}</td>
                        <td className="p-2 truncate">{supplier.capital}</td>
                        <td className="p-2 truncate">{supplier.companyType}</td>
                        <td className="p-2 truncate">{supplier.address}</td>
                        <td className="p-2">
                          {supplier.qualifications && (
                            <div className="flex items-center">
                              <span className="text-gray-400 truncate">{supplier.qualifications}</span>
                            </div>
                          )}
                        </td>
                        <td className="p-2 truncate">{supplier.adminAccount}</td>
                        <td className="p-2 truncate">{supplier.contact}</td>
                        <td className="p-2 sticky right-0 bg-white dark:bg-gray-800 z-10 shadow-[-2px_0_4px_rgba(0,0,0,0.05)]">
                          <button
                            onClick={() => setIsReviewModalOpen(true)}
                            className="text-primary hover:text-primary-dark text-xs bg-transparent flex items-center gap-1 whitespace-nowrap"
                          >
                            资格审查
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 资审报告格式 */}
            <div className="bg-white dark:bg-gray-800 rounded shadow-sm mb-4 border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center">
                <span className="text-red-500 mr-1">*</span>
                <span className="text-sm text-gray-700 dark:text-gray-300 mr-4">资审报告格式：</span>
                <label className="inline-flex items-center mr-6 cursor-pointer">
                  <input className="text-primary focus:ring-primary h-4 w-4 border-gray-300" name="reportFormat" type="radio" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">范本</span>
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input className="text-primary focus:ring-primary h-4 w-4 border-gray-300" name="reportFormat" type="radio" />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">富文本</span>
                </label>
              </div>
            </div>

            {/* 资审报告信息 */}
            <div className="bg-white dark:bg-gray-800 rounded shadow-sm mb-4 border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center">
                <span className="text-red-500 mr-1">*</span>
                <span className="text-sm text-gray-700 dark:text-gray-300 mr-4">资审报告信息：</span>
                <button className="bg-primary text-white text-xs px-3 py-1.5 rounded hover:bg-primary-dark">去生成 &gt;&gt;</button>
              </div>
              <div className="p-4">
                <div className="text-xs text-gray-400 mb-2">支持格式：.jpeg .jpg .gif .png .doc .docx .xls .xlsx .txt .pdf .rar .zip .7z .tar .jar .dwg .dws .dwt .dxf .csv</div>
                <button className="flex items-center text-primary border border-primary rounded px-3 py-1 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs">
                  <Plus className="w-[14px] h-[14px] mr-1" /> 添加附件
                </button>
              </div>
            </div>

            {/* 资审公示设置 */}
            <div className="bg-white dark:bg-gray-800 rounded shadow-sm mb-4 border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-center">
                  <div className="w-1 h-4 bg-primary mr-2"></div>
                  <h2 className="font-bold text-gray-800 dark:text-white text-sm">资审公示设置</h2>
                </div>
                <ChevronUp className="w-5 h-5 text-gray-400" />
              </div>
              <div className="p-4 flex items-center text-sm">
                <span className="text-red-500 mr-1">*</span>
                <span className="mr-4 text-gray-700 dark:text-gray-300">是否公示：</span>
                <label className="inline-flex items-center mr-6 cursor-pointer">
                  <input className="text-primary focus:ring-primary h-4 w-4 border-gray-300" name="publicity" type="radio" />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">公示</span>
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input defaultChecked className="text-primary focus:ring-primary h-4 w-4 border-gray-300" name="publicity" type="radio" />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">不公示</span>
                </label>
              </div>
            </div>

            {/* 自动发布资审结果设置 */}
            <div className="bg-white dark:bg-gray-800 rounded shadow-sm mb-10 border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-center">
                  <div className="w-1 h-4 bg-primary mr-2"></div>
                  <h2 className="font-bold text-gray-800 dark:text-white text-sm">自动发布资审结果设置</h2>
                </div>
                <ChevronUp className="w-5 h-5 text-gray-400" />
              </div>
              <div className="p-4 flex items-center text-sm">
                <span className="text-red-500 mr-1">*</span>
                <span className="mr-4 text-gray-700 dark:text-gray-300">是否自动发布资审结果：</span>
                <label className="inline-flex items-center mr-6 cursor-pointer">
                  <input className="text-primary focus:ring-primary h-4 w-4 border-gray-300" name="autoPublish" type="radio" />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">是</span>
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input defaultChecked className="text-primary focus:ring-primary h-4 w-4 border-gray-300" name="autoPublish" type="radio" />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">否</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 资格审查弹窗 */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 w-full max-w-6xl rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* 弹窗头部 */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">详细审查信息【投标方名称：四川启畅建筑工程有限公司】</h2>
              </div>
              <button
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                onClick={() => setIsReviewModalOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 弹窗内容 */}
            <div className="flex-1 overflow-auto custom-scrollbar p-6">
              {/* 资审附件组成 */}
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <div className="w-1 h-4 bg-primary mr-2"></div>
                  <h3 className="font-bold text-gray-800 dark:text-white text-sm">资审附件组成</h3>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium">
                      <tr>
                        <th className="p-3 w-16 text-center border-r border-gray-200 dark:border-gray-600">序号</th>
                        <th className="p-3 border-r border-gray-200 dark:border-gray-600">资审附件</th>
                        <th className="p-3 border-r border-gray-200 dark:border-gray-600">范本文件</th>
                        <th className="p-3 border-r border-gray-200 dark:border-gray-600">报名文件</th>
                        <th className="p-3 border-r border-gray-200 dark:border-gray-600">附件智能检测</th>
                        <th className="p-3">审核备注</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-600 dark:text-gray-300">
                      {reviewAttachments.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="p-3 text-center">{item.id}</td>
                          <td className="p-3">{item.name}</td>
                          <td className="p-3">
                            {item.template ? (
                              <div className="flex items-center text-blue-500 cursor-pointer hover:underline">
                                <FileText className="w-4 h-4 mr-1" />
                                {item.template}
                              </div>
                            ) : (
                              <span className="text-gray-400">未上传</span>
                            )}
                          </td>
                          <td className="p-3">
                            {item.file && (
                              <div className="flex items-center text-blue-500 cursor-pointer hover:underline">
                                <FileText className="w-4 h-4 mr-1" />
                                {item.file}
                              </div>
                            )}
                          </td>
                          <td className="p-3">
                            {item.checkStatus === '通过' ? (
                              <span className="inline-flex items-center text-green-600">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                通过
                              </span>
                            ) : item.checkStatus === '异常' ? (
                              <button
                                className="inline-flex items-center text-red-500 hover:text-red-600 hover:underline"
                                onClick={() => {
                                  setSelectedAttachmentId(item.id);
                                  setIsCheckDetailModalOpen(true);
                                }}
                              >
                                <AlertCircle className="w-4 h-4 mr-1" />
                                异常，查看详情
                              </button>
                            ) : (
                              <span className="text-gray-400">--</span>
                            )}
                          </td>
                          <td className="p-3"></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 资格审查条件 */}
              <div>
                <div className="flex items-center mb-3">
                  <div className="w-1 h-4 bg-primary mr-2"></div>
                  <h3 className="font-bold text-gray-800 dark:text-white text-sm">资格审查条件</h3>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium">
                      <tr>
                        <th className="p-3 w-12 text-center border-r border-gray-200 dark:border-gray-600">序号</th>
                        <th className="p-3 border-r border-gray-200 dark:border-gray-600">资格审查条件分类</th>
                        <th className="p-3 border-r border-gray-200 dark:border-gray-600">
                          <span className="text-red-500">*</span> 资审条件强度
                        </th>
                        <th className="p-3 border-r border-gray-200 dark:border-gray-600">审查方式</th>
                        <th className="p-3 border-r border-gray-200 dark:border-gray-600">来源渠道</th>
                        <th className="p-3 border-r border-gray-200 dark:border-gray-600">颁发机构/处罚机关</th>
                        <th className="p-3 border-r border-gray-200 dark:border-gray-600">是否通过</th>
                        <th className="p-3 border-r border-gray-200 dark:border-gray-600">未通过具体原因</th>
                        <th className="p-3 border-r border-gray-200 dark:border-gray-600">审查依据</th>
                        <th className="p-3">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-600 dark:text-gray-300">
                      {reviewConditions.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="p-3 text-center">{item.id}</td>
                          <td className="p-3">{item.category}</td>
                          <td className="p-3">{item.intensity}</td>
                          <td className="p-3">{item.method}</td>
                          <td className="p-3">{item.source}</td>
                          <td className="p-3">{item.issuer}</td>
                          <td className="p-3">
                            {item.result === '通过' && (
                              <div className="flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              </div>
                            )}
                          </td>
                          <td className="p-3">{item.reason}</td>
                          <td className="p-3">{item.basis}</td>
                          <td className="p-3">{item.operation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 智能审查结果 */}
              <div className="mt-6">
                <div className="flex items-center mb-3">
                  <div className="w-1 h-4 bg-primary mr-2"></div>
                  <h3 className="font-bold text-gray-800 dark:text-white text-sm">AI智能报名文件检测</h3>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium">
                      <tr>
                        <th className="p-3 w-12 text-center border-r border-gray-200 dark:border-gray-600">序号</th>
                        <th className="p-3 border-r border-gray-200 dark:border-gray-600">检测项</th>
                        <th className="p-3 border-r border-gray-200 dark:border-gray-600">
                          <div>重要程度</div>
                          <div className="text-gray-400 font-normal text-[10px] mt-0.5">（支持人工调整）</div>
                        </th>
                        <th className="p-3 border-r border-gray-200 dark:border-gray-600">
                          <div>检测结果</div>
                          <div className="text-gray-400 font-normal text-[10px] mt-0.5">（支持人工调整）</div>
                        </th>
                        <th className="p-3 border-r border-gray-200 dark:border-gray-600">招采要求</th>
                        <th className="p-3 border-r border-gray-200 dark:border-gray-600">异常建议</th>
                        <th className="p-3">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-600 dark:text-gray-300">
                      {reviewResults.map((item: any) => (
                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="p-3 text-center">{item.id}</td>
                          <td className="p-3">{item.item}</td>
                          <td className="p-3">
                            <Select
                              value={item.importance}
                              options={[
                                { value: '必须符合', label: '必须符合' },
                                { value: '加分项', label: '加分项' },
                              ]}
                              onChange={(value) =>
                                setReviewResults(
                                  reviewResults.map((r: any) =>
                                    r.id === item.id ? { ...r, importance: value } : r
                                  )
                                )
                              }
                              style={{ width: 90 }}
                              size="small"
                            />
                          </td>
                          <td className="p-3">
                            <Select
                              value={item.result}
                              options={[
                                { value: '通过', label: '通过' },
                                { value: '未通过', label: '未通过' },
                              ]}
                              onChange={(value) =>
                                setReviewResults(
                                  reviewResults.map((r: any) =>
                                    r.id === item.id
                                      ? { ...r, result: value, suggestion: value === '待核对' ? r.suggestion : '' }
                                      : r
                                  )
                                )
                              }
                              style={{ width: 90 }}
                              size="small"
                            />
                          </td>
                          <td className="p-3">{item.requirement}</td>
                          <td className="p-3 text-red-500">{item.suggestion}</td>
                          <td className="p-3">
                            <button
                              className="text-blue-500 hover:underline"
                              onClick={() => setReviewResults(reviewResults.filter((r: any) => r.id !== item.id))}
                            >
                              移除此项
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 弹窗底部 */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 px-6 py-2 rounded font-medium shadow-md transition-all"
                onClick={() => setIsReviewModalOpen(false)}
              >
                关闭
              </button>
              <button
                className="bg-primary hover:bg-blue-600 text-white px-6 py-2 rounded font-medium shadow-md transition-all"
                onClick={() => setIsReviewModalOpen(false)}
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 附件检测详情弹窗 */}
      {isCheckDetailModalOpen && selectedAttachmentId && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            {/* 弹窗头部 */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">
                  附件检测详情 - {reviewAttachments.find(a => a.id === selectedAttachmentId)?.name}
                </h2>
              </div>
              <button
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                onClick={() => {
                  setIsCheckDetailModalOpen(false);
                  setSelectedAttachmentId(null);
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 弹窗内容 */}
            <div className="flex-1 overflow-auto custom-scrollbar p-6">
              {(() => {
                const detail = attachmentCheckDetails.find(d => d.attachmentId === selectedAttachmentId);
                if (!detail) {
                  return (
                    <div className="text-center text-gray-400 py-8">
                      暂无检测详情数据
                    </div>
                  );
                }
                return (
                  <div className="border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium">
                        <tr>
                          <th className="p-3 w-12 text-center border-r border-gray-200 dark:border-gray-600">序号</th>
                          <th className="p-3 border-r border-gray-200 dark:border-gray-600">检测项</th>
                          <th className="p-3 border-r border-gray-200 dark:border-gray-600">检测结果</th>
                          <th className="p-3">详情说明</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-600 dark:text-gray-300">
                        {detail.checks.map((check, index) => (
                          <tr key={check.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="p-3 text-center">{index + 1}</td>
                            <td className="p-3">{check.item}</td>
                            <td className="p-3">
                              {check.result === '通过' ? (
                                <span className="inline-flex items-center text-green-600">
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  通过
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-red-500">
                                  <AlertCircle className="w-4 h-4 mr-1" />
                                  未通过
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-red-500">{check.detail}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>

            {/* 弹窗底部 */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 px-6 py-2 rounded font-medium shadow-md transition-all"
                onClick={() => {
                  setIsCheckDetailModalOpen(false);
                  setSelectedAttachmentId(null);
                }}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Component;
