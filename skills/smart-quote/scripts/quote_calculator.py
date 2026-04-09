#!/usr/bin/env python3
"""
红龙工业 - 智能报价计算器 v2.0
根据国家、客户背调结果、采购量智能计算利润率区间和价格范围
输出给业务员的灵活报价指引，而非固定价格
"""

import json
from typing import Optional, Dict, List, Tuple

# 各国基础利润率指导表
PROFIT_RATES = {
    # 高优先级市场 (45-90%)
    "加拿大": {"min": 75, "max": 90, "recommended": 80},
    "美国": {"min": 65, "max": 85, "recommended": 70},
    "以色列": {"min": 60, "max": 80, "recommended": 70},
    "越南": {"min": 50, "max": 70, "recommended": 55},
    "俄罗斯": {"min": 45, "max": 65, "recommended": 55},
    "沙特阿拉伯": {"min": 45, "max": 60, "recommended": 50},
    "罗马尼亚": {"min": 45, "max": 60, "recommended": 50},
    "乌拉圭": {"min": 55, "max": 70, "recommended": 60},
    # 中优先级市场 (30-55%)
    "墨西哥": {"min": 40, "max": 55, "recommended": 45},
    "阿根廷": {"min": 40, "max": 55, "recommended": 45},
    "德国": {"min": 35, "max": 55, "recommended": 45},
    "巴西": {"min": 35, "max": 50, "recommended": 40},
    "印尼": {"min": 35, "max": 55, "recommended": 45},
    "印度尼西亚": {"min": 35, "max": 55, "recommended": 45},
    "土耳其": {"min": 30, "max": 45, "recommended": 35},
    "巴基斯坦": {"min": 30, "max": 40, "recommended": 35},
    "日本": {"min": 28, "max": 40, "recommended": 30},
    "韩国": {"min": 30, "max": 50, "recommended": 35},
    "英国": {"min": 30, "max": 50, "recommended": 35},
    "法国": {"min": 40, "max": 55, "recommended": 45},
    "阿联酋": {"min": 40, "max": 55, "recommended": 45},
    "菲律宾": {"min": 32, "max": 45, "recommended": 35},
    "泰国": {"min": 25, "max": 45, "recommended": 30},
    # 基础优先级市场 (10-35%)
    "马来西亚": {"min": 20, "max": 35, "recommended": 20, "warning": "存在低价订单"},
    "印度": {"min": 20, "max": 35, "recommended": 25, "warning": "波动大"},
    "中国台湾": {"min": 18, "max": 28, "recommended": 20, "warning": "低利润"},
    "孟加拉国": {"min": 10, "max": 35, "recommended": 15, "warning": "⚠️存在亏损订单！"},
    "巴勒斯坦": {"min": 15, "max": 15, "recommended": 15, "warning": "低利润"},
}

# 企业规模加成
SCALE_BONUS = {
    "micro": 0,      # 1-50人
    "small": 5,      # 50-200人
    "medium": 10,    # 200-500人
    "large": 15,     # 500-1000人
    "xlarge": 20,    # 1000+人
}

# ICP评分加成
ICP_BONUS = {
    "A": 10,  # 75+分
    "B": 5,   # 50-74分
    "C": 0,   # 30-49分
    "D": -5,  # <30分
}

# 付款方式加成
PAYMENT_BONUS = {
    "T/T预付100%": 10,
    "T/T预付30%": 5,
    "L/C即期": 0,
    "OA赊账": -10,
    "账期超60天": -15,
}

# 客户类型加成
CUSTOMER_TYPE_BONUS = {
    "终端用户": 5,
    "经销商": -5,
    "同行": -15,
    "新客户": 0,
    "老客户": 3,
}


def get_scale_bonus(employee_count: int) -> float:
    """根据员工数返回企业规模加成"""
    if employee_count >= 1000:
        return SCALE_BONUS["xlarge"]
    elif employee_count >= 500:
        return SCALE_BONUS["large"]
    elif employee_count >= 200:
        return SCALE_BONUS["medium"]
    elif employee_count >= 50:
        return SCALE_BONUS["small"]
    else:
        return SCALE_BONUS["micro"]


def get_icp_bonus(icp_score: int) -> float:
    """根据ICP评分返回加成"""
    if icp_score >= 75:
        return ICP_BONUS["A"]
    elif icp_score >= 50:
        return ICP_BONUS["B"]
    elif icp_score >= 30:
        return ICP_BONUS["C"]
    else:
        return ICP_BONUS["D"]


def get_payment_bonus(payment_method: str) -> float:
    """根据付款方式返回加成"""
    return PAYMENT_BONUS.get(payment_method, 0)


