/**
 * @name 数字合规官配置
 * @mode axure
 *
 * 参考资料：
 * - /rules/development-guide.md
 * - /skills/axure-export-workflow/SKILL.md
 * - /rules/axure-api-guide.md
 * - /src/prototypes/digital-compliance-officer/spec.md
 * - /temp/数字合规官temp/数字合规官配置.html
 * - /temp/数字合规官temp/数字合规官配置文档.md
 */

import './style.css';
import logoImage from '../../../assets/media/运营后台左上角logo.png';

import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import {
  Layout,
  Menu,
  Breadcrumb,
  Card,
  Form,
  Input,
  Button,
  Table,
  Switch,
  Space,
  Tag,
  Popconfirm,
  message,
  Image,
  Avatar,
  Select,
  Radio,
  Checkbox,
  Upload,
  TreeSelect,
  Modal
} from 'antd';
import {
  AppstoreOutlined,
  SolutionOutlined,
  FileTextOutlined,
  ScheduleOutlined,
  CheckSquareOutlined,
  CarOutlined,
  ShopOutlined,
  AlertOutlined,
  ToolOutlined,
  PlusOutlined,
  BellOutlined,
  UserOutlined,
  DownOutlined,
  UploadOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TeamOutlined,
  SettingOutlined,
  SafetyCertificateOutlined,
  AuditOutlined,
  FileProtectOutlined,
  ContainerOutlined,
  WarningOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';

import type {
  KeyDesc,
  DataDesc,
  ConfigItem,
  Action,
  EventItem,
  AxureProps,
  AxureHandle
} from '../../common/axure-types';

const { Header, Content, Sider } = Layout;
const { Option } = Select;

// --- Mock Data ---

const initialData = [
  {
    id: '1',
    orgName: '北京总部-采购中心',
    scope: '本下级',
    systems: ['招投标', '合同'],
    personnel: ['张合规(zhanghegui)', '李风控(lifengkong)'],
    alias: '合规小助手',
    avatar: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
    createTime: '2026-03-20 09:15:00',
    updateTime: '2026-03-24 13:01:08',
    status: true,
    creator: 'admin',
    updater: 'jctest1',
  },
  {
    id: '2',
    orgName: '华东区分公司',
    scope: '本级',
    systems: ['招投标'],
    personnel: ['王小明(wangxiaoming)'],
    alias: '华东合规官',
    avatar: '',
    createTime: '2025-12-01 10:30:00',
    updateTime: '2025-12-11 17:59:22',
    status: true,
    creator: 'admin',
    updater: 'admin',
  },
  {
    id: '3',
    orgName: '华南区分公司',
    scope: '本级',
    systems: ['合同'],
    personnel: ['赵法务(zhaofawu)'],
    alias: '华南风控官',
    avatar: '',
    createTime: '2025-11-25 14:45:00',
    updateTime: '2025-12-09 20:08:43',
    status: false,
    creator: 'jctest1',
    updater: 'admin',
  }
];

const treeData = [
  {
    value: 'org_cscec',
    title: '中国建筑',
    children: [
      { value: 'org_cscec_1', title: '中建一局' },
      { value: 'org_cscec_2', title: '中建二局' },
      { value: 'org_cscec_3', title: '中建三局' },
      { value: 'org_cscec_4', title: '中建四局' },
      { value: 'org_cscec_5', title: '中建五局' },
      { value: 'org_cscec_6', title: '中建六局' },
      { value: 'org_cscec_7', title: '中建七局' },
      { value: 'org_cscec_8', title: '中建八局' },
    ],
  },
];

const personnelOptions = [
  { label: '张合规 (zhanghegui)', value: '张合规(zhanghegui)' },
  { label: '李风控 (lifengkong)', value: '李风控(lifengkong)' },
  { label: '王小明 (wangxiaoming)', value: '王小明(wangxiaoming)' },
  { label: '赵法务 (zhaofawu)', value: '赵法务(zhaofawu)' },
  { label: '孙专员 (sunzhuanyuan)', value: '孙专员(sunzhuanyuan)' },
];

// --- Component ---

const Component = forwardRef<AxureHandle, AxureProps>((props, ref) => {
  const { eventList = [], actionList = [], varList = [], configList = [], dataList = [] } = props;

  // State
  const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
  const [dataSource, setDataSource] = useState(initialData);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [viewingRecord, setViewingRecord] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [searchStatus, setSearchStatus] = useState('全部');
  const [searchOrgNode, setSearchOrgNode] = useState<string | undefined>(undefined);
  const [includeChildren, setIncludeChildren] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  // 左侧菜单项 - 根据参考页面结构定义
  const menuItems = [
    { key: 'supplier_mgmt', icon: <TeamOutlined />, label: '分供商管理' },
    { key: 'template_mgmt', icon: <FileTextOutlined />, label: '模板管理' },
    { key: 'procurement_plan', icon: <ShoppingCartOutlined />, label: '采购计划管理' },
    { key: 'bidding', icon: <AuditOutlined />, label: '招标采购' },
    { key: 'config_mgmt', icon: <SettingOutlined />, label: '配置管理' },
    { key: 'identity_mgmt', icon: <SafetyCertificateOutlined />, label: '身份管理' },
    { key: 'solution', icon: <SolutionOutlined />, label: '解决方案' },
    { key: 'contract_mgmt', icon: <FileProtectOutlined />, label: '合同管理' },
    { key: 'performance_mgmt', icon: <CheckSquareOutlined />, label: '履约管理' },
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
        { key: 'log_center', label: '日志中心' },
        { key: 'digital-compliance', label: '数字合规官' }
      ]
    }
  ];

  // Helper: Get org value from org name
  const getOrgValue = (orgName: string) => {
    const valueMap: Record<string, string> = {
      '中国建筑': 'org_cscec',
      '中建一局': 'org_cscec_1',
      '中建二局': 'org_cscec_2',
      '中建三局': 'org_cscec_3',
      '中建四局': 'org_cscec_4',
      '中建五局': 'org_cscec_5',
      '中建六局': 'org_cscec_6',
      '中建七局': 'org_cscec_7',
      '中建八局': 'org_cscec_8',
    };
    return valueMap[orgName] || '';
  };

  // Helper: Get org title from value
  const getOrgTitle = (value: string) => {
    const allNodes = treeData.flatMap(d => [d, ...(d.children || [])]);
    return allNodes.find(n => n.value === value)?.title || value;
  };

  // Handlers
  const handleStatusChange = useCallback((checked: boolean, record: any) => {
    const newData = dataSource.map(item => {
      if (item.id === record.id) {
        return { ...item, status: checked };
      }
      return item;
    });
    setDataSource(newData);
    message.success(`已${checked ? '开启' : '关闭'}`);

    // Trigger event
    const event = eventList.find(e => e.name === 'onStatusChange');
    if (event) {
      console.log('Trigger event:', event.name, { id: record.id, status: checked });
    }
  }, [dataSource, eventList]);

  const handleDelete = useCallback((id: string) => {
    setDataSource(dataSource.filter(item => item.id !== id));
    message.success('删除成功');

    const event = eventList.find(e => e.name === 'onConfigDelete');
    if (event) {
      console.log('Trigger event:', event.name, { id });
    }
  }, [dataSource, eventList]);

  const goForm = useCallback((record: any = null) => {
    if (record) {
      setEditingRecord(record);
      form.setFieldsValue({
        orgName: getOrgValue(record.orgName),
        scope: record.scope,
        systems: record.systems,
        personnel: record.personnel,
        alias: record.alias,
      });
      setView('edit');
    } else {
      setEditingRecord(null);
      form.resetFields();
      form.setFieldsValue({ scope: '本级' });
      setView('add');
    }
  }, [form]);

  const openViewModal = useCallback((record: any) => {
    setViewingRecord({
      ...record,
      orgValue: getOrgValue(record.orgName)
    });
    setIsModalOpen(true);
  }, []);

  const goList = useCallback(() => {
    setView('list');
  }, []);

  const onFinish = useCallback((values: any) => {
    const selectedOrgTitle = getOrgTitle(values.orgName);

    if (view === 'add' && dataSource.some(item => item.orgName === selectedOrgTitle)) {
      message.error('该组织已存在配置，请勿重复添加，请返回列表页刷新后进行编辑操作。');
      return;
    }

    if (view === 'add') {
      const currentTime = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(/\//g, '-');
      const newRecord = {
        id: Date.now().toString(),
        orgName: selectedOrgTitle,
        scope: values.scope,
        systems: values.systems,
        personnel: values.personnel,
        alias: values.alias,
        avatar: '',
        createTime: currentTime,
        updateTime: currentTime,
        status: true,
        creator: 'jctest1',
        updater: 'jctest1',
      };
      setDataSource([newRecord, ...dataSource]);
      message.success('保存成功');

      const event = eventList.find(e => e.name === 'onConfigAdd');
      if (event) {
        console.log('Trigger event:', event.name, { record: newRecord });
      }
    } else {
      const newData = dataSource.map(item => {
        if (item.id === editingRecord.id) {
          return {
            ...item,
            scope: values.scope,
            systems: values.systems,
            personnel: values.personnel,
            alias: values.alias,
            updateTime: new Date().toLocaleString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            }).replace(/\//g, '-'),
            updater: 'jctest1',
          };
        }
        return item;
      });
      setDataSource(newData);
      message.success('更新成功');

      const event = eventList.find(e => e.name === 'onConfigEdit');
      if (event) {
        console.log('Trigger event:', event.name, { record: editingRecord });
      }
    }
    goList();
  }, [view, dataSource, editingRecord, eventList, goList]);

  // Expose actions via ref
  useImperativeHandle(ref, () => ({
    executeAction: (actionName: string, params?: any) => {
      switch (actionName) {
        case 'refreshList':
          console.log('Action: refreshList');
          break;
        case 'openAddForm':
          goForm();
          break;
        case 'openEditForm':
          const record = dataSource.find(item => item.id === params?.id);
          if (record) goForm(record);
          break;
        case 'openViewModal':
          const viewRecord = dataSource.find(item => item.id === params?.id);
          if (viewRecord) openViewModal(viewRecord);
          break;
        default:
          console.warn('Unknown action:', actionName);
      }
    },
    getVars: () => ({
      view,
      dataSource,
      editingRecord,
      viewingRecord,
      isModalOpen,
      searchStatus,
      searchOrgNode,
      includeChildren
    }),
    setVars: (vars: Record<string, any>) => {
      if (vars.view) setView(vars.view);
      if (vars.searchStatus) setSearchStatus(vars.searchStatus);
      if (vars.searchOrgNode) setSearchOrgNode(vars.searchOrgNode);
      if (vars.includeChildren !== undefined) setIncludeChildren(vars.includeChildren);
    }
  }));

  // Table columns
  const columns = [
    { title: '序号', dataIndex: 'index', key: 'index', render: (_: any, __: any, index: number) => index + 1, width: 80 },
    { title: '组织名称', dataIndex: 'orgName', key: 'orgName', width: 180 },
    {
      title: '配置范围',
      dataIndex: 'scope',
      key: 'scope',
      width: 120,
      render: (text: string) => <Tag color={text === '本级' ? 'blue' : 'cyan'}>{text}</Tag>
    },
    {
      title: '业务系统',
      dataIndex: 'systems',
      key: 'systems',
      width: 150,
      render: (systems: string[]) => systems.join('，')
    },
    {
      title: '合规人员',
      dataIndex: 'personnel',
      key: 'personnel',
      width: 200,
      render: (personnel: string[]) => {
        if (!personnel || personnel.length === 0) return '-';
        if (personnel.length === 1) return personnel[0];
        return `${personnel[0]}等${personnel.length}人`;
      }
    },
    {
      title: '合规官别名',
      dataIndex: 'alias',
      key: 'alias',
      width: 120,
      render: (alias: string) => alias || '-'
    },
    {
      title: '合规官头像',
      dataIndex: 'avatar',
      key: 'avatar',
      width: 100,
      render: (avatar: string) => avatar ?
        <Image src={avatar} width={32} height={32} style={{ borderRadius: '50%', objectFit: 'cover' }} /> :
        <div className="avatar-placeholder"><UserOutlined /></div>
    },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
    { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime', width: 180 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: boolean, record: any) => (
        <Switch
          checked={status}
          onChange={(checked) => handleStatusChange(checked, record)}
          checkedChildren="启用"
          unCheckedChildren="禁用"
        />
      )
    },
    { title: '创建人', dataIndex: 'creator', key: 'creator', width: 120 },
    { title: '更新人', dataIndex: 'updater', key: 'updater', width: 120 },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_: any, record: any) => (
        <Space size="middle">
          <a onClick={() => openViewModal(record)}>查看</a>
          <a onClick={() => goForm(record)}>编辑</a>
          <Popconfirm title="确定要删除该配置吗？" onConfirm={() => handleDelete(record.id)}>
            <a style={{ color: '#ff4d4f' }}>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Filter data
  const filteredData = dataSource.filter(item => {
    if (searchStatus === '启用') return item.status === true;
    if (searchStatus === '禁用') return item.status === false;
    return true;
  });

  return (
    <Layout className="rule-config-page">
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
          selectedKeys={['digital-compliance']}
          defaultOpenKeys={['risk_warning_center']}
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
            <Button type="text" icon={<BellOutlined />}>下载中心</Button>
            <Button type="text" icon={<UserOutlined />}>jctest1</Button>
          </div>
        </div>

        {/* 面包屑导航栏 */}
        <div className="breadcrumb-bar">
          <div className="breadcrumb-nav">
            <span className="breadcrumb-item">风控预警中心</span>
            <span className="breadcrumb-separator">&gt;</span>
            <span className="breadcrumb-item active">数字合规官配置</span>
            {view !== 'list' && (
              <>
                <span className="breadcrumb-separator">&gt;</span>
                <span className="breadcrumb-item active">{view === 'add' ? '新增配置' : '编辑配置'}</span>
              </>
            )}
          </div>
        </div>

        {/* 页面主体内容 */}
        <Content className="main-content">
          <div className="content-wrapper">
          {view === 'list' && (
            <>
              <Card className="filter-card" bodyStyle={{ padding: '20px 24px' }}>
                <div className="filter-title">查询</div>
                <Form layout="inline">
                  <Form.Item label="组织名称">
                    <Input placeholder="请输入组织名称" style={{ width: 200 }} />
                  </Form.Item>
                  <Form.Item label="组织机构" style={{ marginRight: 0 }}>
                    <TreeSelect
                      style={{ width: 200 }}
                      value={searchOrgNode}
                      dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                      treeData={treeData}
                      placeholder="请选择组织"
                      treeDefaultExpandAll
                      allowClear
                      onChange={setSearchOrgNode}
                    />
                  </Form.Item>
                  <Form.Item style={{ marginRight: 24, marginLeft: 8 }}>
                    <Checkbox
                      checked={includeChildren}
                      onChange={(e) => setIncludeChildren(e.target.checked)}
                      disabled={!searchOrgNode}
                    >
                      包含下级
                    </Checkbox>
                  </Form.Item>
                  <Form.Item label="状态">
                    <Select
                      value={searchStatus}
                      onChange={setSearchStatus}
                      style={{ width: 120 }}
                      options={[
                        { value: '全部', label: '全部' },
                        { value: '启用', label: '启用' },
                        { value: '禁用', label: '禁用' }
                      ]}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Space>
                      <Button type="primary">查询</Button>
                      <Button>重置</Button>
                    </Space>
                  </Form.Item>
                </Form>
              </Card>

              <Card>
                <div className="table-toolbar">
                  <div></div>
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => goForm()}>新增配置</Button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="id"
                    pagination={{
                      total: filteredData.length,
                      showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/总共 ${total} 条`,
                      defaultPageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                    }}
                    scroll={{ x: 1200 }}
                  />
                </div>
              </Card>

              <Modal
                title="查看数字合规官配置"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={[
                  <Button key="close" onClick={() => setIsModalOpen(false)}>关闭</Button>
                ]}
                width={600}
              >
                {viewingRecord && (
                  <Form layout="vertical" style={{ marginTop: 24 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: 16, borderBottom: '1px solid #eee', paddingBottom: 8 }}>基本配置</div>

                    <Form.Item label="组织名称">
                      <TreeSelect
                        treeData={treeData}
                        value={viewingRecord.orgValue}
                        disabled
                        style={{ width: '100%' }}
                      />
                    </Form.Item>

                    <Form.Item label="配置范围">
                      <Radio.Group value={viewingRecord.scope} disabled>
                        <Radio value="本级">本级</Radio>
                        <Radio value="本下级">本下级</Radio>
                      </Radio.Group>
                    </Form.Item>

                    <Form.Item label="业务系统">
                      <Checkbox.Group
                        options={[
                          { label: '招投标', value: '招投标' },
                          { label: '合同', value: '合同' }
                        ]}
                        value={viewingRecord.systems}
                        disabled
                      />
                    </Form.Item>

                    <Form.Item label="关联人员">
                      <Select
                        mode="multiple"
                        options={personnelOptions}
                        value={viewingRecord.personnel}
                        disabled
                        style={{ width: '100%' }}
                      />
                    </Form.Item>

                    <div style={{ fontWeight: 'bold', marginBottom: 16, marginTop: 24, borderBottom: '1px solid #eee', paddingBottom: 8 }}>定制配置</div>

                    <Form.Item label="合规官别名">
                      <Input value={viewingRecord.alias} disabled style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item label="合规官头像">
                      {viewingRecord.avatar ? (
                        <Image src={viewingRecord.avatar} width={100} height={100} style={{ borderRadius: '8px', objectFit: 'cover' }} />
                      ) : (
                        <div className="avatar-upload-placeholder">
                          <UserOutlined style={{ fontSize: 32, color: '#999' }} />
                        </div>
                      )}
                    </Form.Item>
                  </Form>
                )}
              </Modal>
            </>
          )}

          {(view === 'add' || view === 'edit') && (
            <Card>
              <div className="filter-title">{view === 'add' ? '新增配置' : '编辑配置'}</div>
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                style={{ maxWidth: 600, marginTop: 24 }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: 16, borderBottom: '1px solid #eee', paddingBottom: 8 }}>基本配置</div>

                <Form.Item
                  label="选择组织"
                  name="orgName"
                  rules={[{ required: true, message: '请选择组织' }]}
                >
                  <TreeSelect
                    treeData={treeData}
                    placeholder="请选择组织"
                    treeDefaultExpandAll
                    disabled={view === 'edit'}
                    style={{ width: '100%' }}
                  />
                </Form.Item>

                <Form.Item
                  label="配置范围"
                  name="scope"
                  rules={[{ required: true, message: '请选择配置范围' }]}
                >
                  <Radio.Group>
                    <Radio value="本级">本级</Radio>
                    <Radio value="本下级">本下级</Radio>
                  </Radio.Group>
                </Form.Item>

                <Form.Item
                  label="业务系统"
                  name="systems"
                  rules={[{ required: true, message: '请至少选择一个业务系统' }]}
                >
                  <Checkbox.Group
                    options={[
                      { label: '招投标', value: '招投标' },
                      { label: '合同', value: '合同' }
                    ]}
                  />
                </Form.Item>

                <Form.Item
                  label="关联人员"
                  name="personnel"
                  rules={[{ required: true, message: '请选择关联的合规人员' }]}
                >
                  <Select
                    mode="multiple"
                    placeholder="请选择人员"
                    options={personnelOptions}
                    style={{ width: '100%' }}
                  />
                </Form.Item>

                <div style={{ fontWeight: 'bold', marginBottom: 16, marginTop: 24, borderBottom: '1px solid #eee', paddingBottom: 8 }}>定制配置</div>

                <Form.Item
                  label="合规官别名"
                  name="alias"
                  rules={[
                    { required: true, message: '请输入合规官别名' },
                    { min: 2, max: 20, message: '合规官别名长度需在 2-20 个字符之间' }
                  ]}
                >
                  <Input placeholder="请输入合规官别名，用于业务系统展示" style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item label="合规官头像">
                  <Upload
                    name="avatar"
                    listType="picture-card"
                    showUploadList={false}
                    beforeUpload={() => false}
                  >
                    <div className="avatar-upload-placeholder">
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>上传头像</div>
                    </div>
                  </Upload>
                </Form.Item>

                <Form.Item style={{ marginTop: 24 }}>
                  <Space>
                    <Button type="primary" htmlType="submit">保存</Button>
                    <Button onClick={goList}>取消</Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          )}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
});

Component.displayName = 'DigitalComplianceOfficer';

export default Component;
