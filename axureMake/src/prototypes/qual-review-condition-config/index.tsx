/**
 * @name 资格审查条件配置
 */
import React, { useState } from 'react';
import logoImage from '../../../assets/media/运营后台左上角logo.png';
import {
  Layout,
  Menu,
  Tabs,
  Card,
  Radio,
  Checkbox,
  Select,
  Input,
  Button,
  Breadcrumb,
  Tag,
  Space,
  Table,
  Switch,
  Tooltip,
  Tree
} from 'antd';
import {
  SettingOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  DownloadOutlined,
  UserOutlined,
  SearchOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ShopOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  ToolOutlined,
  SolutionOutlined,
  AuditOutlined,
  FileProtectOutlined,
  ContainerOutlined,
  WarningOutlined,
  PlusOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  QuestionCircleOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';
import ConditionTreeSelector from '../../components/condition-tree-selector';
import './style.css';

const { Sider, Content } = Layout;

const Component = function QualReviewConditionConfig() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('config');
  const [selectedGroup, setSelectedGroup] = useState('qual-review');

  // 顶部表单状态
  const [platform, setPlatform] = useState('平台abc');
  const [orgCode, setOrgCode] = useState('0001');
  const [parentOrg, setParentOrg] = useState('-');

  // 展示内容筛选
  const [displayContent, setDisplayContent] = useState('all');

  // 适用组织范围
  const [scopeType, setScopeType] = useState('current');

  // 全局开关
  const [globalEnabled, setGlobalEnabled] = useState(true);

  // 资格审查条件 - 表格数据
  const [qualConditionData, setQualConditionData] = useState([
    {
      id: 1,
      purchaseCategory: ['物资'],
      purchaseType: ['招标采购', '区域联采', '战略采购', '集中采购', '分散采购'],
      biddingMethod: ['竞价采购', '询比采购', '谈判采购', '公开招标'],
      forceUse: false,
      aiRecommend: false,
      aiOnly: false,
      postReviewEnabled: false,
      postReviewCompliance: false,
      conditionItems: [
        { id: 101, conditionItem: '自定义', strength: '强制条件', conditionName: '', category: '', reviewMethod: '人工', mappingCode: '', forceUseType: '不强制使用(推...' }
      ]
    }
  ]);

  // 左侧菜单项 - 运营后台风格
  const menuItems = [
    { key: 'supplier_mgmt', icon: <TeamOutlined />, label: '分供商管理' },
    { key: 'template_mgmt', icon: <FileTextOutlined />, label: '模板管理' },
    { key: 'procurement_plan', icon: <ShoppingCartOutlined />, label: '采购计划管理' },
    { key: 'bidding', icon: <AuditOutlined />, label: '招标采购' },
    { key: 'config_mgmt', icon: <SettingOutlined />, label: '配置管理' },
    { key: 'identity_mgmt', icon: <SafetyCertificateOutlined />, label: '身份管理' },
    {
      key: 'solution',
      icon: <SolutionOutlined />,
      label: '解决方案',
      children: [
        { key: 'param_level_config', label: '参数层级配置' },
        { key: 'product_solution_config', label: '产品解决方案配置' },
        { key: 'operation_solution_config', label: '运营解决方案配置' }
      ]
    },
    { key: 'contract_mgmt', icon: <FileProtectOutlined />, label: '合同管理' },
    { key: 'performance_mgmt', icon: <CheckCircleOutlined />, label: '履约管理' },
    { key: 'inspection', icon: <ContainerOutlined />, label: '收验货' },
    { key: 'marketing_mgmt', icon: <ShopOutlined />, label: '营销管理' },
    { key: 'operation_tools', icon: <ToolOutlined />, label: '运营工具' },
    {
      key: 'risk_warning_center',
      icon: <WarningOutlined />,
      label: '风控预警中心',
      children: [
        { key: 'field_config', label: '字段配置' },
        { key: 'rule_config', label: '规则配置' },
        { key: 'scene_mgmt', label: '场景管理' },
        { key: 'warning_config', label: '预警配置' },
        { key: 'operation_mgmt', label: '运营管理' },
        { key: 'rule_mgmt', label: '规则管理' },
        { key: 'notification_center', label: '通知中心' },
        { key: 'log_center', label: '日志中心' }
      ]
    }
  ];

  // 树形数据 - 左侧组成列表
  const treeData = [
    {
      title: '蜜蜂工作台',
      key: 'bee-workbench',
      children: []
    },
    {
      title: '运营工作台',
      key: 'operation-workbench',
      children: []
    },
    {
      title: '采购商工作台',
      key: 'buyer-workbench',
      children: [
        {
          title: '招标管理',
          key: 'bidding-mgmt',
          children: [
            { title: '招标/询价列表', key: 'bidding-list' },
            { title: '价格', key: 'price' },
            { title: '保证金管理', key: 'deposit-mgmt' },
            { title: '联采通知/邀约', key: 'joint-procurement' },
            { title: '踏勘', key: 'survey' },
            { title: '通用设置', key: 'general-settings' },
            { title: '招标清单', key: 'bidding-inventory' },
            { title: '电子招投标', key: 'e-bidding' },
            { title: '增补退出', key: 'add-exit' },
            { title: '废标管理', key: 'abandon-mgmt' },
            {
              title: '约标',
              key: 'appointment-bid',
              children: [
                { title: '资格审查附件组成', key: 'data-governance', tag: 'NEW' },
                { title: '采购基础信息-自定义分类配置', key: 'custom-classification', tag: 'NEW' },
                { title: '推送公共服务云台配置', key: 'public-service', tag: 'NEW' }
              ]
            }
          ]
        }
      ]
    }
  ];

  // 树节点标题渲染 - 支持NEW标签
  const renderTreeTitle = (node: any) => {
    return (
      <span className="tree-node-title">
        <span className="tree-node-label">{node.title}</span>
        {node.tag && (
          <span className="tree-node-tag">{node.tag}</span>
        )}
      </span>
    );
  };

  // 处理树数据，添加title渲染
  const processTreeData = (data: any[]): any[] => {
    return data.map(node => ({
      ...node,
      title: renderTreeTitle(node),
      children: node.children ? processTreeData(node.children) : undefined
    }));
  };

  const [expandedKeys, setExpandedKeys] = useState<string[]>(['buyer-workbench', 'bidding-mgmt', 'appointment-bid']);
  const [selectedTreeKeys, setSelectedTreeKeys] = useState<string[]>(['data-governance']);

  const tabItems = [
    { key: 'config', label: '方案配置' },
    { key: 'distribute', label: '配置下发' },
    { key: 'func-desc', label: '功能说明' },
    { key: 'operation-log', label: '操作日志' },
  ];

  const purchaseCategories = ['物资', '设备', '劳务分包', '专业分包', '专业服务', '租赁'];
  const purchaseTypes = ['招标采购', '区域联采', '战略采购', '集中采购', '分散采购', '电子商城采购'];
  const biddingMethods = ['公开招标', '邀请招标', '询比采购', '竞价采购', '谈判采购'];

  const conditionItemOptions = ['自定义', '未在经营异常企业名单', '未在严重违法失信名单', '具备有效营业执照', '具备相关资质证书'];
  const strengthOptions = ['强制条件', '建议条件'];
  const forceUseTypeOptions = ['不强制使用(推荐)', '强制使用'];

  const handleAddRow = () => {
    setQualConditionData(prev => [
      ...prev,
      {
        id: Date.now(),
        purchaseCategory: ['物资'],
        purchaseType: ['招标采购'],
        biddingMethod: ['公开招标'],
        forceUse: false,
        aiRecommend: false,
        aiOnly: false,
        postReviewEnabled: false,
        postReviewCompliance: false,
        conditionItems: []
      }
    ]);
  };

  const handleDeleteRow = (id: number) => {
    setQualConditionData(prev => prev.filter(item => item.id !== id));
  };

  const handleAddConditionItem = (rowId: number) => {
    setQualConditionData(prev => prev.map(item => {
      if (item.id === rowId) {
        return {
          ...item,
          conditionItems: [
            ...item.conditionItems,
            { id: Date.now(), conditionItem: '', strength: '', conditionName: '', category: '', reviewMethod: '人工', mappingCode: '', forceUseType: '不强制使用(推荐)' }
          ]
        };
      }
      return item;
    }));
  };

  const handleDeleteConditionItem = (rowId: number, conditionItemId: number) => {
    setQualConditionData(prev => prev.map(item => {
      if (item.id === rowId) {
        return {
          ...item,
          conditionItems: item.conditionItems.filter(ci => ci.id !== conditionItemId)
        };
      }
      return item;
    }));
  };

  const handleUpdateRow = (id: number, field: string, value: any) => {
    setQualConditionData(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleUpdateConditionItem = (rowId: number, conditionItemId: number, field: string, value: any) => {
    setQualConditionData(prev => prev.map(item => {
      if (item.id === rowId) {
        return {
          ...item,
          conditionItems: item.conditionItems.map(ci =>
            ci.id === conditionItemId ? { ...ci, [field]: value } : ci
          )
        };
      }
      return item;
    }));
  };

  return (
    <Layout className="solution-config-page">
      {/* 左侧边栏 */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={200}
        collapsedWidth={60}
        className="left-sidebar"
      >
        <div className="logo">
          <img src={logoImage} alt="运营后台logo" className="logo-icon" />
          {!collapsed && <span className="logo-text">集采运营后台</span>}
        </div>
        <Menu
          mode="inline"
          selectedKeys={['operation_solution_config']}
          defaultOpenKeys={['solution']}
          items={menuItems}
          className="sidebar-menu"
        />
        <div className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </div>
      </Sider>

      {/* 主内容区 */}
      <Layout className="main-layout">
        {/* 顶部导航栏 */}
        <div className="top-header">
          <div className="header-right">
            <Button type="text" icon={<DownloadOutlined />}>下载中心</Button>
            <Button type="text" icon={<UserOutlined />}>admin</Button>
          </div>
        </div>

        {/* 面包屑导航栏 */}
        <div className="breadcrumb-bar">
          <div className="breadcrumb-nav">
            <span className="breadcrumb-item">解决方案</span>
            <span className="breadcrumb-separator">&gt;</span>
            <span className="breadcrumb-item active">运营解决方案配置</span>
          </div>
        </div>

        {/* 页面主体内容 */}
        <Content className="main-content">
          <div className="content-wrapper">
            {/* 顶部信息栏 */}
            <div className="org-info-bar">
              <div className="org-search">
                <Select
                  defaultValue="平台abc"
                  className="org-select"
                  options={[
                    { label: '平台abc', value: '平台abc' },
                    { label: '平台xyz', value: '平台xyz' }
                  ]}
                  value={platform}
                  onChange={setPlatform}
                />
              </div>
              <div className="org-details">
                <span className="org-info-item">
                  <span className="org-label">机构编码：</span>
                  <span className="org-value">{orgCode}</span>
                </span>
                <span className="org-info-item">
                  <span className="org-label">上级组织：</span>
                  <span className="org-value">{parentOrg}</span>
                </span>
              </div>
            </div>

            {/* 主体内容：左右布局 */}
            <div className="main-body">
              {/* 左侧树形列表 */}
              <div className="left-panel tree-panel">
                {/* 展示内容筛选 */}
                <div className="display-filter">
                  <span className="filter-label">展示内容：</span>
                  <Radio.Group value={displayContent} onChange={(e) => setDisplayContent(e.target.value)}>
                    <Radio value="all">全部解决方案</Radio>
                    <Radio value="distributed">下发客户的解决方案</Radio>
                  </Radio.Group>
                </div>
                <div className="tree-search">
                  <Input
                    prefix={<SearchOutlined />}
                    placeholder="请输入关键字"
                    className="tree-search-input"
                  />
                </div>
                <Tree
                  className="composition-tree"
                  treeData={processTreeData(treeData)}
                  expandedKeys={expandedKeys}
                  selectedKeys={selectedTreeKeys}
                  onExpand={(keys) => setExpandedKeys(keys as string[])}
                  onSelect={(keys) => setSelectedTreeKeys(keys as string[])}
                  showLine={{ showLeafIcon: false }}
                  showIcon={false}
                  defaultExpandAll={false}
                />
              </div>

              {/* 右侧内容区 */}
              <div className="right-panel">
                <div className="right-panel-inner">
                  {/* Tab 导航 */}
                  <div className="tab-nav">
                    {tabItems.map(tab => (
                      <button
                        key={tab.key}
                        className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab 内容 */}
                  <div className="tab-content">
                    {activeTab === 'config' && (
                      <div>
                        {/* 全局开关 */}
                        <div className="section-header">
                          <div className="section-title-bar">
                            <div className="title-indicator"></div>
                            <h2 className="section-title">资格审查条件</h2>
                          </div>
                          <Switch
                            size="small"
                            checked={globalEnabled}
                            onChange={setGlobalEnabled}
                          />
                        </div>

                        {/* 参数说明 */}
                        <div className="param-desc">
                          <span className="desc-label">参数说明：</span>
                          在对应品类及采购类型条件下，可配置供应商需要满足哪些资格审查条件
                        </div>

                        {/* 适用组织范围 */}
                        <div className="scope-row">
                          <span className="scope-label">适用组织范围：</span>
                          <Radio.Group value={scopeType} onChange={(e) => setScopeType(e.target.value)}>
                            <Radio value="current">本级</Radio>
                            <Radio value="subordinate">本下级</Radio>
                          </Radio.Group>
                        </div>

                        {/* 表格区域 */}
                        {globalEnabled && (
                          <div className="table-area">
                            {/* 主表格 - 采购条件配置 */}
                            <Table
                              className="main-table"
                              dataSource={qualConditionData}
                              rowKey="id"
                              pagination={false}
                              bordered
                              columns={[
                                {
                                  title: '采购品类',
                                  dataIndex: 'purchaseCategory',
                                  key: 'purchaseCategory',
                                  render: (value: string[], record: any) => (
                                    <Select
                                      mode="multiple"
                                      value={value}
                                      onChange={(val) => handleUpdateRow(record.id, 'purchaseCategory', val)}
                                      options={purchaseCategories.map(c => ({ label: c, value: c }))}
                                      style={{ width: '100%' }}
                                      placeholder="请选择"
                                    />
                                  )
                                },
                                {
                                  title: '采购类型&组织形式',
                                  dataIndex: 'purchaseType',
                                  key: 'purchaseType',
                                  render: (value: string[], record: any) => (
                                    <Select
                                      mode="multiple"
                                      value={value}
                                      onChange={(val) => handleUpdateRow(record.id, 'purchaseType', val)}
                                      options={purchaseTypes.map(t => ({ label: t, value: t }))}
                                      style={{ width: '100%' }}
                                      placeholder="请选择"
                                    />
                                  )
                                },
                                {
                                  title: '招标方式&采购方式',
                                  dataIndex: 'biddingMethod',
                                  key: 'biddingMethod',
                                  render: (value: string[], record: any) => (
                                    <Select
                                      mode="multiple"
                                      value={value}
                                      onChange={(val) => handleUpdateRow(record.id, 'biddingMethod', val)}
                                      options={biddingMethods.map(m => ({ label: m, value: m }))}
                                      style={{ width: '100%' }}
                                      placeholder="请选择"
                                    />
                                  )
                                },
                                {
                                  title: '强制使用',
                                  dataIndex: 'forceUse',
                                  key: 'forceUse',
                                  width: 100,
                                  align: 'center',
                                  render: (value: boolean, record: any) => (
                                    <Switch
                                      size="small"
                                      checked={value}
                                      onChange={(checked) => handleUpdateRow(record.id, 'forceUse', checked)}
                                    />
                                  )
                                },
                                {
                                  title: 'AI智能推荐资审条件',
                                  dataIndex: 'aiRecommend',
                                  key: 'aiRecommend',
                                  width: 140,
                                  align: 'center',
                                  render: (value: boolean, record: any) => (
                                    <Switch
                                      size="small"
                                      checked={value}
                                      onChange={(checked) => handleUpdateRow(record.id, 'aiRecommend', checked)}
                                    />
                                  )
                                },
                                {
                                  title: '是否只使用AI智能推荐资审条件',
                                  dataIndex: 'aiOnly',
                                  key: 'aiOnly',
                                  width: 180,
                                  align: 'center',
                                  render: (value: boolean, record: any) => (
                                    <Switch
                                      size="small"
                                      checked={value}
                                      onChange={(checked) => handleUpdateRow(record.id, 'aiOnly', checked)}
                                    />
                                  )
                                },
                                {
                                  title: '资格后审是否开启资审',
                                  dataIndex: 'postReviewEnabled',
                                  key: 'postReviewEnabled',
                                  width: 150,
                                  align: 'center',
                                  render: (value: boolean, record: any) => (
                                    <Switch
                                      size="small"
                                      checked={value}
                                      onChange={(checked) => handleUpdateRow(record.id, 'postReviewEnabled', checked)}
                                    />
                                  )
                                },
                                {
                                  title: '资格后审是否开启符合性审查',
                                  dataIndex: 'postReviewCompliance',
                                  key: 'postReviewCompliance',
                                  width: 170,
                                  align: 'center',
                                  render: (value: boolean, record: any) => (
                                    <Switch
                                      size="small"
                                      checked={value}
                                      onChange={(checked) => handleUpdateRow(record.id, 'postReviewCompliance', checked)}
                                    />
                                  )
                                },
                                {
                                  title: '操作',
                                  key: 'action',
                                  width: 120,
                                  align: 'center',
                                  render: (_: any, record: any) => (
                                    <Space wrap size="small">
                                      <Button type="link" size="small" onClick={() => handleAddConditionItem(record.id)}>
                                        添加资格审查条件
                                      </Button>
                                      <Button type="link" size="small" danger onClick={() => handleDeleteRow(record.id)}>
                                        删除
                                      </Button>
                                    </Space>
                                  )
                                }
                              ]}
                            />

                            {/* 子表格 - 资格审查条件项 */}
                            {qualConditionData.map((row) => (
                              row.conditionItems.length > 0 && (
                                <div key={`sub-table-${row.id}`} className="sub-table-wrapper">
                                  <Table
                                    className="sub-table"
                                    dataSource={row.conditionItems}
                                    rowKey="id"
                                    pagination={false}
                                    bordered
                                    columns={[
                                      {
                                        title: '资格审查条件项',
                                        dataIndex: 'conditionItem',
                                        key: 'conditionItem',
                                        width: 200,
                                        align: 'left',
                                        render: (value: string, record: any) => (
                                          <ConditionTreeSelector
                                            value={value}
                                            onChange={(val, treeKey) => {
                                              handleUpdateConditionItem(row.id, record.id, 'conditionItem', val);
                                              handleUpdateConditionItem(row.id, record.id, 'treeKey', treeKey);
                                              // 自定义和自定义文件的条件名称为空，其他自动带入
                                              if (treeKey === 'custom' || treeKey === 'file-detect-custom') {
                                                handleUpdateConditionItem(row.id, record.id, 'conditionName', '');
                                              } else {
                                                handleUpdateConditionItem(row.id, record.id, 'conditionName', val);
                                              }
                                              // 根据选中节点自动设置审查方式和分类
                                              if (treeKey === 'custom') {
                                                // 自定义 → 人工
                                                handleUpdateConditionItem(row.id, record.id, 'reviewMethod', '人工');
                                              } else {
                                                // 其他全部 → 系统
                                                handleUpdateConditionItem(row.id, record.id, 'reviewMethod', '系统');
                                              }
                                              if (treeKey && treeKey.startsWith('risk')) {
                                                // 风险信息类 → 风险类
                                                handleUpdateConditionItem(row.id, record.id, 'category', '风险类');
                                              } else {
                                                // 其他全部 → 能力类
                                                handleUpdateConditionItem(row.id, record.id, 'category', '能力类');
                                              }
                                            }}
                                            placeholder="请选择"
                                            expandUp={true}
                                          />
                                        )
                                      },
                                      {
                                        title: '资格审查强度',
                                        dataIndex: 'strength',
                                        key: 'strength',
                                        render: (value: string, record: any) => (
                                          <Select
                                            value={value}
                                            onChange={(val) => handleUpdateConditionItem(row.id, record.id, 'strength', val)}
                                            options={strengthOptions.map(o => ({ label: o, value: o }))}
                                            style={{ width: '100%' }}
                                            placeholder="请选择"
                                          />
                                        )
                                      },
                                      {
                                        title: '资格审查条件名称',
                                        dataIndex: 'conditionName',
                                        key: 'conditionName',
                                        render: (value: string, record: any) => {
                                          const isFileDetect = record.treeKey && record.treeKey.startsWith('file-detect-') && record.treeKey !== 'file-detect-custom';
                                          if (isFileDetect) {
                                            return <span className="text-sm text-gray-700">{value || '-'}</span>;
                                          }
                                          return (
                                            <Input
                                              value={value}
                                              onChange={(e) => handleUpdateConditionItem(row.id, record.id, 'conditionName', e.target.value)}
                                              placeholder="请输入"
                                            />
                                          );
                                        }
                                      },
                                      {
                                        title: '资格审查条件分类',
                                        dataIndex: 'category',
                                        key: 'category',
                                        render: (value: string) => (
                                          <span className="text-sm text-gray-700">{value || '-'}</span>
                                        )
                                      },
                                      {
                                        title: '审查方式',
                                        dataIndex: 'reviewMethod',
                                        key: 'reviewMethod',
                                        render: (value: string) => (
                                          <span className="text-sm text-gray-700">{value || '-'}</span>
                                        )
                                      },
                                      {
                                        title: '映射编码',
                                        dataIndex: 'mappingCode',
                                        key: 'mappingCode',
                                        render: (value: string, record: any) => (
                                          <Input
                                            value={value}
                                            onChange={(e) => handleUpdateConditionItem(row.id, record.id, 'mappingCode', e.target.value)}
                                            placeholder="请输入"
                                          />
                                        )
                                      },
                                      {
                                        title: (
                                          <span>
                                            是否强制使用
                                            <Tooltip title="控制该资审条件在报名环节是否强制要求满足">
                                              <QuestionCircleOutlined style={{ marginLeft: 4, color: '#999', fontSize: 12 }} />
                                            </Tooltip>
                                          </span>
                                        ),
                                        dataIndex: 'forceUseType',
                                        key: 'forceUseType',
                                        width: 140,
                                        render: (value: string, record: any) => (
                                          <Select
                                            value={value}
                                            onChange={(val) => handleUpdateConditionItem(row.id, record.id, 'forceUseType', val)}
                                            options={forceUseTypeOptions.map(o => ({ label: o, value: o }))}
                                            style={{ width: '100%' }}
                                            placeholder="请选择"
                                          />
                                        )
                                      },
                                      {
                                        title: '操作',
                                        key: 'action',
                                        width: 100,
                                        align: 'center',
                                        render: (_: any, record: any) => (
                                          <Button type="link" size="small" danger onClick={() => handleDeleteConditionItem(row.id, record.id)}>
                                            删除
                                          </Button>
                                        )
                                      }
                                    ]}
                                  />
                                </div>
                              )
                            ))}

                            {/* 添加行按钮 */}
                            <div className="add-row-btn" onClick={handleAddRow}>
                              <PlusOutlined /> 添加
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'distribute' && (
                      <div className="placeholder-content">
                        <SettingOutlined className="placeholder-icon" />
                        <p>配置下发功能待实现</p>
                      </div>
                    )}

                    {activeTab === 'func-desc' && (
                      <div className="placeholder-content">
                        <InfoCircleOutlined className="placeholder-icon" />
                        <p>功能说明待补充</p>
                      </div>
                    )}

                    {activeTab === 'operation-log' && (
                      <div className="placeholder-content">
                        <ClockCircleOutlined className="placeholder-icon" />
                        <p>操作日志待实现</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 底部提交按钮 */}
            <div className="footer-actions">
              <Button type="primary" size="large">提交</Button>
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Component;
