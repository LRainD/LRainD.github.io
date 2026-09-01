/**
 * @name 组织业务配置
 * @mode axure
 * 
 * 参考资料：
 * - /Users/liurundong/Desktop/remote_demo_project/LRainD.github.io/axureMake/docs/四局一单一检/prd.md
 * - /Users/liurundong/Desktop/remote_demo_project/LRainD.github.io/axureMake/src/prototypes/organization-dispatch-config/spec.md
 */

import './style.css';
import React, { useState, useMemo } from 'react';
import {
  Form,
  Radio,
  Button,
  Table,
  Space,
  Tag,
  message,
  Input,
  Breadcrumb,
  Modal,
  Divider,
  Select,
  Switch,
  InputNumber,
  TreeSelect,
  Popconfirm,
  Descriptions
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import CentralizedProcurementLayout from '../../components/centralized-procurement-layout';

// --- Mock Data ---

const treeData = [
  {
    value: 'org_cscec',
    title: '中国建筑股份有限公司',
    children: [
      {
        value: 'org_cscec_1',
        title: '中建一局',
        children: [
          { value: 'org_cscec_1_1', title: '一局一公司' },
          { value: 'org_cscec_1_2', title: '一局二公司' },
          { value: 'org_cscec_1_3', title: '一局三公司' },
        ]
      },
      {
        value: 'org_cscec_2',
        title: '中建二局',
        children: [
          { value: 'org_cscec_2_1', title: '二局一公司' },
          { value: 'org_cscec_2_2', title: '二局二公司' },
        ]
      },
      {
        value: 'org_cscec_3',
        title: '中建三局',
        children: [
          { value: 'org_cscec_3_1', title: '三局一公司' },
          { value: 'org_cscec_3_2', title: '三局总承包公司' },
        ]
      },
      {
        value: 'org_cscec_4',
        title: '中建四局',
        children: [
          { value: 'org_cscec_4_1', title: '四局一公司' },
          { value: 'org_cscec_4_2', title: '四局建设发展公司' },
        ]
      }
    ]
  }
];

const templateOptions = [
  {
    value: 'tpl_1',
    label: '一局普通合同检查模板（V1.0）',
    checkTypes: ['self', 'mutual'],
    effectiveTime: '2026-01-01 00:00:00'
  },
  {
    value: 'tpl_2',
    label: '采购合同专项检查模板（V2.0）',
    checkTypes: ['self'],
    effectiveTime: '2026-06-01 00:00:00'
  },
  {
    value: 'tpl_3',
    label: '跨单位互查检查模板（V1.2）',
    checkTypes: ['mutual'],
    effectiveTime: '2026-07-15 00:00:00'
  }
];

const getTemplateOptions = (checkType: 'self' | 'mutual') => templateOptions
  .filter(template => template.checkTypes.includes(checkType))
  .map(template => ({
    value: template.value,
    label: template.label
  }));

const getTemplateLabel = (templateId?: string) => (
  templateOptions.find(template => template.value === templateId)?.label || '-'
);

interface ConfigRecord {
  id: string;
  orgKey: string;
  orgName: string;
  selfDispatchMode: 'auto' | 'manual';
  selfTemplateId?: string;
  mutualDispatchMode: 'auto' | 'manual';
  mutualTemplateId?: string;
  selfAutoRecall: boolean;
  selfRecallHours?: number;
  mutualAutoRecall: boolean;
  mutualRecallHours?: number;
  updatedBy: string;
  updatedTime: string;
}

const initialDataSource: ConfigRecord[] = [
  {
    id: '1',
    orgKey: 'org_cscec_1',
    orgName: '中建一局',
    selfDispatchMode: 'auto',
    selfTemplateId: 'tpl_1',
    mutualDispatchMode: 'manual',
    selfAutoRecall: true,
    selfRecallHours: 72,
    mutualAutoRecall: false,
    updatedBy: 'zhanghegui',
    updatedTime: '2026-08-20 10:00:00'
  },
  {
    id: '2',
    orgKey: 'org_cscec_1_1',
    orgName: '一局一公司',
    selfDispatchMode: 'manual',
    mutualDispatchMode: 'auto',
    mutualTemplateId: 'tpl_3',
    selfAutoRecall: false,
    mutualAutoRecall: true,
    mutualRecallHours: 48,
    updatedBy: 'admin',
    updatedTime: '2026-08-22 11:15:00'
  },
  {
    id: '3',
    orgKey: 'org_cscec_1_2',
    orgName: '一局二公司',
    selfDispatchMode: 'auto',
    selfTemplateId: 'tpl_2',
    mutualDispatchMode: 'auto',
    mutualTemplateId: 'tpl_3',
    selfAutoRecall: true,
    selfRecallHours: 48,
    mutualAutoRecall: true,
    mutualRecallHours: 72,
    updatedBy: 'wangzhuanjia',
    updatedTime: '2026-08-25 09:45:00'
  },
  {
    id: '4',
    orgKey: 'org_cscec_4',
    orgName: '中建四局',
    selfDispatchMode: 'auto',
    selfTemplateId: 'tpl_1',
    mutualDispatchMode: 'manual',
    selfAutoRecall: false,
    mutualAutoRecall: false,
    updatedBy: 'admin',
    updatedTime: '2026-08-28 16:20:00'
  }
];

export default function OrganizationDispatchConfig() {
  const [dataSource, setDataSource] = useState<ConfigRecord[]>(initialDataSource);
  const [searchForm] = Form.useForm();
  const [modalForm] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ConfigRecord | null>(null);
  const [filterParams, setFilterParams] = useState<any>({});
  const selfDispatchMode = Form.useWatch('selfDispatchMode', modalForm);
  const mutualDispatchMode = Form.useWatch('mutualDispatchMode', modalForm);
  const isSelfRecallEnabled = Form.useWatch('selfAutoRecall', modalForm);
  const isMutualRecallEnabled = Form.useWatch('mutualAutoRecall', modalForm);

  // 扁平化组织树，方便查找节点名称
  const flatOrgMap = useMemo(() => {
    const map = new Map<string, string>();
    const traverse = (nodes: any[]) => {
      nodes.forEach(node => {
        map.set(node.value, node.title);
        if (node.children) {
          traverse(node.children);
        }
      });
    };
    traverse(treeData);
    return map;
  }, []);

  // 过滤后的数据
  const filteredData = useMemo(() => {
    return dataSource.filter(item => {
      if (filterParams.orgName && !item.orgName.toLowerCase().includes(filterParams.orgName.toLowerCase())) {
        return false;
      }
      if (filterParams.selfDispatchMode && item.selfDispatchMode !== filterParams.selfDispatchMode) {
        return false;
      }
      if (filterParams.mutualDispatchMode && item.mutualDispatchMode !== filterParams.mutualDispatchMode) {
        return false;
      }
      return true;
    });
  }, [dataSource, filterParams]);

  // 查询与重置
  const handleSearch = (values: any) => {
    setFilterParams(values);
  };

  const handleReset = () => {
    searchForm.resetFields();
    setFilterParams({});
  };

  // 打开新增/编辑弹窗
  const openModal = (record?: ConfigRecord) => {
    if (record) {
      setEditingRecord(record);
      modalForm.setFieldsValue({
        orgKey: record.orgKey,
        selfDispatchMode: record.selfDispatchMode,
        selfTemplateId: record.selfTemplateId,
        mutualDispatchMode: record.mutualDispatchMode,
        mutualTemplateId: record.mutualTemplateId,
        selfAutoRecall: record.selfAutoRecall,
        selfRecallHours: record.selfRecallHours,
        mutualAutoRecall: record.mutualAutoRecall,
        mutualRecallHours: record.mutualRecallHours
      });
    } else {
      setEditingRecord(null);
      modalForm.resetFields();
      modalForm.setFieldsValue({
        selfDispatchMode: 'manual',
        selfTemplateId: undefined,
        mutualDispatchMode: 'manual',
        mutualTemplateId: undefined,
        selfAutoRecall: false,
        mutualAutoRecall: false
      });
    }
    setIsModalOpen(true);
  };

  // 保存配置
  const handleSave = () => {
    modalForm.validateFields().then(values => {
      // 校验组织是否重复配置
      if (!editingRecord) {
        const isDuplicate = dataSource.some(item => item.orgKey === values.orgKey);
        if (isDuplicate) {
          message.error('该组织已存在配置，请直接编辑已有配置！');
          return;
        }
      }

      Modal.confirm({
        title: '确认保存配置？',
        icon: <ExclamationCircleOutlined />,
        content: '配置变更仅影响配置生效后新生成的自查、互查任务，不追溯已派发的历史任务。',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          const orgName = flatOrgMap.get(values.orgKey) || '';
          const newRecord: ConfigRecord = {
            id: editingRecord ? editingRecord.id : Date.now().toString(),
            orgKey: values.orgKey,
            orgName,
            selfDispatchMode: values.selfDispatchMode,
            selfTemplateId: values.selfDispatchMode === 'auto' ? values.selfTemplateId : undefined,
            mutualDispatchMode: values.mutualDispatchMode,
            mutualTemplateId: values.mutualDispatchMode === 'auto' ? values.mutualTemplateId : undefined,
            selfAutoRecall: values.selfAutoRecall,
            selfRecallHours: values.selfAutoRecall ? values.selfRecallHours : undefined,
            mutualAutoRecall: values.mutualAutoRecall,
            mutualRecallHours: values.mutualAutoRecall ? values.mutualRecallHours : undefined,
            updatedBy: 'admin',
            updatedTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
          };

          if (editingRecord) {
            setDataSource(prev => prev.map(item => item.id === editingRecord.id ? newRecord : item));
            message.success('配置更新成功！');
          } else {
            setDataSource(prev => [newRecord, ...prev]);
            message.success('配置新增成功！');
          }
          setIsModalOpen(false);
        }
      });
    });
  };

  // 删除配置
  const handleDelete = (id: string) => {
    setDataSource(prev => prev.filter(item => item.id !== id));
    message.success('配置删除成功！');
  };

  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      render: (_: any, __: any, index: number) => index + 1
    },
    {
      title: '组织名称',
      dataIndex: 'orgName',
      key: 'orgName',
      width: 200,
      render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>
    },
    {
      title: '自查派发模式',
      dataIndex: 'selfDispatchMode',
      key: 'selfDispatchMode',
      width: 150,
      render: (mode: 'auto' | 'manual') => (
        <Tag color={mode === 'auto' ? 'blue' : 'orange'}>
          {mode === 'auto' ? '自动派发' : '人工指定'}
        </Tag>
      )
    },
    {
      title: '自动派发模板',
      key: 'dispatchTemplate',
      width: 260,
      render: (_: any, record: ConfigRecord) => (
        <Descriptions className="template-description" size="small" column={1} colon={false}>
          <Descriptions.Item label="自查">
            {record.selfDispatchMode === 'auto' ? getTemplateLabel(record.selfTemplateId) : '人工指定，无需配置'}
          </Descriptions.Item>
          <Descriptions.Item label="互查">
            {record.mutualDispatchMode === 'auto' ? getTemplateLabel(record.mutualTemplateId) : '人工指定，无需配置'}
          </Descriptions.Item>
        </Descriptions>
      )
    },
    {
      title: '互查派发模式',
      dataIndex: 'mutualDispatchMode',
      key: 'mutualDispatchMode',
      width: 150,
      render: (mode: 'auto' | 'manual') => (
        <Tag color={mode === 'auto' ? 'blue' : 'orange'}>
          {mode === 'auto' ? '自动派发' : '人工指定'}
        </Tag>
      )
    },
    {
      title: '超时自动收回',
      key: 'autoRecall',
      width: 240,
      render: (_: any, record: ConfigRecord) => (
        <Descriptions className="recall-description" size="small" column={1} colon={false}>
          <Descriptions.Item label="自查">
            {record.selfAutoRecall ? `已启用${record.selfRecallHours ? `（${record.selfRecallHours}小时）` : ''}` : '已禁用'}
          </Descriptions.Item>
          <Descriptions.Item label="互查">
            {record.mutualAutoRecall ? `已启用${record.mutualRecallHours ? `（${record.mutualRecallHours}小时）` : ''}` : '已禁用'}
          </Descriptions.Item>
        </Descriptions>
      )
    },
    {
      title: '更新人',
      dataIndex: 'updatedBy',
      key: 'updatedBy',
      width: 120
    },
    {
      title: '更新时间',
      dataIndex: 'updatedTime',
      key: 'updatedTime',
      width: 180
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: ConfigRecord) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} onClick={() => openModal(record)} style={{ padding: 0 }}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除该组织的业务配置吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />} style={{ padding: 0 }}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <CentralizedProcurementLayout activeMenuKey="organization-dispatch-config">
      <div className="dispatch-config-container">
        {/* 面包屑 */}
        <div className="breadcrumb-area">
          <Breadcrumb>
            <Breadcrumb.Item>首页</Breadcrumb.Item>
            <Breadcrumb.Item>招标采购</Breadcrumb.Item>
            <Breadcrumb.Item>一单一检</Breadcrumb.Item>
            <Breadcrumb.Item>组织业务配置</Breadcrumb.Item>
          </Breadcrumb>
        </div>

        {/* 查询区域 */}
        <div className="filter-card">
          <Form form={searchForm} layout="inline" onFinish={handleSearch}>
            <Form.Item name="orgName" label="组织名称">
              <Input placeholder="请输入组织名称" allowClear style={{ width: 200 }} />
            </Form.Item>
            <Form.Item name="selfDispatchMode" label="自查派发">
              <Select
                placeholder="全部"
                allowClear
                style={{ width: 150 }}
                options={[
                  { value: 'auto', label: '自动派发' },
                  { value: 'manual', label: '人工指定' }
                ]}
              />
            </Form.Item>
            <Form.Item name="mutualDispatchMode" label="互查派发">
              <Select
                placeholder="全部"
                allowClear
                style={{ width: 150 }}
                options={[
                  { value: 'auto', label: '自动派发' },
                  { value: 'manual', label: '人工指定' }
                ]}
              />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" icon={<SearchOutlined />} htmlType="submit">
                  查询
                </Button>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>
                  重置
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </div>

        {/* 数据表格区域 */}
        <div className="table-card">
          <div className="table-toolbar">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
              新增配置
            </Button>
          </div>
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条记录` }}
            size="middle"
          />
        </div>

        {/* 新增/编辑配置弹窗 */}
        <Modal
          title={editingRecord ? '编辑组织业务配置' : '新增组织业务配置'}
          open={isModalOpen}
          onOk={handleSave}
          onCancel={() => setIsModalOpen(false)}
          width={680}
          destroyOnClose
        >
          <Form
            form={modalForm}
            layout="vertical"
            style={{ marginTop: 16 }}
          >
            <Form.Item
              name="orgKey"
              label="配置组织"
              rules={[{ required: true, message: '请选择配置组织' }]}
            >
              <TreeSelect
                treeData={treeData}
                placeholder="请选择组织"
                allowClear
                treeDefaultExpandAll
                disabled={!!editingRecord}
              />
            </Form.Item>

            <Form.Item
              name="selfDispatchMode"
              label="自查派发模式"
              rules={[{ required: true, message: '请选择自查派发模式' }]}
            >
              <Radio.Group>
                <Radio value="auto">自动派发</Radio>
                <Radio value="manual">人工指定</Radio>
              </Radio.Group>
            </Form.Item>
            <div className="form-item-desc">
              {selfDispatchMode === 'auto'
                ? '自动派发：系统自动从该组织的合规专员库中，按待办量均衡派发任务。' 
                : '人工指定：系统生成“待派发”任务，由单位供应链负责人手动指定合规专员。'}
            </div>
            {selfDispatchMode === 'auto' && (
              <Form.Item
                name="selfTemplateId"
                label="自查自动派发模板"
                rules={[{ required: true, message: '请选择自查自动派发模板' }]}
              >
                <Select
                  placeholder="请选择已发布且适用于自查的模板"
                  options={getTemplateOptions('self')}
                />
              </Form.Item>
            )}
            <Form.Item
              name="selfAutoRecall"
              label="自查超时自动收回"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <div className="form-item-desc">
              开启后，自查任务超过配置时限未办结将被系统自动收回，并按所属组织派发模式重新处理。
            </div>
            {isSelfRecallEnabled && (
              <Form.Item
                name="selfRecallHours"
                label="自查收回时限 (小时)"
                rules={[
                  { required: true, message: '请输入收回时限' },
                  { type: 'number', min: 1, message: '时限必须大于0' }
                ]}
                style={{ marginTop: 12 }}
              >
                <InputNumber min={1} addonAfter="小时" style={{ width: '100%' }} />
              </Form.Item>
            )}

            <Divider style={{ margin: '16px 0' }} />

            <Form.Item
              name="mutualDispatchMode"
              label="互查派发模式"
              rules={[{ required: true, message: '请选择互查派发模式' }]}
            >
              <Radio.Group>
                <Radio value="auto">自动派发</Radio>
                <Radio value="manual">人工指定</Radio>
              </Radio.Group>
            </Form.Item>
            <div className="form-item-desc">
              {mutualDispatchMode === 'auto'
                ? '自动派发：系统从符合跨单位回避规则的合规专家中，按待办量均衡派发任务。'
                : '人工指定：系统生成“待派发”任务，由具备互查派发权限的人员指定合规专家。'}
            </div>
            {mutualDispatchMode === 'auto' && (
              <Form.Item
                name="mutualTemplateId"
                label="互查自动派发模板"
                rules={[{ required: true, message: '请选择互查自动派发模板' }]}
              >
                <Select
                  placeholder="请选择已发布且适用于互查的模板"
                  options={getTemplateOptions('mutual')}
                />
              </Form.Item>
            )}
            <Form.Item
              name="mutualAutoRecall"
              label="互查超时自动收回"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <div className="form-item-desc">
              开启后，互查任务超过配置时限未办结将被系统自动收回，并按所属组织派发模式重新处理。
            </div>
            {isMutualRecallEnabled && (
              <Form.Item
                name="mutualRecallHours"
                label="互查收回时限 (小时)"
                rules={[
                  { required: true, message: '请输入收回时限' },
                  { type: 'number', min: 1, message: '时限必须大于0' }
                ]}
                style={{ marginTop: 12 }}
              >
                <InputNumber min={1} addonAfter="小时" style={{ width: '100%' }} />
              </Form.Item>
            )}

            <div className="modal-tips-box">
              <InfoCircleOutlined className="tips-icon" />
              <div className="tips-content">
                配置变更仅影响配置生效后新生成的自查、互查任务，不追溯已派发的历史任务。
              </div>
            </div>
          </Form>
        </Modal>
      </div>
    </CentralizedProcurementLayout>
  );
}
