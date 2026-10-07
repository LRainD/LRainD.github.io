/**
 * @name 风控规则配置页
 * @description 风控预警中心-规则管理类页面的可复用模板：左侧规则树 + 右侧规则配置面板（规则名称/开关/一键复制、规则说明、规则配置项、明细表格）。
 *
 * 使用方式：新规则页面直接渲染本组件，通常只需传入 `ruleName`、`ruleDescription`、`columns` 三项。
 */
import React, { useMemo, useState } from 'react';
import {
  Button,
  Checkbox,
  Input,
  Radio,
  Select,
  Space,
  Switch,
  Table,
  Tree
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  SearchOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import OperationAdminLayout, { type BreadcrumbItem } from '@/components/operation-admin-layout';
import './style.css';

/** 左侧规则树中的单条规则 */
export interface RiskRuleTreeRule {
  /** 规则名称 */
  title: string;
  /** 规则唯一标识 */
  key: string;
  /** 归属标签：股 / 局 / 企 */
  type?: string;
  /** 状态标签：启 / 禁 */
  status?: string;
  /** 是否展示「客」标识 */
  isGuest?: boolean;
  /** 前置图标类型 */
  iconType?: 'red' | 'green' | 'orange' | 'pink';
}

/** 左侧规则树的分组 */
export interface RiskRuleTreeGroup {
  /** 分组名称 */
  title: string;
  /** 分组唯一标识 */
  key: string;
  /** 分组下的规则列表 */
  children: RiskRuleTreeRule[];
}

/** 规则配置项默认值 */
export interface RiskRuleConfigValues {
  /** 适用组织范围：current=本级 / subordinate=本下级 */
  orgScope?: string;
  /** 下级独立配置：allow=允许 / disallow=不允许 */
  subOrgConfig?: string;
  /** 预警级别：high / medium_high / medium / low */
  warningLevel?: string;
  /** 检测场景：self=合规自查 / warning=风控预警 */
  detectScenes?: string[];
  /** 是否去重：yes=去重 / no=不去重 */
  dedupe?: string;
  /** 规则类型（纯展示文本） */
  ruleType?: string;
}

/** 明细表格公共列的可配置键 */
export type RiskRuleCommonColumnKey =
  | 'category'
  | 'type'
  | 'method'
  | 'warningType'
  | 'warningMethod'
  | 'notifyMethod'
  | 'notifyTarget';

/** 下拉选项 */
export interface RiskRuleColumnOption {
  label: string;
  value: string;
}

/** 单列覆盖配置：不传的字段沿用组件默认值 */
export interface RiskRuleCommonColumnConfig {
  /** 列标题（一般无需修改） */
  title?: React.ReactNode;
  /** 下拉选项集合 */
  options?: RiskRuleColumnOption[];
  /** 默认选中值（多选为数组，单选为字符串） */
  defaultValue?: string | string[];
  /** 是否隐藏该列 */
  hidden?: boolean;
  /** 列宽 */
  width?: number;
}

/** 按列 key 覆盖公共列配置 */
export type RiskRuleCommonColumnsConfig = Partial<Record<RiskRuleCommonColumnKey, RiskRuleCommonColumnConfig>>;

export interface RiskRuleConfigPageProps {
  /** 【主要修改项】规则名称 */
  ruleName?: string;
  /** 【主要修改项】规则说明 */
  ruleDescription?: string;
  /** 公共列覆盖配置：按列 key 覆盖选项 / 默认值 / 隐藏 / 列宽 */
  commonColumns?: RiskRuleCommonColumnsConfig;
  /** 规则特有的扩展列，追加在公共列之后（组件再自动追加「操作」列） */
  extraColumns?: ColumnsType<any>;
  /** 规则开关默认状态 */
  defaultRuleEnabled?: boolean;
  /** 规则配置项默认值 */
  config?: RiskRuleConfigValues;
  /** 表格横向滚动宽度 */
  tableScrollX?: number;
  /** 左侧规则树数据 */
  treeData?: RiskRuleTreeGroup[];
  /** 默认选中的规则 key */
  defaultSelectedRuleKey?: string;
  /** 点击「一键复制」回调 */
  onCopy?: () => void;
  /** 点击「提交」回调 */
  onSubmit?: () => void;
  /** 点击表格行「编辑」回调，未传时仅打印日志 */
  onEditRow?: (record: any) => void;
  /** 左侧菜单选中项 */
  activeMenuKey?: string;
  /** 左侧菜单默认展开项 */
  defaultOpenKeys?: string[];
  /** 面包屑数据 */
  breadcrumbItems?: BreadcrumbItem[];
  /** 机构名称（同时用于顶部提示文案） */
  platform?: string;
  /** 机构编码 */
  orgCode?: string;
  /** 上级组织 */
  parentOrg?: string;
}

/** 左侧规则树默认数据 */
export const DEFAULT_RULE_TREE: RiskRuleTreeGroup[] = [
  {
    title: '招投标',
    key: 'bidding',
    children: [
      { title: '供应商规律报价', key: 'rule_1', type: '股', status: '启', isGuest: false, iconType: 'red' },
      { title: '最少评标/评审人数', key: 'rule_2', type: '股', status: '启', isGuest: true, iconType: 'green' },
      { title: '组织最低在线评标率', key: 'rule_3', type: '局', status: '禁', isGuest: true, iconType: 'red' },
      { title: '保证金超概算金额', key: 'rule_4', type: '局', status: '禁', isGuest: true, iconType: 'orange' },
      { title: '招标-最短投标时间', key: 'bid_time_limit', type: '股', status: '禁', isGuest: true, iconType: 'pink' },
      { title: '供应商工商关联', key: 'rule_5', type: '股', status: '禁', isGuest: true, iconType: 'red' },
      { title: '最少有效报名供应商数量', key: 'rule_6', type: '股', status: '禁', isGuest: false, iconType: 'orange' },
      { title: '信息重叠', key: 'rule_7', type: '股', status: '禁', isGuest: false, iconType: 'orange' },
      { title: '股份禁止交易名单', key: 'rule_8', type: '股', status: '禁', isGuest: false, iconType: 'green' },
      { title: '招标-报名时间过短', key: 'rule_9', type: '股', status: '禁', isGuest: true, iconType: 'red' },
      { title: '组织最低集中采购率', key: 'rule_10', type: '股', status: '禁', isGuest: false, iconType: 'red' },
      { title: '组织最低公开采购率', key: 'rule_11', type: '股', status: '禁', isGuest: false, iconType: 'green' },
      { title: '资审报告上传', key: 'rule_12', type: '股', status: '禁', isGuest: true, iconType: 'orange' },
      { title: '招标公告、招标/报价文件使用范本', key: 'rule_13', type: '局', status: '禁', isGuest: true, iconType: 'green' },
      { title: '招标时长过短', key: 'rule_14', type: '局', status: '禁', isGuest: true, iconType: 'green' }
    ]
  },
  {
    title: '合同',
    key: 'contract',
    children: [
      { title: '联采执行合同单价超中标单价', key: 'c_rule_1', type: '局', status: '启', isGuest: true, iconType: 'red' },
      { title: '合同总金额超招标概算', key: 'c_rule_2', type: '局', status: '启', isGuest: false, iconType: 'red' },
      { title: '(合同) 严重失信违法企业参标', key: 'c_rule_3', type: '局', status: '启', isGuest: true, iconType: 'orange' },
      { title: '(合同) 股份禁止交易名单', key: 'c_rule_4', type: '股', status: '启', isGuest: false, iconType: 'pink' },
      { title: '(合同)保证金过高', key: 'c_rule_5', type: '局', status: '启', isGuest: true, iconType: 'orange' },
      { title: '合同金额超中标金额校验', key: 'c_rule_6', type: '局', status: '启', isGuest: true, iconType: 'red' },
      { title: '企业资质校验', key: 'c_rule_7', type: '局', status: '禁', isGuest: false, iconType: 'orange' },
      { title: '合同内容校验', key: 'c_rule_8', type: '企', status: '启', isGuest: false, iconType: 'orange' },
      { title: '合同交底校验', key: 'c_rule_9', type: '企', status: '启', isGuest: false, iconType: 'orange' },
      { title: '合同评审记录校验', key: 'c_rule_10', type: '企', status: '启', isGuest: false, iconType: 'orange' }
    ]
  },
  {
    title: '履约',
    key: 'performance',
    children: [
      { title: '履约（订单金额）超合同总金额', key: 'p_rule_1', type: '局', status: '禁', isGuest: true, iconType: 'red' },
      { title: '履约企业资质校验', key: 'p_rule_2', type: '局', status: '禁', isGuest: false, iconType: 'orange' }
    ]
  },
  {
    title: '分供商',
    key: 'supplier',
    children: [
      { title: '(供应商准入) 严重失信违法企业', key: 's_rule_1', type: '局', status: '启', isGuest: false, iconType: 'red' }
    ]
  }
];

/** 内置公共列的默认定义 */
export interface RiskRuleCommonColumnBase {
  /** 列 key，用于 `commonColumns` 按 key 覆盖 */
  key: RiskRuleCommonColumnKey;
  /** 列标题（仅文本，渲染时按 required 自动加必填星号） */
  title: string;
  /** 是否必填（标题前置红星） */
  required?: boolean;
  /** 是否多选 */
  multiple?: boolean;
  /** 列宽 */
  width: number;
  /** 下拉占位文案 */
  placeholder: string;
  /** 下拉选项集合 */
  options: RiskRuleColumnOption[];
  /** 默认选中值 */
  defaultValue: string | string[];
}

/** 明细表格内置的 7 个公共列，各规则页面通用 */
export const COMMON_COLUMNS_BASE: RiskRuleCommonColumnBase[] = [
  {
    key: 'category',
    title: '采购品类',
    required: true,
    multiple: true,
    width: 200,
    placeholder: '请选择',
    options: [
      { label: '物资', value: '物资' },
      { label: '劳务分包', value: '劳务分包' },
      { label: '专业分包', value: '专业分包' },
      { label: '专业服务', value: '专业服务' },
      { label: '租赁', value: '租赁' },
      { label: '设备', value: '设备' }
    ],
    defaultValue: ['物资', '专业分包']
  },
  {
    key: 'type',
    title: '采购类型&组织形式',
    required: true,
    multiple: true,
    width: 200,
    placeholder: '请选择',
    options: [
      { label: '招标采购', value: '招标采购' },
      { label: '区域联采', value: '区域联采' },
      { label: '战略采购', value: '战略采购' },
      { label: '集中采购', value: '集中采购' },
      { label: '分散采购', value: '分散采购' },
      { label: '电子商城采购', value: '电子商城采购' }
    ],
    defaultValue: ['招标采购', '区域联采', '战略采购', '集中采购', '分散采购']
  },
  {
    key: 'method',
    title: '招标方式&采购方式',
    required: true,
    multiple: true,
    width: 200,
    placeholder: '请选择',
    options: [
      { label: '公开招标', value: '公开招标' },
      { label: '直接采购', value: '直接采购' },
      { label: '谈判采购', value: '谈判采购' },
      { label: '竞价采购', value: '竞价采购' },
      { label: '询比采购', value: '询比采购' },
      { label: '邀请招标', value: '邀请招标' },
      { label: '询价采购', value: '询价采购' },
      { label: '竞争性谈判', value: '竞争性谈判' },
      { label: '单一来源', value: '单一来源' },
      { label: '紧急采购', value: '紧急采购' }
    ],
    defaultValue: ['公开招标', '直接采购', '谈判采购', '竞价采购', '询比采购', '邀请招标', '询价采购', '竞争性谈判', '单一来源', '紧急采购']
  },
  {
    key: 'warningType',
    title: '预警类型',
    required: true,
    width: 150,
    placeholder: '请选择',
    options: [
      { label: '预警', value: '预警' },
      { label: '拦截', value: '拦截' },
      { label: '可忽略', value: '可忽略' }
    ],
    defaultValue: '预警'
  },
  {
    key: 'warningMethod',
    title: '预警方式',
    width: 150,
    placeholder: '请选择',
    options: [
      { label: '常显+对话框', value: '常显+对话框' },
      { label: '提示框', value: '提示框' },
      { label: '拦截', value: '拦截' }
    ],
    defaultValue: '常显+对话框'
  },
  {
    key: 'notifyMethod',
    title: '通知方式',
    width: 150,
    placeholder: '请选择',
    options: [
      { label: '短信', value: '短信' },
      { label: '邮件', value: '邮件' },
      { label: '站内信', value: '站内信' },
      { label: '提示框', value: '提示框' }
    ],
    defaultValue: '短信'
  },
  {
    key: 'notifyTarget',
    title: '通知对象',
    width: 150,
    placeholder: '请选择',
    options: [
      { label: '资审经办', value: '资审经办' },
      { label: '采购经理', value: '采购经理' },
      { label: '项目经理', value: '项目经理' },
      { label: '风控专员', value: '风控专员' }
    ],
    defaultValue: '资审经办'
  }
];

/** 规则配置项默认值 */
const DEFAULT_CONFIG: Required<RiskRuleConfigValues> = {
  orgScope: 'subordinate',
  subOrgConfig: 'allow',
  warningLevel: 'medium',
  detectScenes: ['warning'],
  dedupe: 'no',
  ruleType: '管理要求'
};

/** 顶部平台入口 Tab */
const PLATFORM_TABS = ['云筑集采', '云筑商城', '云筑劳务', '云筑金服'];

/** 右侧面板 Tab */
const PANEL_TABS = ['方案配置', '配置下发', '操作日志'];

const Component = function RiskRuleConfigPage(props: RiskRuleConfigPageProps) {
  const {
    ruleName = '规则名称',
    ruleDescription = '规则说明',
    commonColumns: commonColumnsConfig,
    extraColumns,
    defaultRuleEnabled = false,
    config,
    tableScrollX = 1200,
    treeData = DEFAULT_RULE_TREE,
    defaultSelectedRuleKey,
    onCopy,
    onSubmit,
    onEditRow,
    activeMenuKey = 'risk_warning_center/rule_mgmt',
    defaultOpenKeys = ['risk_warning_center'],
    breadcrumbItems = [{ label: '风控预警中心' }, { label: '规则管理', active: true }],
    platform = '测试组织-股份公司',
    orgCode = '00010104',
    parentOrg = '平台'
  } = props;

  const [selectedRuleKey, setSelectedRuleKey] = useState(
    defaultSelectedRuleKey || treeData[0]?.children?.[0]?.key || ''
  );
  const [dataSource, setDataSource] = useState<any[]>([{ key: '1' }]);

  const mergedConfig = { ...DEFAULT_CONFIG, ...(config || {}) };

  const renderIcon = (type?: string) => {
    switch (type) {
      case 'red':
        return <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 13, marginRight: 4 }} />;
      case 'green':
        return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 13, marginRight: 4 }} />;
      case 'orange':
        return <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: 13, marginRight: 4 }} />;
      case 'pink':
        return <CheckCircleOutlined style={{ color: '#eb2f96', fontSize: 13, marginRight: 4 }} />;
      default:
        return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 13, marginRight: 4 }} />;
    }
  };

  const handleAdd = () => {
    setDataSource(prev => [...prev, { key: Date.now().toString() }]);
  };

  const handleDelete = (key: any) => {
    setDataSource(prev => prev.filter(item => item.key !== key));
  };

  // 内置公共列：按 commonColumns 覆盖选项 / 默认值 / 隐藏 / 列宽后渲染
  const commonColumns = useMemo<ColumnsType<any>>(
    () =>
      COMMON_COLUMNS_BASE.filter(col => !commonColumnsConfig?.[col.key]?.hidden).map(col => {
        const override = commonColumnsConfig?.[col.key];
        return {
          title: override?.title ?? (col.required ? <span><span style={{ color: '#ff4d4f' }}>*</span>{col.title}</span> : col.title),
          dataIndex: col.key,
          key: col.key,
          width: override?.width ?? col.width,
          render: () => (
            <Select
              mode={col.multiple ? 'multiple' : undefined}
              placeholder={col.placeholder}
              style={{ width: '100%' }}
              defaultValue={override?.defaultValue ?? col.defaultValue}
              options={override?.options ?? col.options}
            />
          )
        };
      }),
    [commonColumnsConfig]
  );

  // 公共列 + 规则特有扩展列，统一在末尾追加「操作」列
  const tableColumns = useMemo<ColumnsType<any>>(() => [
    ...commonColumns,
    ...(extraColumns || []),
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_: any, record: any) => (
        <Space>
          <a
            style={{ color: '#1677ff', fontSize: 13 }}
            onClick={() => (onEditRow ? onEditRow(record) : console.log('Edit', record.key))}
          >
            编辑
          </a>
          <a style={{ color: '#ff4d4f', fontSize: 13 }} onClick={() => handleDelete(record.key)}>
            删除
          </a>
        </Space>
      )
    }
  ], [commonColumns, extraColumns, onEditRow]);

  const treeNodes = useMemo(() => treeData.map(group => ({
    title: <span className="font-bold text-gray-800 text-sm">{group.title}</span>,
    key: group.key,
    children: (group.children || []).map(item => ({
      key: item.key,
      title: (
        <div className="flex items-center text-xs py-0.5" style={{ lineHeight: '20px' }}>
          <span
            className="px-1 mr-1 rounded"
            style={{
              fontSize: 10,
              backgroundColor: item.type === '股' ? '#fff0f6' : item.type === '局' ? '#fff7e6' : '#feffe6',
              color: item.type === '股' ? '#eb2f96' : item.type === '局' ? '#fa8c16' : '#a0d911',
              border: `1px solid ${item.type === '股' ? '#ffadd2' : item.type === '局' ? '#ffd591' : '#eaff8f'}`
            }}
          >
            {item.type}
          </span>
          <span
            className="px-1 mr-1 rounded"
            style={{
              fontSize: 10,
              backgroundColor: item.status === '启' ? '#f6ffed' : '#fff1f0',
              color: item.status === '启' ? '#52c41a' : '#ff4d4f',
              border: `1px solid ${item.status === '启' ? '#b7eb8f' : '#ffa39e'}`
            }}
          >
            {item.status}
          </span>
          {renderIcon(item.iconType)}
          <span className="truncate flex-1 text-gray-700">{item.title}</span>
          {item.isGuest && (
            <span className="ml-1 px-1 text-blue-500 bg-blue-50 rounded" style={{ fontSize: 10 }}>
              客
            </span>
          )}
        </div>
      )
    }))
  })), [treeData]);

  return (
    <OperationAdminLayout
      activeMenuKey={activeMenuKey}
      defaultOpenKeys={defaultOpenKeys}
      breadcrumbItems={breadcrumbItems}
      platform={platform}
      orgCode={orgCode}
      parentOrg={parentOrg}
    >
      <div className="rule-config-container bg-white" style={{ minHeight: 'calc(100vh - 120px)' }}>
        {/* 顶部线型导航与 Tab */}
        <div className="mb-4 p-4 pb-0">
          <div className="flex gap-2">
            {PLATFORM_TABS.map((name, i) => (
              <div
                key={i}
                className={`px-6 py-2 text-sm cursor-pointer border border-b-0 ${
                  i === 0
                    ? 'text-blue-600 bg-white border-gray-200 relative -mb-[1px] border-t-2 border-t-blue-500'
                    : 'text-gray-600 bg-gray-50 border-gray-200 border-l-0'
                }`}
              >
                {name}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 items-stretch">
          {/* 左侧规则树：外层仅负责与右侧等高，内部绝对定位，展开树不会撑高页面 */}
          <div className="relative w-80 flex-shrink-0 self-stretch" style={{ minWidth: 280, minHeight: 'calc(100vh - 160px)' }}>
            <div className="absolute inset-0 border border-gray-200 rounded p-2 bg-white flex flex-col overflow-hidden">
              <Input
                prefix={<SearchOutlined style={{ color: '#ccc' }} />}
                placeholder="输入规则名称"
                className="mb-2"
              />
              <div className="flex-1 overflow-y-auto pr-1">
                <Tree
                  defaultExpandAll
                  selectedKeys={[selectedRuleKey]}
                  onSelect={(keys) => keys.length && setSelectedRuleKey(keys[0] as string)}
                  treeData={treeNodes}
                />
              </div>
            </div>
          </div>

          {/* 右侧内容 */}
          <div className="flex-1 border border-gray-200 rounded p-6 bg-white overflow-hidden">
            <div className="flex gap-8 mb-6 border-b border-gray-200 pb-0">
              {PANEL_TABS.map((t, i) => (
                <div
                  key={i}
                  className={`pb-3 text-sm cursor-pointer ${
                    i === 0
                      ? 'text-blue-600 font-bold border-b-2 border-blue-500 -mb-[1px]'
                      : 'text-gray-700 hover:text-blue-500'
                  }`}
                >
                  {t}
                </div>
              ))}
            </div>

            <div
              className="mb-6 p-3 px-4 text-xs flex items-center gap-2 rounded-sm"
              style={{ backgroundColor: '#fff7e6', border: '1px solid #ffe58f', color: '#d46b08' }}
            >
              <ExclamationCircleOutlined style={{ color: '#fa8c16', fontSize: 14 }} />
              <span>
                该风控规则以本组织 <span className="font-bold">{platform}</span> 配置为准，您可以根据组织要求修改配置
              </span>
            </div>

            {/* 规则名称 + 开关 + 一键复制 */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-gray-900">{ruleName}</h2>
                <Switch
                  checkedChildren="开"
                  unCheckedChildren="关"
                  defaultChecked={defaultRuleEnabled}
                />
              </div>
              <Button
                type="primary"
                className="bg-blue-600 hover:bg-blue-500 flex items-center gap-1 text-xs h-8 px-4"
                onClick={onCopy}
              >
                一键复制 <QuestionCircleOutlined />
              </Button>
            </div>

            {/* 规则说明 */}
            <div className="text-xs text-gray-500 mb-4">规则说明：{ruleDescription}</div>

            {/* 规则配置项 */}
            <div className="space-y-3 text-xs mb-6">
              <div className="flex items-center">
                <span className="text-red-500 mr-1">*</span>
                <span className="w-24 text-gray-600">适用组织范围：</span>
                <Radio.Group defaultValue={mergedConfig.orgScope} size="small">
                  <Radio value="current"><span className="text-xs">本级</span></Radio>
                  <Radio value="subordinate"><span className="text-xs">本下级</span></Radio>
                </Radio.Group>
              </div>
              <div className="flex items-center">
                <span className="text-red-500 mr-1">*</span>
                <span className="w-24 text-gray-600">下级独立配置：</span>
                <Radio.Group defaultValue={mergedConfig.subOrgConfig} size="small">
                  <Radio value="allow"><span className="text-xs">允许</span></Radio>
                  <Radio value="disallow"><span className="text-xs">不允许</span></Radio>
                </Radio.Group>
              </div>
              <div className="flex items-center">
                <span className="text-red-500 mr-1">*</span>
                <span className="w-24 text-gray-600">预警级别：</span>
                <Radio.Group defaultValue={mergedConfig.warningLevel} size="small">
                  <Radio value="high"><span className="text-xs">高风险</span></Radio>
                  <Radio value="medium_high"><span className="text-xs">中高风险</span></Radio>
                  <Radio value="medium"><span className="text-xs">中风险</span></Radio>
                  <Radio value="low"><span className="text-xs">低风险</span></Radio>
                </Radio.Group>
              </div>
              <div className="flex items-center">
                <span className="text-red-500 mr-1">*</span>
                <span className="w-24 text-gray-600">检测场景：</span>
                <Checkbox.Group defaultValue={mergedConfig.detectScenes}>
                  <Checkbox value="self"><span className="text-xs">合规自查</span></Checkbox>
                  <Checkbox value="warning"><span className="text-xs">风控预警</span></Checkbox>
                </Checkbox.Group>
              </div>
              <div className="flex items-center">
                <span className="text-red-500 mr-1">*</span>
                <span className="w-24 text-gray-600">是否去重：</span>
                <Radio.Group defaultValue={mergedConfig.dedupe} size="small">
                  <Radio value="yes"><span className="text-xs">去重</span></Radio>
                  <Radio value="no"><span className="text-xs">不去重</span></Radio>
                </Radio.Group>
              </div>
              <div className="flex items-center">
                <span className="w-24 text-gray-600 ml-2">规则类型：</span>
                <span className="text-gray-800">{mergedConfig.ruleType}</span>
              </div>
            </div>

            {/* 明细表格 */}
            <Table
              columns={tableColumns}
              dataSource={dataSource}
              pagination={false}
              bordered
              size="small"
              className="mb-4"
              scroll={{ x: tableScrollX }}
            />

            <div className="flex justify-center mb-6">
              <Button type="dashed" icon={<PlusOutlined />} size="small" style={{ width: 120 }} onClick={handleAdd}>
                添加一项
              </Button>
            </div>

            <div className="flex justify-center">
              <Button type="primary" className="bg-blue-500" style={{ width: 80 }} onClick={onSubmit}>
                提交
              </Button>
            </div>
          </div>
        </div>
      </div>
    </OperationAdminLayout>
  );
};

export default Component;
