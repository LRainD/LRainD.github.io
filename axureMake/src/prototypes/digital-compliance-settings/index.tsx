/**
 * @name 数字合规官设置
 * @mode axure
 *
 * 参考资料：
 * - /rules/development-guide.md
 * - /skills/axure-export-workflow/SKILL.md
 * - /rules/axure-api-guide.md
 * - /src/prototypes/business-warning-monitor/index.tsx
 */

import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import {
  Edit3,
  Shield,
  UserCheck
} from 'lucide-react';
import {
  Button,
  Table,
  Modal,
  Form,
  Select,
  message,
  Space,
  Card,
  TreeSelect
} from 'antd';
import type {
  AxureProps,
  AxureHandle
} from '../../common/axure-types';

import CentralizedProcurementLayout from '../../components/centralized-procurement-layout';
import './style.css';

// --- Mock Data ---

// 模拟当前登录用户是否为管理员
const currentUser = {
  id: 'jctest1',
  name: 'jctest1',
  isAdmin: true, // 控制是否显示该菜单和页面
  managedOrgs: ['org_cscec_1', 'org_cscec_2'], // 管理的组织
};

// 组织树数据
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

// 人员选项
const personnelOptions = [
  { label: '张合规 (zhanghegui)', value: '张合规(zhanghegui)' },
  { label: '李风控 (lifengkong)', value: '李风控(lifengkong)' },
  { label: '王小明 (wangxiaoming)', value: '王小明(wangxiaoming)' },
  { label: '赵法务 (zhaofawu)', value: '赵法务(zhaofawu)' },
  { label: '孙专员 (sunzhuanyuan)', value: '孙专员(sunzhuanyuan)' },
  { label: '周合规 (zhouhegui)', value: '周合规(zhouhegui)' },
  { label: '吴风控 (wufengkong)', value: '吴风控(wufengkong)' },
];

// 初始合规人员配置数据
const initialData = [
  {
    id: '1',
    orgName: '中建一局',
    orgValue: 'org_cscec_1',
    configScope: '本级',
    businessSystem: '招投标',
    compliancePersonnel: ['张合规(zhanghegui)', '李风控(lifengkong)'],
    createTime: '2026-05-20 09:15:00',
    updateTime: '2026-05-27 13:01:08',
    creator: '王管理(wangguanli)',
    updater: 'jctest1',
  },
  {
    id: '2',
    orgName: '中建二局',
    orgValue: 'org_cscec_2',
    configScope: '本下级',
    businessSystem: '合同',
    compliancePersonnel: ['王小明(wangxiaoming)', '赵法务(zhaofawu)', '孙专员(sunzhuanyuan)'],
    createTime: '2026-05-22 10:30:00',
    updateTime: '2026-05-26 17:59:22',
    creator: '刘管理(liuguanli)',
    updater: 'admin',
  },
];

// --- Component ---

