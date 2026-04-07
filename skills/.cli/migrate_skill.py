#!/usr/bin/env python3
"""
skill-cli migrate — 从 SKILL.md frontmatter 迁移到 skill.yaml

用法：
  python migrate_skill.py <skill-dir>           # 单个技能
  python migrate_skill.py <skills-root-dir> --all   # 批量迁移
  python migrate_skill.py <skill-dir> --dry-run      # 预览不写入

依赖：Python 3.8+ 标准库（yaml, re, pathlib）
"""

import sys
import re
import argparse
from pathlib import Path
from typing import Dict, Any, Tuple

try:
    import yaml as _yaml
    YAML_AVAILABLE = True
except ImportError:
    YAML_AVAILABLE = False
    _yaml = None


# ── 字段映射 ───────────────────────────────────────────────

# 从 SKILL.md frontmatter 读取的字段 → skill.yaml 字段
FRONTMATTER_FIELD_MAP = {
    "name": "name",
    "version": "version",
    "description": "description",
    "triggers": "triggers",
    "always": None,       # 跳过，不放入 skill.yaml
    "homepage": None,      # 跳过，放入 author.homepage
    "tags": "tags",
    "author": "author",
}

# 默认值
DEFAULTS = {
    "license": "Proprietary",
    "entry": "SKILL.md",
    "directories": {"scripts": "scripts/", "references": "references/", "assets": "assets/"},
    "capability": "optional",
    "priority": 50,
    "compatibility": {
        "workbuddy": ">=2.0",
        "claude_code": True,
        "openclaw": ">=2.5",
    },
    "author": {"name": "红龙团队", "github": "https://github.com/Wike-CHI"},
    "requires": {"bins": [], "api_keys": [], "env": {}},
    "triggers": [],
    "dependencies": [],
    "tags": [],
}


# ── 解析 SKILL.md frontmatter ─────────────────────────────

def parse_frontmatter(content: str) -> Tuple[Dict[str, Any], str]:
    """解析 SKILL.md 的 YAML frontmatter，返回 (fields, body)"""
    # 移除 BOM
    if content.startswith("\ufeff"):
        content = content[1:]
    lines = content.split("\n")
    if not lines or lines[0].strip() != "---":
        return {}, content

    end_idx = None
    for i, line in enumerate(lines[1:], 1):
        if line.strip() == "---":
            end_idx = i
            break

    if end_idx is None:
        return {}, content

    yaml_text = "\n".join(lines[1:end_idx])
    body = "\n".join(lines[end_idx + 1:])

    try:
        if YAML_AVAILABLE and _yaml is not None:
            data = _yaml.safe_load(yaml_text) or {}
        else:
            data = _parse_frontmatter_manual(yaml_text)
    except Exception:
        data = _parse_frontmatter_manual(yaml_text)

    return data, body


def _parse_frontmatter_manual(text: str) -> Dict[str, Any]:
    """当 PyYAML 不可用时的简化解析"""
    result = {}
    in_list = False
    current_key = None
    list_items = []

    for line in text.split("\n"):
        line_stripped = line.strip()

        # 列表项
        if line_stripped.startswith("- "):
            item = line_stripped[2:].strip().strip("'\"").strip()
            list_items.append(item)
            in_list = True
            continue

        # 键值对
        if ": " in line_stripped and not in_list:
            key, val = line_stripped.split(": ", 1)
            key = key.strip()
            val = val.strip().strip("'\"").strip()

            if val in ("true", "false"):
                result[key] = val == "true"
            elif val.isdigit():
                result[key] = int(val)
            elif val == "":
                result[key] = []
            else:
                result[key] = val
            continue

        # 裸键（没有值）
        if line_stripped.endswith(":") and not in_list:
            key = line_stripped.rstrip(":").strip()
            result[key] = []
            current_key = key
            in_list = False
            continue

        # 空行
        if not line_stripped:
            if in_list and list_items:
                if current_key:
                    result[current_key] = list_items
                    list_items = []
                    current_key = None
            in_list = False
            continue

    # 最后处理
    if in_list and current_key and list_items:
        result[current_key] = list_items

    return result


# ── 生成 skill.yaml ────────────────────────────────────────

