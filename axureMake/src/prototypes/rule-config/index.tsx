/**
 * @name 规则配置页面
 *
 * 参考资料：
 * - /rules/development-guide.md
 * - /rules/design-guide.md
 * - /src/themes/antd-new/DESIGN-SPEC.md
 * - /src/prototypes/rule-config/spec.md
 */

import './style.css';

import React, { useState, useCallback, useMemo } from 'react';
import {
  Layout,
  Menu,
  Tabs,
  Card,
  Form,
  Radio,
  Checkbox,
  Select,
  Input,
  Button,
  Tree,
  Breadcrumb,
  Tag,
  Space,
  Divider,
  Row,
  Col
} from 'antd';
import {
  HomeOutlined,
  SettingOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  DownloadOutlined,
  UserOutlined,
  DownOutlined
} from '@ant-design/icons';

const { Sider, Content } = Layout;
const { TabPane } = Tabs;
const { Option } = Select;

// 业务线 Tab 数据
const businessTabs = [
  { key: 'cloud_procurement', label: '云筑集采' },
  { key: 'cloud_mall', label: '云筑商城' },
  { key: 'cloud_labor', label: '云筑劳务' },
  { key: 'cloud_finance', label: '云筑金服' }
];

// 规则树数据
const ruleTreeData = [
  {
    title: '投标人相关',
    key: 'bidder',
    children: [
      { title: '投标人数量不满足要求', key: 'bidder_count', selectable: true },
      { title: '投标人资质异常', key: 'bidder_qualification', selectable: true }
    ]
  },
  {
    title: '投标时间',
    key: 'bid_time',
    children: [
      { title: '投标时间过短', key: 'bid_time_short', selectable: true },
      { title: '投标时间过长', key: 'bid_time_long', selectable: true }
    ]
  },
  {
    title: '供应商相关',
    key: 'supplier',
    children: [
      { title: '供应商疑似串标', key: 'supplier_collusion', selectable: true },
      { title: '供应商工商关联', key: 'supplier_related', selectable: true },
      { title: '最少有效供应商数', key: 'supplier_min_count', selectable: true }
    ]
  },
  {
    title: '投标数量',
    key: 'bid_count',
    children: [
      { title: '最少有效投标数', key: 'min_bid_count', selectable: true },
      { title: '投标数量异常', key: 'bid_count_abnormal', selectable: true }
    ]
  },
  {
    title: '其他风险',
    key: 'other_risk',
    children: [
      { title: '疑似围标', key: 'suspected_collusion', selectable: true },
      { title: '黑名单预警', key: 'blacklist_warning', selectable: true },
      { title: '文件使用电子签', key: 'electronic_signature', selectable: true },
      { title: '招标公告/招标文件/招标范本', key: 'tender_doc', selectable: true },
      { title: '招标预告上传', key: 'tender_preview', selectable: true },
      { title: '招标时间过长', key: 'tender_time_long', selectable: true },
      { title: '招标保证金', key: 'tender_deposit', selectable: true },
      { title: '投标供应商数量校验', key: 'bid_supplier_check', selectable: true },
      { title: '投标供应商数量校验', key: 'bid_supplier_check2', selectable: true },
      { title: '投标供应商数量校验', key: 'bid_supplier_check3', selectable: true }
    ]
  },
  {
    title: '注册企业校验',
    key: 'enterprise',
    children: [
      { title: '注册企业校验', key: 'enterprise_verify', selectable: true },
      { title: '调价轮次限制', key: 'price_adjust_limit', selectable: true },
      { title: '注册企业数量校验', key: 'enterprise_count_check', selectable: true },
      { title: '第三方风控规则', key: 'third_party_risk', selectable: true },
      { title: '采购报名/回标/开标', key: 'purchase_process', selectable: true }
    ]
  }
];

