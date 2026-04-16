/**
 * @name 资质检测-历史记录页
 */
import React, { useState } from 'react';
import {
  Home,
  Building2,
  AlertTriangle,
  FileCheck,
  Link2,
  Sparkles,
  LayoutGrid,
  HelpCircle,
  Bell,
  User,
  ChevronDown,
  Menu,
  FileText
} from 'lucide-react';
import logoImage from '../../../assets/media/image.png';
import './style.css';

interface DetectionRecord {
  id: string;
  status: 'completed' | 'timeout' | 'failed';
  detectNo: string;
  overview: string;
  startTime: string;
  quotaUsage: string;
}

const mockData: DetectionRecord[] = [
  {
    id: '1',
    status: 'completed',
    detectNo: 'QI20260415000013939',
    overview: '已通过 0 家，未通过 1 家',
    startTime: '2026-04-15 19:24:52',
    quotaUsage: '消耗资质检测额度：1 家'
  },
  {
    id: '2',
    status: 'completed',
    detectNo: 'QI20260415000013665',
    overview: '已通过 0 家，未通过 1 家',
    startTime: '2026-04-15 19:24:12',
    quotaUsage: '消耗资质检测额度：1 家'
  },
  {
    id: '3',
    status: 'completed',
    detectNo: 'QI20260415000014024',
    overview: '已通过 0 家，未通过 1 家',
    startTime: '2026-04-15 19:21:22',
    quotaUsage: '消耗资质检测额度：1 家'
  },
  {
    id: '4',
    status: 'completed',
    detectNo: 'QI20260415000014118',
    overview: '已通过 0 家，未通过 1 家',
    startTime: '2026-04-15 19:12:42',
    quotaUsage: '消耗资质检测额度：1 家'
  },
  {
    id: '5',
    status: 'timeout',
    detectNo: 'QI20260415000014137',
    overview: '已通过 0 家，未通过 1 家',
    startTime: '2026-04-15 19:10:32',
    quotaUsage: '消耗资质检测额度：1 家'
  },
  {
    id: '6',
    status: 'failed',
    detectNo: 'QI20260415000012924',
    overview: '已通过 0 家，未通过 1 家',
    startTime: '2026-04-15 19:05:14',
    quotaUsage: '消耗资质检测额度：1 家'
  },
  {
    id: '7',
    status: 'completed',
    detectNo: 'QI20260415000007741',
    overview: '已通过 0 家，未通过 1 家',
    startTime: '2026-04-15 17:38:45',
    quotaUsage: '消耗资质检测额度：1 家'
  },
  {
    id: '8',
    status: 'completed',
    detectNo: 'QI20260414000016777',
    overview: '已通过 0 家，未通过 1 家',
    startTime: '2026-04-15 13:58:37',
    quotaUsage: '消耗资质检测额度：1 家'
  },
  {
    id: '9',
    status: 'completed',
    detectNo: 'QI20260414000015358',
    overview: '已通过 1 家，未通过 1 家',
    startTime: '2026-04-14 20:39:05',
    quotaUsage: '消耗资质检测额度：2 家'
  },
  {
    id: '10',
    status: 'timeout',
    detectNo: 'QI20260414000005310',
    overview: '已通过 1 家，未通过 1 家',
    startTime: '2026-04-14 17:45:25',
    quotaUsage: '消耗资质检测额度：2 家'
  }
];

const menuItems = [
  { icon: Home, label: '主页', key: 'home' },
  { icon: FileText, label: '资质检测', key: 'qualification', active: true },
  { icon: AlertTriangle, label: '风险解析', key: 'risk' },
  { icon: FileCheck, label: '投标智检', key: 'bid' },
  { icon: Link2, label: '企业关联', key: 'relation' },
  { icon: Sparkles, label: '智能清标', key: 'clear' }
];

const serviceItems = [
  { icon: LayoutGrid, label: '应用市场', key: 'market' },
  { icon: HelpCircle, label: '帮助中心', key: 'help' }
];

