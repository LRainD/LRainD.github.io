import React, { useEffect, useMemo, useState } from 'react';
import { Button, Checkbox, Input, Modal, Progress, Segmented, Space, Table, Tag, Tooltip, message } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  DownOutlined,
  LockOutlined,
  PlusOutlined,
  SaveOutlined,
  SearchOutlined,
  SendOutlined,
  SwapOutlined
} from '@ant-design/icons';
import { useDemo } from './context';
import { Confidence, PageHeader, Surface } from './shared';
import { defaultAtomSynonyms, type Atom, type MaterialSubmission } from './data';
import {
  buildSimilarItems,
  changeKindText,
  describeChanges,
  diffStandardChanges,
  summarizeChanges,
  type SimilarItem
} from './similar';

/** 表格行：一条待治理商品 */
type GovRow = {
  key: string;
  index: number;
  name: string;
  category: string;
  atomCount: number;
  /** 属性值为空的条数（值非必填，仅作提示） */
  emptyValues: number;
  /** 已登记的同义词条数：属性级 + 商品名称级 */
  synonymCount: number;
  unit: string;
  confidence: number;
  /** 入库审核状态：未提交 / 待审核 / 已驳回 / 已入库 */
  review: 'none' | 'pending' | 'rejected' | 'approved';
  /** 已提交的那条是新增建档还是修改已有物料 */
  changeType?: 'new' | 'update';
  /** 驳回意见，鼠标悬停时给出退回原因 */
  reviewComment?: string;
  current: boolean;
};

/** 补充属性时的常用属性名，点一下就能填 */
const QUICK_LABELS = ['规格型号', '材质', '执行标准', '品牌', '颜色', '厚度', '长度', '表面处理'];

/** 清单行预览的示例数量 */
const SAMPLE_QTY = 100;

/** 示例单价：按品类给一个量级合理的人民币单价，仅用于展示「清单里长什么样」 */
const SAMPLE_PRICE: Array<[string, number]> = [
  ['钢筋', 3860],
  ['水泥', 468],
  ['混凝土', 480],
  ['管材', 62],
  ['电缆', 28],
  ['砌块', 268],
  ['砂', 128],
  ['灯具', 118],
  ['模板', 45]
];

const samplePriceOf = (category: string) =>
  SAMPLE_PRICE.find(([key]) => category.includes(key))?.[1] ?? 128;

const formatMoney = (value: number) =>
  value.toLocaleString('zh-CN', { maximumFractionDigits: 2 });

