#!/usr/bin/env python3
"""
AI News Daily Runner - 完整流程脚本

一键执行: 新闻收集 -> 分类 -> 生成HTML报告

使用方法:
    python run_daily.py
    python run_daily.py --open  # 生成后自动打开浏览器预览
"""

import subprocess
import sys
import os
from pathlib import Path
from datetime import datetime
import webbrowser
import argparse


def run_script(script_path, description):
    """运行Python脚本"""
    print()
    print("=" * 60)
    print(f"[执行] {description}")
    print("=" * 60)
    
    result = subprocess.run(
        [sys.executable, script_path],
        cwd=Path(script_path).parent
    )
    
    if result.returncode != 0:
        print(f"[错误] {description} 失败")
        return False
    
    return True


def main():
    """主函数"""
    parser = argparse.ArgumentParser(description='AI新闻日报完整流程')
    parser.add_argument('--open', action='store_true', help='生成后自动打开浏览器预览')
    parser.add_argument('--date', default=None, help='日报日期 (YYYY-MM-DD)')
    args = parser.parse_args()
    
    scripts_dir = Path(__file__).parent
    
    print()
    print("=" * 60)
    print("  AI 新闻日报生成器".center(60))
    print(f"  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}".center(60))
    print("=" * 60)
    
    # 第一步：收集新闻
    fetch_script = scripts_dir / "fetch_news.py"
    if not run_script(fetch_script, "第一步：收集新闻"):
        return
    
    # 第二步：分类新闻
    classify_script = scripts_dir / "classify_news.py"
    if not run_script(classify_script, "第二步：分类新闻"):
        return
    
    # 第三步：生成HTML报告
    generate_cmd = [sys.executable, str(scripts_dir / "generate_report.py")]
    if args.date:
        generate_cmd.extend(['--date', args.date])
    
    print()
    print("=" * 60)
    print("[执行] 第三步：生成HTML报告")
    print("=" * 60)
    
    result = subprocess.run(generate_cmd, cwd=scripts_dir)
    
    if result.returncode != 0:
        print("[错误] 生成HTML报告失败")
        return
    
    # 完成
    print()
    print("=" * 60)
    print("  AI 新闻日报生成完成！".center(60))
    print("=" * 60)
    
    # 输出文件路径
    output_dir = scripts_dir.parent / "output"
    date_str = args.date if args.date else datetime.now().strftime('%Y-%m-%d')
    report_file = output_dir / f"ai_news_daily_{date_str}.html"
    
    print(f"\n[报告文件] {report_file}")
    
    # 自动打开浏览器
    if args.open:
        print(f"\n[浏览器] 正在打开浏览器预览...")
        webbrowser.open(f'file://{report_file}')


if __name__ == "__main__":
    main()
