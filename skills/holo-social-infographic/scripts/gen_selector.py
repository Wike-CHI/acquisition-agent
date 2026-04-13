# -*- coding: utf-8 -*-
"""
HOLO 产品选型图生成器
数据来源：NAS + 产品知识库 + 网络搜索
"""

from pathlib import Path
from playwright.sync_api import sync_playwright
import sys

# 路径配置
SKILL_DIR = Path(__file__).parent.parent
TEMPLATE_DIR = SKILL_DIR / 'templates'
OUTPUT_DIR = Path(r'c:\Users\Administrator\WorkBuddy\20260411130740\social-output\infographics')

def generate_selector_html(products, title="Product Selection Guide"):
    """生成产品选型图 HTML"""
    template_path = TEMPLATE_DIR / 'HOLO_产品选型图_国际版.html'

    if not template_path.exists():
        print(f"❌ 模板不存在: {template_path}")
        return None

    template = template_path.read_text(encoding='utf-8')

    # 生成产品卡片
    product_cards = ''
    for p in products:
        tags_html = ''.join([f'<span class="tag">{t}</span>' for t in p.get('tags', [])])

        product_cards += f'''
        <div class="product-card">
            <div class="card-header">
                <div class="product-code">{p['code']}</div>
                <div class="product-type">{p['type']}</div>
            </div>
            <div class="card-name">{p['name']}</div>
            <div class="card-specs">
                <div class="spec-row">
                    <span class="spec-label">Belt Width</span>
                    <span class="spec-value">{p['width']}</span>
                </div>
                <div class="spec-row">
                    <span class="spec-label">Power</span>
                    <span class="spec-value">{p['power']}</span>
                </div>
                <div class="spec-row">
                    <span class="spec-label">Cooling</span>
                    <span class="spec-value">{p['cooling']}</span>
                </div>
            </div>
            <div class="card-tags">{tags_html}</div>
        </div>
        '''

    # 生成选型建议
    suggestions_html = '''
    <div class="selection-guide">
        <h3>How to Select the Right Machine</h3>
        <div class="guide-steps">
            <div class="guide-step">
                <div class="step-num">1</div>
                <div class="step-text">
                    <strong>Measure your belt width</strong>
                    <span>Determine the maximum belt width you need to splice</span>
                </div>
            </div>
            <div class="guide-step">
                <div class="step-num">2</div>
                <div class="step-text">
                    <strong>Consider cooling type</strong>
                    <span>Air-cooled for standard, water-cooled for heavy-duty continuous operation</span>
                </div>
            </div>
            <div class="guide-step">
                <div class="step-num">3</div>
                <div class="step-text">
                    <strong>Evaluate production volume</strong>
                    <span>Higher volume may require faster heating models or multiple units</span>
                </div>
            </div>
        </div>
    </div>
    '''

    html = template.replace('{{title}}', title)
    html = html.replace('{{product_cards}}', product_cards)
    html = html.replace('{{selection_guide}}', suggestions_html)

    return html

def html_to_png(html_content, output_path):
    """HTML 转 PNG"""
    html_path = Path(output_path).with_suffix('.html')
    html_path.write_text(html_content, encoding='utf-8')

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={'width': 1920, 'height': 100})
        page.goto(f'file:///{html_path.absolute()}')
        page.set_viewport_size({'width': 1920, 'height': 2800})
        page.screenshot(path=str(output_path), full_page=True)
        browser.close()

    html_path.unlink()
    return output_path

def generate():
    """
    生成产品选型图

    数据来源流程：
    1. NAS 共享盘 - 读取全系列产品的真实参数
    2. 产品知识库 - 获取产品分类和定位
    3. 网络搜索 - 补充行业选型标准

    输出：HOLO全系列产品选型指南图
    """

    # 真实产品数据（来自 NAS + 知识库）
    products = [
        {
            'code': 'A2FLJ',
            'type': 'Air-Cooled Gen-2',
            'name': 'Standard Belt Splicing Machine',
            'width': '300 - 2100mm',
            'power': '12 kW',
            'cooling': 'Air-Cooled',
            'tags': ['Best Value', 'Standard Duty']
        },
        {
            'code': 'A3FLJ',
            'type': 'Air-Cooled Gen-3',
            'name': 'Heavy Duty Belt Splicing Machine',
            'width': '300 - 3600mm',
            'power': '18 kW',
            'cooling': 'Air-Cooled',
            'tags': ['Best Seller', 'Most Popular']
        },
        {
            'code': 'A4FLJ',
            'type': 'Air-Cooled Gen-4',
            'name': 'Premium Belt Splicing Machine',
            'width': '1800 - 2400mm',
            'power': '24 kW',
            'cooling': 'Air-Cooled',
            'tags': ['High Speed', 'Premium']
        },
        {
            'code': 'ASJ',
            'type': 'Water-Cooled',
            'name': 'Industrial Continuous Splicing Machine',
            'width': '600 - 4200mm',
            'power': '30 kW',
            'cooling': 'Water-Cooled',
            'tags': ['Heavy Duty', 'Continuous Operation']
        },
        {
            'code': 'FJ',
            'type': 'Easy-Clean',
            'name': 'Food Grade Belt Press Machine',
            'width': '600 - 2400mm',
            'power': '8 kW',
            'cooling': 'Air-Cooled',
            'tags': ['Food Grade', 'Hygienic']
        },
        {
            'code': 'XDT',
            'type': 'Guide Track',
            'name': 'Multi-Function Guide Track Machine',
            'width': '1300 - 2000mm',
            'power': '5 kW',
            'cooling': 'Air-Cooled',
            'tags': ['Accessory', 'Versatile']
        },
    ]

    html = generate_selector_html(products)
    if not html:
        return None

    output = OUTPUT_DIR / 'HOLO_产品选型图.png'
    html_to_png(html, output)

    print(f"✅ 已生成: {output}")
    return output

if __name__ == '__main__':
    generate()
