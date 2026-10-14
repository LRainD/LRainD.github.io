/**
 * Excel 导出预览演示 —— 需求说明抽屉 & 演示脚本抽屉
 */

import React from 'react';
import { Alert, Drawer, Tag } from 'antd';
import { CircleAlert, ListChecks, MessageCircleQuestionMark, Play } from 'lucide-react';
import { DEMO_SCRIPT, EXPORT_RULES, FIELD_SPECS } from '../data';

interface RulesDrawerProps {
  open: boolean;
  onClose: () => void;
}

/** 导出需求说明 */
export const RulesDrawer: React.FC<RulesDrawerProps> = ({ open, onClose }) => (
  <Drawer title="导出需求说明（评审用）" size={560} open={open} onClose={onClose}>
    <div className="space-y-5 text-[13px] leading-[1.75] text-[#262626]">
      <Alert
        type="info"
        showIcon
        message="一句话需求"
        description="采购项目列表页支持按当前筛选条件一键导出 Excel，导出文件需具备表头冻结、自动筛选、金额千分位、日期标准化、手机号脱敏、合计行公式等能力，可直接用于业务二次核算。"
      />

      {EXPORT_RULES.map((g) => (
        <section key={g.title}>
          <div className="mb-2 flex items-center gap-2 text-[13.5px] font-semibold">
            <span className="inline-block h-[14px] w-[3px] rounded bg-[#1677ff]" />
            {g.title}
          </div>
          <ul className="space-y-1">
            {g.items.map((it) => (
              <li key={it} className="flex gap-2">
                <span className="mt-[8px] h-[4px] w-[4px] shrink-0 rounded-full bg-[#bfbfbf]" />
                <span className="text-[#595959]">{it}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section>
        <div className="mb-2 flex items-center gap-2 text-[13.5px] font-semibold">
          <span className="inline-block h-[14px] w-[3px] rounded bg-[#1677ff]" />
          字段清单（14 列 + 合计行）
        </div>
        <div className="overflow-hidden rounded-md border border-[#f0f0f0]">
          <table className="w-full border-collapse text-[12.5px]">
            <thead>
              <tr className="bg-[#fafafa] text-left text-[#595959]">
                <th className="border-b border-[#f0f0f0] px-2 py-1.5">列</th>
                <th className="border-b border-[#f0f0f0] px-2 py-1.5">Excel 表头</th>
                <th className="border-b border-[#f0f0f0] px-2 py-1.5">实现规则</th>
              </tr>
            </thead>
            <tbody>
              {FIELD_SPECS.map((f) => (
                <tr key={f.field + f.col} className="align-top">
                  <td className="border-b border-[#f5f5f5] px-2 py-1.5 text-center font-medium">{f.col}</td>
                  <td className="border-b border-[#f5f5f5] px-2 py-1.5 whitespace-nowrap">{f.label}</td>
                  <td className="border-b border-[#f5f5f5] px-2 py-1.5 text-[#8c8c8c]">{f.rule}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center gap-2 text-[13.5px] font-semibold">
          <ListChecks size={15} strokeWidth={2} className="text-[#1677ff]" />
          研发自测验收清单
        </div>
        <ol className="space-y-1 pl-4 text-[12.5px] text-[#595959]" style={{ listStyle: 'decimal' }}>
          <li>用 Excel 2016/2019、WPS 三端打开导出文件，确认无格式错乱、无乱码</li>
          <li>采购编号、联系电话列显示为文本，未变成日期 / 科学计数</li>
          <li>金额列右对齐且带千分位，小数位统一 2 位</li>
          <li>首行冻结、筛选按钮可用，合计行 SUM 公式可继续计算</li>
          <li>空值与空筛选结果两种场景均符合预期（空值 - ，无数据不生成文件）</li>
          <li>50,001 条数据触发分批与压缩包，且进度可取消</li>
          <li>导出日志可查到导出人、时间、条数、筛选条件</li>
        </ol>
      </section>
    </div>
  </Drawer>
);

interface ScriptDrawerProps {
  open: boolean;
  onClose: () => void;
}

const QA: { q: string; a: string }[] = [
  {
    q: '能不能只导出我勾选的那几行？',
    a: '一期按当前筛选条件导出全部；按勾选导出依赖选择态与筛选条件的一致性，建议放入二期。',
  },
  {
    q: '为什么手机号要打码？业务还要打电话。',
    a: '列表页展示即为脱敏态，导出属离线文件，脱敏范围需与安全确认；如需明文，走审批导出。',
  },
  {
    q: '导出后能不能直接在 Excel 里做汇总？',
    a: '可以。金额列是数值 + 千分位格式，合计行带 SUM 公式，可直接透视表或继续加列计算。',
  },
  {
    q: '数据量很大时会不会卡住？',
    a: '≤3 秒同步导出；更大批量转异步任务，进入下载中心并通过站内信通知，进度可查。',
  },
  {
    q: '文件打不开 / 提示格式错误怎么办？',
    a: '统一输出 .xlsx；若客户环境为 Office 2003 等老版本，提供 .xls 降级开关（配置项，默认关）。',
  },
];

/** 演示脚本：评审现场口播顺序 */
export const ScriptDrawer: React.FC<ScriptDrawerProps> = ({ open, onClose }) => (
  <Drawer title="演示脚本（怎么讲、点哪里）" size={560} open={open} onClose={onClose}>
    <div className="space-y-3">
      <Alert
        type="warning"
        showIcon
        message="演示前提"
        description="本页是「导出结果的仿真预览」，不代表真实 Excel 内核。真实能力以 Excel / WPS 打开导出文件为准，页面里的操作仅用于讲解规则。"
      />

      {DEMO_SCRIPT.map((s) => (
        <div key={s.step} className="flex gap-3 rounded-lg border border-[#f0f0f0] px-3 py-2.5">
          <div className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full bg-[#e6f4ff] text-[11.5px] font-semibold text-[#1677ff]">
            {s.step}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 text-[13px] font-medium text-[#262626]">
              <Play size={12} strokeWidth={2.4} className="text-[#52c41a]" />
              {s.title}
            </div>
            <div className="mt-1 text-[12.5px] text-[#595959]">
              <span className="text-[#8c8c8c]">动作：</span>
              {s.action}
            </div>
            <div className="text-[12.5px] text-[#595959]">
              <span className="text-[#8c8c8c]">看点：</span>
              {s.focus}
            </div>
          </div>
        </div>
      ))}

      <div className="pt-2">
        <div className="mb-2 flex items-center gap-2 text-[13.5px] font-semibold">
          <MessageCircleQuestionMark size={15} strokeWidth={2} className="text-[#1677ff]" />
          预判提问与应答口径
        </div>
        <div className="space-y-2">
          {QA.map((item) => (
            <div key={item.q} className="rounded-lg bg-[#fafafa] px-3 py-2">
              <div className="flex items-start gap-2 text-[12.5px] font-medium text-[#262626]">
                <CircleAlert size={13} strokeWidth={2} className="mt-[2px] shrink-0 text-[#faad14]" />
                {item.q}
              </div>
              <div className="mt-1 pl-5 text-[12.5px] text-[#595959]">{item.a}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <Tag color="green">文件名规则</Tag>
        <Tag color="blue">表头冻结</Tag>
        <Tag color="gold">条件格式</Tag>
        <Tag color="purple">脱敏</Tag>
        <Tag color="red">超限分批</Tag>
        <Tag>导出日志</Tag>
      </div>
    </div>
  </Drawer>
);
