/**
 * @name 企业关系配置-单页面
 */
import React, { useMemo, useState } from 'react';
import { Table, Select, Input, Button, Tooltip, message } from 'antd';
import { PlusOutlined, QuestionCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import OperationAdminLayout, { DEFAULT_MENU_ITEMS } from '../../components/operation-admin-layout';
import './style.css';

interface SceneConfig {
  metaType: string;
  relatedMeta: string[];
}

interface EnterpriseRelation {
  id: number;
  categoryName: string;
  name: string;
  riskLevel: string;
  hoverDesc: string;
  configs: Record<string, SceneConfig>;
}

interface RelationViewRow {
  key: string;
  relationId: number;
  sceneKey: string;
  isFirstScene: boolean;
  categoryName: string;
  name: string;
  riskLevel: string;
  hoverDesc: string;
  config: SceneConfig;
}

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

const RISK_LEVEL_OPTIONS = [
  { label: '高风险', value: '高风险' },
  { label: '风险项', value: '普通风险' },
];

const createEmptySceneConfig = (relatedMeta: string[] = []): SceneConfig => ({
  metaType: '普通元数据',
  relatedMeta,
});

const MENU_ITEMS = DEFAULT_MENU_ITEMS.reduce<any[]>((acc, item) => {
  if (item.key === 'template_mgmt') {
    return acc;
  }
  if (item.key === 'config_mgmt') {
    acc.push({
      ...item,
      children: [
        { key: 'template_mgmt', icon: <FileTextOutlined />, label: '企业关联关系配置' }
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
    riskLevel: '',
    hoverDesc: '',
    configs: {
      '2-10': createEmptySceneConfig(['副董事长', '董事长', '董事', '独立董事', '职工代表董事', '执行董事', '执行事务合伙人', '董事会秘书', '联席公司秘书', '职工监事', '职工代表监事', '监事', '董监高', '股东监事', '监事会主席']),
      '11-50': createEmptySceneConfig(['副董事长', '董事长', '董事', '独立董事', '职工代表董事', '执行董事', '执行事务合伙人', '董事会秘书', '联席公司秘书', '职工监事', '职工代表监事', '监事', '董监高', '股东监事', '监事会主席']),
      '51-500': createEmptySceneConfig(['副董事长', '董事长', '董事', '独立董事', '职工代表董事', '执行董事', '执行事务合伙人', '董事会秘书', '联席公司秘书', '职工监事', '职工代表监事', '监事', '董监高', '股东监事', '监事会主席']),
    }
  },
  {
    id: 2,
    categoryName: '人员关系',
    name: '法定代表人',
    riskLevel: '',
    hoverDesc: '',
    configs: {
      '2-10': createEmptySceneConfig(['法定代表人']),
      '11-50': createEmptySceneConfig(['法定代表人']),
      '51-500': createEmptySceneConfig(['法定代表人']),
    }
  },
  {
    id: 3,
    categoryName: '人员关系',
    name: '股东',
    riskLevel: '',
    hoverDesc: '',
    configs: {
      '2-10': createEmptySceneConfig(['股东', '工商股东：-', '工商股东', '新三板股东：X%', '工商股东：X%', '十大股东：X%', '投资人']),
      '11-50': createEmptySceneConfig(['股东', '工商股东：-', '工商股东', '新三板股东：X%', '工商股东：X%', '十大股东：X%', '投资人']),
      '51-500': createEmptySceneConfig(['股东', '工商股东：-', '工商股东', '新三板股东：X%', '工商股东：X%', '十大股东：X%', '投资人']),
    }
  },
  {
    id: 4,
    categoryName: '机构隶属',
    name: '分支机构',
    riskLevel: '',
    hoverDesc: '',
    configs: {
      '2-10': createEmptySceneConfig(['分支机构']),
      '11-50': createEmptySceneConfig(['分支机构']),
      '51-500': createEmptySceneConfig(['分支机构']),
    }
  },
  {
    id: 5,
    categoryName: '其他',
    name: '相同电话号码',
    riskLevel: '',
    hoverDesc: '',
    configs: {
      '2-10': createEmptySceneConfig(['有相同的电话号码']),
      '11-50': createEmptySceneConfig(['有相同的电话号码']),
      '51-500': createEmptySceneConfig(['有相同的电话号码']),
    }
  },
  {
    id: 6,
    categoryName: '其他',
    name: '相同邮箱',
    riskLevel: '',
    hoverDesc: '',
    configs: {
      '2-10': createEmptySceneConfig(['有相同的邮箱']),
      '11-50': createEmptySceneConfig(['有相同的邮箱']),
      '51-500': createEmptySceneConfig(['有相同的邮箱']),
    }
  },
  {
    id: 7,
    categoryName: '其他',
    name: '相同地址',
    riskLevel: '',
    hoverDesc: '',
    configs: {
      '2-10': createEmptySceneConfig(['有相同的地址']),
      '11-50': createEmptySceneConfig(['有相同的地址']),
      '51-500': createEmptySceneConfig(['有相同的地址']),
    }
  },
  {
    id: 8,
    categoryName: '其他',
    name: '涉诉关联',
    riskLevel: '',
    hoverDesc: '',
    configs: {
      '2-10': createEmptySceneConfig(['在X份裁判文书中为同一方']),
      '11-50': createEmptySceneConfig(['在X份裁判文书中为同一方']),
      '51-500': createEmptySceneConfig(['在X份裁判文书中为同一方']),
    }
  },
  {
    id: 9,
    categoryName: '其他',
    name: '知识产权公有',
    riskLevel: '',
    hoverDesc: '',
    configs: {
      '2-10': createEmptySceneConfig(['共同拥有X份软件著作权', '共同拥有X份专利']),
      '11-50': createEmptySceneConfig(['共同拥有X份软件著作权', '共同拥有X份专利']),
      '51-500': createEmptySceneConfig(['共同拥有X份软件著作权', '共同拥有X份专利']),
    }
  }
];

const Component = function EnterpriseRelationConfig() {
  const [relations, setRelations] = useState<EnterpriseRelation[]>(DEFAULT_RELATIONS);

  const relationRows = useMemo<RelationViewRow[]>(() => {
    const rows: RelationViewRow[] = [];
    relations.forEach(relation => {
      SCENE_KEYS.forEach((sceneKey, index) => {
        rows.push({
          key: `${relation.id}-${sceneKey}`,
          relationId: relation.id,
          sceneKey,
          isFirstScene: index === 0,
          categoryName: relation.categoryName,
          name: relation.name,
          riskLevel: relation.riskLevel,
          hoverDesc: relation.hoverDesc,
          config: relation.configs[sceneKey],
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

  const handleRiskLevelChange = (relationId: number, value: string) => {
    setRelations(prev => prev.map(item => {
      if (item.id === relationId) {
        return { ...item, riskLevel: value };
      }
      return item;
    }));
  };

  const handleHoverDescChange = (relationId: number, value: string) => {
    setRelations(prev => prev.map(item => {
      if (item.id === relationId) {
        return { ...item, hoverDesc: value };
      }
      return item;
    }));
  };

  const handleAddRelation = () => {
    const newRelation: EnterpriseRelation = {
      id: Date.now(),
      categoryName: '',
      name: '新企业关系',
      riskLevel: '',
      hoverDesc: '',
      configs: {
        '2-10': createEmptySceneConfig(),
        '11-50': createEmptySceneConfig(),
        '51-500': createEmptySceneConfig(),
      },
    };
    setRelations(prev => [...prev, newRelation]);
  };

  const handleSubmit = () => {
    message.success('保存成功');
  };

  const renderMergedCell = (content: React.ReactNode, isFirstScene: boolean) => {
    if (!isFirstScene) {
      return { children: null, props: { rowSpan: 0 } };
    }
    return { children: content, props: { rowSpan: SCENE_KEYS.length } };
  };

  const renderNameCell = (name: string, record: RelationViewRow) => {
    if (!record.isFirstScene) return { children: null, props: { rowSpan: 0 } };
    return {
      children: (
        <Input
          value={name}
          onChange={(e) => handleNameChange(record.relationId, e.target.value)}
          className="relation-name-input"
        />
      ),
      props: { rowSpan: SCENE_KEYS.length },
    };
  };

  const renderRiskLevelCell = (riskLevel: string, record: RelationViewRow) => {
    if (!record.isFirstScene) return { children: null, props: { rowSpan: 0 } };
    return {
      children: (
        <Select
          value={riskLevel}
          options={RISK_LEVEL_OPTIONS}
          onChange={(value) => handleRiskLevelChange(record.relationId, value)}
          className="relation-risk-level-select"
          placeholder="请选择"
        />
      ),
      props: { rowSpan: SCENE_KEYS.length },
    };
  };

  const renderHoverDescCell = (hoverDesc: string, record: RelationViewRow) => {
    if (!record.isFirstScene) return { children: null, props: { rowSpan: 0 } };
    return {
      children: (
        <Input
          value={hoverDesc}
          onChange={(e) => handleHoverDescChange(record.relationId, e.target.value)}
          className="relation-hover-desc-input"
          placeholder="请输入"
        />
      ),
      props: { rowSpan: SCENE_KEYS.length },
    };
  };

  const renderCategoryCell = (categoryName: string, record: RelationViewRow) => {
    if (!record.isFirstScene) return { children: null, props: { rowSpan: 0 } };
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
      <span className="template-action-delete" onClick={() => handleDeleteRelation(record.relationId)}>删除</span>,
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
      title: '风险等级',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      width: 120,
      render: (riskLevel: string, record: RelationViewRow) => renderRiskLevelCell(riskLevel, record),
    },
    {
      title: 'hover说明',
      dataIndex: 'hoverDesc',
      key: 'hoverDesc',
      width: 160,
      render: (hoverDesc: string, record: RelationViewRow) => renderHoverDescCell(hoverDesc, record),
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

  return (
    <OperationAdminLayout
      activeMenuKey="template_mgmt"
      defaultOpenKeys={['config_mgmt']}
      menuItems={MENU_ITEMS}
      breadcrumbItems={[
        { label: '配置管理' },
        { label: '企业关联关系配置', active: true }
      ]}
      showOrgBar={false}
    >
      <div className="operation-template-mgmt-page">
        <div className="enterprise-relation-toolbar">
          <Button type="link" icon={<PlusOutlined />} onClick={handleAddRelation}>新增企业关系</Button>
          <Button type="primary" onClick={handleSubmit}>提交</Button>
        </div>
        <Table
          className="enterprise-relation-table"
          dataSource={relationRows}
          rowKey="key"
          columns={relationColumns}
          pagination={false}
          bordered
          scroll={{ y: 520 }}
        />
      </div>
    </OperationAdminLayout>
  );
};

export default Component;
