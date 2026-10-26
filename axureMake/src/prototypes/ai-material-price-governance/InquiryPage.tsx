/**
 * 智能询价（二级菜单 `inquiry`）。
 *
 * 定位：拿一份「别人的报价」来问价。用户粘贴一段询价清单、或者上传一份供应商报价表，
 * 系统把每行匹配到标准物料，再用这件商品的**历史成交画像**（`priceProfileOf`）判断
 * 这个报价是贵、是便宜、还是合理。
 *
 * 与其他页面的关系：
 * - 参考价 / 参考区间 / 样本数 全部来自 `analysisData`，与采购清单的参考价列、
 *   价格分析页的图表共用同一份历史合同集，数字不会互相打脸；
 * - 每行都能「价格分析 →」穿透到 `analysis` 页看这件商品的完整招采与签约明细；
 * - 匹配不上的行「提交治理」，进专家治理工作台补标准物料。
 */
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Button, Input, Progress, Segmented, Select, Space, Table, Tooltip, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ArrowRightOutlined,
  DownloadOutlined,
  ExperimentOutlined,
  HistoryOutlined,
  InboxOutlined,
  SearchOutlined,
  SendOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { useDemo } from './context';
import { PageHeader, Surface } from './shared';
import {
  ANALYSIS_BUREAUS,
  ANALYSIS_REGIONS,
  priceProfileOf,
  refPriceOf,
  type AnalysisFilter,
  type PriceAnalysisSubject,
  type PriceProfile
} from './analysisData';
import {
  VERDICT_LABEL,
  deviationOf,
  parseInquiryText,
  sameUnit,
  savingOf,
  verdictColor,
  verdictOf,
  inquirySeed,
  clearInquiry,
  loadInquiry,
  saveInquiry,
  type InquiryRow
} from './inquiry';
import { isAiConfigReady, loadAiConfig } from './ai/config';
import { parseFile } from './ai/extract';
import { buildRawItems, guessMapping, mapColumnsWithAi, type RawItem } from './ai/decompose';
import { matchRowsWithAi } from './ai/match';import type { StandardMaterial } from './data';

type Phase = 'idle' | 'parsing' | 'matching' | 'done';

const RANGE_OPTIONS = [
  { label: '近 6 个月', value: '6' },
  { label: '近 12 个月', value: '12' },
  { label: '近 24 个月', value: '24' },
  { label: '全部', value: '0' }
];

const RANGE_LABEL: Record<string, string> = {
  '6': '近 6 个月',
  '12': '近 12 个月',
  '24': '近 24 个月',
  '0': '全部'
};

const money = (value: number, digits = 2) =>
  value.toLocaleString('zh-CN', { minimumFractionDigits: digits, maximumFractionDigits: digits });

/** 「1,234.5元/吨」「¥88」这类价格原文里抠数字 */
const quoteOfText = (text: string) => {
  const hit = String(text).replace(/[,，\s]/g, '').match(/\d+(?:\.\d+)?/);
  return hit ? Number(hit[0]) : 0;
};

/** 上传的报价表行 → 询价行（价格/数量是原文，抠数字即可） */
const rowFromRawItem = (item: RawItem, sourceName: string): InquiryRow => {
  const quoteText = item.price || '';
  const quote = quoteOfText(quoteText);
  const quantity = Math.round(quoteOfText(item.quantity));
  const unitInPrice = quoteText.split('/')[1]?.trim() ?? '';
  const unit = item.unit || unitInPrice;
  return {
    key: `inq-${item.idx}-${item.key}`,
    raw: item.raw,
    spec: item.spec,
    unit,
    quantityText: quantity ? `${quantity.toLocaleString('zh-CN')} ${unit}`.trim() : '',
    quantity,
    quoteText,
    quote,
    source: 'file',
    sourceName,
    code: '',
    confidence: 0,
    reason: '',
    gap: ''
  };
};

const specTextOf = (standard: StandardMaterial) =>
  standard.attributes.map(attribute => attribute.split(/[:：]/).pop() || attribute).join(' / ');

