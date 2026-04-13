#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
HOLO 社媒图片生成器 v6.0 - CLI 入口（AI-First 架构）

v6 核心变更：
  ❌ 删除：HTML 生成逻辑（那是 AI 的活，不该 Python 干）
  ✅ 保留：产品数据查询（data 命令）
  ✅ 保留：HTML → PNG 渲染（render 命令）
  ✅ 保留：辅助信息查询（products/platforms/languages）

用法：
    # 查询产品数据（AI 读取后自己写 HTML）
    python holo_gen.py data A3FLJ1200

    # 渲染 HTML 为 PNG（AI 写好 HTML 后调用）
    python holo_gen.py render input.html output.png

    # 辅助查询
    python holo_gen.py products
    python holo_gen.py platforms
    python holo_gen.py list-languages
"""

import argparse
import json
import os
import sys
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from data.product_data import (
    get_product_by_code,
    get_all_products,
    search_product,
    find_product_image,
)
from data.platform_styles import (
    get_platform_style,
    list_platforms,
)
from data.i18n import (
    list_languages as i18n_list_languages,
    validate_lang,
    VALID_AUDIENCES,
    SUPPORTED_LANGUAGES,
)


# ================================================================
#  数据查询命令
# ================================================================

def cmd_data(product_code: str):
    """
    查询产品数据，输出 JSON。

    这是给 AI 看的原始数据。AI 读取后自行决定如何翻译、排版、布局。
    """
    product = get_product_by_code(product_code)
    if not product:
        print(json.dumps({"error": f"Product not found: {product_code}"}, ensure_ascii=False))
        sys.exit(1)

    # 查找图片
    image_path = find_product_image(product_code)

    # 完整数据字典
    data = {
        "code": product.code,
        "name_cn": product.name_cn,
        "name_en": product.name_en,
        "category": product.category,
        "version": product.version,       # "2"/"3"/"4"
        "spec_size": product.spec_size,   # "1200"
        "specs": product.specs,           # 基础规格 dict
        "bom_components": product.bom_components,     # [{"name","spec","material"}, ...]
        "electrical_parts": product.electrical_parts, # [{"name","model"}, ...]
        "usage_params": product.usage_params,         # {"temp_range":"0-250°C", ...}
        "suppliers": product.suppliers,               # [{"category","supplier","products"}, ...]
        "image_path": image_path,
        # audience 分级预览
        "audience_bom": {
            "bom_count": len(product.bom_components),
            "elec_count": len(product.electrical_parts),
            "supplier_count": len(product.suppliers),
        },
        "audience_end_customer": {
            "param_count": len(product.usage_params),
            "param_keys": list(product.usage_params.keys()),
            "scenarios": product._get_scenarios(),
        },
    }

    print(json.dumps(data, ensure_ascii=False, indent=2))


def cmd_products():
    """列出所有产品（精简版）"""
    products = get_all_products()
    result = []
    for p in products:
        result.append({
            "code": p.code,
            "name_cn": p.name_cn,
            "name_en": p.name_en,
            "category": p.category,
            "version": f"第{p.version}代" if p.version else "",
            "spec_size": p.spec_size,
            "bom_count": len(p.bom_components),
            "elec_count": len(p.electrical_parts),
        })
    print(json.dumps(result, ensure_ascii=False, indent=2))


def cmd_platforms():
    """列出所有平台风格（含尺寸和配色）"""
    platforms = list_platforms()
    # 补充完整的风格信息
    from data.platform_styles import PLATFORM_STYLES
    full_info = []
    for name, style in PLATFORM_STYLES.items():
        full_info.append({
            "name": style.name,
            "display_name": style.display_name,
            "size": {"width": style.size[0], "height": style.size[1]},
            "colors": {
                "primary": style.primary_color,
                "secondary": style.secondary_color,
                "background": style.bg_color,
                "text": style.text_color,
                "accent": style.accent_color,
            },
            "font_family": style.font_family,
            "style_tag": style.style,
            "features": style.features,
        })
    print(json.dumps(full_info, ensure_ascii=False, indent=2))


def cmd_list_languages():
    """列出支持的语言"""
    langs = i18n_list_languages()
    print(json.dumps({
        "languages": langs,
        "valid_audiences": VALID_AUDIENCES,
        "rtl_languages": ["ar"],
    }, ensure_ascii=False, indent=2))


# ================================================================
#  渲染命令
# ================================================================

def cmd_render(input_html: str, output_path: str = None, width: int = None, height: int = None):
    """
    将已有的 HTML 渲染为 PNG 图片。

    Args:
        input_html: HTML 文件路径（或 --html 内容）
        output_path: 输出 PNG 路径（默认自动生成）
        width: 视口宽度（默认从 HTML 检测或 1080）
        height: 视口高度（默认从 HTML 检测或 1350）
    """
    from renderer.playwright_renderer import render_html_to_image

    # 读取 HTML 内容
    if not os.path.exists(input_html):
        print(f"❌ HTML file not found: {input_html}")
        sys.exit(1)

    with open(input_html, "r", encoding="utf-8") as f:
        html_content = f.read()

    # 自动检测尺寸（从 body style 中提取）
    if width is None or height is None:
        import re
        w_match = re.search(r'width\s*:\s*(\d+)\s*px', html_content)
        h_match = re.search(r'height\s*:\s*(\d+)\s*px', html_content)
        if w_match and h_match:
            detected_w = int(w_match.group(1))
            detected_h = int(h_match.group(1))
            if 100 < detected_w < 10000 and 100 < detected_h < 10000:
                width = width or detected_w
                height = height or detected_h

    width = width or 1080
    height = height or 1350

    # 默认输出路径
    if not output_path:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        base_name = os.path.splitext(os.path.basename(input_html))[0]
        output_dir = os.path.dirname(input_html) or "social-output"
        output_path = os.path.join(output_dir, f"{base_name}_{timestamp}.png")

    # 确保输出目录存在
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)

    print(f"🎨 Rendering {width}x{height} → {output_path}")
    result = render_html_to_image(html_content, output_path, width, height)
    print(f"✅ Done: {result}")
    return result


# ================================================================
#  CLI 入口
# ================================================================

def main():
    parser = argparse.ArgumentParser(
        description="HOLO 社媒图片生成器 v6.0 — AI-First 架构",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例 (v6 — AI-First):

  # 1️⃣ AI 先查数据：
  python holo_gen.py data A3FLJ1200

  # 2️⃣ AI 自己写好 HTML 后，调渲染：
  python holo_gen.py render my_design.html output.png

  # 3️⃣ 辅助查询：
  python holo_gen.py products
  python holo_gen.py platforms
  python holo_gen.py list-languages
        """,
    )

    subparsers = parser.add_subparsers(dest="command", help="命令")

    # ── data 命令：查询产品数据 ──
    data_parser = subparsers.add_parser("data", help="查询产品完整数据（JSON输出）")
    data_parser.add_argument("product_code", help="产品编码 (如 A3FLJ1200)")

    # ── render 命令：渲染 HTML → PNG ──
    render_parser = subparsers.add_parser("render", help="渲染 HTML 为 PNG 图片")
    render_parser.add_argument("input_html", help="输入 HTML 文件路径")
    render_parser.add_argument("output", nargs="?", default=None, help="输出 PNG 路径（可选）")
    render_parser.add_argument("--width", "-W", type=int, default=None, help="视口宽度（默认自动检测）")
    render_parser.add_argument("--height", "-H", type=int, default=None, help="视口高度（默认自动检测）")

    # ── 辅助查询命令 ──
    subparsers.add_parser("products", help="列出所有产品（JSON）")
    subparsers.add_parser("platforms", help="列出所有平台风格（JSON）")
    subparsers.add_parser("list-languages", help="列出支持的语言和受众级别（JSON）")

    args = parser.parse_args()

    if args.command == "data":
        cmd_data(args.product_code)
    elif args.command == "render":
        cmd_render(args.input_html, args.output, args.width, args.height)
    elif args.command == "products":
        cmd_products()
    elif args.command == "platforms":
        cmd_platforms()
    elif args.command == "list-languages":
        cmd_list_languages()
    else:
        parser.print_help()
        print("\n💡 v6 提示：不再支持 'generate' 命令。")
        print("   正确流程：'data' 查数据 → AI 写 HTML → 'render' 截图")


if __name__ == "__main__":
    main()
