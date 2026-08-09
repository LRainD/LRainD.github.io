<!-- ppt-master-schema: design-spec/v1 -->
# zzx - Design Spec

## I. Project Information

| Item | Value |
| --- | --- |
| Project Name | zzx |
| Canvas Format | PPT 16:9, 1280 × 720 |
| Page Count | 20 |
| Primary Language | zh-CN |
| Target Audience | 数字中国创新大赛决赛评审专家及招采监管、合规、审计领域专家 |
| Communication Intent | 以证据链方式说明行业监管矛盾、数据利用、技术机制、真实应用、量化成效与推广价值，形成可信的决赛汇报 |
| Desired Audience Outcome | 评审专家能够快速理解项目不是文件问答工具，而是嵌入招采全流程的智能监管体系，并认可其技术可信度、应用实效和行业价值 |
| Core Message / Ask / Action | 以数据要素为基座、规则与 AI 为双引擎，形成风险识别、预警拦截、证据固化、闭环处置和审计追溯能力 |
| Delivery Context | 20 分钟现场 presenter-led 决赛汇报，兼顾会后评审复核 |
| Artifact Afterlife | 用于决赛路演、专家复核、答辩留档和后续项目介绍 |
| Reading Mode | balanced |
| Content Strategy | 保留文档规定的20页证据链结构，压缩长段落并强化结论、证据和图示；不虚构案例、接口或上线状态 |
| Design Style | 统一科技商务风；内容版式自由设计，第2—10页重点参考对应图片的信息结构，全套背景色和顶部标题系统保持一致 |
| Formula Policy | text-only |
| AI Image Acquisition Path | not applicable |
| Generation Mode | continuous |
| Spec Refinement | disabled |
| Speaker Notes | disabled — explicit production choice |
| Custom Animations | disabled — explicit production choice |
| Narration Audio | disabled — explicit production choice |
| Created Date | 2026-08-06 |

## II. Canvas Specification

| Property | Value |
| --- | --- |
| Format | PPT 16:9 |
| Dimensions | 1280 × 720 |
| viewBox | `0 0 1280 720` |
| Margins | 左右 32px，上 20px，下 18px |
| Content Area | x=32–1248，y=118–690 |

## III. Visual Theme

### Theme Style

- **Mode**: pyramid
- **Visual style**: soft-rounded
- **Theme**: 蓝白科技商务体系，沿用指定项目的浅蓝白背景、深蓝标题、细分隔线和蓝橙绿紫语义色
- **Tone**: 专业、克制、可信、证据导向；架构清晰而非装饰性未来感

### Color Scheme

| Role | HEX | Purpose |
| --- | --- | --- |
| Background | #F4F8FD | 全套内容页统一浅蓝白背景 |
| Secondary background | #FFFFFF | 信息卡片、矩阵、流程节点 |
| Primary | #0753B8 | 顶部标题、主流程、核心数据 |
| Accent | #FF6B20 | 风险、预警、重点数字 |
| Secondary accent | #42A96B | 通过、整改完成、价值改善 |
| Body text | #1B2638 | 正文与标签 |
| Audit accent | #7B61C9 | 存证、审计、外部信源 |
| Divider | #BCD3EC | 顶部分隔线和结构线 |

## IV. Typography System

### Font Plan

| Role | Character (Reference) | Primary | English if non-English | Fallback tail |
| --- | --- | --- | --- | --- |
| Title | 清晰稳健的现代无衬线粗体 | PingFang SC | Arial | Microsoft YaHei, sans-serif |
| Body | 中性、易读、适合高密度商务信息 | PingFang SC | Arial | Microsoft YaHei, sans-serif |

- **Title stack**: PingFang SC, Microsoft YaHei, Arial, sans-serif
- **Body stack**: PingFang SC, Microsoft YaHei, Arial, sans-serif

### Font Size Hierarchy

| Purpose | Anchor Size (px) |
| --- | ---: |
| Body | 17 |
| Title | 32 |
| Subtitle | 17 |
| Annotation | 12 |
| Data | 42 |
| Section heading | 20 |
| Card title | 22 |
| Emphasis | 25 |
| Panel title | 27 |
| Hero label | 29 |
| KPI | 48 |
| Hero data | 58 |

## V. Layout Principles

### Page Structure

- **Header area**: 所有内容页采用“页码｜结论型标题 + 一句副标题 + 细分隔线”的统一顶部系统，禁止沿用参考图原有深蓝整条页眉
- **Content area**: 第2—10页保留参考图的信息组织、模块关系和阅读顺序；第11—20页延续同一视觉语法自由设计
- **Footer area**: 数据、测试和案例页保留来源、口径待确认或脱敏说明；不放无意义装饰页脚

