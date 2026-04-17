#!/usr/bin/env python3
"""
skill-cli generate-routing — 从 skill.yaml 自动生成 ROUTING-TABLE.yaml

用法：
  python generate_routing.py <skills-root> [--output ROUTING-TABLE.yaml]

从所有 skill.yaml 读取：
  - tags          → 映射到 intent（customer_discovery / company_research 等）
  - capability    → 决定优先级（core=5, enhanced=4, optional=3）
  - priority      → 数字越小优先级越高

依赖：Python 3.8+ 标准库
"""

import sys
import argparse
from pathlib import Path
from typing import Dict, List, Optional

try:
    import yaml as _yaml
    YAML_AVAILABLE = True
except ImportError:
    YAML_AVAILABLE = False
    _yaml = None


# ── Intent 映射规则 ──────────────────────────────────────────

INTENT_KEYWORDS = {
    "customer_discovery": ["找客户", "搜索客户", "获客", "lead generation", "prospecting",
                          "find customers", "客户发现", "批量搜索", "搜索公司"],
    "company_research":   ["背调", "评估", "ICP", "调研", "公司分析", "背景调查",
                          "research", "due diligence", "evaluate", "企业背调"],
    "decision_maker":     ["决策人", "联系人", "采购经理", "LinkedIn搜索",
                          "decision maker", "contact", "buyer", "procurement"],
    "email_outreach":     ["发邮件", "开发信", "邮件", "发送", "outreach",
                          "cold email", "send email"],
    "whatsapp_outreach":  ["WhatsApp", "wa消息", "whatsapp"],
    "social_media":        ["Facebook", "Instagram", "LinkedIn运营", "社媒", "发帖",
                          "social media", "post"],
    "quotation":          ["报价", "报价单", "价格", "quote", "quotation", "pricing"],
    "full_pipeline":      ["完整流程", "端到端", "全流程", "全套"],
}

TAG_TO_INTENT = {
    "acquisition":    "customer_discovery",
    "b2b":            "customer_discovery",
    "outreach":       "customer_discovery",
    "research":       "company_research",
    "email":          "email_outreach",
    "social-media":   "social_media",
    "honglong":       "honglong",
    "xiaohongshu":    "xiaohongshu",
    "whatsapp":       "whatsapp_outreach",
}


def parse_skill_yaml(skill_path: Path) -> Optional[dict]:
    yaml_path = skill_path / "skill.yaml"
    if not yaml_path.exists():
        # 回退：读取 SKILL.md frontmatter
        fm_path = skill_path / "SKILL.md"
        if not fm_path.exists():
            return None
        return _parse_frontmatter(fm_path.read_text(encoding="utf-8", errors="replace"))

    try:
        content = yaml_path.read_text(encoding="utf-8")
        if content.startswith("\ufeff"):
            content = content[1:]
        if YAML_AVAILABLE and _yaml:
            return _yaml.safe_load(content) or {}
        return _parse_yaml_minimal(content)
    except Exception:
        return None


def _parse_yaml_minimal(text: str) -> dict:
    result = {}
    for line in text.split("\n"):
        ls = line.strip()
        if not ls or ls.startswith("#"):
            continue
        if ls.startswith("  - "):
            key = result.setdefault("triggers", [])
            key.append(ls[4:].strip().strip("'\"").strip())
        elif ": " in ls:
            k, v = ls.split(": ", 1)
            v = v.strip().strip("'\"").strip()
            if v.isdigit():
                result[k.strip()] = int(v)
            elif v in ("true", "false"):
                result[k.strip()] = v == "true"
            else:
                result[k.strip()] = v
    return result


def _parse_frontmatter(content: str) -> Optional[dict]:
    if content.startswith("\ufeff"):
        content = content[1:]
    lines = content.split("\n")
    if not lines or lines[0].strip() != "---":
        return None
    for i, line in enumerate(lines[1:], 1):
        if line.strip() == "---":
            fm_text = "\n".join(lines[1:i])
            return _parse_yaml_minimal(fm_text)
    return None


