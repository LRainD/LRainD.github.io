/**
 * @name 付款条款
 * @mode axure
 *
 * 参考资料：
 * - /rules/development-guide.md
 * - /src/themes/antd-new/designToken.json
 */

import React, { useState } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  Download,
  Home,
  ShoppingCart,
  FileText,
  BarChart3,
  Users,
  Shield,
  PanelLeftClose,
  PanelLeft,
  HelpCircle,
  Plus,
  Delete,
} from 'lucide-react';
import { Radio, Select, Input, Button, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import logoImage from '../../../assets/media/集采工作台logo图标.png';
import './style.css';

// 收付款数据类型
interface PaymentItem {
  key: string;
  seq: number;
  paymentType: string;
  paymentCycle: string;
  paymentCondition: string;
  paymentRatio: string;
  remark: string;
}

// 支付方式数据类型
interface PaymentMethodItem {
  key: string;
  seq: number;
  method: string[];
  contractRatio: string;
}

const Component: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [enablePaymentCycle, setEnablePaymentCycle] = useState('yes');
  const [enablePaymentMethod, setEnablePaymentMethod] = useState('yes');
  const [supplierVisible, setSupplierVisible] = useState('no');

  const [paymentData, setPaymentData] = useState<PaymentItem[]>([
    {
      key: '1',
      seq: 1,
      paymentType: '预付款',
      paymentCycle: '月度支付',
      paymentCondition: '2',
      paymentRatio: '2.00',
      remark: '',
    },
  ]);

  const [paymentMethodData, setPaymentMethodData] = useState<PaymentMethodItem[]>([
    {
      key: '1',
      seq: 1,
      method: ['现金'],
      contractRatio: '',
    },
  ]);

  const paymentMethodOptions = [
    { value: '现金', label: '现金' },
    { value: '银行转账', label: '银行转账' },
    { value: '银行承兑汇票', label: '银行承兑汇票' },
    { value: '商业承兑汇票', label: '商业承兑汇票' },
    { value: '信用证', label: '信用证' },
    { value: '资产抵押', label: '资产抵押' },
    { value: '融资付款', label: '融资付款' },
    { value: '直接代付', label: '直接代付' },
    { value: '其他', label: '其他' },
  ];

  const handleMethodChange = (key: string, value: string[]) => {
    setPaymentMethodData((prev) =>
      prev.map((item) => (item.key === key ? { ...item, method: value } : item))
    );
  };

  // 收付款表格列
  const paymentColumns: ColumnsType<PaymentItem> = [
    {
      title: '序号',
      dataIndex: 'seq',
      key: 'seq',
      width: 60,
      align: 'center',
    },
    {
      title: (
        <span>
          <span className="required-star">*</span> 收付款类型
        </span>
      ),
      dataIndex: 'paymentType',
      key: 'paymentType',
      width: 160,
      render: (text: string) => (
        <Select
          defaultValue={text}
          style={{ width: '100%' }}
          options={[
            { value: '预付款', label: '预付款' },
            { value: '进度款', label: '进度款' },
            { value: '结算款', label: '结算款' },
            { value: '质保金', label: '质保金' },
          ]}
        />
      ),
    },
    {
      title: (
        <span>
          <span className="required-star">*</span> 收付款周期
        </span>
      ),
      dataIndex: 'paymentCycle',
      key: 'paymentCycle',
      width: 160,
      render: (text: string) => (
        <Select
          defaultValue={text}
          style={{ width: '100%' }}
          options={[
            { value: '月度支付', label: '月度支付' },
            { value: '季度支付', label: '季度支付' },
            { value: '年度支付', label: '年度支付' },
            { value: '一次性支付', label: '一次性支付' },
          ]}
        />
      ),
    },
    {
      title: (
        <span>
          <span className="required-star">*</span> 收付款条件
        </span>
      ),
      dataIndex: 'paymentCondition',
      key: 'paymentCondition',
      width: 120,
      render: (text: string) => (
        <Input defaultValue={text} style={{ width: '100%' }} />
      ),
    },
    {
      title: (
        <span>
          <span className="required-star">*</span> 收付款比例 (%)
        </span>
      ),
      dataIndex: 'paymentRatio',
      key: 'paymentRatio',
      width: 140,
      render: (text: string) => (
        <div className="ratio-input-wrapper">
          <Input defaultValue={text} style={{ width: '100%' }} />
          <span className="ratio-suffix">%</span>
        </div>
      ),
    },
    {
      title: '备注信息',
      dataIndex: 'remark',
      key: 'remark',
      render: (text: string) => (
        <Input placeholder="请输入" defaultValue={text} style={{ width: '100%' }} />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      align: 'center',
      render: () => (
        <a className="delete-link">删除</a>
      ),
    },
  ];

  // 支付方式表格列
  const paymentMethodColumns: ColumnsType<PaymentMethodItem> = [
    {
      title: '序号',
      dataIndex: 'seq',
      key: 'seq',
      width: 60,
      align: 'center',
    },
    {
      title: (
        <span>
          <span className="required-star">*</span> 合同约定收付款方式
        </span>
      ),
      dataIndex: 'method',
      key: 'method',
      render: (text: string[], record: PaymentMethodItem) => (
        <Select
          mode="multiple"
          value={text}
          style={{ width: '100%' }}
          options={paymentMethodOptions}
          onChange={(value) => handleMethodChange(record.key, value)}
          maxTagCount={0}
          maxTagPlaceholder={(omittedValues) => omittedValues.map((v) => v.value).join('/')}
        />
      ),
    },
    {
      title: (
        <span>
          <span className="required-star">*</span> 收付款方式对应合同比例 (%)
        </span>
      ),
      dataIndex: 'contractRatio',
      key: 'contractRatio',
      width: 200,
      render: (text: string) => (
        <div className="ratio-input-wrapper">
          <Input placeholder="请输入" defaultValue={text} style={{ width: '100%' }} />
          <span className="ratio-suffix">%</span>
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      align: 'center',
      render: () => (
        <a className="delete-link">删除</a>
      ),
    },
  ];

  return (
    <div className="payment-terms-page">
      {/* 顶部导航栏 */}
      <header className="top-header">
        <div className="header-left">
          <div className="logo">
            <img src={logoImage} alt="集采工作台" className="logo-img" />
          </div>
        </div>
        <div className="header-center">
          <div className="org-selector">
            <span>中国建筑股份...</span>
            <ChevronDown className="icon-small" />
          </div>
          <div className="search-box">
            <Search className="icon-small" />
            <input type="text" placeholder="支持通过关键字搜索菜单" />
          </div>
        </div>
        <div className="header-right">
          <div className="lang-selector">
            <span className="lang-flag">🇨🇳</span>
            <span>简体中文</span>
            <ChevronDown className="icon-small" />
          </div>
          <div className="nav-links">
            <span className="nav-link">云筑首页</span>
            <span className="nav-link">寻源工作台</span>
            <span className="nav-link highlight">发布招募需求</span>
            <span className="nav-link">切换新版</span>
          </div>
          <div className="header-actions">
            <div className="action-icon">
              <HelpCircle className="icon" />
            </div>
            <div className="action-icon">
              <Bell className="icon" />
              <span className="badge">99+</span>
            </div>
            <div className="user-info">
              <span className="username">admin11</span>
              <ChevronDown className="icon-small" />
            </div>
          </div>
        </div>
      </header>

      <div className="main-container">
        {/* 左侧侧边栏 */}
        <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-menu">
            <div className="menu-item">
              <Home className="menu-icon" />
              <span className="menu-text">首页</span>
              {sidebarCollapsed && <span className="menu-text-collapsed">首页</span>}
            </div>
            <div className="menu-item">
              <ShoppingCart className="menu-icon" />
              <span className="menu-text">采购管理</span>
              {sidebarCollapsed && <span className="menu-text-collapsed">采购</span>}
            </div>
            <div className="menu-item">
              <FileText className="menu-icon" />
              <span className="menu-text">合同管理</span>
              {sidebarCollapsed && <span className="menu-text-collapsed">合同</span>}
            </div>
            <div className="menu-item">
              <BarChart3 className="menu-icon" />
              <span className="menu-text">数据服务</span>
              {sidebarCollapsed && <span className="menu-text-collapsed">数据</span>}
            </div>
            <div className="menu-item">
              <Users className="menu-icon" />
              <span className="menu-text">分供商管理</span>
              {sidebarCollapsed && <span className="menu-text-collapsed">分供</span>}
            </div>
            <div className="menu-item">
              <Shield className="menu-icon" />
              <span className="menu-text">风控预警</span>
              {sidebarCollapsed && <span className="menu-text-collapsed">风控</span>}
            </div>
          </div>
          <div className="sidebar-collapse" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            {sidebarCollapsed ? <PanelLeft className="icon" /> : <PanelLeftClose className="icon" />}
            <span className="menu-text">收起菜单</span>
          </div>
        </aside>

        {/* 主内容区 */}
        <main className="main-content">
          {/* 面包屑 */}
          <div className="breadcrumb">
            <span>招标采购</span>
            <span className="breadcrumb-separator">{'>'}</span>
            <span>招标列表</span>
            <span className="breadcrumb-separator">{'>'}</span>
            <span className="current">编制招标文件</span>
          </div>

          {/* 页面标题 */}
          <div className="page-header">
            <h1 className="page-title">付款条款</h1>
          </div>

          {/* 付款条款内容 */}
          <div className="payment-terms-content">
            {/* 是否设定付款周期及比例 */}
            <div className="section-block">
              <div className="radio-row">
                <span className="required-star">*</span>
                <span className="radio-label">是否设定付款周期及比例：</span>
                <Radio.Group
                  value={enablePaymentCycle}
                  onChange={(e) => setEnablePaymentCycle(e.target.value)}
                >
                  <Radio value="yes">是</Radio>
                  <Radio value="no">否</Radio>
                </Radio.Group>
              </div>

              {enablePaymentCycle === 'yes' && (
                <div className="table-section">
                  <Table
                    columns={paymentColumns}
                    dataSource={paymentData}
                    pagination={false}
                    bordered
                    size="small"
                  />
                  <div className="add-row-btn">
                    <Button type="link" icon={<Plus size={14} />}>添加</Button>
                  </div>
                </div>
              )}
            </div>

            {/* 是否设定支付方式 */}
            <div className="section-block">
              <div className="radio-row">
                <span className="required-star">*</span>
                <span className="radio-label">是否设定支付方式：</span>
                <Radio.Group
                  value={enablePaymentMethod}
                  onChange={(e) => setEnablePaymentMethod(e.target.value)}
                >
                  <Radio value="yes">是</Radio>
                  <Radio value="no">否</Radio>
                </Radio.Group>
              </div>

              {enablePaymentMethod === 'yes' && (
                <div className="table-section">
                  <Table
                    columns={paymentMethodColumns}
                    dataSource={paymentMethodData}
                    pagination={false}
                    bordered
                    size="small"
                  />
                  <div className="add-row-btn">
                    <Button type="link" icon={<Plus size={14} />}>添加</Button>
                  </div>
                </div>
              )}
            </div>

            {/* 分供商是否可见 */}
            <div className="section-block last">
              <div className="radio-row">
                <span className="required-star">*</span>
                <span className="radio-label">分供商是否可见：</span>
                <Radio.Group
                  value={supplierVisible}
                  onChange={(e) => setSupplierVisible(e.target.value)}
                >
                  <Radio value="yes">是</Radio>
                  <Radio value="no">否</Radio>
                </Radio.Group>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Component;
