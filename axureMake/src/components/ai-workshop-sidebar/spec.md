# AI工坊侧边栏

## 组件名称

AI工坊侧边栏（AiWorkshopSidebar）

## 组件用途

为「云筑AI工坊」系列页面提供通用左侧边栏，包含 LOGO、主页入口、工具菜单、服务菜单、通知、展开/收起控制以及当前用户入口。

菜单数据统一内聚在组件内部，后续新增或调整云筑AI工坊的公共菜单时，只需修改本组件即可对所有引用页面生效。

## 文件位置

- 实现：`src/components/ai-workshop-sidebar/index.tsx`
- 样式：`src/components/ai-workshop-sidebar/style.css`

## 内置菜单

组件内置以下菜单结构：

- **主页**（`home`）
- **工具**
  - 企业检测（`enterprise`）
  - 风险解析（`risk`）
  - 投标智检（`bid`）
  - 企业关联（`relation`）
  - 智能清标（`clear`）
- **服务**
  - 应用市场（`market`）
  - 帮助中心（`help`）

## Props 接口

| 属性 | 类型 | 是否必填 | 默认值 | 说明 |
|------|------|----------|--------|------|
| collapsed | `boolean` | 是 | - | 当前是否收起 |
| onCollapseChange | `(collapsed: boolean) => void` | 是 | - | 收起状态切换回调 |
| activeMenuKey | `string` | 否 | - | 当前激活的菜单 key，与内置菜单 key 对应 |
| logoImage | `string` | 是 | - | LOGO 图片地址 |
| title | `string` | 否 | `'云筑AI工坊'` | 应用名称 |
| username | `string` | 否 | `'yzw_liurundong'` | 底部显示的用户名 |
| notificationCount | `number` | 否 | `0` | 通知未读数，0 时不显示角标 |
| onMenuClick | `(key: string) => void` | 否 | - | 点击菜单项回调 |

## 结构说明

```
AI工坊侧边栏
├── LOGO 区域
│   ├── 收起：仅显示图标
│   └── 展开：图标 + 应用名称
├── 主页入口（独立区域）
├── 工具模块菜单
│   ├── 模块标题「工具」
│   └── 工具菜单项列表
├── 服务模块菜单
│   ├── 模块标题「服务」
│   └── 服务菜单项列表
└── 底部工具栏
    ├── 通知入口（带未读角标）
    ├── 展开/收起按钮
    └── 用户信息入口
```

## 使用示例

```tsx
import AiWorkshopSidebar from '@/components/ai-workshop-sidebar';
import logoImage from './assets/logo.png';

export default function MyPage() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex">
      <AiWorkshopSidebar
        collapsed={collapsed}
        onCollapseChange={setCollapsed}
        activeMenuKey="relation"
        logoImage={logoImage}
        notificationCount={10}
      />
      <main className={`flex-1 ${collapsed ? 'ml-16' : 'ml-[200px]'} transition-all duration-300`}>
        {/* 页面主体内容 */}
      </main>
    </div>
  );
}
```

## 注意事项

- 组件采用 Tailwind CSS + 自定义 CSS 实现，样式前缀为 `ai-workshop-sidebar`。
- 侧边栏宽度：展开 `200px`，收起 `64px`，与主内容区 `margin` 需外部同步控制。
- 菜单项图标统一使用 `lucide-react`。
- 通知角标仅在 `notificationCount > 0` 时显示。
- 后续需要新增/修改菜单时，直接编辑 `src/components/ai-workshop-sidebar/index.tsx` 中的 `HOME_ITEM`、`TOOL_ITEMS`、`SERVICE_ITEMS` 常量即可全局生效。
