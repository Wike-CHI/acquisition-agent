#!/usr/bin/env python3
"""
skill-cli validate — 验证 skill.yaml 语法和完整性

用法：
  python validate_skill.py <skill-dir>
  python validate_skill.py <skill-dir> --strict

依赖：Python 3.8+ 标准库（yaml, pathlib）
"""

import sys
import re
import argparse
from pathlib import Path
from typing import List, Tuple, Optional

try:
    import yaml as _yaml
    YAML_AVAILABLE = True
except ImportError:
    YAML_AVAILABLE = False
    _yaml = None


# ── Schema 定义 ────────────────────────────────────────────

REQUIRED_FIELDS = ["name", "version", "description"]
OPTIONAL_FIELDS = [
    "triggers", "dependencies", "tags", "author", "license",
    "entry", "directories", "requires", "capability", "priority",
    "compatibility"
]
ALL_FIELDS = REQUIRED_FIELDS + OPTIONAL_FIELDS

VALID_CAPABILITIES = ["core", "enhanced", "optional"]
VALID_LICENSES = ["Proprietary", "MIT", "Apache-2.0", "GPL-3.0"]
NAME_PATTERN = re.compile(r"^[a-z0-9][a-z0-9-]*$")
VERSION_PATTERN = re.compile(r"^\d+\.\d+\.\d+$")


# ── 验证函数 ───────────────────────────────────────────────

def validate_name(name: str) -> Tuple[bool, str]:
    if not isinstance(name, str):
        return False, f"name 必须为字符串，实际为 {type(name).__name__}"
    if not NAME_PATTERN.match(name):
        return False, f"name 必须是 kebab-case（字母/数字/连字符），实际: {name}"
    return True, ""


def validate_version(version: str) -> Tuple[bool, str]:
    if not isinstance(version, str):
        return False, f"version 必须为字符串，实际为 {type(version).__name__}"
    if not VERSION_PATTERN.match(version):
        return False, f"version 必须为 semver（x.y.z），实际: {version}"
    return True, ""


def validate_description(description: str) -> Tuple[bool, str]:
    if not isinstance(description, str):
        return False, f"description 必须为字符串"
    if len(description) < 10:
        return False, f"description 太短（<10字符）：{description[:50]}"
    if len(description) > 200:
        return False, f"description 太长（>200字符）：{description[:50]}..."
    return True, ""


def validate_triggers(triggers: list) -> Tuple[bool, str]:
    if not isinstance(triggers, list):
        return False, f"triggers 必须为列表，实际为 {type(triggers).__name__}"
    for t in triggers:
        if not isinstance(t, str):
            return False, f"trigger 项必须为字符串，实际为 {type(t).__name__}: {t}"
    return True, ""


def validate_dependencies(deps: list) -> Tuple[bool, str]:
    if not isinstance(deps, list):
        return False, f"dependencies 必须为列表"
    dep_pattern = re.compile(r"^[a-z0-9][a-z0-9-]*(@[>=<~\^]+[\d.]+)?$")
    for d in deps:
        if not isinstance(d, str):
            return False, f"dependency 必须为字符串: {d}"
        if not dep_pattern.match(d):
            return False, f"dependency 格式错误: {d}（应为 skill-name 或 skill-name@version）"
    return True, ""


def validate_capability(cap: str) -> Tuple[bool, str]:
    if cap not in VALID_CAPABILITIES:
        return False, f"capability 必须为 {VALID_CAPABILITIES} 之一，实际: {cap}"
    return True, ""


def validate_priority(pri: int) -> Tuple[bool, str]:
    if not isinstance(pri, int):
        return False, f"priority 必须为整数"
    if not 1 <= pri <= 100:
        return False, f"priority 必须在 1-100 之间"
    return True, ""


