import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const rootDir = path.resolve(process.cwd());
const inputPath = path.join(rootDir, "analysis", "generated", "forecast_results.json");
const outputDir = path.join(rootDir, "outputs", "20260913_集采计划预测");
const outputPath = path.join(outputDir, "中国建筑一局2026集采计划预测与真实对比.xlsx");
const previewDir = path.join(rootDir, "analysis", "artifact_build", "previews");
const data = JSON.parse(await fs.readFile(inputPath, "utf8"));

const fontFamily = "Arial";
const colors = {
  navy: "#17365D",
  blue: "#1F4E78",
  blue2: "#5B9BD5",
  paleBlue: "#DDEBF7",
  teal: "#2F756D",
  paleTeal: "#E2F0D9",
  orange: "#ED7D31",
  paleOrange: "#FCE4D6",
  red: "#C00000",
  paleRed: "#F4CCCC",
  gray: "#666666",
  paleGray: "#F2F2F2",
  line: "#D9E1F2",
  white: "#FFFFFF",
  ink: "#1F1F1F",
};

const wb = Workbook.create();
const summary = wb.worksheets.add("模型对比");
const recommendation = wb.worksheets.add("推荐预测");
const allPredictions = wb.worksheets.add("全部模型预测");
const actual = wb.worksheets.add("2026真实计划");
const matchDetail = wb.worksheets.add("匹配明细");
const backtest = wb.worksheets.add("历史回测");
const quality = wb.worksheets.add("数据质量");
const readme = wb.worksheets.add("模型说明");

function excelColumn(n) {
  let result = "";
  while (n > 0) {
    n -= 1;
    result = String.fromCharCode(65 + (n % 26)) + result;
    n = Math.floor(n / 26);
  }
  return result;
}

function parseValue(key, value) {
  if (value === null || value === undefined) return null;
  if (key.includes("时间") && /^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
    return new Date(`${value}T00:00:00`);
  }
  return value;
}

function styleTitle(sheet, title, subtitle, lastColumn) {
  sheet.showGridLines = false;
  sheet.getRange("A2").values = [[title]];
  sheet.getRange("A2").format.font = { name: fontFamily, size: 16, bold: true, color: colors.navy };
  sheet.getRange("A3").values = [[subtitle]];
  sheet.getRange("A3").format.font = { name: fontFamily, size: 10, italic: true, color: colors.gray };
  sheet.getRange(`A4:${lastColumn}4`).format.borders = {
    bottom: { style: "thin", color: colors.blue2 },
  };
}

function styleHeader(range) {
  range.format = {
    fill: colors.blue,
    font: { name: fontFamily, size: 10, bold: true, color: colors.white },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    wrapText: true,
    borders: {
      insideVertical: { style: "thin", color: colors.white },
      bottom: { style: "thin", color: colors.navy },
    },
  };
  range.format.rowHeight = 32;
}

function setColumnWidth(sheet, columnNumber, width) {
  sheet.getRange(`${excelColumn(columnNumber)}:${excelColumn(columnNumber)}`).format.columnWidth = width;
}

function addDataSheet({ sheet, title, subtitle, records, columns, tableName, widths = {}, dateColumns = [], percentColumns = [], numberColumns = [], freezeColumns = 2 }) {
  const lastColumn = excelColumn(columns.length);
  styleTitle(sheet, title, subtitle, lastColumn);
  sheet.getRange(`A5:${lastColumn}5`).values = [columns];
  styleHeader(sheet.getRange(`A5:${lastColumn}5`));
  if (records.length) {
    const rows = records.map((record) => columns.map((key) => parseValue(key, record[key])));
    sheet.getRange(`A6:${lastColumn}${records.length + 5}`).values = rows;
    const body = sheet.getRange(`A6:${lastColumn}${records.length + 5}`);
    body.format.font = { name: fontFamily, size: 9, color: colors.ink };
    body.format.verticalAlignment = "center";
    body.format.rowHeight = 18;
    const table = sheet.tables.add(`A5:${lastColumn}${records.length + 5}`, true, tableName);
    table.style = "TableStyleMedium2";
    table.showBandedColumns = false;
    table.showFilterButton = true;
  }
  Object.entries(widths).forEach(([col, width]) => setColumnWidth(sheet, Number(col), width));
  dateColumns.forEach((key) => {
    const idx = columns.indexOf(key) + 1;
    if (idx > 0 && records.length) sheet.getRange(`${excelColumn(idx)}6:${excelColumn(idx)}${records.length + 5}`).format.numberFormat = "yyyy-mm-dd";
  });
  percentColumns.forEach((key) => {
    const idx = columns.indexOf(key) + 1;
    if (idx > 0 && records.length) sheet.getRange(`${excelColumn(idx)}6:${excelColumn(idx)}${records.length + 5}`).format.numberFormat = "0.0%";
  });
  numberColumns.forEach((key) => {
    const idx = columns.indexOf(key) + 1;
    if (idx > 0 && records.length) sheet.getRange(`${excelColumn(idx)}6:${excelColumn(idx)}${records.length + 5}`).format.numberFormat = "#,##0.00";
  });
  sheet.freezePanes.freezeRows(5);
  if (freezeColumns > 0) sheet.freezePanes.freezeColumns(freezeColumns);
  sheet.tabColor = colors.blue2;
}

