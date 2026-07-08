/**
 * @name 企业关联-私有化合并
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  HelpCircle,
  ChevronDown,
  Search,
  ChevronUp,
  Plus,
  Trash2,
  X,
  Upload,
  Download,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { Select, InputNumber } from 'antd';
import AiWorkshopSidebar from '../../components/ai-workshop-sidebar';
import logoImage from '../../../assets/media/image.png';
import './style.css';

interface EnterpriseItem {
  id: string;
  seq: number;
  name: string;
  creditCode: string;
  loading?: boolean;
  found?: boolean;
  errorMessage?: string;
}

interface SearchSuggestion {
  name: string;
  creditCode: string;
}

interface ImportFile {
  id: string;
  name: string;
  status: '待校验' | '校验中' | '校验通过' | '校验失败';
  uploadTime: string;
}

// 生成模拟企业数据
const generateMockEnterprises = (keyword: string): SearchSuggestion[] => {
  const suffixes = ['科技有限公司', '股份有限公司', '集团有限公司', '实业有限公司', '贸易有限公司', '网络科技', '信息技术', '智能科技', '建筑工程', '物流运输'];
  const cities = ['北京', '上海', '深圳', '广州', '杭州', '苏州', '成都', '武汉', '南京', '西安'];
  
  return Array.from({ length: 10 }, (_, i) => {
    const city = cities[i % cities.length];
    const suffix = suffixes[i % suffixes.length];
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    
    return {
      name: `${city}${keyword}${suffix}${randomNum}`,
      creditCode: `${Math.floor(Math.random() * 9) + 1}${Array.from({length: 17}, () => Math.floor(Math.random() * 10)).join('')}`
    };
  });
};

// 高亮匹配文本
const HighlightText = ({ text, keyword }: { text: string; keyword: string }) => {
  if (!keyword) return <span>{text}</span>;
  
  const parts = text.split(new RegExp(`(${keyword})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) => 
        part.toLowerCase() === keyword.toLowerCase() ? (
          <span key={i} className="text-[#FF4D4F]">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

// 企业名称搜索输入组件
const EnterpriseSearchInput = ({
  value,
  onChange,
  onSelect
}: {
  value: string;
  onChange: (value: string) => void;
  onSelect: (name: string, creditCode: string) => void;
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // 点击外部关闭下拉
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 滚动时更新下拉框位置
  useEffect(() => {
    if (!showDropdown) return;
    
    const updatePosition = () => {
      // 强制重新渲染以更新位置
      setHoveredIndex(prev => prev);
    };
    
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [showDropdown]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setHoveredIndex(-1);

    // 清除之前的定时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmedValue = newValue.trim();
    
    // 不触发搜索的条件：
    // 1. 为空
    // 2. 只有一个字符
    // 3. 包含"公司"或"有限公司"
    if (!trimmedValue || 
        trimmedValue.length < 2 || 
        trimmedValue.includes('公司')) {
      setShowDropdown(false);
      setSuggestions([]);
      setLoading(false);
      return;
    }

    // 满足条件，触发搜索
    setLoading(true);
    // 0.5秒防抖
    debounceTimerRef.current = setTimeout(() => {
      const mockData = generateMockEnterprises(trimmedValue);
      setSuggestions(mockData);
      setShowDropdown(true);
      setLoading(false);
    }, 500);
  };

  const handleSelect = (suggestion: SearchSuggestion) => {
    setInputValue(suggestion.name);
    onChange(suggestion.name);
    onSelect(suggestion.name, suggestion.creditCode);
    setShowDropdown(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        ref={inputRef}
        type="text"
        className="w-full px-3 py-1.5 text-sm border border-[#D9D9D9] rounded focus:outline-none focus:border-[#1677FF] pr-8"
        placeholder="请输入企业名称"
        value={inputValue}
        onChange={handleInputChange}
      />
      <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BFBFBF]" />
      
      {/* 搜索建议下拉框 - 使用fixed定位突破表格限制 */}
      {showDropdown && (
        <div 
          className="fixed bg-white border border-[#D9D9D9] rounded shadow-lg z-[9999] max-h-[320px] overflow-hidden"
          style={{
            left: inputRef.current?.getBoundingClientRect().left,
            top: (inputRef.current?.getBoundingClientRect().bottom || 0) + 4,
            width: inputRef.current?.getBoundingClientRect().width,
          }}
        >
          {loading ? (
            <div className="px-3 py-2 text-sm text-[#8C8C8C]">搜索中...</div>
          ) : suggestions.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="min-w-[400px]">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`px-3 py-2 cursor-pointer whitespace-nowrap ${
                      hoveredIndex === index ? 'bg-[#E6F4FF]' : 'hover:bg-[#E6F4FF]'
                    }`}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(-1)}
                    onClick={() => handleSelect(suggestion)}
                  >
                    <div className="text-sm text-[#262626]">
                      <HighlightText text={suggestion.name} keyword={inputValue.trim()} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="px-3 py-2 text-sm text-[#8C8C8C]">暂无数据</div>
          )}
        </div>
      )}
    </div>
  );
};

