/**
 * @name 编制公告页-设置报名附件检测 副本
 */
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
  CheckSquare,
  FileText,
  Settings,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  MoreHorizontal,
  GripVertical,
  ChevronRight,
  Minus,
  File,
  PenLine,
  Wand2
} from 'lucide-react';
import { Table, Switch, Radio } from 'antd';
import './style.css';

const Component = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  // 公告设置状态
  const [autoPublish, setAutoPublish] = useState(true);
  const [noticeFormat, setNoticeFormat] = useState('template');
  const [supplierCount, setSupplierCount] = useState('');

  // 附件表格数据
  const [attachments, setAttachments] = useState([
    { id: 1, name: '职业健康安全认证体系证书', fileName: '职业健康安全认证体系证书', required: false, hasSample: true, sampleName: 'SquirrelMushroom_ZH-CN2854383605...', sampleFile: true },
    { id: 2, name: '工商企业信用等级', fileName: '工商企业信用等级', required: false, hasSample: true, sampleName: '111.pdf', sampleFile: true },
    { id: 3, name: '法人身份证', fileName: '法人身份证', required: false, hasSample: false, sampleName: '', sampleFile: false },
    { id: 4, name: '自定义123', fileName: '自定义123', required: false, hasSample: false, sampleName: '', sampleFile: false },
    { id: 5, name: '环境管理认证体系证书', fileName: '环境管理认证体系证书', required: true, hasSample: false, sampleName: '', sampleFile: false },
    { id: 6, name: '其他附件', fileName: '其他附件', required: false, hasSample: false, sampleName: '', sampleFile: false },
  ]);

  const toggleRequired = (id: number) => {
    setAttachments((prev: typeof attachments) => prev.map((item: typeof attachments[0]) =>
      item.id === id ? { ...item, required: !item.required } : item
    ));
  };

  // 资格审查条件
  const [qualConditions, setQualConditions] = useState([
    { id: 1, name: '未在经营异常企业名单', strength: '强制条件', category: '未在经营异常企业名单', reviewType: '系统', reviewMethod: '风险类' }
  ]);

  const [isQualAttachmentSet, setIsQualAttachmentSet] = useState(true);
  const [isQualConditionSet, setIsQualConditionSet] = useState(true);

  // AI智能报名文件检测
  const [isAIFileDetectSet, setIsAIFileDetectSet] = useState(false);

  // 辅助报名文件检测
  const [isAuxFileDetectSet, setIsAuxFileDetectSet] = useState(true);
  const [auxFileDetections, setAuxFileDetections] = useState([
    { id: 1, fileItem: '营业执照附件', strength: '强制' }
  ]);
  const [fileItemSearchText, setFileItemSearchText] = useState('');
  const [activeFileItemRowId, setActiveFileItemRowId] = useState<number | null>(null);
  const fileItemDropdownRef = useRef<HTMLDivElement>(null);

  const FILE_ITEM_OPTIONS = [
    '资料清单', '企业基础信息表', '营业执照附件', '组织机构代码证', '税务登记证附件',
    '一般纳税人资质证明附件', '法人身份证附件', '法人授权委托书附件', '公司介绍资料附件',
    '业绩证明资料附件', '企业体系认证证明材料', '资质证书材料附件', '安全生产许可证材料附件',
    '资信等级证书附件', '质量管理体系认证资格证书附件', '环境管理体系认证资格证书附件',
    '职业健康安全管理体系认证资格证书附件', '安全生产许可资格证书附件', '银行开户许可证附件',
    '具备建筑业资质证书', '社保缴纳登记证明材料', '是否在涉诉限用名单', '产权证明/购置合同证明',
    '纳税信用评价证明材料', '完税证明', '无欠税证明', '信用中国自查证明', '投标保证金纳税承诺函',
    '检测报告', '代理商厂家授权书', '分供合同/发票证明材料', '被委托人身份证附件',
    '建筑业管理手册附件', '考察登记表', '企业信用报告', '规模情况说明附件', '基本存款账户信息',
    '防静电装备企业生产资格认定证书', '投标保证金缴纳证明', '具备工业产品生产许可证资格证书',
    '投标承诺函', '产品检验报告', '绿色认证证明材料', '养老保险证明', '保安服务许可证',
    '特种设备制造许可证', '法人直营承诺书', '测绘资质证书乙级', '专利证明材料', '工资单证明材料',
    '四库一平台自查证明', '投标报价表', '许可经销证明', '分供方投标资格审查表', '劳动合同',
    '预付款保函', '财务审计报告', '考察报告', '设备安装改造维修许可证'
  ];

  const handleAddAuxFileDetection = () => {
    setAuxFileDetections((prev: typeof auxFileDetections) => [
      ...prev,
      { id: Date.now(), fileItem: '', strength: '' }
    ]);
  };

  const handleDeleteAuxFileDetection = (id: number) => {
    setAuxFileDetections((prev: typeof auxFileDetections) => prev.filter((item: typeof prev[0]) => item.id !== id));
  };

  const handleUpdateAuxFileDetection = (id: number, field: string, value: string) => {
    setAuxFileDetections((prev: typeof auxFileDetections) => prev.map((item: typeof prev[0]) =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleToggleFileItemDropdown = (rowId: number) => {
    if (activeFileItemRowId === rowId) {
      setActiveFileItemRowId(null);
      setFileItemSearchText('');
    } else {
      setActiveFileItemRowId(rowId);
      setFileItemSearchText('');
    }
  };

  const handleSelectFileItem = (rowId: number, item: string) => {
    handleUpdateAuxFileDetection(rowId, 'fileItem', item);
    setActiveFileItemRowId(null);
    setFileItemSearchText('');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fileItemDropdownRef.current && !fileItemDropdownRef.current.contains(event.target as Node)) {
        setActiveFileItemRowId(null);
        setFileItemSearchText('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
                <div className="pl-12 pr-4 py-2 text-xs opacity-80 hover:text-white hover:bg-white/5 cursor-pointer nav-item-active font-medium">非招标采购</div>
                <div className="pl-12 pr-4 py-2 text-xs opacity-80 hover:text-white hover:bg-white/5 cursor-pointer">采购列表</div>
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
              <span className="breadcrumb-item active">编制采购(资格预审)公告</span>
            </div>
          </div>

          {/* 内容区域 */}
          <div className="p-4">
            {/* 标题与操作按钮 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-sm mr-2">物资</span>
                <h1 className="text-lg font-bold text-gray-800 dark:text-white">测试项目87246</h1>
              </div>
              <div className="flex items-center space-x-2">
                <button className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-4 py-1.5 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-600">上一步</button>
                <button className="bg-primary text-white px-4 py-1.5 rounded text-sm hover:bg-primary-dark shadow-sm">保存</button>
                <button className="bg-primary text-white px-4 py-1.5 rounded text-sm hover:bg-primary-dark shadow-sm">下一步</button>
              </div>
            </div>

            {/* 采购信息卡片 */}
            <div className="bg-white dark:bg-gray-800 rounded shadow-sm p-4 mb-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-4 text-sm">
                <span className="text-gray-600 dark:text-gray-400 mr-2">距废除截止还剩：</span>
                <div className="flex items-center space-x-1 font-mono text-primary">
                  <span className="border border-primary px-1 rounded">999996</span>
                  <span className="text-gray-500">天</span>
                  <span className="border border-primary px-1 rounded">23</span>
                  <span className="text-gray-500">:</span>
                  <span className="border border-primary px-1 rounded">57</span>
                  <span className="text-gray-500">:</span>
                  <span className="border border-primary px-1 rounded">51</span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-y-2 text-xs text-gray-600 dark:text-gray-400">
                <div>采购编号：<span className="text-blue-500 hover:underline cursor-pointer">cscec20260604000000362</span></div>
                <div>组织机构：中国建筑股份有限公司</div>
                <div>采购方式：询比采购</div>
                <div>项目：<span className="text-blue-500 hover:underline cursor-pointer">测试项目87246</span></div>
                <div>品类：物资-钢材</div>
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

            {/* 编制采购公告 */}
            <div className="bg-white dark:bg-gray-800 rounded shadow-sm mb-4 border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-1 h-4 bg-primary mr-2"></div>
                  <h2 className="font-bold text-gray-800 dark:text-white text-sm">编制采购(资格预审)公告</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="bg-purple-500 hover:bg-purple-600 text-white text-xs px-3 py-1.5 rounded flex items-center">
                    <Sparkles className="w-[14px] h-[14px] mr-1" /> 智能推荐
                  </button>
                  <button className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-xs px-3 py-1.5 rounded flex items-center hover:bg-gray-50 dark:hover:bg-gray-600">
                    <Lock className="w-[14px] h-[14px] mr-1" /> 加密设置
                  </button>
                  <button className="text-gray-400 hover:text-gray-600">
                    <ChevronUp className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-4">
                {/* 是否自动发布公告 */}
                <div className="flex items-center mb-4">
                  <span className="text-red-500 mr-1">*</span>
                  <span className="text-gray-700 dark:text-gray-300 text-sm mr-4">是否自动发布公告：</span>
                  <Radio.Group
                    value={autoPublish}
                    onChange={(e: any) => setAutoPublish(e.target.value)}
                  >
                    <Radio value={true}>是</Radio>
                    <Radio value={false}>否</Radio>
                  </Radio.Group>
                </div>

                {/* 拟成交分供商数 */}
                <div className="flex items-center mb-4">
                  <span className="text-red-500 mr-1">*</span>
                  <span className="text-gray-700 dark:text-gray-300 text-sm mr-4 w-28">拟成交分供商数：</span>
                  <input
                    type="text"
                    placeholder="请输入拟成交分供商数"
                    value={supplierCount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSupplierCount(e.target.value)}
                    className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-2 py-1 text-sm w-64 focus:border-primary outline-none"
                  />
                </div>

                {/* 采购公告格式 */}
                <div className="flex items-center mb-4">
                  <span className="text-red-500 mr-1">*</span>
                  <span className="text-gray-700 dark:text-gray-300 text-sm mr-4">采购公告格式：</span>
                  <Radio.Group
                    value={noticeFormat}
                    onChange={(e: any) => setNoticeFormat(e.target.value)}
                  >
                    <Radio value="template">范本</Radio>
                    <Radio value="richtext">富文本</Radio>
                  </Radio.Group>
                </div>

                {/* 公告内容 */}
                <div className="flex items-center mb-4">
                  <span className="text-red-500 mr-1">*</span>
                  <span className="text-gray-700 dark:text-gray-300 text-sm mr-4">公告内容：</span>
                  <button className="bg-primary hover:bg-primary-dark text-white text-xs px-3 py-1.5 rounded flex items-center">
                    <Wand2 className="w-[14px] h-[14px] mr-1" /> 去生成 &gt;&gt;
                  </button>
                </div>

                {/* 公告附件 */}
                <div className="mb-4">
                  <div className="flex items-start">
                    <div className="text-sm text-gray-700 dark:text-gray-300 mr-4 w-24">
                      <div>公告附件</div>
                      <div className="text-xs text-gray-500">(仅内部可见)</div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 mb-2">大小限制：1024M 支持格式：.jpeg .jpg .gif .png .doc .docx .xls .xlsx .txt .pdf .rar .zip .7z .tar .jar .dwg .dws .dwt .dxf .csv</p>
                      <button className="flex items-center text-primary border border-primary dark:border-primary-dark rounded px-3 py-1 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs">
                        <Plus className="w-[14px] h-[14px] mr-1" /> 添加附件
                      </button>
                    </div>
                  </div>
                </div>

                {/* 公告附件(分供商可见) */}
                <div className="mb-2">
                  <div className="flex items-start">
                    <div className="text-sm text-gray-700 dark:text-gray-300 mr-4 w-24">
                      <div className="text-red-500">*</div>
                      <div>公告附件</div>
                      <div className="text-xs text-gray-500">(分供商可见)</div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 mb-2">大小限制：1024M 支持格式：.jpeg .jpg .gif .png .doc .docx .xls .xlsx .txt .pdf .rar .zip .7z .tar .jar .dwg .dws .dwt .dxf .csv</p>
                      <button className="flex items-center text-primary border border-primary dark:border-primary-dark rounded px-3 py-1 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs">
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
                <button className="text-gray-400 hover:text-gray-600">
                  <ChevronUp className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4">
                {/* 是否设定资格审查附件组成 */}
                <div className="flex items-center mb-4">
                  <span className="text-gray-700 dark:text-gray-300 text-sm mr-4">是否设定资格审查附件组成：</span>
                  <Radio.Group
                    value={isQualAttachmentSet}
                    onChange={(e: any) => setIsQualAttachmentSet(e.target.value)}
                  >
                    <Radio value={true}>是</Radio>
                    <Radio value={false}>否</Radio>
                  </Radio.Group>
                </div>

                {/* 附件表格 */}
                {isQualAttachmentSet && (
                  <>
                    <Table
                      dataSource={attachments}
                      rowKey="id"
                      size="small"
                      pagination={false}
                      columns={[
                        {
                          title: '序号',
                          dataIndex: 'id',
                          width: 60,
                          align: 'center',
                          render: (_: any, __: any, index: number) => index + 1,
                        },
                        {
                          title: '文件项',
                          dataIndex: 'name',
                          render: (text: string, record: any) => (
                            <>
                              {text}
                              {record.id === 5 && <span className="text-red-500 ml-1">*</span>}
                            </>
                          ),
                        },
                        {
                          title: '文件项名称',
                          dataIndex: 'fileName',
                        },
                        {
                          title: '分供商必须上传',
                          dataIndex: 'required',
                          align: 'center',
                          render: (required: boolean, record: any) => (
                            <Switch
                              size="small"
                              checked={required}
                              onChange={() => toggleRequired(record.id)}
                            />
                          ),
                        },
                        {
                          title: '范本',
                          dataIndex: 'hasSample',
                          render: (hasSample: boolean, record: any) => (
                            hasSample ? (
                              <div className="flex items-center">
                                <FileText className="w-4 h-4 text-orange-400 mr-1" />
                                <span className="text-gray-700 dark:text-gray-300">{record.sampleName}</span>
                                <PenLine className="w-3 h-3 text-gray-400 ml-1 cursor-pointer" />
                                <X className="w-3 h-3 text-gray-400 ml-1 cursor-pointer" />
                              </div>
                            ) : (
                              <button className="flex items-center text-primary border border-primary rounded px-2 py-0.5 text-xs bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                                <Plus className="w-[12px] h-[12px] mr-1" /> 上传
                              </button>
                            )
                          ),
                        },
                        {
                          title: '操作',
                          align: 'center',
                          render: () => (
                            <span className="text-red-500 cursor-pointer hover:underline">删除</span>
                          ),
                        },
                      ]}
                    />

                    {/* 添加按钮 */}
                    <div className="mt-2 p-2 border border-dashed border-gray-300 dark:border-gray-600 rounded text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                      <span className="text-gray-500 text-sm">添加</span>
                    </div>


                  </>
                )}
              </div>
            </div>

            {/* 资格审查条件 */}
            <div className="bg-white dark:bg-gray-800 rounded shadow-sm mb-10 border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-1 h-4 bg-primary mr-2"></div>
                  <h2 className="font-bold text-gray-800 dark:text-white text-sm">资格审查条件</h2>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <ChevronUp className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4">
                {/* 提示信息 */}
                <div className="mb-4">
                  <p className="text-sm text-orange-500 dark:text-orange-400 leading-relaxed">
                    设置"是否存在有效集中资格预审标签"资审条件通过的分供商，在报名与资审汇总列表中展示"有效集中资审"标签，便于快速识别分供商。
                  </p>
                </div>

                {/* 是否设定资格审查条件 */}
                <div className="flex items-center mb-4">
                  <span className="text-gray-700 dark:text-gray-300 text-sm mr-4">是否设定资格审查条件：</span>
                  <Radio.Group
                    value={isQualConditionSet}
                    onChange={(e: any) => setIsQualConditionSet(e.target.value)}
                  >
                    <Radio value={true}>是</Radio>
                    <Radio value={false}>否</Radio>
                  </Radio.Group>
                  <button className="bg-primary hover:bg-primary-dark text-white text-xs px-3 py-1.5 rounded flex items-center">
                    <Plus className="w-[14px] h-[14px] mr-1" /> 批量添加资审项
                  </button>
                  <span className="ml-3 text-xs text-primary cursor-pointer hover:underline">智能资审条件推荐，点击查看！</span>
                </div>

                {/* 资格审查条件表格 */}
                {isQualConditionSet && (
                  <>
                    <Table
                      dataSource={qualConditions}
                      rowKey="id"
                      size="small"
                      pagination={false}
                      columns={[
                        {
                          title: '序号',
                          width: 60,
                          align: 'center',
                          render: (_: any, __: any, index: number) => index + 1,
                        },
                        {
                          title: <><span className="text-red-500">*</span> 资格审查条件项</>,
                          dataIndex: 'name',
                          render: (text: string) => (
                            <div className="relative">
                              <select className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-1 pl-2 pr-6 rounded text-xs w-full focus:outline-none focus:ring-1 focus:ring-primary">
                                <option>{text}</option>
                              </select>
                              <ChevronDown className="absolute right-1 top-1.5 text-gray-400 w-3 h-3 pointer-events-none" />
                            </div>
                          ),
                        },
                        {
                          title: <><span className="text-red-500">*</span> 资审条件强度</>,
                          dataIndex: 'strength',
                          render: (text: string) => (
                            <div className="relative">
                              <select className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-1 pl-2 pr-6 rounded text-xs w-full focus:outline-none focus:ring-1 focus:ring-primary">
                                <option>{text}</option>
                              </select>
                              <ChevronDown className="absolute right-1 top-1.5 text-gray-400 w-3 h-3 pointer-events-none" />
                            </div>
                          ),
                        },
                        {
                          title: <><span className="text-red-500">*</span> 资格审查条件名称</>,
                          dataIndex: 'category',
                        },
                        {
                          title: '资格审查条件分类',
                          dataIndex: 'reviewMethod',
                        },
                        {
                          title: '审查方式',
                          dataIndex: 'reviewType',
                        },
                        {
                          title: '操作',
                          align: 'center',
                          render: () => (
                            <span className="text-red-500 cursor-pointer hover:underline">删除</span>
                          ),
                        },
                      ]}
                    />

                    {/* 添加按钮 */}
                    <div className="mt-2 p-2 border border-dashed border-gray-300 dark:border-gray-600 rounded text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                      <span className="text-gray-500 text-sm">添加</span>
                    </div>
                  </>
                )}

              </div>
            </div>

            {/* AI智能报名文件检测 */}
            <div className="bg-white dark:bg-gray-800 rounded shadow-sm mb-10 border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-1 h-4 bg-primary mr-2"></div>
                  <h2 className="font-bold text-gray-800 dark:text-white text-sm">AI智能报名文件检测</h2>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <ChevronUp className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4">
                {/* 是否使用AI智能报名文件检测 */}
                <div className="flex items-center mb-4">
                  <span className="text-red-500 mr-1">*</span>
                  <span className="text-gray-700 dark:text-gray-300 text-sm mr-4">是否使用AI智能报名文件检测</span>
                  <div className="relative group mr-4 inline-flex items-center">
                    <div className="mr-1 w-4 h-4 rounded-full border border-gray-400 text-gray-400 text-[10px] flex items-center justify-center cursor-help leading-none">?</div>
                    <span className="text-gray-400 text-sm">：</span>
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      提示占位内容，待补充
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                  <Radio.Group
                    value={isAIFileDetectSet}
                    onChange={(e) => setIsAIFileDetectSet(e.target.value)}
                  >
                    <Radio value={true}>是</Radio>
                    <Radio value={false}>否</Radio>
                  </Radio.Group>
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
