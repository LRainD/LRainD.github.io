from __future__ import annotations

import json
import math
import random
import re
import warnings
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Iterable

import numpy as np
import pandas as pd


warnings.filterwarnings("ignore", message="Workbook contains no default style")

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "数据"
GENERATED_DIR = ROOT / "analysis" / "generated"
OUTPUT_DIR = ROOT / "outputs" / "20260913_集采计划预测"
RNG_SEED = 20260913

PROCUREMENT_CATEGORIES = ["物资", "设备", "专业服务", "专业分包", "劳务分包", "租赁"]
PROCUREMENT_TYPES = ["招标采购", "区域联采", "战略采购", "集中采购", "分散采购"]
PROCUREMENT_METHODS = ["公告招标", "邀约招标", "询比采购", "竞价采购", "谈判采购", "直接采购"]
MODEL_NAMES = {
    "last_year": "去年延续基线",
    "ewma": "指数加权模型",
    "trend": "阻尼趋势模型",
    "random_forest": "随机森林模型",
    "gradient_boosting": "梯度提升树模型",
    "ensemble": "加权融合模型",
}

PARENT_BY_PROCUREMENT = {
    "物资": "物资供应类",
    "设备": "设备供应类",
    "专业服务": "专业服务类",
    "专业分包": "专业分包类",
    "劳务分包": "劳务分包类",
    "租赁": "设备租赁类",
}

REGION_GROUPS = {
    "京津冀": {"北京", "天津", "河北", "雄安"},
    "华东": {"上海", "江苏", "浙江", "安徽", "福建", "江西", "山东"},
    "华南": {"广东", "广西", "海南"},
    "华中": {"河南", "湖北", "湖南"},
    "东北": {"辽宁", "吉林", "黑龙江", "内蒙古"},
    "西北": {"陕西", "甘肃", "青海", "宁夏", "新疆"},
    "西南": {"重庆", "四川", "云南", "贵州", "西藏"},
}

GENERIC_ITEM_TERMS = (
    "正式工程",
    "临建",
    "工程",
    "专业",
    "劳务",
    "分包",
    "采购",
    "供应",
    "服务",
    "材料",
    "设备",
    "综合",
    "其他",
    "类",
)


def read_csv(path: Path) -> pd.DataFrame:
    for encoding in ("utf-8-sig", "gb18030"):
        try:
            return pd.read_csv(path, encoding=encoding)
        except UnicodeDecodeError:
            continue
    return pd.read_csv(path)


def text(value: object) -> str:
    if value is None or pd.isna(value):
        return ""
    return str(value).strip()


def text_column(frame: pd.DataFrame, name: str) -> pd.Series:
    if name in frame.columns:
        return frame[name].map(text)
    return pd.Series("", index=frame.index, dtype="object")


def norm_text(value: object) -> str:
    value = text(value).lower()
    value = value.replace("（", "(").replace("）", ")")
    value = re.sub(r"[\s,，、/\\\-—_·.。:：;；()\[\]【】]+", "", value)
    return value


def norm_org(value: object) -> str:
    value = norm_text(value)
    replacements = (
        ("中国建筑一局集团有限公司", "一局"),
        ("中国建筑一局有限公司", "一局"),
        ("中建一局集团", "一局"),
        ("中建一局", "一局"),
        ("有限责任公司", ""),
        ("有限公司", ""),
        ("公司", ""),
    )
    for old, new in replacements:
        value = value.replace(old, new)
    return value


def item_family(value: object) -> str:
    base = norm_text(value)
    reduced = base
    for term in GENERIC_ITEM_TERMS:
        reduced = reduced.replace(term, "")
    return reduced if len(reduced) >= 2 else base


def ngrams(value: object, n: int = 2) -> set[str]:
    value = norm_text(value)
    if not value:
        return set()
    if len(value) <= n:
        return {value}
    return {value[i : i + n] for i in range(len(value) - n + 1)}


def dice_similarity(left: object, right: object) -> float:
    a, b = ngrams(left), ngrams(right)
    if not a or not b:
        return 0.0
    if norm_text(left) == norm_text(right):
        return 1.0
    return 2.0 * len(a & b) / (len(a) + len(b))


def region_tokens(value: object) -> set[str]:
    raw = text(value)
    if not raw:
        return set()
    if "全国" in raw:
        return {"全国"}
    tokens: set[str] = set()
    for label, members in REGION_GROUPS.items():
        if label in raw:
            tokens.update(members)
    provinces = [
        "北京", "天津", "河北", "山西", "内蒙古", "辽宁", "吉林", "黑龙江", "上海", "江苏", "浙江", "安徽",
        "福建", "江西", "山东", "河南", "湖北", "湖南", "广东", "广西", "海南", "重庆", "四川", "贵州", "云南",
        "西藏", "陕西", "甘肃", "青海", "宁夏", "新疆", "香港", "澳门", "台湾", "雄安",
    ]
    for province in provinces:
        if province in raw:
            tokens.add(province)
    if not tokens:
        tokens = {norm_text(x) for x in re.split(r"[,，、/]+", raw) if norm_text(x)}
    return tokens


def region_similarity(left: object, right: object) -> float:
    a, b = region_tokens(left), region_tokens(right)
    if not a or not b:
        return 0.0
    if "全国" in a or "全国" in b:
        return 0.55 if a != b else 1.0
    return len(a & b) / len(a | b)


def shift_year(date_value: object, years: int) -> pd.Timestamp | pd.NaT:
    date = pd.to_datetime(date_value, errors="coerce")
    if pd.isna(date):
        return pd.NaT
    try:
        return date.replace(year=date.year + years)
    except ValueError:
        return date.replace(year=date.year + years, day=28)


def day_offset(date_value: object, plan_year: int) -> float:
    date = pd.to_datetime(date_value, errors="coerce")
    if pd.isna(date):
        return np.nan
    return float((date.normalize() - pd.Timestamp(plan_year, 1, 1)).days)


def replace_year(value: object, target_year: int) -> str:
    value = text(value)
    if not value:
        return value
    return re.sub(r"20(?:2[3-9]|3\d)", str(target_year), value)


def plan_path(year: int) -> Path:
    return DATA_DIR / f"中国建筑一局（集团）有限公司-集采计划详情{str(year)[-2:]}年.xlsx"


