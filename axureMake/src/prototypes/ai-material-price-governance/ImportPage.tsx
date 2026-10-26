import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Input,
  InputNumber,
  Progress,
  Select,
  Space,
  Steps,
  Table,
  Tag,
  Upload,
  message
} from 'antd';
import {
  ArrowRightOutlined,
  DeleteOutlined,
  InboxOutlined,
  LoadingOutlined,
  PlusOutlined,
  ReloadOutlined,
  SettingOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { useDemo } from './context';
import { Confidence, PageHeader, Surface } from './shared';
import { defaultAtomSynonyms } from './data';
import {
  clearImportDraft,
  loadImportDraft,
  saveImportDraft,
  type ImportDraft
} from './storage';
import { parseFile, getFileTypeLabel, isSupportedFile, type ParsedFile } from './ai/extract';
import { isAiConfigReady, loadAiConfig, resetAiConfig, saveAiConfig, type AiConfig } from './ai/config';
import { chatCompletion, resetProxyCache } from './ai/llm';
import {
  BATCH_SIZE,
  FIELD_DEFS,
  MAX_ITEMS,
  buildItemsFromLines,
  buildRawItems,
  decomposeItems,
  emptyMapping,
  guessMapping,
  mapColumnsWithAi,
  type AtomResult,
  type DecomposedItem,
  type FieldKey,
  type RawItem
} from './ai/decompose';

const STATUS_META: Record<DecomposedItem['status'], { text: string; color: string }> = {
  pending: { text: '待拆解', color: 'default' },
  running: { text: '拆解中', color: 'processing' },
  done: { text: '已完成', color: 'success' },
  error: { text: '失败', color: 'error' }
};

const SAMPLE_ROWS: string[][] = [
  ['三级抗震螺纹钢 20', 'HRB400E Φ20', '吨'],
  ['P.O42.5 普通硅酸盐水泥', '袋装 50kg', '吨'],
  ['PPR给水管', 'dn25 2.0MPa 热水管', '米'],
  ['LED面板灯', '600*600 36W 4000K 嵌入式', '套'],
  ['岩棉保温板', '厚度80mm 密度120kg/m³', '立方米']
];

const pendingItem = (item: RawItem): DecomposedItem => ({
  ...item,
  name: '',
  category: '',
  atoms: [],
  confidence: 0,
  status: 'pending'
});

const formatDraftTime = (iso: string) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? '未知时间'
    : date.toLocaleString('zh-CN', { hour12: false, month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};

export const ImportPage: React.FC = () => {
  const { completeImport } = useDemo();
  const [stage, setStage] = useState(0);
  const [config, setConfig] = useState<AiConfig>(() => loadAiConfig());
  const [configOpen, setConfigOpen] = useState(false);
  const [testing, setTesting] = useState(false);
  const [file, setFile] = useState<ParsedFile | null>(null);
  const [parsing, setParsing] = useState(false);
  const [sheetIndex, setSheetIndex] = useState(0);
  const [mapping, setMapping] = useState<Record<FieldKey, string>>(emptyMapping);
  const [mappingLoading, setMappingLoading] = useState(false);
  const [mappingSource, setMappingSource] = useState<'本地' | 'AI'>('本地');
  const [textDraft, setTextDraft] = useState('');
  const [skippedRows, setSkippedRows] = useState<string[]>([]);
  const [results, setResults] = useState<DecomposedItem[]>([]);
  /** 被手工删除的行，支持一键恢复 */
  const [removed, setRemoved] = useState<DecomposedItem[]>([]);
  const [running, setRunning] = useState(false);
  const [batchInfo, setBatchInfo] = useState({ index: 0, total: 0 });
  const [streamText, setStreamText] = useState('');
  const [thinking, setThinking] = useState(0);
  const [error, setError] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  /** 上次未导入的拆解草稿（刷新后恢复用） */
  const [draft, setDraft] = useState<ImportDraft | null>(() => loadImportDraft());
  /** 恢复草稿时的来源信息，file 已被销毁时兜底任务命名 */
  const [restoredMeta, setRestoredMeta] = useState<{ fileName: string; sheetName?: string } | null>(null);


  const table = file && file.kind === 'table' ? file.tables[sheetIndex] : undefined;

  // 拆解结果即时落本地：刷新或误关页面后可恢复，不必重新调用模型
  useEffect(() => {
    const usable = results.filter(item => item.status === 'done' && item.atoms.length);
    if (!usable.length) return;
    saveImportDraft({
      fileName: file?.fileName ?? restoredMeta?.fileName ?? '',
      sheetName: table?.name ?? restoredMeta?.sheetName,
      updatedAt: new Date().toISOString(),
      items: usable
    });
    // 结果一旦变化就说明草稿已被本次会话接管，不再展示恢复入口
    setDraft(null);
  }, [results, file, table, restoredMeta]);

  const processed = results.filter(item => item.status === 'done' || item.status === 'error').length;
  const doneCount = results.filter(item => item.status === 'done').length;
  const errorCount = results.filter(item => item.status === 'error').length;
  const percent = results.length ? Math.round((processed / results.length) * 100) : 0;

  const avgConfidence = useMemo(() => {
    const done = results.filter(item => item.status === 'done');
    if (!done.length) return 0;
    return Math.round(done.reduce((sum, item) => sum + item.confidence, 0) / done.length);
  }, [results]);

  const handleFile = async (rawFile: File) => {
    setError('');
    setParsing(true);
    setFile(null);
    setResults([]);
    setRemoved([]);
    try {
      if (!isSupportedFile(rawFile.name)) throw new Error('仅支持 Excel（xlsx / xls）、CSV 与 PDF 文件');
      if (rawFile.size > 30 * 1024 * 1024) throw new Error('文件超过 30MB，请拆分后再上传');
      const parsed = await parseFile(rawFile);
      setFile(parsed);
      setRestoredMeta(null);
      setSheetIndex(0);
      setSkippedRows([]);
      if (parsed.kind === 'table') {
        const first = parsed.tables[0];
        setMapping(guessMapping(first.headers));
        setMappingSource('本地');
        const rowCount = parsed.tables.reduce((sum, item) => sum + item.rows.length, 0);
        message.success(`已解析「${first.name}」· ${rowCount} 行数据 · ${first.headers.length} 列，请确认字段映射`);
      } else if (parsed.scan) {
        setTextDraft('');
        message.warning('该 PDF 为扫描件（无文字层），请粘贴清单文本或改用 Excel');
      } else {
        setTextDraft(parsed.lines.slice(0, MAX_ITEMS).join('\n'));
        message.success(`已提取 ${parsed.lines.length} 行文本，请确认待拆解明细`);
      }
      setStage(1);
    } catch (err) {
      setError((err as Error).message);
      message.error('文件解析失败');
    } finally {
      setParsing(false);
    }
  };

  const handleBeforeUpload = (rawFile: File) => {
    void handleFile(rawFile);
    return false;
  };

  const loadSample = () => {
    const sample: ParsedFile = {
      fileName: '某住宅项目招标物料清单-示例.xlsx',
      kind: 'table',
      tables: [{ name: '物料清单', headers: ['材料名称', '规格型号', '单位'], rows: SAMPLE_ROWS }],
      text: '',
      lines: [],
      totalRows: SAMPLE_ROWS.length
    };
    setError('');
    setResults([]);
    setRemoved([]);
    setFile(sample);
    setSheetIndex(0);
    setMapping(guessMapping(sample.tables[0].headers));
    setMappingSource('本地');
    setRestoredMeta(null);
    setStage(1);
    message.success('已载入 5 条示例物料');
  };

  const switchSheet = (index: number) => {
    setSheetIndex(index);
    const target = file?.tables[index];
    if (target) {
      setMapping(guessMapping(target.headers));
      setMappingSource('本地');
    }
  };

  const runAiMapping = async () => {
    if (!table) return;
    if (!isAiConfigReady(config)) {
      setConfigOpen(true);
      message.warning('请先补全模型配置');
      return;
    }
    setMappingLoading(true);
    setError('');
    try {
      const result = await mapColumnsWithAi({
        config,
        headers: table.headers,
        samples: table.rows.slice(0, 3)
      });
      setMapping(result);
      setMappingSource('AI');
      message.success('AI 已完成表头识别');
    } catch (err) {
      setError((err as Error).message);
      message.error('AI 识别失败，可手动指定列');
    } finally {
      setMappingLoading(false);
    }
  };

  const startDecompose = async (list: RawItem[], merge = false) => {
    if (!list.length) {
      message.warning('没有可拆解的物料');
      return;
    }
    if (!isAiConfigReady(config)) {
      setConfigOpen(true);
      message.warning('请先补全模型配置');
      return;
    }

    setStage(2);
    setError('');
    setStreamText('');
    setThinking(0);
    if (!merge) setRemoved([]);
    setResults(prev => {
      if (!merge) return list.map(pendingItem);
      const pending = new Map(list.map(item => [item.key, item]));
      return prev.map(item => (pending.has(item.key) ? pendingItem(pending.get(item.key) as RawItem) : item));
    });

    const controller = new AbortController();
    abortRef.current = controller;
    setRunning(true);
    setBatchInfo({ index: 0, total: Math.ceil(list.length / BATCH_SIZE) });

    try {
      await decomposeItems({
        config,
        items: list,
        signal: controller.signal,
        onBatchStart: (index, total) => {
          setBatchInfo({ index, total });
          setStreamText('');
          setThinking(0);
        },
        onProgress: progress => {
          setStreamText(progress.content);
          setThinking(progress.reasoningChars);
        },
        onBatchDone: (_batchIndex, batchResults) => {
          const patch = new Map(batchResults.map(item => [item.key, item]));
          setResults(prev => prev.map(item => patch.get(item.key) ?? item));
        }
      });
      message.success('AI 原子化拆解完成');
    } catch (err) {
      if ((err as Error).name !== 'AbortError') setError((err as Error).message);
    } finally {
      setRunning(false);
      abortRef.current = null;
    }
  };

  const handleMappingNext = () => {
    if (!table) return;
    if (!mapping.name) {
      message.warning('请先指定「物料名称」对应的列');
      return;
    }
    const { items, skipped } = buildRawItems(table, mapping);
    if (!items.length) {
      message.warning('所选列未解析出有效物料，请检查映射');
      return;
    }
    setSkippedRows(skipped);
    void startDecompose(items);
  };

  const handleTextNext = () => {
    const lines = textDraft.split('\n').map(line => line.trim()).filter(Boolean);
    if (!lines.length) {
      message.warning('请至少保留一行物料描述');
      return;
    }
    void startDecompose(buildItemsFromLines(lines));
  };

  const stopDecompose = () => {
    abortRef.current?.abort();
    message.info('已停止本次拆解');
  };

  /** 删除单行拆解结果，记入 removed 以便撤销 */
  const removeRow = (key: string) => {
    const target = results.find(item => item.key === key);
    if (!target) return;
    setResults(prev => prev.filter(item => item.key !== key));
    setRemoved(prev => [...prev, target]);
  };

  const removeFailedRows = () => {
    const failed = results.filter(item => item.status === 'error');
    if (!failed.length) return;
    setResults(prev => prev.filter(item => item.status !== 'error'));
    setRemoved(prev => [...prev, ...failed]);
    message.success(`已删除 ${failed.length} 条失败行`);
  };

  const undoRemove = () => {
    if (!removed.length) return;
    const restore = removed;
    setResults(prev => [...prev, ...restore].sort((a, b) => a.idx - b.idx));
    setRemoved([]);
    message.success(`已恢复 ${restore.length} 条`);
  };

  const patchAtoms = (key: string, updater: (atoms: AtomResult[]) => AtomResult[]) => {
    setResults(prev =>
      prev.map(item => {
        if (item.key !== key) return item;
        const atoms = updater(item.atoms).filter(atom => atom.label.trim() || atom.value.trim());
        return {
          ...item,
          atoms,
          name: atoms.map(atom => atom.value).join(' ') || item.raw,
          category: atoms.find(atom => atom.label === '品类')?.value || item.category
        };
      })
    );
  };

  const handleConfirmImport = () => {
    const valid = results.filter(item => item.status === 'done' && item.atoms.length);
    if (!valid.length) {
      message.warning('暂无可导入的拆解结果');
      return;
    }
    const stamp = Date.now();
    completeImport(
      valid.map((item, index) => ({
        key: `imp-${stamp}-${index}`,
        sourceName: item.raw,
        category: item.category || '未分类',
        bureau: '中建八局',
        unit: item.unit || '—',
        atoms: item.atoms.map((atom, atomIndex) => ({
          key: `a${atomIndex}`,
          label: atom.label,
          value: atom.value,
          confidence: atom.confidence,
          // 常见属性名先带上历史写法，专家在治理工作台里可增删
          synonyms: [...(defaultAtomSynonyms[atom.label] ?? [])]
        })),
        selectedAtomKeys: item.atoms.map((_, atomIndex) => `a${atomIndex}`),
        confidence: item.confidence
      })),
      {
        fileName: file?.fileName ?? restoredMeta?.fileName ?? '',
        sheetName: table?.name ?? restoredMeta?.sheetName
      }
    );
    clearImportDraft();
  };

  /** 恢复上次未导入的拆解结果，直接回到结果页 */
  const restoreDraft = () => {
    if (!draft) return;
    setResults(draft.items as DecomposedItem[]);
    setRemoved([]);
    setRestoredMeta({ fileName: draft.fileName, sheetName: draft.sheetName });
    setDraft(null);
    setStage(2);
    message.success(`已恢复上次 ${draft.items.length} 条拆解结果`);
  };

  const discardDraft = () => {
    clearImportDraft();
    setDraft(null);
    message.info('已丢弃上次的拆解结果');
  };

  const handleSaveConfig = () => {
    if (!isAiConfigReady(config)) {
      message.warning('API 地址、模型名称与 Key 均不能为空');
      return;
    }
    saveAiConfig(config);
    resetProxyCache();
    setConfigOpen(false);
    message.success('模型配置已保存到本机');
  };

  /** 自检：能拿到正文说明「Key + 代理通道」都是通的，便于区分是配置问题还是拆解问题 */
  const handleTestConnection = async () => {
    setTesting(true);
    resetProxyCache();
    try {
      const reply = await chatCompletion({
        config,
        system: '你是连通性测试助手，只回复两个字符：OK',
        user: 'ping',
        maxTokens: 8000,
        temperature: 0
      });
      message.success(`连接正常，模型已回复：${reply.trim().slice(0, 20) || 'OK'}`);
    } catch (err) {
      message.error((err as Error).message || 'AI 连接失败');
    } finally {
      setTesting(false);
    }
  };

  const columns: any[] = [
    {
      title: '序号',
      width: 58,
      render: (_: unknown, __: DecomposedItem, index: number) => index + 1
    },
    {
      title: '原始描述',
      dataIndex: 'raw',
      render: (value: string, record: DecomposedItem) => (
        <div>
          <div className="pg-ai-raw">{value}</div>
          {record.spec ? <div className="pg-ai-sub">规格：{record.spec}</div> : null}
        </div>
      )
    },
    {
      title: '标准物料名',
      width: 210,
      render: (_: unknown, record: DecomposedItem) =>
        record.status === 'done' ? <span className="pg-ai-name">{record.name}</span> : <span className="pg-ai-empty">—</span>
    },
    {
      title: '品类',
      dataIndex: 'category',
      width: 96,
      render: (value: string) => (value ? <Tag color="blue">{value}</Tag> : '—')
    },
    {
      title: '原子属性',
      width: 320,
      render: (_: unknown, record: DecomposedItem) =>
        record.atoms.length ? (
          <div className="pg-ai-atoms">
            {record.atoms.map((atom, index) => (
              <span className="pg-ai-atom" key={`${atom.label}-${index}`}>
                <em>{atom.label}</em>
                {atom.value}
              </span>
            ))}
          </div>
        ) : (
          <span className="pg-ai-empty">{record.error || '—'}</span>
        )
    },
    {
      title: '置信度',
      dataIndex: 'confidence',
      width: 92,
      render: (value: number) => (value ? <Confidence value={value} /> : '—')
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 88,
      render: (value: DecomposedItem['status']) => (
        <Tag color={STATUS_META[value].color}>{STATUS_META[value].text}</Tag>
      )
    },
    {
      title: '操作',
      width: 64,
      fixed: 'right' as const,
      render: (_: unknown, record: DecomposedItem) => (
        <Button
          type="text"
          size="small"
          danger
          className="pg-ai-remove"
          icon={<DeleteOutlined />}
          title="删除该行"
          onClick={() => removeRow(record.key)}
        />
      )
    }
  ];

  return (
    <>
      <PageHeader
        title="数据接入清洗"
        subtitle="上传招标清单 / 合同清单，AI 自动拆解规格型号的原子属性，清洗成可治理的结构化数据"
        action={
          <Space>
            <Tag color={isAiConfigReady(config) ? 'green' : 'orange'}>
              {config.model || '未配置模型'}
            </Tag>
            <Button size="small" icon={<SettingOutlined />} onClick={() => setConfigOpen(open => !open)}>
              模型配置
            </Button>
          </Space>
        }
      />

      {configOpen && (
        <Surface
          className="pg-ai-config"
          title="AI 模型配置"
          style={{ marginBottom: 14 }}
          extra={
            <Space>
              <Button size="small" loading={testing} onClick={handleTestConnection}>
                测试连接
              </Button>
              <Button
                size="small"
                onClick={() => {
                  setConfig(resetAiConfig());
                  resetProxyCache();
                  message.success('已恢复默认配置');
                }}
              >
                恢复默认
              </Button>
              <Button size="small" type="primary" onClick={handleSaveConfig}>
                保存配置
              </Button>
            </Space>
          }
        >
          <div className="pg-ai-config-grid">
            <label>API 地址</label>
            <Input
              value={config.baseUrl}
              placeholder="https://example.com/v1"
              onChange={event => setConfig(current => ({ ...current, baseUrl: event.target.value }))}
            />
            <label>模型名称</label>
            <Input
              value={config.model}
              placeholder="deepseek-flash"
              onChange={event => setConfig(current => ({ ...current, model: event.target.value }))}
            />
            <label>API Key</label>
            <Input.Password
              value={config.apiKey}
              placeholder="sk-..."
              onChange={event => setConfig(current => ({ ...current, apiKey: event.target.value }))}
            />
          </div>
          <div className="pg-ai-config-note">
            API 地址 / 模型 / Key 已默认写死在 <code>ai/config.ts</code>，改这里只影响本机浏览器。
            请求经本地开发服务器的 <code>/llm-proxy</code> 转发以规避浏览器跨域限制——<strong>导出后的原型同样依赖本机 dev server（默认 51720 端口）在线</strong>，否则 AI 拆解会失败。原型阶段请勿使用生产密钥。
          </div>
        </Surface>
      )}

      <Surface className="pg-import-card">
        <Steps
          current={stage}
          items={[
            { title: '上传数据' },
            { title: file?.kind === 'text' ? '文本确认' : '字段映射' },
            { title: 'AI 原子拆解' }
          ]}
          style={{ marginBottom: 24 }}
        />

        {error && (
          <Alert
            showIcon
            type="error"
            closable
            title="处理失败"
            description={error}
            onClose={() => setError('')}
            style={{ marginBottom: 16 }}
          />
        )}

        {stage === 0 && draft && (
          <Alert
            showIcon
            type="warning"
            style={{ marginBottom: 16 }}
            title={`检测到上次未导入的拆解结果（${draft.items.length} 条）`}
            description={
              <div className="pg-draft-row">
                <span>
                  来源 {draft.fileName || '文本录入'} · 保存于 {formatDraftTime(draft.updatedAt)}。恢复后可直接继续编辑或导入，无需重新调用模型。
                </span>
                <Space size={8}>
                  <Button size="small" type="primary" onClick={restoreDraft}>恢复</Button>
                  <Button size="small" onClick={discardDraft}>丢弃</Button>
                </Space>
              </div>
            }
          />
        )}

        {stage === 0 && (
          <div className="pg-upload-card">
            <Alert
              showIcon
              type="info"
              title="价格与品牌数据优先使用合同文本，其次为招标清单；结算单暂不纳入治理范围。"
              style={{ marginBottom: 16 }}
            />
            <Upload.Dragger
              multiple={false}
              accept=".xlsx,.xls,.csv,.pdf"
              showUploadList={false}
              disabled={parsing}
              beforeUpload={handleBeforeUpload}
            >
              <p className="pg-upload-icon">{parsing ? <LoadingOutlined /> : <InboxOutlined />}</p>
              <p className="ant-upload-text">
                {parsing ? '正在解析文件，请稍候…' : '拖拽 Excel / CSV / PDF 到此处，或点击选择文件'}
              </p>
              <p className="ant-upload-hint">
                支持 xlsx / xls / csv / pdf，单文件不超过 30MB；单次最多解析前 {MAX_ITEMS} 条物料
              </p>
            </Upload.Dragger>
            <div className="pg-upload-foot">
              <span className="pg-ai-sub">扫描版 PDF 无法提取文字，请先做 OCR 或改用 Excel。</span>
              <Button icon={<ThunderboltOutlined />} onClick={loadSample}>
                载入示例数据
              </Button>
            </div>
          </div>
        )}

        {stage === 1 && file && (
          <>
            <Alert
              showIcon
              type="success"
              title={`已识别文件：${file.fileName}（${getFileTypeLabel(file.fileName)}）${
                table
                  ? ` · 工作表「${table.name}」· ${table.rows.length} 行 · ${table.headers.length} 列`
                  : file.scan
                    ? ' · 未检测到文字层'
                    : ` · 共 ${file.lines.length} 行文本`
              }`}
              style={{ marginBottom: 12 }}
            />

            {file.scan && (
              <Alert
                showIcon
                type="warning"
                title="该 PDF 是扫描件，没有可提取的文字层"
                description="扫描件需要 OCR 才能还原表格。可先用 Excel 版清单，或在下方把清单内容粘贴为文本（每行一条）后继续拆解。"
                style={{ marginBottom: 12 }}
              />
            )}

            {file.kind === 'table' && table && (
              <>
                {file.tables.length > 1 && (
                  <div className="pg-field-row">
                    <span className="pg-field-label">工作表</span>
                    <Select
                      value={sheetIndex}
                      style={{ minWidth: 200 }}
                      options={file.tables.map((item, index) => ({
                        value: index,
                        label: `${item.name}（${item.rows.length} 行）`
                      }))}
                      onChange={switchSheet}
                    />
                  </div>
                )}

                <Surface
                  type="inner"
                  title="字段映射"
                  extra={
                    <Space>
                      <Tag color={mappingSource === 'AI' ? 'processing' : 'default'}>{mappingSource}识别</Tag>
                      <Button size="small" icon={<ThunderboltOutlined />} loading={mappingLoading} onClick={runAiMapping}>
                        AI 智能识别
                      </Button>
                    </Space>
                  }
                >
                  {FIELD_DEFS.map(def => {
                    const options = [
                      ...table.headers.map(header => ({
                        value: header,
                        label: header
                      })),
                      { value: '', label: '忽略此字段' }
                    ];
                    // 示例值取第一条真实物料行，避免展示「合计/供应商名称」这类条款行
                    const nameIndex = mapping.name ? table.headers.indexOf(mapping.name) : -1;
                    const sampleRow =
                      table.rows.find(row => (nameIndex >= 0 ? (row[nameIndex] || '').trim() : row.some(cell => cell))) || [];
                    const sample = mapping[def.key]
                      ? (sampleRow[table.headers.indexOf(mapping[def.key])] || '').trim()
                      : '';
                    return (
                      <div className="pg-mapping-row" key={def.key}>
                        <div>
                          <div className="pg-field-name">
                            {def.label}
                            {def.key === 'name' && <i className="pg-required">*</i>}
                          </div>
                          <div className="pg-ai-sub">{def.hint}</div>
                        </div>
                        <span className="pg-mapping-arrow">
                          <ArrowRightOutlined />
                        </span>
                        <Select
                          value={mapping[def.key] || ''}
                          options={options}
                          onChange={value =>
                            setMapping(current => ({ ...current, [def.key]: value }))
                          }
                        />
                        <Tag color={mapping[def.key] ? 'success' : 'default'}>
                          {sample ? `示例：${sample.slice(0, 12)}` : '未映射'}
                        </Tag>
                      </div>
                    );
                  })}
                </Surface>

                <Surface type="inner" title="数据预览（前 5 行）" style={{ marginTop: 12 }}>
                  <Table
                    className="pg-preview-table"
                    size="small"
                    rowKey={row => row.join('§')}
                    pagination={false}
                    scroll={{ x: 'max-content' }}
                    dataSource={table.rows.slice(0, 5)}
                    columns={table.headers.map((header, index) => ({
                      title: header,
                      dataIndex: index,
                      key: header,
                      ellipsis: true,
                      render: (value: string) => value || ''
                    }))}
                  />
                </Surface>
              </>
            )}

            {file.kind === 'text' && (
              <Surface type="inner" title={`待拆解明细（每行一条，最多 ${MAX_ITEMS} 条）`}>
                <Input.TextArea
                  className="pg-ai-textarea"
                  rows={12}
                  value={textDraft}
                  onChange={event => setTextDraft(event.target.value)}
                  placeholder={
                    file.scan
                      ? '扫描件无法自动提取文字。请从清单中复制内容粘贴到此处，每行一条物料；格式不限，例如：\n钢筋 HRB400E Φ8-10 t\nPPR给水管 dn25 2.0MPa 热水管 米'
                      : '每行一条物料描述，可直接编辑或删除无关行'
                  }
                />
                <div className="pg-ai-sub" style={{ marginTop: 8 }}>
                  当前 {textDraft.split('\n').filter(line => line.trim()).length} 条；PDF 表格若列错位，可在上方手工修正后再拆解。
                </div>
              </Surface>
            )}

            <div className="pg-step-actions">
              <Button onClick={() => setStage(0)}>上一步</Button>
              <Button type="primary" onClick={file.kind === 'table' ? handleMappingNext : handleTextNext}>
                开始 AI 拆解
              </Button>
            </div>
          </>
        )}

        {stage === 2 && (
          <>
            <div className="pg-ai-progress">
              <div className="pg-ai-progress-head">
                <span className="pg-field-name">
                  {running
                    ? `AI 原子化拆解中${batchInfo.total ? `（第 ${Math.min(batchInfo.index + 1, batchInfo.total)}/${batchInfo.total} 批）` : ''}`
                    : 'AI 原子化拆解结果'}
                </span>
                <Space size={16}>
                  <span className="pg-ai-sub">
                    成功 {doneCount} · 失败 {errorCount} · 平均置信度 {avgConfidence || '—'}
                    {avgConfidence ? '%' : ''}
                  </span>
                  {running ? (
                    <Button size="small" danger onClick={stopDecompose}>
                      停止解析
                    </Button>
                  ) : (
                    errorCount > 0 && (
                      <Space>
                        <Button size="small" danger icon={<DeleteOutlined />} onClick={removeFailedRows}>
                          删除失败项
                        </Button>
                        <Button
                          size="small"
                          icon={<ReloadOutlined />}
                          onClick={() => void startDecompose(results.filter(item => item.status === 'error'), true)}
                        >
                          重试失败项
                        </Button>
                      </Space>
                    )
                  )}
                </Space>
              </div>
              <Progress percent={percent} status={errorCount ? 'exception' : running ? 'active' : 'normal'} />
              {running && (
                <div className="pg-ai-stream">
                  <div className="pg-ai-stream-head">
                    <LoadingOutlined /> {thinking ? `模型已思考 ${thinking} 字` : '模型正在思考'}，正在逐条输出原子属性…
                  </div>
                  <pre>{streamText.slice(-800) || '等待首批返回…'}</pre>
                </div>
              )}
            </div>

            {skippedRows.length > 0 && (
              <Alert
                showIcon
                type="info"
                style={{ marginBottom: 12 }}
                title={`已自动跳过 ${skippedRows.length} 行非物料行（合计、条款、签章等）`}
                description={
                  <span className="pg-ai-sub">
                    {skippedRows.slice(0, 8).join(' / ')}
                    {skippedRows.length > 8 ? ' …' : ''}
                  </span>
                }
              />
            )}

            <Table
              className="pg-decompose-table"
              rowKey="key"
              dataSource={results}
              columns={columns}
              pagination={false}
              size="middle"
              scroll={{ x: 1140 }}
              expandable={{
                rowExpandable: record => record.status === 'done',
                expandedRowRender: record => (
                  <div className="pg-atom-editor">
                    {record.atoms.map((atom, index) => (
                      <div className="pg-atom-edit-row" key={`${record.key}-${index}`}>
                        <Input
                          size="small"
                          value={atom.label}
                          style={{ width: 112 }}
                          onChange={event =>
                            patchAtoms(record.key, atoms =>
                              atoms.map((item, atomIndex) =>
                                atomIndex === index ? { ...item, label: event.target.value } : item
                              )
                            )
                          }
                        />
                        <span className="pg-atom-eq">=</span>
                        <Input
                          size="small"
                          value={atom.value}
                          onChange={event =>
                            patchAtoms(record.key, atoms =>
                              atoms.map((item, atomIndex) =>
                                atomIndex === index ? { ...item, value: event.target.value } : item
                              )
                            )
                          }
                        />
                        <InputNumber
                          size="small"
                          min={0}
                          max={100}
                          value={atom.confidence}
                          suffix="%"
                          style={{ width: 96 }}
                          onChange={value =>
                            patchAtoms(record.key, atoms =>
                              atoms.map((item, atomIndex) =>
                                atomIndex === index ? { ...item, confidence: Number(value) || 0 } : item
                              )
                            )
                          }
                        />
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() =>
                            patchAtoms(record.key, atoms => atoms.filter((_, atomIndex) => atomIndex !== index))
                          }
                        />
                      </div>
                    ))}
                    <Button
                      type="dashed"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={() => patchAtoms(record.key, atoms => [...atoms, { label: '新属性', value: '', confidence: 90 }])}
                    >
                      补充属性
                    </Button>
                  </div>
                )
              }}
            />

            <div className="pg-step-actions">
              <span className="pg-ai-sub">
                原始 {results.length + removed.length} 条 · 可导入 {doneCount} 条
                {removed.length > 0 && (
                  <>
                    {' · '}
                    <span className="pg-ai-removed">已删除 {removed.length} 条</span>
                    <Button type="link" size="small" onClick={undoRemove} style={{ padding: '0 4px' }}>
                      撤销
                    </Button>
                  </>
                )}
                {' · '}导入后先在「专家任务」生成治理任务，再进「专家治理工作台」由专家确认。
              </span>
              <Space>
                <Button onClick={() => setStage(1)} disabled={running}>
                  上一步
                </Button>
                <Button type="primary" disabled={running || !doneCount} onClick={handleConfirmImport}>
                  确认并导入治理
                </Button>
              </Space>
            </div>
          </>
        )}
      </Surface>
    </>
  );
};
