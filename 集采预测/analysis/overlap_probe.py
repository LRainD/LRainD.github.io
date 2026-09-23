from __future__ import annotations

import re
from pathlib import Path

import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "数据"


def clean_text(value: object) -> str:
    if pd.isna(value):
        return ""
    text = str(value).strip().lower()
    text = re.sub(r"[（(].*?[）)]", "", text)
    text = re.sub(r"[\s,，、/\-—_]+", "", text)
    return text


def plan_year(year: int) -> pd.DataFrame:
    parts = []
    path = DATA / f"中国建筑一局（集团）有限公司-集采计划详情{str(year)[-2:]}年.xlsx"
    for sheet in pd.ExcelFile(path).sheet_names:
        frame = pd.read_excel(path, sheet_name=sheet)
        if frame.empty:
            continue
        out = pd.DataFrame(index=frame.index)
        out["year"] = year
        out["mode"] = sheet
        out["org"] = frame.get("组织机构", "")
        out["undertaker"] = frame.get("承办单位", "")
        out["region"] = frame.get("区域", "")
        out["proc_cat"] = frame.get("招标/采购品类", frame.get("分包方式", ""))
        out["coop"] = frame.get("合作品类", "")
        if sheet == "物资":
            out["item"] = frame.get("物资资源名称").fillna(frame.get("二级类别")).fillna(frame.get("一级类别"))
        elif sheet == "分包":
            out["item"] = frame.get("分包资源名称").fillna(frame.get("采购内容"))
        else:
            out["item"] = frame.get("采购内容详情").fillna(frame.get("分类/分部")).fillna(frame.get("采购内容分类"))
        out["amount"] = pd.to_numeric(frame.get("含税概算金额（万）"), errors="coerce")
        out["start"] = pd.to_datetime(frame.get("计划招标/采购开始时间"), errors="coerce")
        parts.append(out)
    result = pd.concat(parts, ignore_index=True)
    for col in ("org", "undertaker", "region", "proc_cat", "coop", "item"):
        result[col + "_n"] = result[col].map(clean_text)
    return result


def main() -> None:
    frames = {year: plan_year(year) for year in (2023, 2024, 2025, 2026)}
    keys = {
        "cat_item": ["proc_cat_n", "item_n"],
        "region_cat_item": ["region_n", "proc_cat_n", "item_n"],
        "undertaker_cat_item": ["undertaker_n", "proc_cat_n", "item_n"],
        "undertaker_region_cat_item": ["undertaker_n", "region_n", "proc_cat_n", "item_n"],
        "coop": ["coop_n"],
        "coop_region": ["coop_n", "region_n"],
    }
    for y1, y2 in ((2023, 2024), (2024, 2025), (2025, 2026)):
        print(f"\n{y1}->{y2}")
        left, right = frames[y1], frames[y2]
        for label, cols in keys.items():
            a = set(map(tuple, left[cols].fillna("").values.tolist()))
            b = set(map(tuple, right[cols].fillna("").values.tolist()))
            inter = len(a & b)
            print(
                f"{label:30s} unique={len(a):4d}/{len(b):4d} "
                f"intersection={inter:4d} recall={inter/max(len(b),1):.1%} precision={inter/max(len(a),1):.1%}"
            )


if __name__ == "__main__":
    main()