def get_priority(data: dict) -> int:
    """计算优先级：1-100，数字越小越高"""
    cap = data.get("capability", "optional")
    priority_override = data.get("priority")

    if priority_override is not None:
        return int(priority_override)

    # 从 capability 推断
    if cap == "core":
        return 10
    elif cap == "enhanced":
        return 30
    else:
        return 50


def infer_intents(data: dict) -> List[str]:
    """从 tags 和 triggers 推断 intents"""
    intents = set()
    tags = data.get("tags", [])
    triggers = data.get("triggers", [])
    description = data.get("description", "")

    # 从 tags 映射
    for tag in tags:
        tag_lower = tag.lower()
        if tag_lower in TAG_TO_INTENT:
            intents.add(TAG_TO_INTENT[tag_lower])

    # 从 triggers 关键词匹配
    all_triggers = " ".join(triggers) + " " + description
    for intent, keywords in INTENT_KEYWORDS.items():
        for kw in keywords:
            if kw.lower() in all_triggers.lower():
                intents.add(intent)

    # 从 skill name 推断
    name = data.get("name", "").lower()
    if "linkedin" in name:
        intents.add("decision_maker")
    if "facebook" in name or "instagram" in name:
        intents.add("social_media")
    if "whatsapp" in name:
        intents.add("whatsapp_outreach")
    if "acquisition" in name or "coordinator" in name:
        intents.add("customer_discovery")
    if "email" in name or "cold-email" in name:
        intents.add("email_outreach")
    if "research" in name or "intelligence" in name:
        intents.add("company_research")

    return list(intents)


def build_routing_table(skills_root: Path) -> dict:
    """从所有 skill.yaml 构建路由表"""
    exclude = {".git", "node_modules", ".claude", ".agents", ".trae", ".cli", "__pycache__"}

    routing = {}
    intents_seen = set()

    for item in sorted(skills_root.iterdir()):
        if not item.is_dir() or item.name in exclude or item.name.startswith("."):
            continue

        data = parse_skill_yaml(item)
        if not data:
            continue

        skill_name = data.get("name", item.name)
        intents = infer_intents(data)
        priority = get_priority(data)
        capability = data.get("capability", "optional")

        # 描述截断
        description = data.get("description", "")
        if len(description) > 120:
            description = description[:117] + "..."

        for intent in intents:
            if intent == "honglong":
                continue  # 跳过内部 intent

            intent_key = intent.replace("_outreach", "").replace("_discovery", "")
            routing_key = intent

            if intent.startswith("company_") or intent == "customer_discovery":
                routing_key = intent
            elif intent == "decision_maker":
                routing_key = "decision_maker_search"

            if routing_key not in routing:
                routing[routing_key] = {"overseas": [], "domestic": [], "all_markets": []}

            entry = {
                "skill": skill_name,
                "priority": priority,
                "capability": capability,
                "description": description,
            }

            # 分配到合适的 market bucket
            if "acquisition" in skill_name or "coordinator" in skill_name or "workflow" in skill_name:
                routing[routing_key]["all_markets"].append(entry)
            elif "teyi" in skill_name or "customs" in skill_name:
                routing[routing_key]["overseas"].append(entry)
            elif "email" in skill_name or "whatsapp" in skill_name or "cold-email" in skill_name:
                routing[routing_key]["all_markets"].append(entry)
            else:
                routing[routing_key]["overseas"].append(entry)
                routing[routing_key]["domestic"].append(entry)

    return routing


