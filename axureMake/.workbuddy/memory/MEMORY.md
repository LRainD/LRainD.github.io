# 项目长期备忘（axureMake 原型项目）

## 环境与工具链
- 依赖：antd **6.5.3** / React / lucide-react。antd v6 废弃点（本项目常踩）：Drawer `width`→`size`、`destroyOnClose`→`destroyOnHidden`、`maskClosable`→`mask.closable`、`Alert message`→`title`、`InputNumber addonAfter`→`suffix`、`Space direction`→`orientation`、`Table rowKey` 不再传 index。
- antd v6 无可用 `Result` 组件类型（TS2604），空态/完成态自写 `div`。
- `Button type="primary" ghost` 会渲染成蓝底蓝字（看不见）：要实心用 `type="primary"`，要蓝边蓝字用 `ghost` + 默认类型。
- **sticky 吸底要抵掉 `.main-content` 的 `padding: 16px 24px`**：`bottom: -16px` + `margin-bottom: -16px`（横向出血 `margin: 0 -24px`）。只写 `bottom:0` 留灰边，只写 `bottom:-16px` 滚到底缩回。
- 解析依赖：`xlsx` 0.18.5、`pdfjs-dist` 3.11.174、`papaparse`。pdf.worker 必须 `?raw` 内联 + Blob 赋 `GlobalWorkerOptions.workerSrc`（**禁 `?url`**）。
- **导出走 `npx vite build` + `ENTRY_KEY` 单入口 iife**：iife 不支持代码分割 → **页面内严禁 `import()` 动态导入**（dev 正常，导出必报 `Failed to fetch code: Internal Server Error`）；**禁依赖 `?url` 外部 asset**（`/build/` 只返回主 JS，运行时会 404）。单入口构建实测 150~177s，`BUILD_TIMEOUT_MS` 已放宽 300s，勿调回 120s。
- **大模型网关 `https://tianqu.yzw.cn/v1`**（OpenAI 兼容，模型 `deepseek-flash`=deepseek-v4.1-flash）无浏览器 CORS（OPTIONS 404）。走 `vite-plugins/llmProxyPlugin.ts` 的 dev-only `/llm-proxy/chat/completions`（按 `x-llm-base` 头转发、SSE 透传、自带 CORS+OPTIONS），需在 `vite.config.ts` serve 插件注册。**推理模型，max_tokens 必须 ≥8000**，否则正文空。
- 导出件 AI 能力依赖本机 dev server：`ai/llm.ts` 先探 `/llm-proxy/health`（同源 `localhost|127.0.0.1:51720~51724`）再请求。https 宿主页会拦 http 代理，异地/离线需把代理部到公网。
- **扫描件 PDF 不要指望浏览器端 OCR**：实测 tesseract.js chi_sim 读不出表格正文。策略：检测无文字层→提示走「文本录入」兜底；真要支持需服务端 OCR/VLM（网关无 VLM）。

## 本机调试（macOS 12.5.1 + Chrome）
- agent-browser 自带 Chromium 155 无法运行（`Symbol not found: _objc_claimAutoreleasedReturnValue`）。截图用系统 Chrome `--headless=new --no-sandbox --disable-gpu --window-size=W,H --virtual-time-budget=8000 --screenshot`。
- 交互用系统 Chrome `--remote-debugging-port=9222 --no-sandbox --disable-gpu`（**`--no-sandbox` 必需**）+ Node 内置 WebSocket 直连 CDP。截图必须 `Page.captureScreenshot`+`clip`，**禁 `Emulation.setDeviceMetricsOverride`**（全白）。进程要 `run_in_background` 启动。
- **CDP 必须 `curl --noproxy '*'`**（环境有 `HTTP_PROXY`）；9222 常被僵尸 Chrome 占用，先 lsof 找 PID kill 再换 user-data-dir。macOS 无 `timeout` 命令。

## 验收现状
- `scripts/check-app-ready.mjs` 在 typecheck 阶段即中止：全项目 **116 个既有类型错误**（非新页面引入），集中在 `src/common/VariantSwitcher.tsx`、`src/common/ThemeShell/types.ts`、`src/themes/antd-new/*`、旧 prototypes。主因是 antd v6 / lucide-react 升级后迁移未完成（TS2604 ×57、TS2724/TS2614 ×16）。**任何页面都拿不到 READY 判定**。
- 新页面自证：`npx tsc --noEmit | grep <目录>` 为 0 错误 + 真实浏览器渲染验证。
- E2E 套路：`npm run dev`（51720）→ CDP → 默认落在「数据接入清洗」，**需先点侧边栏切页** → 文件上传用 `DOM.setFileInputFiles` 指向 `.ant-upload input[type=file]`；可用 `Page.printToPDF` 造中文 PDF 样例。

