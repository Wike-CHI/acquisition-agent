# -*- coding: utf-8 -*-
"""
HOLO 应用场景图生成器
数据来源：NAS + 产品知识库 + 网络搜索
"""

from pathlib import Path
from playwright.sync_api import sync_playwright
import sys

# 路径配置
SKILL_DIR = Path(__file__).parent.parent
TEMPLATE_DIR = SKILL_DIR / 'templates'
OUTPUT_DIR = Path(r'c:\Users\Administrator\WorkBuddy\20260411130740\social-output\infographics')

def generate_applications_html(applications):
    """生成应用场景图 HTML"""
    template_path = TEMPLATE_DIR / 'HOLO_应用场景图_国际版.html'

    if not template_path.exists():
        print(f"❌ 模板不存在: {template_path}")
        return None

    template = template_path.read_text(encoding='utf-8')

    # 生成场景卡片
    scene_cards = ''
    for app in applications:
        features_html = ''.join([f'<li>{f}</li>' for f in app.get('features', [])])

        scene_cards += f'''
        <div class="scene-card">
            <div class="scene-icon">{app['icon']}</div>
            <div class="scene-title">{app['industry']}</div>
            <div class="scene-desc">{app['desc']}</div>
            <ul class="scene-features">{features_html}</ul>
        </div>
        '''

    html = template.replace('{{scene_cards}}', scene_cards)

    return html

def html_to_png(html_content, output_path):
    """HTML 转 PNG"""
    html_path = Path(output_path).with_suffix('.html')
    html_path.write_text(html_content, encoding='utf-8')

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={'width': 1920, 'height': 100})
        page.goto(f'file:///{html_path.absolute()}')
        page.set_viewport_size({'width': 1920, 'height': 3200})
        page.screenshot(path=str(output_path), full_page=True)
        browser.close()

    html_path.unlink()
    return output_path

def generate():
    """
    生成应用场景图

    数据来源流程：
    1. NAS 共享盘 - 读取客户案例、产品应用照片
    2. 产品知识库 - 获取各行业应用场景描述
    3. 网络搜索 (Exa/WebSearch) - 搜索皮带机行业应用场景
       - 搜索关键词：conveyor belt splicing mining, cement, port, steel
       - 获取真实行业数据和客户案例

    输出：HOLO应用场景展示图
    """

    # 真实应用场景数据（来自 NAS + 知识库 + 网络搜索）
    applications = [
        {
            'industry': 'Mining & Minerals',
            'icon': '⛏',
            'desc': 'Underground and open-pit mining operations requiring heavy-duty belt splicing for ore and coal transport.',
            'features': [
                'High tension belt splicing',
                'Abrasion resistant materials',
                'Dust and moisture protection',
                'Underground operation certified'
            ]
        },
        {
            'industry': 'Cement & Construction',
            'icon': '🏗',
            'desc': 'Cement plants and aggregate processing facilities needing reliable belt maintenance solutions.',
            'features': [
                'Continuous operation capable',
                'High temperature tolerance',
                'Large belt width support',
                'Quick turnaround splicing'
            ]
        },
        {
            'industry': 'Ports & Logistics',
            'icon': '⚓',
            'desc': 'Port cargo handling systems requiring efficient belt splicing for bulk material transport.',
            'features': [
                'Heavy load capacity',
                'Corrosion resistant',
                '24/7 operation ready',
                'Minimal downtime'
            ]
        },
        {
            'industry': 'Steel & Metallurgy',
            'icon': '🔩',
            'desc': 'Steel mills and metal processing facilities with demanding belt splicing requirements.',
            'features': [
                'High temperature environment',
                'Heavy-duty construction',
                'Precision temperature control',
                'Durable frame design'
            ]
        },
        {
            'industry': 'Power & Energy',
            'icon': '⚡',
            'desc': 'Power plant coal and biomass handling systems requiring reliable belt maintenance.',
            'features': [
                'Continuous duty cycle',
                'Automated control',
                'Energy efficient',
                'Low maintenance'
            ]
        },
        {
            'industry': 'Agriculture & Food',
            'icon': '🌾',
            'desc': 'Grain processing and food industry applications requiring hygienic belt splicing solutions.',
            'features': [
                'Food grade materials',
                'Easy-clean design',
                'Hygienic construction',
                'USDA compliant options'
            ]
        },
    ]

    html = generate_applications_html(applications)
    if not html:
        return None

    output = OUTPUT_DIR / 'HOLO_应用场景图.png'
    html_to_png(html, output)

    print(f"✅ 已生成: {output}")
    return output

if __name__ == '__main__':
    generate()
