#!/usr/bin/env python3
"""
classify-inquiry.py - 询盘/客户回复分类器
红龙获客系统 sales-response 技能配套脚本

功能：输入客户邮件内容，自动分类为：
  - objection: 异议/拒绝
  - inquiry: 询价/问问题
  - technical: 技术问题
  - sample_request: 索样
  - negotiation: 谈判/压价
  - follow_up: 跟进意向
  - spam/junk: 垃圾/无关
  - unclear: 无法判断

用法：
  python3 classify-inquiry.py "Your email text here..."
  python3 classify-inquiry.py --file email.txt
  echo "email text" | python3 classify-inquiry.py
"""

import sys
import json
import re
from typing import Dict, List, Tuple

# ============================================================
# 分类规则库（基于关键词 + 模式匹配）
# ============================================================

OBJECTION_PATTERNS = {
    "price": [
        # 基础价格异议
        r"too expensiv", r"too expensive", r"overpriced",
        r"price\s*is", r"cost\s*too", r"budget", r"within budget",
        r"can't afford", r"not in the budget",
        r"贵", r"价格", r"太贵", r"预算",
        r"precio", r"caro", r"demasiado", r"presupuesto",
        r"Preis", r"zu teuer", r"Kosten",
        # 比价场景（关键修复）
        r"lower\s*price", r"higher\s*price", r"cheaper",
        r"better\s*price", r"competitor.*price",
        r"same\s*machine.*price",  # Beltwin比较场景
        r"beltwin.*price", r"price.*beltwin",
        r"折扣", r"打折", r"再便宜点",
        r"descuento", r"rebaja", r"barato",
        # 葡萄牙语（巴西）价格异议
        r"muito\s*caro", r"caro\s*demais", r"preço\s*alto",
        r"não\s*compensa",
    ],
    "已有供应商": [
        r"already\s*(have|goti|supplier|vendor|partner)",
        r"current\s*(supplier|vendor|partner|provider)",
        r"have\s*a\s*supplier", r"existing\s*supplier",
        r"已有", r"已经有", r"合作", r"老供应商",
    ],
    "品牌不熟": [
        r"don't\s*know", r"not\s*familiar", r"never\s*heard",
        r"new\s*to\s*us", r"first\s*time",
        r"没听过", r"不了解", r"不知道你们",
    ],
    "考虑考虑": [
        r"think\s*about", r"consider", r"will\s*get\s*back",
        r"let's\s*see", r"maybe\s*later", r"not\s*right\s*now",
        r"考虑", r"再看看", r"想想",
    ],
    "质量担忧": [
        r"quality", r"concern", r"worry", r"doubt",
        r"not\s*confident", r"quality\s*issue",
        r"made\s*in\s*china", r"chinese\s*(product|equipment|machinery)",
        r"质量", r"担心", r"中国货",
    ],
    "交货期": [
        r"delivery", r"lead\s*time", r"how\s*long",
        r"arrive", r"when\s*can", r"too\s*long",
        r"交货", r"货期", r"多久",
    ],
    " specs": [
        r"not\s*suitable", r"doesn't\s*work", r"won't\s*fit",
        r"spec", r"specification", r"size", r"model",
        r"规格", r"不合适", r"型号",
    ],
    "试样品": [
        r"sample", r"try", r"test", r"first",
        r"试用", r"样品", r"测试",
    ],
}

INQUIRY_PATTERNS = {
    "型号选择": [
        r"which\s*model", r"recommend", r"what\s*do\s*you\s*suggest",
        r"choos", r"select", r"model\s*question",
        r"型号", r"选", r"推荐",
    ],
    "价格询问": [
        r"price\s*(list|quote|catalo)", r"how\s*much",
        r"cost\s*of", r"pricing",
        r"价格", r"报价", r"多少钱", r"价目",
        r"costo", r"precio", r"quanto",
    ],
    "参数规格": [
        r"specification", r"technical\s*detail",
        r"dimension", r"voltage", r"power",
        r"temperature", r"parameter",
        r"参数", r"规格", r"技术",
    ],
    "付款方式": [
        r"payment", r"term", r"credit", r"installment",
        r"付款", r"账期", r"怎么付",
        r"pago", r"crédito",
    ],
    "认证证书": [
        r"certificate", r"certification", r"CE", r"ISO",
        r"RoHS", r"test\s*report",
        r"认证", r"证书", r"报告",
    ],
    "交货期询问": [
        r"delivery\s*time", r"ship\s*time",
        r"how\s*long\s*to\s*deliver", r"lead\s*time",
        r"交货时间", r"多久到",
    ],
}

