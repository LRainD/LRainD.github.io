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