def load_plan_year(year: int) -> pd.DataFrame:
    rows: list[pd.DataFrame] = []
    path = plan_path(year)
    for sheet_name in pd.ExcelFile(path).sheet_names:
        raw = pd.read_excel(path, sheet_name=sheet_name)
        if raw.empty:
            continue
        out = pd.DataFrame(index=raw.index)
        out["year"] = year
        out["source_sheet"] = sheet_name
        out["organization"] = text_column(raw, "组织机构")
        out["plan_name"] = text_column(raw, "计划名称")
        out["plan_status"] = text_column(raw, "计划状态")
        out["change_status"] = text_column(raw, "变更状态")
        out["cooperation_category"] = text_column(raw, "合作品类")
        if sheet_name == "分包":
            out["procurement_category"] = text_column(raw, "分包方式")
            out["item_l1"] = text_column(raw, "采购内容")
            out["item_l2"] = text_column(raw, "采购内容")
            out["item_name"] = text_column(raw, "分包资源名称")
            out.loc[out["item_name"].eq(""), "item_name"] = out["item_l2"]
        elif sheet_name == "物资":
            out["procurement_category"] = text_column(raw, "招标/采购品类")
            out["item_l1"] = text_column(raw, "一级类别")
            out["item_l2"] = text_column(raw, "二级类别")
            out["item_name"] = text_column(raw, "物资资源名称")
            out.loc[out["item_name"].eq(""), "item_name"] = out["item_l2"]
            out.loc[out["item_name"].eq(""), "item_name"] = out["item_l1"]
        else:
            out["procurement_category"] = text_column(raw, "招标/采购品类")
            out["item_l1"] = text_column(raw, "采购内容分类")
            out["item_l2"] = text_column(raw, "分类/分部")
            out["item_name"] = text_column(raw, "采购内容详情")
            cooperation_tail = out["cooperation_category"].str.split("-").str[-1].fillna("")
            out.loc[out["item_name"].eq(""), "item_name"] = cooperation_tail
            out.loc[out["item_name"].eq(""), "item_name"] = out["item_l2"]
        out["raw_procurement_mode"] = text_column(raw, "采购方式")
        out["resource_class"] = text_column(raw, "资源类别")
        out["amount"] = pd.to_numeric(raw.get("含税概算金额（万）"), errors="coerce")
        out["plan_start"] = pd.to_datetime(raw.get("计划招标/采购开始时间"), errors="coerce")
        out["plan_end"] = pd.to_datetime(raw.get("计划招标/采购完成时间"), errors="coerce")
        out["undertaker"] = text_column(raw, "承办单位")
        out["region"] = text_column(raw, "区域")
        out["remark"] = text_column(raw, "备注")
        out["procurement_ids"] = text_column(raw, "招标/采购编号")
        rows.append(out)
    result = pd.concat(rows, ignore_index=True)
    result = result[result["procurement_category"].isin(PROCUREMENT_CATEGORIES)].copy()
    result = result[result["item_name"].ne("")].copy()
    result["org_key"] = result["undertaker"].where(result["undertaker"].ne(""), result["organization"]).map(norm_org)
    result["region_key"] = result["region"].map(norm_text)
    result["item_key"] = result["item_name"].map(item_family)
    result["entity_key"] = (
        result["org_key"] + "|" + result["region_key"] + "|" + result["procurement_category"] + "|" + result["item_key"]
    )
    result["start_offset"] = [day_offset(d, y) for d, y in zip(result["plan_start"], result["year"])]
    result["duration_days"] = (result["plan_end"] - result["plan_start"]).dt.days
    result["template_source"] = "历史集采计划"
    return result.reset_index(drop=True)


def load_transactions() -> pd.DataFrame:
    parts: list[pd.DataFrame] = []
    tender_path = DATA_DIR / "运营后台_招标列表导出_2026-09-11_17_24_00_6069.xlsx"
    tender = pd.read_excel(tender_path)
    t = pd.DataFrame(index=tender.index)
    t["record_id"] = tender["招标编号"].map(text)
    t["name"] = tender["招标名称"].map(text)
    t["organization"] = tender["组织机构"].map(text)
    t["project"] = tender["使用项目"].map(text)
    t["region"] = tender["区域"].map(text)
    t["raw_method"] = tender["招标方式"].map(text).replace({"公开招标": "公告招标", "邀请招标": "邀约招标"})
    t["procurement_type"] = "招标采购"
    t["coop_l1"] = tender["一级合作品类"].map(text)
    t["coop_l2"] = tender["二级合作品类"].map(text)
    t["coop_l3"] = tender["三级合作品类"].map(text)
    t["procurement_category"] = tender["招标品类"].map(text)
    t["amount"] = pd.to_numeric(tender["概算金额"], errors="coerce")
    t["created"] = pd.to_datetime(tender["创建时间"], errors="coerce")
    t["completed"] = pd.to_datetime(tender["完成时间"], errors="coerce")
    t["plan_type"] = tender["计划类型"].map(text)
    t["source"] = "招标"
    parts.append(t)

    purchase_path = DATA_DIR / "运营后台_采购列表导出_2026-09-11_17_26_39_8747.xlsx"
    purchase = pd.read_excel(purchase_path)
    p = pd.DataFrame(index=purchase.index)
    p["record_id"] = purchase["采购编号"].map(text)
    p["name"] = purchase["采购名称"].map(text)
    p["organization"] = purchase["组织机构"].map(text)
    p["project"] = purchase["使用项目"].map(text)
    p["region"] = purchase["区域"].map(text)
    p["raw_method"] = purchase["采购方式"].map(text)
    p["procurement_type"] = purchase["组织形式"].map(text)
    p["coop_l1"] = purchase["一级合作品类"].map(text)
    p["coop_l2"] = purchase["二级合作品类"].map(text)
    p["coop_l3"] = purchase["三级合作品类"].map(text)
    p["procurement_category"] = purchase["采购品类"].map(text)
    p["amount"] = pd.to_numeric(purchase["概算金额"], errors="coerce")
    p["created"] = pd.to_datetime(purchase["创建时间"], errors="coerce")
    p["completed"] = pd.to_datetime(purchase["完成时间"], errors="coerce")
    p["plan_type"] = purchase["计划类型"].map(text)
    p["source"] = "采购"
    parts.append(p)

    result = pd.concat(parts, ignore_index=True)
    result["year"] = result["created"].dt.year
    result["org_key"] = result["organization"].map(norm_org)
    result["region_key"] = result["region"].map(norm_text)
    result["item_name"] = result["coop_l3"].where(result["coop_l3"].ne(""), result["name"])
    result["item_key"] = result["item_name"].map(item_family)
    result["cooperation_category"] = result[["coop_l1", "coop_l2", "coop_l3"]].apply(
        lambda row: "-".join(v for v in row if v), axis=1
    )
    result["entity_key"] = (
        result["org_key"] + "|" + result["region_key"] + "|" + result["procurement_category"] + "|" + result["item_key"]
    )
    return result


def split_ids(value: object) -> list[str]:
    return [x for x in re.split(r"[\s,，、;/；]+", text(value)) if x]


def add_procurement_dimensions(plans: pd.DataFrame, transactions: pd.DataFrame) -> pd.DataFrame:
    lookup = transactions.drop_duplicates("record_id").set_index("record_id")[["procurement_type", "raw_method"]].to_dict("index")
    types: list[str] = []
    methods: list[str] = []
    sources: list[str] = []
    for _, row in plans.iterrows():
        matched = None
        for record_id in split_ids(row["procurement_ids"]):
            if record_id in lookup:
                matched = lookup[record_id]
                break
        raw = text(row["raw_procurement_mode"])
        if raw == "区域联采":
            ptype = "区域联采"
            method = matched["raw_method"] if matched else "公告招标"
            source = "计划类型+关联交易" if matched else "计划类型+默认招标方式"
        elif matched:
            ptype = text(matched["procurement_type"])
            method = text(matched["raw_method"])
            source = "关联交易"
        elif raw in PROCUREMENT_METHODS:
            ptype = "集中采购"
            method = raw
            source = "年度集采默认类型"
        elif raw in PROCUREMENT_TYPES:
            ptype = raw
            method = "公告招标" if raw in {"招标采购", "区域联采"} else "竞价采购"
            source = "计划原值+默认采购方式"
        else:
            ptype = "集中采购"
            method = "竞价采购"
            source = "默认映射"
        if ptype not in PROCUREMENT_TYPES:
            ptype = "集中采购"
        if method not in PROCUREMENT_METHODS:
            method = "竞价采购"
        types.append(ptype)
        methods.append(method)
        sources.append(source)
    result = plans.copy()
    result["procurement_type"] = types
    result["procurement_method"] = methods
    result["dimension_mapping_source"] = sources
    return result


def project_exposure() -> tuple[dict[str, int], dict[str, float]]:
    projects = read_csv(DATA_DIR / "项目数据.csv")
    projects["org_key"] = projects["所属组织"].map(norm_org)
    counts = projects.groupby("org_key").size().to_dict()
    max_count = max(counts.values()) if counts else 1
    normalized = {key: math.log1p(value) / math.log1p(max_count) for key, value in counts.items()}
    return counts, normalized


