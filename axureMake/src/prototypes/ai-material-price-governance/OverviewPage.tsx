/**
 * 治理总览。
 *
 * 初版总览是「四个漂亮数字 + 一条流程 + 两张表」：数字写死（本月新增 436 条、覆盖 126 个品类、
 * AI 准确率 91.6%），跟任何页面都对不上，也看不出闭环走到哪一步、卡在哪里。
 *
 * 现在这一版的原则只有一条——**每个数都要能在下游页面找到出处**：
 * 1. 五个 KPI 全部按当前数据现算（标准物料 / 历史价格 / 治理队列 / 历史价复用率 / 最近询价），
 *    审核通过一条、导入一批、映射一个项目，总览的数字就会跟着动；
 * 2. 闭环七步与左侧菜单一一对应，每步都带「主指标 + 状态」，有积压的那一步亮橙色；
 * 3. 「下一步建议」按业务优先级算：待审核 > 驳回待改 > 还没接入 > 历史清单没映射 > 都通了去询价，
 *    演示时不用记台词，跟着按钮走就是完整闭环；
 * 4. 最近动态取提交单的提交 / 审核时间，倒序展示，这是「审计链路」在总览上的可见出口。
 */
import React, { useMemo, useState } from 'react';
import { Badge, Button, Progress, Space, Table, Tag } from 'antd';
import {
  ApiOutlined,
  ArrowRightOutlined,
  AuditOutlined,
  DatabaseOutlined,
  FileSearchOutlined,
  NodeIndexOutlined,
  TeamOutlined,
  ThunderboltFilled,
  ToolOutlined
} from '@ant-design/icons';
import { type GovernanceTask, type PageKey, type StandardMaterial } from './data';
import { useDemo } from './context';
import { PageHeader, Surface } from './shared';
import { overallStats } from './mapping';
import { emptyFilter, priceProfileOf, refPriceOf } from './analysisData';
import { loadInquiry, sameUnit, verdictOf } from './inquiry';

const fmt = (value: number) => value.toLocaleString('zh-CN');
const wanText = (amount: number) => `${(amount / 10000).toFixed(1)} 万元`;

/** ok 已就绪 / doing 在推进 / attention 有积压 / todo 还没开始 */
type StageState = 'ok' | 'doing' | 'attention' | 'todo';

type Stage = {
  key: string;
  label: string;
  target: PageKey;
  icon: React.ReactNode;
  value: string;
  unit: string;
  note: string;
  state: StageState;
  stateText: string;
};

const stateClass: Record<StageState, string> = {
  ok: 'is-ok',
  doing: 'is-doing',
  attention: 'is-attention',
  todo: 'is-todo'
};

const Kpi: React.FC<{
  title: string;
  value: string;
  unit?: string;
  note: React.ReactNode;
  page: PageKey;
  tone?: 'warn' | 'ok';
}> = ({ title, value, unit, note, page, tone }) => {
  const { setPage } = useDemo();
  return (
    <div className={`ov-kpi${tone ? ` ${tone === 'warn' ? 'is-warn' : 'is-ok'}` : ''}`} onClick={() => setPage(page)}>
      <div className="ov-kpi-title">{title}</div>
      <div className="ov-kpi-value">
        {value}
        {unit && <span className="ov-kpi-unit">{unit}</span>}
      </div>
      <div className="ov-kpi-note">{note}</div>
      <ArrowRightOutlined className="ov-kpi-go" />
    </div>
  );
};

