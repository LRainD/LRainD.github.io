# 风控规则配置页

## 📋 业务与功能

### 1.1 核心目标

风控预警中心「规则管理」类页面的可复用模板。不同风控规则的配置页面结构高度一致，仅规则名称、规则说明与明细表格的业务列不同，因此将这些页面抽象为一个组件，新建规则页面时只需渲染本组件并传入差异项。

该组件覆盖整个页面：运营后台外壳（左侧菜单、顶部导航、面包屑、机构信息）+ 页面主体（顶部平台 Tab、左侧规则树、右侧规则配置面板）。

### 1.2 功能清单

- **页面外壳**：复用 `operation-admin-layout` 提供左侧菜单、面包屑与机构信息栏
- **顶部平台 Tab**：云筑集采 / 云筑商城 / 云筑劳务 / 云筑金服
- **左侧规则树**：按业务域分组展示规则，含归属标签（股/局/企）、状态标签（启/禁）、状态图标与「客」标识，支持搜索框与选中高亮
- **右侧规则配置面板**：
  - 面板 Tab：方案配置 / 配置下发 / 操作日志
  - 组织提示条：提示该规则以本组织配置为准
  - 规则名称 + 启停开关 + 一键复制
  - 规则说明
  - 规则配置项：适用组织范围、下级独立配置、预警级别、检测场景、是否去重、规则类型
  - 明细表格：内置 7 个公共列（采购品类 / 采购类型&组织形式 / 招标方式&采购方式 / 预警类型 / 预警方式 / 通知方式 / 通知对象），支持按列覆盖；规则特有列由 `extraColumns` 追加，组件再自动追加「操作」列（编辑/删除）
  - 添加一项、提交

### 1.3 交互要点

- 点击规则树节点：更新选中高亮
- 切换启停开关：纯展示态切换（未接入业务逻辑）
- 点击「一键复制」：触发 `onCopy`
- 点击表格「编辑」：触发 `onEditRow`（未传时打印日志）
- 点击表格「删除」：从当前表格数据中移除该行
- 点击「添加一项」：追加一行空数据
- 点击「提交」：触发 `onSubmit`

---

## 📊 内容规划

### 2.1 信息架构

```
风控规则配置页
├── 运营后台外壳（operation-admin-layout）
├── 顶部平台 Tab
└── 页面主体
    ├── 左侧规则树
    │   ├── 搜索框
    │   └── 规则分组
    │       └── 规则项（归属标签 / 状态标签 / 图标 / 客标识）
    └── 右侧规则配置面板
        ├── 面板 Tab
        ├── 组织提示条
        ├── 规则名称 + 开关 + 一键复制
        ├── 规则说明
        ├── 规则配置项
        ├── 明细表格
        ├── 添加一项
        └── 提交
```

### 2.2 数据来源

- **数据类型**：规则树配置 + 规则配置项 + 表格行数据
- **数据源**：组件内置默认数据（规则树、配置项默认值）+ 调用方传入
- **关键字段**：
  - `ruleName`: 规则名称
  - `ruleDescription`: 规则说明
  - `extraColumns`: 规则特有的扩展列
  - `commonColumns`: 公共列覆盖配置（按列 key 覆盖选项 / 默认值 / 隐藏 / 列宽）
  - `treeData`: 左侧规则树数据（`RiskRuleTreeGroup[]`）
  - `config`: 规则配置项默认值（`RiskRuleConfigValues`）

### 2.3 内容示例

- 规则名称：`招标-最短投标时间`
- 规则说明：`支持配置供应商最短投标/报价时间（比如2天），若经办人设置时间少于配置的天数，系统根据配置进行业务预警或拦截`

---

## 🎨 布局与结构

### 3.1 整体布局

- **布局模式**：后台外壳 + 双栏（左侧规则树 + 右侧配置面板）
- **容器宽度**：流式
- **关键尺寸**：
  - 左侧规则树：最小宽度 `280px`
  - 规则树高度：`calc(100vh - 160px)`（内部滚动，展开不撑高页面）
  - 右侧面板：自适应剩余宽度，内边距 `24px`
  - 明细表格横向滚动宽度：默认 `1200px`

### 3.2 响应式适配

- **桌面端（≥1200px）**：左右双栏完整展示
- **平板端（768-1199px）**：右侧面板收窄，表格横向滚动
- **移动端（<768px）**：内容按流式堆叠，表格横向滚动

---

## 🎨 视觉规范

### 4.1 设计规范来源

**设计规范来源**：`内置 interface-design`

**说明**：设计令牌（Design Tokens）将从上述规范中动态读取，无需在此列出具体值。

### 4.2 自定义设计要点

**自定义色彩**（如有）：

- `#fff7e6` / `#ffe58f` / `#d46b08`：组织提示条底色、描边与文字
- `#eb2f96` / `#fa8c16` / `#a0d911`：归属标签（股/局/企）文字色
- `#52c41a` / `#ff4d4f`：启/禁状态标签文字色

**其他自定义规范**（如有）：

- 配置项单选/多选组统一左间距 `12px`，仅作用于本组件容器内

### 4.3 组件状态

- **默认态（default）**：规则树默认展开全部并高亮选中项；表格展示 1 条空数据行
- **悬停态（hover）**：面板 Tab 未选中项悬停变蓝
- **选中态（selected）**：规则树选中项高亮；当前平台 Tab 与面板 Tab 高亮
- **加载态（loading）**：未定义

---

## ⚙️ Axure API 说明

### 5.4 配置项列表（Props）

