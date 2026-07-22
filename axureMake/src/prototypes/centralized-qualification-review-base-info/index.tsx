/**
 * @name 集中资格预审 - 编制基础信息
 *
 * 高保真还原集采工作台 - 集中资格预审基础信息页
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
  Edit3,
  ChevronRight
} from 'lucide-react';
import logoImage from '../../../assets/media/集采工作台logo图标.png';
import './style.css';

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

const steps = [
  '编制基础信息',
  '编制集中资格预审公告',
  '发布集中资格预审公告',
  '报名与资审汇总',
  '资审结果通知'
];

interface FormField {
  label: string;
  required?: boolean;
  value: string;
  placeholder?: string;
  readonly?: boolean;
  colSpan?: 1 | 2 | 3 | 4;
}

const baseInfoFields: FormField[] = [
  { label: '创建人', value: '奥巴马', readonly: true },
  { label: '创建时间', value: '保存后生成', readonly: true },
  { label: '集中资格预审编号', value: '保存后生成', readonly: true },
  { label: '集中资格预审名称', value: '', placeholder: '请输入', required: true },
  { label: '集中资格预审品类', value: '', placeholder: '请选择品类', required: true },
  { label: '组织机构', value: '', placeholder: '请选择品类', required: true },
  { label: '地区', value: '', placeholder: '请选择组织机构', required: true },
  { label: '有效期', value: '', placeholder: '请选择有效期', required: true },
  { label: '集中资格预审合作品类', value: '', placeholder: '请选择品类', colSpan: 4 }
];

const Component: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isBiddingExpanded, setIsBiddingExpanded] = useState(true);
  const [baseInfoExpanded, setBaseInfoExpanded] = useState(true);
  const [extraInfoExpanded, setExtraInfoExpanded] = useState(true);
  const [remark, setRemark] = useState('');
  const [currentStep] = useState(0);

  const renderField = (field: FormField, index: number) => {
    const isSelect = field.placeholder?.startsWith('请选择');
    const colClass = field.colSpan === 4 ? 'md:col-span-2 lg:col-span-4' : '';

    return (
      <div key={index} className={`base-info-field ${colClass}`}>
        <label className="base-info-label">
          {field.required && <span className="base-info-required">*</span>}
          <span>{field.label}：</span>
        </label>
        {field.readonly ? (
          <span className="base-info-readonly">{field.value || field.placeholder}</span>
        ) : isSelect ? (
          <div className="base-info-select">
            <select className="base-info-control">
              <option value="">{field.placeholder}</option>
            </select>
            <ChevronDown size={14} className="base-info-select-icon" />
          </div>
        ) : (
          <input
            type="text"
            className="base-info-input base-info-control"
            placeholder={field.placeholder}
            defaultValue={field.value}
          />
        )}
      </div>
    );
  };

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
          <div className="px-4 py-2.5 text-xs text-gray-500 bg-page-bg shrink-0 flex items-center justify-between">
            <div>
              <span className="cursor-pointer hover:text-primary">招标采购</span>
              <span className="mx-2">{'>'}</span>
              <span className="cursor-pointer hover:text-primary">集中资格预审</span>
              <span className="mx-2">{'>'}</span>
              <span className="text-gray-900">编制基础信息</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-1.5 bg-primary text-white text-xs rounded hover:bg-primary-dark transition-colors">
                保存
              </button>
              <button className="px-4 py-1.5 bg-primary text-white text-xs rounded hover:bg-primary-dark transition-colors">
                下一步
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4">
            <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
              {/* Title Bar */}
              <div className="bg-primary text-white text-center py-2.5 text-sm font-medium">
                集中资格预审
              </div>

              {/* Steps */}
              <div className="steps-bar">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className={`step-item ${index === currentStep ? 'active' : index < currentStep ? 'finished' : ''}`}
                  >
                    <div className="step-dot-wrapper">
                      <div className="step-dot">
                        {index < currentStep ? (
                          <CheckCircle size={12} strokeWidth={3} />
                        ) : (
                          <span className="step-dot-inner" />
                        )}
                      </div>
                      {index < steps.length - 1 && <div className="step-line" />}
                    </div>
                    <span className="step-label">{step}</span>
                  </div>
                ))}
              </div>

              {/* Base Info Panel */}
              <div className="info-panel">
                <div
                  className="info-panel-header"
                  onClick={() => setBaseInfoExpanded(!baseInfoExpanded)}
                >
                  <div className="flex items-center gap-2">
                    <span className="info-panel-icon">
                      <Edit3 size={12} />
                    </span>
                    <span className="info-panel-title">基本信息</span>
                  </div>
                  {baseInfoExpanded ? (
                    <ChevronUp size={14} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={14} className="text-gray-400" />
                  )}
                </div>
                {baseInfoExpanded && (
                  <div className="info-panel-body">
                    <div className="base-info-grid">
                      {baseInfoFields.map((field, index) => renderField(field, index))}
                    </div>
                  </div>
                )}
              </div>

              {/* Extra Info Panel */}
              <div className="info-panel">
                <div
                  className="info-panel-header"
                  onClick={() => setExtraInfoExpanded(!extraInfoExpanded)}
                >
                  <div className="flex items-center gap-2">
                    <span className="info-panel-icon">
                      <Plus size={12} />
                    </span>
                    <span className="info-panel-title">附加信息</span>
                  </div>
                  {extraInfoExpanded ? (
                    <ChevronUp size={14} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={14} className="text-gray-400" />
                  )}
                </div>
                {extraInfoExpanded && (
                  <div className="info-panel-body extra-info-body">
                    <div className="remark-field">
                      <label className="base-info-label">
                        <span>备注：</span>
                      </label>
                      <div className="remark-input-wrapper">
                        <textarea
                          className="remark-textarea"
                          rows={4}
                          maxLength={500}
                          value={remark}
                          onChange={(e) => setRemark(e.target.value)}
                        />
                        <div className="remark-count">{remark.length}/500</div>
                      </div>
                    </div>
                    <div className="attachment-field">
                      <label className="base-info-label">
                        <span>附件：</span>
                      </label>
                      <div className="attachment-content">
                        <div className="attachment-tip">
                          大小限制：1024M &nbsp;&nbsp;支持格式：.jpeg .jpg .gif .png .doc .docx .docm .xls .xlsx .xlsm .txt .pdf .rar .zip .7z .tar .jar .msg .dwg .dws .dwt .dxf .csv
                        </div>
                        <button className="attachment-add-btn">
                          <Plus size={12} />
                          添加附件
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Component;
