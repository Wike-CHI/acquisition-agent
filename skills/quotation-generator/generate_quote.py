#!/usr/bin/env python3
"""
红龙 QUOTATION FORM PDF 报价单生成器 v2.0
使用方法: python3 generate_quote.py --company "ABC Corp" --items '[{"name":"三代风冷机","qty":1,"price":52000}]'
依赖: pip install reportlab
货币: CNY (EX-Factory)，匹配公司实际模板
"""

import argparse
import datetime
import json
import sys
from pathlib import Path

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.units import cm, mm
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_RIGHT, TA_CENTER
except ImportError:
    print("ERROR: reportlab not installed. Run: pip install reportlab")
    sys.exit(1)

# ─── 产品基础数据（规格从 NAS 读取，此处为缓存备用） ────────────────────

PRODUCT_BASE = {
    "三代风冷机": {
        "en": "Air-cooled Vulcanizer Gen3",
        "model": "PA1200",
        "specs": {
            "Heating Area": "1200x150mm",
            "Max width": "1200mm",
            "Operating Pressure": "0.6-0.8MPa",
            "Temperature": "0-200C",
            "Voltage": "380V/50Hz",
            "HS CODE": "8477800000",
        },
    },
    "四代风冷机": {
        "en": "Air-cooled Vulcanizer Gen4",
        "model": "PA1500",
        "specs": {
            "Heating Area": "1500x150mm",
            "Max width": "1500mm",
            "Operating Pressure": "0.6-0.8MPa",
            "Temperature": "0-200C",
            "Voltage": "380V/50Hz",
            "HS CODE": "8477800000",
        },
    },
    "水冷机": {
        "en": "Water-cooled Vulcanizer",
        "model": "PW1200",
        "specs": {
            "Heating Area": "1200x150mm",
            "Max width": "1200mm",
            "Operating Pressure": "0.6-0.8MPa",
            "Temperature": "0-200C",
            "Voltage": "380V/50Hz",
            "HS CODE": "8477800000",
        },
    },
    "分层机": {
        "en": "Ply Separator",
        "model": "PS130",
        "specs": {
            "Heating Area": "N/A",
            "Max width": "1300mm",
            "Operating Pressure": "0.4-0.6MPa",
            "Temperature": "0-180C",
            "Voltage": "380V/50Hz",
            "HS CODE": "8477800000",
        },
    },
    "打齿机": {
        "en": "Finger Cutter",
        "model": "FC200",
        "specs": {
            "Heating Area": "N/A",
            "Max width": "200mm",
            "Operating Pressure": "0.4-0.6MPa",
            "Temperature": "N/A",
            "Voltage": "380V/50Hz",
            "HS CODE": "8477800000",
        },
    },
    "导条机": {
        "en": "Guide Machine",
        "model": "GM1200",
        "specs": {
            "Heating Area": "N/A",
            "Max width": "1200mm",
            "Operating Pressure": "0.4-0.6MPa",
            "Temperature": "0-180C",
            "Voltage": "380V/50Hz",
            "HS CODE": "8477800000",
        },
    },
    "裁切机": {
        "en": "Belt Cutter",
        "model": "BC200",
        "specs": {
            "Heating Area": "N/A",
            "Max width": "200mm",
            "Operating Pressure": "0.4-0.6MPa",
            "Temperature": "N/A",
            "Voltage": "380V/50Hz",
            "HS CODE": "8477800000",
        },
    },
    "碰接机": {
        "en": "Belt Puncher",
        "model": "BP100",
        "specs": {
            "Heating Area": "N/A",
            "Max width": "100mm",
            "Operating Pressure": "0.4-0.6MPa",
            "Temperature": "N/A",
            "Voltage": "380V/50Hz",
            "HS CODE": "8477800000",
        },
    },
}

