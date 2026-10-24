import React, { useMemo, useState } from 'react';
import { Button, Descriptions, Drawer, Input, Select, Space, Table, Tag, Timeline } from 'antd';
import { ApartmentOutlined, HistoryOutlined, SearchOutlined } from '@ant-design/icons';
import type { StandardMaterial } from './data';
import { useDemo } from './context';
import { PageHeader, Surface } from './shared';

export const StandardsPage: React.FC = () => {
  const { standards, setPage } = useDemo();
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('全部');
  const [selected, setSelected] = useState<StandardMaterial | null>(null);
  const filtered = useMemo(() => standards.filter(item => {
    const hitKeyword = !keyword || `${item.name}${item.code}${item.synonyms.join('')}`.toLowerCase().includes(keyword.toLowerCase());
    const hitCategory = category === '全部' || item.category.includes(category);
    return hitKeyword && hitCategory;
  }), [standards, keyword, category]);

  const columns = [
    { title: '标准物料编码', dataIndex: 'code', key: 'code', width: 150 },
    { title: '标准名称', dataIndex: 'name', key: 'name', width: 300, render: (value: string, record: StandardMaterial) => <Button type="link" onClick={() => setSelected(record)}>{value}</Button> },
    { title: '品类路径', dataIndex: 'category', key: 'category', width: 210 },
    { title: '属性原子', dataIndex: 'attributes', key: 'attributes', render: (values: string[]) => <Space wrap>{values.slice(0, 3).map(value => <Tag key={value}>{value}</Tag>)}{values.length > 3 && <Tag>+{values.length - 3}</Tag>}</Space> },
    { title: '历史叫法', dataIndex: 'synonyms', key: 'synonyms', width: 190, render: (values: string[]) => values.join('、') },
    { title: '关联价格', dataIndex: 'prices', key: 'prices', width: 100, render: (value: number) => <span className="pg-positive"><b>{value}</b> 条</span> },
    { title: '最近更新', dataIndex: 'updatedAt', key: 'updatedAt', width: 120 },
    { title: '状态', key: 'status', width: 90, render: () => <Tag color="success">已生效</Tag> }
  ];

  return <>
    <PageHeader title="标准物料库" subtitle="统一管理标准名称、属性原子、同义词映射和历史版本，是价格匹配的知识基座" action={<Button type="primary" onClick={() => setPage('governance')}>进入治理工作台</Button>} />
    <div className="pg-filter-bar">
      <Input prefix={<SearchOutlined />} placeholder="搜索标准名称、编码或历史叫法" value={keyword} onChange={event => setKeyword(event.target.value)} allowClear style={{ minWidth: 320 }} />
      <Select value={category} onChange={setCategory} options={['全部', '钢筋', '水泥', '灯具'].map(value => ({ value, label: value === '全部' ? '全部品类' : value }))} />
      <Tag color="blue">已生效 {filtered.length} 条</Tag>
    </div>
    <Surface>
      <Table dataSource={filtered} columns={columns} rowKey="key" pagination={{ pageSize: 6, showTotal: total => `共 ${total} 条` }} scroll={{ x: 1250 }} />
    </Surface>

    <Drawer open={Boolean(selected)} onClose={() => setSelected(null)} title="标准物料详情" size="large">
      {selected && <>
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="标准编码">{selected.code}</Descriptions.Item>
          <Descriptions.Item label="标准名称"><b>{selected.name}</b></Descriptions.Item>
          <Descriptions.Item label="品类路径">{selected.category}</Descriptions.Item>
          <Descriptions.Item label="属性原子"><Space wrap>{selected.attributes.map(item => <Tag color="blue" key={item}>{item}</Tag>)}</Space></Descriptions.Item>
          <Descriptions.Item label="同义词映射">{selected.synonyms.join('、')}</Descriptions.Item>
          <Descriptions.Item label="关联价格">{selected.prices} 条已审核价格</Descriptions.Item>
          <Descriptions.Item label="数据状态"><Tag color="success">已生效</Tag></Descriptions.Item>
        </Descriptions>
        <Surface size="small" title={<Space><ApartmentOutlined />治理溯源</Space>} style={{ marginTop: 16 }}>
          <Timeline items={[
            { color: 'blue', children: '2026-10-23 · 张工确认 AI 拆解结果并提交入库' },
            { color: 'blue', children: '2026-10-22 · 系统完成属性原子抽取与相似项推荐' },
            { color: 'gray', children: '2026-10-21 · 来源清单进入数据治理队列' }
          ]} />
        </Surface>
        <Button icon={<HistoryOutlined />} block onClick={() => setPage('price-review')}>查看关联价格与审核记录</Button>
      </>}
    </Drawer>
  </>;
};
