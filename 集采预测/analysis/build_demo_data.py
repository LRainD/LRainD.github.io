from __future__ import annotations

import json
import math
from pathlib import Path

import numpy as np
import pandas as pd

from forecast_pipeline import (
    FEATURE_NAMES,
    SimpleGradientBoosting,
    SimpleRandomForest,
    add_procurement_dimensions,
    candidate_universe,
    feature_row,
    load_plan_year,
    load_transactions,
    model_training_data,
    prepare_feature_context,
    project_exposure,
    rank_scale,
    score_candidates,
)


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "analysis" / "generated" / "forecast_results.json"
TARGET = ROOT / "前端" / "demo-data.js"


def compact_records(frame: pd.DataFrame, columns: list[str]) -> list[dict]:
    result = []
    for row in frame[columns].to_dict("records"):
        result.append({key: (None if pd.isna(value) else value) for key, value in row.items()})
    return result


def main() -> None:
    payload = json.loads(SOURCE.read_text(encoding="utf-8"))
    predictions = pd.DataFrame(payload["all_predictions"])
    matches = pd.DataFrame(payload["match_detail"])
    comparison = pd.DataFrame(payload["comparison"])
    quality = pd.DataFrame(payload["data_quality"])

    prediction_columns = [
        "模型",
        "预测计划编号",
        "预测条目编号",
        "组织机构",
        "计划名称",
        "计划模式",
        "计划年份",
        "合作品类",
        "采购品类",
        "采购类型",
        "采购方式",
        "标准合同一级科目",
        "标准合同二级科目",
        "标准合同名称",
        "标准合同编号",
        "含税概算金额（万）",
        "计划采购时间",
        "计划采购完成时间",
        "区域",
        "承办单位",
        "资源/采购内容",
        "一级分类",
        "二级分类",
        "预测概率",
        "置信度",
        "预测来源",
        "历史出现年份",
        "历史样本数",
        "当前项目池数量",
        "合作品类映射分",
        "合同映射分",
        "是否新增项目情景",
        "需人工复核",
        "复核原因",
        "实体键",
    ]
    match_columns = [
        "模型",
        "预测条目编号",
        "预测计划名称",
        "预测采购内容",
        "实际计划名称",
        "实际采购内容",
        "采购品类",
        "预测区域",
        "实际区域",
        "预测金额（万）",
        "实际金额（万）",
        "预测开始时间",
        "实际开始时间",
        "匹配得分",
        "内容相似度",
        "组织相似度",
        "区域相似度",
        "采购类型一致",
        "采购方式一致",
        "金额相似度",
        "开始时间差（天）",
    ]

    actual_columns = [
        "实际条目序号",
        "组织机构",
        "计划名称",
        "计划模式",
        "计划年份",
        "合作品类",
        "采购品类",
        "原始采购方式/类型",
        "含税概算金额（万）",
        "计划采购时间",
        "计划采购完成时间",
        "区域",
        "承办单位",
        "资源/采购内容",
        "一级分类",
        "二级分类",
    ]

    category_summary = (
        predictions.groupby(["模型", "采购品类"], as_index=False)
        .agg(条目数=("采购品类", "size"), 概算金额万=("含税概算金额（万）", "sum"))
    )
    review_summary = (
        predictions.groupby("模型", as_index=False)
        .agg(
            需复核条目=("需人工复核", lambda values: int((values == "是").sum())),
            高置信度条目=("置信度", lambda values: int((values == "高").sum())),
            计划数=("计划名称", "nunique"),
            预测金额万=("含税概算金额（万）", "sum"),
        )
    )
    demo_predictions = (
        predictions.sort_values(["模型", "采购品类", "预测概率"], ascending=[True, True, False])
        .groupby(["模型", "采购品类"], as_index=False, group_keys=False)
        .head(80)
        .sort_values(["模型", "预测概率"], ascending=[True, False])
        .groupby("模型", as_index=False, group_keys=False)
        .head(300)
    )
    demo_matches = (
        matches.sort_values(["模型", "匹配得分"], ascending=[True, False])
        .groupby("模型", as_index=False, group_keys=False)
        .head(60)
    )

    actual = pd.DataFrame(payload["actual"])
    actual_categories = (
        actual.groupby("采购品类", as_index=False)
        .agg(条目数=("采购品类", "size"), 概算金额万=("含税概算金额（万）", "sum"))
    )

    month_summary = []
    for model_name, frame in predictions.groupby("模型"):
        month = pd.to_datetime(frame["计划采购时间"], errors="coerce").dt.month
        counts = month.value_counts().to_dict()
        month_summary.extend(
            {"模型": model_name, "类型": "预测", "月份": m, "条目数": int(counts.get(m, 0))}
            for m in range(1, 13)
        )
    actual_month = pd.to_datetime(actual["计划采购时间"], errors="coerce").dt.month.value_counts().to_dict()
    month_summary.extend(
        {"模型": "2026实际", "类型": "实际", "月份": m, "条目数": int(actual_month.get(m, 0))}
        for m in range(1, 13)
    )

    plans = pd.concat([load_plan_year(year) for year in (2023, 2024, 2025, 2026)], ignore_index=True)
    yearly_summary = []
    for year, frame in plans.groupby("year"):
        yearly_summary.append(
            {
                "年份": int(year),
                "计划数": int(frame["plan_name"].nunique()),
                "条目数": int(len(frame)),
                "概算金额万": round(float(frame["amount"].fillna(0).sum()), 2),
                "用途": "训练/回测" if year < 2026 else "盲测真实值",
            }
        )

    data_sources = [
        {"数据源": "2023年集采计划", "记录数": 612, "字段数": 24, "作用": "建立计划条目与历史特征"},
        {"数据源": "2024年集采计划", "记录数": 527, "字段数": 24, "作用": "时间回测与历史特征"},
        {"数据源": "2025年集采计划", "记录数": 1592, "字段数": 24, "作用": "2026年预测的主要近期依据"},
        {"数据源": "历史招标数据", "记录数": 69589, "字段数": 56, "作用": "补充采购需求、组织、区域和方式"},
        {"数据源": "历史采购数据", "记录数": 20045, "字段数": 62, "作用": "补充集采后续采购行为"},
        {"数据源": "项目数据", "记录数": 10234, "字段数": 6, "作用": "构造组织项目暴露度与新增项目情景"},
        {"数据源": "区域字典", "记录数": 57, "字段数": 14, "作用": "统一大区、省市区口径"},
        {"数据源": "合作品类字典", "记录数": 1502, "字段数": 4, "作用": "合作品类三级映射"},
        {"数据源": "标准合同科目", "记录数": 2000, "字段数": 40, "作用": "标准合同名称与编码映射"},
    ]

    # Rebuild the feature matrix with the same deterministic models so the
    # browser can visualize real intermediate values instead of mock numbers.
    transactions = load_transactions()
    plans = add_procurement_dimensions(plans, transactions)
    project_counts, project_norm = project_exposure()
    historical = plans[plans["year"] <= 2025].copy()
    transactions = transactions[transactions["year"] <= 2025].copy()
    context = prepare_feature_context(historical, transactions, project_norm)
    candidates = candidate_universe(historical, transactions, 2026)
    matrix = np.asarray([feature_row(row, 2026, context) for _, row in candidates.iterrows()], dtype=float)
    train_x, train_y = model_training_data(historical, transactions, context, 2026)
    forest = SimpleRandomForest().fit(train_x, train_y)
    boosting = SimpleGradientBoosting().fit(train_x, train_y)
    scores = score_candidates(candidates, matrix, forest, boosting)
    candidate_index = {str(key): i for i, key in enumerate(candidates["entity_key"])}

    present1, present2, present3 = matrix[:, 3], matrix[:, 4], matrix[:, 5]
    ewma_parts = {
        "2025年出现": 0.46 * present1,
        "2024年出现": 0.20 * present2,
        "2023年出现": 0.09 * present3,
        "品类需求热度": 0.08 * np.tanh(matrix[:, 7] / 3),
        "组织需求热度": 0.06 * np.tanh(matrix[:, 9] / 3),
        "上年招采活跃度": 0.05 * np.tanh(matrix[:, 17] / 4),
        "同类条目招采活跃度": 0.04 * np.tanh(matrix[:, 18] / 2),
        "项目暴露度": 0.02 * matrix[:, 19],
    }
    ensemble_components = {
        "指数加权": (rank_scale(scores["ewma"]), 0.22),
        "阻尼趋势": (scores["trend"], 0.18),
        "随机森林": (rank_scale(scores["random_forest"]), 0.25),
        "梯度提升": (rank_scale(scores["gradient_boosting"]), 0.25),
        "招采活跃度": (rank_scale(matrix[:, 18]), 0.06),
        "项目暴露度": (matrix[:, 19], 0.04),
    }
    model_key = {
        "去年延续基线": "last_year",
        "指数加权模型": "ewma",
        "随机森林模型": "random_forest",
        "梯度提升树模型": "gradient_boosting",
        "加权融合模型": "ensemble",
    }
    visual_examples = []
    for model_name, frame in demo_predictions.groupby("模型"):
        for row in frame.head(8).to_dict("records"):
            idx = candidate_index.get(str(row.get("实体键", "")))
            if idx is None:
                continue
            features = {name: round(float(value), 4) for name, value in zip(FEATURE_NAMES, matrix[idx])}
            tree_votes = [round(float(tree.predict(matrix[idx : idx + 1])[0]), 4) for tree in forest.trees]
            gb_value = float(boosting.base)
            gb_path = [{"轮次": 0, "概率": round(gb_value, 4)}]
            for turn, tree in enumerate(boosting.trees, start=1):
                gb_value += boosting.learning_rate * float(tree.predict(matrix[idx : idx + 1])[0])
                if turn % 5 == 0 or turn == len(boosting.trees):
                    gb_path.append({"轮次": turn, "概率": round(max(0.0, min(gb_value, 1.0)), 4)})
            prior = historical[historical["entity_key"] == row.get("实体键")].sort_values("year").tail(1)
            prior_record = {}
            if not prior.empty:
                latest = prior.iloc[0]
                prior_record = {
                    "年份": int(latest["year"]),
                    "计划名称": str(latest["plan_name"]),
                    "金额万": None if pd.isna(latest["amount"]) else round(float(latest["amount"]), 2),
                    "开始时间": None if pd.isna(latest["plan_start"]) else latest["plan_start"].strftime("%Y-%m-%d"),
                }
            key = model_key[model_name]
            visual_examples.append(
                {
                    "模型": model_name,
                    "预测条目编号": row["预测条目编号"],
                    "采购内容": row["资源/采购内容"],
                    "采购品类": row["采购品类"],
                    "组织机构": row["组织机构"],
                    "区域": row["区域"],
                    "最终概率": round(float(row["预测概率"]), 4),
                    "输出金额万": round(float(row["含税概算金额（万）"]), 2),
                    "输出开始时间": row["计划采购时间"],
                    "输出完成时间": row["计划采购完成时间"],
                    "历史样本数": int(row["历史样本数"]),
                    "历史出现年份": row["历史出现年份"],
                    "上年模板": prior_record,
                    "特征": features,
                    "指数加权贡献": [
                        {"因素": name, "贡献": round(float(values[idx]), 4)} for name, values in ewma_parts.items()
                    ],
                    "随机森林树投票": tree_votes,
                    "梯度提升路径": gb_path,
                    "融合分量": [
                        {
                            "分量": name,
                            "原始分": round(float(values[idx]), 4),
                            "权重": weight,
                            "加权贡献": round(float(values[idx] * weight), 4),
                        }
                        for name, (values, weight) in ensemble_components.items()
                    ],
                    "模型内部分": round(float(scores[key][idx]), 4) if key != "last_year" else 0.7,
                }
            )

    demo = {
        "meta": payload["metadata"],
        "models": comparison.to_dict("records"),
        "modelExtra": review_summary.to_dict("records"),
        "categories": category_summary.to_dict("records"),
        "actualCategories": actual_categories.to_dict("records"),
        "months": month_summary,
        "yearly": yearly_summary,
        "sources": data_sources,
        "predictions": compact_records(demo_predictions, prediction_columns),
        "matches": compact_records(demo_matches, match_columns),
        "actual": compact_records(actual, actual_columns),
        "quality": quality.to_dict("records"),
        "backtest": payload["backtest"],
        "visualExamples": visual_examples,
    }
    content = "window.FORECAST_DEMO_DATA = " + json.dumps(demo, ensure_ascii=False, separators=(",", ":")) + ";\n"
    TARGET.write_text(content, encoding="utf-8")
    print(f"Wrote {TARGET} ({TARGET.stat().st_size / 1024 / 1024:.2f} MB)")


if __name__ == "__main__":
    main()