### Spacing Specification

| Element | Current Project |
| --- | --- |
| Safe margin | 32px |
| Content block gap | 14–18px |
| Icon-text gap | 10–14px |

## VI. Icon Usage Specification

- **Primary bundled library**: none

| Purpose | Icon Path | Page |
| --- | --- | --- |

## VIII. Image Resource List

| Filename | Dimensions | Ratio | Purpose | Type | Layout pattern | Crop Policy | Acquire Via | Status | Reference | text_policy | page_role |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 02_reference_body.png | 1280×608 | 2.105:1 | 第2页参考图主体高保真复刻 | provided reference raster | full-width body | adaptive | user | Existing | docs/images/2页.png | preserve | content |
| 03_reference_body.png | 1280×608 | 2.105:1 | 第3页参考图主体高保真复刻 | provided reference raster | full-width body | adaptive | user | Existing | docs/images/3页.png | preserve | content |
| 04_reference_body.png | 1280×608 | 2.105:1 | 第4页参考图主体高保真复刻 | provided reference raster | full-width body | adaptive | user | Existing | docs/images/4页.png | preserve | content |
| 05_reference_body.png | 1280×608 | 2.105:1 | 第5页参考图主体高保真复刻 | provided reference raster | full-width body | adaptive | user | Existing | docs/images/5页.png | preserve | content |
| 06_reference_body.png | 1280×608 | 2.105:1 | 第6页参考图主体高保真复刻 | provided reference raster | full-width body | adaptive | user | Existing | docs/images/6页.png | preserve | content |
| 07_reference_body.png | 1280×608 | 2.105:1 | 第7页参考图主体高保真复刻 | provided reference raster | full-width body | adaptive | user | Existing | docs/images/7页.png | preserve | content |
| 08_reference_body.png | 1280×608 | 2.105:1 | 第8页参考图主体高保真复刻 | provided reference raster | full-width body | adaptive | user | Existing | docs/images/8页.png | preserve | content |
| 09_reference_body.png | 1280×608 | 2.105:1 | 第9页参考图主体高保真复刻 | provided reference raster | full-width body | adaptive | user | Existing | docs/images/9页.png | preserve | content |
| 10_reference_body.png | 1280×608 | 2.105:1 | 第10页参考图主体高保真复刻 | provided reference raster | full-width body | adaptive | user | Existing | docs/images/10页.png | preserve | content |

## IX. Content Outline

### Part 1: 必须监管与监管对象

#### Slide 01 - 数字合规官 AI 数字员工
- **Audience move**: 尚不了解项目定位 → 建立“嵌入招采全流程的AI监管数字员工”第一认知
- **Layout**: 深蓝渐变封面，左侧标题信息，右侧抽象盾牌、文件和证据链视觉
- **Title**: 数字合规官 AI 数字员工
- **Core message**: 数据要素与 AI 大模型驱动招采全流程立体穿透监管
- **Content**: 副标题、赛题、申报单位、联合单位及智能识别、实时拦截、电子取证、全程追溯四项价值标签

#### Slide 02 - 人工监管难以穿透海量招采业务
- **Audience move**: 知道人工审查辛苦 → 理解规模、专业、识别和时点四重矛盾已达极限
- **Layout**: 参考2页图片的顶部四指标带、2×2痛点矩阵和底部结论条，替换为统一浅蓝白背景与顶部标题系统
- **Title**: 人工监管难以穿透海量招采业务
- **Core message**: 人工模式无法同时满足规模、速度、准确、实时和追溯
- **Content**: 20万次、8类文件、100余页、100+节点；效率低、门槛高、识别难、防控晚

#### Slide 03 - 四类主体、四大风险贯穿交易全流程
- **Audience move**: 认为监管只盯供应商 → 理解两级协同监管覆盖四类主体和五个阶段
- **Layout**: 参考3页图片的两级监管横条、四主体×五阶段矩阵、风险色带和底部证据主线
- **Title**: 四类主体、四大风险贯穿交易全流程
- **Core message**: 系统监管可核验的业务证据，而非对主体作笼统判断
- **Content**: 集团集中监管、采购单位自查；采购方、供应商、评审方、履约方；主体—文件—规则—行为—关系—时间—处置

#### Slide 04 - 构建立体穿透监管闭环
- **Audience move**: 看到分散能力点 → 理解一轴、三流、双擎、两级、六步形成完整方法
- **Layout**: 参考4页图片的双引擎输入、中央六步环、三流、两级协同和分级动作输出
- **Title**: 构建立体穿透监管闭环
- **Core message**: 跨主体、跨文件、跨阶段还原风险形成与传导路径
- **Content**: 业务主轴、数据流/风险流/证据流、规则+AI、集团监管+单位自查、识别至反馈六步闭环及四个转变

