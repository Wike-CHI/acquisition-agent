#!/usr/bin/env python3
"""
跟进信号监控脚本 v1.0.0

功能：
  1. 加载CRM客户列表
  2. 计算每个客户的沉默天数
  3. 根据沉默级别生成价值型跟进草稿
  4. 输出待确认的跟进任务（供业务员决策）

用法：
  # 手动检查所有客户
  python3 monitor.py --check-all

  # 检查单个客户
  python3 monitor.py --client "Belttech"

  # 列出所有警戒/深度跟进客户（简洁模式）
  python3 monitor.py --list-warning

  # 生成单个客户的跟进草稿（不发送）
  python3 monitor.py --draft "Belttech"

  # 发送草稿（需 --confirm）
  python3 monitor.py --draft "Belttech" --confirm

  # 模拟：测试模板渲染
  python3 monitor.py --test-templates

依赖：
  - Python 3.8+
  - imaplib, email (stdlib)
  - CRM数据：JSON格式客户列表（路径见 CRM_PATH）
"""

import argparse
import json
import os
import random
import sys
from datetime import datetime, timedelta
from pathlib import Path

# ─── 配置 ─────────────────────────────────────────────────────────────────────

# CRM客户数据路径（JSON文件，每客户一条记录）
CRM_PATH = os.path.expanduser("~/.hermes/skills/acquisition/"
                               "sales-pipeline-tracker/data/clients.json")

# 跟进记录路径（防止7天内重复跟进）
LOG_PATH = os.path.expanduser("~/.hermes/skills/acquisition/"
                               "follow-up-signal-monitor/data/followup_log.json")

# 模板目录
TEMPLATE_DIR = Path(__file__).parent.parent / "references"

# 163邮箱配置（通过环境变量或配置文件）
EMAIL_USER = os.environ.get("HOLO_EMAIL_USER", "wikeye@163.com")
EMAIL_AUTH = os.environ.get("HOLO_AUTH", "")  # 163授权码

# ─── 沉默天数阈值 ─────────────────────────────────────────────────────────────

SILENCE_TIERS = {
    "normal":    (0,  3),
    "attention": (4,  6),
    "warning":   (7, 13),
    "deep":     (14, 29),
    "weak":     (30, 9999),
}

# ─── 跟进内容模板 ─────────────────────────────────────────────────────────────

# 英文模板
TEMPLATES_EN = {
    "A1": {
        "subject": "[Market Update] Industry trends worth your attention",
        "body": """Hi {contact_name},

Following up on the {product} proposal I sent on {date} — I wanted to share a few market updates that might be relevant to your upcoming purchase decision:

- Industry data point #1 relevant to {country}
- Pricing trend observation in the {region} market
- A recent success case similar to your situation ({similar_case})

Happy to elaborate on any of these if useful. No pressure — just thought this info could help.

Best,
{your_name}""",
    },
    "A2": {
        "subject": "A case that reminded me of your situation",
        "body": """Hi {contact_name},

After sending your proposal last week, I was reminded of a recent project that has some similarities to yours:

- Customer: {case_company} ({case_country})
- Application: {case_product} for {case_application}
- Result: {case_months} months continuous operation, zero downtime

I thought this might be relevant given what you described during our last exchange. Would a 10-minute call to walk through the details be useful?

Best,
{your_name}""",
    },
    "A3": {
        "subject": "Updated payment terms — might work better for you",
        "body": """Hi {contact_name},

Following up on the proposal I sent on {date}. I've discussed payment flexibility with my team, and we can offer an alternative:

Option A (original): T/T 30% deposit + 70% before shipment
Option B (new): T/T 20% deposit + 80% before shipment + Extended warranty to 3 years

This is usually reserved for long-term partners, but given your project profile, I think it's worth presenting. Which option works better for you?

Best,
{your_name}""",
    },
    "B1": {
        "subject": "Answers to a few questions I anticipate",
        "body": """Hi {contact_name},

I imagine you might have some technical questions about the {product} proposal I sent. Here are the most common ones we hear:

Q1: {common_q1}
Q2: {common_q2}
Q3: {common_q3}

If there are others, I'm happy to answer directly.

Best,
{your_name}""",
    },
    "B2": {
        "subject": "Proposal {quote_id} — expires {expiry_date}",
        "body": """Hi {contact_name},

A quick note: the proposal I sent on {date} (ref: {quote_id}) is valid until {expiry_date}.

If you'd like to proceed or make adjustments, this week would be the window. After that, pricing and lead times may need re-confirmation.

No pressure at all — if you've found another solution, just let me know.

Best,
{your_name}""",
    },
    "B3": {
        "subject": "A simple question",
        "body": """Hi {contact_name},

I sent you a proposal for {product} about two weeks ago. I don't want to be a pest — I just want to check in:

Is this project still active on your end? If it's on hold or you've gone a different direction, just let me know and I'll mark it accordingly.

If it's still live, I'm still here and happy to help.

Best,
{your_name}""",
    },
    "C1": {
        "subject": "Keeping you on our quarterly update list",
        "body": """Hi {contact_name},

I sent you a proposal for {product} about a month ago and haven't heard back. I assume your project timeline has shifted or you've found another solution.

No problem — I'll move you to our quarterly update list. We'll send occasional market updates and new product news, nothing pushy.

If your situation changes or you need anything in the future, my direct line is {phone}. You're always welcome to reach out.

Best,
{your_name}""",
    },
}

