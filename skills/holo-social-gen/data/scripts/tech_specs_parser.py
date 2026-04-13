# -*- coding: utf-8 -*-
"""
holo-social-gen v5.0 - Tech Specs Parser
从 honglong-products/references/tech-specs.md 解析真实 BOM 数据

输出结构化数据：
- components: 核心组件表（名称/规格/材料）
- electrical: 电器件（品牌/型号）
- suppliers: 供应商表
- materials: 材料规格表
- voltage_map: 电压规格对照
"""

import os
import re
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any


@dataclass
class BOMComponent:
    """BOM 组件"""
    name: str = ""
    spec: str = ""
    material: str = ""


@dataclass
class ElectricalPart:
    """电器件"""
    name: str = ""
    model: str = ""


@dataclass
class SupplierInfo:
    """供应商信息"""
    category: str = ""
    supplier: str = ""
    products: str = ""


@dataclass
class ProductSpecs:
    """单个产品的完整技术参数"""
    product_code: str = ""           # 如 A2FLJ
    product_name: str = ""           # 如 "二代风冷机"
    section_title: str = ""          # 原始标题 "1.1 二代风冷机 (A2FLJ)"
    components: List[BOMComponent] = field(default_factory=list)
    heating_plates: List[Dict[str, str]] = field(default_factory=list)  # 型号→规格
    electrical: List[ElectricalPart] = field(default_factory=list)
    accessories: List[Dict[str, str]] = field(default_factory=list)     # 水冷配件等


@dataclass
class TechSpecsData:
    """
    解析后的完整技术规格数据库。
    以产品代码为 key 的字典，每个值包含该产品的完整 BOM 数据。
    """
    products: Dict[str, ProductSpecs] = field(default_factory=dict)
    suppliers: List[SupplierInfo] = field(default_factory=list)
    materials: List[Dict[str, str]] = field(default_factory=list)
    voltage_map: List[Dict[str, str]] = field(default_factory=list)