def build_category_catalog(transactions: pd.DataFrame, plans: pd.DataFrame) -> dict[str, list[tuple[str, str]]]:
    catalog: dict[str, dict[str, str]] = defaultdict(dict)
    usable = transactions[(transactions["year"] <= 2025) & transactions["coop_l3"].ne("")]
    for _, row in usable.drop_duplicates(["procurement_category", "coop_l3"]).iterrows():
        category = text(row["procurement_category"])
        full = text(row["cooperation_category"])
        if category in PROCUREMENT_CATEGORIES and full:
            catalog[category][norm_text(row["coop_l3"])] = full
    for _, row in plans[plans["cooperation_category"].ne("")].iterrows():
        category = text(row["procurement_category"])
        catalog[category][norm_text(row["item_name"])] = text(row["cooperation_category"])
    cooperation = pd.read_excel(DATA_DIR / "合作品类.xlsx")
    for _, row in cooperation.iterrows():
        full = "-".join(text(row.get(col)) for col in ("合作品类一级", "合作品类二级", "合作品类三级") if text(row.get(col)))
        if full:
            catalog["物资"][norm_text(row.get("合作品类三级"))] = full
    return {key: list(values.items()) for key, values in catalog.items()}


def load_contract_catalog() -> dict[str, list[dict[str, str]]]:
    frame = read_csv(DATA_DIR / "计划中所需合同的枚举值.csv")
    frame = frame.loc[:, ~frame.columns.astype(str).str.startswith("Unnamed:")]
    frame = frame.dropna(subset=["品类", "标准合同名称"])
    result: dict[str, list[dict[str, str]]] = defaultdict(list)
    for _, row in frame.iterrows():
        category = text(row["品类"])
        result[category].append(
            {
                "name": text(row["标准合同名称"]),
                "code": text(row["标准合同编号"]),
                "l1": text(row["标准合同一级科目"]),
                "l2": text(row["标准合同二级科目"]),
            }
        )
    return result


def best_cooperation(item: str, procurement_category: str, catalog: dict[str, list[tuple[str, str]]]) -> tuple[str, float]:
    candidates = catalog.get(procurement_category, [])
    normalized = norm_text(item)
    exact = dict(candidates).get(normalized)
    if exact:
        return exact, 1.0
    best_full, best_score = "", -1.0
    for key, full in candidates:
        score = dice_similarity(item_family(item), item_family(key))
        if score > best_score:
            best_full, best_score = full, score
    if best_full:
        return best_full, max(best_score, 0.0)
    parent = PARENT_BY_PROCUREMENT.get(procurement_category, procurement_category)
    return f"{parent}-待映射-{item}", 0.0


def contract_core(value: object) -> str:
    result = norm_text(value)
    for term in ("标准", "合同", "框架协议", "协议", "采购", "供应", "分包", "工程", "专业", "劳务", "设备", "材料", "服务", "综合"):
        result = result.replace(term, "")
    return result


def best_contract(item: str, cooperation: str, procurement_category: str, catalog: dict[str, list[dict[str, str]]]) -> tuple[dict[str, str], float]:
    candidates = catalog.get(procurement_category, [])
    query = contract_core(item + cooperation.split("-")[-1])
    best: dict[str, str] = {"name": "", "code": "", "l1": "", "l2": ""}
    best_score = -1.0
    for candidate in candidates:
        candidate_core = contract_core(candidate["name"])
        score = dice_similarity(query, candidate_core)
        if query and candidate_core and (query in candidate_core or candidate_core in query):
            score = max(score, min(len(query), len(candidate_core)) / max(len(query), len(candidate_core)))
        tail_score = dice_similarity(item, candidate["l2"])
        score = 0.8 * score + 0.2 * tail_score
        if score > best_score:
            best, best_score = candidate, score
    return best, max(best_score, 0.0)


def transaction_candidate_rows(transactions: pd.DataFrame, end_year: int) -> pd.DataFrame:
    eligible = transactions[
        (transactions["year"] <= end_year)
        & (transactions["plan_type"] == "集采计划")
        & transactions["coop_l3"].ne("")
        & transactions["procurement_category"].isin(PROCUREMENT_CATEGORIES)
    ].copy()
    eligible = eligible[eligible["procurement_category"].ne("租赁")]
    if eligible.empty:
        return pd.DataFrame()
    eligible = eligible.sort_values("created")
    latest = eligible.groupby("entity_key", as_index=False).tail(1).copy()
    latest["year"] = latest["created"].dt.year.astype(int)
    latest["source_sheet"] = np.where(latest["procurement_category"].isin(["物资", "设备"]), "物资", "分包")
    latest["plan_name"] = latest.apply(
        lambda r: f"{r['organization']}{end_year + 1}年-{r['source_sheet']}集采计划", axis=1
    )
    latest["plan_status"] = ""
    latest["change_status"] = ""
    latest["item_l1"] = latest["coop_l1"]
    latest["item_l2"] = latest["coop_l2"]
    latest["raw_procurement_mode"] = latest["raw_method"]
    latest["resource_class"] = ""
    latest["plan_start"] = latest["created"]
    latest["plan_end"] = latest["completed"]
    missing_end = latest["plan_end"].isna()
    latest.loc[missing_end, "plan_end"] = latest.loc[missing_end, "plan_start"] + pd.to_timedelta(45, unit="D")
    latest["undertaker"] = latest["organization"]
    latest["remark"] = "由历史集采关联招采记录补充的候选"
    latest["procurement_ids"] = latest["record_id"]
    latest["start_offset"] = [day_offset(d, y) for d, y in zip(latest["plan_start"], latest["year"])]
    latest["duration_days"] = (latest["plan_end"] - latest["plan_start"]).dt.days
    latest["template_source"] = "历史招采候选"
    columns = [
        "year", "source_sheet", "organization", "plan_name", "plan_status", "change_status", "cooperation_category",
        "procurement_category", "item_l1", "item_l2", "item_name", "raw_procurement_mode", "resource_class", "amount",
        "plan_start", "plan_end", "undertaker", "region", "remark", "procurement_ids", "org_key", "region_key",
        "item_key", "entity_key", "start_offset", "duration_days", "template_source",
    ]
    return latest[columns].reset_index(drop=True)


def aggregate_lookup(frame: pd.DataFrame, keys: list[str], value: str = "entity_key") -> dict[tuple, int]:
    if frame.empty:
        return {}
    return frame.groupby(keys)[value].size().to_dict()


def prepare_feature_context(plans: pd.DataFrame, transactions: pd.DataFrame, project_norm: dict[str, float]) -> dict:
    plan_count = plans.groupby(["year", "entity_key"]).size().to_dict()
    broad_item = plans.groupby(["year", "procurement_category", "item_key"]).size().to_dict()
    org_cat = plans.groupby(["year", "org_key", "procurement_category"]).size().to_dict()
    region_cat = plans.groupby(["year", "region_key", "procurement_category"]).size().to_dict()
    amount_median = plans.groupby(["year", "entity_key"])["amount"].median().to_dict()
    start_median = plans.groupby(["year", "entity_key"])["start_offset"].median().to_dict()
    duration_median = plans.groupby(["year", "entity_key"])["duration_days"].median().to_dict()
    txn_org_cat = transactions.groupby(["year", "org_key", "procurement_category"]).size().to_dict()
    txn_entity = transactions.groupby(["year", "entity_key"]).size().to_dict()
    return {
        "plan_count": plan_count,
        "broad_item": broad_item,
        "org_cat": org_cat,
        "region_cat": region_cat,
        "amount_median": amount_median,
        "start_median": start_median,
        "duration_median": duration_median,
        "txn_org_cat": txn_org_cat,
        "txn_entity": txn_entity,
        "project_norm": project_norm,
    }


FEATURE_NAMES = [
    "count_lag1", "count_lag2", "count_lag3", "present_lag1", "present_lag2", "present_lag3", "recency",
    "item_demand_lag1", "item_demand_lag2", "org_demand_lag1", "org_demand_lag2", "region_demand_lag1",
    "amount_lag1", "amount_lag2", "amount_change", "start_month", "duration", "transaction_lag1",
    "transaction_entity_lag1", "project_exposure",
]


