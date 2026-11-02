/**
 * @name 资审条件豁免配置
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
  Tree,
  TreeSelect
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
import {
  initialQualConditionData,
  treeData,
  purchaseCategories,
  purchaseTypes,
  biddingMethods,
  applyCategoryTreeData,
  regionTreeData
} from './mockData';
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
  const [qualConditionData, setQualConditionData] = useState(initialQualConditionData);

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

  const handleAddRow = () => {
    setQualConditionData(prev => [
      ...prev,
      {
        id: Date.now(),
        purchaseCategory: ['物资'],
        purchaseType: ['招标采购'],
        biddingMethod: ['公开招标'],
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
            { id: Date.now(), conditionItem: '', strength: '', conditionName: '', category: '', reviewMethod: '人工', mappingCode: '', forceUseType: '不强制使用(推荐)', reviewBasis: '', region: [], applyCategories: [] }
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
                            <h2 className="section-title">资格审查条件豁免场景配置</h2>
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
                          该解决方案配置对应资审项在不通过的情况下改为资审通过及对应文案展示；适用于招标、采购、集中资格预审
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
                              tableLayout="fixed"
                              columns={[
                                {
                                  title: '采购品类',
                                  dataIndex: 'purchaseCategory',
                                  key: 'purchaseCategory',
                                  width: '20%',
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
                                  width: '27%',
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
                                  width: '28%',
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
                                  title: '操作',
                                  key: 'action',
                                  width: '25%',
                                  align: 'center',
                                  render: (_: any, record: any) => (
                                    <Space size="small" wrap={false}>
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
                                    tableLayout="fixed"
                                    columns={[
                                      {
                                        title: '资格审查条件项',
                                        dataIndex: 'conditionItem',
                                        key: 'conditionItem',
                                        width: '25%',
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
                                              // 审查依据列由用户手工填写，切换条件项不清空、也不自动带出
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
                                        title: '资格审查条件名称',
                                        dataIndex: 'conditionName',
                                        key: 'conditionName',
                                        width: '19%',
                                        // 名称由「资格审查条件项」带出，只读展示，不允许手工修改
                                        render: (value: string) => (
                                          <span className="condition-name-text">{value || '-'}</span>
                                        )
                                      },
                                      {
                                        title: (
                                          <span>
                                            区域
                                            <Tooltip title="从全国开始逐级下钻到省 / 市 / 区县；不选表示全国范围均适用">
                                              <QuestionCircleOutlined style={{ marginLeft: 4, color: '#999', fontSize: 12 }} />
                                            </Tooltip>
                                          </span>
                                        ),
                                        dataIndex: 'region',
                                        key: 'region',
                                        width: '16%',
                                        render: (value: string[], record: any) => (
                                          <TreeSelect
                                            value={value || []}
                                            onChange={(val) => handleUpdateConditionItem(row.id, record.id, 'region', val)}
                                            treeData={regionTreeData}
                                            treeCheckable
                                            showCheckedStrategy={TreeSelect.SHOW_PARENT}
                                            treeDefaultExpandedKeys={['全国']}
                                            showSearch
                                            treeNodeFilterProp="title"
                                            placeholder="请选择"
                                            style={{ width: '100%' }}
                                            maxTagCount={2}
                                            allowClear
                                          />
                                        )
                                      },
                                      {
                                        title: (
                                          <span>
                                            <span style={{ color: '#ff4d4f' }}>*</span>
                                            适用合作品类
                                            <Tooltip title="必填：按一级品类 → 二级品类 → 三级品类逐级下钻选择；勾选二级品类表示其下全部三级品类均适用，不选表示全部品类均适用">
                                              <QuestionCircleOutlined style={{ marginLeft: 4, color: '#999', fontSize: 12 }} />
                                            </Tooltip>
                                          </span>
                                        ),
                                        dataIndex: 'applyCategories',
                                        key: 'applyCategories',
                                        width: '16%',
                                        render: (value: string[], record: any) => (
                                          <TreeSelect
                                            value={value || []}
                                            onChange={(val) => handleUpdateConditionItem(row.id, record.id, 'applyCategories', val)}
                                            treeData={applyCategoryTreeData}
                                            treeCheckable
                                            showCheckedStrategy={TreeSelect.SHOW_PARENT}
                                            treeDefaultExpandAll
                                            showSearch
                                            treeNodeFilterProp="title"
                                            placeholder="请选择"
                                            style={{ width: '100%' }}
                                            maxTagCount={2}
                                            allowClear
                                          />
                                        )
                                      },
                                      {
                                        title: (
                                          <span>
                                            审查依据列展示
                                            <Tooltip title="在对应资审项不通过的情况下，改为通过的情况下，展示在审查依据列的文案；内容由用户手工填写">
                                              <QuestionCircleOutlined style={{ marginLeft: 4, color: '#999', fontSize: 12 }} />
                                            </Tooltip>
                                          </span>
                                        ),
                                        dataIndex: 'reviewBasis',
                                        key: 'reviewBasis',
                                        width: '24%',
                                        // 空白文本框，允许手工填写，不随条件项带出
                                        render: (value: string, record: any) => (
                                          <Input
                                            value={value}
                                            onChange={(e) => handleUpdateConditionItem(row.id, record.id, 'reviewBasis', e.target.value)}
                                            placeholder="请输入"
                                          />
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
