# 分供商在合同签订前已注销（规则页迭代）

> 本文档仅记录**本次迭代**的新增内容，供研发评审使用。页面整体结构、左侧规则树、公共配置项、明细表格的公共列等通用能力均由组件 [risk-rule-config-page](file:///Users/liurundong/Desktop/云端演示项目/LRainD.github.io/axureMake/src/components/risk-rule-config-page/index.tsx) 提供，不在本文展开。

## 一、迭代目标

在风控预警中心「规则管理」下新增一条规则页：**校验分供商在合同签订前是否已注销**，已注销时触发预警/拦截。

## 二、规则信息

| 项 | 值 |
|----|----|
| 规则名称 | 分供商在合同签订前已注销 |
| 规则说明 | 校验分供商在合同签订前是否已注销，已注销将会预警/拦截 |
| 默认开关 | 开 |
| 挂载位置 | 规则树「合同」分组，默认选中本规则 |
| 规则 key | `supplier_cancelled_before_contract_check` |

## 三、专有配置列（本次迭代重点）

在明细表格公共列之后追加 1 个必填列：

### 1. 是否校验

- 控件：`Switch` 开关
- 交互：开 / 关（`checkedChildren="开"`、`unCheckedChildren="关"`）
- 默认值：开
- 业务含义：控制该明细项是否执行「合同签订前分供商已注销」校验

## 四、规则配置项取值

本次迭代沿用组件公共配置项，取值如下（供评审确认）：

| 配置项 | 取值 |
|--------|------|
| 适用组织范围 | 本下级 |
| 下级独立配置 | 不允许 |
| 预警级别 | 中风险 |
| 是否去重 | 不去重 |
| 规则类型 | 合规风险 |

## 五、接入方式

整页复用 `RiskRuleConfigPage`，本次仅传入以下规则差异项：

| Prop | 值 |
|------|----|
| `ruleName` | 分供商在合同签订前已注销 |
| `ruleDescription` | 校验分供商在合同签订前是否已注销，已注销将会预警/拦截 |
| `defaultRuleEnabled` | `true` |
| `config` | 见上表 |
| `extraColumns` | 是否校验（开关） 1 列 |
| `treeData` | 组件默认规则树 + 「合同」分组追加本规则 |
| `defaultSelectedRuleKey` | `supplier_cancelled_before_contract_check` |
| `tableScrollX` | `1450` |

## 六、待确认 / 备注

1. 明细表格初始固定 1 行待填写数据；操作列由组件固定为「编辑 + 删除」。
2. 新增列 key：`enableCheck`，数据项类型为 `boolean`。
3. 「合同签订前」的判定时点（以合同签订日期或签约里程碑为准）如需细化，可后续在规则说明中补充。
