# -*- coding: utf-8 -*-
"""
HOLO 竞品对比长图生成器
尺寸: 1920 x 2400px (竖版长图)
使用: python gen_compare_long.py
"""
from PIL import Image, ImageDraw, ImageFont
import os

def safe_text(draw, text, x, y, font, color, max_width=None):
    if max_width and max_width > 0:
        lines = []
        current = ''
        for ch in text:
            test = current + ch
            bbox = draw.textbbox((0,0), test, font=font)
            if bbox[2] - bbox[0] > max_width:
                lines.append(current)
                current = ch
            else:
                current = test
        if current:
            lines.append(current)
        line_h = int(font.size * 1.4)
        for i, line in enumerate(lines):
            draw.text((x, y + i * line_h), line, font=font, fill=color)
        return len(lines) * line_h
    else:
        draw.text((x, y), text, font=font, fill=color)
        return int(font.size * 1.4)

def draw_rounded_rect(draw, xy, r, fill):
    x1, y1, x2, y2 = xy
    draw.rectangle([x1+r, y1, x2-r, y2], fill=fill)
    draw.rectangle([x1, y1+r, x2, y2-r], fill=fill)
    draw.ellipse([x1, y1, x1+2*r, y1+2*r], fill=fill)
    draw.ellipse([x2-2*r, y1, x2, y1+2*r], fill=fill)
    draw.ellipse([x1, y2-2*r, x1+2*r, y2], fill=fill)
    draw.ellipse([x2-2*r, y2-2*r, x2, y2], fill=fill)