def get_customer_type_bonus(customer_type: str) -> float:
    """根据客户类型返回加成"""
    return CUSTOMER_TYPE_BONUS.get(customer_type, 0)


def calculate_profit_margin_range(
    country: str,
    employee_count: int = 0,
    icp_score: int = 50,
    payment_method: str = "T/T预付30%",
    customer_type: str = "新客户",
) -> Dict:
    """
    计算利润率区间

    参数:
        country: 目的国家
        employee_count: 员工数（用于规模加成）
        icp_score: ICP评分（用于ICP加成）
        payment_method: 付款方式
        customer_type: 客户类型

    返回:
        利润率区间详情
    """
    result = {
        "country": country,
        "bonuses": {},
        "total_bonus": 0,
    }

    # 获取国家基础利润率
    country_data = PROFIT_RATES.get(country, {"min": 30, "max": 55, "recommended": 35})
    base_min = country_data["min"]
    base_max = country_data["max"]
    base_recommended = country_data["recommended"]

    result["base_min"] = base_min
    result["base_max"] = base_max
    result["base_recommended"] = base_recommended
    if "warning" in country_data:
        result["warning"] = country_data["warning"]

    # 计算加成
    scale_bonus = get_scale_bonus(employee_count)
    icp_bonus = get_icp_bonus(icp_score)
    payment_bonus = get_payment_bonus(payment_method)
    type_bonus = get_customer_type_bonus(customer_type)

    result["bonuses"] = {
        "企业规模": f"+{scale_bonus}%" if employee_count else "未获取",
        "ICP评分": f"+{icp_bonus}%",
        "付款方式": f"+{payment_bonus}%",
        "客户类型": f"+{type_bonus}%",
    }

    total_bonus = scale_bonus + icp_bonus + payment_bonus + type_bonus
    result["total_bonus"] = total_bonus

    # 计算最终利润率区间
    # 低价区间 = 国家最低 + 加成
    # 中价区间 = 国家推荐 ± 10%
    # 高价区间 = 国家最高 + 加成
    profit_low = base_min + total_bonus
    profit_mid = base_recommended + total_bonus * 0.5
    profit_high = min(base_max + total_bonus, 95)  # 最高不超过95%

    result["profit_low"] = max(round(profit_low, 1), base_min)
    result["profit_mid"] = round(profit_mid, 1)
    result["profit_high"] = round(profit_high, 1)
    result["profit_floor"] = base_min  # 红线

    return result


def calculate_price_range(
    product_name: str,
    cost_price: float,
    profit_margin_range: Dict,
    quantity: int = 1,
) -> Dict:
    """
    计算价格范围

    参数:
        product_name: 产品名称
        cost_price: 成本价
        profit_margin_range: 利润率区间
        quantity: 采购数量

    返回:
        价格范围详情
    """
    result = {
        "product": product_name,
        "cost_price": cost_price,
        "quantity": quantity,
    }

    # 计算单价区间（含税）
    price_low_ex_tax = cost_price * (1 + profit_margin_range["profit_low"] / 100)
    price_mid_ex_tax = cost_price * (1 + profit_margin_range["profit_mid"] / 100)
    price_high_ex_tax = cost_price * (1 + profit_margin_range["profit_high"] / 100)

    # 含税价
    tax_rate = 1.13

    result["unit_price"] = {
        "low": {
            "ex_tax": round(price_low_ex_tax, 2),
            "incl_tax": round(price_low_ex_tax * tax_rate, 2),
        },
        "mid": {
            "ex_tax": round(price_mid_ex_tax, 2),
            "incl_tax": round(price_mid_ex_tax * tax_rate, 2),
        },
        "high": {
            "ex_tax": round(price_high_ex_tax, 2),
            "incl_tax": round(price_high_ex_tax * tax_rate, 2),
        },
    }

    # 计算总价
    result["total_price"] = {
        "low": {
            "ex_tax": round(price_low_ex_tax * quantity, 2),
            "incl_tax": round(price_low_ex_tax * tax_rate * quantity, 2),
        },
        "mid": {
            "ex_tax": round(price_mid_ex_tax * quantity, 2),
            "incl_tax": round(price_mid_ex_tax * tax_rate * quantity, 2),
        },
        "high": {
            "ex_tax": round(price_high_ex_tax * quantity, 2),
            "incl_tax": round(price_high_ex_tax * tax_rate * quantity, 2),
        },
    }

    return result


