#!/usr/bin/env python3
"""
skill-cli sync — 同步 skill.yaml ↔ SKILL.md frontmatter

用法：
  python sync_skill.py <skill-dir>       # 双向同步
  python sync_skill.py <skill-dir> --dry-run
  python sync_skill.py <skills-root> --all --dry-run

同步规则：
  skill.yaml → SKILL.md：version（保持同步）
  SKILL.md → skill.yaml：triggers（从 frontmatter 同步到 skill.yaml）

依赖：Python 3.8+ 标准库（yaml, pathlib）
"""

import sys
import re
import argparse
from pathlib import Path
from typing import Tuple, Dict, Any, Optional

try:
    import yaml as _yaml
    YAML_AVAILABLE = True
except ImportError:
    YAML_AVAILABLE = False
    _yaml = None


def parse_frontmatter(content: str) -> Tuple[Dict[str, Any], str]:
    """解析 SKILL.md 的 YAML frontmatter"""
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
            data = _parse_manual(yaml_text)
    except Exception:
        data = _parse_manual(yaml_text)

    return data, body


def _parse_manual(text: str) -> dict:
    result = {}
    for line in text.split("\n"):
        ls = line.strip()
        if not ls or ls.startswith("#"):
            continue
        if ": " in ls:
            k, v = ls.split(": ", 1)
            v = v.strip().strip("'\"").strip()
            if v in ("true", "false"):
                result[k.strip()] = v == "true"
            elif v.isdigit():
                result[k.strip()] = int(v)
            elif v == "":
                result[k.strip()] = []
            else:
                result[k.strip()] = v
    return result


def parse_yaml(yaml_path: Path) -> Optional[dict]:
    """解析 skill.yaml"""
    if not yaml_path.exists():
        return None
    try:
        with open(yaml_path, "r", encoding="utf-8") as f:
            return (_yaml.safe_load(f) if YAML_AVAILABLE and _yaml else None) or _parse_manual_yaml(f.read())
    except Exception:
        return None


def _parse_manual_yaml(text: str) -> dict:
    """简化 YAML 解析"""
    result = {}
    for line in text.split("\n"):
        ls = line.strip()
        if not ls or ls.startswith("#"):
            continue
        if ls.startswith("  - "):
            continue  # 列表项不处理
        if ": " in ls:
            k, v = ls.split(": ", 1)
            v = v.strip().strip("'\"").strip()
            if v.isdigit():
                result[k.strip()] = int(v)
            elif v in ("true", "false"):
                result[k.strip()] = v == "true"
            else:
                result[k.strip()] = v
    return result


