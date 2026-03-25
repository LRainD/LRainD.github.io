# 规则配置页面

## 📋 业务与功能

### 1.1 核心目标

集采运营后台的规则配置页面，用于管理和配置采购业务中的风险监控规则。运营人员可以通过该页面：
- 浏览和选择不同的业务线（云筑集采、云筑商城、云筑劳务、云筑金服）
- 查看和管理各类风险规则（如投标人数量不满足要求、投标时间过短等）
- 配置规则的详细参数（适用组织范围、预警级别、规则类型等）
- 设置规则的触发条件和预警方式

### 1.2 功能清单

- **业务线切换**：通过顶部 Tab 切换不同的业务线（云筑集采/云筑商城/云筑劳务/云筑金服）
- **规则树浏览**：左侧展示规则分类树，支持展开/收起和勾选
- **规则详情配置**：右侧展示选中规则的详细配置表单
- **方案配置**：设置适用组织范围（本级/本下级）、下级独立配置权限
- **预警设置**：配置预警级别（高风险/中高风险/中风险/低风险）、是否去重
- **规则类型配置**：配置采购品类、采购类型、采购方式、预警类型等
- **操作功能**：保存、删除、添加规则等操作

### 1.3 交互要点

- **Tab 切换**：点击顶部 Tab 切换业务线，右侧内容随之变化
- **规则树选择**：点击左侧规则树节点，右侧显示对应配置表单
- **勾选规则**：勾选规则树中的复选框启用/禁用规则
- **表单提交**：填写完配置后点击提交按钮保存

---

## 📊 内容规划

### 2.1 信息架构

```
规则配置页面
├── 顶部导航区
│   ├── 面包屑导航（首页 / 规则管理 / 规则配置）
│   └── 机构信息（机构名称、机构代码、上级机构）
├── 业务线 Tab 区
│   ├── 云筑集采（当前选中）
│   ├── 云筑商城
│   ├── 云筑劳务
│   └── 云筑金服
├── 主内容区（左右分栏）
│   ├── 左侧：规则树
│   │   ├── 投标人相关规则
│   │   ├── 投标时间相关规则
│   │   ├── 供应商相关规则
│   │   ├── 投标数量相关规则
│   │   └── 其他风险规则
│   └── 右侧：规则配置表单
│       ├── 方案配置 Tab
│       │   ├── 适用组织范围
│       │   ├── 下级独立配置
│       │   ├── 预警级别
│       │   ├── 是否去重
│       │   └── 规则类型
│       ├── 配置下发 Tab
│       └── 操作日志 Tab
└── 底部操作区
    └── 提交按钮
```

### 2.2 数据来源

- **数据类型**：配置型数据
- **数据源**：生成示例数据
- **关键字段**：
  - `ruleId`: 规则唯一标识
  - `ruleName`: 规则名称
  - `ruleCategory`: 规则分类
  - `enabled`: 是否启用
  - `warningLevel`: 预警级别（high/medium-high/medium/low）
  - `applicableScope`: 适用范围（current/subordinate）
  - `allowSubConfig`: 允许下级独立配置
  - `purchaseCategory`: 采购品类
  - `purchaseType`: 采购类型
  - `purchaseMethod`: 采购方式
  - `warningType`: 预警类型
  - `notificationMethod`: 通知方式
  - `maxAdjustCount`: 最大调价次数
  - `minAdjustCount`: 最小调价次数

### 2.3 内容示例

**规则分类示例**：
- 投标人相关：投标人数量不满足要求
- 投标时间：投标时间过短、投标时间过长
- 供应商相关：供应商疑似串标、供应商工商关联、最少有效供应商数
- 投标数量：最少有效投标数、投标数量异常
- 其他：疑似围标、黑名单预警等

**采购品类示例**：
- 物资
- 劳务分包
- 专业分包
- 专业服务
- 租赁
- 设备

**采购方式示例**：
- 公开招标
- 邀请招标
- 询价采购
- 竞争性谈判
- 单一来源
- 紧急采购

---

## 🎨 布局与结构

### 3.1 整体布局

- **布局模式**：双栏布局（左侧固定宽度，右侧自适应）
- **容器宽度**：流式布局，最大宽度 1920px
- **关键尺寸**：
  - 左侧规则树：宽度 280px
  - 右侧配置区：自适应剩余宽度
  - 顶部 Tab 区：高度 48px
  - 内容间距：16px

