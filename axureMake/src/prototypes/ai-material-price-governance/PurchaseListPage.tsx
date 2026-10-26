import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Input, Space, Table, Tag, Tooltip, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ArrowRightOutlined,
  DeleteOutlined,
  DownOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  InboxOutlined,
  LinkOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  UpOutlined,
  UploadOutlined
} from '@ant-design/icons';
import StepBar from '../../components/step-bar';
import { useDemo } from './context';
import { refPriceOf } from './analysisData';
import { isAiConfigReady, loadAiConfig } from './ai/config';
import { parseFile } from './ai/extract';
import { buildRawItems, guessMapping, mapColumnsWithAi } from './ai/decompose';
import { buildCatalogMap, MATCH_BATCH_SIZE, matchRowsWithAi } from './ai/match';
import { AttachmentQuoteModal, type QuotePayload } from './AttachmentQuoteModal';
import {
  avgConfidenceOf,
  formatFileSize,
  hitCountOf,
  type AttachmentRecord,
  type AttachmentStage
} from './attachment';
import { PURCHASE_DRAFT_KEY } from './storage';

type PurchaseRow = {
  key: string;
  name: string;
  spec: string;
  basis: string;
  taxPrice: string;
  quantity: string;
  unit: string;
  amount: string;
  taxRate: string;
  noTaxPrice: string;
  noTaxAmount: string;
  tax: string;
  brand: string;
  /** 关联的标准物料编码：价格分析按它取真实水位的历史合同 */
  materialCode?: string;
  /** 参考价（含税单价），来源见 refSource */
  refPrice: string;
  /** 参考价口径：近 6 个月合同加权 / 近 3 个月合同均价… */
  refSource: string;
  refDate: string;
  /** 参与计算的样本数 */
  refSamples: number;
};

const TAX_RATE = 0.13;

const fixed6 = (value: number) => value.toFixed(6);

type RowInput = {
  key: string;
  name: string;
  spec: string;
  basis: string;
  taxPrice: number;
  quantity: number;
  unit: string;
  brand: string;
  materialCode?: string;
};

/**
 * 由「报价 + 数量」推算税额三列，并按标准物料编码取参考价。
 * 参考价与分析页同源（`refPriceOf`），清单上写 3860 的钢筋，点进去看到的也是 3860。
 */
const buildRow = (input: RowInput): PurchaseRow => {
  const amount = input.taxPrice * input.quantity;
  const ref = refPriceOf(input.materialCode || input.name, input.unit);
  return {
    key: input.key,
    name: input.name,
    spec: input.spec,
    basis: input.basis,
    taxPrice: fixed6(input.taxPrice),
    quantity: String(input.quantity),
    unit: input.unit,
    amount: fixed6(amount),
    taxRate: '13%',
    noTaxPrice: fixed6(input.taxPrice / (1 + TAX_RATE)),
    noTaxAmount: fixed6(amount / (1 + TAX_RATE)),
    tax: fixed6(amount - amount / (1 + TAX_RATE)),
    brand: input.brand,
    materialCode: input.materialCode,
    refPrice: String(ref.price),
    refSource: ref.source,
    refDate: ref.date,
    refSamples: ref.samples
  };
};

/** 「添加商品」用的轮转样例 */
const demoRow = (index: number): PurchaseRow => {
  const preset = [
    {
      name: 'HRB400E Φ25mm 热轧带肋抗震钢筋',
      spec: 'Φ25mm / HRB400E',
      basis: '历史价',
      taxPrice: 3892,
      quantity: 120,
      unit: '吨',
      brand: '安钢',
      materialCode: 'STD-GJ-000129'
    },
    {
      name: 'P.O 42.5 普通硅酸盐水泥',
      spec: '袋装 / 42.5',
      basis: '信息价',
      taxPrice: 462,
      quantity: 800,
      unit: '吨',
      brand: '海螺',
      materialCode: 'STD-SN-000042'
    }
  ][index % 2];
  return buildRow({ ...preset, key: `row-${Date.now()}-${index}` });
};

/**
 * 清单初始模拟数据：一进页面就能看到参考价列与「查看详情」的联动效果。
 * 四条覆盖钢材 / 水泥 / 管材三个品类，报价与参考价之间有高有低，便于演示偏离提示。
 */
