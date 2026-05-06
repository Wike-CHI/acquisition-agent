# QUOTATION FORM 标准模板

> 红龙公司实际使用的报价单模板，PDF 生成时必须严格遵循此布局。

---

## 完整布局

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                      QUOTATION FORM                          │
│                                                              │
│  Quote Date: 2026/May/06           Quote No. HL20260506N001  │
│  until: 2026/May/13                                         │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  The Buyer's Information:                                    │
│  Company: [客户公司全称]                                     │
│  Email: [采购负责人邮箱]                                     │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Product         Model    Photo   Description        Qty     │
│  ─────────────────────────────────────────────────────────── │
│  Air-cooled      PA1200   [图]    3rd Gen air-cooled   2     │
│  Vulcanizer                        press for conveyor        │
│                                    belt splicing             │
│                                    ────────────────────      │
│                                    Heating Area: 1200×150mm  │
│                                    Max width: 1200mm         │
│                                    Operating Pressure: 0.6MPa│
│                                    Temperature: 0-200°C      │
│                                    Voltage: 380V/50Hz        │
│                                    HS CODE: 8477800000       │
│                                                              │
│  ─────────────────────────────────────────────────────────── │
│                                                              │
│  Unit Price (CNY)              Total (EX-Factory CNY)        │
│  ¥52,000.00                    ¥104,000.00                   │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  COMMERCIAL TERMS                                            │
│  ─────────────────────────────────────────────────────────── │
│  Shipment Term:   FOB Shanghai                               │
│  Payment Terms:   T/T 30/70                                  │
│  Delivery Time:   4 weeks after deposit                      │
│  Packing:         Standard export wooden case                │
│  Warranty:        12 months                                  │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  Notes:                                                      │
│  - CE / ISO certifications available                        │
│  - Installation overseas: negotiable                        │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  Manufacturers of Conveyor Belt Fabrications Equipments- HOLO│
└──────────────────────────────────────────────────────────────┘
```

---

## 字段规格

### 头部

| 字段 | 格式 | 示例 | 数据来源 |
|------|------|------|---------|
| Quote Date | YYYY/MMMM/DDDD | 2026/May/06 | 当前日期 |
| Quote No. | HL{YYYYMMDD}N{序号} | HL20260506N001 | 自动生成 |
| until | YYYY/MMMM/DDDD | 2026/May/13 | Quote Date + 7天 |

### 买家信息

| 字段 | 必填 | 来源 |
|------|------|------|
| Company | 是 | MEMORY.md / 客户会话 |
| Email | 是 | MEMORY.md / 客户会话 |

### 产品表

| 列 | 宽度占比 | 说明 |
|----|---------|------|
| Product | 15% | 产品类别名，如 Air-cooled Vulcanizer |
| Model | 10% | 型号，如 PA1200 |
| Photo | 10% | 产品照片（NAS 路径或占位符） |
| Description | 40% | 产品描述 + 6 项规格参数 |
| Qty | 5% | 数量 |
| Unit Price (CNY) | 10% | EX-Factory 含税单价 |
| Total (EX-Factory CNY) | 10% | Qty × Unit Price |

### 规格参数（每产品必填）

| 字段 | 说明 | 示例 |
|------|------|------|
| Heating Area | 加热面积 | 1200×150mm |
| Max width | 最大加工宽度 | 1200mm |
| Operating Pressure | 工作压力 | 0.6-0.8MPa |
| Temperature | 温度范围 | 0-200°C |
| Voltage | 电压要求 | 380V/50Hz |
| HS CODE | 海关编码 | 8477800000 |

### 商业条款

| 字段 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| Shipment Term | 是 | FOB Shanghai | 运输条款 |
| Payment Terms | 是 | T/T 30/70 | 付款方式 |
| Delivery Time | 是 | 4 weeks after deposit | 交货时间 |
| Packing | 是 | Standard export wooden case | 包装方式 |
| Warranty | 是 | 12 months | 质保期限 |

### 页脚

固定文本：`Manufacturers of Conveyor Belt Fabrications Equipments- HOLO`

---

## 多语言标签对照

| 英文 | 葡萄牙语 | 西班牙语 | 俄语 | 阿拉伯语 | 法语 |
|------|---------|---------|------|---------|------|
| QUOTATION FORM | FORMULÁRIO DE COTAÇÃO | FORMULARIO DE COTIZACIÓN | КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ | نموذج عرض السعر | FORMULAIRE DE DEVIS |
| Quote Date | Data da Cotação | Fecha de Cotización | Дата предложения | تاريخ العرض | Date du Devis |
| Quote No. | Cotação Nº | Cotización Nº | № предложения | رقم العرض | Devis Nº |
| until | até | hasta | до | حتى | jusqu'au |
| The Buyer's Information | Informações do Comprador | Información del Comprador | Информация о покупателе | معلومات المشتري | Informations sur l'Acheteur |
| Company | Empresa | Empresa | Компания | شركة | Entreprise |
| Email | E-mail | Correo electrónico | Эл. почта | البريد الإلكتروني | E-mail |
| Product | Produto | Producto | Продукт | منتج | Produit |
| Model | Modelo | Modelo | Модель | موديل | Modèle |
| Photo | Foto | Foto | Фото | صورة | Photo |
| Description | Descrição | Descripción | Описание | وصف | Description |
| Qty | Qtd | Cant | Кол-во | كمية | Qté |
| Unit Price (CNY) | Preço Unitário (CNY) | Precio Unitario (CNY) | Цена за ед. (CNY) | سعر الوحدة (CNY) | Prix Unitaire (CNY) |
| Total (EX-Factory CNY) | Total (EX-Fábrica CNY) | Total (EX-Fábrica CNY) | Итого (EX-Factory CNY) | المجموع (EX-Factory CNY) | Total (Départ Usine CNY) |
| COMMERCIAL TERMS | TERMOS COMERCIAIS | TÉRMINOS COMERCIALES | КОММЕРЧЕСКИЕ УСЛОВИЯ | الشروط التجارية | CONDITIONS COMMERCIALES |
| Shipment Term | Termo de Embarque | Término de Embarque | Условия поставки | شروط الشحن | Terme d'Expédition |
| Payment Terms | Termos de Pagamento | Términos de Pago | Условия оплаты | شروط الدفع | Conditions de Paiement |
| Delivery Time | Prazo de Entrega | Plazo de Entrega | Срок поставки | وقت التسليم | Délai de Livraison |
| Packing | Embalagem | Embalaje | Упаковка | التعبئة | Emballage |
| Warranty | Garantia | Garantía | Гарантия | ضمان | Garantie |

> 产品名称、型号、规格参数始终保留英文原文，不翻译。
