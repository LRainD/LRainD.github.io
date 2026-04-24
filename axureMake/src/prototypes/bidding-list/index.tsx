/**
 * @name 招标列表
 */
import React from 'react';
import { 
  Search, ChevronDown, Home, Monitor, Send, ArrowRightLeft, Star, Download, HelpCircle, Bell,
  Home as HomeIcon, Shield, ShoppingCart, Users, Gavel, HardHat, Link, FileText, AlertTriangle, 
  Banknote, CheckCircle, Inbox, List, Settings, AlertCircle
} from 'lucide-react';
import './style.css';

export default function BiddingList() {
  return (
    <div className="h-screen flex flex-col bg-page text-sm overflow-hidden">
      {/* Header */}
      <header className="h-[56px] bg-white border-b border-border-base flex items-center justify-between px-4 shrink-0 shadow-sm z-10 relative">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-primary font-bold text-xl italic tracking-wide">
            {/* Logo */}
            <div className="w-8 h-8 rounded bg-primary text-white flex items-center justify-center transform -skew-x-12">
              <span className="transform skew-x-12 font-bold text-lg">集</span>
            </div>
            集采工作台
          </div>
          
          <div className="flex items-center gap-4 ml-6">
            <div className="flex items-center gap-2 border border-border-base rounded px-3 py-1.5 cursor-pointer hover:border-gray-400 transition-colors bg-white">
              <span className="text-gray-700">中国建筑股份...</span>
              <ChevronDown size={14} className="text-gray-400"/>
            </div>
            
            <div className="relative">
              <input 
                type="text" 
                placeholder="支持通过关键字搜索菜单" 
                className="pl-3 pr-8 py-1.5 border border-border-base rounded w-64 form-input text-xs text-gray-700"
              />
              <Search size={14} className="absolute right-2.5 top-2 text-gray-400" />
            </div>

            <div className="flex items-center gap-1.5 border border-border-base rounded px-2 py-1.5 cursor-pointer hover:border-gray-400 transition-colors bg-white">
              <span className="text-red-500 font-bold leading-none">🇨🇳</span>
              <span className="text-xs text-gray-700">简体中文</span>
              <ChevronDown size={14} className="text-gray-400"/>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-5 text-gray-600 text-xs">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors"><Home size={15}/> 云筑首页</span>
            <span className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors"><Monitor size={15}/> 寻源工作台</span>
            <span className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors"><Send size={15}/> 发布招募需求</span>
            <span className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors"><ArrowRightLeft size={15}/> 切换新版</span>
          </div>

          <div className="h-4 w-px bg-gray-300 mx-1"></div>

          <div className="flex items-center gap-4">
            <Star size={17} className="cursor-pointer hover:text-primary transition-colors" />
            <Download size={17} className="cursor-pointer hover:text-primary transition-colors" />
            <HelpCircle size={17} className="cursor-pointer hover:text-primary transition-colors" />
            <div className="relative cursor-pointer hover:text-primary transition-colors">
              <Bell size={17} />
              <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] px-1 rounded-full scale-90">71</span>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-2 cursor-pointer hover:text-primary transition-colors">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-primary overflow-hidden border border-blue-200">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Obama" alt="avatar" className="w-full h-full object-cover" />
            </div>
            <span className="text-gray-700">奥巴马</span>
            <ChevronDown size={14} className="text-gray-400"/>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[80px] bg-sidebar flex flex-col shrink-0 text-white overflow-y-auto hide-scrollbar z-0 py-2">
          <div className="py-3 flex flex-col items-center gap-1 text-[11px] cursor-pointer hover:bg-sidebar-active/50 opacity-80 transition-colors">
            <HomeIcon size={20} />
            <span>首页</span>
          </div>
          <div className="py-3 flex flex-col items-center gap-1 text-[11px] cursor-pointer hover:bg-sidebar-active/50 opacity-80 transition-colors">
            <Shield size={20} />
            <span>权限</span>
          </div>
          <div className="py-3 flex flex-col items-center gap-1 text-[11px] cursor-pointer hover:bg-sidebar-active/50 opacity-80 transition-colors">
            <ShoppingCart size={20} />
            <span>采购</span>
          </div>
          <div className="py-3 flex flex-col items-center gap-1 text-[11px] cursor-pointer hover:bg-sidebar-active/50 opacity-80 transition-colors">
            <Users size={20} />
            <span>分供</span>
          </div>
          <div className="py-3 flex flex-col items-center gap-1 text-[11px] cursor-pointer hover:bg-sidebar-active/50 opacity-80 transition-colors">
            <ShoppingCart size={20} />
            <span>采购</span>
          </div>
          <div className="py-3 flex flex-col items-center gap-1 text-[11px] cursor-pointer bg-primary text-white relative">
            <Gavel size={20} />
            <span>招标</span>
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-white"></div>
          </div>
          <div className="py-3 flex flex-col items-center gap-1 text-[11px] cursor-pointer hover:bg-sidebar-active/50 opacity-80 transition-colors">
            <HardHat size={20} />
            <span>工程</span>
          </div>
          <div className="py-3 flex flex-col items-center gap-1 text-[11px] cursor-pointer hover:bg-sidebar-active/50 opacity-80 transition-colors">
            <Link size={20} />
            <span>联采</span>
          </div>
          <div className="py-3 flex flex-col items-center gap-1 text-[11px] cursor-pointer hover:bg-sidebar-active/50 opacity-80 transition-colors">
            <FileText size={20} />
            <span>合同</span>
          </div>
          <div className="py-3 flex flex-col items-center gap-1 text-[11px] cursor-pointer hover:bg-sidebar-active/50 opacity-80 transition-colors">
            <AlertTriangle size={20} />
            <span>投诉</span>
          </div>
          <div className="py-3 flex flex-col items-center gap-1 text-[11px] cursor-pointer hover:bg-sidebar-active/50 opacity-80 transition-colors">
            <Banknote size={20} />
            <span>清欠</span>
          </div>
          <div className="py-3 flex flex-col items-center gap-1 text-[11px] cursor-pointer hover:bg-sidebar-active/50 opacity-80 transition-colors">
            <CheckCircle size={20} />
            <span>履约</span>
          </div>
          <div className="py-3 flex flex-col items-center gap-1 text-[11px] cursor-pointer hover:bg-sidebar-active/50 opacity-80 transition-colors">
            <Inbox size={20} />
            <span>收验</span>
          </div>
          <div className="mt-auto pt-4 pb-2 flex justify-center cursor-pointer hover:bg-sidebar-active/50">
            <List size={20} className="opacity-80"/>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Breadcrumb */}
          <div className="px-6 py-3.5 text-xs text-gray-500 bg-page">
            <span className="cursor-pointer hover:text-primary">招标采购</span>
            <span className="mx-2">{'>'}</span>
            <span className="text-gray-900">招标列表</span>
          </div>

          <div className="px-6 pb-6 flex flex-col gap-4">
            {/* Search Panel */}
            <div className="bg-white p-5 rounded-sm border border-border-base shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-4 gap-x-8">
                {/* Row 1 */}
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 w-[68px] text-right shrink-0">组织机构</span>
                  <div className="flex items-center gap-3 flex-1">
                    <div className="relative flex-1 min-w-0">
                      <select className="w-full pl-3 pr-8 py-1.5 border border-border-base rounded form-select appearance-none text-gray-700 bg-white truncate">
                        <option>全部</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-2.5 top-2 text-gray-400 pointer-events-none" />
                    </div>
                    <label className="flex items-center gap-1.5 shrink-0 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer" />
                      <span className="text-gray-700 whitespace-nowrap">包含下级</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-gray-600 w-[68px] text-right shrink-0">招标编号</span>
                  <div className="flex items-center gap-3 flex-1">
                    <input type="text" placeholder="请输入" className="flex-1 min-w-0 px-3 py-1.5 border border-border-base rounded form-input placeholder-gray-300 text-gray-700" />
                    <label className="flex items-center gap-1.5 shrink-0 cursor-pointer">
                      <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer" />
                      <span className="text-gray-700 whitespace-nowrap">精确搜索</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-gray-600 w-[68px] text-right shrink-0">招标名称</span>
                  <div className="flex-1 min-w-0">
                    <input type="text" placeholder="请输入" className="w-full px-3 py-1.5 border border-border-base rounded form-input placeholder-gray-300 text-gray-700" />
                  </div>
                </div>
                
                <div className="hidden xl:block"></div>

                {/* Row 2 */}
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 w-[68px] text-right shrink-0">招标状态</span>
                  <div className="flex items-center gap-3 flex-1">
                    <div className="relative flex-1 min-w-0">
                      <select className="w-full pl-3 pr-8 py-1.5 border border-border-base rounded form-select appearance-none text-gray-700 bg-white truncate">
                        <option>全部</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-2.5 top-2 text-gray-400 pointer-events-none" />
                    </div>
                    <label className="flex items-center gap-1.5 shrink-0 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer" />
                      <span className="text-gray-700 whitespace-nowrap">包含已废标</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-gray-600 w-[68px] text-right shrink-0">招标方式</span>
                  <div className="relative flex-1 min-w-0">
                    <select className="w-full pl-3 pr-8 py-1.5 border border-border-base rounded form-select appearance-none text-gray-700 bg-white truncate">
                      <option>全部</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-gray-600 w-[68px] text-right shrink-0">合作品类</span>
                  <div className="relative flex-1 min-w-0">
                    <select className="w-full pl-3 pr-8 py-1.5 border border-border-base rounded form-select appearance-none text-gray-700 bg-white truncate">
                      <option>全部</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="hidden xl:block"></div>

                {/* Row 3 */}
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 w-[68px] text-right shrink-0">招标品类</span>
                  <div className="relative flex-1 min-w-0">
                    <select className="w-full pl-3 pr-8 py-1.5 border border-border-base rounded form-select appearance-none text-gray-700 bg-white truncate">
                      <option>全部</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-gray-600 w-[68px] text-right shrink-0">经办人</span>
                  <div className="flex items-center gap-3 flex-1">
                    <input type="text" placeholder="请输入" className="flex-1 min-w-0 px-3 py-1.5 border border-border-base rounded form-input placeholder-gray-300 text-gray-700" />
                    <label className="flex items-center gap-1.5 shrink-0 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer" />
                      <span className="text-gray-700 whitespace-nowrap">本人经办</span>
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 xl:col-start-3">
                  <button className="px-5 py-1.5 bg-primary text-white rounded hover:bg-blue-600 transition-colors">查询</button>
                  <button className="px-5 py-1.5 bg-white text-gray-700 border border-gray-300 rounded hover:text-primary hover:border-primary transition-colors">重置</button>
                  <button className="flex items-center gap-1 text-primary hover:text-blue-700">
                    展开 <ChevronDown size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* List Header */}
            <div className="flex flex-wrap items-center justify-between mt-1 gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <button className="px-4 py-1.5 bg-primary text-white rounded text-xs hover:bg-blue-600 transition-colors">开启招标</button>
                <button className="px-4 py-1.5 bg-white text-primary border border-primary rounded text-xs hover:bg-blue-50 transition-colors">从废旧物资申请发起招标</button>
                <button className="px-4 py-1.5 bg-white text-primary border border-primary rounded text-xs hover:bg-blue-50 transition-colors">废旧物资从投标方推荐发起招标</button>
                <button className="px-4 py-1.5 bg-white text-primary border border-primary rounded text-xs hover:bg-blue-50 transition-colors">导出</button>
                <button className="p-1.5 bg-white text-gray-600 border border-gray-300 rounded hover:text-primary hover:border-primary transition-colors">
                  <Settings size={15} />
                </button>
              </div>
              <div className="text-gray-500 text-xs shrink-0">
                本页: 10条 &nbsp; 总计: 1408条
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-border-base rounded-sm overflow-x-auto shadow-sm">
              <table className="w-full text-left border-collapse min-w-[1200px]">
                <thead>
                  <tr className="bg-[#f5f7fa] border-b border-border-base text-gray-800 font-medium text-xs">
                    <th className="py-3.5 px-4 font-medium w-[120px]">状态</th>
                    <th className="py-3.5 px-4 font-medium w-[160px]">招标编号</th>
                    <th className="py-3.5 px-4 font-medium min-w-[120px]">招标名称</th>
                    <th className="py-3.5 px-4 font-medium w-[200px]">组织机构</th>
                    <th className="py-3.5 px-4 font-medium w-[140px]">使用项目</th>
                    <th className="py-3.5 px-4 font-medium w-[120px]">区域</th>
                    <th className="py-3.5 px-4 font-medium w-[100px]">招标方式</th>
                    <th className="py-3.5 px-4 font-medium w-[100px]">招标品类</th>
                    <th className="py-3.5 px-4 font-medium w-[100px]">经办人</th>
                    <th className="py-3.5 px-4 font-medium w-[100px]">操作</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 text-[13px]">
                  <tr className="border-b border-border-base hover:bg-blue-50/40 transition-colors">
                    <td className="py-4 px-4 align-top">招标文件编制中</td>
                    <td className="py-4 px-4 align-top">
                      <div className="flex items-start gap-1.5">
                        <span className="bg-[#1677ff] text-white text-[10px] px-1 rounded shrink-0 mt-0.5 leading-[14px]">136</span>
                        <a href="#" className="text-primary hover:underline leading-snug break-all">
                          cscec202<br/>60416000004<br/>0546
                        </a>
                      </div>
                    </td>
                    <td className="py-4 px-4 align-top">11111</td>
                    <td className="py-4 px-4 align-top leading-snug pr-8">中建四局华南建设有限公司</td>
                    <td className="py-4 px-4 align-top">培训实操项目10</td>
                    <td className="py-4 px-4 align-top leading-snug">广东省广州市<br/>白云区</td>
                    <td className="py-4 px-4 align-top">公开招标</td>
                    <td className="py-4 px-4 align-top">物资</td>
                    <td className="py-4 px-4 align-top">奥巴马</td>
                    <td className="py-4 px-4 align-top text-primary whitespace-nowrap">
                      <a href="#" className="hover:underline mr-3">查看</a>
                      <a href="#" className="hover:underline">更多</a>
                    </td>
                  </tr>
                  
                  <tr className="border-b border-border-base hover:bg-blue-50/40 transition-colors">
                    <td className="py-4 px-4 align-top">招标文件编制中</td>
                    <td className="py-4 px-4 align-top">
                      <a href="#" className="text-primary hover:underline leading-snug break-all pl-[22px] block">
                        cscec202604<br/>16000002028<br/>4
                      </a>
                    </td>
                    <td className="py-4 px-4 align-top">私有库工程量</td>
                    <td className="py-4 px-4 align-top leading-snug pr-8">中国建筑第一工程局有限公司</td>
                    <td className="py-4 px-4 align-top">区域联采</td>
                    <td className="py-4 px-4 align-top">西南大区</td>
                    <td className="py-4 px-4 align-top">公开招标</td>
                    <td className="py-4 px-4 align-top">劳务分包</td>
                    <td className="py-4 px-4 align-top">奥巴马</td>
                    <td className="py-4 px-4 align-top text-primary whitespace-nowrap">
                      <a href="#" className="hover:underline mr-3">查看</a>
                      <a href="#" className="hover:underline">更多</a>
                    </td>
                  </tr>

                  <tr className="border-b border-border-base hover:bg-blue-50/40 transition-colors">
                    <td className="py-4 px-4 align-top">投标中</td>
                    <td className="py-4 px-4 align-top">
                      <div className="flex items-start gap-1.5">
                        <span className="bg-[#1677ff] text-white text-[10px] px-1 rounded shrink-0 mt-0.5 leading-[14px]">136</span>
                        <a href="#" className="text-primary hover:underline leading-snug break-all">
                          cscec202<br/>60416000002<br/>0159
                        </a>
                      </div>
                    </td>
                    <td className="py-4 px-4 align-top">136工程量回归</td>
                    <td className="py-4 px-4 align-top leading-snug pr-8">中建四局华南建设有限公司</td>
                    <td className="py-4 px-4 align-top">区域联采</td>
                    <td className="py-4 px-4 align-top">西南大区</td>
                    <td className="py-4 px-4 align-top">公开招标</td>
                    <td className="py-4 px-4 align-top">劳务分包</td>
                    <td className="py-4 px-4 align-top">奥巴马</td>
                    <td className="py-4 px-4 align-top text-primary whitespace-nowrap">
                      <a href="#" className="hover:underline mr-3">查看</a>
                      <a href="#" className="hover:underline">更多</a>
                    </td>
                  </tr>

                  <tr className="border-b border-border-base hover:bg-blue-50/40 transition-colors">
                    <td className="py-4 px-4 align-top">招标完成</td>
                    <td className="py-4 px-4 align-top">
                      <div className="flex items-start gap-1.5">
                        <div className="shrink-0 mt-0.5 w-[22px] flex items-center justify-between">
                          <AlertCircle size={12} className="text-[#fa8c16] fill-[#fa8c16]" color="white" />
                          <span className="bg-[#1677ff] text-white text-[10px] px-1 rounded leading-[14px]">136</span>
                        </div>
                        <a href="#" className="text-primary hover:underline leading-snug break-all">
                          cscec2<br/>02604150000<br/>000555
                        </a>
                      </div>
                    </td>
                    <td className="py-4 px-4 align-top">136回归</td>
                    <td className="py-4 px-4 align-top leading-snug pr-8">中建四局华南建设有限公司</td>
                    <td className="py-4 px-4 align-top">区域联采</td>
                    <td className="py-4 px-4 align-top">西南大区</td>
                    <td className="py-4 px-4 align-top">公开招标</td>
                    <td className="py-4 px-4 align-top">物资</td>
                    <td className="py-4 px-4 align-top">奥巴马</td>
                    <td className="py-4 px-4 align-top text-primary whitespace-nowrap">
                      <a href="#" className="hover:underline mr-3">查看</a>
                      <a href="#" className="hover:underline">更多</a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
