"""查询人民币对外币汇率 — 供 smart-quote 报价计算使用

用法:
  python get-exchange-rate.py              # 查全部常用汇率
  python get-exchange-rate.py USD          # 只查美元
  python get-exchange-rate.py USD EUR GBP  # 查指定币种
  python get-exchange-rate.py --json       # JSON 输出(供程序调用)

数据源: exchangerate-api.com (免费, 无需API Key)
参考验证: https://www.boc.cn/sourcedb/whpj/ (中国银行外汇牌价)
"""

import sys, json, urllib.request

CURRENCIES = {
    "USD": "美元",
    "EUR": "欧元",
    "GBP": "英镑",
    "JPY": "日元",
    "KRW": "韩元",
    "AUD": "澳元",
    "CAD": "加元",
    "BRL": "巴西雷亚尔",
    "RUB": "卢布",
    "INR": "印度卢比",
    "VND": "越南盾",
    "TRY": "土耳其里拉",
    "NGN": "尼日利亚奈拉",
    "AED": "阿联酋迪拉姆",
    "SAR": "沙特里亚尔",
    "MXN": "墨西哥比索",
}


def fetch_rates():
    url = "https://api.exchangerate-api.com/v4/latest/CNY"
    req = urllib.request.Request(url, headers={"User-Agent": "HOLO-Quote/3.0"})
    with urllib.request.urlopen(req, timeout=10) as r:
        return json.loads(r.read())


def main():
    use_json = "--json" in sys.argv
    targets = [a.upper() for a in sys.argv[1:] if a.upper() in CURRENCIES]
    if not targets:
        targets = ["USD", "EUR", "GBP"]  # 默认常用三种

    try:
        data = fetch_rates()
    except Exception as e:
        result = {"error": f"汇率API请求失败: {e}", "fallback": "请手动访问 https://www.boc.cn/sourcedb/whpj/ 获取中国银行牌价"}
        if use_json:
            print(json.dumps(result, ensure_ascii=False, indent=2))
        else:
            print(result["error"])
            print(result["fallback"])
        sys.exit(1)

    rates = data["rates"]
    date = data.get("date", "unknown")

    if use_json:
        output = {
            "date": date,
            "source": "exchangerate-api.com",
            "verify": "https://www.boc.cn/sourcedb/whpj/",
            "base": "CNY",
            "rates": {}
        }
        for code in targets:
            if code in rates:
                # rates[code] = how many units of foreign currency per 1 CNY
                # We want how many CNY per 1 unit of foreign currency
                output["rates"][code] = {
                    "currency": CURRENCIES.get(code, code),
                    "per_unit": round(1 / rates[code], 4),  # CNY per 1 unit
                }
        print(json.dumps(output, ensure_ascii=False, indent=2))
    else:
        print(f"汇率日期: {date}")
        print(f"数据源: exchangerate-api.com")
        print(f"验证: 中国银行外汇牌价 https://www.boc.cn/sourcedb/whpj/")
        print()
        print(f"{'币种':<6} {'名称':<12} {'1单位=?CNY':>12} {'报价公式':>30}")
        print("-" * 65)
        for code in targets:
            if code in rates:
                cny_per_unit = 1 / rates[code]
                print(f"{code:<6} {CURRENCIES.get(code, code):<12} {cny_per_unit:>12.4f} {'cost * (1+margin%) / ' + str(round(cny_per_unit, 2)):>30}")
            else:
                print(f"{code:<6} {'未知':<12} {'N/A':>12}")


if __name__ == "__main__":
    main()