def draw_check(draw, x, y, size=40):
    draw.ellipse([x-size//2, y-size//2, x+size//2, y+size//2], fill=(46, 125, 50))
    draw.line([(x-size//4, y), (x-size//8, y+size//4), (x+size//4, y-size//4)], fill=(255,255,255), width=6)

def create_comparison_long_image():
    W, H = 1920, 2400
    FONT_PATH = 'C:/Windows/Fonts/'

    try:
        font_title = ImageFont.truetype(FONT_PATH + 'simhei.ttf', 72)
        font_header = ImageFont.truetype(FONT_PATH + 'simhei.ttf', 48)
        font_sub = ImageFont.truetype(FONT_PATH + 'simhei.ttf', 40)
        font_body = ImageFont.truetype(FONT_PATH + 'simhei.ttf', 36)
        font_small = ImageFont.truetype(FONT_PATH + 'simhei.ttf', 32)
    except:
        font_title = font_header = font_sub = font_body = font_small = ImageFont.load_default()

    BG = (250, 250, 252)
    HEADER_RED = (229, 57, 53)
    DARK = (30, 35, 45)
    GRAY = (110, 115, 125)
    CARD_BG = (255, 255, 255)

    img = Image.new('RGB', (W, H), BG)
    draw = ImageDraw.Draw(img)

    # 顶部标题
    draw.rectangle([0, 0, W, 160], fill=HEADER_RED)
    draw.text((W//2, 55), 'HOLO vs 竞品', font=font_title, fill=(255,255,255), anchor='mm')
    draw.text((W//2, 115), 'Belt Splicing Machine Comparison', font=font_small, fill=(255,200,200), anchor='mm')

    y = 200
    draw.text((80, y), '为什么选择 HOLO？', font=font_header, fill=DARK)
    y += 90

    # 三个优势卡片
    adv_cards = [
        ('💰', '更低价格', '相比欧洲品牌\n节省 50%+ 成本'),
        ('🚀', '更快交期', '7-15天发货\n无需等待60-90天'),
        ('🔧', '本地服务', '快速响应\n专业技术支持'),
    ]
    card_w, card_h = 540, 160
    gap = 30
    start_x = (W - (card_w * 3 + gap * 2)) // 2

    for i, (icon, title, desc) in enumerate(adv_cards):
        x = start_x + i * (card_w + gap)
        draw_rounded_rect(draw, [x, y, x+card_w, y+card_h], 20, CARD_BG)
        draw.text((x+30, y+25), icon + ' ' + title, font=font_sub, fill=DARK)
        draw.text((x+30, y+80), desc, font=font_small, fill=GRAY)

    y = y + card_h + 50
    draw.text((80, y), '核心参数对比', font=font_header, fill=DARK)
    y += 80

    # 对比表格
    params = [
        ('价格', '50-70% 更低', '€15,000-25,000', '€8,000-12,000'),
        ('交期', '7-15天', '60-90天', '15-30天'),
        ('温控精度', '±2°C', '±1°C', '±3-5°C'),
        ('规格范围', '300-3600mm', '600-2400mm', '400-1800mm'),
        ('定制能力', '灵活', '标准型号', '有限'),
        ('售后响应', '24小时内', '3-7天', '1-3天'),
        ('认证', 'CE / ISO', 'CE / ISO / ATEX', 'CE'),
    ]

    header_h = 80
    table_x = 80
    table_w = W - 160
    col_widths = [320, 380, 380, 420]
    row_h = 90

    draw_rounded_rect(draw, [table_x, y, table_x+table_w, y+header_h], 15, HEADER_RED)
    headers = ['参数', 'HOLO', '欧洲品牌', '其他品牌']
    cx = table_x + 30
    for i, h in enumerate(headers):
        draw.text((cx, y + header_h//2), h, font=font_sub, fill=(255,255,255), anchor='lm')
        cx += col_widths[i]
    y += header_h

    for row_idx, (param, holo, eu, other) in enumerate(params):
        row_y = y + row_idx * row_h
        bg_color = (240, 242, 246) if row_idx % 2 == 0 else CARD_BG

        if row_idx == len(params) - 1:
            draw_rounded_rect(draw, [table_x, row_y, table_x+table_w, row_y+row_h], 15, bg_color)
        else:
            draw.rectangle([table_x, row_y, table_x+table_w, row_y+row_h], fill=bg_color)

        draw.text((table_x + 30, row_y + row_h//2), param, font=font_body, fill=DARK, anchor='lm')

        cx = table_x + col_widths[0] + 30
        draw.text((cx, row_y + 20), holo, font=font_body, fill=DARK, anchor='lm')
        draw_check(draw, cx + 60, row_y + row_h//2 + 15)

        cx += col_widths[1]
        draw.text((cx, row_y + 20), eu, font=font_body, fill=GRAY, anchor='lm')

        cx += col_widths[2]
        draw.text((cx, row_y + 20), other, font=font_body, fill=GRAY, anchor='lm')

    y = y + len(params) * row_h + 50
    draw.text((80, y), 'HOLO 全系列产品优势', font=font_header, fill=DARK)
    y += 80

    products = [
        ('A2FLJ', '二代风冷机', '300-2100mm', '性价比首选'),
        ('A3FLJ', '三代风冷机', '300-3600mm', '市场主流'),
        ('A4FLJ', '四代风冷机', '1800-2400mm', '高端配置'),
        ('ASJ', '水冷机', '600-4200mm', '大功率'),
    ]

    prod_card_w = (W - 200) // 2
    prod_card_h = 160
    prod_gap = 40

    for i, (code, name, spec, tag) in enumerate(products):
        row = i // 2
        col = i % 2
        px = 80 + col * (prod_card_w + prod_gap)
        py = y + row * (prod_card_h + 30)

        draw_rounded_rect(draw, [px, py, px+prod_card_w, py+prod_card_h], 15, CARD_BG)
        draw.rectangle([px, py+20, px+8, py+prod_card_h-20], fill=HEADER_RED)
        draw.text((px+30, py+20), code, font=font_sub, fill=HEADER_RED)
        draw.text((px+30, py+70), name, font=font_body, fill=DARK)
        draw.text((px+30, py+115), '规格: ' + spec, font=font_small, fill=GRAY)
        tag_x = px + prod_card_w - 150
        draw_rounded_rect(draw, [tag_x, py+30, tag_x+120, py+70], 10, (255, 240, 240))
        draw.text((tag_x+60, py+50), tag, font=font_small, fill=HEADER_RED, anchor='mm')

    y = y + 2 * (prod_card_h + 30) + 40

    # CTA
    draw_rounded_rect(draw, [80, y, W-80, y+200], 20, HEADER_RED)
    draw.text((W//2, y+50), '立即联系 HOLO', font=font_header, fill=(255,255,255), anchor='mm')
    draw.text((W//2, y+110), 'sale@18816.cn  |  WhatsApp: +86 18057753889', font=font_body, fill=(255,200,200), anchor='mm')
    draw.text((W//2, y+160), 'www.holobelt.com', font=font_small, fill=(255,200,200), anchor='mm')

    # 底部
    draw.rectangle([0, H-80, W, H], fill=DARK)
    draw.text((80, H-45), '数据来源: HOLO 官方产品目录 + NAS 共享盘', font=font_small, fill=(150,150,150), anchor='lm')
    draw.text((W-80, H-45), 'HOLO Industrial Equipment', font=font_small, fill=(150,150,150), anchor='rm')

    img.save('HOLO_竞品对比长图_v4.png', 'PNG', quality=95)
    print('Done: HOLO_竞品对比长图_v4.png')

if __name__ == '__main__':
    create_comparison_long_image()
