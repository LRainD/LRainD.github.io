/**
 * 前端本地持久化（localStorage）。
 *
 * 原型没有后端，但治理闭环必须跨刷新成立，所以把「会变的状态」整体快照到本机：
 * - 计数器（待治理 / 标准物料 / 有效价格）
 * - 标准物料库、治理任务（含导入批次物料）、价格决策
 * - 当前治理中的任务与每条任务的物料游标
 *
 * 设计要点：
 * 1. 带 version，结构升级时旧数据自动失效，避免脏数据把页面搞崩；
 * 2. 读写全部 try/catch，localStorage 不可用（隐私模式 / 配额满）时静默降级为纯内存；
 * 3. 只存可序列化数据，MaterialItem / StandardMaterial 均为纯对象。
 */
import {
  initialPrices,
  initialStandards,
  initialSubmissions,
  initialTasks,
  type Atom,
  type GovernanceTask,
  type MaterialSubmission,
  type PageKey,
  type PriceDecision,
  type StandardMaterial
} from './data';
import { diffStandardChanges } from './similar';
import { initialMappings, type MappingRecord } from './mapping';

export const DEMO_STORAGE_KEY = 'ampg:demo:v1';
export const DEMO_STORAGE_VERSION = 3;

/**
 * 编制采购清单的草稿单独存一个 key。
 * 不塞进主快照的原因：附件解析结果（每行都带匹配明细）体积大，混进去会拖慢其它页面每一次读写；
 * 而清单草稿只在清单页用，读写都在页面内部完成（见 PurchaseListPage），这里只负责声明 key 与统一清理。
 */
export const PURCHASE_DRAFT_KEY = 'ampg:purchase-draft:v1';

export type PersistedDemoState = {
  version: number;
  /** 刷新后停留在原页面 */
  page: PageKey;
  pendingCount: number;
  standardCount: number;
  validPriceCount: number;
  standards: StandardMaterial[];
  tasks: GovernanceTask[];
  priceDecisions: Record<string, PriceDecision>;
  /** 当前在治理工作台处理的任务；null 表示使用内置演示物料 */
  activeTaskKey: string | null;
  /** 每个任务（含内置演示）当前处理到第几条 */
  cursors: Record<string, number>;
  /** 治理工作台里对属性的手工改动（补充 / 修值 / 删除 / 同义词），按物料 key 整组覆盖 */
  atomOverride: Record<string, Atom[]>;
  /** 治理工作台里改过的商品名称同义词 / 历史叫法，按物料 key 覆盖 */
  materialSynonym: Record<string, string[]>;
  /** 组装结果提交单：专家提交 → 审核通过/驳回，是「入库审核」页的唯一数据源 */
  submissions: MaterialSubmission[];
  /**
   * 治理工作台里「这件商品要并入哪条标准物料」的关联：物料 key → 标准物料 key。
   * 有关联 = 本次按「修改已有物料」提交；没关联 = 按「新增建档」提交。
   */
  materialLink: Record<string, string>;
  /**
   * 物料映射：历史招标清单项 key → 映射结果。
   * 这是「历史价格能不能按标准口径复用」的唯一凭据，必须跟着快照走，刷新不能丢。
   */
  mapping: Record<string, MappingRecord>;
  /** 物料映射工作台当前打开的招标项目：刷新后还停在原项目的清单上 */
  activeBidKey: string | null;
};

/** 内置演示数据的游标 key：没选任务时治理工作台默认展示的钢筋样例 */
export const DEMO_CURSOR_KEY = '__demo__';

/**
 * 演示种子的变更明细按目标标准物料现算，而不是手写。
 * 这样 diff 只有一处实现，种子数据与真实提交走同一套算法，不会出现「种子显示 3 项、提交显示 4 项」。
 */
const withComputedChanges = (item: MaterialSubmission): MaterialSubmission => {
  if (item.changeType !== 'update') return { ...item, changes: [] };
  const target = initialStandards.find(std => std.key === item.targetStandardKey);
  return {
    ...item,
    changes: target ? diffStandardChanges(item.atoms, item.synonyms, target) : []
  };
};

/**
 * 从「修改已有物料」的提交单反推治理台的关联表。
 * 种子提交单是已经提交过的，如果关联表空着，专家打开这条物料会看到「未关联」的状态，
 * 与审核页显示的「修改已有」自相矛盾。
 */
const deriveMaterialLink = (submissions: MaterialSubmission[]): Record<string, string> => {
  const link: Record<string, string> = {};
  submissions.forEach(item => {
    if (item.changeType === 'update' && item.targetStandardKey) {
      link[item.materialKey] = item.targetStandardKey;
    }
  });
  return link;
};

export const createInitialState = (): PersistedDemoState => ({
  version: DEMO_STORAGE_VERSION,
  // 演示动线从「数据接入清洗」开始：首次打开就落在闭环的第一步，
  // 「治理总览」是整条链路跑完后的收尾页，排在菜单最后，不再做默认页
  page: 'import',
  pendingCount: 1287,
  standardCount: 12480,
  validPriceCount: 86421,
  standards: initialStandards.map(item => ({ ...item })),
  tasks: initialTasks.map(item => ({ ...item })),
  priceDecisions: {},
  activeTaskKey: null,
  // 演示种子把 m1 / m2 都放进了审核链路、m3 是已驳回的，
  // 初始游标直接落在 m3：一进治理工作台就是「驳回后改完重新提交」的场景
  cursors: { [DEMO_CURSOR_KEY]: 2 },
  atomOverride: {},
  materialSynonym: {},
  submissions: initialSubmissions.map(withComputedChanges),
  materialLink: deriveMaterialLink(initialSubmissions),
  mapping: initialMappings(),
  activeBidKey: null
});

