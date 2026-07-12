/**
 * @name 运营模板管理
 */
import React, { useMemo, useState } from 'react';
import { Table, Pagination, Select, Input, Space, Modal, Button, Tooltip } from 'antd';
import { PlusOutlined, QuestionCircleOutlined, CloseOutlined, FileTextOutlined } from '@ant-design/icons';
import OperationAdminLayout, { DEFAULT_MENU_ITEMS } from '../../components/operation-admin-layout';
import './style.css';

interface TemplateItem {
  id: number;
  name: string;
  type: 'system' | 'custom';
  status: 'enabled' | 'disabled';
  level: number;
  createTime: string;
}

interface SceneConfig {
  metaType: string;
  relatedMeta: string[];
  equityRange: string;
}

interface EnterpriseRelation {
  id: number;
  categoryName: string;
  name: string;
  configs: Record<string, SceneConfig>;
  parentId?: number;
}

interface RelationViewRow {
  key: string;
  relationId: number;
  sceneKey: string;
  isFirstScene: boolean;
  categoryName: string;
  name: string;
  config: SceneConfig;
  depth: number;
  relation: EnterpriseRelation;
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

const SCENE_KEYS = ['2-10', '11-50', '51-500'];
const SCENE_LABELS: Record<string, string> = {
  '2-10': '2-10家',
  '11-50': '11-50家',
  '51-500': '51-500家',
};

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

const META_TYPE_OPTIONS = [{ label: '普通元数据', value: '普通元数据' }];

const CATEGORY_OPTIONS = [
  { label: '人员关系', value: '人员关系' },
  { label: '机构隶属', value: '机构隶属' },
  { label: '其他', value: '其他' },
];

const createEmptySceneConfig = (relatedMeta: string[] = [], equityRange = '--'): SceneConfig => ({
  metaType: '普通元数据',
  relatedMeta,
  equityRange,
});

const MENU_ITEMS = DEFAULT_MENU_ITEMS.reduce<any[]>((acc, item) => {
  if (item.key === 'template_mgmt') {
    return acc;
  }
  if (item.key === 'config_mgmt') {
    acc.push({
      ...item,
      children: [
        { key: 'template_mgmt', icon: <FileTextOutlined />, label: '模板管理' }
      ]
    });
  } else {
    acc.push(item);
  }
  return acc;
}, []);

const DEFAULT_RELATIONS: EnterpriseRelation[] = [
  {
    id: 1,
    categoryName: '人员关系',
    name: '董监高',
    configs: {
      '2-10': createEmptySceneConfig(['副董事长', '董事长', '董事', '独立董事', '职工代表董事', '执行董事', '执行事务合伙人', '董事会秘书', '联席公司秘书', '职工监事', '职工代表监事', '监事', '董监高', '股东监事', '监事会主席']),
      '11-50': createEmptySceneConfig(['副董事长', '董事长', '董事', '独立董事', '职工代表董事', '执行董事', '执行事务合伙人', '董事会秘书', '联席公司秘书', '职工监事', '职工代表监事', '监事', '董监高', '股东监事', '监事会主席']),
      '51-500': createEmptySceneConfig(['副董事长', '董事长', '董事', '独立董事', '职工代表董事', '执行董事', '执行事务合伙人', '董事会秘书', '联席公司秘书', '职工监事', '职工代表监事', '监事', '董监高', '股东监事', '监事会主席']),
    }
  },
  {
    id: 2,
    categoryName: '人员关系',
    name: '股东',
    configs: {
      '2-10': createEmptySceneConfig(['股东', '工商股东：-', '工商股东', '新三板股东：X%', '工商股东：X%', '十大股东：X%', '投资人']),
      '11-50': createEmptySceneConfig(['股东', '工商股东：-', '工商股东', '新三板股东：X%', '工商股东：X%', '十大股东：X%', '投资人']),
      '51-500': createEmptySceneConfig(['股东', '工商股东：-', '工商股东', '新三板股东：X%', '工商股东：X%', '十大股东：X%', '投资人']),
    }
  },
  {
    id: 3,
    categoryName: '人员关系',
    name: '法人',
    configs: {
      '2-10': createEmptySceneConfig(['法定代表人']),
      '11-50': createEmptySceneConfig(['法定代表人']),
      '51-500': createEmptySceneConfig(['法定代表人']),
    }
  },
  {
    id: 4,
    categoryName: '人员关系',
    name: '核心管理',
    configs: {
      '2-10': createEmptySceneConfig(['总经理', '总裁', '常务副总经理', '副总裁', '副总经理', '联席董事长']),
      '11-50': createEmptySceneConfig(['总经理', '总裁', '常务副总经理', '副总裁', '副总经理', '联席董事长']),
      '51-500': createEmptySceneConfig(['总经理', '总裁', '常务副总经理', '副总裁', '副总经理', '联席董事长']),
    }
  },
  {
    id: 5,
    categoryName: '人员关系',
    name: '经营管理',
    configs: {
      '2-10': createEmptySceneConfig(['总会计师', '理事长', '执行监事', '财务负责人', '财务总监', '负责人', '经营者', '经理', '内审负责人']),
      '11-50': createEmptySceneConfig(['总会计师', '理事长', '执行监事', '财务负责人', '财务总监', '负责人', '经营者', '经理', '内审负责人']),
      '51-500': createEmptySceneConfig(['总会计师', '理事长', '执行监事', '财务负责人', '财务总监', '负责人', '经营者', '经理', '内审负责人']),
    }
  },
  {
    id: 6,
    categoryName: '机构隶属',
    name: '机构隶属',
    configs: {
      '2-10': createEmptySceneConfig(['分支机构']),
      '11-50': createEmptySceneConfig(['分支机构']),
      '51-500': createEmptySceneConfig(['分支机构']),
    }
  },
  {
    id: 7,
    categoryName: '其他',
    name: '涉诉关联',
    configs: {
      '2-10': createEmptySceneConfig(['在X份裁判文书中为同一方']),
      '11-50': createEmptySceneConfig(['在X份裁判文书中为同一方']),
      '51-500': createEmptySceneConfig(['在X份裁判文书中为同一方']),
    }
  },
  {
    id: 8,
    categoryName: '人员关系',
    name: '联系方式相同',
    configs: {
      '2-10': createEmptySceneConfig(['有相同的邮箱', '有相同的电话号码', '有相同的地址']),
      '11-50': createEmptySceneConfig(['有相同的邮箱', '有相同的电话号码', '有相同的地址']),
      '51-500': createEmptySceneConfig(['有相同的邮箱', '有相同的电话号码', '有相同的地址']),
    }
  },
  {
    id: 9,
    categoryName: '人员关系',
    name: '知识产权公有',
    configs: {
      '2-10': createEmptySceneConfig(['共同拥有X份软件著作权', '共同拥有X份专利']),
      '11-50': createEmptySceneConfig(['共同拥有X份软件著作权', '共同拥有X份专利']),
      '51-500': createEmptySceneConfig(['共同拥有X份软件著作权', '共同拥有X份专利']),
    }
  },
  {
    id: 10,
    categoryName: '其他',
    name: '其他',
    configs: {
      '2-10': createEmptySceneConfig(['其它', '其他']),
      '11-50': createEmptySceneConfig(['其它', '其他']),
      '51-500': createEmptySceneConfig(['其它', '其他']),
    }
  }
];

const Component = function OperationTemplateMgmt() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [relationModalOpen, setRelationModalOpen] = useState(false);
  const [relations, setRelations] = useState<EnterpriseRelation[]>(DEFAULT_RELATIONS);

