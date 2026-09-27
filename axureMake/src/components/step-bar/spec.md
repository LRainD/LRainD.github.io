# StepBar 通用步骤条组件规格说明

## 概述

`StepBar` 组件抽取自采购原型中的顶部双层流程步骤条，包含**主流程步骤**（带切角箭头效果）与**子流程进度条**（带圆点勾选与连接线）。

## 组件接口 (Props)

```typescript
export interface MainStep {
  key?: string | number;
  label: string;
}

export interface SubStep {
  key?: string | number;
  label: string;
}

export interface StepBarProps {
  /** 主流程步骤列表，默认为采购 5 个大阶段 */
  mainSteps?: (string | MainStep)[];
  /** 当前主流程步骤，支持数字索引 (从 0 开始) 或 label 文本/key */
  currentMainStep?: number | string;
  /** 点击主流程步骤的回调 */
  onMainStepChange?: (index: number, step: string | MainStep) => void;

  /** 子步骤列表，默认为采购发起的 6 个子阶段 */
  subSteps?: (string | SubStep)[];
  /** 当前子步骤，支持数字索引 (从 0 开始) 或 label 文本/key */
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
```

## 使用示例

```tsx
import StepBar from '@/components/step-bar';

// 基础使用（默认使用采购发起的节点和样式）
<StepBar currentMainStep={0} currentSubStep={2} />

// 快捷传入所在节点
<StepBar 
  currentMainStep="采购发起"
  currentSubStep="编制采购(资格预审)公告" 
/>

// 自定义其他节点/阶段列表与点击事件
<StepBar
  mainSteps={['采购发起', '采购响应', '文件开启', '采购评审', '采购成交']}
  currentMainStep={1}
  subSteps={['供应商响应', '保证金缴纳', '文件提交']}
  currentSubStep={0}
  onSubStepChange={(index, step) => console.log(index, step)}
/>
```