const seedRows = (): PurchaseRow[] => [
  buildRow({
    key: 'seed-row-1',
    name: 'HRB400E Φ25mm 热轧带肋抗震钢筋',
    spec: 'Φ25mm / HRB400E',
    basis: '历史价',
    taxPrice: 3892,
    quantity: 1200,
    unit: '吨',
    brand: '安钢',
    materialCode: 'STD-GJ-000129'
  }),
  buildRow({
    key: 'seed-row-2',
    name: 'P.O 42.5 普通硅酸盐水泥',
    spec: '散装 / 42.5',
    basis: '信息价',
    taxPrice: 462,
    quantity: 3000,
    unit: '吨',
    brand: '海螺',
    materialCode: 'STD-SN-000042'
  }),
  buildRow({
    key: 'seed-row-3',
    name: 'HRB400E Φ20mm 热轧带肋抗震钢筋',
    spec: 'Φ20mm / HRB400E',
    basis: '历史价',
    taxPrice: 3812,
    quantity: 800,
    unit: '吨',
    brand: '沙钢',
    materialCode: 'STD-GJ-000128'
  }),
  buildRow({
    key: 'seed-row-4',
    name: 'Q235B 焊接钢管 DN100',
    spec: 'DN100 / Q235B / 黑管',
    basis: '询价',
    taxPrice: 4750,
    quantity: 260,
    unit: '吨',
    brand: '友发',
    materialCode: 'STD-GC-000215'
  })
];

/* ========== 清单草稿：去看参考价、再返回，清单不能变回初始那 4 条 ========== */

const DRAFT_VERSION = 1;

type PurchaseDraft = {
  version: number;
  listName: string;
  rows: PurchaseRow[];
  attachments: AttachmentRecord[];
  suggest: string;
  quoteNote: string;
  savedAt: string;
};

/**
 * 解析中的附件在离开页面后就停了（AbortController 随组件卸载失效），
 * 恢复时标成「中断」，而不是让进度条永远停在 63%。
 */
const reviveAttachment = (item: AttachmentRecord): AttachmentRecord =>
  item.status === 'done' || item.status === 'error'
    ? item
    : {
        ...item,
        status: 'error',
        progress: 100,
        error: '页面已离开，本次解析中断，可移除后重新上传',
        stageText: '解析中断，可移除后重新上传'
      };

const loadPurchaseDraft = (): PurchaseDraft | null => {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(PURCHASE_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PurchaseDraft> | null;
    if (!parsed || parsed.version !== DRAFT_VERSION || !Array.isArray(parsed.rows)) return null;
    return {
      version: DRAFT_VERSION,
      listName: parsed.listName ?? '测试模板',
      rows: parsed.rows,
      attachments: (parsed.attachments ?? []).map(reviveAttachment),
      suggest: parsed.suggest ?? '',
      quoteNote: parsed.quoteNote ?? '',
      savedAt: parsed.savedAt ?? ''
    };
  } catch {
    return null;
  }
};

const savePurchaseDraft = (draft: Omit<PurchaseDraft, 'version' | 'savedAt'>): boolean => {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    window.localStorage.setItem(
      PURCHASE_DRAFT_KEY,
      JSON.stringify({ ...draft, version: DRAFT_VERSION, savedAt: new Date().toISOString() })
    );
    return true;
  } catch {
    // 配额满（附件解析结果多）时静默降级：页面照常用，只是离开后不再保留
    return false;
  }
};

const headerCell = (title: string, note?: string, required?: boolean) => (
  <div className="pl-th">
    <span className="pl-th-title">
      {required && <em className="pl-required">*</em>}
      {title}
      {note && <QuestionCircleOutlined className="pl-th-icon" />}
    </span>
    {note && <span className="pl-th-note">（{note}）</span>}
  </div>
);

/**
 * 「参考价」单元格：价格 + 相对当前报价的偏离 + 查看详情。
 * 点「查看详情」把商品带到价格分析页（历史招采、签约明细、区域分布都在那边），
 * 这也是业务要求的「参考价可穿透」。
 */
