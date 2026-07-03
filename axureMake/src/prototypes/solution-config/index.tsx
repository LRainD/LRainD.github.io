/**
 * @name 运营解决方案配置页面
 */
import React, { useState } from 'react';
import {
  Radio,
  Select,
  Input,
  Button,
  Table,
  Switch,
  Tree
} from 'antd';
import {
  SettingOutlined,
  InfoCircleOutlined,
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  CloseOutlined
} from '@ant-design/icons';
import OperationAdminLayout from '../../components/operation-admin-layout';
import './style.css';

const Component = function SolutionConfig() {
  const [activeTab, setActiveTab] = useState('config');

  // 顶部表单状态
  const [platform, setPlatform] = useState('平台abc');
  const [orgCode] = useState('0001');
  const [parentOrg] = useState('-');

  // 展示内容筛选
  const [displayContent, setDisplayContent] = useState('all');

  // 适用组织范围
  const [scopeType, setScopeType] = useState('current');

  // 全局开关
  const [globalEnabled, setGlobalEnabled] = useState(true);

  // 资格审查附件组成 - 表格数据
  const [qualReviewData, setQualReviewData] = useState([
    {
      id: 1,
      purchaseCategory: ['物资'],
      purchaseType: ['区域联采'],
      biddingMethod: ['公开招标'],
      defaultUse: true,
      forceUse: true,
      aiFileDetectEnabled: false,
      aiFileDetectConfig: '自由选择',
      fileItems: [
        { id: 101, name: '法人身份证', customContent: '', required: '是', defaultSample: '' },
        { id: 102, name: '自定义', customContent: '请输入自定义内容', required: '是', defaultSample: '' }
      ]
    }
  ]);

  // AI检测项分类数据
  const AI_CHECK_CATEGORIES = [
    { name: '签章类', items: ['是否盖章', '法人签字', '骑缝章'] },
    { name: '时效类', items: ['有效期校验', '年检状态'] },
    { name: '资质类', items: ['颁发机构核验', '资质等级匹配'] },
  ];

  // 每行文件项的AI检测项设置
  const [attachmentCheckSettings, setAttachmentCheckSettings] = useState<Record<number, string[]>>({});
  const [checkModalFileItemId, setCheckModalFileItemId] = useState<number | null>(null);
  const [checkModalRowId, setCheckModalRowId] = useState<number | null>(null);

  const aiDetectConfigOptions = ['自由选择', '默认是', '默认否', '强制是'];

  const toggleAttachmentCheck = (fileItemId: number, checkItem: string) => {
    setAttachmentCheckSettings((prev) => {
      const current = prev[fileItemId] || [];
      if (current.includes(checkItem)) {
        return { ...prev, [fileItemId]: current.filter((c) => c !== checkItem) };
      }
      return { ...prev, [fileItemId]: [...current, checkItem] };
    });
  };

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
  const requiredOptions = ['是', '否'];
  const fileItemOptions = ['营业执照', '法人身份证', '银行信用等级', '工商企业信用等级', '纳税信用等级', '财务会计信用等级', '资质证书', '安全施工许可证', '自定义'];

  const handleAddRow = () => {
    setQualReviewData(prev => [
      ...prev,
      {
        id: Date.now(),
        purchaseCategory: ['物资'],
        purchaseType: ['区域联采'],
        biddingMethod: ['公开招标'],
        defaultUse: false,
        forceUse: false,
        aiFileDetectEnabled: false,
        aiFileDetectConfig: '自由选择',
        fileItems: []
      }
    ]);
  };

  const handleDeleteRow = (id: number) => {
    setQualReviewData(prev => prev.filter(item => item.id !== id));
  };

  const handleAddFileItem = (rowId: number) => {
    setQualReviewData(prev => prev.map(item => {
      if (item.id === rowId) {
        return {
          ...item,
          fileItems: [
            ...item.fileItems,
            { id: Date.now(), name: '', customContent: '', required: '是', defaultSample: '' }
          ]
        };
      }
      return item;
    }));
  };

  const handleDeleteFileItem = (rowId: number, fileItemId: number) => {
    setQualReviewData(prev => prev.map(item => {
      if (item.id === rowId) {
        return {
          ...item,
          fileItems: item.fileItems.filter(fi => fi.id !== fileItemId)
        };
      }
      return item;
    }));
  };

  const handleUpdateRow = (id: number, field: string, value: any) => {
    setQualReviewData(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleUpdateFileItem = (rowId: number, fileItemId: number, field: string, value: any) => {
    setQualReviewData(prev => prev.map(item => {
      if (item.id === rowId) {
        return {
          ...item,
          fileItems: item.fileItems.map(fi =>
            fi.id === fileItemId ? { ...fi, [field]: value } : fi
          )
        };
      }
      return item;
    }));
  };

  return (
    <OperationAdminLayout
      activeMenuKey="operation_solution_config"
      defaultOpenKeys={['solution']}
      breadcrumbItems={[
        { label: '解决方案' },
        { label: '运营解决方案配置', active: true }
      ]}
      platform={platform}
      orgCode={orgCode}
      parentOrg={parentOrg}
      onPlatformChange={setPlatform}
    >
      <div className="solution-config-body">
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
                        <h2 className="section-title">资格审查附件组成</h2>
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
                      在对应品类及采购类型条件下，可配置供应商需要上传哪些资格审查文件
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
                          dataSource={qualReviewData}
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
                              title: '默认使用',
                              dataIndex: 'defaultUse',
                              key: 'defaultUse',
                              width: 100,
                              align: 'center',
                              render: (value: boolean, record: any) => (
                                <Switch
                                  size="small"
                                  checked={value}
                                  onChange={(checked) => handleUpdateRow(record.id, 'defaultUse', checked)}
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
                              title: 'AI文件检测',
                              dataIndex: 'aiFileDetectEnabled',
                              key: 'aiFileDetectEnabled',
                              width: 110,
                              align: 'center',
                              render: (value: boolean, record: any) => (
                                <Switch
                                  size="small"
                                  checked={value}
                                  onChange={(checked) => handleUpdateRow(record.id, 'aiFileDetectEnabled', checked)}
                                />
                              )
                            },
                            {
                              title: 'AI文件检测配置',
                              dataIndex: 'aiFileDetectConfig',
                              key: 'aiFileDetectConfig',
                              width: 140,
                              render: (value: string, record: any) => (
                                record.aiFileDetectEnabled ? (
                                  <Select
                                    value={value}
                                    onChange={(val) => handleUpdateRow(record.id, 'aiFileDetectConfig', val)}
                                    options={aiDetectConfigOptions.map(o => ({ label: o, value: o }))}
                                    style={{ width: '100%' }}
                                  />
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )
                              )
                            },
                            {
                              title: '操作',
                              key: 'action',
                              width: 80,
                              align: 'center',
                              render: (_: any, record: any) => (
                                <Button
                                  type="text"
                                  danger
                                  icon={<DeleteOutlined />}
                                  onClick={() => handleDeleteRow(record.id)}
                                />
                              )
                            }
                          ]}
                          expandable={{
                            expandedRowRender: (record: any) => (
                              <div className="file-items-area">
                                <div className="file-items-header">
                                  <span className="file-items-title">附件项配置</span>
                                  <Button
                                    type="primary"
                                    size="small"
                                    icon={<PlusOutlined />}
                                    onClick={() => handleAddFileItem(record.id)}
                                  >
                                    添加附件项
                                  </Button>
                                </div>
                                <Table
                                  dataSource={record.fileItems}
                                  rowKey="id"
                                  pagination={false}
                                  bordered
                                  size="small"
                                  columns={[
                                    {
                                      title: '序号',
                                      dataIndex: 'id',
                                      key: 'id',
                                      width: 60,
                                      render: (_: any, __: any, index: number) => index + 1
                                    },
                                    {
                                      title: '附件项名称',
                                      dataIndex: 'name',
                                      key: 'name',
                                      render: (value: string, item: any) => (
                                        <Select
                                          value={value}
                                          onChange={(val) => handleUpdateFileItem(record.id, item.id, 'name', val)}
                                          options={fileItemOptions.map(o => ({ label: o, value: o }))}
                                          style={{ width: '100%' }}
                                          placeholder="请选择"
                                        />
                                      )
                                    },
                                    {
                                      title: '自定义内容',
                                      dataIndex: 'customContent',
                                      key: 'customContent',
                                      render: (value: string, item: any) => (
                                        item.name === '自定义' ? (
                                          <Input
                                            value={value}
                                            onChange={(e) => handleUpdateFileItem(record.id, item.id, 'customContent', e.target.value)}
                                            placeholder="请输入自定义内容"
                                          />
                                        ) : (
                                          <span className="text-gray-400">-</span>
                                        )
                                      )
                                    },
                                    {
                                      title: '是否必填',
                                      dataIndex: 'required',
                                      key: 'required',
                                      width: 100,
                                      render: (value: string, item: any) => (
                                        <Select
                                          value={value}
                                          onChange={(val) => handleUpdateFileItem(record.id, item.id, 'required', val)}
                                          options={requiredOptions.map(o => ({ label: o, value: o }))}
                                          style={{ width: '100%' }}
                                        />
                                      )
                                    },
                                    {
                                      title: '默认样本',
                                      dataIndex: 'defaultSample',
                                      key: 'defaultSample',
                                      width: 120,
                                      render: (_: string, item: any) => (
                                        <Button
                                          type="link"
                                          size="small"
                                          onClick={() => { setCheckModalRowId(record.id); setCheckModalFileItemId(item.id); }}
                                        >
                                          检测项设置
                                        </Button>
                                      )
                                    },
                                    {
                                      title: '操作',
                                      key: 'action',
                                      width: 80,
                                      align: 'center',
                                      render: (_: any, item: any) => (
                                        <Button
                                          type="text"
                                          danger
                                          icon={<DeleteOutlined />}
                                          onClick={() => handleDeleteFileItem(record.id, item.id)}
                                        />
                                      )
                                    }
                                  ]}
                                />
                              </div>
                            ),
                            rowExpandable: () => true
                          }}
                        />

                        {/* 添加行按钮 */}
                        <div className="add-row-area">
                          <Button
                            type="dashed"
                            icon={<PlusOutlined />}
                            onClick={handleAddRow}
                            className="add-row-btn"
                          >
                            添加条件配置
                          </Button>
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

            {/* 底部提交按钮 */}
            <div className="footer-actions">
              <Button type="primary" size="large">提交</Button>
            </div>
          </div>
        </div>
      </div>

      {/* AI检测项设置弹窗 */}
      {checkModalFileItemId !== null && checkModalRowId !== null && (
        <div className="ai-check-modal-overlay" onClick={() => { setCheckModalFileItemId(null); setCheckModalRowId(null); }}>
          <div className="ai-check-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ai-check-modal-header">
              <SettingOutlined className="ai-check-modal-icon" />
              <span className="ai-check-modal-title">
                检测项设置 - {qualReviewData.find(r => r.id === checkModalRowId)?.fileItems.find(f => f.id === checkModalFileItemId)?.name || ''}
              </span>
              <Button type="text" size="small" onClick={() => { setCheckModalFileItemId(null); setCheckModalRowId(null); }}>
                <CloseOutlined />
              </Button>
            </div>
            <div className="ai-check-modal-body">
              {(() => {
                const selected = attachmentCheckSettings[checkModalFileItemId] || [];
                return (
                  <div className="ai-check-categories">
                    {AI_CHECK_CATEGORIES.map((category) => (
                      <div key={category.name} className="ai-check-category">
                        <h4 className="ai-check-category-title">{category.name}</h4>
                        <div className="ai-check-items">
                          {category.items.map((item) => (
                            <label key={item} className="ai-check-item">
                              <input
                                type="checkbox"
                                checked={selected.includes(item)}
                                onChange={() => toggleAttachmentCheck(checkModalFileItemId, item)}
                              />
                              <span>{item}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
            <div className="ai-check-modal-footer">
              <span className="ai-check-selected-count">
                已选 {(attachmentCheckSettings[checkModalFileItemId] || []).length} 项
              </span>
              <Button type="primary" onClick={() => { setCheckModalFileItemId(null); setCheckModalRowId(null); }}>
                确定
              </Button>
            </div>
          </div>
        </div>
      )}
    </OperationAdminLayout>
  );
};

export default Component;
