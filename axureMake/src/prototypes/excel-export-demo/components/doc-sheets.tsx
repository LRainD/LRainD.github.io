/**
 * Excel 导出预览演示 —— 说明型工作表（字段说明 / 导出规则 / 评审要点）
 *
 * 这三个 Sheet 直接用仿真 Excel 的表格语言呈现需求说明，
 * 让"讲规则"和"看结果"在同一个窗口里完成。
 */

import React from 'react';
import {
  CircleAlert,
  CircleCheck,
  FileText,
  Hash,
  KeyRound,
  ListChecks,
  Presentation,
  ShieldCheck,
  Sigma,
  TriangleAlert,
} from 'lucide-react';
import { EXPORT_FILE_NAME, EXPORT_FILTERS, EXPORT_RULES, FIELD_SPECS, REVIEW_ITEMS } from '../data';

const RULE_ICON: Record<string, React.ReactNode> = {
  key: <KeyRound size={15} strokeWidth={1.9} />,
  file: <FileText size={15} strokeWidth={1.9} />,
  hash: <Hash size={15} strokeWidth={1.9} />,
  shield: <ShieldCheck size={15} strokeWidth={1.9} />,
  sigma: <Sigma size={15} strokeWidth={1.9} />,
  alert: <CircleAlert size={15} strokeWidth={1.9} />,
};

/** 字段说明 Sheet */
export const FieldsSheet: React.FC = () => (
  <div className="xl-doc-sheet h-full overflow-auto custom-scrollbar">
    <div className="mb-1 text-[15px] font-semibold text-[color:var(--xl-text)]">导出字段与格式化规则</div>
    <div className="mb-4 text-[12px] text-[color:var(--xl-text-dim)]">
      共 14 列 + 1 行为公式行；导出字段与系统字段一对一映射，不做别名转换（二期支持导出模板配置）。
    </div>
    <table className="xl-doc-table">
      <thead>
        <tr>
          <th style={{ width: 44 }}>列</th>
          <th style={{ width: 140 }}>Excel 表头</th>
          <th style={{ width: 130 }}>系统字段</th>
          <th style={{ width: 82 }}>数据类型</th>
          <th>格式化规则</th>
          <th style={{ width: 210 }}>示例值</th>
        </tr>
      </thead>
      <tbody>
        {FIELD_SPECS.map((f) => (
          <tr key={f.col + f.field}>
            <td className="text-center font-semibold">{f.col}</td>
            <td>{f.label}</td>
            <td className="xl-mono">{f.field}</td>
            <td>{f.type}</td>
            <td>{f.rule}</td>
            <td className="xl-mono">{f.sample}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <div className="mt-4 flex items-start gap-2 rounded-[3px] border border-[#e3d48a] bg-[color:var(--xl-infobar)] px-3 py-2 text-[12px] text-[color:var(--xl-infobar-text)]">
      <TriangleAlert size={14} strokeWidth={2} className="mt-[2px] shrink-0" />
      <span>
        易错点：采购编号、联系电话等「看起来是数字」的字段必须按文本导出，否则 Excel 会把 <span className="xl-mono">ZJJT-2026-0001</span> 识别成日期或科学计数，
        这是导出需求里最高频的线上问题。
      </span>
    </div>
  </div>
);

/** 导出规则 Sheet */
export const RulesSheet: React.FC = () => (
  <div className="xl-doc-sheet h-full overflow-auto custom-scrollbar">
    <div className="mb-1 text-[15px] font-semibold text-[color:var(--xl-text)]">导出规则清单</div>
    <div className="mb-4 text-[12px] text-[color:var(--xl-text-dim)]">
      文件名：<span className="xl-mono">{EXPORT_FILE_NAME}</span>
    </div>

    <div className="mb-5 rounded-[3px] border border-[color:var(--xl-grid)]">
      <div className="border-b border-[color:var(--xl-grid)] bg-[color:var(--xl-head-bg)] px-3 py-2 text-[12px] font-semibold">
        本次导出条件（与业务列表页筛选一致）
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-1 px-3 py-2 text-[12.5px] md:grid-cols-3">
        {EXPORT_FILTERS.map((f) => (
          <div key={f.label} className="flex gap-2">
            <span className="text-[color:var(--xl-text-dim)]">{f.label}：</span>
            <span className="font-medium">{f.value}</span>
          </div>
        ))}
      </div>
    </div>

    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      {EXPORT_RULES.map((g) => (
        <div key={g.title} className="rounded-[3px] border border-[color:var(--xl-grid)]">
          <div className="flex items-center gap-2 border-b border-[color:var(--xl-grid)] bg-[color:var(--xl-head-bg)] px-3 py-2">
            <span className="text-[color:var(--xl-accent)]">{RULE_ICON[g.icon] ?? <FileText size={15} strokeWidth={1.9} />}</span>
            <span className="text-[12.5px] font-semibold">{g.title}</span>
          </div>
          <ul className="space-y-1 px-3 py-2">
            {g.items.map((it) => (
              <li key={it} className="flex gap-2 text-[12.5px] leading-[1.65]">
                <span className="mt-[7px] h-[4px] w-[4px] shrink-0 rounded-full bg-[color:var(--xl-accent)]" />
                <span>{it}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
);

/** 评审要点 Sheet */
export const ReviewSheet: React.FC = () => (
  <div className="xl-doc-sheet h-full overflow-auto custom-scrollbar">
    <div className="mb-1 flex items-center gap-2 text-[15px] font-semibold text-[color:var(--xl-text)]">
      <Presentation size={16} strokeWidth={1.9} className="text-[color:var(--xl-accent)]" />
      需求走查清单（评审现场逐条确认）
    </div>
    <div className="mb-4 text-[12px] text-[color:var(--xl-text-dim)]">
      共 {REVIEW_ITEMS.length} 项，其中待确认{' '}
      {REVIEW_ITEMS.filter((r) => r.status === '待确认').length} 项 —— 建议评审结束前逐条落到 owner 与时间点。
    </div>
    <table className="xl-doc-table">
      <thead>
        <tr>
          <th style={{ width: 42 }}>#</th>
          <th>待确认问题</th>
          <th style={{ width: 88 }}>状态</th>
          <th style={{ width: 110 }}>Owner</th>
          <th style={{ width: 320 }}>结论 / 备注</th>
        </tr>
      </thead>
      <tbody>
        {REVIEW_ITEMS.map((r) => (
          <tr key={r.id}>
            <td className="text-center">{r.id}</td>
            <td>{r.question}</td>
            <td>
              <span
                className="inline-flex items-center gap-1 rounded-[2px] px-[6px] py-[1px] text-[11.5px] font-medium"
                style={
                  r.status === '已确认'
                    ? { background: '#c6efce', color: '#006100' }
                    : { background: '#ffeb9c', color: '#9c6500' }
                }
              >
                {r.status === '已确认' ? <CircleCheck size={11} strokeWidth={2.2} /> : <ListChecks size={11} strokeWidth={2.2} />}
                {r.status}
              </span>
            </td>
            <td>{r.owner}</td>
            <td>{r.note}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <div className="mt-4 flex items-start gap-2 rounded-[3px] border border-[#e3d48a] bg-[color:var(--xl-infobar)] px-3 py-2 text-[12px] text-[color:var(--xl-infobar-text)]">
      <TriangleAlert size={14} strokeWidth={2} className="mt-[2px] shrink-0" />
      <span>高风险项优先：脱敏范围（离线文件）与导出审批流，直接影响上线合规判定，建议会上先定这两条。</span>
    </div>
  </div>
);
