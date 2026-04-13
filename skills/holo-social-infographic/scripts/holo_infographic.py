# -*- coding: utf-8 -*-
"""
HOLO 社媒信息图生成器
统一 HTML + Playwright 方案

支持类型:
- comparison: 竞品对比长图
- spec: 技术参数图
- flow: 操作流程图

使用方法:
    python holo_infographic.py comparison
    python holo_infographic.py spec A3FLJ
    python holo_infographic.py spec ASJ
    python holo_infographic.py spec ASJ "Y:\图片路径\产品.jpg"
"""

from pathlib import Path
from playwright.sync_api import sync_playwright
import sys

# 导入产品数据库
from product_db import get_product_specs, list_products

# 路径配置
SKILL_DIR = Path(__file__).parent.parent
TEMPLATE_DIR = SKILL_DIR / 'templates'
OUTPUT_DIR = Path(r'c:\Users\Administrator\WorkBuddy\20260411130740\social-output\infographics')

# 确保输出目录存在
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def html_to_png(html_path: str, output_path: str, viewport_height: int = 3000):
    """
    HTML 转 PNG（Playwright 完整页面截图）

    Args:
        html_path: HTML 文件路径
        output_path: PNG 输出路径
        viewport_height: 视口高度（默认3000）
    """
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={'width': 1920, 'height': 100})
        page.goto(f'file:///{html_path}')
        page.set_viewport_size({'width': 1920, 'height': viewport_height})
        page.screenshot(path=output_path, full_page=True)
        browser.close()
    print(f'✅ 已生成: {output_path}')


def generate_comparison():
    """
    竞品对比长图

    数据来源流程：
    1. NAS 共享盘 - 读取 HOLO 全系产品参数
    2. 产品知识库 - 获取产品分类和定位
    3. 网络搜索 (Exa/WebSearch) - 搜索竞品数据（欧洲品牌、其他中国品牌）
    """
    from gen_comparison import generate as gen_comparison_module
    return gen_comparison_module()


def generate_spec(product_code: str = 'A3FLJ', image_path: str = None):
    """
    技术参数图
    
    Args:
        product_code: 产品型号
        image_path: NAS 产品图片路径（可选）
    """
    html_file = TEMPLATE_DIR / 'HOLO_技术参数图_国际版.html'

    if not html_file.exists():
        print(f'❌ 模板不存在: {html_file}')
        return

    # 获取产品参数
    specs = get_product_specs(product_code)
    
    # 读取 HTML 内容
    html_content = html_file.read_text(encoding='utf-8')
    
    # 替换产品参数占位符
    replacements = {
        '{{PRODUCT_NAME}}': specs['name'],
        '{{GENERATION}}': specs['generation'],
        '{{BELT_WIDTH}}': specs['belt_width'],
        '{{HEATING_PLATE}}': specs['heating_plate'],
        '{{TEMP_CONTROL}}': specs['temp_control'],
        '{{HEATING_TIME}}': specs['heating_time'],
        '{{PRESSURE}}': specs['pressure'],
        '{{VOLTAGE}}': specs['voltage'],
        '{{POWER}}': specs['power'],
        '{{TEMP_RANGE}}': specs['temp_range'],
        '{{ACCURACY}}': specs['accuracy'],
        '{{WEIGHT}}': specs['weight'],
        '{{DIMENSION}}': specs['dimension'],
        '{{CONTROLLER}}': specs['controller'],
        '{{PUMP}}': specs['pump'],
        '{{PNEUMATICS}}': specs['pneumatics'],
        '{{MATERIAL}}': specs['material'],
        '{{CONTROLLER_DESC}}': specs['controller_desc'],
        '{{PUMP_DESC}}': specs['pump_desc'],
        '{{PNEUMATICS_DESC}}': specs['pneumatics_desc'],
        '{{MATERIAL_DESC}}': specs['material_desc'],
        '{{DESC}}': specs['desc'],
    }
    
    for placeholder, value in replacements.items():
        html_content = html_content.replace(placeholder, value)
    
    # 处理图片
    if image_path and Path(image_path).exists():
        # 使用用户指定的图片
        image_url = str(Path(image_path).as_posix())
        img_tag = f'<img src="file:///{image_url}" alt="{product_code}">'
    else:
        # 自动从 NAS 扫描产品图片
        try:
            from nas_image_scanner import get_product_image
            nas_image = get_product_image(product_code)
            if nas_image and Path(nas_image).exists():
                print(f'  📷 已扫描到产品图片: {Path(nas_image).name}')
                img_tag = f'<img src="file:///{Path(nas_image).as_posix()}" alt="{product_code}">'
            else:
                img_tag = '<div class="hero-image-placeholder">Product Image</div>'
        except Exception as e:
            print(f'  ⚠️ 图片扫描失败: {e}')
            img_tag = '<div class="hero-image-placeholder">Product Image</div>'
    
    html_content = html_content.replace('{{PRODUCT_IMAGE}}', img_tag)

    # 保存临时 HTML
    temp_html = OUTPUT_DIR / f'temp_{product_code}_spec.html'
    temp_html.write_text(html_content, encoding='utf-8')

    output_file = OUTPUT_DIR / f'HOLO_{product_code}_技术参数图.png'
    html_to_png(str(temp_html), str(output_file), viewport_height=2400)
    
    # 删除临时 HTML
    temp_html.unlink(missing_ok=True)
    
    return str(output_file)


