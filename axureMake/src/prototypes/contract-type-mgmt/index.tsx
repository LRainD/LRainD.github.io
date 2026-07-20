/**
 * @name 业务类型管理
 */
import React, { useMemo, useState } from 'react';
import {
  DownOutlined,
  RightOutlined,
  RollbackOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { Avatar, Button, Form, Input, Modal, Space, Table, TreeSelect } from 'antd';
import TemplateAdminLayout from '../../components/template-admin-layout';
import logoImage from '../../../assets/picture/云筑网带文字logo.png';
import { ContractType, MOCK_DATA } from './mock';
import './style.css';

function renderNameCell(
  name: string,
  record: ContractType,
  expandedRowKeys: string[],
  onToggle: (key: string) => void
) {
  const hasChildren = (record.children?.length ?? 0) > 0;
  const expanded = expandedRowKeys.includes(record.key);

  return (
    <div className="contract-name-cell">
      {hasChildren && (
        <span
          className="contract-expand-icon"
          onClick={(e) => {
            e.stopPropagation();
            onToggle(record.key);
          }}
        >
          {expanded ? <DownOutlined /> : <RightOutlined />}
        </span>
      )}
      <span className="contract-name-text">{name}</span>
    </div>
  );
}

function renderUpdater(name: string) {
  const firstChar = name ? name.charAt(0).toUpperCase() : '?';
  return (
    <Space size={8} className="contract-updater-cell">
      <Avatar size={22} className="contract-updater-avatar">{firstChar}</Avatar>
      <span className="contract-updater-name">{name}</span>
    </Space>
  );
}

const Component = function ContractTypeMgmt() {
  const [searchValue, setSearchValue] = useState('');
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>(['4']);
  const [isEditing, setIsEditing] = useState(false);
  const [editMode, setEditMode] = useState('add' as 'add' | 'edit');
  const [form] = Form.useForm();

  const filteredData = useMemo(() => {
    if (!searchValue.trim()) return MOCK_DATA;
    const keyword = searchValue.trim().toLowerCase();
    return MOCK_DATA.filter(item => item.name.toLowerCase().includes(keyword));
  }, [searchValue]);

  const handleCollapseAll = () => {
    setExpandedRowKeys([]);
  };

  const toggleRow = (key: string) => {
    setExpandedRowKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleAdd = (parentRecord?: ContractType) => {
    setEditMode('add');
    setIsEditing(true);
    form.resetFields();
    if (parentRecord) {
      form.setFieldsValue({
        parent: [{ value: parentRecord.key, label: parentRecord.name }]
      });
    }
  };

  const handleEdit = (record: ContractType) => {
    // 查找父级分类
    const parent = MOCK_DATA.find(item =>
      item.children?.some(child => child.key === record.key)
    );
    setEditMode('edit');
    setIsEditing(true);
    form.setFieldsValue({
      name: record.name,
      code: record.code,
      parent: parent ? parent.key : undefined
    });
  };

  const handleBack = () => {
    setIsEditing(false);
  };

  const handleSubmit = () => {
    form.validateFields().then(values => {
      console.log('提交数据:', values);
      setIsEditing(false);
    }).catch(() => {
      // 校验失败时由表单项自身展示错误提示，无需额外处理
    });
  };

  const handleDelete = (record: ContractType) => {
    Modal.confirm({
      title: '确认删除',
      content: `是否删除分类「${record.name}」？`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        console.log('删除分类:', record.key);
      }
    });
  };

  const treeData = MOCK_DATA.map(item => ({
    title: item.name,
    value: item.key,
    key: item.key,
    children: item.children?.map(child => ({
      title: child.name,
      value: child.key,
      key: child.key,
    }))
  }));

  const columns = [
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: ContractType) => renderNameCell(name, record, expandedRowKeys, toggleRow)
    },
    {
      title: '分类编码',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => code || '-'
    },
    {
      title: '关联模板/个',
      dataIndex: 'templateCount',
      key: 'templateCount'
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
      width: 170,
      render: (_: unknown, record: ContractType) => (
        <Space size={10} className="contract-action-cell">
          <span className="contract-action-link danger" onClick={() => handleDelete(record)}>删除</span>
          <span className="contract-action-link" onClick={() => handleAdd(record)}>新增</span>
          <span className="contract-action-link active" onClick={() => handleEdit(record)}>编辑</span>
        </Space>
      )
    }
  ];

  if (isEditing) {
    return (
      <TemplateAdminLayout activeMenuKey="contract_type">
        <div className="contract-type-edit-card">
          {/* 编辑页标题栏 */}
          <div className="contract-type-edit-header">
            <div className="contract-type-edit-header-left">
              <img src={logoImage} alt="logo" className="contract-type-edit-logo" />
              <span className="contract-type-edit-header-line" />
              <span className="contract-type-edit-header-title">编辑业务类型</span>
            </div>
            <Button
              type="text"
              className="contract-type-edit-back-btn"
              icon={<RollbackOutlined />}
              onClick={handleBack}
            />
          </div>

          {/* 表单区域 */}
          <div className="contract-type-edit-body">
            <Form form={form} layout="vertical" className="contract-type-edit-form">
              <div className="contract-type-edit-form-row">
                <Form.Item
                  label="分类名称"
                  name="name"
                  rules={[{ required: true, message: '请输入分类名称' }]}
                  className="contract-type-edit-form-item"
                >
                  <Input placeholder="输入分类名称" />
                </Form.Item>
                <Form.Item
                  label="分类编码"
                  name="code"
                  rules={[{ required: true, message: '请输入分类编码' }]}
                  className="contract-type-edit-form-item"
                >
                  <Input placeholder="输入分类编码" />
                </Form.Item>
                <Form.Item
                  label="父级分类"
                  name="parent"
                  className="contract-type-edit-form-item"
                >
                  <TreeSelect
                    treeData={treeData}
                    placeholder="请选择"
                    style={{ width: '100%' }}
                    {...(editMode === 'add'
                      ? { treeCheckable: true, treeCheckStrictly: true }
                      : {})}
                  />
                </Form.Item>
              </div>
              <Form.Item className="contract-type-edit-submit-item">
                <Button type="primary" className="contract-type-edit-submit-btn" onClick={handleSubmit}>
                  确定
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </TemplateAdminLayout>
    );
  }

  return (
    <TemplateAdminLayout activeMenuKey="contract_type">
      <div className="contract-type-mgmt-card">
        {/* 标题栏 */}
        <div className="contract-type-mgmt-title-bar">
          <h1 className="contract-type-mgmt-title">业务类型</h1>
          <div className="contract-type-mgmt-title-actions">
            <Input
              placeholder="输入分类名称搜索"
              prefix={<SearchOutlined className="contract-search-icon" />}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="contract-search-input"
            />
            <Button onClick={handleCollapseAll}>全部收起</Button>
            <Button type="primary" className="contract-add-btn" onClick={handleAdd}>新增分类</Button>
          </div>
        </div>

        {/* 表格 */}
        <Table
          className="contract-type-mgmt-table"
          columns={columns}
          dataSource={filteredData}
          rowKey="key"
          pagination={false}
          expandable={{
            expandedRowKeys,
            onExpandedRowsChange: (keys) => setExpandedRowKeys(keys as string[]),
            expandIcon: () => null
          }}
        />
      </div>
    </TemplateAdminLayout>
  );
};

export default Component;
