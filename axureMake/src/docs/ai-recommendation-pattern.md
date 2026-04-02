# AI智能推荐设计规范

> 本文档沉淀AI智能推荐功能的交互设计规范，用于保持项目中AI相关功能的一致性体验。

## 1. 功能概述

AI智能推荐是一种通过AI算法自动分析并推荐表单字段值的功能，配合漫游式引导提供直观的操作反馈。

## 2. 触发方式

### 2.1 按钮位置
- **位置**：表单模块标题栏右侧，其他功能按钮左侧
- **顺序**：智能推荐按钮 → 加密设置按钮 → 展开/折叠按钮

### 2.2 按钮样式

**默认状态**：
```
背景：渐变紫色到蓝色 (from-purple-500 to-blue-500)
文字：白色
图标：Sparkles (闪光图标)
文字内容："智能推荐"
圆角：rounded
内边距：px-3 py-1.5
阴影：shadow-sm
悬停：hover:from-purple-600 hover:to-blue-600 hover:shadow-md
```

**加载状态**：
```
背景：bg-purple-100
文字：text-purple-600
图标：Loader2 (旋转加载图标) + animate-spin
文字内容："智能推荐中..."
状态：disabled
光标：cursor-not-allowed
```

## 3. 漫游式引导

### 3.1 遮罩层
- 类型：半透明黑色遮罩
- 样式：`bg-black/20`
- 层级：z-40
- 交互：pointer-events-none（不拦截点击）

### 3.2 字段高亮效果

**高亮样式**：
```css
/* 高亮状态 */
bg-yellow-100 dark:bg-yellow-900/30    /* 黄色背景 */
ring-2 ring-yellow-400                 /* 黄色边框 */
shadow-lg                              /* 阴影 */
scale-[1.02]                           /* 轻微放大 */
transition-all duration-500            /* 平滑过渡 */
```

**普通状态**：
- 无额外样式，保持原有布局

### 3.3 字段遍历逻辑
- 每个字段停留时间：1500ms
- 遍历顺序：按字段配置数组顺序
- 自动滚动：页面自动滚动到当前高亮字段

## 4. AI小人形象

### 4.1 视觉设计

**头像容器**：
```
尺寸：w-14 h-14 (56px)
形状：rounded-full (圆形)
边框：渐变边框 from-purple-400 via-blue-400 to-cyan-400
边框宽度：p-0.5
阴影：shadow-lg
动画：animate-bounce (弹跳效果)
```

**头像内容**：
```
背景：白色/深色模式灰色
图片：AI机器人形象
尺寸：w-12 h-12
圆角：rounded-full
```

### 4.2 进度指示器

**进度条**：
```
容器：w-14 h-1 bg-gray-200 rounded-full overflow-hidden
进度：bg-gradient-to-r from-purple-500 to-blue-500
动画：transition-all duration-300
```

### 4.3 位置跟随
- 位置计算：基于当前高亮字段的 `getBoundingClientRect()`
- 偏移：字段右侧 20px (`rect.right + 20`)
- 垂直对齐：字段顶部 (`rect.top`)
- 过渡动画：`transition-all duration-500 ease-in-out`

## 5. 气泡提示

### 5.1 气泡样式

**容器**：
```
背景：白色/深色模式灰色
圆角：rounded-2xl rounded-tl-none (左下角直角)
内边距：px-4 py-3
阴影：shadow-xl
边框：border border-purple-100
最大宽度：max-w-[200px]
```

**小三角**：
```
位置：absolute left-[-6px] top-4
尺寸：w-3 h-3
背景：同气泡背景
边框：border-l border-b border-purple-100
旋转：transform rotate-45
```

### 5.2 内容结构

**标题区**：
- 图标：Sparkles (紫色)
- 文字："AI智能推荐" (紫色加粗)

**状态文案**：
- 进行中："小云正在帮您生成中..."
- 已完成："推荐完成！"

**当前字段提示**（可选）：
- 文案格式："正在填充：{字段名称}"
- 样式：text-xs text-gray-500

## 6. 状态管理

### 6.1 React State

