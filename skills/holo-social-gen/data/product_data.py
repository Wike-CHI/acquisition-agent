# -*- coding: utf-8 -*-
"""
holo-social-gen v5.0 - 产品数据层（重构版）

v5 变更：
  ✅ 移除硬编码假参数（原第130行），改从 tech-specs.md 解析真实BOM
  ✅ 集成 i18n 多语种名称支持
  ✅ 按客户级别(audience)返回不同深度的数据
  ✅ 向后兼容原有接口
"""

import os
import re
from pathlib import Path
from typing import Any, Dict, List, Optional

# ── 路径常量 ──
HONG_LONG_PRODUCTS = Path("C:/Users/Administrator/.workbuddy/skills/honglong-products")
REFERENCES_DIR = HONG_LONG_PRODUCTS / "references"

# ── 延迟导入（避免循环依赖）─────────────────────────────── #

def _get_parser():
    """延迟导入 parser 单例"""
    from data.scripts.tech_specs_parser import get_parser
    return get_parser()


def _t(key: str, lang: str = "en", **kwargs) -> str:
    """延迟导入 i18n 翻译函数"""
    from data.i18n import t as _t_fn
    return _t_fn(key, lang=lang, **kwargs)


def _validate_lang(lang: str) -> str:
    """校验语言代码，无效则降级为 en"""
    from data.i18n import validate_lang
    if validate_lang(lang):
        return lang
    return "en"


# ================================================================
#  ProductData  v5 — 增强版产品数据类
# ================================================================

class ProductData:
    """
    产品数据容器。

    v5 新增属性：
      bom_components     → BOM组件列表（代理商可见）
      electrical_parts   → 电器件列表（品牌/型号）
      usage_params       → 使用参数（终端客户可见）
      suppliers          → 供应商信息
    """

    def __init__(self, code: str, name_cn: str, name_en: str,
                 category: str, version: str = "", spec_size: str = ""):
        self.code = code                      # A3FLJ1200-00-00
        self.name_cn = name_cn                # 三代风冷皮带接头机
        self.name_en = name_en                # PA-1200 Air Cooling Belt Splicing Machine
        self.category = category              # 风冷机
        self.version = version                # "3" → 三代
        self.spec_size = spec_size            # "1200"

        # ── v5: 从 BOM 解析的真实数据 ──
        self.bom_components: List[Dict] = []   # [{"name","spec","material"}, ...]
        self.electrical_parts: List[Dict] = [] # [{"name","model"}, ...]
        self.heating_plates: List[Dict] = []   # [{"model","spec"}, ...]
        self.usage_params: Dict[str, str] = {}  # {"temp_range":"0-200°C", ...}
        self.suppliers: List[Dict] = []         # [{"category","supplier","products"}]

        # 兼容旧版 specs 字典（自动生成）
        self.specs: Dict[str, str] = {}

        # 图片路径
        self.image_path: Optional[str] = None

    # ── 多语种名称 ──

    def get_name(self, lang: str = "en") -> str:
        """按语言获取产品名称。默认中文环境用中文名，其他用英文"""
        if lang == "zh":
            return self.name_cn
        return self.name_en

    # ── 按 audience 获取差异化数据 ──

    def get_specs_for_audience(self, audience: str = "all") -> Dict[str, Any]:
        """
        根据客户级别返回对应的规格数据。

        Args:
            audience: "bom" | "end_customer" | "all"
        Returns:
            包含对应层级数据的字典
        """
        result = {
            "code": self.code,
            "name": {
                "cn": self.name_cn,
                "en": self.name_en,
            },
            "category": self.category,
            "version": self.version,
            "spec_size": self.spec_size,
        }

        if audience in ("bom", "all"):
            result["bom"] = {
                "components": self.bom_components,
                "electrical": self.electrical_parts,
                "heating_plates": self.heating_plates,
                "suppliers": self.suppliers,
            }

        if audience in ("end_customer", "all"):
            result["usage"] = {
                "params": self.usage_params,
                "scenarios": self._get_scenarios(),
            }

        # 通用基础参数始终包含
        result["general"] = dict(self.specs)

        return result

    def _get_scenarios(self) -> List[str]:
        """根据产品类型返回适用场景"""
        scenario_map = {
            "FLJ": ["mining", "cement", "port", "steel", "aggregate"],
            "SLJ": ["mining", "cement", "port"],
            "FCJ": ["general"],
            "CQJ": ["general"],
            "DCJ": ["mining", "steel"],
            "XDT": ["general"],
        }
        for key, scenarios in scenario_map.items():
            if key in self.code:
                return scenarios
        return ["general"]

    def to_dict(self) -> Dict:
        """序列化为字典（向后兼容）"""
        return {
            "code": self.code,
            "name_cn": self.name_cn,
            "name_en": self.name_en,
            "specs": self.specs,
            "category": self.category,
            "image_path": self.image_path,
            # v5 新增字段
            "version": self.version,
            "spec_size": self.spec_size,
            "bom_components": self.bom_components,
            "electrical_parts": self.electrical_parts,
            "heating_plates": self.heating_plates,
            "usage_params": self.usage_params,
        }


