#!/usr/bin/env python3
"""
客户去重脚本 - 红龙获客系统

功能：
  1. 从多个 JSON 文件中加载客户数据
  2. 标准化公司名称/域名/电话
  3. 按相似度匹配重复客户
  4. 合并重复项并输出结果

使用方法：
  python dedup.py --input file1.json file2.json ... --output result.json
  python dedup.py --input-dir ./customer_data/ --output result.json

输入格式（每个 JSON 文件）：
  {
    "platform": "linkedin",
    "customers": [
      {
        "name": "ABC Industrial Supply",
        "website": "https://www.abc-industrial.com",
        "email": "sales@abc-industrial.com",
        "phone": "+1-555-123-4567",
        "country": "USA"
      }
    ]
  }

输出格式：
  {
    "unique_customers": [...],
    "duplicates_removed": 5,
    "total_input": 30,
    "total_unique": 25,
    "merge_details": [...]
  }

依赖：Python 3.8+ 标准库（无第三方依赖）
"""

import json
import re
import sys
import argparse
import hashlib
from pathlib import Path
from difflib import SequenceMatcher
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple


# ============================================================
# 公司名称标准化
# ============================================================

# 常见公司后缀（多语言）
COMPANY_SUFFIXES = [
    # 英文
    "limited", "ltd", "inc", "incorporated", "corp", "corporation",
    "co", "company", "llc", "llp", "lp",
    # 欧陆
    "gmbh", "ag", "sa", "s.a.", "s.r.l.", "b.v.", "nv", "ab",
    "as", "a/s", "oy", "spA", "s.r.o.", "kft", "rt",
    # 亚洲
    "co., ltd", "coltd",
    # 通用后缀
    "group", "holdings", "industries", "international", "enterprises",
    "trading", "manufacturing", "solutions", "services",
]

# 常见前缀
COMPANY_PREFIXES = ["the"]


def normalize_company_name(name: str) -> str:
    """标准化公司名称用于匹配比较"""
    if not name:
        return ""

    result = name.lower().strip()

    # 移除前缀
    for prefix in COMPANY_PREFIXES:
        if result.startswith(prefix + " "):
            result = result[len(prefix) + 1:]

    # 移除后缀（按长度降序，避免误匹配）
    sorted_suffixes = sorted(COMPANY_SUFFIXES, key=len, reverse=True)
    for suffix in sorted_suffixes:
        # 匹配后缀（可能在末尾，前面可能有逗号、点号等）
        patterns = [
            f", {suffix}$",
            f", {suffix}.$",
            f" {suffix}$",
            f" {suffix}.$",
            f".{suffix}$",
        ]
        for pattern in patterns:
            new_result = re.sub(pattern, "", result, flags=re.IGNORECASE)
            if new_result != result:
                result = new_result
                break

    # 移除特殊字符（保留字母、数字、空格）
    result = re.sub(r"[^\w\s]", "", result)

    # 移除多余空格
    result = " ".join(result.split())

    return result.strip()


def extract_domain(url_or_email: str) -> str:
    """从 URL 或邮箱中提取主域名"""
    if not url_or_email:
        return ""

    text = url_or_email.lower().strip()

    # 如果是邮箱，提取 @ 后面的域名
    if "@" in text:
        text = text.split("@")[-1]

    # 移除协议
    text = text.replace("https://", "").replace("http://", "")
    # 移除 www
    text = re.sub(r"^www\.", "", text)
    # 移除路径
    domain = text.split("/")[0]
    # 移除端口
    domain = domain.split(":")[0]

    return domain.strip()


def normalize_phone(phone: str) -> str:
    """标准化电话号码（只保留数字）"""
    if not phone:
        return ""
    return re.sub(r"[^\d]", "", phone)


# ============================================================
# 相似度计算
# ============================================================

def company_name_similarity(name1: str, name2: str) -> float:
    """
    计算两个公司名称的相似度（0.0 ~ 1.0）
    使用 difflib.SequenceMatcher（标准库，无需安装）
    """
    n1 = normalize_company_name(name1)
    n2 = normalize_company_name(name2)

    if not n1 or not n2:
        return 0.0

    # 如果标准化后完全相同
    if n1 == n2:
        return 1.0

    # 去掉空格后比较
    n1_no_space = n1.replace(" ", "")
    n2_no_space = n2.replace(" ", "")
    if n1_no_space == n2_no_space:
        return 0.95

    # SequenceMatcher 相似度
    ratio = SequenceMatcher(None, n1, n2).ratio()

    # 也比较去掉空格的版本，取较大值
    ratio_no_space = SequenceMatcher(None, n1_no_space, n2_no_space).ratio()

    return max(ratio, ratio_no_space)


