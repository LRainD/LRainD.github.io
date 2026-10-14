# 项目长期备忘（axureMake 原型项目）

## 环境事实
- 依赖版本：antd 6.5.3 / React / lucide-react。**antd v6 Drawer 用 `size`，`width` 已废弃**；`destroyOnClose` → `destroyOnHidden`，`maskClosable` → `mask.closable`。
- 本机 macOS 12.5.1，**agent-browser 自带 Chromium 155 无法运行**（`Symbol not found: _objc_claimAutoreleasedReturnValue`）。
  - 截图方案：系统 Chrome `--headless=new --no-sandbox --disable-gpu --window-size=W,H --virtual-time-budget=8000 --screenshot=out.png <url>`
  - 交互方案：系统 Chrome `--remote-debugging-port=9222 --no-sandbox --disable-gpu`（**`--no-sandbox` 必需**），Node 内置 WebSocket 直连 CDP。截图必须用 `Page.captureScreenshot` + `clip`，**禁用 `Emulation.setDeviceMetricsOverride`**（会全白）。
  - macOS 无 `timeout` 命令。

## 验收现状（重要）
- `scripts/check-app-ready.mjs` 在 `typecheck` 阶段即中止：全项目 **116 个既有类型错误**（非新页面引入），集中在 `src/common/VariantSwitcher.tsx`、`src/common/ThemeShell/types.ts`、`src/themes/antd-new/templates|components|foundations`、若干旧 prototypes。
- 主因：antd v6 / lucide-react 升级后的历史迁移未完成（TS2604 共 57 处、TS2724/TS2614 各 16 处）。
- **结论：当前任何页面都拿不到 READY 判定**。新增页面的验证需绕过 typecheck（用 `npx tsc --noEmit | grep <你的目录>` 自证 0 错误 + 真实浏览器渲染验证）。

## 项目约定
- 新页面放 `src/prototypes/<kebab-name>/`，入口 `index.tsx`；`entries.json` 由 `scripts/scan-entries.js` 自动登记。
- `.axhub/make/sidebar-tree.json` 是**用户手工维护**的侧边栏树（含文件夹分组），不会被自动扫描覆盖；新页面需手动登记才出现在侧边栏。
- 默认主题 `antd-new`；设计规范见 `rules/design-guide.md`、`rules/theme-guide.md`；规格文档模板 `src/docs/templates/spec-template.md`。
- 规格文档统一命名 `spec.md` 放在页面目录内。
- `temp/` 已在 `.gitignore` 中，可作临时脚手架目录。
