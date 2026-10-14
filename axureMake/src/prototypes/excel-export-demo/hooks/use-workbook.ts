/**
 * Excel 导出预览演示 —— 工作簿状态与 Excel 命令实现
 *
 * 坐标约定：
 * - dr（display row）：0 = 表头行（Excel 第 1 行），1..n = 数据行（Excel 第 2..n+1 行），
 *   n+1 = 合计行（Excel 第 n+2 行）
 * - c：列索引 0..13，对应列字母 A..N
 */

import { useCallback, useMemo, useRef, useState } from 'react';
import { CellValue, COLUMNS, NumFmt, ROWS } from '../data';

export type CellAlign = 'left' | 'center' | 'right';
export type CellVAlign = 'top' | 'middle' | 'bottom';

export interface CellStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: CellAlign;
  valign?: CellVAlign;
  color?: string;
  bg?: string;
  wrap?: boolean;
  numFmt?: NumFmt;
  decimals?: number;
  /** 字号缩放（功能区"增大字号"） */
  fontScale?: number;
}

export interface MergeRange {
  r0: number;
  c0: number;
  r1: number;
  c1: number;
}

export interface Selection {
  /** 活动单元格 */
  r: number;
  c: number;
  /** 选区终点 */
  r2: number;
  c2: number;
}

export interface FilterState {
  col: number;
  values: CellValue[];
}

const KEY = (dr: number, c: number) => `${dr}:${c}`;

/** 千分位格式化 */
const groupThousands = (n: number, decimals: number): string => {
  const fixed = Math.abs(n).toFixed(decimals);
  const [int, dec] = fixed.split('.');
  const withSep = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const sign = n < 0 ? '-' : '';
  return dec ? `${sign}${withSep}.${dec}` : `${sign}${withSep}`;
};

export interface WorkbookApi {
  columns: typeof COLUMNS;
  /** 全部显示行（含表头与合计行） */
  displayRows: CellValue[][];
  /** 可见的显示行索引（表头 0 + 筛选后的数据行 + 合计行） */
  visibleRowIdx: number[];
  totalRowIdx: number;
  dataRowCount: number;
  selection: Selection;
  setSelection: (s: Selection) => void;
  selectCell: (dr: number, c: number, extend?: boolean) => void;
  styles: Record<string, CellStyle>;
  merges: MergeRange[];
  filters: FilterState[];
  findTerm: string;
  showTotal: boolean;
  setShowTotal: (v: boolean) => void;
  // 单元格读写
  getDisplayValue: (dr: number, c: number) => string;
  getFormula: (dr: number, c: number) => string;
  getRawValue: (dr: number, c: number) => CellValue;
  setCellValue: (dr: number, c: number, v: string) => void;
  // 格式命令
  toggleStyle: (patch: (s: CellStyle) => CellStyle) => void;
  applyStylePatch: (patch: CellStyle) => void;
  clearStyle: () => void;
  mergeCells: () => void;
  unmergeCells: () => void;
  // 结构命令
  insertRow: () => void;
  deleteRow: () => void;
  clearContent: () => void;
  autoSum: () => void;
  // 数据命令
  sortByColumn: (c: number, dir: 'asc' | 'desc') => void;
  setFilter: (c: number, values: CellValue[] | null) => void;
  setFindTerm: (t: string) => void;
  copySelection: () => void;
  // 提示条
  notice: string | null;
  notify: (msg: string) => void;
}

