/**
 * @name 企业关联-历史记录页
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
  Calendar,
  ArrowRight
} from 'lucide-react';
import logoImage from '../../../assets/media/image.png';
import './style.css';

interface DetectionRecord {
  id: string;
  status: 'completed' | 'timeout';
  detectNo: string;
  relation: string;
  startTime: string;
  quotaUsage: string;
  initiator: string;
}

const mockData: DetectionRecord[] = [
  {
    id: '1',
    status: 'completed',
    detectNo: 'AAD2026041400001669970',
    relation: '存在企业关联关系的企业：2家',
    startTime: '2026-04-14 20:47:37',
    quotaUsage: '消耗企业关联检测额度：2家',
    initiator: 'jctest1 (jctest1)'
  },
  {
    id: '2',
    status: 'completed',
    detectNo: 'AAD2026041400001691227',
    relation: '存在企业关联关系的企业：0家',
    startTime: '2026-04-14 20:43:08',
    quotaUsage: '消耗企业关联检测额度：2家',
    initiator: 'jctest1 (jctest1)'
  },
  {
    id: '3',
    status: 'completed',
    detectNo: 'AAD2026040900001370209',
    relation: '存在企业关联关系的企业：3家',
    startTime: '2026-04-09 19:51:44',
    quotaUsage: '消耗企业关联检测额度：3家',
    initiator: 'jctest1 (jctest1)'
  },
  {
    id: '4',
    status: 'completed',
    detectNo: 'AAD2026040900001345745',
    relation: '存在企业关联关系的企业：0家',
    startTime: '2026-04-09 19:19:50',
    quotaUsage: '消耗企业关联检测额度：3家',
    initiator: 'jctest1 (jctest1)'
  },
  {
    id: '5',
    status: 'timeout',
    detectNo: 'AAD202604080000150135',
    relation: '存在企业关联关系的企业：-家',
    startTime: '2026-04-08 11:11:46',
    quotaUsage: '消耗企业关联检测额度：2家',
    initiator: 'jctest1 (jctest1)'
  },
  {
    id: '6',
    status: 'timeout',
    detectNo: 'AAD202604070000130726',
    relation: '存在企业关联关系的企业：-家',
    startTime: '2026-04-07 17:53:23',
    quotaUsage: '消耗企业关联检测额度：2家',
    initiator: 'jctest1 (jctest1)'
  },
  {
    id: '7',
    status: 'completed',
    detectNo: 'AAD2026012000001357416',
    relation: '存在企业关联关系的企业：2家',
    startTime: '2026-03-30 17:49:00',
    quotaUsage: '消耗企业关联检测额度：2家',
    initiator: 'jctest1 (jctest1)'
  },
  {
    id: '8',
    status: 'timeout',
    detectNo: 'AAD202601190000235234',
    relation: '存在企业关联关系的企业：-家',
    startTime: '2026-01-20 16:26:24',
    quotaUsage: '消耗企业关联检测额度：50家',
    initiator: 'jctest1 (jctest1)'
  },
  {
    id: '9',
    status: 'completed',
    detectNo: 'AAD2026011300001242446',
    relation: '存在企业关联关系的企业：2家',
    startTime: '2026-01-13 18:10:05',
    quotaUsage: '消耗企业关联检测额度：2家',
    initiator: 'jctest1 (jctest1)'
  },
  {
    id: '10',
    status: 'completed',
    detectNo: 'AAD202601130000100150',
    relation: '存在企业关联关系的企业：2家',
    startTime: '2026-01-13 18:06:50',
    quotaUsage: '消耗企业关联检测额度：2家',
    initiator: 'jctest1 (jctest1)'
  }
];

const menuItems = [
  { icon: Home, label: '主页', key: 'home' },
  { icon: Building2, label: '企业检测', key: 'enterprise' },
  { icon: AlertTriangle, label: '风险解析', key: 'risk' },
  { icon: FileCheck, label: '投标智检', key: 'bid' },
  { icon: Link2, label: '企业关联', key: 'relation', active: true },
  { icon: Sparkles, label: '智能清标', key: 'clear' }
];

const serviceItems = [
  { icon: LayoutGrid, label: '应用市场', key: 'market' },
  { icon: HelpCircle, label: '帮助中心', key: 'help' }
];

export default function EnterpriseRelationDetection() {
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [detectNo, setDetectNo] = useState('');
  const [searchNo, setSearchNo] = useState('');
  const [startDate, setStartDate] = useState('');
  const [searchStartDate, setSearchStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchEndDate, setSearchEndDate] = useState('');
  const [startDateFocused, setStartDateFocused] = useState(false);
  const [endDateFocused, setEndDateFocused] = useState(false);
  const pageSize = 10;

  const filteredData = mockData.filter((record) => {
    const matchNo = record.detectNo.toLowerCase().includes(searchNo.toLowerCase());
    const recordDate = record.startTime.split(' ')[0];
    const matchStart = !searchStartDate || recordDate >= searchStartDate;
    const matchEnd = !searchEndDate || recordDate <= searchEndDate;
    return matchNo && matchStart && matchEnd;
  });
  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSearch = () => {
    setSearchNo(detectNo.trim());
    setSearchStartDate(startDate);
    setSearchEndDate(endDate);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setDetectNo('');
    setSearchNo('');
    setStartDate('');
    setSearchStartDate('');
    setEndDate('');
    setSearchEndDate('');
    setCurrentPage(1);
  };

  const getStatusStyle = (status: string) => {
    if (status === 'completed') {
      return {
        text: 'text-[#52C41A]',
        label: '检测完成'
      };
    }
    return {
      text: 'text-[#1677FF]',
      label: '检测中'
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
        <div className="p-6 space-y-4">
          {/* 筛选条件 */}
          <div className="bg-white rounded-lg shadow-sm border border-[#F0F0F0] p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <label className="text-sm text-[#262626]">检测编号</label>
                <input
                  type="text"
                  value={detectNo}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDetectNo(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSearch()}
                  placeholder="请输入检测编号"
                  className="w-[240px] px-3 py-1.5 text-sm border border-[#D9D9D9] rounded focus:outline-none focus:border-[#1677FF]"
                />
                <label className="text-sm text-[#262626]">发起时间</label>
                <div className="flex items-center px-2 py-1.5 border border-[#D9D9D9] rounded focus-within:border-[#1677FF] bg-white">
                  <input
                    type={startDateFocused ? 'date' : 'text'}
                    value={startDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
                    onFocus={() => setStartDateFocused(true)}
                    onBlur={() => setStartDateFocused(false)}
                    placeholder="开始日期"
                    className="w-[110px] text-sm outline-none text-center bg-transparent"
                  />
                  <ArrowRight className="w-4 h-4 text-[#8C8C8C] mx-2" />
                  <input
                    type={endDateFocused ? 'date' : 'text'}
                    value={endDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
                    onFocus={() => setEndDateFocused(true)}
                    onBlur={() => setEndDateFocused(false)}
                    placeholder="结束日期"
                    className="w-[110px] text-sm outline-none text-center bg-transparent"
                  />
                  <Calendar className="w-4 h-4 text-[#8C8C8C] ml-2" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSearch}
                  className="px-4 py-1.5 text-sm bg-[#1677FF] text-white rounded hover:bg-[#4096FF] transition-colors"
                >
                  查询
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-1.5 text-sm border border-[#D9D9D9] rounded hover:border-[#1677FF] hover:text-[#1677FF] transition-colors"
                >
                  重置
                </button>
              </div>
            </div>
          </div>

          {/* 表格区域 */}
          <div className="bg-white rounded-lg shadow-sm border border-[#F0F0F0]">
            {/* 表格右上角统计 */}
            <div className="flex justify-end px-4 pt-3 pb-2">
              <span className="text-xs text-[#8C8C8C]">本页:{paginatedData.length}条 总计:{totalItems}条</span>
            </div>
            {/* 表格 */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#FAFAFA] border-b border-[#F0F0F0]">
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#262626]">序号</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#262626]">企业关联检测编号</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#262626]">关联关系</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#262626]">状态</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#262626]">检测发起时间</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#262626]">权益使用</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#262626]">发起人</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#262626]">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((record, index) => {
                    const statusStyle = getStatusStyle(record.status);
                    const globalIndex = (currentPage - 1) * pageSize + index;
                    return (
                      <tr
                        key={record.id}
                        className={`border-b border-[#F0F0F0] hover:bg-[#FAFAFA] transition-colors ${
                          index === paginatedData.length - 1 ? 'border-b-0' : ''
                        }`}
                      >
                        <td className="px-4 py-3 text-sm text-[#595959]">{globalIndex + 1}</td>
                        <td className="px-4 py-3 text-sm text-[#1677FF] cursor-pointer hover:underline">
                          {record.detectNo}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#595959]">
                          {record.relation.split(/(\d+)/).map((part, i) =>
                            /^\d+$/.test(part) ? <span key={i} className="text-[#1677FF]">{part}</span> : part
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm ${statusStyle.text}`}>
                            {statusStyle.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#595959]">{record.startTime}</td>
                        <td className="px-4 py-3 text-sm text-[#595959]">
                          {record.quotaUsage.split(/(\d+)/).map((part, i) =>
                            /^\d+$/.test(part) ? <span key={i} className="text-[#1677FF]">{part}</span> : part
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#595959]">{record.initiator}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <button className="text-sm text-[#1677FF] hover:underline">查看结果</button>
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