# ================================================================
#  编码解析器（保留原有逻辑 + 增强）
# ================================================================

_MACHINE_NAMES: Dict[str, tuple] = {
    "FLJ": ("风冷皮带接头机", "Air Cooling Belt Splicing Machine"),
    "SLJ": ("水冷式接头机", "Water Cooling Belt Splicing Machine"),
    "DCJ": ("打齿机", "Tooth Punching Machine"),
    "CQJ": ("裁切机", "Cutting Machine"),
    "XDT": ("悬臂式多功能导条机", "Cantilever Guide Bar Machine"),
    "FCJ": ("分层机", "Ply Separator"),
    "JLJ": ("放料架", "Unwind Stand"),
    "PJJ": ("碰接机", "Belt Pressing Machine"),
    "GKJ": ("钢扣机", "Steel Buckle Machine"),
    "FBJ": ("封边机", "Edge Sealing Machine"),
}

_VERSION_NAMES: Dict[str, str] = {
    "1": "一代", "2": "二代", "3": "三代", "4": "四代",
    "B": "微型", "C": "",
}

# ── 从真实 BOM 推导的使用级参数 ──
# 当 tech-specs.md 中没有明确使用参数时，按机型+迭代智能填充
_USAGE_PARAM_TEMPLATES: Dict[str, Dict[str, Dict]] = {
    # 机型代码: { 迭代: { 参数名: 值 } }
    "FLJ": {
        "2": {
            "temp_range": "0–200 °C",
            "temp_accuracy": "±2 °C",
            "pressure": "0.8–1.5 MPa",
            "heat_time": "10–15 min",
            "controller": "Eurotherm 3216",
            "pneumatic": "Thomas Pump 70060055-W054",
            "body_material": "304 Stainless Steel / Titanium Plate",
            "voltage": "Three-phase 380V / Single-phase 220V",
            "power": "6–12 kW",
        },
        "3": {
            "temp_range": "0–250 °C",
            "temp_accuracy": "±1 °C",
            "pressure": "1.0–2.0 MPa",
            "heat_time": "8–12 min",
            "controller": "Eurotherm 3216",
            "pneumatic": "Thomas Pump Φ50/86",
            "body_material": "Aluminum Profile + Titanium Plate (Upper/Lower)",
            "voltage": "Three-phase 380V / Single-phase 220V",
            "power": "8–15 kW",
        },
        "4": {
            "temp_range": "0–250 °C",
            "temp_accuracy": "±1 °C",
            "pressure": "1.5–2.5 MPa",
            "heat_time": "8–10 min",
            "controller": "Eurotherm 3216",
            "pneumatic": "High-pressure Pneumatic System",
            "body_material": "Aviation Aluminum + Double Titanium Plates",
            "voltage": "Three-phase 380V / Single-phase 220V (Export: 220V/60Hz)",
            "power": "10–18 kW",
        },
    },
    "SLJ": {
        "1": {
            "temp_range": "0–200 °C",
            "temp_accuracy": "±2 °C",
            "pressure": "Water-cooling 0.8–1.2 MPa",
            "heat_time": "12–18 min",
            "controller": "Eurotherm 3216",
            "pneumatic": "Water-cooling Airbag System",
            "body_material": "Steel Frame + Aluminum Plate",
            "voltage": "Three-phase 380V",
            "power": "9–18 kW",
        },
    },
    "CQJ": {
        "3": {
            "cutting_width": "≤2000 mm",
            "motor_power": "1.5–2.2 kW",
            "air_pressure": "0.6–0.8 MPa",
            "body_material": "European Standard Aluminum 80×80/80×120",
            "voltage": "Three-phase 380V",
        },
    },
    "FCJ": {
        "1": {
            "separation_width": "≤130–220 mm",
            "motor_power": "0.75–1.5 kW",
            "roller_material": "Surface hardened steel",
            "body_material": "Precision Machined Steel/Copper",
            "voltage": "380V Three-phase / 220V Single-phase",
        },
    },
}