const comparison = data.comparison;
summary.tabColor = colors.navy;
styleTitle(summary, "中国建筑一局 2026 年集采计划预测", "训练范围：2023–2025 年；2026 年真实计划仅用于盲测；生成日：2026-09-13", "X");

summary.getRange("A5:H5").values = [["推荐模型", data.metadata.recommended_model, "最高综合相似度", null, "2026实际条目", null, "推荐预测条目", null]];
summary.getRange("A5:H5").format = {
  fill: colors.paleBlue,
  font: { name: fontFamily, size: 10, bold: true, color: colors.navy },
  verticalAlignment: "center",
  borders: { preset: "outside", style: "thin", color: colors.line },
};
summary.getRange("D5").formulas = [["=MAX(O15:O19)"]];
summary.getRange("F5").formulas = [["=MAX(D15:D19)"]];
summary.getRange("H5").formulas = [["=INDEX(C15:C19,MATCH(MAX(O15:O19),O15:O19,0))"]];
summary.getRange("D5").format.numberFormat = "0.0%";
summary.getRange("F5:H5").format.numberFormat = "#,##0";
summary.getRange("A7:H7").values = [["结论摘要", null, null, null, null, null, null, null]];
summary.getRange("A7:H7").format = { fill: colors.navy, font: { name: fontFamily, size: 10, bold: true, color: colors.white } };
summary.getRange("A8:H11").values = [
  ["1", "去年延续基线综合相似度最高，说明 2026 计划在条目规模与计划模板上延续 2025 的惯性较强。", null, null, null, null, null, null],
  ["2", "高级模型没有超过基线。主要原因是 2023–2024 合作品类全部缺失，2025 年计划条目数又发生结构性跃升。", null, null, null, null, null, null],
  ["3", "推荐结果仍有较多合同/合作品类低置信度映射，必须在人工作业台复核后再发布。", null, null, null, null, null, null],
  ["4", "新增项目按 2% 情景上浮进入融合模型，因项目表缺少开竣工时间、状态和合同额，该部分只作为低置信度候选。", null, null, null, null, null, null],
];
summary.getRange("A8:A11").format.font = { name: fontFamily, size: 10, bold: true, color: colors.orange };
summary.getRange("B8:H11").format.font = { name: fontFamily, size: 10, color: colors.ink };
summary.getRange("B8:H11").format.wrapText = true;
summary.getRange("A8:H11").format.rowHeight = 27;

const comparisonColumns = ["排名", "模型", "预测条目数", "实际条目数", "匹配条目数", "精确率", "召回率", "条目F1", "匹配字段相似度", "金额准确度", "金额SMAPE", "计划开始时间MAE（天）", "时间准确度", "条目规模准确度", "综合相似度"];
summary.getRange("A13:O13").values = [["2026 年盲测模型对比", null, null, null, null, null, null, null, null, null, null, null, null, null, null]];
summary.getRange("A13:O13").format = { fill: colors.blue, font: { name: fontFamily, size: 10, bold: true, color: colors.white } };
summary.getRange("A14:O14").values = [comparisonColumns];
styleHeader(summary.getRange("A14:O14"));
const comparisonRows = comparison.map((row) => comparisonColumns.map((key) => key === "综合相似度" ? null : row[key]));
summary.getRange("A15:O19").values = comparisonRows;
for (let row = 15; row <= 19; row += 1) {
  summary.getRange(`O${row}`).formulas = [[`=0.50*H${row}+0.20*I${row}+0.15*J${row}+0.10*M${row}+0.05*N${row}`]];
}
summary.getRange("A15:O19").format.font = { name: fontFamily, size: 10, color: colors.ink };
summary.getRange("F15:K19").format.numberFormat = "0.0%";
summary.getRange("M15:O19").format.numberFormat = "0.0%";
summary.getRange("C15:E19").format.numberFormat = "#,##0";
summary.getRange("L15:L19").format.numberFormat = "0.0";
summary.getRange("A14:O19").format.borders = { preset: "outside", style: "thin", color: colors.line };
summary.getRange("O15:O19").conditionalFormats.add("colorScale", { colors: [colors.paleRed, "#FFF2CC", colors.paleTeal], thresholds: ["min", { type: "percentile", value: 50 }, "max"] });

