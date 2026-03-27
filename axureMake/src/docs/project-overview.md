# 集采运营后台原型项目

> 用途：作为项目文档总入口，帮助人和 Agent 快速理解项目，并按需加载后续子文档。
> 说明：本文件保持简洁，不展开详细业务流程、信息架构、数据模型或页面规格。

## 1. 项目简介

- 项目名称：集采运营后台原型
- 项目定位：为中建集团集采业务提供运营管理的后台系统原型，包含风控规则配置、供应商管理、采购执行等核心模块
- 目标用户：集采平台运营人员、风控管理员、采购经理
- 当前阶段：原型开发阶段

## 2. 核心场景

- **风控规则配置**：管理采购业务中的风险监控规则，包括投标人数量、投标时间、供应商关联等规则的配置与下发
- **供应商管理**：供应商准入审核、资质管理、风险监控
- **采购执行管理**：采购计划、招标流程、合同管理

## 3. 阅读顺序

1. 先阅读本文件，确认项目范围与索引
2. 再按需阅读专题子文档
3. 最后进入页面级 `spec.md`、需求文档、主题文档与数据表

## 4. 文档索引

| 文档 | 用途 | 是否必读 |
|------|------|---------|
| `src/docs/page-map.md` | 页面地图与入口导航 | 按需 |
| `src/docs/information-architecture.md` | 信息架构与模块边界 | 按需 |
| `src/docs/business-flow.md` | 业务流程与关键路径 | 按需 |
| `src/docs/data-model.md` | 核心数据对象与字段摘要 | 按需 |
| `src/docs/permission-model.md` | 权限边界与角色能力 | 按需 |

## 5. 主题索引

- 默认主题：`antd-new`
- 主题文档：`/src/themes/antd-new/DESIGN-SPEC.md`
- 主题目录：`/src/themes/antd-new/`
- 设计系统：Ant Design v5/v6 企业级设计系统

## 6. 数据索引

- 关键数据表：`orders.json`
- 数据目录：`src/database/`
- 说明：当前主要为示例数据，后续可扩展为真实数据表

## 7. 原型索引

### 7.1 已完成的原型页面

| 页面名称 | 路径 | 说明 |
|---------|------|------|
| 规则配置页面 | `/prototypes/rule-config/` | 风控规则配置管理，支持多业务线规则配置 |
| Ant Design 参考 | `/prototypes/ref-antd/` | Ant Design 组件参考示例 |
| App 首页参考 | `/prototypes/ref-app-home/` | 移动端首页参考示例 |

### 7.2 页面级规格文档

- 规则配置页面：`/src/prototypes/rule-config/spec.md`
- Ant Design 参考：`/src/prototypes/ref-antd/spec.md`
- App 首页参考：`/src/prototypes/ref-app-home/spec.md`

### 7.3 需求文档

- App 首页需求：`/src/prototypes/ref-app-home/prd.md`

## 8. 组件索引

| 组件名称 | 路径 | 说明 |
|---------|------|------|
| 侧边菜单 | `/components/side-menu/` | 可折叠的侧边导航菜单 |
| 参考按钮 | `/components/ref-button/` | 按钮组件参考示例 |
| 参考折线图 | `/components/ref-line-chart/` | 折线图组件参考示例 |

## 9. 设计规范沉淀

### 9.1 集采运营后台设计模式

基于规则配置页面沉淀的设计模式：

**布局模式**：
- 左侧边栏导航（200px）+ 右侧主内容区（自适应）
- 顶部面包屑 + 机构信息栏
- 业务线 Tab 切换
- 主内容区左右分栏（规则树 300px + 配置表单自适应）

**配色方案**：
- 主色调：#1677ff（Ant Design 品牌蓝）
- 预警级别色：
  - 高风险：#ff4d4f（红）
  - 中高风险：#fa8c16（橙）
  - 中风险：#faad14（黄）
  - 低风险：#52c41a（绿）

**表单模式**：
- 标签左对齐，宽度 120px
- 单选/复选横向排列
- 分组使用分割线区分

### 9.2 风控规则配置模式

**规则数据结构**：
- 规则分类（树形结构）
- 规则详情（表单配置）
- 适用范围（本级/本下级）
- 预警级别（四级风险）
- 业务维度（品类/类型/方式）

## 10. 当前待补事项

- [ ] 补充页面地图（page-map.md）
- [ ] 补充信息架构文档（information-architecture.md）
- [ ] 沉淀风控规则数据表到 database
- [ ] 完善供应商管理页面原型
- [ ] 完善采购执行页面原型

# 项目说明入口

本文档为项目的总览入口，记录项目背景、页面索引与核心待办。

## 📝 项目简介

本项目主要用于快速产出符合 Axure 导出规范的原型页面，集成数字合规、采购流程等业务场景。

## 🚀 页面索引

| 页面名称 | 路径 | 状态 | 备注 |
| :--- | :--- | :--- | :--- |
| 编制采购清单 | `src/prototypes/procurement-list/index.tsx` | ✅ 已修复 | 已按 Axure 导出规范重构 |

## 🏗️ 开发规范总结 (Axure 导出)

根据用户要求与 `/skills/axure-export-workflow/SKILL.md`，后续创建页面需遵守：

1.  **文件头注释**：必须包含 `@name`、`@mode axure` 及相关参考资料。
2.  **导出规范**：必须使用 `const Component = ...` 定义并 `export default Component`。
3.  **参考 Skill**：包含 `/skills/axure-export-workflow/SKILL.md`。

## 📅 待补事项

- [ ] 完善更多采购场景原型
- [ ] 同步更新 `page-map.md`
