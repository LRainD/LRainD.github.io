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
import { Select, Table, Pagination, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
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

const relationTypeTemplates: Record<string, { name: string; riskLevel: string; metaType: string; metaData: string; equityRange: string }[]> = {
  system: [
    { name: '董监高', riskLevel: '高风险', metaType: '普通元数据', metaData: '董监高,董事长,董事会秘书,董事,股东监事,联席公司秘书,职工监事,职工代表董事,职工代表监事,监事会主席,监事,独立董事,执行董事,执行事务合伙人,副董事长,联席总裁,高级副总裁,联席董事长,代理总经理,总裁,总经理,常务副总经理,副总裁,副总经理,总会计师,理事长,执行监事,财务负责人,财务总监,负责人,经营者,经理,内审负责人', equityRange: '--' },
    { name: '股东', riskLevel: '高风险', metaType: '普通元数据', metaData: '股东,投资人,工商股东：-,工商股东,新三板股东：X%,工商股东：X%,十大股东：X%', equityRange: '--' },
    { name: '法人', riskLevel: '高风险', metaType: '普通元数据', metaData: '法定代表人', equityRange: '--' },
    { name: '机构隶属', riskLevel: '中风险', metaType: '普通元数据', metaData: '分支机构', equityRange: '--' },
    { name: '涉诉关联', riskLevel: '低风险', metaType: '普通元数据', metaData: '在X份裁判文书中为同一方', equityRange: '--' },
    { name: '联系方式相同', riskLevel: '低风险', metaType: '普通元数据', metaData: '有相同的邮箱,有相同的电话号码,有相同的地址', equityRange: '--' },
    { name: '知识产权公有', riskLevel: '低风险', metaType: '普通元数据', metaData: '共同拥有X份软件著作权,共同拥有X份专利', equityRange: '--' },
    { name: '其他', riskLevel: '低风险', metaType: '普通元数据', metaData: '其它,其他', equityRange: '--' },
  ],
  simple: [
    { name: '董监高', riskLevel: '高风险', metaType: '普通元数据', metaData: '董事,监事,高管,法定代表人,总经理,副总经理,财务负责人', equityRange: '--' },
    { name: '股东', riskLevel: '高风险', metaType: '普通元数据', metaData: '股东,投资人,工商股东,十大股东：X%', equityRange: '--' },
    { name: '法人', riskLevel: '高风险', metaType: '普通元数据', metaData: '法定代表人', equityRange: '--' },
    { name: '机构隶属', riskLevel: '中风险', metaType: '普通元数据', metaData: '分支机构,子公司', equityRange: '--' },
    { name: '涉诉关联', riskLevel: '低风险', metaType: '普通元数据', metaData: '在同一裁判文书中为同一方', equityRange: '--' },
    { name: '联系方式相同', riskLevel: '低风险', metaType: '普通元数据', metaData: '有相同的电话,有相同的邮箱', equityRange: '--' },
    { name: '知识产权公有', riskLevel: '低风险', metaType: '普通元数据', metaData: '共同拥有X份专利', equityRange: '--' },
    { name: '其他', riskLevel: '低风险', metaType: '普通元数据', metaData: '其它', equityRange: '--' },
  ],
};

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

// 模板配置视图
interface TemplateItem {
  id: string;
  name: string;
  type: '系统模板' | '自定义模板';
  status: '启用' | '禁用';
  level: string;
  createdAt: string;
}

const generateMockTemplates = (): TemplateItem[] => {
  const baseRows: TemplateItem[] = [
    { id: '1', name: '系统模板', type: '系统模板', status: '启用', level: '3层', createdAt: '2026-04-25 11:54:14' },
    { id: '2', name: '1里', type: '自定义模板', status: '禁用', level: '3层', createdAt: '2026-07-08 19:11:46' },
    { id: '3', name: '测试模板5', type: '自定义模板', status: '启用', level: '3层', createdAt: '2026-06-24 18:16:14' },
    { id: '4', name: '测试模板4', type: '自定义模板', status: '启用', level: '3层', createdAt: '2026-06-18 16:28:49' },
    { id: '5', name: '测试模板3', type: '自定义模板', status: '禁用', level: '3层', createdAt: '2026-06-18 16:25:25' },
    { id: '6', name: '测试模板2', type: '自定义模板', status: '启用', level: '3层', createdAt: '2026-06-18 16:20:48' },
    { id: '7', name: '测试模板1', type: '自定义模板', status: '启用', level: '3层', createdAt: '2026-06-18 16:13:57' },
    { id: '8', name: '测试模板', type: '自定义模板', status: '禁用', level: '3层', createdAt: '2026-06-18 16:06:18' },
    { id: '9', name: '极关链赊销模型', type: '自定义模板', status: '禁用', level: '3层', createdAt: '2026-04-28 17:31:42' },
    { id: '10', name: '115676890', type: '自定义模板', status: '禁用', level: '5层', createdAt: '2026-04-28 16:51:49' },
  ];

  const extraRows: TemplateItem[] = Array.from({ length: 27 }, (_, i) => ({
    id: `${i + 11}`,
    name: `自定义模板${i + 1}`,
    type: '自定义模板',
    status: i % 3 === 0 ? '禁用' : '启用',
    level: i % 5 === 0 ? '5层' : '3层',
    createdAt: `2026-0${6 - (i % 6)}-${10 + (i % 20)} ${10 + (i % 10)}:${(i % 60).toString().padStart(2, '0')}:${(i % 60).toString().padStart(2, '0')}`,
  }));

  return [...baseRows, ...extraRows];
};

const mockTemplates = generateMockTemplates();

const TemplateConfigView = ({ onBack }: { onBack: () => void }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [templates, setTemplates] = useState<TemplateItem[]>(mockTemplates);

  const filteredTemplates = React.useMemo(() => {
    if (!searchKeyword.trim()) return templates;
    return templates.filter((item) => item.name.toLowerCase().includes(searchKeyword.toLowerCase()));
  }, [templates, searchKeyword]);

  const pagedTemplates = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTemplates.slice(start, start + pageSize);
  }, [filteredTemplates, currentPage, pageSize]);

  const total = filteredTemplates.length;
  const startCount = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endCount = Math.min(currentPage * pageSize, total);

  const toggleStatus = (id: string) => {
    setTemplates((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: item.status === '启用' ? '禁用' : '启用' } : item
      )
    );
  };

  const handleDelete = (id: string) => {
    setTemplates((prev) => prev.filter((item) => item.id !== id));
  };

  const columns = [
    {
      title: '模板名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <span className="text-sm text-[#262626]">{name}</span>,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <span className={`text-sm ${type === '系统模板' ? 'text-[#1677FF]' : 'text-[#595959]'}`}>
          {type}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span
          className={`inline-block px-2 py-0.5 text-xs rounded ${
            status === '启用'
              ? 'bg-[#F6FFED] text-[#52C41A] border border-[#B7EB8F]'
              : 'bg-[#FFF2E8] text-[#FA541C] border border-[#FFBB96]'
          }`}
        >
          {status}
        </span>
      ),
    },
    {
      title: '检测层级',
      dataIndex: 'level',
      key: 'level',
      render: (level: string) => <span className="text-sm text-[#595959]">{level}</span>,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt: string) => <span className="text-sm text-[#595959]">{createdAt}</span>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: TemplateItem) => (
        <div className="flex items-center gap-3">
          <a className="text-sm text-[#1677FF] hover:text-[#4096FF] cursor-pointer">企业关系管理</a>
          <a className="text-sm text-[#1677FF] hover:text-[#4096FF] cursor-pointer">配置规则</a>
          {record.type === '自定义模板' && (
            <>
              <a
                className="text-sm text-[#1677FF] hover:text-[#4096FF] cursor-pointer"
                onClick={() => toggleStatus(record.id)}
              >
                {record.status === '启用' ? '禁用' : '启用'}
              </a>
              <a className="text-sm text-[#1677FF] hover:text-[#4096FF] cursor-pointer">复制模板</a>
              <a
                className="text-sm text-[#FF4D4F] hover:text-[#FF7875] cursor-pointer"
                onClick={() => handleDelete(record.id)}
              >
                删除
              </a>
            </>
          )}
          {record.type === '系统模板' && (
            <a className="text-sm text-[#1677FF] hover:text-[#4096FF] cursor-pointer">复制模板</a>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-lg p-6 min-h-[calc(100vh-220px)]">
      {/* 页面标题与统计 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-medium text-[#262626]">配置企业关系与风险等级映射关系</h1>
          <span className="text-[#8C8C8C]">|</span>
          <span className="text-sm text-[#595959]">按企业规模场景配置规则</span>
        </div>
        <div className="text-sm text-[#8C8C8C]">
          本页:{pagedTemplates.length}条&nbsp;&nbsp;总计:{total}条
        </div>
      </div>

      {/* 搜索栏 */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative w-72">
          <Input
            placeholder="请输入模板名称"
            value={searchKeyword}
            onChange={(e) => {
              setSearchKeyword(e.target.value);
              setCurrentPage(1);
            }}
            prefix={<SearchOutlined className="text-[#BFBFBF]" />}
            className="text-sm"
          />
        </div>
        <button
          className="px-4 py-1.5 text-sm bg-[#1677FF] text-white rounded hover:bg-[#4096FF] transition-colors"
          onClick={onBack}
        >
          返回
        </button>
      </div>

      {/* 表格 */}
      <Table
        columns={columns}
        dataSource={pagedTemplates}
        rowKey="id"
        pagination={false}
        className="enterprise-template-table"
      />

      {/* 分页 */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#F0F0F0]">
        <span className="text-sm text-[#595959]">
          第 {startCount}-{endCount} 条/总共 {total} 条
        </span>
        <div className="flex items-center gap-4">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={total}
            onChange={(page, size) => {
              setCurrentPage(page);
              if (size) setPageSize(size);
            }}
            showSizeChanger={false}
            simple={false}
          />
          <div className="flex items-center gap-2 text-sm text-[#595959]">
            <Select
              value={pageSize}
              onChange={(value) => {
                setPageSize(value);
                setCurrentPage(1);
              }}
              options={[
                { value: 10, label: '10条/页' },
                { value: 20, label: '20条/页' },
                { value: 50, label: '50条/页' },
              ]}
              className="w-24"
            />
            <span>跳至</span>
            <Input
              type="number"
              min={1}
              max={Math.ceil(total / pageSize)}
              className="w-14 text-center"
              onPressEnter={(e) => {
                const page = Number((e.target as HTMLInputElement).value);
                if (page >= 1 && page <= Math.ceil(total / pageSize)) {
                  setCurrentPage(page);
                }
              }}
            />
            <span>页</span>
          </div>
        </div>
      </div>
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
  const [relationTypeTab, setRelationTypeTab] = useState<'2-10' | '11-50' | '51-500'>('2-10');
  const [relationTemplate, setRelationTemplate] = useState<'system' | 'simple'>('system');
  const [viewMode, setViewMode] = useState<'config' | 'template'>('config');
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
          {viewMode === 'config' ? (
            <>
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

                  {/* 模板选择 */}
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-[#262626]">模板选择：</label>
                    <Select
                      className="w-48"
                      value={relationTemplate}
                      onChange={(value) => setRelationTemplate(value)}
                      options={[
                        { value: 'system', label: '系统模板' },
                        { value: 'simple', label: '精简模板' },
                      ]}
                    />
                    <button
                      className="px-4 py-1.5 text-sm bg-[#1677FF] text-white rounded hover:bg-[#4096FF] transition-colors"
                      onClick={() => setViewMode('template')}
                    >
                      模板配置
                    </button>
                  </div>

                  {/* 所属场景 Tab */}
                  <div className="flex border-b border-[#F0F0F0]">
                    {[
                      { key: '2-10', label: '2-10家' },
                      { key: '11-50', label: '11-50家' },
                      { key: '51-500', label: '51-500家' },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                          relationTypeTab === tab.key
                            ? 'text-[#1677FF] border-[#1677FF]'
                            : 'text-[#595959] border-transparent hover:text-[#1677FF]'
                        }`}
                        onClick={() => setRelationTypeTab(tab.key as typeof relationTypeTab)}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* 关系类型表格 */}
                  <div className="border border-[#F0F0F0] rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[#FAFAFA]">
                          <th className="px-4 py-3 text-left text-sm font-medium text-[#262626]">企业关系名称</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-[#262626]">风险等级</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-[#262626]">所属场景</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-[#262626]">元数据类型</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-[#262626]">关联元数据</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-[#262626]">股权区间</th>
                        </tr>
                      </thead>
                      <tbody>
                        {relationTypeTemplates[relationTemplate].map((row) => (
                          <tr key={row.name} className="border-t border-[#F0F0F0]">
                            <td className="px-4 py-3 text-sm text-[#595959] whitespace-nowrap">{row.name}</td>
                            <td className="px-4 py-3 text-sm whitespace-nowrap">
                              <span
                                className={`inline-block px-2 py-0.5 text-xs rounded ${
                                  row.riskLevel === '高风险'
                                    ? 'bg-[#FFF1F0] text-[#FF4D4F] border border-[#FFA39E]'
                                    : row.riskLevel === '中风险'
                                    ? 'bg-[#FFFBE6] text-[#FAAD14] border border-[#FFE58F]'
                                    : 'bg-[#F6FFED] text-[#52C41A] border border-[#B7EB8F]'
                                }`}
                              >
                                {row.riskLevel}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-[#595959] whitespace-nowrap">
                              {relationTypeTab === '2-10' ? '2-10家' : relationTypeTab === '11-50' ? '11-50家' : '51-500家'}
                            </td>
                            <td className="px-4 py-3 text-sm text-[#595959] whitespace-nowrap">{row.metaType}</td>
                            <td className="px-4 py-3 text-sm text-[#595959] leading-relaxed">{row.metaData}</td>
                            <td className="px-4 py-3 text-sm text-[#595959] whitespace-nowrap">{row.equityRange}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
            </>
          ) : (
            <TemplateConfigView onBack={() => setViewMode('config')} />
          )}
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