LANGUAGE_STRINGS = {
    "EN": {
        "quote_title": "QUOTATION FORM",
        "buyer_info": "The Buyer's Information:",
        "company": "Company:",
        "email": "Email:",
        "product": "Product",
        "model": "Model",
        "photo": "Photo",
        "description": "Description",
        "qty": "Qty",
        "unit_price": "Unit Price\n(CNY)",
        "total": "Total\n(EX-Factory CNY)",
        "total_label": "Total (EX-Factory CNY):",
        "commercial_terms": "COMMERCIAL TERMS",
        "shipment_term": "Shipment Term:",
        "payment_terms": "Payment Terms:",
        "delivery_time": "Delivery Time:",
        "packing": "Packing:",
        "warranty": "Warranty:",
        "notes": "Notes:",
        "footer": "Manufacturers of Conveyor Belt Fabrications Equipments- HOLO",
    },
    "PT": {
        "quote_title": "FORMULARIO DE COTACAO",
        "buyer_info": "Informacoes do Comprador:",
        "company": "Empresa:",
        "email": "E-mail:",
        "product": "Produto",
        "model": "Modelo",
        "photo": "Foto",
        "description": "Descricao",
        "qty": "Qtd",
        "unit_price": "Preco Unit.\n(CNY)",
        "total": "Total\n(EX-Fabrica CNY)",
        "total_label": "Total (EX-Fabrica CNY):",
        "commercial_terms": "TERMOS COMERCIAIS",
        "shipment_term": "Termo de Embarque:",
        "payment_terms": "Condicoes de Pagamento:",
        "delivery_time": "Prazo de Entrega:",
        "packing": "Embalagem:",
        "warranty": "Garantia:",
        "notes": "Observacoes:",
        "footer": "Manufacturers of Conveyor Belt Fabrications Equipments- HOLO",
    },
    "ES": {
        "quote_title": "FORMULARIO DE COTIZACION",
        "buyer_info": "Informacion del Comprador:",
        "company": "Empresa:",
        "email": "Correo electronico:",
        "product": "Producto",
        "model": "Modelo",
        "photo": "Foto",
        "description": "Descripcion",
        "qty": "Cant",
        "unit_price": "Precio Unit.\n(CNY)",
        "total": "Total\n(EX-Fabrica CNY)",
        "total_label": "Total (EX-Fabrica CNY):",
        "commercial_terms": "TERMINOS COMERCIALES",
        "shipment_term": "Termino de Embarque:",
        "payment_terms": "Condiciones de Pago:",
        "delivery_time": "Plazo de Entrega:",
        "packing": "Embalaje:",
        "warranty": "Garantia:",
        "notes": "Notas:",
        "footer": "Manufacturers of Conveyor Belt Fabrications Equipments- HOLO",
    },
    "RU": {
        "quote_title": "KOMMEPHECKOE PRE/ILO>KEHNE",
        "buyer_info": "Nnhopmailns o noxynate/le:",
        "company": "KomnaHns:",
        "email": "3n. notra:",
        "product": "NpoAyKT",
        "model": "Mo/e/lb",
        "photo": "Oto",
        "description": "OnncaHne",
        "qty": "Ko/l-BO",
        "unit_price": "LeHa 3a e/1.\n(CNY)",
        "total": "Ntoro\n(EX-Factory CNY)",
        "total_label": "Ntoro (EX-Factory CNY):",
        "commercial_terms": "KOMMEPHECKNE YC/IOBNfl",
        "shipment_term": "Yc/IOBNfl noctaBKn:",
        "payment_terms": "Yc/IOBNfl oN/iaTbl:",
        "delivery_time": "CpOK noctaBKn:",
        "packing": "YnaKoBKa:",
        "warranty": "rapaHTNs:",
        "notes": "NpnMetiaHns:",
        "footer": "Manufacturers of Conveyor Belt Fabrications Equipments- HOLO",
    },
}


def get_next_seq() -> int:
    """读取当天序号，递增后保存（全局序号，不区分国家）。"""
    seq_file = Path.home() / ".hermes" / "skills" / "acquisition" / "quotation-generator" / ".seq"
    seq_file.parent.mkdir(parents=True, exist_ok=True)

    today = datetime.date.today().strftime("%Y%m%d")

    if seq_file.exists():
        data: dict[str, object] = json.loads(seq_file.read_text())
    else:
        data = {}

    last_date = str(data.get("_date", ""))
    if last_date != today:
        data = {"_date": today}
        seq = 1
    else:
        seq = int(str(data.get("_seq", 0))) + 1

    data["_date"] = today
    data["_seq"] = seq
    seq_file.write_text(json.dumps(data, indent=2))
    return seq


def format_cny(amount: float) -> str:
    return f"¥{amount:,.2f}"