## 项目约定
- 新页面 `src/prototypes/<kebab-name>/index.tsx`；`entries.json` 由 `scripts/scan-entries.js` 自动登记。规格文档统一 `spec.md` 放页面目录内。
- `.axhub/make/sidebar-tree.json` 是**用户手工维护**的侧边栏树，不会自动覆盖；新页面要手动登记。
- 默认主题 `antd-new`；规范见 `rules/design-guide.md`、`rules/theme-guide.md`；模板 `src/docs/templates/spec-template.md`。
- `temp/` 已在 `.gitignore`，可作临时脚手架（`temp/*.mjs` 会被 grep 判 binary，搜中文加 `-a`）。
- 页面可不出现在侧边栏：`pageItems` 支持 `hidden?: boolean`，`index.tsx` 用 `filter(p => !p.hidden)`；`standards-edit`、`review-detail`、`mapping-detail` 都标 hidden。
- **术语口径**：标准物料库侧叫「规格型号」，治理工作台/导入拆解侧叫「属性原子」，不要互相改。
- 表格 1440 宽下可视区仅约 877px，9 列必横滚：重要列往前排，操作列 `fixed:'right'` 且必须补 `.ant-table-cell-fix-right` 底色（`#fff`、表头 `#f7f9fb`、`inset -8px` 阴影）。

## 状态持久化铁律
- 跨刷新状态统一 `localStorage`，参考 `ai-material-price-governance/storage.ts`：单快照 + `version` 校验 + try/catch 静默降级 + 「重置演示数据」出口。
- **凡有「跳出去再回来」动线的页面（采购清单/智能询价/清单映射），组件内 `useState` 编辑态必须落独立草稿 key**：`setPage` 会整页卸载，回来数据归零、演示断链（2026-10-25 踩过：引用 12 行→去价格分析→返回变回 4 条种子）。
  - 不要塞主快照（附件解析结果体积大）。挂载用 `useState(loadDraft)` **lazy init，禁 `useRef(loadDraft())`**（每次渲染都求值）。变更 300ms 防抖 + **卸载时同步 flush**，最新值挂 ref。空数组是用户主动删空，不要回填种子。

## antd v6 E2E / UI 细节
- 两字中文按钮 antd 插空格（`恢复`→`恢 复`），innerText 匹配要 `replace(/\s/g,'')`；Table 有 fixed/scroll 会渲染 `.ant-table-measure-row`，数行用 `tr:not(.ant-table-measure-row)`；点击后立刻读 `input.value` 拿到旧值。
- **`Modal.confirm` 按钮不在 `.ant-modal-footer`**（该节点空），在 `.ant-modal-root .ant-modal` 内。
- **Select 没有 `.ant-select-selector`**：结构为 `.ant-select-content`（选中值）+ `.ant-select-input` + `.ant-select-suffix`；打开下拉点 `.ant-select-content`，选项在 `.ant-select-dropdown .ant-select-item-option`。
- Segmented 选中态是白底，需补 `.ant-segmented-item-selected .ant-segmented-item-label { color:主色; font-weight:600 }`。
- 自定义空态与 antd 默认空态二选一（`filtered.length ? <Table/> : <空态/>`）。
- 元素同时带两类（`pg-rv-detail pg-rv-page`）时，后代选择器取不到，要写 `.pg-rv-page.pg-rv-detail`。
- 复用 `.pg-filter-search` 必须补 `flex: 1 1 240px; width:auto`（弹性只在 `.pg-filter-bar` 下定义）。

