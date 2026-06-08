## CTA页面

```
┌─────────────────────────────────────────┐
│                                         │
│    接下来，我们建议您：                  │
│                                         │
│    ┌─────────────────────────────────┐  │
│    │                                 │  │
│    │  ① 安排15分钟线上演示           │  │
│    │     我可以为您远程展示设备实际运转│  │
│    │                                 │  │
│    │  ② 工厂参观                     │  │
│    │     欢迎来温州实地考察，          │  │
│    │     我们报销差旅费用             │  │
│    │                                 │  │
│    │  ③ 样品测试                     │  │
│    │     我们可以先发一台样机测试      │  │
│    │                                 │  │
│    └─────────────────────────────────┘  │
│                                         │
│    ─────────────────────────────────    │
│                                         │
│    Wike Chen | Sale Manager             │
│    HOLO Industrial Equipment Mfg Co., Ltd│
│    M: +86 131 6586 2311                │
│    E: wikeye@163.com                    │
│    W: www.holo-industrial.com           │
│                                         │
└─────────────────────────────────────────┘
```

---

## 依赖

- **Python库**：reportlab（PDF生成）
- **数据来源**：smart-quote（报价策略）、company-research（客户背调）
- **品牌资产**：HOLO Logo（从NAS读取）、产品图片占位符

---

## 文件结构

```
holo-proposal-generator/
├── SKILL.md                    # 本文件
├── references/
│   └── proposal-template.md    # 提案模板规范（含各模块详细格式）
└── scripts/
    └── generate_proposal.py    # PDF生成脚本
```

---

## 使用示例

### 完整调用流程

```
业务员：帮我给Belttech生成一个提案
系统：
  ① 检测到客户：Belttech（巴西）
  ② 检测到最近报价：HL-BR-2026-0409-01（已生成）
  ③ 正在组装提案内容...
  ④ 正在生成PDF...
  ⑤ ✅ 提案已生成：~/proposals/Belttech_Proposal_2026-04-14.pdf

  请选择：
  1. 直接下载
  2. 通过163邮箱发送
```

### 快速调用（信息不全时）

```
业务员：生成提案
系统：
  请提供以下信息（可以只填必填项）：
  ① 客户公司名： Belttech
  ② 客户国家： Brazil
  ③ 产品方案（如：三代风冷1200 × 2台）： 三代风冷1200 × 2 + 分层机130 × 1
  ④ 有竞品在比较吗？（选填）： Beltwin
  ⑤ 付款方式偏好（选填）： T/T 30%
  ⑥ 交货期要求（选填）： 30天内
```

---

## 📌 REQUIRED: 提案 PDF 备份到 NAS

> **MUST** — PDF 生成后必须尝试备份到 NAS。不可跳过。

### 备份步骤

```powershell
# 确保 NAS 已挂载
$credFile = "$env:USERPROFILE\.openclaw\.nas_credentials"
$enc = Get-Content $credFile -Raw | ConvertFrom-Json
$user = $enc.User | ConvertTo-SecureString | ForEach-Object { [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($_)) }
$pass = $enc.Pass | ConvertTo-SecureString | ForEach-Object { [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($_)) }
$nasPath = "\\192.168.0.98\AI数据\proposals"
if (!(Test-Path "K:")) { net use K: \\192.168.0.98\home /user:$user $pass /persistent:yes }
if (!(Test-Path $nasPath)) { New-Item -ItemType Directory -Path $nasPath -Force }
Copy-Item "~/proposals/{ClientName}_Proposal_{Date}.pdf" "$nasPath/{ClientName}_Proposal_{Date}.pdf" -Force
```

**NAS 路径**：`\\192.168.0.98\AI数据\proposals\{客户名}_Proposal_{日期}.pdf`

**降级策略**：NAS 不可用时仅本地存储，不阻断流程。

### 记录活动日志

```powershell
powershell -File "{{SKILL_DIR}}/../holo-activity-log/scripts/log-activity.ps1" -ActionType quote -Customer "{公司名}" -Result success -Notes "提案PDF已生成并备份" -SkillName holo-proposal-generator
```

---

## 已知Bug

### Python脚本禁止中文字符变量名

**文件：** `scripts/generate_proposal.py`

**问题：** 使用中文变量名（如 `条款_data`）在某些环境下导致 `NameError`，但错误指向调用处而非定义处，极难定位。

**根因：** write_file 工具对中文字符的编码处理存在边缘case。

**教训：** 代码正文（变量名/函数名）必须只用ASCII字符。中文只允许出现在注释和字符串字面量（Paragraph文本内容）中。

---

## 版本历史

- v1.0.0 (2026-04-14) — 初始版本，5模块结构（封面/背景/对比/案例/条款），reportlab PDF输出