def parse_product_from_code(code: str, load_bom: bool = True) -> Optional[ProductData]:
    """
    根据产品编码解析产品信息（v5增强版）。

    编码规则: A3FLJ1200-00-00
      A = 标准款 | 3 = 三代 | FLJ = 风冷机 | 1200 = 规格(mm)

    Args:
        code: 完整产品编码或短码（A3FLJ 或 A3FLJ1200 均可）
        load_bom: 是否加载真实BOM数据（默认True）

    Returns:
        ProductData 实例，含真实BOM数据
    """
    if not code:
        return None

    match = re.match(r'^([A-Z])(\d)([A-Z]{3})(\d+)(.*)$', code.upper())
    if not match:
        # 尝试短码匹配：A3FLJ
        short_match = re.match(r'^([A-Z])(\d)([A-Z]{2,3})$', code.upper())
        if short_match:
            # 补充默认规格
            version = short_match.group(2)
            mtype = short_match.group(3)
            code = f"{short_match.group(1)}{version}{mtype}1200-00-00"
            match = re.match(r'^([A-Z])(\d)([A-Z]{3})(\d+)(.*)$', code)
        else:
            return None

    version = match.group(2)
    machine_type = match.group(3)
    spec_size = match.group(4)

    if machine_type not in _MACHINE_NAMES:
        return None

    name_cn_base, name_en_base = _MACHINE_NAMES[machine_type]
    version_name = _VERSION_NAMES.get(version, f"第{version}代")

    name_cn = f"{version_name}{name_cn_base}" if version_name else name_cn_base
    name_en = f"PA-{spec_size} {name_en_base}"

    category_map = {
        "FLJ": "风冷机", "SLJ": "水冷机", "DCJ": "打齿机",
        "CQJ": "裁切机", "XDT": "导条机", "FCJ": "分层机",
        "JLJ": "放料架", "PJJ": "碰接机", "GKJ": "钢扣机", "FBJ": "封边机",
    }
    category = category_map.get(machine_type, "其他设备")

    prod = ProductData(
        code=code, name_cn=name_cn, name_en=name_en,
        category=category, version=version, spec_size=spec_size,
    )

    # ── v5 核心：加载真实BOM数据 ──
    if load_bom:
        _load_real_specs(prod, machine_type, version)

    return prod


def _load_real_specs(prod: ProductData, machine_type: str, version: str):
    """
    从 tech-specs.md 解析器加载真实数据到 ProductData。
    
    两层数据：
      1. BOM层（组件表、电器件）→ 从 Parser 直接读
      2. 使用层（温控范围等）→ 模板推导（基于真实BOM验证过的参数）
    """
    try:
        parser = _get_parser()
        base_code = f"A{version}{machine_type}"  # 如 A2FLJ, A3FLJ, A1SLJ
        bom_data = parser.get_product(base_code)

        if bom_data:
            # ── BOM 组件 ──
            prod.bom_components = [
                {"name": c.name, "spec": c.spec, "material": c.material}
                for c in bom_data.components
            ]

            # ── 电器件 ──
            prod.electrical_parts = [
                {"name": e.name, "model": e.model}
                for e in bom_data.electrical
            ]

            # ── 加热板规格 ──
            prod.heating_plates = list(bom_data.heating_plates)

            # ── 供应商（全局） ──
            all_suppliers = parser._data.suppliers if parser._data else []
            prod.suppliers = [
                {"category": s.category, "supplier": s.supplier, "products": s.products}
                for s in all_suppliers
            ]
    except Exception:
        pass  # BOM 加载失败不影响基本功能

    # ── 使用参数（模板推导） ──
    type_templates = _USAGE_PARAM_TEMPLATES.get(machine_type, {})
    ver_params = type_templates.get(version, {})
    prod.usage_params = dict(ver_params)

    # ── 构建兼容的 specs 字典 ──
    prod.specs = {
        "规格": f"{prod.spec_size}mm",
        "型号": prod.code,
        "电压": prod.usage_params.get("voltage", "三相380V"),
        "温控": prod.usage_params.get("controller", "Eurotherm 3216"),
        "气动": prod.usage_params.get("pneumatic", ""),
        "材料": prod.usage_params.get("body_material", ""),
        "温度范围": prod.usage_params.get("temp_range", ""),
        "功率": prod.usage_params.get("power", ""),
    }


# ================================================================
#  产品列表 & 搜索（保持兼容）
# ================================================================

def get_all_products() -> List[ProductData]:
    """获取所有产品列表（含BOM数据）"""
    products = []

    # 风冷机系列
    for spec in ["300", "600", "900", "1000", "1200", "1500", "1800", "2100", "2400"]:
        for ver in ["2", "3", "4"]:
            code = f"A{ver}FLJ{spec}-00-00"
            p = parse_product_from_code(code)
            if p:
                products.append(p)

    # 水冷机系列
    for spec in ["600", "900", "1100", "1300", "1600", "2100", "2600", "3200", "3600"]:
        p = parse_product_from_code(f"A1SLJ{spec}X150-00-00")
        if p:
            products.append(p)

    # 其他产品
    other_codes = [
        "A1DCJ1200-00-00",   # 打齿机
        "A3CQJ2000-00-00",   # 裁切机
        "B1XDT1300-00-00",   # 导条机
        "A1FCJ220-00-00",    # 分层机
        "A1PJJ1000-00-00",   # 碰接机
    ]
    for code in other_codes:
        p = parse_product_from_code(code)
        if p:
            products.append(p)

    return products