export const InquiryPage: React.FC = () => {
  const { standards, submitUnmatched, openPriceAnalysis } = useDemo();

  /**
   * 询价结果要能扛住「点价格分析 → 返回」：切页会把本组件卸载，
   * 所以恢复一次本地快照（刷新页面同样有效），全过程不落服务端。
   */
  const [restored] = useState(() => loadInquiry());

  const [source, setSource] = useState<'paste' | 'file'>('paste');
  const [text, setText] = useState(restored?.text ?? '');
  const [rows, setRows] = useState<InquiryRow[]>(restored?.rows ?? []);
  const [phase, setPhase] = useState<Phase>(restored?.rows?.length ? 'done' : 'idle');
  const [progress, setProgress] = useState(0);
  const [stageText, setStageText] = useState(restored?.stageText ?? '');
  const [fileName, setFileName] = useState(restored?.fileName ?? '');
  const [dragging, setDragging] = useState(false);
  const [keyword, setKeyword] = useState('');
  /** 参考口径与价格分析页同一套筛选结构，保证两页算的是同一批合同 */
  const [draft, setDraft] = useState<AnalysisFilter>(restored?.filter ?? { bureau: '', region: '', range: 12 });
  const [filter, setFilter] = useState<AnalysisFilter>(restored?.filter ?? { bureau: '', region: '', range: 12 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // 结果、文本、口径一变就落一次快照（几十 KB 以内，同步写足够）
  useEffect(() => {
    saveInquiry({ text, rows, fileName, filter, stageText });
  }, [text, rows, fileName, filter, stageText]);

  const standardMap = useMemo(() => {
    const map = new Map<string, StandardMaterial>();
    standards.forEach(item => map.set(item.code, item));
    return map;
  }, [standards]);

  /** 标准物料的计价单位：参考价按这个单位计价，不跟报价行走 */
  const standardUnitOf = useCallback((code: string) => (code ? refPriceOf(code).unit : ''), []);

  /** 每行的商品主体：优先用标准物料的名称/规格/属性原子，保证与价格分析页展示一致 */
  const subjectOf = useCallback(
    (row: InquiryRow): PriceAnalysisSubject | null => {
      const standard = row.code ? standardMap.get(row.code) : undefined;
      if (!standard) return null;
      return {
        key: standard.code,
        code: standard.code,
        name: standard.name,
        spec: specTextOf(standard),
        attrs: standard.attributes,
        unit: standardUnitOf(standard.code),
        category: standard.category
      };
    },
    [standardMap, standardUnitOf]
  );

  /** 价格画像：只算匹配到标准物料的行，未匹配的行没有历史价可比 */
  const profiles = useMemo(() => {
    const map = new Map<string, PriceProfile>();
    rows.forEach(row => {
      const subject = subjectOf(row);
      if (subject) map.set(row.key, priceProfileOf(subject, filter));
    });
    return map;
  }, [rows, filter, subjectOf]);

  const rowsWithPrice = useMemo(
    () =>
      rows.map(row => {
        const profile = profiles.get(row.key) ?? null;
        // 报价单位与物料计价单位不一致（按米报的钢管 vs 按吨计价）时不能直接比，
        // 折算率是采购口径的事，原型不猜，标出来让人工处理。
        // 「t / 吨」「m / 米」这类同义写法先归一再比，否则正常的报价表会整列误报单位不一致
        const unitMismatch = Boolean(
          profile && row.unit && profile.ref.unit && !sameUnit(row.unit, profile.ref.unit)
        );
        return {
          row,
          profile,
          unitMismatch,
          deviation: unitMismatch ? 0 : deviationOf(row.quote, profile),
          verdict: unitMismatch ? ('unknown' as const) : verdictOf(row.quote, profile)
        };
      }),
    [rows, profiles]
  );

  const visibleRows = useMemo(() => {
    if (!keyword.trim()) return rowsWithPrice;
    const word = keyword.trim();
    return rowsWithPrice.filter(
      ({ row }) => `${row.raw}${row.spec}${standardMap.get(row.code)?.name ?? ''}${row.sourceName}`.includes(word)
    );
  }, [rowsWithPrice, keyword, standardMap]);

  const stats = useMemo(() => {
    const matched = rowsWithPrice.filter(item => item.row.code);
    // 单位不一致的行没有可比性（米 vs 吨），不进「贵不贵」的统计，但仍是「已匹配」；
    // 没报价的行同理：参考价能给，但「高于区间 / 平均偏离」不能把它算成 0% 的持平样本
    const comparable = matched.filter(item => !item.unitMismatch && item.row.quote > 0);
    const high = comparable.filter(item => item.verdict === 'high' || item.verdict === 'slightly-high');
    const avgDeviation = comparable.length
      ? comparable.reduce((sum, item) => sum + item.deviation, 0) / comparable.length
      : 0;
    return {
      total: rows.length,
      matched: matched.length,
      comparable: comparable.length,
      unmatched: rows.length - matched.length,
      high: high.length,
      highRatio: comparable.length ? Math.round((high.length / comparable.length) * 100) : 0,
      avgDeviation: Math.round(avgDeviation * 10) / 10,
      saving: savingOf(rows, profiles)
    };
  }, [rowsWithPrice, rows.length, profiles]);

  const busy = phase === 'parsing' || phase === 'matching';

  /* ------------------------------ 匹配 ------------------------------ */

  const runMatch = async (items: RawItem[], name: string) => {
    const controller = new AbortController();
    abortRef.current = controller;
    setPhase('matching');
    setStageText(`AI 正在匹配标准物料 0/${items.length}`);

    try {
      const config = loadAiConfig();
      const ready = isAiConfigReady(config);
      const matched = await matchRowsWithAi({
        config,
        rows: items,
        catalog: standards,
        signal: controller.signal,
        onBatchDone: (batchIndex, total, batchRows) => {
          const finished = Math.min(items.length, batchRows.length * (batchIndex + 1));
          const fallback = batchRows.length > 0 && batchRows.every(row => row.reason.includes('本地兜底'));
          setProgress(60 + Math.round(((batchIndex + 1) / total) * 38));
          setStageText(
            fallback || !ready
              ? `模型通道不可用，已改用本地关键词匹配 ${finished}/${items.length} · 第 ${batchIndex + 1}/${total} 批`
              : `AI 正在匹配标准物料 ${finished}/${items.length} · 第 ${batchIndex + 1}/${total} 批`
          );
          // 逐批回填，结果能边跑边看。items 与 rows 一一对应（idx = 行下标），
          // 不要用 key 反查：key 里已经带了 idx，再拼一次会永远对不上
          setRows(current =>
            current.map((row, index) => {
              const hit = batchRows.find(item => item.idx === index);
              if (!hit) return row;
              return { ...row, code: hit.code, confidence: hit.confidence, reason: hit.reason, gap: hit.gap };
            })
          );
        }
      });

      const hit = matched.filter(item => item.code).length;
      setRows(current =>
        current.map((row, index) => {
          const result = matched.find(item => item.idx === index);
          if (!result) return row;
          return { ...row, code: result.code, confidence: result.confidence, reason: result.reason, gap: result.gap };
        })
      );
      setPhase('done');
      setProgress(100);
      setStageText(
        `解析完成 · ${items.length} 条 · 命中标准物料 ${hit} 条 · 已按「${RANGE_LABEL[String(filter.range)]}」历史成交价比对`
      );
      message.success(`「${name}」处理完成，${hit}/${items.length} 条已匹配标准物料`);
    } catch (error) {
      setPhase('done');
      setStageText(
        (error as Error).name === 'AbortError'
          ? '已停止本次询价'
          : `匹配中断：${(error as Error).message || '未知错误'}`
      );
      if ((error as Error).name !== 'AbortError') message.error((error as Error).message || '匹配失败');
    } finally {
      abortRef.current = null;
    }
  };

  /* ------------------------------ 两种输入 ------------------------------ */

  const parsePaste = async (input?: string) => {
    // 空状态里「载入演示清单并解析」会在同一次点击里改 state 再解析，所以内容要能显式传入
    const content = input ?? text;
    if (!content.trim()) {
      message.warning('请先粘贴询价清单，每行一条物料');
      return;
    }
    setPhase('parsing');
    setProgress(20);
    setStageText('正在解析文本行，识别名称 / 数量 / 报价…');
    const parsed = parseInquiryText(content, '手工录入');
    if (!parsed.length) {
      setPhase('done');
      setStageText('没有解析出有效的询价条目，请检查内容');
      message.warning('没有解析出有效的询价条目');
      return;
    }
    setRows(parsed);
    setFileName('');
    setProgress(40);
    await new Promise(resolve => setTimeout(resolve, 120));
    await runMatch(
      parsed.map((row, index) => ({
        key: row.key,
        idx: index,
        raw: row.raw,
        spec: row.spec,
        unit: row.unit,
        quantity: row.quantityText,
        price: row.quoteText
      })),
      '手工录入'
    );
  };

  const ingestFile = async (file: File) => {
    const key = file.name;
    if (!/\.(xlsx|xls|csv|pdf)$/i.test(file.name)) {
      message.warning('报价表支持 Excel / CSV / PDF');
      return;
    }
    if (file.size > 30 * 1024 * 1024) {
      message.warning('文件超过 30MB，请拆分后再上传');
      return;
    }

    setFileName(key);
    setPhase('parsing');
    setProgress(10);
    setStageText(`正在读取「${file.name}」…`);

    try {
      const parsed = await parseFile(file);
      if (parsed.kind === 'text') {
        // PDF 走文本行：没有表头可映射，直接按行解析
        const textRows = parseInquiryText(parsed.lines.join('\n'), file.name);
        if (!textRows.length) throw new Error('未在文件中识别到有效的询价条目');
        setRows(textRows);
        setProgress(40);
        await runMatch(
          textRows.map((row, index) => ({
            key: row.key,
            idx: index,
            raw: row.raw,
            spec: row.spec,
            unit: row.unit,
            quantity: row.quantityText,
            price: row.quoteText
          })),
          file.name
        );
        return;
      }

      const table = parsed.tables[0];
      if (!table || !table.rows.length) throw new Error('未在文件中识别到有效的报价数据行');
      setProgress(18);
      setStageText(`已解析工作表「${table.name}」 ${table.rows.length} 行 · ${table.headers.length} 列`);

      // 表头映射：AI 优先，失败退回本地关键词
      setStageText('AI 正在识别表头字段…');
      let mapping = guessMapping(table.headers);
      const config = loadAiConfig();
      if (isAiConfigReady(config)) {
        try {
          const aiMapping = await mapColumnsWithAi({ config, headers: table.headers, samples: table.rows.slice(0, 3) });
          if (aiMapping.name) mapping = aiMapping;
        } catch {
          // 映射失败不阻断，继续用本地结果
        }
      }
      const { items, skipped } = buildRawItems(table, mapping);
      if (!items.length) throw new Error('按当前表头没有解析出有效报价行，请检查文件内容');

      const converted = items.map(item => rowFromRawItem(item, file.name));
      setRows(converted);
      setProgress(46);
      setStageText(`字段映射完成 · 报价行 ${items.length} 条${skipped.length ? ` · 剔除说明行 ${skipped.length} 条` : ''}`);
      await runMatch(items, file.name);
    } catch (error) {
      setPhase('done');
      setProgress(100);
      setStageText(`「${file.name}」解析失败：${(error as Error).message || '未知错误'}`);
      message.error((error as Error).message || '文件解析失败');
    }
  };

  const pickFile = () => fileInputRef.current?.click();

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = event => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) void ingestFile(file);
  };

  const handleDrop: React.DragEventHandler<HTMLDivElement> = event => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void ingestFile(file);
  };

  const stop = () => {
    abortRef.current?.abort();
    setPhase('done');
    setStageText('已停止本次询价');
  };

  const resetAll = () => {
    abortRef.current?.abort();
    clearInquiry();
    setRows([]);
    setPhase('idle');
    setProgress(0);
    setStageText('');
    setFileName('');
    setKeyword('');
    setText('');
  };

  const query = () => {
    setFilter(draft);
    message.success(`已按「${RANGE_LABEL[String(draft.range)]}」重新取价`);
  };

  const resetFilter = () => {
    const next: AnalysisFilter = { bureau: '', region: '', range: 12 };
    setDraft(next);
    setFilter(next);
  };

  const draftDirty =
    draft.bureau !== filter.bureau || draft.region !== filter.region || draft.range !== filter.range;

  /* ------------------------------ 表格 ------------------------------ */

  const columns: ColumnsType<(typeof rowsWithPrice)[number]> = [
    { title: '序号', key: 'index', width: 48, align: 'center', render: (_v, _r, index) => index + 1 },
    {
      title: '询价物料',
      key: 'raw',
      width: 208,
      render: (_v, { row }) => (
        <div className="inq-item">
          <span className="inq-item-name" title={row.raw}>
            {row.raw}
          </span>
          <span className="inq-item-meta">
            {row.quantityText || '未写数量'}
            <em>·</em>
            {row.sourceName}
          </span>
        </div>
      )
    },
    {
      title: (
        <Tooltip title="取匹配到的标准物料已登记的规格型号，按「属性：属性值」逐条展示；未匹配的行显示报价单里的规格原文">
          <span>规格型号</span>
        </Tooltip>
      ),
      key: 'spec',
      width: 204,
      render: (_v, { row }) => {
        // 已匹配：以标准物料的属性原子为准（与标准物料库、价格分析同一口径）；
        // 未匹配：退回报价单里的规格原文，别拿询价原文冒充结构化规格
        const attributes = (row.code ? standardMap.get(row.code)?.attributes : undefined) ?? [];
        if (attributes.length) {
          return (
            <div className="inq-spec">
              {attributes.map(attribute => {
                const [label, ...rest] = attribute.split(/[:：]/);
                const value = rest.join('：').trim();
                return (
                  <span className="inq-spec-pill" key={attribute} title={attribute}>
                    {value ? <em>{label}</em> : null}
                    <b>{value || label}</b>
                  </span>
                );
              })}
            </div>
          );
        }
        if (row.spec) {
          return (
            <Tooltip title={row.spec} placement="topLeft">
              <span className="inq-spec-raw">{row.spec}</span>
            </Tooltip>
          );
        }
        return <span className="inq-muted">未登记规格</span>;
      }
    },
    {
      title: (
        <Tooltip title="报价表里的单价，单位随物料（元/吨、元/米…）">
          <span>报价单价</span>
        </Tooltip>
      ),
      key: 'quote',
      width: 108,
      align: 'right',
      render: (_v, { row }) =>
        row.quote ? <b className="inq-quote">{money(row.quote)}</b> : <span className="inq-muted">未报价</span>
    },
    {
      title: '参考价',
      key: 'ref',
      width: 100,
      align: 'right',
      render: (_v, { profile }) =>
        profile ? <span className="inq-ref">{money(profile.ref.price)}</span> : <span className="inq-muted">—</span>
    },
    {
      title: (
        <Tooltip title="报价相对参考价的偏离，正数表示比参考价贵">
          <span>偏离</span>
        </Tooltip>
      ),
      key: 'deviation',
      width: 80,
      align: 'right',
      render: (_v, { profile, deviation, unitMismatch, row }) => {
        if (!profile) return <span className="inq-muted">—</span>;
        if (unitMismatch) return <span className="inq-muted">—</span>;
        // 报价表里没填单价时，「偏离 0% → 持平」是假结论：没报价就没有偏离可言
        if (!row.quote) return <span className="inq-muted">—</span>;
        if (!deviation) return <span className="dev is-flat">持平</span>;
        return (
          <span className={`dev ${deviation > 0 ? 'is-up' : 'is-down'}`}>
            {deviation > 0 ? '+' : ''}
            {deviation.toFixed(1)}%
          </span>
        );
      }
    },
    {
      title: '判定',
      key: 'verdict',
      width: 92,
      render: (_v, { verdict, unitMismatch, profile, row }) => {
        if (unitMismatch) {
          return (
            <Tooltip title={`报价单位「${row.unit}」与物料计价单位「${profile?.ref.unit}」不一致，需按采购口径折算后再比`}>
              <span className="inq-verdict is-mismatch">单位不一致</span>
            </Tooltip>
          );
        }
        return (
          <span className="inq-verdict" style={{ color: verdictColor(verdict), borderColor: verdictColor(verdict) }}>
            {VERDICT_LABEL[verdict]}
          </span>
        );
      }
    },
    {
      title: '匹配标准物料',
      key: 'standard',
      width: 244,
      render: (_v, { row }) => {
        const standard = row.code ? standardMap.get(row.code) : undefined;
        if (!standard)
          return (
            <div className="inq-standard is-empty">
              <span>未匹配到标准物料</span>
              <em>{row.reason || '等待治理补齐'}</em>
            </div>
          );
        return (
          <div className="inq-standard">
            <span className="inq-standard-name" title={standard.name}>
              {standard.name}
            </span>
            <em className="pa-mono">{standard.code}</em>
          </div>
        );
      }
    },
    {
      title: '匹配度',
      key: 'confidence',
      width: 88,
      align: 'center',
      render: (_v, { row }) =>
        row.code ? (
          <span className={`inq-confidence ${row.confidence >= 90 ? 'is-high' : row.confidence >= 75 ? 'is-mid' : 'is-low'}`}>
            {row.confidence}%
          </span>
        ) : (
          <span className="inq-muted">—</span>
        )
    },
    {
      title: '参考区间（P25 ~ P75）',
      key: 'range',
      width: 168,
      render: (_v, { profile }) =>
        profile ? (
          <span className="inq-range">
            {money(profile.low, 0)} ~ {money(profile.high, 0)}
          </span>
        ) : (
          <span className="inq-muted">—</span>
        )
    },
    {
      title: '样本',
      key: 'samples',
      width: 84,
      align: 'right',
      render: (_v, { profile }) => (profile ? `${profile.count} 份` : <span className="inq-muted">—</span>)
    },
    {
      title: '操作',
      key: 'action',
      width: 168,
      fixed: 'right',
      render: (_v, { row }) =>
        row.code ? (
          <Space size={0}>
            <Button
              type="link"
              size="small"
              icon={<HistoryOutlined />}
              onClick={() => {
                const subject = subjectOf(row);
                if (subject) openPriceAnalysis(subject, 'inquiry');
              }}
            >
              价格分析
            </Button>
          </Space>
        ) : (
          <Button type="link" size="small" icon={<SendOutlined />} onClick={submitUnmatched}>
            提交治理
          </Button>
        )
    }
  ];

  const filterText = `${RANGE_LABEL[String(filter.range)]}${filter.bureau ? ` · ${filter.bureau}` : ' · 全部组织'}${filter.region ? ` · ${filter.region}` : ' · 全部区域'}`;

  return (
    <>
      <PageHeader
        title="智能询价"
        subtitle="贴清单或上传报价表，按历史成交价判断这次报价贵不贵"
        action={
          <Space size={8}>
            <Button
              icon={<DownloadOutlined />}
              disabled={!rows.length}
              onClick={() => message.success(`询价参考单已生成（${rows.length} 条）`)}
            >
              导出询价单
            </Button>
            <Button disabled={!rows.length} onClick={resetAll}>
              清空重来
            </Button>
          </Space>
        }
      />

      {/* 输入 */}
      <Surface
        className="inq-card"
        title={
          <Space size={6}>
            <ThunderboltOutlined />
            询价输入
          </Space>
        }
        extra={
          <Segmented
            value={source}
            onChange={value => setSource(value as 'paste' | 'file')}
            options={[
              { label: '粘贴清单', value: 'paste' },
              { label: '上传报价表', value: 'file' }
            ]}
          />
        }
      >
        {source === 'paste' ? (
          <>
            <Input.TextArea
              className="pg-inquiry-input"
              value={text}
              onChange={event => setText(event.target.value)}
              placeholder={'每行一条，写法：名称 规格 数量 单价\n例如：HRB400E抗震螺纹钢 Φ25  120吨  3980元/吨'}
            />
            <div className="inq-hint">
              数量写「120吨」、报价写「3980元/吨」或「¥3,980」都能识别；不写报价也能查参考价，只是不做贵/便宜判定。
            </div>
            <Space size={8} style={{ marginTop: 10 }}>
              <Button onClick={() => setText('')} disabled={busy}>
                清空
              </Button>
              <Button type="primary" icon={<ExperimentOutlined />} loading={busy} onClick={() => void parsePaste()}>
                AI 解析并匹配
              </Button>
              <Button icon={<HistoryOutlined />} disabled={busy} onClick={() => setText(inquirySeed)}>
                载入演示清单
              </Button>
              <span className="inq-hint is-inline">一次最多 30 条</span>
            </Space>
          </>
        ) : (
          <div
            className={`inq-drop ${dragging ? 'is-over' : ''}`}
            onClick={pickFile}
            onDragOver={event => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <InboxOutlined className="inq-drop-icon" />
            <div className="inq-drop-title">把供应商报价表拖到这里，或点击选择文件</div>
            <div className="inq-drop-hint">
              支持 Excel / CSV / PDF · 自动识别物料名称、规格、数量、单价列 · 单份最多 30 条
            </div>
            {fileName && (
              <div className="inq-drop-file">
                最近一次：<b>{fileName}</b>
              </div>
            )}
          </div>
        )}

        {busy && (
          <div className="inq-progress">
            <Progress percent={progress} size="small" status="active" showInfo={false} />
            <div className="inq-progress-text">
              <span>{stageText}</span>
              <Button type="link" size="small" onClick={stop}>
                停止
              </Button>
            </div>
          </div>
        )}
        {!busy && stageText && <div className="inq-stage">{stageText}</div>}
      </Surface>

      {/* 参考口径 */}
      <section className="pg-governance-panel pa-filter-card inq-filter">
        <div className="pa-filter-row" style={{ alignItems: 'center' }}>
          <div className="pa-filter-item">
            <span className="pa-filter-label">组织机构</span>
            <Select
              className="pa-filter-control"
              value={draft.bureau}
              onChange={value => setDraft(current => ({ ...current, bureau: value }))}
              options={[{ value: '', label: '全部组织' }, ...ANALYSIS_BUREAUS.map(name => ({ value: name, label: name }))]}
            />
          </div>
          <div className="pa-filter-item">
            <span className="pa-filter-label">专项区域</span>
            <Select
              className="pa-filter-control"
              value={draft.region}
              onChange={value => setDraft(current => ({ ...current, region: value }))}
              options={[{ value: '', label: '全部区域' }, ...ANALYSIS_REGIONS.map(name => ({ value: name, label: name }))]}
            />
          </div>
          <div className="pa-filter-item pa-filter-range">
            <span className="pa-filter-label">取价范围</span>
            <Segmented
              value={String(draft.range)}
              onChange={value => setDraft(current => ({ ...current, range: Number(value) as AnalysisFilter['range'] }))}
              options={RANGE_OPTIONS}
            />
          </div>
          <Space size={8} className="pa-filter-actions">
            <Button type="primary" icon={<SearchOutlined />} onClick={query}>
              重新取价
            </Button>
            <Button onClick={resetFilter}>重置</Button>
            {draftDirty && <span className="pa-filter-dirty">口径已修改，点「重新取价」生效</span>}
          </Space>
        </div>
      </section>

      {rows.length ? (
        <>
          {/* 关键指标 */}
          <div className="pg-kpi-grid pg-kpi-grid-4 inq-kpi">
            <Surface className="pg-kpi">
              <div className="pg-page-subtitle">询价条目</div>
              <div className="pg-page-title">
                {stats.total}
                <em>条</em>
              </div>
              <div className="pg-ai-sub">按 {filterText} 取历史成交价</div>
            </Surface>
            <Surface className="pg-kpi">
              <div className="pg-page-subtitle">成功匹配</div>
              <div className="pg-page-title">
                {stats.matched}
                <em>条</em>
              </div>
              <div className="pg-ai-sub">
                {stats.total ? `匹配率 ${Math.round((stats.matched / stats.total) * 100)}%` : '—'}
                {stats.unmatched > 0 && <span className="inq-kpi-warn">· {stats.unmatched} 条待治理</span>}
              </div>
            </Surface>
            <Surface className="pg-kpi">
              <div className="pg-page-subtitle">报价高于成交区间</div>
              <div className="pg-page-title">
                {stats.high}
                <em>条</em>
              </div>
              <div className="pg-ai-sub">
                {stats.comparable ? (
                  <>
                    占可比 {stats.highRatio}% · {stats.comparable} 条平均偏离
                    <span className={stats.avgDeviation > 0 ? 'dev is-up' : stats.avgDeviation < 0 ? 'dev is-down' : 'dev is-flat'}>
                      {stats.avgDeviation > 0 ? '+' : ''}
                      {stats.avgDeviation}%
                    </span>
                  </>
                ) : (
                  '暂无可比报价（未报价、未匹配或单位不一致）'
                )}
              </div>
            </Surface>
            <Surface className="pg-kpi">
              <div className="pg-page-subtitle">可议价空间</div>
              <div className="pg-page-title">
                {money(stats.saving, 1)}
                <em>万元</em>
              </div>
              <div className="pg-ai-sub">仅计「明显偏高」且写了数量的条目</div>
            </Surface>
          </div>

          {/* 结果 */}
          <Surface
            className="inq-card pa-detail-card"
            title="询价结果"
            extra={
              <Space size={8}>
                <Input
                  prefix={<SearchOutlined />}
                  className="pa-detail-search"
                  value={keyword}
                  onChange={event => setKeyword(event.target.value)}
                  placeholder="搜索物料、标准物料或来源"
                  allowClear
                />
                <span className="pg-ai-sub">共 {visibleRows.length} 条 · 金额单位元</span>
              </Space>
            }
          >
            <Table
              className="pa-detail-table inq-table"
              rowKey={record => record.row.key}
              columns={columns}
              dataSource={visibleRows}
              size="small"
              scroll={{ x: 1600 }}
              rowClassName={record => (record.row.code ? '' : 'inq-row-unmatched')}
              pagination={visibleRows.length > 10 ? { pageSize: 10, showSizeChanger: false } : false}
              locale={{ emptyText: <div className="pa-table-empty">没有匹配到关键词的询价条目</div> }}
            />
            <div className="inq-footnote">
              参考价与参考区间取该商品在所选口径下的历史合同成交价（<b>P25 ~ P75</b>），已剔除异常报价；
              价格为脱敏参考，不展示具体合同条款。判定规则：超出区间 ±10% 记为「明显」。
            </div>
          </Surface>
        </>
      ) : (
        <Surface className="inq-card">
          <div className="pg-empty-action">
            <ExperimentOutlined style={{ fontSize: 32, color: '#9aa4ad' }} />
            <h3>还没有询价结果</h3>
            <p className="pg-page-subtitle">
              粘贴一段询价清单，或上传供应商报价表，系统会先匹配标准物料，再拿历史成交价判断这份报价贵不贵
            </p>
            <Space size={8} style={{ marginTop: 12 }}>
              <Button
                type="primary"
                onClick={() => {
                  setSource('paste');
                  setText(inquirySeed);
                  void parsePaste(inquirySeed);
                }}
              >
                载入演示清单并解析
              </Button>
              <Button
                onClick={() => {
                  setSource('file');
                }}
              >
                上传报价表
              </Button>
            </Space>
            <div className="inq-steps">
              <div>
                <b>1</b>
                <span>贴清单 / 传报价表</span>
              </div>
              <ArrowRightOutlined />
              <div>
                <b>2</b>
                <span>匹配标准物料与规格</span>
              </div>
              <ArrowRightOutlined />
              <div>
                <b>3</b>
                <span>按历史成交价判定贵或合理</span>
              </div>
              <ArrowRightOutlined />
              <div>
                <b>4</b>
                <span>穿透价格分析看明细</span>
              </div>
            </div>
          </div>
        </Surface>
      )}

      {stats.unmatched > 0 && (
        <div className="inq-tip">
          未匹配的 {stats.unmatched} 条物料已可提交治理；在治理工作台补齐标准物料后，回到本页重新解析就能取到参考价。
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv,.pdf"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </>
  );
};
