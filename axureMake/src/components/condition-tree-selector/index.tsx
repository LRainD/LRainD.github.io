/**
 * @name 资格审查条件项树形选择器
 * @description 点击展开树形面板，支持搜索、分类选择和点击外部关闭
 */
import React, { useState, useRef, useEffect } from 'react';
import { Input, Tree } from 'antd';
import type { TreeDataNode } from 'antd';
import { SearchOutlined, DownOutlined } from '@ant-design/icons';
import './style.css';

export interface ConditionTreeSelectorProps {
  /** 当前选中的值 */
  value?: string;
  /** 选中变化时的回调，返回选中的文本和树节点 key */
  onChange?: (value: string, treeKey?: string) => void;
  /** 占位提示文字 */
  placeholder?: string;
  /** 自定义树形数据，不传则使用默认数据 */
  treeData?: TreeDataNode[];
  /** 下拉面板最小宽度 */
  panelMinWidth?: number;
  /** 是否向上展开面板，默认 true */
  expandUp?: boolean;
}

/** 默认资格审查条件项树形数据 */
export const defaultConditionTreeData: TreeDataNode[] = [
  {
    title: '风险信息',
    key: 'risk',
    children: [
      { title: '未在经营异常企业名单', key: 'risk-1' },
      { title: '未在严重违法失信名单', key: 'risk-2' },
      { title: '未在失信被执行人名单', key: 'risk-3' },
      { title: '未在涉诉限用名单', key: 'risk-4' },
    ],
  },
  {
    title: '基础信息',
    key: 'basic',
    children: [
      { title: '企业名称', key: 'basic-1' },
      { title: '统一社会信用代码', key: 'basic-2' },
      { title: '注册资本', key: 'basic-3' },
      { title: '成立日期', key: 'basic-4' },
      { title: '企业类型', key: 'basic-5' },
    ],
  },
  {
    title: '业绩信息',
    key: 'performance',
    children: [
      { title: '类似业绩数量', key: 'performance-1' },
      { title: '类似业绩金额', key: 'performance-2' },
    ],
  },
  {
    title: '资质证书信息',
    key: 'qualification',
    children: [
      { title: '质量管理体系认证', key: 'qualification-1' },
      { title: '环境管理体系认证', key: 'qualification-2' },
      { title: '职业健康安全管理体系认证', key: 'qualification-3' },
    ],
  },
  {
    title: '荣誉奖项信息',
    key: 'honor',
    children: [
      { title: '国家级奖项', key: 'honor-1' },
      { title: '省级奖项', key: 'honor-2' },
    ],
  },
  {
    title: '人员资质信息',
    key: 'personnel',
    children: [
      { title: '注册建造师数量', key: 'personnel-1' },
      { title: '中级以上职称人员数量', key: 'personnel-2' },
    ],
  },
  {
    title: '文件检测',
    key: 'file-detect',
    children: [
      { title: '营业执照', key: 'file-detect-1' },
      { title: '法人身份证', key: 'file-detect-2' },
      { title: '银行信用等级', key: 'file-detect-3' },
      { title: '工商企业信用等级', key: 'file-detect-4' },
      { title: '纳税信用等级', key: 'file-detect-5' },
      { title: '财务会计信用等级', key: 'file-detect-6' },
      { title: '资质证书', key: 'file-detect-7' },
      { title: '安全施工许可证', key: 'file-detect-8' },
      { title: '法人授权委托书', key: 'file-detect-9' },
      { title: '被委托人身份证', key: 'file-detect-10' },
      { title: '被委托人社保缴纳证明', key: 'file-detect-11' },
      { title: '开户许可证', key: 'file-detect-12' },
      { title: '销售许可证', key: 'file-detect-13' },
      { title: '产品生产许可证', key: 'file-detect-14' },
      { title: '代理资格证明', key: 'file-detect-15' },
      { title: '质量认证体系证书', key: 'file-detect-16' },
      { title: '职业健康安全认证体系证书', key: 'file-detect-17' },
      { title: '环境管理认证体系证书', key: 'file-detect-18' },
      { title: '技术标', key: 'file-detect-19' },
      { title: '商务标', key: 'file-detect-20' },
      { title: '自定义文件', key: 'file-detect-custom' },
    ],
  },
  {
    title: '自定义',
    key: 'custom',
  },
];

/** 查找节点标题 */
const findNodeTitle = (nodes: TreeDataNode[], key: string): string | null => {
  for (const node of nodes) {
    if (node.key === key) return node.title as string;
    if (node.children) {
      const found = findNodeTitle(node.children, key);
      if (found) return found;
    }
  }
  return null;
};

const ConditionTreeSelector: React.FC<ConditionTreeSelectorProps> = ({
  value,
  onChange,
  placeholder = '请选择',
  treeData = defaultConditionTreeData,
  panelMinWidth = 320,
  expandUp = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭面板
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedKeys([]);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        // 打开时根据当前值设置选中状态
        // 由于不知道 treeKey，这里不预设选中
        setSelectedKeys([]);
      } else {
        setSelectedKeys([]);
      }
      return next;
    });
  };

  const handleSelect = (keys: React.Key[]) => {
    setSelectedKeys(keys);
    if (keys.length > 0) {
      const selectedKey = keys[0] as string;
      const title = findNodeTitle(treeData, selectedKey);
      if (title) {
        onChange?.(title, selectedKey);
      }
      setIsOpen(false);
      setSelectedKeys([]);
    }
  };

  const positionClass = expandUp
    ? 'cts-panel-up'
    : 'cts-panel-down';

  return (
    <div className="condition-tree-selector" ref={dropdownRef}>
      <div
        className="cts-trigger"
        onClick={handleToggle}
      >
        <span className={`cts-trigger-text ${value ? '' : 'cts-placeholder'}`}>
          {value || placeholder}
        </span>
        <DownOutlined className={`cts-trigger-icon ${isOpen ? 'cts-icon-rotate' : ''}`} />
      </div>
      {isOpen && (
        <div
          className={`cts-panel ${positionClass}`}
          style={{ minWidth: panelMinWidth }}
        >
          <div className="cts-search">
            <Input
              prefix={<SearchOutlined />}
              placeholder="请输入关键字"
              size="small"
              style={{ width: '100%' }}
            />
          </div>
          <div className="cts-tree-wrap">
            <Tree
              treeData={treeData}
              selectedKeys={selectedKeys}
              onSelect={handleSelect}
              showLine={{ showLeafIcon: false }}
              showIcon={false}
              style={{ whiteSpace: 'nowrap' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ConditionTreeSelector;
