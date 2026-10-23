/**
 * @name AI物料标准化与价格治理平台
 *
 */
import React, { useMemo, useState } from 'react';
import {
  Button,
  Checkbox,
  Drawer,
  Input,
  Modal,
  Progress,
  Select,
  Steps,
  Switch,
  Table,
  Tag,
  Upload,
  message
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import {
  Activity,
  ArrowRight,
  Bot,
  BrainCircuit,
  ChartNoAxesCombined,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Database,
  Download,
  FileCheck2,
  FileSpreadsheet,
  Filter,
  FolderInput,
  Layers3,
  LibraryBig,
  ListChecks,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  UsersRound
} from 'lucide-react';
import CentralizedProcurementLayout, { type MenuItem } from '../../components/centralized-procurement-layout';
import { Confidence, EmptyLoading, PageHeader, SectionCard, StatusTag } from './components';
import {
  governanceCases,
  materialRecords,
  priceRecords as initialPriceRecords,
  taskRecords,
  type MaterialRecord,
  type PageKey,
  type PriceRecord,
  type TaskRecord
} from './data';
import './style.css';

const menuItems: MenuItem[] = [
  {
    key: 'price-governance',
    label: '价格库',
    collapsedLabel: '价格',
    icon: <CircleDollarSign className="menu-icon" />,
    children: [
      { key: 'overview', label: '治理总览' },
      { key: 'import', label: '数据接入' },
      { key: 'workbench', label: '治理工作台' },
      { key: 'library', label: '标准物料库' },
      { key: 'price-audit', label: '价格入库审核' },
      { key: 'inquiry', label: '智能询价' },
      { key: 'tasks', label: '任务中心' }
    ]
  }
];

const pageNames: Record<PageKey, string> = {
  overview: '治理总览',
  import: '数据接入',
  workbench: '治理工作台',
  library: '标准物料库',
  'price-audit': '价格入库审核',
  inquiry: '智能询价',
  tasks: '任务中心'
};

function MetricCard(props: { icon: React.ReactNode; label: string; value: string; change: string; tone?: string }) {
  return (
    <div className={`pg-metric-card ${props.tone || ''}`}>
      <div className="pg-metric-icon">{props.icon}</div>
      <div>
        <span>{props.label}</span>
        <strong>{props.value}</strong>
        <small>{props.change}</small>
      </div>
    </div>
  );
}

function OverviewPage({ navigate }: { navigate: (page: PageKey) => void }) {
  const stages = [
    { label: '已接入原始数据', value: '1,286.4 万', percent: 100, icon: <Database size={18} /> },
    { label: 'AI 已完成拆解', value: '968.7 万', percent: 75, icon: <BrainCircuit size={18} /> },
    { label: '专家已确认', value: '432.6 万', percent: 45, icon: <UsersRound size={18} /> },
    { label: '标准物料已生效', value: '86.3 万', percent: 20, icon: <ShieldCheck size={18} /> }
  ];
  return (
    <>
      <PageHeader
        eyebrow="AI MATERIAL GOVERNANCE"
        title="物料与价格治理总览"
        description="聚焦近 5 年高频物料，以 AI 初筛和专家确认推进跨工程局标准化治理。"
        extra={<Button type="primary" icon={<UploadCloud size={16} />} onClick={() => navigate('import')}>接入新数据</Button>}
      />
      <div className="pg-metrics-grid">
        <MetricCard icon={<Layers3 size={22} />} label="标准物料总量" value="863,248" change="本月新增 12,680 条" />
        <MetricCard icon={<Sparkles size={22} />} label="AI 拆解准确率" value="87.6%" change="较上月提升 2.4%" tone="cyan" />
        <MetricCard icon={<ListChecks size={22} />} label="待专家确认" value="18,642" change="其中低置信度 2,306 条" tone="amber" />
        <MetricCard icon={<CircleDollarSign size={22} />} label="已确认价格记录" value="286,530" change="覆盖 32 个工程局" tone="violet" />
      </div>
      <div className="pg-overview-grid">
        <SectionCard title="治理闭环进度" subtitle="从原始数据到标准物料的阶段转化">
          <div className="pg-stage-flow">
            {stages.map((stage, index) => (
              <React.Fragment key={stage.label}>
                <div className="pg-stage-item">
                  <div className="pg-stage-icon">{stage.icon}</div>
                  <div className="pg-stage-copy"><span>{stage.label}</span><strong>{stage.value}</strong></div>
                  <Progress percent={stage.percent} showInfo={false} strokeColor="#0081cc" />
                  <small>阶段完成率 {stage.percent}%</small>
                </div>
                {index < stages.length - 1 && <ChevronRight className="pg-stage-arrow" size={20} />}
              </React.Fragment>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="本周任务提醒" extra={<Button type="link" onClick={() => navigate('tasks')}>查看全部</Button>}>
          <div className="pg-reminder-list">
            {taskRecords.slice(0, 4).map(task => (
              <button key={task.key} className="pg-reminder-item" onClick={() => navigate('tasks')}>
                <span className={`pg-reminder-dot ${task.status === '已逾期' ? 'danger' : ''}`} />
                <span><strong>{task.name}</strong><small>{task.assignee} · 截止 {task.deadline}</small></span>
                <span className="pg-reminder-progress">{task.progress}%</span>
              </button>
            ))}
          </div>
        </SectionCard>
      </div>
      <div className="pg-overview-grid lower">
        <SectionCard title="高频品类治理进度" subtitle="一期优先覆盖大宗高频建材">
          <div className="pg-category-bars">
            {[['钢筋', 82, '145,820'], ['水泥', 68, '96,320'], ['管材', 57, '72,410'], ['电线电缆', 44, '51,680'], ['防水材料', 39, '38,290']].map(([name, value, count]) => (
              <div className="pg-category-row" key={name as string}>
                <span>{name}</span><div><i style={{ width: `${value}%` }} /></div><strong>{value}%</strong><small>{count} 条</small>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="AI 效能" subtitle="近 30 天模型与人工协作表现">
          <div className="pg-ai-panel">
            <div className="pg-ai-score"><BrainCircuit size={30} /><strong>8.4×</strong><span>治理效率提升</span></div>
            <div className="pg-ai-stats"><div><strong>80.2%</strong><span>AI 自动初筛</span></div><div><strong>19.8%</strong><span>专家确认修正</span></div><div><strong>2.1s</strong><span>单条平均耗时</span></div></div>
          </div>
        </SectionCard>
      </div>
    </>
  );
}

function ImportPage({ navigate }: { navigate: (page: PageKey) => void }) {
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const mappings = [
    ['物料名称', '材料名称', 'HRB400E热轧带肋钢筋'],
    ['规格型号', '规格', 'Φ25mm 抗震'],
    ['计量单位', '单位', '吨'],
    ['数量', '采购数量', '1,280'],
    ['含税单价', '合同单价', '3,860.00']
  ];
  const proceed = () => {
    if (step === 0 && files.length === 0) {
      setFiles([{ uid: 'demo', name: '华东区域钢材联合采购清单.xlsx', status: 'done', size: 264000 }]);
      message.success('已加载演示文件并完成智能解析');
    }
    setStep(current => Math.min(2, current + 1));
  };
  return (
    <>
      <PageHeader title="数据接入" description="支持采购 Excel、合同 PDF 与招标清单，自动识别字段并进入 AI 拆解队列。" />
      <SectionCard className="pg-import-card">
        <Steps current={step} items={[{ title: '上传数据文件', description: '解析文件结构' }, { title: '确认字段映射', description: '对齐标准字段' }, { title: '预览并导入', description: '进入拆解队列' }]} />
        {step === 0 && (
          <div className="pg-step-panel">
            <Upload.Dragger fileList={files} onChange={({ fileList }) => setFiles(fileList)} beforeUpload={() => false} multiple>
              <div className="pg-upload-icon"><UploadCloud size={34} /></div>
              <p className="ant-upload-text">拖拽文件到此处，或点击选择文件</p>
              <p className="ant-upload-hint">支持 .xlsx、.xls、.pdf、.docx，单个文件不超过 100MB</p>
            </Upload.Dragger>
            <div className="pg-source-options">
              <div><FileSpreadsheet /><strong>采购 Excel 清单</strong><span>自动识别列头、去重清洗</span></div>
              <div><FileCheck2 /><strong>合同文本</strong><span>OCR + 大模型抽取物料条目</span></div>
              <div><FolderInput /><strong>招标清单</strong><span>结构化解析并批量提取</span></div>
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="pg-step-panel">
            <div className="pg-map-summary"><CheckCircle2 size={18} /><span>AI 已识别 8 个源字段，其中 5 个完成自动映射，请确认后继续。</span><Tag color="success">自动映射率 92%</Tag></div>
            <div className="pg-mapping-table">
              <div className="pg-mapping-head"><span>标准字段</span><span>映射关系</span><span>源文件列头</span><span>示例值</span></div>
              {mappings.map(row => <div className="pg-mapping-row" key={row[0]}><strong>{row[0]}</strong><ArrowRight size={16} /><Select value={row[1]} options={mappings.map(item => ({ value: item[1], label: item[1] }))} /><span>{row[2]}</span></div>)}
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="pg-step-panel">
            <div className="pg-preview-summary"><div><Database size={22} /><span>识别数据</span><strong>12,680 条</strong></div><div><CheckCircle2 size={22} /><span>有效数据</span><strong>12,438 条</strong></div><div><Activity size={22} /><span>疑似重复</span><strong>186 条</strong></div><div><ShieldCheck size={22} /><span>字段完整率</span><strong>96.8%</strong></div></div>
            <Table size="small" pagination={false} dataSource={materialRecords.slice(0, 4)} columns={[{ title: '原始物料名称', dataIndex: 'name' }, { title: '识别品类', dataIndex: 'category' }, { title: '状态', render: () => <Tag color="success">校验通过</Tag> }]} />
          </div>
        )}
        <div className="pg-step-actions">
          {step > 0 && <Button onClick={() => setStep(current => current - 1)}>上一步</Button>}
          {step < 2 ? <Button type="primary" onClick={proceed}>下一步</Button> : <Button type="primary" icon={<Sparkles size={16} />} onClick={() => { message.success('12,438 条数据已进入 AI 拆解队列'); navigate('workbench'); }}>确认导入并开始 AI 拆解</Button>}
        </div>
      </SectionCard>
    </>
  );
}

function WorkbenchPage() {
  const [caseIndex, setCaseIndex] = useState(0);
  const currentCase = governanceCases[caseIndex];
  const [selectedAtoms, setSelectedAtoms] = useState<string[]>(currentCase.atoms.map(item => item.key));
  const selected = currentCase.atoms.filter(item => selectedAtoms.includes(item.key));
  const standardName = selected.map(item => item.value).join(' ');
  const nextCase = () => {
    const next = (caseIndex + 1) % governanceCases.length;
    setCaseIndex(next);
    setSelectedAtoms(governanceCases[next].atoms.map(item => item.key));
  };
  return (
    <>
      <PageHeader title="治理工作台" description="AI 已完成语义拆解，请确认原子属性并组装为标准物料。" extra={<div className="pg-task-progress"><span>钢筋品类标准化</span><strong>128 / 500</strong><Progress percent={26} showInfo={false} /></div>} />
      <div className="pg-workbench-grid">
        <SectionCard title="AI 抽取原子" subtitle={`来源：${currentCase.source}`} className="pg-workbench-column">
          <div className="pg-original-box"><span>原始描述</span><strong>{currentCase.original}</strong><small>{currentCase.id} · AI 处理耗时 2.1 秒</small></div>
          <Checkbox.Group value={selectedAtoms} onChange={values => setSelectedAtoms(values as string[])} className="pg-atom-list">
            {currentCase.atoms.map(atom => (
              <label className={`pg-atom-item ${atom.confidence < 80 ? 'needs-review' : ''}`} key={atom.key}>
                <Checkbox value={atom.key} />
                <span><small>{atom.label}</small><strong>{atom.value}</strong></span>
                <Confidence value={atom.confidence} />
              </label>
            ))}
          </Checkbox.Group>
          <Button type="dashed" block icon={<Plus size={15} />}>补充属性原子</Button>
        </SectionCard>
        <SectionCard title="实时组装预览" subtitle="勾选左侧原子词条后自动生成" className="pg-workbench-column pg-preview-column">
          <div className="pg-standard-preview"><span>标准物料名称</span><Input value={standardName} onChange={() => undefined} suffix={<Sparkles size={16} />} /></div>
          <div className="pg-preview-section"><h3>属性原子集合</h3>{selected.map(item => <div className="pg-preview-atom" key={item.key}><span>{item.label}</span><strong>{item.value}</strong><Check size={15} /></div>)}</div>
          <div className="pg-preview-section"><h3>同义词建议</h3><div className="pg-synonym-editor"><Tag closable>三级抗震钢</Tag><Tag closable>E标螺纹钢</Tag><Tag closable>25厘钢筋</Tag><Button type="link" icon={<Plus size={14} />}>添加</Button></div></div>
          <div className="pg-feedback-note"><Bot size={18} /><span>本次修改将回流为训练样本，用于提升同品类后续拆解准确率。</span></div>
        </SectionCard>
        <SectionCard title="相似标准推荐" subtitle="避免重复创建标准物料" className="pg-workbench-column">
          <div className="pg-similar-card selected"><div><LibraryBig size={18} /><Tag color="blue">相似度 92%</Tag></div><strong>HRB400E Φ25mm 热轧带肋钢筋</strong><p>差异：缺少“抗震”特性，可考虑升级现有标准版本。</p><Button type="link">查看标准详情</Button></div>
          <div className="pg-similar-card"><div><LibraryBig size={18} /><Tag>相似度 82%</Tag></div><strong>HRB400 Φ25mm 热轧带肋钢筋</strong><p>差异：牌号不含 E，抗震等级不一致。</p><Button type="link">查看标准详情</Button></div>
          <div className="pg-recommendation"><Sparkles size={18} /><div><strong>AI 建议</strong><p>升级第一条相似物料的属性版本，可覆盖 1,286 条历史非标叫法。</p></div></div>
        </SectionCard>
      </div>
      <div className="pg-workbench-actions"><span>截止日期：2026-11-15 · 剩余 372 条</span><div><Button onClick={nextCase}>跳过此条</Button><Button danger onClick={() => { message.info('已标记为废弃'); nextCase(); }}>标记废弃</Button><Button onClick={() => message.info('已进入拆分处理模式')}>拆分处理</Button><Button type="primary" icon={<Check size={16} />} onClick={() => { message.success('标准物料已确认入库'); nextCase(); }}>确认入库并处理下一条</Button></div></div>
    </>
  );
}

function LibraryPage() {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('all');
  const [detail, setDetail] = useState<MaterialRecord | null>(null);
  const filtered = materialRecords.filter(item => (category === 'all' || item.category.includes(category)) && `${item.name}${item.synonyms.join('')}`.toLowerCase().includes(keyword.toLowerCase()));
  const columns: ColumnsType<MaterialRecord> = [
    { title: '标准物料', dataIndex: 'name', render: (text, record) => <button className="pg-material-link" onClick={() => setDetail(record)}><strong>{text}</strong><small>{record.id}</small></button> },
    { title: '品类路径', dataIndex: 'category', width: 220 },
    { title: '属性原子', dataIndex: 'atoms', width: 300, render: atoms => <div className="pg-tag-cell">{atoms.slice(0, 3).map((atom: string) => <Tag key={atom}>{atom}</Tag>)}</div> },
    { title: '关联价格', dataIndex: 'prices', width: 100, render: value => `${value} 条` },
    { title: '状态', dataIndex: 'status', width: 90, render: status => <StatusTag status={status} /> },
    { title: '最后确认', dataIndex: 'expert', width: 110 },
    { title: '操作', width: 100, render: (_, record) => <Button type="link" onClick={() => setDetail(record)}>查看详情</Button> }
  ];
  return (
    <>
      <PageHeader title="标准物料库" description="统一管理已确认标准物料、属性原子、同义词映射和历史版本。" extra={<Button type="primary" icon={<Plus size={16} />}>新增标准物料</Button>} />
      <SectionCard>
        <div className="pg-filter-bar"><Input prefix={<Search size={16} />} placeholder="搜索标准名称、属性或同义词" value={keyword} onChange={event => setKeyword(event.target.value)} allowClear /><Select value={category} onChange={setCategory} options={[{ value: 'all', label: '全部品类' }, { value: '钢筋', label: '钢筋' }, { value: '水泥', label: '水泥' }, { value: '管材', label: '管材' }, { value: '电气', label: '电气与灯具' }]} /><Select defaultValue="all" options={[{ value: 'all', label: '全部状态' }, { value: 'active', label: '已生效' }, { value: 'pending', label: '待审核' }]} /><Button icon={<Filter size={15} />}>更多筛选</Button><span className="pg-filter-count">共 {filtered.length} 条标准物料</span></div>
        <Table rowKey="key" columns={columns} dataSource={filtered} pagination={{ pageSize: 5, showTotal: total => `共 ${total} 条` }} />
      </SectionCard>
      <Drawer width={560} title="标准物料详情" open={Boolean(detail)} onClose={() => setDetail(null)}>
        {detail && <div className="pg-detail-drawer"><div className="pg-detail-title"><div className="pg-detail-icon"><LibraryBig /></div><div><StatusTag status={detail.status} /><h2>{detail.name}</h2><p>{detail.id} · {detail.category}</p></div></div><div className="pg-detail-block"><h3>属性原子集合</h3>{detail.atoms.map(atom => <Tag color="blue" key={atom}>{atom}</Tag>)}</div><div className="pg-detail-block"><h3>历史非标叫法</h3>{detail.synonyms.map(item => <div className="pg-synonym-row" key={item}><span>{item}</span><Tag color="success">已映射</Tag></div>)}</div><div className="pg-detail-stats"><div><span>关联历史价格</span><strong>{detail.prices} 条</strong></div><div><span>当前标准版本</span><strong>V3.2</strong></div><div><span>最后确认专家</span><strong>{detail.expert}</strong></div></div><div className="pg-detail-block"><h3>版本记录</h3><p>V3.2 · 新增“抗震”属性维度 · {detail.updatedAt}</p><p>V3.1 · 补充同义词映射 · 2026-09-18 11:20</p></div></div>}
      </Drawer>
    </>
  );
}

function PriceAuditPage() {
  const [records, setRecords] = useState(initialPriceRecords);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const updateStatus = (keys: React.Key[], status: string) => {
    setRecords(current => current.map(item => keys.includes(item.key) ? { ...item, status } : item));
    setSelectedKeys([]);
    message.success(`已将 ${keys.length} 条价格记录标记为“${status}”`);
  };
  const columns: ColumnsType<PriceRecord> = [
    { title: '候选价格', dataIndex: 'price', width: 130, render: (value, record) => <strong className="pg-price">¥ {value.toLocaleString()} / {record.unit}</strong> },
    { title: '来源', dataIndex: 'source', width: 110, render: value => <Tag color={value === '合同文本' ? 'blue' : 'default'}>{value}</Tag> },
    { title: '来源文档', dataIndex: 'document', ellipsis: true },
    { title: '工程局 / 区域', width: 170, render: (_, record) => <span>{record.bureau}<small className="pg-table-sub">{record.region}</small></span> },
    { title: '签约时间', dataIndex: 'date', width: 120 },
    { title: 'AI 匹配度', dataIndex: 'confidence', width: 110, render: value => <Confidence value={value} /> },
    { title: '审核状态', dataIndex: 'status', width: 100, render: status => <StatusTag status={status} /> },
    { title: '操作', width: 180, render: (_, record) => <div className="pg-action-links"><button onClick={() => updateStatus([record.key], '已选用')}>选用</button><button onClick={() => updateStatus([record.key], '价格存疑')}>存疑</button><button className="danger" onClick={() => updateStatus([record.key], '不选用')}>不选用</button></div> }
  ];
  return (
    <>
      <PageHeader title="价格入库审核" description="AI 将候选价格自动匹配至标准物料，请按权威来源和置信度完成最终确认。" />
      <div className="pg-audit-summary"><div><span>待审核记录</span><strong>2,386</strong></div><div><span>高置信度</span><strong>1,648</strong></div><div><span>异常价格</span><strong className="danger">126</strong></div><div><span>今日已审核</span><strong>324</strong></div></div>
      <SectionCard title="HRB400E Φ25mm 热轧带肋抗震钢筋" subtitle="标准 ID：MAT-GB-000238 · 候选记录按“合同文本 > 招标清单”排序" extra={<Tag color="blue">参考中位价 ¥3,860 / 吨</Tag>}>
        {selectedKeys.length > 0 && <div className="pg-batch-bar"><span>已选择 {selectedKeys.length} 条记录</span><Button size="small" type="primary" onClick={() => updateStatus(selectedKeys, '已选用')}>批量选用</Button><Button size="small" onClick={() => updateStatus(selectedKeys, '价格存疑')}>标记存疑</Button><Button size="small" danger onClick={() => updateStatus(selectedKeys, '不选用')}>批量不选用</Button></div>}
        <Table rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys }} columns={columns} dataSource={records.slice(0, 3)} pagination={false} />
      </SectionCard>
      <SectionCard title="P.O 42.5 普通硅酸盐水泥（散装）" subtitle="标准 ID：MAT-SN-000119 · 检测到 1 条价格偏离区域均价" extra={<Tag color="orange">需重点复核</Tag>}>
        <Table columns={columns} dataSource={records.slice(3)} pagination={false} />
      </SectionCard>
    </>
  );
}

function InquiryPage() {
  const [query, setQuery] = useState('HRB400E Φ25mm 抗震钢筋');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(true);
  const [onlyWinning, setOnlyWinning] = useState(false);
  const runSearch = () => {
    setLoading(true);
    setSearched(false);
    window.setTimeout(() => { setLoading(false); setSearched(true); message.success('已匹配 23 条历史价格记录'); }, 700);
  };
  const points = [42, 64, 53, 77, 35, 58, 68, 48, 72, 56, 83, 62];
  return (
    <>
      <PageHeader title="招采智能询价" description="输入非标物料描述，AI 匹配同品类、同规格、同区域、同时间窗口的历史签约价。" extra={<Button icon={<Download size={16} />} onClick={() => message.success('询价参考单已生成')}>导出参考单</Button>} />
      <SectionCard className="pg-inquiry-search-card">
        <div className="pg-query-row"><Input size="large" prefix={<Sparkles size={18} />} value={query} onChange={event => setQuery(event.target.value)} placeholder="输入物料名称、规格或粘贴清单描述" /><Button size="large" type="primary" icon={<Search size={17} />} onClick={runSearch}>AI 智能匹配</Button></div>
        <div className="pg-inquiry-filters"><Select defaultValue="上海市" options={[{ value: '上海市', label: '上海市' }, { value: '广东省', label: '广东省' }]} /><Select defaultValue="12m" options={[{ value: '6m', label: '近 6 个月' }, { value: '12m', label: '近 12 个月' }, { value: '3y', label: '近 3 年' }]} /><Select defaultValue="钢筋" options={[{ value: '钢筋', label: '建材 / 钢材 / 钢筋' }, { value: '水泥', label: '建材 / 水泥' }]} /><Select defaultValue="all" options={[{ value: 'all', label: '全部工程局' }, { value: 'own', label: '仅本工程局' }]} /><label>只看中标价 <Switch checked={onlyWinning} onChange={setOnlyWinning} size="small" /></label></div>
      </SectionCard>
      {loading && <SectionCard><EmptyLoading label="AI 正在匹配标准物料与历史价格" /></SectionCard>}
      {searched && !loading && <div className="pg-inquiry-layout">
        <div>
          <SectionCard title="AI 匹配结果" extra={<Confidence value={96} />}>
            <div className="pg-match-result"><div className="pg-match-icon"><CheckCircle2 /></div><div><span>匹配标准物料</span><h2>HRB400E Φ25mm 热轧带肋抗震钢筋</h2><p>建材 / 钢材 / 钢筋 · MAT-GB-000238</p><div className="pg-tag-cell"><Tag color="blue">牌号 HRB400E</Tag><Tag color="blue">直径 25mm</Tag><Tag color="blue">抗震</Tag></div></div></div>
          </SectionCard>
          <SectionCard title="历史价格分布" subtitle={`近 12 个月 · 上海市 · ${onlyWinning ? '仅中标价' : '合同价与中标价'}`}>
            <div className="pg-price-chart"><div className="pg-chart-axis"><span>¥4,100</span><span>¥3,900</span><span>¥3,700</span><span>¥3,500</span></div><div className="pg-chart-plot"><div className="pg-median-line"><span>中位价 ¥3,860</span></div>{points.slice(0, onlyWinning ? 7 : 12).map((point, index) => <i key={index} style={{ left: `${5 + index * 8}%`, bottom: `${point}%` }} title={`价格样本 ${index + 1}`} />)}<div className="pg-chart-months"><span>2025.11</span><span>2026.03</span><span>2026.07</span><span>2026.10</span></div></div></div>
          </SectionCard>
        </div>
        <div>
          <SectionCard title="参考价格区间"><div className="pg-reference-price"><span>建议参考价</span><strong>¥3,760 – ¥3,980</strong><small>元 / 吨 · 已脱敏取整</small></div><div className="pg-price-insights"><div><span>样本数量</span><strong>23 条</strong></div><div><span>价格中位数</span><strong>¥3,860</strong></div><div><span>最新签约价</span><strong>¥3,915</strong></div><div><span>价格波动</span><strong>± 3.2%</strong></div></div><div className="pg-floating-tip"><ChartNoAxesCombined size={18} /><span>钢筋启用浮动价机制，建议参考价已包含 ±5% 品类浮动系数。</span></div></SectionCard>
          <SectionCard title="相似项目"><div className="pg-project-list">{['临港新城综合体项目', '浦东机场扩建工程', '虹桥商务区二期'].map((name, index) => <div key={name}><span><strong>{name}</strong><small>上海市 · 中建{index + 2}局</small></span><b>¥{[3915, 3798, 3860][index]}</b></div>)}</div></SectionCard>
        </div>
      </div>}
    </>
  );
}

function TasksPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [tasks, setTasks] = useState(taskRecords);
  const columns: ColumnsType<TaskRecord> = [
    { title: '任务名称', dataIndex: 'name', render: (text, record) => <span className="pg-task-name"><strong>{text}</strong><small>{record.category} · {record.total} 条物料</small></span> },
    { title: '工程局', dataIndex: 'bureau', width: 120 },
    { title: '处理专家', dataIndex: 'assignee', width: 110 },
    { title: '截止日期', dataIndex: 'deadline', width: 130, render: (value, record) => <span className={record.status === '已逾期' ? 'pg-danger-text' : ''}>{value}</span> },
    { title: '治理进度', dataIndex: 'progress', width: 210, render: value => <div className="pg-table-progress"><Progress percent={value} size="small" strokeColor={value === 100 ? '#52c41a' : '#0081cc'} /></div> },
    { title: '状态', dataIndex: 'status', width: 100, render: status => <StatusTag status={status} /> },
    { title: '操作', width: 140, render: (_, record) => <div className="pg-action-links"><button>查看</button>{record.status !== '已完成' && <button onClick={() => message.success(`已向 ${record.assignee} 发送催办提醒`)}>催办</button>}</div> }
  ];
  const createTask = () => {
    setTasks(current => [{ key: `t${current.length + 1}`, name: '新建钢筋标准化治理任务', category: '钢筋', bureau: '中建八局', assignee: '张建国', deadline: '2026-11-30', progress: 0, status: '进行中', total: 300 }, ...current]);
    setCreateOpen(false);
    message.success('治理任务已创建并通知处理专家');
  };
  return (
    <>
      <PageHeader title="治理任务中心" description="按品类与工程局组织治理任务，统一追踪处理进度、截止时间和专家工作量。" extra={<Button type="primary" icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>创建治理任务</Button>} />
      <div className="pg-task-stats"><div><ListChecks /><span>全部任务</span><strong>36</strong></div><div><Clock3 /><span>进行中</span><strong>18</strong></div><div className="warning"><Activity /><span>已逾期</span><strong>4</strong></div><div><CheckCircle2 /><span>本月完成</span><strong>14</strong></div></div>
      <SectionCard>
        <div className="pg-filter-bar"><Input prefix={<Search size={16} />} placeholder="搜索任务名称" /><Select defaultValue="all" options={[{ value: 'all', label: '全部状态' }, { value: 'active', label: '进行中' }, { value: 'overdue', label: '已逾期' }]} /><Select defaultValue="all" options={[{ value: 'all', label: '全部品类' }, { value: 'steel', label: '钢筋' }, { value: 'cement', label: '水泥' }]} /><span className="pg-filter-count">共 {tasks.length} 个任务</span></div>
        <Table columns={columns} dataSource={tasks} pagination={{ pageSize: 6 }} />
      </SectionCard>
      <Modal title="创建治理任务" open={createOpen} onCancel={() => setCreateOpen(false)} onOk={createTask} okText="创建并分派" cancelText="取消">
        <div className="pg-modal-form"><label><span>任务名称</span><Input defaultValue="新建钢筋标准化治理任务" /></label><label><span>治理品类</span><Select defaultValue="钢筋" options={[{ value: '钢筋', label: '建材 / 钢材 / 钢筋' }, { value: '水泥', label: '建材 / 水泥' }]} /></label><label><span>目标工程局</span><Select defaultValue="中建八局" options={[{ value: '中建八局', label: '中建八局' }, { value: '中建二局', label: '中建二局' }]} /></label><label><span>分派专家</span><Select defaultValue="张建国" options={[{ value: '张建国', label: '张建国（钢材专家）' }, { value: '王海峰', label: '王海峰（水泥专家）' }]} /></label><label><span>截止日期</span><Input type="date" defaultValue="2026-11-30" /></label></div>
      </Modal>
    </>
  );
}

const Component: React.FC = () => {
  const [page, setPage] = useState<PageKey>('overview');
  const content = useMemo(() => {
    if (page === 'overview') return <OverviewPage navigate={setPage} />;
    if (page === 'import') return <ImportPage navigate={setPage} />;
    if (page === 'workbench') return <WorkbenchPage />;
    if (page === 'library') return <LibraryPage />;
    if (page === 'price-audit') return <PriceAuditPage />;
    if (page === 'inquiry') return <InquiryPage />;
    return <TasksPage />;
  }, [page]);

  return (
    <CentralizedProcurementLayout
      activeMenuKey={page}
      sidebarItems={menuItems}
      defaultOpenGroupKeys={['price-governance']}
      onSubMenuClick={key => setPage(key as PageKey)}
      orgName="中建集团-集采中心"
      username="治理管理员"
    >
      <div className="pg-app-shell">
        <div className="pg-breadcrumb"><span>价格库</span><ChevronRight size={13} /><strong>{pageNames[page]}</strong></div>
        {content}
      </div>
    </CentralizedProcurementLayout>
  );
};

Component.displayName = 'AiMaterialPriceGovernance';

export default Component;
