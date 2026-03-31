#!/usr/bin/env python3
"""
package.py — 打包脚本
生成可分发的 zip 包，排除个人文件
"""
import os, sys, zipfile, datetime

SKILL_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VERSION = "v2.1.0"
OUTPUT = os.path.join(SKILL_ROOT, "honglong-acquisition-" + VERSION + ".zip")

# 打包时排除的文件/目录（相对路径）
EXCLUDE = {
    # 个人数据
    "context/user.md",
    "data",
    "test-output",
    ".env",
    "results.tsv",
    "memskill-test.log",
    "memskill-test-final.log",
    "stress-test-1.log",
    "stress-test-2.log",
    "stress-test-3.log",
    "test-output.log",
    # 开发历史（已不再需要的文档）
    "COMPLETE-AUDIT-REPORT.md",
    "COMPLETE-PUBLISH-GUIDE.md",
    "AUTORESEARCH-REPORT.md",
    "EXTERNAL-SKILLS-ANALYSIS-DEEP.md",
    "EXTERNAL-SKILLS-ANALYSIS.md",
    "MEMSKILL-ANALYSIS.md",
    "MEMSKILL-INTEGRATION-GUIDE.md",
    "MEMSKILL-README.md",
    "PACKAGE-VERSION-AUDIT.md",
    "PACKAGE-STRUCTURE.md",
    "ROBUSTNESS-REVIEW.md",
    "SKILL-CLUSTER-AUDIT-REPORT.md",
    "SKILL-DESIGN-PATTERNS-REPORT.md",
    "BOOTSTRAP.md",
    "ENHANCEMENT.md",
    "MARKET-DEEP-DIVE.md",
    "NAS-PRODUCT-REPORT.md",
    "FILE-LIST.md",
    "KNOWLEDGE-INDEX.md",
    "SYSTEM-ARCHITECTURE.md",
    "SKILLS-ROUTER.md",
    "VERSION-TIMELINE.md",
    "RELEASE-v1.4.0.md",
    "PLATFORM-SUPPORT.md",
    "A2UI-INTEGRATION-GUIDE.md",
    "AGENT-REACH-INTEGRATION.md",
    "CONTEXT-MANAGEMENT-GUIDE.md",
    "DEPLOYMENT.md",
    "DIRECTORY-STRUCTURE-TRUTH.md",
    "EXECUTION-CONTROL.md",
    "CHANNEL-ROUTER.md",
    "COMPETITOR-ANALYSIS-GUIDE.md",
    "LINKEDIN-OUTREACH.md",
    "LINKEDIN-DECISION-MAKER-GUIDE.md",
    "EMAIL-QUALITY-CHECK.md",
    "SELF-EVOLUTION-SYSTEM.md",
    "FALLBACK-PLAN.md",
    "INSTALL.md",
    "GITHUB-PUBLISH-GUIDE.md",
    "QUICK-START.md",
    "autoresearch.config.md",
}

def should_exclude(rel_path):
    rel_path = rel_path.replace("\\", "/")
    for ex in EXCLUDE:
        if rel_path == ex or rel_path.startswith(ex + "/"):
            return True
    if os.path.basename(rel_path).startswith("temp-"):
        return True
    if rel_path.endswith(".log"):
        return True
    return False

def package():
    print("=== 打包 HOLO 红龙获客系统 " + VERSION + " ===\n")

    # 检查 user.md 是否为安全状态
    user_md = os.path.join(SKILL_ROOT, "context", "user.md")
    if os.path.exists(user_md):
        with open(user_md, encoding="utf-8") as f:
            content = f.read()
        if "请填写" not in content:
            print("  WARNING: context/user.md 似乎已填写真实信息")
            print("  建议打包前确认为'请填写'状态，或确认这是你的个人分支\n")

    included = []
    excluded = []

    with zipfile.ZipFile(OUTPUT, "w", zipfile.ZIP_DEFLATED) as zf:
        for dirpath, dirnames, filenames in os.walk(SKILL_ROOT):
            dirnames[:] = [d for d in dirnames if not should_exclude(
                os.path.relpath(os.path.join(dirpath, d), SKILL_ROOT))]

            for fname in filenames:
                full_path = os.path.join(dirpath, fname)
                rel_path = os.path.relpath(full_path, SKILL_ROOT)
                if should_exclude(rel_path):
                    excluded.append(rel_path)
                    continue
                zf.write(full_path, rel_path)
                included.append(rel_path)

    print("  包含文件: " + str(len(included)))
    print("  排除文件: " + str(len(excluded)))
    print("  打包完成: " + OUTPUT)
    print("  文件大小: " + str(os.path.getsize(OUTPUT) // 1024) + " KB")
    print()
    print("接收者解压后：")
    print("  1. 打开 context/user.md 填写自己的信息")
    print("  2. 验证 skills/ 目录中已有全部依赖技能（已打包）")

if __name__ == "__main__":
    package()
