---
name: holo-social-infographic
description: "HOLO社媒信息图生成技能 - 使用 Draw.io CLI 生成技术参数图、流程图、对比图。所有数据必须来自 NAS 共享盘真实产品资料，禁止捏造。"
version: 2.3.0
triggers:
  - 生成信息图
  - 信息图
  - 技术参数图
  - 产品参数图
  - 流程图
  - 对比图
  - 规格对比
  - 产品对比
  - 竞品对比
  - 技术参数
  - 参数图
  - 设备参数
  - 产品规格
  - 尺寸图
  - 结构图
  - 原理图
  - 示意图
  - 画流程图
  - 画对比图
  - 画参数图
  - 制作信息图
  - 制作参数图
  - 生成参数图
  - 展示参数
  - 可视化参数
  - 技术说明图
---

# HOLO 社媒信息图生成技能

> **Skill Graph：** 领域 → [[_index-outreach|多渠道触达领域]]


> 使用 Draw.io CLI 生成技术参数信息图，用于社媒运营配图

---

## ⚠️ 核心原则

**所有技术参数必须来自 NAS 共享盘真实资料，禁止捏造！**

### 数据来源
- **优先读取**：`honglong-products` 技能的结构化产品知识库
- **权威兜底**：NAS `Y:\1.HOLO机器目录（最终资料存放）\` 原始文件
- **验证规则**：所有参数必须可溯源到具体 NAS 文件

---

## 🎯 核心功能

| 功能 | 用途 | 示例 |
|------|------|------|
| 技术参数图 | 展示设备规格 | 加热板尺寸、温控精度 |
| 流程图 | 展示操作流程 | 接头操作步骤 |
| 对比图 | 与竞品对比 | HOLO vs Flexco |
| 应用场景图 | 展示适用行业 | 矿山/水泥/港口 |
| 客户案例图 | 展示成功案例 | 客户名称+效果数据 |

---

## 📊 HOLO 产品真实参数（来源：NAS）

### 风冷机（A2FRJ / A3FRJ / A4FRJ）
| 参数 | 规格 | 数据来源 |
|------|------|----------|
| 加热板尺寸 | 300-3600mm | NAS 产品目录 |
| 温控精度 | ±2°C | NAS 技术文档 |
| 加热时间 | 15-30 分钟 | NAS 技术文档 |
| 电源 | 380V / 50Hz | NAS 规格书 |
| 压力系统 | 液压 | NAS 技术文档 |

### 水冷机（ASJ系列）
| 参数 | 规格 | 数据来源 |
|------|------|----------|
| 加热板尺寸 | 600-4200mm | NAS 产品目录 |
| 机身类型 | 不锈钢/井字型 | NAS 产品目录 |
| 冷却方式 | 水循环冷却 | NAS 技术文档 |
| 适用带宽 | 650-2400mm | NAS 规格书 |

### 分层机
| 参数 | A1FQJ | B1OQFJ | 数据来源 |
|------|-------|--------|----------|
| 分层宽度 | 750mm | 1000mm | NAS 产品目录 |
| 分层厚度 | 3-15mm | 3-20mm | NAS 技术文档 |

### 多功能导条机
| 参数 | XDT1300 | XDT2000 | 数据来源 |
|------|---------|---------|----------|
| 导条宽度 | 1300mm | 2000mm | NAS 产品目录 |
| 适用规格 | 多种规格 | 多种规格 | NAS 技术文档 |

---

## 🚀 使用方式

### ⭐ 统一生成器（推荐）

```bash
# 使用统一脚本生成信息图
python holo_infographic.py [command] [参数]