  const getRelationDepth = (record: EnterpriseRelation): number => {
    if (!record.parentId) return 0;
    const parent = relations.find(item => item.id === record.parentId);
    return parent ? getRelationDepth(parent) + 1 : 0;
  };

  const relationRows = useMemo<RelationViewRow[]>(() => {
    const rows: RelationViewRow[] = [];
    relations.forEach(relation => {
      const depth = getRelationDepth(relation);
      SCENE_KEYS.forEach((sceneKey, index) => {
        rows.push({
          key: `${relation.id}-${sceneKey}`,
          relationId: relation.id,
          sceneKey,
          isFirstScene: index === 0,
          categoryName: relation.categoryName,
          name: relation.name,
          config: relation.configs[sceneKey],
          depth,
          relation,
        });
      });
    });
    return rows;
  }, [relations]);

  const handleSceneConfigChange = (
    relationId: number,
    sceneKey: string,
    field: keyof SceneConfig,
    value: string | string[]
  ) => {
    setRelations(prev => prev.map(item => {
      if (item.id === relationId) {
        return {
          ...item,
          configs: {
            ...item.configs,
            [sceneKey]: {
              ...item.configs[sceneKey],
              [field]: value,
            },
          },
        };
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
      configs: {
        '2-10': createEmptySceneConfig(),
        '11-50': createEmptySceneConfig(),
        '51-500': createEmptySceneConfig(),
      },
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

  const renderMergedCell = (content: React.ReactNode, isFirstScene: boolean) => {
    if (!isFirstScene) {
      return { children: null, props: { rowSpan: 0 } };
    }
    return { children: content, props: { rowSpan: SCENE_KEYS.length } };
  };

  const renderNameCell = (name: string, record: RelationViewRow) => {
    const { depth, isFirstScene } = record;
    if (!isFirstScene) return { children: null, props: { rowSpan: 0 } };
    return {
      children: (
        <div className="relation-name-cell">
          {depth > 0 && (
            <div className="relation-tree-connector" style={{ marginLeft: (depth - 1) * 24 }} />
          )}
          <Input
            value={name}
            onChange={(e) => handleNameChange(record.relationId, e.target.value)}
            className="relation-name-input"
          />
        </div>
      ),
      props: { rowSpan: SCENE_KEYS.length },
    };
  };

  const renderCategoryCell = (categoryName: string, record: RelationViewRow) => {
    const { depth, isFirstScene } = record;
    if (depth > 0 || !isFirstScene) return { children: null, props: { rowSpan: 0 } };
    return {
      children: (
        <Select
          value={categoryName}
          options={CATEGORY_OPTIONS}
          onChange={(value) => handleCategoryNameChange(record.relationId, value)}
          className="relation-category-select"
          placeholder="请选择"
        />
      ),
      props: { rowSpan: SCENE_KEYS.length },
    };
  };

  const renderActionCell = (_: any, record: RelationViewRow) => {
    return renderMergedCell(
      <Space direction="vertical" size={4} className="relation-action-cell">
        <span className="template-action-link" onClick={() => handleAddChild(record.relationId)}>添加子关系</span>
        <span className="template-action-delete" onClick={() => handleDeleteRelation(record.relationId)}>删除</span>
      </Space>,
      record.isFirstScene
    );
  };

  const relationColumns = [
    {
      title: '分类名称',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 120,
      render: (categoryName: string, record: RelationViewRow) => renderCategoryCell(categoryName, record),
    },
    {
      title: '企业关系名称',
      dataIndex: 'name',
      key: 'name',
      width: 160,
      render: (name: string, record: RelationViewRow) => renderNameCell(name, record),
    },
    {
      title: '所属场景',
      dataIndex: 'sceneKey',
      key: 'sceneKey',
      width: 90,
      render: (sceneKey: string) => SCENE_LABELS[sceneKey],
    },
    {
      title: '元数据类型',
      dataIndex: 'config',
      key: 'metaType',
      width: 140,
      render: (config: SceneConfig, record: RelationViewRow) => (
        <Select
          value={config.metaType}
          options={META_TYPE_OPTIONS}
          onChange={(value) => handleSceneConfigChange(record.relationId, record.sceneKey, 'metaType', value)}
          className="relation-meta-select"
        />
      ),
    },
    {
      title: '关联元数据',
      dataIndex: 'config',
      key: 'relatedMeta',
      width: 240,
      render: (config: SceneConfig, record: RelationViewRow) => (
        <Select
          mode="multiple"
          value={config.relatedMeta}
          options={RELATED_META_OPTIONS}
          onChange={(values) => handleSceneConfigChange(record.relationId, record.sceneKey, 'relatedMeta', values)}
          className="relation-meta-multi-select"
          placeholder="请选择"
          allowClear
        />
      ),
    },
    {
      title: '股权区间',
      dataIndex: 'config',
      key: 'equityRange',
      width: 100,
      render: (config: SceneConfig, record: RelationViewRow) => (
        <Input
          value={config.equityRange}
          onChange={(e) => handleSceneConfigChange(record.relationId, record.sceneKey, 'equityRange', e.target.value)}
          className="relation-equity-input"
          placeholder="--"
        />
      ),
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
      width: 90,
      render: renderActionCell,
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
      activeMenuKey="template_mgmt"
      defaultOpenKeys={['config_mgmt']}
      menuItems={MENU_ITEMS}
      breadcrumbItems={[
        { label: '配置管理' },
        { label: '模板管理', active: true }
      ]}
      showOrgBar={false}
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
        width={1000}
        className="enterprise-relation-modal"
        closeIcon={<CloseOutlined />}
      >
        <div className="enterprise-relation-add">
          <Button type="link" icon={<PlusOutlined />}>新增企业关系</Button>
        </div>
        <Table
          className="enterprise-relation-table"
          dataSource={relationRows}
          rowKey="key"
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
