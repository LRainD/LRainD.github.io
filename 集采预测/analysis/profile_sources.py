from __future__ import annotations

from pathlib import Path

import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "数据"


def read_csv(path: Path) -> pd.DataFrame:
    for encoding in ("utf-8-sig", "gb18030"):
        try:
            return pd.read_csv(path, encoding=encoding)
        except UnicodeDecodeError:
            continue
    raise UnicodeDecodeError("unknown", b"", 0, 1, f"Cannot decode {path}")


def summarize_series(series: pd.Series, limit: int = 15) -> str:
    clean = series.dropna().astype(str).str.strip()
    counts = clean[clean.ne("")].value_counts().head(limit)
    return "; ".join(f"{k}={v}" for k, v in counts.items())


def profile_plan(path: Path) -> None:
    print(f"\n## {path.name}")
    for sheet in pd.ExcelFile(path).sheet_names:
        df = pd.read_excel(path, sheet_name=sheet)
        print(f"[{sheet}] rows={len(df):,}, columns={len(df.columns)}")
        for col in (
            "组织机构",
            "计划名称",
            "计划状态",
            "合作品类",
            "招标/采购品类",
            "分包方式",
            "采购内容",
            "采购方式",
            "资源类别",
            "物资资源名称",
            "分包资源名称",
            "区域",
        ):
            if col in df:
                print(f"  {col}: {summarize_series(df[col])}")
        if "含税概算金额（万）" in df:
            amount = pd.to_numeric(df["含税概算金额（万）"], errors="coerce")
            print(
                "  amount: "
                f"non_null={amount.notna().sum():,}, sum={amount.sum():,.2f}, "
                f"median={amount.median():,.2f}, min={amount.min():,.2f}, max={amount.max():,.2f}"
            )
        for col in ("计划招标/采购开始时间", "计划招标/采购完成时间"):
            if col in df:
                parsed = pd.to_datetime(df[col], errors="coerce")
                print(
                    f"  {col}: parsed={parsed.notna().sum():,}, "
                    f"min={parsed.min()}, max={parsed.max()}"
                )


def profile_transaction(path: Path, kind: str) -> None:
    df = pd.read_excel(path)
    print(f"\n## {path.name}: rows={len(df):,}, columns={len(df.columns)}")
    for col in (
        "创建时间",
        "局级组织",
        "组织机构",
        "使用项目",
        "区域",
        "招标方式",
        "组织形式",
        "采购方式",
        "一级合作品类",
        "二级合作品类",
        "三级合作品类",
        f"{kind}品类",
        "计划类型",
        "币种",
    ):
        if col in df:
            if col == "创建时间":
                dates = pd.to_datetime(df[col], errors="coerce")
                print(
                    f"  {col}: parsed={dates.notna().sum():,}, "
                    f"min={dates.min()}, max={dates.max()}, years={dates.dt.year.value_counts().sort_index().to_dict()}"
                )
            else:
                print(f"  {col}: {summarize_series(df[col])}")
    amount = pd.to_numeric(df.get("概算金额"), errors="coerce")
    print(
        "  amount: "
        f"non_null={amount.notna().sum():,}, sum={amount.sum():,.2f}, "
        f"median={amount.median():,.2f}, min={amount.min():,.2f}, max={amount.max():,.2f}"
    )


def main() -> None:
    for year in (23, 24, 25, 26):
        profile_plan(DATA / f"中国建筑一局（集团）有限公司-集采计划详情{year}年.xlsx")

    profile_transaction(DATA / "运营后台_招标列表导出_2026-09-11_17_24_00_6069.xlsx", "招标")
    profile_transaction(DATA / "运营后台_采购列表导出_2026-09-11_17_26_39_8747.xlsx", "采购")

    projects = read_csv(DATA / "项目数据.csv")
    print(f"\n## 项目数据.csv: rows={len(projects):,}, columns={len(projects.columns)}")
    for col in projects.columns:
        print(f"  {col}: non_null={projects[col].notna().sum():,}; {summarize_series(projects[col])}")

    contracts = read_csv(DATA / "计划中所需合同的枚举值.csv")
    contracts = contracts.loc[:, ~contracts.columns.astype(str).str.startswith("Unnamed:")]
    print(f"\n## 计划中所需合同的枚举值.csv: rows={len(contracts):,}, columns={len(contracts.columns)}")
    for col in contracts.columns:
        print(f"  {col}: non_null={contracts[col].notna().sum():,}; {summarize_series(contracts[col])}")

    cooperation = pd.read_excel(DATA / "合作品类.xlsx")
    print(f"\n## 合作品类.xlsx: rows={len(cooperation):,}, columns={len(cooperation.columns)}")
    for col in cooperation.columns:
        print(f"  {col}: non_null={cooperation[col].notna().sum():,}; {summarize_series(cooperation[col])}")


if __name__ == "__main__":
    main()