SAMPLE_REQUEST_PATTERNS = [
    r"(send|need|want|require).*sample",
    r"send.*(demo|trial|prototype)",
    r"can\s*i\s*have.*(machine|press|unit)",
    r"样品", r"试机", r"试用",
]

NEGOTIATION_PATTERNS = [
    r"better\s*(price|deal|offer)",
    r"competitor.*price",
    r"other\s*(quot|offer|better)",
    r"if\s*(you\s*)?can.*(discount|lower)",
    r"last\s*(price|offer|chance)",
    r"negotiat",
    r"谈判", r"折扣", r"再便宜",
    r"mejor.*precio", r"descuento",
]

FOLLOW_UP_PATTERNS = [
    r"following\s*up", r"follow\s*up",
    r"any\s*update", r"any\s*news",
    r"have\s*you\s*seen", r"thoughts",
    r"进展", r"跟进", r"回复",
]

# ============================================================
# 国家/地区检测
# ============================================================

COUNTRY_SIGNALS = {
    "USA": [r"\bUS\b", r"\bUSA\b", r"United States", r"\.com\b", r"Dear Sirs", r"Attn"],
    "Germany": [r"\bDE\b", r"Germany", r"Deutsch", r"\.de\b", r"Sehr geehrte"],
    "Brazil": [r"\.br\b", r"Brazil", r"Brasil", r"Prezado", r"Caro"],
    "Chile": [r"\.cl\b", r"Chile", r"Estimado"],
    "Argentina": [r"\.ar\b", r"Argentina", r"Estimado"],
    "Japan": [r"\.jp\b", r"Japan", r"御中", r"社长"],
    "Indonesia": [r"\.id\b", r"Indonesia", r"Jakarta"],
    "Vietnam": [r"\.vn\b", r"Viet", r"Hanoi"],
    "Turkey": [r"\.tr\b", r"Turkey", r"Türk"],
    "Saudi": [r"\.sa\b", r"Saudi", r"السعودية"],
    "UAE": [r"\.ae\b", r"Emirates", r"دبي"],
    "Australia": [r"\.au\b", r"Australia", r"Aussie"],
    "India": [r"\.in\b", r"India", r"Mumbai", r"Chennai", r"Delhi"],
}

# ============================================================
# 分类逻辑
# ============================================================

def detect_country(text: str) -> List[str]:
    """检测客户所在国家/地区"""
    countries = []
    text_lower = text.lower()
    for country, patterns in COUNTRY_SIGNALS.items():
        for p in patterns:
            if re.search(p, text_lower, re.IGNORECASE):
                if country not in countries:
                    countries.append(country)
                break
    return countries

def classify_objection(text: str) -> Dict[str, any]:
    """分类异议类型"""
    matched = {}
    for category, patterns in OBJECTION_PATTERNS.items():
        count = 0
        for p in patterns:
            if re.search(p, text, re.IGNORECASE):
                count += 1
        if count > 0:
            matched[category] = count
    return matched

def classify_inquiry(text: str) -> Dict[str, any]:
    """分类询价类型"""
    matched = {}
    for category, patterns in INQUIRY_PATTERNS.items():
        count = 0
        for p in patterns:
            if re.search(p, text, re.IGNORECASE):
                count += 1
        if count > 0:
            matched[category] = count
    return matched