def generate_quote(
    company: str,
    items: list,
    contact_email: str = "",
    payment_terms: str = "T/T 30/70",
    delivery_weeks: int = 4,
    incoterms: str = "FOB Shanghai",
    validity_days: int = 7,
    packing: str = "Standard export wooden case",
    warranty: str = "12 months",
    notes: str = "",
    output_path: str = "",
    lang: str = "EN",
) -> str:
    """
    生成 QUOTATION FORM PDF。
    返回生成的 PDF 文件路径。
    """
    strings = LANGUAGE_STRINGS.get(lang, LANGUAGE_STRINGS["EN"])

    today = datetime.date.today()
    valid_until = today + datetime.timedelta(days=validity_days)
    seq = get_next_seq()
    quote_no = f"HL{today.strftime('%Y%m%d')}N{seq:03d}"

    # 日期格式: YYYY/MMMM/DDDD
    month_names = ["January", "February", "March", "April", "May", "June",
                   "July", "August", "September", "October", "November", "December"]
    quote_date_str = f"{today.year}/{month_names[today.month - 1]}/{today.day:02d}"
    until_date_str = f"{valid_until.year}/{month_names[valid_until.month - 1]}/{valid_until.day:02d}"

    if not output_path:
        output_dir = Path.home() / "Downloads" / "HOLOQuotes"
        output_dir.mkdir(parents=True, exist_ok=True)
        output_path = str(output_dir / f"{quote_no}.pdf")

    doc = SimpleDocTemplate(
        output_path, pagesize=A4,
        rightMargin=1.5*cm, leftMargin=1.5*cm,
        topMargin=1.5*cm, bottomMargin=1.5*cm,
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle("TitleStyle", parent=styles["Normal"],
        fontName="Helvetica-Bold", fontSize=18, alignment=TA_CENTER,
        textColor=colors.HexColor("#2C3E50"), spaceAfter=6)
    header_info = ParagraphStyle("HeaderInfo", parent=styles["Normal"],
        fontSize=9, textColor=colors.HexColor("#2C3E50"))
    label_style = ParagraphStyle("LabelStyle", parent=styles["Normal"],
        fontName="Helvetica-Bold", fontSize=9, textColor=colors.HexColor("#2C3E50"))
    value_style = ParagraphStyle("ValueStyle", parent=styles["Normal"],
        fontSize=9, textColor=colors.black)
    note_style = ParagraphStyle("NoteStyle", parent=styles["Normal"],
        fontSize=8, textColor=colors.HexColor("#7F8C8D"), spaceAfter=2)
    footer_style = ParagraphStyle("FooterStyle", parent=styles["Normal"],
        fontSize=7, alignment=TA_CENTER, textColor=colors.HexColor("#95A5A6"))

    elements = []

    # ── QUOTATION FORM Title ──
    elements.append(Paragraph(strings["quote_title"], title_style))
    elements.append(Spacer(1, 4*mm))

    # ── Quote Date + Quote No + Valid Until ──
    date_info_data: list[list[object]] = [
        [Paragraph(f"Quote Date: {quote_date_str}", header_info),
         Paragraph(f"Quote No. {quote_no}", ParagraphStyle("Right", parent=header_info, alignment=TA_RIGHT))],
        [Paragraph(f"until: {until_date_str}", header_info), ""],
    ]
    date_table = Table(date_info_data, colWidths=[8*cm, 9*cm])
    date_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 1),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
    ]))
    elements.append(date_table)
    elements.append(Spacer(1, 6*mm))

    # ── Buyer's Information ──
    elements.append(Paragraph(strings["buyer_info"], label_style))
    elements.append(Paragraph(f"{strings['company']} {company}", value_style))
    if contact_email:
        elements.append(Paragraph(f"{strings['email']} {contact_email}", value_style))
    elements.append(Spacer(1, 6*mm))

    # ── Product Table ──
    header = [
        Paragraph(strings["product"], label_style),
        Paragraph(strings["model"], label_style),
        Paragraph(strings["photo"], label_style),
        Paragraph(strings["description"], label_style),
        Paragraph(strings["qty"], label_style),
        Paragraph(strings["unit_price"], label_style),
        Paragraph(strings["total"], label_style),
    ]
    table_data = [header]

    grand_total = 0.0
    for item in items:
        if isinstance(item, dict):
            name = item.get("name", "")
            qty = item.get("qty", 1)
            price = item.get("price", 0)
        else:
            name, qty, price = item

        prod = PRODUCT_BASE.get(name, {"en": name, "model": "-", "specs": {}})
        desc_en = prod["en"]
        model = prod.get("model", "-")

        # Build description with specs
        spec_lines = []
        specs = item.get("specs", {}) if isinstance(item, dict) else {}
        if not specs:
            specs = prod.get("specs", {})
        for key, val in specs.items():
            spec_lines.append(f"{key}: {val}")

        desc_text = desc_en
        if spec_lines:
            desc_text += "<br/>" + "<br/>".join(spec_lines)

        unit_price = price if price > 0 else 50000
        line_total = unit_price * qty
        grand_total += line_total

        row = [
            Paragraph(desc_en, value_style),
            Paragraph(model, value_style),
            Paragraph("[Photo]", note_style),
            Paragraph(desc_text, value_style),
            Paragraph(str(qty), value_style),
            Paragraph(format_cny(unit_price), value_style),
            Paragraph(format_cny(line_total), value_style),
        ]
        table_data.append(row)

    # Total row
    empty = Paragraph("", value_style)
    table_data.append([empty, empty, empty, empty, empty,
                       Paragraph(strings["total_label"], label_style),
                       Paragraph(format_cny(grand_total), label_style)])

    col_widths = [2.5*cm, 1.8*cm, 1.5*cm, 5*cm, 0.8*cm, 2.5*cm, 3*cm]
    t = Table(table_data, colWidths=col_widths, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2C3E50")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("ALIGN", (0, 0), (-1, 0), "CENTER"),
        ("ALIGN", (4, 1), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 8),
        ("FONTSIZE", (0, 1), (-1, -1), 7),
        ("GRID", (0, 0), (-1, -2), 0.5, colors.HexColor("#BDC3C7")),
        ("LINEBELOW", (0, -2), (-1, -2), 1, colors.HexColor("#2C3E50")),
        ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#E8F6F3")),
        ("SPAN", (0, -1), (4, -1)),
        ("FONTNAME", (5, -1), (6, -1), "Helvetica-Bold"),
        ("TOPPADDING", (0, 1), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 1), (-1, -1), 4),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 8*mm))

    # ── Commercial Terms ──
    elements.append(Paragraph(strings["commercial_terms"], title_style))
    elements.append(Spacer(1, 3*mm))

    terms = [
        (strings["shipment_term"], incoterms),
        (strings["payment_terms"], payment_terms),
        (strings["delivery_time"], f"{delivery_weeks} weeks after deposit"),
        (strings["packing"], packing),
        (strings["warranty"], warranty),
    ]
    terms_data = [[Paragraph(label, label_style), Paragraph(value, value_style)] for label, value in terms]
    terms_table = Table(terms_data, colWidths=[4*cm, 13*cm])
    terms_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
    ]))
    elements.append(terms_table)

    # ── Notes ──
    if notes:
        elements.append(Spacer(1, 6*mm))
        elements.append(Paragraph(strings["notes"], label_style))
        for line in notes.split("\n"):
            if line.strip():
                elements.append(Paragraph(f"- {line.strip()}", note_style))
    else:
        elements.append(Spacer(1, 6*mm))
        elements.append(Paragraph(strings["notes"], label_style))
        elements.append(Paragraph("- CE / ISO certifications available", note_style))
        elements.append(Paragraph("- Installation overseas: negotiable", note_style))

    # ── Footer ──
    elements.append(Spacer(1, 10*mm))
    elements.append(Paragraph(strings["footer"], footer_style))

    # ── Build ──
    doc.build(elements)
    print(f"QUOTATION FORM generated: {output_path}")
    print(f"Quote No: {quote_no}")
    print(f"Total: {format_cny(grand_total)} (EX-Factory)")
    return output_path