# 可用命令:
python holo_infographic.py comparison              # 竞品对比长图
python holo_infographic.py spec                    # 技术参数图（默认A3FLJ）
python holo_infographic.py spec A3FLJ              # 指定型号
python holo_infographic.py spec A2FLJ              # 指定型号
python holo_infographic.py spec A3FLJ "Y:\图片.jpg"  # 指定型号+图片
python holo_infographic.py flow                    # 操作流程图
python holo_infographic.py faq [型号]              # FAQ 图文
python holo_infographic.py selector                # 产品选型图
python holo_infographic.py applications            # 应用场景图
```

**技术参数图支持传入 NAS 产品图片路径**，自动加载到 Hero 区域。

---

## 📊 新增功能：数据驱动的信息图

### 核心原则：真实数据，禁止 Mock

所有信息图的数据必须来自以下来源：

| 来源 | 内容 | 获取方式 |
|------|------|----------|
| **NAS 共享盘** | 真实产品参数、客户案例、应用照片 | `nas-file-reader` 技能 |
| **产品知识库** | 产品规格、技术描述、行业分类 | `honglong-products` 技能 |
| **网络搜索** | 行业数据、竞品信息、应用场景 | `exa-search` / `web-search` |

### 1. FAQ 图文 (`faq` 命令)

```bash
python holo_infographic.py faq A3FLJ
```

**数据来源流程**：
1. 📂 NAS - 读取产品说明书的 FAQ 章节
2. 📚 知识库 - 读取常见问题列表
3. 🔍 网络搜索 - 补充行业常见问题
   - 搜索：`conveyor belt splicing FAQ`, `belt splicer troubleshooting`

**输出**：针对特定产品的 FAQ 信息图

### 2. 产品选型图 (`selector` 命令)

```bash
python holo_infographic.py selector
```

**数据来源流程**：
1. 📂 NAS - 读取全系列产品的真实参数对比
2. 📚 知识库 - 获取产品定位和分类
3. 🔍 网络搜索 - 补充行业选型标准
   - 搜索：`belt splicer selection guide`, `conveyor belt width selection`

**输出**：HOLO 全系列产品选型指南

### 3. 应用场景图 (`applications` 命令)

```bash
python holo_infographic.py applications
```

**数据来源流程**：
1. 📂 NAS - 读取客户案例、产品应用照片
2. 📚 知识库 - 获取各行业应用描述
3. 🔍 网络搜索 - 搜索行业应用数据
   - 搜索：`mining conveyor belt splicing`, `cement plant belt maintenance`
   - 行业：Mining, Cement, Port, Steel, Power, Food

**输出**：HOLO 应用场景展示图

---

### 🔍 网络搜索集成

当需要生成这三类信息图时，应先进行网络搜索：

```python
# FAQ 搜索
"conveyor belt splicing machine common problems"
"belt splicer FAQ troubleshooting"
"industrial belt joining questions"

# 选型搜索
"how to select belt splicing machine"
"conveyor belt width selection criteria"
"air cooled vs water cooled belt splicer"

# 应用场景搜索
"mining conveyor belt splicing applications"
"cement plant belt maintenance solutions"
"port cargo handling belt systems"
```

**注意**：搜索结果用于参考和补充，最终数据必须与 NAS 和知识库交叉验证。

### 脚本位置

```
skills/holo-social-infographic/
├── holo_infographic.py           # 统一生成器（入口）
└── templates/
    ├── HOLO_竞品对比长图_国际版_v2.html    # ✅ 竞品对比
    └── HOLO_技术参数图_国际版.html          # ✅ 技术参数（新增）
```

### Playwright 截图核心函数

```python
def html_to_png(html_path, output_path, viewport_height=3000):
    """HTML 转 PNG - 完整页面截图"""
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={'width': 1920, 'height': 100})
        page.goto(f'file:///{html_path}')
        page.set_viewport_size({'width': 1920, 'height': viewport_height})
        page.screenshot(path=output_path, full_page=True)
        browser.close()
```

### HTML 模板制作规范

1. **宽度固定 1920px**
2. **背景白色**，不用深色
3. **字体用 Inter**（Google Fonts CDN）
4. **无 emoji**，用纯色块或线条代替
5. **产品图片用 `file:///` 协议加载 NAS 文件**

### 模板文件格式

```html
<!-- 必须包含 -->
<meta name="viewport" content="width=1920">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
    body { font-family: 'Inter', sans-serif; width: 1920px; }
</style>
```

---

---

## 详细参考

> 以下内容已拆分到 [[references/templates-and-examples.md]]，仅在需要时读取：
> - 📋 信息图模板
> - 🔧 常见操作示例
> - ⚙️ 技术要求
> - 📁 输出目录结构
> - 📐 标准生成脚本模板
> - 🔴 关键规范
> - 📝 更新记录
>
> 何时读取：需要查阅详细步骤、模板、配置或示例时。
