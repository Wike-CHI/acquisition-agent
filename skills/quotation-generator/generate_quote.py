#!/usr/bin/env python3
"""
红龙 PDF 报价单生成器
使用方法: python3 generate_quote.py --company "ABC Corp" --country BR --items "三代风冷机:1,分层机:1"
依赖: pip install reportlab jinja2
"""

import argparse
import datetime
import json
import sys
from pathlib import Path

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.units import cm
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_RIGHT, TA_CENTER
except ImportError:
    print("ERROR: reportlab not installed. Run: pip install reportlab")
    sys.exit(1)

# ─── 配置 ────────────────────────────────────────────────────────────

COUNTRY_CODES = {
    "BR": ("Brazil", "PT"), "CL": ("Chile", "ES"), "AR": ("Argentina", "ES"),
    "MX": ("Mexico", "ES"), "US": ("United States", "EN"), "CA": ("Canada", "EN"),
    "DE": ("Germany", "DE"), "FR": ("France", "FR"), "IT": ("Italy", "IT"),
    "RU": ("Russia", "RU"), "KZ": ("Kazakhstan", "RU"), "IR": ("Iran", "AR"),
    "SA": ("Saudi Arabia", "AR"), "AE": ("UAE", "AR"), "NG": ("Nigeria", "EN"),
    "KE": ("Kenya", "EN"), "ZA": ("South Africa", "EN"), "IN": ("India", "EN"),
    "VN": ("Vietnam", "EN"), "PH": ("Philippines", "EN"), "ID": ("Indonesia", "EN"),
    "TH": ("Thailand", "EN"), "TR": ("Turkey", "TR"), "PL": ("Poland", "PL"),
    "CN": ("China", "EN"),
}

PRODUCT_PRICES = {
    "三代风冷机": ("Air-cool Vulcanizer Gen3", 5800),
    "四代风冷机": ("Air-cool Vulcanizer Gen4", 6800),
    "水冷机": ("Water-cool Vulcanizer", 7200),
    "分层机": ("Ply Separator", 2800),
    "欧式分层机": ("EU Ply Separator", 3200),
    "导条机": ("Guide Machine", 2200),
    "XDT1300": ("XDT1300 Multi-func Guide", 2400),
    "XDT2000": ("XDT2000 Multi-func Guide", 2800),
    "打齿机": ("Finger Cutter", 1800),
    "裁切机": ("Belt Cutter", 1500),
    "碰接机": ("Belt Puncher", 1200),
    "放料架": ("Uncoiler", 800),
}