def feature_row(candidate: pd.Series, target_year: int, context: dict) -> list[float]:
    key = candidate["entity_key"]
    cat = candidate["procurement_category"]
    org = candidate["org_key"]
    region = candidate["region_key"]
    item = candidate["item_key"]
    counts = [context["plan_count"].get((target_year - lag, key), 0) for lag in (1, 2, 3)]
    present = [float(value > 0) for value in counts]
    recency = 0.0
    for lag, value in enumerate(counts, start=1):
        if value > 0:
            recency = 1.0 / lag
            break
    item_demand = [math.log1p(context["broad_item"].get((target_year - lag, cat, item), 0)) for lag in (1, 2)]
    org_demand = [math.log1p(context["org_cat"].get((target_year - lag, org, cat), 0)) for lag in (1, 2)]
    region_demand = math.log1p(context["region_cat"].get((target_year - 1, region, cat), 0))
    amounts = [context["amount_median"].get((target_year - lag, key), np.nan) for lag in (1, 2)]
    amount_logs = [math.log1p(value) if pd.notna(value) and value >= 0 else 0.0 for value in amounts]
    amount_change = amount_logs[0] - amount_logs[1]
    start = context["start_median"].get((target_year - 1, key), np.nan)
    start_month = (start / 30.5) / 12 if pd.notna(start) else 0.5
    duration = context["duration_median"].get((target_year - 1, key), np.nan)
    duration_scaled = min(max(float(duration), 0.0), 730.0) / 365 if pd.notna(duration) else 0.12
    txn_lag = math.log1p(context["txn_org_cat"].get((target_year - 1, org, cat), 0))
    txn_entity = math.log1p(context["txn_entity"].get((target_year - 1, key), 0))
    project = context["project_norm"].get(org, 0.0)
    return [
        float(counts[0]), float(counts[1]), float(counts[2]), *present, recency,
        *item_demand, *org_demand, region_demand, *amount_logs, amount_change,
        start_month, duration_scaled, txn_lag, txn_entity, project,
    ]


def candidate_universe(plans: pd.DataFrame, transactions: pd.DataFrame, target_year: int) -> pd.DataFrame:
    historical = plans[(plans["year"] < target_year) & plans["procurement_category"].ne("租赁")].sort_values("year")
    latest = historical.groupby("entity_key", as_index=False).tail(1).copy()
    txn_candidates = transaction_candidate_rows(transactions[transactions["year"] < target_year], target_year - 1)
    if not txn_candidates.empty:
        txn_candidates = txn_candidates[~txn_candidates["entity_key"].isin(set(latest["entity_key"]))]
        latest = pd.concat([latest, txn_candidates], ignore_index=True, sort=False)
    latest = latest.drop_duplicates("entity_key", keep="last")
    return latest.reset_index(drop=True)


@dataclass
class TreeNode:
    value: float
    feature: int | None = None
    threshold: float | None = None
    left: "TreeNode | None" = None
    right: "TreeNode | None" = None


class SimpleTreeRegressor:
    def __init__(self, max_depth: int = 4, min_leaf: int = 10, max_features: int | None = None, rng: random.Random | None = None):
        self.max_depth = max_depth
        self.min_leaf = min_leaf
        self.max_features = max_features
        self.rng = rng or random.Random(RNG_SEED)
        self.root: TreeNode | None = None

    def fit(self, x: np.ndarray, y: np.ndarray) -> "SimpleTreeRegressor":
        self.root = self._build(x, y, 0)
        return self

    def _build(self, x: np.ndarray, y: np.ndarray, depth: int) -> TreeNode:
        node = TreeNode(float(np.mean(y)) if len(y) else 0.0)
        if depth >= self.max_depth or len(y) < 2 * self.min_leaf or float(np.var(y)) < 1e-9:
            return node
        feature_count = x.shape[1]
        choose = min(self.max_features or feature_count, feature_count)
        features = self.rng.sample(range(feature_count), choose)
        best_loss = float("inf")
        best_split = None
        for feature in features:
            values = x[:, feature]
            unique = np.unique(values)
            if len(unique) < 2:
                continue
            if len(unique) > 12:
                quantiles = np.linspace(0.08, 0.92, 11)
                thresholds = np.unique(np.quantile(unique, quantiles))
            else:
                thresholds = (unique[:-1] + unique[1:]) / 2
            for threshold in thresholds:
                mask = values <= threshold
                left_n = int(mask.sum())
                right_n = len(y) - left_n
                if left_n < self.min_leaf or right_n < self.min_leaf:
                    continue
                left_y, right_y = y[mask], y[~mask]
                loss = float(np.var(left_y) * left_n + np.var(right_y) * right_n)
                if loss < best_loss:
                    best_loss = loss
                    best_split = (feature, float(threshold), mask)
        if best_split is None:
            return node
        feature, threshold, mask = best_split
        node.feature = feature
        node.threshold = threshold
        node.left = self._build(x[mask], y[mask], depth + 1)
        node.right = self._build(x[~mask], y[~mask], depth + 1)
        return node

    def predict(self, x: np.ndarray) -> np.ndarray:
        def one(row: np.ndarray) -> float:
            node = self.root
            while node and node.feature is not None:
                node = node.left if row[node.feature] <= node.threshold else node.right
            return 0.0 if node is None else node.value

        return np.array([one(row) for row in x], dtype=float)


class SimpleRandomForest:
    def __init__(self, n_estimators: int = 70, max_depth: int = 5, min_leaf: int = 12, seed: int = RNG_SEED):
        self.n_estimators = n_estimators
        self.max_depth = max_depth
        self.min_leaf = min_leaf
        self.rng = random.Random(seed)
        self.trees: list[SimpleTreeRegressor] = []

    def fit(self, x: np.ndarray, y: np.ndarray) -> "SimpleRandomForest":
        n, p = x.shape
        max_features = max(3, int(math.sqrt(p)))
        for _ in range(self.n_estimators):
            idx = np.array([self.rng.randrange(n) for _ in range(n)])
            tree = SimpleTreeRegressor(self.max_depth, self.min_leaf, max_features, self.rng)
            tree.fit(x[idx], y[idx])
            self.trees.append(tree)
        return self

    def predict(self, x: np.ndarray) -> np.ndarray:
        if not self.trees:
            return np.zeros(len(x))
        return np.mean([tree.predict(x) for tree in self.trees], axis=0)


class SimpleGradientBoosting:
    def __init__(self, n_estimators: int = 55, learning_rate: float = 0.06, max_depth: int = 2, min_leaf: int = 15, seed: int = RNG_SEED):
        self.n_estimators = n_estimators
        self.learning_rate = learning_rate
        self.max_depth = max_depth
        self.min_leaf = min_leaf
        self.rng = random.Random(seed)
        self.base = 0.0
        self.trees: list[SimpleTreeRegressor] = []

    def fit(self, x: np.ndarray, y: np.ndarray) -> "SimpleGradientBoosting":
        self.base = float(np.mean(y))
        pred = np.full(len(y), self.base, dtype=float)
        for _ in range(self.n_estimators):
            residual = y - pred
            tree = SimpleTreeRegressor(self.max_depth, self.min_leaf, x.shape[1], self.rng)
            tree.fit(x, residual)
            pred += self.learning_rate * tree.predict(x)
            self.trees.append(tree)
        return self

    def predict(self, x: np.ndarray) -> np.ndarray:
        pred = np.full(len(x), self.base, dtype=float)
        for tree in self.trees:
            pred += self.learning_rate * tree.predict(x)
        return np.clip(pred, 0.0, 1.0)


def model_training_data(plans: pd.DataFrame, transactions: pd.DataFrame, context: dict, forecast_target: int) -> tuple[np.ndarray, np.ndarray]:
    x_rows: list[list[float]] = []
    y_rows: list[float] = []
    actual_keys_by_year = {
        year: set(plans.loc[plans["year"] == year, "entity_key"]) for year in range(2023, forecast_target)
    }
    for target_year in range(2024, forecast_target):
        candidates = candidate_universe(plans, transactions, target_year)
        for _, candidate in candidates.iterrows():
            x_rows.append(feature_row(candidate, target_year, context))
            y_rows.append(float(candidate["entity_key"] in actual_keys_by_year.get(target_year, set())))
    if not x_rows:
        return np.empty((0, len(FEATURE_NAMES))), np.empty(0)
    return np.asarray(x_rows, dtype=float), np.asarray(y_rows, dtype=float)


