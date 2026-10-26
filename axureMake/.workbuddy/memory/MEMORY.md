# 项目长期备忘（axureMake 原型项目）

## 环境事实
- 依赖版本：antd 6.5.3 / React / lucide-react。**antd v6 Drawer 用 `size`，`width` 已废弃**；`destroyOnClose` → `destroyOnHidden`，`maskClosable` → `mask.closable`。
- **antd v6 其他废弃点**（本项目会遇到）：`Alert message` → `title`；`InputNumber addonAfter` → `suffix`；`Table rowKey` 不再传 index 参数；`Space direction` → `orientation`；`Divider orientation` 语义改为方向（用 `titlePlacement`）。
- **antd v6 `Button type="primary" ghost` 会渲染成蓝底蓝字（文字看不见）**：要实心用 `type="primary"`，要蓝边蓝字用 `ghost` + 默认类型。
- **sticky 吸底要抵掉 `.main-content` 的 `padding: 16px 24px`**：只写 `bottom: 0` 会留 16px 灰边，只写 `bottom: -16px` 滚到底又缩回去；必须 `bottom: -16px` + `margin-bottom: -16px`（横向出血用 `margin: 0 -24px`）。
- **大模型网关跨域**：`https://tianqu.yzw.cn/v1`（OpenAI 兼容，模型 `deepseek-flash` = deepseek-v4.1-flash）不支持浏览器 CORS（OPTIONS 返回 404）。已在 `vite-plugins/llmProxyPlugin.ts` 提供 dev-only `/llm-proxy/chat/completions` 代理（按 `x-llm-base` 头转发、SSE 透传），需在 `vite.config.ts` serve 插件列表中注册。**`deepseek-flash` 为推理模型，max_tokens 必须 ≥8000**，否则正文为空（token 全被 reasoning 吃掉）。
- 浏览器端解析依赖已在 `package.json`：`xlsx` 0.18.5、`pdfjs-dist` 3.11.174、`papaparse`。pdf.worker 用 `?raw` 内联 + `Blob`/`createObjectURL` 赋给 `GlobalWorkerOptions.workerSrc`（**不用 `?url`**，见下方导出约定）。
- **导出（admin 的 `/build/<key>.js`）走的是 `npx vite build` + `ENTRY_KEY` 单入口 iife 构建**：iife 不支持代码分割，所以**页面里严禁 `import()` 动态导入**，否则该页面导出必报 `Failed to fetch code: Internal Server Error`（dev 模式完全正常，只有导出会挂）。同理禁止依赖 `?url` 外部资源——`/build/` 只返回主 JS，外部 asset 在导出运行时 404。
- **导出件的 AI 能力依赖本机 dev server**：模型网关 `tianqu.yzw.cn` 无 CORS，必须经 `vite-plugins/llmProxyPlugin.ts` 的 `/llm-proxy` 中转。导出后页面不在 dev server 源上，所以 `ai/llm.ts` 会先探 `/llm-proxy/health`（同源 → `localhost|127.0.0.1:51720~51724`）再请求；代理必须自带 CORS 响应头（含 OPTIONS 预检），否则浏览器直接拦掉。https 宿主页会拦 http 代理（混合内容），异地/离线使用需把代理部署到公网。
- 单入口 iife 构建很慢（antd+pdfjs+xlsx 全打进一个文件，实测 150~177s），`buildHandler.ts` 的 `BUILD_TIMEOUT_MS` 已放宽到 300s，不要调回 120s。
- **扫描件 PDF 不要指望浏览器端 OCR**：实测 `doc/example/总需求计划.pdf`（扫描全能王，1 页，无文字层）用 tesseract.js chi_sim（原生 1837px、PSM6）几乎读不出表格正文，只会输出乱码级文本。当前策略：检测无文字层 → 提示并使用「文本录入」兜底；要真正支持扫描件必须接服务端 OCR 或视觉模型（该网关只有 `deepseek-flash`，无 VLM）。
- 本机 macOS 12.5.1，**agent-browser 自带 Chromium 155 无法运行**（`Symbol not found: _objc_claimAutoreleasedReturnValue`）。
  - 截图方案：系统 Chrome `--headless=new --no-sandbox --disable-gpu --window-size=W,H --virtual-time-budget=8000 --screenshot=out.png <url>`
  - 交互方案：系统 Chrome `--remote-debugging-port=9222 --no-sandbox --disable-gpu`（**`--no-sandbox` 必需**），Node 内置 WebSocket 直连 CDP。截图必须用 `Page.captureScreenshot` + `clip`，**禁用 `Emulation.setDeviceMetricsOverride`**（会全白）。
  - macOS 无 `timeout` 命令。