LANGUAGE_STRINGS = {
    "EN": {
        "invoice_title": "PROFORMA INVOICE",
        "bill_to": "Bill To:",
        "ship_to": "Ship To:",
        "date": "Date:",
        "valid_until": "Valid Until:",
        "ref": "Ref No:",
        "item": "Item",
        "description": "Description",
        "qty": "Qty",
        "unit_price": "Unit Price",
        "total": "Total",
        "subtotal": "SUBTOTAL:",
        "freight": "FREIGHT:",
        "total_usd": "TOTAL USD:",
        "payment_terms": "Payment Terms:",
        "delivery": "Delivery Time:",
        "shipping": "Shipping:",
        "validity": "Validity:",
        "notes": "Notes:",
        "warranty": "Warranty: 12 months from date of shipment",
        "certifications": "Certifications: CE / ISO available",
    },
    "PT": {
        "invoice_title": "FACTURA PROFORMA",
        "bill_to": "Faturar Para:",
        "ship_to": "Enviar Para:",
        "date": "Data:",
        "valid_until": "Validade:",
        "ref": "Ref:",
        "item": "Item",
        "description": "Descricao",
        "qty": "Qtd",
        "unit_price": "Preco Unit.",
        "total": "Total",
        "subtotal": "SUBTOTAL:",
        "freight": "FRETE:",
        "total_usd": "TOTAL USD:",
        "payment_terms": "Condicoes de Pagamento:",
        "delivery": "Prazo de Entrega:",
        "shipping": "Envio:",
        "validity": "Validade:",
        "notes": "Observacoes:",
        "warranty": "Garantia: 12 meses da data de expedicao",
        "certifications": "Certificacoes: CE / ISO disponiveis",
    },
    "ES": {
        "invoice_title": "FACTURA PROFORMA",
        "bill_to": "Facturar a:",
        "ship_to": "Enviar a:",
        "date": "Fecha:",
        "valid_until": "Valido Hasta:",
        "ref": "Ref:",
        "item": "Item",
        "description": "Descripcion",
        "qty": "Cant.",
        "unit_price": "Precio Unit.",
        "total": "Total",
        "subtotal": "SUBTOTAL:",
        "freight": "FLETE:",
        "total_usd": "TOTAL USD:",
        "payment_terms": "Condiciones de Pago:",
        "delivery": "Tiempo de Entrega:",
        "shipping": "Envio:",
        "validity": "Validez:",
        "notes": "Notas:",
        "warranty": "Garantia: 12 meses desde la fecha de envio",
        "certifications": "Certificaciones: CE / ISO disponibles",
    },
    "RU": {
        "invoice_title": "СЧЕТ-ПРОФОРМА",
        "bill_to": "Плательщик:",
        "ship_to": "Грузополучатель:",
        "date": "Дата:",
        "valid_until": "Срок действия:",
        "ref": "Реф:",
        "item": "№",
        "description": "Описание",
        "qty": "Кол-во",
        "unit_price": "Цена за ед.",
        "total": "Итого",
        "subtotal": "ИТОГО:",
        "freight": "ДОСТАВКА:",
        "total_usd": "ВСЕГО USD:",
        "payment_terms": "Условия оплаты:",
        "delivery": "Срок поставки:",
        "shipping": "Доставка:",
        "validity": "Срок годности:",
        "notes": " Примечания:",
        "warranty": "Гарантия: 12 месяцев с даты отгрузки",
        "certifications": "Сертификаты: CE / ISO доступны",
    },
}

# ─── 工具函数 ────────────────────────────────────────────────────────

def get_next_seq(country_code: str) -> int:
    """读取当前序号，递增后保存。"""
    seq_file = Path.home() / ".hermes" / "skills" / "acquisition" / "quotation-generator" / ".seq"
    seq_file.parent.mkdir(parents=True, exist_ok=True)

    if seq_file.exists():
        data = json.loads(seq_file.read_text())
        country_seq = data.get(country_code, 0)
    else:
        country_seq = 0

    new_seq = country_seq + 1
    data[country_code] = new_seq
    seq_file.write_text(json.dumps(data, indent=2))
    return new_seq

def build_item_row(product_name: str, qty: int, unit_price: float, seq_start: int = 1) -> list:
    """构建产品行。"""
    desc_en, base_price = PRODUCT_PRICES.get(product_name, (product_name, 5000))
    price = unit_price if unit_price > 0 else base_price
    total = price * qty
    return [str(seq_start), desc_en, str(qty), f"USD {price:,.2f}", f"USD {total:,.2f}"]

def build_table(data: list, lang: str = "EN", col_widths=None) -> Table:
    """构建报价表格。"""
    strings = LANGUAGE_STRINGS.get(lang, LANGUAGE_STRINGS["EN"])

    header = [strings["item"], strings["description"], strings["qty"], strings["unit_price"], strings["total"]]
    table_data = [header]
    subtotal = 0.0

    for row in data:
        if isinstance(row, dict):
            name = row.get("name", "")
            qty = row.get("qty", 1)
            price = row.get("price", 0)
        else:
            name, qty, price = row
        desc_en, base = PRODUCT_PRICES.get(name, (name, 5000))
        p = price if price > 0 else base
        t = p * qty
        subtotal += t
        table_data.append([str(len(table_data)), desc_en, str(qty), f"USD {p:,.2f}", f"USD {t:,.2f}"])

    # Total row
    table_data.append(["", "", "", strings["subtotal"], f"USD {subtotal:,.2f}"])

    if col_widths is None:
        col_widths = [1.2*cm, 7.5*cm, 2*cm, 3.2*cm, 3.2*cm]

    t = Table(table_data, colWidths=col_widths)
    t.setStyle(TableStyle([
        # Header
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2C3E50")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("ALIGN", (0, 0), (-1, 0), "CENTER"),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 9),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
        ("TOPPADDING", (0, 0), (-1, 0), 8),
        # Body
        ("BACKGROUND", (0, 1), (-1, -2), colors.HexColor("#ECF0F1")),
        ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#D5DBDB")),
        ("ALIGN", (0, 1), (-1, -1), "CENTER"),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 1), (-1, -1), 8),
        ("TOPPADDING", (0, 1), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 1), (-1, -1), 5),
        # Total row bold
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, -1), (-1, -1), 9),
        # Grid
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#BDC3C7")),
        ("LINEBELOW", (0, -1), (-1, -1), 1.5, colors.HexColor("#2C3E50")),
    ]))
    return t, subtotal