const Component = forwardRef<AxureHandle, AxureProps>((props, ref) => {
  const { eventList = [] } = props;

  // State
  const [dataSource, setDataSource] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit'>('add');
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [form] = Form.useForm();
  const [searchOrg] = useState<string | undefined>(undefined);
  const [includeChildren] = useState(true);

  // 检查用户是否有权限访问此页面
  const hasPermission = currentUser.isAdmin;

  // Helper: Get org title from value
  const getOrgTitle = (value: string) => {
    const allNodes = treeData.flatMap((d: any) => [d, ...(d.children || [])]);
    return allNodes.find((n: any) => n.value === value)?.title || value;
  };

  // Handlers
  const handleDelete = useCallback((id: string) => {
    setDataSource(dataSource.filter((item: any) => item.id !== id));
    message.success('删除成功');

    const event = eventList.find((e: any) => e.name === 'onConfigDelete');
    if (event) {
      console.log('Trigger event:', event.name, { id });
    }
  }, [dataSource, eventList]);

  const openModal = useCallback((type: 'add' | 'edit' | 'view', record: any = null) => {
    setModalType(type);
    if (record) {
      setEditingRecord(record);
      form.setFieldsValue({
        orgName: record.orgValue,
        compliancePersonnel: record.compliancePersonnel,
      });
    } else {
      setEditingRecord(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  }, [form]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingRecord(null);
    form.resetFields();
  }, [form]);

  const onFinish = useCallback((values: any) => {
    const selectedOrgTitle = getOrgTitle(values.orgName);

    if (modalType === 'add') {
      // 检查组织是否已存在配置
      if (dataSource.some((item: any) => item.orgValue === values.orgName)) {
        message.error('该组织已存在合规人员配置，请勿重复添加');
        return;
      }

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
        orgValue: values.orgName,
        compliancePersonnel: values.compliancePersonnel || [],
        createTime: currentTime,
        updateTime: currentTime,
        creator: currentUser.name,
        updater: currentUser.name,
      };
      setDataSource([newRecord, ...dataSource]);
      message.success('保存成功');

      const event = eventList.find((e: any) => e.name === 'onConfigAdd');
      if (event) {
        console.log('Trigger event:', event.name, { record: newRecord });
      }
    } else {
      const newData = dataSource.map((item: any) => {
        if (item.id === editingRecord.id) {
          return {
            ...item,
            compliancePersonnel: values.compliancePersonnel || [],
            updateTime: new Date().toLocaleString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            }).replace(/\//g, '-'),
            updater: currentUser.name,
          };
        }
        return item;
      });
      setDataSource(newData);
      message.success('更新成功');

      const event = eventList.find((e: any) => e.name === 'onConfigEdit');
      if (event) {
        console.log('Trigger event:', event.name, { record: editingRecord });
      }
    }
    closeModal();
  }, [modalType, dataSource, editingRecord, eventList, closeModal]);

  // Expose actions via ref
  useImperativeHandle(ref, () => ({
    executeAction: (actionName: string, params?: any) => {
      switch (actionName) {
        case 'refreshList':
          console.log('Action: refreshList');
          break;
        case 'openAddModal':
          openModal('add');
          break;
        case 'openEditModal':
          const record = dataSource.find((item: any) => item.id === params?.id);
          if (record) openModal('edit', record);
          break;
        default:
          console.warn('Unknown action:', actionName);
      }
    },
    getVars: () => ({
      dataSource,
      isModalOpen,
      modalType,
      editingRecord,
    }),
    setVars: (vars: Record<string, any>) => {
      if (vars.dataSource) setDataSource(vars.dataSource);
      if (vars.isModalOpen !== undefined) setIsModalOpen(vars.isModalOpen);
    }
  }));

  // Table columns
  const columns = [
    { title: '序号', dataIndex: 'index', key: 'index', render: (_: any, __: any, index: number) => index + 1, width: 80 },
    { title: '组织名称', dataIndex: 'orgName', key: 'orgName', width: 180 },
    { title: '配置范围', dataIndex: 'configScope', key: 'configScope', width: 100 },
    { title: '业务系统', dataIndex: 'businessSystem', key: 'businessSystem', width: 100 },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
    { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime', width: 180 },
    { title: '更新人', dataIndex: 'updater', key: 'updater', width: 120 },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button
            type="link"
            onClick={() => openModal('view', record)}
          >
            查看
          </Button>
          <Button
            type="link"
            icon={<Edit3 size={14} />}
            onClick={() => openModal('edit', record)}
          >
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  // Filter data
  const filteredData = dataSource.filter((item: any) => {
    if (!searchOrg) return true;
    if (includeChildren) {
      // 简化处理：只匹配当前组织
      return item.orgValue === searchOrg || item.orgValue.startsWith(searchOrg + '_');
    }
    return item.orgValue === searchOrg;
  });

  // 如果没有权限，显示无权限提示
  if (!hasPermission) {
    return (
      <div className="digital-compliance-settings">
        <div className="no-permission">
          <Shield size={64} style={{ color: '#ccc', marginBottom: 16 }} />
          <h2>暂无权限访问</h2>
          <p>您不是该组织的数字合规官管理员，无法访问此页面</p>
        </div>
      </div>
    );
  }

  return (
    <CentralizedProcurementLayout
      username={currentUser.name}
      activeMenuKey="compliance-settings"
    >
      {/* 面包屑 */}
      <div className="breadcrumb">
        <span>风控预警中心</span>
        <span className="separator">&gt;</span>
        <span className="current">合规官设置</span>
      </div>

      {/* 数据表格 */}
      <Card>
        <div className="table-toolbar">
          <div className="toolbar-left">
            <span className="toolbar-title">合规人员配置列表</span>
          </div>
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
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* 新增/编辑/查看弹窗 */}
      <Modal
        title={modalType === 'add' ? '新增合规人员配置' : modalType === 'view' ? '查看合规人员配置' : '编辑合规人员配置'}
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        width={560}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ marginTop: 24 }}
        >
          <Form.Item
            label="选择组织"
            name="orgName"
            rules={[{ required: true, message: '请选择组织' }]}
          >
            <TreeSelect
              treeData={treeData}
              placeholder="请选择组织"
              treeDefaultExpandAll
              disabled={modalType === 'edit' || modalType === 'view'}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="合规人员"
            name="compliancePersonnel"
            rules={[{ required: true, message: '请至少选择一名合规人员' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择合规人员"
              options={personnelOptions}
              disabled={modalType === 'view'}
              style={{ width: '100%' }}
              optionRender={(option) => (
                <Space>
                  <UserCheck size={14} />
                  {option.label}
                </Space>
              )}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={closeModal}>{modalType === 'view' ? '关闭' : '取消'}</Button>
              {modalType !== 'view' && (
                <Button type="primary" htmlType="submit">
                  {modalType === 'edit' ? '提交' : '保存'}
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </CentralizedProcurementLayout>
  );
});

Component.displayName = 'DigitalComplianceSettings';

export default Component;
