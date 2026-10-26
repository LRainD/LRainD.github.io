import React, { useMemo, useState } from 'react';
import { Button, Descriptions, Drawer, Input, Select, Space, Table, Tag, Timeline, Tooltip } from 'antd';
import { ApartmentOutlined, EditOutlined, HistoryOutlined, SearchOutlined } from '@ant-design/icons';
import type { StandardMaterial } from './data';
import { useDemo } from './context';
import { PageHeader, Surface } from './shared';

export const StandardsPage: React.FC = () => {
  const { standards, setPage, openStandardEditor } = useDemo();
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('全部');
  const [selected, setSelected] = useState<StandardMaterial | null>(null);
  const filtered = useMemo(() => standards.filter(item => {
    const hitKeyword = !keyword || `${item.name}${item.code}${item.synonyms.join('')}`.toLowerCase().includes(keyword.toLowerCase());
    const hitCategory = category === '全部' || item.category.includes(category);
    return hitKeyword && hitCategory;
  }), [standards, keyword, category]);

  /** 品类筛选项跟随数据派生，新增品类后不用再改这里 */
  const categoryOptions = useMemo(
    () => Array.from(new Set(standards.map(item => item.category.split(' / ').pop() || ''))).filter(Boolean),
    [standards]
  );

  const columns = [
    { title: '标准物料编码', dataIndex: 'code', key: 'code', width: 140, ellipsis: true },
    {
      title: '标准名称', dataIndex: 'name', key: 'name', width: 250, ellipsis: true,
      render: (value: string, record: StandardMaterial) => (
        <Tooltip title={value} placement="topLeft">
          <span className="pg-std-link" onClick={() => setSelected(record)}>{value}</span>
        </Tooltip>
      )
    },
    {
      title: '规格型号', dataIndex: 'attributes', key: 'attributes', width: 210,
      render: (values: string[]) => (
        <Tooltip title={values.join('；')} placement="topLeft">
          <span className="pg-spec-tags">
            {values.slice(0, 2).map(value => <Tag key={value}>{value}</Tag>)}
            {values.length > 2 && <Tag>+{values.length - 2}</Tag>}
          </span>
        </Tooltip>
      )
    },
    { title: '历史叫法', dataIndex: 'synonyms', key: 'synonyms', width: 180, ellipsis: true, render: (values: string[]) => values.join('、') },
    { title: '品类路径', dataIndex: 'category', key: 'category', width: 180, ellipsis: true },
    { title: '关联价格', dataIndex: 'prices', key: 'prices', width: 100, render: (value: number) => <span className="pg-positive"><b>{value}</b> 条</span> },
    { title: '最近更新', dataIndex: 'updatedAt', key: 'updatedAt', width: 112 },
    { title: '状态', key: 'status', width: 88, render: () => <Tag color="success">已生效</Tag> },
    {
      title: '操作', key: 'action', width: 118, fixed: 'right' as const,
      render: (_: unknown, record: StandardMaterial) => (
        <Space size={0}>
          <Tooltip title="逐条编辑该物料的名称、规格型号与历史叫法">
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openStandardEditor(record.key)}>
              编辑
            </Button>
          </Tooltip>
          <Button type="link" size="small" onClick={() => setSelected(record)}>详情</Button>
        </Space>
      )
    }
  ];

  return <>
    <PageHeader title="标准物料库" subtitle="统一管理标准名称、规格型号、同义词映射和历史版本，是价格匹配的知识基座" action={<Button type="primary" onClick={() => setPage('governance')}>进入治理工作台</Button>} />
    <div className="pg-filter-bar">
      <Input prefix={<SearchOutlined />} placeholder="搜索标准名称、编码或历史叫法" value={keyword} onChange={event => setKeyword(event.target.value)} allowClear style={{ minWidth: 320 }} />
      <Select value={category} onChange={setCategory} options={['全部', ...categoryOptions].map(value => ({ value, label: value === '全部' ? '全部品类' : value }))} />
      <Tag color="blue">已生效 {filtered.length} 条</Tag>
    </div>
    <Surface>
      <Table className="pg-std-table" dataSource={filtered} columns={columns} rowKey="key" size="middle" pagination={{ pageSize: 6, showTotal: total => `共 ${total} 条` }} scroll={{ x: 1360 }} />
    </Surface>

    <Drawer open={Boolean(selected)} onClose={() => setSelected(null)} title="标准物料详情" size="large">
      {selected && <>
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="标准编码">{selected.code}</Descriptions.Item>
          <Descriptions.Item label="标准名称"><b>{selected.name}</b></Descriptions.Item>
          <Descriptions.Item label="品类路径">{selected.category}</Descriptions.Item>
          <Descriptions.Item label="规格型号"><Space wrap>{selected.attributes.map(item => <Tag color="blue" key={item}>{item}</Tag>)}</Space></Descriptions.Item>
          <Descriptions.Item label="同义词映射">{selected.synonyms.join('、')}</Descriptions.Item>
          <Descriptions.Item label="关联价格">{selected.prices} 条已审核价格</Descriptions.Item>
          <Descriptions.Item label="数据状态"><Tag color="success">已生效</Tag></Descriptions.Item>
        </Descriptions>
        <Surface size="small" title={<Space><ApartmentOutlined />治理溯源</Space>} style={{ marginTop: 16 }}>
          <Timeline items={[
            { color: 'blue', children: '2026-10-23 · 张工确认 AI 拆解结果并提交入库' },
            { color: 'blue', children: '2026-10-22 · 系统完成规格型号抽取与相似项推荐' },
            { color: 'gray', children: '2026-10-21 · 来源清单进入数据治理队列' }
          ]} />
        </Surface>
        <Space orientation="vertical" style={{ width: '100%', marginTop: 8 }}>
          <Button type="primary" icon={<EditOutlined />} block onClick={() => openStandardEditor(selected.key)}>编辑该物料</Button>
          <Button icon={<HistoryOutlined />} block onClick={() => setPage('review')}>查看入库审核记录</Button>
        </Space>
      </>}
    </Drawer>
  </>;
};
