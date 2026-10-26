import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { message } from 'antd';
import {
  governanceMaterials,
  initialPrices,
  type Atom,
  type GovernanceTask,
  type MaterialItem,
  type MaterialSubmission,
  type PageKey,
  type PriceDecision,
  type PriceRecord,
  type StandardMaterial
} from './data';
import { diffStandardChanges, mergeStandard } from './similar';
import { defaultAnalysisSubject, type PriceAnalysisSubject } from './analysisData';
import { type MappingRecord } from './mapping';
import {
  DEMO_CURSOR_KEY,
  clearDemoState,
  createInitialState,
  getStorageUsage,
  loadDemoState,
  saveDemoState,
  type PersistedDemoState
} from './storage';

type DemoContextValue = {
  page: PageKey;
  setPage: (page: PageKey) => void;
  pendingCount: number;
  standardCount: number;
  validPriceCount: number;
  standards: StandardMaterial[];
  prices: PriceRecord[];
  tasks: GovernanceTask[];
  priceDecisions: Record<string, PriceDecision>;
  currentMaterialIndex: number;
  importedFileName: string;
  setImportedFileName: (name: string) => void;
  /** 当前任务对应的导入物料（无任务时为空） */
  importedMaterials: MaterialItem[];
  /** 治理工作台当前使用的物料清单（导入数据优先，否则用内置演示物料） */
  materials: MaterialItem[];
  /** 当前正在治理的任务；null 表示内置演示物料 */
  activeTask: GovernanceTask | null;
  /** 当前任务已通过审核、写入标准物料库的物料 key（表格里判断「已入库 / 待提交」） */
  confirmedKeys: string[];
  /** 本次任务进度：completed = 已通过入库，submitted = 已提交（含待审核） */
  activeProgress: { total: number; completed: number; submitted: number; percent: number };
  /** 组装结果提交单（审核页的数据源） */
  submissions: MaterialSubmission[];
  /** 待审核的提交单条数 */
  pendingReviewCount: number;
  /** 本地快照占用，用于界面提示 */
  storageUsage: { bytes: number; items: number; savedAt: string };
  /** 从导入页确认导入：创建任务 + 跳到任务追踪 */
  completeImport: (materials: MaterialItem[], meta?: { fileName?: string; sheetName?: string }) => void;
  /** 任务追踪「去处理」：切到该任务并定位到第一条未处理物料 */
  openTask: (taskKey: string) => void;
  /** 治理工作台：直接跳到当前任务的第 index 条物料（表格行点击） */
  goToMaterial: (index: number) => void;
  /** 给当前物料补充一条属性，返回新原子的 key（便于立即勾选） */
  addAtom: (label: string, value: string, synonyms?: string[]) => string | null;
  /** 修改当前物料某条属性的内容（名 / 值 / 同义词） */
  updateAtom: (atomKey: string, patch: { label?: string; value?: string; synonyms?: string[] }) => void;
  /** 保存当前商品名称的同义词 / 历史叫法（多条） */
  updateMaterialSynonyms: (synonyms: string[]) => void;
  /** 删除当前物料的某条属性 */
  removeAtom: (atomKey: string) => void;
  /**
   * 一次写回多条属性值（相似标准「按该标准对齐」用）。
   * 连续调用 updateAtom 会互相覆盖，所以批量场景统一走这里，返回落库后的属性 key 列表。
   */
  applyAtoms: (patch: Array<{ label: string; value: string }>) => string[];
  /**
   * 组装完成后「保存并提交审核」：生成/更新提交单，任务状态转为「待审核」。
   * 返回 true 表示提交成功（页面据此跳转到入库审核）。
   */
  submitForReview: (selectedAtomKeys: string[]) => boolean;
  /**
   * 治理工作台里「这件商品并入哪条标准物料」的关联表（物料 key → 标准物料 key）。
   * 有关联 = 本次提交是「修改已有物料」，没关联 = 「新增建档」。
   */
  materialLink: Record<string, string>;
  /** 把「当前物料」关联到某条标准物料（传 null 取消关联，回到新增建档） */
  linkStandard: (standardKey: string | null) => void;
  /** 入库审核：通过（写入标准物料库）或驳回（退回治理工作台） */
  reviewSubmission: (key: string, decision: 'approve' | 'reject', comment?: string) => void;
  /** 入库审核 → 审核详情页：记录正在审核的提交单 key（详情是独立页面，不是抽屉） */
  reviewingSubmissionKey: string | null;
  /** 打开某条提交单的审核详情页 */
  openReviewDetail: (key: string) => void;
  /** 标准物料库 → 编辑页：记录正在编辑的物料 key */
  editingStandardKey: string | null;
  /** 打开标准物料编辑页 */
  openStandardEditor: (key: string) => void;
  /** 价格分析页正在分析哪件商品（采购清单「参考价 · 查看详情」/ 智能询价「价格分析」跳过来时带过去） */
  analysisSubject: PriceAnalysisSubject;
  /** 价格分析是从哪个页面进来的，决定返回按钮指向 */
  analysisFrom: PageKey;
  /** 打开某件商品的价格分析；from 记录来源页 */
  openPriceAnalysis: (subject: PriceAnalysisSubject, from?: PageKey) => void;
  /**
   * 物料映射：历史招标清单项 key → 映射结果。
   * 清单页与映射工作台共用这一份，刷新后仍在（价格复用靠它成立）。
   */
  mapping: Record<string, MappingRecord>;
  /** 批量写入映射结果（自动预映射、批量采纳、逐条确认都走它，一次 setState） */
  applyMapping: (records: Array<{ itemKey: string; record: MappingRecord }>) => void;
  /** 撤销某条清单项的映射，回到「未映射」 */
  clearMapping: (itemKey: string) => void;
  /** 当前打开映射工作台的招标项目 key */
  activeBidKey: string | null;
  /** 招标列表 → 清单映射工作台 */
  openBidProject: (projectKey: string) => void;
  /** 保存标准物料编辑结果 */
  updateStandard: (
    key: string,
    patch: Partial<
      Pick<StandardMaterial, 'code' | 'name' | 'category' | 'attributes' | 'synonyms' | 'prices' | 'attributeSynonyms'>
    >
  ) => void;
  /**
   * 跳过当前物料（不写入标准库，仅移动游标）。
   * 治理工作台已按业务要求去掉「跳过此条」入口，能力保留给任务追踪等场景后续复用。
   */
  skipMaterial: () => void;
  decidePrice: (keys: string[], decision: PriceDecision) => void;
  submitUnmatched: () => void;
  createTask: (task: GovernanceTask) => void;
  /** 清空本机数据，恢复初始演示状态 */
  resetDemo: () => void;
};