def robust_amount(history: pd.DataFrame, target_year: int, method: str) -> float:
    data = history.dropna(subset=["amount"]).copy()
    data = data[data["amount"] > 0]
    if data.empty:
        return 0.0
    by_year = data.groupby("year")["amount"].median().to_dict()
    last = by_year.get(target_year - 1, np.nan)
    prev = by_year.get(target_year - 2, np.nan)
    if method == "last_year" and pd.notna(last):
        return float(last)
    if method == "trend" and pd.notna(last):
        if pd.notna(prev):
            predicted = float(last + 0.25 * (last - prev))
            return max(float(last) * 0.5, min(predicted, float(last) * 1.5))
        return float(last)
    weights = {target_year - 1: 0.6, target_year - 2: 0.3, target_year - 3: 0.1}
    values = [(by_year[y], w) for y, w in weights.items() if y in by_year]
    if values:
        return float(sum(value * weight for value, weight in values) / sum(weight for _, weight in values))
    return float(data["amount"].median())


def projected_dates(history: pd.DataFrame, target_year: int, method: str) -> tuple[pd.Timestamp, pd.Timestamp]:
    data = history.copy()
    if method == "last_year":
        latest = data.sort_values("year").iloc[-1]
        years = target_year - int(latest["year"])
        start = shift_year(latest["plan_start"], years)
        end = shift_year(latest["plan_end"], years)
        if pd.isna(start):
            start = pd.Timestamp(target_year, 6, 1)
        if pd.isna(end) or end < start:
            duration = latest["duration_days"] if pd.notna(latest["duration_days"]) and latest["duration_days"] >= 0 else 45
            end = start + pd.to_timedelta(float(duration), unit="D")
        return start.normalize(), end.normalize()
    offsets = data["start_offset"].dropna().clip(-60, 600)
    durations = data["duration_days"].dropna().clip(1, 730)
    offset = float(offsets.median()) if not offsets.empty else 151.0
    duration = float(durations.median()) if not durations.empty else 45.0
    if method == "trend" and len(offsets) >= 2:
        latest = data.sort_values("year").tail(2)["start_offset"].dropna()
        if len(latest) == 2:
            offset = float(latest.iloc[-1] + 0.25 * (latest.iloc[-1] - latest.iloc[-2]))
    start = pd.Timestamp(target_year, 1, 1) + pd.to_timedelta(round(offset), unit="D")
    end = start + pd.to_timedelta(max(1, round(duration)), unit="D")
    return start.normalize(), end.normalize()


def forecast_counts(plans: pd.DataFrame, target_year: int) -> dict[str, int]:
    counts = {
        year: int(((plans["year"] == year) & plans["procurement_category"].ne("租赁")).sum())
        for year in range(2023, target_year)
    }
    last = counts.get(target_year - 1, 0)
    prev = counts.get(target_year - 2, last)
    older = counts.get(target_year - 3, prev)
    ewma = round(0.6 * last + 0.3 * prev + 0.1 * older)
    trend = round(min(last * 1.10, max(last * 0.90, last + 0.25 * (last - prev))))
    return {
        "last_year": last,
        "ewma": ewma,
        "trend": trend,
        "random_forest": last,
        "gradient_boosting": trend,
        "ensemble": round(np.median([last, ewma, trend, last, trend]) * 1.02),
    }


def rank_scale(values: np.ndarray) -> np.ndarray:
    if len(values) == 0:
        return values
    order = np.argsort(np.argsort(values))
    return order / max(len(values) - 1, 1)


def score_candidates(candidates: pd.DataFrame, x: np.ndarray, rf: SimpleRandomForest | None, gb: SimpleGradientBoosting | None) -> dict[str, np.ndarray]:
    count_lag1, count_lag2, count_lag3 = x[:, 0], x[:, 1], x[:, 2]
    present_lag1, present_lag2, present_lag3 = x[:, 3], x[:, 4], x[:, 5]
    txn_lag, txn_entity, project = x[:, 17], x[:, 18], x[:, 19]
    ewma = (
        0.46 * present_lag1
        + 0.20 * present_lag2
        + 0.09 * present_lag3
        + 0.08 * np.tanh(x[:, 7] / 3)
        + 0.06 * np.tanh(x[:, 9] / 3)
        + 0.05 * np.tanh(txn_lag / 4)
        + 0.04 * np.tanh(txn_entity / 2)
        + 0.02 * project
    )
    trend = np.maximum(0, count_lag1 + 0.25 * (count_lag1 - count_lag2))
    trend = rank_scale(trend + 0.15 * x[:, 7] + 0.10 * txn_entity + 0.05 * project)
    rf_score = rf.predict(x) if rf else ewma
    gb_score = gb.predict(x) if gb else ewma
    ensemble = (
        0.22 * rank_scale(ewma)
        + 0.18 * trend
        + 0.25 * rank_scale(rf_score)
        + 0.25 * rank_scale(gb_score)
        + 0.06 * rank_scale(txn_entity)
        + 0.04 * project
    )
    return {
        "ewma": np.clip(ewma, 0, 1),
        "trend": np.clip(trend, 0, 1),
        "random_forest": np.clip(rf_score, 0, 1),
        "gradient_boosting": np.clip(gb_score, 0, 1),
        "ensemble": np.clip(ensemble, 0, 1),
    }


def synthesize_plan_name(row: pd.Series, target_year: int) -> str:
    existing = replace_year(row.get("plan_name"), target_year)
    if existing:
        return existing
    org = text(row.get("organization")) or text(row.get("undertaker")) or "中国建筑一局（集团）有限公司"
    mode = text(row.get("source_sheet")) or ("物资" if row.get("procurement_category") in {"物资", "设备"} else "分包")
    return f"{org}{target_year}年-{mode}集采计划"


