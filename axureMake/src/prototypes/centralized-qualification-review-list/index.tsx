/**
 * @name 集中资格预审列表
 *
 * 高保真还原集采工作台 - 集中资格预审页面
 */
import React, { useState } from 'react';
import {
  Home,
  Shield,
  ShoppingCart,
  Users,
  Calendar,
  Gavel,
  Banknote,
  CheckCircle,
  List,
  Search,
  ChevronDown,
  ChevronUp,
  Monitor,
  Send,
  ArrowRightLeft,
  Star,
  Download,
  HelpCircle,
  Bell,
  Plus,
  RefreshCw
} from 'lucide-react';
import logoImage from '../../../assets/media/集采工作台logo图标.png';
import './style.css';

interface TableRow {
  id: number;
  org: string;
  code: string;
  name: string;
  category: string;
  region: string;
  status: string;
  statusType: 'default' | 'primary' | 'success' | 'warning';
  supplierCount: string;
  creator: string;
  createTime: string;
  finishTime: string;
}

const tableData: TableRow[] = [
  {
    id: 1,
    org: '中国建筑股份有限公司',
    code: 'JZZGYS2026071700000001',
    name: '测试',
    category: '物资-钢材',
    region: '西南大区',
    status: '报名截止',
    statusType: 'default',
    supplierCount: '报名数 3',
    creator: '奥巴马\n(hehetest)',
    createTime: '2026-07-17\n16:23:24',
    finishTime: '-'
  },
  {
    id: 2,
    org: '中国建筑第一工程局有限公司',
    code: 'JZZGYS2026071300000004',
    name: '股份准入范围控制',
    category: '物资-钢材',
    region: '全国',
    status: '报名中',
    statusType: 'primary',
    supplierCount: '-',
    creator: '曾晓梅\n(qiqi)',
    createTime: '2026-07-13\n16:04:45',
    finishTime: '-'
  },
  {
    id: 3,
    org: '中国建筑第一工程局有限公司',
    code: 'JZZGYS2026071300000002',
    name: 'qiqi',
    category: '物资-钢材',
    region: '全国',
    status: '报名截止',
    statusType: 'default',
    supplierCount: '-',
    creator: '曾晓梅\n(qiqi)',
    createTime: '2026-07-13\n16:00:44',
    finishTime: '-'
  },
  {
    id: 4,
    org: '中国建筑一局（集团）有限公司',
    code: 'JZZGYS2026071300000001',
    name: 'qiqi-范围控制',
    category: '设备-运沙车',
    region: '全国',
    status: '报名中',
    statusType: 'primary',
    supplierCount: '-',
    creator: '曾晓梅\n(qiqi)',
    createTime: '2026-07-13\n15:24:45',
    finishTime: '-'
  },
  {
    id: 5,
    org: '中国建筑一局（集团）有限公司',
    code: 'JZZGYS2026070800000003',
    name: 'qiqi-解析8',
    category: '劳务分包-主体\n结构劳务',
    region: '全国',
    status: '报名截止',
    statusType: 'default',
    supplierCount: '报名数 1',
    creator: '曾晓梅\n(qiqi)',
    createTime: '2026-07-08\n11:38:00',
    finishTime: '-'
  },
  {
    id: 6,
    org: '中国建筑一局（集团）有限公司',
    code: 'JZZGYS2026070800000001',
    name: 'qiqi-解析7/非局级',
    category: '物资-钢材',
    region: '全国',
    status: '信息编制中',
    statusType: 'warning',
    supplierCount: '-',
    creator: '曾晓梅\n(qiqi)',
    createTime: '2026-07-08\n10:17:08',
    finishTime: '-'
  }
];

const mainMenuItems = [
  { icon: Home, label: '首页' },
  { icon: Shield, label: '权限申请菜单测试' },
  { icon: ShoppingCart, label: '采购列表' },
  { icon: Users, label: '分供商管理' },
  { icon: Calendar, label: '采购计划管理' },
  { icon: Gavel, label: '招标采购', expanded: true },
  { icon: Users, label: '推荐人管理' },
  { icon: CheckCircle, label: '评标/评审专家列表' },
  { icon: Shield, label: '厂家直签审核' },
  { icon: Banknote, label: '投标/响应保证金管理' },
  { icon: CheckCircle, label: '履约保证金管理' }
];

const subMenuItems = [
  '待采购任务',
  '招标/采购稽查',
  '集中资格预审列表',
  '招标列表',
  '非招标采购',
  '采购列表'
];