def sync_skill(skill_dir: Path, dry_run: bool = False) -> Tuple[bool, str, list]:
    """
    双向同步 skill.yaml 和 SKILL.md frontmatter
    返回: (是否有变化, 消息, 变更列表)
    """
    changes = []
    skill_yaml_path = skill_dir / "skill.yaml"
    skill_md_path = skill_dir / "SKILL.md"

    # 读取现有数据
    skill_yaml = parse_yaml(skill_yaml_path) or {}
    frontmatter, _ = parse_frontmatter(skill_md_path.read_text(encoding="utf-8")) if skill_md_path.exists() else ({}, "")

    # ── 1. skill.yaml → SKILL.md：同步 version ──
    yaml_version = skill_yaml.get("version", "")
    fm_version = frontmatter.get("version", "")
    if yaml_version and yaml_version != fm_version:
        changes.append(f"version: {fm_version} → {yaml_version}")
        if not dry_run:
            frontmatter["version"] = yaml_version

    # ── 2. SKILL.md → skill.yaml：同步 triggers ──
    fm_triggers = frontmatter.get("triggers", [])
    yaml_triggers = skill_yaml.get("triggers", [])
    if fm_triggers and fm_triggers != yaml_triggers:
        changes.append(f"triggers: {len(yaml_triggers)} → {len(fm_triggers)} 项")
        if not dry_run:
            skill_yaml["triggers"] = fm_triggers

    # ── 3. SKILL.md → skill.yaml：同步 description（如果 skill.yaml 更短）─
    fm_desc = frontmatter.get("description", "")
    yaml_desc = skill_yaml.get("description", "")
    if fm_desc and len(fm_desc) > len(yaml_desc) + 10:
        changes.append(f"description: 同步（从 SKILL.md）")
        if not dry_run:
            skill_yaml["description"] = fm_desc

    # ── 写入 ──
    if not changes:
        return False, "无需同步", []

    if dry_run:
        return True, "dry-run 完成", changes

    # 写入 skill.yaml
    if YAML_AVAILABLE and _yaml is not None:
        yaml_str = _yaml.dump(skill_yaml, allow_unicode=True, default_flow_style=False, sort_keys=False)
    else:
        lines = []
        for k, v in skill_yaml.items():
            if isinstance(v, list):
                lines.append(f"{k}:")
                for item in v:
                    lines.append(f"  - {item}")
            else:
                lines.append(f"{k}: {v}")
        yaml_str = "\n".join(lines)

    with open(skill_yaml_path, "w", encoding="utf-8") as f:
        f.write(yaml_str)

    # 写入 SKILL.md frontmatter
    if skill_md_path.exists():
        content = skill_md_path.read_text(encoding="utf-8")
        frontmatter_text = _serialize_frontmatter(frontmatter)
        if content.startswith("---"):
            end = content.index("---", 4)
            content = frontmatter_text + "\n" + content[end + 3:]
        else:
            content = frontmatter_text + "\n---\n" + content
        skill_md_path.write_text(content, encoding="utf-8")

    return True, "同步完成", changes


def _serialize_frontmatter(data: dict) -> str:
    """序列化 frontmatter"""
    if YAML_AVAILABLE and _yaml is not None:
        return _yaml.dump(data, allow_unicode=True, default_flow_style=False, sort_keys=False)
    lines = []
    for k, v in data.items():
        if isinstance(v, list):
            lines.append(f"{k}:")
            for item in v:
                lines.append(f"  - {item}")
        elif isinstance(v, bool):
            lines.append(f"{k}: {'true' if v else 'false'}")
        elif v is None or v == "":
            lines.append(f"{k}:")
        else:
            lines.append(f"{k}: {v}")
    return "\n".join(lines)


def sync_all(skills_root: Path, dry_run: bool = False) -> Tuple[int, int]:
    successes = 0
    failures = 0
    exclude = {".git", "node_modules", ".claude", ".agents", ".trae", ".cli", "__pycache__"}

    for item in sorted(skills_root.iterdir()):
        if not item.is_dir() or item.name in exclude or item.name.startswith("."):
            continue
        changed, msg, changes = sync_skill(item, dry_run=dry_run)
        if changed:
            print(f"{'[dry-run] ' if dry_run else ''}{item.name}: {msg} — {', '.join(changes)}")
            successes += 1
        else:
            print(f"  {item.name}: 无需同步")
    return successes, failures


def main():
    parser = argparse.ArgumentParser(description="同步 skill.yaml ↔ SKILL.md")
    parser.add_argument("path", help="技能目录或 skills 根目录")
    parser.add_argument("--all", action="store_true", help="批量同步")
    parser.add_argument("--dry-run", action="store_true", help="预览不写入")
    args = parser.parse_args()

    path = Path(args.path).resolve()
    if not path.exists():
        print(f"❌ 路径不存在: {path}")
        sys.exit(1)

    if args.all:
        s, f = sync_all(path, dry_run=args.dry_run)
        print(f"\n同步完成: ✅ {s} | ⏭️ {f}")
    else:
        changed, msg, changes = sync_skill(path, dry_run=args.dry_run)
        if changed:
            print(f"✅ {msg}: {', '.join(changes)}")
            sys.exit(0)
        else:
            print(f"⏭️ {msg}")
            sys.exit(0)


if __name__ == "__main__":
    main()