def create_prediction_row(
    model_key: str,
    candidate: pd.Series,
    score: float,
    target_year: int,
    plan_history: pd.DataFrame,
    history_by_entity: dict[str, pd.DataFrame],
    broad_amount_medians: dict[tuple[str, str], float],
    enrichment_cache: dict[tuple[str, str, str], tuple[str, float, dict[str, str], float]],
    category_catalog: dict[str, list[tuple[str, str]]],
    contract_catalog: dict[str, list[dict[str, str]]],
    project_counts: dict[str, int],
    scenario_new_project: bool = False,
) -> dict:
    entity_history = history_by_entity.get(text(candidate["entity_key"]))
    if entity_history is None or entity_history.empty:
        entity_history = pd.DataFrame([candidate])
    method_key = "trend" if model_key in {"trend", "gradient_boosting"} else ("last_year" if model_key == "last_year" else "ewma")
    amount = robust_amount(entity_history, target_year, method_key)
    if model_key == "random_forest" and not entity_history.empty:
        own = robust_amount(entity_history, target_year, "ewma")
        broad = broad_amount_medians.get((text(candidate["procurement_category"]), text(candidate["item_key"])))
        if broad is not None and pd.notna(broad):
            amount = 0.7 * own + 0.3 * float(broad)
    start, end = projected_dates(entity_history, target_year, method_key)
    cooperation = text(candidate.get("cooperation_category"))
    cache_key = (text(candidate["item_name"]), text(candidate["procurement_category"]), cooperation)
    enriched = enrichment_cache.get(cache_key)
    if enriched is None:
        cooperation_score = 1.0 if cooperation else 0.0
        if not cooperation:
            cooperation, cooperation_score = best_cooperation(
                text(candidate["item_name"]), text(candidate["procurement_category"]), category_catalog
            )
        contract, contract_score = best_contract(
            text(candidate["item_name"]), cooperation, text(candidate["procurement_category"]), contract_catalog
        )
        enriched = (cooperation, cooperation_score, contract, contract_score)
        enrichment_cache[cache_key] = enriched
    cooperation, cooperation_score, contract, contract_score = enriched
    ptype = text(candidate.get("procurement_type"))
    pmethod = text(candidate.get("procurement_method"))
    raw = text(candidate.get("raw_procurement_mode"))
    if not ptype:
        if raw == "区域联采":
            ptype = "区域联采"
        else:
            ptype = "招标采购" if raw in {"公告招标", "邀约招标", "公开招标", "邀请招标"} else "集中采购"
    if ptype not in PROCUREMENT_TYPES:
        ptype = "集中采购"
    if not pmethod:
        pmethod = {"公开招标": "公告招标", "邀请招标": "邀约招标"}.get(raw, raw)
    if pmethod not in PROCUREMENT_METHODS:
        pmethod = "公告招标" if ptype in {"招标采购", "区域联采"} else "竞价采购"
    historical_years = sorted({int(y) for y in entity_history["year"].dropna().tolist() if int(y) < target_year})
    if score >= 0.72:
        confidence = "高"
    elif score >= 0.48:
        confidence = "中"
    else:
        confidence = "低"
    review_reasons = []
    if cooperation_score < 0.55:
        review_reasons.append("合作品类映射置信度低")
    if contract_score < 0.42:
        review_reasons.append("标准合同映射置信度低")
    if scenario_new_project:
        review_reasons.append("新增项目情景候选")
    if amount <= 0:
        review_reasons.append("缺少有效金额样本")
    mode = text(candidate.get("source_sheet")) or ("物资" if candidate["procurement_category"] in {"物资", "设备"} else "分包")
    return {
        "模型": MODEL_NAMES[model_key],
        "组织机构": text(candidate.get("organization")) or "中国建筑一局（集团）有限公司",
        "计划名称": synthesize_plan_name(candidate, target_year),
        "计划模式": mode,
        "计划年份": target_year,
        "合作品类": cooperation,
        "采购品类": text(candidate["procurement_category"]),
        "采购类型": ptype,
        "采购方式": pmethod,
        "标准合同一级科目": contract["l1"],
        "标准合同二级科目": contract["l2"],
        "标准合同名称": contract["name"],
        "标准合同编号": contract["code"],
        "含税概算金额（万）": round(float(amount), 2),
        "计划采购时间": start,
        "计划采购完成时间": end,
        "区域": text(candidate.get("region")),
        "承办单位": text(candidate.get("undertaker")) or text(candidate.get("organization")),
        "资源/采购内容": text(candidate.get("item_name")),
        "一级分类": text(candidate.get("item_l1")),
        "二级分类": text(candidate.get("item_l2")),
        "预测概率": round(float(score), 4),
        "置信度": confidence,
        "预测来源": "新增项目情景" if scenario_new_project else text(candidate.get("template_source")) or "历史集采计划",
        "历史出现年份": ",".join(str(y) for y in historical_years),
        "历史样本数": int(len(entity_history)),
        "当前项目池数量": int(project_counts.get(text(candidate.get("org_key")), 0)),
        "合作品类映射分": round(float(cooperation_score), 4),
        "合同映射分": round(float(contract_score), 4),
        "是否新增项目情景": "是" if scenario_new_project else "否",
        "需人工复核": "是" if review_reasons else "否",
        "复核原因": "；".join(review_reasons),
        "实体键": text(candidate.get("entity_key")),
    }


def generate_forecasts(
    plans: pd.DataFrame,
    transactions: pd.DataFrame,
    target_year: int,
    project_counts: dict[str, int],
    project_norm: dict[str, float],
    category_catalog: dict[str, list[tuple[str, str]]],
    contract_catalog: dict[str, list[dict[str, str]]],
) -> dict[str, pd.DataFrame]:
    historical = plans[plans["year"] < target_year].copy()
    history_by_entity = {key: group for key, group in historical.groupby("entity_key")}
    broad_amount_medians = historical.groupby(["procurement_category", "item_key"])["amount"].median().to_dict()
    enrichment_cache: dict[tuple[str, str, str], tuple[str, float, dict[str, str], float]] = {}
    context = prepare_feature_context(historical, transactions[transactions["year"] < target_year], project_norm)
    candidates = candidate_universe(historical, transactions, target_year)
    x = np.asarray([feature_row(row, target_year, context) for _, row in candidates.iterrows()], dtype=float)
    train_x, train_y = model_training_data(historical, transactions, context, target_year)
    rf = None
    gb = None
    if len(train_y) >= 50 and len(np.unique(train_y)) > 1:
        rf = SimpleRandomForest().fit(train_x, train_y)
        gb = SimpleGradientBoosting().fit(train_x, train_y)
    scores = score_candidates(candidates, x, rf, gb)
    counts = forecast_counts(historical, target_year)
    forecasts: dict[str, pd.DataFrame] = {}

    prior_rows = historical[(historical["year"] == target_year - 1) & historical["procurement_category"].ne("租赁")].copy()
    prior_rows = prior_rows.sort_values(["plan_name", "region", "procurement_category", "item_name"]).reset_index(drop=True)
    last_predictions = []
    for _, row in prior_rows.iterrows():
        last_predictions.append(
            create_prediction_row(
                "last_year", row, 0.70, target_year, historical, history_by_entity, broad_amount_medians,
                enrichment_cache, category_catalog, contract_catalog, project_counts
            )
        )
    forecasts["last_year"] = pd.DataFrame(last_predictions)

    # Five selectable outputs: baseline, exponential weighting, random forest,
    # gradient boosting, and the blended ensemble. The damped trend remains an
    # internal ensemble component and count driver rather than a sixth output.
    for model_key in ("ewma", "random_forest", "gradient_boosting", "ensemble"):
        model_scores = scores[model_key]
        order = np.argsort(-model_scores)
        requested = min(counts[model_key], len(candidates))
        selected_indices = list(order[:requested])
        new_flags = {idx: False for idx in selected_indices}
        if model_key == "ensemble" and requested > 0:
            uplift_count = max(1, round(requested * 0.02))
            base_count = max(1, requested - uplift_count)
            selected_indices = list(order[:base_count])
            remaining = [idx for idx in order[base_count:] if candidates.iloc[idx]["template_source"] == "历史招采候选"]
            if len(remaining) < uplift_count:
                remaining = list(order[base_count:])
            additions = remaining[:uplift_count]
            selected_indices.extend(additions)
            new_flags = {idx: idx in set(additions) for idx in selected_indices}
        prediction_rows = []
        for idx in selected_indices:
            prediction_rows.append(
                create_prediction_row(
                    model_key,
                    candidates.iloc[idx],
                    float(model_scores[idx]),
                    target_year,
                    historical,
                    history_by_entity,
                    broad_amount_medians,
                    enrichment_cache,
                    category_catalog,
                    contract_catalog,
                    project_counts,
                    new_flags.get(idx, False),
                )
            )
        forecasts[model_key] = pd.DataFrame(prediction_rows)

    for model_key, frame in forecasts.items():
        if frame.empty:
            continue
        plan_codes = {name: f"JC{target_year}-{i:04d}" for i, name in enumerate(sorted(frame["计划名称"].unique()), start=1)}
        frame.insert(1, "预测计划编号", frame["计划名称"].map(plan_codes))
        frame.insert(2, "预测条目编号", [f"{plan_codes[name]}-{i:04d}" for i, name in enumerate(frame["计划名称"], start=1)])
        forecasts[model_key] = frame
    return forecasts


def standardize_actual(plans: pd.DataFrame, year: int) -> pd.DataFrame:
    actual = plans[(plans["year"] == year) & plans["procurement_category"].ne("租赁")].copy().reset_index(drop=True)
    return pd.DataFrame(
        {
            "实际条目序号": np.arange(1, len(actual) + 1),
            "组织机构": actual["organization"],
            "计划名称": actual["plan_name"],
            "计划模式": actual["source_sheet"],
            "计划年份": actual["year"],
            "合作品类": actual["cooperation_category"],
            "采购品类": actual["procurement_category"],
            "原始采购方式/类型": actual["raw_procurement_mode"],
            "含税概算金额（万）": actual["amount"],
            "计划采购时间": actual["plan_start"],
            "计划采购完成时间": actual["plan_end"],
            "区域": actual["region"],
            "承办单位": actual["undertaker"],
            "资源/采购内容": actual["item_name"],
            "一级分类": actual["item_l1"],
            "二级分类": actual["item_l2"],
            "实体键": actual["entity_key"],
        }
    )