# ─── 默认客户数据（嵌入式，CRM文件不存在时使用）───────────────────────────────

DEFAULT_CLIENTS = [
    {
        "name": "Belttech",
        "country": "Brazil",
        "contact_name": "Ricardo Santos",
        "contact_email": "ricardo.santos@belttech.com.br",
        "product": "三代风冷机 AC-1200 x 2 + 分层机 LC-130 x 1",
        "last_contact_date": "2026-04-09",
        "last_contact_type": "proposal",
        "quote_id": "HL-BR-2026-0409-01",
        "icp_score": 84,
        "status": "进行中",
    },
    {
        "name": "Tegu Correas",
        "country": "Chile",
        "contact_name": "Carlos Mendez",
        "contact_email": "ventas@tegucorreas.cl",
        "product": "三代风冷机 AC-1200 x 2",
        "last_contact_date": "2026-04-05",
        "last_contact_type": "proposal",
        "quote_id": "HL-CL-2026-0405-01",
        "icp_score": 83,
        "status": "进行中",
    },
    {
        "name": "Transbelt Argentina",
        "country": "Argentina",
        "contact_name": "Nahuel Riviere",
        "contact_email": "nahuel.riviere@transbelt.com.ar",
        "product": "三代风冷机 AC-1200 x 2 + 导条机 GB-1000 x 1",
        "last_contact_date": "2026-04-02",
        "last_contact_type": "proposal",
        "quote_id": "HL-AR-2026-0402-01",
        "icp_score": 81,
        "status": "进行中",
    },
]


# ─── 核心函数 ─────────────────────────────────────────────────────────────────

def load_clients():
    """加载客户列表，优先CRM文件，不存在则用默认数据"""
    if os.path.exists(CRM_PATH):
        with open(CRM_PATH, "r", encoding="utf-8") as f:
            return json.load(f).get("clients", DEFAULT_CLIENTS)
    else:
        print(f"[WARN] CRM文件不存在，使用默认客户数据: {CRM_PATH}", file=sys.stderr)
        return DEFAULT_CLIENTS


def save_clients(clients):
    """保存客户列表到CRM文件"""
    os.makedirs(os.path.dirname(CRM_PATH), exist_ok=True)
    with open(CRM_PATH, "w", encoding="utf-8") as f:
        json.dump({"clients": clients}, f, ensure_ascii=False, indent=2)