// 采购品类选项
const purchaseCategories = [
  { label: '物资', value: 'materials' },
  { label: '劳务分包', value: 'labor_subcontract' },
  { label: '专业分包', value: 'professional_subcontract' },
  { label: '专业服务', value: 'professional_service' },
  { label: '租赁', value: 'rental' },
  { label: '设备', value: 'equipment' }
];

// 采购类型选项
const purchaseTypes = [
  { label: '招标采购', value: 'tender' },
  { label: '劳务分包', value: 'labor' },
  { label: '专业分包', value: 'professional' },
  { label: '租赁', value: 'rental' }
];

// 采购方式选项
const purchaseMethods = [
  { label: '公开招标', value: 'open_tender' },
  { label: '邀请招标', value: 'invitation_tender' },
  { label: '询价采购', value: 'inquiry' },
  { label: '竞争性谈判', value: 'negotiation' },
  { label: '单一来源', value: 'single_source' },
  { label: '紧急采购', value: 'emergency' }
];

// 预警类型选项
const warningTypes = [
  { label: '公开招标', value: 'open' },
  { label: '邀请招标', value: 'invitation' },
  { label: '询价采购', value: 'inquiry' },
  { label: '竞争性谈判', value: 'negotiation' },
  { label: '单一来源', value: 'single' },
  { label: '紧急采购', value: 'emergency' }
];

// 预警级别颜色
const warningLevelColors = {
  high: '#ff4d4f',
  medium_high: '#fa8c16',
  medium: '#faad14',
  low: '#52c41a'
};

