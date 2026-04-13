# -*- coding: utf-8 -*-
"""
NAS 图片扫描器
从 NAS 共享盘动态扫描产品图片

功能:
- 根据产品代码自动定位 NAS 目录
- 扫描白底图目录，优先选择白底图
- 扫描产品目录，返回最佳图片路径

使用方法:
    from nas_image_scanner import get_product_image
    img_path = get_product_image('A3FLJ')
    img_path = get_product_image('ASJ')
    img_path = get_product_image('A3FLJ', prefer=['正面', '白底'])
"""

from pathlib import Path
from typing import Optional, List
import re

# NAS 共享盘根目录
NAS_ROOT = Path(r'Y:\1.HOLO机器目录（最终资料存放）')

# 产品目录映射表（基于实际 NAS 结构）
PRODUCT_DIRS = {
    'A2FLJ': {
        'base': '1.风冷皮带接头机',
        'dir': '二代风冷皮带接头机（二代风冷易洁带接头机） PA-Ⅱ吴植材设计',
        'photo_dir': '纯二代风冷机照片',  # 白底图在这个目录下
        'white_bg_subdir': '老图\\白底图',  # 相对路径
    },
    'A3FLJ': {
        'base': '1.风冷皮带接头机',
        'dir': '三代风冷皮带接头机  Air Cooling Conveyor Belt Splicing Machine PA-Ⅲ 300-2400吴植材设计',
        'photo_dir': '照片',
        'white_bg_subdir': '白底图',
    },
    'A4FLJ': {
        'base': '1.风冷皮带接头机',
        'dir': '四代风冷皮带接头机  Air Cooling Conveyor Belt Splicing Machine  PA-Ⅳ吴植材',
        'photo_dir': None,  # 稍后扫描
        'white_bg_subdir': None,
    },
    'ASJ': {
        'base': '2.水冷式接头机 Water Cooling Conveyor Belt Splicing Machine',
        'dir': '二代水冷式皮带接头机；（蓝色）Water Cooling Conveyor Belt Splicing Machine   PA-Ⅱ吴植财',
        'photo_dir': None,
        'white_bg_subdir': None,
    },
    'FJ': {
        'base': '3.易洁带碰接机',
        'dir': None,  # 直接在 base 下
        'photo_dir': None,
        'white_bg_subdir': None,
    },
    'FCJ': {
        'base': '4.输送带分层机',
        'dir': None,
        'photo_dir': None,
        'white_bg_subdir': None,
    },
    'DCJ': {
        'base': '5.打齿机',
        'dir': None,
        'photo_dir': None,
        'white_bg_subdir': None,
    },
    'CQJ': {
        'base': '7.裁切 切割、环切、分切机',
        'dir': None,
        'photo_dir': None,
        'white_bg_subdir': None,
    },
    'DJJ': {
        'base': '8.焊接 导条机',
        'dir': None,
        'photo_dir': None,
        'white_bg_subdir': None,
    },
    'LXJ': {
        'base': '15.橡胶带硫化机',
        'dir': None,
        'photo_dir': None,
        'white_bg_subdir': None,
    },
}

# 白底图目录名（按优先级）
WHITE_BG_DIRS = ['白底图', '白底', 'white_bg', 'white-background']


def find_images_in_dir(base_dir: Path, extensions: List[str] = ['.jpg', '.png', '.jpeg']) -> List[Path]:
    """递归扫描目录下所有图片"""
    images = []
    if not base_dir.exists():
        return images
    
    try:
        for ext in extensions:
            images.extend(base_dir.rglob(f'*{ext}'))
            images.extend(base_dir.rglob(f'*{ext.upper()}'))
    except PermissionError:
        pass
    
    return images


def find_white_bg_dir(base_dir: Path) -> Optional[Path]:
    """查找白底图目录"""
    if not base_dir.exists():
        return None
    
    # 直接在基础目录下找
    for dir_name in WHITE_BG_DIRS:
        white_dir = base_dir / dir_name
        if white_dir.exists():
            return white_dir
    
    # 递归查找子目录（最多2层）
    for subdir in base_dir.iterdir():
        if subdir.is_dir():
            for dir_name in WHITE_BG_DIRS:
                white_dir = subdir / dir_name
                if white_dir.exists():
                    return white_dir
                # 在子子目录里找
                for subsubdir in subdir.iterdir():
                    if subsubdir.is_dir():
                        white_dir = subsubdir / dir_name
                        if white_dir.exists():
                            return white_dir
    
    return None


def get_product_base_path(product_code: str) -> Optional[Path]:
    """获取产品的基础目录路径"""
    if product_code not in PRODUCT_DIRS:
        return None
    
    cfg = PRODUCT_DIRS[product_code]
    base = NAS_ROOT / cfg['base']
    
    if cfg.get('dir'):
        return base / cfg['dir']
    
    return base


