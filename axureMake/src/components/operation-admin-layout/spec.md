# OperationAdminLayout 组件规格

## 组件名称

运营后台统一布局（OperationAdminLayout）

## 组件用途

为「集采运营后台」系列页面提供通用外壳，包含左侧菜单栏、顶部导航栏、面包屑、机构信息栏。后续新建运营后台页面时直接包裹此组件即可复用整体布局。

## 文件位置

- 实现：`src/components/operation-admin-layout/index.tsx`
- 样式：`src/components/operation-admin-layout/style.css`

## Props 接口

| 属性 | 类型 | 是否必填 | 默认值 | 说明 |
|------|------|----------|--------|------|
| activeMenuKey | `string` | 是 | - | 当前选中的左侧菜单 key |
| defaultOpenKeys | `string[]` | 否 | `['solution']` | 默认展开的左侧菜单组 key |
| breadcrumbItems | `{ label: string; active?: boolean }[]` | 否 | `[]` | 面包屑路径项，最后一项可标记 active |
| platform | `string` | 否 | `'平台abc'` | 顶部机构选择值 |
| orgCode | `string` | 否 | `'0001'` | 机构编码 |
| parentOrg | `string` | 否 | `'-'` | 上级组织 |
| onPlatformChange | `(value: string) => void` | 否 | - | 机构切换回调 |
| children | `React.ReactNode` | 否 | - | 页面主体内容 |

## 内置菜单

组件内置运营后台左侧菜单 `DEFAULT_MENU_ITEMS`，包含以下一级/二级菜单：

- 分供商管理
- 模板管理
- 采购计划管理
- 招标采购
- 配置管理
- 身份管理
- 解决方案（参数层级配置 / 产品解决方案配置 / 运营解决方案配置）
- 合同管理
- 履约管理
- 收验货
- 营销管理
- 运营工具
- 风控预警中心（字段配置 / 规则配置 / 场景管理 / 预警配置 / 运营管理 / 规则管理 / 通知中心 / 日志中心）

## 使用示例

```tsx
import OperationAdminLayout from '@/components/operation-admin-layout';

export default function MyPage() {
  return (
    <OperationAdminLayout
      activeMenuKey="operation_solution_config"
      defaultOpenKeys={['solution']}
      breadcrumbItems={[
        { label: '解决方案' },
        { label: '运营解决方案配置', active: true }
      ]}
      platform="平台abc"
      orgCode="0001"
      parentOrg="-"
    >
      {/* 页面主体内容 */}
    </OperationAdminLayout>
  );
}
```

## 注意事项

- 组件采用 Ant Design `Layout + Sider + Menu + Select` 实现。
- 左侧菜单默认展开「解决方案」分组，选中项由 `activeMenuKey` 控制。
- 顶部导航栏固定显示「下载中心」「奥巴马 [退出]」，与当前截图保持一致。
- 样式使用 `operation-admin-*` 前缀命名，避免与其他页面样式冲突。
