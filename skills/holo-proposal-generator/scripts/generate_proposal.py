#!/usr/bin/env python3
"""
HOLO数字提案包生成器 v1.0.0
使用 reportlab 生成专业提案 PDF

用法:
  python3 generate_proposal.py \
    --client "Belttech" \
    --country "Brazil" \
    --products "AC-1200 x 2, LC-130 x 1" \
    --quote-id "HL-BR-2026-0414-01" \
    --total-usd 10577 \
    --payment "T/T 30% prepaid, 70% before shipment" \
    --lead-time "30 days after deposit" \
    --validity "14 days" \
    --competitor "Beltwin" \
    --output "~/proposals/Belttech_Proposal.pdf"

所有参数均可省略，脚本会进入交互式输入模式。
"""

import argparse
import os
import sys
from datetime import datetime, timedelta
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm, cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak, KeepTogether
)
from reportlab.platypus.flowables import HRFlowable
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# ─── 颜色主题 ───────────────────────────────────────────────────────────────
C_BRAND_BLUE   = colors.HexColor("#1B4F8A")
C_DARK_GRAY    = colors.HexColor("#2D3748")
C_GOLD         = colors.HexColor("#D4A843")
C_LIGHT_GRAY   = colors.HexColor("#F7FAFC")
C_BODY_GRAY    = colors.HexColor("#4A5568")
C_WHITE        = colors.white
C_BLACK        = colors.black
C_GREEN        = colors.HexColor("#276749")
C_RED          = colors.HexColor("#C53030")
C_TABLE_HEADER = colors.HexColor("#1B4F8A")
C_TABLE_ALT    = colors.HexColor("#EBF4FF")
C_BORDER       = colors.HexColor("#CBD5E0")

# ─── 尺寸常量 ────────────────────────────────────────────────────────────────
PAGE_W, PAGE_H = A4
MARGIN_L = 2.5 * cm
MARGIN_R = 2.5 * cm
MARGIN_T = 2.5 * cm
MARGIN_B = 2.5 * cm
CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R


def gold_line(width=5*mm, thickness=1.5):
    return HRFlowable(width=width, thickness=thickness, color=C_GOLD,
                       spaceAfter=6, spaceBefore=6)


def section_title(text, styles):
    return Paragraph(text, styles["SectionTitle"])


def body(text, styles):
    return Paragraph(text, styles["Body"])


def build_styles():
    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(
        name="CoverTitle",
        fontName="Helvetica-Bold",
        fontSize=22,
        textColor=C_BRAND_BLUE,
        alignment=TA_CENTER,
        spaceAfter=8,
        leading=28,
    ))
    styles.add(ParagraphStyle(
        name="CoverSubtitle",
        fontName="Helvetica",
        fontSize=13,
        textColor=C_DARK_GRAY,
        alignment=TA_CENTER,
        spaceAfter=6,
        leading=18,
    ))
    styles.add(ParagraphStyle(
        name="CoverMeta",
        fontName="Helvetica",
        fontSize=10,
        textColor=C_BODY_GRAY,
        alignment=TA_CENTER,
        spaceAfter=4,
        leading=14,
    ))
    styles.add(ParagraphStyle(
        name="SectionTitle",
        fontName="Helvetica-Bold",
        fontSize=14,
        textColor=C_BRAND_BLUE,
        spaceBefore=18,
        spaceAfter=8,
        leading=18,
    ))
    styles.add(ParagraphStyle(
        name="SubTitle",
        fontName="Helvetica-Bold",
        fontSize=11,
        textColor=C_DARK_GRAY,
        spaceBefore=12,
        spaceAfter=6,
        leading=15,
    ))
    styles.add(ParagraphStyle(
        name="Body",
        fontName="Helvetica",
        fontSize=10,
        textColor=C_BODY_GRAY,
        spaceAfter=6,
        leading=15,
        alignment=TA_JUSTIFY,
    ))
    styles.add(ParagraphStyle(
        name="BulletItem",
        fontName="Helvetica",
        fontSize=10,
        textColor=C_BODY_GRAY,
        spaceAfter=4,
        leading=15,
        leftIndent=14,
        bulletIndent=4,
    ))
    styles.add(ParagraphStyle(
        name="TableHeader",
        fontName="Helvetica-Bold",
        fontSize=9,
        textColor=C_WHITE,
        alignment=TA_CENTER,
        leading=12,
    ))
    styles.add(ParagraphStyle(
        name="TableCell",
        fontName="Helvetica",
        fontSize=9,
        textColor=C_DARK_GRAY,
        alignment=TA_LEFT,
        leading=13,
    ))
    styles.add(ParagraphStyle(
        name="TableCellBold",
        fontName="Helvetica-Bold",
        fontSize=9,
        textColor=C_DARK_GRAY,
        alignment=TA_LEFT,
        leading=13,
    ))
    styles.add(ParagraphStyle(
        name="CTATitle",
        fontName="Helvetica-Bold",
        fontSize=16,
        textColor=C_BRAND_BLUE,
        alignment=TA_CENTER,
        spaceAfter=14,
        leading=22,
    ))
    styles.add(ParagraphStyle(
        name="CTAItem",
        fontName="Helvetica-Bold",
        fontSize=11,
        textColor=C_DARK_GRAY,
        spaceAfter=6,
        leading=16,
    ))
    styles.add(ParagraphStyle(
        name="CTABody",
        fontName="Helvetica",
        fontSize=10,
        textColor=C_BODY_GRAY,
        spaceAfter=4,
        leading=14,
    ))
    styles.add(ParagraphStyle(
        name="ContactInfo",
        fontName="Helvetica",
        fontSize=10,
        textColor=C_BODY_GRAY,
        alignment=TA_CENTER,
        spaceAfter=3,
        leading=14,
    ))
    styles.add(ParagraphStyle(
        name="PriceLabel",
        fontName="Helvetica-Bold",
        fontSize=10,
        textColor=C_DARK_GRAY,
        alignment=TA_RIGHT,
        leading=14,
    ))
    styles.add(ParagraphStyle(
        name="PriceValue",
        fontName="Helvetica-Bold",
        fontSize=12,
        textColor=C_BRAND_BLUE,
        alignment=TA_RIGHT,
        leading=16,
    ))
    styles.add(ParagraphStyle(
        name="SmallNote",
        fontName="Helvetica-Oblique",
        fontSize=8,
        textColor=C_BODY_GRAY,
        spaceAfter=3,
        leading=11,
    ))

    return styles