summary.getRange("Q14:T19").values = [["模型", "综合相似度", "条目F1", "金额准确度"], ...comparison.map((row, idx) => [row["模型"], null, row["条目F1"], row["金额准确度"]])];
for (let idx = 0; idx < comparison.length; idx += 1) summary.getRange(`R${15 + idx}`).formulas = [[`=O${15 + idx}`]];
summary.getRange("Q14:T19").format.font = { name: fontFamily, size: 9, color: colors.ink };
summary.getRange("R15:T19").format.numberFormat = "0.0%";
const scoreChart = summary.charts.add("bar", summary.getRange("Q14:T19"));
scoreChart.title = "模型相似度对比";
scoreChart.titleTextStyle.typeface = fontFamily;
scoreChart.legend = { position: "top", textStyle: { typeface: fontFamily } };
scoreChart.xAxis = { axisType: "textAxis", textStyle: { typeface: fontFamily, fontSize: 9 } };
scoreChart.yAxis = { numberFormatCode: "0%", numberFormatSourceLinked: false, textStyle: { typeface: fontFamily, fontSize: 9 } };
scoreChart.setPosition("Q3", "X12");

summary.getRange("Q22:S27").values = [["模型", "预测条目数", "实际条目数"], ...comparison.map((row) => [row["模型"], row["预测条目数"], row["实际条目数"]])];
summary.getRange("Q22:S27").format.font = { name: fontFamily, size: 9, color: colors.ink };
const countChart = summary.charts.add("bar", summary.getRange("Q22:S27"));
countChart.title = "预测与实际条目数";
countChart.titleTextStyle.typeface = fontFamily;
countChart.legend = { position: "top", textStyle: { typeface: fontFamily } };
countChart.xAxis = { axisType: "textAxis", textStyle: { typeface: fontFamily, fontSize: 9 } };
countChart.yAxis = { numberFormatCode: "#,##0", numberFormatSourceLinked: false, textStyle: { typeface: fontFamily, fontSize: 9 } };
countChart.setPosition("Q13", "X28");

for (const [column, width] of Object.entries({1: 6, 2: 22, 3: 13, 4: 13, 5: 13, 6: 11, 7: 11, 8: 11, 9: 15, 10: 12, 11: 12, 12: 17, 13: 12, 14: 14, 15: 13, 17: 22, 18: 14, 19: 14, 20: 14})) setColumnWidth(summary, Number(column), width);
summary.freezePanes.freezeRows(14);

const predictionColumns = [
  "模型", "预测计划编号", "预测条目编号", "组织机构", "计划名称", "计划模式", "计划年份", "合作品类", "采购品类", "采购类型", "采购方式",
  "标准合同一级科目", "标准合同二级科目", "标准合同名称", "标准合同编号", "含税概算金额（万）", "计划采购时间", "计划采购完成时间", "区域", "承办单位",
  "资源/采购内容", "一级分类", "二级分类", "预测概率", "置信度", "预测来源", "历史出现年份", "历史样本数", "当前项目池数量", "合作品类映射分", "合同映射分",
  "是否新增项目情景", "需人工复核", "复核原因",
];
const predictionWidths = {1: 16, 2: 16, 3: 20, 4: 28, 5: 48, 6: 12, 7: 10, 8: 46, 9: 12, 10: 12, 11: 12, 12: 22, 13: 24, 14: 30, 15: 16, 16: 18, 17: 14, 18: 14, 19: 20, 20: 28, 21: 28, 22: 22, 23: 22, 24: 12, 25: 10, 26: 16, 27: 18, 28: 12, 29: 14, 30: 14, 31: 12, 32: 14, 33: 12, 34: 30};
addDataSheet({
  sheet: recommendation,
  title: "2026 年推荐集采计划预测",
  subtitle: `推荐模型：${data.metadata.recommended_model}；低置信度字典映射需人工复核后发布`,
  records: data.recommended,
  columns: predictionColumns,
  tableName: "RecommendedForecastTable",
  widths: predictionWidths,
  dateColumns: ["计划采购时间", "计划采购完成时间"],
  percentColumns: ["预测概率", "合作品类映射分", "合同映射分"],
  numberColumns: ["含税概算金额（万）"],
  freezeColumns: 5,
});
const recommendationReviewCol = excelColumn(predictionColumns.indexOf("需人工复核") + 1);
recommendation.getRange(`${recommendationReviewCol}6:${recommendationReviewCol}${data.recommended.length + 5}`).conditionalFormats.add("containsText", { text: "是", format: { fill: colors.paleRed, font: { bold: true, color: colors.red } } });

