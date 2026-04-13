# -*- coding: utf-8 -*-
"""
HOLO 产品参数数据库
为信息图生成提供动态产品数据

使用方法:
    from product_db import get_product_specs
    specs = get_product_specs('A3FLJ')
    specs = get_product_specs('ASJ')
"""

PRODUCTS = {
    # ========== 风冷机系列 ==========
    'A2FLJ': {
        'name': 'A2FLJ Air-Cooled Belt Splicing Machine',
        'name_cn': '二代风冷皮带接头机',
        'type': 'Air-Cooled',
        'generation': 'Second Generation',
        'belt_width': '300mm — 2100mm',
        'heating_plate': '1200mm × 600mm',
        'temp_control': 'Eurotherm 3216 Controller, ±2°C Precision',
        'heating_time': '15-30 minutes',
        'pressure': '0.8-1.5 MPa',
        'voltage': '380V / 50Hz (3-phase)',
        'power': '18 kW',
        'temp_range': '0-200°C',
        'plate_pressure': '1.5 MPa',
        'accuracy': '±2°C',
        'weight': '800 kg',
        'dimension': '2200×1100×1400mm',
        'controller': 'Eurotherm 3216',
        'pump': 'Thomas Pump',
        'pneumatics': 'SMC',
        'material': '304 Stainless Steel',
        'controller_desc': 'Industry-leading precision temperature control',
        'pump_desc': 'German engineering for reliable air compression',
        'pneumatics_desc': 'Japanese quality components for durability',
        'material_desc': 'Premium materials for corrosion resistance',
        'desc': 'The A2FLJ series represents HOLO\'s proven air-cooled vulcanizing technology. Cost-effective solution for standard belt splicing applications.',
        'image_dir': r'Y:\1.HOLO机器目录（最终资料存放）\1.风冷皮带接头机\二代风冷皮带接头机 PA-Ⅱ',
        'default_image': r'Y:\1.HOLO机器目录（最终资料存放）\1.风冷皮带接头机\二代风冷皮带接头机 PA-Ⅱ\纯二代风冷机照片\老图\白底图\IMG_1058.jpg',
    },
    
    'A3FLJ': {
        'name': 'A3FLJ Air-Cooled Belt Splicing Machine',
        'name_cn': '三代风冷皮带接头机',
        'type': 'Air-Cooled',
        'generation': 'Third Generation',
        'belt_width': '300mm — 3600mm',
        'heating_plate': '1200mm × 600mm (customizable)',
        'temp_control': 'Eurotherm 3216 Controller, ±2°C Precision',
        'heating_time': '15-30 minutes (varies by belt thickness)',
        'pressure': '0.8-1.5 MPa',
        'voltage': '380V / 50Hz (3-phase)',
        'power': '18 kW',
        'temp_range': '0-200°C',
        'plate_pressure': '1.5 MPa',
        'accuracy': '±2°C',
        'weight': '850 kg',
        'dimension': '2400×1200×1500mm',
        'controller': 'Eurotherm 3216',
        'pump': 'Thomas Pump',
        'pneumatics': 'SMC',
        'material': '304 Stainless Steel',
        'controller_desc': 'Industry-leading precision temperature control',
        'pump_desc': 'German engineering for reliable air compression',
        'pneumatics_desc': 'Japanese quality components for durability',
        'material_desc': 'Premium materials for corrosion resistance',
        'desc': 'The A3FLJ series represents HOLO\'s most advanced air-cooled vulcanizing technology. Engineered for reliability and precision, it delivers consistent results across mining, cement, ports, and power generation applications worldwide.',
        'image_dir': r'Y:\1.HOLO机器目录（最终资料存放）\1.风冷皮带接头机\三代风冷皮带接头机',
        'default_image': r'Y:\1.HOLO机器目录（最终资料存放）\1.风冷皮带接头机\三代风冷皮带接头机  Air Cooling Conveyor Belt Splicing Machine PA-Ⅲ 300-2400吴植材设计\说明书\三代风冷机.jpg',
    },
    
    'A4FLJ': {
        'name': 'A4FLJ Air-Cooled Belt Splicing Machine',
        'name_cn': '四代风冷皮带接头机',
        'type': 'Air-Cooled',
        'generation': 'Fourth Generation',
        'belt_width': '1800mm — 3600mm',
        'heating_plate': '1400mm × 700mm (customizable)',
        'temp_control': 'Eurotherm 3216 Controller, ±1°C Precision',
        'heating_time': '12-25 minutes',
        'pressure': '1.0-2.0 MPa',
        'voltage': '380V / 50Hz (3-phase)',
        'power': '24 kW',
        'temp_range': '0-220°C',
        'plate_pressure': '2.0 MPa',
        'accuracy': '±1°C',
        'weight': '950 kg',
        'dimension': '2600×1300×1600mm',
        'controller': 'Eurotherm 3216',
        'pump': 'Thomas Pump',
        'pneumatics': 'SMC',
        'material': '304 Stainless Steel',
        'controller_desc': 'Enhanced precision for heavy-duty applications',
        'pump_desc': 'High-capacity air compression system',
        'pneumatics_desc': 'Industrial-grade pneumatic components',
        'material_desc': 'Reinforced structure for large belt applications',
        'desc': 'The A4FLJ series is HOLO\'s premium air-cooled solution for large-scale belt splicing operations. Designed for maximum power and precision.',
        'image_dir': r'Y:\1.HOLO机器目录（最终资料存放）\1.风冷皮带接头机\四代风冷皮带接头机',
        'default_image': None,
    },
    
    # ========== 水冷机系列 ==========
    'ASJ': {
        'name': 'ASJ Water-Cooled Belt Splicing Machine',
        'name_cn': '水冷式皮带接头机',
        'type': 'Water-Cooled',
        'generation': 'Standard Series',
        'belt_width': '600mm — 4200mm',
        'heating_plate': '1400mm × 700mm (customizable)',
        'temp_control': 'Eurotherm Controller, ±2°C Precision',
        'heating_time': '20-40 minutes',
        'pressure': '1.0-2.0 MPa',
        'voltage': '380V / 50Hz (3-phase)',
        'power': '30 kW',
        'temp_range': '0-200°C',
        'plate_pressure': '2.0 MPa',
        'accuracy': '±2°C',
        'weight': '1200 kg',
        'dimension': '2800×1400×1700mm',
        'controller': 'Eurotherm',
        'pump': 'Water Circulation Pump',
        'pneumatics': 'SMC',
        'material': '304/201 Stainless Steel',
        'controller_desc': 'Stable temperature control with water cooling',
        'pump_desc': 'Efficient water circulation for uniform heating',
        'pneumatics_desc': 'Japanese quality pneumatic components',
        'material_desc': 'Heavy-duty stainless steel frame',
        'desc': 'The ASJ series features advanced water-cooling technology for continuous large-scale belt splicing operations. Ideal for heavy-duty industrial applications requiring extended run times.',
        'image_dir': r'Y:\1.HOLO机器目录（最终资料存放）\2.水冷式接头机 Water Cooling Conveyor Belt Splicing Machine',
        'default_image': r'Y:\1.HOLO机器目录（最终资料存放）\2.水冷式接头机 Water Cooling Conveyor Belt Splicing Machine\二代水冷式皮带接头机；（蓝色）Water Cooling Conveyor Belt Splicing Machine   PA-Ⅱ吴植财\260115二代水冷皮带接头机修图\白底图\正面.jpg',
    },
    
    # ========== 其他设备 ==========
    'FJ': {
        'name': 'FJ Easy-Clean Belt Press Machine',
        'name_cn': '易洁带碰接机',
        'type': 'Easy-Clean',
        'generation': 'Standard',
        'belt_width': '600mm — 2400mm',
        'heating_plate': '1000mm × 500mm',
        'temp_control': 'Digital Controller, ±3°C',
        'heating_time': '15-25 minutes',
        'pressure': '0.5-1.0 MPa',
        'voltage': '380V / 50Hz',
        'power': '12 kW',
        'temp_range': '0-180°C',
        'plate_pressure': '1.0 MPa',
        'accuracy': '±3°C',
        'weight': '600 kg',
        'dimension': '1800×1000×1300mm',
        'controller': 'Digital Controller',
        'pump': 'Standard Pump',
        'pneumatics': 'Standard',
        'material': '304 Stainless Steel',
        'controller_desc': 'Simple and reliable temperature control',
        'pump_desc': 'Standard air compression system',
        'pneumatics_desc': 'Reliable pneumatic components',
        'material_desc': 'Food-grade stainless steel construction',
        'desc': 'The FJ Easy-Clean series is designed for food-grade conveyor belt splicing with easy cleaning and maintenance.',
        'image_dir': r'Y:\1.HOLO机器目录（最终资料存放）\3.易洁带碰接机',
        'default_image': None,
    },
}


def get_product_specs(product_code: str) -> dict:
    """
    获取产品参数
    
    Args:
        product_code: 产品型号 (如 'A3FLJ', 'ASJ')
    
    Returns:
        产品参数字典，如果型号不存在返回 A3FLJ 默认值
    """
    code = product_code.upper()
    if code not in PRODUCTS:
        print(f'⚠️ 未知产品型号: {code}，使用 A3FLJ 默认参数')
        return PRODUCTS.get('A3FLJ', {})
    return PRODUCTS[code]


def list_products() -> list:
    """列出所有可用产品"""
    return list(PRODUCTS.keys())


if __name__ == '__main__':
    print('HOLO 产品数据库')
    print('=' * 50)
    for code in list_products():
        specs = get_product_specs(code)
        print(f"\n{code}: {specs['name_cn']}")
        print(f"  规格: {specs['belt_width']}")
