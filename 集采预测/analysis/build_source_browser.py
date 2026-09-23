"""Convert the supplied spreadsheets into lazy-loaded, row-preserving browser data."""

from __future__ import annotations

import json
import math
import warnings
import base64
import gzip
from datetime import date, datetime
from pathlib import Path

import numpy as np
import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "数据"
OUTPUT_DIR = ROOT / "前端" / "source-data"
CHUNK_SIZE = 500

SOURCES = [
    ("plan23", "2023年集采计划", "中国建筑一局（集团）有限公司-集采计划详情23年.xlsx"),
    ("plan24", "2024年集采计划", "中国建筑一局（集团）有限公司-集采计划详情24年.xlsx"),
    ("plan25", "2025年集采计划", "中国建筑一局（集团）有限公司-集采计划详情25年.xlsx"),
    ("plan26", "2026年集采计划", "中国建筑一局（集团）有限公司-集采计划详情26年.xlsx"),
    ("tender", "历史招标数据", "运营后台_招标列表导出_2026-09-11_17_24_00_6069.xlsx"),
    ("purchase", "历史采购数据", "运营后台_采购列表导出_2026-09-11_17_26_39_8747.xlsx"),
    ("projects", "项目数据", "项目数据.csv"),
    ("regions", "区域字典", "区域数据.xlsx"),
    ("cooperation", "合作品类字典", "合作品类.xlsx"),
    ("contracts", "标准合同科目", "计划中所需合同的枚举值.csv"),
]

PREFERRED = {
    "plan": ["来源工作表", "组织机构", "计划名称", "合作品类", "招标/采购品类", "分包方式", "采购内容", "含税概算金额（万）", "计划招标/采购开始时间", "计划招标/采购完成时间", "区域"],
    "tender": ["招标编号", "招标名称", "招标状态", "局级组织", "局二级组织", "局三级组织", "创建时间", "招标品类", "招标方式", "概算金额", "区域"],
    "purchase": ["采购编号", "采购名称", "采购状态", "局级组织", "局二级组织", "局三级组织", "创建时间", "采购品类", "采购方式", "概算金额", "区域"],
    "projects": ["p.project_no", "项目名称", "项目类型", "pe.work_model", "所属组织", "o.org_code"],
    "regions": ["big_area_code", "big_area_name", "configured_area_code", "province_name", "province_level", "province_full_name"],
    "cooperation": ["合作品类三级ID", "合作品类一级", "合作品类二级", "合作品类三级"],
    "contracts": ["品类", "标准合同一级科目", "标准合同二级科目", "标准合同名称", "标准合同编号"],
}


def read_csv(path: Path) -> pd.DataFrame:
    for encoding in ("utf-8-sig", "gb18030"):
        try:
            return pd.read_csv(path, encoding=encoding, low_memory=False)
        except UnicodeDecodeError:
            continue
    raise ValueError(f"Cannot decode {path.name}")


def normalize(value: object) -> object:
    if value is None:
        return None
    if isinstance(value, (datetime, date, pd.Timestamp)):
        return value.isoformat(sep=" ") if isinstance(value, datetime) else value.isoformat()
    if isinstance(value, np.generic):
        value = value.item()
    if isinstance(value, float) and not math.isfinite(value):
        return None
    if pd.isna(value):
        return None
    return value


def read_source(source_id: str, path: Path) -> tuple[pd.DataFrame, list[dict]]:
    if path.suffix.lower() == ".csv":
        frame = read_csv(path)
        sheets = []
    elif source_id.startswith("plan"):
        frames = pd.read_excel(path, sheet_name=None)
        sheets = [{"name": name, "rows": len(frame)} for name, frame in frames.items()]
        frame = pd.concat(
            [part.assign(来源工作表=name) for name, part in frames.items() if len(part)],
            ignore_index=True,
        )
        frame = frame[["来源工作表", *[col for col in frame.columns if col != "来源工作表"]]]
    else:
        frames = pd.read_excel(path, sheet_name=None)
        sheets = [{"name": name, "rows": len(frame)} for name, frame in frames.items()]
        frame = next(iter(frames.values()))
    return frame, sheets


def main() -> None:
    warnings.filterwarnings("ignore", message="Workbook contains no default style")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    manifest = {}
    for source_id, label, filename in SOURCES:
        frame, sheets = read_source(source_id, DATA_DIR / filename)
        unnamed = frame.columns.astype(str).str.startswith("Unnamed:")
        empty_unnamed = [col for col in frame.columns[unnamed] if frame[col].isna().all()]
        frame = frame.drop(columns=empty_unnamed)
        columns = [str(col) for col in frame.columns]
        kind = "plan" if source_id.startswith("plan") else source_id
        preferred = [col for col in PREFERRED[kind] if col in columns]
        if len(preferred) < 5:
            preferred = columns[: min(10, len(columns))]
        manifest[source_id] = {
            "label": label,
            "filename": filename,
            "rows": len(frame),
            "columns": columns,
            "preferred": preferred,
            "sheets": sheets,
            "omittedEmptyColumns": len(empty_unnamed),
            "chunkSize": CHUNK_SIZE,
            "chunks": math.ceil(len(frame) / CHUNK_SIZE),
        }
        for index, start in enumerate(range(0, len(frame), CHUNK_SIZE)):
            block = frame.iloc[start : start + CHUNK_SIZE]
            rows = [[normalize(value) for value in row] for row in block.itertuples(index=False, name=None)]
            row_json = json.dumps(
                rows,
                ensure_ascii=False,
                allow_nan=False,
                separators=(",", ":"),
                default=str,
            )
            packed = base64.b64encode(gzip.compress(row_json.encode("utf-8"), compresslevel=6, mtime=0)).decode("ascii")
            content = "window.receiveForecastSourceChunk(" + json.dumps(
                {"id": source_id, "index": index, "gzip": packed},
                separators=(",", ":"),
            ) + ");\n"
            (OUTPUT_DIR / f"{source_id}-{index:04d}.js").write_text(content, encoding="utf-8")
        print(f"{source_id}: {len(frame):,} rows, {len(columns)} fields, {manifest[source_id]['chunks']} chunks")
    (OUTPUT_DIR / "manifest.js").write_text(
        "window.FORECAST_SOURCE_MANIFEST=" + json.dumps(manifest, ensure_ascii=False, separators=(",", ":")) + ";\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
