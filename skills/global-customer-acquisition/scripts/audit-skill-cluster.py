import json
import os

print("=" * 60)
print("📊 获客技能集群详细审查")
print("=" * 60)

# 1. 产品配置审查
print("\n🏭 1. 产品配置审查")
print("-" * 60)

with open('config/products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

product_series = products.get('products', {})
print(f"产品系列数: {len(product_series)}")
print(f"公司信息: {products.get('company', {}).get('name', 'N/A')}")

total_models = 0
for series_name, series_data in product_series.items():
    if isinstance(series_data, dict):
        models = series_data.get('models', [])
        if models:
            count = len(models)
            total_models += count
            print(f"  ✅ {series_name}: {count} 个型号")
        elif 'series' in series_data:
            # 多层系列（如水冷机）
            sub_series = series_data.get('series', {})
            for sub_name, sub_data in sub_series.items():
                if isinstance(sub_data, dict) and 'models' in sub_data:
                    count = len(sub_data.get('models', []))
                    total_models += count
                    print(f"  ✅ {series_name}/{sub_name}: {count} 个型号")

print(f"\n总产品型号: {total_models}+")

# 2. 客户状态配置审查
print("\n📋 2. 客户状态配置审查")
print("-" * 60)

with open('config/customer-status.json', 'r', encoding='utf-8') as f:
    status_config = json.load(f)

statuses = status_config.get('statuses', [])
print(f"客户状态数: {len(statuses)}")
for status in statuses:
    print(f"  • {status.get('label', 'N/A')} ({status.get('key', 'N/A')})")

grades = status_config.get('gradeThresholds', {})
print(f"\n客户等级数: {len(grades)}")
for grade, threshold in grades.items():
    print(f"  • {grade}级: {threshold.get('min', 0)}-{threshold.get('max', 100)} 分")

icp_dims = status_config.get('icpScoring', {}).get('dimensions', [])
print(f"\nICP评分维度: {len(icp_dims)}")
for dim in icp_dims:
    print(f"  • {dim.get('label', 'N/A')} (权重: {dim.get('weight', 0)})")

# 3. 核心工具审查
print("\n🔧 3. 核心工具审查")
print("-" * 60)

tools = [
    'lib/quotation-generator.js',
    'lib/customer-manager.js',
    'lib/email-polisher.js',
    'lib/context-manager.js',
    'lib/skill-controller.js',
    'lib/memory-executor.js',
    'lib/hard-case-miner.js',
    'lib/skill-evolution-coordinator.js'
]

for tool in tools:
    if os.path.exists(tool):
        size = os.path.getsize(tool) / 1024
        print(f"  ✅ {os.path.basename(tool)} ({size:.1f} KB)")
    else:
        print(f"  ❌ {tool} (缺失)")

# 4. 统计
print("\n📊 4. 统计")
print("-" * 60)

# 统计代码行数
js_lines = 0
py_lines = 0

for root, dirs, files in os.walk('lib'):
    for file in files:
        if file.endswith('.js'):
            with open(os.path.join(root, file), 'r', encoding='utf-8') as f:
                js_lines += len(f.readlines())

for root, dirs, files in os.walk('scripts'):
    for file in files:
        if file.endswith('.py'):
            with open(os.path.join(root, file), 'r', encoding='utf-8') as f:
                py_lines += len(f.readlines())

print(f"JavaScript 代码行数: {js_lines}")
print(f"Python 代码行数: {py_lines}")
print(f"总代码行数: {js_lines + py_lines}")

# 5. 配置质量
print("\n✅ 5. 配置质量")
print("-" * 60)

checks = []

# 检查产品配置
if total_models >= 40:
    checks.append("✅ 产品型号充足 (50+)")
else:
    checks.append("⚠️ 产品型号不足")

# 检查客户状态
if len(statuses) >= 9:
    checks.append("✅ 客户状态完整 (9个)")
else:
    checks.append("⚠️ 客户状态不完整")

# 检查ICP评分
if len(icp_dims) >= 6:
    checks.append("✅ ICP评分维度完整 (6个)")
else:
    checks.append("⚠️ ICP评分维度不完整")

# 检查核心工具
tool_count = sum(1 for t in tools if os.path.exists(t))
if tool_count == len(tools):
    checks.append("✅ 核心工具完整 (8/8)")
else:
    checks.append(f"⚠️ 核心工具不完整 ({tool_count}/{len(tools)})")

# 检查定价策略
if 'pricingPolicy' in products.get('notes', {}):
    checks.append("✅ 定价策略已明确")
else:
    checks.append("⚠️ 定价策略未明确")

for check in checks:
    print(f"  {check}")

# 6. 健康度评分
print("\n🎯 6. 健康度评分")
print("-" * 60)

score = 0
max_score = 5

if total_models >= 40: score += 1
if len(statuses) >= 9: score += 1
if len(icp_dims) >= 6: score += 1
if tool_count == len(tools): score += 1
if 'pricingPolicy' in products.get('notes', {}): score += 1

health = (score / max_score) * 100
print(f"健康度: {health:.0f}% ({score}/{max_score})")

if health >= 80:
    print("状态: 🟢 优秀")
elif health >= 60:
    print("状态: 🟡 良好")
else:
    print("状态: 🔴 需改进")

print("\n" + "=" * 60)
print("✅ 审查完成")
print("=" * 60)
