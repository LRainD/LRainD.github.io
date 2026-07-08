/**
 * @name 运营模板管理
 */
import React, { useState } from 'react';
import { Table, Pagination, Select, Input, Space, Modal, Tabs, Button, Tooltip } from 'antd';
import { PlusOutlined, QuestionCircleOutlined, CloseOutlined } from '@ant-design/icons';
import OperationAdminLayout from '../../components/operation-admin-layout';
import './style.css';

interface TemplateItem {
  id: number;
  name: string;
  type: 'system' | 'custom';
  status: 'enabled' | 'disabled';
  level: number;
  createTime: string;
}

interface EnterpriseRelation {
  id: number;
  categoryName: string;
  name: string;
  scene: string;
  metaType: string;
  relatedMeta: string[];
  equityRange: string;
  parentId?: number;
}

const MOCK_DATA: TemplateItem[] = [
  { id: 1, name: '系统模板', type: 'system', status: 'enabled', level: 3, createTime: '2026-04-25 11:54:14' },
  { id: 2, name: '1室', type: 'custom', status: 'disabled', level: 3, createTime: '2026-07-08 19:11:46' },
  { id: 3, name: '测试模板5', type: 'custom', status: 'enabled', level: 3, createTime: '2026-06-24 18:16:14' },
  { id: 4, name: '测试模板4', type: 'custom', status: 'enabled', level: 3, createTime: '2026-06-18 16:28:49' },
  { id: 5, name: '测试模板3', type: 'custom', status: 'disabled', level: 3, createTime: '2026-06-18 16:25:25' },
  { id: 6, name: '测试模板2', type: 'custom', status: 'enabled', level: 3, createTime: '2026-06-18 16:20:48' },
  { id: 7, name: '测试模板1', type: 'custom', status: 'enabled', level: 3, createTime: '2026-06-18 16:13:57' },
  { id: 8, name: '测试模板', type: 'custom', status: 'disabled', level: 3, createTime: '2026-06-18 16:06:18' },
  { id: 9, name: '做关键时间节点模板', type: 'custom', status: 'disabled', level: 3, createTime: '2026-04-28 17:31:42' },
  { id: 10, name: '1156768890', type: 'custom', status: 'disabled', level: 5, createTime: '2026-04-28 16:51:49' },
];

const TOTAL = 37;

const RELATED_META_OPTIONS = [
  { label: '副董事长', value: '副董事长' },
  { label: '董事长', value: '董事长' },
  { label: '董事', value: '董事' },
  { label: '独立董事', value: '独立董事' },
  { label: '职工代表董事', value: '职工代表董事' },
  { label: '执行董事', value: '执行董事' },
  { label: '执行事务合伙人', value: '执行事务合伙人' },
  { label: '董事会秘书', value: '董事会秘书' },
  { label: '联席公司秘书', value: '联席公司秘书' },
  { label: '职工监事', value: '职工监事' },
  { label: '职工代表监事', value: '职工代表监事' },
  { label: '监事', value: '监事' },
  { label: '董监高', value: '董监高' },
  { label: '股东监事', value: '股东监事' },
  { label: '监事会主席', value: '监事会主席' },
  { label: '股东', value: '股东' },
  { label: '工商股东：-', value: '工商股东：-' },
  { label: '工商股东', value: '工商股东' },
  { label: '新三板股东：X%', value: '新三板股东：X%' },
  { label: '工商股东：X%', value: '工商股东：X%' },
  { label: '十大股东：X%', value: '十大股东：X%' },
  { label: '投资人', value: '投资人' },
  { label: '法定代表人', value: '法定代表人' },
  { label: '总经理', value: '总经理' },
  { label: '总裁', value: '总裁' },
  { label: '常务副总经理', value: '常务副总经理' },
  { label: '副总裁', value: '副总裁' },
  { label: '副总经理', value: '副总经理' },
  { label: '联席董事长', value: '联席董事长' },
  { label: '总会计师', value: '总会计师' },
  { label: '理事长', value: '理事长' },
  { label: '执行监事', value: '执行监事' },
  { label: '财务负责人', value: '财务负责人' },
  { label: '财务总监', value: '财务总监' },
  { label: '负责人', value: '负责人' },
  { label: '经营者', value: '经营者' },
  { label: '经理', value: '经理' },
  { label: '内审负责人', value: '内审负责人' },
  { label: '分支机构', value: '分支机构' },
  { label: '在X份裁判文书中为同一方', value: '在X份裁判文书中为同一方' },
  { label: '有相同的邮箱', value: '有相同的邮箱' },
  { label: '有相同的电话号码', value: '有相同的电话号码' },
  { label: '有相同的地址', value: '有相同的地址' },
  { label: '共同拥有X份软件著作权', value: '共同拥有X份软件著作权' },
  { label: '共同拥有X份专利', value: '共同拥有X份专利' },
  { label: '其它', value: '其它' },
  { label: '其他', value: '其他' }
];

