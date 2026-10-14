/**
 * Excel 导出预览演示 —— 仿真 Excel 功能区（选项卡 + 工具组）
 *
 * 说明：仅「开始」页签还原完整工具组并可用；其他页签为示意占位，
 *      与真实 Excel 一致地保留页签结构，避免演示时观众误以为缺功能。
 */

import React, { useRef, useState } from 'react';
import {
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignVerticalJustifyStart,
  ArrowDownUp,
  Baseline,
  Bold,
  ChevronDown,
  CircleDollarSign,
  Combine,
  Copy,
  Eraser,
  Grid3x3,
  Hash,
  Italic,
  ListFilter,
  Merge,
  Minus,
  PaintBucket,
  Percent,
  Plus,
  Redo2,
  Rows3,
  Scissors,
  Search,
  Sigma,
  Sparkles,
  Table2,
  TextAlignCenter,
  TextAlignEnd,
  TextAlignStart,
  TextWrap,
  Trash2,
  Type,
  Underline,
  Undo2,
} from 'lucide-react';
import type { WorkbookApi } from '../hooks/use-workbook';

interface RibbonProps {
  api: WorkbookApi;
  gridlines: boolean;
  setGridlines: (v: boolean) => void;
  banded: boolean;
  setBanded: (v: boolean) => void;
  condFormat: boolean;
  setCondFormat: (v: boolean) => void;
  findTerm: string;
  setFindTerm: (v: string) => void;
}

const TABS = ['文件', '开始', '插入', '页面布局', '公式', '数据', '审阅', '视图', '帮助'];

const COLOR_PALETTE = [
  '#1f1f1f', '#7f7f7f', '#a5a5a5', '#c00000', '#ff0000', '#ffc000', '#ffff00', '#92d050', '#00b050', '#00b0f0', '#0070c0', '#002060',
];

const BG_PALETTE = [
  'transparent', '#f2f2f2', '#d9d9d9', '#ffc7ce', '#ffeb9c', '#c6efce', '#ddebf7', '#fce4d6', '#e4dfec', '#fff2cc', '#e2f0d9', '#007add',
];

interface ToolProps {
  title: string;
  onClick?: () => void;
  active?: boolean;
  children: React.ReactNode;
  wide?: boolean;
  column?: boolean;
}

const Tool: React.FC<ToolProps> = ({ title, onClick, active, children, wide, column }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`xl-tool ${active ? 'xl-tool-on' : ''} ${wide ? 'xl-tool-wide' : ''} ${column ? 'xl-tool-col' : ''}`}
  >
    {children}
  </button>
);

const Group: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="xl-group">
    <div className="xl-group-body">{children}</div>
    <div className="xl-group-title">{title}</div>
  </div>
);