```typescript
// AI推荐进行状态
const [isAIRecommending, setIsAIRecommending] = useState(false);

// 当前高亮字段ID
const [currentHighlightField, setCurrentHighlightField] = useState<string | null>(null);

// 推荐进度 (0-100)
const [aiRecommendationProgress, setAiRecommendationProgress] = useState(0);

// 气泡显示状态
const [showAIBubble, setShowAIBubble] = useState(false);

// AI小人位置
const [aiBubblePosition, setAiBubblePosition] = useState({ x: 0, y: 0 });
```

### 6.2 字段配置

```typescript
const aiFields = [
  { id: 'fieldId1', label: '字段显示名称1' },
  { id: 'fieldId2', label: '字段显示名称2' },
  // ...
];
```

### 6.3 字段元素ID规范
- 格式：`field-{fieldId}`
- 示例：`field-autoPublish`, `field-hoursAfterApproval`

## 7. 交互流程

```
1. 用户点击"智能推荐"按钮
   ↓
2. 按钮变为加载状态，显示遮罩层
   ↓
3. AI小人出现在第一个字段旁边
   气泡显示"小云正在帮您生成中..."
   ↓
4. 字段依次高亮（每个1.5秒）
   AI小人跟随移动到当前字段
   进度条实时更新
   气泡显示当前填充的字段名称
   ↓
5. 所有字段遍历完成
   气泡显示"推荐完成！"
   按钮恢复默认状态
   ↓
6. 2秒后气泡自动消失
   遮罩层消失
```

## 8. 使用示例

### 8.1 完整实现参考

参考页面：`/src/prototypes/procurement-list-copy2/index.tsx`

关键实现点：
- 按钮位置：编制采购(资格预审)公告模块标题栏
- 字段高亮：6个字段（自动发布、截止时间、公告格式、公告内容、内部附件、外部附件）
- AI小人：使用在线图片生成服务创建机器人形象

### 8.2 快速接入代码模板

```tsx
// 1. 导入图标
import { Sparkles, Loader2 } from 'lucide-react';

// 2. 定义状态
const [isAIRecommending, setIsAIRecommending] = useState(false);
const [currentHighlightField, setCurrentHighlightField] = useState<string | null>(null);
const [aiRecommendationProgress, setAiRecommendationProgress] = useState(0);
const [showAIBubble, setShowAIBubble] = useState(false);
const [aiBubblePosition, setAiBubblePosition] = useState({ x: 0, y: 0 });

// 3. 字段配置
const aiFields = [
  { id: 'field1', label: '字段1' },
  { id: 'field2', label: '字段2' },
];

// 4. 处理函数
const handleAIRecommend = () => {
  setIsAIRecommending(true);
  setShowAIBubble(true);
  setAiRecommendationProgress(0);

  let currentIndex = 0;
  const interval = setInterval(() => {
    if (currentIndex >= aiFields.length) {
      clearInterval(interval);
      setIsAIRecommending(false);
      setCurrentHighlightField(null);
      setTimeout(() => setShowAIBubble(false), 2000);
      return;
    }

    const field = aiFields[currentIndex];
    setCurrentHighlightField(field.id);

    const fieldElement = document.getElementById(`field-${field.id}`);
    if (fieldElement) {
      const rect = fieldElement.getBoundingClientRect();
      setAiBubblePosition({ x: rect.right + 20, y: rect.top });
    }

    setAiRecommendationProgress(((currentIndex + 1) / aiFields.length) * 100);
    currentIndex++;
  }, 1500);
};

// 5. 字段高亮样式
<div
  id="field-field1"
  className={`transition-all duration-500 ${
    currentHighlightField === 'field1'
      ? 'bg-yellow-100 ring-2 ring-yellow-400 shadow-lg scale-[1.02]'
      : ''
  }`}
>
  {/* 字段内容 */}
</div>
```

## 9. 注意事项

1. **字段ID唯一性**：确保每个字段的ID在页面中唯一
2. **性能考虑**：字段数量较多时，考虑优化滚动性能
3. **响应式适配**：AI小人位置需要监听窗口resize事件重新计算
4. **无障碍支持**：考虑为视觉障碍用户添加aria-live提示
5. **错误处理**：实际项目中需要处理AI推荐失败的情况

## 10. 扩展建议

- 支持手动暂停/继续推荐流程
- 支持单个字段重新推荐
- 支持推荐结果预览和确认
- 支持推荐历史记录查看