| 配置项名称 | 类型 | 默认值 | 说明 |
|----------|------|-------|------|
| `ruleName` | `string` | `规则名称` | 【主要修改项】规则名称 |
| `ruleDescription` | `string` | `规则说明` | 【主要修改项】规则说明 |
| `extraColumns` | `ColumnsType<any>` | `[]` | 【主要修改项】规则特有的扩展列，追加在公共列之后 |
| `commonColumns` | `RiskRuleCommonColumnsConfig` | - | 公共列覆盖配置（按列 key 覆盖 `options` / `defaultValue` / `hidden` / `width`） |
| `defaultRuleEnabled` | `boolean` | `false` | 规则开关默认状态 |
| `config` | `RiskRuleConfigValues` | 见下 | 规则配置项默认值 |
| `tableScrollX` | `number` | `1200` | 表格横向滚动宽度 |
| `treeData` | `RiskRuleTreeGroup[]` | `DEFAULT_RULE_TREE` | 左侧规则树数据 |
| `defaultSelectedRuleKey` | `string` | 树中首个规则 key | 默认选中的规则 key |
| `onCopy` | `() => void` | - | 点击「一键复制」回调 |
| `onSubmit` | `() => void` | - | 点击「提交」回调 |
| `onEditRow` | `(record) => void` | - | 表格行「编辑」回调 |
| `activeMenuKey` | `string` | `risk_warning_center/rule_mgmt` | 左侧菜单选中项 |
| `defaultOpenKeys` | `string[]` | `['risk_warning_center']` | 左侧菜单默认展开项 |
| `breadcrumbItems` | `BreadcrumbItem[]` | 风控预警中心 / 规则管理 | 面包屑数据 |
| `platform` | `string` | `测试组织-股份公司` | 机构名称（同时用于提示文案） |
| `orgCode` | `string` | `00010104` | 机构编码 |
| `parentOrg` | `string` | `平台` | 上级组织 |

**`config` 默认值**：

```typescript
{
  orgScope: 'subordinate',      // 本级 / 本下级
  subOrgConfig: 'allow',        // 允许 / 不允许
  warningLevel: 'medium',       // 高风险 / 中高风险 / 中风险 / 低风险
  detectScenes: ['warning'],    // 合规自查 / 风控预警
  dedupe: 'no',                 // 去重 / 不去重
  ruleType: '管理要求'
}
```

**公共列默认值**（内置 7 列，可用 `commonColumns` 按列 key 覆盖）：

| 列 key | 列标题 | 控件 | 默认选项 | 默认选中 |
|--------|--------|------|----------|----------|
| `category` | *采购品类 | 多选 | 物资 / 劳务分包 / 专业分包 / 专业服务 / 租赁 / 设备 | 物资、专业分包 |
| `type` | *采购类型&组织形式 | 多选 | 招标采购 / 区域联采 / 战略采购 / 集中采购 / 分散采购 / 电子商城采购 | 前 5 项 |
| `method` | *招标方式&采购方式 | 多选 | 公开招标 / 直接采购 / 谈判采购 / 竞价采购 / 询比采购 / 邀请招标 / 询价采购 / 竞争性谈判 / 单一来源 / 紧急采购 | 全部 |
| `warningType` | *预警类型 | 单选 | 预警 / 拦截 / 可忽略 | 预警 |
| `warningMethod` | 预警方式 | 单选 | 常显+对话框 / 提示框 / 拦截 | 常显+对话框 |
| `notifyMethod` | 通知方式 | 单选 | 短信 / 邮件 / 站内信 / 提示框 | 短信 |
| `notifyTarget` | 通知对象 | 单选 | 资审经办 / 采购经理 / 项目经理 / 风控专员 | 资审经办 |

### 5.5 数据项列表

**数据结构**：

```typescript
interface RiskRuleTreeGroup {
  title: string;              // 分组名称
  key: string;                // 分组唯一标识
  children: RiskRuleTreeRule[];
}

interface RiskRuleTreeRule {
  title: string;              // 规则名称
  key: string;                // 规则唯一标识
  type?: string;              // 归属标签：股 / 局 / 企
  status?: string;            // 状态标签：启 / 禁
  isGuest?: boolean;          // 是否展示「客」标识
  iconType?: 'red' | 'green' | 'orange' | 'pink'; // 前置图标
}

// 公共列覆盖配置：按列 key 覆盖，不传的字段沿用组件默认值
type RiskRuleCommonColumnKey =
  | 'category' | 'type' | 'method'
  | 'warningType' | 'warningMethod' | 'notifyMethod' | 'notifyTarget';

interface RiskRuleCommonColumnConfig {
  title?: React.ReactNode;                            // 列标题
  options?: { label: string; value: string }[];       // 下拉选项集合
  defaultValue?: string | string[];                   // 默认选中值（多选为数组，单选为字符串）
  hidden?: boolean;                                   // 是否隐藏该列
  width?: number;                                     // 列宽
}

type RiskRuleCommonColumnsConfig = Partial<Record<RiskRuleCommonColumnKey, RiskRuleCommonColumnConfig>>;
```

---

## 🚀 使用示例

```tsx
import RiskRuleConfigPage from '@/components/risk-rule-config-page';
import type { ColumnsType } from 'antd/es/table';

// 只需写本规则特有的扩展列，7 个公共列已内置
const extraColumns: ColumnsType<any> = [
  // ...该规则自己多出来的列
];

<RiskRuleConfigPage
  ruleName="招标-最短投标时间"
  ruleDescription="支持配置供应商最短投标/报价时间（比如2天）……"
  extraColumns={extraColumns}
  // 如需调整公共列（换选项 / 改默认值 / 隐藏某列）：
  // commonColumns={{ notifyTarget: { hidden: true } }}
  defaultSelectedRuleKey="bid_time_limit"
/>
```
