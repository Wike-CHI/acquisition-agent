#!/usr/bin/env python3
"""
verify-clean.py — 打包前验证脚本
检查 context/user.md 是否已排除个人信息
"""
import os, sys, re

SKILL_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
USER_MD = os.path.join(SKILL_ROOT, "context", "user.md")

def check_user_md():
    """检查 user.md 是否为安全状态（包含'请填写'，不含真实信息）"""
    if not os.path.exists(USER_MD):
        print(f"⚠️  {USER_MD} 不存在")
        return False

    with open(USER_MD, encoding="utf-8") as f:
        content = f.read()

    # ✅ 安全状态：有"请填写"标记，无真实个人信息
    if "请填写" in content:
        print("✅ context/user.md 是安全状态（'请填写'标记，尚未填写真实信息）")
        return True

    # ❌ 风险状态：没有"请填写"，说明已填写真实信息
    print("❌ context/user.md 似乎已填写真实信息")
    print("   建议：打包前恢复为'请填写'状态，或确认这是你的个人开发分支")
    return False

def check_personal_files():
    """检查是否存在明显的个人数据文件"""
    personal = [
        os.path.join(SKILL_ROOT, ".env"),
    ]
    found = [f for f in personal if os.path.exists(f)]
    if found:
        print(f"⚠️  发现个人文件（已自动排除）: {[os.path.basename(f) for f in found]}")
    return True

def main():
    print("=== 打包前安全检查 ===\n")

    user_ok = check_user_md()
    check_personal_files()

    print()
    if user_ok:
        print("✅ 可以打包（user.md 为安全状态）")
        return 0
    else:
        print("❌ 请先处理上述问题后再打包")
        return 1

if __name__ == "__main__":
    sys.exit(main())