def generate_quote_guidance(
    company_name: str,
    country: str,
    product_name: str,
    quantity: int,
    employee_count: int = 0,
    icp_score: int = 50,
    payment_method: str = "T/T预付30%",
    customer_type: str = "新客户",
    cost_price: float = 0,
) -> str:
    """
    生成完整的报价指引（用于输出给业务员）

    参数:
        company_name: 客户公司名
        country: 目的国家
        product_name: 产品名称
        quantity: 采购数量
        employee_count: 员工数
        icp_score: ICP评分
        payment_method: 付款方式
        customer_type: 客户类型
        cost_price: 成本价（如已知）

    返回:
        格式化的报价指引文本
    """
    # 计算利润率区间
    profit_range = calculate_profit_margin_range(
        country=country,
        employee_count=employee_count,
        icp_score=icp_score,
        payment_method=payment_method,
        customer_type=customer_type,
    )

    # 计算价格范围（如有成本价）
    price_range = None
    if cost_price > 0:
        price_range = calculate_price_range(
            product_name=product_name,
            cost_price=cost_price,
            profit_margin_range=profit_range,
            quantity=quantity,
        )

    # 生成输出
    lines = [
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        f"📋 报价指引单 - {company_name}（{country}）",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "",
        "🔍 背调摘要",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        f"• 企业规模：{employee_count}人（{'大型' if employee_count >= 500 else '中型' if employee_count >= 200 else '小型'}）",
        f"• ICP评分：{'A级' if icp_score >= 75 else 'B级' if icp_score >= 50 else 'C级' if icp_score >= 30 else 'D级'}（{icp_score}分）",
        f"• 付款方式：{payment_method}",
        f"• 客户类型：{customer_type}",
        "",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "💰 利润率区间",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "",
        f"• 🔵 低价区间：{profit_range['profit_low']}% - {profit_range['profit_mid']}%",
        f"  （快速成交/批量订单）",
        f"",
        f"• 🟢 中价区间：{profit_range['profit_mid']}% - {profit_range['profit_high']}%  ← 推荐",
        f"  （正常报价/首次接触）",
        f"",
        f"• 🔴 高价区间：{profit_range['profit_high']}% - {profit_range['profit_high']+5}%",
        f"  （试探上限/了解预算）",
        f"",
        f"⚠️ 红线：利润率 ≥ {profit_range['profit_floor']}%（{country}最低要求）",
        "",
    ]

    if "warning" in profit_range:
        lines.append(f"⚠️ 警告：{profit_range['warning']}")

    lines.append("")
    lines.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    lines.append("📊 加成明细")
    lines.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

    for factor, bonus in profit_range["bonuses"].items():
        lines.append(f"• {factor}：{bonus}")

    lines.append(f"• 综合加成：{profit_range['total_bonus']}%")
    lines.append("")

    # 如果有价格信息
    if price_range:
        lines.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        lines.append("🏷️ 价格范围（含税）")
        lines.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        lines.append("")
        lines.append(f"📦 单台价格")
        lines.append(f"  🔵 低价：¥{price_range['unit_price']['low']['incl_tax']:,.2f}/台")
        lines.append(f"  🟢 中价：¥{price_range['unit_price']['mid']['incl_tax']:,.2f}/台  ← 推荐")
        lines.append(f"  🔴 高价：¥{price_range['unit_price']['high']['incl_tax']:,.2f}/台")
        lines.append("")
        lines.append(f"💵 {quantity}台总价")
        lines.append(f"  🔵 低价：¥{price_range['total_price']['low']['incl_tax']:,.2f}")
        lines.append(f"  🟢 中价：¥{price_range['total_price']['mid']['incl_tax']:,.2f}  ← 推荐首次报价")
        lines.append(f"  🔴 高价：¥{price_range['total_price']['high']['incl_tax']:,.2f}")
        lines.append("")

    lines.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

    return "\n".join(lines)


# 示例用法
if __name__ == "__main__":
    # 示例1: 沙特客户购买三代风冷机1200型
    print("=" * 50)
    print("示例1: 沙特大型企业")
    print("=" * 50)
    print(generate_quote_guidance(
        company_name="BEDROCK Industrial",
        country="沙特阿拉伯",
        product_name="三代风冷机1200型",
        quantity=2,
        employee_count=800,
        icp_score=85,
        payment_method="T/T预付30%",
        customer_type="终端用户",
        cost_price=36471,
    ))

    print("\n" + "=" * 50)
    print("示例2: 印度小经销商")
    print("=" * 50)
    print(generate_quote_guidance(
        company_name="ABC Trading",
        country="印度",
        product_name="水冷不锈钢机1300×200",
        quantity=3,
        employee_count=50,
        icp_score=45,
        payment_method="L/C即期",
        customer_type="经销商",
        cost_price=14500,
    ))
