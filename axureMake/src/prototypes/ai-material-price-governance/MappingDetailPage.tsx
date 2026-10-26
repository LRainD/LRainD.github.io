/**
 * 清单映射工作台（隐藏页 `mapping-detail`，从招标列表点「映射」进来）。
 *
 * 交互设计的三条原则：
 * 1. **先给结果，再让人改**：进来就把能匹配的项自动预映射好、规格型号也解析好，单据不是一张空表；
 * 2. **推荐要能解释**：每个候选都给出匹配度、逐条属性对照（一致 / 有差异 / 标准未登记）、历史价格水位，
 *    经办人看得懂「为什么推荐它」，才敢点确认；
 * 3. **一对多要看得见**：同一件标准物料被几条历史写法映射过，面板里直接列出来，
 *    提醒经办人这不是重复建档，而是同一件商品的多种叫法。
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Input, Modal, Segmented, Space, Table, Tag, Tooltip, message } from 'antd';
import {
  ArrowLeftOutlined,
  BranchesOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  ExperimentOutlined,
  LinkOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { useDemo } from './context';
import { PageHeader, Surface } from './shared';
import {
  AUTO_MAP_THRESHOLD,
  allBidItems,
  autoMapProject,
  bidProjects,
  buildMapping,
  buildNewMaterialMapping,
  projectStats,
  recommendStandards,
  statusOf,
  statusText,
  type BidItem,
  type BidProject,
  type MappingCandidate,
  type MappingRecord,
  type MappingStatus
} from './mapping';

const money = (value: number, digits = 0) =>
  value.toLocaleString('zh-CN', { minimumFractionDigits: digits, maximumFractionDigits: digits });

const today = () => {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const STATUS_COLOR: Record<MappingStatus, string> = {
  todo: 'default',
  pending: 'processing',
  done: 'success',
  new: 'purple'
};

const StatusTag: React.FC<{ status: MappingStatus }> = ({ status }) => (
  <Tag color={STATUS_COLOR[status]} className={`mpd-status is-${status}`}>
    {statusText[status]}
  </Tag>
);

/** 匹配度用颜色分档，跟治理台的置信度口径一致 */
const scoreClass = (score: number) => (score >= 85 ? 'is-high' : score >= AUTO_MAP_THRESHOLD ? 'is-mid' : 'is-low');

const CompareRow: React.FC<{ row: MappingCandidate['compare'][number] }> = ({ row }) => (
  <div className={`mpd-cmp is-${row.state}`}>
    <span className="mpd-cmp-label">{row.label}</span>
    <span className="mpd-cmp-mine">{row.mine || '—'}</span>
    <span className="mpd-cmp-arrow">→</span>
    <span className="mpd-cmp-theirs">{row.theirs || '待补'}</span>
  </div>
);

