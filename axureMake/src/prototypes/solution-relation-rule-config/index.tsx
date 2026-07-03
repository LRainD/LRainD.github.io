/**
 * @name 运营解决方案配置-工商关联规则
 */
import React, { useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Input, Radio, Switch, Tree } from 'antd';
import OperationAdminLayout from '../../components/operation-admin-layout';
import './style.css';

// 树形数据 - 左侧组成列表
const treeData = [
  {
    title: '蜜蜂工作台',
    key: 'bee-workbench'
  },
  {
    title: '采购商工作台',
    key: 'buyer-workbench',
    children: [
      { title: '收验货管理', key: 'receipt-mgmt' },
      { title: '驻场（废弃）', key: 'site-deprecated' },
      { title: '投诉管理', key: 'complaint-mgmt' },
      { title: '项目权限管理', key: 'project-permission' },
      { title: '文档模板中心', key: 'doc-template' },
      { title: '采购计划管理', key: 'procurement-plan' },
      { title: '合同管理', key: 'contract-mgmt' },
      { title: '履约管理', key: 'performance-mgmt' },
      {
        title: '招标管理',
        key: 'bidding-mgmt',
        children: [
          { title: '招标/询价列表', key: 'bidding-list' },
          { title: '价格', key: 'price' },
          { title: '保证金管理', key: 'deposit-mgmt' },
          { title: '联采通知/邀约', key: 'joint-notice' },
          { title: '踏勘', key: 'survey' },
          { title: '事件设置', key: 'event-settings' },
          { title: '惩罚性赔偿', key: 'penalty-compensation' },
          { title: '电子招投标', key: 'e-bidding' },
          { title: '候补退出', key: 'candidate-exit' },
          { title: '废标管理', key: 'abandon-mgmt' },
          { title: '约标', key: 'appointment-bid' }
        ]
      }
    ]
  },
  { title: '是否开启数据治理', key: 'data-governance', tag: 'NEW' }
];

// 树节点标题渲染 - 支持 NEW 标签
const renderTreeTitle = (node: any) => {
  return (
    <span className="tree-node-title">
      <span className="tree-node-label">{node.title}</span>
      {node.tag && <span className="tree-node-tag">{node.tag}</span>}
    </span>
  );
};

// 处理树数据，添加 title 渲染
const processTreeData = (data: any[]): any[] => {
  return data.map(node => ({
    ...node,
    title: renderTreeTitle(node),
    children: node.children ? processTreeData(node.children) : undefined
  }));
};

const tabItems = [
  { key: 'config', label: '方案配置' },
  { key: 'distribute', label: '配置下发' },
  { key: 'func-desc', label: '功能说明' },
  { key: 'operation-log', label: '操作日志' }
];

const Component = function SolutionRelationRuleConfig() {
  const [activeTab, setActiveTab] = useState('config');
  const [displayContent, setDisplayContent] = useState('all');
  const [scopeType, setScopeType] = useState('current');
  const [globalEnabled, setGlobalEnabled] = useState(true);
  const [maxLevel, setMaxLevel] = useState('3');
  const [keepRelation, setKeepRelation] = useState('keep');
  const [queryRule, setQueryRule] = useState('manual');

  const [expandedKeys, setExpandedKeys] = useState<string[]>([
    'buyer-workbench',
    'bidding-mgmt'
  ]);
  const [selectedTreeKeys, setSelectedTreeKeys] = useState<string[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);

  return (
    <OperationAdminLayout
      activeMenuKey="operation_solution_config"
      defaultOpenKeys={['solution']}
      breadcrumbItems={[
        { label: '解决方案' },
        { label: '运营解决方案配置', active: true }
      ]}
      platform="平台abc"
      orgCode="0001"
      parentOrg="-"
    >
      <div className="solution-relation-rule-body">
        {/* 左侧树形列表 */}
        <div className="left-panel tree-panel">
          {/* 展示内容筛选 */}
          <div className="display-filter">
            <span className="filter-label">展示内容：</span>
            <Radio.Group
              value={displayContent}
              onChange={e => setDisplayContent(e.target.value)}
            >
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
            checkable
            expandedKeys={expandedKeys}
            selectedKeys={selectedTreeKeys}
            checkedKeys={checkedKeys}
            onExpand={keys => setExpandedKeys(keys as string[])}
            onSelect={keys => setSelectedTreeKeys(keys as string[])}
            onCheck={keys => setCheckedKeys(keys as string[])}
            showLine={{ showLeafIcon: false }}
            showIcon={false}
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
              <div className="section-header">
                <div className="section-title-bar">
                  <div className="title-indicator" />
                  <h2 className="section-title">资质围标识别-工商关联规则</h2>
                </div>
                <Switch
                  size="small"
                  checked={globalEnabled}
                  onChange={setGlobalEnabled}
                />
              </div>

              <div className="param-desc">
                <span className="desc-label">参数说明：</span>
                根据组织配置工商关联识别的限制规则
              </div>

              <div className="scope-row">
                <span className="scope-label">适用组织范围：</span>
                <Radio.Group
                  value={scopeType}
                  onChange={e => setScopeType(e.target.value)}
                >
                  <Radio value="current">本级</Radio>
                  <Radio value="subordinate">本下级</Radio>
                </Radio.Group>
              </div>

              <div className="form-area">
                <div className="form-row">
                  <div className="form-label">
                    <span className="required">*</span>
                    <span className="form-number">1.</span>
                    <span>最大查询层级</span>
                    <span className="level-bracket">[]</span>
                  </div>
                  <Input
                    className="level-input"
                    value={maxLevel}
                    onChange={e => setMaxLevel(e.target.value)}
                  />
                  <div className="form-helper">
                    层级说明：<br />
                    A-B：1层级；<br />
                    A-B-C：2层级；<br />
                    A-B-C-D：3层级。
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-label">
                    <span className="required">*</span>
                    <span className="form-number">2.</span>
                    <span>层级为1时是否保留人员关联关系</span>
                  </div>
                  <Radio.Group
                    value={keepRelation}
                    onChange={e => setKeepRelation(e.target.value)}
                  >
                    <Radio value="keep">保留</Radio>
                    <Radio value="discard">不保留</Radio>
                  </Radio.Group>
                </div>

                <div className="form-row">
                  <div className="form-label">
                    <span className="required">*</span>
                    <span className="form-number">3.</span>
                    <span>开通时长服务查询规则</span>
                  </div>
                  <Radio.Group
                    value={queryRule}
                    onChange={e => setQueryRule(e.target.value)}
                  >
                    <Radio value="auto">报名截止自动查询</Radio>
                    <Radio value="manual">手动查询</Radio>
                  </Radio.Group>
                </div>
              </div>
            </div>

            <div className="footer-actions">
              <button className="submit-btn">提交</button>
            </div>
          </div>
        </div>
      </div>
    </OperationAdminLayout>
  );
};

export default Component;
