/**
 * 采购清单附件：解析状态与结果类型。
 * 单独拆一个文件，避免 PurchaseListPage 与引用弹窗互相 import 造成循环依赖。
 */
import type { MatchedRow } from './ai/match';

export type AttachmentStage = 'parsing' | 'mapping' | 'matching' | 'done' | 'error';

export type AttachmentRecord = {
  key: string;
  fileName: string;
  size: number;
  status: AttachmentStage;
  /** 0-100，仅供细进度条使用 */
  progress: number;
  /** 小字进度文案，展示在文件名下方 */
  stageText: string;
  error?: string;
  sheetName: string;
  headers: string[];
  /** 文件里的有效数据行（未截断前的总数） */
  rowCount: number;
  /** 解析 + 匹配结果 */
  rows: MatchedRow[];
  /** 被当作合计/条款行剔除的条数 */
  skipped: number;
  durationMs: number;
  mappingSource: 'AI' | '本地' | '';
  nameColumn: string;
};

export const formatFileSize = (bytes: number) => {
  if (!bytes) return '0 KB';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

export const hitCountOf = (rows: MatchedRow[]) => rows.filter(row => row.code).length;

export const avgConfidenceOf = (rows: MatchedRow[]) => {
  const hit = rows.filter(row => row.code);
  if (!hit.length) return 0;
  return Math.round(hit.reduce((sum, row) => sum + row.confidence, 0) / hit.length);
};

export const money = (value: number) =>
  new Intl.NumberFormat('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0);