# ─── CLI ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate HOLO QUOTATION FORM PDF (CNY EX-Factory)")
    parser.add_argument("--company", "-c", required=True, help="Customer company name")
    parser.add_argument("--items", required=True, help="Items as JSON array")
    parser.add_argument("--email", default="", help="Customer contact email")
    parser.add_argument("--payment", default="T/T 30/70", help="Payment terms")
    parser.add_argument("--weeks", type=int, default=4, help="Delivery weeks")
    parser.add_argument("--incoterms", default="FOB Shanghai", help="Incoterms / Shipment term")
    parser.add_argument("--validity", type=int, default=7, help="Quote validity days")
    parser.add_argument("--packing", default="Standard export wooden case", help="Packing description")
    parser.add_argument("--warranty", default="12 months", help="Warranty terms")
    parser.add_argument("--notes", default="", help="Additional notes")
    parser.add_argument("--output", "-o", default=None, help="Output PDF path")
    parser.add_argument("--lang", default="EN", help="Language (EN/PT/ES/RU)")

    args = parser.parse_args()

    try:
        items = json.loads(args.items)
    except json.JSONDecodeError:
        items = []
        for part in args.items.split(","):
            name, qty = part.strip().rsplit(":", 1)
            items.append({"name": name.strip(), "qty": int(qty), "price": 0})

    generate_quote(
        company=args.company,
        items=items,
        contact_email=args.email,
        payment_terms=args.payment,
        delivery_weeks=args.weeks,
        incoterms=args.incoterms,
        validity_days=args.validity,
        packing=args.packing,
        warranty=args.warranty,
        notes=args.notes,
        output_path=args.output,
        lang=args.lang,
    )