### Part 2: 数据与识别机制

#### Slide 05 - 从多源数据到监管证据
- **Audience move**: 知道系统使用数据 → 看清具体接入、加工、形成要素、交叉核验和人工优化过程
- **Layout**: 参考5页图片的五段横向链路、三组数据源、要素卡、场景核验、人工优化流程和安全底座
- **Title**: 从多源数据到监管证据
- **Core message**: 内外部业务、资质、信用、工商和制度数据经治理后形成可调用监管要素
- **Content**: 数据来源、主体对齐、文档解析、字段标准化、规则拆解、企业档案与风险命中项、三类交叉验证、人工研发迭代、安全保障

#### Slide 06 - 业务上报驱动规则核查
- **Audience move**: 认为系统离线批量扫描 → 理解关键业务节点按场景上报、核查并将结果返回原流程
- **Layout**: 参考6页图片的六步主链、侧向外部信源、三类结果和两个场景示例
- **Title**: 业务上报驱动规则核查
- **Core message**: 数据在关键节点触发，经统一清洗和规则分发后形成通过、复核或拦截动作
- **Content**: 节点触发、数据上报、统一接收、结构化处理、规则分发判定、结果返回；公告发布审批前与报名截止后示例

#### Slide 07 - 规则与 AI 双引擎协同
- **Audience move**: 认为所有问题都交给大模型 → 理解确定性问题用规则、复杂性问题用AI
- **Layout**: 参考7页图片的左右双栏、中央协同符号和底部统一输出
- **Title**: 规则与 AI 双引擎协同
- **Core message**: 双引擎按问题确定性和复杂度分工，结果统一汇总、分级并返回业务
- **Content**: 规则引擎三类动作与四个场景；AI引擎三类能力与四个场景；风险结论、证据、依据和三级动作

#### Slide 08 - 结构化数据驱动精准判定
- **Audience move**: 只知道有规则 → 理解规则如何从结构化字段到可复核命中明细
- **Layout**: 参考8页图片的顶部执行链、四类规则、工商关联示例和右侧命中明细表
- **Title**: 结构化数据驱动精准判定
- **Core message**: 条件清晰的风险由结构化数据、规则条件和关系计算稳定识别
- **Content**: 完整性配置、主体资质、关联重叠、一致性阈值；工商关联链路；规则、对象、命中值、依据、等级、动作

#### Slide 09 - 多模态、RAG 与多智能体协同
- **Audience move**: 认为AI只是文本分类 → 理解多模态解析、知识增强、工具协同、推理和复核的完整链路
- **Layout**: 参考9页图片的六步技术主链、Agent网络、RAG支撑层、结构化报告和三个典型场景
- **Title**: 多模态、RAG 与多智能体协同
- **Core message**: 复杂语义和跨文件问题通过有知识依据、可定位、可验证的协同识别完成
- **Content**: PDF/Word/Excel/图片解析、任务规划、Tool-Agent、法规与制度知识库、语义推理、交叉复核、报告输出及三类场景

#### Slide 10 - 两类规则覆盖招采关键节点
- **Audience move**: 看到单点识别 → 理解70+规则覆盖从清单公告到合同后续的全流程
- **Layout**: 参考10页图片的70+主指标、AI审查19项、五阶段能力带和两种检测模式
- **Title**: 两类规则覆盖招采关键节点
- **Core message**: AI审查与结构化比对嵌入五个招采阶段
- **Content**: 清单公告、采购文件、报名资审、开评标定标、合同后续代表规则；合规自查与风控预警

### Part 3: 案例、闭环与可信证据

#### Slide 11 - 供应商资质与准入核验
- **Audience move**: 理解规则机制 → 知道真实案例需由公告、附件、三方数据和处置结果共同证明
- **Layout**: 左侧60%证据图区，右侧40%结构化结果与处置栏，所有缺失材料明确标注待补充
- **Title**: 供应商资质与准入核验
- **Core message**: 公告要求、主体附件、资质和失信数据共同形成可复核准入结论
- **Content**: 公告截图位、证书与查询截图位、要求—实际—结果—来源表、风险等级与处理结果、核验链路

#### Slide 12 - 排斥性条款在发布前被识别
- **Audience move**: 知道AI可理解语义 → 看清原文定位、法规依据、修改复核的证据结构
- **Layout**: 左45%原文证据、中30%识别依据、右25%处置结果，缺失截图标注待补充
- **Title**: 排斥性条款在发布前被识别
- **Core message**: AI以条款上下文和制度依据输出风险线索并推动修改复核
- **Content**: 公告原文截图位、命中条款高亮位、AI说明与引用依据位、修改前后与重新提交位、底部流程