export default function QualificationDetection() {
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const totalItems = 40;
  const pageSize = 10;
  const totalPages = Math.ceil(totalItems / pageSize);

  const renderOverviewWithHighlight = (overview: string) => {
    const parts = overview.split(/(\d+)/);
    return parts.map((part, i) =>
      /^\d+$/.test(part) ? <span key={i} className="text-[#1677FF]">{part}</span> : part
    );
  };

  const renderQuotaUsageWithHighlight = (quotaUsage: string) => {
    const parts = quotaUsage.split(/(\d+)/);
    return parts.map((part, i) =>
      /^\d+$/.test(part) ? <span key={i} className="text-[#1677FF]">{part}</span> : part
    );
  };

  const getStatusStyle = (status: string) => {
    if (status === 'completed') {
      return {
        text: 'text-[#52C41A]',
        label: '检测完成'
      };
    }
    return {
      text: 'text-[#FF4D4F]',
      label: status === 'timeout' ? '检测超时' : '检测失败'
    };
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex">
      {/* 左侧导航栏 */}
      <aside
        className={`${sidebarCollapsed ? 'w-16' : 'w-[200px]'} bg-white border-r border-[#F0F0F0] flex flex-col transition-all duration-300 fixed h-full z-10`}
      >
        {/* LOGO区域 */}
        <div className="h-16 flex items-center px-4">
          {sidebarCollapsed ? (
            <div className="flex items-center justify-center w-full">
              <img
                src={logoImage}
                alt="云筑AI工坊"
                className="w-8 h-8 object-contain"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <img
                src={logoImage}
                alt="云筑AI工坊"
                className="w-8 h-8 object-contain"
              />
              <span className="text-[#262626] font-medium text-sm">云筑AI工坊</span>
            </div>
          )}
        </div>

        {/* 主页 - 独立区域 */}
        <div className="pt-2 pb-2">
          <nav className="px-2">
            <button
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg text-sm transition-colors text-[#595959] hover:bg-[#F5F5F5]`}
            >
              <Home className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && <span>主页</span>}
            </button>
          </nav>
        </div>

        {/* 工具模块 */}
        <div className="flex-1 py-2 overflow-y-auto">
          {!sidebarCollapsed && (
            <div className="px-4 mb-2 text-xs text-[#8C8C8C]">工具</div>
          )}
          <nav className="space-y-1 px-2">
            {menuItems.filter(item => item.key !== 'home').map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    item.active
                      ? 'bg-[#E6F4FF] text-[#1677FF]'
                      : 'text-[#595959] hover:bg-[#F5F5F5]'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* 服务模块 */}
          {!sidebarCollapsed && (
            <div className="px-4 mt-6 mb-2 text-xs text-[#8C8C8C]">服务</div>
          )}
          <nav className="space-y-1 px-2">
            {serviceItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#595959] hover:bg-[#F5F5F5] transition-colors"
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* 底部工具栏 */}
        <div className="border-t border-[#F0F0F0] p-2">
          {/* 消息通知 - 收起时显示在上方 */}
          {sidebarCollapsed && (
            <div className="flex justify-center mb-2">
              <button className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-colors relative">
                <Bell className="w-4 h-4 text-[#595959]" />
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#FF4D4F] text-white text-[10px] rounded-full flex items-center justify-center">
                  10
                </span>
              </button>
            </div>
          )}
          
          {/* 展开/收起按钮 */}
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} px-2 mb-2`}>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-colors"
            >
              <Menu className="w-4 h-4 text-[#595959]" />
            </button>
            {!sidebarCollapsed && (
              <button className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-colors relative">
                <Bell className="w-4 h-4 text-[#595959]" />
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#FF4D4F] text-white text-[10px] rounded-full flex items-center justify-center">
                  10
                </span>
              </button>
            )}
          </div>

          {/* 用户信息 */}
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#595959] hover:bg-[#F5F5F5] transition-colors">
            <div className="w-6 h-6 rounded-full bg-[#1677FF] flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <>
                <span className="flex-1 text-left">jcftest1</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className={`flex-1 ${sidebarCollapsed ? 'ml-16' : 'ml-[200px]'} transition-all duration-300`}>
        <div className="p-6">
          {/* 表格区域 */}
          <div className="bg-white rounded-lg shadow-sm border border-[#F0F0F0]">
            {/* 表格右上角统计 */}
            <div className="flex justify-end px-4 pt-3 pb-2">
              <span className="text-xs text-[#8C8C8C]">本页:10条 总计:40条</span>
            </div>
            {/* 表格 */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#FAFAFA] border-b border-[#F0F0F0]">
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#262626]">序号</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#262626]">资质检测编号</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#262626]">资质检测概况</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#262626]">状态</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#262626]">检测发起时间</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#262626]">权益使用</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#262626]">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {mockData.map((record, index) => {
                    const statusStyle = getStatusStyle(record.status);
                    return (
                      <tr
                        key={record.id}
                        className={`border-b border-[#F0F0F0] hover:bg-[#FAFAFA] transition-colors ${
                          index === mockData.length - 1 ? 'border-b-0' : ''
                        }`}
                      >
                        <td className="px-4 py-3 text-sm text-[#595959]">{index + 1}</td>
                        <td className="px-4 py-3 text-sm text-[#1677FF] cursor-pointer hover:underline">
                          {record.detectNo}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#595959]">
                          {renderOverviewWithHighlight(record.overview)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm ${statusStyle.text}`}>
                            {statusStyle.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#595959]">{record.startTime}</td>
                        <td className="px-4 py-3 text-sm text-[#595959]">
                          {renderQuotaUsageWithHighlight(record.quotaUsage)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <button className="text-sm text-[#1677FF] hover:underline">查看结果</button>
                            {(record.status === 'timeout' || record.status === 'failed') && (
                              <button className="text-sm text-[#1677FF] hover:underline">重新检测</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 分页器 */}
            <div className="flex items-center justify-end px-4 py-4 border-t border-[#F0F0F0]">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm border border-[#D9D9D9] rounded hover:border-[#1677FF] hover:text-[#1677FF] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  上一页
                </button>
                {[...Array(Math.min(5, totalPages))].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`min-w-[32px] px-3 py-1.5 text-sm rounded transition-colors ${
                      currentPage === i + 1
                        ? 'bg-[#1677FF] text-white'
                        : 'border border-[#D9D9D9] hover:border-[#1677FF] hover:text-[#1677FF]'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                {totalPages > 5 && (
                  <>
                    <span className="text-[#8C8C8C]">...</span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="min-w-[32px] px-3 py-1.5 text-sm border border-[#D9D9D9] rounded hover:border-[#1677FF] hover:text-[#1677FF] transition-colors"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm border border-[#D9D9D9] rounded hover:border-[#1677FF] hover:text-[#1677FF] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  下一页
                </button>
                <span className="text-sm text-[#8C8C8C] ml-2">10 条/页</span>
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-sm text-[#8C8C8C]">跳至</span>
                  <input
                    type="number"
                    min={1}
                    max={totalPages}
                    className="w-12 px-2 py-1.5 text-sm border border-[#D9D9D9] rounded text-center focus:outline-none focus:border-[#1677FF]"
                    placeholder=""
                  />
                  <span className="text-sm text-[#8C8C8C]">页</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