def main(text: str) -> Dict:
    """主分类函数"""
    text = text.strip()
    if not text:
        return {"type": "empty", "suggestion": "No input provided"}

    # 先检测类型
    result = {
        "type": "unclear",
        "subtype": None,
        "country": detect_country(text),
        "objection_types": {},
        "inquiry_types": {},
        "confidence": 0.0,
        "suggestion": "",
        "priority": "normal",
    }

    # 检测异议
    obj = classify_objection(text)
    result["objection_types"] = obj

    # 检测询价
    inq = classify_inquiry(text)
    result["inquiry_types"] = inq

    # Beltwin 比较场景优先检测
    if re.search(r"beltwin", text, re.IGNORECASE):
        result["type"] = "objection"
        result["subtype"] = "beltwin_price"
        result["confidence"] = 0.85
        result["suggestion"] = "【异议-Beltwin比价】→ objection-handbook.md 异议13，注意：Beltwin是合作伙伴，主打原厂家定位"
        result["priority"] = "high"
        result["objection_types"]["beltwin"] = 1
        return result

    # 检测其他类型
    for p in SAMPLE_REQUEST_PATTERNS:
        if re.search(p, text, re.IGNORECASE):
            result["type"] = "sample_request"
            result["confidence"] = 0.8
            result["suggestion"] = "【索样请求】→ 查 product-faq.md Q8，参考样品处理话术"
            result["priority"] = "high"
            return result

    for p in NEGOTIATION_PATTERNS:
        if re.search(p, text, re.IGNORECASE):
            result["type"] = "negotiation"
            result["confidence"] = 0.7
            result["suggestion"] = "【谈判/压价】→ 查 negotiation-tactics.md，让步策略"
            result["priority"] = "high"
            return result

    for p in FOLLOW_UP_PATTERNS:
        if re.search(p, text, re.IGNORECASE):
            result["type"] = "follow_up"
            result["confidence"] = 0.7
            result["suggestion"] = "【客户跟进】→ 查 cultural-profiles.md 跟进节奏，准备下一步"
            result["priority"] = "normal"
            return result

    # 判断是异议还是询价
    obj_total = sum(obj.values())
    inq_total = sum(inq.values())

    # 主要异议类型（价格/供应商/质量）有1个匹配就优先判异议
    PRIMARY_OBJ = {"price", "已有供应商", "质量担忧"}
    primary_hits = any(k in PRIMARY_OBJ and v >= 1 for k, v in obj.items())

    if primary_hits and obj_total >= 1:
        top_obj = max(obj, key=obj.get)
        result["type"] = "objection"
        result["subtype"] = top_obj
        result["confidence"] = min(0.9, 0.5 + obj_total * 0.1)
        result["suggestion"] = f"【异议-{top_obj}】→ 查 objection-handbook.md 第01-15条"
        result["priority"] = "high"

    elif obj_total >= 1 and inq_total >= 1:
        # obj < 2 但同时有异议信号+询价信号 → 降级为inquiry
        top_inq = max(inq, key=inq.get)
        result["type"] = "inquiry"
        result["subtype"] = top_inq
        result["confidence"] = 0.5
        result["suggestion"] = f"【询价-{top_inq}】→ 查 product-faq.md 相关问答"
        result["priority"] = "normal"

    elif inq_total >= 1:
        top_inq = max(inq, key=inq.get)
        result["type"] = "inquiry"
        result["subtype"] = top_inq
        result["confidence"] = min(0.9, 0.5 + inq_total * 0.1)
        result["suggestion"] = f"【询价-{top_inq}】→ 查 product-faq.md 相关问答"
        result["priority"] = "normal"

        if top_inq == "价格询问":
            result["suggestion"] += "，注意：首次报价给合理价位，不要给底价"

    return result

# ============================================================
# CLI 入口
# ============================================================

if __name__ == "__main__":
    if len(sys.argv) > 1:
        if sys.argv[1] == "--file":
            with open(sys.argv[2]) as f:
                text = f.read()
        elif sys.argv[1] == "--help":
            print(__doc__)
            sys.exit(0)
        else:
            text = " ".join(sys.argv[1:])
    else:
        text = sys.stdin.read()

    result = main(text)
    print(json.dumps(result, indent=2, ensure_ascii=False))