def prediction_for_matching(frame: pd.DataFrame) -> pd.DataFrame:
    return pd.DataFrame(
        {
            "organization": frame["组织机构"],
            "region": frame["区域"],
            "procurement_category": frame["采购品类"],
            "procurement_type": frame["采购类型"],
            "procurement_method": frame["采购方式"],
            "item_name": frame["资源/采购内容"],
            "amount": frame["含税概算金额（万）"],
            "plan_start": pd.to_datetime(frame["计划采购时间"], errors="coerce"),
        }
    )


def actual_for_matching(plans: pd.DataFrame, year: int) -> pd.DataFrame:
    actual = plans[(plans["year"] == year) & plans["procurement_category"].ne("租赁")].copy()
    return actual[
        ["organization", "region", "procurement_category", "procurement_type", "procurement_method", "item_name", "amount", "plan_start"]
    ].reset_index(drop=True)


def row_pair_score(pred: pd.Series, actual: pd.Series) -> tuple[float, dict[str, float]]:
    item = dice_similarity(item_family(pred["item_name"]), item_family(actual["item_name"]))
    pred_org, actual_org = norm_org(pred["organization"]), norm_org(actual["organization"])
    org = 1.0 if pred_org and pred_org == actual_org else dice_similarity(pred_org, actual_org)
    region = region_similarity(pred["region"], actual["region"])
    ptype = 1.0 if text(pred["procurement_type"]) == text(actual["procurement_type"]) else 0.0
    method = 1.0 if text(pred["procurement_method"]) == text(actual["procurement_method"]) else 0.0
    pred_date = pd.to_datetime(pred["plan_start"], errors="coerce")
    actual_date = pd.to_datetime(actual["plan_start"], errors="coerce")
    if pd.isna(pred_date) or pd.isna(actual_date):
        time_score = 0.0
        date_diff = np.nan
    else:
        date_diff = abs((pred_date - actual_date).days)
        time_score = max(0.0, 1.0 - date_diff / 180.0)
    pred_amount = float(pred["amount"]) if pd.notna(pred["amount"]) else 0.0
    actual_amount = float(actual["amount"]) if pd.notna(actual["amount"]) else 0.0
    if pred_amount > 0 and actual_amount > 0:
        amount_score = max(0.0, 1.0 - abs(math.log1p(pred_amount) - math.log1p(actual_amount)) / math.log(5))
        smape = abs(pred_amount - actual_amount) / ((abs(pred_amount) + abs(actual_amount)) / 2)
    else:
        amount_score = 0.0
        smape = np.nan
    total = 0.38 * item + 0.17 * org + 0.14 * region + 0.08 * ptype + 0.08 * method + 0.08 * time_score + 0.07 * amount_score
    return total, {
        "item": item,
        "org": org,
        "region": region,
        "type": ptype,
        "method": method,
        "time": time_score,
        "amount": amount_score,
        "date_diff": date_diff,
        "smape": smape,
    }


def match_forecast(pred: pd.DataFrame, actual: pd.DataFrame, threshold: float = 0.58) -> tuple[dict, pd.DataFrame]:
    pairs: list[tuple[float, int, int, dict[str, float]]] = []
    actual_by_cat_item: dict[str, dict[str, list[int]]] = defaultdict(lambda: defaultdict(list))
    actual_by_cat_org: dict[str, dict[str, list[int]]] = defaultdict(lambda: defaultdict(list))
    actual_records = actual.to_dict("records")
    pred_records = pred.to_dict("records")
    item_cache_actual = [item_family(row["item_name"]) for row in actual_records]
    org_cache_actual = [norm_org(row["organization"]) for row in actual_records]
    for j, row in enumerate(actual_records):
        category = text(row["procurement_category"])
        actual_by_cat_item[category][item_cache_actual[j]].append(j)
        actual_by_cat_org[category][org_cache_actual[j]].append(j)
    item_pair_cache: dict[tuple[str, str], float] = {}
    for i, prow in pred.iterrows():
        category = text(prow["procurement_category"])
        pred_item = item_family(prow["item_name"])
        pred_org = norm_org(prow["organization"])
        family_scores = []
        for actual_item in actual_by_cat_item.get(category, {}):
            cache_key = (pred_item, actual_item)
            if cache_key not in item_pair_cache:
                item_pair_cache[cache_key] = dice_similarity(pred_item, actual_item)
            family_scores.append((item_pair_cache[cache_key], actual_item))
        family_scores.sort(reverse=True)
        candidate_indices: set[int] = set(actual_by_cat_org.get(category, {}).get(pred_org, []))
        for quick_score, family in family_scores[:14]:
            if quick_score >= 0.24:
                candidate_indices.update(actual_by_cat_item[category][family])
        for j in candidate_indices:
            arow = actual_records[j]
            item = item_pair_cache.get((pred_item, item_cache_actual[j]))
            if item is None:
                item = dice_similarity(pred_item, item_cache_actual[j])
            actual_org = org_cache_actual[j]
            org = 1.0 if pred_org and pred_org == actual_org else dice_similarity(pred_org, actual_org)
            region = region_similarity(prow["region"], arow["region"])
            ptype = 1.0 if text(prow["procurement_type"]) == text(arow["procurement_type"]) else 0.0
            method = 1.0 if text(prow["procurement_method"]) == text(arow["procurement_method"]) else 0.0
            pred_date = pd.to_datetime(prow["plan_start"], errors="coerce")
            actual_date = pd.to_datetime(arow["plan_start"], errors="coerce")
            if pd.isna(pred_date) or pd.isna(actual_date):
                time_score, date_diff = 0.0, np.nan
            else:
                date_diff = abs((pred_date - actual_date).days)
                time_score = max(0.0, 1.0 - date_diff / 180.0)
            pred_amount = float(prow["amount"]) if pd.notna(prow["amount"]) else 0.0
            actual_amount = float(arow["amount"]) if pd.notna(arow["amount"]) else 0.0
            if pred_amount > 0 and actual_amount > 0:
                amount_score = max(0.0, 1.0 - abs(math.log1p(pred_amount) - math.log1p(actual_amount)) / math.log(5))
                smape = abs(pred_amount - actual_amount) / ((abs(pred_amount) + abs(actual_amount)) / 2)
            else:
                amount_score, smape = 0.0, np.nan
            total = 0.38 * item + 0.17 * org + 0.14 * region + 0.08 * ptype + 0.08 * method + 0.08 * time_score + 0.07 * amount_score
            components = {
                "item": item, "org": org, "region": region, "type": ptype, "method": method,
                "time": time_score, "amount": amount_score, "date_diff": date_diff, "smape": smape,
            }
            if total >= threshold:
                pairs.append((total, i, j, components))
    pairs.sort(key=lambda item: item[0], reverse=True)
    used_pred: set[int] = set()
    used_actual: set[int] = set()
    matches: list[dict] = []
    for total, i, j, components in pairs:
        if i in used_pred or j in used_actual:
            continue
        used_pred.add(i)
        used_actual.add(j)
        matches.append({"prediction_index": i, "actual_index": j, "match_score": total, **components})
    match_frame = pd.DataFrame(matches)
    n_pred, n_actual, n_match = len(pred), len(actual), len(matches)
    precision = n_match / n_pred if n_pred else 0.0
    recall = n_match / n_actual if n_actual else 0.0
    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
    if match_frame.empty:
        avg_field = amount_accuracy = time_accuracy = 0.0
        amount_smape = np.nan
        date_mae = np.nan
    else:
        avg_field = float(match_frame[["item", "org", "region", "type", "method"]].mean(axis=1).mean())
        smape_values = match_frame["smape"].dropna()
        amount_smape = float(smape_values.mean()) if not smape_values.empty else np.nan
        amount_accuracy = max(0.0, 1.0 - min(amount_smape, 1.0)) if pd.notna(amount_smape) else 0.0
        date_values = match_frame["date_diff"].dropna()
        date_mae = float(date_values.mean()) if not date_values.empty else np.nan
        time_accuracy = float(match_frame["time"].mean())
    count_accuracy = max(0.0, 1.0 - abs(n_pred - n_actual) / max(n_actual, 1))
    composite = 0.50 * f1 + 0.20 * avg_field + 0.15 * amount_accuracy + 0.10 * time_accuracy + 0.05 * count_accuracy
    metrics = {
        "预测条目数": n_pred,
        "实际条目数": n_actual,
        "匹配条目数": n_match,
        "精确率": precision,
        "召回率": recall,
        "条目F1": f1,
        "匹配字段相似度": avg_field,
        "金额准确度": amount_accuracy,
        "金额SMAPE": amount_smape,
        "计划开始时间MAE（天）": date_mae,
        "时间准确度": time_accuracy,
        "条目规模准确度": count_accuracy,
        "综合相似度": composite,
    }
    return metrics, match_frame


