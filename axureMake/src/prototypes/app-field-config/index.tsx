/**
 * @name 应用字段配置
 */
import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Modal, Popconfirm, Select, Space, Table, Tag, TreeSelect } from 'antd';
import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor';
import { Editor, Toolbar } from '@wangeditor/editor-for-react';
import '@wangeditor/editor/dist/css/style.css';
import TemplateAdminLayout from '../../components/template-admin-layout';
import {
  APP_MOCK_DATA,
  BUSINESS_TYPE_TREE,
  BusinessTypeNode,
  DISPLAY_TYPE_OPTIONS,
  FIELD_TYPE_OPTIONS,
  FieldConfigItem,
  MOCK_DATA,
  ApplicationItem
} from './mock';
import './style.css';

const TAB_LIST = [
  { key: 'field', label: '字段配置' },
  { key: 'applicable', label: '适用配置' }
];

function renderUpdater(name: string) {
  return <span className="system-field-updater-name">{name}</span>;
}

const Component = function AppFieldConfig() {
  const [currentView, setCurrentView] = useState<'list' | 'config'>('list');
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);
  const [appListData, setAppListData] = useState<ApplicationItem[]>(APP_MOCK_DATA);
  const [addAppModalVisible, setAddAppModalVisible] = useState(false);
  const [addAppForm] = Form.useForm();

  const [activeTab, setActiveTab] = useState('field');
  const [data, setData] = useState<FieldConfigItem[]>(MOCK_DATA);
  const [form] = Form.useForm();

  const [descriptionModalVisible, setDescriptionModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [applicableModalVisible, setApplicableModalVisible] = useState(false);
  const [labelModalVisible, setLabelModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<FieldConfigItem | null>(null);
  const [selectedApplicableTypes, setSelectedApplicableTypes] = useState<string[]>([]);

  const [editor, setEditor] = useState<IDomEditor | null>(null);
  const [editorHtml, setEditorHtml] = useState('');
  const [labelForm] = Form.useForm();

  const toolbarConfig: Partial<IToolbarConfig> = {};
  const editorConfig: Partial<IEditorConfig> = {
    placeholder: '请输入字段说明…'
  };

  const treeMeta = useMemo(() => {
    const nodeMap = new Map<string, BusinessTypeNode>();
    const parentMap = new Map<string, string>();
    const pathMap = new Map<string, string[]>();
    const walk = (nodes: BusinessTypeNode[], parentPath: string[] = []) => {
      nodes.forEach(node => {
        const path = [...parentPath, node.title];
        nodeMap.set(node.value, node);
        pathMap.set(node.value, path);
        if (node.children) {
          node.children.forEach(child => parentMap.set(child.value, node.value));
          walk(node.children, path);
        }
      });
    };
    walk(BUSINESS_TYPE_TREE);
    return { nodeMap, parentMap, pathMap };
  }, []);

  useEffect(() => {
    return () => {
      if (editor == null) return;
      editor.destroy();
      setEditor(null);
    };
  }, [editor]);

  const handleEditApp = (record: ApplicationItem) => {
    setSelectedApp(record);
    setCurrentView('config');
    setActiveTab('field');
  };

  const handleAddApp = () => {
    setAddAppModalVisible(true);
  };

  const handleCancelAddApp = () => {
    addAppForm.resetFields();
    setAddAppModalVisible(false);
  };

  const handleSaveApp = async () => {
    try {
      const values = await addAppForm.validateFields();
      const newItem: ApplicationItem = {
        key: String(Date.now()),
        name: values.name,
        code: values.code,
        updateTime: '-',
        updater: '-'
      };
      setAppListData(prev => [newItem, ...prev]);
      addAppForm.resetFields();
      setAddAppModalVisible(false);
    } catch (error) {
      // 表单校验失败，保持弹窗打开
    }
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedApp(null);
  };

  const handleAddRow = () => {
    setData(prev => [
      ...prev,
      {
        key: `${Date.now()}`,
        displayName: '',
        fieldName: '',
        fieldType: 'field',
        displayType: 'editableInput',
        isNew: true
      }
    ]);
  };

  const handleDelete = (record: FieldConfigItem) => {
    if (record.usedByTemplate) {
      Modal.error({
        title: '无法删除',
        content: '该字段已被模板使用，无法删除',
        okText: '知道了'
      });
      return;
    }
    setData(prev => prev.filter(item => item.key !== record.key));
  };

  const handleFieldChange = (key: string, field: keyof FieldConfigItem, value: string) => {
    setData(prev =>
      prev.map(item => {
        if (item.key !== key) return item;
        if (field === 'fieldType' && value === 'form') {
          return { ...item, [field]: value, displayType: 'standardReplaceTag' };
        }
        return { ...item, [field]: value };
      })
    );
  };

  const handleSubmit = () => {
    setData(prev => prev.map(item => ({ ...item, isNew: false })));
    message.success('保存成功');
  };

  const handleOpenDescriptionModal = (record: FieldConfigItem) => {
    setCurrentRecord(record);
    setEditorHtml(record.description || '');
    setDescriptionModalVisible(true);
  };

  const handleSaveDescription = () => {
    if (!currentRecord) return;
    setData(prev =>
      prev.map(item => (item.key === currentRecord.key ? { ...item, description: editorHtml } : item))
    );
    setDescriptionModalVisible(false);
    setCurrentRecord(null);
    setEditorHtml('');
    message.success('保存成功');
  };

  const handleCancelDescription = () => {
    setDescriptionModalVisible(false);
    setCurrentRecord(null);
    setEditorHtml('');
  };

  const handleOpenViewModal = (record: FieldConfigItem) => {
    setCurrentRecord(record);
    setViewModalVisible(true);
  };

  const handleCloseViewModal = () => {
    setViewModalVisible(false);
    setCurrentRecord(null);
  };

  const handleOpenApplicableModal = (record: FieldConfigItem) => {
    setCurrentRecord(record);
    setSelectedApplicableTypes(record.applicableTypes || []);
    setApplicableModalVisible(true);
  };

  const handleSaveApplicableTypes = () => {
    if (!currentRecord) return;
    setData(prev =>
      prev.map(item => (item.key === currentRecord.key ? { ...item, applicableTypes: selectedApplicableTypes } : item))
    );
    setApplicableModalVisible(false);
    setCurrentRecord(null);
    setSelectedApplicableTypes([]);
    message.success('保存成功');
  };

  const handleCancelApplicableTypes = () => {
    setApplicableModalVisible(false);
    setCurrentRecord(null);
    setSelectedApplicableTypes([]);
  };

  const handleOpenLabelModal = (record: FieldConfigItem) => {
    setCurrentRecord(record);
    labelForm.setFieldsValue({ label: record.label || '' });
    setLabelModalVisible(true);
  };

  const handleSaveLabel = async () => {
    try {
      const values = await labelForm.validateFields();
      if (!currentRecord) return;
      setData(prev =>
        prev.map(item => (item.key === currentRecord.key ? { ...item, label: values.label } : item))
      );
      setLabelModalVisible(false);
      setCurrentRecord(null);
      labelForm.resetFields();
      message.success('保存成功');
    } catch (error) {
      // 表单校验失败，保持弹窗打开
    }
  };

  const handleCancelLabel = () => {
    setLabelModalVisible(false);
    setCurrentRecord(null);
    labelForm.resetFields();
  };

  const handleApplicableChange = (value: string[]) => {
    const prev = new Set(selectedApplicableTypes);
    const added = value.filter(v => !prev.has(v));
    const removed = selectedApplicableTypes.filter(v => !value.includes(v));
    const result = new Set(value);

    const checkUpward = (key: string) => {
      const parentKey = treeMeta.parentMap.get(key);
      if (!parentKey) return;
      const siblings = treeMeta.nodeMap.get(parentKey)?.children?.map(child => child.value) || [];
      if (siblings.every(s => result.has(s))) {
        result.add(parentKey);
        checkUpward(parentKey);
      }
    };

    const uncheckUpward = (key: string) => {
      const parentKey = treeMeta.parentMap.get(key);
      if (!parentKey) return;
      if (result.has(parentKey)) {
        result.delete(parentKey);
        uncheckUpward(parentKey);
      }
    };

    added.forEach(key => {
      const node = treeMeta.nodeMap.get(key);
      if (node?.children && node.children.length > 0) {
        return;
      }
      checkUpward(key);
    });

    removed.forEach(key => {
      const node = treeMeta.nodeMap.get(key);
      if (node?.children && node.children.length > 0) {
        return;
      }
      uncheckUpward(key);
    });

    setSelectedApplicableTypes(Array.from(result));
  };

  const renderApplicableTypeNames = (keys: string[] | undefined) => {
    if (!keys || keys.length === 0) return <span className="field-config-empty-text">—</span>;
    return (
      <Space size={8} wrap className="field-config-applicable-tags">
        {keys.map(key => {
          const path = treeMeta.pathMap.get(key) || [key];
          const label = path.join('/');
          return (
            <Tag key={key} className="field-config-applicable-tag" title={label}>
              {label}
            </Tag>
          );
        })}
      </Space>
    );
  };

  const renderTreeSelectTag = (props: { value: string | number; closable?: boolean; onClose?: () => void }) => {
    const { value, closable, onClose } = props;
    const path = treeMeta.pathMap.get(value as string) || [value as string];
    const label = path.join('/');
    return (
      <Tag className="field-config-applicable-tag" closable={closable} onClose={onClose} title={label}>
        {label}
      </Tag>
    );
  };

  const appListColumns = [
    {
      title: '应用名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '应用编码',
      dataIndex: 'code',
      key: 'code'
    },
    {
      title: '最近更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime'
    },
    {
      title: '最近更新人',
      dataIndex: 'updater',
      key: 'updater',
      render: (name: string) => renderUpdater(name)
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: unknown, record: ApplicationItem) => (
        <span
          className="system-field-action-link active"
          onClick={() => handleEditApp(record)}
        >
          编辑
        </span>
      )
    }
  ];

  const fieldColumns = [
    {
      title: <span className="field-config-required">范本内展示名称</span>,
      dataIndex: 'displayName',
      key: 'displayName',
      render: (_: unknown, record: FieldConfigItem) => (
        <Input
          value={record.displayName}
          placeholder="输入展示名称"
          disabled={!record.isNew}
          onChange={(e) => handleFieldChange(record.key, 'displayName', e.target.value)}
          className={`field-config-input ${!record.isNew ? 'field-config-input-disabled' : ''}`}
        />
      )
    },
    {
      title: <span className="field-config-required">应用字段名称（应用代码内定义字段名称）</span>,
      dataIndex: 'fieldName',
      key: 'fieldName',
      render: (_: unknown, record: FieldConfigItem) => (
        <Input
          value={record.fieldName}
          placeholder="输入应用字段名称"
          disabled={!record.isNew}
          onChange={(e) => handleFieldChange(record.key, 'fieldName', e.target.value)}
          className={`field-config-input ${!record.isNew ? 'field-config-input-disabled' : ''}`}
        />
      )
    },
    {
      title: <span className="field-config-required">字段类型</span>,
      dataIndex: 'fieldType',
      key: 'fieldType',
      render: (_: unknown, record: FieldConfigItem) => (
        <Select
          value={record.fieldType}
          options={FIELD_TYPE_OPTIONS}
          disabled={!record.isNew}
          onChange={(value) => handleFieldChange(record.key, 'fieldType', value)}
          className={`field-config-select ${!record.isNew ? 'field-config-select-disabled' : ''}`}
          placeholder="请选择"
        />
      )
    },
    {
      title: <span className="field-config-required">显示类型</span>,
      dataIndex: 'displayType',
      key: 'displayType',
      render: (_: unknown, record: FieldConfigItem) => {
        const displayTypeOptions = record.fieldType === 'form'
          ? DISPLAY_TYPE_OPTIONS.filter(option => option.value === 'standardReplaceTag')
          : DISPLAY_TYPE_OPTIONS;
        return (
          <Select
            value={record.displayType}
            options={displayTypeOptions}
            disabled={!record.isNew}
            onChange={(value) => handleFieldChange(record.key, 'displayType', value)}
            className={`field-config-select ${!record.isNew ? 'field-config-select-disabled' : ''}`}
            placeholder="请选择"
          />
        );
      }
    },
    {
      title: '字段说明',
      dataIndex: 'description',
      key: 'description',
      width: 140,
      render: (_: unknown, record: FieldConfigItem) =>
        record.description ? (
          <span
            className="field-config-text-btn field-config-view-description-btn"
            onClick={() => handleOpenViewModal(record)}
          >
            查看字段说明
          </span>
        ) : (
          <span className="field-config-empty-text">—</span>
        )
    },
    {
      title: '字段标签',
      dataIndex: 'label',
      key: 'label',
      width: 120,
      render: (_: unknown, record: FieldConfigItem) =>
        record.label ? (
          <Tag className="field-config-label-tag" title={record.label}>
            {record.label}
          </Tag>
        ) : (
          <span className="field-config-empty-text">—</span>
        )
    },
    {
      title: '操作',
      key: 'action',
      width: 260,
      render: (_: unknown, record: FieldConfigItem) => (
        <Space size={12}>
          <span
            className="field-config-text-btn field-config-set-description-btn"
            onClick={() => handleOpenDescriptionModal(record)}
          >
            设置字段说明
          </span>
          <span
            className="field-config-text-btn field-config-set-label-btn"
            onClick={() => handleOpenLabelModal(record)}
          >
            设置字段标签
          </span>
          <Popconfirm
            title="确认删除"
            description="删除后无法恢复，是否确认删除？"
            onConfirm={() => handleDelete(record)}
            okText="确认"
            cancelText="取消"
            placement="topRight"
            overlayClassName="field-config-delete-popconfirm"
          >
            <span className="field-config-delete">
              删除
            </span>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const applicableColumns = [
    {
      title: '范本内展示名称',
      dataIndex: 'displayName',
      key: 'displayName'
    },
    {
      title: '适用业务类型',
      dataIndex: 'applicableTypes',
      key: 'applicableTypes',
      render: (_: unknown, record: FieldConfigItem) => renderApplicableTypeNames(record.applicableTypes)
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      render: (_: unknown, record: FieldConfigItem) => (
        <span
          className="field-config-text-btn field-config-set-applicable-btn"
          onClick={() => handleOpenApplicableModal(record)}
        >
          设置适用类型
        </span>
      )
    }
  ];

  const isFieldTab = activeTab === 'field';

  const renderAppListView = () => (
    <div className={`app-field-view ${currentView === 'list' ? 'active' : ''}`}>
      <div className="system-field-app-list-card">
        <div className="system-field-app-list-header">
          <h1 className="system-field-app-list-title">系统字段</h1>
          <Button type="primary" onClick={handleAddApp}>
            新增应用
          </Button>
        </div>

        <Table
          className="system-field-app-list-table"
          columns={appListColumns}
          dataSource={appListData}
          rowKey="key"
          pagination={false}
        />
      </div>
    </div>
  );

  const renderConfigView = () => (
    <div className={`app-field-view ${currentView === 'config' ? 'active' : ''}`}>
      <div className="app-field-config-card">
        <div className="app-field-config-header">
          <div className="app-field-config-header-main">
            <div className="app-field-config-app-name">当前应用：{selectedApp?.name || '-'}</div>
            <div className="app-field-config-desc">
              <div>配置说明：</div>
              <div>配置当前应用在创建范本时，支持选用的系统标准内容字段，内容字段的值，将从应用内直接读取。</div>
            </div>
          </div>
          <Button
            className="app-field-config-back"
            icon={<ArrowLeftOutlined />}
            onClick={handleBackToList}
          >
            返回
          </Button>
        </div>

        <div className="app-field-config-tabs">
          {TAB_LIST.map(tab => (
            <span
              key={tab.key}
              className={`app-field-config-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </span>
          ))}
        </div>

        <Form form={form} component={false}>
          <Table
            className="app-field-config-table"
            columns={isFieldTab ? fieldColumns : applicableColumns}
            dataSource={data}
            rowKey="key"
            pagination={false}
            bordered
            footer={() =>
              isFieldTab ? (
                <div className="app-field-config-add-row" onClick={handleAddRow}>
                  添加一行
                </div>
              ) : null
            }
          />
        </Form>

        {isFieldTab && (
          <div className="app-field-config-footer">
            <Button type="primary" className="app-field-config-submit" onClick={handleSubmit}>
              提交
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <TemplateAdminLayout activeMenuKey="system_fields">
      <div className="app-field-page">
        {renderAppListView()}
        {renderConfigView()}
      </div>

      <Modal
        title="新增应用"
        open={addAppModalVisible}
        onOk={handleSaveApp}
        onCancel={handleCancelAddApp}
        okText="确认"
        cancelText="取消"
        width={480}
        maskClosable={false}
      >
        <Form
          form={addAppForm}
          layout="vertical"
          autoComplete="off"
          className="system-field-add-app-form"
        >
          <Form.Item
            label="应用名称"
            name="name"
            rules={[{ required: true, message: '请输入应用名称' }]}
          >
            <Input placeholder="请输入应用名称" maxLength={50} showCount />
          </Form.Item>
          <Form.Item
            label="应用编码"
            name="code"
            rules={[{ required: true, message: '请输入应用编码' }]}
          >
            <Input placeholder="请输入应用编码" maxLength={50} showCount />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="设置字段说明"
        open={descriptionModalVisible}
        onOk={handleSaveDescription}
        onCancel={handleCancelDescription}
        okText="保存"
        cancelText="取消"
        width={960}
        maskClosable={false}
      >
        <div className="field-config-wang-editor">
          <Toolbar
            editor={editor}
            defaultConfig={toolbarConfig}
            mode="default"
            className="field-config-wang-toolbar"
          />
          <Editor
            defaultConfig={editorConfig}
            value={editorHtml}
            onCreated={setEditor}
            onChange={(editorInstance) => setEditorHtml(editorInstance.getHtml())}
            mode="default"
            className="field-config-wang-content"
          />
        </div>
      </Modal>

      <Modal
        title="字段说明"
        open={viewModalVisible}
        onCancel={handleCloseViewModal}
        footer={null}
        width={640}
      >
        <div
          className="field-config-description-view"
          dangerouslySetInnerHTML={{ __html: currentRecord?.description || '' }}
        />
      </Modal>

      <Modal
        title="设置适用业务类型"
        open={applicableModalVisible}
        onOk={handleSaveApplicableTypes}
        onCancel={handleCancelApplicableTypes}
        okText="保存"
        cancelText="取消"
        width={560}
        maskClosable={false}
      >
        <TreeSelect
          treeData={BUSINESS_TYPE_TREE}
          value={selectedApplicableTypes}
          onChange={handleApplicableChange}
          treeCheckable
          treeCheckStrictly
          showCheckedStrategy={TreeSelect.SHOW_ALL}
          placeholder="请选择适用业务类型"
          className="field-config-applicable-tree-select"
          popupClassName="field-config-applicable-tree-dropdown"
          tagRender={renderTreeSelectTag}
        />
      </Modal>

      <Modal
        title="设置字段标签"
        open={labelModalVisible}
        onOk={handleSaveLabel}
        onCancel={handleCancelLabel}
        okText="保存"
        cancelText="取消"
        width={480}
        maskClosable={false}
      >
        <Form
          form={labelForm}
          layout="vertical"
          autoComplete="off"
          className="field-config-label-form"
        >
          <Form.Item
            label="字段标签"
            name="label"
            rules={[{ max: 20, message: '字段标签最多输入 20 个字符' }]}
          >
            <Input placeholder="请输入字段标签" maxLength={20} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </TemplateAdminLayout>
  );
};

export default Component;