## 导航菜单与演示动线（业务方 2026-10-25 定稿，不可逆改）
- **菜单顺序即演示顺序**：数据接入清洗 → 专家任务 → 专家治理工作台 → 运营入库审核 → 标准物料库 → 编制采购清单 → 物料映射 → 价格分析 → 智能询价 → 治理总览（总览永远最后，收尾页）。
- 术语：`import`=数据接入清洗（旧「数据源接入」）、`tasks`=专家任务（旧「任务追踪」）、`governance`=专家治理工作台（旧「AI治理工作台」，AI 不再出现在导航/页头）、`review`=运营入库审核。默认落地页 `import`。
- 侧边栏装不下 10 项（1440×900 下只有 708px）：`index.tsx` 把 `price-library` 组 `splice` 到「首页」之后（只影响本原型，不动共享布局）。
- 改菜单名必须同步 `temp/*.mjs`（`clickMenu/gotoMenu/pageTitle` 全是字符串）+ 页面内文案（空态、按钮、任务命名），否则老脚本静默 FAIL。
- 治理台关键动线「导入 → 建任务 → 任务追踪 → 继续治理」：**导入成功落任务追踪，不直接进工作台**。

## 清单附件引用链路
- 「编制采购清单」附件是真实链路：隐藏 `input[type=file]`（仅 xlsx/xls）→ `parseFile` → `mapColumnsWithAi` → `ai/match.ts` 匹配 `context.standards` → 引用弹窗 → 写回清单行。**不要退回 message.info 占位**。
- 候选库 = `standards`（含用户编辑）+ `initialPrices`；模型返回 code 必须命中候选库才采用。单批 AI 失败降级 `matchLocally`，进度文案显式说明。
- 引用写回：名称/规格取标准物料，数量单价取附件原文，税率固定 13% 反算，报价依据=「附件引用」。
- seed：`initialStandards` 12 条、`initialPrices` 14 条；加条目时 `loadDemoState` 按 key 给旧快照补齐，不用 bump version。

## 治理工作台
- 属性区是**列表**（`.pg-atom-head` + `.pg-atom-row`，grid 6 列：勾选/属性名/属性值/同义词/置信度/操作），不要改回卡片式；行高 42px 靠 `box-sizing:border-box`。
- 「标准物料组装预览」是属性列表下方的一条**清单行**（`.pg-preview-surface > .pg-lp-table`，9 列同采购清单），不要再改回 `.pg-gov-side` 左右分栏。预览数量/单价是示例值（`SAMPLE_QTY`/`SAMPLE_PRICE`/`samplePriceOf()`），表头已标「示例值」。`pg-preview-table` 属于导入页，治理台用 `pg-lp-*`。
- 操作条是普通卡片（**不要 sticky**，会压住相似推荐）。
- 同义词两级：`Atom.synonyms`（属性级，随 `atomOverride` 存）与 `materialSynonym[物料key]`（商品名级，独立覆盖层）；`defaultAtomSynonyms` 导入时预填。同一叫法登记到第二个属性要 `Modal.confirm` 提醒（防误归并，别删）。

## 标准物料 / 提交审核闭环（不可逆改）
- **治理台不再直接写标准库**：`confirmStandard` 已删除，写动作只在 `reviewSubmission(key,'approve')`。别把「确认入库」加回来。
- 状态：`confirmedKeys`=审核通过已入库；`submissions`（待审核/已通过/已驳回）。任务状态由 `syncTaskProgress(task, submissions)` 派生（approved===total→已完成；approved+waiting===total→待审核；否则进行中），**不要手动 setStatus**。页面 key `'price-review'`→`'review'`，旧快照初始化时映射回填（不能 bump version）。
- 审核对象是**业务专家组装完成的商品**（是否入标准物料库），不是价格记录。与治理台共用 `similar.ts`，≥85% 视为疑似重复建档要警示。
- **审核详情必须是独立页面 `review-detail`**（不许改回右侧抽屉）。入口 `openReviewDetail(key)`；「下一条待审核/返回入库审核」放 PageHeader `.pg-bill-action`，结论操作放吸底条 `.pg-gov-actionbar`（保存草稿/标记废弃/保存并提交审核）。
- **`standards-edit` 是单栏**，不许加回「本库物料」侧栏；删侧栏要连 `.pg-std-edit-shell` 外壳一起删（否则 280px+1fr 挤压）。
- 规格级 `StandardMaterial.attributeSynonyms`（属性名→历史叫法数组）：`reviewSubmission` 与编辑页 `updateStandard` 都写；编辑页保存**整体重建**该对象（防旧键残留）。商品级 `StandardMaterial.synonyms` 是整条物料别名，两者别混。规格行：`.pg-spec-item` 包 `.pg-spec-row`+`.pg-spec-syn`。

