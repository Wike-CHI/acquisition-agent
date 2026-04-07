#!/usr/bin/env python3
"""
skill-cli publish — 打包并发布技能到本地分发目录

用法：
  python publish_skill.py <skill-dir>                    # 打包技能
  python publish_skill.py <skill-dir> --output dist/    # 指定输出目录
  python publish_skill.py <skills-root> --all           # 批量打包所有有 skill.yaml 的技能

输出格式：skills/<skill-name>-<version>.skill（ZIP）

依赖：Python 3.8+ 标准库（zipfile, pathlib）
"""

import sys
import argparse
import zipfile
import re
from pathlib import Path
from typing import Optional

try:
    import yaml as _yaml
    YAML_AVAILABLE = True
except ImportError:
    YAML_AVAILABLE = False
    _yaml = None


EXCLUDE_DIRS = {".git", "node_modules", "__pycache__", ".serena", "release", "dist", ".venv"}
EXCLUDE_FILES = {".pyc", ".pyo", ".env", "package-lock.json", ".DS_Store", "Thumbs.db"}


def parse_skill_yaml(skill_path: Path) -> Optional[dict]:
    yaml_path = skill_path / "skill.yaml"
    if not yaml_path.exists():
        return None
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


def get_version(skill_path: Path) -> str:
    data = parse_skill_yaml(skill_path)
    if data:
        return data.get("version", "0.0.0")
    # 回退：从 SKILL.md frontmatter 读取
    fm_path = skill_path / "SKILL.md"
    if fm_path.exists():
        content = fm_path.read_text(encoding="utf-8", errors="replace")
        if content.startswith("\ufeff"):
            content = content[1:]
        for line in content.split("\n")[:20]:
            if line.startswith("version:"):
                return line.split(":", 1)[1].strip().strip('"').strip()
    return "0.0.0"


def should_exclude(path: Path, is_dir: bool) -> bool:
    if is_dir:
        return path.name in EXCLUDE_DIRS
    ext = path.suffix.lower()
    return any(path.name.endswith(e) for e in EXCLUDE_FILES) or ext in {".pyc", ".pyo"}


def package_skill(skill_path: Path, output_dir: Path, dry_run: bool = False) -> Optional[str]:
    """
    打包单个技能为 .skill 文件
    返回: 打包后的文件名，或 None（失败）
    """
    skill_name = skill_path.name
    version = get_version(skill_path)
    output_name = f"{skill_name}-{version}.skill"
    output_path = output_dir / output_name

    if dry_run:
        print(f"  [dry-run] 打包: {output_name}")
        return output_name

    # 验证 skill.yaml 存在
    if not (skill_path / "skill.yaml").exists():
        print(f"  ⚠️ 跳过（无 skill.yaml）: {skill_name}")
        return None

    try:
        with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as zf:
            for file_path in sorted(skill_path.rglob("*")):
                if should_exclude(file_path, file_path.is_dir()):
                    continue
                arcname = file_path.relative_to(skill_path)
                zf.write(file_path, arcname)

        size_kb = output_path.stat().st_size // 1024
        print(f"  ✅ {output_name} ({size_kb}KB)")
        return output_name
    except Exception as e:
        print(f"  ❌ {skill_name}: {e}")
        return None


def package_all(skills_root: Path, output_dir: Path, dry_run: bool = False) -> tuple[int, int]:
    exclude = {".git", "node_modules", ".claude", ".agents", ".trae", ".cli", "__pycache__", ".venv"}
    successes = 0
    failures = 0

    output_dir.mkdir(parents=True, exist_ok=True)

    for item in sorted(skills_root.iterdir()):
        if not item.is_dir() or item.name in exclude or item.name.startswith("."):
            continue
        if not (item / "skill.yaml").exists():
            continue

        print(f"\n📦 {item.name}:")
        result = package_skill(item, output_dir, dry_run=dry_run)
        if result:
            successes += 1
        else:
            failures += 1

    return successes, failures


def main():
    parser = argparse.ArgumentParser(description="打包技能为 .skill 文件")
    parser.add_argument("path", help="技能目录或 skills 根目录")
    parser.add_argument("--output", "-o", default="dist", help="输出目录（默认 dist/）")
    parser.add_argument("--dry-run", action="store_true", help="预览不打包")
    parser.add_argument("--all", action="store_true", help="打包所有有 skill.yaml 的技能")
    args = parser.parse_args()

    path = Path(args.path).resolve()
    if not path.exists():
        print(f"❌ 路径不存在: {path}")
        sys.exit(1)

    output_dir = Path(args.output).resolve()

    if args.all:
        s, f = package_all(path, output_dir, dry_run=args.dry_run)
        print(f"\n结果: ✅ {s} | ❌ {f}")
    else:
        result = package_skill(path, output_dir, dry_run=args.dry_run)
        if result:
            print(f"\n✅ 打包完成: {result}")
            sys.exit(0)
        else:
            print(f"\n❌ 打包失败")
            sys.exit(1)


if __name__ == "__main__":
    main()