#### Slide 13 - 异常一致性形成辅助核查线索
- **Audience move**: 认为相似即违规 → 理解精确重叠、主体关联和模糊相似只能形成线索，最终由授权人员认定
- **Layout**: 左65%多文件对比证据，右35%确定性特征、AI特征和综合线索三卡，底部合规声明
- **Title**: 异常一致性形成辅助核查线索
- **Core message**: 规则与AI联合呈现可核查线索，不替代最终认定
- **Content**: 响应文件截图位、信息重叠位、主体关系位、文本结构和错误模式相似位、人工核查记录位

#### Slide 14 - 每条风险都转化为闭环监管任务
- **Audience move**: 把风险识别视为终点 → 理解风险分级、人机核查、证据固化和处置反馈的业务闭环
- **Layout**: 六步环形流程与系统自动、业务人员、合规审计三角色泳道
- **Title**: 每条风险都转化为闭环监管任务
- **Core message**: 识别、分级、预警、核查、取证、处置形成闭环
- **Content**: 六步骤的输入输出、低中高风险动作、责任角色、反馈优化；等级口径和时限标注待补充

#### Slide 15 - 全过程留痕形成可验证证据链
- **Audience move**: 认为系统只保存结果 → 理解原始文件、版本、日志、处置和审计输出被风险事件ID串联
- **Layout**: 左侧证据链时间轴，右侧日志审计、电子见证、区块链存证三层可信机制
- **Title**: 全过程留痕形成可验证证据链
- **Core message**: 已具备的全流程留痕与待确认的可信存证能力必须明确区分
- **Content**: 存证对象、风险事件ID、日志审计、电子见证、区块链规划状态、审计检索导出及待补充字段

### Part 4: 应用实效与推广价值

#### Slide 16 - 项目已进入规模化真实业务运行
- **Audience move**: 知道方案可行 → 看到文件、用户、预警和考核四类应用规模证据
- **Layout**: 上方四个大数字，下方应用对象、业务环节、使用角色、运行方式四栏
- **Title**: 项目已进入规模化真实业务运行
- **Core message**: 已支撑高频文件审查和实时风险处置，但覆盖口径仍需补充
- **Content**: 20万+份、100万人次、9万+次、2026考核指标；覆盖单位、区域和项目数待补充

#### Slide 17 - 高风险业务在关键节点被实时阻断
- **Audience move**: 只看到使用规模 → 理解预警解除、直接拦截和漏检下降体现业务实效
- **Layout**: 左侧9万+主数字，右侧三指标卡，下方漏检率对比与风险分级流程
- **Title**: 高风险业务在关键节点被实时阻断
- **Core message**: 系统从辅助审查走向关键节点实时防控
- **Content**: 9万+、98.35%、57.75%、30%至6%以下、分级机制、处置闭环及指标口径待确认

#### Slide 18 - 效率、成本与风险同步改善
- **Audience move**: 认可风险防控 → 看到3小时到3分钟及规模化降本减损价值
- **Layout**: 上方超大时间对比，下方效率、成本、风险三列价值卡和人机协同说明
- **Title**: 效率、成本与风险同步改善
- **Core message**: AI替代重复审查工作，最终专业判断仍由授权人员完成
- **Content**: 60倍、90%、10万+小时、2000万元+、5000万元+，测算公式与周期待补充

#### Slide 19 - 打通交易、监管与信用数据
- **Audience move**: 把项目视为单体工具 → 理解监管中台可与交易、监管、信用、资质和审计平台协同
- **Layout**: 中心监管中台，左右平台群，三色连接线，下方接口治理底座和上线状态图例
- **Title**: 打通交易、监管与信用数据
- **Core message**: 标准接口和事件协同使风险数据进入跨平台处置流程
- **Content**: 五类平台输入输出、API/消息/批量/文件方式、身份权限脱敏日志重试版本治理；实际平台和接口待补充

#### Slide 20 - 让招采监管可识别、可阻断、可追溯
- **Audience move**: 形成分散印象 → 收束为数据、双引擎、闭环、证据和协同的一体化价值
- **Layout**: 深蓝渐变收尾，中心数字合规官，五关键词环绕，底部三项核心数据与结束语
- **Title**: 让招采监管可识别、可阻断、可追溯
- **Core message**: 以数字合规守护阳光招采，以智能监管助力行业高质量发展
- **Content**: 识别、阻断、取证、追溯、协同；效率提升60倍、模型准确率89%口径待确认、年避免损失5000万元+

## X. Speaker Notes Requirements

- **Generation**: disabled
