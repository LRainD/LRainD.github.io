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
  Search,
  Building2,
  ListVideo,
  Send,
  RefreshCcw,
  Star,
  CloudDownload,
  HelpCircle,
  Bell,
  X,
  Headset,
  Smartphone,
  Monitor,
  UserCog,
  Sparkles,
  Loader2,
  AlertCircle
} from 'lucide-react';
import './style.css';

/**
 * @name 采购基础信息
 * @mode axure
 *
 * 参考资料：
 * - /rules/development-guide.md
 * - /skills/axure-export-workflow/SKILL.md
 */
interface ExpandedSections {
  basicInfo: boolean;
  origin: boolean;
  attachment: boolean;
}

interface FormValues {
  purchaseName: string;
  materialCategory: string;
  cooperationCategory: string;
  purchaseCategory: string;
  organization: string;
  controlCompany: string;
  organizationalForm: string;
  purchaseMode: string;
  contractType: string;
  contractTemplate: string;
  estimatedAmount: string;
  splitOrder: string;
  signingCompany: string;
  paymentTerms: string;
  tradeTerms: string;
  transactionMode: string;
  buySell: string;
}

interface FormErrors {
  purchaseName: boolean;
}

interface AIField {
  id: keyof FormValues;
  label: string;
  recommendValue?: string;
  needUserSelect?: boolean;
}

