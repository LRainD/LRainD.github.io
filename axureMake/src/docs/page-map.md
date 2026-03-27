# 页面地图

> 用途：建立集采运营后台的页面导航关系，帮助快速定位页面资产。

## 1. 页面结构

```text
集采运营后台
├── 仪表盘
│   └── 数据概览 /prototypes/dashboard/
├── 集采管理
│   ├── 采购计划管理 /prototypes/procurement-plan/
│   └── 采购执行 /prototypes/procurement-execute/
├── 供应商管理
│   ├── 供应商列表 /prototypes/supplier-list/
│   └── 供应商审核 /prototypes/supplier-audit/
├── 风控中心
│   ├── 风控概览 /prototypes/risk-overview/
│   └── 规则管理
│       └── 规则配置 /prototypes/rule-config/ ✅
├── 系统设置
│   ├── 机构管理 /prototypes/org-manage/
│   └── 用户管理 /prototypes/user-manage/
└── 参考示例
    ├── Ant Design 组件 /prototypes/ref-antd/
    └── App 首页 /prototypes/ref-app-home/
```

## 2. 页面清单

| 页面/模块 | 路径或入口 | 用途 | 关联规格 |
|----------|-----------|------|---------|
| 规则配置 | `/prototypes/rule-config/` | 风控规则配置管理，支持多业务线规则配置 | `rule-config/spec.md` |
| Ant Design 参考 | `/prototypes/ref-antd/` | Ant Design 组件参考示例 | `ref-antd/spec.md` |
| App 首页参考 | `/prototypes/ref-app-home/` | 移动端首页参考示例 | `ref-app-home/spec.md` |

## 3. 页面访问地址

| 页面 | 本地地址 |
|------|---------|
| 规则配置 | http://localhost:51722/prototypes/rule-config/index.html |
| Ant Design 参考 | http://localhost:51722/prototypes/ref-antd/index.html |
| App 首页参考 | http://localhost:51722/prototypes/ref-app-home/index.html |

## 4. 待开发页面

- [ ] 仪表盘数据概览
- [ ] 采购计划管理
- [ ] 采购执行
- [ ] 供应商列表
- [ ] 供应商审核
- [ ] 风控概览
- [ ] 机构管理
- [ ] 用户管理
