# TopActionBar 组件规格

## 组件概述

用于详情页或编辑页的顶部标题与操作区域。组件只负责标题、操作按钮和吸顶视觉，不负责面包屑、页面内容或业务事件。

## 文件位置

`src/components/top-action-bar/`

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | ReactNode | - | 左侧标题或标题组合 |
| actions | ReactNode | - | 右侧操作按钮区域 |
| className | string | '' | 自定义样式类名 |

## 视觉与交互

- 高度 60px，白色背景，底部使用浅色分隔线。
- 在主内容滚动容器中吸顶，使用 `top: -16px` 抵消主内容区顶部内边距。
- 窄屏下标题和操作区上下排列，操作按钮允许换行。
- 操作按钮的主次层级、禁用状态和业务回调由使用方传入。

## 使用示例

```tsx
<TopActionBar
  title="编辑检查模板"
  actions={(
    <Space>
      <Button>保存草稿</Button>
      <Button type="primary">发布</Button>
      <Button>取消</Button>
    </Space>
  )}
/>
```