### 3.2 响应式适配

- **桌面端（≥1200px）**：左右双栏布局，左侧固定 280px
- **平板端（768-1199px）**：左侧收缩为图标模式，hover 展开
- **移动端（<768px）**：左侧变为抽屉式，点击展开

---

## 🎨 视觉规范

### 4.1 设计规范来源

**设计规范来源**：主题 `/src/themes/antd-new`

**说明**：使用 Ant Design 企业级设计系统，适合中后台管理系统场景。

### 4.2 自定义设计要点

**自定义色彩**：
- 预警级别颜色：
  - 高风险：#ff4d4f（红色）
  - 中高风险：#fa8c16（橙色）
  - 中风险：#faad14（黄色）
  - 低风险：#52c41a（绿色）

**自定义尺寸**：
- 左侧规则树宽度：280px
- 规则树节点高度：40px
- 表单标签宽度：120px
- 卡片内边距：24px

### 4.3 组件状态

- **默认态**：正常显示，边框为 #d9d9d9
- **悬停态**：背景色变化为 #f5f5f5
- **选中态**：边框高亮为 #1677ff，背景色为 #e6f4ff
- **禁用态**：透明度降低，文字置灰
- **加载态**：显示 Skeleton 骨架屏

---

## ⚙️ Axure API 说明

### 5.1 事件列表（eventList）

| 事件名称 | Payload 类型 | 触发时机 | 说明 |
|---------|-------------|---------|------|
| `tab_change` | `{ activeTab: string }` | 切换业务线 Tab 时 | 返回当前选中的业务线标识 |
| `rule_select` | `{ ruleId: string, ruleName: string }` | 选择规则时 | 返回选中的规则信息 |
| `rule_toggle` | `{ ruleId: string, enabled: boolean }` | 启用/禁用规则时 | 返回规则启用状态变化 |
| `config_save` | `{ ruleId: string, config: object }` | 保存配置时 | 返回保存的配置数据 |

### 5.2 动作列表（actionList）

| 动作名称 | Params 类型 | 参数说明 | 功能描述 |
|---------|------------|---------|---------|
| `switch_tab` | `{ tab: string }` | tab: 业务线标识 | 切换到指定业务线 |
| `select_rule` | `{ ruleId: string }` | ruleId: 规则ID | 选中指定规则 |
| `save_config` | `{ ruleId: string, config: object }` | 规则ID和配置对象 | 保存规则配置 |
| `reset_config` | `{ ruleId: string }` | ruleId: 规则ID | 重置规则配置 |

### 5.3 变量列表（varList）

| 变量名称 | 类型 | 默认值 | 说明 |
|---------|-----|-------|------|
| `active_tab` | `string` | `cloud_procurement` | 当前选中的业务线 |
| `selected_rule_id` | `string` | `null` | 当前选中的规则ID |
| `rule_tree_data` | `array` | `[]` | 规则树数据 |
| `rule_config` | `object` | `{}` | 当前规则配置 |
| `loading` | `boolean` | `false` | 加载状态 |

### 5.4 配置项列表（configList）

| 配置项名称 | 类型 | 默认值 | 说明 |
|----------|-----|-------|------|
| `organization_name` | `string` | `中国建筑股份有限公司` | 机构名称 |
| `organization_code` | `string` | `00010100` | 机构代码 |
| `parent_organization` | `string` | `平台运营` | 上级机构 |
| `default_warning_level` | `string` | `medium` | 默认预警级别 |

### 5.5 数据项列表（dataList）

**规则数据结构**：
```typescript
{
  ruleId: string;           // 规则唯一标识
  ruleName: string;         // 规则名称
  ruleCategory: string;     // 规则分类
  enabled: boolean;         // 是否启用
  warningLevel: 'high' | 'medium-high' | 'medium' | 'low';  // 预警级别
  applicableScope: 'current' | 'subordinate';  // 适用范围
  allowSubConfig: boolean;  // 允许下级独立配置
  purchaseCategory: string[];  // 采购品类
  purchaseType: string[];   // 采购类型
  purchaseMethod: string[]; // 采购方式
  warningType: string;      // 预警类型
  notificationMethod: string;  // 通知方式
  maxAdjustCount: number;   // 最大调价次数
  minAdjustCount: number;   // 最小调价次数
}
```