def generate_skill_yaml(frontmatter: Dict[str, Any], skill_dir: Path) -> Dict[str, Any]:
    """从 frontmatter 生成 skill.yaml 数据"""
    skill_name = skill_dir.name

    # name — 必须与目录名一致（强制 kebab-case）
    raw_name = frontmatter.get("name", skill_name)
    name = raw_name.lower().replace(" ", "-").replace("_", "-")
    # 去掉连续连字符
    name = re.sub(r"-+", "-", name).strip("-")

    # version — 去掉任何 semver 不允许的 suffix（如 -honglong-override）
    version = frontmatter.get("version", "1.0.0")
    version = re.sub(r"-[\w-]+$", "", version)  # 去掉末尾 -xxx

    # description — 清理触发词混入 description 的情况
    raw_desc = frontmatter.get("description", "")
    description = _clean_description(raw_desc)

    # triggers — 可能在 frontmatter 中，也可能混在 description 中
    triggers = frontmatter.get("triggers", [])
    if not triggers and "triggers" in raw_desc:
        # 从 description 中提取触发词（检测中文触发词模式）
        triggers = _extract_triggers_from_desc(raw_desc)

    # dependencies — 目前 SKILL.md 中无此字段
    dependencies = frontmatter.get("dependencies", [])

    # tags — 从 frontmatter 或目录推断
    tags = frontmatter.get("tags", [])
    if not tags:
        tags = _infer_tags(skill_name, frontmatter)

    # author
    author_raw = frontmatter.get("author")
    if isinstance(author_raw, str):
        author = {"name": author_raw}
    elif isinstance(author_raw, dict):
        author = author_raw
    else:
        author = dict(DEFAULTS["author"])

    # capability — 从架构层级推断
    capability = _infer_capability(skill_dir)

    result = {
        "name": name,
        "version": version,
        "description": description,
        "triggers": triggers if triggers else DEFAULTS["triggers"],
        "dependencies": dependencies,
        "tags": tags,
        "author": author,
        "license": DEFAULTS["license"],
        "entry": DEFAULTS["entry"],
        "directories": dict(DEFAULTS["directories"]),
        "requires": dict(DEFAULTS["requires"]),
        "capability": capability,
        "priority": DEFAULTS["priority"],
        "compatibility": dict(DEFAULTS["compatibility"]),
    }

    return result


def _clean_description(desc: str) -> str:
    """清理 description，去除触发词列表（如果混在一起）"""
    if not desc:
        return desc

    # 移除末尾的触发词列表（常见模式："...时使用。\ntriggers: ...")
    desc = re.sub(r"\ntriggers:\s*\[.*?\]", "", desc, flags=re.DOTALL)
    desc = re.sub(r"\n\s*-\s+\S+", "", desc)  # 移除独立的列表项

    desc = desc.strip()
    if len(desc) < 10:
        return desc

    # 截断过长描述
    if len(desc) > 200:
        desc = desc[:197] + "..."

    return desc


def _extract_triggers_from_desc(desc: str) -> list:
    """从 description 中提取触发词（模糊匹配）"""
    # 检测是否在 description 末尾有触发词模式
    triggers = []
    # 这里只是占位，因为触发词通常在 frontmatter 单独的 triggers 字段
    return triggers


def _infer_tags(skill_name: str, frontmatter: Dict) -> list:
    """根据技能名称和内容推断 tags"""
    tags = []
    name_lower = skill_name.lower()

    # 架构层级
    if "acquisition" in name_lower or "coordinator" in name_lower or "workflow" in name_lower:
        tags.append("acquisition")
    if "honglong" in name_lower:
        tags.append("honglong")
    if "email" in name_lower or "cold-email" in name_lower:
        tags.append("email")
    if "linkedin" in name_lower or "facebook" in name_lower or "instagram" in name_lower:
        tags.append("social-media")
    if "research" in name_lower or "intelligence" in name_lower:
        tags.append("research")
    if "customer" in name_lower or "pipeline" in name_lower or "crm" in name_lower:
        tags.append("crm")
    if "browser" in name_lower or "playwright" in name_lower:
        tags.append("browser")
    if "xiaohongshu" in name_lower or "小红书" in str(frontmatter.get("description", "")):
        tags.append("xiaohongshu")

    return tags if tags else ["uncategorized"]


def _infer_capability(skill_dir: Path) -> str:
    """根据技能在架构中的位置推断 capability"""
    # 红龙核心技能
    core_skills = {
        "global-customer-acquisition", "acquisition-coordinator", "acquisition-evaluator",
        "acquisition-workflow", "acquisition-init", "honglong-assistant", "honglong-products",
        "credential-manager", "customer-deduplication"
    }
    enhanced_skills = {
        "company-research", "market-research", "in-depth-research", "deep-research",
        "cold-email-generator", "email-sender", "linkedin-writer", "whatsapp-outreach",
        "teyi-customs", "linkedin", "facebook-acquisition", "instagram-acquisition"
    }

    name = skill_dir.name
    if name in core_skills:
        return "core"
    elif name in enhanced_skills:
        return "enhanced"
    else:
        return "optional"