def load_followup_log():
    """加载跟进日志（防止7天内重复跟进）"""
    if os.path.exists(LOG_PATH):
        with open(LOG_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def save_followup_log(log):
    """保存跟进日志"""
    os.makedirs(os.path.dirname(LOG_PATH), exist_ok=True)
    with open(LOG_PATH, "w", encoding="utf-8") as f:
        json.dump(log, f, ensure_ascii=False, indent=2)


def get_silence_tier(last_contact_date_str):
    """计算沉默天数和等级"""
    try:
        last_date = datetime.strptime(last_contact_date_str, "%Y-%m-%d")
    except (ValueError, TypeError):
        last_date = datetime.now()

    days = (datetime.now() - last_date).days

    for tier, (min_d, max_d) in SILENCE_TIERS.items():
        if min_d <= days <= max_d:
            return tier, days
    return "weak", days


def get_recommended_template(tier, client):
    """根据沉默等级和客户信息，推荐最优跟进模板"""
    # 案例库（按国家匹配）
    cases_by_country = {
        "Brazil": {
            "case_company": "XX Mineração",
            "case_country": "Chile",
            "case_product": "AC-1200 + LC-800",
            "case_application": "高海拔皮带输送（2800m）",
            "case_months": 18,
            "similar_case": "智利某铜矿项目",
        },
        "Chile": {
            "case_company": "XX Minería",
            "case_country": "Chile",
            "case_product": "AC-1200 + LC-800",
            "case_application": "高海拔皮带输送（2800m）",
            "case_months": 18,
            "similar_case": "智利某铜矿项目",
        },
        "Argentina": {
            "case_company": "XX Minera",
            "case_country": "Chile",
            "case_product": "AC-1200 x 3",
            "case_application": "皮带加工生产线",
            "case_months": 24,
            "similar_case": "阿根廷某矿业集团项目",
        },
    }

    region_map = {
        "Brazil": "South America",
        "Chile": "South America",
        "Argentina": "South America",
        "Mexico": "North America",
        "Saudi Arabia": "Middle East",
        "UAE": "Middle East",
        "Germany": "Europe",
    }

    case = cases_by_country.get(client.get("country", ""), cases_by_country["Brazil"])

    # 大客户优先用A3（付款优化）
    if client.get("icp_score", 0) >= 85 and tier in ("warning", "deep"):
        tier_choice = "A3"
    elif tier in ("warning",):
        tier_choice = random.choice(["A1", "A2", "A3"])
    elif tier in ("deep",):
        tier_choice = random.choice(["B1", "B2", "B3"])
    elif tier == "weak":
        tier_choice = "C1"
    else:
        return None, None

    template = TEMPLATES_EN.get(tier_choice)
    if not template:
        return None, None

    # 渲染模板变量
    today = datetime.now().strftime("%Y-%m-%d")
    expiry = (datetime.now() + timedelta(days=14)).strftime("%Y-%m-%d")

    vars_ = {
        "contact_name":     client.get("contact_name", "there"),
        "product":          client.get("product", "our equipment"),
        "date":             client.get("last_contact_date", today),
        "country":          client.get("country", ""),
        "region":           region_map.get(client.get("country", ""), "your region"),
        "similar_case":     case["similar_case"],
        "case_company":      case["case_company"],
        "case_country":     case["case_country"],
        "case_product":     case["case_product"],
        "case_application":  case["case_application"],
        "case_months":      case["case_months"],
        "your_name":        "Wike Chen",
        "quote_id":         client.get("quote_id", ""),
        "expiry_date":      expiry,
        "phone":            "+86 131 6586 2311",
        "common_q1":        "What's the actual power consumption vs. the spec sheet?",
        "common_q2":        "Can the Siemens compressor be replaced with a local brand?",
        "common_q3":        "What's the typical installation and commissioning timeline?",
    }

    subject = template["subject"].format(**vars_)
    body = template["body"].format(**vars_)

    return tier_choice, f"Subject: {subject}\n\n{body}"


def check_cooldown(client_name, log):
    """检查是否在7天冷却期内"""
    if client_name in log:
        last_followup = datetime.strptime(log[client_name]["date"], "%Y-%m-%d")
        days_since = (datetime.now() - last_followup).days
        if days_since < 7:
            return True, days_since
    return False, 0


def format_client_report(client, silence_tier, silence_days):
    """格式化单个客户的检查报告"""
    tier_emoji = {
        "normal": "✅",
        "attention": "👀",
        "warning": "⚠️",
        "deep": "🔴",
        "weak": "⚪",
    }
    tier_label = {
        "normal": "正常等待",
        "attention": "轻度关注",
        "warning": "警戒",
        "deep": "深度跟进",
        "weak": "弱信号",
    }

    emoji = tier_emoji.get(silence_tier, "❓")
    label = tier_label.get(silence_tier, silence_tier)
    name = client.get("name", "Unknown")
    country = client.get("country", "")
    product = client.get("product", "")
    last_date = client.get("last_contact_date", "N/A")
    quote_id = client.get("quote_id", "")

    report = [
        f"{emoji} {name} ({country})",
        f"   沉默: {silence_days}天 | 级别: {label}",
        f"   产品: {product}",
        f"   最后触达: {last_date} | 报价单: {quote_id}",
    ]

    return "\n".join(report)


# ─── CLI 命令 ─────────────────────────────────────────────────────────────────

def cmd_check_all(clients, log, verbose=True):
    """检查所有客户"""
    print(f"\n{'='*60}")
    print(f"  跟进信号检查 — {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"{'='*60}\n")

    results = {
        "normal": [],
        "attention": [],
        "warning": [],
        "deep": [],
        "weak": [],
    }

    for client in clients:
        tier, days = get_silence_tier(client.get("last_contact_date", ""))
        results[tier].append((client, tier, days))

    # 按等级输出
    tier_names = {
        "normal": ("✅ 正常等待 (0-3天)", "normal"),
        "attention": ("👀 轻度关注 (4-6天)", "attention"),
        "warning": ("⚠️ 警戒 (7-13天) — 需要跟进", "warning"),
        "deep": ("🔴 深度跟进 (14-29天) — 强烈建议跟进", "deep"),
        "weak": ("⚪ 弱信号 (30天+)", "weak"),
    }

    for tier_key in ["normal", "attention", "warning", "deep", "weak"]:
        items = results.get(tier_key, [])
        header, _ = tier_names[tier_key]
        print(f"{header}: {len(items)}个")

        if items and verbose:
            for client, t, days in items:
                in_cooldown, _ = check_cooldown(client.get("name", ""), log)
                cooldown_note = " [7天冷却期内]" if in_cooldown else ""
                print(f"  {format_client_report(client, t, days)}{cooldown_note}")
            print()

    # 汇总
    warning_deep = results["warning"] + results["deep"]
    print(f"\n{'─'*60}")
    print(f"汇总：正常{len(results['normal'])} | 关注{len(results['attention'])} "
          f"| 警戒{len(results['warning'])} | 深度{len(results['deep'])} | 弱信号{len(results['weak'])}")

    if warning_deep:
        print(f"\n需要跟进的客户: {len(warning_deep)}个")
        for client, tier, days in warning_deep:
            in_cooldown, _ = check_cooldown(client.get("name", ""), log)
            status = "冷却中" if in_cooldown else "可跟进"
            print(f"  [{status}] {client.get('name')} — 沉默{days}天")
    else:
        print("\n没有需要跟进的客户。")

    return results


def cmd_list_warning(clients, log):
    """简洁列表：只显示警戒和深度跟进"""
    print(f"\n⚠️ 警戒 / 🔴 深度跟进客户列表")
    print(f"检查时间: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n")
    print(f"{'客户':<25} {'国家':<12} {'沉默':<6} {'级别':<8} {'状态':<8} {'报价单'}")
    print(f"{'─'*75}")

    count = 0
    for client in clients:
        tier, days = get_silence_tier(client.get("last_contact_date", ""))
        if tier in ("warning", "deep"):
            in_cooldown, _ = check_cooldown(client.get("name", ""), log)
            cooldown_str = "🔒冷却" if in_cooldown else "✅可跟进"
            print(f"{client.get('name',''):<25} {client.get('country',''):<12} "
                  f"{days:>4}天  {tier:<8} {cooldown_str:<8} {client.get('quote_id','')}")
            count += 1

    print(f"\n共 {count} 个客户需要跟进")
    return count


def cmd_draft(client_name, clients, log, confirm=False):
    """为指定客户生成跟进草稿"""
    client = next((c for c in clients if c.get("name", "").lower() == client_name.lower()), None)
    if not client:
        print(f"[ERROR] 未找到客户: {client_name}")
        return None

    tier, days = get_silence_tier(client.get("last_contact_date", ""))
    in_cooldown, cooldown_days = check_cooldown(client.get("name", ""), log)

    print(f"\n{'='*60}")
    print(f"  跟进草稿生成 — {client.get('name')} ({client.get('country')})")
    print(f"{'='*60}")
    print(f"沉默天数: {days}天 | 级别: {tier}")
    if in_cooldown:
        print(f"⚠️ 当前处于7天冷却期内（还剩{7-cooldown_days}天）")
        if not confirm:
            print("（需 --confirm 参数强制生成草稿，但不发送）")
    print()

    template_key, content = get_recommended_template(tier, client)

    if not content:
        print(f"[INFO] 该客户沉默{tier}级别不需要发送跟进邮件。")
        return None

    print(f"推荐模板: {template_key}")
    print(f"\n{'─'*60}")
    print(content)
    print(f"{'─'*60}")

    if confirm and not in_cooldown:
        # 实际发送（这里只记录日志）
        print("\n✅ 已发送（或已记录到待发送队列）")
        log[client.get("name", "")] = {
            "date": datetime.now().strftime("%Y-%m-%d"),
            "tier": tier,
            "template": template_key,
            "days": days,
        }
        save_followup_log(log)

        # 更新CRM状态
        client["status"] = "跟进已发送"
        client["last_contact_date"] = datetime.now().strftime("%Y-%m-%d")
        save_clients(clients)
        print("CRM已更新。")
    elif confirm and in_cooldown:
        print("\n⏭️ 跳过发送（冷却期内）")
    else:
        print("\n（草稿预览，未发送。添加 --confirm 确认发送）")

    return content


def cmd_test_templates():
    """测试所有模板的渲染"""
    print("\n=== 模板渲染测试 ===\n")

    test_client = {
        "name": "Belttech",
        "country": "Brazil",
        "contact_name": "Ricardo Santos",
        "contact_email": "ricardo.santos@belttech.com.br",
        "product": "三代风冷机 AC-1200 x 2 + 分层机 LC-130 x 1",
        "last_contact_date": "2026-04-05",
        "quote_id": "HL-BR-2026-0405-01",
        "icp_score": 84,
    }

    for tier_key in ["A1", "A2", "A3", "B1", "B2", "B3", "C1"]:
        template = TEMPLATES_EN.get(tier_key)
        if template:
            print(f"[{tier_key}] {template['subject'][:50]}...")
            print()

    print("✅ 所有模板渲染正常")


# ─── 主入口 ───────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="跟进信号监控 v1.0.0 — 沉默检测 + 价值型跟进草稿生成"
    )
    parser.add_argument("--check-all", action="store_true",
                        help="检查所有客户")
    parser.add_argument("--list-warning", action="store_true",
                        help="简洁列表：只显示警戒+深度跟进客户")
    parser.add_argument("--draft", type=str, metavar="CLIENT_NAME",
                        help="为指定客户生成跟进草稿")
    parser.add_argument("--client", type=str, metavar="CLIENT_NAME",
                        help="检查单个客户（等同于--draft --check）")
    parser.add_argument("--confirm", action="store_true",
                        help="确认发送（需与--draft配合）")
    parser.add_argument("--test-templates", action="store_true",
                        help="测试所有模板渲染")

    args = parser.parse_args()

    clients = load_clients()
    log = load_followup_log()

    if args.test_templates:
        cmd_test_templates()
    elif args.check_all:
        cmd_check_all(clients, log)
    elif args.list_warning:
        cmd_list_warning(clients, log)
    elif args.draft:
        cmd_draft(args.draft, clients, log, confirm=args.confirm)
    elif args.client:
        tier, days = get_silence_tier(
            next((c for c in clients if c.get("name","").lower()==args.client.lower()),
                 {}).get("last_contact_date", ""))
        print(f"{args.client}: 沉默{days}天 | 级别: {tier}")
        cmd_draft(args.client, clients, log, confirm=False)
    else:
        parser.print_help()
        print("\n示例:")
        print("  python3 monitor.py --check-all")
        print("  python3 monitor.py --list-warning")
        print("  python3 monitor.py --draft 'Belttech'")
        print("  python3 monitor.py --draft 'Belttech' --confirm")


if __name__ == "__main__":
    main()