def generate_yaml_output(routing: dict) -> str:
    """生成 YAML 输出"""
    lines = [
        "# ============================================================",
        "# 红龙获客系统 — 自动生成的技能路由表",
        "# ============================================================",
        "# ⚠️ 本文件由 skill-cli generate-routing 自动生成",
        "# ⚠️ 手动修改将被下次运行覆盖",
        "# ============================================================",
        "",
        "intents:",
    ]

    # 输出 intents
    intent_descriptions = {
        "customer_discovery": "发现潜在客户",
        "company_research": "企业背调和评估",
        "decision_maker_search": "搜索企业决策人/采购负责人",
        "email_outreach": "邮件触达",
        "whatsapp_outreach": "WhatsApp消息触达",
        "social_media_outreach": "社交媒体运营",
        "quotation": "生成产品报价单",
        "full_pipeline": "完整获客流程",
    }

    for intent, desc in intent_descriptions.items():
        if intent in routing:
            lines.append(f"  {intent}:")
            lines.append(f"    keywords: []  # TODO: 从 triggers 提取")
            lines.append(f'    description: "{desc}"')
            lines.append(f"    market_aware: true")

    lines.append("")
    lines.append("routing:")

    for intent, markets in sorted(routing.items()):
        lines.append(f"  {intent}:")
        for market_name, entries in markets.items():
            if not entries:
                continue
            lines.append(f"    {market_name}:")
            # 按 priority 排序
            entries = sorted(entries, key=lambda e: e["priority"])
            for entry in entries:
                lines.append(f"      - skill: {entry['skill']}")
                lines.append(f"        priority: {entry['priority']}")
                lines.append(f"        capability: {entry['capability']}")
                desc = entry["description"].replace('"', '\\"')
                lines.append(f'        description: "{desc}"')

    if YAML_AVAILABLE and _yaml:
        # 用 YAML 库重新生成（更漂亮）
        pass

    return "\n".join(lines)


def generate_skills_index(skills_root: Path) -> str:
    """生成 skills_index 部分（供合并到现有路由表）"""
    exclude = {".git", "node_modules", ".claude", ".agents", ".trae", ".cli", "__pycache__"}
    lines = ["", "# ── 子技能索引 ─────────────────────────────────────────────", "#", "# 所有可被路由的技能及其位置。AI 通过 skill://协议 或 读取文件路径 来获取技能指令。", "", "skills_index:"]

    for item in sorted(skills_root.iterdir()):
        if not item.is_dir() or item.name in exclude or item.name.startswith("."):
            continue
        yaml_path = item / "skill.yaml"
        if not yaml_path.exists():
            continue

        data = parse_skill_yaml(item) or {}
        skill_name = data.get("name", item.name)
        description = data.get("description", "")[:80]

        # 推断 layer
        tags = data.get("tags", [])
        layer = "support"
        for t in tags:
            tl = t.lower()
            if tl in ("orchestration", "coordinator"):
                layer = "orchestration"
            elif tl in ("discovery", "outreach", "social-media"):
                layer = tl
            elif tl in ("intelligence", "research"):
                layer = "intelligence"

        lines.append(f"  {skill_name}:")
        lines.append(f"    path: \"skill://{skill_name}\"")
        lines.append(f"    description: \"{description}\"")
        lines.append(f"    layer: {layer}")

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="从 skill.yaml 生成路由表")
    parser.add_argument("skills_root", help="skills 根目录")
    parser.add_argument("--output", "-o", help="输出文件路径（默认打印到stdout）")
    parser.add_argument("--index-only", action="store_true", help="只生成 skills_index 部分")
    args = parser.parse_args()

    skills_root = Path(args.skills_root).resolve()
    if not skills_root.exists():
        print(f"❌ 路径不存在: {skills_root}")
        sys.exit(1)

    routing = build_routing_table(skills_root)

    if args.index_only:
        output = generate_skills_index(skills_root)
    else:
        output = generate_yaml_output(routing)

    if args.output:
        output_path = skills_root / args.output
        output_path.write_text(output, encoding="utf-8")
        print(f"✅ 路由表已生成: {output_path}")
    else:
        print(output)


if __name__ == "__main__":
    main()