def build_cover(client_name, client_country, quote_id, date_str, validity_days, styles):
    """封面模块"""
    story = []

    story.append(Spacer(1, 3*cm))

    # HOLO Logo 占位符（文字版）
    story.append(Paragraph("HOLO", styles["CoverTitle"]))
    story.append(Paragraph("Industrial Equipment Mfg Co., Ltd.", styles["CoverSubtitle"]))

    story.append(Spacer(1, 1*cm))
    story.append(gold_line(width="80%", thickness=2))
    story.append(Spacer(1, 0.8*cm))

    story.append(Paragraph("专业设备方案提议", styles["CoverSubtitle"]))
    story.append(Spacer(1, 0.4*cm))
    story.append(Paragraph(client_name, styles["CoverTitle"]))
    story.append(Paragraph(f"<font color='#D4A843'>{client_country}</font>", styles["CoverSubtitle"]))

    story.append(Spacer(1, 1.5*cm))
    story.append(gold_line(width="40%", thickness=1))

    # 提案信息
    meta_data = [
        ["提案编号", quote_id],
        ["日期", date_str],
        ["有效期", f"{validity_days} 天"],
    ]
    meta_table = Table(meta_data, colWidths=[3*cm, 7*cm])
    meta_table.setStyle(TableStyle([
        ("FONTNAME",  (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME",  (1, 0), (1, -1), "Helvetica"),
        ("FONTSIZE",  (0, 0), (-1, -1), 10),
        ("TEXTCOLOR", (0, 0), (0, -1), C_BODY_GRAY),
        ("TEXTCOLOR", (1, 0), (1, -1), C_DARK_GRAY),
        ("ALIGN",     (0, 0), (0, -1), "RIGHT"),
        ("ALIGN",     (1, 0), (1, -1), "LEFT"),
        ("TOPPADDING",    (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LINEBELOW",     (0, 0), (-1, -2), 0.5, C_BORDER),
    ]))
    story.append(meta_table)

    story.append(Spacer(1, 2*cm))
    story.append(gold_line(width="40%", thickness=1))

    # 业务员信息
    contact_data = [
        ["Wike Chen | Sale Manager"],
        ["HOLO Industrial Equipment Mfg Co., Ltd."],
        ["wikeye@163.com | +86 131 6586 2311"],
    ]
    contact_table = Table(contact_data, colWidths=[CONTENT_W])
    contact_table.setStyle(TableStyle([
        ("FONTNAME",  (0, 0), (-1, -1), "Helvetica"),
        ("FONTSIZE",  (0, 0), (-1, -1), 10),
        ("TEXTCOLOR", (0, 0), (-1, -1), C_BODY_GRAY),
        ("ALIGN",     (0, 0), (-1, -1), "CENTER"),
        ("TOPPADDING",    (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    story.append(contact_table)

    story.append(PageBreak())
    return story


def build_client_background(client_name, client_country, products, competitor, styles):
    """客户背景摘要模块"""
    story = []

    story.append(section_title("📋 客户背景与采购需求", styles))
    story.append(HRFlowable(width="100%", thickness=1, color=C_BORDER,
                             spaceAfter=10, spaceBefore=0))

    # 基本信息表格
    bg_data = [
        ["客户公司", client_name],
        ["国家", client_country],
        ["采购产品", products],
    ]
    if competitor:
        bg_data.append(["参考竞品", competitor])

    bg_table = Table(bg_data, colWidths=[3.5*cm, CONTENT_W - 3.5*cm])
    bg_table.setStyle(TableStyle([
        ("BACKGROUND",  (0, 0), (0, -1), C_LIGHT_GRAY),
        ("FONTNAME",    (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME",    (1, 0), (1, -1), "Helvetica"),
        ("FONTSIZE",    (0, 0), (-1, -1), 10),
        ("TEXTCOLOR",   (0, 0), (0, -1), C_DARK_GRAY),
        ("TEXTCOLOR",   (1, 0), (1, -1), C_BODY_GRAY),
        ("ALIGN",       (0, 0), (0, -1), "RIGHT"),
        ("TOPPADDING",  (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LINEBELOW",   (0, 0), (-1, -2), 0.5, C_BORDER),
    ]))
    story.append(bg_table)
    story.append(Spacer(1, 0.5*cm))

    # 采购背景说明
    story.append(Paragraph("采购背景", styles["SubTitle"]))
    background_text = (
        f"HOLO很荣幸为 {client_name} 提供专业的工业皮带加工设备方案。"
        f"根据贵司的采购需求，我们推荐以下设备组合，旨在帮助贵司提升生产效率、降低运营成本。"
    )
    story.append(Paragraph(background_text, styles["Body"]))

    story.append(Spacer(1, 0.5*cm))
    story.append(Paragraph("核心诉求预期", styles["SubTitle"]))

    core_points = [
        "● 设备性能稳定，满足连续生产需求",
        "● 性价比优良，具有市场竞争力",
        "● 售后服务及时，保障设备稼働率",
        "● 交货期满足项目时间要求",
    ]
    for pt in core_points:
        story.append(Paragraph(pt, styles["BulletItem"]))

    return story


def build_comparison_table(products, competitor, styles):
    """方案对比表模块"""
    story = []

    story.append(section_title("📊 方案对比", styles))
    story.append(HRFlowable(width="100%", thickness=1, color=C_BORDER,
                             spaceAfter=10, spaceBefore=0))

    if competitor:
        comp_name = competitor
    else:
        comp_name = "其他供应商"

    # 表头
    header = [
        Paragraph("对比维度", styles["TableHeader"]),
        Paragraph("其他方案参考", styles["TableHeader"]),
        Paragraph("HOLO方案", styles["TableHeader"]),
        Paragraph("差异说明", styles["TableHeader"]),
    ]

    # 表格数据（按产品拆解）
    rows = []
    product_list = [p.strip() for p in products.split(",")]
    for i, prod in enumerate(product_list):
        bg_color = C_TABLE_ALT if i % 2 == 0 else C_WHITE
        if "风冷" in prod or "AC-1200" in prod:
            rows.append([
                Paragraph("压缩机品牌", styles["TableCell"]),
                Paragraph("国产/未知", styles["TableCell"]),
                Paragraph("Siemens（德国）", styles["TableCellBold"]),
                Paragraph("● 品牌原装，更可靠", styles["TableCell"]),
            ])
            rows.append([
                Paragraph("质保期", styles["TableCell"]),
                Paragraph("1年", styles["TableCell"]),
                Paragraph("2年", styles["TableCellBold"]),
                Paragraph("● 质保更长，风险更低", styles["TableCell"]),
            ])
            rows.append([
                Paragraph("售后响应", styles["TableCell"]),
                Paragraph("贸易商转手", styles["TableCell"]),
                Paragraph("原厂直供，48h响应", styles["TableCellBold"]),
                Paragraph("● 减少中间层级", styles["TableCell"]),
            ])
        elif "分层" in prod or "LC-" in prod:
            rows.append([
                Paragraph("切割精度", styles["TableCell"]),
                Paragraph("±1mm", styles["TableCell"]),
                Paragraph("±0.5mm", styles["TableCellBold"]),
                Paragraph("● 精度更高", styles["TableCell"]),
            ])
            rows.append([
                Paragraph("刀片寿命", styles["TableCell"]),
                Paragraph("2周（仿制品）", styles["TableCell"]),
                Paragraph("3个月+（原装）", styles["TableCellBold"]),
                Paragraph("● 原装刀片更耐用", styles["TableCell"]),
            ])

    if not rows:
        # 默认行
        rows = [
            [Paragraph("设备类型", styles["TableCell"]),
             Paragraph(f"{comp_name}方案", styles["TableCell"]),
             Paragraph("HOLO方案", styles["TableCellBold"]),
             Paragraph("专业配置", styles["TableCell"])],
        ]

    col_widths = [3*cm, 4*cm, 4*cm, CONTENT_W - 11*cm]

    all_rows = [header] + rows
    tbl = Table(all_rows, colWidths=col_widths, repeatRows=1)
    tbl.setStyle(TableStyle([
        ("BACKGROUND",   (0, 0), (-1, 0), C_TABLE_HEADER),
        ("TEXTCOLOR",   (0, 0), (-1, 0), C_WHITE),
        ("ALIGN",       (0, 0), (-1, 0), "CENTER"),
        ("VALIGN",      (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING",  (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("LINEBELOW",   (0, 0), (-1, -2), 0.5, C_BORDER),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [C_WHITE, C_TABLE_ALT]),
    ]))
    story.append(tbl)

    # 关键优势总结
    story.append(Spacer(1, 0.4*cm))
    advantage_text = (
        "<b>HOLO方案核心优势：</b> 原厂直供（非贸易商转手）× Siemens原装压缩机 × 2年质保 × 48小时售后响应。"
        f"相比 {comp_name}，HOLO方案在设备全生命周期内的综合成本更低、风险更小。"
    )
    story.append(Paragraph(advantage_text, styles["Body"]))

    return story


def build_product_detail(products, styles):
    """产品方案详情模块"""
    story = []

    story.append(section_title("🛠️ 推荐产品方案", styles))
    story.append(HRFlowable(width="100%", thickness=1, color=C_BORDER,
                             spaceAfter=10, spaceBefore=0))

    product_list = [p.strip() for p in products.split(",")]

    for prod in product_list:
        if "风冷" in prod or "AC-1200" in prod:
            story.append(Paragraph("三代风冷机 AC-1200", styles["SubTitle"]))
            spec_data = [
                ["规格参数", "数值"],
                ["型号", "AC-1200（三代）"],
                ["压缩机", "Siemens（德国）"],
                ["冷却方式", "强制风冷"],
                ["适用带宽", "1200mm"],
                ["功率", "15 kW"],
                ["电压", "380V / 50Hz"],
                ["重量", "约 2800 kg"],
                ["外形尺寸", "2200×1600×1800 mm"],
            ]
        elif "分层" in prod or "LC-" in prod:
            story.append(Paragraph("实验室分层机 LC-130", styles["SubTitle"]))
            spec_data = [
                ["规格参数", "数值"],
                ["型号", "LC-130"],
                ["切割宽度", "1300mm"],
                ["切割厚度", "50-300mm"],
                ["切割精度", "±0.5mm"],
                ["刀片材质", "硬质合金"],
                ["功率", "7.5 kW"],
                ["电压", "380V / 50Hz"],
            ]
        elif "导条" in prod or "GB-" in prod:
            story.append(Paragraph("导条机 GB-1000", styles["SubTitle"]))
            spec_data = [
                ["规格参数", "数值"],
                ["型号", "GB-1000"],
                ["适用带宽", "1000mm"],
                ["导条速度", "0-30m/min（可调）"],
                ["功率", "3 kW"],
                ["电压", "380V / 50Hz"],
            ]
        else:
            # 通用行
            story.append(Paragraph(prod, styles["SubTitle"]))
            spec_data = [["产品", prod]]

        spec_table = Table(spec_data, colWidths=[4*cm, CONTENT_W - 4*cm])
        spec_table.setStyle(TableStyle([
            ("BACKGROUND",   (0, 0), (-1, 0), C_LIGHT_GRAY),
            ("FONTNAME",     (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTNAME",     (0, 1), (0, -1), "Helvetica-Bold"),
            ("FONTNAME",     (1, 1), (1, -1), "Helvetica"),
            ("FONTSIZE",     (0, 0), (-1, -1), 9),
            ("TEXTCOLOR",    (0, 0), (-1, 0), C_DARK_GRAY),
            ("TEXTCOLOR",    (0, 1), (0, -1), C_BODY_GRAY),
            ("TEXTCOLOR",    (1, 1), (1, -1), C_DARK_GRAY),
            ("ALIGN",        (0, 0), (0, -1), "RIGHT"),
            ("TOPPADDING",   (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING",  (0, 0), (-1, -1), 6),
            ("LINEBELOW",    (0, 0), (-1, -2), 0.5, C_BORDER),
        ]))
        story.append(spec_table)
        story.append(Spacer(1, 0.3*cm))

    return story


def build_case_studies(client_country, styles):
    """成功案例模块"""
    story = []

    story.append(section_title("🏆 成功案例", styles))
    story.append(HRFlowable(width="100%", thickness=1, color=C_BORDER,
                             spaceAfter=10, spaceBefore=0))

    # 根据客户国家匹配案例
    region = ""
    if client_country in ["Brazil", "Brasil", "巴西"]:
        region = "南美"
        cases = [
            {
                "title": "智利某铜矿项目 — 三代风冷机 AC-1200 + 分层机 LC-800",
                "bg": "2024年扩产，配套皮带加工设备，高海拔工况（2800m）",
                "reason": "Siemens压缩机保障高海拔冷却效率，设备需耐粉尘环境",
                "result": "设备连续运转18个月零停机，客户次年复购2台",
                "quote": "「HOLO的设备比之前那家稳定太多了，Siemens压缩机在高海拔表现完全不同。」",
            },
            {
                "title": "阿根廷某矿业集团 — 三代风冷机 AC-1200 × 3台",
                "bg": "新建输送带生产线，需配套皮带切割和分层设备",
                "reason": "当地工程师缺乏设备维护经验，需原厂培训支持",
                "result": "完成2期培训，设备至今运转良好，已介绍2个新客户",
                "quote": "「原厂工程师专程来培训了3天，这家在南美的服务响应比我合作过的欧美品牌都快。」",
            },
        ]
    elif client_country in ["Mexico", "México", "墨西哥"]:
        region = "北美/中美"
        cases = [
            {
                "title": "墨西哥某汽车零部件厂商 — 分层机 LC-130",
                "bg": "生产橡胶输送带，需高精度分层切割",
                "reason": "切割精度要求高，竞品设备无法满足±0.5mm公差",
                "result": "使用2年后追加采购1台，用于扩产线",
                "quote": "「用了HOLO之后，我们的不良品率从3%降到了0.5%以下。」",
            },
        ]
    elif client_country in ["Saudi Arabia", "Saudi", "沙特", "UAE", "Dubai", "阿联酋"]:
        region = "中东"
        cases = [
            {
                "title": "阿联酋某物流中心 — 风冷机 AC-1200",
                "bg": "沙漠气候，夏季气温超50°C，普通风冷设备散热失效",
                "reason": "高温工况需特殊散热设计，Siemens压缩机在极端温度下更稳定",
                "result": "整个夏季运转正常，客户介绍3个同地区客户",
                "quote": "「迪拜的夏天地表温度60°C，没有一台设备因为过热停机。」",
            },
        ]
    elif client_country in ["Germany", "德语区"]:
        region = "欧洲"
        cases = [
            {
                "title": "德国某矿山设备集成商 — 分层机 LC-800",
                "bg": "为挪威客户配套，设备需符合EU安全标准",
                "reason": "CE认证完整，ATEX可选配，技术文档德语版",
                "result": "完成CE认证审查，顺利交付挪威项目",
                "quote": "「文档非常完整，这是我们选择HOLO的主要原因之一。」",
            },
        ]
    else:
        # 默认全球案例
        region = "全球"
        cases = [
            {
                "title": "智利某铜矿项目 — 三代风冷机 AC-1200 + 分层机 LC-800",
                "bg": "2024年扩产，配套皮带加工设备，高海拔工况（2800m）",
                "reason": "Siemens压缩机保障高海拔冷却效率，设备需耐粉尘环境",
                "result": "设备连续运转18个月零停机，客户次年复购2台",
                "quote": "「HOLO的设备比之前那家稳定太多了，Siemens压缩机在高海拔表现完全不同。」",
            },
            {
                "title": "阿联酋某物流中心 — 风冷机 AC-1200",
                "bg": "沙漠气候，夏季气温超50°C，普通风冷设备散热失效",
                "reason": "高温工况需特殊散热设计，Siemens压缩机在极端温度下更稳定",
                "result": "整个夏季运转正常，客户介绍3个同地区客户",
                "quote": "「迪拜的夏天地表温度60°C，没有一台设备因为过热停机。」",
            },
        ]

    for case in cases:
        story.append(Paragraph(case["title"], styles["SubTitle"]))

        case_points = [
            f"<b>项目背景：</b>{case['bg']}",
            f"<b>选型理由：</b>{case['reason']}",
            f"<b>项目结果：</b>{case['result']}",
        ]
        for pt in case_points:
            story.append(Paragraph("• " + pt, styles["BulletItem"]))

        # 客户评价
        quote_para = Paragraph(f"<i>「{case['quote']}」</i>", styles["Body"])
        quote_table = Table([[quote_para]], colWidths=[CONTENT_W])
        quote_table.setStyle(TableStyle([
            ("BACKGROUND",   (0, 0), (-1, -1), C_LIGHT_GRAY),
            ("LEFTPADDING",  (0, 0), (-1, -1), 12),
            ("RIGHTPADDING", (0, 0), (-1, -1), 12),
            ("TOPPADDING",   (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING",(0, 0), (-1, -1), 8),
            ("LINEBEFORE",   (0, 0), (-1, -1), 3, C_GOLD),
        ]))
        story.append(Spacer(1, 0.2*cm))
        story.append(quote_table)
        story.append(Spacer(1, 0.4*cm))

    return story


def build_commercial_terms(products, quote_id, date_str, total_usd,
                            payment, lead_time, validity_days, styles):
    """商务条款模块"""
    story = []

    story.append(section_title("💰 商务条款", styles))
    story.append(HRFlowable(width="100%", thickness=1, color=C_BORDER,
                             spaceAfter=10, spaceBefore=0))

    validity_date = (datetime.strptime(date_str, "%Y-%m-%d") +
                     timedelta(days=int(validity_days))).strftime("%Y-%m-%d")

    terms_data = [
        ["报价编号", quote_id],
        ["报价日期", date_str],
        ["有效期至", f"{validity_date}（共 {validity_days} 天）"],
    ]
    terms_header = Table(terms_data, colWidths=[3*cm, CONTENT_W - 3*cm])
    terms_header.setStyle(TableStyle([
        ("BACKGROUND",   (0, 0), (0, -1), C_LIGHT_GRAY),
        ("FONTNAME",     (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME",     (1, 0), (1, -1), "Helvetica"),
        ("FONTSIZE",     (0, 0), (-1, -1), 10),
        ("TEXTCOLOR",    (0, 0), (0, -1), C_DARK_GRAY),
        ("TEXTCOLOR",    (1, 0), (1, -1), C_DARK_GRAY),
        ("ALIGN",        (0, 0), (0, -1), "RIGHT"),
        ("TOPPADDING",   (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 6),
        ("LINEBELOW",    (0, 0), (-1, -2), 0.5, C_BORDER),
    ]))
    story.append(terms_header)
    story.append(Spacer(1, 0.4*cm))

    # 产品报价明细表
    story.append(Paragraph("产品报价明细", styles["SubTitle"]))

    product_list = [p.strip() for p in products.split(",")]
    unit_prices = {
        "AC-1200": 4680,
        "三代风冷": 4680,
        "LC-130": 3200,
        "分层机": 3200,
        "GB-1000": 2100,
        "导条机": 2100,
    }

    qty_map = {}
    for prod in product_list:
        qty = 1
        for q in ["×", "x", "*", "X"]:
            if q in prod:
                parts = prod.split(q)
                try:
                    qty = int("".join(filter(str.isdigit, parts[1])))
                    prod = parts[0].strip()
                except:
                    pass
                break
        if "风冷" in prod or "AC-1200" in prod:
            qty_map["AC-1200"] = qty_map.get("AC-1200", 0) + qty
        elif "分层" in prod or "LC-" in prod:
            qty_map["LC-130"] = qty_map.get("LC-130", 0) + qty
        elif "导条" in prod or "GB-" in prod:
            qty_map["GB-1000"] = qty_map.get("GB-1000", 0) + qty

    # 表头
    price_header = [
        Paragraph("产品", styles["TableHeader"]),
        Paragraph("数量", styles["TableHeader"]),
        Paragraph("未税单价(USD)", styles["TableHeader"]),
        Paragraph("未税总价(USD)", styles["TableHeader"]),
    ]
    price_rows = []
    subtotal_usd = 0
    for model, qty in qty_map.items():
        unit_price = unit_prices.get(model, 0)
        line_total = unit_price * qty
        subtotal_usd += line_total
        model_name = {"AC-1200": "三代风冷机 AC-1200",
                       "LC-130": "分层机 LC-130",
                       "GB-1000": "导条机 GB-1000"}.get(model, model)
        price_rows.append([
            Paragraph(model_name, styles["TableCell"]),
            Paragraph(str(qty), styles["TableCell"]),
            Paragraph(f"$ {unit_price:,}", styles["TableCell"]),
            Paragraph(f"$ {line_total:,}", styles["TableCell"]),
        ])

    vat_usd = subtotal_usd * 0.13
    total_usd_final = subtotal_usd + vat_usd

    price_rows.append([
        Paragraph("<b>合计</b>", styles["TableCellBold"]),
        Paragraph("", styles["TableCell"]),
        Paragraph("", styles["TableCell"]),
        Paragraph(f"<b>$ {subtotal_usd:,}</b>", styles["TableCellBold"]),
    ])
    price_rows.append([
        Paragraph("增值税 (13%)", styles["TableCell"]),
        Paragraph("", styles["TableCell"]),
        Paragraph("", styles["TableCell"]),
        Paragraph(f"$ {vat_usd:,.0f}", styles["TableCell"]),
    ])
    price_rows.append([
        Paragraph("<b>含税总计 (USD)</b>", styles["TableCellBold"]),
        Paragraph("", styles["TableCell"]),
        Paragraph("", styles["TableCell"]),
        Paragraph(f"<b><font color='#1B4F8A'>$ {total_usd_final:,.2f}</font></b>",
                  styles["TableCellBold"]),
    ])

    price_col_widths = [5*cm, 2*cm, 4*cm, CONTENT_W - 11*cm]
    price_table = Table([price_header] + price_rows,
                         colWidths=price_col_widths, repeatRows=1)
    price_table.setStyle(TableStyle([
        ("BACKGROUND",   (0, 0), (-1, 0), C_TABLE_HEADER),
        ("TEXTCOLOR",    (0, 0), (-1, 0), C_WHITE),
        ("ALIGN",        (0, 0), (-1, 0), "CENTER"),
        ("VALIGN",       (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING",   (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 6),
        ("LEFTPADDING",  (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("LINEBELOW",    (0, 0), (-1, -2), 0.5, C_BORDER),
        # 小计/税/合计行加底色
        ("BACKGROUND",   (0, -3), (-1, -1), C_LIGHT_GRAY),
        ("LINEABOVE",    (0, -3), (-1, -3), 1, C_BORDER),
    ]))
    story.append(price_table)
    story.append(Spacer(1, 0.4*cm))

    # 条款明细
    story.append(Paragraph("付款与交货", styles["SubTitle"]))
    payment_data = [
        ["付款方式", payment or "T/T 30% 预付，70% 发货前付清"],
        ["交货期", lead_time or "收到预付款后 30 天内"],
        ["装运条款", "FOB Shanghai"],
        ["报价币种", "USD（汇率风险由买方承担）"],
    ]
    payment_table = Table(payment_data, colWidths=[3*cm, CONTENT_W - 3*cm])
    payment_table.setStyle(TableStyle([
        ("BACKGROUND",   (0, 0), (0, -1), C_LIGHT_GRAY),
        ("FONTNAME",     (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME",     (1, 0), (1, -1), "Helvetica"),
        ("FONTSIZE",     (0, 0), (-1, -1), 10),
        ("TEXTCOLOR",    (0, 0), (0, -1), C_DARK_GRAY),
        ("TEXTCOLOR",    (1, 0), (1, -1), C_BODY_GRAY),
        ("ALIGN",        (0, 0), (0, -1), "RIGHT"),
        ("TOPPADDING",   (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 6),
        ("LINEBELOW",    (0, 0), (-1, -2), 0.5, C_BORDER),
    ]))
    story.append(payment_table)

    # 备注
    story.append(Spacer(1, 0.3*cm))
    note_text = (
        "<i>注：以上价格为含税价格（USD），报价有效期为14天。"
        "实际价格以最终合同为准。如有非标定制需求，价格将根据具体要求调整。</i>"
    )
    story.append(Paragraph(note_text, styles["SmallNote"]))

    return story


def build_cta(client_name, styles):
    """CTA页面"""
    story = []

    story.append(Spacer(1, 1.5*cm))
    story.append(Paragraph("接下来，我们建议您：", styles["CTATitle"]))
    story.append(Spacer(1, 0.5*cm))

    cta_items = [
        ("① 安排15分钟线上演示",
         "我可以为您远程展示设备实际运转情况，解答技术问题。"),
        ("② 工厂参观",
         "欢迎来温州实地考察，设备实物演示 + 工厂验厂一步到位。\n"
         "（首次合作客户，我们可提供部分差旅补贴）"),
        ("③ 样品测试",
         "我们可以先发一台样机至贵司测试，各项指标满意后再批量采购。\n"
         "（样机费用按批量订单结算）"),
    ]

    for title, body_text in cta_items:
        row = [[Paragraph(title, styles["CTAItem"]),
                Paragraph(body_text.replace("\n", "<br/>"), styles["CTABody"])]]
        row_table = Table(row, colWidths=[5*cm, CONTENT_W - 5*cm])
        row_table.setStyle(TableStyle([
            ("VALIGN",      (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING",  (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING",(0, 0), (-1, -1), 6),
            ("LINEBELOW",   (0, 0), (-1, 0), 0.5, C_BORDER),
        ]))
        story.append(row_table)
        story.append(Spacer(1, 0.3*cm))

    # 分隔线
    story.append(Spacer(1, 0.8*cm))
    story.append(gold_line(width="60%", thickness=1.5))
    story.append(Spacer(1, 0.5*cm))

    # 联系方式
    contact_block = [
        ["Wike Chen | Sale Manager"],
        ["HOLO Industrial Equipment Mfg Co., Ltd."],
        ["M: +86 131 6586 2311"],
        ["E: wikeye@163.com"],
    ]
    for line in contact_block:
        story.append(Paragraph(line[0], styles["ContactInfo"]))

    # 感谢语
    story.append(Spacer(1, 0.8*cm))
    thanks = (
        f"感谢 {client_name} 的信任与关注。<br/>"
        "HOLO团队随时准备为您提供专业服务。"
    )
    story.append(Paragraph(thanks, styles["Body"]))

    return story


def generate_proposal(client_name, client_country, products, quote_id,
                      total_usd, payment, lead_time, validity_days,
                      competitor, output_path):
    """主生成函数"""
    date_str = datetime.now().strftime("%Y-%m-%d")

    # 确保输出目录存在
    output_path = os.path.expanduser(output_path)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=MARGIN_L,
        rightMargin=MARGIN_R,
        topMargin=MARGIN_T,
        bottomMargin=MARGIN_B,
        title=f"{client_name} - HOLO Proposal",
        author="HOLO Industrial Equipment Mfg Co., Ltd.",
        subject=f"专业设备方案提议 - {client_name}",
    )

    styles = build_styles()
    story = []

    # 各模块
    story += build_cover(client_name, client_country, quote_id,
                          date_str, validity_days, styles)
    story += build_client_background(client_name, client_country,
                                      products, competitor, styles)
    story.append(PageBreak())
    story += build_comparison_table(products, competitor, styles)
    story.append(PageBreak())
    story += build_product_detail(products, styles)
    story.append(PageBreak())
    story += build_case_studies(client_country, styles)
    story.append(PageBreak())
    story += build_commercial_terms(products, quote_id, date_str,
                                     total_usd, payment, lead_time,
                                     validity_days, styles)
    story += build_cta(client_name, styles)

    doc.build(story)
    return output_path


# ─── CLI 入口 ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="HOLO数字提案包生成器 v1.0.0"
    )
    parser.add_argument("--client",      default="")
    parser.add_argument("--country",     default="")
    parser.add_argument("--products",   default="")
    parser.add_argument("--quote-id",   default="")
    parser.add_argument("--total-usd",  type=float, default=0)
    parser.add_argument("--payment",    default="")
    parser.add_argument("--lead-time",  default="")
    parser.add_argument("--validity",    type=int, default=14)
    parser.add_argument("--competitor", default="")
    parser.add_argument("--output",     default="")

    args = parser.parse_args()

    # 交互式输入（空参数时）
    if not args.client:
        print("=== HOLO数字提案包生成器 ===")
        args.client    = input("客户公司名：").strip()
        args.country   = input("国家：").strip()
        args.products  = input("产品方案（如 AC-1200 x 2, LC-130 x 1）：").strip()
        args.quote_id  = input("报价编号（留空自动生成）：").strip() or \
                         f"HL-{args.country[:2].upper()}-{datetime.now().strftime('%Y%m%d')}-01"
        comp_in = input("竞品（选填，直接回车跳过）：").strip()
        args.competitor = comp_in if comp_in else ""
        args.payment   = input("付款方式（如 T/T 30%，留空用默认）：").strip()
        args.lead_time= input("交货期（留空=30天）：").strip()

    # 默认值
    if not args.products:
        args.products = "AC-1200 x 1"
    if not args.quote_id:
        country_code = args.country[:2].upper() if args.country else "XX"
        args.quote_id = f"HL-{country_code}-{datetime.now().strftime('%Y%m%d')}-01"
    if not args.payment:
        args.payment = "T/T 30% 预付，70% 发货前付清"
    if not args.lead_time:
        args.lead_time = "收到预付款后 30 天内"
    if not args.output:
        safe_name = args.client.replace(" ", "_") if args.client else "Proposal"
        args.output = f"~/proposals/{safe_name}_Proposal_{datetime.now().strftime('%Y-%m-%d')}.pdf"

    output = generate_proposal(
        client_name  = args.client or "Valued Customer",
        client_country=args.country or "",
        products     = args.products,
        quote_id     = args.quote_id,
        total_usd    = args.total_usd,
        payment      = args.payment,
        lead_time    = args.lead_time,
        validity_days= args.validity,
        competitor    = args.competitor,
        output_path  = args.output,
    )
    print(f"\n✅ 提案已生成：{output}")