export const MappingDetailPage: React.FC = () => {
  const { standards, prices, mapping, applyMapping, clearMapping, activeBidKey, setPage } = useDemo();

  const project: BidProject = useMemo(
    () => bidProjects.find(item => item.key === activeBidKey) ?? bidProjects[0],
    [activeBidKey]
  );

  const [selectedKey, setSelectedKey] = useState(project.items[0]?.key ?? '');
  const [filter, setFilter] = useState<'all' | 'todo' | 'pending' | 'done'>('all');
  const [keyword, setKeyword] = useState('');
  const [checked, setChecked] = useState<string[]>([]);
  const autoRef = useRef('');

  const stats = projectStats(project, mapping);

  /**
   * 第一次进某个项目的清单，就把能匹配的项自动映射好（不直接确认）。
   * 这是「系统默认帮你映射上，但最终由经办人拍板」的落点：
   * 进来看到的是一张有结果的单子，而不是 50 行空待办。
   */
  useEffect(() => {
    if (autoRef.current === project.key) return;
    autoRef.current = project.key;
    if (project.items.some(item => mapping[item.key])) return;
    const records = autoMapProject(project, standards, prices);
    if (!records.length) return;
    applyMapping(records);
    message.info(`已按历史叫法与规格属性预映射 ${records.length} 条，逐条复核后提交`);
    // 只在切项目时跑一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.key]);

  /** 当项目切换（比如从列表点了另一个项目）时，选中项跟着切回第一条 */
  useEffect(() => {
    setSelectedKey(project.items[0]?.key ?? '');
    setChecked([]);
    setFilter('all');
    setKeyword('');
  }, [project.key]);

  const rows = useMemo(() => {
    const text = keyword.trim();
    return project.items
      .filter(item => {
        const status = statusOf(mapping[item.key]);
        if (filter === 'todo' && status !== 'todo') return false;
        if (filter === 'pending' && status !== 'pending') return false;
        if (filter === 'done' && status !== 'done' && status !== 'new') return false;
        if (!text) return true;
        return `${item.raw}${item.name}${item.spec}`.includes(text);
      })
      // 保持清单原有顺序：「第几条」是经办人和纸质清单对账的锚点，不按状态打乱
      .sort((a, b) => a.idx - b.idx);
  }, [project, mapping, filter, keyword]);

  /** 最优候选：列表里直接显示匹配度，不用逐条点开看 */
  const bestOf = useMemo(() => {
    const map: Record<string, MappingCandidate | undefined> = {};
    project.items.forEach(item => {
      map[item.key] = recommendStandards(item, standards, prices, mapping)[0];
    });
    return map;
  }, [project, standards, prices, mapping]);

  const selected: BidItem = project.items.find(item => item.key === selectedKey) ?? project.items[0];
  const record: MappingRecord | undefined = selected ? mapping[selected.key] : undefined;
  const status = statusOf(record);
  const candidates = useMemo(
    () => (selected ? recommendStandards(selected, standards, prices, mapping) : []),
    [selected, standards, prices, mapping]
  );
  const chosenStandard = record?.standardKey
    ? standards.find(item => item.key === record.standardKey) ?? null
    : null;

  /** 同一标准物料还被哪些历史写法映射过（一对多） */
  const linked = useMemo(() => {
    if (!record?.standardKey) return [];
    return allBidItems.filter(
      other => other.key !== selected.key && mapping[other.key]?.standardKey === record.standardKey
    );
  }, [record?.standardKey, mapping, selected.key]);

  const patchRecord = (patch: Partial<MappingRecord>) => {
    if (!record || !selected) return;
    applyMapping([{ itemKey: selected.key, record: { ...record, ...patch, updatedAt: today() } }]);
  };

  /** 选一个标准：规格型号按该标准重新带出 + 解析出来的补充项，回到「待复核」 */
  const chooseCandidate = (candidate: MappingCandidate) => {
    const standard = standards.find(item => item.key === candidate.key);
    if (!standard || !selected) return;
    if (record?.standardKey === standard.key && record?.confirmed) {
      message.info(`当前已确认映射到 ${standard.code}，如需改值直接改规格型号即可`);
      return;
    }
    applyMapping([
      {
        itemKey: selected.key,
        record: buildMapping(selected, standard, { by: 'manual', confirmed: false })
      }
    ]);
    message.success(`已映射到 ${standard.code}，规格型号已带出，可继续补充或改值`);
  };

  const confirmItem = () => {
    if (!record || !selected) {
      message.warning('先选一个标准物料（或标记为新物料）再确认');
      return;
    }
    if (record.standardKey) {
      const empty = record.attributes.filter(row => !row.label.trim() || !row.value.trim());
      if (!record.attributes.length) {
        message.warning('规格型号不能为空：映射后要补进标准物料，至少保留一条');
        return;
      }
      if (empty.length) {
        message.warning(`有 ${empty.length} 条规格型号没填完整，补全或删除后再确认`);
        return;
      }
    }
    applyMapping([{ itemKey: selected.key, record: { ...record, confirmed: true, updatedAt: today() } }]);
    // 确认后自动落到下一条还没处理的，连续处理不用来回点
    const next = project.items.find(item => {
      if (item.key === selected.key) return false;
      const state = statusOf(mapping[item.key]);
      return state === 'todo' || state === 'pending';
    });
    if (next) setSelectedKey(next.key);
    message.success(
      record.standardKey
        ? `已确认映射，这条历史成交价将按 ${chosenStandard?.code ?? '标准'} 口径复用${next ? '；已切到下一条' : ''}`
        : '已标记为新物料，提交映射后会生成治理建档任务'
    );
  };

  const markAsNew = () => {
    if (!selected) return;
    applyMapping([{ itemKey: selected.key, record: buildNewMaterialMapping(selected) }]);
    message.success('已标记为新物料：规格型号按解析结果带出，提交后可转治理建档');
  };

  /** 一键预映射：只补还没有映射结果的项，已映射的（尤其人工改过的）不覆盖 */
  const runAutoMap = () => {
    const records = autoMapProject(project, standards, prices, { onlyMissing: mapping });
    if (!records.length) {
      message.info('没有新的可自动映射项：未映射的都没达到推荐门槛，建议手工判定或转治理建档');
      return;
    }
    applyMapping(records);
    message.success(`已自动预映射 ${records.length} 条（待复核），可逐条检查`);
  };

  const bulkKeys = checked.length ? checked : rows.filter(item => statusOf(mapping[item.key]) === 'todo').map(item => item.key);

  /** 批量采纳推荐：勾了几条就处理几条；一条没勾则处理当前筛选下所有未映射的 */
  const adoptRecommended = () => {
    const records: Array<{ itemKey: string; record: MappingRecord }> = [];
    let skipped = 0;
    bulkKeys.forEach(itemKey => {
      if (mapping[itemKey]) return;
      const item = project.items.find(row => row.key === itemKey);
      if (!item) return;
      const best = recommendStandards(item, standards, prices, mapping)[0];
      const standard = best ? standards.find(std => std.key === best.key) : undefined;
      if (!best || !standard || best.score < AUTO_MAP_THRESHOLD) {
        skipped += 1;
        return;
      }
      records.push({ itemKey, record: buildMapping(item, standard, { by: 'ai', confirmed: false }) });
    });
    if (!records.length) {
      message.warning('选中项没有达到推荐门槛的候选，建议手工指定或标记为新物料');
      return;
    }
    applyMapping(records);
    setChecked([]);
    message.success(`已采纳推荐映射 ${records.length} 条${skipped ? `，${skipped} 条无合适候选` : ''}，请复核确认`);
  };

  const bulkConfirm = () => {
    const records = checked
      .filter(itemKey => mapping[itemKey]?.standardKey)
      .map(itemKey => ({
        itemKey,
        // 提交时把没填完的规格型号行剔掉，而不是让整条映射卡住
        record: {
          ...mapping[itemKey],
          attributes: mapping[itemKey].attributes.filter(row => row.label.trim() && row.value.trim()),
          confirmed: true,
          updatedAt: today()
        }
      }));
    if (!records.length) {
      message.warning('勾选的清单项里没有可确认的映射（未映射或已标记新物料）');
      return;
    }
    applyMapping(records);
    setChecked([]);
    message.success(`已确认 ${records.length} 条映射`);
  };

  const submit = () => {
    const pendingItems = project.items.filter(item => mapping[item.key] && !mapping[item.key].confirmed);
    const todoItems = project.items.filter(item => !mapping[item.key]);
    if (!pendingItems.length && stats.done + stats.newMaterial === 0) {
      message.warning('当前还没有任何映射结果，先「一键预映射」或手工指定标准物料');
      return;
    }
    Modal.confirm({
      title: '提交本次映射结果？',
      okText: '提交映射结果',
      cancelText: '再看看',
      content: (
        <div className="mpd-confirm-body">
          <p>
            将确认 <b>{pendingItems.length}</b> 条待复核映射；另有 <b>{todoItems.length}</b> 条仍未映射，会保留在待处理里。
          </p>
          <p className="mpd-confirm-hint">
            确认后这些历史成交价归入标准物料口径：价格分析可按标准物料看历史走势，智能询价也能用它们判断报价高低。
          </p>
        </div>
      ),
      onOk: () => {
        if (pendingItems.length) {
          applyMapping(
            pendingItems.map(item => ({
              itemKey: item.key,
              record: {
                ...mapping[item.key],
                attributes: mapping[item.key].attributes.filter(row => row.label.trim() && row.value.trim()),
                confirmed: true,
                updatedAt: today()
              }
            }))
          );
        }
        message.success(
          `已提交 ${stats.done + stats.newMaterial + pendingItems.length} 条映射，${project.code} 的历史成交价开始按标准口径复用`
        );
        setPage('material-mapping');
      }
    });
  };

  const columns = [
    {
      title: '#',
      key: 'idx',
      width: 48,
      render: (_: unknown, item: BidItem) => <span className="mpd-idx">{item.idx}</span>
    },
    {
      title: '商品名称',
      key: 'name',
      width: 128,
      render: (_: unknown, item: BidItem) => (
        <Tooltip title={`历史原文：${item.raw}`} mouseEnterDelay={0.4}>
          <div className="mpd-name">{item.name}</div>
        </Tooltip>
      )
    },
    {
      // 历史规格型号本来就是一段自由文本，各家写法不一；结构化是映射这一步的产物，不在列表里假装历史数据是干净的
      title: '规格型号',
      key: 'spec',
      render: (_: unknown, item: BidItem) =>
        item.spec ? <div className="mpd-spec">{item.spec}</div> : <span className="mpd-spec-empty">未写规格</span>
    },
    {
      title: '历史单价',
      key: 'price',
      width: 92,
      align: 'right' as const,
      render: (_: unknown, item: BidItem) => (
        <div className="mpd-price">
          <div>¥{money(item.unitPrice, 2)}</div>
          <div className="mpd-price-unit">元/{item.unit}</div>
        </div>
      )
    },
    {
      title: '映射到标准物料',
      key: 'target',
      width: 184,
      render: (_: unknown, item: BidItem) => {
        const row = mapping[item.key];
        const standard = row?.standardKey ? standards.find(std => std.key === row.standardKey) : undefined;
        if (standard) {
          return (
            <div className="mpd-target">
              <div className="mpd-target-name" title={standard.name}>
                {standard.name}
              </div>
              <div className="mpd-target-code">{standard.code}</div>
            </div>
          );
        }
        if (row?.by === 'new') {
          return (
            <div className="mpd-target">
              <div className="mpd-target-new">标记为新物料</div>
              <div className="mpd-target-code">提交后转治理建档</div>
            </div>
          );
        }
        return (
          <div className="mpd-target">
            <div className="mpd-target-empty">未映射</div>
            <div className="mpd-target-code">
              {bestOf[item.key] ? `推荐 ${bestOf[item.key]!.code}（${bestOf[item.key]!.score}%）` : '标准库无相近物料'}
            </div>
          </div>
        );
      }
    },
    {
      title: '匹配度',
      key: 'score',
      width: 68,
      align: 'right' as const,
      render: (_: unknown, item: BidItem) => {
        const row = mapping[item.key];
        const score = bestOf[item.key]?.score;
        if (row?.by === 'new') return <span className="mpd-score-inline is-new">新物料</span>;
        if (!score) return <span className="mpd-muted">—</span>;
        return <span className={`mpd-score-inline ${scoreClass(score)}`}>{score}%</span>;
      }
    },
    {
      title: '状态',
      key: 'status',
      width: 84,
      // 窄屏时表格要横滚，状态是判断「这条能不能提交」的关键，钉在右边常驻
      fixed: 'right' as const,
      render: (_: unknown, item: BidItem) => <StatusTag status={statusOf(mapping[item.key])} />
    }
  ];

  return (
    <>
      <PageHeader
        title={`清单映射 · ${project.code}`}
        subtitle={`${project.name}｜${project.bureau} · ${project.region} · ${project.type}`}
        action={
          <Space size={8}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => setPage('material-mapping')}>
              返回招标列表
            </Button>
            <Button type="primary" icon={<CheckCircleOutlined />} onClick={submit}>
              提交映射结果
            </Button>
          </Space>
        }
      />

      <div className="mpd-info">
        <div className="mpd-info-cell">
          <span>清单条数</span>
          <b>{stats.total}</b>
        </div>
        <div className="mpd-info-cell">
          <span>已确认映射</span>
          <b className="is-done">{stats.done}</b>
        </div>
        <div className="mpd-info-cell">
          <span>待复核</span>
          <b className="is-pending">{stats.pending}</b>
        </div>
        <div className="mpd-info-cell">
          <span>未映射</span>
          <b>{stats.todo}</b>
        </div>
        <div className="mpd-info-cell">
          <span>转治理建档</span>
          <b className="is-new">{stats.newMaterial}</b>
        </div>
        <div className="mpd-info-progress">
          <div className="mpd-info-progress-head">
            <span>映射覆盖</span>
            <b>{stats.total ? Math.round(((stats.done + stats.newMaterial) / stats.total) * 100) : 0}%</b>
          </div>
          <div className="mp-bar">
            <span className="mp-bar-done" style={{ width: `${stats.total ? Math.round((stats.done / stats.total) * 100) : 0}%` }} />
            <span
              className="mp-bar-pending"
              style={{ width: `${stats.total ? Math.round((stats.pending / stats.total) * 100) : 0}%` }}
            />
          </div>
          <div className="mpd-info-progress-foot">
            已归集历史成交价 {stats.reusable} 条 · {money(stats.amount)} 元
          </div>
        </div>
      </div>

      <div className="mpd-toolbar">
        <Segmented
          value={filter}
          onChange={value => setFilter(value as typeof filter)}
          options={[
            { label: `全部 ${stats.total}`, value: 'all' },
            { label: `未映射 ${stats.todo}`, value: 'todo' },
            { label: `待复核 ${stats.pending}`, value: 'pending' },
            { label: `已处理 ${stats.done + stats.newMaterial}`, value: 'done' }
          ]}
        />
        <Input
          prefix={<SearchOutlined />}
          className="pg-filter-search"
          value={keyword}
          onChange={event => setKeyword(event.target.value)}
          placeholder="搜索商品名称或规格型号"
          allowClear
          style={{ minWidth: 240 }}
        />
        <Space size={8} className="mpd-toolbar-actions">
          <Tooltip title="只补还没有映射结果的清单项，已人工改过的不覆盖">
            <Button icon={<ThunderboltOutlined />} onClick={runAutoMap}>
              一键预映射
            </Button>
          </Tooltip>
          <Button icon={<ReloadOutlined />} onClick={adoptRecommended}>
            批量采纳推荐
          </Button>
          <Button disabled={!checked.length} onClick={bulkConfirm}>
            批量确认{checked.length ? ` ${checked.length}` : ''}
          </Button>
        </Space>
      </div>

      <div className="mpd-layout">
        <Surface className="mpd-list">
          <Table
            className="mpd-table"
            dataSource={rows}
            columns={columns}
            rowKey="key"
            size="small"
            pagination={false}
            scroll={{ x: 860, y: 640 }}
            rowSelection={{
              selectedRowKeys: checked,
              onChange: keys => setChecked(keys as string[]),
              columnWidth: 36
            }}
            onRow={item => ({
              onClick: () => setSelectedKey(item.key)
            })}
            rowClassName={item =>
              [item.key === selected?.key ? 'is-selected' : '', statusOf(mapping[item.key]) === 'todo' ? 'is-todo' : '']
                .filter(Boolean)
                .join(' ')
            }
          />
        </Surface>

        <Surface className="mpd-panel">
          {selected ? (
            <>
              <div className="mpd-panel-head">
                <div className="mpd-panel-title">
                  <span className="mpd-panel-index">#{selected.idx}</span>
                  {selected.name}
                  <StatusTag status={status} />
                </div>
                <div className="mpd-panel-sub">
                  {selected.spec ? `规格型号 ${selected.spec} · ` : ''}
                  {money(selected.quantity)} {selected.unit} · 历史单价 ¥{money(selected.unitPrice, 2)}
                </div>
              </div>

              <div className="mpd-panel-body">
                <div className="mpd-block">
                  <div className="mpd-block-title">
                    系统解析出的规格属性
                    <span>{selected.atoms.length} 项</span>
                  </div>
                  {selected.atoms.length ? (
                    <div className="mpd-atoms">
                      {selected.atoms.map(atom => (
                        <Tag key={atom.label} className="mpd-atom">
                          {atom.label}：<b>{atom.value}</b>
                        </Tag>
                      ))}
                    </div>
                  ) : (
                    <div className="mpd-empty-note">
                      <ExperimentOutlined />
                      这段描述里没解析出规格，可手工选标准物料，或标记为新物料去治理台建档
                    </div>
                  )}
                </div>

                {record ? (
                  <>
                    <div className="mpd-block">
                      <div className="mpd-block-title">
                        映射到
                        <Button type="link" size="small" onClick={() => clearMapping(selected.key)}>
                          撤销映射
                        </Button>
                      </div>
                      {chosenStandard ? (
                        <div className="mpd-chosen">
                          <div className="mpd-chosen-name">{chosenStandard.name}</div>
                          <div className="mpd-chosen-meta">
                            <span className="mpd-mono">{chosenStandard.code}</span>
                            <span>{chosenStandard.category}</span>
                            <Tag color={record.by === 'ai' ? 'blue' : record.by === 'new' ? 'purple' : 'gold'}>
                              {record.by === 'ai' ? '系统推荐' : record.by === 'new' ? '新物料' : '人工选定'}
                            </Tag>
                          </div>
                        </div>
                      ) : (
                        <div className="mpd-chosen is-new">
                          <div className="mpd-chosen-name">标准物料库没有这件物料</div>
                          <div className="mpd-chosen-meta">提交映射后带着解析出的规格型号生成治理建档任务</div>
                        </div>
                      )}
                    </div>

                    <div className="mpd-block">
                      <div className="mpd-block-title">
                        映射后补充的规格型号
                        <span>
                          {record.attributes.length} 项
                          {record.attributes.filter(row => row.source === 'ai').length > 0 &&
                            ` · 解析补充 ${record.attributes.filter(row => row.source === 'ai').length}`}
                        </span>
                      </div>
                      <div className="mpd-attrs">
                        <div className="mpd-attr-head">
                          <span>属性名</span>
                          <span>属性值</span>
                          <span>来源</span>
                          <span />
                        </div>
                        {record.attributes.map((row, index) => (
                          <div className="mpd-attr-row" key={`${row.label}-${index}`}>
                            <Input
                              size="small"
                              value={row.label}
                              placeholder="属性名"
                              onChange={event => {
                                const attributes = record.attributes.slice();
                                attributes[index] = { ...row, label: event.target.value, source: 'manual' };
                                patchRecord({ attributes });
                              }}
                            />
                            <Input
                              size="small"
                              value={row.value}
                              placeholder="属性值"
                              onChange={event => {
                                const attributes = record.attributes.slice();
                                attributes[index] = { ...row, value: event.target.value, source: 'manual' };
                                patchRecord({ attributes });
                              }}
                            />
                            <span className={`mpd-src is-${row.source}`}>
                              {row.source === 'standard' ? '沿用' : row.source === 'ai' ? '解析' : '手工'}
                            </span>
                            <Button
                              type="text"
                              size="small"
                              className="mpd-attr-del"
                              icon={<DeleteOutlined />}
                              onClick={() => patchRecord({ attributes: record.attributes.filter((_, at) => at !== index) })}
                            />
                          </div>
                        ))}
                      </div>
                      <Button
                        type="dashed"
                        size="small"
                        block
                        icon={<PlusOutlined />}
                        className="mpd-attr-add"
                        onClick={() =>
                          patchRecord({ attributes: [...record.attributes, { label: '', value: '', source: 'manual' }] })
                        }
                      >
                        补充一条规格型号
                      </Button>
                      <div className="mpd-hint">
                        标准已有的属性已沿用；解析出来但标准没登记的（如定尺长度、包装）默认一起补进去，谁都可以改。
                      </div>
                    </div>

                    <div className="mpd-block">
                      <div className="mpd-block-title">这条历史叫法</div>
                      <Input
                        size="small"
                        className="mpd-alias"
                        value={record.alias}
                        onChange={event => patchRecord({ alias: event.target.value })}
                      />
                      <div className="mpd-hint">确认后登记进标准物料的「历史叫法」，下次遇到同样写法系统直接命中。</div>
                    </div>

                    {linked.length > 0 && (
                      <div className="mpd-block">
                        <div className="mpd-block-title">
                          <LinkOutlined /> 同一标准物料的其它历史写法
                          <span>{linked.length} 条</span>
                        </div>
                        <ul className="mpd-linked">
                          {linked.slice(0, 6).map(item => (
                            <li key={item.key}>
                              <span>{item.raw}</span>
                              <em>{item.unitPrice ? `¥${money(item.unitPrice, 2)}/${item.unit}` : '无价'}</em>
                            </li>
                          ))}
                        </ul>
                        <div className="mpd-hint">同一件商品被多条历史写法映射，属于正常的「一对多」，不会重复建档。</div>
                      </div>
                    )}

                    <div className="mpd-panel-actions">
                      {record.confirmed ? (
                        <>
                          <Tag color="success" className="mpd-confirmed">
                            <CheckCircleOutlined /> 已确认，可继续改后重新确认
                          </Tag>
                          <Button size="small" onClick={() => patchRecord({ confirmed: false })}>
                            撤回确认
                          </Button>
                        </>
                      ) : (
                        <Button type="primary" block icon={<CheckCircleOutlined />} onClick={confirmItem}>
                          确认此项映射
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mpd-block">
                      <div className="mpd-block-title">
                        推荐标准物料
                        <span>{candidates.length ? `${candidates.length} 个候选，按匹配度排序` : '无候选'}</span>
                      </div>
                      {candidates.length ? (
                        <div className="mpd-cands">
                          {candidates.map(candidate => (
                            <button
                              type="button"
                              key={candidate.key}
                              className={`mpd-cand ${candidate.score >= AUTO_MAP_THRESHOLD ? 'is-good' : 'is-weak'}`}
                              onClick={() => chooseCandidate(candidate)}
                            >
                              <div className="mpd-cand-head">
                                <span className={`mpd-score ${scoreClass(candidate.score)}`}>{candidate.score}</span>
                                <div className="mpd-cand-main">
                                  <div className="mpd-cand-name">{candidate.name}</div>
                                  <div className="mpd-cand-meta">
                                    <span className="mpd-mono">{candidate.code}</span>
                                    <span>{candidate.linked.length ? `已关联 ${candidate.linked.length} 条历史写法` : '尚无历史映射'}</span>
                                    {candidate.priceCount > 0 && (
                                      <span>
                                        历史价 ${money(candidate.avgPrice, 2)}/{candidate.priceUnit}（{candidate.priceCount} 条）
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span className="mpd-cand-pick">映射</span>
                              </div>
                              <div className="mpd-compare">
                                {candidate.compare.map(row => (
                                  <CompareRow key={`${row.label}-${row.state}`} row={row} />
                                ))}
                              </div>
                              <div className="mpd-reason">{candidate.reasons.slice(0, 2).join('；')}</div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="mpd-empty-note">
                          <ExperimentOutlined />
                          标准库没有相近物料，建议标记为新物料，带着解析结果去治理台建档
                        </div>
                      )}
                    </div>

                    <div className="mpd-panel-actions">
                      <Button block icon={<BranchesOutlined />} onClick={markAsNew}>
                        标记为新物料，转治理建档
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="mpd-empty-note">左侧选一条清单项开始映射</div>
          )}
        </Surface>
      </div>
    </>
  );
};