const RefPriceCell: React.FC<{ row: PurchaseRow }> = ({ row }) => {
  const { openPriceAnalysis, standards } = useDemo();
  const ref = Number(row.refPrice) || 0;
  const current = Number(row.taxPrice) || 0;
  const deviation = ref ? ((current - ref) / ref) * 100 : 0;
  const high = deviation > 0.05;
  const low = deviation < -0.05;

  return (
    <div className="pl-ref">
      <div className="pl-ref-top">
        <span className="pl-ref-price">
          {ref.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          <em>元/{row.unit || '—'}</em>
        </span>
        <Tooltip title={`当前报价${high ? '高于' : low ? '低于' : '基本等于'}参考价`}>
          <span className={`pl-ref-dev ${high ? 'is-up' : low ? 'is-down' : 'is-flat'}`}>
            {high || low ? `${high ? '+' : ''}${deviation.toFixed(1)}%` : '持平'}
          </span>
        </Tooltip>
      </div>
      <div className="pl-ref-bottom">
        <span className="pl-ref-src" title={`${row.refSource} · ${row.refDate} · ${row.refSamples} 个有效样本`}>
          {row.refDate.slice(5)} · {row.refSamples} 个样本
        </span>
        <button
          type="button"
          className="pl-ref-link"
          onClick={() => {
            // 命中标准物料就把属性原子一起带过去，价格分析页的规格型号才能按 KV 展示
            const standard = row.materialCode
              ? standards.find(item => item.code === row.materialCode)
              : undefined;
            openPriceAnalysis({
              key: row.materialCode || row.name,
              code: row.materialCode,
              name: row.name,
              spec: row.spec,
              unit: row.unit,
              category: standard?.category,
              attrs: standard?.attributes
            });
          }}
        >
          查看详情<ArrowRightOutlined />
        </button>
      </div>
    </div>
  );
};

const columns: ColumnsType<PurchaseRow> = [
  { title: '序号', key: 'index', width: 62, align: 'center', render: (_value, _row, index) => index + 1 },
  { title: headerCell('商品名称', undefined, true), dataIndex: 'name', key: 'name', width: 232 },
  { title: headerCell('规格型号', undefined, true), dataIndex: 'spec', key: 'spec', width: 178 },
  { title: '报价依据', dataIndex: 'basis', key: 'basis', width: 108 },
  {
    title: (
      <Tooltip title="取该商品近 6 个月合同与招标清单的成交单价加权（剔除异常报价）。点「查看详情」看它过去的招采与签约明细">
        <span className="pl-th-title">
          参考价
          <QuestionCircleOutlined className="pl-th-icon" />
        </span>
      </Tooltip>
    ),
    key: 'refPrice',
    width: 196,
    render: (_value, row) => <RefPriceCell row={row} />
  },
  { title: headerCell('含税单价', '最多6位小数'), dataIndex: 'taxPrice', key: 'taxPrice', width: 118, align: 'right' },
  { title: headerCell('数量', '只支持整数', true), dataIndex: 'quantity', key: 'quantity', width: 118, align: 'right' },
  { title: headerCell('单位', undefined, true), dataIndex: 'unit', key: 'unit', width: 82, align: 'center' },
  { title: headerCell('合价', '最多6位小数'), dataIndex: 'amount', key: 'amount', width: 128, align: 'right' },
  { title: '税率', dataIndex: 'taxRate', key: 'taxRate', width: 80, align: 'right' },
  { title: headerCell('不含税单价', '最多6位小数'), dataIndex: 'noTaxPrice', key: 'noTaxPrice', width: 128, align: 'right' },
  { title: headerCell('不含税合价', '最多6位小数'), dataIndex: 'noTaxAmount', key: 'noTaxAmount', width: 128, align: 'right' },
  { title: headerCell('税额', '最多6位小数'), dataIndex: 'tax', key: 'tax', width: 118, align: 'right' },
  { title: '品牌名', dataIndex: 'brand', key: 'brand', width: 96 },
  {
    title: <Tooltip title="自定义列"><span className="pl-column-setting">⇕</span></Tooltip>,
    key: 'setting',
    width: 44,
    align: 'center'
  }
];

const MAIN_STEPS = ['采购发起', '采购响应', '文件开启', '采购评审', '采购成交'];
const SUB_STEPS = ['采购基本信息', '编制采购清单', '编制采购(资格预审)公告', '发布采购(资格预审)公告', '报名与资审汇总', '资审结果通知'];

/** 让阶段文案先渲染出去，再继续跑同步/长任务，否则用户只看得到最后一行小字 */
const nextFrame = () => new Promise(resolve => setTimeout(resolve, 30));

const STAGE_TEXT: Record<AttachmentStage, string> = {
  parsing: '解析中',
  mapping: '识别中',
  matching: '匹配中',
  done: '解析完成',
  error: '解析失败'
};

const Panel: React.FC<{
  title: React.ReactNode;
  extra?: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
}> = ({ title, extra, open, onToggle, children, className = '' }) => (
  <section className={`pl-card ${className}`}>
    <header className="pl-card-header">
      <div className="pl-card-title"><i className="pl-bar" />{title}</div>
      <div className="pl-card-extra">
        {extra}
        <button type="button" className="pl-collapse" onClick={onToggle} aria-label="收起/展开">
          {open ? <UpOutlined /> : <DownOutlined />}
        </button>
      </div>
    </header>
    {open && <div className="pl-card-body">{children}</div>}
  </section>
);

const emptyAttachment = (key: string, file: File): AttachmentRecord => ({
  key,
  fileName: file.name,
  size: file.size,
  status: 'parsing',
  progress: 6,
  stageText: '正在读取 Excel 文件…',
  sheetName: '',
  headers: [],
  rowCount: 0,
  rows: [],
  skipped: 0,
  durationMs: 0,
  mappingSource: '',
  nameColumn: ''
});

export const PurchaseListPage: React.FC = () => {
  const { standards, prices } = useDemo();
  /**
   * 上次离开时的清单：点「查看详情」去看价格分析、再返回，组件会整个重新挂载，
   * 状态必须从本机草稿接回来，否则用户刚解析引用的一屏数据就没了。
   * 有草稿就照草稿来（草稿是空表说明用户主动删空），没草稿才铺那 4 条演示数据。
   */
  const [draft] = useState<PurchaseDraft | null>(loadPurchaseDraft);
  const [listName, setListName] = useState(draft?.listName ?? '测试模板');
  const [rows, setRows] = useState<PurchaseRow[]>(() => draft?.rows ?? seedRows());
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [listOpen, setListOpen] = useState(true);
  const [suggestOpen, setSuggestOpen] = useState(true);
  const [quoteOpen, setQuoteOpen] = useState(true);
  const [suggest, setSuggest] = useState(draft?.suggest ?? '');
  const [quoteNote, setQuoteNote] = useState(draft?.quoteNote ?? '');
  const [attachments, setAttachments] = useState<AttachmentRecord[]>(() => draft?.attachments ?? []);
  const [quoteKey, setQuoteKey] = useState<string | null>(null);

  /** 最新值挂在 ref 上：卸载时能同步落一次盘，不指望防抖定时器跑完 */
  const draftData = useRef({ listName, rows, attachments, suggest, quoteNote });
  draftData.current = { listName, rows, attachments, suggest, quoteNote };

  /**
   * 变更后 300ms 落盘（输入框不必每个键都序列化一次附件解析结果）；
   * 卸载时无条件再 flush 一次——点「查看详情」跳价格分析正是先卸载，这一笔不能丢。
   */
  useEffect(() => {
    const timer = window.setTimeout(() => savePurchaseDraft(draftData.current), 300);
    return () => window.clearTimeout(timer);
  }, [listName, rows, attachments, suggest, quoteNote]);

  useEffect(() => () => savePurchaseDraft(draftData.current), []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortsRef = useRef<Map<string, AbortController>>(new Map());

  /** 标准物料 + 历史价格：AI 匹配的候选库，也是引用弹窗里明细的数据源 */
  const catalog = useMemo(() => buildCatalogMap({ standards, prices }), [standards, prices]);

  const selectedCount = useMemo(() => selectedKeys.length, [selectedKeys]);
  const quoting = useMemo(() => attachments.find(item => item.key === quoteKey) ?? null, [attachments, quoteKey]);

  const patchAttachment = useCallback((key: string, patch: Partial<AttachmentRecord>) => {
    setAttachments(prev => prev.map(item => (item.key === key ? { ...item, ...patch } : item)));
  }, []);

  const addItem = () => {
    setRows(current => [...current, demoRow(current.length)]);
    message.success('已添加 1 条商品明细');
  };

  const removeSelected = () => {
    if (!selectedCount) {
      message.warning('请先勾选需要删除的商品');
      return;
    }
    setRows(current => current.filter(row => !selectedKeys.includes(row.key)));
    setSelectedKeys([]);
    message.success(`已删除 ${selectedCount} 条商品明细`);
  };

  /** 「保存」显式落一次盘（平时有 300ms 自动保存兜底），给演示一个明确的反馈点 */
  const handleSave = () => {
    if (!savePurchaseDraft(draftData.current)) {
      message.warning('本机存储不可用（隐私模式或空间已满），当前内容只在本次页面停留期间保留');
      return;
    }
    message.success(
      `采购清单已保存：${rows.length} 条明细${attachments.length ? `、${attachments.length} 个解析附件` : ''}，离开页面再回来还在`
    );
  };

  const pickFile = () => fileInputRef.current?.click();

  /**
   * 真实上传 + 解析：
   * 1. 浏览器端把 Excel 转成二维表（静态引入 xlsx，导出单文件 iife 也不会挂）
   * 2. AI 识别表头字段（失败回退本地关键词映射）
   * 3. AI 把每一行匹配到标准物料库，逐批回传，前端同步刷新小字进度
   */
  const ingestFile = async (file: File) => {
    if (!/\.(xlsx|xls)$/i.test(file.name)) {
      message.warning('当前演示仅支持 Excel（.xlsx / .xls）附件，PDF/CSV 走「数据源接入」页');
      return;
    }
    if (file.size > 30 * 1024 * 1024) {
      message.warning('文件超过 30MB，请拆分后再上传');
      return;
    }

    const key = `att-${Date.now()}`;
    const startedAt = performance.now();
    const controller = new AbortController();
    abortsRef.current.set(key, controller);
    setAttachments(prev => [...prev, emptyAttachment(key, file)]);

    const patch = (data: Partial<AttachmentRecord>) => patchAttachment(key, data);

    try {
      await nextFrame();
      const parsed = await parseFile(file);
      const table = parsed.tables[0];
      if (!table || !table.rows.length) throw new Error('未在文件中识别到有效的商品数据行');

      patch({
        progress: 18,
        stageText: `已解析工作表「${table.name}」 ${table.rows.length} 行 · ${table.headers.length} 列`,
        sheetName: table.name,
        headers: table.headers,
        rowCount: table.rows.length
      });
      await nextFrame();

      // 表头字段映射
      patch({ status: 'mapping', progress: 26, stageText: 'AI 正在识别表头字段…' });
      let mapping = guessMapping(table.headers);
      let mappingSource: 'AI' | '本地' = '本地';
      const config = loadAiConfig();
      if (isAiConfigReady(config)) {
        try {
          const aiMapping = await mapColumnsWithAi({
            config,
            headers: table.headers,
            samples: table.rows.slice(0, 3),
            signal: controller.signal
          });
          if (aiMapping.name) {
            mapping = aiMapping;
            mappingSource = 'AI';
          }
        } catch (error) {
          if ((error as Error).name === 'AbortError') throw error;
          // 映射失败继续走本地结果，不阻断整条演示动线
        }
      }
      patch({
        progress: 34,
        mappingSource,
        nameColumn: mapping.name,
        stageText: `字段映射完成（${mappingSource}）· 物料名称列「${mapping.name || '未识别，按前几列兜底'}」`
      });
      await nextFrame();

      const { items, skipped } = buildRawItems(table, mapping);
      if (!items.length) throw new Error('按当前表头没有解析出有效商品行，请检查文件内容');

      patch({
        status: 'matching',
        progress: 40,
        skipped: skipped.length,
        stageText: `AI 正在匹配标准物料 0/${items.length}`,
        rows: items.map(item => ({ ...item, code: '', confidence: 0, reason: '', gap: '' }))
      });
      await nextFrame();

      const totalBatches = Math.ceil(items.length / MATCH_BATCH_SIZE);
      const matched = await matchRowsWithAi({
        config,
        rows: items,
        catalog: standards,
        signal: controller.signal,
        onBatchDone: (batchIndex, total, batchRows) => {
          const finished = Math.min(items.length, (batchIndex + 1) * MATCH_BATCH_SIZE);
          const batchHit = batchRows.filter(row => row.code).length;
          // AI 通道不可用时会整批降级为本地关键词匹配，文案要如实说明，别让用户以为是 AI 结果
          const fallback = batchRows.length > 0 && batchRows.every(row => row.reason.includes('本地兜底'));
          patch({
            progress: 40 + Math.round(((batchIndex + 1) / total) * 54),
            stageText: fallback
              ? `AI 通道不可用，已改用本地关键词匹配 ${finished}/${items.length} · 第 ${batchIndex + 1}/${total} 批`
              : `AI 正在匹配标准物料 ${finished}/${items.length} · 第 ${batchIndex + 1}/${total} 批 · 本批命中 ${batchHit} 行`
          });
          // 增量合并，让表格里已有结果先亮起来
          setAttachments(prev => prev.map(item => {
            if (item.key !== key) return item;
            const patchMap = new Map(batchRows.map(row => [row.idx, row]));
            return { ...item, rows: item.rows.map(row => patchMap.get(row.idx) ?? row) };
          }));
        }
      });

      const hit = hitCountOf(matched);
      const duration = Math.round(performance.now() - startedAt);
      patch({
        status: 'done',
        progress: 100,
        rows: matched,
        durationMs: duration,
        stageText: `解析完成 · ${matched.length} 行 · 命中标准物料 ${hit} 行 · 平均置信度 ${avgConfidenceOf(matched)} · 耗时 ${(duration / 1000).toFixed(1)}s`
      });
      message.success(`「${file.name}」解析完成，${hit}/${matched.length} 行已匹配标准物料`);
    } catch (error) {
      const reason = (error as Error).message || '解析失败';
      patch({
        status: 'error',
        progress: 100,
        error: (error as Error).name === 'AbortError' ? '已停止本次解析' : reason,
        stageText: (error as Error).name === 'AbortError' ? '已停止本次解析' : '解析失败，可移除后重新上传'
      });
      if ((error as Error).name !== 'AbortError') message.error(reason);
    } finally {
      abortsRef.current.delete(key);
    }
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = event => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) void ingestFile(file);
  };

  const stopAttachment = (key: string) => {
    abortsRef.current.get(key)?.abort();
    message.info('已停止本次解析');
  };

  const removeAttachment = (key: string) => {
    abortsRef.current.get(key)?.abort();
    abortsRef.current.delete(key);
    setAttachments(prev => prev.filter(item => item.key !== key));
    setQuoteKey(current => (current === key ? null : current));
  };

  /** 引用回清单：名称/规格取标准物料，数量与单价取附件原文，税额按 13% 反算 */
  const handleQuote = (items: QuotePayload[]) => {
    const stamp = Date.now();
    const created = items.map(({ row, code }, index) => {
      const detail = code ? catalog.get(code) : undefined;
      const taxPrice = Number(String(row.price).replace(/[^\d.]/g, '')) || 0;
      const quantity = Math.round(Number(String(row.quantity).replace(/[^\d.]/g, '')) || 0);
      return buildRow({
        key: `row-${stamp}-${index}`,
        name: detail?.material.name || row.raw,
        spec: detail
          ? detail.material.attributes.map(attribute => attribute.split(/[:：]/).pop() || attribute).join(' / ')
          : row.spec,
        basis: '附件引用',
        taxPrice,
        quantity,
        unit: row.unit || detail?.records[0]?.unit || '',
        brand: detail?.records[0]?.brand || '',
        materialCode: code || undefined
      });
    });
    setRows(prev => [...prev, ...created]);
    setQuoteKey(null);
    message.success(`已引用 ${created.length} 行到采购清单`);
  };

  return (
    <div className="pl-page">
      <div className="pl-breadcrumb">
        <span className="pl-breadcrumb-link">采购列表</span>
        <span className="pl-breadcrumb-sep">›</span>
        <span>编制采购清单</span>
      </div>

      <div className="pl-bill-header">
        <div className="pl-bill-title">
          <span className="pl-bill-tag">物资</span>
          <span className="pl-bill-name">中国建筑股份有限公司-物资-分散采购-询比采购采购AA</span>
        </div>
        <Space size={8}>
          <Button className="pl-plain-btn" onClick={() => message.info('已切换到上一步：采购基本信息')}>上一步</Button>
          <Button type="primary" onClick={handleSave}>保存</Button>
          <Button type="primary" onClick={() => message.success('已进入下一步：采购响应')}>下一步</Button>
        </Space>
      </div>

      <section className="pl-card pl-bill">
        <div className="pl-bill-meta">
          <div className="pl-countdown">
            <span className="pl-countdown-label">距响应截止还剩:</span>
            <span className="pl-countdown-box">999996</span>
            <span className="pl-countdown-unit">天</span>
            <span className="pl-countdown-box">23</span>
            <span className="pl-countdown-unit">时</span>
            <span className="pl-countdown-box">59</span>
            <span className="pl-countdown-unit">分</span>
            <span className="pl-countdown-box">03</span>
            <span className="pl-countdown-unit">秒</span>
          </div>
          <div className="pl-meta-grid">
            <div className="pl-meta-item"><span className="pl-meta-label">采购编号:</span><span className="pl-meta-value">cscec202610240000040247</span></div>
            <div className="pl-meta-item"><span className="pl-meta-label">组织机构:</span><span className="pl-meta-value">中国建筑股份有限公司</span></div>
            <div className="pl-meta-item"><span className="pl-meta-label">采购方式:</span><span className="pl-meta-value">询比采购</span></div>
            <div className="pl-meta-item"><span className="pl-meta-label">项目:</span><a className="pl-meta-link">测试项目45414</a></div>
            <div className="pl-meta-item"><span className="pl-meta-label">品类:</span><span className="pl-meta-value">物资-钢材</span></div>
            <div className="pl-meta-item"><span className="pl-meta-label">经办人:</span><span className="pl-meta-value">奥巴马</span></div>
          </div>
        </div>
      </section>

      <section className="pl-card pl-stepper-card">
        <div className="pl-stepper">
          <StepBar
            className="pl-stepbar"
            mainSteps={MAIN_STEPS}
            currentMainStep="采购发起"
            subSteps={SUB_STEPS}
            currentSubStep="编制采购清单"
          />
        </div>
      </section>

      <Panel
        title="采购清单"
        className="pl-list-card"
        open={listOpen}
        onToggle={() => setListOpen(current => !current)}
        extra={<Button type="primary" icon={<DownloadOutlined />} onClick={() => message.success('清单导出任务已创建')}>导出清单</Button>}
      >
        <div className="pl-template-row">
          <Button type="primary" onClick={() => message.info('打开清单模板库')}>选择清单模板</Button>
          <UpOutlined className="pl-row-caret" />
        </div>

        <div className="pl-name-row">
          <i className="pl-name-bar" />
          <span className="pl-name-label"><em className="pl-required">*</em> 清单名称:</span>
          <Input
            className="pl-name-input"
            variant="borderless"
            value={listName}
            placeholder="请输入清单名称"
            onChange={event => setListName(event.target.value)}
          />
          <UpOutlined className="pl-row-caret" />
        </div>

        <div className="pl-toolbar">
          <Button type="link" icon={<SearchOutlined />} onClick={() => message.info('正在查询历史价格')}>查询历史价格</Button>
          <Button type="link" icon={<PlusOutlined />} onClick={addItem}>添加商品</Button>
          <Button type="link" icon={<UploadOutlined />} onClick={pickFile}>批量导入</Button>
          <Button type="link" icon={<DeleteOutlined />} onClick={removeSelected} disabled={!selectedCount}>删除行</Button>
          <span className="pl-toolbar-gap" />
          <Button className="pl-plain-btn" onClick={() => message.warning('请确认后删除整张清单')}>删除清单</Button>
          <Button className="pl-plain-btn" onClick={() => message.success('清单已收藏')}>收藏清单</Button>
          <Button className="pl-plain-btn" onClick={() => message.success('已创建清单副本')}>创建副本</Button>
        </div>

        <Table
          className="pl-table"
          rowKey="key"
          columns={columns}
          dataSource={rows}
          pagination={false}
          scroll={{ x: 1680 }}
          rowSelection={{
            selectedRowKeys: selectedKeys,
            onChange: keys => setSelectedKeys(keys)
          }}
          locale={{
            emptyText: (
              <div className="pl-empty">
                <InboxOutlined className="pl-empty-icon" />
                <span className="pl-empty-text">暂无数据</span>
              </div>
            )
          }}
        />

        <div className="pl-selected-bar">共选中 {selectedCount} 条数据</div>

        <div className="pl-attachment">
          <div className="pl-attachment-label">
            <span>清单附件:</span>
            <span className="pl-attachment-sub">(仅内部可见)</span>
          </div>
          <div className="pl-attachment-main">
            <div className="pl-attachment-tip">
              大小限制: 500M · 当前演示支持 Excel（.xlsx / .xls）真实上传：解析后由 AI 匹配标准物料，可逐行引用到清单
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="pl-file-input"
              onChange={handleFileChange}
            />

            {attachments.length > 0 && (
              <div className="pl-att-list">
                {attachments.map(item => {
                  const running = item.status === 'parsing' || item.status === 'mapping' || item.status === 'matching';
                  return (
                    <div className={`pl-att-item is-${item.status}`} key={item.key}>
                      <FileExcelOutlined className="pl-att-icon" />
                      <div className="pl-att-main">
                        <div className="pl-att-name-row">
                          <span className="pl-att-name">{item.fileName}</span>
                          <span className="pl-att-size">{formatFileSize(item.size)}</span>
                          <Tag
                            color={item.status === 'done' ? 'success' : item.status === 'error' ? 'error' : 'processing'}
                            className="pl-att-tag"
                          >
                            {STAGE_TEXT[item.status]}
                          </Tag>
                          {item.status === 'done' && hitCountOf(item.rows) > 0 && (
                            <Tag color="blue" className="pl-att-tag">可引用 {hitCountOf(item.rows)} 行</Tag>
                          )}
                        </div>
                        <div className="pl-att-progress-text">
                          {item.status === 'error' ? item.error : item.stageText}
                        </div>
                        {running && (
                          <div className="pl-att-bar">
                            <i style={{ width: `${Math.max(4, item.progress)}%` }} />
                          </div>
                        )}
                      </div>
                      <div className="pl-att-actions">
                        {item.status === 'done' && (
                          <Tooltip title="查看附件解析出的行与推荐物料，并引用到清单">
                            <Button
                              type="link"
                              size="small"
                              className="pl-att-quote"
                              icon={<LinkOutlined />}
                              onClick={() => setQuoteKey(item.key)}
                            >
                              引用
                            </Button>
                          </Tooltip>
                        )}
                        {running && (
                          <Button type="link" size="small" onClick={() => stopAttachment(item.key)}>停止</Button>
                        )}
                        <Button type="link" size="small" danger onClick={() => removeAttachment(item.key)}>移除</Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <Button className="pl-attachment-btn" icon={<PlusOutlined />} onClick={pickFile}>添加附件</Button>
          </div>
        </div>
      </Panel>

      <Panel
        title="私有库建议栏"
        open={suggestOpen}
        onToggle={() => setSuggestOpen(current => !current)}
        className="pl-note-card"
      >
        <Input.TextArea
          className="pl-textarea"
          rows={5}
          maxLength={4000}
          showCount
          value={suggest}
          onChange={event => setSuggest(event.target.value)}
        />
      </Panel>

      <Panel
        title={<>分供商报价说明（仅在采购文件发布后，分供商才可见该内容）<QuestionCircleOutlined className="pl-title-icon" /></>}
        open={quoteOpen}
        onToggle={() => setQuoteOpen(current => !current)}
        className="pl-note-card"
      >
        <Input.TextArea
          className="pl-textarea"
          rows={5}
          maxLength={4000}
          showCount
          value={quoteNote}
          onChange={event => setQuoteNote(event.target.value)}
        />
      </Panel>

      <AttachmentQuoteModal
        open={Boolean(quoting)}
        attachment={quoting}
        catalog={catalog}
        onClose={() => setQuoteKey(null)}
        onQuote={handleQuote}
      />
    </div>
  );
};
