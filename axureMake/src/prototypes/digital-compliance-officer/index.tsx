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
  UploadOutlined
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
    avatar: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
    updateTime: '2026-03-24 13:01:08',
    status: true,
    operator: 'jctest1',
  },
  {
    id: '2',
    orgName: '华东区分公司',
    scope: '本级',
    systems: ['招投标'],
    personnel: ['王小明(wangxiaoming)'],
    avatar: '',
    updateTime: '2025-12-11 17:59:22',
    status: true,
    operator: 'admin',
  },
  {
    id: '3',
    orgName: '华南区分公司',
    scope: '本级',
    systems: ['合同'],
    personnel: ['赵法务(zhaofawu)'],
    avatar: '',
    updateTime: '2025-12-09 20:08:43',
    status: false,
    operator: 'admin',
  }
];

const treeData = [
  {
    value: 'org_1',
    title: '北京总部',
    children: [
      { value: 'org_1_1', title: '北京总部-采购中心' },
      { value: 'org_1_2', title: '北京总部-财务中心' },
    ],
  },
  {
    value: 'org_2',
    title: '华东区分公司',
  },
  {
    value: 'org_3',
    title: '华南区分公司',
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

  // Helper: Get org value from org name
  const getOrgValue = (orgName: string) => {
    if (orgName === '北京总部-采购中心') return 'org_1_1';
    if (orgName === '华东区分公司') return 'org_2';
    if (orgName === '华南区分公司') return 'org_3';
    return '';
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
      const newRecord = {
        id: Date.now().toString(),
        orgName: selectedOrgTitle,
        scope: values.scope,
        systems: values.systems,
        personnel: values.personnel,
        avatar: '',
        updateTime: new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).replace(/\//g, '-'),
        status: true,
        operator: 'jctest1',
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
            updateTime: new Date().toLocaleString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            }).replace(/\//g, '-'),
            operator: 'jctest1',
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
    { title: '组织名称', dataIndex: 'orgName', key: 'orgName' },
    {
      title: '配置范围',
      dataIndex: 'scope',
      key: 'scope',
      render: (text: string) => <Tag color={text === '本级' ? 'blue' : 'cyan'}>{text}</Tag>
    },
    {
      title: '业务系统',
      dataIndex: 'systems',
      key: 'systems',
      render: (systems: string[]) => systems.join('，')
    },
    {
      title: '合规人员',
      dataIndex: 'personnel',
      key: 'personnel',
      render: (personnel: string[]) => {
        if (!personnel || personnel.length === 0) return '-';
        if (personnel.length === 1) return personnel[0];
        return `${personnel[0]}等${personnel.length}人`;
      }
    },
    {
      title: '合规官头像',
      dataIndex: 'avatar',
      key: 'avatar',
      render: (avatar: string) => avatar ?
        <Image src={avatar} width={32} height={32} style={{ borderRadius: '50%', objectFit: 'cover' }} /> :
        <div className="avatar-placeholder"><UserOutlined /></div>
    },
    { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: boolean, record: any) => (
        <Switch
          checked={status}
          onChange={(checked) => handleStatusChange(checked, record)}
          checkedChildren="启用"
          unCheckedChildren="禁用"
        />
      )
    },
    { title: '操作人', dataIndex: 'operator', key: 'operator' },
    {
      title: '操作',
      key: 'action',
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
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={220} theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
        <div className="logo-container">
          <AppstoreOutlined className="logo-icon" />
          集采运营后台
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={['digital-compliance']}
          defaultOpenKeys={['risk']}
          style={{ height: 'calc(100% - 60px)', borderRight: 0 }}
        >
          <Menu.Item key="1" icon={<AppstoreOutlined />}>分供商管理</Menu.Item>
          <Menu.Item key="2" icon={<SolutionOutlined />}>模板管理</Menu.Item>
          <Menu.SubMenu key="procurement" icon={<ShopOutlined />} title="采购过程">
            <Menu.Item key="p1">需求管理</Menu.Item>
          </Menu.SubMenu>
          <Menu.SubMenu key="config" icon={<AppstoreOutlined />} title="配置管理"></Menu.SubMenu>
          <Menu.SubMenu key="identity" icon={<UserOutlined />} title="身份管理"></Menu.SubMenu>
          <Menu.SubMenu key="solution" icon={<FileTextOutlined />} title="解决方案"></Menu.SubMenu>
          <Menu.SubMenu key="contract" icon={<FileTextOutlined />} title="合同管理"></Menu.SubMenu>
          <Menu.SubMenu key="plan" icon={<ScheduleOutlined />} title="采购计划管理"></Menu.SubMenu>
          <Menu.SubMenu key="perform" icon={<CheckSquareOutlined />} title="履约管理"></Menu.SubMenu>
          <Menu.SubMenu key="receive" icon={<CarOutlined />} title="收验货"></Menu.SubMenu>
          <Menu.SubMenu key="marketing" icon={<ShopOutlined />} title="营销管理"></Menu.SubMenu>
          <Menu.SubMenu key="risk-early" icon={<AlertOutlined />} title="风控预警"></Menu.SubMenu>
          <Menu.SubMenu key="tool" icon={<ToolOutlined />} title="运营工具"></Menu.SubMenu>

          <Menu.SubMenu key="risk" icon={<AlertOutlined />} title="风控预警中心">
            <Menu.Item key="field">字段配置</Menu.Item>
            <Menu.Item key="rule">规则配置</Menu.Item>
            <Menu.Item key="scene">场景管理</Menu.Item>
            <Menu.Item key="alert">预警配置</Menu.Item>
            <Menu.Item key="operate">运营管理</Menu.Item>
            <Menu.Item key="rule-manage">规则管理</Menu.Item>
            <Menu.Item key="notice">通知中心</Menu.Item>
            <Menu.Item key="log">日志中心</Menu.Item>
            <Menu.Item key="digital-compliance">数字合规官</Menu.Item>
          </Menu.SubMenu>
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: '#fff', height: 60, lineHeight: '60px', borderBottom: '1px solid #f0f0f0' }}>
          <div className="header-content">
            <div>
              <Breadcrumb style={{ display: 'inline-block' }}>
                <Breadcrumb.Item>风控预警中心</Breadcrumb.Item>
                <Breadcrumb.Item>数字合规官配置</Breadcrumb.Item>
                {view !== 'list' && <Breadcrumb.Item>{view === 'add' ? '新增配置' : '编辑配置'}</Breadcrumb.Item>}
              </Breadcrumb>
            </div>
            <div>
              <Space size="large">
                <span><BellOutlined /> 下载中心</span>
                <span><Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} /> jctest1 <DownOutlined style={{ fontSize: '12px' }} /></span>
              </Space>
            </div>
          </div>
        </Header>
        <Content style={{ margin: '24px' }}>
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
                />
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
        </Content>
      </Layout>
    </Layout>
  );
});

Component.displayName = 'DigitalComplianceOfficer';

export default Component;