addDataSheet({
  sheet: allPredictions,
  title: "2026 年全部模型预测",
  subtitle: "支持按模型筛选或并列比较；同一计划名称下可包含多个计划条目",
  records: data.all_predictions,
  columns: predictionColumns,
  tableName: "AllForecastTable",
  widths: predictionWidths,
  dateColumns: ["计划采购时间", "计划采购完成时间"],
  percentColumns: ["预测概率", "合作品类映射分", "合同映射分"],
  numberColumns: ["含税概算金额（万）"],
  freezeColumns: 5,
});

const actualColumns = ["实际条目序号", "组织机构", "计划名称", "计划模式", "计划年份", "合作品类", "采购品类", "原始采购方式/类型", "含税概算金额（万）", "计划采购时间", "计划采购完成时间", "区域", "承办单位", "资源/采购内容", "一级分类", "二级分类"];
addDataSheet({
  sheet: actual,
  title: "2026 年真实集采计划",
  subtitle: "仅用于盲测评分；未参与 2026 预测生成或模型调参",
  records: data.actual,
  columns: actualColumns,
  tableName: "Actual2026Table",
  widths: {1: 12, 2: 28, 3: 50, 4: 13, 5: 10, 6: 48, 7: 12, 8: 16, 9: 18, 10: 14, 11: 14, 12: 22, 13: 28, 14: 28, 15: 22, 16: 22},
  dateColumns: ["计划采购时间", "计划采购完成时间"],
  numberColumns: ["含税概算金额（万）"],
  freezeColumns: 3,
});

const matchColumns = ["模型", "预测条目编号", "预测计划名称", "预测采购内容", "实际计划名称", "实际采购内容", "采购品类", "预测区域", "实际区域", "预测金额（万）", "实际金额（万）", "预测开始时间", "实际开始时间", "匹配得分", "内容相似度", "组织相似度", "区域相似度", "采购类型一致", "采购方式一致", "金额相似度", "开始时间差（天）"];
addDataSheet({
  sheet: matchDetail,
  title: "预测与真实计划一对一匹配明细",
  subtitle: "匹配阈值 0.58；同一预测和实际条目最多各匹配一次，未匹配条目计入精确率/召回率",
  records: data.match_detail,
  columns: matchColumns,
  tableName: "MatchDetailTable",
  widths: {1: 16, 2: 20, 3: 48, 4: 28, 5: 48, 6: 28, 7: 12, 8: 20, 9: 20, 10: 16, 11: 16, 12: 14, 13: 14, 14: 12, 15: 12, 16: 12, 17: 12, 18: 12, 19: 12, 20: 12, 21: 16},
  dateColumns: ["预测开始时间", "实际开始时间"],
  percentColumns: ["匹配得分", "内容相似度", "组织相似度", "区域相似度", "采购类型一致", "采购方式一致", "金额相似度"],
  numberColumns: ["预测金额（万）", "实际金额（万）"],
  freezeColumns: 4,
});

const backtestColumns = ["回测年度", "模型", "预测条目数", "实际条目数", "匹配条目数", "精确率", "召回率", "条目F1", "匹配字段相似度", "金额准确度", "金额SMAPE", "计划开始时间MAE（天）", "时间准确度", "条目规模准确度", "综合相似度"];
addDataSheet({
  sheet: backtest,
  title: "历史滚动回测",
  subtitle: "2024 回测使用 2023 历史；2025 回测使用 2023–2024 历史。树模型在样本不足时回退到指数权重分数。",
  records: data.backtest,
  columns: backtestColumns,
  tableName: "BacktestTable",
  widths: {1: 12, 2: 18, 3: 14, 4: 14, 5: 14, 6: 12, 7: 12, 8: 12, 9: 16, 10: 12, 11: 12, 12: 19, 13: 12, 14: 15, 15: 13},
  percentColumns: ["精确率", "召回率", "条目F1", "匹配字段相似度", "金额准确度", "金额SMAPE", "时间准确度", "条目规模准确度", "综合相似度"],
  freezeColumns: 2,
});