const getStatusClass = (type: TableRow['statusType']) => {
  switch (type) {
    case 'primary':
      return 'status-primary';
    case 'success':
      return 'status-success';
    case 'warning':
      return 'status-warning';
    default:
      return 'status-default';
  }
};

const FilterItem: React.FC<{
  label: string;
  children: React.ReactNode;
  labelWidth?: number;
}> = ({ label, children, labelWidth = 100 }) => (
  <div className="flex items-center gap-2 min-w-0">
    <span
      className="text-gray-600 text-xs shrink-0 text-right"
      style={{ width: labelWidth }}
    >
      {label}
    </span>
    {children}
  </div>
);

const Component: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isBiddingExpanded, setIsBiddingExpanded] = useState(true);

  return (
    <div className="h-screen flex flex-col bg-page-bg text-sm overflow-hidden font-sans">
      {/* Header */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-primary font-bold text-xl italic tracking-wide">
            <img src={logoImage} alt="集采工作台" className="h-7" />
          </div>

          <div className="flex items-center gap-3 ml-4">
            <div className="relative">
              <select className="appearance-none bg-white border border-border-base rounded px-3 py-1.5 pr-8 text-xs text-gray-700 w-40 cursor-pointer hover:border-gray-400">
                <option>中国建筑股份...</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-2 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="支持通过关键字搜索菜单"
                className="pl-3 pr-8 py-1.5 border border-border-base rounded w-48 text-xs text-gray-700 placeholder-gray-300 focus:outline-none focus:border-primary"
              />
              <Search size={14} className="absolute right-2.5 top-2 text-gray-400" />
            </div>

            <div className="flex items-center gap-1.5 border border-border-base rounded px-2 py-1.5 cursor-pointer hover:border-gray-400 bg-white">
              <span className="text-red-500 text-xs">简</span>
              <span className="text-xs text-gray-700">简体中文</span>
              <ChevronDown size={14} className="text-gray-400" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-gray-600 text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors">
              <Home size={14} /> 云筑首页
            </span>
            <span className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors">
              <Monitor size={14} /> 寻源工作台
            </span>
            <span className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors">
              <Send size={14} /> 发布招募需求
            </span>
            <span className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors">
              <ArrowRightLeft size={14} /> 切换新版
            </span>
          </div>

          <div className="h-4 w-px bg-gray-300"></div>

          <div className="flex items-center gap-3">
            <Star size={16} className="cursor-pointer hover:text-primary transition-colors" />
            <Download size={16} className="cursor-pointer hover:text-primary transition-colors" />
            <HelpCircle size={16} className="cursor-pointer hover:text-primary transition-colors" />
            <div className="relative cursor-pointer hover:text-primary transition-colors">
              <Bell size={16} />
              <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] px-1 rounded-full scale-90">99+</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 ml-2 cursor-pointer hover:text-primary transition-colors">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-primary overflow-hidden border border-blue-200">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Obama" alt="avatar" className="w-full h-full object-cover" />
            </div>
            <span className="text-gray-700 text-xs">奥巴马</span>
            <ChevronDown size={14} className="text-gray-400" />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${sidebarCollapsed ? 'w-16' : 'w-52'} bg-primary flex flex-col shrink-0 text-white transition-all duration-300 overflow-hidden`}
        >
          <div className="h-14 flex items-center justify-center font-bold text-lg tracking-wide bg-white text-primary shrink-0">
            {!sidebarCollapsed && <span>集采工作台</span>}
          </div>

          <nav className="flex-1 overflow-y-auto custom-scrollbar py-2">
            {mainMenuItems.map((item, index) => (
              <div key={index}>
                <div
                  className={`px-4 py-2.5 cursor-pointer flex items-center gap-3 hover:bg-sidebar-active transition-colors ${
                    item.label === '招标采购' ? 'bg-sidebar-active' : ''
                  }`}
                  onClick={() => {
                    if (item.label === '招标采购') {
                      setIsBiddingExpanded(!isBiddingExpanded);
                    }
                  }}
                >
                  <item.icon size={18} className="shrink-0" />
                  {!sidebarCollapsed && (
                    <>
                      <span className="text-xs whitespace-nowrap flex-1">{item.label}</span>
                      {item.label === '招标采购' && (
                        isBiddingExpanded ? <ChevronUp size={14} className="shrink-0" /> : <ChevronDown size={14} className="shrink-0" />
                      )}
                    </>
                  )}
                </div>

                {item.label === '招标采购' && isBiddingExpanded && !sidebarCollapsed && (
                  <div className="bg-[#1582e6]">
                    {subMenuItems.map((sub, subIndex) => (
                      <div
                        key={subIndex}
                        className={`pl-12 pr-4 py-2 text-xs cursor-pointer hover:bg-white/10 transition-colors ${
                          sub === '集中资格预审列表' ? 'sidebar-sub-item-active' : 'opacity-90'
                        }`}
                      >
                        {sub}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div
            className="py-3 border-t border-white/20 flex items-center justify-center cursor-pointer hover:bg-sidebar-active transition-colors shrink-0"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <List size={18} />
            {!sidebarCollapsed && <span className="ml-2 text-xs">收起菜单</span>}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Breadcrumb */}
          <div className="px-4 py-2.5 text-xs text-gray-500 bg-page-bg shrink-0">
            <span className="cursor-pointer hover:text-primary">招标采购</span>
            <span className="mx-2">{'>'}</span>
            <span className="text-gray-900">集中资格预审列表</span>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4">
            {/* Filter Panel */}
            <div className="bg-white rounded-sm border border-gray-200 p-4 mb-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-3 gap-x-6">
                {/* Row 1 */}
                <FilterItem label="组织机构">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="relative flex-1 min-w-0">
                      <select className="w-full pl-2 pr-7 py-1.5 border border-border-base rounded text-xs text-gray-700 bg-white appearance-none cursor-pointer hover:border-gray-400">
                        <option>全部</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-2 top-2 text-gray-400 pointer-events-none" />
                    </div>
                    <label className="flex items-center gap-1 cursor-pointer shrink-0">
                      <input type="checkbox" defaultChecked className="custom-checkbox" />
                      <span className="text-xs text-gray-700 whitespace-nowrap">包含下级</span>
                    </label>
                  </div>
                </FilterItem>

                <FilterItem label="集中资格预审编号">
                  <input
                    type="text"
                    placeholder="请输入"
                    className="flex-1 min-w-0 px-2 py-1.5 border border-border-base rounded text-xs text-gray-700 placeholder-gray-300 focus:outline-none focus:border-primary"
                  />
                </FilterItem>

                <FilterItem label="集中资格预审名称">
                  <input
                    type="text"
                    placeholder="请输入"
                    className="flex-1 min-w-0 px-2 py-1.5 border border-border-base rounded text-xs text-gray-700 placeholder-gray-300 focus:outline-none focus:border-primary"
                  />
                </FilterItem>

                <FilterItem label="集中资格预审品类">
                  <div className="relative flex-1 min-w-0">
                    <select className="w-full pl-2 pr-7 py-1.5 border border-border-base rounded text-xs text-gray-700 bg-white appearance-none cursor-pointer hover:border-gray-400">
                      <option>全部</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-2 top-2 text-gray-400 pointer-events-none" />
                  </div>
                </FilterItem>

                {/* Row 2 */}
                <FilterItem label="创建人">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <input
                      type="text"
                      placeholder="请输入"
                      className="flex-1 min-w-0 px-2 py-1.5 border border-border-base rounded text-xs text-gray-700 placeholder-gray-300 focus:outline-none focus:border-primary"
                    />
                    <label className="flex items-center gap-1 cursor-pointer shrink-0">
                      <input type="checkbox" className="custom-checkbox" />
                      <span className="text-xs text-gray-700 whitespace-nowrap">本人创建</span>
                    </label>
                  </div>
                </FilterItem>

                <FilterItem label="状态">
                  <div className="relative flex-1 min-w-0">
                    <select className="w-full pl-2 pr-7 py-1.5 border border-border-base rounded text-xs text-gray-700 bg-white appearance-none cursor-pointer hover:border-gray-400">
                      <option>全部</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-2 top-2 text-gray-400 pointer-events-none" />
                  </div>
                </FilterItem>

                <FilterItem label="创建日期">
                  <div className="date-range-input">
                    <input type="text" placeholder="开始日期" />
                    <span className="text-gray-400 mx-1">-</span>
                    <input type="text" placeholder="结束日期" />
                  </div>
                </FilterItem>

                <FilterItem label="完成日期">
                  <div className="date-range-input">
                    <input type="text" placeholder="开始日期" />
                    <span className="text-gray-400 mx-1">-</span>
                    <input type="text" placeholder="结束日期" />
                  </div>
                </FilterItem>

                {/* Row 3 */}
                <FilterItem label="区域">
                  <div className="relative flex-1 min-w-0">
                    <select className="w-full pl-2 pr-7 py-1.5 border border-border-base rounded text-xs text-gray-700 bg-white appearance-none cursor-pointer hover:border-gray-400">
                      <option>全部</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-2 top-2 text-gray-400 pointer-events-none" />
                  </div>
                </FilterItem>

                <div className="flex items-center justify-end gap-2 md:col-span-1 lg:col-span-2 xl:col-span-3">
                  <button className="px-4 py-1.5 bg-primary text-white text-xs rounded hover:bg-primary-dark transition-colors">
                    查询
                  </button>
                  <button className="px-4 py-1.5 bg-white border border-border-base text-gray-700 text-xs rounded hover:border-primary hover:text-primary transition-colors">
                    重置
                  </button>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-xs rounded hover:bg-primary-dark transition-colors">
                  <Plus size={14} />
                  新建集中资格预审
                </button>
                <button className="px-3 py-1.5 bg-white border border-border-base text-gray-700 text-xs rounded hover:border-primary hover:text-primary transition-colors">
                  导出
                </button>
                <button className="w-7 h-7 flex items-center justify-center bg-white border border-border-base rounded hover:border-primary hover:text-primary transition-colors text-gray-600">
                  <RefreshCw size={14} />
                </button>
              </div>
              <div className="text-xs text-gray-500">
                本页：10条 总计：665条
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="qual-review-table">
                  <thead>
                    <tr>
                      <th className="w-12 text-center">序号</th>
                      <th>组织机构</th>
                      <th>集中资格预审编号</th>
                      <th>集中资格预审名称</th>
                      <th>集中资格预审品类</th>
                      <th>区域</th>
                      <th>状态</th>
                      <th>分供商报名</th>
                      <th>创建人</th>
                      <th>创建时间</th>
                      <th>完成时间</th>
                      <th className="text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row) => (
                      <tr key={row.id}>
                        <td className="text-center text-gray-500">{row.id}</td>
                        <td className="whitespace-pre-line">{row.org}</td>
                        <td className="text-primary cursor-pointer hover:underline whitespace-pre-line">{row.code}</td>
                        <td className="whitespace-pre-line">{row.name}</td>
                        <td className="whitespace-pre-line">{row.category}</td>
                        <td>{row.region}</td>
                        <td>
                          <span className={`status-tag ${getStatusClass(row.statusType)}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="text-gray-500">{row.supplierCount}</td>
                        <td className="whitespace-pre-line">{row.creator}</td>
                        <td className="whitespace-pre-line text-gray-500">{row.createTime}</td>
                        <td className="text-gray-500">{row.finishTime}</td>
                        <td>
                          <div className="flex items-center justify-center gap-2">
                            <button className="text-primary hover:underline text-xs">查看</button>
                            <button className="text-primary hover:underline text-xs flex items-center">
                              更多
                              <ChevronDown size={12} className="ml-0.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-end px-4 py-3 border-t border-gray-100 gap-2">
                <span className="text-xs text-gray-500">共 665 条</span>
                <select className="text-xs border border-border-base rounded px-2 py-1 text-gray-700 bg-white">
                  <option>10 条/页</option>
                  <option>20 条/页</option>
                  <option>50 条/页</option>
                </select>
                <button className="px-2 py-1 text-xs border border-border-base rounded bg-white text-gray-400 cursor-not-allowed">
                  &lt;
                </button>
                <button className="px-2.5 py-1 text-xs border border-primary rounded bg-primary text-white">
                  1
                </button>
                <button className="px-2.5 py-1 text-xs border border-border-base rounded bg-white text-gray-700 hover:border-primary hover:text-primary">
                  2
                </button>
                <button className="px-2.5 py-1 text-xs border border-border-base rounded bg-white text-gray-700 hover:border-primary hover:text-primary">
                  3
                </button>
                <span className="text-xs text-gray-500">...</span>
                <button className="px-2.5 py-1 text-xs border border-border-base rounded bg-white text-gray-700 hover:border-primary hover:text-primary">
                  67
                </button>
                <button className="px-2 py-1 text-xs border border-border-base rounded bg-white text-gray-700 hover:border-primary hover:text-primary">
                  &gt;
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Component;