const Ribbon: React.FC<RibbonProps> = ({
  api,
  gridlines,
  setGridlines,
  banded,
  setBanded,
  condFormat,
  setCondFormat,
  findTerm,
  setFindTerm,
}) => {
  const [tab, setTab] = useState('开始');
  const [palette, setPalette] = useState<'font' | 'fill' | null>(null);
  const paletteTimer = useRef<number | null>(null);

  const { selection, columns } = api;
  const currentCol = Math.min(selection.c, selection.c2);
  const styleOfSelection = api.styles[`${selection.r}:${selection.c}`] ?? {};

  const openPalette = (which: 'font' | 'fill') => {
    setPalette((p) => (p === which ? null : which));
    if (paletteTimer.current) window.clearTimeout(paletteTimer.current);
    paletteTimer.current = window.setTimeout(() => setPalette(null), 4000);
  };

  const palettePanel = (which: 'font' | 'fill') => (
    <div
      className="absolute top-[200px] z-50 grid grid-cols-6 gap-[3px] rounded-[3px] border border-[color:var(--xl-border)] bg-white p-[6px] shadow-[0_8px_20px_rgba(15,23,42,0.18)]"
      style={{ left: which === 'font' ? 150 : 206 }}
      onMouseLeave={() => setPalette(null)}
    >
      {(which === 'font' ? COLOR_PALETTE : BG_PALETTE).map((color) => (
        <button
          key={color}
          type="button"
          className="h-[18px] w-[18px] rounded-[2px] border border-[#d0d0d0]"
          style={{ background: color === 'transparent' ? '#ffffff' : color }}
          title={color === 'transparent' ? '无填充' : color}
          onClick={() => {
            if (which === 'font') api.applyStylePatch({ color });
            else api.applyStylePatch({ bg: color === 'transparent' ? undefined : color });
            setPalette(null);
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="relative">
      {/* 选项卡 */}
      <div className="xl-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            className={`xl-tab ${t === '文件' ? 'xl-tab-file' : ''} ${tab === t && t !== '文件' ? 'xl-tab-active' : ''}`}
            onClick={() => {
              if (t === '文件') {
                api.notify('演示页不还原「文件」后台视图；导出入口在页面顶部「导出 Excel」按钮');
                return;
              }
              setTab(t);
            }}
          >
            {t}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 pr-2 text-[11px] text-[color:var(--xl-text-dim)]">
          <span>自动保存</span>
          <div className="flex items-center gap-0.5">
            <Tool title="撤销（演示）" onClick={() => api.notify('演示页未开启撤销栈，请在单元格中直接改回原值')}>
              <Undo2 size={14} strokeWidth={1.8} />
            </Tool>
            <Tool title="重做（演示）" onClick={() => api.notify('演示页未开启重做栈')}>
              <Redo2 size={14} strokeWidth={1.8} />
            </Tool>
          </div>
        </div>
      </div>

      {tab === '开始' ? (
        <div className="xl-ribbon">
          {/* 剪贴板 */}
          <Group title="剪贴板">
            <Tool title="粘贴（演示）" column onClick={() => api.notify('已模拟「粘贴」，演示页不读取系统剪贴板')}>
              <Copy size={16} strokeWidth={1.6} />
              <span>粘贴</span>
            </Tool>
            <Tool title="剪切（演示）" column onClick={() => api.notify('已模拟「剪切」')}>
              <Scissors size={16} strokeWidth={1.6} />
              <span>剪切</span>
            </Tool>
            <Tool title="复制选区（Ctrl/Cmd+C，制表符分隔）" column onClick={() => api.copySelection()}>
              <Copy size={16} strokeWidth={1.6} />
              <span>复制</span>
            </Tool>
          </Group>

          {/* 字体 */}
          <Group title="字体">
            <div className="flex flex-col gap-[2px] pr-1">
              <select
                className="xl-select-mini w-[112px]"
                defaultValue="等线"
                onChange={(e) => api.notify(`已切换字体为「${e.target.value}」（导出文件使用等线/微软雅黑）`)}
              >
                {['等线', '微软雅黑', '宋体', 'Arial'].map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
              <div className="flex items-center gap-[2px]">
                <Tool title="增大字号" onClick={() => api.toggleStyle((s) => ({ ...s, fontScale: Math.min(1.6, (s.fontScale ?? 1) + 0.1) }))}>
                  <Plus size={13} strokeWidth={2.2} />
                </Tool>
                <Tool title="减小字号" onClick={() => api.toggleStyle((s) => ({ ...s, fontScale: Math.max(0.8, (s.fontScale ?? 1) - 0.1) }))}>
                  <Minus size={13} strokeWidth={2.2} />
                </Tool>
                <span className="ml-1 inline-flex items-center gap-1 text-[11px] text-[color:var(--xl-text-dim)]">
                  <Type size={13} strokeWidth={1.8} />13
                </span>
              </div>
            </div>
            <Tool title="加粗" active={!!styleOfSelection.bold} onClick={() => api.toggleStyle((s) => ({ ...s, bold: !s.bold }))}>
              <Bold size={15} strokeWidth={2.2} />
            </Tool>
            <Tool title="斜体" active={!!styleOfSelection.italic} onClick={() => api.toggleStyle((s) => ({ ...s, italic: !s.italic }))}>
              <Italic size={15} strokeWidth={2.2} />
            </Tool>
            <Tool
              title="下划线"
              active={!!styleOfSelection.underline}
              onClick={() => api.toggleStyle((s) => ({ ...s, underline: !s.underline }))}
            >
              <Underline size={15} strokeWidth={2.2} />
            </Tool>
            <Tool title="字体颜色" onClick={() => openPalette('font')}>
              <Baseline size={15} strokeWidth={1.8} />
              <ChevronDown size={10} strokeWidth={2} />
            </Tool>
            <Tool title="填充颜色" onClick={() => openPalette('fill')}>
              <PaintBucket size={15} strokeWidth={1.8} />
              <ChevronDown size={10} strokeWidth={2} />
            </Tool>
          </Group>

          {/* 对齐方式 */}
          <Group title="对齐方式">
            <Tool title="左对齐" active={styleOfSelection.align === 'left'} onClick={() => api.applyStylePatch({ align: 'left' })}>
              <TextAlignStart size={15} strokeWidth={1.9} />
            </Tool>
            <Tool title="居中" active={styleOfSelection.align === 'center'} onClick={() => api.applyStylePatch({ align: 'center' })}>
              <TextAlignCenter size={15} strokeWidth={1.9} />
            </Tool>
            <Tool title="右对齐" active={styleOfSelection.align === 'right'} onClick={() => api.applyStylePatch({ align: 'right' })}>
              <TextAlignEnd size={15} strokeWidth={1.9} />
            </Tool>
            <Tool title="顶端对齐" active={styleOfSelection.valign === 'top'} onClick={() => api.applyStylePatch({ valign: 'top' })}>
              <AlignVerticalJustifyStart size={15} strokeWidth={1.9} />
            </Tool>
            <Tool title="垂直居中" active={styleOfSelection.valign === 'middle'} onClick={() => api.applyStylePatch({ valign: 'middle' })}>
              <AlignVerticalJustifyCenter size={15} strokeWidth={1.9} />
            </Tool>
            <Tool title="底端对齐" active={styleOfSelection.valign === 'bottom'} onClick={() => api.applyStylePatch({ valign: 'bottom' })}>
              <AlignVerticalJustifyEnd size={15} strokeWidth={1.9} />
            </Tool>
            <Tool title="自动换行" active={!!styleOfSelection.wrap} onClick={() => api.toggleStyle((s) => ({ ...s, wrap: !s.wrap }))}>
              <TextWrap size={15} strokeWidth={1.9} />
            </Tool>
            <Tool
              title="合并后居中"
              onClick={() => {
                api.mergeCells();
                api.applyStylePatch({ align: 'center', valign: 'middle' });
              }}
            >
              <Merge size={15} strokeWidth={1.9} />
              <ChevronDown size={10} strokeWidth={2} />
            </Tool>
            <Tool title="取消合并" onClick={() => api.unmergeCells()}>
              <Combine size={15} strokeWidth={1.9} />
            </Tool>
          </Group>

          {/* 数字 */}
          <Group title="数字">
            <div className="flex flex-col gap-[2px] pr-1">
              <select
                className="xl-select-mini w-[92px]"
                defaultValue="常规"
                onChange={(e) => {
                  const map: Record<string, 'general' | 'thousand' | 'currency' | 'percent'> = {
                    常规: 'general',
                    千分位: 'thousand',
                    货币: 'currency',
                    百分比: 'percent',
                  };
                  const fmt = map[e.target.value];
                  if (fmt) api.applyStylePatch({ numFmt: fmt });
                }}
              >
                {['常规', '千分位', '货币', '百分比'].map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
              <div className="flex items-center gap-[2px]">
                <span className="text-[10px] text-[color:var(--xl-text-dim)]">数字格式</span>
              </div>
            </div>
            <Tool title="货币格式 ¥#,##0.00" onClick={() => api.applyStylePatch({ numFmt: 'currency' })}>
              <CircleDollarSign size={15} strokeWidth={1.9} />
            </Tool>
            <Tool title="百分比格式 0.00%" onClick={() => api.applyStylePatch({ numFmt: 'percent' })}>
              <Percent size={15} strokeWidth={1.9} />
            </Tool>
            <Tool title="千分位分隔符 #,##0.00" onClick={() => api.applyStylePatch({ numFmt: 'thousand' })}>
              <Hash size={15} strokeWidth={1.9} />
            </Tool>
            <Tool title="增加小数位" onClick={() => api.toggleStyle((s) => ({ ...s, decimals: Math.min(4, (s.decimals ?? 2) + 1) }))}>
              <span className="text-[13px] font-semibold">.0</span>
              <Plus size={11} strokeWidth={2.4} />
            </Tool>
            <Tool title="减少小数位" onClick={() => api.toggleStyle((s) => ({ ...s, decimals: Math.max(0, (s.decimals ?? 2) - 1) }))}>
              <span className="text-[13px] font-semibold">.0</span>
              <Minus size={11} strokeWidth={2.4} />
            </Tool>
          </Group>

          {/* 样式 */}
          <Group title="样式">
            <Tool
              title="条件格式：风险等级三色底 / 大额与负值红字"
              active={condFormat}
              onClick={() => {
                setCondFormat(!condFormat);
                api.notify(condFormat ? '已关闭条件格式' : '已开启条件格式：高风险红底、预算≥500 万红字、负节资率红字');
              }}
            >
              <Sparkles size={15} strokeWidth={1.9} />
              <span className="text-[11px]">条件格式</span>
            </Tool>
            <Tool
              title="套用表格格式：隔行底色"
              active={banded}
              onClick={() => {
                setBanded(!banded);
                api.notify(banded ? '已取消表格格式（隔行底色）' : '已套用表格格式：隔行浅灰底色');
              }}
            >
              <Table2 size={15} strokeWidth={1.9} />
              <span className="text-[11px]">表格格式</span>
            </Tool>
            <Tool
              title="显示/隐藏网格线"
              active={gridlines}
              onClick={() => {
                setGridlines(!gridlines);
                api.notify(gridlines ? '已隐藏网格线（导出文件默认显示细边框）' : '已显示网格线');
              }}
            >
              <Grid3x3 size={15} strokeWidth={1.9} />
              <span className="text-[11px]">网格线</span>
            </Tool>
            <Tool title="清除所选区域的格式" onClick={() => api.clearStyle()}>
              <Eraser size={15} strokeWidth={1.9} />
              <span className="text-[11px]">清除格式</span>
            </Tool>
          </Group>

          {/* 单元格 */}
          <Group title="单元格">
            <Tool title="在选中行上方插入一行" onClick={() => api.insertRow()}>
              <Rows3 size={15} strokeWidth={1.9} />
              <Plus size={11} strokeWidth={2.4} />
            </Tool>
            <Tool title="删除选中行" onClick={() => api.deleteRow()}>
              <Trash2 size={15} strokeWidth={1.9} />
            </Tool>
            <Tool title="清除内容（Delete）" onClick={() => api.clearContent()}>
              <span className="text-[12px] font-semibold">⌫</span>
            </Tool>
          </Group>

          {/* 编辑 */}
          <Group title="编辑">
            <Tool title="自动求和" onClick={() => api.autoSum()}>
              <Sigma size={15} strokeWidth={1.9} />
              <span className="text-[11px]">自动求和</span>
            </Tool>
            <Tool title={`按「${columns[currentCol]?.label}」升序排序`} onClick={() => api.sortByColumn(selection.c, 'asc')}>
              <ArrowDownUp size={15} strokeWidth={1.9} />
              <span className="text-[11px]">升序</span>
            </Tool>
            <Tool title={`按「${columns[currentCol]?.label}」降序排序`} onClick={() => api.sortByColumn(selection.c, 'desc')}>
              <ArrowDownUp size={15} strokeWidth={1.9} className="rotate-180" />
              <span className="text-[11px]">降序</span>
            </Tool>
            <Tool
              title="筛选：点击列标题右侧漏斗图标"
              onClick={() => api.notify('筛选入口在列标题右侧的漏斗图标，可按任意列多选值筛选')}
            >
              <ListFilter size={15} strokeWidth={1.9} />
              <span className="text-[11px]">筛选</span>
            </Tool>
            <div className="flex items-center gap-1 pl-1">
              <Search size={14} strokeWidth={1.9} className="text-[color:var(--xl-text-dim)]" />
              <input
                className="xl-select-mini w-[112px]"
                placeholder="查找内容"
                value={findTerm}
                onChange={(e) => setFindTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') api.notify(findTerm ? `已高亮包含「${findTerm}」的单元格` : '请输入查找内容');
                }}
              />
            </div>
          </Group>
        </div>
      ) : (
        <div className="flex h-[96px] items-center gap-2 border-b border-[color:var(--xl-border)] bg-[color:var(--xl-chrome-hi)] px-4 text-[12px] text-[color:var(--xl-text-dim)]">
          <CircleDollarSign size={14} strokeWidth={1.8} />
          <span>
            演示页仅还原「开始」页签的完整功能区；「{tab}」页签为结构示意。真实导出文件在 Excel / WPS 中打开时，全部页签能力均可用。
          </span>
        </div>
      )}

      {palette && palettePanel(palette)}
    </div>
  );
};

export default Ribbon;