def generate_flow():
    """操作流程图"""
    html_file = TEMPLATE_DIR / 'HOLO_操作流程图_国际版.html'

    if not html_file.exists():
        print(f'❌ 模板不存在: {html_file}')
        return

    output_file = OUTPUT_DIR / 'HOLO_操作流程图.png'
    html_to_png(str(html_file), str(output_file), viewport_height=2000)
    return str(output_file)


def generate_faq(product_code: str = 'A3FLJ'):
    """
    FAQ 图文

    数据来源流程：
    1. NAS 共享盘 - 读取产品说明书中的 FAQ
    2. 产品知识库 - 读取常见问题
    3. 网络搜索 (Exa/WebSearch) - 补充行业 FAQ
    """
    from gen_faq import generate as gen_faq_module
    return gen_faq_module(product_code)


def generate_selector():
    """
    产品选型图

    数据来源流程：
    1. NAS 共享盘 - 读取全系列产品参数
    2. 产品知识库 - 获取产品分类和定位
    3. 网络搜索 (Exa/WebSearch) - 补充行业选型标准
    """
    from gen_selector import generate as gen_selector_module
    return gen_selector_module()


def generate_applications():
    """
    应用场景图

    数据来源流程：
    1. NAS 共享盘 - 读取客户案例、产品应用照片
    2. 产品知识库 - 获取各行业应用场景描述
    3. 网络搜索 (Exa/WebSearch) - 搜索皮带机行业应用场景
    """
    from gen_applications import generate as gen_apps_module
    return gen_apps_module()


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        print('\n可用命令:')
        print('  comparison                - 竞品对比长图')
        print('  spec [型号] [图片路径]    - 技术参数图')
        print('  flow                      - 操作流程图')
        print('  faq [型号]                - FAQ 图文')
        print('  selector                  - 产品选型图')
        print('  applications              - 应用场景图')
        print('\n示例:')
        print('  python holo_infographic.py spec A3FLJ')
        print('  python holo_infographic.py spec A3FLJ "Y:\\图片\\三代风冷.jpg"')
        print('  python holo_infographic.py faq A3FLJ')
        print('  python holo_infographic.py selector')
        print('  python holo_infographic.py applications')
        return

    cmd = sys.argv[1].lower()

    if cmd == 'comparison':
        generate_comparison()
    elif cmd == 'spec':
        product = sys.argv[2] if len(sys.argv) > 2 else 'A3FLJ'
        image_path = sys.argv[3] if len(sys.argv) > 3 else None
        generate_spec(product, image_path)
    elif cmd == 'flow':
        generate_flow()
    elif cmd == 'faq':
        product = sys.argv[2] if len(sys.argv) > 2 else 'A3FLJ'
        generate_faq(product)
    elif cmd == 'selector':
        generate_selector()
    elif cmd == 'applications':
        generate_applications()
    else:
        print(f'❌ 未知命令: {cmd}')


if __name__ == '__main__':
    main()