const hasWindow = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const isArray = (value: unknown): value is unknown[] => Array.isArray(value);

/** 只做必要校验：结构不对就整体回退，避免半残数据导致页面空转 */
const isValid = (value: unknown): value is PersistedDemoState => {
  if (!value || typeof value !== 'object') return false;
  const data = value as Partial<PersistedDemoState>;
  if (data.version !== DEMO_STORAGE_VERSION) return false;
  if (!isArray(data.standards) || !isArray(data.tasks)) return false;
  if (!data.tasks.every(task => task && typeof (task as GovernanceTask).key === 'string')) return false;
  return true;
};

export const loadDemoState = (): PersistedDemoState | null => {
  if (!hasWindow()) return null;
  try {
    const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isValid(parsed)) return null;
    // 旧快照没有 atomOverride / materialSynonym，补默认值而不是让整份数据失效
    // seed 标准物料会随版本增补（清单引用需要更完整的候选集），旧快照按 key 补齐缺失项
    const seeded = parsed.standards.slice();
    initialStandards.forEach(item => {
      if (!seeded.some(existing => existing.key === item.key)) seeded.push({ ...item });
    });
    // 更早的提交单没有「提交方式」概念，一律按新增建档回填，避免审核页取不到字段
    const submissions = (parsed.submissions ?? initialSubmissions.map(withComputedChanges)).map(item => ({
      ...item,
      changeType: item.changeType ?? 'new',
      changes: item.changes ?? []
    }));
    return {
      ...parsed,
      standards: seeded,
      atomOverride: parsed.atomOverride ?? {},
      materialSynonym: parsed.materialSynonym ?? {},
      // 旧快照没有审核提交单：按 key 补回演示数据，而不是让整份快照失效
      submissions,
      materialLink: parsed.materialLink ?? deriveMaterialLink(submissions),
      // 旧快照没有物料映射：补一份演示种子，而不是让整个页面对着一堆未映射空表
      mapping: parsed.mapping ?? initialMappings(seeded, initialPrices),
      activeBidKey: parsed.activeBidKey ?? null
    };
  } catch {
    return null;
  }
};

export const saveDemoState = (state: PersistedDemoState): boolean => {
  if (!hasWindow()) return false;
  try {
    window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    // 配额满（导入物料过多）时不再重试，保证页面可用
    return false;
  }
};

export const clearDemoState = () => {
  if (!hasWindow()) return;
  try {
    window.localStorage.removeItem(DEMO_STORAGE_KEY);
    window.localStorage.removeItem(IMPORT_DRAFT_KEY);
    window.localStorage.removeItem(PURCHASE_DRAFT_KEY);
  } catch {
    /* ignore */
  }
};

/* ========== 导入页草稿：拆解结果持久化，刷新后可恢复 ========== */

export const IMPORT_DRAFT_KEY = 'ampg:import-draft:v1';
const IMPORT_DRAFT_VERSION = 2;

export type ImportDraftAtom = { label: string; value: string; confidence: number };

export type ImportDraftItem = {
  key: string;
  idx: number;
  raw: string;
  spec: string;
  unit: string;
  quantity: string;
  price: string;
  name: string;
  category: string;
  atoms: ImportDraftAtom[];
  confidence: number;
  status: 'done' | 'error' | 'pending' | 'running';
  error?: string;
};

export type ImportDraft = {
  version: number;
  fileName: string;
  sheetName?: string;
  updatedAt: string;
  items: ImportDraftItem[];
};

export const loadImportDraft = (): ImportDraft | null => {
  if (!hasWindow()) return null;
  try {
    const raw = window.localStorage.getItem(IMPORT_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ImportDraft;
    if (!parsed || parsed.version !== IMPORT_DRAFT_VERSION || !Array.isArray(parsed.items)) return null;
    if (!parsed.items.length) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const saveImportDraft = (draft: Omit<ImportDraft, 'version'>) => {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(
      IMPORT_DRAFT_KEY,
      JSON.stringify({ ...draft, version: IMPORT_DRAFT_VERSION })
    );
  } catch {
    /* ignore */
  }
};

export const clearImportDraft = () => {
  if (!hasWindow()) return;
  try {
    window.localStorage.removeItem(IMPORT_DRAFT_KEY);
  } catch {
    /* ignore */
  }
};

/** 本地快照占用体积（KB），用于界面上提示"数据已存在本机" */
export const getStorageUsage = (): { bytes: number; items: number } => {
  if (!hasWindow()) return { bytes: 0, items: 0 };
  let bytes = 0;
  let items = 0;
  try {
    [DEMO_STORAGE_KEY, IMPORT_DRAFT_KEY].forEach(key => {
      const value = window.localStorage.getItem(key);
      if (!value) return;
      bytes += value.length;
      items += 1;
    });
  } catch {
    /* ignore */
  }
  return { bytes, items };
};