const DEFAULT_RELATIONS: EnterpriseRelation[] = [
  {
    id: 1,
    categoryName: '',
    name: '董监高',
    scene: '2-10家',
    metaType: '普通元数据',
    relatedMeta: ['副董事长', '董事长', '董事', '独立董事', '职工代表董事', '执行董事', '执行事务合伙人', '董事会秘书', '联席公司秘书', '职工监事', '职工代表监事', '监事', '董监高', '股东监事', '监事会主席'],
    equityRange: '--'
  },
  {
    id: 2,
    categoryName: '',
    name: '股东',
    scene: '2-10家',
    metaType: '普通元数据',
    relatedMeta: ['股东', '工商股东：-', '工商股东', '新三板股东：X%', '工商股东：X%', '十大股东：X%', '投资人'],
    equityRange: '--'
  },
  {
    id: 3,
    categoryName: '',
    name: '法人',
    scene: '2-10家',
    metaType: '普通元数据',
    relatedMeta: ['法定代表人'],
    equityRange: '--'
  },
  {
    id: 4,
    categoryName: '',
    name: '核心管理',
    scene: '2-10家',
    metaType: '普通元数据',
    relatedMeta: ['总经理', '总裁', '常务副总经理', '副总裁', '副总经理', '联席董事长'],
    equityRange: '--'
  },
  {
    id: 5,
    categoryName: '',
    name: '经营管理',
    scene: '2-10家',
    metaType: '普通元数据',
    relatedMeta: ['总会计师', '理事长', '执行监事', '财务负责人', '财务总监', '负责人', '经营者', '经理', '内审负责人'],
    equityRange: '--'
  },
  {
    id: 6,
    categoryName: '',
    name: '机构隶属',
    scene: '2-10家',
    metaType: '普通元数据',
    relatedMeta: ['分支机构'],
    equityRange: '--'
  },
  {
    id: 7,
    categoryName: '',
    name: '涉诉关联',
    scene: '2-10家',
    metaType: '普通元数据',
    relatedMeta: ['在X份裁判文书中为同一方'],
    equityRange: '--'
  },
  {
    id: 8,
    categoryName: '',
    name: '联系方式相同',
    scene: '2-10家',
    metaType: '普通元数据',
    relatedMeta: ['有相同的邮箱', '有相同的电话号码', '有相同的地址'],
    equityRange: '--'
  },
  {
    id: 9,
    categoryName: '',
    name: '知识产权公有',
    scene: '2-10家',
    metaType: '普通元数据',
    relatedMeta: ['共同拥有X份软件著作权', '共同拥有X份专利'],
    equityRange: '--'
  },
  {
    id: 10,
    categoryName: '',
    name: '其他',
    scene: '2-10家',
    metaType: '普通元数据',
    relatedMeta: ['其它', '其他'],
    equityRange: '--'
  }
];