export const OverviewPage: React.FC = () => {
  const { setPage, standards, prices, tasks, submissions, pendingCount, mapping, openTask } = useDemo();

  /* ------------------------------ 标准物料 ------------------------------ */
  const stdStat = useMemo(() => {
    const created = standards.filter(item => item.code.startsWith('STD-AI-')).length;
    const leaf = new Set(standards.map(item => item.category.split(' / ').pop() || '未分类'));
    const groups = new Map<string, number>();
    standards.forEach(item => {
      const parts = item.category.split(' / ');
      // 品类路径形如「建材 / 钢材 / 钢筋」：按中间一级分组，只有一级时就用它自己
      const label = parts.length > 2 ? parts[1] : parts[0] || '未分类';
      groups.set(label, (groups.get(label) ?? 0) + 1);
    });
    return {
      count: standards.length,
      created,
      leafCount: leaf.size,
      groups: Array.from(groups.entries()).sort((a, b) => b[1] - a[1])
    };
  }, [standards]);

  /* ------------------------------ 历史价格 ------------------------------ */
  const priceStat = useMemo(() => {
    const contract = prices.filter(item => item.source === '合同').length;
    const low = prices.filter(item => item.confidence < 75).length;
    return {
      total: prices.length,
      contract,
      bid: prices.length - contract,
      high: prices.filter(item => item.confidence >= 90).length,
      mid: prices.filter(item => item.confidence >= 75 && item.confidence < 90).length,
      low,
      // 这 20 条历史价覆盖了多少条标准物料——覆盖不到的那些，询价时就只能给「暂无参考价」
      covered: new Set(prices.map(item => item.materialCode)).size,
      // 低置信度 / 异常价格必须人工过一遍，这是业务规则里写明的
      risky: prices.filter(item => item.abnormal || item.confidence < 75).length
    };
  }, [prices]);

  /* ------------------------------ 提交单 ------------------------------ */
  const subStat = useMemo(() => {
    const pending = submissions.filter(item => item.status === '待审核');
    const rejected = submissions.filter(item => item.status === '已驳回');
    const approved = submissions.filter(item => item.status === '已通过');
    const reviewed = approved.length + rejected.length;
    return {
      pending: pending.length,
      pendingNew: pending.filter(item => item.changeType === 'new').length,
      pendingUpdate: pending.filter(item => item.changeType === 'update').length,
      rejected: rejected.length,
      approved: approved.length,
      passRate: reviewed ? Math.round((approved.length / reviewed) * 100) : null
    };
  }, [submissions]);

  /* ------------------------------ 治理任务 ------------------------------ */
  const taskStat = useMemo(() => {
    const batches = tasks.filter(item => item.source);
    const importedMaterials = batches.reduce((sum, item) => sum + (item.source?.materials.length ?? 0), 0);
    const importedConfidence = batches.flatMap(item => item.source?.materials ?? []);
    const lowConfidence = importedConfidence.filter(item => item.confidence < 75).length;
    const avgConfidence = importedConfidence.length
      ? Math.round(importedConfidence.reduce((sum, item) => sum + item.confidence, 0) / importedConfidence.length)
      : null;
    const completed = tasks.reduce((sum, item) => sum + item.completed, 0);
    const total = tasks.reduce((sum, item) => sum + item.total, 0);
    return {
      batches: batches.length,
      importedMaterials,
      lowConfidence,
      avgConfidence,
      completed,
      total,
      percent: total ? Math.round((completed / total) * 100) : 0,
      running: tasks.filter(item => item.status === '进行中').length,
      waiting: tasks.filter(item => item.status === '待审核').length,
      finished: tasks.filter(item => item.status === '已完成').length,
      overdue: tasks.filter(item => item.status === '已逾期').length
    };
  }, [tasks]);

  /* ------------------------------ 物料映射 ------------------------------ */
  const mapStat = useMemo(() => {
    const overall = overallStats(mapping);
    const handled = overall.done + overall.newMaterial;
    return {
      ...overall,
      handled,
      coverage: overall.items ? Math.round((handled / overall.items) * 100) : 0,
      /** 既没确认也没标新物料的清单项，就是「还没人认过」的 */
      unhandled: overall.items - handled
    };
  }, [mapping]);

  /* ------------------------------ 最近一次询价 ------------------------------ */
  // 询价结果单独存在 `ampg:inquiry:v1`，这里只读一次做汇总（切页回来会重新读）
  const [inquiryRows] = useState(() => loadInquiry()?.rows ?? []);
  const inquiryStat = useMemo(() => {
    if (!inquiryRows.length) return null;
    const byCode = new Map<string, StandardMaterial>(standards.map(item => [item.code, item]));
    let matched = 0;
    let comparable = 0;
    let high = 0;
    let fair = 0;
    let low = 0;
    inquiryRows.forEach(row => {
      const standard = row.code ? byCode.get(row.code) : undefined;
      if (!standard) return;
      matched += 1;
      if (!row.quote) return;
      const unit = refPriceOf(standard.code).unit;
      // 单位对不上的行不参与贵 / 便宜判定（米 vs 吨），与询价页口径一致
      if (row.unit && unit && !sameUnit(row.unit, unit)) return;
      const profile = priceProfileOf(
        {
          key: standard.code,
          code: standard.code,
          name: standard.name,
          spec: '',
          attrs: standard.attributes,
          unit,
          category: standard.category
        },
        emptyFilter
      );
      comparable += 1;
      const verdict = verdictOf(row.quote, profile);
      if (verdict === 'high' || verdict === 'slightly-high') high += 1;
      else if (verdict === 'low' || verdict === 'slightly-low') low += 1;
      else fair += 1;
    });
    return { total: inquiryRows.length, matched, comparable, high, fair, low, unmatched: inquiryRows.length - matched };
  }, [inquiryRows, standards]);

  /* ------------------------------ 闭环七步 ------------------------------ */
  const stages: Stage[] = [
    {
      key: 'import',
      label: '数据接入清洗',
      target: 'import',
      icon: <ApiOutlined />,
      value: String(taskStat.batches),
      unit: '个批次',
      note: taskStat.batches
        ? `${taskStat.importedMaterials} 条物料待治理${
            taskStat.avgConfidence !== null ? ` · 拆解置信度 ${taskStat.avgConfidence}%` : ''
          }${taskStat.lowConfidence ? ` · 低置信度 ${taskStat.lowConfidence} 条` : ''}`
        : '还没接入数据，从一个 Excel / 合同开始',
      state: taskStat.batches ? (taskStat.lowConfidence ? 'attention' : 'ok') : 'todo',
      stateText: taskStat.batches ? (taskStat.lowConfidence ? '含低置信度' : '已接入') : '待接入'
    },
    {
      key: 'tasks',
      label: '专家任务',
      target: 'tasks',
      icon: <TeamOutlined />,
      value: String(tasks.length),
      unit: '个任务',
      note: `${taskStat.running} 进行中 · ${taskStat.finished} 已完成 · ${taskStat.overdue} 逾期`,
      state: taskStat.overdue ? 'attention' : taskStat.running ? 'doing' : 'ok',
      stateText: taskStat.overdue ? '有逾期' : taskStat.running ? '在推进' : '按计划'
    },
    {
      key: 'governance',
      label: '专家组装',
      target: 'governance',
      icon: <ToolOutlined />,
      value: `${taskStat.percent}%`,
      unit: '已组装',
      note: `${fmt(taskStat.completed)} / ${fmt(taskStat.total)} 条物料`,
      state: taskStat.percent >= 100 ? 'ok' : 'doing',
      stateText: taskStat.percent >= 100 ? '已全部组装' : '组装中'
    },
    {
      key: 'review',
      label: '运营入库审核',
      target: 'review',
      icon: <AuditOutlined />,
      value: String(subStat.pending),
      unit: '条待审核',
      note: `新增建档 ${subStat.pendingNew} · 修改已有 ${subStat.pendingUpdate} · 驳回 ${subStat.rejected}`,
      state: subStat.pending ? 'attention' : 'ok',
      stateText: subStat.pending ? '待处理' : '已清空'
    },
    {
      key: 'standards',
      label: '标准物料库',
      target: 'standards',
      icon: <DatabaseOutlined />,
      value: fmt(stdStat.count),
      unit: '条物料',
      note: `${stdStat.created} 条本次治理新增 · ${stdStat.leafCount} 个末级品类`,
      state: stdStat.count ? 'ok' : 'todo',
      stateText: stdStat.count ? '已生效' : '空库'
    },
    {
      key: 'apply',
      label: '采购与映射应用',
      target: 'material-mapping',
      icon: <FileSearchOutlined />,
      value: `${mapStat.coverage}%`,
      unit: '清单已映射',
      note: `${mapStat.reusable} 条历史价已归集 · ${wanText(mapStat.amount)}`,
      state: mapStat.coverage >= 60 ? 'ok' : mapStat.handled ? 'doing' : 'todo',
      stateText: mapStat.coverage >= 60 ? '历史价可复用' : mapStat.handled ? '映射中' : '待映射'
    },
    {
      key: 'inquiry',
      label: '智能询价',
      target: 'inquiry',
      icon: <ThunderboltFilled />,
      value: inquiryStat ? `${inquiryStat.matched}/${inquiryStat.total}` : '—',
      unit: inquiryStat ? '条已匹配' : '未发起',
      note: inquiryStat
        ? `高于参考区间 ${inquiryStat.high} 条 · 合理 ${inquiryStat.fair} 条 · 偏低 ${inquiryStat.low} 条`
        : '贴清单或上传报价表，按历史成交区间判断贵不贵',
      state: inquiryStat ? 'ok' : 'todo',
      stateText: inquiryStat ? '已出结论' : '待询价'
    }
  ];
  /** 闭环头部只报两件关心的事：还有几步没启动、几步有积压（0 积压就是链路通） */
  const stageTodo = stages.filter(item => item.state === 'todo').length;
  const stageBlocked = stages.filter(item => item.state === 'attention').length;

  /* ------------------------------ 下一步建议 ------------------------------ */
  const nextAction = useMemo(() => {
    if (subStat.pending) {
      return {
        page: 'review' as PageKey,
        title: `${subStat.pending} 条组装结果卡在入库审核`,
        desc: `其中新增建档 ${subStat.pendingNew} 条、修改已有 ${subStat.pendingUpdate} 条。审核通过才会真正写进标准物料库，越早过审，采购清单与询价越早用得上。`,
        cta: '去审核'
      };
    }
    if (subStat.rejected) {
      return {
        page: 'governance' as PageKey,
        title: `${subStat.rejected} 条组装结果被驳回，等专家改完重提`,
        desc: '驳回意见已随提交单退回工作台，专家补全属性值后重新提交，会累加在同一张提交单的版本上，不会产生新单。',
        cta: '去治理工作台'
      };
    }
    if (!taskStat.batches) {
      return {
        page: 'import' as PageKey,
        title: '闭环还没开始：先接入一批数据',
        desc: '上传 Excel / CSV / PDF，AI 完成字段映射与规格原子拆解后生成治理任务，后面几步才有数据可走。',
        cta: '接入数据'
      };
    }
    if (mapStat.unhandled) {
      return {
        page: 'material-mapping' as PageKey,
        title: `${mapStat.unhandled} 条历史清单还没认到标准物料上`,
        desc: `已确认 ${mapStat.done} 条、待复核 ${mapStat.pending} 条、转治理 ${mapStat.newMaterial} 条。映射完成后这些历史成交价才能按标准口径被价格分析与询价复用。`,
        cta: '去物料映射'
      };
    }
    if (!inquiryStat) {
      return {
        page: 'inquiry' as PageKey,
        title: '链路已跑通，去询价看看效果',
        desc: '贴一段清单或上传供应商报价表，系统按历史成交区间判断报价贵不贵；未匹配的条目会自动回流治理。',
        cta: '发起智能询价'
      };
    }
    return {
      page: 'standards' as PageKey,
      title: '闭环畅通：标准库与历史价都在持续沉淀',
      desc: `当前 ${stdStat.count} 条标准物料、${mapStat.reusable} 条可复用历史价。可以继续接入新的历史清单，扩大标准口径的覆盖。`,
      cta: '看标准物料库'
    };
  }, [subStat, taskStat.batches, mapStat, inquiryStat, stdStat.count]);

  /** 卡点四格：按「会不会挡住下一步」排序，0 的置灰但仍可点进去看 */
  const blockers: Array<{ label: string; count: number; page: PageKey; hint: string }> = [
    { label: '待审核提交', count: subStat.pending, page: 'review', hint: '审核通过才写库' },
    { label: '驳回待重提', count: subStat.rejected, page: 'governance', hint: '退回专家修改' },
    { label: '逾期任务', count: taskStat.overdue, page: 'tasks', hint: '已过截止日期' },
    { label: '未映射清单', count: mapStat.unhandled, page: 'material-mapping', hint: '历史价接不进来' }
  ];

  /* ------------------------------ 审计动态 ------------------------------ */
  const logs = useMemo(() => {
    const list: Array<{ key: string; time: string; tone: string; title: string; desc: string }> = [];
    submissions.forEach(item => {
      list.push({
        key: `${item.key}-submit`,
        time: item.submittedAt,
        tone: 'is-submit',
        title: `${item.submitter} 提交${item.changeType === 'update' ? '「修改已有」' : '「新增建档」'}：${item.name}`,
        desc: `来源「${item.sourceName}」· 第 ${item.attempt} 版 · ${item.atoms.length} 条属性${
          item.synonyms.length ? ` · ${item.synonyms.length} 条历史叫法` : ''
        }`
      });
      if (item.reviewedAt) {
        const passed = item.status === '已通过';
        list.push({
          key: `${item.key}-review`,
          time: item.reviewedAt,
          tone: passed ? 'is-pass' : 'is-reject',
          title: passed
            ? `${item.reviewer ?? '审核专家'} 审核通过，写入 ${item.standardCode ?? '标准物料库'}`
            : `${item.reviewer ?? '审核专家'} 驳回并退回修改`,
          desc: passed
            ? item.changeType === 'update'
              ? `合并 ${item.changes.length} 项变更进 ${item.targetStandardCode ?? '原标准物料'}`
              : `新建标准物料 ${item.standardCode ?? ''}`
            : item.comment ?? '未填写驳回意见'
        });
      }
    });
    // 时间是 `YYYY-MM-DD HH:mm` 定长字符串，字典序即时间序
    return list.sort((a, b) => (a.time < b.time ? 1 : -1)).slice(0, 6);
  }, [submissions]);

  /* ------------------------------ 任务表 ------------------------------ */
  const waitingOf = (taskKey: string) =>
    submissions.filter(item => item.taskKey === taskKey && item.status === '待审核').length;

  const taskColumns = [
    {
      title: '治理任务',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (value: string, record: GovernanceTask) => (
        <div className="ov-task-cell">
          <div className="ov-task-name">
            {value}
            {record.source && <Tag color="blue">导入</Tag>}
          </div>
          <div className="ov-task-sub">
            {record.category} · {record.bureau} · {record.assignee}
          </div>
        </div>
      )
    },
    {
      title: '来源',
      key: 'source',
      width: 150,
      render: (_: unknown, record: GovernanceTask) =>
        record.source ? (
          <div className="ov-task-cell">
            <div className="ov-task-sub is-file">{record.source.fileName || '文本录入'}</div>
            <div className="ov-task-sub">{record.source.materials.length} 条物料</div>
          </div>
        ) : (
          <span className="ov-muted">手工创建</span>
        )
    },
    {
      title: '进度',
      key: 'progress',
      width: 132,
      render: (_: unknown, record: GovernanceTask) => (
        <div>
          <Progress
            percent={record.total ? Math.round((record.completed / record.total) * 100) : 0}
            size="small"
            status={record.status === '已逾期' ? 'exception' : record.status === '已完成' ? 'success' : 'active'}
          />
          <div className="ov-task-sub">
            {fmt(record.completed)} / {fmt(record.total)} 条
          </div>
        </div>
      )
    },
    {
      title: '待审核',
      key: 'waiting',
      width: 62,
      render: (_: unknown, record: GovernanceTask) =>
        waitingOf(record.key) ? (
          <span className="ov-warn-text">{waitingOf(record.key)} 条</span>
        ) : (
          <span className="ov-muted">—</span>
        )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 78,
      render: (value: string) => (
        <Tag color={value === '已完成' ? 'success' : value === '已逾期' ? 'error' : value === '待审核' ? 'gold' : 'processing'}>
          {value}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 88,
      fixed: 'right' as const,
      render: (_: unknown, record: GovernanceTask) =>
        record.status === '已完成' ? (
          <Button type="link" size="small" onClick={() => setPage('standards')}>看成果</Button>
        ) : record.status === '待审核' ? (
          <Button type="link" size="small" onClick={() => setPage('review')}>去审核</Button>
        ) : (
          <Button type="link" size="small" onClick={() => openTask(record.key)}>
            {record.source ? '继续治理' : '去处理'}
          </Button>
        )
    }
  ];

  const maxGroup = Math.max(1, ...stdStat.groups.map(([, count]) => count));
  const priceMax = Math.max(priceStat.contract, priceStat.bid, 1);

  return <>
    <PageHeader
      title="治理总览"
      subtitle="数据接进来 → 专家组装 → 运营审核 → 沉淀标准库 → 业务用起来，七步闭环的实时状态、卡点与下一步都在这里"
      action={
        <Space>
          <Button onClick={() => setPage('standards')}>标准物料库</Button>
          <Button type="primary" icon={<ArrowRightOutlined />} onClick={() => setPage(nextAction.page)}>
            {nextAction.cta}
          </Button>
        </Space>
      }
    />

    <div className="ov-kpi-grid">
      <Kpi
        title="标准物料"
        value={fmt(stdStat.count)}
        unit="条"
        page="standards"
        note={<>
          <div><span className="ov-good">本次治理新增 {stdStat.created} 条</span></div>
          <div>覆盖 {stdStat.leafCount} 个末级品类</div>
        </>}
      />
      <Kpi
        title="历史价格记录"
        value={fmt(priceStat.total)}
        unit="条"
        page="analysis"
        note={<>
          <div>合同 {priceStat.contract} 条 · 招标清单 {priceStat.bid} 条</div>
          <div>覆盖 {priceStat.covered} 条标准物料</div>
        </>}
      />
      <Kpi
        title="治理队列"
        value={fmt(pendingCount)}
        unit="条"
        page="governance"
        tone={subStat.pending ? 'warn' : undefined}
        note={<>
          <div>{taskStat.batches ? `本次导入 ${taskStat.importedMaterials} 条待组装` : '接入数据后自动入队'}</div>
          <div><span className="ov-warn-text">待审核 {subStat.pending} 条</span> · 驳回 {subStat.rejected} 条</div>
        </>}
      />
      <Kpi
        title="历史价复用率"
        value={`${mapStat.coverage}`}
        unit="%"
        page="material-mapping"
        note={<>
          <div>已确认 {mapStat.done}/{mapStat.items} 条清单项</div>
          <div>待复核 {mapStat.pending} · 转治理 {mapStat.newMaterial}</div>
        </>}
      />
      <Kpi
        title="最近一次询价"
        value={inquiryStat ? `${inquiryStat.matched}/${inquiryStat.total}` : '—'}
        unit={inquiryStat ? '条匹配' : '未询价'}
        page="inquiry"
        note={inquiryStat ? (
          <>
            <div>高于参考区间 {inquiryStat.high} 条</div>
            <div>合理 {inquiryStat.fair} · 偏低 {inquiryStat.low} · 未匹配 {inquiryStat.unmatched}</div>
          </>
        ) : (
          <>
            <div>贴清单或上传报价表</div>
            <div>按历史成交区间判定贵不贵</div>
          </>
        )}
      />
    </div>

    <Surface
      title={<Space size={6}><NodeIndexOutlined />治理闭环</Space>}
      extra={
        <Space size={14}>
          <span className="ov-flow-hint">橙色 = 这一步有积压，点击可直接进入</span>
          <Badge
            status={stageBlocked ? 'warning' : 'processing'}
            text={`待启动 ${stageTodo} 步 · 积压 ${stageBlocked} 步`}
          />
        </Space>
      }
      style={{ marginBottom: 14 }}
    >
      <div className="ov-flow">
        {stages.map((stage, index) => (
          <div
            key={stage.key}
            className={`ov-step ${stateClass[stage.state]}`}
            onClick={() => setPage(stage.target)}
            title={`${stage.label}：${stage.note}`}
          >
            <div className="ov-step-top">
              <span className="ov-step-num">{index + 1}</span>
              <span className="ov-step-state">{stage.stateText}</span>
            </div>
            <div className="ov-step-label">{stage.icon}{stage.label}</div>
            <div className="ov-step-value">
              {stage.value}
              <span className="ov-step-unit">{stage.unit}</span>
            </div>
            <div className="ov-step-note">{stage.note}</div>
          </div>
        ))}
      </div>
    </Surface>

    <Surface className="ov-next" style={{ marginBottom: 14 }}>
      <div className="ov-next-main">
        <span className="ov-next-badge"><ThunderboltFilled /></span>
        <div className="ov-next-text">
          <div className="ov-next-label">下一步建议</div>
          <div className="ov-next-title">{nextAction.title}</div>
          <div className="ov-next-desc">{nextAction.desc}</div>
        </div>
        <Button type="primary" onClick={() => setPage(nextAction.page)}>
          {nextAction.cta} <ArrowRightOutlined />
        </Button>
      </div>
      <div className="ov-blockers">
        {blockers.map(item => (
          <div
            key={item.label}
            className={`ov-blocker${item.count ? ' is-on' : ''}`}
            onClick={() => setPage(item.page)}
          >
            <div className="ov-blocker-count">{item.count}</div>
            <div className="ov-blocker-label">{item.label}</div>
            <div className="ov-blocker-hint">{item.hint}</div>
          </div>
        ))}
      </div>
    </Surface>

    <div className="pg-two-column">
      <Surface
        title="治理任务与进度"
        extra={<Button type="link" onClick={() => setPage('tasks')}>全部任务 <ArrowRightOutlined /></Button>}
      >
        <Table
          dataSource={tasks}
          columns={taskColumns}
          rowKey="key"
          size="small"
          pagination={false}
          scroll={{ x: 760 }}
        />
      </Surface>

      <Surface
        title="最近动态"
        extra={<span className="ov-flow-hint">提交与审核的审计链路</span>}
      >
        {logs.length ? (
          <div className="ov-log">
            {logs.map(item => (
              <div className="ov-log-row" key={item.key}>
                <span className={`ov-log-dot ${item.tone}`} />
                <div className="ov-log-body">
                  <div className="ov-log-title">{item.title}</div>
                  <div className="ov-log-desc">{item.desc}</div>
                </div>
                <span className="ov-log-time">{item.time.slice(5)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="ov-empty">
            还没有提交 / 审核记录。
            <br />
            去治理工作台组装第一件商品，这里会留下完整的操作轨迹。
            <div style={{ marginTop: 12 }}>
              <Button size="small" type="primary" onClick={() => setPage('governance')}>去治理工作台</Button>
            </div>
          </div>
        )}
      </Surface>
    </div>

    <div className="ov-three-grid">
      <Surface
        title="标准库品类构成"
        extra={<span className="ov-flow-hint">{stdStat.groups.length} 个品类组 · {stdStat.leafCount} 个末级品类</span>}
      >
        <div className="ov-bars">
          {stdStat.groups.length ? stdStat.groups.slice(0, 6).map(([label, count]) => (
            <div className="ov-bar-row" key={label}>
              <span className="ov-bar-label">{label}</span>
              <span className="ov-bar-track">
                <span className="ov-bar-fill" style={{ width: `${Math.round((count / maxGroup) * 100)}%` }} />
              </span>
              <span className="ov-bar-count">{count}</span>
            </div>
          )) : <div className="ov-empty">标准物料库还是空的</div>}
        </div>
        <div className="ov-foot-hint">
          按品类路径的中间一级分组{stdStat.groups.length > 6 ? `，这里只列前 6 个（共 ${stdStat.groups.length} 个）` : ''}；
          审核通过的标准物料会实时出现在这里。
        </div>
      </Surface>

      <Surface title="历史价格构成" extra={<span className="ov-flow-hint">共 {priceStat.total} 条</span>}>
        <div className="ov-bar-row">
          <span className="ov-bar-label">合同</span>
          <span className="ov-bar-track">
            <span className="ov-bar-fill is-contract" style={{ width: `${Math.round((priceStat.contract / priceMax) * 100)}%` }} />
          </span>
          <span className="ov-bar-count">{priceStat.contract}</span>
        </div>
        <div className="ov-bar-row">
          <span className="ov-bar-label">招标清单</span>
          <span className="ov-bar-track">
            <span className="ov-bar-fill is-bid" style={{ width: `${Math.round((priceStat.bid / priceMax) * 100)}%` }} />
          </span>
          <span className="ov-bar-count">{priceStat.bid}</span>
        </div>
        <div className="ov-mini-grid is-three">
          <div className="ov-mini"><span className="ov-mini-label">高置信 ≥90</span><span className="ov-mini-value is-good">{priceStat.high}</span></div>
          <div className="ov-mini"><span className="ov-mini-label">中 75~89</span><span className="ov-mini-value is-warn">{priceStat.mid}</span></div>
          <div className="ov-mini"><span className="ov-mini-label">低 &lt;75</span><span className="ov-mini-value is-bad">{priceStat.low}</span></div>
        </div>
        <div className="ov-foot-hint">
          价格来源优先级：合同 &gt; 招标清单。
          {priceStat.risky > 0 && <> <b className="ov-warn-text">{priceStat.risky} 条低置信度 / 异常价格</b>需人工复核，不能直接进参考价。</>}
        </div>
      </Surface>

      <Surface title="闭环产出" extra={<span className="ov-flow-hint">历史价 → 标准口径</span>}>
        <div className="ov-mini-grid is-three">
          <div className="ov-mini"><span className="ov-mini-label">可复用历史价</span><span className="ov-mini-value is-good">{mapStat.reusable}</span></div>
          <div className="ov-mini"><span className="ov-mini-label">已归集金额</span><span className="ov-mini-value">{wanText(mapStat.amount)}</span></div>
          <div className="ov-mini"><span className="ov-mini-label">招标项目</span><span className="ov-mini-value">{mapStat.projects}</span></div>
        </div>
        <div className="ov-bar-row">
          <span className="ov-bar-label">映射覆盖</span>
          <span className="ov-bar-track">
            <span className="ov-bar-fill is-coverage" style={{ width: `${mapStat.coverage}%` }} />
          </span>
          <span className="ov-bar-count">{mapStat.coverage}%</span>
        </div>
        <div className="ov-foot-hint">
          询价结论：
          {inquiryStat
            ? `最近 ${inquiryStat.total} 行中匹配 ${inquiryStat.matched} 行，高于参考区间 ${inquiryStat.high} 条、合理 ${inquiryStat.fair} 条、偏低 ${inquiryStat.low} 条${
                inquiryStat.unmatched ? `；另有 ${inquiryStat.unmatched} 行未匹配，可在询价页一键回流治理` : ''
              }。`
            : '尚未发起询价，去智能询价贴一段清单即可看到判定。'}
        </div>
      </Surface>
    </div>
  </>;
};
