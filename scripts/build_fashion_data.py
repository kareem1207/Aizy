"""Compact python/data/fashion.csv into JSON used by the in-browser demo assistant."""
import json
import pandas as pd
from pathlib import Path

root = Path(__file__).resolve().parent.parent
df = pd.read_csv(root / "python" / "data" / "fashion.csv").fillna("")
rows = [[r.product_name, r.category, "b" if r.gender == "boy" else "g", r.region, r.occasion]
        for r in df.itertuples()]
out = root / "frontend" / "src" / "lib" / "demo" / "fashionData.json"
out.write_text(json.dumps(rows, separators=(",", ":")), encoding="utf-8")
print(len(rows), "rows ->", out, out.stat().st_size, "bytes")