const Component = function RuleConfig() {
  const [activeTab, setActiveTab] = useState('cloud_procurement');
  const [selectedRule, setSelectedRule] = useState<string>('bidder_count');
  const [activeConfigTab, setActiveConfigTab] = useState('plan');
  const [form] = Form.useForm();

  const handleTabChange = useCallback((key: string) => {
    setActiveTab(key);
  }, []);

  const handleTreeSelect = useCallback((selectedKeys: any[]) => {
    if (selectedKeys.length > 0) {
      setSelectedRule(selectedKeys[0] as string);
    }
  }, []);

  const handleConfigTabChange = useCallback((key: string) => {
    setActiveConfigTab(key);
  }, []);

  const handleSubmit = useCallback(() => {
    form.validateFields().then(values => {
      console.log('Form values:', values);
    });
  }, [form]);

  // 左侧菜单项
  const menuItems = useMemo(() => [
    { key: 'dashboard', icon: <HomeOutlined />, label: '仪表盘' },
    {
      key: 'procurement',
      icon: <FileTextOutlined />,
      label: '集采管理',
      children: [
        { key: 'procurement_plan', label: '采购计划管理' },
        { key: 'procurement_execute', label: '采购执行' }
      ]
    },
    {
      key: 'supplier',
      icon: <UserOutlined />,
      label: '供应商管理',
      children: [
        { key: 'supplier_list', label: '供应商列表' },
        { key: 'supplier_audit', label: '供应商审核' }
      ]
    },
    {
      key: 'risk',
      icon: <ExclamationCircleOutlined />,
      label: '风控中心',
      children: [
        { key: 'risk_overview', label: '风控概览' },
        { key: 'risk_rule', label: '规则管理' }
      ]
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
      children: [
        { key: 'org_manage', label: '机构管理' },
        { key: 'user_manage', label: '用户管理' }
      ]
    }
  ], []);

  return (
    <Layout className="rule-config-page" style={{ minHeight: '100vh' }}>
      {/* 左侧边栏 */}
      <Sider width={200} theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
        <div className="logo" style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>集采运营后台</h3>
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={['risk_rule']}
          defaultOpenKeys={['risk']}
          items={menuItems}
          style={{ borderRight: 0 }}
        />
      </Sider>

      {/* 主内容区 */}
      <Layout>
        {/* 顶部导航栏 */}
        <div className="header" style={{
          background: '#fff',
          padding: '0 24px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '64px'
        }}>
          <Breadcrumb>
            <Breadcrumb.Item><HomeOutlined /></Breadcrumb.Item>
            <Breadcrumb.Item>风控中心</Breadcrumb.Item>
            <Breadcrumb.Item>规则管理</Breadcrumb.Item>
          </Breadcrumb>
          <Space>
            <span style={{ color: '#666', fontSize: '14px' }}>
              机构名称：<strong>中国建筑股份有限公司</strong>
            </span>
            <span style={{ color: '#666', fontSize: '14px' }}>
              机构代码：<strong>00010100</strong>
            </span>
            <span style={{ color: '#666', fontSize: '14px' }}>
              上级机构：<strong>平台运营</strong>
            </span>
            <Button type="text" icon={<DownloadOutlined />}>下载中心</Button>
            <Button type="text" icon={<UserOutlined />}>admin</Button>
          </Space>
        </div>

        {/* 业务线 Tab */}
        <div style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0' }}>
          <Tabs activeKey={activeTab} onChange={handleTabChange}>
            {businessTabs.map(tab => (
              <TabPane tab={tab.label} key={tab.key} />
            ))}
          </Tabs>
        </div>

        {/* 页面主体内容 */}
        <Content style={{ padding: '24px', background: '#f5f5f5' }}>
          <Card bordered={false} style={{ minHeight: 'calc(100vh - 200px)' }}>
            <Layout style={{ background: 'transparent' }}>
              {/* 左侧规则树 */}
              <Sider width={300} theme="light" style={{ background: 'transparent', marginRight: '24px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>规则列表</h4>
                </div>
                <Tree
                  checkable
                  defaultExpandAll
                  defaultCheckedKeys={['bidder_count']}
                  defaultSelectedKeys={['bidder_count']}
                  onSelect={handleTreeSelect}
                  treeData={ruleTreeData}
                  style={{ fontSize: '14px' }}
                />
              </Sider>

              {/* 右侧配置区 */}
              <Content style={{ background: 'transparent' }}>
                <Tabs activeKey={activeConfigTab} onChange={handleConfigTabChange} type="card">
                  <TabPane tab="方案配置" key="plan">
                    <Form
                      form={form}
                      layout="horizontal"
                      labelCol={{ span: 4 }}
                      wrapperCol={{ span: 20 }}
                      style={{ maxWidth: '900px' }}
                      initialValues={{
                        scope: 'current',
                        subConfig: 'allow',
                        warningLevel: 'medium',
                        duplicate: 'no',
                        purchaseCategory: ['materials'],
                        purchaseType: ['tender'],
                        purchaseMethod: ['open_tender'],
                        warningType: ['open'],
                        maxAdjust: 111,
                        minAdjust: 0
                      }}
                    >
                      {/* 适用组织范围 */}
                      <Form.Item label="适用组织范围" name="scope">
                        <Radio.Group>
                          <Radio.Button value="current">本级</Radio.Button>
                          <Radio.Button value="subordinate">本下级</Radio.Button>
                        </Radio.Group>
                      </Form.Item>

                      {/* 下级独立配置 */}
                      <Form.Item label="下级独立配置" name="subConfig">
                        <Radio.Group>
                          <Radio value="allow">允许</Radio>
                          <Radio value="disallow">不允许</Radio>
                        </Radio.Group>
                      </Form.Item>

                      {/* 预警级别 */}
                      <Form.Item label="预警级别" name="warningLevel">
                        <Radio.Group>
                          <Radio value="high" style={{ color: warningLevelColors.high }}>
                            <CloseCircleOutlined style={{ color: warningLevelColors.high }} /> 高风险
                          </Radio>
                          <Radio value="medium_high" style={{ color: warningLevelColors.medium_high }}>
                            <ExclamationCircleOutlined style={{ color: warningLevelColors.medium_high }} /> 中高风险
                          </Radio>
                          <Radio value="medium" style={{ color: warningLevelColors.medium }}>
                            <InfoCircleOutlined style={{ color: warningLevelColors.medium }} /> 中风险
                          </Radio>
                          <Radio value="low" style={{ color: warningLevelColors.low }}>
                            <CheckCircleOutlined style={{ color: warningLevelColors.low }} /> 低风险
                          </Radio>
                        </Radio.Group>
                      </Form.Item>

                      {/* 是否去重 */}
                      <Form.Item label="是否去重" name="duplicate">
                        <Radio.Group>
                          <Radio value="yes">去重</Radio>
                          <Radio value="no">不去重</Radio>
                        </Radio.Group>
                      </Form.Item>

                      <Divider />

                      {/* 规则类型 */}
                      <Form.Item label="规则类型">
                        <Tag color="blue">合规风险</Tag>
                      </Form.Item>

                      {/* 采购品类 */}
                      <Form.Item label="采购品类" name="purchaseCategory">
                        <Checkbox.Group options={purchaseCategories} />
                      </Form.Item>

                      {/* 采购类型 */}
                      <Form.Item label="采购类型" name="purchaseType">
                        <Checkbox.Group options={purchaseTypes} />
                      </Form.Item>

                      {/* 采购方式 */}
                      <Form.Item label="采购方式" name="purchaseMethod">
                        <Checkbox.Group options={purchaseMethods} />
                      </Form.Item>

                      {/* 预警类型 */}
                      <Form.Item label="预警类型" name="warningType">
                        <Checkbox.Group options={warningTypes} />
                      </Form.Item>

                      {/* 通知方式 */}
                      <Form.Item label="通知方式" name="notificationMethod">
                        <Select placeholder="请选择通知方式" style={{ width: 200 }}>
                          <Option value="sms">短信</Option>
                          <Option value="email">邮件</Option>
                          <Option value="app">APP推送</Option>
                          <Option value="all">全部</Option>
                        </Select>
                      </Form.Item>

                      {/* 通知对象 */}
                      <Form.Item label="通知对象" name="notificationTarget">
                        <Select placeholder="请选择通知对象" style={{ width: 200 }}>
                          <Option value="manager">采购经理</Option>
                          <Option value="admin">系统管理员</Option>
                          <Option value="all">全部相关人员</Option>
                        </Select>
                      </Form.Item>

                      {/* 调价次数 */}
                      <Form.Item label="调价次数">
                        <Space>
                          <Form.Item name="maxAdjust" noStyle>
                            <Input style={{ width: 100 }} placeholder="最大次数" />
                          </Form.Item>
                          <span>-</span>
                          <Form.Item name="minAdjust" noStyle>
                            <Input style={{ width: 100 }} placeholder="最小次数" />
                          </Form.Item>
                          <Button type="link">编辑</Button>
                          <Button type="link" danger>删除</Button>
                        </Space>
                      </Form.Item>

                      <Form.Item style={{ marginTop: '32px' }}>
                        <Button type="dashed" block style={{ marginBottom: '16px' }}>
                          + 添加一项
                        </Button>
                      </Form.Item>

                      <Form.Item style={{ marginTop: '24px' }}>
                        <Button type="primary" onClick={handleSubmit}>
                          提交
                        </Button>
                      </Form.Item>
                    </Form>
                  </TabPane>

                  <TabPane tab="配置下发" key="deploy">
                    <div style={{ padding: '48px', textAlign: 'center', color: '#999' }}>
                      <InfoCircleOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                      <p>配置下发功能开发中...</p>
                    </div>
                  </TabPane>

                  <TabPane tab="操作日志" key="log">
                    <div style={{ padding: '48px', textAlign: 'center', color: '#999' }}>
                      <FileTextOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                      <p>暂无操作日志</p>
                    </div>
                  </TabPane>
                </Tabs>
              </Content>
            </Layout>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Component;