const qualityColumns = ["数据集", "记录数", "合作品类缺失率", "资源/采购内容缺失率", "金额缺失率", "开始时间缺失率", "完成时间缺失率", "说明"];
addDataSheet({
  sheet: quality,
  title: "输入数据质量",
  subtitle: "缺失率按原始字段口径计算；字典映射会补充输出，但不会改变原始数据质量判断",
  records: data.data_quality,
  columns: qualityColumns,
  tableName: "DataQualityTable",
  widths: {1: 22, 2: 14, 3: 18, 4: 20, 5: 14, 6: 16, 7: 16, 8: 34},
  percentColumns: ["合作品类缺失率", "资源/采购内容缺失率", "金额缺失率", "开始时间缺失率", "完成时间缺失率"],
  freezeColumns: 1,
});

readme.tabColor = "#A5A5A5";
styleTitle(readme, "模型、评分与使用说明", "用于竞赛演示、模型评审和后续工程化落地", "H");
readme.getRange("A5:H5").values = [["模型", "定位", "候选生成", "金额与时间", "适用性", "局限", "是否可选", "备注"]];
styleHeader(readme.getRange("A5:H5"));
readme.getRange("A6:H10").values = [
  ["去年延续基线", "可解释基准", "直接延续 2025 非租赁计划条目", "金额沿用、日期顺延一年", "历史惯性强且字段迁移时", "不能主动识别新需求", "是", "本次盲测排名第一"],
  ["指数加权模型", "近期历史权重", "2025/2024/2023 权重 60%/30%/10%", "加权历史中位数", "稳定重复采购", "结构突变时召回偏低", "是", "强调近期样本"],
  ["随机森林模型", "非线性分类", "袋装回归树预测候选发生概率", "实体中位数与品类中位数收缩", "混合数值特征和噪声数据", "仅两期监督样本，泛化有限", "是", "固定随机种子"],
  ["梯度提升树模型", "误差迭代修正", "浅树逐步拟合候选发生残差", "阻尼趋势金额与历史周期", "捕捉非线性组合", "对字段漂移敏感", "是", "未使用 2026 真值调参"],
  ["加权融合模型", "多模型集成", "指数、趋势、随机森林、提升树加权排序", "指数/趋势组合", "降低单模型偏差", "受共同数据缺失影响", "是", "含 2% 新增项目情景"],
];
readme.getRange("A6:H10").format = { font: { name: fontFamily, size: 10, color: colors.ink }, wrapText: true, verticalAlignment: "top" };
readme.getRange("A6:H10").format.rowHeight = 42;

readme.getRange("A12:H12").values = [["相似度口径", null, null, null, null, null, null, null]];
readme.getRange("A12:H12").format = { fill: colors.blue, font: { name: fontFamily, size: 10, bold: true, color: colors.white } };
readme.getRange("A13:B20").values = [
  ["一对一匹配", "采购品类相同后，按内容、组织、区域、采购类型、采购方式、时间和金额做加权匹配；匹配阈值为 0.58。"],
  ["条目F1", "精确率与召回率的调和平均，未匹配预测和未匹配实际均会扣分。"],
  ["匹配字段相似度", "已匹配条目在内容、组织、区域、采购类型和采购方式上的平均一致程度。"],
  ["金额准确度", "1 减匹配条目的平均对称百分比误差，负值按 0 计。"],
  ["时间准确度", "计划开始时间差在 180 天内线性折算，超过 180 天记 0。"],
  ["条目规模准确度", "1 减预测条目数与实际条目数的相对差。"],
  ["综合相似度", "50%×条目F1 + 20%×字段相似度 + 15%×金额准确度 + 10%×时间准确度 + 5%×条目规模准确度。"],
  ["防泄漏", "2026 真实计划、2026 招标和采购记录均不参与预测生成；仅在预测完成后评分。"],
];
readme.getRange("A13:A20").format.font = { name: fontFamily, size: 10, bold: true, color: colors.navy };
readme.getRange("B13:H20").format = { font: { name: fontFamily, size: 10, color: colors.ink }, wrapText: true };
readme.getRange("A13:H20").format.rowHeight = 32;

