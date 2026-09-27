import React from 'react';
import { Check } from 'lucide-react';
import './style.css';

export interface MainStep {
  key?: string | number;
  label: string;
}

export interface SubStep {
  key?: string | number;
  label: string;
}

export interface StepBarProps {
  /** 主流程步骤列表，默认为采购五个阶段 */
  mainSteps?: (string | MainStep)[];
  /** 当前主流程步骤（支持索引数字从0开始，或字符串/key） */
  currentMainStep?: number | string;
  /** 点击主流程步骤的回调 */
  onMainStepChange?: (index: number, step: string | MainStep) => void;

  /** 子步骤列表，默认为采购发起的6个子阶段 */
  subSteps?: (string | SubStep)[];
  /** 当前子步骤（支持索引数字从0开始，或步骤文本/key） */
  currentSubStep?: number | string;
  /** 已完成的子步骤索引数组，若未传入则默认 currentSubStep 之前的所有子步骤为已完成 */
  completedSubSteps?: number[];
  /** 点击子步骤的回调 */
  onSubStepChange?: (index: number, step: string | SubStep) => void;

  /** 自定义外层样式类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

const DEFAULT_MAIN_STEPS = [
  '采购发起',
  '采购响应',
  '文件开启',
  '采购评审',
  '采购成交'
];

const DEFAULT_SUB_STEPS = [
  '采购基本信息',
  '编制采购清单',
  '编制采购(资格预审)公告',
  '发布采购(资格预审)公告',
  '报名与资审汇总',
  '资审结果通知'
];

export const StepBar: React.FC<StepBarProps> = ({
  mainSteps = DEFAULT_MAIN_STEPS,
  currentMainStep = 0,
  onMainStepChange,
  subSteps = DEFAULT_SUB_STEPS,
  currentSubStep = 2,
  completedSubSteps,
  onSubStepChange,
  className = '',
  style
}) => {
  // 解析主步骤选中索引
  const activeMainIndex = typeof currentMainStep === 'number'
    ? currentMainStep
    : mainSteps.findIndex((item) =>
        typeof item === 'string' ? item === currentMainStep : item.label === currentMainStep || item.key === currentMainStep
      );

  // 解析子步骤选中索引
  const activeSubIndex = typeof currentSubStep === 'number'
    ? currentSubStep
    : subSteps.findIndex((item) =>
        typeof item === 'string' ? item === currentSubStep : item.label === currentSubStep || item.key === currentSubStep
      );

  const safeActiveSubIndex = activeSubIndex >= 0 ? activeSubIndex : 0;

  // 如果没有显式传 completedSubSteps，则默认当前节点之前全部为已完成
  const completedIndices = completedSubSteps ?? (
    safeActiveSubIndex > 0 ? Array.from({ length: safeActiveSubIndex }, (_, i) => i) : []
  );

  const totalSubSteps = subSteps.length;
  // 计算进度线宽度百分比：当有 N 个点时，每段占比为 100 / (N - 1)
  const progressRatio = totalSubSteps > 1 ? Math.min(100, Math.max(0, (safeActiveSubIndex / (totalSubSteps - 1)) * 100)) : 0;
  // 左右 padding 百分比（默认 100 / (2 * N) % 对应每个节点的中心对其，以 6 个为例约为 8.33%）
  const paddingPercent = totalSubSteps > 0 ? 100 / (totalSubSteps * 2) : 8.33;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-sm mb-4 border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`} style={style}>
      {/* 主流程步骤条 */}
      <div className="step-container">
        {mainSteps.map((step, index) => {
          const label = typeof step === 'string' ? step : step.label;
          const isActive = index === activeMainIndex;

          return (
            <div
              key={typeof step === 'object' && step.key ? step.key : index}
              className={`step-item ${isActive ? 'active' : ''} ${onMainStepChange ? 'cursor-pointer' : ''}`}
              onClick={() => onMainStepChange?.(index, step)}
            >
              {label}
            </div>
          );
        })}
      </div>

      {/* 子步骤条 */}
      {totalSubSteps > 0 && (
        <div className="sub-step-container">
          <div className="sub-step-items">
            {subSteps.map((step, index) => {
              const label = typeof step === 'string' ? step : step.label;
              const isCompleted = completedIndices.includes(index);
              const isCurrent = index === safeActiveSubIndex;

              return (
                <div
                  key={typeof step === 'object' && step.key ? step.key : index}
                  className={`sub-step-item ${onSubStepChange ? 'cursor-pointer' : ''}`}
                  onClick={() => onSubStepChange?.(index, step)}
                >
                  <span className={`sub-step-label ${isCurrent ? 'current' : isCompleted ? 'active' : ''}`}>
                    {label}
                  </span>
                  <div className={`sub-step-dot ${isCurrent ? 'current' : isCompleted ? 'completed' : ''}`}>
                    {isCompleted && <Check className="w-3 h-3 text-white stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="sub-step-line-container" style={{ padding: `0 ${paddingPercent}%` }}>
            <div className="sub-step-line active" style={{ flex: `0 0 ${progressRatio}%` }}></div>
            <div className="sub-step-line"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StepBar;