## 验收现状（重要）
- `scripts/check-app-ready.mjs` 在 `typecheck` 阶段即中止：全项目 **116 个既有类型错误**（非新页面引入），集中在 `src/common/VariantSwitcher.tsx`、`src/common/ThemeShell/types.ts`、`src/themes/antd-new/templates|components|foundations`、若干旧 prototypes。
- 主因：antd v6 / lucide-react 升级后的历史迁移未完成（TS2604 共 57 处、TS2724/TS2614 各 16 处）。
- **结论：当前任何页面都拿不到 READY 判定**。新增页面的验证需绕过 typecheck（用 `npx tsc --noEmit | grep <你的目录>` 自证 0 错误 + 真实浏览器渲染验证）。
- 端到端验证套路（已验证可用）：`npm run dev`（端口 51720）→ Chrome CDP（**必须用 run_in_background 启动，否则进程随 shell 结束被杀**）→ 页面默认落在「数据接入清洗」（2026-10-25 起；更早是「治理总览」），**需先点侧边栏菜单切页**再操作 → 真实文件上传用 `DOM.setFileInputFiles` 指向 `.ant-upload input[type=file]`。可用 `Page.printToPDF` 现场造中文 PDF 测试样例。

## 项目约定
- 新页面放 `src/prototypes/<kebab-name>/`，入口 `index.tsx`；`entries.json` 由 `scripts/scan-entries.js` 自动登记。
- `.axhub/make/sidebar-tree.json` 是**用户手工维护**的侧边栏树（含文件夹分组），不会被自动扫描覆盖；新页面需手动登记才出现在侧边栏。
- 默认主题 `antd-new`；设计规范见 `rules/design-guide.md`、`rules/theme-guide.md`；规格文档模板 `src/docs/templates/spec-template.md`。
- 规格文档统一命名 `spec.md` 放在页面目录内。
- `temp/` 已在 `.gitignore` 中，可作临时脚手架目录。
- **antd v6 没有可用的 `Result` 组件类型**（`import { Result } from 'antd'` 报 TS2604），空状态/完成态别用它，自写 `div` 结构。
- 原型内需要跨刷新保持状态时统一走 `localStorage`，参考 `ai-material-price-governance/storage.ts`：单快照 + `version` 校验 + try/catch 静默降级，并给一个「重置演示数据」出口。
- **凡是有「跳出去再回来」动线的页面（采购清单 / 智能询价 / 清单映射），组件内 `useState` 的编辑态一律要落 localStorage 草稿**：`setPage` 会让页面整个卸载，回来时 `useState` 重建 = 数据归零，演示直接断链（2026-10-25 在采购清单上踩过：引用 12 行后点参考价去价格分析，返回变回 4 条种子）。
  - 独立草稿 key，不要塞主快照（附件解析结果体积大，会拖慢其它页面每次读写）。
  - 挂载用 `useState(loadDraft)` 的 lazy init，**不要 `useRef(loadDraft())`**（useRef 参数每次渲染都求值，反复 JSON.parse）。
  - 变更防抖 300ms 写 + **卸载时同步 flush**（跳转先卸载，防抖定时器等不到）；最新值挂 ref，别在 cleanup 里闭包旧 state。
  - 「有草稿就照草稿」——空数组是用户主动删空，不要回填种子数据。
- **antd v6 交互细节（写 E2E 必踩）**：两字中文按钮 antd 会插空格（`恢复` → `恢 复`），按 innerText 精确匹配要用 `replace(/\s/g,'')`；Table 有 fixed/scroll 时会渲染 `.ant-table-measure-row`，数行数必须 `tr:not(.ant-table-measure-row)`；点击后立刻读 `input.value` 拿到旧值，需等一帧再读。
- 治理台的「导入 → 建任务 → 任务追踪 → 继续治理」链路是产品关键动线：**导入成功落任务追踪，不直接进工作台**，别改回去。
- **页面可以不出现在侧边栏**：`pageItems` 的项支持 `hidden?: boolean`，`index.tsx` 用 `filter(p => !p.hidden)` 渲染菜单。像 `standards-edit` 这种「从列表点进二级页」就标 hidden —— 面包屑仍能取到 label，菜单不会多一项。
- **术语口径**：标准物料库这一侧叫「规格型号」，治理工作台/导入拆解那一侧叫「属性原子」，不要互相改。用户会按页面分别提要求。
- 本页表格在 1440 宽下可视区只有约 877px，9 列必然横滚：**重要的列要往前排**，操作列用 `fixed: 'right'` 并给它补 `.ant-table-cell-fix-right` 的底色 + 阴影，否则与滚动内容糊在一起。