readme.getRange("A22:H22").values = [["字段映射和限制", null, null, null, null, null, null, null]];
readme.getRange("A22:H22").format = { fill: colors.blue, font: { name: fontFamily, size: 10, bold: true, color: colors.white } };
readme.getRange("A23:B28").values = [
  ["采购类型/方式拆分", "历史计划把“区域联采”和“竞价采购”等混在同一列。优先用招采编号关联交易表拆分；未关联时按年度集采默认规则映射。"],
  ["合作品类", "优先使用原值，其次按历史招采三级合作品类和合作品类字典做相似匹配。低于 0.55 标记人工复核。"],
  ["标准合同", "按采购品类限定字典范围，再用资源名称和合作品类进行字符串相似映射。低于 0.42 标记人工复核。"],
  ["新增项目", "项目表缺少开竣工时间、项目状态、合同额和区域，无法可靠判断 2026 新接项目。融合模型仅设置 2% 低置信度情景上浮。"],
  ["租赁品类", "按题设，所有 2026 预测均排除“租赁”采购品类；历史租赁只用于理解历史结构。"],
  ["结果用途", "推荐结果是候选计划，不应直接发布。先复核低置信度字典映射、异常金额和日期，再进入审批。"],
];
readme.getRange("A23:A28").format.font = { name: fontFamily, size: 10, bold: true, color: colors.navy };
readme.getRange("B23:H28").format = { font: { name: fontFamily, size: 10, color: colors.ink }, wrapText: true };
readme.getRange("A23:H28").format.rowHeight = 38;

readme.getRange("A30:H30").values = [["数据来源", null, null, null, null, null, null, null]];
readme.getRange("A30:H30").format = { fill: colors.blue, font: { name: fontFamily, size: 10, bold: true, color: colors.white } };
const sources = [
  "中国建筑一局（集团）有限公司-集采计划详情23年.xlsx",
  "中国建筑一局（集团）有限公司-集采计划详情24年.xlsx",
  "中国建筑一局（集团）有限公司-集采计划详情25年.xlsx",
  "中国建筑一局（集团）有限公司-集采计划详情26年.xlsx（仅盲测）",
  "运营后台_招标列表导出_2026-09-11_17_24_00_6069.xlsx（预测截断至 2025-12-31）",
  "运营后台_采购列表导出_2026-09-11_17_26_39_8747.xlsx（预测截断至 2025-12-31）",
  "项目数据.csv、区域数据.xlsx、合作品类.xlsx、计划中所需合同的枚举值.csv",
];
readme.getRange("A31:H37").values = sources.map((source, idx) => [idx + 1, source, null, null, null, null, null, null]);
readme.getRange("A31:A37").format.font = { name: fontFamily, size: 10, bold: true, color: colors.orange };
readme.getRange("B31:H37").format = { font: { name: fontFamily, size: 10, color: colors.ink }, wrapText: true };
readme.getRange("A31:H37").format.rowHeight = 25;
for (const [column, width] of Object.entries({1: 18, 2: 48, 3: 28, 4: 28, 5: 28, 6: 32, 7: 12, 8: 28})) setColumnWidth(readme, Number(column), width);

wb.recalculate();
await fs.mkdir(outputDir, { recursive: true });
await fs.mkdir(previewDir, { recursive: true });

const inspections = {};
inspections.summary = (await wb.inspect({ kind: "table", range: "模型对比!A1:O19", include: "values,formulas", tableMaxRows: 25, tableMaxCols: 16 })).ndjson;
inspections.errors = (await wb.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!", options: { useRegex: true, maxResults: 300 }, summary: "final formula error scan" })).ndjson;

const renderRanges = {
  "模型对比": "A1:X28",
  "推荐预测": "A1:P20",
  "全部模型预测": "A1:P18",
  "2026真实计划": "A1:P18",
  "匹配明细": "A1:U18",
  "历史回测": "A1:O18",
  "数据质量": "A1:H14",
  "模型说明": "A1:H37",
};
for (const [sheetName, range] of Object.entries(renderRanges)) {
  const preview = await wb.render({ sheetName, range, scale: 1, format: "png" });
  await fs.writeFile(path.join(previewDir, `${sheetName}.png`), new Uint8Array(await preview.arrayBuffer()));
}

const exported = await SpreadsheetFile.exportXlsx(wb);
await exported.save(outputPath);
await fs.writeFile(path.join(previewDir, "verification.json"), JSON.stringify(inspections, null, 2), "utf8");
console.log(JSON.stringify({ outputPath, sheets: Object.keys(renderRanges), summaryInspection: inspections.summary, errorScan: inspections.errors }, null, 2));
