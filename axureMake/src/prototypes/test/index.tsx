import React, { useState, useEffect, useRef, useCallback } from 'react';
import logoImage from '../../../assets/media/集采工作台logo图标.png';
import { Table } from 'antd';
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
  Loader2,
  Download,
  FileText,
  MoreHorizontal,
  Filter,
  RefreshCw,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Tag,
  ExternalLink,
  ChevronRight,
  ArrowUpDown,
  Eye,
  FileDown,
  Menu,
  Settings,
  LogOut,
  User,
  Briefcase,
  BarChart3,
  ClipboardList,
  FileSearch,
  Award,
  Layers,
  Package,
  Truck,
  DollarSign,
  Percent,
  CalendarClock,
  Timer,
  History,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckSquare2,
  XCircle,
  MinusCircle,
  SortAsc,
  SortDesc,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Maximize2,
  Minimize2,
  Copy,
  Share2,
  Printer,
  Save,
  Trash,
  Edit2,
  EyeOff,
  Lock,
  Unlock,
  Key,
  ShieldAlert,
  ShieldX,
  ShieldQuestion,
  ShieldOff,
  ShieldPlus,
  ShieldMinus,
  ShieldEllipsis,
} from 'lucide-react';
import './style.css';

/**
 * @name 招标工作台 - 报名与资审汇总
 * @mode axure
 *
 * 参考资料：
 * - /rules/development-guide.md
 * - /skills/axure-export-workflow/SKILL.md
 */

// 分供商数据类型
interface Supplier {
  id: number;
  name: string;
  category: string;
  contact: string;
}

// 生成随机分供商数据
const generateSuppliers = (startId: number, count: number): Supplier[] => {
  const prefixes = ['华夏', '中建', '东方', '南方', '北方', '华东', '华南', '华西', '华北', '中原', '长江', '黄河', '泰山', '华山', '恒信', '永盛', '宏达', '鑫源', '金鼎', '银海'];
  const industries = ['建材', '钢铁', '水泥', '混凝土', '砂石', '管材', '电缆', '门窗', '涂料', '防水'];
  
  const categoryLevel1 = ['物资', '设备', '劳务', '专业分包'];
  const categoryLevel2: { [key: string]: string[] } = {
    '物资': ['钢材', '水泥', '混凝土', '砂石', '电缆', '管材'],
    '设备': ['机械设备', '电气设备', '仪器仪表'],
    '劳务': ['土建劳务', '安装劳务', '装饰劳务'],
    '专业分包': ['钢结构', '幕墙', '机电安装']
  };
  const categoryLevel3: { [key: string]: string[] } = {
    '钢材': ['钢筋', '型钢', '钢板', '钢管', '钢丝'],
    '水泥': ['普通水泥', '特种水泥', '复合水泥'],
    '混凝土': ['普通混凝土', '高强混凝土', '防水混凝土'],
    '砂石': ['河砂', '机制砂', '碎石', '卵石'],
    '电缆': ['电力电缆', '控制电缆', '通信电缆'],
    '管材': ['钢管', '塑料管', '铸铁管'],
    '机械设备': ['挖掘机', '起重机', '混凝土泵车'],
    '电气设备': ['变压器', '配电箱', '开关柜'],
    '仪器仪表': ['测量仪器', '检测仪器', '监控设备'],
    '土建劳务': ['砌筑', '抹灰', '钢筋绑扎'],
    '安装劳务': ['管道安装', '电气安装', '设备安装'],
    '装饰劳务': ['木工', '油漆', '幕墙安装'],
    '钢结构': ['钢框架', '网架', '桁架'],
    '幕墙': ['玻璃幕墙', '石材幕墙', '金属幕墙'],
    '机电安装': ['给排水', '暖通', '电气']
  };

  const phonePrefixes = ['130', '131', '132', '133', '134', '135', '136', '137', '138', '139', '150', '151', '152', '153', '155', '156', '157', '158', '159', '180', '181', '182', '183', '184', '185', '186', '187', '188', '189', '198', '199'];

  const suppliers: Supplier[] = [];
  
  for (let i = 0; i < count; i++) {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const industry = industries[Math.floor(Math.random() * industries.length)];
    const level1 = categoryLevel1[Math.floor(Math.random() * categoryLevel1.length)];
    const level2 = categoryLevel2[level1][Math.floor(Math.random() * categoryLevel2[level1].length)];
    const level3 = categoryLevel3[level2][Math.floor(Math.random() * categoryLevel3[level2].length)];
    const phonePrefix = phonePrefixes[Math.floor(Math.random() * phonePrefixes.length)];
    const phoneMiddle = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const phoneSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    suppliers.push({
      id: startId + i,
      name: `${prefix}${industry}有限公司`,
      category: `${level1} > ${level2} > ${level3}`,
      contact: `${phonePrefix}${phoneMiddle}${phoneSuffix}`
    });
  }
  
  return suppliers;
};