class TechSpecsParser:
    """
    Markdown 表格解析器。

    用法：
        parser = TechSpecsParser()
        data = parser.parse()  # 自动查找 honglong-products 路径
        # 或
        data = parser.parse_file("/path/to/tech-specs.md")

        a2flj = data.products.get("A2FLJ")
        for comp in a2flj.components:
            print(f"{comp.name}: {comp.spec} ({comp.material})")
    """

    # 产品代码提取正则：从 ### 1.1 二代风冷机 (A2FLJ) 提取 A2FLJ
    _RE_PRODUCT_CODE = re.compile(r'\(([A-Z]\d[A-Z]{2}[J]?)\)')
    _RE_PRODUCT_CODE_ALT = re.compile(r'([A-Z]\d[A-Z]{2}[J]?)')

    # 表格行匹配
    _RE_TABLE_ROW = re.compile(r'^\|(.+)\|$')
    _RE_TABLE_SEP = re.compile(r'^\|[\s\-:|]+\|$')

    def __init__(self, specs_path: Optional[str] = None):
        """
        Args:
            specs_path: tech-specs.md 的绝对路径。None 则自动查找。
        """
        if specs_path:
            self.specs_path = specs_path
        else:
            self.specs_path = self._find_specs_path()

        self._raw_text: str = ""
        self._data: Optional[TechSpecsData] = None

    def _find_specs_path(self) -> str:
        """自动定位 tech-specs.md（多重策略）"""
        
        # 硬编码绝对路径作为首选
        hardcoded = r"C:\Users\Administrator\.workbuddy\skills\honglong-products\references\tech-specs.md"
        if os.path.exists(hardcoded):
            return hardcoded
        
        # 尝试相对于 skill 目录的路径
        this_dir = os.path.dirname(os.path.abspath(__file__))
        candidates = [
            os.path.join(this_dir, "..", "..", "..", "honglong-products", "references", "tech-specs.md"),
            os.path.join(this_dir, "..", "..", "honglong-products", "references", "tech-specs.md"),
        ]
        for c in candidates:
            p = os.path.normpath(c)
            if os.path.exists(p):
                return p

        raise FileNotFoundError(
            f"Cannot find tech-specs.md. Tried:\n" +
            "\n".join(f"  - {c}" for c in [hardcoded] + candidates)
        )

    def parse(self) -> TechSpecsData:
        """解析入口，返回 TechSpecsData"""
        return self.parse_file(self.specs_path)

    def parse_file(self, path: str) -> TechSpecsData:
        """从指定路径解析"""
        with open(path, "r", encoding="utf-8") as f:
            self._raw_text = f.read()

        self._data = TechSpecsData()
        self._parse_all()
        return self._data

    # ------------------------------------------------------------------ #
    #                         主解析流程
    # ------------------------------------------------------------------ #

    def _parse_all(self):
        lines = self._raw_text.split("\n")
        i = 0
        current_product: Optional[ProductSpecs] = None
        current_section: str = ""  # 标记当前子区域类型

        while i < len(lines):
            line = lines[i]

            # --- 检测产品章节头 ---
            prod_match = re.match(r'^###\s+\d+\.\d+\s+(.+)$', line)
            if prod_match:
                title = prod_match.group(1).strip()
                code_match = self._RE_PRODUCT_CODE.search(title)
                if code_match:
                    code = code_match.group(1).upper()
                    current_product = ProductSpecs(
                        product_code=code,
                        product_name=title,
                        section_title=title,
                    )
                    self._data.products[code] = current_product
                current_section = ""
                i += 1
                continue

            # --- 检测子区域标记 ---
            if line.startswith("**"):
                area = line.strip().strip("*").strip()
                if "核心组件" in area or "核心组件（以" in area:
                    current_section = "components"
                elif "硅胶加热板" in area or "加热板规格" in area:
                    current_section = "heating"
                elif "电器件" in area:
                    current_section = "electrical"
                elif "水冷配件" in area or "配件" in area:
                    current_section = "accessories"
                elif "电压规格" in area:
                    current_section = "voltage"
                i += 1
                continue

            # --- 检测表格 ---
            if self._RE_TABLE_ROW.match(line) and current_product is not None:
                table_data, consumed = self._extract_table(lines, i)
                i += consumed

                if current_section == "components":
                    self._parse_components_table(table_data, current_product)
                elif current_section == "heating":
                    self._parse_heating_table(table_data, current_product)
                elif current_section == "electrical":
                    self._parse_electrical_table(table_data, current_product)
                elif current_section == "accessories":
                    self._parse_accessories_table(table_data, current_product)
                continue

            # --- 检测全局表（非产品内）---
            if self._RE_TABLE_ROW.match(line) and current_product is None:
                table_data, consumed = self._extract_table(lines, i)
                i += consumed

                # 判断上下文：往前找最近的 ##
                ctx = self._get_recent_context(lines, i - consumed - 1)
                if "供应商" in ctx or "外购件" in ctx:
                    self._parse_suppliers_table(table_data)
                elif "材料规格" in ctx or "主要材料" in ctx:
                    self._parse_materials_table(table_data)
                elif "电压规格" in ctx or "电压" in ctx:
                    self._parse_voltage_table(table_data)
                continue

            i += 1

        return self._data

    # ------------------------------------------------------------------ #
    #                         表格提取工具
    # ------------------------------------------------------------------ #

    @staticmethod
    def _extract_table(lines: List[str], start_idx: int) -> tuple:
        """
        从 start_idx 开始提取 Markdown 表格。
        返回 (list_of_dicts, consumed_lines)
        """
        rows = []
        headers = []
        i = start_idx
        first_data_row = True

        while i < len(lines):
            line = lines[i]
            m = re.match(r'^\|(.+)\|$', line)
            if not m:
                break

            cells = [c.strip() for c in m.group(1).split("|")]

            # 跳过分隔行 |---|---|
            if re.match(r'^[\s\-:|]+$', "".join(cells)):
                i += 1
                continue

            if first_data_row:
                headers = cells
                first_data_row = False
            else:
                row_dict = {}
                for j, h in enumerate(headers):
                    val = cells[j] if j < len(cells) else ""
                    row_dict[h] = val
                rows.append(row_dict)

            i += 1

        return rows, i - start_idx

    @staticmethod
    def _get_recent_context(lines: List[str], idx: int, lookback: int = 10) -> str:
        """往前查找最近的 ## 标题作为上下文"""
        for j in range(max(0, idx - lookback), idx):
            if lines[j].startswith("## "):
                return lines[j].strip("# ").strip()
        return ""

    # ------------------------------------------------------------------ #
    #                       各类型表格解析
    # ------------------------------------------------------------------ #

    def _parse_components_table(self, rows: List[dict], prod: ProductSpecs):
        """解析核心组件表"""
        for r in rows:
            comp = BOMComponent()
            comp.name = r.get("组件", "").strip()
            comp.spec = r.get("规格", "").strip() or r.get("材料/型号", "").strip()
            comp.material = r.get("材料", "").strip() or r.get("材料/型号", "").strip()
            if comp.name:
                prod.components.append(comp)

    def _parse_heating_table(self, rows: List[dict], prod: ProductSpecs):
        """解析加热板规格表"""
        for r in rows:
            model = r.get("型号", "").strip()
            spec = r.get("规格", "").strip()
            if model and spec:
                prod.heating_plates.append({"model": model, "spec": spec})

    def _parse_electrical_table(self, rows: List[dict], prod: ProductSpecs):
        """解析电器件表"""
        for r in rows:
            part = ElectricalPart()
            part.name = r.get("组件", "").strip()
            part.model = r.get("型号", "").strip()
            if part.name:
                prod.electrical.append(part)

    def _parse_accessories_table(self, rows: List[dict], prod: ProductSpecs):
        """解析配件表"""
        for r in rows:
            acc = {k: v.strip() for k, v in r.items()}
            if any(v for v in acc.values()):
                prod.accessories.append(acc)

    def _parse_suppliers_table(self, rows: List[dict]):
        """解析供应商表"""
        for r in rows:
            s = SupplierInfo()
            s.category = r.get("类别", "").strip()
            s.supplier = r.get("供应商", "").strip()
            s.products = r.get("产品", "").strip()
            if s.supplier:
                self._data.suppliers.append(s)

    def _parse_materials_table(self, rows: List[dict]):
        """解析材料规格表"""
        for r in rows:
            mat = {
                "material": r.get("材料", "").strip(),
                "spec": r.get("规格", "").strip(),
                "usage": r.get("用途", "").strip(),
            }
            if mat["material"]:
                self._data.materials.append(mat)

    def _parse_voltage_table(self, rows: List[dict]):
        """解析电压规格对照表"""
        for r in rows:
            vm = {
                "suffix": r.get("后缀", "").strip(),
                "voltage": r.get("电压", "").strip(),
                "usage": r.get("适用", "").strip(),
            }
            self._data.voltage_map.append(vm)

    # ------------------------------------------------------------------ #
    #                          查询接口
    # ------------------------------------------------------------------ #

    def get_product(self, code: str) -> Optional[ProductSpecs]:
        """按产品代码查询"""
        if self._data is None:
            self.parse()
        return self._data.products.get(code.upper())

    def get_all_products(self) -> Dict[str, ProductSpecs]:
        """获取所有产品"""
        if self._data is None:
            self.parse()
        return self._data.products

    def get_suppliers_for_category(self, category: str) -> List[SupplierInfo]:
        """按类别查供应商"""
        if self._data is None:
            self.parse()
        return [s for s in self._data.suppliers if category in s.category]

    def search_component(self, keyword: str) -> List[tuple]:
        """
        全局搜索组件名包含关键词的条目。
        返回 [(product_code, BOMComponent), ...]
        """
        results = []
        if self._data is None:
            self.parse()
        for code, prod in self._data.products.items():
            for comp in prod.components:
                if keyword.lower() in comp.name.lower():
                    results.append((code, comp))
        return results

    def get_summary(self) -> str:
        """返回解析结果的摘要文本"""
        if self._data is None:
            self.parse()
        lines = [
            f"TechSpecs Parser Summary",
            f"=" * 40,
            f"Products parsed: {len(self._data.products)}",
            f"  Codes: {', '.join(self._data.products.keys())}",
            f"Suppliers: {len(self._data.suppliers)}",
            f"Materials: {len(self._data.materials)}",
        ]
        for code, prod in self._data.products.items():
            lines.append(f"\n  [{code}] {prod.product_name}")
            lines.append(f"    Components: {len(prod.components)}")
            lines.append(f"    Electrical: {len(prod.electrical)}")
            lines.append(f"    Heating plates: {len(prod.heating_plates)}")
        return "\n".join(lines)


# ==================================================================== #
#                           便捷函数
# ==================================================================== #

_parser_instance: Optional[TechSpecsParser] = None


def get_parser() -> TechSpecsParser:
    """单例获取 parser 实例"""
    global _parser_instance
    if _parser_instance is None:
        _parser_instance = TechSpecsParser()
    return _parser_instance


def load_tech_specs(code: str = "") -> Any:
    """
    快捷加载技术参数。

    Args:
        code: 产品代码（如 A2FLJ）。空字符串返回全部。
    Returns:
        ProductSpecs 或 Dict[str, ProductSpecs]
    """
    p = get_parser()
    if code:
        return p.get_product(code)
    return p.get_all_products()


if __name__ == "__main__":
    # CLI 测试入口
    import sys
    p = TechSpecsParser()
    data = p.parse()
    print(p.get_summary())

    if len(sys.argv) > 1:
        code = sys.argv[1].upper()
        prod = data.products.get(code)
        if prod:
            print(f"\n--- {code} Details ---")
            for c in prod.components:
                print(f"  {c.name}: {c.spec} ({c.material})")
            for e in prod.electrical:
                print(f"  [E] {e.name}: {e.model}")
        else:
            print(f"\nProduct '{code}' not found.")
