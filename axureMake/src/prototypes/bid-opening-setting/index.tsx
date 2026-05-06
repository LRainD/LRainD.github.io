/**
 * @name 开标设置
 * @mode axure
 *
 * 参考资料：
 * - /rules/development-guide.md
 * - /skills/axure-export-workflow/SKILL.md
 * - /src/themes/antd-new/designToken.json
 */

import React, { useState } from 'react';
import {
  Search, ChevronDown, Home, Monitor, Send, ArrowRightLeft, Star, Download, HelpCircle, Bell,
  Home as HomeIcon, Shield, ShoppingCart, Users, Gavel, HardHat, Link, FileText, AlertTriangle,
  Banknote, CheckCircle, Inbox, List, Settings, CheckCircle2, Circle
} from 'lucide-react';
import './style.css';

const Component = function BidOpeningSetting() {
  const [activeStep] = useState(2); // 0:约标 1:发标 2:开标 3:评标 4:定标
  const [openingExpanded, setOpeningExpanded] = useState(true);

  const steps = [
    { label: '约标', done: true },
    { label: '发标', done: true },
    { label: '开标', done: false, active: true },
    { label: '评标', done: false },
    { label: '定标', done: false },
  ];

  const subSteps = [
    { label: '开标设置', done: false, active: true },
    { label: '开标大厅', done: false },
    { label: '开标结果', done: false },
  ];

  return (
    <div className="h-screen flex flex-col bg-page text-sm overflow-hidden">
      {/* Header */}
      <header className="h-[56px] bg-white border-b border-border-base flex items-center justify-between px-4 shrink-0 shadow-sm z-10 relative">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-primary font-bold text-xl italic tracking-wide">
            <div className="w-8 h-8 rounded bg-primary text-white flex items-center justify-center transform -skew-x-12">
              <span className="transform skew-x-12 font-bold text-lg">集</span>
            </div>
            集采工作台
          </div>

          <div className="flex items-center gap-4 ml-6">
            <div className="flex items-center gap-2 border border-border-base rounded px-3 py-1.5 cursor-pointer hover:border-gray-400 transition-colors bg-white">
              <span className="text-gray-700">中国建筑股份...</span>
              <ChevronDown size={14} className="text-gray-400" />
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
              <ChevronDown size={14} className="text-gray-400" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-5 text-gray-600 text-xs">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors"><Home size={15} /> 云筑首页</span>
            <span className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors"><Monitor size={15} /> 寻源工作台</span>
            <span className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors"><Send size={15} /> 发布招募需求</span>
            <span className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors"><ArrowRightLeft size={15} /> 切换新版</span>
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
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin11" alt="avatar" className="w-full h-full object-cover" />
            </div>
            <span className="text-gray-700">admin11</span>
            <ChevronDown size={14} className="text-gray-400" />
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
            <List size={20} className="opacity-80" />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Breadcrumb */}
          <div className="px-6 py-2 text-xs text-gray-500 bg-page flex items-center gap-1">
            <span className="cursor-pointer hover:text-primary">招标采购</span>
            <span className="mx-1">{'>'}</span>
            <span className="cursor-pointer hover:text-primary">招标列表</span>
            <span className="mx-1">{'>'}</span>
            <span className="text-gray-900">开标设置</span>
          </div>

          <div className="px-6 pb-6 flex flex-col gap-4">
            {/* 招标信息卡片 */}
            <div className="bg-white rounded-sm border border-border-base shadow-sm">
              {/* 标题区 */}
              <div className="px-5 py-4 border-b border-border-base flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 bg-[#e6f7ff] text-primary text-xs rounded border border-[#bae0ff]">物资</span>
                  <span className="text-gray-900 font-medium text-sm">测试规律报价计算-li</span>
                </div>
                <div className="flex items-center gap-3">
                  <button className="px-4 py-1.5 bg-white text-gray-700 border border-gray-300 rounded text-xs hover:border-primary hover:text-primary transition-colors">
                    上一步
                  </button>
                  <button className="px-4 py-1.5 bg-primary text-white rounded text-xs hover:bg-blue-600 transition-colors">
                    下一步
                  </button>
                </div>
              </div>

              {/* 倒计时 + 信息 */}
              <div className="px-5 py-4">
                {/* 倒计时 */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-gray-600 text-xs">距投标截止还剩：</span>
                  <div className="flex items-center gap-1">
                    <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded">99</span>
                    <span className="text-gray-500 text-xs">天</span>
                    <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded">02</span>
                    <span className="text-gray-500 text-xs">:</span>
                    <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded">11</span>
                    <span className="text-gray-500 text-xs">:</span>
                    <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded">10</span>
                  </div>
                </div>

                {/* 信息网格 */}
                <div className="grid grid-cols-3 gap-y-3 gap-x-8 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 w-[70px] text-right shrink-0">招标编号：</span>
                    <span className="text-gray-900">cscec202604290000040631</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 w-[70px] text-right shrink-0">组织机构：</span>
                    <span className="text-gray-900">中国建筑股份有限公司</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 w-[70px] text-right shrink-0">招标方式：</span>
                    <span className="text-gray-900">公开招标</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 w-[70px] text-right shrink-0">项目：</span>
                    <span className="text-gray-900">测试项目76642</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 w-[70px] text-right shrink-0">品类：</span>
                    <span className="text-gray-900">物资-钢材</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 w-[70px] text-right shrink-0">经办人：</span>
                    <span className="text-gray-900">admin11</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 流程导航 */}
            <div className="bg-white rounded-sm border border-border-base shadow-sm overflow-hidden">
              <div className="flex items-center h-[48px]">
                {steps.map((step, idx) => {
                  const isActive = idx === activeStep;
                  const isDone = step.done;
                  const isLast = idx === steps.length - 1;

                  return (
                    <div
                      key={idx}
                      className={`flex-1 flex items-center justify-center gap-2 h-full relative text-xs font-medium cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-primary text-white'
                          : isDone
                          ? 'bg-[#f0f7ff] text-primary'
                          : 'bg-[#f5f5f5] text-gray-400'
                      }`}
                      style={{
                        clipPath:
                          idx === 0
                            ? 'polygon(0% 0%, calc(100% - 10px) 0%, 100% 50%, calc(100% - 10px) 100%, 0% 100%)'
                            : isLast
                            ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 10px 50%)'
                            : 'polygon(0% 0%, calc(100% - 10px) 0%, 100% 50%, calc(100% - 10px) 100%, 0% 100%, 10px 50%)',
                        marginLeft: idx > 0 ? '-6px' : '0',
                        zIndex: steps.length - idx,
                        paddingLeft: idx > 0 ? '14px' : '0',
                      }}
                    >
                      {isDone ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        <Circle size={14} className={isActive ? 'text-white' : 'text-gray-400'} />
                      )}
                      <span>{step.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* 子步骤 */}
              <div className="flex items-center justify-center gap-8 py-4 border-t border-border-base">
                {subSteps.map((sub, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <div
                      className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                        sub.active
                          ? 'border-primary bg-primary'
                          : sub.done
                          ? 'border-primary bg-white'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {sub.active && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                      {sub.done && !sub.active && <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>}
                    </div>
                    <span
                      className={`${
                        sub.active ? 'text-primary font-medium' : sub.done ? 'text-gray-700' : 'text-gray-400'
                      }`}
                    >
                      {sub.label}
                    </span>
                    {idx < subSteps.length - 1 && (
                      <div className="w-16 h-px bg-gray-300 ml-2"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 开标设置面板 */}
            <div className="bg-white rounded-sm border border-border-base shadow-sm">
              <div
                className="px-5 py-3 border-b border-border-base flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setOpeningExpanded(!openingExpanded)}
              >
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary rounded-full"></div>
                  <span className="text-gray-900 font-medium text-sm">开标设置</span>
                </div>
                <div className="flex items-center gap-3">
                  <button className="px-3 py-1 bg-white text-primary border border-primary rounded text-xs hover:bg-blue-50 transition-colors">
                    查看回标情况
                  </button>
                  <button className="px-3 py-1 bg-white text-primary border border-primary rounded text-xs hover:bg-blue-50 transition-colors flex items-center gap-1">
                    查看开标记录
                    <ChevronDown size={12} />
                  </button>
                  <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform ${openingExpanded ? 'rotate-180' : ''}`}
                  />
                </div>
              </div>

              {openingExpanded && (
                <div className="px-5 py-4">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-red-500">*</span>
                    <span className="text-gray-700">开标方式</span>
                    <span className="text-gray-500 ml-1">:</span>
                    <span className="text-gray-900 ml-2">密码+密钥</span>
                  </div>
                </div>
              )}
            </div>

            {/* 开标人设置 */}
            <div className="bg-white rounded-sm border border-border-base shadow-sm">
              <div
                className="px-5 py-3 border-b border-border-base flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary rounded-full"></div>
                  <span className="text-gray-900 font-medium text-sm">开标人设置</span>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#fafafa] border-b border-border-base text-gray-600 text-xs">
                      <th className="py-3 px-4 font-normal w-[120px]">开标人</th>
                      <th className="py-3 px-4 font-normal w-[120px]">账号</th>
                      <th className="py-3 px-4 font-normal w-[140px]">开标人电话</th>
                      <th className="py-3 px-4 font-normal">所属组织</th>
                      <th className="py-3 px-4 font-normal w-[100px]">是否已加密</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700 text-xs">
                    <tr className="border-b border-border-base hover:bg-blue-50/40 transition-colors">
                      <td className="py-3 px-4">admin11</td>
                      <td className="py-3 px-4">jcadnin</td>
                      <td className="py-3 px-4">18215655467</td>
                      <td className="py-3 px-4">中国建筑股份有限公司</td>
                      <td className="py-3 px-4">是</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Component;