export const GovernancePage: React.FC = () => {
  const {
    currentMaterialIndex, submitForReview, setPage, materials, activeTask, activeProgress,
    confirmedKeys, submissions, goToMaterial, addAtom, updateAtom, updateMaterialSynonyms, removeAtom,
    standards, prices, openStandardEditor, applyAtoms, materialLink, linkStandard
  } = useDemo();
  const material = materials[currentMaterialIndex];

  const [selected, setSelected] = useState<string[]>(material?.selectedAtomKeys ?? []);
  /** 正在内联编辑的属性：field 区分改属性名还是改属性值 */
  const [editingAtom, setEditingAtom] = useState<{ key: string; field: 'label' | 'value'; text: string } | null>(null);
  /** 正在给哪个属性添加同义词 */
  const [synDraft, setSynDraft] = useState<{ key: string; text: string } | null>(null);
  /** 商品名称同义词输入框 */
  const [nameDraft, setNameDraft] = useState('');
  /** 补充属性弹窗 */
  const [atomOpen, setAtomOpen] = useState(false);
  const [atomLabel, setAtomLabel] = useState('');
  const [atomValue, setAtomValue] = useState('');
  const [atomSynonyms, setAtomSynonyms] = useState('');
  /** 商品表格筛选 */
  const [filter, setFilter] = useState<'all' | 'todo' | 'reviewing' | 'done'>('all');
  const [keyword, setKeyword] = useState('');
  /** 相似标准推荐里展开查看明细的那一条 */
  const [similarOpen, setSimilarOpen] = useState<string | null>(null);

  // 只在「换了一条商品」时重置本地勾选，重新渲染（补充属性 / 改值）不能把勾选清掉
  const materialKey = material?.key;
  useEffect(() => {
    setSelected(material?.selectedAtomKeys ?? []);
    setEditingAtom(null);
    setSynDraft(null);
    setNameDraft('');
    setSimilarOpen(null);
  }, [materialKey]);

  const selectedAtoms = useMemo(
    () => (material ? material.atoms.filter(atom => selected.includes(atom.key)) : []),
    [material, selected]
  );
  const standardName = useMemo(
    () => selectedAtoms.map(atom => atom.value.trim()).filter(Boolean).join(' '),
    [selectedAtoms]
  );
  /** 清单里的「规格型号」列：逐行展示 属性名：值（同一个商品行内的多行，不是多条商品） */
  const specPairs = useMemo(
    () =>
      selectedAtoms
        .filter(atom => atom.label !== '品类' && atom.value.trim())
        .map(atom => ({ label: atom.label, value: atom.value.trim() })),
    [selectedAtoms]
  );
  /** 示例单价，让预览里的数字看起来量级合理 */
  const samplePrice = material ? samplePriceOf(material.category) : 128;
  /** 商品名称同义词：专家维护的那几条（原始描述在入库时兜底合并） */
  const materialSynonyms = material?.synonyms ?? [];
  /** 已登记同义词的属性条数（只算勾选参与组装的） */
  const atomSynonymCount = selectedAtoms.filter(atom => (atom.synonyms?.length ?? 0) > 0).length;
  /** 相似标准推荐：真实按属性命中率排序，点击展开明细 */
  const similarItems = useMemo(
    () => buildSimilarItems(standards, prices, selectedAtoms, materialSynonyms),
    [standards, prices, selectedAtoms, materialSynonyms]
  );

  /**
   * 本次提交的「提交方式」：
   * 专家把当前商品关联到某条标准物料，就是「修改已有物料」——审核通过后合并进它，不重复建档；
   * 没关联则是「新增建档」。diff 按当前勾选的属性实时算，页面上先让专家看清楚要改什么。
   */
  const linkedKey = material ? materialLink[material.key] : undefined;
  const linkedStandard = linkedKey ? standards.find(std => std.key === linkedKey) : undefined;
  const changes = useMemo(
    () => (linkedStandard ? diffStandardChanges(selectedAtoms, materialSynonyms, linkedStandard) : []),
    [linkedStandard, selectedAtoms, materialSynonyms]
  );
  const changeSummary = summarizeChanges(changes);
  /** 还没关联、但已有一条高度相似的标准：提示可以改成「修改」而不是新建 */
  const similarTop = similarItems[0];
  const similarHint = !linkedStandard && similarTop && similarTop.score >= 85 ? similarTop : null;

  /** 当前任务下的提交单：materialKey → 提交单，用来判断每一行的审核状态 */
  const submissionMap = useMemo(() => {
    const taskKey = activeTask?.key ?? null;
    const map: Record<string, MaterialSubmission> = {};
    submissions.forEach(item => {
      if (item.taskKey === taskKey) map[item.materialKey] = item;
    });
    return map;
  }, [submissions, activeTask]);

  /** 当前商品自己的提交单：决定底部按钮是「提交」还是「重新提交」 */
  const currentSubmission = material ? submissionMap[material.key] : undefined;
  /** 当前商品是否已在审核链路里（待审核 / 已通过） */
  const lockedByReview = Boolean(currentSubmission && currentSubmission.status !== '已驳回');
  /** 草稿保存时间：属性改动本来就实时落本机，这里给专家一个显式的保存回执 */
  const [draftSavedAt, setDraftSavedAt] = useState('');

  const rows = useMemo<GovRow[]>(
    () =>
      materials.map((item, index) => {
        const submission = submissionMap[item.key];
        const review: GovRow['review'] = confirmedKeys.includes(item.key)
          ? 'approved'
          : submission?.status === '待审核'
            ? 'pending'
            : submission?.status === '已驳回'
              ? 'rejected'
              : 'none';
        return {
          key: item.key,
          index,
          name: item.sourceName,
          category: item.category,
          atomCount: item.atoms.length,
          emptyValues: item.atoms.filter(atom => !atom.value.trim()).length,
          synonymCount:
            (item.synonyms?.length ?? 0) +
            item.atoms.reduce((sum, atom) => sum + (atom.synonyms?.length ?? 0), 0),
          unit: item.unit,
          confidence: item.confidence,
          review,
          changeType: submission?.changeType,
          reviewComment: review === 'rejected' ? submission?.comment : undefined,
          current: index === currentMaterialIndex
        };
      }),
    [materials, confirmedKeys, submissionMap, currentMaterialIndex]
  );

  const stats = useMemo(() => {
    const done = rows.filter(row => row.review === 'approved').length;
    const reviewing = rows.filter(row => row.review === 'pending').length;
    return { all: rows.length, done, reviewing, todo: rows.length - done - reviewing };
  }, [rows]);

  const visibleRows = useMemo(
    () =>
      rows.filter(row => {
        if (filter === 'todo' && row.review !== 'none' && row.review !== 'rejected') return false;
        if (filter === 'reviewing' && row.review !== 'pending') return false;
        if (filter === 'done' && row.review !== 'approved') return false;
        if (keyword && !`${row.name}${row.category}`.includes(keyword.trim())) return false;
        return true;
      }),
    [rows, filter, keyword]
  );

  /** 保存草稿：属性与同义词改动已经写进本机快照，这里只给一个明确的保存回执 */
  const handleSaveDraft = () => {
    setDraftSavedAt(new Date().toLocaleTimeString('zh-CN', { hour12: false }));
    message.success('已保存到本机草稿，稍后可以继续补充属性或提交审核');
  };

  /** 保存并提交审核：生成提交单 → 任务状态转「待审核」→ 跳到入库审核 */
  const handleSubmit = () => {
    if (!material) return;
    if (!lockedByReview) {
      const categoryAtom = material.atoms.find(atom => atom.label === '品类') ?? material.atoms[0];
      if (categoryAtom && !selected.includes(categoryAtom.key)) {
        message.warning('请至少保留品类属性');
        return;
      }
      const name = standardName || material.sourceName;
      Modal.confirm({
        title: currentSubmission?.status === '已驳回'
          ? '修改后重新提交审核？'
          : linkedStandard
            ? '提交为「修改已有标准物料」？'
            : '提交入库审核？',
        width: 520,
        content: (
          <div className="pg-submit-confirm">
            <div><span>提交方式</span>
              <b>{linkedStandard ? `修改已有物料 ${linkedStandard.code}` : '新增标准物料建档'}</b>
            </div>
            <div><span>商品名称</span><b>{name}</b></div>
            <div><span>规格型号</span><b>{specPairs.length} 项 · {specPairs.map(pair => `${pair.label}：${pair.value}`).join(' / ') || '待补充'}</b></div>
            <div><span>历史叫法</span><b>{materialSynonyms.length} 条商品叫法 · {atomSynonymCount} 条属性叫法</b></div>
            {linkedStandard && (
              <div><span>变更内容</span><b>{describeChanges(changes)}</b></div>
            )}
            {linkedStandard && changes.length > 0 && (
              <div className="pg-submit-changes">
                {changes.slice(0, 6).map((change, index) => (
                  <div className="pg-submit-change" key={`${change.kind}-${change.label ?? 'syn'}-${index}`}>
                    <em>{changeKindText[change.kind]}</em>
                    <b>
                      {change.kind === 'name-synonym'
                        ? change.words?.join('、')
                        : change.kind === 'atom-synonym'
                          ? `${change.label} ＋${change.words?.join('、')}`
                          : `${change.label}：${change.before ? `${change.before} → ` : ''}${change.after}`}
                    </b>
                  </div>
                ))}
                {changes.length > 6 && <div className="pg-ai-sub">还有 {changes.length - 6} 项变更…</div>}
              </div>
            )}
            <div className="pg-ai-sub">
              {linkedStandard
                ? '通过审核后只把上述变更合并进该标准物料：编码、名称、品类与价格记录都不变；驳回会退回这里修改。'
                : '提交后本条物料进入「运营入库审核」，本任务状态变为「待审核」；审核专家通过后按新增建档写入标准物料库，驳回会退回这里修改。'}
            </div>
          </div>
        ),
        okText: linkedStandard ? '提交变更' : '保存并提交',
        cancelText: '再看看',
        onOk: () => {
          const ok = submitForReview(selected);
          if (ok) setPage('review');
        }
      });
      return;
    }
    if (currentSubmission?.status === '待审核') {
      message.info('该物料已提交，正在等审核专家处理；如需修改可以到入库审核页撤回（演示中直接重新提交会覆盖）');
      return;
    }
    message.info(`该物料已通过审核并写入标准物料库（${currentSubmission?.standardCode ?? '已建档'}）`);
  };

  const startEdit = (atom: Atom, field: 'label' | 'value' = 'value') =>
    setEditingAtom({ key: atom.key, field, text: field === 'label' ? atom.label : atom.value });

  const commitEdit = () => {
    if (!editingAtom) return;
    const text = editingAtom.text.trim();
    const target = material?.atoms.find(atom => atom.key === editingAtom.key);
    if (editingAtom.field === 'label') {
      if (!text) {
        message.warning('属性名不能为空，已恢复原值');
        setEditingAtom(null);
        return;
      }
      if (target?.label === '品类') {
        message.warning('「品类」是标准物料主键，不能改名');
        setEditingAtom(null);
        return;
      }
      if (text !== target?.label) updateAtom(editingAtom.key, { label: text });
    } else if (text !== target?.value) {
      // 属性值非必填，允许清空后保存
      updateAtom(editingAtom.key, { value: text });
    }
    setEditingAtom(null);
  };

  /** 提交属性名同义词：去重、非空，回车或失焦都算 */
  const commitAtomSynonym = () => {
    if (!synDraft) return;
    const text = synDraft.text.trim();
    const target = material?.atoms.find(atom => atom.key === synDraft.key);
    setSynDraft(null);
    if (!target || !text) return;
    const list = target.synonyms ?? [];
    if (list.includes(text)) {
      message.warning(`「${text}」已在同义词里`);
      return;
    }
    // 同一个叫法落到两条属性上会把历史写法归错，先让专家确认
    const conflict = material?.atoms.find(
      atom => atom.key !== target.key && (atom.synonyms ?? []).includes(text)
    );
    if (conflict) {
      Modal.confirm({
        title: '该叫法已登记在其它属性下',
        content: `「${text}」已经属于属性「${conflict.label}」。继续添加表示历史文件里的这个写法，也要归并到当前属性「${target.label}」。`,
        okText: '仍然添加',
        cancelText: '取消',
        onOk: () => updateAtom(target.key, { synonyms: [...list, text] })
      });
      return;
    }
    updateAtom(target.key, { synonyms: [...list, text] });
  };

  const removeAtomSynonym = (atom: Atom, word: string) =>
    updateAtom(atom.key, { synonyms: (atom.synonyms ?? []).filter(item => item !== word) });

  /** 添加商品名称同义词（可传值，方便「一键把原始描述加进来」） */
  const addNameSynonym = (raw?: string) => {
    const text = (raw ?? nameDraft).trim();
    if (!text) return;
    if (materialSynonyms.includes(text)) {
      message.warning(`「${text}」已在历史叫法里`);
      return;
    }
    updateMaterialSynonyms([...materialSynonyms, text]);
    setNameDraft('');
  };

  const submitAtom = () => {
    const label = atomLabel.trim();
    // 属性值非必填：只校验属性名
    if (!label) {
      message.warning('请填写属性名称');
      return;
    }
    const synonyms = atomSynonyms
      .split(/[,，;；\s]+/)
      .map(word => word.trim())
      .filter(Boolean);
    const key = addAtom(label, atomValue.trim(), synonyms);
    if (key) setSelected(prev => (prev.includes(key) ? prev : [...prev, key]));
    setAtomOpen(false);
    setAtomLabel('');
    setAtomValue('');
    setAtomSynonyms('');
  };

  /** 相似标准：按该标准对齐属性值（缺失的属性补进属性列表，属性名和同义词不动） */
  const adoptSimilar = (item: SimilarItem) => {
    const patch = item.compare
      .filter(row => row.theirs && row.state !== 'same')
      .map(row => ({ label: row.label, value: row.theirs }));
    if (!patch.length) {
      message.info('该标准与本商品属性取值一致，无需对齐');
      return;
    }
    Modal.confirm({
      title: '按该标准物料对齐属性？',
      content: `将把「${item.name}」的 ${patch.length} 条属性值写入当前商品，本商品缺的属性会补进属性列表；属性名与已登记的同义词保持不变。`,
      okText: '对齐属性',
      cancelText: '取消',
      onOk: () => {
        const keys = applyAtoms(patch);
        setSelected(keys);
      }
    });
  };

  const columns = [
    {
      title: '#', key: 'index', width: 56,
      render: (_: unknown, row: GovRow) => <span className="pg-ai-sub">{row.index + 1}</span>
    },
    {
      title: '商品原始描述', key: 'name',
      render: (_: unknown, row: GovRow) => (
        <Tooltip title={row.name} placement="topLeft">
          <div className="pg-gov-name">
            <span>{row.name}</span>
            {row.current && <Tag color="processing" className="pg-gov-now">当前</Tag>}
          </div>
        </Tooltip>
      )
    },
    { title: '品类', dataIndex: 'category', key: 'category', width: 110, ellipsis: true },
    {
      title: '属性', key: 'atomCount', width: 96,
      render: (_: unknown, row: GovRow) => (
        <span>
          {row.atomCount} 项
          {row.emptyValues > 0 && <span className="pg-ai-sub"> · {row.emptyValues} 空值</span>}
        </span>
      )
    },
    {
      title: '同义词', key: 'synonymCount', width: 82,
      render: (_: unknown, row: GovRow) =>
        row.synonymCount > 0
          ? <span>{row.synonymCount} 条</span>
          : <span className="pg-ai-sub">—</span>
    },
    { title: '单位', dataIndex: 'unit', key: 'unit', width: 70 },
    {
      title: '置信度', key: 'confidence', width: 110,
      render: (_: unknown, row: GovRow) => <Confidence value={row.confidence} />
    },
    {
      title: '审核状态', key: 'status', width: 120,
      render: (_: unknown, row: GovRow) => {
        if (row.review === 'approved') return <Tag color="success">已入库</Tag>;
        if (row.review === 'pending') {
          return (
            <Space size={4}>
              <Tag color="processing">审核中</Tag>
              {row.changeType === 'update' && (
                <Tooltip title="本次提交是修改已有标准物料，审核通过后合并进原物料，不会新建">
                  <Tag className="pg-soft-tag">改</Tag>
                </Tooltip>
              )}
            </Space>
          );
        }
        if (row.review === 'rejected') {
          return (
            <Tooltip title={`驳回原因：${row.reviewComment || '未填写'}`}>
              <Tag color="error">已驳回</Tag>
            </Tooltip>
          );
        }
        return row.current ? <Tag color="warning">待提交</Tag> : <Tag>待提交</Tag>;
      }
    },
    {
      title: '操作', key: 'action', width: 96, fixed: 'right' as const,
      render: (_: unknown, row: GovRow) => (
        <Button
          type="link"
          size="small"
          onClick={event => {
            event.stopPropagation();
            goToMaterial(row.index);
          }}
        >
          {row.review === 'approved' ? '查看' : row.review === 'pending' ? '复核' : '处理'}
        </Button>
      )
    }
  ];

  // 本任务物料已全部提交：给出「等审核」或「已入库」的明确完成态，而不是回落到演示数据
  if (!material) {
    const finished = activeProgress.total > 0;
    const waiting = Math.max(0, activeProgress.submitted - activeProgress.completed);
    const allIn = finished && activeProgress.completed >= activeProgress.total;
    return <>
      <PageHeader
        title="专家治理工作台"
        subtitle={
          activeTask
            ? `任务：${activeTask.name} · ${activeProgress.submitted}/${activeProgress.total} 已提交 · ${activeProgress.completed} 条已入库`
            : '当前无待治理物料'
        }
        action={<Button onClick={() => setPage('tasks')}>返回专家任务</Button>}
      />
      <Surface>
        <div className="pg-done-block">
          {allIn
            ? <CheckCircleOutlined className="pg-done-icon" />
            : <ClockCircleOutlined className="pg-done-icon pg-done-icon-wait" />}
          <div className="pg-done-title">
            {allIn ? '本任务物料已全部通过审核入库' : finished ? '本任务物料已全部提交，等待入库审核' : '暂无待治理物料'}
          </div>
          <div className="pg-done-desc">
            {allIn
              ? `共 ${activeProgress.total} 条物料由审核专家确认通过，标准物料已写入标准库；任务状态为「已完成」，数据保存在本机，刷新页面不会丢失。`
              : finished
                ? `共 ${activeProgress.total} 条物料已提交入库审核，其中 ${waiting} 条待审核。审核专家通过后才会写入标准物料库；任务状态已同步为「待审核」。`
                : '请先到「数据接入清洗」上传清单并完成 AI 拆解，系统会自动创建对应治理任务。'}
          </div>
          <Space style={{ marginTop: 18 }}>
            {finished && !allIn && (
              <Button type="primary" onClick={() => setPage('review')}>去运营入库审核</Button>
            )}
            <Button type={allIn ? 'primary' : 'default'} onClick={() => setPage('standards')}>查看标准物料库</Button>
            <Button onClick={() => setPage('tasks')}>专家任务</Button>
            <Button onClick={() => setPage('import')}>继续接入数据</Button>
          </Space>
        </div>
      </Surface>
    </>;
  }

  const source = activeTask?.source;

  return <>
    <PageHeader
      title="专家治理工作台"
      subtitle={`任务：${activeTask?.name ?? '内置演示物料'} · 当前 ${Math.min(currentMaterialIndex + 1, materials.length)}/${materials.length} · 已提交 ${activeProgress.submitted}/${activeProgress.total} · 已入库 ${activeProgress.completed} 条`}
      action={
        <Space>
          <Progress type="circle" size={40} percent={activeProgress.percent} />
          <Button onClick={() => setPage('tasks')}>任务详情</Button>
        </Space>
      }
    />
    {source && (
      <div className="pg-import-banner">
        <span className="pg-import-banner-tag">导入批次</span>
        <span>{source.fileName || '手工录入文本'}</span>
        {source.sheetName && <span className="pg-ai-sub">工作表「{source.sheetName}」</span>}
        <span className="pg-ai-sub">
          导入 {activeProgress.total} 条 · 已确认 {activeProgress.completed} 条 · 剩余{' '}
          {Math.max(0, activeProgress.total - activeProgress.completed)} 条
        </span>
      </div>
    )}

    {linkedStandard ? (
      <div className="pg-gov-link-banner is-link">
        <Tag color="purple">修改已有物料</Tag>
        <span className="pg-gov-link-name">{linkedStandard.name}</span>
        <span className="pg-gov-link-code">{linkedStandard.code}</span>
        <span className="pg-gov-link-sum">
          {changeSummary.total === 0 ? <Tag color="warning">当前无属性变更</Tag> : describeChanges(changes)}
        </span>
        <Button size="small" onClick={() => linkStandard(null)}>改为新增建档</Button>
      </div>
    ) : similarHint ? (
      <div className="pg-gov-link-banner is-hint">
        <SwapOutlined />
        <span className="pg-gov-link-sum">
          与标准物料 <b>{similarHint.code}</b>（{similarHint.name}）匹配度 {similarHint.score}%
          —— 如果这是同一件商品，关联后按「修改」提交，避免重复建档。
        </span>
        <Button size="small" type="primary" onClick={() => linkStandard(similarHint.key)}>
          关联此标准
        </Button>
      </div>
    ) : null}

    <Surface
      className="pg-gov-table-surface"
      title={
        <span>
          待治理商品
          <span className="pg-ai-sub" style={{ marginLeft: 8, fontWeight: 400 }}>
            {stats.all} 条 · 待提交 {stats.todo} 条 · 审核中 {stats.reviewing} 条 · 已入库 {stats.done} 条
          </span>
        </span>
      }
      extra={
        <Space size={10} wrap>
          <Segmented
            value={filter}
            onChange={value => setFilter(value as 'all' | 'pending' | 'done')}
            options={[
              { label: `全部 ${stats.all}`, value: 'all' },
              { label: `待提交 ${stats.todo}`, value: 'todo' },
              { label: `审核中 ${stats.reviewing}`, value: 'reviewing' },
              { label: `已入库 ${stats.done}`, value: 'done' }
            ]}
          />
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="搜索描述或品类"
            value={keyword}
            onChange={event => setKeyword(event.target.value)}
            style={{ width: 220 }}
          />
        </Space>
      }
    >
      <Table
        size="small"
        className="pg-gov-table"
        dataSource={visibleRows}
        columns={columns}
        rowKey="key"
        pagination={false}
        scroll={{ x: 900, y: visibleRows.length > 6 ? 264 : undefined }}
        rowClassName={row => (row.current ? 'pg-row-current' : '')}
        onRow={row => ({
          onClick: () => goToMaterial(row.index)
        })}
        locale={{ emptyText: '没有符合条件的商品，换个筛选条件试试' }}
      />
      <div className="pg-ai-sub" style={{ marginTop: 8 }}>
        点击任意一行即可切换到该商品继续治理；提交后状态变为「审核中」，审核专家通过后才是「已入库」，被驳回的商品会带着审核意见回到待提交。
      </div>
    </Surface>

    <div className="pg-gov-work">
      <section className="pg-governance-panel pg-atom-panel">
        <div className="pg-panel-title">
          <span>
            AI 抽取原子
            <Tag className="pg-soft-tag">{material.atoms.length} 项</Tag>
          </span>
          <Confidence value={material.confidence} />
        </div>

        <div className="pg-atom-source">
          <div className="pg-attribute-label">原始描述</div>
          <div className="pg-atom-source-name">{material.sourceName}</div>
        </div>

        <div className="pg-atom-list">
          <div className="pg-atom-head">
            <span />
            <span>属性名</span>
            <span>属性值</span>
            <span>同义词 / 历史叫法</span>
            <span>置信度</span>
            <span />
          </div>
          <Checkbox.Group
            className="pg-atom-group"
            value={selected}
            onChange={values => setSelected(values as string[])}
          >
            {material.atoms.map(atom => {
              const manual = atom.key.startsWith('cu') || atom.confidence >= 100;
              const editingLabel = editingAtom?.key === atom.key && editingAtom.field === 'label';
              const editingValue = editingAtom?.key === atom.key && editingAtom.field === 'value';
              const words = atom.synonyms ?? [];
              return (
                <div className={`pg-atom-row ${selected.includes(atom.key) ? '' : 'is-off'}`} key={atom.key}>
                  <Checkbox value={atom.key} className="pg-atom-check" />

                  <div className="pg-atom-cell">
                    {editingLabel ? (
                      <Input
                        size="small"
                        autoFocus
                        className="pg-atom-input pg-atom-input-label"
                        value={editingAtom.text}
                        onChange={event => setEditingAtom({ key: atom.key, field: 'label', text: event.target.value })}
                        onPressEnter={commitEdit}
                        onBlur={commitEdit}
                      />
                    ) : (
                      <>
                        <Tooltip title={atom.label === '品类' ? '品类为标准物料主键，不可改名' : '点击修改属性名'}>
                          <b
                            className="pg-atom-label"
                            onClick={() => {
                              if (atom.label === '品类') {
                                message.info('「品类」是标准物料主键，不能改名，可修改其属性值');
                                return;
                              }
                              startEdit(atom, 'label');
                            }}
                          >
                            {atom.label}
                          </b>
                        </Tooltip>
                        {manual && <span className="pg-atom-manual">手工</span>}
                      </>
                    )}
                  </div>

                  <div className="pg-atom-cell">
                    {editingValue ? (
                      <Input
                        size="small"
                        autoFocus
                        className="pg-atom-input"
                        placeholder="可留空"
                        value={editingAtom.text}
                        onChange={event => setEditingAtom({ key: atom.key, field: 'value', text: event.target.value })}
                        onPressEnter={commitEdit}
                        onBlur={commitEdit}
                      />
                    ) : (
                      <Tooltip title="点击修改属性值（可留空）">
                        <span
                          className={`pg-atom-value ${atom.value ? '' : 'pg-atom-value-empty'}`}
                          onClick={() => startEdit(atom, 'value')}
                        >
                          {atom.value || '（空）'}
                        </span>
                      </Tooltip>
                    )}
                  </div>

                  <div className="pg-atom-cell pg-atom-syn">
                    {words.map(word => (
                      <Tag
                        key={word}
                        className="pg-syn-tag"
                        closable
                        onClose={event => {
                          event.preventDefault();
                          removeAtomSynonym(atom, word);
                        }}
                      >
                        {word}
                      </Tag>
                    ))}
                    {synDraft?.key === atom.key ? (
                      <Input
                        size="small"
                        autoFocus
                        className="pg-syn-input"
                        value={synDraft.text}
                        placeholder={(defaultAtomSynonyms[atom.label] ?? [])[0] ?? '历史叫法，回车添加'}
                        onChange={event => setSynDraft({ key: atom.key, text: event.target.value })}
                        onPressEnter={commitAtomSynonym}
                        onBlur={commitAtomSynonym}
                      />
                    ) : (
                      <Tooltip
                        title={
                          defaultAtomSynonyms[atom.label]?.length
                            ? `历史文件里常写作：${defaultAtomSynonyms[atom.label].join('、')}`
                            : '登记该属性在历史文件里的其它写法'
                        }
                      >
                        <button type="button" className="pg-syn-add" onClick={() => setSynDraft({ key: atom.key, text: '' })}>
                          + 添加
                        </button>
                      </Tooltip>
                    )}
                  </div>

                  <div className="pg-atom-cell pg-atom-conf">
                    <Confidence value={atom.confidence} />
                  </div>

                  <div className="pg-atom-cell pg-atom-act">
                    {atom.label === '品类' ? (
                      <Tooltip title="品类是标准物料主键，不可删除">
                        <LockOutlined className="pg-atom-lock" />
                      </Tooltip>
                    ) : (
                      <Tooltip title="移除该属性">
                        <Button
                          className="pg-atom-delete"
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => removeAtom(atom.key)}
                        />
                      </Tooltip>
                    )}
                  </div>
                </div>
              );
            })}
          </Checkbox.Group>
        </div>

        <div className="pg-atom-foot">
          <Button block type="dashed" icon={<PlusOutlined />} onClick={() => setAtomOpen(true)}>
            补充属性
          </Button>
          <div className="pg-ai-sub">
            属性名和属性值都能点击修改；<b>同义词</b>用来把历史文件里的不同写法（如「直径 / 规格 / Φ径」）归到同一个属性，
            确认入库时会一起写入标准物料。
          </div>
        </div>
      </section>
    </div>

    <Surface
      className="pg-preview-surface"
      title="预览"
      extra={
        <span className="pg-ai-sub">
          入库后在商品清单里的样子 · 随勾选的属性实时生成 · 数量、单价、合价为示例值
        </span>
      }
    >
      <div className="pg-lp-table">
        <div className="pg-lp-head">
          <span>序号</span>
          <span>商品名称</span>
          <span>规格型号</span>
          <span>单位</span>
          <span className="pg-pv-num">数量</span>
          <span className="pg-pv-num">含税单价</span>
          <span className="pg-pv-num">合价</span>
          <span className="pg-pv-num">税率</span>
          <span>报价依据</span>
        </div>
        <div className="pg-lp-row">
          <span className="pg-pv-idx">1</span>
          <span className="pg-pv-name" title={standardName}>
            {standardName || (selectedAtoms.length ? '待补充属性值' : '请勾选属性')}
          </span>
          <div className="pg-pv-spec">
            {specPairs.length ? (
              specPairs.map(pair => (
                <span className="pg-pv-kv" key={pair.label}>
                  <em>{pair.label}：</em>
                  <b title={pair.value}>{pair.value}</b>
                </span>
              ))
            ) : (
              <span className="pg-pv-kv-empty">待补充</span>
            )}
          </div>
          <span>{material.unit || '—'}</span>
          <span className="pg-pv-num">{SAMPLE_QTY}</span>
          <span className="pg-pv-num">{samplePrice.toFixed(2)}</span>
          <span className="pg-pv-num">{(samplePrice * SAMPLE_QTY).toFixed(2)}</span>
          <span className="pg-pv-num">13%</span>
          <span>
            <span className="pg-pv-basis">标准物料库</span>
          </span>
        </div>
      </div>
      <div className="pg-lp-note">
        商品名称、规格型号取自勾选的属性值；规格型号按「属性名：值」逐行展示，就是清单里同一行的同一格。
        单位随物料带出，品牌名、不含税单价 / 合价、税额由清单按 13% 税率自动算出，这里不重复展示。
      </div>

      <div className="pg-lp-meta">
        <div className="pg-lp-meta-row">
          <span className="pg-lp-meta-label">
            商品名称历史叫法
            <Tag className="pg-soft-tag">{materialSynonyms.length} 条</Tag>
          </span>
          <div className="pg-lp-meta-body">
            <div className="pg-lp-syn">
              {materialSynonyms.length === 0 && <span className="pg-syn-empty">暂无历史叫法</span>}
              {materialSynonyms.map(word => (
                <Tag
                  key={word}
                  closable
                  onClose={event => {
                    event.preventDefault();
                    updateMaterialSynonyms(materialSynonyms.filter(item => item !== word));
                  }}
                >
                  {word}
                </Tag>
              ))}
              <Input
                size="small"
                className="pg-lp-syn-input"
                value={nameDraft}
                onChange={event => setNameDraft(event.target.value)}
                onPressEnter={() => addNameSynonym()}
                placeholder="输入历史叫法，回车添加"
              />
              <Tooltip title="添加这条历史叫法">
                <Button size="small" type="text" icon={<PlusOutlined />} onClick={() => addNameSynonym()} />
              </Tooltip>
              {!materialSynonyms.includes(material.sourceName) && (
                <button type="button" className="pg-syn-add" onClick={() => addNameSynonym(material.sourceName)}>
                  ＋ 用原始描述
                </button>
              )}
            </div>
            <div className="pg-ai-sub">
              同一物料在历史文件里的其它写法都登记进来，后续清单匹配会自动归并到这一条。
            </div>
          </div>
        </div>

        <div className="pg-lp-meta-row">
          <span className="pg-lp-meta-label">质量提示</span>
          <div className="pg-lp-meta-body pg-lp-checks">
            <span><CheckCircleOutlined className="pg-check-ok" /> 已勾选 {selectedAtoms.length} 条属性名</span>
            <span><CheckCircleOutlined className="pg-check-ok" /> 单位已归一为“{material.unit}”</span>
            <span>
              {atomSynonymCount > 0 ? <CheckCircleOutlined className="pg-check-ok" /> : <SwapOutlined className="pg-check-warn" />}
              {atomSynonymCount > 0
                ? ` ${atomSynonymCount} 条属性已登记历史叫法，商品名称另有 ${materialSynonyms.length} 条`
                : ' 还没有属性同义词，历史文件的异名写法会匹配不上'}
            </span>
            {selectedAtoms.some(atom => !atom.value.trim()) ? (
              <span>
                <SwapOutlined className="pg-check-warn" /> 有 {selectedAtoms.filter(atom => !atom.value.trim()).length} 条属性值为空，入库后标记为「待补充」
              </span>
            ) : (
              <span><CheckCircleOutlined className="pg-check-ok" /> 属性值已填全</span>
            )}
          </div>
        </div>
      </div>
    </Surface>

    <Surface
      className="pg-similar-surface"
      title={<span>相似标准推荐 <Tag className="pg-soft-tag">按属性命中排序</Tag></span>}
      extra={<span className="pg-ai-sub">点击展开属性对比；如果确认是同一件商品，关联后按「修改已有物料」提交</span>}
    >
      {similarItems.length === 0 ? (
        <div className="pg-ai-sub">
          当前勾选的属性与标准库没有重叠，提交后会作为一条新标准建档。
        </div>
      ) : (
        <div className="pg-sim-list">
          <div className="pg-sim-head">
            <span>标准物料</span>
            <span>属性一致</span>
            <span>价格数据</span>
            <span className="pg-sim-score-cell">匹配度</span>
            <span />
          </div>
          {similarItems.map(item => {
            const open = similarOpen === item.key;
            return (
              <div className={`pg-sim-item ${open ? 'is-open' : ''}`} key={item.key}>
                <div className="pg-sim-row" onClick={() => setSimilarOpen(open ? null : item.key)}>
                  <div className="pg-sim-main">
                    <div className="pg-sim-name">{item.name}</div>
                    <div className="pg-sim-meta">
                      <span className="pg-sim-code">{item.code}</span>
                      <span>{item.category}</span>
                      {item.synonymHit && (
                        <Tag color="success" className="pg-soft-tag">历史叫法命中：{item.synonymHit}</Tag>
                      )}
                      {linkedKey === item.key && (
                        <Tag color="purple" className="pg-soft-tag">本次提交合并进这条</Tag>
                      )}
                    </div>
                  </div>
                  <span className="pg-sim-fit">{item.same}/{item.total} 项</span>
                  <span className="pg-sim-price">
                    {item.priceCount
                      ? `${item.priceCount} 条 · 均价 ${formatMoney(Math.round(item.avgPrice))}`
                      : '暂无价格'}
                  </span>
                  <span className="pg-sim-score">{item.score}%</span>
                  <DownOutlined className={`pg-sim-caret ${open ? 'is-open' : ''}`} />
                </div>
                {open && (
                  <div className="pg-sim-detail">
                    <div className="pg-sim-block">
                      <div className="pg-sim-block-title">属性对比</div>
                      <div className="pg-sim-cmp">
                        <div className="pg-sim-cmp-head">
                          <span>属性</span>
                          <span>当前商品</span>
                          <span>该标准物料</span>
                        </div>
                        {item.compare.map(row => (
                          <div className={`pg-sim-cmp-row is-${row.state}`} key={row.label}>
                            <span className="pg-sim-cmp-label">{row.label}</span>
                            <span>{row.mine || '—'}</span>
                            <span>{row.theirs || '—'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="pg-sim-block">
                      <div className="pg-sim-block-title">价格与历史叫法</div>
                      <div className="pg-sim-kpis">
                        <div><span>价格记录</span><b>{item.priceCount} 条</b></div>
                        <div>
                          <span>均价</span>
                          <b>{item.priceCount ? `¥${formatMoney(Math.round(item.avgPrice))}` : '—'}</b>
                        </div>
                        <div>
                          <span>价格区间</span>
                          <b>{item.priceCount ? `¥${formatMoney(item.minPrice)} ~ ${formatMoney(item.maxPrice)}` : '—'}</b>
                        </div>
                        <div>
                          <span>最近成交</span>
                          <b>{item.latest ? `¥${formatMoney(item.latest.unitPrice)} · ${item.latest.signDate}` : '—'}</b>
                        </div>
                      </div>
                      <div className="pg-sim-syn">
                        <span className="pg-ai-sub">已登记历史叫法</span>
                        {item.synonyms.map(word => <Tag key={word}>{word}</Tag>)}
                      </div>
                    </div>
                    <div className="pg-sim-block">
                      <div className="pg-sim-block-title">差异与建议</div>
                      <div className="pg-sim-reason">{item.reason}</div>
                      <div className="pg-sim-actions">
                        <Button size="small" onClick={() => openStandardEditor(item.key)}>查看标准物料</Button>
                        <Button size="small" onClick={() => adoptSimilar(item)}>按该标准对齐属性</Button>
                        {linkedKey === item.key ? (
                          <Button size="small" icon={<CheckCircleOutlined />} onClick={() => linkStandard(null)}>
                            已关联，点击取消
                          </Button>
                        ) : (
                          <Button size="small" type="primary" onClick={() => linkStandard(item.key)}>
                            关联此标准，按修改提交
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Surface>

    <div className="pg-gov-actionbar">
      <div className="pg-gov-actionbar-hint">
        <div className="pg-gov-actionbar-title">
          {linkedStandard
            ? `提交后进入「运营入库审核」：本次是给 ${linkedStandard.code} 打补丁，审核通过后合并进原物料，不会重复建档`
            : '提交后进入「运营入库审核」：属性名、属性同义词与商品历史叫法随组装结果一起提交，审核通过才写入标准物料库'}
        </div>
        <div className="pg-gov-actionbar-sub">
          {currentSubmission ? (
            <>
              {currentSubmission.status === '待审核' && (
                <>
                  <Tag color="processing">审核中</Tag>
                  提交于 {currentSubmission.submittedAt} · 第 {currentSubmission.attempt} 次提交，等审核专家处理
                </>
              )}
              {currentSubmission.status === '已通过' && (
                <>
                  <Tag color="success">已入库</Tag>
                  {currentSubmission.standardCode} · 审核通过于 {currentSubmission.reviewedAt}，状态已不可修改
                </>
              )}
              {currentSubmission.status === '已驳回' && (
                <>
                  <Tag color="error">已驳回</Tag>
                  审核意见：{currentSubmission.comment || '未填写'}（修改属性后可重新提交）
                </>
              )}
            </>
          ) : linkedStandard ? (
            <>
              <Tag color="purple">修改 {linkedStandard.code}</Tag>
              {describeChanges(changes)} · 通过后合并进该标准物料，不新建
            </>
          ) : draftSavedAt ? (
            `草稿已保存 ${draftSavedAt} · 属性与历史叫法已落在本机`
          ) : (
            '草稿自动保存在本机；也可以先点「保存草稿」，确认后再提交审核'
          )}
        </div>
      </div>
      <Space>
        <Button
          icon={<SaveOutlined />}
          onClick={handleSaveDraft}
          disabled={currentSubmission?.status === '待审核' || currentSubmission?.status === '已通过'}
        >
          保存草稿
        </Button>
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => Modal.confirm({ title: '确认标记废弃？', content: '废弃记录仍保留审计链路，但不进入标准库，也不会提交审核。', onOk: () => message.success('已标记为废弃') })}
        >
          标记废弃
        </Button>
        <Tooltip
          title={
            currentSubmission?.status === '待审核'
              ? '已提交，等审核专家处理'
              : currentSubmission?.status === '已通过'
                ? '已通过审核并写入标准物料库'
                : '提交后本任务状态变为「待审核」，并跳到入库审核'
          }
        >
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSubmit}
            disabled={currentSubmission?.status === '待审核' || currentSubmission?.status === '已通过'}
          >
            {currentSubmission?.status === '已通过'
              ? '已通过入库'
              : currentSubmission?.status === '待审核'
                ? '已提交审核'
                : currentSubmission?.status === '已驳回'
                  ? '修改后重新提交'
                  : '保存并提交审核'}
          </Button>
        </Tooltip>
      </Space>
    </div>

    <Modal
      title="补充属性原子"
      open={atomOpen}
      onCancel={() => setAtomOpen(false)}
      onOk={submitAtom}
      okText="添加到当前商品"
      width={520}
      destroyOnHidden
    >
      <div className="pg-atom-form">
        <div className="pg-attribute-label">
          属性名称 <span className="pg-required-mark">必填</span>
        </div>
        <Input
          value={atomLabel}
          onChange={event => setAtomLabel(event.target.value)}
          placeholder="例如：执行标准 / 材质 / 壁厚"
          onPressEnter={submitAtom}
        />
        <div className="pg-quick-labels">
          {QUICK_LABELS.map(label => (
            <Tag
              key={label}
              color={atomLabel === label ? 'processing' : undefined}
              className="pg-quick-tag"
              onClick={() => setAtomLabel(label)}
            >
              {label}
            </Tag>
          ))}
        </div>
        <div className="pg-attribute-label" style={{ marginTop: 14 }}>
          属性值 <span className="pg-optional-mark">选填，可留空</span>
        </div>
        <Input
          value={atomValue}
          onChange={event => setAtomValue(event.target.value)}
          placeholder="可留空，后续再补"
          onPressEnter={submitAtom}
        />
        <div className="pg-attribute-label" style={{ marginTop: 14 }}>
          同义词 / 历史叫法 <span className="pg-optional-mark">选填，多个用逗号分隔</span>
        </div>
        <Input
          value={atomSynonyms}
          onChange={event => setAtomSynonyms(event.target.value)}
          placeholder="例如：规格，Φ径，断面直径"
          onPressEnter={submitAtom}
        />
        <div className="pg-ai-sub" style={{ marginTop: 10 }}>
          本页重点是核对 AI 拆出的<b>属性名对不对</b>：补充的属性会和 AI 抽取的属性一起参与组装，置信度记为 100%、标注为「手工补充」；属性值留空不影响补充与入库。
        </div>
      </div>
    </Modal>
  </>;
};