def domain_similarity(domain1: str, domain2: str) -> float:
    """比较两个域名的相似度"""
    d1 = extract_domain(domain1)
    d2 = extract_domain(domain2)

    if not d1 or not d2:
        return 0.0

    if d1 == d2:
        return 1.0

    # 比较主域名部分（去掉 TLD）
    main1 = d1.split(".")[0]
    main2 = d2.split(".")[0]

    if main1 == main2:
        return 0.9

    return SequenceMatcher(None, d1, d2).ratio()


def email_domain_match(email1: str, email2: str) -> float:
    """比较两个邮箱的域名"""
    d1 = extract_domain(email1) if "@" in (email1 or "") else ""
    d2 = extract_domain(email2) if "@" in (email2 or "") else ""

    if not d1 or not d2:
        return 0.0

    return 1.0 if d1 == d2 else 0.0


def phone_match(phone1: str, phone2: str) -> float:
    """比较两个电话号码"""
    p1 = normalize_phone(phone1)
    p2 = normalize_phone(phone2)

    if not p1 or not p2:
        return 0.0

    # 去掉国家代码前缀后比较
    # 常见前缀: 1 (US/CA), 86 (CN), 44 (UK), etc.
    for prefix in ["00", "01", "1", "86", "44", "91", "55", "52", "62", "60"]:
        if p1.startswith(prefix) and len(p1) > len(prefix):
            p1 = p1[len(prefix):]
        if p2.startswith(prefix) and len(p2) > len(prefix):
            p2 = p2[len(prefix):]

    if p1 == p2:
        return 1.0

    # 数字序列相似度
    return SequenceMatcher(None, p1, p2).ratio()


# ============================================================
# 综合匹配评分
# ============================================================

def overall_similarity(c1: Dict[str, Any], c2: Dict[str, Any]) -> Tuple[float, Dict[str, float]]:
    """
    计算两个客户的综合相似度
    返回: (总分, 各维度分数字典)

    权重:
      公司名称 40% + 域名 30% + 邮箱域名 20% + 电话 10%
    """
    scores = {
        "company_name": company_name_similarity(
            c1.get("name", ""), c2.get("name", "")
        ),
        "domain": domain_similarity(
            c1.get("website", ""), c2.get("website", "")
        ),
        "email_domain": email_domain_match(
            c1.get("email", ""), c2.get("email", "")
        ),
        "phone": phone_match(
            c1.get("phone", ""), c2.get("phone", "")
        ),
    }

    total = (
        scores["company_name"] * 0.4
        + scores["domain"] * 0.3
        + scores["email_domain"] * 0.2
        + scores["phone"] * 0.1
    )

    return total, scores


# ============================================================
# 客户合并
# ============================================================

def generate_customer_id(name: str, domain: str) -> str:
    """生成客户唯一 ID"""
    normalized = normalize_company_name(name) + extract_domain(domain)
    return hashlib.md5(normalized.encode()).hexdigest()[:12]


def merge_customers(primary: Dict[str, Any], secondary: Dict[str, Any]) -> Dict[str, Any]:
    """合并两个客户记录（保留更完整的信息）"""

    def better_value(val1, val2):
        """选择非空且更长的值"""
        if not val1:
            return val2
        if not val2:
            return val1
        return val1 if len(str(val1)) >= len(str(val2)) else val2

    merged = {
        "name": better_value(primary.get("name"), secondary.get("name")),
        "normalized_name": normalize_company_name(
            better_value(primary.get("name"), secondary.get("name"))
        ),
        "website": better_value(primary.get("website"), secondary.get("website")),
        "domain": extract_domain(
            better_value(primary.get("website"), secondary.get("website"))
        ),
        "country": better_value(primary.get("country"), secondary.get("country")),
        "customer_id": primary.get("customer_id", ""),
    }

    # 合并邮箱（去重）
    emails = set()
    for e in [primary.get("email"), secondary.get("email")]:
        if e:
            emails.add(e)
    merged["emails"] = sorted(emails)
    merged["email"] = emails.pop() if emails else ""

    # 合并电话（去重）
    phones = set()
    for p in [primary.get("phone"), secondary.get("phone")]:
        if p:
            phones.add(p)
    merged["phones"] = sorted(phones)

    # 合并来源平台
    sources = set()
    for s in [primary.get("platform"), primary.get("source"), secondary.get("platform"), secondary.get("source")]:
        if s:
            sources.add(s)
    merged["sources"] = sorted(sources)
    merged["source_count"] = len(sources)

    # 日期
    merged["first_found"] = min(
        primary.get("first_found", "9999-99-99"),
        secondary.get("first_found", "9999-99-99"),
    )
    if merged["first_found"] == "9999-99-99":
        merged["first_found"] = datetime.now().strftime("%Y-%m-%d")
    merged["last_updated"] = datetime.now().strftime("%Y-%m-%d")

    # 保留合并历史
    history = primary.get("merge_history", []) + secondary.get("merge_history", [])
    history.append({
        "date": datetime.now().strftime("%Y-%m-%d"),
        "merged_from": secondary.get("name", ""),
        "merged_platform": secondary.get("platform", ""),
    })
    merged["merge_history"] = history

    # 保留原始数据
    raw = primary.get("raw_data", [])
    raw.append(secondary)
    merged["raw_data"] = raw

    return merged