# ─── 主生成函数 ───────────────────────────────────────────────────────

def generate_quote(
    company: str,
    country_code: str,
    items: list,
    contact_name: str = "",
    contact_email: str = "",
    payment_terms: str = "T/T 30/70",
    delivery_weeks: int = 4,
    incoterms: str = "FOB Shanghai",
    validity_days: int = 7,
    freight: float = 0,
    output_path: str = None,
    lang: str = None,
) -> str:
    """
    生成 PDF 报价单。
    返回生成的 PDF 文件路径。
    """
    country_name, lang_auto = COUNTRY_CODES.get(country_code, (country_code, "EN"))
    lang = lang or lang_auto
    strings = LANGUAGE_STRINGS.get(lang, LANGUAGE_STRINGS["EN"])

    today = datetime.date.today()
    valid_until = today + datetime.timedelta(days=validity_days)
    seq = get_next_seq(country_code)
    quote_no = f"HL-{country_code}-{today.strftime('%Y%m%d')}-{seq:03d}"
    ref_no = f"HOLO-{country_code}-{today.strftime('%Y-%m%d')}"

    if output_path is None:
        output_dir = Path.home() / "Downloads" / "HOLOQuotes"
        output_dir.mkdir(parents=True, exist_ok=True)
        output_path = str(output_dir / f"{quote_no}.pdf")

    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=1.5*cm,
        leftMargin=1.5*cm,
        topMargin=1.5*cm,
        bottomMargin=1.5*cm,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "TitleStyle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=16,
        textColor=colors.HexColor("#2C3E50"),
        spaceAfter=2,
    )
    info_style = ParagraphStyle("InfoStyle", parent=styles["Normal"], fontSize=8, textColor=colors.HexColor("#7F8C8D"), spaceAfter=1)
    label_style = ParagraphStyle("LabelStyle", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=9, textColor=colors.HexColor("#2C3E50"))
    value_style = ParagraphStyle("ValueStyle", parent=styles["Normal"], fontSize=9, textColor=colors.black)

    elements = []

    # ── Header ──
    elements.append(Paragraph("HOLO Industrial Equipment Mfg Co., Ltd", title_style))
    elements.append(Paragraph("Ruian, Wenzhou, Zhejiang 325200, China", info_style))
    elements.append(Paragraph("Tel: +86 131 6586 2311 | Email: wikeye2025@163.com | Web: www.holo-belt.com", info_style))
    elements.append(Spacer(1, 4))
    elements.append(Paragraph(strings["invoice_title"], ParagraphStyle("InvoiceTitle", parent=title_style, fontSize=14, alignment=TA_CENTER)))
    elements.append(Spacer(1, 8))

    # ── Quote Info Grid ──
    quote_info = [
        [strings["date"], today.strftime("%Y-%m-%d"), strings["valid_until"], valid_until.strftime("%Y-%m-%d")],
        [strings["ref"], ref_no, "", ""],
    ]
    info_grid = Table(quote_info, colWidths=[3*cm, 5*cm, 3*cm, 5*cm])
    info_grid.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#2C3E50")),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    elements.append(info_grid)
    elements.append(Spacer(1, 8))

    # ── Customer Info ──
    cust_data = [
        [strings["bill_to"], strings["ship_to"]],
        [Paragraph(f"<b>{company}</b>", styles["Normal"]), Paragraph(f"<b>{company}</b>", styles["Normal"])],
        [Paragraph(country_name, styles["Normal"]), Paragraph(country_name, styles["Normal"])],
    ]
    if contact_name:
        cust_data.append([contact_name, contact_name])
    if contact_email:
        cust_data.append([contact_email, contact_email])

    cust_table = Table(cust_data, colWidths=[8.5*cm, 8.5*cm])
    cust_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#34495E")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 8),
        ("FONTSIZE", (0, 1), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#BDC3C7")),
    ]))
    elements.append(cust_table)
    elements.append(Spacer(1, 10))

    # ── Product Table ──
    product_table, subtotal = build_table(items, lang=lang)
    elements.append(product_table)
    elements.append(Spacer(1, 6))

    # ── Totals ──
    total_usd = subtotal + freight
    totals_data = [
        ["", "", "", strings["freight"], f"USD {freight:,.2f}"],
        ["", "", "", strings["total_usd"], f"USD {total_usd:,.2f}"],
    ]
    totals_table = Table(totals_data, colWidths=[1.2*cm, 7.5*cm, 2*cm, 3.2*cm, 3.2*cm])
    totals_table.setStyle(TableStyle([
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, -1), (-1, -1), 10),
        ("TEXTCOLOR", (0, -1), (-1, -1), colors.HexColor("#2C3E50")),
        ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#E8F6F3")),
        ("ALIGN", (3, 0), (-1, -1), "RIGHT"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#BDC3C7")),
    ]))
    elements.append(totals_table)
    elements.append(Spacer(1, 12))

    # ── Terms ──
    terms_data = [
        [strings["payment_terms"], payment_terms],
        [strings["delivery"], f"{delivery_weeks} weeks after deposit"],
        [strings["shipping"], incoterms],
        [strings["validity"], f"{validity_days} days"],
    ]
    terms_table = Table(terms_data, colWidths=[4*cm, 13*cm])
    terms_table.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#2C3E50")),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
    ]))
    elements.append(terms_table)
    elements.append(Spacer(1, 8))

    # ── Notes ──
    notes_header = Paragraph(strings["notes"], label_style)
    elements.append(notes_header)
    notes = [
        strings["certifications"],
        strings["warranty"],
        "- All prices in USD unless otherwise stated",
        "- Installation overseas: negotiable",
    ]
    for note in notes:
        elements.append(Paragraph(f"&bull; {note}", ParagraphStyle("Note", parent=styles["Normal"], fontSize=8, textColor=colors.HexColor("#7F8C8D"), spaceAfter=2)))

    # ── Build ──
    doc.build(elements)
    print(f"PDF generated: {output_path}")
    print(f"Quote No: {quote_no}")
    print(f"Total: USD {total_usd:,.2f}")
    return output_path