const DemoContext = createContext<DemoContextValue | null>(null);

const pad = (value: number) => String(value).padStart(2, '0');

const formatDate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** 提交时间要精确到分钟：审核页要排「谁先交的」 */
const formatDateTime = (date: Date) =>
  `${formatDate(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

/** 从多品类物料里取一个任务标签：单一品类用它，多品类只报类别数 */
const summarizeCategory = (materials: MaterialItem[]) => {
  const names = Array.from(new Set(materials.map(item => item.category).filter(Boolean)));
  if (!names.length) return '多品类';
  return names.length === 1 ? names[0] : `多品类（${names.length} 类）`;
};

/** 从 from 之后开始找下一条未提交物料；全部提交则返回 list.length（越界即"已完成"） */
const nextTodo = (list: MaterialItem[], done: Set<string>, from: number) => {
  if (!list.length) return 0;
  for (let step = 1; step <= list.length; step += 1) {
    const index = (from + step) % list.length;
    if (!done.has(list[index].key)) return index;
  }
  return list.length;
};

/** 一条物料是否已进入审核链路（待审核 / 已通过）；已驳回算"还没交" */
const isInReview = (submission: MaterialSubmission | undefined) =>
  Boolean(submission && submission.status !== '已驳回');

/** 任务进度与状态：以「已通过入库」为 completed，全部提交后转「待审核」 */
const syncTaskProgress = (task: GovernanceTask, submissions: MaterialSubmission[]): GovernanceTask => {
  if (!task.source) return task;
  const total = task.source.materials.length;
  const approved = task.source.confirmedKeys.length;
  const waiting = submissions.filter(item => item.taskKey === task.key && item.status === '待审核').length;
  const status: GovernanceTask['status'] =
    total && approved >= total ? '已完成' : total && approved + waiting >= total ? '待审核' : '进行中';
  return { ...task, completed: approved, status };
};

export const DemoProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, setState] = useState<PersistedDemoState>(() => {
    const loaded = loadDemoState();
    if (!loaded) return createInitialState();
    // 兼容早期快照：缺少 page 时回到总览；「价格入库审核」已改为「运营入库审核」
    const legacyPage = loaded.page as string;
    const page = legacyPage === 'price-review' ? 'review' : (loaded.page ?? 'overview');
    return { ...loaded, page };
  });
  const page = state.page;
  const setPage = (next: PageKey) =>
    setState(prev => (prev.page === next ? prev : { ...prev, page: next }));
  const [importedFileName, setImportedFileName] = useState('');
  const [savedAt, setSavedAt] = useState('');
  /** 标准物料编辑页正在编辑哪一条 */
  const [editingStandardKey, setEditingStandardKey] = useState<string | null>(null);
  /** 入库审核详情页正在看哪一条提交单 */
  const [reviewingSubmissionKey, setReviewingSubmissionKey] = useState<string | null>(null);
  /** 价格分析页当前分析的标的；不落本地快照，刷新回默认商品 */
  const [analysisSubject, setAnalysisSubject] = useState<PriceAnalysisSubject>(defaultAnalysisSubject);
  /** 价格分析是从哪个页面穿透进来的：决定页面上「返回」按钮回哪儿 */
  const [analysisFrom, setAnalysisFrom] = useState<PageKey>('purchase-list');

  // 任何状态变化都落一次本地快照（数据量在几十 KB，同步写足够）
  useEffect(() => {
    if (saveDemoState(state)) setSavedAt(new Date().toLocaleTimeString('zh-CN', { hour12: false }));
  }, [state]);

  const activeTask = state.activeTaskKey
    ? state.tasks.find(task => task.key === state.activeTaskKey) ?? null
    : null;

  const materials = useMemo(() => {
    const base = activeTask?.source?.materials?.length
      ? activeTask.source.materials
      : governanceMaterials;
    return base.map(item => {
      const override = state.atomOverride[item.key];
      // 商品名称同义词是单独的覆盖层，和属性改动互不影响
      const synonyms = state.materialSynonym[item.key] ?? item.synonyms ?? [];
      if (!override) return { ...item, synonyms };
      // 手工改过的属性整组覆盖，勾选态同步为新列表（新补充的属性默认已勾选）
      return { ...item, synonyms, atoms: override, selectedAtomKeys: override.map(atom => atom.key) };
    });
  }, [activeTask, state.atomOverride, state.materialSynonym]);

  const confirmedKeys = activeTask?.source?.confirmedKeys ?? [];

  /** 当前任务下的提交单：materialKey → 提交单（一条物料同时只有一条有效记录） */
  const taskSubmissions = useMemo(() => {
    const taskKey = activeTask?.key ?? null;
    const map: Record<string, MaterialSubmission> = {};
    state.submissions.forEach(item => {
      if (item.taskKey === taskKey) map[item.materialKey] = item;
    });
    return map;
  }, [state.submissions, activeTask]);

  const currentMaterialIndex = useMemo(() => {
    const cursor = state.cursors[state.activeTaskKey ?? DEMO_CURSOR_KEY] ?? 0;
    if (cursor >= 0 && cursor < materials.length) return cursor;
    if (!materials.length) return 0;
    const next = materials.findIndex(
      item => !confirmedKeys.includes(item.key) && !isInReview(taskSubmissions[item.key])
    );
    return next >= 0 ? next : materials.length;
  }, [state.cursors, state.activeTaskKey, materials, confirmedKeys, taskSubmissions]);

  const activeProgress = useMemo(() => {
    const total = materials.length;
    const completed = confirmedKeys.length;
    const submitted = materials.filter(
      item => confirmedKeys.includes(item.key) || isInReview(taskSubmissions[item.key])
    ).length;
    return { total, completed, submitted, percent: total ? Math.round((submitted / total) * 100) : 0 };
  }, [materials, confirmedKeys, taskSubmissions]);

  const storageUsage = useMemo(() => ({ ...getStorageUsage(), savedAt }), [state, savedAt]);

  /** 把游标写回当前任务（无任务时写内置演示的游标） */
  const setCursor = (cursor: number, prev: PersistedDemoState): PersistedDemoState => ({
    ...prev,
    cursors: { ...prev.cursors, [prev.activeTaskKey ?? DEMO_CURSOR_KEY]: cursor }
  });

  const completeImport: DemoContextValue['completeImport'] = (list, meta) => {
    if (!list.length) {
      message.warning('没有可导入的拆解结果');
      return;
    }
    const fileName = meta?.fileName ?? '';
    const key = `task-imp-${Date.now()}`;
    const task: GovernanceTask = {
      key,
      name: fileName ? `${fileName.replace(/\.[^.]+$/, '')} · 专家治理` : '本次导入物料专家治理',
      category: summarizeCategory(list),
      bureau: '中建八局',
      assignee: '张工',
      deadline: formatDate(addDays(new Date(), 7)),
      total: list.length,
      completed: 0,
      status: '进行中',
      source: {
        fileName,
        sheetName: meta?.sheetName,
        createdAt: new Date().toISOString(),
        materials: list,
        confirmedKeys: []
      }
    };
    setState(prev => ({
      ...prev,
      tasks: [task, ...prev.tasks],
      pendingCount: prev.pendingCount + list.length,
      activeTaskKey: key,
      cursors: { ...prev.cursors, [key]: 0 }
    }));
    setImportedFileName(fileName);
    message.success(`已创建治理任务「${task.name}」，共 ${list.length} 条物料，可在「专家任务」中开始治理`);
    // 入库只建任务，不直接把人拽进工作台：先到任务追踪确认任务已生成
    setPage('tasks');
  };

  const openTask = (taskKey: string) => {
    const task = state.tasks.find(item => item.key === taskKey);
    if (!task) return;
    if (task.source) {
      const list = task.source.materials;
      const confirmed = task.source.confirmedKeys;
      // 跳过已入库和已提交待审核的，落到第一条真正需要专家处理的
      const firstTodo = list.findIndex(item => {
        if (confirmed.includes(item.key)) return false;
        const submission = state.submissions.find(
          entry => entry.taskKey === taskKey && entry.materialKey === item.key
        );
        return !isInReview(submission);
      });
      const cursor = firstTodo >= 0 ? firstTodo : list.length;
      setState(prev => ({
        ...prev,
        activeTaskKey: taskKey,
        cursors: { ...prev.cursors, [taskKey]: cursor }
      }));
    } else {
      // 手工任务没有导入批次，沿用内置演示物料
      setState(prev => ({
        ...prev,
        activeTaskKey: taskKey,
        cursors: { ...prev.cursors, [taskKey]: prev.cursors[taskKey] ?? 0 }
      }));
    }
    setPage('governance');
  };

  /** 表格行点击：直接切到该物料 */
  const goToMaterial = (index: number) => {
    if (index < 0 || index >= materials.length) return;
    setState(prev => setCursor(index, prev));
  };

  /** 把当前物料的属性整组写回快照（补充 / 改值 / 删除共用） */
  const writeAtoms = (material: MaterialItem, next: Atom[]) => {
    setState(prev => ({
      ...prev,
      atomOverride: { ...prev.atomOverride, [material.key]: next }
    }));
  };

  const addAtom = (label: string, value: string, synonyms: string[] = []) => {
    const material = materials[currentMaterialIndex];
    if (!material) {
      message.warning('当前没有待治理物料');
      return null;
    }
    const key = `cu${Date.now().toString(36)}`;
    const words = Array.from(new Set(synonyms.map(word => word.trim()).filter(Boolean)));
    writeAtoms(material, [...material.atoms, { key, label, value, confidence: 100, synonyms: words }]);
    message.success(value ? `已补充属性「${label}」，已自动勾选` : `已补充属性「${label}」（值为空），已自动勾选`);
    return key;
  };

  const updateAtom = (atomKey: string, patch: { label?: string; value?: string; synonyms?: string[] }) => {
    const material = materials[currentMaterialIndex];
    if (!material) return;
    writeAtoms(
      material,
      material.atoms.map(atom => (atom.key === atomKey ? { ...atom, ...patch } : atom))
    );
  };

  /** 商品名称同义词：整组覆盖写回快照 */
  const updateMaterialSynonyms = (synonyms: string[]) => {
    const material = materials[currentMaterialIndex];
    if (!material) return;
    const cleaned = Array.from(new Set(synonyms.map(word => word.trim()).filter(Boolean)));
    setState(prev => ({
      ...prev,
      materialSynonym: { ...prev.materialSynonym, [material.key]: cleaned }
    }));
  };

  const removeAtom = (atomKey: string) => {
    const material = materials[currentMaterialIndex];
    if (!material) return;
    const target = material.atoms.find(atom => atom.key === atomKey);
    if (target?.label === '品类') {
      message.warning('品类属性是标准物料的主键，不能删除');
      return;
    }
    writeAtoms(material, material.atoms.filter(atom => atom.key !== atomKey));
    message.success('已移除该属性');
  };

  /** 批量对齐属性值：同名属性改值，缺失属性补进列表，属性名与已登记同义词保持不变 */
  const applyAtoms: DemoContextValue['applyAtoms'] = patch => {
    const material = materials[currentMaterialIndex];
    if (!material || !patch.length) return [];
    const stamp = Date.now().toString(36);
    const next = material.atoms.map(atom => ({ ...atom }));
    patch.forEach((entry, index) => {
      const at = next.findIndex(atom => atom.label === entry.label);
      if (at >= 0) next[at] = { ...next[at], value: entry.value };
      else next.push({ key: `cu${stamp}${index}`, label: entry.label, value: entry.value, confidence: 100 });
    });
    writeAtoms(material, next);
    message.success(`已按标准物料对齐 ${patch.length} 条属性值`);
    return next.map(atom => atom.key);
  };

  const submitForReview: DemoContextValue['submitForReview'] = selectedAtomKeys => {
    const material = materials[currentMaterialIndex];
    if (!material) {
      message.warning('本任务物料已全部处理，可在「专家任务」中查看进度');
      return false;
    }
    const selectedAtoms = material.atoms.filter(atom => selectedAtomKeys.includes(atom.key));
    if (!selectedAtoms.length) {
      message.warning('请至少勾选一个属性原子再提交');
      return false;
    }
    // 品类是标准物料主键：不勾它，提交上去也无法归类
    if (!selectedAtoms.some(atom => atom.label === '品类')) {
      message.warning('「品类」是标准物料主键，必须保留');
      return false;
    }
    const taskKey = state.activeTaskKey;
    const existing = state.submissions.find(
      item => item.taskKey === taskKey && item.materialKey === material.key
    );
    if (existing?.status === '已通过') {
      message.info(`该物料已通过审核并写入标准物料库（${existing.standardCode ?? '已建档'}），无需重复提交`);
      return false;
    }

    // 属性值非必填：专家核对的是「属性名对不对」，值可以留空由审核补充
    const nameParts = selectedAtoms.map(atom => atom.value.trim()).filter(Boolean);
    const name = nameParts.length ? nameParts.join(' ') : material.sourceName;
    const atoms = selectedAtoms.map(atom => ({
      label: atom.label,
      value: atom.value.trim(),
      synonyms: Array.from(new Set((atom.synonyms ?? []).map(word => word.trim()).filter(Boolean)))
    }));
    // 商品名称同义词：专家登记的多条历史叫法 + 原始描述兜底，去重后随提交单一起交给审核
    const synonyms = Array.from(
      new Set([...(material.synonyms ?? []), material.sourceName].map(word => word.trim()).filter(Boolean))
    );
    // 提交方式：关联了某条标准物料就是「修改」，否则「新增建档」
    // diff 在这里算一次快照进提交单，审核页展示的就是专家提交那一刻的差异
    const linkKey = state.materialLink[material.key];
    const target = linkKey ? state.standards.find(std => std.key === linkKey) : undefined;
    const changes = target ? diffStandardChanges(atoms, synonyms, target) : [];
    const submission: MaterialSubmission = {
      key: existing?.key ?? `sub-${Date.now().toString(36)}`,
      taskKey,
      taskName: activeTask?.name ?? '内置演示物料',
      materialKey: material.key,
      sourceName: material.sourceName,
      name,
      category: material.category,
      unit: material.unit,
      bureau: material.bureau,
      atoms,
      synonyms,
      changeType: target ? 'update' : 'new',
      targetStandardKey: target?.key,
      targetStandardCode: target?.code,
      targetStandardName: target?.name,
      changes,
      submitter: activeTask?.assignee ?? '张工',
      submittedAt: formatDateTime(new Date()),
      attempt: (existing?.attempt ?? 0) + 1,
      status: '待审核'
    };

    setState(prev => {
      const submissions = existing
        ? prev.submissions.map(item => (item.key === existing.key ? submission : item))
        : [submission, ...prev.submissions];
      const tasks = prev.activeTaskKey
        ? prev.tasks.map(item => (item.key === prev.activeTaskKey ? syncTaskProgress(item, submissions) : item))
        : prev.tasks;
      // 提交完自动落到下一条还没提交的物料，专家回到本页可以直接继续
      const done = new Set<string>([
        ...confirmedKeys,
        ...submissions
          .filter(item => item.taskKey === taskKey && item.status !== '已驳回')
          .map(item => item.materialKey)
      ]);
      return setCursor(nextTodo(materials, done, currentMaterialIndex), {
        ...prev,
        submissions,
        tasks
      });
    });

    message.success(
      target
        ? changes.length
          ? `已提交 ${changes.length} 项变更（合并进 ${target.code}），任务状态同步为待审核；审核通过后才会写回标准物料`
          : `已提交为「修改 ${target.code}」的关联申请（当前无属性变更），等审核专家确认`
        : `已提交「${name}」入库审核，任务状态同步为待审核；审核专家确认后才会写入标准物料库`
    );
    return true;
  };

  const reviewSubmission: DemoContextValue['reviewSubmission'] = (key, decision, comment) => {
    const submission = state.submissions.find(item => item.key === key);
    if (!submission) return;
    if (submission.status !== '待审核') {
      message.warning('该提交单不在待审核状态，无法重复处理');
      return;
    }
    const reviewer = '审核专家 · 王敏';
    const now = formatDateTime(new Date());

    if (decision === 'reject') {
      const reason = (comment ?? '').trim();
      if (!reason) {
        message.warning('驳回需要填写审核意见，说明退回原因');
        return;
      }
      setState(prev => {
        const submissions = prev.submissions.map(item =>
          item.key === key
            ? { ...item, status: '已驳回' as const, comment: reason, reviewer, reviewedAt: now }
            : item
        );
        return {
          ...prev,
          submissions,
          tasks: prev.tasks.map(task => (task.key === submission.taskKey ? syncTaskProgress(task, submissions) : task))
        };
      });
      message.success(`已驳回「${submission.name}」，退回业务专家修改后重新提交`);
      return;
    }

    // 通过：按「提交方式」分两条路走
    // - 新增建档：落成一条新标准物料，自动生成编码
    // - 修改已有：把属性 / 属性同义词 / 商品历史叫法合并进目标标准，
    //   标准编码、名称、品类路径与价格记录一律保留（这是「修改」不是「重建」）
    const today = formatDate(new Date());
    const target = submission.changeType === 'update' && submission.targetStandardKey
      ? state.standards.find(std => std.key === submission.targetStandardKey)
      : undefined;
    const created = !target;
    const standardKey = target?.key ?? `s-${Date.now()}`;
    const resultCode = target?.code ?? `STD-AI-${String(state.standards.length + 1).padStart(6, '0')}`;
    let nextStandards: StandardMaterial[];
    if (target) {
      nextStandards = state.standards.map(std =>
        std.key === target.key ? mergeStandard(std, submission.atoms, submission.synonyms, today) : std
      );
    } else {
      // 新增建档：属性同义词按属性名整组写入，历史文件再导入时可直接归并
      const attributeSynonyms: Record<string, string[]> = {};
      submission.atoms.forEach(atom => {
        if (atom.synonyms.length) attributeSynonyms[atom.label] = atom.synonyms;
      });
      nextStandards = [
        {
          key: standardKey,
          code: resultCode,
          name: submission.name,
          category: `建材 / ${submission.category}`,
          attributes: submission.atoms.map(atom => {
            const value = atom.value || (atom.label === '品类' ? submission.category : '待补充');
            return `${atom.label}：${value}`;
          }),
          synonyms: submission.synonyms,
          attributeSynonyms,
          prices: 0,
          updatedAt: today
        },
        ...state.standards
      ];
    }

    setState(prev => {
      const submissions = prev.submissions.map(item =>
        item.key === key
          ? {
              ...item,
              status: '已通过' as const,
              reviewer,
              reviewedAt: now,
              comment: (comment ?? '').trim() || item.comment,
              standardKey,
              standardCode: resultCode
            }
          : item
      );
      const tasks = prev.tasks.map(task => {
        if (task.key !== submission.taskKey || !task.source) return task;
        const confirmed = task.source.confirmedKeys.includes(submission.materialKey)
          ? task.source.confirmedKeys
          : [...task.source.confirmedKeys, submission.materialKey];
        return syncTaskProgress(
          { ...task, source: { ...task.source, confirmedKeys: confirmed } },
          submissions
        );
      });
      return {
        ...prev,
        submissions,
        tasks,
        standards: nextStandards,
        standardCount: created ? prev.standardCount + 1 : prev.standardCount,
        pendingCount: Math.max(0, prev.pendingCount - 1)
      };
    });

    message.success(
      created
        ? `已通过审核，「${submission.name}」写入标准物料库 ${resultCode}`
        : `已通过审核，${submission.changes.length} 项变更已合并进标准物料 ${resultCode}`
    );
  };

  const skipMaterial = () => {
    const material = materials[currentMaterialIndex];
    if (!material) return;
    const done = new Set([
      ...confirmedKeys,
      ...state.submissions
        .filter(item => item.taskKey === (activeTask?.key ?? null) && item.status !== '已驳回')
        .map(item => item.materialKey)
    ]);
    const next = nextTodo(materials, done, currentMaterialIndex);
    if (next >= materials.length) {
      message.info('没有其它待处理物料了，请提交当前物料或结束任务');
      return;
    }
    setState(prev => setCursor(next, prev));
    message.info(`已跳过，切换到第 ${next + 1}/${materials.length} 条`);
  };

  const decidePrice = (keys: string[], decision: PriceDecision) => {
    const freshAccepted = keys.filter(key => decision === '采用' && state.priceDecisions[key] !== '采用').length;
    const removedAccepted = keys.filter(key => decision !== '采用' && state.priceDecisions[key] === '采用').length;
    setState(prev => ({
      ...prev,
      priceDecisions: { ...prev.priceDecisions, ...Object.fromEntries(keys.map(key => [key, decision])) },
      validPriceCount: prev.validPriceCount + freshAccepted - removedAccepted
    }));
    message.success(`${keys.length} 条价格记录已标记为“${decision}”`);
  };

  const submitUnmatched = () => {
    setState(prev => ({ ...prev, pendingCount: prev.pendingCount + 1 }));
    message.success('未匹配清单已提交治理，已生成待处理任务');
    setPage('governance');
  };

  const createTask = (task: GovernanceTask) => {
    setState(prev => ({ ...prev, tasks: [task, ...prev.tasks] }));
    message.success('治理任务已创建并通知专家');
  };

  /** 标准物料库 → 编辑页 */
  const openStandardEditor = (key: string) => {
    setEditingStandardKey(key);
    setPage('standards-edit');
  };

  /** 入库审核列表 → 审核详情页（独立页面，不用右侧浮窗） */
  const openReviewDetail = (key: string) => {
    setReviewingSubmissionKey(key);
    setPage('review-detail');
  };

  /** 采购清单「参考价 · 查看详情」/ 智能询价「价格分析」→ 价格分析：带着这件商品跳过去 */
  const openPriceAnalysis = (subject: PriceAnalysisSubject, from: PageKey = 'purchase-list') => {
    setAnalysisSubject(subject);
    setAnalysisFrom(from);
    setPage('analysis');
  };

  /** 招标列表 → 清单映射工作台 */
  const openBidProject = (projectKey: string) => {
    setState(prev => ({ ...prev, activeBidKey: projectKey, page: 'mapping-detail' }));
  };

  /**
   * 批量写映射结果。
   * 自动预映射一次可能写入几十条，逐条 setState 会把渲染打散，所以统一合并成一次更新。
   */
  const applyMapping: DemoContextValue['applyMapping'] = records => {
    if (!records.length) return;
    setState(prev => {
      const mapping = { ...prev.mapping };
      records.forEach(entry => {
        mapping[entry.itemKey] = entry.record;
      });
      return { ...prev, mapping };
    });
  };

  const clearMapping = (itemKey: string) => {
    setState(prev => {
      if (!prev.mapping[itemKey]) return prev;
      const mapping = { ...prev.mapping };
      delete mapping[itemKey];
      return { ...prev, mapping };
    });
  };

  /**
   * 治理工作台：把当前物料关联到某条标准物料（= 本次按「修改已有物料」提交）。
   * 传 null 取消关联，回到「新增建档」。只存关联关系，diff 在提交时按最新标准现算。
   */  const linkStandard = (standardKey: string | null) => {
    const material = materials[currentMaterialIndex];
    if (!material) return;
    const target = standardKey ? state.standards.find(std => std.key === standardKey) ?? null : null;
    setState(prev => {
      const materialLink = { ...prev.materialLink };
      if (target) materialLink[material.key] = target.key;
      else delete materialLink[material.key];
      return { ...prev, materialLink };
    });
    if (target) {
      message.success(`本次按「修改标准物料 ${target.code}」提交，审核通过后合并进它，不会重复建档`);
    } else {
      message.info('已取消关联，本次提交将作为新标准物料建档');
    }
  };

  const updateStandard = (
    key: string,
    patch: Partial<
      Pick<StandardMaterial, 'code' | 'name' | 'category' | 'attributes' | 'synonyms' | 'prices' | 'attributeSynonyms'>
    >
  ) => {
    const today = formatDate(new Date());
    setState(prev => ({
      ...prev,
      standards: prev.standards.map(item =>
        item.key === key ? { ...item, ...patch, updatedAt: today } : item
      )
    }));
    message.success('标准物料已保存，价格匹配与询价将使用新内容');
  };

  const resetDemo = () => {
    clearDemoState();
    setState(createInitialState());
    setImportedFileName('');
    setSavedAt('');
    setEditingStandardKey(null);
    message.success('已清除本机数据，恢复为初始演示状态');
  };

  const value: DemoContextValue = {
    page,
    setPage,
    pendingCount: state.pendingCount,
    standardCount: state.standardCount,
    validPriceCount: state.validPriceCount,
    standards: state.standards,
    prices: initialPrices,
    tasks: state.tasks,
    priceDecisions: state.priceDecisions,
    currentMaterialIndex,
    importedFileName,
    setImportedFileName,
    importedMaterials: activeTask?.source?.materials ?? [],
    materials,
    activeTask,
    confirmedKeys,
    activeProgress,
    submissions: state.submissions,
    pendingReviewCount: state.submissions.filter(item => item.status === '待审核').length,
    storageUsage,
    completeImport,
    openTask,
    goToMaterial,
    addAtom,
    updateAtom,
    updateMaterialSynonyms,
    removeAtom,
    applyAtoms,
    submitForReview,
    materialLink: state.materialLink,
    linkStandard,
    reviewSubmission,
    reviewingSubmissionKey,
    openReviewDetail,
    editingStandardKey,
    openStandardEditor,
    analysisSubject,
    analysisFrom,
    openPriceAnalysis,
    mapping: state.mapping,
    applyMapping,
    clearMapping,
    activeBidKey: state.activeBidKey,
    openBidProject,
    updateStandard,
    skipMaterial,
    decidePrice,
    submitUnmatched,
    createTask,
    resetDemo
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
};

export const useDemo = () => {
  const value = useContext(DemoContext);
  if (!value) throw new Error('useDemo must be used inside DemoProvider');
  return value;
};
