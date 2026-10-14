/**
 * Excel 导出预览演示 —— 仿真 Excel 网格
 *
 * 还原要点：列头/行号、冻结首行首列、绿色选区框 + 填充柄、条件格式、
 *          双击编辑、拖拽选区、表头筛选面板、查找高亮、缩放
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CellValue, colLetter } from '../data';
import type { CellStyle, WorkbookApi } from '../hooks/use-workbook';

interface GridProps {
  api: WorkbookApi;
  zoom: number;
  gridlines: boolean;
  banded: boolean;
  condFormat: boolean;
  onCommand?: (msg: string) => void;
}

interface RowGeom {
  dr: number;
  y: number;
  h: number;
}

const BASE_ROW_H = 23;
const BASE_HEAD_H = 26;
const BASE_TOTAL_H = 25;
const ROWHEAD_W = 44;

const RISK_STYLE: Record<string, { bg: string; color: string }> = {
  高: { bg: '#ffc7ce', color: '#9c0006' },
  中: { bg: '#ffeb9c', color: '#9c6500' },
  低: { bg: '#c6efce', color: '#006100' },
};

const ExcelGrid: React.FC<GridProps> = ({ api, zoom, gridlines, banded, condFormat, onCommand }) => {
  const {
    columns,
    displayRows,
    visibleRowIdx,
    totalRowIdx,
    dataRowCount,
    selection,
    selectCell,
    getDisplayValue,
    getFormula,
    getRawValue,
    setCellValue,
    filters,
    setFilter,
    findTerm,
    merges,
    styles,
  } = api;

  const scrollRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const [dragging, setDragging] = useState(false);
  const [editing, setEditing] = useState<{ dr: number; c: number } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [openFilter, setOpenFilter] = useState<number | null>(null);
  const [draftFilter, setDraftFilter] = useState<CellValue[]>([]);

  const rowheadW = Math.round(ROWHEAD_W * (0.85 + zoom * 0.15));
  const headH = Math.round(BASE_HEAD_H * zoom);
  const totalH = Math.round(BASE_TOTAL_H * zoom);

  const colWidth = useCallback((c: number) => Math.round((columns[c]?.width ?? 100) * zoom), [columns, zoom]);
  const colOffsets = useMemo(() => {
    const arr: number[] = [];
    let acc = 0;
    columns.forEach((_, i) => {
      arr.push(acc);
      acc += colWidth(i);
    });
    return arr;
  }, [columns, colWidth]);
  const gridWidth = colOffsets[colOffsets.length - 1] + colWidth(columns.length - 1);

  const rowHeight = useCallback(
    (dr: number) => {
      if (dr === 0) return headH;
      if (dr === totalRowIdx) return totalH;
      const scale = styles[`${dr}:0`]?.fontScale ?? 1;
      return Math.round(BASE_ROW_H * zoom * scale);
    },
    [headH, totalH, totalRowIdx, styles, zoom],
  );

  /** 可见行的纵向几何（用于选区覆盖层与渲染） */
  const rowGeom = useMemo<RowGeom[]>(() => {
    let y = 0;
    const out: RowGeom[] = [];
    visibleRowIdx.forEach((dr) => {
      const h = rowHeight(dr);
      out.push({ dr, y, h });
      y += h;
    });
    return out;
  }, [visibleRowIdx, rowHeight]);

  const contentHeight = rowGeom.length ? rowGeom[rowGeom.length - 1].y + rowGeom[rowGeom.length - 1].h : 0;

  /* ------------------------------ 选区几何 ------------------------------ */
  const rect = useMemo(() => {
    const r0 = Math.min(selection.r, selection.r2);
    const r1 = Math.max(selection.r, selection.r2);
    const c0 = Math.min(selection.c, selection.c2);
    const c1 = Math.max(selection.c, selection.c2);
    const topGeom = rowGeom.find((g) => g.dr === r0);
    const bottomGeom = rowGeom.find((g) => g.dr === r1);
    const y = headH + (topGeom ? topGeom.y : 0);
    const h = bottomGeom ? bottomGeom.y + bottomGeom.h - (topGeom ? topGeom.y : 0) : 0;
    const x = rowheadW + (colOffsets[c0] ?? 0);
    let w = 0;
    for (let c = c0; c <= c1; c += 1) w += colWidth(c);
    return { x, y, w, h, c0, c1, r0, r1 };
  }, [selection, rowGeom, headH, colOffsets, colWidth, rowheadW]);

  const isCovered = (dr: number, c: number) =>
    merges.some((m) => dr >= m.r0 && dr <= m.r1 && c >= m.c0 && c <= m.c1 && !(dr === m.r0 && c === m.c0));

  const mergeAnchorAt = (dr: number, c: number) =>
    merges.find((m) => m.r0 === dr && m.c0 === c && (m.r1 > m.r0 || m.c1 > m.c0));

  /* ------------------------------ 编辑 ------------------------------ */
  const beginEdit = (dr: number, c: number, initial?: string) => {
    if (dr === 0 && c < 0) return;
    setEditing({ dr, c });
    setEditValue(initial !== undefined ? initial : String(getRawValue(dr, c) ?? ''));
  };

  const commitEdit = (move: 'down' | 'right' | 'none') => {
    if (!editing) return;
    setCellValue(editing.dr, editing.c, editValue);
    const { dr, c } = editing;
    setEditing(null);
    if (move === 'down') selectCell(dr + 1 <= totalRowIdx ? dr + 1 : dr, c);
    if (move === 'right') selectCell(dr, c + 1 < columns.length ? c + 1 : c);
  };

  /* ------------------------------ 键盘 ------------------------------ */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (editing) return;
    const { r, c } = selection;
    const lastCol = columns.length - 1;
    const move = (dr: number, dc: number) => {
      const nr = Math.max(0, Math.min(totalRowIdx, r + dr));
      const nc = Math.max(0, Math.min(lastCol, c + dc));
      selectCell(nr, nc, e.shiftKey);
      e.preventDefault();
    };
    switch (e.key) {
      case 'ArrowUp':
        move(-1, 0);
        break;
      case 'ArrowDown':
        move(1, 0);
        break;
      case 'ArrowLeft':
        move(0, -1);
        break;
      case 'ArrowRight':
        move(0, 1);
        break;
      case 'Enter':
        move(1, 0);
        break;
      case 'Tab':
        move(0, 1);
        break;
      case 'Delete':
      case 'Backspace':
        api.clearContent();
        break;
      case 'F2':
        beginEdit(r, c);
        break;
      case 'a':
        if (e.metaKey || e.ctrlKey) {
          api.setSelection({ r: 1, c: 0, r2: dataRowCount, c2: lastCol });
          e.preventDefault();
        }
        break;
      case 'c':
        if (e.metaKey || e.ctrlKey) {
          api.copySelection();
          e.preventDefault();
        }
        break;
      default:
        if (/^[\w\u4e00-\u9fa5¥#.]$/.test(e.key) && !e.metaKey && !e.ctrlKey && !e.altKey) {
          beginEdit(r, c, e.key);
        }
        break;
    }
  };

  useEffect(() => {
    const up = () => {
      draggingRef.current = false;
      setDragging(false);
    };
    window.addEventListener('mouseup', up);
    return () => window.removeEventListener('mouseup', up);
  }, []);

  useEffect(() => {
    const close = () => setOpenFilter(null);
    window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, []);

  /* ------------------------------ 单元格样式 ------------------------------ */
  const cellInlineStyle = (dr: number, c: number): React.CSSProperties => {
    const col = columns[c];
    const st: CellStyle = styles[`${dr}:${c}`] ?? {};
    const style: React.CSSProperties = {
      width: colWidth(c),
      height: rowHeight(dr),
    };
    const align = st.align ?? col.align;
    if (align === 'right') style.justifyContent = 'flex-end';
    if (align === 'center') style.justifyContent = 'center';
    if (st.valign === 'top') style.alignItems = 'flex-start';
    if (st.valign === 'bottom') style.alignItems = 'flex-end';
    if (st.bold) style.fontWeight = 700;
    if (st.italic) style.fontStyle = 'italic';
    if (st.underline) style.textDecoration = 'underline';
    if (st.color) style.color = st.color;
    if (st.bg) style.backgroundColor = st.bg;
    if (st.wrap) {
      style.whiteSpace = 'normal';
      style.lineHeight = '1.15';
      style.overflow = 'hidden';
    }
    if (st.fontScale) style.fontSize = Math.round(13 * st.fontScale);
    if (banded && dr > 0 && dr <= dataRowCount && dr % 2 === 1 && !st.bg) style.backgroundColor = '#fafafa';
    if (!gridlines) {
      style.borderRightColor = 'transparent';
      style.borderBottomColor = 'transparent';
    }
    // 条件格式
    if (condFormat && dr >= 1 && dr <= dataRowCount) {
      const key = col.key;
      const raw = getRawValue(dr, c);
      if (key === 'riskLevel' && typeof raw === 'string' && RISK_STYLE[raw]) {
        style.backgroundColor = RISK_STYLE[raw].bg;
        style.color = RISK_STYLE[raw].color;
        style.fontWeight = 600;
      }
      if (key === 'budgetAmount' && typeof raw === 'number' && raw >= 5000000) {
        style.color = '#9c0006';
        style.fontWeight = 700;
      }
      if (key === 'savingRate' && typeof raw === 'number' && raw < 0) {
        style.color = '#9c0006';
      }
    }
    return style;
  };

  /** 列宽不足时 Excel 显示 ##### */
  const displayText = (dr: number, c: number): { text: string; overflow: boolean } => {
    const text = getDisplayValue(dr, c);
    const col = columns[c];
    const st = styles[`${dr}:${c}`] ?? {};
    const isNum = ['currency', 'percent', 'number'].includes(col.type);
    const avail = colWidth(c) - 12;
    const est = text.length * (col.type === 'currency' ? 6.6 : 7.2);
    const overflow = isNum && !st.wrap && est > avail;
    return { text: overflow ? '#####' : text, overflow };
  };

  /* ------------------------------ 筛选面板 ------------------------------ */
  const distinctValues = useMemo(() => {
    if (openFilter === null) return [] as CellValue[];
    const set = new Set<CellValue>();
    for (let i = 1; i <= dataRowCount; i += 1) {
      const v = getRawValue(i, openFilter);
      set.add(typeof v === 'number' ? v : String(v ?? ''));
    }
    return Array.from(set);
  }, [openFilter, dataRowCount, getRawValue]);

  const applyFilterFromDraft = () => {
    if (openFilter === null) return;
    const all = distinctValues;
    if (draftFilter.length === 0 || draftFilter.length === all.length) {
      setFilter(openFilter, null);
    } else {
      setFilter(openFilter, draftFilter);
    }
    setOpenFilter(null);
  };

  const openFilterPanel = (c: number) => {
    const current = filters.find((f) => f.col === c);
    setDraftFilter(current ? [...current.values] : []);
    setOpenFilter(c);
  };

  const onCellMouseDown = (dr: number, c: number, e: React.MouseEvent) => {
    if (dr === totalRowIdx) {
      onCommand?.('合计行为公式行，不支持编辑（与 Excel 表格结构一致）');
      return;
    }
    draggingRef.current = true;
    setDragging(true);
    selectCell(dr, c, e.shiftKey);
    scrollRef.current?.focus();
    if (editing && (editing.dr !== dr || editing.c !== c)) commitEdit('none');
  };

  const onCellMouseEnter = (dr: number, c: number) => {
    if (draggingRef.current) selectCell(dr, c, true);
  };

  return (
    <div
      ref={scrollRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`xl-grid-scroll custom-scrollbar outline-none ${gridlines ? '' : 'xl-grid-nolines'}`}
      style={{ userSelect: dragging ? 'none' : 'auto' }}
    >
      <div className="xl-grid" style={{ width: rowheadW + gridWidth, height: headH + contentHeight }}>
        {/* 列头行 */}
        <div className="xl-row" style={{ height: headH }}>
          <div
            className="xl-corner"
            style={{ width: rowheadW, height: headH }}
            title="全选"
            onClick={() => api.setSelection({ r: 1, c: 0, r2: dataRowCount, c2: columns.length - 1 })}
          />
          {columns.map((col, c) => {
            const selected = c >= rect.c0 && c <= rect.c1;
            const filtered = filters.some((f) => f.col === c);
            return (
              <div
                key={col.key}
                className={`xl-colhead ${selected ? 'xl-colhead-on' : ''}`}
                style={{ width: colWidth(c), height: headH }}
                onClick={() => api.setSelection({ r: 1, c, r2: dataRowCount, c2: c })}
                title={`选中「${col.label}」整列`}
              >
                <span>{colLetter(c)}</span>
                <span
                  className={`xl-filter-arrow ${filtered ? 'xl-filter-arrow-on' : ''}`}
                  title="筛选"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    openFilterPanel(c);
                  }}
                >
                  <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden>
                    <path d="M1 2.2h8L6 6v3L4 8V6L1 2.2z" fill="currentColor" />
                  </svg>
                </span>
              </div>
            );
          })}
        </div>

        {/* 数据行 + 表头行 + 合计行 */}
        {rowGeom.map(({ dr, y, h }) => {
          const isHead = dr === 0;
          const isTotal = dr === totalRowIdx;
          return (
            <div className="xl-row" key={dr} style={{ height: h }}>
              <div
                className={`xl-rowhead ${rect.r0 <= dr && rect.r1 >= dr ? 'xl-rowhead-on' : ''}`}
                style={{ width: rowheadW, height: h }}
                onClick={() => api.setSelection({ r: dr, c: 0, r2: dr, c2: columns.length - 1 })}
                title={`选中第 ${dr + 1} 行`}
              >
                {dr + 1}
              </div>
              {columns.map((col, c) => {
                const covered = isCovered(dr, c);
                const anchor = mergeAnchorAt(dr, c);
                const st = styles[`${dr}:${c}`] ?? {};
                const { text, overflow } = displayText(dr, c);
                const hit = !!findTerm && text.toLowerCase().includes(findTerm.toLowerCase()) && !isHead;
                const isEditing = !!editing && editing.dr === dr && editing.c === c;
                const active =
                  !isHead && !isTotal && selection.r === dr && selection.c === c &&
                  (selection.r !== selection.r2 || selection.c !== selection.c2);
                return (
                  <div
                    key={col.key}
                    className={[
                      'xl-cell',
                      isHead ? 'xl-cell-head' : '',
                      isTotal ? 'xl-cell-total' : '',
                      active ? 'xl-cell-active' : '',
                      isEditing ? 'xl-cell-editing' : '',
                      hit ? 'xl-find-hit' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    style={{
                      ...cellInlineStyle(dr, c),
                      position: isHead ? 'sticky' : undefined,
                      top: isHead ? headH : undefined,
                      zIndex: isHead ? 25 : undefined,
                      ...(covered || anchor ? { visibility: covered ? ('hidden' as const) : undefined } : {}),
                    }}
                    onMouseDown={(e) => !covered && onCellMouseDown(dr, c, e)}
                    onMouseEnter={() => !covered && onCellMouseEnter(dr, c)}
                    onDoubleClick={() => !covered && dr !== totalRowIdx && beginEdit(dr, c)}
                    title={dr !== 0 && !overflow && !anchor ? text : undefined}
                  >
                    {anchor ? null : overflow ? <span className="xl-hash">{text}</span> : text}
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* 合并单元格内容覆盖层 */}
        {merges.map((m, i) => {
          const top = rowGeom.find((g) => g.dr === m.r0);
          const bottom = rowGeom.find((g) => g.dr === m.r1);
          if (!top || !bottom) return null;
          const x = rowheadW + (colOffsets[m.c0] ?? 0);
          const y = headH + top.y;
          let w = 0;
          for (let c = m.c0; c <= m.c1; c += 1) w += colWidth(c);
          const h = bottom.y + bottom.h - top.y;
          const text = displayText(m.r0, m.c0).text;
          const align = styles[`${m.r0}:${m.c0}`]?.align ?? columns[m.c0]?.align ?? 'center';
          return (
            <div
              key={`merge-${i}`}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: w,
                height: h,
                background: '#ffffff',
                border: '1px solid var(--xl-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start',
                padding: '0 6px',
                fontSize: 13,
                fontWeight: styles[`${m.r0}:${m.c0}`]?.bold ? 700 : 400,
                color: 'var(--xl-text)',
                zIndex: 11,
                pointerEvents: 'none',
                overflow: 'hidden',
              }}
            >
              {text}
            </div>
          );
        })}

        {/* 选区覆盖层 */}
        {rect.h > 0 && (
          <div className="xl-sel-box" style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}>
            <span className="xl-fill-handle" />
          </div>
        )}

        {/* 单元格编辑框 */}
        {editing && (() => {
          const g = rowGeom.find((r) => r.dr === editing.dr);
          if (!g) return null;
          const x = rowheadW + (colOffsets[editing.c] ?? 0);
          const y = headH + g.y;
          return (
            <input
              autoFocus
              className="xl-cell-input"
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: colWidth(editing.c),
                height: g.h,
                border: '2px solid var(--xl-sel)',
                zIndex: 50,
                fontSize: 13,
                textAlign: (styles[`${editing.dr}:${editing.c}`]?.align ?? columns[editing.c].align) as 'left' | 'center' | 'right',
              }}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => commitEdit('none')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  commitEdit('down');
                } else if (e.key === 'Tab') {
                  e.preventDefault();
                  commitEdit('right');
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  setEditing(null);
                }
              }}
            />
          );
        })()}

        {/* 表头筛选面板 */}
        {openFilter !== null && (
          <div
            className="xl-filter-panel"
            style={{ left: rowheadW + (colOffsets[openFilter] ?? 0), top: headH + 2 }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="px-3 py-2 border-b border-[#e5e5e5] text-[11px] text-[color:var(--xl-text-dim)]">
              {columns[openFilter].label} · 按值筛选
            </div>
            <div className="max-h-[168px] overflow-auto py-1">
              {distinctValues.map((v) => {
                const checked = draftFilter.length === 0 || draftFilter.includes(v);
                return (
                  <div
                    key={String(v)}
                    className="xl-filter-item"
                    onClick={() =>
                      setDraftFilter((prev) => {
                        const base = prev.length === 0 ? [...distinctValues] : [...prev];
                        return base.includes(v) ? base.filter((x) => x !== v) : [...base, v];
                      })
                    }
                  >
                    <input type="checkbox" readOnly checked={checked} className="accent-[color:var(--xl-sel)]" />
                    <span className="truncate">{String(v)}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-[#e5e5e5] px-3 py-2">
              <button
                type="button"
                className="text-[11px] text-[color:var(--xl-text-dim)] hover:text-[color:var(--xl-sel)]"
                onClick={() => {
                  setDraftFilter([]);
                  if (openFilter !== null) setFilter(openFilter, null);
                  setOpenFilter(null);
                }}
              >
                清除筛选
              </button>
              <button
                type="button"
                className="rounded-[2px] bg-[color:var(--xl-accent)] px-3 py-[3px] text-[11px] text-white hover:opacity-90"
                onClick={applyFilterFromDraft}
              >
                确定
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExcelGrid;