const Component = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    basicInfo: true,
    origin: true,
    attachment: true,
  });

  const [formValues, setFormValues] = useState<FormValues>({
    purchaseName: '',
    materialCategory: '普通钢筋',
    cooperationCategory: '',
    purchaseCategory: '',
    organization: '',
    controlCompany: '',
    organizationalForm: '',
    purchaseMode: '',
    contractType: '',
    contractTemplate: '',
    estimatedAmount: '100000',
    splitOrder: 'no',
    signingCompany: '中国建筑第八工程局有限公司',
    paymentTerms: '',
    tradeTerms: '',
    transactionMode: '',
    buySell: '',
  });

  const [errors, setErrors] = useState<FormErrors>({
    purchaseName: true,
  });

  // AI 智能推荐相关状态
  const [isAIRecommending, setIsAIRecommending] = useState(false);
  const [currentHighlightField, setCurrentHighlightField] = useState<keyof FormValues | null>(null);
  const [aiRecommendationProgress, setAiRecommendationProgress] = useState(0);
  const [showAIBubble, setShowAIBubble] = useState(false);
  const [aiBubblePosition, setAiBubblePosition] = useState({ x: 0, y: 0 });
  const [aiRecommendedFields, setAiRecommendedFields] = useState<{ [key in keyof FormValues]?: boolean }>({});
  const [showAIConfirmPopover, setShowAIConfirmPopover] = useState(false);
  const [isWaitingUserSelect, setIsWaitingUserSelect] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const aiRecommendButtonRef = useRef<HTMLButtonElement>(null);
  const autoFillTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 智能推荐字段配置：采购品类需要用户选择，其余字段自动填充
  const aiFields: AIField[] = [
    { id: 'purchaseCategory', label: '采购品类', needUserSelect: true },
    { id: 'cooperationCategory', label: '合作品类', recommendValue: '钢筋' },
    { id: 'purchaseMode', label: '采购方式', recommendValue: '询比采购' },
    { id: 'organizationalForm', label: '组织形式', recommendValue: '自行采购' },
    { id: 'transactionMode', label: '采购模式', recommendValue: '战略采购' },
    { id: 'contractType', label: '合同类型', recommendValue: '买卖合同' },
    { id: 'contractTemplate', label: '合同模板', recommendValue: '标准模板' },
    { id: 'buySell', label: '买/卖', recommendValue: '买' },
  ];

  const toggleSection = (key: keyof ExpandedSections) => {
    setExpandedSections((prev: ExpandedSections) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (field: keyof FormValues, value: string) => {
    setFormValues((prev: FormValues) => ({ ...prev, [field]: value }));
    if (field === 'purchaseName') {
      setErrors((prev: FormErrors) => ({ ...prev, purchaseName: !value.trim() }));
    }

    // 若用户在 AI 推荐过程中手动修改了字段，移除该字段的"荐"标识
    if (aiRecommendedFields[field]) {
      setAiRecommendedFields((prev: { [key in keyof FormValues]?: boolean }) => ({ ...prev, [field]: false }));
    }
  };

  const createSelectHandler = (field: keyof FormValues) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleChange(field, e.target.value);
  };

  const createInputHandler = (field: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(field, e.target.value);
  };

  // 计算 AI 小人与气泡位置，避免超出屏幕
  const calculateAIBubblePosition = (fieldElement: HTMLElement) => {
    const rect = fieldElement.getBoundingClientRect();
    const bubbleWidth = 260;
    const bubbleHeight = 110;
    const padding = 20;

    let x = rect.right + padding;
    let y = rect.top;

    if (x + bubbleWidth > window.innerWidth) {
      x = rect.left - bubbleWidth - padding;
    }
    if (y + bubbleHeight > window.innerHeight) {
      y = window.innerHeight - bubbleHeight - padding;
    }
    if (x < padding) x = padding;
    if (y < padding) y = padding;

    return { x, y };
  };

  const handleAIRecommendClick = () => {
    setShowAIConfirmPopover(true);
  };

  const handleCancelAIRecommend = () => {
    setShowAIConfirmPopover(false);
  };

  const handleConfirmAIRecommend = () => {
    setShowAIConfirmPopover(false);
    setIsAIRecommending(true);
    setShowAIBubble(true);
    setAiRecommendationProgress(0);
    setAiRecommendedFields({});
    setIsWaitingUserSelect(false);

    // 确保基本信息区域展开，以便高亮字段可见
    setExpandedSections((prev: ExpandedSections) => ({ ...prev, basicInfo: true }));

    // 清空之前可能存在的自动填充定时器
    if (autoFillTimerRef.current) {
      clearInterval(autoFillTimerRef.current);
      autoFillTimerRef.current = null;
    }

    // 第一个字段：采购品类，需要用户手动选择
    setCurrentHighlightField('purchaseCategory');
    setIsWaitingUserSelect(true);
    setAiMessage('推荐服务需基于采购品类，请先完善品类选择');

    setTimeout(() => {
      const fieldElement = document.getElementById('field-purchaseCategory');
      if (fieldElement) {
        const position = calculateAIBubblePosition(fieldElement);
        setAiBubblePosition(position);
        // 滚动到视野内，但避免被顶部/侧边栏遮挡
        fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  // 用户在气泡中点击确认后继续后续字段的自动推荐
  const handleConfirmPurchaseCategory = () => {
    if (!formValues.purchaseCategory.trim()) {
      return;
    }
    setIsWaitingUserSelect(false);
    setAiRecommendedFields((prev: { [key in keyof FormValues]?: boolean }) => ({ ...prev, purchaseCategory: true }));
    continueAIRecommendationAfterUserSelect();
  };

  // 用户确认采购品类后继续后续字段的自动推荐
  const continueAIRecommendationAfterUserSelect = () => {
    let currentIndex = 1; // 从第二个字段开始自动填充
    const total = aiFields.length;

    autoFillTimerRef.current = setInterval(() => {
      if (currentIndex >= total) {
        if (autoFillTimerRef.current) clearInterval(autoFillTimerRef.current);
        setIsAIRecommending(false);
        setCurrentHighlightField(null);
        setAiMessage(`小云已为您推荐 ${total} 个字段`);
        return;
      }

      const field = aiFields[currentIndex];
      setCurrentHighlightField(field.id);
      setAiMessage(`正在推荐：${field.label}`);

      if (field.recommendValue) {
        setFormValues((prev: FormValues) => ({ ...prev, [field.id]: field.recommendValue as string }));
        setAiRecommendedFields((prev: { [key in keyof FormValues]?: boolean }) => ({ ...prev, [field.id]: true }));
      }

      setTimeout(() => {
        const fieldElement = document.getElementById(`field-${String(field.id)}`);
        if (fieldElement) {
          const position = calculateAIBubblePosition(fieldElement);
          setAiBubblePosition(position);
          fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);

      setAiRecommendationProgress(((currentIndex + 1) / total) * 100);
      currentIndex++;
    }, 1200);
  };

  const handleCloseAIBubble = () => {
    setShowAIBubble(false);
  };

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (autoFillTimerRef.current) {
        clearInterval(autoFillTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-background-light dark:bg-background-dark text-gray-800 dark:text-gray-200 font-sans h-screen flex overflow-hidden">
      {/* Sidebar */}
      <aside className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} bg-sidebar-light dark:bg-sidebar-dark flex-shrink-0 flex flex-col text-white transition-all duration-300 overflow-visible`}>
        <div className="h-14 flex items-center justify-center font-bold text-xl tracking-wide bg-white text-blue-500 w-64 relative z-50">
          <img src={logoImage} alt="集采工作台" className="h-8" />
        </div>
        <nav className="flex-1 overflow-y-auto py-2 text-sm min-h-0">
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
            <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100'}`}>客户中心</span>
            {isSidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                客户中心
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
              <ShoppingCart className="w-[18px] h-[18px] flex-shrink-0" />
              <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100'}`}>采购管理</span>
              {!isSidebarCollapsed && <ChevronUp className="w-4 h-4 ml-auto" />}
              {isSidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  采购管理
                </div>
              )}
            </div>
            {!isSidebarCollapsed && (
              <>
                <div className="pl-12 pr-4 py-2 text-xs opacity-80 hover:text-white hover:bg-white/5 cursor-pointer">
                  集中资格预审列表
                </div>
                <div className="pl-12 pr-4 py-2 text-xs opacity-80 hover:text-white hover:bg-white/5 cursor-pointer">
                  待采购任务
                </div>
                <div className="pl-12 pr-4 py-2 text-xs opacity-80 hover:text-white hover:bg-white/5 cursor-pointer nav-item-active font-medium">
                  采购列表
                </div>
                <div className="pl-12 pr-4 py-2 text-xs opacity-80 hover:text-white hover:bg-white/5 cursor-pointer">
                  招标采购
                </div>
                <div className="pl-12 pr-4 py-2 text-xs opacity-80 hover:text-white hover:bg-white/5 cursor-pointer">
                  非招标采购
                </div>
                <div className="pl-12 pr-4 py-2 text-xs opacity-80 hover:text-white hover:bg-white/5 cursor-pointer">
                  招标/采购稽查
                </div>
                <div className="pl-12 pr-4 py-2 text-xs opacity-80 hover:text-white hover:bg-white/5 cursor-pointer">
                  评标列表
                </div>
                <div className="pl-12 pr-4 py-2 text-xs opacity-80 hover:text-white hover:bg-white/5 cursor-pointer">
                  评标专家库
                </div>
                <div className="pl-12 pr-4 py-2 text-xs opacity-80 hover:text-white hover:bg-white/5 cursor-pointer">
                  投标保证金管理
                </div>
                <div className="pl-12 pr-4 py-2 text-xs opacity-80 hover:text-white hover:bg-white/5 cursor-pointer">
                  履约保证金管理
                </div>
                <div className="pl-12 pr-4 py-2 text-xs opacity-80 hover:text-white hover:bg-white/5 cursor-pointer">
                  推荐人管理
                </div>
                <div className="pl-12 pr-4 py-2 text-xs opacity-80 hover:text-white hover:bg-white/5 cursor-pointer">
                  跑勘任务
                </div>
              </>
            )}
          </div>
          <div className="px-4 py-2 hover:bg-white/10 cursor-pointer flex items-center justify-center group relative">
            <Gavel className="w-[18px] h-[18px] flex-shrink-0" />
            <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100'}`}>招标管理</span>
            {!isSidebarCollapsed && <ChevronDown className="w-4 h-4 ml-auto" />}
            {isSidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                招标管理
              </div>
            )}
          </div>
          <div className="px-4 py-2 hover:bg-white/10 cursor-pointer flex items-center justify-center group relative">
            <Users className="w-[18px] h-[18px] flex-shrink-0" />
            <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100'}`}>评标/评审专家列表</span>
            {isSidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                评标/评审专家列表
              </div>
            )}
          </div>
          <div className="px-4 py-2 hover:bg-white/10 cursor-pointer flex items-center justify-center group relative">
            <FileCheck className="w-[18px] h-[18px] flex-shrink-0" />
            <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100'}`}>厂家直签审核</span>
            {isSidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                厂家直签审核
              </div>
            )}
          </div>
          <div className="px-4 py-2 hover:bg-white/10 cursor-pointer flex items-center justify-center group relative">
            <ShieldCheck className="w-[18px] h-[18px] flex-shrink-0" />
            <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100'}`}>数字合规官</span>
            {isSidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                数字合规官
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
                <option>中建八局三公司</option>
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
                <span className="text-xs">发布寻源需求</span>
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
                <span className="text-xs">姜佳峰</span>
                <ChevronDown className="w-[14px] h-[14px] ml-0.5" />
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-gray-900 relative">
          {/* 面包屑导航栏 */}
          <div className="breadcrumb-bar">
            <div className="breadcrumb-nav">
              <span className="breadcrumb-item">采购管理</span>
              <span className="breadcrumb-separator">&gt;</span>
              <span className="breadcrumb-item">采购列表</span>
              <span className="breadcrumb-separator">&gt;</span>
              <span className="breadcrumb-item active">采购基础信息</span>
            </div>
          </div>

          {/* 内容区域 */}
          <div className="p-4">

            {/* 顶部操作栏 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <h1 className="text-lg font-bold text-gray-800 dark:text-white">采购基础信息</h1>
              </div>
              <div className="flex items-center space-x-2">
                <button className="bg-primary text-white px-5 py-1.5 rounded-sm text-sm hover:bg-primary-dark shadow-sm">保存</button>
                <button className="bg-primary text-white px-5 py-1.5 rounded-sm text-sm hover:bg-primary-dark shadow-sm">下一步</button>
              </div>
            </div>

            {/* 流程步骤 */}
            <div className="bg-white dark:bg-gray-800 rounded-sm mb-4 border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="step-container">
                <div className="step-item active">采购发起</div>
                <div className="step-item">采购响应</div>
                <div className="step-item">文件开启</div>
                <div className="step-item">采购评审</div>
                <div className="step-item">采购成交</div>
              </div>
            </div>

            {/* 基本信息 */}
            <div className="bg-white dark:bg-gray-800 rounded shadow-sm mb-4 border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div
                  className="flex items-center flex-1 cursor-pointer"
                  onClick={() => toggleSection('basicInfo')}
                >
                  <div className="w-1 h-4 bg-primary mr-2"></div>
                  <h2 className="font-bold text-gray-800 dark:text-white text-sm">基本信息</h2>
                  {expandedSections.basicInfo ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 ml-2" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 ml-2" />
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {/* 智能推荐按钮 */}
                  <div className="relative">
                    <button
                      ref={aiRecommendButtonRef}
                      onClick={handleAIRecommendClick}
                      disabled={isAIRecommending}
                      className={`text-xs flex items-center px-3 py-1.5 rounded-sm transition-all duration-300 ${
                        isAIRecommending
                          ? 'bg-purple-100 text-purple-600 cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 shadow-sm hover:shadow-md'
                      }`}
                    >
                      {isAIRecommending ? (
                        <>
                          <Loader2 className="w-[14px] h-[14px] mr-1 animate-spin" />
                          智能推荐中...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-[14px] h-[14px] mr-1" />
                          智能推荐
                        </>
                      )}
                    </button>

                    {/* 智能推荐二次确认弹窗 */}
                    {showAIConfirmPopover && (
                      <div className="absolute top-full right-0 mt-2 z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 w-64">
                          <div className="flex items-center mb-3">
                            <AlertCircle className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0" />
                            <span className="font-medium text-gray-800 dark:text-gray-200 text-sm">提示</span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">
                            是否确认使用智能推荐？
                          </p>
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={handleCancelAIRecommend}
                              className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            >
                              取消
                            </button>
                            <button
                              onClick={handleConfirmAIRecommend}
                              className="px-3 py-1.5 text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded hover:from-purple-600 hover:to-blue-600 transition-all"
                            >
                              确认
                            </button>
                          </div>
                        </div>
                        <div className="absolute -top-1 right-20 w-2 h-2 bg-white dark:bg-gray-800 border-l border-t border-gray-200 dark:border-gray-700 transform rotate-45"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {expandedSections.basicInfo && (
                <div className="p-5">
                  <div className="grid grid-cols-4 gap-y-4 gap-x-4">
                    {/* 创建人 */}
                    <div className="form-item">
                      <label className="form-label"><span className="text-red-500 mr-1">*</span>创建人：</label>
                      <div className="form-control-static">姜佳峰</div>
                    </div>
                    {/* 创建时间 */}
                    <div className="form-item">
                      <label className="form-label"><span className="text-red-500 mr-1">*</span>创建时间：</label>
                      <div className="form-control-static text-gray-400">保存后生成</div>
                    </div>
                    {/* 采购编号 */}
                    <div className="form-item">
                      <label className="form-label"><span className="text-red-500 mr-1">*</span>采购编号：</label>
                      <div className="form-control-static text-gray-400">保存后生成</div>
                    </div>
                    {/* 采购名称 */}
                    <div className="form-item">
                      <label className="form-label"><span className="text-red-500 mr-1">*</span>采购名称：</label>
                      <div className="form-control-wrap">
                        <input
                          className={`form-input ${errors.purchaseName ? 'border-red-400 focus:border-red-500' : ''}`}
                          type="text"
                          placeholder="请输入"
                          value={formValues.purchaseName}
                          onChange={createInputHandler('purchaseName')}
                        />
                        {errors.purchaseName && (
                          <div className="text-red-500 text-xs mt-1">请输入采购名称</div>
                        )}
                      </div>
                    </div>

                    {/* 物料类别 */}
                    <div className="form-item">
                      <label className="form-label"><span className="text-red-500 mr-1">*</span>物料类别：</label>
                      <div className="relative">
                        <select
                          className="form-select"
                          value={formValues.materialCategory}
                          onChange={createSelectHandler('materialCategory')}
                        >
                          <option>普通钢筋</option>
                          <option>型钢</option>
                          <option>水泥</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-2 text-gray-400 w-4 h-4 pointer-events-none" />
                      </div>
                    </div>
                    {/* 合作品类 */}
                    <div
                      id="field-cooperationCategory"
                      className={`form-item p-2 rounded transition-all duration-500 ${
                        currentHighlightField === 'cooperationCategory'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 ring-2 ring-yellow-400 shadow-lg scale-[1.02]'
                          : ''
                      }`}
                    >
                      <label className="form-label"><span className="text-red-500 mr-1">*</span>合作品类：</label>
                      <div className="relative form-control-wrap">
                        <select
                          className="form-select"
                          value={formValues.cooperationCategory}
                          onChange={createSelectHandler('cooperationCategory')}
                        >
                          <option value="">请选择合作品类</option>
                          <option>钢筋</option>
                          <option>混凝土</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-2 text-gray-400 w-4 h-4 pointer-events-none" />
                        {aiRecommendedFields['cooperationCategory'] && (
                          <span className="absolute -right-10 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-blue-100 text-blue-600 text-xs rounded border border-blue-200">
                            荐
                          </span>
                        )}
                      </div>
                    </div>
                    {/* 采购品类 */}
                    <div
                      id="field-purchaseCategory"
                      className={`form-item p-2 rounded transition-all duration-500 ${
                        currentHighlightField === 'purchaseCategory'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 ring-2 ring-yellow-400 shadow-lg scale-[1.02]'
                          : ''
                      }`}
                    >
                      <label className="form-label"><span className="text-red-500 mr-1">*</span>采购品类：</label>
                      <div className="relative form-control-wrap">
                        <select
                          className="form-select"
                          value={formValues.purchaseCategory}
                          onChange={createSelectHandler('purchaseCategory')}
                        >
                          <option value="">{isWaitingUserSelect && currentHighlightField === 'purchaseCategory' ? '请选择采购品类' : '请输入'}</option>
                          <option>钢筋</option>
                          <option>混凝土</option>
                          <option>型钢</option>
                          <option>水泥</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-2 text-gray-400 w-4 h-4 pointer-events-none" />
                        {/* AI推荐标签 */}
                        {aiRecommendedFields['purchaseCategory'] && (
                          <span className="absolute -right-10 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-blue-100 text-blue-600 text-xs rounded border border-blue-200">
                            荐
                          </span>
                        )}
                      </div>
                    </div>
                    {/* 组织机构 */}
                    <div className="form-item">
                      <label className="form-label"><span className="text-red-500 mr-1">*</span>组织机构：</label>
                      <div className="relative">
                        <select
                          className="form-select"
                          value={formValues.organization}
                          onChange={createSelectHandler('organization')}
                        >
                          <option value="">请选择品类</option>
                          <option>中国建筑第八工程局有限公司</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-2 text-gray-400 w-4 h-4 pointer-events-none" />
                      </div>
                    </div>

                    {/* 管控公司 */}
                    <div className="form-item">
                      <label className="form-label">管控公司：</label>
                      <div className="relative">
                        <select
                          className="form-select"
                          value={formValues.controlCompany}
                          onChange={createSelectHandler('controlCompany')}
                        >
                          <option value=""></option>
                          <option>中国建筑第八工程局有限公司</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-2 text-gray-400 w-4 h-4 pointer-events-none" />
                      </div>
                    </div>
                    {/* 经办人 */}
                    <div className="form-item">
                      <label className="form-label">经办人：</label>
                      <div className="form-control-static">姜佳峰</div>
                    </div>
                    {/* 组织形式 */}
                    <div
                      id="field-organizationalForm"
                      className={`form-item p-2 rounded transition-all duration-500 ${
                        currentHighlightField === 'organizationalForm'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 ring-2 ring-yellow-400 shadow-lg scale-[1.02]'
                          : ''
                      }`}
                    >
                      <label className="form-label"><span className="text-red-500 mr-1">*</span>组织形式：</label>
                      <div className="relative form-control-wrap">
                        <select
                          className="form-select"
                          value={formValues.organizationalForm}
                          onChange={createSelectHandler('organizationalForm')}
                        >
                          <option value="">请选择品类、组织机构</option>
                          <option>自行采购</option>
                          <option>集中采购</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-2 text-gray-400 w-4 h-4 pointer-events-none" />
                        {aiRecommendedFields['organizationalForm'] && (
                          <span className="absolute -right-10 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-blue-100 text-blue-600 text-xs rounded border border-blue-200">
                            荐
                          </span>
                        )}
                      </div>
                    </div>
                    {/* 采购方式 */}
                    <div
                      id="field-purchaseMode"
                      className={`form-item p-2 rounded transition-all duration-500 ${
                        currentHighlightField === 'purchaseMode'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 ring-2 ring-yellow-400 shadow-lg scale-[1.02]'
                          : ''
                      }`}
                    >
                      <label className="form-label"><span className="text-red-500 mr-1">*</span>采购方式：</label>
                      <div className="relative form-control-wrap">
                        <select
                          className="form-select"
                          value={formValues.purchaseMode}
                          onChange={createSelectHandler('purchaseMode')}
                        >
                          <option value="">请选择组织形式</option>
                          <option>公开招标</option>
                          <option>邀请招标</option>
                          <option>询比采购</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-2 text-gray-400 w-4 h-4 pointer-events-none" />
                        {aiRecommendedFields['purchaseMode'] && (
                          <span className="absolute -right-10 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-blue-100 text-blue-600 text-xs rounded border border-blue-200">
                            荐
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 采购模式 */}
                    <div
                      id="field-transactionMode"
                      className={`form-item p-2 rounded transition-all duration-500 ${
                        currentHighlightField === 'transactionMode'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 ring-2 ring-yellow-400 shadow-lg scale-[1.02]'
                          : ''
                      }`}
                    >
                      <label className="form-label"><span className="text-red-500 mr-1">*</span>采购模式：</label>
                      <div className="relative form-control-wrap">
                        <select
                          className="form-select"
                          value={formValues.transactionMode}
                          onChange={createSelectHandler('transactionMode')}
                        >
                          <option value="">请选择组织形式</option>
                          <option>战略采购</option>
                          <option>框架协议</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-2 text-gray-400 w-4 h-4 pointer-events-none" />
                        {aiRecommendedFields['transactionMode'] && (
                          <span className="absolute -right-10 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-blue-100 text-blue-600 text-xs rounded border border-blue-200">
                            荐
                          </span>
                        )}
                      </div>
                    </div>
                    {/* 合同类型 */}
                    <div
                      id="field-contractType"
                      className={`form-item p-2 rounded transition-all duration-500 ${
                        currentHighlightField === 'contractType'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 ring-2 ring-yellow-400 shadow-lg scale-[1.02]'
                          : ''
                      }`}
                    >
                      <label className="form-label"><span className="text-red-500 mr-1">*</span>合同类型：</label>
                      <div className="relative form-control-wrap">
                        <select
                          className="form-select"
                          value={formValues.contractType}
                          onChange={createSelectHandler('contractType')}
                        >
                          <option value="">请选择组织形式</option>
                          <option>买卖合同</option>
                          <option>服务合同</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-2 text-gray-400 w-4 h-4 pointer-events-none" />
                        {aiRecommendedFields['contractType'] && (
                          <span className="absolute -right-10 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-blue-100 text-blue-600 text-xs rounded border border-blue-200">
                            荐
                          </span>
                        )}
                      </div>
                    </div>
                    {/* 合同模板 */}
                    <div
                      id="field-contractTemplate"
                      className={`form-item p-2 rounded transition-all duration-500 ${
                        currentHighlightField === 'contractTemplate'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 ring-2 ring-yellow-400 shadow-lg scale-[1.02]'
                          : ''
                      }`}
                    >
                      <label className="form-label"><span className="text-red-500 mr-1">*</span>合同模板：</label>
                      <div className="relative form-control-wrap">
                        <select
                          className="form-select"
                          value={formValues.contractTemplate}
                          onChange={createSelectHandler('contractTemplate')}
                        >
                          <option value="">请先选择管控公司和合同类型</option>
                          <option>标准模板</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-2 text-gray-400 w-4 h-4 pointer-events-none" />
                        {aiRecommendedFields['contractTemplate'] && (
                          <span className="absolute -right-10 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-blue-100 text-blue-600 text-xs rounded border border-blue-200">
                            荐
                          </span>
                        )}
                      </div>
                    </div>
                    {/* 概算金额 */}
                    <div className="form-item">
                      <label className="form-label"><span className="text-red-500 mr-1">*</span>概算金额：</label>
                      <div className="form-control-wrap">
                        <div className="amount-input-wrap">
                          <span className="text-gray-600 text-sm">人民币</span>
                          <input
                            className="form-input"
                            type="text"
                            value={formValues.estimatedAmount}
                            onChange={createInputHandler('estimatedAmount')}
                          />
                          <span className="text-gray-600 text-sm">万</span>
                        </div>
                        <div className="text-red-500 text-xs mt-1">壹拾亿元整</div>
                      </div>
                    </div>

                    {/* 分清单成交 */}
                    <div className="form-item">
                      <label className="form-label"><span className="text-red-500 mr-1">*</span>分清单成交：</label>
                      <div className="flex items-center h-[30px]">
                        <label className="flex items-center cursor-pointer mr-4">
                          <input
                            type="radio"
                            name="splitOrder"
                            className="mr-1"
                            checked={formValues.splitOrder === 'yes'}
                            onChange={() => handleChange('splitOrder', 'yes')}
                          />
                          <span className="text-sm">是</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="splitOrder"
                            className="mr-1"
                            checked={formValues.splitOrder === 'no'}
                            onChange={() => handleChange('splitOrder', 'no')}
                          />
                          <span className="text-sm">否</span>
                        </label>
                      </div>
                    </div>
                    {/* 签约公司 */}
                    <div className="form-item">
                      <label className="form-label">签约公司：</label>
                      <div className="form-control-wrap">
                        <div className="inline-flex items-center bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-sm px-2 py-1">
                          <span className="text-sm text-gray-700 dark:text-gray-200 truncate max-w-[140px]">{formValues.signingCompany}</span>
                          <X className="w-3 h-3 ml-1 text-gray-400 cursor-pointer hover:text-gray-600" />
                        </div>
                      </div>
                    </div>
                    {/* 付款条件 */}
                    <div className="form-item">
                      <label className="form-label">付款条件：</label>
                      <div className="relative">
                        <select
                          className="form-select"
                          value={formValues.paymentTerms}
                          onChange={createSelectHandler('paymentTerms')}
                        >
                          <option value=""></option>
                          <option>月结30天</option>
                          <option>月结60天</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-2 text-gray-400 w-4 h-4 pointer-events-none" />
                      </div>
                    </div>
                    {/* 国际贸易条件及附加 */}
                    <div className="form-item">
                      <label className="form-label">国际贸易条件及附加：</label>
                      <div className="relative">
                        <select
                          className="form-select"
                          value={formValues.tradeTerms}
                          onChange={createSelectHandler('tradeTerms')}
                        >
                          <option value="">请选择</option>
                          <option>FOB</option>
                          <option>CIF</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-2 text-gray-400 w-4 h-4 pointer-events-none" />
                      </div>
                    </div>

                    {/* 交易模式 */}
                    <div className="form-item">
                      <label className="form-label">交易模式：</label>
                      <div className="relative">
                        <select
                          className="form-select"
                          value={formValues.purchaseMode}
                          onChange={createSelectHandler('purchaseMode')}
                        >
                          <option value=""></option>
                          <option>线上交易</option>
                          <option>线下交易</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-2 text-gray-400 w-4 h-4 pointer-events-none" />
                      </div>
                    </div>
                    {/* 买/卖 */}
                    <div
                      id="field-buySell"
                      className={`form-item p-2 rounded transition-all duration-500 ${
                        currentHighlightField === 'buySell'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 ring-2 ring-yellow-400 shadow-lg scale-[1.02]'
                          : ''
                      }`}
                    >
                      <label className="form-label"><span className="text-red-500 mr-1">*</span>买/卖：</label>
                      <div className="relative form-control-wrap">
                        <select
                          className="form-select"
                          value={formValues.buySell}
                          onChange={createSelectHandler('buySell')}
                        >
                          <option value=""></option>
                          <option>买</option>
                          <option>卖</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-2 text-gray-400 w-4 h-4 pointer-events-none" />
                        {aiRecommendedFields['buySell'] && (
                          <span className="absolute -right-10 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-blue-100 text-blue-600 text-xs rounded border border-blue-200">
                            荐
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 发起来源 */}
            <div className="bg-white dark:bg-gray-800 rounded shadow-sm mb-4 border border-gray-200 dark:border-gray-700">
              <div
                className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('origin')}
              >
                <div className="flex items-center">
                  <div className="w-1 h-4 bg-primary mr-2"></div>
                  <h2 className="font-bold text-gray-800 dark:text-white text-sm">发起来源</h2>
                </div>
                {expandedSections.origin ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
              {expandedSections.origin && (
                <div className="p-5">
                  <div className="grid grid-cols-3 gap-y-4 gap-x-4">
                    <div className="form-item">
                      <label className="form-label">发起来源：</label>
                      <div className="form-control-static">依八局DSC发起</div>
                    </div>
                    <div className="form-item">
                      <label className="form-label">来源类型：</label>
                      <div className="form-control-static">采购计划</div>
                    </div>
                    <div className="form-item">
                      <label className="form-label">来源单据编号：</label>
                      <div className="form-control-static text-primary hover:underline cursor-pointer">PPP-M005000008438-202412-001</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 附加信息 */}
            <div className="bg-white dark:bg-gray-800 rounded shadow-sm mb-4 border border-gray-200 dark:border-gray-700">
              <div
                className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('attachment')}
              >
                <div className="flex items-center">
                  <div className="w-1 h-4 bg-primary mr-2"></div>
                  <h2 className="font-bold text-gray-800 dark:text-white text-sm">附加信息</h2>
                </div>
                {expandedSections.attachment ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
              {expandedSections.attachment && (
                <div className="p-5">
                  <div className="text-gray-400 text-sm text-center py-4">暂无附加信息</div>
                </div>
              )}
            </div>

            {/* 底部占位，保证右侧悬浮工具不遮挡 */}
            <div className="h-8"></div>
          </div>
        </div>
      </main>

      {/* 右侧悬浮快捷入口 */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-r-0 rounded-l shadow-sm">
        <div className="flex flex-col items-center py-2 px-1 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:text-primary text-gray-500 dark:text-gray-400">
          <Headset className="w-[18px] h-[18px]" />
          <span className="text-[10px] mt-0.5 whitespace-nowrap">联系客服</span>
        </div>
        <div className="flex flex-col items-center py-2 px-1 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:text-primary text-gray-500 dark:text-gray-400">
          <Star className="w-[18px] h-[18px]" />
          <span className="text-[10px] mt-0.5 whitespace-nowrap">收藏</span>
        </div>
        <div className="flex flex-col items-center py-2 px-1 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:text-primary text-gray-500 dark:text-gray-400">
          <UserCog className="w-[18px] h-[18px]" />
          <span className="text-[10px] mt-0.5 whitespace-nowrap">助手</span>
        </div>
        <div className="flex flex-col items-center py-2 px-1 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:text-primary text-gray-500 dark:text-gray-400">
          <Smartphone className="w-[18px] h-[18px]" />
          <span className="text-[10px] mt-0.5 whitespace-nowrap">掌上作业</span>
        </div>
        <div className="flex flex-col items-center py-2 px-1 cursor-pointer hover:text-primary text-gray-500 dark:text-gray-400">
          <Monitor className="w-[18px] h-[18px]" />
          <span className="text-[10px] mt-0.5 whitespace-nowrap">主页</span>
        </div>
      </div>

      {/* AI 推荐遮罩层 */}
      {isAIRecommending && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <div className="absolute inset-0 bg-black/20 transition-opacity duration-500"></div>
        </div>
      )}

      {/* AI 小人形象与气泡提示 */}
      {showAIBubble && (
        <div
          className="fixed z-50 transition-all duration-500 ease-in-out"
          style={{
            left: `${aiBubblePosition.x}px`,
            top: `${aiBubblePosition.y}px`,
          }}
        >
          <div className="flex items-start gap-3">
            {/* AI 小人形象 */}
            <div className="flex-shrink-0">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 via-blue-400 to-cyan-400 p-0.5 shadow-lg animate-bounce">
                <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                  <img
                    src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20AI%20robot%20mascot%20avatar%20friendly%20smiling%20blue%20purple%20gradient&image_size=square"
                    alt="AI小云"
                    className="w-12 h-12 object-cover"
                  />
                </div>
              </div>
              {/* 进度条 */}
              {isAIRecommending && (
                <div className="mt-2 w-14 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                    style={{ width: `${aiRecommendationProgress}%` }}
                  ></div>
                </div>
              )}
            </div>

            {/* 气泡提示 */}
            <div className="relative">
              <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-none px-4 py-3 shadow-xl border border-purple-100 dark:border-purple-800 max-w-[220px]">
                {/* 关闭按钮 - 仅在推荐完成后显示 */}
                {!isAIRecommending && (
                  <button
                    onClick={handleCloseAIBubble}
                    className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">AI智能推荐</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {aiMessage || (isAIRecommending ? '小云正在帮您生成中...' : '小云已为您推荐完成')}
                </p>
                {currentHighlightField && isAIRecommending && (
                  <p className="text-xs text-gray-500 mt-1">
                    当前字段：{aiFields.find((f) => f.id === currentHighlightField)?.label}
                  </p>
                )}
                {isAIRecommending && isWaitingUserSelect && currentHighlightField === 'purchaseCategory' && (
                  <button
                    onClick={handleConfirmPurchaseCategory}
                    disabled={!formValues.purchaseCategory.trim()}
                    className={`mt-3 w-full text-xs py-1.5 rounded transition-all ${
                      formValues.purchaseCategory.trim()
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    确认
                  </button>
                )}
              </div>
              {/* 气泡小三角 */}
              <div className="absolute left-[-6px] top-4 w-3 h-3 bg-white dark:bg-gray-800 border-l border-b border-purple-100 dark:border-purple-800 transform rotate-45"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Component;