const Component = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  
  // 合作库分供商相关状态
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const tableRef = useRef<HTMLDivElement>(null);
  const TOTAL_DATA_COUNT = 100;
  const PAGE_SIZE = 20;

  // 初始加载数据
  useEffect(() => {
    const initialData = generateSuppliers(1, PAGE_SIZE);
    setSuppliers(initialData);
    setCurrentPage(1);
  }, []);

  // 加载更多数据
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    
    // 固定2秒loading
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const nextPage = currentPage + 1;
    const startId = (nextPage - 1) * PAGE_SIZE + 1;
    const remainingCount = TOTAL_DATA_COUNT - suppliers.length;
    const loadCount = Math.min(PAGE_SIZE, remainingCount);
    
    if (loadCount > 0) {
      const newData = generateSuppliers(startId, loadCount);
      setSuppliers(prev => [...prev, ...newData]);
      setCurrentPage(nextPage);
      
      if (suppliers.length + loadCount >= TOTAL_DATA_COUNT) {
        setHasMore(false);
      }
    } else {
      setHasMore(false);
    }
    
    setIsLoading(false);
  }, [currentPage, isLoading, hasMore, suppliers.length]);

  // 滚动监听
  const handleScroll = useCallback(() => {
    if (!tableRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = tableRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      loadMore();
    }
  }, [loadMore]);

  // 导出功能
  const handleExport = () => {
    // 模拟导出成功
    alert('导出成功');
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-gray-800 dark:text-gray-200 font-sans h-screen flex overflow-hidden">
      {/* Sidebar */}
      <aside className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} flex-shrink-0 flex flex-col text-white transition-all duration-300 overflow-visible`} style={{ backgroundColor: '#1890ff' }}>
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
                <div className="pl-12 pr-4 py-2 text-xs opacity-80 hover:text-white hover:bg-white/5 cursor-pointer nav-item-active font-medium">
                  招标列表
                </div>
                <div className="pl-12 pr-4 py-2 text-xs opacity-80 hover:text-white hover:bg-white/5 cursor-pointer">
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
                  <User className="w-4 h-4 text-gray-500" />
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
              <span className="breadcrumb-item">招标采购</span>
              <span className="breadcrumb-separator">&gt;</span>
              <span className="breadcrumb-item active">报名与资审汇总</span>
            </div>
          </div>

          {/* 内容区域 */}
          <div className="p-4">
            {/* 标题栏 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-sm mr-2">物资</span>
                <h1 className="text-lg font-bold text-gray-800 dark:text-white">范本测试5555</h1>
              </div>
              <div className="flex items-center space-x-2">
                <button className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-4 py-1.5 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-600">上一步</button>
                <button className="bg-primary text-white px-4 py-1.5 rounded text-sm hover:bg-primary-dark shadow-sm">保存</button>
                <button className="bg-primary text-white px-4 py-1.5 rounded text-sm hover:bg-primary-dark shadow-sm">并行发布作业</button>
                <button className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-4 py-1.5 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center">
                  <Plus className="w-4 h-4 mr-1" />
                  招募供应商
                </button>
              </div>
            </div>

            {/* 项目信息卡片 */}
            <div className="bg-white dark:bg-gray-800 rounded shadow-sm p-4 mb-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400 mr-2">距报名截止还剩：</span>
                  <div className="flex items-center space-x-1 font-mono text-primary">
                    <span className="border border-primary px-1 rounded">703</span>
                    <span className="text-gray-500">天</span>
                    <span className="border border-primary px-1 rounded">03</span>
                    <span className="text-gray-500">:</span>
                    <span className="border border-primary px-1 rounded">12</span>
                    <span className="text-gray-500">:</span>
                    <span className="border border-primary px-1 rounded">25</span>
                  </div>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400 mr-2">距投标截止还剩：</span>
                  <div className="flex items-center space-x-1 font-mono text-primary">
                    <span className="border border-primary px-1 rounded">999957</span>
                    <span className="text-gray-500">天</span>
                    <span className="border border-primary px-1 rounded">03</span>
                    <span className="text-gray-500">:</span>
                    <span className="border border-primary px-1 rounded">05</span>
                    <span className="text-gray-500">:</span>
                    <span className="border border-primary px-1 rounded">35</span>
                  </div>
                  <span className="ml-4 px-2 py-0.5 bg-orange-100 text-orange-600 text-xs rounded">报名中</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-y-2 text-xs text-gray-600 dark:text-gray-400">
                <div>招标编号：<span className="text-blue-500 hover:underline cursor-pointer">cscec2026032700000215196</span></div>
                <div>组织机构：中国建筑股份有限公司</div>
                <div>招标方式：公开招标</div>
                <div>项目：<span className="text-blue-500 hover:underline cursor-pointer">测试项目56730</span></div>
                <div>品类：物资-钢材</div>
                <div>经办人：奥巴马</div>
              </div>
            </div>

            {/* 流程步骤条 */}
            <div className="bg-white dark:bg-gray-800 rounded-sm mb-4 border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="step-container">
                <div className="step-item active">约标</div>
                <div className="step-item">发标</div>
                <div className="step-item">开标</div>
                <div className="step-item">评标</div>
                <div className="step-item">定标</div>
              </div>
              <div className="sub-step-container">
                <div className="sub-step-items">
                  <div className="sub-step-item">
                    <span className="sub-step-label active">招标基本信息</span>
                    <div className="sub-step-dot completed">
                      <Check className="w-3 h-3 text-white stroke-[3]" />
                    </div>
                  </div>
                  <div className="sub-step-item">
                    <span className="sub-step-label active">编制招标清单</span>
                    <div className="sub-step-dot completed">
                      <Check className="w-3 h-3 text-white stroke-[3]" />
                    </div>
                  </div>
                  <div className="sub-step-item">
                    <span className="sub-step-label active">编制招标(资格预审)公告</span>
                    <div className="sub-step-dot completed">
                      <Check className="w-3 h-3 text-white stroke-[3]" />
                    </div>
                  </div>
                  <div className="sub-step-item">
                    <span className="sub-step-label active">发布招标(资格预审)公告</span>
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

            {/* 报名与资审汇总模块 */}
            <div className="bg-white dark:bg-gray-800 rounded shadow-sm mb-4 border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-1 h-4 bg-primary mr-2"></div>
                  <h2 className="font-bold text-gray-800 dark:text-white text-sm">报名与资审汇总</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded border border-blue-200 hover:bg-blue-100">
                    查看资审合格标
                  </button>
                  <button className="text-xs text-gray-600 hover:text-gray-800 px-3 py-1.5">
                    资审不合格
                  </button>
                  <button className="text-xs text-gray-600 hover:text-gray-800 px-3 py-1.5">
                    已推送6家
                  </button>
                  <button className="text-xs bg-primary text-white px-3 py-1.5 rounded hover:bg-primary-dark">
                    推送报名
                  </button>
                  <button className="text-xs bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-50">
                    查看推送记录
                  </button>
                  <button className="text-xs bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-50">
                    报名情况导出
                  </button>
                  <button className="text-xs bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-50">
                    附件打包下载
                  </button>
                  <button className="text-xs bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-50 flex items-center">
                    管理
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </button>
                  <button className="text-xs bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-50 flex items-center">
                    分享标讯
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </button>
                </div>
              </div>
              
              {/* 信息统计区 */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-4">
                    <span>公告发布时间：2020-03-27 16:54:04</span>
                    <span>已报名5家，已审核0家</span>
                    <span>报名截止时间：2020-04-08 16:56:00</span>
                    <span className="text-blue-500 cursor-pointer">变更</span>
                    <span className="text-blue-500 cursor-pointer">查看变更记录</span>
                    <span>需标识：支持工商关联</span>
                    <span>经营风险排查</span>
                    <span>报名截止后计算</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs">
                  <div className="flex items-center space-x-4">
                    <span>信息重叠：无</span>
                    <button className="text-blue-500 border border-blue-500 px-2 py-0.5 rounded text-xs">
                      更新信息重叠结果
                    </button>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span>供应商报告：已生成：0家 已授权：0家</span>
                    <span className="text-blue-500 cursor-pointer">查看报告数据</span>
                    <button className="text-blue-500 border border-blue-500 px-2 py-0.5 rounded text-xs">
                      导出资审结果表
                    </button>
                  </div>
                </div>
              </div>

              {/* 搜索筛选区 */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <input 
                      type="text" 
                      placeholder="供应商名称" 
                      className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1.5 text-sm w-48 focus:border-primary outline-none"
                    />
                    <button className="bg-primary text-white px-4 py-1.5 rounded text-sm hover:bg-primary-dark">
                      查询
                    </button>
                    <button className="text-gray-600 text-sm hover:text-gray-800">
                      重置
                    </button>
                  </div>
                </div>
              </div>

              {/* 供应商列表表格 */}
              <div className="px-4 py-4">
                <Table
                  size="small"
                  pagination={false}
                  dataSource={[
                  {
                    key: '1',
                    index: 1,
                    supplier: {
                      name: 'sup203',
                      tags: [{ text: '置顶', color: 'blue' }],
                      desc: '测试分类A8、测试分类A6、测试分类A7、测试分类A4、测试分类A5、测试分类A3、cpy二局一公司二级02',
                      warning: '为推荐结果发生变更，分供商未开...'
                    },
                    category: { name: '测试分类A1', sortable: true },
                    qualification: '--',
                    legal: { cert: '安全生产许可证(一级)', name: 'sup203' },
                    remark: '',
                    passed: '--',
                    operation: '查看',
                    deposit: false
                  },
                  {
                    key: '2',
                    index: 2,
                    supplier: {
                      name: 'sup141',
                      tags: [{ text: '置顶', color: 'orange' }, { text: '待审', color: 'red' }],
                      warning: '分供商未开投标账号，暂不能报名...'
                    },
                    category: { name: '测试分类A1', sortable: true },
                    qualification: '--',
                    legal: { name: '奥巴马' },
                    remark: '',
                    passed: '--',
                    operation: '查看',
                    deposit: false
                  }
                ]}
                columns={[
                  { title: '序号', dataIndex: 'index', key: 'index', width: 60, align: 'center' },
                  {
                    title: '供应商',
                    dataIndex: 'supplier',
                    key: 'supplier',
                    render: (supplier: any) => (
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-blue-500 font-medium">{supplier.name}</span>
                          {supplier.tags?.map((tag: any, idx: number) => (
                            <span key={idx} className={`px-1 text-xs rounded ${
                              tag.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                              tag.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                              'bg-red-100 text-red-600'
                            }`}>{tag.text}</span>
                          ))}
                        </div>
                        {supplier.desc && <div className="text-xs text-gray-500 mt-1">{supplier.desc}</div>}
                        {supplier.warning && <div className="text-xs text-red-500 mt-1">{supplier.warning}</div>}
                      </div>
                    )
                  },
                  {
                    title: '自定义分类',
                    dataIndex: 'category',
                    key: 'category',
                    render: (category: any) => (
                      <div className="flex items-center">
                        <span className="text-blue-500">{category.name}</span>
                        {category.sortable && <ArrowUpDown className="w-3 h-3 ml-1 text-gray-400" />}
                      </div>
                    )
                  },
                  { title: '资质及资信等级', dataIndex: 'qualification', key: 'qualification' },
                  {
                    title: '法人信息',
                    dataIndex: 'legal',
                    key: 'legal',
                    render: (legal: any) => (
                      <div>
                        {legal.cert && <div>{legal.cert}</div>}
                        {legal.name && <div className="text-blue-500">{legal.name}</div>}
                      </div>
                    )
                  },
                  {
                    title: '资审备注',
                    dataIndex: 'remark',
                    key: 'remark',
                    render: () => (
                      <input
                        type="text"
                        placeholder="请输入"
                        className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                      />
                    )
                  },
                  { title: '资审通过', dataIndex: 'passed', key: 'passed', align: 'center' },
                  {
                    title: '操作',
                    dataIndex: 'operation',
                    key: 'operation',
                    align: 'center',
                    render: () => <button className="text-blue-500 hover:text-blue-600 text-xs">查看</button>
                  },
                  {
                    title: '免缴投标保证金',
                    dataIndex: 'deposit',
                    key: 'deposit',
                    align: 'center',
                    render: () => <input type="checkbox" className="rounded" />
                  }
                ]}
                />
              </div>
            </div>

            {/* 合作库分供商模块 */}
            <div className="bg-white dark:bg-gray-800 rounded shadow-sm mb-4 border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-1 h-4 bg-primary mr-2"></div>
                  <h2 className="font-bold text-gray-800 dark:text-white text-sm">合作库分供商</h2>
                </div>
                <button 
                  onClick={handleExport}
                  className="text-xs bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-50 flex items-center"
                >
                  <Download className="w-3 h-3 mr-1" />
                  导出
                </button>
              </div>
              
              {/* 分供商列表表格 */}
              <div className="px-4 py-4">
                <div
                  ref={tableRef}
                  onScroll={handleScroll}
                  className="overflow-y-auto max-h-[400px]"
                >
                  <Table
                    size="small"
                    pagination={false}
                    dataSource={suppliers.map(s => ({ ...s, key: s.id }))}
                    columns={[
                      { title: '分供商名称', dataIndex: 'name', key: 'name' },
                      { title: '合作品类', dataIndex: 'category', key: 'category' },
                      { title: '联系方式', dataIndex: 'contact', key: 'contact' }
                    ]}
                  />
                  
                  {/* Loading 状态 */}
                  {isLoading && (
                    <div className="py-4 text-center">
                      <div className="inline-flex items-center text-gray-500">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        加载中...
                      </div>
                    </div>
                  )}
                  
                  {/* 没有更多数据 */}
                  {!hasMore && !isLoading && suppliers.length > 0 && (
                    <div className="py-4 text-center text-gray-400 text-xs">
                      没有更多数据
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 云筑供应商推荐 */}
            <div className="bg-white dark:bg-gray-800 rounded shadow-sm mb-4 border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-1 h-4 bg-primary mr-2"></div>
                  <h2 className="font-bold text-gray-800 dark:text-white text-sm">云筑供应商推荐</h2>
                </div>
                <ChevronUp className="w-5 h-5 text-gray-400 cursor-pointer" />
              </div>
              <div className="p-4">
                <div className="flex items-center mb-4">
                  <span className="text-gray-700 dark:text-gray-300 text-sm mr-2">资质报告格式：</span>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" name="reportFormat" className="mr-1" defaultChecked />
                      <span className="text-sm">范本</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" name="reportFormat" className="mr-1" />
                      <span className="text-sm">富文本</span>
                    </label>
                  </div>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded p-4">
                  <div className="flex items-center mb-2">
                    <span className="text-red-500 mr-1">*</span>
                    <span className="text-gray-700 dark:text-gray-300 text-sm">资质报告信息：</span>
                  </div>
                  <div className="border border-gray-200 dark:border-gray-700 rounded p-2 min-h-[100px] bg-gray-50 dark:bg-gray-750">
                    {/* 富文本编辑器占位 */}
                    <div className="flex items-center space-x-2 text-gray-400 text-xs">
                      <span>B</span>
                      <span>I</span>
                      <span>U</span>
                      <span>|</span>
                      <span>链接</span>
                      <span>图片</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-start">
                    <span className="text-red-500 mr-1">*</span>
                    <div>
                      <div className="text-gray-700 dark:text-gray-300 text-sm">附件（供应商不可见）</div>
                      <div className="text-gray-400 text-xs mt-1">大小限制：1024M 支持格式：.jpeg .jpg .gif .png .doc .docx .xls .xlsx .txt .pdf .rar .zip .7z .tar .jar .dwg .dws .dwt .dxf .csv</div>
                      <button className="mt-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs px-3 py-1.5 rounded flex items-center hover:bg-gray-50 dark:hover:bg-gray-700">
                        <Plus className="w-[14px] h-[14px] mr-1" /> 添加附件
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 资审公示设置 */}
            <div className="bg-white dark:bg-gray-800 rounded shadow-sm mb-4 border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-1 h-4 bg-primary mr-2"></div>
                  <h2 className="font-bold text-gray-800 dark:text-white text-sm">资审公示设置</h2>
                </div>
                <ChevronUp className="w-5 h-5 text-gray-400 cursor-pointer" />
              </div>
              <div className="p-4">
                <div className="flex items-center">
                  <span className="text-red-500 mr-1">*</span>
                  <span className="text-gray-700 dark:text-gray-300 text-sm mr-4">是否公示：</span>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" name="isPublic" className="mr-1" />
                      <span className="text-sm">公示</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" name="isPublic" className="mr-1" defaultChecked />
                      <span className="text-sm">不公示</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* 自动发布资审结果设置 */}
            <div className="bg-white dark:bg-gray-800 rounded shadow-sm mb-4 border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-1 h-4 bg-primary mr-2"></div>
                  <h2 className="font-bold text-gray-800 dark:text-white text-sm">自动发布资审结果设置</h2>
                </div>
                <ChevronUp className="w-5 h-5 text-gray-400 cursor-pointer" />
              </div>
              <div className="p-4">
                <div className="flex items-center">
                  <span className="text-red-500 mr-1">*</span>
                  <span className="text-gray-700 dark:text-gray-300 text-sm mr-4">是否自动发布资审结果：</span>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" name="autoPublish" className="mr-1" />
                      <span className="text-sm">是</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" name="autoPublish" className="mr-1" defaultChecked />
                      <span className="text-sm">否</span>
                    </label>
                  </div>
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