## 清单附件引用链路（2026-10-25）
- 「编制采购清单」页的附件是真实链路：隐藏 `input[type=file]`（仅 xlsx/xls）→ `parseFile` → `mapColumnsWithAi` → `ai/match.ts` 匹配 `context.standards` → 引用弹窗 → 写回清单行。**不要把它退回成 message.info 占位**。
- `ai/match.ts` 的候选库来自 `standards`（含用户编辑）+ `initialPrices`；模型返回的 code 必须能在候选库命中才采用，否则按未匹配。单批 AI 失败降级 `matchLocally`，进度文案会显式说明。
- `initialStandards` 已扩到 12 条、`initialPrices` 14 条；给 seed 加条目时 `loadDemoState` 会按 key 给旧快照补齐，不用 bump storage version。
- 引用写回：名称/规格取标准物料，数量单价取附件原文，税率固定 13% 反算，报价依据 =「附件引用」。
- 该页同样**禁止动态 `import()`**（导出 iife 会 500）；`ai/match.ts` 顶部已写明。

## 治理工作台属性列表与同义词（2026-10-25）
- 「AI 治理工作台」属性区是**列表**（`.pg-atom-head` + `.pg-atom-row`，grid 6 列：勾选/属性名/属性值/同义词/置信度/操作），不要再改回卡片式；行高 42px 靠 `box-sizing: border-box` 实现。
- 同义词是两级：`Atom.synonyms`（属性级，随 `atomOverride` 存）与 `materialSynonym[物料key]`（商品名称级，独立覆盖层）。`defaultAtomSynonyms` 在导入时预填，别写死到组件里。
- 确认入库会写 `StandardMaterial.synonyms`（多条）与 `attributeSynonyms`（属性名 → 历史叫法），不要再退回单条 `[sourceName]`。
- 同一叫法登记到第二个属性时要 `Modal.confirm` 提醒，这是防误归并的关键交互，别删。
- 布局两栏：左 `.pg-gov-work` 主列表 1fr、右预览 340px；操作条是普通卡片（**不要 sticky**，会压住相似推荐）。

## 属性同义词的两级落点（2026-10-25 补充）
- `StandardMaterial.attributeSynonyms` 是**规格级**同义词（属性名 → 历史叫法数组），入库审核通过时（`reviewSubmission`）与编辑页 `updateStandard` 都写这个字段。编辑页保存时**整体重建**该对象，不要改成合并（否则规格改名后旧键会残留）。
- `StandardMaterial.synonyms` 是**商品级**别名（整条物料），两者不要混。
- 编辑页规格行结构：`.pg-spec-item` 包 `.pg-spec-row` + `.pg-spec-syn`；删除按钮显隐靠 `.pg-spec-item:hover`。

## 治理工作台预览形态（2026-10-25）
- 「标准物料组装预览」不再是右栏卡片堆，而是属性列表下方的一条**清单行**（`.pg-preview-surface` > `.pg-lp-table`，9 列与采购清单一致）。别再改回 `.pg-gov-side` 左右分栏。
- 预览数量/单价是示例值（`SAMPLE_QTY`、`SAMPLE_PRICE` + `samplePriceOf()`），表头右侧已标注「示例值」，不要当成真实报价。
- 类名 `pg-preview-table` 属于导入页，治理台预览表用 `pg-lp-*` 前缀。
- **本机调试 CDP 必须 `curl --noproxy '*'`**：环境有 `HTTP_PROXY`，否则 9222 连不通；9222 常被历史 Chrome 僵尸占用，先 lsof 找 PID kill 再换 user-data-dir。