# ============================================================
# 去重主流程
# ============================================================

SIMILARITY_THRESHOLD = 0.70  # 综合相似度阈值（>70%视为重复）


def load_customers(file_path: str) -> List[Dict[str, Any]]:
    """从 JSON 文件加载客户数据"""
    path = Path(file_path)
    if not path.exists():
        print(f"⚠️ 文件不存在: {file_path}")
        return []

    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    platform = data.get("platform", path.stem)
    customers = data.get("customers", [])

    # 给每个客户添加来源标记
    for c in customers:
        c["platform"] = c.get("platform", platform)
        c["first_found"] = c.get("first_found", datetime.now().strftime("%Y-%m-%d"))

    return customers


def deduplicate(all_customers: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    对客户列表进行去重
    返回: (唯一客户列表, 合并详情列表)
    """
    if not all_customers:
        return [], []

    unique = []  # 已确认唯一的客户
    merge_details = []

    for customer in all_customers:
        best_match_idx = -1
        best_score = 0.0
        best_scores = {}

        for i, existing in enumerate(unique):
            score, scores = overall_similarity(customer, existing)
            if score > best_score:
                best_score = score
                best_match_idx = i
                best_scores = scores

        if best_score >= SIMILARITY_THRESHOLD and best_match_idx >= 0:
            # 找到重复 → 合并
            existing = unique[best_match_idx]
            merged = merge_customers(existing, customer)
            unique[best_match_idx] = merged

            merge_details.append({
                "action": "merged",
                "primary": existing.get("name", ""),
                "secondary": customer.get("name", ""),
                "similarity": round(best_score, 3),
                "scores": {k: round(v, 3) for k, v in best_scores.items()},
            })
        else:
            # 新客户 → 添加
            customer["customer_id"] = generate_customer_id(
                customer.get("name", ""),
                customer.get("website", ""),
            )
            unique.append(customer)

    return unique, merge_details


def main():
    parser = argparse.ArgumentParser(
        description="客户去重工具 - 红龙获客系统",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument(
        "--input", nargs="+", required=False,
        help="输入 JSON 文件路径（可多个）",
    )
    parser.add_argument(
        "--input-dir", required=False,
        help="输入目录（自动扫描所有 .json 文件）",
    )
    parser.add_argument(
        "--output", required=True,
        help="输出 JSON 文件路径",
    )
    parser.add_argument(
        "--threshold", type=float, default=SIMILARITY_THRESHOLD,
        help=f"相似度阈值（默认 {SIMILARITY_THRESHOLD}）",
    )

    args = parser.parse_args()

    # 收集输入文件
    input_files = args.input or []
    if args.input_dir:
        input_dir = Path(args.input_dir)
        if input_dir.exists():
            input_files.extend(str(p) for p in input_dir.glob("*.json"))

    if not input_files:
        print("❌ 未找到输入文件。请使用 --input 或 --input-dir 指定。")
        sys.exit(1)

    # 加载所有客户
    all_customers = []
    for f in input_files:
        customers = load_customers(f)
        print(f"📂 {f}: 加载 {len(customers)} 个客户")
        all_customers.extend(customers)

    total_input = len(all_customers)
    print(f"\n📊 共加载 {total_input} 个客户，开始去重...")

    # 设置全局阈值
    global SIMILARITY_THRESHOLD
    SIMILARITY_THRESHOLD = args.threshold

    # 执行去重
    unique, merge_details = deduplicate(all_customers)

    # 输出结果
    result = {
        "unique_customers": unique,
        "duplicates_removed": total_input - len(unique),
        "total_input": total_input,
        "total_unique": len(unique),
        "dedup_rate": round((total_input - len(unique)) / total_input * 100, 1) if total_input else 0,
        "merge_details": merge_details,
        "threshold": args.threshold,
        "timestamp": datetime.now().isoformat(),
    }

    # 写入输出文件
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    # 打印摘要
    print(f"\n✅ 去重完成！")
    print(f"   输入: {total_input} 个客户")
    print(f"   去重后: {len(unique)} 个唯一客户")
    print(f"   重复移除: {total_input - len(unique)} 个")
    print(f"   去重率: {result['dedup_rate']}%")
    print(f"   结果已保存: {output_path}")


if __name__ == "__main__":
    main()