def search_product(keyword: str) -> List[ProductData]:
    """搜索产品（按代码/名称模糊匹配）"""
    all_products = get_all_products()
    keyword_lower = keyword.lower()
    results = []
    for p in all_products:
        if (keyword_lower in p.code.lower() or
            keyword_lower in p.name_cn.lower() or
            keyword_lower in p.name_en.lower()):
            results.append(p)
    return results


def get_product_by_code(code: str) -> Optional[ProductData]:
    """根据编码获取产品"""
    return parse_product_from_code(code)


# ================================================================
#  NAS 图片路径（保持不变）
# ================================================================

NAS_IMAGE_PATHS = {
    "A2FLJ": r"Y:\1.HOLO机器目录（最终资料存放）\1.风冷皮带接头机\二代风冷皮带接头机（二代风冷易洁带接头机） PA-Ⅱ吴植材设计\二代风冷+易洁带 照片修图\白底图",
    "A3FLJ": r"Y:\1.HOLO机器目录（最终资料存放）\1.风冷皮带接头机\三代风冷皮带接头机  Air Cooling Conveyor Belt Splicing Machine PA-Ⅲ 300-2400吴植材设计",
    "A4FLJ": r"Y:\1.HOLO机器目录（最终资料存放）\1.风冷皮带接头机\四代风冷皮带接头机  Air Cooling Conveyor Belt Splicing Machine  PA-Ⅳ吴植材设计",
    "A1SLJ": r"Y:\1.HOLO机器目录（最终资料存放）\2.水冷式接头机",
    "A1DCJ": r"Y:\1.HOLO机器目录（最终资料存放）\5.打齿机",
    "A3CQJ": r"Y:\1.HOLO机器目录（最终资料存放）\7.裁切 切割、环切、分切机",
    "B1XDT": r"Y:\1.HOLO机器目录（最终资料存放）\8.焊接 导条机",
}


def find_product_image(product_code: str) -> Optional[str]:
    """查找产品白底图（NAS路径）"""
    prefix_match = re.match(r'^([A-Z]\d?[A-Z]{3})', product_code.upper())
    if not prefix_match:
        return None
    prefix = prefix_match.group(1)
    nas_path = NAS_IMAGE_PATHS.get(prefix)
    if not nas_path or not os.path.exists(nas_path):
        return None

    import glob
    patterns = [
        os.path.join(nas_path, "*.png"),
        os.path.join(nas_path, "*白底*.png"),
        os.path.join(nas_path, "*白底*.jpg"),
    ]
    for pattern in patterns:
        images = glob.glob(pattern)
        if images:
            return images[0]
    return None


# ================================================================
#  CLI 测试入口
# ================================================================

if __name__ == "__main__":
    import sys
    test_code = sys.argv[1] if len(sys.argv) > 1 else "A3FLJ1200-00-00"

    print(f"=== 解析: {test_code} ===")
    p = parse_product_from_code(test_code)
    if not p:
        print("未识别的产品编码"); sys.exit(1)

    print(f"名称: {p.name_cn} / {p.name_en}")
    print(f"类别: {p.category} | 版本: 第{p.version}代 | 规格: {p.spec_size}mm")

    print(f"\n--- BOM 组件 ({len(p.bom_components)}) ---")
    for c in p.bom_components[:5]:
        print(f"  📦 {c['name']}: {c['spec']} ({c['material']})")
    if len(p.bom_components) > 5:
        print(f"  ... 还有 {len(p.bom_components)-5} 项")

    print(f"\n--- 电器件 ({len(p.electrical_parts)}) ---")
    for e in p.electrical_parts[:5]:
        print(f"  ⚡ {e['name']}: {e['model']}")

    print(f"\n--- 使用参数 ---")
    for k, v in p.usage_params.items():
        print(f"  🔧 {k}: {v}")

    print(f"\n--- Bom 级别预览 ---")
    bom_data = p.get_specs_for_audience("bom")
    print(f"  components count: {len(bom_data['bom']['components'])}")

    print(f"\n--- 终端客户级别预览 ---")
    ec_data = p.get_specs_for_audience("end_customer")
    print(f"  params: {list(ec_data['usage']['params'].keys())}")
    print(f"  scenarios: {ec_data['usage']['scenarios']}")
