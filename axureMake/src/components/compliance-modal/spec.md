# ComplianceModal 规格文档

## 1. 概述
组件主要包含两层逻辑弹窗：
1. **数字合规官检测中** 弹窗：包含动画/流式文字展示大模型及各规则校验过程。
2. **风控预警提醒** 弹窗：在检测完成后自动弹出展示各项合规/风控结果，并提供操作项（反馈、满意度评价、详情查看等）。

## 2. API 规范
- **`ref.current.startFlow(options?)`**: 开始完整的检测流（自动弹出检测中弹窗，在完成后弹出风控预警结果弹窗）。`options.withInitialData` 控制结果弹窗是否展示「初次判定数据」列，默认不展示。
- **`ref.current.showDetection(options?)`**: 仅展示检测中弹窗。`options.withInitialData` 同上。
- **`ref.current.showRiskWarning(options?)`**: 仅展示风控预警结果弹窗。`options.withInitialData` 同上；仅从右侧 AI 浮窗路径打开时传 `true`。

## 3. Props
- **`showDisposalFields`**（默认 `true`）：是否展示处置相关列（勾选框、处置状态、处置模式、处置说明、处置附件）。
- **`showReleaseFields`**（默认 `false`）：是否在风控预警结果表格中展示「解除状态」「当前数据描述」两列（「初次判定数据」列由打开入口的 `withInitialData` 决定）。
  - 解除状态：取 `riskData[].releaseStatus`，值为「已解除」或「未解除」，纯文本展示，缺省按「未解除」展示；当状态为「已解除」时，「风险预警信息」列展示 `-`。
  - 当前数据描述：取 `riskData[].currentData`，描述当前数据快照。
  - 初次判定数据：取 `riskData[].initialData`，描述首次判定时的数据与结论；仅当打开弹窗时传入 `withInitialData: true`（右侧 AI 浮窗路径）才展示，页面顶部「提交审批」及步骤条路径不展示。
- **`demoBranchSelect`**（默认 `false`）：为 `true` 时，点击检测中弹窗的「跳过演示」先弹出「选择演示分支」弹窗，选择后再打开风控预警结果弹窗。
  - 「有未解除」：展示全部风险预警数据。
  - 「无未解除」：仅展示 `releaseStatus === '已解除'` 的预警数据，「本次未通过 N 项风险预警」显示为 0；表格序号按展示顺序从 1 重新编号；底部「已选 N 条」按过滤后的数据计算。
  - 通过 `showRiskWarning` 等其他入口打开结果弹窗时，重置为「有未解除」的完整数据。
- **`riskData`**：自定义风险数据，透传后覆盖组件内置数据。