export function useWorkbook(): WorkbookApi {
  const [header, setHeader] = useState<string[]>(() => COLUMNS.map((c) => c.label));
  const [rows, setRows] = useState<CellValue[][]>(() => ROWS.map((r) => [...r]));
  const [styles, setStyles] = useState<Record<string, CellStyle>>({});
  const [merges, setMerges] = useState<MergeRange[]>([]);
  const [selection, setSelection] = useState<Selection>({ r: 1, c: 0, r2: 1, c2: 0 });
  const [filters, setFilters] = useState<FilterState[]>([]);
  const [findTerm, setFindTerm] = useState('');
  const [showTotal, setShowTotal] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimer = useRef<number | null>(null);

  const notify = useCallback((msg: string) => {
    setNotice(msg);
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(null), 2400);
  }, []);

  /** 数值格式化 */
  const formatNumber = useCallback((value: number, fmt: NumFmt, decimals?: number) => {
    switch (fmt) {
      case 'currency':
        return `¥${groupThousands(value, decimals ?? 2)}`;
      case 'thousand':
        return groupThousands(value, decimals ?? 2);
      case 'percent':
        return `${groupThousands(value * 100, decimals ?? 2)}%`;
      case 'decimal0':
        return groupThousands(value, decimals ?? 0);
      case 'decimal1':
        return groupThousands(value, decimals ?? 1);
      case 'decimal3':
        return groupThousands(value, decimals ?? 3);
      case 'decimal2':
        return groupThousands(value, decimals ?? 2);
      default:
        return Number.isInteger(value) ? String(value) : String(value);
    }
  }, []);

  const totalRowIdx = rows.length + 1;

  /** 合计行数值（金额求和 + 节资率按总额重算） */
  const totalValues = useMemo<CellValue[]>(() => {
    const arr: CellValue[] = COLUMNS.map(() => null);
    arr[0] = '合计';
    const sum = (idx: number) => rows.reduce((s, r) => s + (typeof r[idx] === 'number' ? (r[idx] as number) : 0), 0);
    const budget = sum(5);
    const bid = sum(6);
    arr[5] = budget;
    arr[6] = bid;
    arr[7] = budget ? (budget - bid) / budget : 0;
    return arr;
  }, [rows]);

  /** 节资率 = （预算 - 中标）/ 预算 */
  const computeSavingRate = useCallback((row: CellValue[]) => {
    const budget = typeof row[5] === 'number' ? (row[5] as number) : 0;
    const bid = typeof row[6] === 'number' ? (row[6] as number) : 0;
    return budget ? (budget - bid) / budget : 0;
  }, []);

  /** 显示行：表头 + 数据 + 合计 */
  const baseRows = useMemo<CellValue[][]>(() => {
    const data = rows.map((r) => {
      const copy = [...r];
      copy[7] = computeSavingRate(r);
      return copy;
    });
    const head = [...header] as CellValue[];
    const all: CellValue[][] = [head, ...data];
    if (showTotal) all.push(totalValues);
    return all;
  }, [header, rows, showTotal, totalValues, computeSavingRate]);

  /** 筛选后的可见行索引 */
  const visibleRowIdx = useMemo<number[]>(() => {
    const out: number[] = [0];
    rows.forEach((row, i) => {
      const hidden = filters.some((f) => !f.values.includes(row[f.col]));
      if (!hidden) out.push(i + 1);
    });
    if (showTotal) out.push(totalRowIdx);
    return out;
  }, [rows, filters, showTotal, totalRowIdx]);

  const getRawValue = useCallback(
    (dr: number, c: number): CellValue => {
      const row = baseRows[dr];
      return row ? row[c] : null;
    },
    [baseRows],
  );

  const getCellStyle = useCallback((dr: number, c: number): CellStyle => styles[KEY(dr, c)] ?? {}, [styles]);

  /** 显示文本（含格式化与 ##### 判定交给网格层） */
  const getDisplayValue = useCallback(
    (dr: number, c: number): string => {
      const col = COLUMNS[c];
      if (!col) return '';
      const raw = getRawValue(dr, c);
      if (raw === null || raw === undefined || raw === '') {
        return ['currency', 'percent', 'number'].includes(col.type) && dr !== 0 ? '-' : '';
      }
      const st = getCellStyle(dr, c);
      if (typeof raw === 'number') {
        const fmt = st.numFmt ?? col.numFmt ?? 'general';
        return formatNumber(raw, fmt, st.decimals);
      }
      return String(raw);
    },
    [getRawValue, getCellStyle, formatNumber],
  );

  /** 公式栏文本：还原 Excel 公式 */
  const getFormula = useCallback(
    (dr: number, c: number): string => {
      if (dr === 0) return header[c] ?? '';
      if (dr === totalRowIdx) {
        const excelRow = dr + 1;
        if (c === 5 || c === 6) {
          const letter = String.fromCharCode(65 + c);
          return `=SUM(${letter}2:${letter}${rows.length + 1})`;
        }
        if (c === 7) return `=(F${excelRow}-G${excelRow})/F${excelRow}`;
        return c === 0 ? '合计' : '';
      }
      if (COLUMNS[c]?.key === 'savingRate') {
        const r = dr + 1;
        return `=(F${r}-G${r})/F${r}`;
      }
      const raw = getRawValue(dr, c);
      return raw === null || raw === undefined ? '' : String(raw);
    },
    [totalRowIdx, rows.length, header, getRawValue],
  );

  const setCellValue = useCallback(
    (dr: number, c: number, v: string) => {
      if (dr === 0) {
        setHeader((prev) => prev.map((h, i) => (i === c ? v : h)));
        notify(`已修改表头 ${String.fromCharCode(65 + c)}1`);
        return;
      }
      if (dr === totalRowIdx) {
        notify('合计行为公式单元格，不可直接编辑（与 Excel 表格结构一致）');
        return;
      }
      const col = COLUMNS[c];
      const dataIdx = dr - 1;
      let parsed: CellValue = v;
      if (['currency', 'percent', 'number', 'index'].includes(col.type)) {
        const cleaned = v.replace(/[¥,%\s]/g, '');
        const num = Number(cleaned);
        parsed = cleaned !== '' && !Number.isNaN(num) ? (col.type === 'percent' && v.includes('%') ? num / 100 : num) : v;
      }
      setRows((prev) => prev.map((row, i) => (i === dataIdx ? row.map((cell, j) => (j === c ? parsed : cell)) : row)));
    },
    [totalRowIdx, notify],
  );

  /** 对当前选区应用样式变更 */
  const applyStylePatch = useCallback(
    (patch: CellStyle) => {
      const r0 = Math.min(selection.r, selection.r2);
      const r1 = Math.max(selection.r, selection.r2);
      const c0 = Math.min(selection.c, selection.c2);
      const c1 = Math.max(selection.c, selection.c2);
      setStyles((prev) => {
        const next = { ...prev };
        for (let r = r0; r <= r1; r += 1) {
          for (let c = c0; c <= c1; c += 1) {
            next[KEY(r, c)] = { ...next[KEY(r, c)], ...patch };
          }
        }
        return next;
      });
    },
    [selection],
  );

  const toggleStyle = useCallback(
    (patch: (s: CellStyle) => CellStyle) => {
      const r0 = Math.min(selection.r, selection.r2);
      const r1 = Math.max(selection.r, selection.r2);
      const c0 = Math.min(selection.c, selection.c2);
      const c1 = Math.max(selection.c, selection.c2);
      setStyles((prev) => {
        const next = { ...prev };
        for (let r = r0; r <= r1; r += 1) {
          for (let c = c0; c <= c1; c += 1) {
            next[KEY(r, c)] = patch(next[KEY(r, c)] ?? {});
          }
        }
        return next;
      });
    },
    [selection],
  );

  const clearStyle = useCallback(() => {
    const r0 = Math.min(selection.r, selection.r2);
    const r1 = Math.max(selection.r, selection.r2);
    const c0 = Math.min(selection.c, selection.c2);
    const c1 = Math.max(selection.c, selection.c2);
    setStyles((prev) => {
      const next = { ...prev };
      for (let r = r0; r <= r1; r += 1) {
        for (let c = c0; c <= c1; c += 1) delete next[KEY(r, c)];
      }
      return next;
    });
    notify('已清除所选区域的格式');
  }, [selection, notify]);

  const mergeCells = useCallback(() => {
    const r0 = Math.min(selection.r, selection.r2);
    const r1 = Math.max(selection.r, selection.r2);
    const c0 = Math.min(selection.c, selection.c2);
    const c1 = Math.max(selection.c, selection.c2);
    if (r0 === r1 && c0 === c1) {
      notify('请先选择两个以上单元格再合并');
      return;
    }
    setMerges((prev) => [...prev.filter((m) => !(m.r0 === r0 && m.c0 === c0)), { r0, c0, r1, c1 }]);
    notify(`已合并单元格 ${String.fromCharCode(65 + c0)}${r0 + 1}:${String.fromCharCode(65 + c1)}${r1 + 1}`);
  }, [selection, notify]);

  const unmergeCells = useCallback(() => {
    setMerges([]);
    notify('已取消合并单元格');
  }, [notify]);

  const insertRow = useCallback(() => {
    const dataIdx = Math.max(0, Math.min(selection.r - 1, rows.length - 1));
    setRows((prev) => {
      const blank: CellValue[] = COLUMNS.map((col, i) => (col.type === 'index' ? prev.length + 1 : ''));
      // 序号列留空由 Excel 公式体现，这里保持空值更符合"新建行"的观感
      blank[0] = rows.length + 1;
      return [...prev.slice(0, dataIdx + 1), blank, ...prev.slice(dataIdx + 1)];
    });
    notify(`已在第 ${selection.r + 1} 行上方插入一行`);
  }, [selection, rows.length, notify]);

  const deleteRow = useCallback(() => {
    const r0 = Math.min(selection.r, selection.r2);
    const r1 = Math.max(selection.r, selection.r2);
    const start = Math.max(0, r0 - 1);
    const end = Math.min(rows.length - 1, r1 - 1);
    if (end < start) return;
    setRows((prev) => prev.filter((_, i) => i < start || i > end));
    setSelection({ r: Math.max(1, start + 1), c: selection.c, r2: Math.max(1, start + 1), c2: selection.c2 });
    notify(`已删除 ${end - start + 1} 行`);
  }, [selection, rows.length, notify]);

  const clearContent = useCallback(() => {
    const r0 = Math.min(selection.r, selection.r2);
    const r1 = Math.max(selection.r, selection.r2);
    const c0 = Math.min(selection.c, selection.c2);
    const c1 = Math.max(selection.c, selection.c2);
    setRows((prev) =>
      prev.map((row, i) =>
        i + 1 >= r0 && i + 1 <= r1 ? row.map((cell, j) => (j >= c0 && j <= c1 ? '' : cell)) : row,
      ),
    );
    notify('已清除所选内容');
  }, [selection, notify]);

  const autoSum = useCallback(() => {
    const r0 = Math.min(selection.r, selection.r2);
    const r1 = Math.max(selection.r, selection.r2);
    if (r0 < 1) {
      notify('请先选中一列数据单元格');
      return;
    }
    const c = selection.c;
    const values = rows.slice(r0 - 1, r1);
    const sum = values.reduce((s, row) => s + (typeof row[c] === 'number' ? (row[c] as number) : 0), 0);
    const letter = String.fromCharCode(65 + c);
    notify(`自动求和：=SUM(${letter}${r0 + 1}:${letter}${r1 + 1}) = ${groupThousands(sum, 2)}`);
  }, [selection, rows, notify]);

  const sortByColumn = useCallback(
    (c: number, dir: 'asc' | 'desc') => {
      setRows((prev) => {
        const copy = [...prev];
        copy.sort((a, b) => {
          const va = a[c];
          const vb = b[c];
          if (typeof va === 'number' && typeof vb === 'number') return dir === 'asc' ? va - vb : vb - va;
          const sa = String(va ?? '');
          const sb = String(vb ?? '');
          return dir === 'asc' ? sa.localeCompare(sb, 'zh-Hans-CN') : sb.localeCompare(sa, 'zh-Hans-CN');
        });
        return copy;
      });
      notify(`已按「${COLUMNS[c].label}」${dir === 'asc' ? '升序' : '降序'}排序（Excel 行号已重排）`);
    },
    [notify],
  );

  const setFilter = useCallback(
    (c: number, values: CellValue[] | null) => {
      setFilters((prev) => {
        const rest = prev.filter((f) => f.col !== c);
        return values && values.length ? [...rest, { col: c, values }] : rest;
      });
      if (values && values.length) notify(`已按「${COLUMNS[c].label}」筛选出 ${values.length} 类值`);
      else notify(`已清除「${COLUMNS[c].label}」的筛选条件`);
    },
    [notify],
  );

  const copySelection = useCallback(() => {
    const r0 = Math.min(selection.r, selection.r2);
    const r1 = Math.max(selection.r, selection.r2);
    const c0 = Math.min(selection.c, selection.c2);
    const c1 = Math.max(selection.c, selection.c2);
    const lines: string[] = [];
    for (let r = r0; r <= r1; r += 1) {
      const cells: string[] = [];
      for (let c = c0; c <= c1; c += 1) cells.push(getFormula(r, c));
      lines.push(cells.join('\t'));
    }
    const text = lines.join('\n');
    try {
      void navigator.clipboard?.writeText(text);
      notify(`已复制选区（${r1 - r0 + 1} 行 × ${c1 - c0 + 1} 列，制表符分隔）`);
    } catch {
      notify('当前环境不支持写入剪贴板');
    }
  }, [selection, getFormula, notify]);

  const selectCell = useCallback(
    (dr: number, c: number, extend?: boolean) => {
      setSelection((prev) => (extend ? { ...prev, r2: dr, c2: c } : { r: dr, c, r2: dr, c2: c }));
    },
    [],
  );

  return {
    columns: COLUMNS,
    displayRows: baseRows,
    visibleRowIdx,
    totalRowIdx,
    dataRowCount: rows.length,
    selection,
    setSelection,
    selectCell,
    styles,
    merges,
    filters,
    findTerm,
    showTotal,
    setShowTotal,
    getDisplayValue,
    getFormula,
    getRawValue,
    setCellValue,
    toggleStyle,
    applyStylePatch,
    clearStyle,
    mergeCells,
    unmergeCells,
    insertRow,
    deleteRow,
    clearContent,
    autoSum,
    sortByColumn,
    setFilter,
    setFindTerm,
    copySelection,
    notice,
    notify,
  };
}
