# Centralized Procurement Layout (集采工作台通用布局)

集采工作台通用布局组件，包含顶部导航栏、左侧菜单侧边栏（可折叠、可展开菜单组）以及主内容展示区。

## 🎨 视觉与交互规范

- **顶部导航**: 高度为 56px，背景白色，自带云筑集采工作台 Logo、组织选择器、模糊搜索输入框、中英文语言切换、各子系统切换标签、帮助及通知中心、当前登录用户信息等模块。
- **左侧侧边栏**: 宽度为 200px，折叠后宽度为 64px。背景采用集采工作台的标准深蓝色（`#3a7fc3`）。支持单个直接跳转菜单及展开折叠的菜单组。折叠时会隐藏菜单组及子菜单，直接跳转菜单仅显示缩略文字和图标。
- **主内容区**: 右侧主体内容区，底色为 `#f5f7fa`，自适应宽度，带有 y 轴滚动条以呈现海量业务表单与列表。

## ⚙️ 属性 (Props)

| 属性名 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `username` | `string` | `'jctest1'` | 当前登录用户名 |
| `activeMenuKey` | `string` | `'compliance-settings'` | 当前选中的菜单项 key 值 |
| `sidebarItems` | `MenuItem[]` | `DEFAULT_SIDEBAR_ITEMS` | 自定义左侧侧边栏菜单列表配置 |
| `onMenuClick` | `(key: string) => void` | - | 单级菜单项点击时的事件回调 |
| `onSubMenuClick` | `(key: string, parentKey: string) => void` | - | 菜单组子项点击时的事件回调 |
| `children` | `React.ReactNode` | - | 主体区展示的内容组件 |

## 📦 菜单配置定义 (MenuItem)

```typescript
export interface MenuItem {
  key: string;
  label: string;
  collapsedLabel?: string; // 收起时展示的缩减字样
  icon: React.ReactNode;   // lucide 图标或 react 图标
  active?: boolean;
  children?: {             // 子菜单项列表
    key: string;
    label: string;
    active?: boolean;
  }[];
}
```