# ─── CLI ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate HOLO PDF Proforma Invoice")
    parser.add_argument("--company", "-c", required=True, help="Customer company name")
    parser.add_argument("--country", required=True, help="Country code (e.g. BR, CL, DE)")
    parser.add_argument("--items", required=True, help="Items as JSON array, e.g. '[{\"name\":\"三代风冷机\",\"qty\":1,\"price\":5800}]'")
    parser.add_argument("--contact", default="", help="Contact person name")
    parser.add_argument("--email", default="", help="Contact email")
    parser.add_argument("--payment", default="T/T 30/70", help="Payment terms")
    parser.add_argument("--weeks", type=int, default=4, help="Delivery weeks")
    parser.add_argument("--incoterms", default="FOB Shanghai", help="Incoterms")
    parser.add_argument("--validity", type=int, default=7, help="Quote validity days")
    parser.add_argument("--freight", type=float, default=0, help="Freight cost USD")
    parser.add_argument("--output", "-o", default=None, help="Output PDF path")
    parser.add_argument("--lang", default=None, help="Language (EN/PT/ES/RU)")

    args = parser.parse_args()

    try:
        items = json.loads(args.items)
    except json.JSONDecodeError:
        # Fallback: parse simple format "产品名:数量,产品名:数量"
        items = []
        for part in args.items.split(","):
            name, qty = part.strip().rsplit(":", 1)
            items.append({"name": name.strip(), "qty": int(qty), "price": 0})

    generate_quote(
        company=args.company,
        country_code=args.country.upper(),
        items=items,
        contact_name=args.contact,
        contact_email=args.email,
        payment_terms=args.payment,
        delivery_weeks=args.weeks,
        incoterms=args.incoterms,
        validity_days=args.validity,
        freight=args.freight,
        output_path=args.output,
        lang=args.lang,
    )