# ── 写入 skill.yaml ────────────────────────────────────────

def migrate_skill(skill_dir: Path, dry_run: bool = False) -> Tuple[bool, str]:
    """迁移单个技能，返回 (是否成功, 消息)"""
    skill_yaml_path = skill_dir / "skill.yaml"
    skill_md_path = skill_dir / "SKILL.md"

    if not skill_md_path.exists():
        return False, f"SKILL.md 不存在: {skill_md_path}"

    # 读取 SKILL.md
    try:
        with open(skill_md_path, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception as e:
        return False, f"读取失败: {e}"

    # 解析 frontmatter
    frontmatter, body = parse_frontmatter(content)
    if not frontmatter:
        return False, "无法解析 frontmatter（文件可能没有 --- 分隔符）"

    # 生成 skill.yaml 数据
    skill_data = generate_skill_yaml(frontmatter, skill_dir)

    # 序列化
    yaml_content = _serialize_yaml(skill_data)

    if dry_run:
        print(f"--- 预览: {skill_dir.name}/skill.yaml ---")
        print(yaml_content)
        print("---")
        return True, "dry-run 完成"

    # 写入
    try:
        with open(skill_yaml_path, "w", encoding="utf-8") as f:
            f.write(yaml_content)
        return True, f"已生成: {skill_yaml_path}"
    except Exception as e:
        return False, f"写入失败: {e}"


def _serialize_yaml(data: dict) -> str:
    """序列化 dict 为 YAML 字符串"""
    if YAML_AVAILABLE and _yaml is not None:
        return _yaml.dump(data, allow_unicode=True, default_flow_style=False, sort_keys=False)

    # 无 PyYAML 时的简化序列化
    lines = ["# skill.yaml — 红龙获客系统技能元数据（自动生成）", ""]
    _serialize_dict(data, lines, indent=0)
    return "\n".join(lines)


def _serialize_dict(d: dict, lines: list, indent: int):
    prefix = "  " * indent
    for key, val in d.items():
        if val is None or val == "" or val == [] or val == {}:
            continue
        if isinstance(val, dict):
            lines.append(f"{prefix}{key}:")
            _serialize_dict(val, lines, indent + 1)
        elif isinstance(val, list):
            lines.append(f"{prefix}{key}:")
            for item in val:
                lines.append(f"{prefix}  - {item}")
        elif isinstance(val, bool):
            lines.append(f"{prefix}{key}: {'true' if val else 'false'}")
        elif isinstance(val, str):
            # 简单转义
            if any(c in val for c in [":", "#", "\n", "'", '"']):
                val = f"'{val}'"
            lines.append(f"{prefix}{key}: {val}")
        else:
            lines.append(f"{prefix}{key}: {val}")


# ── 批量迁移 ────────────────────────────────────────────────

def migrate_all(skills_root: Path, dry_run: bool = False) -> Tuple[int, int]:
    """批量迁移所有技能，返回 (成功数, 失败数)"""
    successes = 0
    failures = 0

    # 排除目录
    exclude = {".git", "node_modules", ".claude", ".agents", ".trae", ".cli", "__pycache__"}

    for item in sorted(skills_root.iterdir()):
        if not item.is_dir():
            continue
        if item.name in exclude:
            continue
        if item.name.startswith("."):
            continue

        ok, msg = migrate_skill(item, dry_run=dry_run)
        if ok:
            print(f"✅ {item.name}: {msg}")
            successes += 1
        else:
            print(f"❌ {item.name}: {msg}")
            failures += 1

    return successes, failures


# ── 主程序 ────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="迁移技能到 skill.yaml")
    parser.add_argument("path", help="技能目录或 skills 根目录")
    parser.add_argument("--all", action="store_true", help="批量迁移所有技能")
    parser.add_argument("--dry-run", action="store_true", help="预览不写入")
    args = parser.parse_args()

    path = Path(args.path).resolve()
    if not path.exists():
        print(f"❌ 路径不存在: {path}")
        sys.exit(1)

    if args.all:
        # 批量模式
        successes, failures = migrate_all(path, dry_run=args.dry_run)
        print(f"\n批量迁移完成: ✅ {successes} | ❌ {failures}")
        sys.exit(0 if failures == 0 else 1)
    else:
        # 单个技能模式
        ok, msg = migrate_skill(path, dry_run=args.dry_run)
        if ok:
            print(f"✅ {msg}")
            sys.exit(0)
        else:
            print(f"❌ {msg}")
            sys.exit(1)


if __name__ == "__main__":
    main()
