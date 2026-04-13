# -*- coding: utf-8 -*-
"""
holo-social-gen v5.0 国际化模块
加载 locales.yaml 翻译词典，提供多语种文本获取接口
"""

import os
import yaml
from typing import Any, Dict, List, Optional

# 技能根目录（skill root）— 多重策略确保在各种导入上下文下正确解析
def _resolve_skill_dir() -> str:
    """尝试多种方式定位 holo-social-gen 技能根目录"""
    
    # 策略1：基于 __file__ 的标准方式（正常 import 时有效）
    this_file = os.path.abspath(__file__)
    parent = os.path.dirname(this_file)          # i18n/
    grandparent = os.path.dirname(parent)         # data/
    ggparent = os.path.dirname(grandparent)       # holo-social-gen/
    if "holo-social-gen" in ggparent or "skills" in ggparent:
        return ggparent
    
    # 策略2：直接硬编码绝对路径作为最终兜底
    hardcoded = r"C:\Users\Administrator\.workbuddy\skills\holo-social-gen"
    if os.path.isdir(hardcoded):
        return hardcoded
    
    # 策略3：返回 grandparent 作为最后尝试
    return ggparent

_SKILL_DIR = _resolve_skill_dir()
_LOCALES_PATH = os.path.join(_SKILL_DIR, "data", "i18n", "locales.yaml")

# 如果默认路径不存在，尝试硬编码路径作为兜底
if not os.path.exists(_LOCALES_PATH):
    _FALLBACK_PATH = r"C:\Users\Administrator\.workbuddy\skills\holo-social-gen\data\i18n\locales.yaml"
    if os.path.exists(_FALLBACK_PATH):
        _LOCALES_PATH = _FALLBACK_PATH

# 全局缓存
_cache: Optional[Dict[str, Any]] = None


def _load_locales() -> Dict[str, Any]:
    """加载并缓存 locales.yaml"""
    global _cache
    if _cache is not None:
        return _cache

    if not os.path.exists(_LOCALES_PATH):
        # 降级：返回空字典，所有 t() 返回 key 本身
        _cache = {}
        return _cache

    with open(_LOCALES_PATH, "r", encoding="utf-8") as f:
        _cache = yaml.safe_load(f) or {}
    return _cache


def get_locale(lang: str = "en") -> Dict[str, Any]:
    """
    获取指定语言的完整 locale 数据。
    返回的是原始 YAML dict，调用方按需取值。

    Args:
        lang: 语言代码 (en/es/pt/ar/ru/fr/de/ko/ja/zh)
    Returns:
        该语言的所有翻译条目
    """
    data = _load_locales()
    if not data:
        return {}

    # 每个顶层 key 内部都有 lang 子键
    result = {}
    for section_key, section_val in data.items():
        if isinstance(section_val, dict) and lang in section_val:
            result[section_key] = section_val[lang]
        elif not isinstance(section_val, dict):
            # 非翻译字典（如 rtl_languages 列表）直接透传
            result[section_key] = section_val
        else:
            # 有子键但没有该语言的 → 用 en 兜底
            if "en" in section_val:
                result[section_key] = section_val["en"]
            else:
                result[section_key] = section_val
    return result


def t(key: str, lang: str = "en", **kwargs: Any) -> str:
    """
    翻译接口：根据 key + lang 返回翻译文本。

    支持嵌套 key，用点号分隔，例如:
        t("ui.brand_tagline", lang="es")
        t("spec_labels.voltage", lang="ar")
        t("hero_subtitle", lang="zh")

    支持 {placeholder} 格式化参数。

    Args:
        key: 翻译键（支持点号路径）
        lang: 目标语言
        **kwargs: 格式化参数
    Returns:
        翻译后的字符串。找不到则返回 key 本身
    """
    data = _load_locales()
    if not data:
        return _format_fallback(key, **kwargs)

    # 解析点号路径
    parts = key.split(".")
    current: Any = data
    for part in parts:
        if isinstance(current, dict) and part in current:
            current = current[part]
        else:
            return _format_fallback(key, **kwargs)

    # current 应该是一个 dict（含各语言）或直接是字符串
    if isinstance(current, str):
        return current.format(**kwargs) if kwargs else current

    if isinstance(current, dict):
        # 优先取目标语言
        if lang in current:
            text = current[lang]
        elif "en" in current:
            text = current["en"]
        else:
            return _format_fallback(key, **kwargs)

        if isinstance(text, str) and kwargs:
            try:
                return text.format(**kwargs)
            except (KeyError, IndexError):
                return text
        return text

    return _format_fallback(key, **kwargs)


def translate_bom_component(name_cn: str, lang: str = "en") -> str:
    """
    将BOM组件中文名翻译为指定语言。
    
    Args:
        name_cn: 组件中文名（如 '上钛板'）
        lang: 目标语言代码
    Returns:
        翻译后的名称。找不到则保留原名（中文受众）或 fallback 为英文名
    """
    if lang == "zh":
        return name_cn  # 中文受众保持原样
    
    data = _load_locales()
    if not data:
        return name_cn
    
    bom_names = data.get("bom_component_names")
    if isinstance(bom_names, dict) and name_cn in bom_names:
        entry = bom_names[name_cn]
        if isinstance(entry, dict) and lang in entry:
            return entry[lang]
        elif isinstance(entry, dict) and "en" in entry:
            return entry["en"]
    
    # 找不到翻译 → 中文受众返回原名，其他返回原名（至少可读）
    return name_cn


