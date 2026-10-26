/**
 * 价格分析（二级菜单 `analysis`）。
 *
 * 定位：给「一件商品」做价格体检 —— 它过去招采过几次、和谁签的、签在什么价位，
 * 今年比去年贵还是便宜。参考价就来自这份历史合同，所以采购清单的「参考价」
 * 除了显示金额，还给了「查看详情」跳到这里，两边看的是同一份数据。
 *
 * 版式参考业务给的价格分析看板：顶部筛选 → 4 个关键指标 → 走势图 → 结构占比 →
 * 明细表。图表是手写 SVG（`analysisCharts.tsx`），不引图表库。
 */
import React, { useMemo, useState } from 'react';
import { Button, Input, Segmented, Select, Space, Table, Tag, Tooltip, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ArrowLeftOutlined,
  BulbOutlined,
  DownloadOutlined,
  ReloadOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { useDemo } from './context';
import { PageHeader, Surface } from './shared';
import { BarRank, ComboChart } from './analysisCharts';
import {
  ANALYSIS_BUREAUS,
  ANALYSIS_REGIONS,
  buildAnalysis,
  refPriceOf,
  specTagsOf,
  type AnalysisContract,
  type AnalysisFilter,
  type PriceAnalysisSubject
} from './analysisData';

type RangeValue = 6 | 12 | 24 | 0;

const RANGE_LABEL: Record<string, string> = {
  '6': '近 6 个月',
  '12': '近 12 个月',
  '24': '近 24 个月',
  '0': '全部'
};

const rangeText = (range: RangeValue) => RANGE_LABEL[String(range)] ?? '近 12 个月';

const money = (value: number, digits = 0) =>
  value.toLocaleString('zh-CN', { minimumFractionDigits: digits, maximumFractionDigits: digits });

/** 偏离参考价：贵了用暖色提醒（成本上浮），便宜了用绿色，跟国内涨跌配色一致 */
const Deviation: React.FC<{ value: number }> = ({ value }) => {
  if (!Number.isFinite(value) || Math.abs(value) < 0.05) return <span className="pa-dev is-flat">持平</span>;
  return (
    <span className={`pa-dev ${value > 0 ? 'is-up' : 'is-down'}`}>
      {value > 0 ? '+' : ''}{value.toFixed(1)}%
    </span>
  );
};

export const AnalysisPage: React.FC = () => {
  const { standards, analysisSubject, analysisFrom, openPriceAnalysis, setPage } = useDemo();
  /** 返回按钮跟着来源页走：从询价点进来就回询价，从清单点进来就回清单 */
  const backLabel = analysisFrom === 'inquiry' ? '返回智能询价' : '返回采购清单';

  /** 筛选是「点查询才生效」的两段式：截图上的看板也是这个交互 */
  const [draft, setDraft] = useState<AnalysisFilter>({ bureau: '', region: '', range: 12 });
  const [filter, setFilter] = useState<AnalysisFilter>({ bureau: '', region: '', range: 12 });
  const [keyword, setKeyword] = useState('');

  const analysis = useMemo(() => buildAnalysis(analysisSubject, filter), [analysisSubject, filter]);
  const { subject, stats, ref } = analysis;

  /** 规格型号标签：属性原子 KV 优先，退回按分隔符拆开的值 */
  const specTags = useMemo(() => specTagsOf(subject), [subject]);

  const options = useMemo(
    () =>
      standards.map(standard => {
        const seed = refPriceOf(standard.code);
        return {
          value: standard.code,
          label: `${standard.name}（${standard.code}）`,
          subject: {
            key: standard.code,
            code: standard.code,
            name: standard.name,
            spec: standard.attributes.map(attribute => attribute.split(/[:：]/).pop() || attribute).join(' / '),
            attrs: standard.attributes,
            unit: seed.unit,
            category: standard.category
          } as PriceAnalysisSubject
        };
      }),
    [standards]
  );

  const draftDirty =
    draft.bureau !== filter.bureau || draft.region !== filter.region || draft.range !== filter.range;

  const query = () => {
    setFilter(draft);
    message.success(`已按「${rangeText(draft.range)}」重新统计`);
  };

  const resetFilter = () => {
    const next: AnalysisFilter = { bureau: '', region: '', range: 12 };
    setDraft(next);
    setFilter(next);
  };

  const contracts = useMemo(
    () =>
      analysis.contracts.filter(contract => {
        if (!keyword.trim()) return true;
        const text = `${contract.no}${contract.project}${contract.supplier}${contract.region}${contract.bureau}`;
        return text.includes(keyword.trim());
      }),
    [analysis.contracts, keyword]
  );

  const columns: ColumnsType<AnalysisContract> = [
    { title: '序号', key: 'index', width: 58, align: 'center', render: (_v, _r, index) => index + 1 },
    {
      title: '合同编号',
      dataIndex: 'no',
      key: 'no',
      width: 138,
      render: (value: string, row) => (
        <div className="pa-contract-no">
          <span>{value}</span>
          <Tag className="pg-soft-tag">{row.source}</Tag>
        </div>
      )
    },
    { title: '采购项目', dataIndex: 'project', key: 'project', width: 208, ellipsis: true },
    { title: '分供商', dataIndex: 'supplier', key: 'supplier', width: 124, ellipsis: true },
    { title: '签订日期', dataIndex: 'signDate', key: 'signDate', width: 104 },
    {
      // 关键对比列往前排：横向滚动前就能看到「这份合同比参考价贵还是便宜」
      title: (
        <Tooltip title="该合同单价相对当前参考价的偏离">
          <span>与参考价</span>
        </Tooltip>
      ),
      key: 'deviation',
      width: 96,
      align: 'right',
      render: (_v, row) => <Deviation value={row.deviation} />
    },
    {
      title: `数量（${subject.unit}）`,
      key: 'quantity',
      width: 104,
      align: 'right',
      render: (_v, row) => money(row.quantity)
    },
    {
      title: `单价（元/${subject.unit}）`,
      key: 'unitPrice',
      width: 118,
      align: 'right',
      render: (_v, row) => <b className="pa-contract-price">{money(row.unitPrice, 2)}</b>
    },
    {
      title: '合同金额（万元）',
      key: 'amount',
      width: 122,
      align: 'right',
      render: (_v, row) => money(row.amount, 1)
    },
    {
      title: '区域 / 工程局',
      key: 'org',
      width: 126,
      render: (_v, row) => (
        <div className="pa-contract-org">
          <span>{row.region}</span>
          <span className="pg-ai-sub">{row.bureau}</span>
        </div>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 86,
      fixed: 'right',
      render: (_v, row) => (
        <Button type="link" size="small" onClick={() => message.info(`打开合同 ${row.no}（演示）`)}>
          查看合同
        </Button>
      )
    }
  ];

  const trendPoints = analysis.months.map(point => ({
    label: point.label,
    bar: point.amount,
    line: point.price
  }));

  const yearPoints = analysis.years.map(group => ({
    label: group.label,
    bar: group.amount,
    line: group.ratio
  }));

  const bureauPoints = analysis.bureaus.map(group => ({
    label: group.label,
    bar: group.amount,
    line: group.ratio
  }));

  return (
    <>
      <PageHeader
        title="价格分析"
        subtitle="一件商品的招采历史、签约情况与参考价来源"
        action={
          <Space size={8}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => setPage(analysisFrom)}>
              {backLabel}
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => message.success('价格分析报告导出任务已创建')}
            >
              导出报告
            </Button>
          </Space>
        }
      />

      {/* 商品 + 筛选 */}
      <section className="pg-governance-panel pa-filter-card">
        <div className="pa-filter-subject">
          <span className="pa-filter-label">分析商品</span>
          <Select
            className="pa-subject-select"
            value={subject.code ?? subject.key}
            options={options}
            showSearch
            optionFilterProp="label"
            onChange={value => {
              const hit = options.find(option => option.value === value);
              if (hit) openPriceAnalysis(hit.subject);
            }}
          />
        </div>
        <div className="pa-filter-row">
          <div className="pa-filter-item">
            <span className="pa-filter-label">组织机构</span>
            <Select
              className="pa-filter-control"
              value={draft.bureau}
              onChange={value => setDraft(current => ({ ...current, bureau: value }))}
              options={[
                { value: '', label: '全部组织' },
                ...ANALYSIS_BUREAUS.map(name => ({ value: name, label: name }))
              ]}
            />
          </div>
          <div className="pa-filter-item">
            <span className="pa-filter-label">专项区域</span>
            <Select
              className="pa-filter-control"
              value={draft.region}
              onChange={value => setDraft(current => ({ ...current, region: value }))}
              options={[
                { value: '', label: '全部区域' },
                ...ANALYSIS_REGIONS.map(name => ({ value: name, label: name }))
              ]}
            />
          </div>
          <div className="pa-filter-item pa-filter-range">
            <span className="pa-filter-label">时间范围</span>
            <Segmented
              value={String(draft.range)}
              onChange={value => setDraft(current => ({ ...current, range: Number(value) as RangeValue }))}
              options={[
                { label: '近 6 个月', value: '6' },
                { label: '近 12 个月', value: '12' },
                { label: '近 24 个月', value: '24' },
                { label: '全部', value: '0' }
              ]}
            />
          </div>
          <Space size={8} className="pa-filter-actions">
            <Button type="primary" icon={<SearchOutlined />} onClick={query}>
              查询
            </Button>
            <Button icon={<ReloadOutlined />} onClick={resetFilter}>
              重置
            </Button>
            {draftDirty && <span className="pa-filter-dirty">筛选条件已修改，点「查询」生效</span>}
          </Space>
        </div>
      </section>

      {/* 商品条：一行三列（名称 / 单位 / 规格型号），规格型号按属性原子 KV 展示 */}
      <section className="pa-subject">
        <div className="pa-subject-fields">
          <div className="pa-field pa-field-name">
            <span className="pa-field-label">商品名称</span>
            <div className="pa-field-value">{subject.name}</div>
            <div className="pa-field-note">
              {subject.code && <span className="pa-mono">{subject.code}</span>}
              {subject.category && <span>{subject.category}</span>}
            </div>
          </div>
          <div className="pa-field pa-field-unit">
            <span className="pa-field-label">单位</span>
            <div className="pa-field-value">{subject.unit || '—'}</div>
            <div className="pa-field-note">按此单位计价</div>
          </div>
          <div className="pa-field pa-field-spec">
            <span className="pa-field-label">
              规格型号
              <em>{specTags.length} 个属性</em>
            </span>
            <div className="pg-spec-tags pa-field-tags">
              {specTags.map(tag => (
                <Tag key={tag}>{tag}</Tag>
              ))}
              {specTags.length === 0 && <span className="pa-field-empty">未登记规格型号</span>}
            </div>
          </div>
        </div>
        <div className="pa-subject-ref">
          <div className="pa-subject-ref-label">
            参考价
            <Tooltip title="按该商品近 6 个月合同与招标清单的成交单价加权得出，剔除异常报价后取整">
              <BulbOutlined className="pa-subject-ref-icon" />
            </Tooltip>
          </div>
          <div className="pa-subject-ref-value">
            <em>¥</em>
            {money(ref.price, 2)}
            <span>/ {subject.unit}</span>
          </div>
          <div className="pa-subject-ref-src">
            {ref.source} · {ref.date} · {ref.samples} 个有效样本
          </div>
        </div>
      </section>

      {/* 关键指标 */}
      <div className="pg-kpi-grid pg-kpi-grid-4 pa-kpi-grid">
        <Surface className="pg-kpi">
          <div className="pg-page-subtitle">参考价</div>
          <div className="pg-page-title">
            {money(stats.refPrice, 2)}<em>元/{subject.unit}</em>
          </div>
          <div className="pg-ai-sub">当前清单报价的比对基准</div>
        </Surface>
        <Surface className="pg-kpi">
          <div className="pg-page-subtitle">{rangeText(filter.range)}成交均价</div>
          <div className="pg-page-title">
            {money(stats.avgPrice, 2)}<em>元/{subject.unit}</em>
          </div>
          <div className="pg-ai-sub">
            相对参考价 <Deviation value={Number((((stats.avgPrice - stats.refPrice) / (stats.refPrice || 1)) * 100).toFixed(1))} />
            {stats.recentTrend !== 0 && (
              <span className="pa-kpi-split">
                · 近 3 月环比 {stats.recentTrend > 0 ? '↑' : '↓'}{Math.abs(stats.recentTrend)}%
              </span>
            )}
          </div>
        </Surface>
        <Surface className="pg-kpi">
          <div className="pg-page-subtitle">累计签订合同</div>
          <div className="pg-page-title">
            {stats.contractCount}<em>份</em>
          </div>
          <div className="pg-ai-sub">覆盖 {stats.supplierCount} 家分供商 · {analysis.regions.length} 个区域</div>
        </Surface>
        <Surface className="pg-kpi">
          <div className="pg-page-subtitle">累计合同金额</div>
          <div className="pg-page-title">
            {money(stats.totalAmount, 1)}<em>万元</em>
          </div>
          <div className="pg-ai-sub">
            成交单价区间 {money(stats.minPrice, 0)} ~ {money(stats.maxPrice, 0)} 元
          </div>
        </Surface>
      </div>

      {/* 走势 */}
      <Surface
        className="pa-card"
        title="采购合同金额走势"
        extra={<span className="pg-ai-sub">按月汇总 · 柱为合同金额，线为成交均价</span>}
      >
        <ComboChart
          data={trendPoints}
          barName="合同金额"
          lineName="成交均价"
          barUnit="万元"
          lineUnit={`元/${subject.unit}`}
          height={286}
          linePrecision={0}
          emptyHint="该时间范围内没有签约记录"
        />
      </Surface>

      {/* 结构：区域 + 工程局 */}
      <div className="pa-grid-2">
        <Surface
          className="pa-card"
          title="区域合同金额分布"
          extra={<span className="pg-ai-sub">共 {analysis.regions.length} 个区域</span>}
        >
          <BarRank items={analysis.regions} />
        </Surface>
        <Surface
          className="pa-card"
          title="工程局金额占比"
          extra={<span className="pg-ai-sub">柱为金额，线为占比</span>}
        >
          <ComboChart
            data={bureauPoints}
            barName="合同金额"
            lineName="金额占比"
            barUnit="万元"
            lineUnit="%"
            height={300}
            lineFromZero
            linePrecision={0}
          />
        </Surface>
      </div>

      {/* 年度 */}
      <Surface
        className="pa-card"
        title="年度采购金额与结构占比"
        extra={<span className="pg-ai-sub">全部 {analysis.allCount} 份合同，不受时间筛选影响</span>}
      >
        <ComboChart
          data={yearPoints}
          barName="合同金额"
          lineName="金额占比"
          barUnit="万元"
          lineUnit="%"
          height={252}
          lineFromZero
          linePrecision={0}
          barColor="#2f8fc4"
        />
      </Surface>

      {/* 明细 */}
      <Surface
        className="pa-card pa-detail-card"
        title="数据详情"
        extra={
          <Space size={8}>
            <Input
              prefix={<SearchOutlined />}
              className="pa-detail-search"
              value={keyword}
              onChange={event => setKeyword(event.target.value)}
              placeholder="搜索合同编号、项目、分供商"
              allowClear
            />
            <span className="pg-ai-sub">共 {contracts.length} 份 · 金额单位万元</span>
          </Space>
        }
      >
        <Table
          className="pa-detail-table"
          rowKey="key"
          columns={columns}
          dataSource={contracts}
          size="small"
          scroll={{ x: 1300 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showTotal: total => `共 ${total} 条合同记录`
          }}
          locale={{
            emptyText: (
              <div className="pa-table-empty">
                当前筛选条件下没有合同记录，可放宽时间范围或组织机构后重试
              </div>
            )
          }}
        />
      </Surface>
    </>
  );
};
