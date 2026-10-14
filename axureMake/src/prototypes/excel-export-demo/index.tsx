/**
 * @name Excel 导出预览演示
 * @mode axure
 *
 * 参考资料：
 * - /rules/design-guide.md
 * - /rules/development-guide.md
 * - /src/prototypes/excel-export-demo/spec.md
 *
 * 用途：产品经理演示「Excel 导出需求」的仿真预览页。
 *      用 Excel 2019 风格的窗口把导出结果的字段、格式、合计、边界规则演出来。
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Button, Tooltip } from 'antd';
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Minus,
  MousePointerClick,
  Plus,
  Presentation,
  Square,
  X,
} from 'lucide-react';
import './style.css';

import { colLetter } from './data';
import { useWorkbook } from './hooks/use-workbook';
import ExcelGrid from './components/excel-grid';
import Ribbon from './components/excel-ribbon';
import ExportModal from './components/export-modal';
import { RulesDrawer, ScriptDrawer } from './components/rules-drawer';
import { FieldsSheet, ReviewSheet, RulesSheet } from './components/doc-sheets';

type SheetKey = 'data' | 'fields' | 'rules' | 'review';

const SHEETS: { key: SheetKey; label: string }[] = [
  { key: 'data', label: '数据明细' },
  { key: 'fields', label: '字段说明' },
  { key: 'rules', label: '导出规则' },
  { key: 'review', label: '评审要点' },
];

const DEMO_STEPS = [
  { title: '业务列表筛选', hint: '在采购项目列表页设置筛选条件（组织 / 日期 / 风险等级）' },
  { title: '点击导出', hint: '点击列表页右上角「导出 Excel」，导出当前筛选条件下的全部数据' },
  { title: '生成文件', hint: '服务端按导出规则生成 .xlsx：格式化字段 + 冻结表头 + 合计行公式' },
  { title: '打开预览核对', hint: '在本页仿真预览中核对字段、格式、脱敏与边界规则' },
];

const Component: React.FC = () => {
  const api = useWorkbook();
  const [zoom, setZoom] = useState(100);
  const [gridlines, setGridlines] = useState(true);
  const [banded, setBanded] = useState(false);
  const [condFormat, setCondFormat] = useState(true);
  const [findTerm, setFindTerm] = useState('');
  const [activeSheet, setActiveSheet] = useState<SheetKey>('data');
  const [exportOpen, setExportOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [scriptOpen, setScriptOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(3);
  const [formulaDraft, setFormulaDraft] = useState('');

  const { selection, columns, getFormula } = api;

  /** 公式栏与选区同步 */
  useEffect(() => {
    setFormulaDraft(getFormula(selection.r, selection.c));
  }, [selection, getFormula, api.styles]);

  const nameBox = useMemo(() => {
    const a = `${colLetter(Math.min(selection.c, selection.c2))}${Math.min(selection.r, selection.r2) + 1}`;
    const b = `${colLetter(Math.max(selection.c, selection.c2))}${Math.max(selection.r, selection.r2) + 1}`;
    return a === b ? a : `${a}:${b}`;
  }, [selection]);

  /** 选区统计（Excel 状态栏的 平均值 / 计数 / 求和） */
  const stats = useMemo(() => {
    const r0 = Math.min(selection.r, selection.r2);
    const r1 = Math.max(selection.r, selection.r2);
    const c0 = Math.min(selection.c, selection.c2);
    const c1 = Math.max(selection.c, selection.c2);
    let count = 0;
    let sum = 0;
    for (let r = r0; r <= r1; r += 1) {
      for (let c = c0; c <= c1; c += 1) {
        const v = api.getRawValue(r, c);
        if (typeof v === 'number') {
          count += 1;
          sum += v;
        }
      }
    }
    return { count, sum, avg: count ? sum / count : 0 };
  }, [selection, api]);

  const isData = activeSheet === 'data';

  return (
    <div className="flex min-h-screen flex-col gap-3 bg-[#eef1f5] p-4">
      {/* ---------------- 顶部演示条 ---------------- */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-lg border border-[#e5e7eb] bg-white px-4 py-3 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
        <div className="min-w-[210px]">
          <div className="flex items-center gap-2 text-[15px] font-semibold text-[#141414]">
            <FileSpreadsheet size={17} strokeWidth={2} className="text-[#217346]" />
            Excel 导出预览演示
          </div>
          <div className="mt-0.5 text-[12px] text-[#8c8c8c]">导出需求评审用 · 仿真 Excel 2019 界面</div>
        </div>

        <div className="flex flex-1 flex-wrap items-center gap-1">
          {DEMO_STEPS.map((s, i) => (
            <React.Fragment key={s.title}>
              <div
                className={`demo-step cursor-pointer ${activeStep === i ? 'demo-step-on' : ''}`}
                onClick={() => {
                  setActiveStep(i);
                  api.notify(`演示步骤 ${i + 1}：${s.hint}`);
                }}
              >
                <span className="demo-step-idx">{i + 1}</span>
                <span className={`text-[12.5px] ${activeStep === i ? 'font-medium text-[#1677ff]' : 'text-[#595959]'}`}>
                  {s.title}
                </span>
              </div>
              {i < DEMO_STEPS.length - 1 && <ChevronRight size={13} strokeWidth={2} className="text-[#bfbfbf]" />}
            </React.Fragment>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Tooltip title="模拟业务列表页点击导出，播放导出流程">
            <Button
              type="primary"
              icon={<Download size={14} strokeWidth={2} />}
              onClick={() => {
                setExportOpen(true);
                setActiveStep(2);
              }}
            >
              导出 Excel
            </Button>
          </Tooltip>
          <Button
            icon={<BookOpen size={14} strokeWidth={2} />}
            onClick={() => {
              setRulesOpen(true);
              setActiveStep(3);
            }}
          >
            导出需求说明
          </Button>
          <Button icon={<Presentation size={14} strokeWidth={2} />} onClick={() => setScriptOpen(true)}>
            演示脚本
          </Button>
        </div>
      </div>

      {/* ---------------- 仿真 Excel 窗口 ---------------- */}
      <div className="xl-window" style={{ height: 'calc(100vh - 160px)', minHeight: 560 }}>
        {/* 标题栏 */}
        <div className="xl-titlebar">
          <FileSpreadsheet size={15} strokeWidth={2} />
          <span className="font-medium">采购项目信息表_20261014153847.xlsx</span>
          <span className="text-[11px] opacity-80">- Excel</span>
          <span className="ml-3 rounded-[2px] bg-white/15 px-1.5 py-[1px] text-[10.5px]">
            {condFormat ? '条件格式已启用' : '条件格式已关闭'}
          </span>
          <div className="ml-auto flex h-full items-stretch">
            <button type="button" className="flex w-[42px] items-center justify-center hover:bg-white/15">
              <Minus size={13} strokeWidth={2} />
            </button>
            <button type="button" className="flex w-[42px] items-center justify-center hover:bg-white/15">
              <Square size={11} strokeWidth={2} />
            </button>
            <button type="button" className="flex w-[42px] items-center justify-center hover:bg-[#c42b1c]">
              <X size={14} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* 功能区 */}
        <Ribbon
          api={api}
          gridlines={gridlines}
          setGridlines={setGridlines}
          banded={banded}
          setBanded={setBanded}
          condFormat={condFormat}
          setCondFormat={setCondFormat}
          findTerm={findTerm}
          setFindTerm={setFindTerm}
        />

        {/* 提示条 */}
        <div
          className="xl-infobar"
          style={
            api.notice
              ? undefined
              : { background: '#f7f7f7', color: 'var(--xl-text-dim)', borderBottomColor: '#e8e8e8' }
          }
        >
          {api.notice ? <Check size={13} strokeWidth={2.4} /> : <MousePointerClick size={13} strokeWidth={2} />}
          <span>
            {api.notice ??
              '操作提示：双击单元格可编辑；拖动鼠标可框选；点击列标题右侧漏斗可按值筛选；Delete 清除内容；Ctrl/Cmd+C 复制选区'}
          </span>
        </div>

        {/* 公式栏 */}
        <div className="xl-formula-bar">
          <div className="xl-name-box" title="名称框">
            {nameBox}
          </div>
          <div className="xl-fx">
            <span className="text-[13px] font-semibold">fx</span>
          </div>
          <input
            className="xl-formula-input"
            value={formulaDraft}
            placeholder={isData ? '选择单元格以查看或编辑内容 / 公式' : '当前工作表为说明页'}
            onChange={(e) => setFormulaDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                api.setCellValue(selection.r, selection.c, formulaDraft);
              }
              if (e.key === 'Escape') setFormulaDraft(getFormula(selection.r, selection.c));
            }}
          />
          {isData && (
            <div className="flex items-center gap-2 pr-3 text-[11px] text-[color:var(--xl-text-dim)]">
              <span className="rounded-[2px] bg-[#dce9df] px-1.5 py-[1px]">
                当前列 {colLetter(selection.c)} · {columns[selection.c]?.label}
              </span>
            </div>
          )}
        </div>

        {/* 内容区 */}
        {isData ? (
          <ExcelGrid
            api={api}
            zoom={zoom / 100}
            gridlines={gridlines}
            banded={banded}
            condFormat={condFormat}
            onCommand={(msg) => api.notify(msg)}
          />
        ) : (
          <div className="min-h-0 flex-1 overflow-hidden bg-white">
            {activeSheet === 'fields' && <FieldsSheet />}
            {activeSheet === 'rules' && <RulesSheet />}
            {activeSheet === 'review' && <ReviewSheet />}
          </div>
        )}

        {/* Sheet 标签栏 */}
        <div className="xl-sheetbar custom-scrollbar overflow-x-auto">
          <div className="xl-sheet-nav" title="演示页未还原工作表导航">
            <ChevronLeft size={12} strokeWidth={2} />
          </div>
          <div className="xl-sheet-nav">
            <ChevronRight size={12} strokeWidth={2} />
          </div>
          {SHEETS.map((s) => (
            <button
              key={s.key}
              type="button"
              className={`xl-sheet-tab ${activeSheet === s.key ? 'xl-sheet-tab-on' : ''}`}
              onClick={() => {
                setActiveSheet(s.key);
                api.notify(`已切换到工作表「${s.label}」`);
              }}
            >
              {s.label}
            </button>
          ))}
          <button
            type="button"
            className="xl-sheet-nav ml-1"
            title="新建工作表"
            onClick={() => api.notify('演示页固定 4 个工作表；「+」为结构示意')}
          >
            <Plus size={12} strokeWidth={2} />
          </button>
        </div>

        {/* 状态栏 */}
        <div className="xl-statusbar">
          <div className="flex items-center gap-3">
            <span>{activeSheet === 'data' ? '就绪' : '说明工作表'}</span>
            {isData && (
              <span className="opacity-90">
                已选 {nameBox} · {api.dataRowCount} 条数据
                {api.filters.length > 0 ? ` · 已筛选 ${api.filters.length} 列` : ''}
              </span>
            )}
          </div>
          {isData && stats.count > 1 && (
            <div className="flex items-center gap-4 opacity-95">
              <span>平均值: {stats.avg.toLocaleString('zh-CN', { maximumFractionDigits: 2 })}</span>
              <span>计数: {stats.count}</span>
              <span>求和: {stats.sum.toLocaleString('zh-CN', { maximumFractionDigits: 2 })}</span>
            </div>
          )}
          <div className="xl-zoom">
            <button type="button" onClick={() => setZoom((z) => Math.max(60, z - 10))} title="缩小">
              <Minus size={12} strokeWidth={2.2} />
            </button>
            <input
              type="range"
              className="xl-zoom-range"
              min={60}
              max={160}
              step={10}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
            />
            <button type="button" onClick={() => setZoom((z) => Math.min(160, z + 10))} title="放大">
              <Plus size={12} strokeWidth={2.2} />
            </button>
            <span className="w-[38px] text-right">{zoom}%</span>
          </div>
        </div>
      </div>

      {/* ---------------- 底部说明 ---------------- */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 rounded-lg border border-[#e5e7eb] bg-white px-4 py-2 text-[12px] text-[#8c8c8c]">
        <span>仿真范围：Excel 外观 + 常用单元格操作，用于讲解规则，非真实 Excel 内核</span>
        <span>真实导出：服务端 .xlsx 生成，Excel / WPS 均可打开</span>
        <span>演示要点：格式化字段 · 脱敏 · 合计公式 · 超限分批 · 导出日志</span>
      </div>

      {/* ---------------- 浮层 ---------------- */}
      <ExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        rowCount={api.dataRowCount}
        onNotify={api.notify}
        onOpenPreview={() => {
          setActiveSheet('data');
          setActiveStep(3);
          api.setSelection({ r: 1, c: 5, r2: api.dataRowCount, c2: 5 });
          api.notify('已定位到「预算金额」列：导出后为数值 + 千分位，可直接参与计算');
        }}
      />
      <RulesDrawer open={rulesOpen} onClose={() => setRulesOpen(false)} />
      <ScriptDrawer open={scriptOpen} onClose={() => setScriptOpen(false)} />
    </div>
  );
};

export default Component;
