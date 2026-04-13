# -*- coding: utf-8 -*-
"""
HOLO FAQ 图文生成器
数据来源：NAS + 产品知识库 + 网络搜索
"""

from pathlib import Path
from playwright.sync_api import sync_playwright
import sys

# 路径配置
SKILL_DIR = Path(__file__).parent.parent
TEMPLATE_DIR = SKILL_DIR / 'templates'
OUTPUT_DIR = Path(r'c:\Users\Administrator\WorkBuddy\20260411130740\social-output\infographics')

def generate_faq_html(faqs, product_code):
    """生成 FAQ HTML"""
    template_path = TEMPLATE_DIR / 'HOLO_FAQ图文_国际版.html'

    if not template_path.exists():
        print(f"❌ 模板不存在: {template_path}")
        return None

    template = template_path.read_text(encoding='utf-8')

    # 动态替换内容
    faq_items = ''
    for i, (q, a) in enumerate(faqs, 1):
        faq_items += f'''
        <div class="faq-item">
            <div class="faq-q"><span class="faq-num">{i}</span> {q}</div>
            <div class="faq-a">{a}</div>
        </div>
        '''

    html = template.replace('{{product_code}}', product_code)
    html = html.replace('{{faq_items}}', faq_items)

    return html

def html_to_png(html_content, output_path):
    """HTML 转 PNG"""
    html_path = Path(output_path).with_suffix('.html')

    # 保存临时 HTML
    html_path.write_text(html_content, encoding='utf-8')

    # Playwright 截图
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={'width': 1920, 'height': 100})
        page.goto(f'file:///{html_path.absolute()}')
        page.set_viewport_size({'width': 1920, 'height': 2500})
        page.screenshot(path=str(output_path), full_page=True)
        browser.close()

    html_path.unlink()  # 删除临时HTML
    return output_path

def generate(product_code='A3FLJ', faqs=None):
    """
    生成 FAQ 图文

    数据来源流程：
    1. NAS 共享盘 - 读取产品说明书中的 FAQ
    2. 产品知识库 - 读取常见问题
    3. 网络搜索 - 补充行业 FAQ

    Args:
        product_code: 产品型号
        faqs: FAQ列表 [(问题, 回答), ...]，如为None则使用默认
    """
    if faqs is None:
        # 默认 FAQ（实际应从 NAS/知识库/搜索获取）
        faqs = [
            ("What is the delivery time?", "7-15 working days after order confirmation."),
            ("What is the warranty period?", "12 months comprehensive warranty on main components."),
            ("Do you provide installation support?", "Yes, we offer remote and on-site installation guidance."),
            ("What voltage options are available?", "380V/50Hz (standard), 480V/60Hz (optional)."),
            ("Can you customize the machine?", "Yes, we accept custom specifications for OEM projects."),
        ]

    html = generate_faq_html(faqs, product_code)
    if not html:
        return None

    output = OUTPUT_DIR / f'HOLO_{product_code}_FAQ图文.png'
    html_to_png(html, output)

    print(f"✅ 已生成: {output}")
    return output

if __name__ == '__main__':
    code = sys.argv[1] if len(sys.argv) > 1 else 'A3FLJ'
    generate(code)
