"""
HOLO 社媒图片生成器 - Playwright 渲染器
将 HTML 渲染为 PNG 图片
"""

import os
import tempfile
from pathlib import Path
from typing import Optional

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print("请安装 playwright: pip install playwright && playwright install")


class PlaywrightRenderer:
    """Playwright 渲染器"""

    def __init__(self):
        self.playwright = None
        self.browser = None

    def __enter__(self):
        self.playwright = sync_playwright().start()
        self.browser = self.playwright.chromium.launch()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.browser:
            self.browser.close()
        if self.playwright:
            self.playwright.stop()

    def render(self, html: str, output_path: str, width: int = 1080, height: int = 1350) -> str:
        """
        渲染 HTML 为 PNG

        Args:
            html: HTML 内容
            output_path: 输出路径
            width: 宽度
            height: 高度

        Returns:
            生成的 PNG 文件路径
        """
        # 确保输出目录存在
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        # 保存 HTML 到临时文件
        with tempfile.NamedTemporaryFile(mode="w", suffix=".html", encoding="utf-8", delete=False) as f:
            f.write(html)
            temp_html = f.name

        try:
            # 使用 Playwright 截图
            page = self.browser.new_page(viewport={"width": width, "height": height})
            page.goto(f"file:///{temp_html}")
            page.wait_for_load_state("networkidle")
            page.screenshot(path=output_path, full_page=True)
            page.close()
        finally:
            # 清理临时文件
            if os.path.exists(temp_html):
                os.unlink(temp_html)

        return output_path


def render_html_to_image(
    html: str,
    output_path: str,
    width: int = 1080,
    height: int = 1350,
) -> str:
    """
    便捷函数：渲染 HTML 为图片

    Args:
        html: HTML 内容
        output_path: 输出路径
        width: 宽度
        height: 高度

    Returns:
        生成的 PNG 文件路径
    """
    with PlaywrightRenderer() as renderer:
        return renderer.render(html, output_path, width, height)


if __name__ == "__main__":
    # 测试
    test_html = """
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial; background: #fff; width: 1080px; height: 1350px; }
            .header { background: #D32F2F; color: white; padding: 24px; text-align: center; }
            .content { padding: 24px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>HOLO - Test Product</h1>
        </div>
        <div class="content">
            <p>This is a test render.</p>
        </div>
    </body>
    </html>
    """

    output = render_html_to_image(test_html, "test_output.png", 1080, 1350)
    print(f"Output: {output}")