def build_match_detail(model_name: str, pred_original: pd.DataFrame, actual_original: pd.DataFrame, matches: pd.DataFrame) -> pd.DataFrame:
    rows = []
    for _, match in matches.iterrows():
        p = pred_original.iloc[int(match["prediction_index"])]
        a = actual_original.iloc[int(match["actual_index"])]
        rows.append(
            {
                "模型": model_name,
                "预测条目编号": p["预测条目编号"],
                "预测计划名称": p["计划名称"],
                "预测采购内容": p["资源/采购内容"],
                "实际计划名称": a["计划名称"],
                "实际采购内容": a["资源/采购内容"],
                "采购品类": p["采购品类"],
                "预测区域": p["区域"],
                "实际区域": a["区域"],
                "预测金额（万）": p["含税概算金额（万）"],
                "实际金额（万）": a["含税概算金额（万）"],
                "预测开始时间": p["计划采购时间"],
                "实际开始时间": a["计划采购时间"],
                "匹配得分": match["match_score"],
                "内容相似度": match["item"],
                "组织相似度": match["org"],
                "区域相似度": match["region"],
                "采购类型一致": match["type"],
                "采购方式一致": match["method"],
                "金额相似度": match["amount"],
                "开始时间差（天）": match["date_diff"],
            }
        )
    return pd.DataFrame(rows)


def data_quality_summary(plans: pd.DataFrame, transactions: pd.DataFrame) -> pd.DataFrame:
    rows = []
    for year in (2023, 2024, 2025, 2026):
        frame = plans[plans["year"] == year]
        rows.append(
            {
                "数据集": f"{year}年集采计划",
                "记录数": len(frame),
                "合作品类缺失率": frame["cooperation_category"].eq("").mean(),
                "资源/采购内容缺失率": frame["item_name"].eq("").mean(),
                "金额缺失率": frame["amount"].isna().mean(),
                "开始时间缺失率": frame["plan_start"].isna().mean(),
                "完成时间缺失率": frame["plan_end"].isna().mean(),
                "说明": "2026年作为盲测真实值" if year == 2026 else "用于训练/历史回测",
            }
        )
    for source in ("招标", "采购"):
        frame = transactions[transactions["source"] == source]
        rows.append(
            {
                "数据集": f"历史{source}数据",
                "记录数": len(frame),
                "合作品类缺失率": frame["coop_l3"].eq("").mean(),
                "资源/采购内容缺失率": frame["item_name"].eq("").mean(),
                "金额缺失率": frame["amount"].isna().mean(),
                "开始时间缺失率": frame["created"].isna().mean(),
                "完成时间缺失率": frame["completed"].isna().mean(),
                "说明": "预测仅使用2025-12-31及以前记录",
            }
        )
    return pd.DataFrame(rows)


def json_ready(value):
    if isinstance(value, (pd.Timestamp, datetime)):
        return None if pd.isna(value) else value.strftime("%Y-%m-%d")
    if isinstance(value, np.generic):
        return value.item()
    if pd.isna(value):
        return None
    return value


def records_json(frame: pd.DataFrame) -> list[dict]:
    return [{str(key): json_ready(value) for key, value in row.items()} for row in frame.to_dict("records")]


def main() -> None:
    random.seed(RNG_SEED)
    np.random.seed(RNG_SEED)
    GENERATED_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    plans = pd.concat([load_plan_year(year) for year in (2023, 2024, 2025, 2026)], ignore_index=True)
    transactions = load_transactions()
    plans = add_procurement_dimensions(plans, transactions)
    project_counts, project_norm = project_exposure()
    category_catalog = build_category_catalog(transactions, plans[plans["year"] <= 2025])
    contract_catalog = load_contract_catalog()

    forecasts = generate_forecasts(
        plans[plans["year"] <= 2025],
        transactions[transactions["year"] <= 2025],
        2026,
        project_counts,
        project_norm,
        category_catalog,
        contract_catalog,
    )
    actual = standardize_actual(plans, 2026)
    actual_match = actual_for_matching(plans, 2026)

    comparison_rows = []
    match_details = []
    for model_key, forecast in forecasts.items():
        metrics, matches = match_forecast(prediction_for_matching(forecast), actual_match)
        comparison_rows.append({"模型": MODEL_NAMES[model_key], **metrics})
        match_details.append(build_match_detail(MODEL_NAMES[model_key], forecast, actual, matches))
    comparison = pd.DataFrame(comparison_rows).sort_values("综合相似度", ascending=False).reset_index(drop=True)
    comparison.insert(0, "排名", np.arange(1, len(comparison) + 1))
    match_detail = pd.concat(match_details, ignore_index=True) if match_details else pd.DataFrame()

    backtest_rows = []
    for target_year in (2024, 2025):
        back_forecasts = generate_forecasts(
            plans[plans["year"] < target_year],
            transactions[transactions["year"] < target_year],
            target_year,
            project_counts,
            project_norm,
            category_catalog,
            contract_catalog,
        )
        target_actual = actual_for_matching(plans, target_year)
        for model_key, forecast in back_forecasts.items():
            metrics, _ = match_forecast(prediction_for_matching(forecast), target_actual)
            backtest_rows.append({"回测年度": target_year, "模型": MODEL_NAMES[model_key], **metrics})
    backtest = pd.DataFrame(backtest_rows)
    quality = data_quality_summary(plans, transactions)

    all_predictions = pd.concat(forecasts.values(), ignore_index=True)
    recommended_name = comparison.iloc[0]["模型"]
    recommended = all_predictions[all_predictions["模型"] == recommended_name].copy()

    payload = {
        "metadata": {
            "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "forecast_year": 2026,
            "training_years": "2023-2025",
            "actual_rows": len(actual),
            "recommended_model": recommended_name,
            "new_project_uplift": 0.02,
            "match_threshold": 0.58,
        },
        "comparison": records_json(comparison),
        "backtest": records_json(backtest),
        "recommended": records_json(recommended),
        "all_predictions": records_json(all_predictions),
        "actual": records_json(actual),
        "match_detail": records_json(match_detail),
        "data_quality": records_json(quality),
    }
    (GENERATED_DIR / "forecast_results.json").write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")

    comparison.to_csv(OUTPUT_DIR / "模型相似度对比.csv", index=False, encoding="utf-8-sig")
    recommended.to_csv(OUTPUT_DIR / "2026年推荐集采计划预测.csv", index=False, encoding="utf-8-sig")
    all_predictions.to_csv(OUTPUT_DIR / "2026年全部模型预测.csv", index=False, encoding="utf-8-sig")

    print(comparison.to_string(index=False))
    print(f"\nRecommended: {recommended_name}; rows={len(recommended):,}")
    print(f"Output JSON: {GENERATED_DIR / 'forecast_results.json'}")


if __name__ == "__main__":
    main()