## 提交方式：新建 vs 修改已有（业务硬要求）
- 审核必须区分「新建」与「改已有」（专家常发现库里已有同件商品，只改属性/补属性/加同义词，不能重复建档）。
- `MaterialSubmission.changeType: 'new'|'update'` + `targetStandardKey/Code/Name` + `changes: SubmissionChange[]`；`changeKind`：`value`(带 before/after)/`add-atom`/`atom-synonym`/`name-synonym`。
- diff/摘要/合并全在 `similar.ts`（`diffStandardChanges`/`summarizeChanges`/`describeChanges`/`mergeStandard`），治理台与审核页共用，**不许在页面里另写比对逻辑**。
- diff 规则：属性名按「当前名+该属性同义词+`defaultAtomSynonyms`」归一匹配；**跳过品类**；**提交值为空=本次不改这项**（不清空）；同义词只报标准侧没有的。
- 通过审核：有 target → `mergeStandard`（只合并 attributes/synonyms/attributeSynonyms，`standardCount` 不变，编码名称品类价格保留）；无 target → 新建 `STD-AI-`。这是唯一实质差别。
- 关联关系存 `materialLink`，种子用 `deriveMaterialLink` 从提交单反推（否则治理台显示未关联、审核页显示修改）。种子提交单 atoms 必须与治理台 material 完全一致。
- 审核列表有「提交方式」列+筛选；详情页修改模式顶部有「本次变更」四列表，主按钮「通过并合并」。

## 物料映射
- key：`material-mapping`（招标列表，进菜单）+ `mapping-detail`（清单映射工作台，hidden）。`activeBidKey` 与 `mapping` 一起进 `ampg:demo:v1` 快照（version 不变，缺字段 `?? initialMappings()`/`?? null` 回填）。
- 关系：**一条标准物料 ← 多条历史写法（一对多）；一条清单项 → 至多一条标准物料**。本页只关联，**不许新建标准物料**（「转治理建档」只标 `by:'new'`）。
- `recommendStandards` 打分（`mapping.ts`，纯本地）：`attrRatio*0.62 + nameDice*0.18 + 叫法命中*0.1 + 品类命中*0.1`，强证据 +10；`attrRatio = 平均相似度 × (0.7+0.3*覆盖度)`。**只在双方都声明的属性上算相似度**（因标准侧多属性扣分会普遍掉到 60% 以下）。`AUTO_MAP_THRESHOLD=68`。
- 规格型号三来源 `standard/ai/manual`，`parseBidSpec` 按品类抠，**解析不出返回空数组不编**。自动预映射落「待复核」不落「已确认」，`onlyMissing` 不冲人工结果。
- 统计只算 `confirmed && standardKey` 金额为「可复用历史价」；进度 `(done+new)/total`。清单表**按 `idx` 升序固定**（纸质清单逐行对账）。

## 价格分析页
- 参考价唯一出口 `analysisData.refPriceOf(key, unit)`，采购清单与价格分析都必须走它（种子 `refPriceSeed` 与 `initialPrices` 对齐）。
- 合同集确定性伪随机（`hashText`+`mulberry32`，种子=标准物料编码），所有 KPI/图表/明细从同一份合同聚合。工程局/区域**按序号轮转**而非随机（否则筛选后月份有空洞）。
- 图表**手写 SVG**（`analysisCharts.tsx`），不引图表库（iife 禁动态导入）；`ResizeObserver` 取实测宽按像素画，不用 viewBox 缩放。折线零值月份必须**断线**（`line>0` 分段）；全月有值才铺面积。区域分布**不用地图**（合规风险），用金额排行条。

## Git / 仓库结构（2026-10-26 补充）
- 仓库根目录是 **`LRainD.github.io`（axureMake 的上一级）**，远程 `origin git@github.com:LRainD/LRainD.github.io.git`，主分支 `main`。axureMake 原型代码与同级目录 `集采预测`（Python 分析 + 输出）在同一仓库里。
- `集采预测/` 下有后台进程会周期性重建 `__pycache__/*.pyc` 与 `.DS_Store`，这些路径又被远程跟踪 → `git merge` 会因「untracked working tree files would be overwritten」反复中止。解法：**单条命令内**先 `mv` 走 `analysis/__pycache__`、`outputs/.DS_Store` 并 `git checkout --` 掉被改的 `.DS_Store`，紧接着立刻 `git merge`（分多次工具调用会被进程抢回）。
- `.DS_Store` 是二进制，冲突时直接取远程版本（`git checkout --theirs`），无内容价值。