## 提交审核闭环（2026-10-25，动线不可逆改）
- **治理台不再直接写标准库**：`confirmStandard` 已删除。写的动作只在 `reviewSubmission(key,'approve')` 里发生。别把「确认入库」加回来。
- 两段状态：`confirmedKeys` = 审核通过已入库；`submissions`（`待审核/已通过/已驳回`）承载提交单与驳回意见。任务状态由 `syncTaskProgress(task, submissions)` 派生（approved===total→已完成；approved+waiting===total→待审核；否则进行中），**不要手动 setStatus**。
- 页面 key `'price-review'` → `'review'`，旧 localStorage 快照初始化时映射回填（不能 bump version，会清数据）。
- 审核对象是**业务专家组装完成的商品**（是否入标准物料库），不是价格记录。审核页与治理台共用 `similar.ts` 做相似标准比对，≥85% 视为疑似重复建档要警示。
- 吸底操作条三按钮：`保存草稿` / `标记废弃` / `保存并提交审核`（已通过→「已通过入库」、已提交→「已提交审核」，后两者 disabled）。
- **审核详情必须是独立页面 `review-detail`，不许改回右侧抽屉**（业务方 2026-10-25 明确要求）。入口 `openReviewDetail(key)`；「下一条待审核」「返回入库审核」放在 PageHeader 的 `.pg-bill-action`，结论操作放吸底条 `.pg-gov-actionbar`。
- **标准物料编辑页 `standards-edit` 是单栏，不许加回「本库物料」侧栏**（同上要求）。删侧栏时要把 `.pg-std-edit-shell` 外壳一起删，否则 `grid-template-columns: 280px 1fr` 会把唯一子元素压成 280px。
- 元素同时带两个类时（如 `className="pg-rv-detail pg-rv-page"`），后代选择器 `.pg-rv-page .pg-rv-detail` 取不到，必须写 `.pg-rv-page.pg-rv-detail`。

## 提交方式：新增建档 vs 修改已有物料（2026-10-25，业务硬要求）
- 业务方明确：**审核必须能区分「新建」还是「改已有」**——专家组装时常发现标准库已有同一件商品，只是改属性值 / 补属性 / 加同义词，不能重复建档。
- `MaterialSubmission.changeType: 'new' | 'update'` + `targetStandardKey/Code/Name` + `changes: SubmissionChange[]`；`changeKind` 四类：`value`（带 before/after）、`add-atom`、`atom-synonym`、`name-synonym`。
- diff / 摘要 / 合并三件事全在 `similar.ts`：`diffStandardChanges` / `summarizeChanges` / `describeChanges` / `mergeStandard`，治理台与审核页共用，**不许在页面里另写一份比对逻辑**。
- diff 规则：属性名按「当前名 + 该属性同义词 + `defaultAtomSynonyms`」归一后匹配；**跳过品类**；**提交值为空 = 本次不改这项**（不清空标准库）；同义词只报标准侧没有的。
- 通过审核：有 target → `mergeStandard`（只合并 attributes/synonyms/attributeSynonyms，`standardCount` 不变，编码名称品类价格全保留）；无 target → 新建 `STD-AI-`。这是两者唯一实质差别，别把修改也做成新建。
- 关联关系存 `materialLink`（localStorage），种子要从提交单反推（`deriveMaterialLink`），否则治理台显示未关联、审核页显示修改，自相矛盾。
- 种子提交单的 atoms 必须与治理台对应 material 的数据**完全一致**，否则治理台 banner 的 diff 摘要与审核详情页对不上。
- 审核列表有「提交方式」列 + 按方式筛选；详情页修改模式顶部有「本次变更」四列表，主按钮是「通过并合并」。

## antd v6 / 表格 UI 必踩坑（2026-10-25）
- **`Modal.confirm` 的按钮不在 `.ant-modal-footer`**（该节点为空），在 `.ant-modal-root .ant-modal` 内。E2E 必须用 `.ant-modal` 作作用域找按钮。
- **Table `fixed:'right'` 列必须自带底色**，否则横滚时下层文字透出：`.ant-table-cell-fix-right{background:#fff}` + 表头 `#f7f9fb` + `inset -8px` 阴影。
- **自定义空态与 antd 默认空态要二选一**（`filtered.length ? <Table/> : <空态/>`），否则两套空提示叠一起。
- **antd v6 的 Select 没有 `.ant-select-selector`**：内部结构是 `.ant-select-content`（选中值文本，带 title）+ `.ant-select-input`（真 input）+ `.ant-select-suffix`。E2E 打开下拉要点 `.ant-select-content`；用老选择器会静默点空、看上去像筛选功能失效。选项仍渲染在 `.ant-select-dropdown .ant-select-item-option`。
- **Segmented 选中态是白底**，在浅灰轨道上几乎看不出，需补 `.ant-segmented-item-selected .ant-segmented-item-label { color: 主色; font-weight:600 }`。