const Component = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentStep] = useState(1);
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  const [isRelationPanelExpanded, setIsRelationPanelExpanded] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [enterpriseList, setEnterpriseList] = useState<EnterpriseItem[]>([]);
  const [relationLevel, setRelationLevel] = useState<number>(5);
  const [relationTypes, setRelationTypes] = useState<string[]>(['董监高', '法定代表人', '股东', '分支机构']);
  const [shareholderRange, setShareholderRange] = useState<{ start: number | ''; end: number | '' }>({ start: 0, end: 100 });
  const [shareholderRangeError, setShareholderRangeError] = useState('');
  const [litigationCount, setLitigationCount] = useState<number>(1);
  const [softwareCopyrightCount, setSoftwareCopyrightCount] = useState<number>(1);
  const [patentCount, setPatentCount] = useState<number>(1);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importTab, setImportTab] = useState<'manual' | 'excel'>('manual');
  const [manualEnterpriseNames, setManualEnterpriseNames] = useState('');
  const [importFiles, setImportFiles] = useState<ImportFile[]>([]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(enterpriseList.map(item => item.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const handleAddRow = () => {
    const newItem: EnterpriseItem = {
      id: Date.now().toString(),
      seq: enterpriseList.length + 1,
      name: '',
      creditCode: ''
    };
    setEnterpriseList([...enterpriseList, newItem]);
  };

  const handleDeleteRow = (id: string) => {
    const newList = enterpriseList.filter(item => item.id !== id);
    setEnterpriseList(newList.map((item, index) => ({ ...item, seq: index + 1 })));
    setSelectedRows(selectedRows.filter(rowId => rowId !== id));
  };

  const handleBatchDelete = () => {
    const newList = enterpriseList.filter(item => !selectedRows.includes(item.id));
    setEnterpriseList(newList.map((item, index) => ({ ...item, seq: index + 1 })));
    setSelectedRows([]);
  };

  const handleEnterpriseNameChange = (id: string, name: string) => {
    const newList = enterpriseList.map(enterprise =>
      enterprise.id === id ? { ...enterprise, name } : enterprise
    );
    setEnterpriseList(newList);
  };

  const handleEnterpriseSelect = (id: string, name: string, creditCode: string) => {
    const newList = enterpriseList.map(enterprise =>
      enterprise.id === id
        ? { ...enterprise, name, creditCode, found: true, errorMessage: undefined, loading: false }
        : enterprise
    );
    setEnterpriseList(newList);
  };

  const determineFoundResults = (count: number): boolean[] => {
    if (count === 1) return [true];
    if (count === 2) return Math.random() > 0.5 ? [true, false] : [false, true];
    const results = Array.from({ length: count }, () => Math.random() > 0.5);
    if (!results.includes(true)) results[0] = true;
    if (!results.includes(false)) results[1] = false;
    return results;
  };

  const handleManualSubmit = () => {
    const names = manualEnterpriseNames
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0);
    if (names.length === 0) return;

    const startSeq = enterpriseList.length + 1;
    const newItems: EnterpriseItem[] = names.map((name, index) => ({
      id: `${Date.now()}-${index}`,
      seq: startSeq + index,
      name,
      creditCode: '',
      loading: true
    }));
    const foundResults = determineFoundResults(names.length);

    setEnterpriseList([...enterpriseList, ...newItems]);
    setManualEnterpriseNames('');
    setIsImportModalOpen(false);

    newItems.forEach((item, index) => {
      setTimeout(() => {
        const isFound = foundResults[index];
        setEnterpriseList(prev =>
          prev.map(enterprise => {
            if (enterprise.id !== item.id) return enterprise;
            if (isFound) {
              return {
                ...enterprise,
                loading: false,
                found: true,
                creditCode: `${Math.floor(Math.random() * 9) + 1}${Array.from({ length: 17 }, () => Math.floor(Math.random() * 10)).join('')}`
              };
            }
            return {
              ...enterprise,
              loading: false,
              found: false,
              errorMessage: '根据企业名称未查询到相关企业'
            };
          })
        );
      }, (index + 1) * 1500);
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex">
      {/* 左侧导航栏 */}
      <AiWorkshopSidebar
        collapsed={sidebarCollapsed}
        onCollapseChange={setSidebarCollapsed}
        activeMenuKey="relation"
        logoImage={logoImage}
        notificationCount={10}
      />

      {/* 主内容区 */}
      <main className={`flex-1 ${sidebarCollapsed ? 'ml-16' : 'ml-[200px]'} transition-all duration-300`}>
        <div className="p-6">
          {/* 页面标题区域 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-medium text-[#262626]">企业关联检测</h1>
              <span className="px-3 py-1 bg-[#FFF7E6] text-[#FA8C16] text-xs rounded">配置企业关联检测基本信息</span>
            </div>
            <a href="#" className="text-sm text-[#1677FF] hover:underline">历史检测记录&gt;&gt;</a>
          </div>

          {/* 步骤条 */}
          <div className="bg-white rounded-lg border border-[#F0F0F0] mb-4">
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center">
                {/* 步骤1 */}
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === 1 ? 'bg-[#1677FF] text-white' : 'bg-[#F0F0F0] text-[#8C8C8C]'
                  }`}>
                    {currentStep > 1 ? '✓' : '1'}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${currentStep === 1 ? 'text-[#1677FF]' : 'text-[#8C8C8C]'}`}>
                    检测信息设置
                  </span>
                </div>
                {/* 连接线 */}
                <div className="w-24 h-[1px] bg-[#E8E8E8] mx-4"></div>
                {/* 步骤2 */}
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === 2 ? 'bg-[#1677FF] text-white' : 'bg-[#F0F0F0] text-[#8C8C8C]'
                  }`}>
                    2
                  </div>
                  <span className={`ml-2 text-sm font-medium ${currentStep === 2 ? 'text-[#1677FF]' : 'text-[#8C8C8C]'}`}>
                    检测结果
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 设置检测企业面板 */}
          <div className="bg-white rounded-lg border border-[#F0F0F0] overflow-hidden">
            {/* 面板头部 */}
            <div 
              className="flex items-center justify-between px-4 py-3 bg-[#FAFAFA] border-b border-[#F0F0F0] cursor-pointer"
              onClick={() => setIsPanelExpanded(!isPanelExpanded)}
            >
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-[#1677FF] rounded-sm"></div>
                <span className="text-sm font-medium text-[#262626]">设置检测企业</span>
                <span className="text-xs text-[#8C8C8C]">检测对象可选全国全量工商注册企业；工商关系包含：1. 投资关系-股东和分支机构 2. 任职关系：法定代表人和董监高</span>
              </div>
              {isPanelExpanded ? (
                <ChevronUp className="w-4 h-4 text-[#8C8C8C]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#8C8C8C]" />
              )}
            </div>

            {/* 面板内容 */}
            {isPanelExpanded && (
              <div className="p-4">
                {/* 批量导入按钮和统计 */}
                <div className="flex items-center justify-between mb-3">
                  <button
                    className="px-4 py-1.5 text-sm border border-[#D9D9D9] rounded hover:border-[#1677FF] hover:text-[#1677FF] transition-colors"
                    onClick={() => setIsImportModalOpen(true)}
                  >
                    批量导入企业
                  </button>
                  <span className="text-xs text-[#8C8C8C]">共计{enterpriseList.length}家，上限50家</span>
                </div>

                {/* 表格 */}
                <div className="border border-[#F0F0F0] rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#FAFAFA]">
                        <th className="w-12 px-3 py-3 text-center">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded border-[#D9D9D9]"
                            checked={selectedRows.length === enterpriseList.length && enterpriseList.length > 0}
                            onChange={handleSelectAll}
                          />
                        </th>
                        <th className="w-16 px-3 py-3 text-center text-sm font-medium text-[#262626]">序号</th>
                        <th className="px-3 py-3 text-left text-sm font-medium text-[#262626]">
                          <span className="text-[#FF4D4F]">*</span> 企业名称
                        </th>
                        <th className="px-3 py-3 text-left text-sm font-medium text-[#262626]">统一社会信用代码</th>
                        <th className="w-20 px-3 py-3 text-center text-sm font-medium text-[#262626]">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enterpriseList.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-3 py-8 text-center text-sm text-[#8C8C8C]">
                            暂无数据
                          </td>
                        </tr>
                      ) : (
                        enterpriseList.map((item) => (
                          <tr key={item.id} className="border-t border-[#F0F0F0]">
                            <td className="px-3 py-3 text-center">
                              <input 
                                type="checkbox" 
                                className="w-4 h-4 rounded border-[#D9D9D9]"
                                checked={selectedRows.includes(item.id)}
                                onChange={() => handleSelectRow(item.id)}
                              />
                            </td>
                            <td className="px-3 py-3 text-center text-sm text-[#595959]">{item.seq}</td>
                            <td className="px-3 py-3 relative">
                              <EnterpriseSearchInput
                                value={item.name}
                                onChange={(name) => handleEnterpriseNameChange(item.id, name)}
                                onSelect={(name, creditCode) => handleEnterpriseSelect(item.id, name, creditCode)}
                              />
                              {item.found === false && item.errorMessage && (
                                <div className="mt-1 text-xs text-[#FF4D4F]">{item.errorMessage}</div>
                              )}
                            </td>
                            <td className="px-3 py-3">
                              <div className="relative">
                                <input
                                  type="text"
                                  className={`w-full px-3 py-1.5 text-sm border rounded focus:outline-none pr-8 ${
                                    item.found === false
                                      ? 'border-[#FF4D4F] bg-[#FFF2F0]'
                                      : 'border-[#D9D9D9] focus:border-[#1677FF]'
                                  }`}
                                  placeholder=""
                                  value={item.creditCode}
                                  readOnly
                                />
                                {item.loading && (
                                  <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677FF] animate-spin" />
                                )}
                                {!item.loading && item.found === true && (
                                  <CheckCircle2 className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52C41A]" />
                                )}
                                {!item.loading && item.found !== true && (
                                  <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BFBFBF]" />
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-3 text-center">
                              <button 
                                className="text-[#FF4D4F] hover:text-[#FF7875] transition-colors"
                                onClick={() => handleDeleteRow(item.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 底部操作栏 */}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm text-[#8C8C8C]">共选中 {selectedRows.length} 条数据</span>
                  {selectedRows.length > 0 && (
                    <button 
                      className="text-sm text-[#8C8C8C] hover:text-[#FF4D4F] transition-colors"
                      onClick={handleBatchDelete}
                    >
                      批量删除
                    </button>
                  )}
                </div>

                {/* 添加按钮 */}
                <div className="flex justify-center mt-4 pt-4">
                  <button 
                    className="flex items-center justify-center gap-1 w-full py-2 text-sm text-[#595959] hover:text-[#1677FF] hover:border-[#1677FF] border border-dashed border-[#D9D9D9] rounded transition-colors"
                    onClick={handleAddRow}
                  >
                    <Plus className="w-4 h-4" />
                    添加
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 企业关联设置面板 */}
          <div className="bg-white rounded-lg border border-[#F0F0F0] mt-4">
            {/* 面板头部 */}
            <div 
              className="flex items-center justify-between px-4 py-3 bg-[#FAFAFA] border-b border-[#F0F0F0] cursor-pointer"
              onClick={() => setIsRelationPanelExpanded(!isRelationPanelExpanded)}
            >
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-[#1677FF] rounded-sm"></div>
                <span className="text-sm font-medium text-[#262626]">企业关联设置</span>
                <span className="text-xs text-[#8C8C8C]">配置企业关联检测规则参数</span>
              </div>
              {isRelationPanelExpanded ? (
                <ChevronUp className="w-4 h-4 text-[#8C8C8C]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#8C8C8C]" />
              )}
            </div>

            {/* 面板内容 */}
            {isRelationPanelExpanded && (
              <div className="p-4 space-y-8">
                {/* 关联层级 */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-[#262626] font-medium">关联层级</label>
                    <div className="relative group">
                      <HelpCircle className="w-4 h-4 text-[#BFBFBF] cursor-help" />
                      <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-[#262626] text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 w-48 leading-relaxed">
                        层级说明：<br/>
                        A-B ：1层级；<br/>
                        A-B-C：2层级；<br/>
                        A-B-C-D：3层级
                        <div className="absolute top-full left-2 border-4 border-transparent border-t-[#262626]"></div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Select
                      className="w-48"
                      value={relationLevel}
                      onChange={(value) => setRelationLevel(value)}
                      options={[
                        { value: 1, label: '1层' },
                        { value: 2, label: '2层' },
                        { value: 3, label: '3层' },
                        { value: 4, label: '4层' },
                        { value: 5, label: '5层（默认）' },
                      ]}
                    />
                  </div>
                </div>

                {/* 关系类型 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="text-sm text-[#262626] font-medium w-24">关系类型</label>
                  </div>

                  {/* 人员关系 */}
                  <div className="flex items-start gap-4">
                    <span className="text-sm text-[#8C8C8C] w-24 text-right">人员关系：</span>
                    <div className="grid grid-cols-[auto_auto_auto] gap-x-4 gap-y-2 items-start">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-[#D9D9D9]"
                          checked={relationTypes.includes('董监高')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRelationTypes([...relationTypes, '董监高']);
                            } else {
                              setRelationTypes(relationTypes.filter(t => t !== '董监高'));
                            }
                          }}
                        />
                        <span className="text-sm text-[#595959]">董监高</span>
                        <div className="relative group">
                          <HelpCircle className="w-4 h-4 text-[#BFBFBF] cursor-help" />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#262626] text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 w-80 leading-relaxed max-h-60 overflow-y-auto break-words">
                            董监高包含：董监高,董事长,董事会秘书,董事,股东监事,联席公司秘书,职工监事,职工代表董事,职工代表监事,监事会主席,监事,独立董事,执行董事,执行事务合伙人,副董事长，联席总裁,高级副总裁,联席董事长,代理总经理,总裁,总经理,常务副总经理,副总裁,副总经理，总会计师,理事长,执行监事,财务负责人,财务总监,负责人,经营者,经理,内审负责人
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#262626]"></div>
                          </div>
                        </div>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-[#D9D9D9]"
                          checked={relationTypes.includes('法定代表人')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRelationTypes([...relationTypes, '法定代表人']);
                            } else {
                              setRelationTypes(relationTypes.filter(t => t !== '法定代表人'));
                            }
                          }}
                        />
                        <span className="text-sm text-[#595959]">法定代表人</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-[#D9D9D9]"
                          checked={relationTypes.includes('股东')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRelationTypes([...relationTypes, '股东']);
                            } else {
                              setRelationTypes(relationTypes.filter(t => t !== '股东'));
                            }
                          }}
                        />
                        <span className="text-sm text-[#595959]">股东</span>
                      </label>
                      {relationTypes.includes('股东') && (
                        <div className="col-start-3 col-end-4 row-start-2 p-3 bg-[#F5F5F5] rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-[#595959]">占比</span>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              className="w-20 px-2 py-1 text-sm border border-[#D9D9D9] rounded focus:outline-none focus:border-[#1677FF]"
                              placeholder="起始值"
                              value={shareholderRange.start}
                              onChange={(e) => {
                                const val = e.target.value === '' ? '' : Number(e.target.value);
                                const newRange = { ...shareholderRange, start: val };
                                setShareholderRange(newRange);
                                if (newRange.start !== '' && newRange.end !== '' && newRange.start >= newRange.end) {
                                  setShareholderRangeError('结束值必须大于起始值');
                                } else {
                                  setShareholderRangeError('');
                                }
                              }}
                            />
                            <span className="text-sm text-[#595959]">%</span>
                            <span className="text-sm text-[#595959]">-</span>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              className="w-20 px-2 py-1 text-sm border border-[#D9D9D9] rounded focus:outline-none focus:border-[#1677FF]"
                              placeholder="结束值"
                              value={shareholderRange.end}
                              onChange={(e) => {
                                const val = e.target.value === '' ? '' : Number(e.target.value);
                                const newRange = { ...shareholderRange, end: val };
                                setShareholderRange(newRange);
                                if (newRange.start !== '' && newRange.end !== '' && newRange.start >= newRange.end) {
                                  setShareholderRangeError('结束值必须大于起始值');
                                } else {
                                  setShareholderRangeError('');
                                }
                              }}
                            />
                            <span className="text-sm text-[#595959]">%</span>
                            {shareholderRangeError && (
                              <span className="text-sm text-[#FF4D4F]">{shareholderRangeError}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 机构隶属 */}
                  <div className="flex items-start gap-4">
                    <span className="text-sm text-[#8C8C8C] w-24 text-right">机构隶属：</span>
                    <div className="flex flex-wrap items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-[#D9D9D9]"
                          checked={relationTypes.includes('分支机构')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRelationTypes([...relationTypes, '分支机构']);
                            } else {
                              setRelationTypes(relationTypes.filter(t => t !== '分支机构'));
                            }
                          }}
                        />
                        <span className="text-sm text-[#595959]">分支机构</span>
                      </label>
                    </div>
                  </div>

                  {/* 其他 */}
                  <div className="flex items-start gap-4">
                    <div className="flex items-center gap-1 w-24 justify-end">
                      <span className="text-sm text-[#8C8C8C]">其他</span>
                      <div className="relative group">
                        <span className="w-4 h-4 flex items-center justify-center text-[10px] text-[#8C8C8C] border border-[#8C8C8C] rounded-full cursor-help leading-none">!</span>
                        <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-[#262626] text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 w-80 leading-relaxed break-words">
                          注意：系统关联路径计算消耗过大，最大计算关联路径数为10，若勾选较多其他关联类型，可能由于过多的其他类型关联，可能导致影响董监高、法定代表人、股东、分支机构的关联路径的展示。
                          <div className="absolute top-full left-2 border-4 border-transparent border-t-[#262626]"></div>
                        </div>
                      </div>
                      <span className="text-sm text-[#8C8C8C]">：</span>
                    </div>
                    <div className="grid grid-cols-[auto_auto_auto_auto_auto] gap-x-4 gap-y-2 items-start">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-[#D9D9D9]"
                          checked={relationTypes.includes('相同电话号码')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRelationTypes([...relationTypes, '相同电话号码']);
                            } else {
                              setRelationTypes(relationTypes.filter(t => t !== '相同电话号码'));
                            }
                          }}
                        />
                        <span className="text-sm text-[#595959]">相同电话号码</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-[#D9D9D9]"
                          checked={relationTypes.includes('相同邮箱')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRelationTypes([...relationTypes, '相同邮箱']);
                            } else {
                              setRelationTypes(relationTypes.filter(t => t !== '相同邮箱'));
                            }
                          }}
                        />
                        <span className="text-sm text-[#595959]">相同邮箱</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-[#D9D9D9]"
                          checked={relationTypes.includes('相同地址')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRelationTypes([...relationTypes, '相同地址']);
                            } else {
                              setRelationTypes(relationTypes.filter(t => t !== '相同地址'));
                            }
                          }}
                        />
                        <span className="text-sm text-[#595959]">相同地址</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-[#D9D9D9]"
                          checked={relationTypes.includes('涉诉关联')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRelationTypes([...relationTypes, '涉诉关联']);
                            } else {
                              setRelationTypes(relationTypes.filter(t => t !== '涉诉关联'));
                            }
                          }}
                        />
                        <span className="text-sm text-[#595959]">涉诉关联</span>
                        <div className="relative group">
                          <HelpCircle className="w-4 h-4 text-[#BFBFBF] cursor-help" />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#262626] text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 w-64 leading-relaxed break-words">
                            在X份裁判文书中为同一方
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#262626]"></div>
                          </div>
                        </div>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-[#D9D9D9]"
                          checked={relationTypes.includes('知识产权公有')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRelationTypes([...relationTypes, '知识产权公有']);
                            } else {
                              setRelationTypes(relationTypes.filter(t => t !== '知识产权公有'));
                            }
                          }}
                        />
                        <span className="text-sm text-[#595959]">知识产权公有</span>
                        <div className="relative group">
                          <HelpCircle className="w-4 h-4 text-[#BFBFBF] cursor-help" />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#262626] text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 w-64 leading-relaxed break-words">
                            共同拥有X份软件著作权,共同拥有X份专利
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#262626]"></div>
                          </div>
                        </div>
                      </label>
                      {relationTypes.includes('涉诉关联') && (
                        <div className="col-start-4 col-end-5 row-start-2 p-3 bg-[#F5F5F5] rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-[#595959]">在</span>
                            <InputNumber
                              min={1}
                              className="w-16"
                              value={litigationCount}
                              onChange={(val) => setLitigationCount(val || 1)}
                            />
                            <span className="text-sm text-[#595959]">份裁判文书中为同一方</span>
                          </div>
                        </div>
                      )}
                      {relationTypes.includes('知识产权公有') && (
                        <div className="col-start-5 col-end-6 row-start-2 p-3 bg-[#F5F5F5] rounded-lg flex flex-col gap-3 w-fit">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-[#595959]">共同拥有</span>
                            <InputNumber
                              min={1}
                              className="w-16"
                              value={softwareCopyrightCount}
                              onChange={(val) => setSoftwareCopyrightCount(val || 1)}
                            />
                            <span className="text-sm text-[#595959]">份软件著作权</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-[#595959]">共同拥有</span>
                            <InputNumber
                              min={1}
                              className="w-16"
                              value={patentCount}
                              onChange={(val) => setPatentCount(val || 1)}
                            />
                            <span className="text-sm text-[#595959]">份专利</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 底部协议和按钮 */}
          <div className="mt-6 flex flex-col items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-[#D9D9D9]"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <span className="text-sm text-[#595959]">
                请确认是否阅读并同意<span className="text-[#1677FF] cursor-pointer hover:underline">《企业关联检测服务协议》</span>
              </span>
            </label>
            <button 
              className={`px-8 py-2.5 text-sm font-medium rounded transition-colors ${
                agreed && enterpriseList.length > 0
                  ? 'bg-[#1677FF] text-white hover:bg-[#4096FF]'
                  : 'bg-[#D9D9D9] text-white cursor-not-allowed'
              }`}
              disabled={!agreed || enterpriseList.length === 0}
            >
              开始检测
            </button>
          </div>
        </div>

        {/* 批量导入企业弹窗 */}
        {isImportModalOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-[720px] rounded-lg shadow-xl flex flex-col max-h-[80vh]">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F0F0]">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-[#1677FF] rounded-sm"></div>
                  <span className="text-base font-medium text-[#262626]">批量导入企业</span>
                </div>
                <button
                  className="text-[#8C8C8C] hover:text-[#595959] transition-colors"
                  onClick={() => setIsImportModalOpen(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 overflow-auto">
                {/* Tab 切换 */}
                <div className="flex mb-5 border border-[#D9D9D9] rounded overflow-hidden">
                  <button
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${
                      importTab === 'manual'
                        ? 'bg-[#1677FF] text-white'
                        : 'bg-white text-[#595959] hover:text-[#1677FF]'
                    }`}
                    onClick={() => setImportTab('manual')}
                  >
                    手动输入企业名称
                  </button>
                  <button
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${
                      importTab === 'excel'
                        ? 'bg-[#1677FF] text-white'
                        : 'bg-white text-[#595959] hover:text-[#1677FF]'
                    }`}
                    onClick={() => setImportTab('excel')}
                  >
                    导入Excel文件
                  </button>
                </div>

                {importTab === 'manual' ? (
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-1 pt-2">
                      <span className="text-sm text-[#FF4D4F]">*</span>
                      <span className="text-sm text-[#262626]">企业名称</span>
                      <div className="relative group">
                        <HelpCircle className="w-4 h-4 text-[#BFBFBF] cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#262626] text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 w-64 leading-relaxed break-words">
                          可换行批量输入企业名称，每行代表一家企业
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#262626]"></div>
                        </div>
                      </div>
                      <span className="text-sm text-[#262626]">：</span>
                    </div>
                    <textarea
                      className="flex-1 min-h-[160px] p-3 text-sm text-[#262626] border border-[#D9D9D9] rounded resize-none focus:outline-none focus:border-[#1677FF] placeholder:text-[#BFBFBF]"
                      placeholder="可换行批量输入企业名称"
                      value={manualEnterpriseNames}
                      onChange={(e) => setManualEnterpriseNames(e.target.value)}
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <button className="flex items-center gap-1.5 px-4 py-1.5 bg-[#1677FF] text-white text-sm rounded hover:bg-[#4096FF] transition-colors">
                        <Upload className="w-4 h-4" />
                        上传导入文件
                      </button>
                      <button className="flex items-center gap-1.5 px-4 py-1.5 border border-[#D9D9D9] text-[#595959] text-sm rounded hover:border-[#1677FF] hover:text-[#1677FF] transition-colors">
                        <Download className="w-4 h-4" />
                        下载导入模版
                      </button>
                    </div>

                    <div className="border border-[#F0F0F0] rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-[#FAFAFA]">
                            <th className="px-4 py-3 text-left text-sm font-medium text-[#262626]">导入文件</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-[#262626]">校验状态</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-[#262626]">上传时间</th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-[#262626]">操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {importFiles.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="py-16">
                                <div className="flex flex-col items-center justify-center text-[#BFBFBF]">
                                  <div className="w-16 h-16 mb-3 border-2 border-dashed border-[#D9D9D9] rounded-lg flex items-center justify-center">
                                    <div className="w-8 h-6 border-2 border-[#D9D9D9] rounded-sm relative">
                                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-3 border-2 border-[#D9D9D9] border-b-0 rounded-t-sm"></div>
                                    </div>
                                  </div>
                                  <span className="text-sm">暂无数据</span>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            importFiles.map((file) => (
                              <tr key={file.id} className="border-t border-[#F0F0F0]">
                                <td className="px-4 py-3 text-sm text-[#595959]">{file.name}</td>
                                <td className="px-4 py-3 text-sm text-[#595959]">{file.status}</td>
                                <td className="px-4 py-3 text-sm text-[#595959]">{file.uploadTime}</td>
                                <td className="px-4 py-3 text-right">
                                  <button
                                    className="text-sm text-[#FF4D4F] hover:text-[#FF7875] transition-colors"
                                    onClick={() => setImportFiles(importFiles.filter(f => f.id !== file.id))}
                                  >
                                    删除
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-[#F0F0F0]">
                <button
                  className="px-5 py-1.5 text-sm border border-[#D9D9D9] rounded text-[#595959] hover:border-[#1677FF] hover:text-[#1677FF] transition-colors"
                  onClick={() => setIsImportModalOpen(false)}
                >
                  取消
                </button>
                <button
                  className={`px-5 py-1.5 text-sm rounded transition-colors ${
                    (importTab === 'manual' && manualEnterpriseNames.trim().length > 0) ||
                    (importTab === 'excel' && importFiles.length > 0)
                      ? 'bg-[#1677FF] text-white hover:bg-[#4096FF]'
                      : 'bg-[#F5F5F5] text-[#BFBFBF] cursor-not-allowed'
                  }`}
                  disabled={
                    (importTab === 'manual' && manualEnterpriseNames.trim().length === 0) ||
                    (importTab === 'excel' && importFiles.length === 0)
                  }
                  onClick={() => {
                    if (importTab === 'manual') {
                      handleManualSubmit();
                    }
                  }}
                >
                  确定提交
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Component;