def get_product_photo_dir(product_code: str) -> Optional[Path]:
    """获取产品的照片目录"""
    if product_code not in PRODUCT_DIRS:
        return None
    
    cfg = PRODUCT_DIRS[product_code]
    base_path = get_product_base_path(product_code)
    
    if not base_path or not base_path.exists():
        return None
    
    # 如果有明确指定
    if cfg.get('photo_dir'):
        photo_dir = base_path / cfg['photo_dir']
        if photo_dir.exists():
            return photo_dir
    
    # 否则扫描找照片目录
    for subdir in base_path.iterdir():
        if subdir.is_dir():
            if '照片' in subdir.name or 'photo' in subdir.name.lower():
                return subdir
    
    # 直接返回基础目录
    return base_path


def get_white_bg_dir(product_code: str) -> Optional[Path]:
    """获取白底图目录"""
    cfg = PRODUCT_DIRS.get(product_code, {})
    base_path = get_product_base_path(product_code)
    
    if not base_path:
        return None
    
    # 如果有明确指定的子路径
    if cfg.get('white_bg_subdir'):
        white_dir = base_path / cfg['white_bg_subdir']
        if white_dir.exists():
            return white_dir
    
    # 否则自动查找
    photo_dir = get_product_photo_dir(product_code)
    if photo_dir:
        white_dir = find_white_bg_dir(photo_dir)
        if white_dir:
            return white_dir
    
    # 最后在整个产品目录下找
    return find_white_bg_dir(base_path)


def find_best_image(product_code: str) -> Optional[Path]:
    """查找最佳产品图片"""
    # 1. 先找白底图目录
    white_bg_dir = get_white_bg_dir(product_code)
    if white_bg_dir and white_bg_dir.exists():
        images = find_images_in_dir(white_bg_dir)
        if images:
            # 优先选择正面图
            for img in sorted(images):
                name_lower = img.stem.lower()
                if '正面' in img.stem or 'front' in name_lower:
                    return img
            # 按文件名排序返回第一张
            return sorted(images)[0]
    
    # 2. 在照片目录里找
    photo_dir = get_product_photo_dir(product_code)
    if photo_dir:
        all_images = find_images_in_dir(photo_dir)
        if all_images:
            # 排除非产品图片
            filtered = [img for img in all_images 
                       if '视频' not in str(img) 
                       and 'Video' not in str(img)
                       and '微信' not in str(img)
                       and '手机' not in str(img)
                       and '修图' not in str(img)
                       and '海报' not in str(img)]
            
            if filtered:
                # 优先正面图
                for img in sorted(filtered):
                    name_lower = img.stem.lower()
                    if '正面' in img.stem or 'front' in name_lower:
                        return img
                    if '产品' in img.stem or 'product' in name_lower:
                        return img
                return sorted(filtered)[0]
    
    # 3. 在整个产品目录下找
    base_path = get_product_base_path(product_code)
    if base_path:
        all_images = find_images_in_dir(base_path)
        if all_images:
            filtered = [img for img in all_images 
                       if '视频' not in str(img) 
                       and 'Video' not in str(img)
                       and '微信' not in str(img)
                       and '修图' not in str(img)]
            if filtered:
                return sorted(filtered)[0]
    
    return None


def get_product_image(product_code: str) -> Optional[str]:
    """
    获取产品的最佳图片路径
    
    Args:
        product_code: 产品代码 (A2FLJ, A3FLJ, ASJ 等)
    
    Returns:
        图片路径字符串，或 None
    """
    best_image = find_best_image(product_code)
    
    if best_image:
        return str(best_image)
    
    print(f'⚠️ 未找到产品图片: {product_code}')
    return None


def scan_all_products() -> dict:
    """扫描所有产品的图片，返回映射表"""
    results = {}
    for code in PRODUCT_DIRS:
        img = get_product_image(code)
        results[code] = img
    return results


def get_image_sources(product_code: str) -> dict:
    """获取图片来源的详细信息"""
    base_path = get_product_base_path(product_code)
    photo_dir = get_product_photo_dir(product_code)
    white_bg_dir = get_white_bg_dir(product_code)
    
    return {
        'product_code': product_code,
        'base_path': str(base_path) if base_path else None,
        'base_exists': base_path.exists() if base_path else False,
        'photo_dir': str(photo_dir) if photo_dir else None,
        'photo_exists': photo_dir.exists() if photo_dir else False,
        'white_bg_dir': str(white_bg_dir) if white_bg_dir else None,
        'white_bg_exists': white_bg_dir.exists() if white_bg_dir else False,
        'best_image': get_product_image(product_code),
    }


# 测试
if __name__ == '__main__':
    print('=== NAS 图片扫描测试 ===\n')
    
    # 测试指定产品
    for code in ['A2FLJ', 'A3FLJ', 'ASJ', 'A4FLJ']:
        info = get_image_sources(code)
        print(f'\n--- {code} ---')
        print(f'  基础路径: {info["base_path"]}')
        print(f'  路径存在: {info["base_exists"]}')
        print(f'  白底图目录: {info["white_bg_dir"]}')
        print(f'  最佳图片: {Path(info["best_image"]).name if info["best_image"] else "无"}')
    
    print('\n\n=== 扫描所有产品 ===')
    results = scan_all_products()
    for code, img_path in results.items():
        status = '✅' if img_path else '❌'
        print(f'{status} {code}: {Path(img_path).name if img_path else "无图片"}')