def translate_material(name_cn: str, lang: str = "en") -> str:
    """将材料中文名翻译为指定语言"""
    if lang == "zh":
        return name_cn
    
    data = _load_locales()
    if not data:
        return name_cn
    
    mat_names = data.get("material_names")
    if isinstance(mat_names, dict) and name_cn in mat_names:
        entry = mat_names[name_cn]
        if isinstance(entry, dict) and lang in entry:
            return entry[lang]
        elif isinstance(entry, dict) and "en" in entry:
            return entry["en"]
    
    return name_cn


def translate_electrical_part(name_cn: str, lang: str = "en") -> str:
    """将电器件中文名翻译为指定语言"""
    if lang == "zh":
        return name_cn
    
    data = _load_locales()
    if not data:
        return name_cn
    
    elec_names = data.get("electrical_part_names")
    if isinstance(elec_names, dict) and name_cn in elec_names:
        entry = elec_names[name_cn]
        if isinstance(entry, dict) and lang in entry:
            return entry[lang]
        elif isinstance(entry, dict) and "en" in entry:
            return entry["en"]
    
    return name_cn


def get_product_description(machine_type: str, width: str = "", lang: str = "en") -> str:
    """
    获取多语种产品描述。

    Args:
        machine_type: 机型代码 (如 A2FLJ, A3FLJ, A1SLJ)
        width: 带宽（用于 {width} 占位符）
        lang: 语言代码
    Returns:
        对应语言的描述文本
    """
    data = _load_locales()
    if not data:
        return f"The {machine_type} series represents HOLO's proven industrial technology."
    
    desc_map = data.get("product_descriptions", {})
    # 先找精确匹配
    for key in [machine_type, "_default"]:
        if key in desc_map:
            entry = desc_map[key]
            if isinstance(entry, dict) and lang in entry:
                text = entry[lang]
            elif isinstance(entry, dict) and "en" in entry:
                text = entry["en"]
            else:
                continue
            
            if width:
                try:
                    return text.format(width=width)
                except (KeyError, IndexError):
                    pass
            elif "{width}" in text:
                # 有占位符但没提供宽度 → 移除它
                import re
                text = re.sub(r'\s*\{width\}', '', text)
                text = re.sub(r'\s*,\s*$', '', text)  # 清理尾部逗号
                text = re.sub(r',(\s+[A-Za-z])', r' \1', text)  # 清理孤立逗号
            return text
    
    return f"The {machine_type} series represents HOLO's proven industrial technology."


def _format_fallback(key: str, **kwargs: Any) -> str:
    """兜底：key 本身作为返回值"""
    if kwargs:
        try:
            return key.format(**kwargs)
        except (KeyError, IndexError):
            pass
    return key


def is_rtl(lang: str) -> bool:
    """判断是否为 RTL 语言（从右到左）"""
    # 硬编码兜底（最可靠）
    if lang == "ar":
        return True
    # 从配置文件读取
    data = _load_locales()
    rtl_list = data.get("rtl_languages") if data else None
    if isinstance(rtl_list, list):
        return lang in rtl_list
    return False


def list_languages() -> List[Dict[str, str]]:
    """
    返回所有可用语言列表。
    每项包含: code, name, native, region
    """
    data = _load_locales()
    # languages 是顶层字典，直接取（不经过 get_locale 转换）
    raw = data.get("languages") if isinstance(data, dict) else None
    if not isinstance(raw, dict):
        return _FALLBACK_LANGUAGES
    result = []
    for code, info in raw.items():
        result.append({
            "code": code,
            "name": info.get("name", code),
            "native": info.get("native", code),
            "region": info.get("region", ""),
        })
    return result


def get_language_name(lang: str) -> str:
    """获取语言的可读名称"""
    langs = list_languages()
    for l in langs:
        if l["code"] == lang:
            return l["native"]
    return lang


def validate_lang(lang: str) -> bool:
    """检查语言代码是否有效"""
    valid = {l["code"] for l in list_languages()}
    return lang in valid


# 预定义常量
SUPPORTED_LANGUAGES = [
    "en", "es", "pt", "ar", "ru", "fr", "de", "ko", "ja", "zh"
]

VALID_AUDIENCES = ["bom", "end_customer", "all"]

# 兜底语言列表（当YAML加载失败时使用）
_FALLBACK_LANGUAGES = [
    {"code":"en","name":"English","native":"English","region":"Global"},
    {"code":"es","name":"Spanish","native":"Español","region":"LatAm, Spain"},
    {"code":"pt","name":"Portuguese","native":"Português","region":"Brazil, Angola"},
    {"code":"ar","name":"Arabic","native":"العربية","region":"Middle East, N.Africa"},
    {"code":"ru","name":"Russian","native":"Русский","region":"Russia, Central Asia"},
    {"code":"fr","name":"French","native":"Français","region":"W.Africa, France"},
    {"code":"de","name":"German","native":"Deutsch","region":"Germany, Austria"},
    {"code":"ko","name":"Korean","native":"한국어","region":"South Korea"},
    {"code":"ja","name":"Japanese","native":"日本語","region":"Japan"},
    {"code":"zh","name":"Chinese","native":"中文","region":"China, SE Asia"},
]