const Component = function OperationTemplateMgmt() {
  const [platform, setPlatform] = useState('平台abc');
  const [orgCode] = useState('0001');
  const [parentOrg] = useState('-');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [relationModalOpen, setRelationModalOpen] = useState(false);
  const [relations, setRelations] = useState<EnterpriseRelation[]>(DEFAULT_RELATIONS);
  const [activeTab, setActiveTab] = useState('2-10');

  const handleRelatedMetaChange = (relationId: number, values: string[]) => {
    setRelations(prev => prev.map(item => {
      if (item.id === relationId) {
        return { ...item, relatedMeta: values };
      }
      return item;
    }));
  };

  const handleNameChange = (relationId: number, value: string) => {
    setRelations(prev => prev.map(item => {
      if (item.id === relationId) {
        return { ...item, name: value };
      }
      return item;
    }));
  };

  const handleCategoryNameChange = (relationId: number, value: string) => {
    setRelations(prev => prev.map(item => {
      if (item.id === relationId) {
        return { ...item, categoryName: value };
      }
      return item;
    }));
  };

  const handleDeleteRelation = (relationId: number) => {
    setRelations(prev => prev.filter(item => item.id !== relationId));
  };

  const handleAddChild = (parentId: number) => {
    const newRelation: EnterpriseRelation = {
      id: Date.now(),
      categoryName: '',
      name: '新子关系',
      scene: '2-10家',
      metaType: '普通元数据',
      relatedMeta: [],
      equityRange: '--',
      parentId
    };
    setRelations(prev => {
      const index = prev.findIndex(item => item.id === parentId);
      if (index === -1) return [...prev, newRelation];
      const result = [...prev];
      result.splice(index + 1, 0, newRelation);
      return result;
    });
  };

  const getRelationDepth = (record: EnterpriseRelation): number => {
    if (!record.parentId) return 0;
    const parent = relations.find(item => item.id === record.parentId);
    return parent ? getRelationDepth(parent) + 1 : 0;
  };

  const renderNameCell = (name: string, record: EnterpriseRelation) => {
    const depth = getRelationDepth(record);
    if (depth > 0) {
      return (
        <div className="relation-name-cell">
          <div className="relation-tree-connector" style={{ marginLeft: (depth - 1) * 24 }} />
        </div>
      );
    }
    return (
      <div className="relation-name-cell">
        <Input
          value={name}
          onChange={(e) => handleNameChange(record.id, e.target.value)}
          className="relation-name-input"
        />
      </div>
    );
  };

  const relationColumns = [
    {
      title: '分类名称',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 120,
      render: (categoryName: string, record: EnterpriseRelation) => {
        const depth = getRelationDepth(record);
        if (depth > 0) return null;
        return (
          <Input
            value={categoryName}
            onChange={(e) => handleCategoryNameChange(record.id, e.target.value)}
            className="relation-category-input"
          />
        );
      },
    },
    {
      title: '企业关系名称',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      render: (name: string, record: EnterpriseRelation) => renderNameCell(name, record),
    },
    {
      title: '所属场景',
      dataIndex: 'scene',
      key: 'scene',
      width: 100,
    },
    {
      title: '元数据类型',
      dataIndex: 'metaType',
      key: 'metaType',
      width: 120,
      render: (value: string) => (
        <Select value={value} options={[{ label: '普通元数据', value: '普通元数据' }]} className="relation-meta-select" />
      ),
    },
    {
      title: '关联元数据',
      dataIndex: 'relatedMeta',
      key: 'relatedMeta',
      render: (values: string[], record: EnterpriseRelation) => (
        <Select
          mode="multiple"
          value={values}
          options={RELATED_META_OPTIONS}
          onChange={(changedValues) => handleRelatedMetaChange(record.id, changedValues)}
          className="relation-meta-multi-select"
          placeholder="请选择"
          allowClear
        />
      ),
    },
    {
      title: '股权区间',
      dataIndex: 'equityRange',
      key: 'equityRange',
      width: 100,
    },
    {
      title: (
        <span>
          操作
          <Tooltip title="操作说明">
            <QuestionCircleOutlined className="relation-action-help" />
          </Tooltip>
        </span>
      ),
      key: 'action',
      width: 80,
      render: (_: any, record: EnterpriseRelation) => (
        <Space direction="vertical" size={4} className="relation-action-cell">
          <span className="template-action-link" onClick={() => handleAddChild(record.id)}>添加子关系</span>
          <span className="template-action-delete" onClick={() => handleDeleteRelation(record.id)}>删除</span>
        </Space>
      ),
    },
  ];

  const columns = [
    {
      title: '模板名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: TemplateItem['type']) => (
        <span className={type === 'system' ? 'template-type-system' : 'template-type-custom'}>
          {type === 'system' ? '系统模板' : '自定义模板'}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: TemplateItem['status']) => (
        <span className={status === 'enabled' ? 'template-status-enabled' : 'template-status-disabled'}>
          {status === 'enabled' ? '启用' : '禁用'}
        </span>
      ),
    },
    {
      title: '检测层级',
      dataIndex: 'level',
      key: 'level',
      render: (level: number) => `${level}层`,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: TemplateItem) => (
        <Space size="small" className="template-action-cell">
          <span className="template-action-link" onClick={() => setRelationModalOpen(true)}>企业关系管理</span>
          <span className="template-action-link">配置规则</span>
          <span className="template-action-link">{record.status === 'enabled' ? '禁用' : '启用'}</span>
          <span className="template-action-link">复制模板</span>
          <span className="template-action-delete">删除</span>
        </Space>
      ),
    },
  ];

  return (
    <OperationAdminLayout
      activeMenuKey="config_mgmt"
      breadcrumbItems={[
        { label: '配置管理' },
        { label: '模板管理', active: true }
      ]}
      platform={platform}
      orgCode={orgCode}
      parentOrg={parentOrg}
      onPlatformChange={setPlatform}
    >
      <div className="operation-template-mgmt-page">
        {/* 统计信息 */}
        <div className="template-summary">本页:{pageSize}条 总计:{TOTAL}条</div>

        {/* 表格 */}
        <Table
          className="template-table"
          dataSource={MOCK_DATA}
          rowKey="id"
          columns={columns}
          pagination={false}
          bordered
        />

        {/* 分页 */}
        <div className="template-pagination-bar">
          <span className="template-pagination-total">第 {currentPage}-{Math.min(currentPage * pageSize, TOTAL)} 条/共 {TOTAL} 条</span>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={TOTAL}
            showSizeChanger={false}
            onChange={(page, size) => {
              setCurrentPage(page);
              if (size) setPageSize(size);
            }}
          />
          <Select
            value={pageSize}
            options={[
              { label: '10 条/页', value: 10 },
              { label: '20 条/页', value: 20 },
              { label: '50 条/页', value: 50 },
            ]}
            onChange={(value) => {
              setPageSize(value);
              setCurrentPage(1);
            }}
            className="template-page-size-select"
          />
          <div className="template-jump-page">
            <span>跳至</span>
            <Input className="template-jump-input" />
            <span>页</span>
          </div>
        </div>
      </div>

      {/* 企业关系管理弹窗 */}
      <Modal
        title="企业关系管理"
        open={relationModalOpen}
        onCancel={() => setRelationModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setRelationModalOpen(false)}>关闭</Button>,
          <Button key="save" type="primary" onClick={() => setRelationModalOpen(false)}>保存</Button>
        ]}
        width={960}
        className="enterprise-relation-modal"
        closeIcon={<CloseOutlined />}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: '2-10', label: '2-10家' },
            { key: '11-50', label: '11-50家' },
            { key: '51-500', label: '51-500家' }
          ]}
          className="enterprise-relation-tabs"
        />
        <div className="enterprise-relation-add">
          <Button type="link" icon={<PlusOutlined />}>新增企业关系</Button>
        </div>
        <Table
          className="enterprise-relation-table"
          dataSource={relations}
          rowKey="id"
          columns={relationColumns}
          pagination={false}
          bordered
          scroll={{ y: 420 }}
        />
      </Modal>
    </OperationAdminLayout>
  );
};

export default Component;