def validate_skill_yaml(skill_dir: Path, strict: bool = False) -> Tuple[bool, List[str]]:
    """
    验证 skill_dir 中的 skill.yaml
    返回: (是否通过, 错误列表)
    """
    errors = []
    skill_yaml_path = skill_dir / "skill.yaml"

    if not skill_yaml_path.exists():
        errors.append(f"skill.yaml 不存在: {skill_yaml_path}")
        return False, errors

    # 读取文件
    try:
        with open(skill_yaml_path, "r", encoding="utf-8") as f:
            data = _yaml.safe_load(f) if YAML_AVAILABLE and _yaml else _parse_yaml_manual(f.read())
    except Exception as e:
        errors.append(f"skill.yaml 读取失败: {e}")
        return False, errors

    if data is None:
        errors.append("skill.yaml 为空")
        return False, errors

    if not isinstance(data, dict):
        errors.append("skill.yaml 根必须为字典")
        return False, errors

    # 必需字段
    for field in REQUIRED_FIELDS:
        if field not in data:
            errors.append(f"缺少必需字段: {field}")

    # 字段级验证
    if "name" in data:
        ok, msg = validate_name(data["name"])
        if not ok:
            errors.append(f"name: {msg}")

    if "version" in data:
        ok, msg = validate_version(data["version"])
        if not ok:
            errors.append(f"version: {msg}")

    if "description" in data:
        ok, msg = validate_description(data["description"])
        if not ok:
            errors.append(f"description: {msg}")

    if "triggers" in data:
        ok, msg = validate_triggers(data["triggers"])
        if not ok:
            errors.append(f"triggers: {msg}")

    if "dependencies" in data:
        ok, msg = validate_dependencies(data["dependencies"])
        if not ok:
            errors.append(f"dependencies: {msg}")

    if "capability" in data:
        ok, msg = validate_capability(data["capability"])
        if not ok:
            errors.append(f"capability: {msg}")

    if "priority" in data:
        ok, msg = validate_priority(data["priority"])
        if not ok:
            errors.append(f"priority: {msg}")

    # 未知字段（strict 模式警告）
    if strict:
        known = set(REQUIRED_FIELDS + OPTIONAL_FIELDS + ["_synced_at", "_layer"])
        unknown = set(data.keys()) - known
        if unknown:
            errors.append(f"未知字段（strict 模式）: {', '.join(sorted(unknown))}")

    # SKILL.md 存在性检查
    if "entry" in data:
        entry_path = skill_dir / data["entry"]
    else:
        entry_path = skill_dir / "SKILL.md"

    if not entry_path.exists():
        errors.append(f"入口文件不存在: {entry_path}")

    return len(errors) == 0, errors


def _parse_yaml_manual(content: str) -> dict:
    """当 PyYAML 不可用时的简化 YAML 解析（仅支持顶级键值对）"""
    result = {}
    for line in content.split("\n"):
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if ":" in line:
            key, val = line.split(":", 1)
            key = key.strip()
            val = val.strip().strip("'\"").strip()
            if val.startswith("["):
                # 列表
                items = [i.strip().strip("'\"").strip() for i in val.strip("[]").split(",") if i.strip()]
                result[key] = items
            elif val == "" or val == "null":
                result[key] = None
            elif val in ("true", "false"):
                result[key] = val == "true"
            elif val.isdigit():
                result[key] = int(val)
            else:
                result[key] = val
    return result


# ── 主程序 ────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="验证 skill.yaml 元数据")
    parser.add_argument("skill_dir", help="技能目录路径")
    parser.add_argument("--strict", action="store_true", help="严格模式（检查未知字段）")
    args = parser.parse_args()

    skill_dir = Path(args.skill_dir).resolve()
    if not skill_dir.exists():
        print(f"❌ 目录不存在: {skill_dir}")
        sys.exit(1)

    ok, errors = validate_skill_yaml(skill_dir, strict=args.strict)

    if ok:
        name = skill_dir.name
        print(f"✅ {name}/skill.yaml 验证通过")
        sys.exit(0)
    else:
        print(f"❌ {skill_dir.name}/skill.yaml 验证失败：")
        for err in errors:
            print(f"   - {err}")
        sys.exit(1)


if __name__ == "__main__":
    main()
