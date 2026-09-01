/**
 * @name 合规人员库
 * @mode axure
 * 
 * 参考资料：
 * - /Users/liurundong/Desktop/remote_demo_project/LRainD.github.io/axureMake/docs/四局一单一检/prd.md
 * - /Users/liurundong/Desktop/remote_demo_project/LRainD.github.io/axureMake/src/prototypes/compliance-personnel-library/spec.md
 */

import './style.css';
import React, { useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import {
  Form,
  Input,
  Button,
  Table,
  Switch,
  Space,
  Tag,
  Popconfirm,
  message,
  Select,
  TreeSelect,
  Modal,
  Checkbox,
  Upload,
  Breadcrumb,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  ImportOutlined,
  ExportOutlined,
  SearchOutlined,
  ReloadOutlined,
  InboxOutlined,
  DownloadOutlined,
  FileTextOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

import type {
  AxureProps,
  AxureHandle
} from '../../common/axure-types';

import CentralizedProcurementLayout from '../../components/centralized-procurement-layout';

// --- Mock Data ---

const treeData = [
  {
    value: 'org_cscec',
    title: '中国建筑',
    children: [
      {
        value: 'org_cscec_1',
        title: '中建一局',
        children: [
          { value: 'org_cscec_1_1', title: '一局一公司' },
          { value: 'org_cscec_1_2', title: '一局二公司' },
        ]
      },
      { value: 'org_cscec_2', title: '中建二局' },
      { value: 'org_cscec_3', title: '中建三局' },
      { value: 'org_cscec_4', title: '中建四局' },
      { value: 'org_cscec_8', title: '中建八局' },
    ],
  },
];

const initialData = [
  {
    id: '1',
    name: '张合规',
    account: 'zhanghegui',
    hrOrg: '中建一局',
    hrOrgValue: 'org_cscec_1',
    type: ['合规专员'],
    qualOrg: '中建一局',
    qualOrgValue: 'org_cscec_1',
    status: true,
    updater: 'admin',
    updateTime: '2026-08-20 10:00:00',
  },
  {
    id: '2',
    name: '王专家',
    account: 'wangzhuanjia',
    hrOrg: '中建一局',
    hrOrgValue: 'org_cscec_1',
    type: ['合规专家'],
    qualOrg: '中国建筑',
    qualOrgValue: 'org_cscec',
    status: true,
    updater: 'admin',
    updateTime: '2026-08-25 14:30:00',
  },
  {
    id: '3',
    name: '李稽查',
    account: 'lijicha',
    hrOrg: '中建八局',
    hrOrgValue: 'org_cscec_8',
    type: ['稽查专家'],
    qualOrg: '中国建筑',
    qualOrgValue: 'org_cscec',
    status: false,
    updater: 'jctest1',
    updateTime: '2026-07-10 09:15:00',
  },
  {
    id: '4',
    name: '赵全能',
    account: 'zhaoquanneng',
    hrOrg: '中建三局',
    hrOrgValue: 'org_cscec_3',
    type: ['合规专员', '合规专家'],
    qualOrg: '中建三局',
    qualOrgValue: 'org_cscec_3',
    status: true,
    updater: 'admin',
    updateTime: '2026-08-01 16:45:00',
  },
  {
    id: '5',
    name: '孙合规',
    account: 'sunhegui',
    hrOrg: '中建四局',
    hrOrgValue: 'org_cscec_4',
    type: ['合规专员'],
    qualOrg: '中建四局',
    qualOrgValue: 'org_cscec_4',
    status: true,
    updater: 'admin',
    updateTime: '2026-05-20 11:20:00',
  }
];

const userOptions = [
  { label: '张合规 (zhanghegui)', value: 'zhanghegui', hrOrg: '中建一局', hrOrgValue: 'org_cscec_1' },
  { label: '王专家 (wangzhuanjia)', value: 'wangzhuanjia', hrOrg: '中建一局', hrOrgValue: 'org_cscec_1' },
  { label: '李稽查 (lijicha)', value: 'lijicha', hrOrg: '中建八局', hrOrgValue: 'org_cscec_8' },
  { label: '赵全能 (zhaoquanneng)', value: 'zhaoquanneng', hrOrg: '中建三局', hrOrgValue: 'org_cscec_3' },
  { label: '孙合规 (sunhegui)', value: 'sunhegui', hrOrg: '中建四局', hrOrgValue: 'org_cscec_4' },
  { label: '周新员 (zhouxinyuan)', value: 'zhouxinyuan', hrOrg: '中建二局', hrOrgValue: 'org_cscec_2' },
];

// --- Component ---

const Component = forwardRef<AxureHandle, AxureProps>((props, ref) => {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [dataSource, setDataSource] = useState(initialData);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [form] = Form.useForm();

  // Handlers
  const handleSearch = useCallback(() => {
    message.info('执行查询操作');
  }, []);

  const handleReset = useCallback(() => {
    message.info('重置查询条件');
  }, []);

  const goForm = useCallback((record: any = null) => {
    if (record) {
      setEditingRecord(record);
      form.setFieldsValue({
        user: record.account,
        hrOrg: record.hrOrg,
        qualOrg: record.qualOrgValue,
        type: record.type,
      });
    } else {
      setEditingRecord(null);
      form.resetFields();
    }
    setView('form');
  }, [form]);

  const goList = useCallback(() => {
    setView('list');
  }, []);

  const handleUserChange = useCallback((value: string) => {
    const user = userOptions.find(item => item.value === value);
    form.setFieldsValue({ hrOrg: user?.hrOrg ?? undefined });
  }, [form]);

  const onFinish = useCallback((values: any) => {
    const user = userOptions.find(u => u.value === values.user);
    const qualOrgNode = findTreeNode(treeData, values.qualOrg);
    
    const newRecord = {
      id: editingRecord ? editingRecord.id : Date.now().toString(),
      name: user?.label.split(' ')[0] || '',
      account: values.user,
      hrOrg: user?.hrOrg || '',
      hrOrgValue: user?.hrOrgValue || '',
      type: values.type,
      qualOrg: qualOrgNode?.title || '',
      qualOrgValue: values.qualOrg,
      status: editingRecord ? editingRecord.status : true,
      updater: 'admin',
      updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    };

    if (editingRecord) {
      setDataSource(dataSource.map(item => item.id === editingRecord.id ? newRecord : item));
      message.success('更新成功');
    } else {
      setDataSource([newRecord, ...dataSource]);
      message.success('新增成功');
    }
    goList();
  }, [editingRecord, dataSource, goList]);

  const handleDelete = useCallback((id: string) => {
    setDataSource(dataSource.filter(item => item.id !== id));
    message.success('删除成功');
  }, [dataSource]);

  const handleStatusChange = useCallback((checked: boolean, record: any) => {
    setDataSource(dataSource.map(item => item.id === record.id ? { ...item, status: checked } : item));
    message.success(`已${checked ? '启用' : '停用'}`);
  }, [dataSource]);

  // Helper: Find tree node by value
  function findTreeNode(data: any[], value: string): any {
    for (const node of data) {
      if (node.value === value) return node;
      if (node.children) {
        const found = findTreeNode(node.children, value);
        if (found) return found;
      }
    }
    return null;
  }

  // Table Columns
  const columns = [
    {
      title: '序号',
      key: 'index',
      width: 72,
      align: 'center' as const,
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (text: string, record: any) => (
        <span>{text} ({record.account})</span>
      )
    },
    {
      title: '账号所属组织',
      dataIndex: 'hrOrg',
      key: 'hrOrg',
      width: 180,
    },
    {
      title: '人员类型',
      dataIndex: 'type',
      key: 'type',
      width: 220,
      render: (types: string[]) => (
        <Space size={[0, 4]} wrap>
          {types.map(t => {
            let color = 'blue';
            if (t === '合规专家') color = 'cyan';
            if (t === '稽查专家') color = 'orange';
            return <Tag color={color} key={t}>{t}</Tag>;
          })}
        </Space>
      )
    },
    {
      title: '资格所属组织',
      dataIndex: 'qualOrg',
      key: 'qualOrg',
      width: 180,
    },
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
          unCheckedChildren="停用"
        />
      )
    },
    {
      title: '更新人',
      dataIndex: 'updater',
      key: 'updater',
      width: 120,
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right' as const,
      width: 150,
      render: (_: any, record: any) => (
        <Space size="middle">
          <a onClick={() => goForm(record)}>编辑</a>
          <Popconfirm title="确定删除该人员资格吗？" onConfirm={() => handleDelete(record.id)}>
            <a style={{ color: '#ff4d4f' }}>删除</a>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Expose actions
  useImperativeHandle(ref, () => ({
    executeAction: (actionName: string, params?: any) => {
      console.log('Action:', actionName, params);
    },
    getVars: () => ({ view, dataSource }),
    setVars: (vars: any) => {
      if (vars.view) setView(vars.view);
    }
  }));

  return (
    <CentralizedProcurementLayout
      username="jctest1"
      activeMenuKey="compliance-personnel-library"
    >
      <div className="compliance-personnel-page">
        <div className="breadcrumb-bar compliance-breadcrumb-bar">
          <Breadcrumb items={[
            { title: '首页' },
            { title: '招标采购' },
            { title: '一单一检' },
            { title: '合规人员库' },
            ...(view === 'form' ? [{ title: editingRecord ? '编辑人员资格' : '新增人员资格' }] : [])
          ]} />
        </div>

        <div className="content-wrapper">
          {view === 'list' ? (
            <>
              <div className="filter-card">
                <div className="filter-title">查询条件</div>
                <Form layout="inline" onFinish={handleSearch}>
                  <Row className="filter-form" gutter={[16, 16]}>
                    <Col span={6}>
                      <div className="filter-item">
                        <span className="filter-label">人员姓名：</span>
                        <Input placeholder="请输入" />
                      </div>
                    </Col>
                    <Col span={6}>
                      <div className="filter-item">
                        <span className="filter-label">账号/手机号：</span>
                        <Input placeholder="请输入" />
                      </div>
                    </Col>
                    <Col span={6}>
                      <div className="filter-item">
                        <span className="filter-label">账号所属组织：</span>
                        <TreeSelect treeData={treeData} placeholder="请选择" allowClear />
                      </div>
                    </Col>
                    <Col span={6}>
                      <div className="filter-item">
                        <span className="filter-label">资格所属组织：</span>
                        <TreeSelect treeData={treeData} placeholder="请选择" allowClear />
                      </div>
                    </Col>
                    <Col span={6}>
                      <div className="filter-item">
                        <span className="filter-label">人员类型：</span>
                        <Select
                          mode="multiple"
                          placeholder="请选择"
                          options={[
                            { label: '合规专员', value: '合规专员' },
                            { label: '合规专家', value: '合规专家' },
                            { label: '稽查专家', value: '稽查专家' },
                          ]}
                        />
                      </div>
                    </Col>
                    <Col span={18}>
                      <Space className="filter-actions">
                        <Button type="primary" icon={<SearchOutlined />} htmlType="submit">查询</Button>
                        <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
                      </Space>
                    </Col>
                  </Row>
                </Form>
              </div>

            <div className="data-card">
              <div className="table-toolbar">
                <Space size={12}>
                  <Button 
                    disabled={selectedRowKeys.length === 0}
                    onClick={() => message.success('批量启用成功')}
                  >
                    批量启用
                  </Button>
                  <Button 
                    disabled={selectedRowKeys.length === 0}
                    onClick={() => message.success('批量停用成功')}
                  >
                    批量停用
                  </Button>
                </Space>
                <Space size={12}>
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => goForm()}>新增人员资格</Button>
                </Space>
              </div>
              <Table
                rowSelection={{
                  selectedRowKeys,
                  onChange: setSelectedRowKeys,
                }}
                columns={columns}
                dataSource={dataSource}
                rowKey="id"
                scroll={{ x: 1500 }}
                pagination={{
                  showTotal: (total) => `共 ${total} 条记录`,
                  showSizeChanger: true,
                  showQuickJumper: true,
                }}
              />
            </div>
          </>
        ) : (
          <div className="form-card">
            <div className="filter-title">{editingRecord ? '编辑人员资格' : '新增人员资格'}</div>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              className="personnel-qualification-form"
            >
              <div className="form-section-title">人员基本信息</div>
              <Space size={24} align="start" style={{ width: '100%' }}>
                <Form.Item
                  label="选择系统用户"
                  name="user"
                  rules={[{ required: true, message: '请选择用户' }]}
                  style={{ width: 300 }}
                >
                  <Select
                    showSearch
                    placeholder="输入姓名或账号搜索"
                    options={userOptions}
                    disabled={!!editingRecord}
                    onChange={handleUserChange}
                  />
                </Form.Item>
                <Form.Item label="账号所属组织" name="hrOrg" style={{ width: 300 }}>
                  <Input disabled placeholder="选择用户后自动带出" />
                </Form.Item>
              </Space>

              <div className="form-section-title" style={{ marginTop: 24 }}>资格配置</div>
              <Form.Item
                label="资格所属组织"
                name="qualOrg"
                rules={[{ required: true, message: '请选择资格所属组织' }]}
              >
                <TreeSelect
                  treeData={treeData}
                  placeholder="请选择组织"
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                label="人员类型"
                name="type"
                rules={[{ required: true, message: '请至少选择一种人员类型' }]}
              >
                <Checkbox.Group options={['合规专员', '合规专家', '稽查专家']} />
              </Form.Item>

              <Form.Item label="备注说明" name="remark">
                <Input.TextArea rows={4} placeholder="请输入备注信息" />
              </Form.Item>

              <Form.Item className="personnel-qualification-actions">
                <Space size={16}>
                  <Button type="primary" htmlType="submit" size="large" style={{ width: 120 }}>保存</Button>
                  <Button onClick={goList} size="large" style={{ width: 120 }}>取消</Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </div>
    </div>
  </CentralizedProcurementLayout>
);
});

Component.displayName = 'CompliancePersonnelLibrary';

export default Component;
