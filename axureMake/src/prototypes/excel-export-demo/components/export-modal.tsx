/**
 * Excel 导出预览演示 —— 导出流程弹窗
 *
 * 用三段式进度把「导出需求」的交互过程演出来：读取筛选条件 → 生成文件 → 完成。
 */

import React, { useEffect, useState } from 'react';
import { Button, Modal, Progress, Steps } from 'antd';
import {
  Check,
  FileSpreadsheet,
  FileDown,
  FolderOpen,
  TriangleAlert,
} from 'lucide-react';
import { EXPORT_FILTERS, EXPORT_FILE_NAME } from '../data';

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  onOpenPreview: () => void;
  rowCount: number;
  onNotify: (msg: string) => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ open, onClose, onOpenPreview, rowCount, onNotify }) => {
  const [step, setStep] = useState(0);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    if (!open) {
      setStep(0);
      setPercent(0);
      return;
    }
    setStep(0);
    setPercent(8);
    const t1 = window.setTimeout(() => setStep(1), 700);
    const timer = window.setInterval(() => {
      setPercent((p) => {
        if (p >= 100) return 100;
        return Math.min(100, p + Math.ceil(Math.random() * 12));
      });
    }, 180);
    return () => {
      window.clearTimeout(t1);
      window.clearInterval(timer);
    };
  }, [open]);

  useEffect(() => {
    if (percent >= 100 && step === 1) {
      const t = window.setTimeout(() => setStep(2), 380);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [percent, step]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={620}
      centered
      title="导出 Excel"
      footer={
        step === 2
          ? [
              <Button key="again" onClick={() => {
                setStep(0);
                setPercent(8);
              }}>
                重新导出
              </Button>,
              <Button
                key="download"
                onClick={() => onNotify('演示页不产生真实文件；实际实现走服务端生成 + 下载中心')}
              >
                下载到本地
              </Button>,
              <Button
                key="open"
                type="primary"
                icon={<FolderOpen size={14} strokeWidth={2} />}
                onClick={() => {
                  onOpenPreview();
                  onClose();
                }}
              >
                打开预览
              </Button>,
            ]
          : [
              <Button key="cancel" onClick={onClose}>
                取消导出
              </Button>,
            ]
      }
    >
      <Steps
        size="small"
        current={step}
        className="!mb-5"
        items={[{ title: '读取筛选条件' }, { title: '生成文件' }, { title: '完成' }]}
      />

      {step === 0 && (
        <div className="rounded-lg border border-[#f0f0f0] bg-[#fafafa] px-4 py-3">
          <div className="mb-2 text-[13px] font-medium text-[#262626]">本次导出条件（与列表页筛选一致）</div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[12.5px] text-[#595959]">
            {EXPORT_FILTERS.map((f) => (
              <div key={f.label} className="flex gap-1">
                <span className="text-[#8c8c8c]">{f.label}：</span>
                <span className="font-medium text-[#262626]">{f.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="py-2">
          <Progress percent={percent} status="active" strokeColor="#1677ff" />
          <div className="mt-3 text-[12.5px] text-[#595959]">
            {percent < 40 && '正在读取 14 个导出字段并应用格式化规则（金额 / 日期 / 脱敏）…'}
            {percent >= 40 && percent < 80 && '正在生成工作表：表头冻结 + 自动筛选 + 条件格式…'}
            {percent >= 80 && '正在写入合计行公式 =SUM(F2:F19) 并校验文件完整性…'}
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-md border border-[#ffe58f] bg-[#fffbe6] px-3 py-2 text-[12px] text-[#7a6a00]">
            <TriangleAlert size={14} strokeWidth={2} className="mt-[2px] shrink-0" />
            <span>
              单次导出上限 50,000 条；当前 {rowCount} 条，未超限。超出时将按每批 20,000 条拆分为压缩包下载。
            </span>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="flex items-center gap-3 rounded-lg border border-[#b7eb8f] bg-[#f6ffed] px-4 py-3">
            <Check size={18} strokeWidth={2.4} className="text-[#52c41a]" />
            <div className="flex-1">
              <div className="text-[13.5px] font-medium text-[#262626]">导出完成</div>
              <div className="mt-1 flex items-center gap-2 text-[12px] text-[#595959]">
                <FileSpreadsheet size={14} strokeWidth={1.9} className="text-[#217346]" />
                <span className="font-mono">{EXPORT_FILE_NAME}</span>
              </div>
            </div>
            <FileDown size={18} strokeWidth={1.8} className="text-[#8c8c8c]" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-[12.5px] text-[#595959] md:grid-cols-4">
            <div>
              <div className="text-[#8c8c8c]">记录数</div>
              <div className="font-medium text-[#262626]">{rowCount} 条</div>
            </div>
            <div>
              <div className="text-[#8c8c8c]">文件大小</div>
              <div className="font-medium text-[#262626]">24.6 KB</div>
            </div>
            <div>
              <div className="text-[#8c8c8c]">耗时</div>
              <div className="font-medium text-[#262626]">1.8 秒</div>
            </div>
            <div>
              <div className="text-[#8c8c8c]">操作日志</div>
              <div className="font-medium text-[#262626]">已记录</div>
            </div>
          </div>

          <div className="mt-4 text-[12px] leading-[1.7] text-[#8c8c8c]">
            提示：点击「打开预览」查看导出后的表格效果与格式规则；实际实现由服务端生成文件并写入下载中心，
            同时记录导出人、时间、条数与筛选条件。
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ExportModal;
