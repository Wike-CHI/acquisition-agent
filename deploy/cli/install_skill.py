#!/usr/bin/env python3
"""
skill-cli install — 安装技能的依赖技能

用法：
  python install_skill.py <skill-dir>              # 安装单个技能的依赖
  python install_skill.py <skill-dir> --dry-run    # 预览不安装
  python install_skill.py <skills-root> --all     # 批量安装所有技能依赖

依赖：从 skill.yaml 的 dependencies 字段读取，格式：
  dependencies:
    - company-research        # 无版本约束
    - linkedin@>=1.5.0      # 可选版本约束

依赖：Python 3.8+ 标准库
"""

import sys
import re
import argparse
from pathlib import Path
from typing import List, Tuple, Optional
import shutil

try:
    import yaml as _yaml
    YAML_AVAILABLE = True
except ImportError:
    YAML_AVAILABLE = False
    _yaml = None


SKILLS_ROOT = Path.home() / ".workbuddy" / "skills"
GITHUB_REPO = "https://github.com/Wike-CHI/acquisition-agent.git"
GITHUB_RAW = "https://raw.githubusercontent.com/Wike-CHI/acquisition-agent/main/skills"


def parse_skill_yaml(skill_path: Path) -> dict:
    yaml_path = skill_path / "skill.yaml"
    if not yaml_path.exists():
        return {}
    try:
        with open(yaml_path, "r", encoding="utf-8") as f:
            content = f.read()
        if content.startswith("\ufeff"):
            content = content[1:]
        if YAML_AVAILABLE and _yaml:
            return _yaml.safe_load(content) or {}
        return _parse_yaml_minimal(content)
    except Exception:
        return {}


def _parse_yaml_minimal(text: str) -> dict:
    result = {}
    for line in text.split("\n"):
        ls = line.strip()
        if not ls or ls.startswith("#"):
            continue
        if ls.startswith("  - "):
            key = "dependencies"
            result.setdefault(key, [])
            result[key].append(ls[4:].strip())
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


def parse_dependency(dep: str) -> Tuple[str, Optional[str]]:
    """解析 dependency 字符串，返回 (skill_name, version_constraint)"""
    if "@" in dep:
        name, constraint = dep.split("@", 1)
        return name.strip(), constraint.strip()
    return dep.strip(), None


def check_skill_exists(skill_name: str, skills_root: Path) -> bool:
    """检查技能是否已安装"""
    return (skills_root / skill_name / "SKILL.md").exists()


def install_from_github(skill_name: str, dest_dir: Path, dry_run: bool = False) -> Tuple[bool, str]:
    """从 GitHub 安装技能到 dest_dir"""
    if dry_run:
        return True, f"[dry-run] git clone {GITHUB_REPO} ..."

    dest_path = dest_dir / skill_name
    if dest_path.exists():
        return True, f"已存在，跳过: {skill_name}"

    # 尝试单文件下载（仅 SKILL.yaml + references）
    # 或 git clone
    import subprocess
    try:
        # 使用 git clone --depth 1 最小化下载
        result = subprocess.run(
            ["git", "clone", "--depth", "1", "--filter=blob:none",
             "--sparse", GITHUB_REPO, str(dest_dir / "._tmp_clone")],
            capture_output=True, text=True, timeout=60
        )
        if result.returncode != 0:
            return False, f"clone 失败: {result.stderr}"

        clone_dir = dest_dir / "._tmp_clone"
        # sparse checkout 只拿目标技能
        subprocess.run(["git", "sparse-checkout", "set", f"skills/{skill_name}"],
                      cwd=clone_dir, capture_output=True)
        subprocess.run(["git", "checkout"], cwd=clone_dir, capture_output=True)

        src = clone_dir / "skills" / skill_name
        if src.exists():
            import shutil
            shutil.copytree(src, dest_path)
            shutil.rmtree(clone_dir)
            return True, f"已安装: {skill_name}"
        else:
            shutil.rmtree(clone_dir)
            return False, f"GitHub 上未找到: {skill_name}"
    except Exception as e:
        return False, f"安装失败: {e}"


def install_skill(skill_path: Path, skills_root: Path, dry_run: bool = False) -> Tuple[int, int, list]:
    """
    安装单个技能的依赖
    返回: (成功数, 失败数, 失败列表)
    """
    data = parse_skill_yaml(skill_path)
    deps = data.get("dependencies", [])
    if not deps:
        return 0, 0, []

    successes = 0
    failures = 0
    failed = []

    for dep in deps:
        skill_name, constraint = parse_dependency(dep)

        if check_skill_exists(skill_name, skills_root):
            print(f"  ✅ {skill_name} (已安装)")
            successes += 1
            continue

        # 尝试从 GitHub 安装
        ok, msg = install_from_github(skill_name, skills_root, dry_run=dry_run)
        if ok:
            print(f"  ✅ {skill_name}: {msg}")
            successes += 1
        else:
            print(f"  ❌ {skill_name}: {msg}")
            failures += 1
            failed.append(skill_name)

    return successes, failures, failed


def install_all(skills_root: Path, dry_run: bool = False) -> Tuple[int, int]:
    """扫描所有技能，批量安装依赖"""
    exclude = {".git", "node_modules", ".claude", ".agents", ".trae", ".cli", "__pycache__"}
    total_success = 0
    total_fail = 0

    for item in sorted(skills_root.iterdir()):
        if not item.is_dir() or item.name in exclude or item.name.startswith("."):
            continue
        yaml_path = item / "skill.yaml"
        if not yaml_path.exists():
            continue

        data = parse_skill_yaml(item)
        deps = data.get("dependencies", [])
        if not deps:
            continue

        print(f"\n📦 {item.name}:")
        s, f, _ = install_skill(item, skills_root, dry_run=dry_run)
        total_success += s
        total_fail += f

    return total_success, total_fail


def main():
    parser = argparse.ArgumentParser(description="安装技能依赖")
    parser.add_argument("path", help="技能目录或 skills 根目录")
    parser.add_argument("--dry-run", action="store_true", help="预览不安装")
    parser.add_argument("--all", action="store_true", help="批量安装")
    args = parser.parse_args()

    path = Path(args.path).resolve()
    if not path.exists():
        print(f"❌ 路径不存在: {path}")
        sys.exit(1)

    if args.all:
        s, f = install_all(path, dry_run=args.dry_run)
        print(f"\n结果: ✅ {s} | ❌ {f}")
    else:
        s, f, failed = install_skill(path, SKILLS_ROOT, dry_run=args.dry_run)
        print(f"\n结果: ✅ {s} | ❌ {f}")
        if failed:
            print(f"失败: {', '.join(failed)}")

    sys.exit(0)


if __name__ == "__main__":
    main()