## 价格分析页数据与图表约定（2026-10-25）
- 参考价唯一出口是 `analysisData.refPriceOf(key, unit)`，采购清单与价格分析都必须走它，否则两页数字会互相打脸（种子在 `refPriceSeed`，与 `initialPrices` 对齐）。
- 合同集是确定性伪随机（`hashText` + `mulberry32`，种子=标准物料编码），**所有 KPI/图表/明细从同一份合同聚合**，别再各造一套。
- 工程局/区域**按序号轮转**而非随机，否则按单个工程局筛选时部分月份无合同，走势图出现空洞。
- **图表手写 SVG**（`analysisCharts.tsx`），不引图表库：单入口 iife 禁动态导入，且只这一页用。用 `ResizeObserver` 取实测宽再按像素画，不用 viewBox 缩放。
- 折线零值月份必须**断线**（按 `line>0` 分段），否则曲线扎到底再弹回像崩盘；只有全月有值才画面积填充。
- 区域分布**不用地图**（地理数据合规风险），用金额排行条。

## 物料映射（2026-10-25）
- 页面 key：`material-mapping`（招标列表，在菜单里）+ `mapping-detail`（清单映射工作台，`hidden`）。`activeBidKey` 记当前招标，与 `mapping` 一起进 `ampg:demo:v1` 快照（version 不变，缺字段 `?? initialMappings()` / `?? null` 回填）。
- 关系口径：**一条标准物料 ← 多条历史写法（一对多）；一条清单项 → 至多一条标准物料**。本页只做关联，**不许在这里新建标准物料**（"转治理建档"只标记 `by:'new'`，建库仍走 治理台 → 入库审核）。
- `recommendStandards` 打分（`mapping.ts`，纯本地可复现）：`attrRatio*(1)*0.62 + nameDice*0.18 + 叫法命中*0.1 + 品类命中*0.1`，强证据 +10；`attrRatio = 平均相似度 × (0.7+0.3*覆盖度)`。**只在双方都声明的属性上算相似度，不能因标准侧多出属性扣分**（扣分会让分数普遍掉到 60% 以下、几乎映射不上）。`AUTO_MAP_THRESHOLD = 68`。
- 规格型号三来源 `standard 沿用 / ai 解析 / manual 手工`，解析走 `parseBidSpec` 按品类抠，**解析不出就返回空数组，不编**（门、窗、桥架这类）。
- 自动预映射落「待复核」不落「已确认」，且 `onlyMissing` 只补空缺，不冲掉人工结果。
- 统计只算 `confirmed && standardKey` 的金额为「可复用历史价」；进度用 `(done+new)/total`（转治理算已处理）。
- 清单表**按 `idx` 升序固定**，不做状态排序（纸质清单要逐行对账）。
- 复用 `.pg-filter-search` 时必须补 `flex: 1 1 240px; width: auto`，它的弹性只在 `.pg-filter-bar` 下定义，否则 Input 撑满、工具栏换行。

## 导航菜单与演示动线（2026-10-25，业务方定稿）
- **菜单顺序即演示顺序，不要再按功能分组重排**：数据接入清洗 → 专家任务 → 专家治理工作台 → 运营入库审核 → 标准物料库 → 编制采购清单 → 物料映射 → 价格分析 → 智能询价 → 治理总览（总览永远最后，是收尾页）。
- 术语定稿：`import` = 数据接入清洗（旧「数据源接入」）、`tasks` = 专家任务（旧「任务追踪」）、`governance` = 专家治理工作台（旧「AI治理工作台」，AI 字样不再出现在导航与页头）、`review` = 运营入库审核（旧「入库审核」）。
- 默认落地页是 `import`（不是 overview）：打开即闭环第一步。
- **侧边栏装不下 10 个二级菜单**：1440×900 下 `.sidebar-menu` 只有 708px，10 项子菜单 + 十几个一级菜单要 1016px，且 `scrollbar-width:none` 没滚动条提示。本原型在 `index.tsx` 把 `price-library` 这一组 `splice` 到「首页」之后（只影响本原型，不动共享布局），10 项才能一屏看全。
- 改菜单名时**必须同步 `temp/*.mjs`**（`clickMenu/gotoMenu/pageTitle` 全是字符串）+ 页面内所有引用文案（空态、按钮、任务命名 `文件名 · 专家治理`），否则老脚本会一片静默 FAIL。
- `temp/*.mjs` 会被 grep 判成 binary，搜中文要加 `-a`。

