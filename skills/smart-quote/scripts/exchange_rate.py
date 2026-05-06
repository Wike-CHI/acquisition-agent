#!/usr/bin/env python3
"""
汇率查询与换算工具
数据源: open.er-api.com (免费, 无 API key, 日更)
降级: frankfurter.app (免费, 无 API key, ECB 数据)

用法:
    python exchange_rate.py --from CNY              # 查所有货币汇率
    python exchange_rate.py --from CNY --to USD     # 查特定货币
    python exchange_rate.py 52000 CNY USD           # 换算: 52000 CNY = ? USD
    python exchange_rate.py 52000 CNY USD EUR BRL   # 同时换算多币种
    python exchange_rate.py --from CNY --date 2026-05-01  # 历史汇率
"""

import argparse
import json
import sys
from typing import Optional
from urllib.request import Request, urlopen
from urllib.error import URLError

API_PRIMARY = "https://open.er-api.com/v6/latest/{base}"
API_FALLBACK = "https://api.frankfurter.app/latest?from={base}"

TIMEOUT = 5  # 秒


def fetch_rates(base: str = "CNY", date: Optional[str] = None) -> dict:
    """获取汇率数据，返回 API 原始响应。"""
    if date:
        url = f"https://api.frankfurter.app/{date}?from={base}"
    else:
        url = API_PRIMARY.format(base=base)

    req = Request(url, headers={"User-Agent": "HOLO-Quote/2.0"})

    try:
        with urlopen(req, timeout=TIMEOUT) as resp:
            data = json.loads(resp.read().decode())
            if "result" in data and data["result"] == "success":
                return data
            elif "rates" in data:
                return data
    except (URLError, OSError) as e:
        pass

    # 降级到 frankfurter
    fallback_url = API_FALLBACK.format(base=base)
    req2 = Request(fallback_url, headers={"User-Agent": "HOLO-Quote/2.0"})
    try:
        with urlopen(req2, timeout=TIMEOUT) as resp:
            return json.loads(resp.read().decode())
    except (URLError, OSError) as e:
        print(f"ERROR: 汇率 API 不可用: {e}", file=sys.stderr)
        sys.exit(1)


def get_rate(rates: dict, currency: str) -> float:
    """从 rates 字典提取单个汇率。"""
    return rates.get(currency.upper(), 0)


def main():
    parser = argparse.ArgumentParser(description="汇率查询与换算")
    parser.add_argument("amount", nargs="?", type=float, default=None,
                        help="换算金额（可选，省略则仅查汇率）")
    parser.add_argument("from_currency", nargs="?", default="CNY",
                        help="源货币代码 (默认 CNY)")
    parser.add_argument("to_currencies", nargs="*", default=None,
                        help="目标货币代码（可多个）")
    parser.add_argument("--from", dest="base", default="CNY",
                        help="基准货币 (同 from_currency)")
    parser.add_argument("--to", default=None,
                        help="目标货币（单币种查询，用逗号分隔多个）")
    parser.add_argument("--date", default=None,
                        help="历史汇率日期 (YYYY-MM-DD)")
    parser.add_argument("--json", action="store_true",
                        help="JSON 格式输出")

    args = parser.parse_args()

    # 确定基准货币
    base = (args.from_currency if args.from_currency != "CNY" else args.base).upper()

    # 获取汇率
    data = fetch_rates(base, args.date)
    rates = data.get("rates", {})

    # 确定目标货币列表
    targets: list[str] = []
    show_all = False
    if args.to_currencies:
        targets = [c.upper() for c in args.to_currencies]
    elif args.to:
        targets = [c.strip().upper() for c in args.to.split(",")]
    elif args.amount is not None:
        # 有金额未指定目标，默认显示常见货币
        targets = ["USD", "EUR", "BRL", "RUB", "AED", "INR", "VND", "KZT"]
    else:
        show_all = True  # 查全部

    if args.json:
        output = {"base": base, "date": data.get("time_last_update_utc", "").split("T")[0],
                  "source": "open.er-api.com"}
        if show_all:
            output["rates"] = rates
        else:
            output["rates"] = {c: rates.get(c) for c in targets if c in rates}
        if args.amount is not None:
            output["conversions"] = {c: round(args.amount * rates.get(c, 0), 2) for c in targets}
        print(json.dumps(output, indent=2, ensure_ascii=False))
        return

    # 人类可读输出
    update_time = data.get("time_last_update_utc", "unknown")
    print(f"基准货币: 1 {base}")
    print(f"数据时间: {update_time}")
    print("-" * 40)

    if args.amount is not None:
        print(f"换算金额: {args.amount:,.2f} {base}")
        print("-" * 40)
        for c in targets:
            rate = rates.get(c)
            if rate:
                converted = args.amount * rate
                print(f"  {c:>5}: {converted:>12,.2f}  (汇率 {rate:.6f})")
            else:
                print(f"  {c:>5}: 无数据")
    else:
        if show_all:
            display = rates
        else:
            display = {c: rates.get(c) for c in targets if c in rates}
        for c, rate in sorted(display.items()):
            print(f"  {c:>5}: {rate:.6f}")


if __name__ == "__main__":
    main()
