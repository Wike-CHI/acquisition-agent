## 🔴 价格数据来源（必须读NAS！）

> ⚠️ **价格来自NAS权威文件，每次报价前必须尝试读取最新数据**

### NAS价格文件路径

```powershell
# 挂载公司报价资料共享（W盘）
# 凭据从 DPAPI 加密文件读取（~/.openclaw/.nas_credentials）
$credFile = "$env:USERPROFILE\.openclaw\.nas_credentials"
if (Test-Path $credFile) {
    $enc = Get-Content $credFile -Raw | ConvertFrom-Json
    $user = $enc.User | ConvertTo-SecureString | ForEach-Object { [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($_)) }
    $pass = $enc.Pass | ConvertTo-SecureString | ForEach-Object { [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($_)) }
    net use W: \\192.168.0.98\公司报价资料 /user:$user $pass /persistent:yes
} else {
    Write-Warning "NAS credentials not found. Run mount-nas.ps1 -Setup first."
}

# 核心价格文件
W:\报价参考表.xlsx        # 最完整，含所有产品销售内部价
W:\风冷水冷机.xlsx         # 风冷水冷机规格对比
```

### 读取价格数据

```python
import openpyxl
wb = openpyxl.load_workbook('W:/报价参考表.xlsx', data_only=True, read_only=True)
# Sheet列表：打折报价表、报价表、二代空气冷、三代空气冷、小型风冷、窄风冷整体说明、空气冷备用件+膜+导条、碰接机...
# 价格列在第12列（index 11）：销售员内部价格（未税）
```

### 价格数据字段

| 列 | 含义 |
|----|------|
| 第2列 | 系统图号（型号编码） |
| 第3列 | 系统名称 |
| 第12列 | **销售员内部价格（未税）** ← 这是成本基准 |
| 第18列 | 备注（是否备库存） |

> 如果NAS不可用，使用 `references/products.md` 中的缓存数据（2025-11-27版本）

---

## 📌 REQUIRED: 报价记录回写（Phase 6）

> **MUST** — 每次完成报价后，必须执行以下两个步骤。不可跳过。

### Step 6.1：查询历史报价记录

在报价前，先查询该客户是否已有报价记录：

```powershell
powershell -File "{{SKILL_DIR}}/../knowledge-base/scripts/read-knowledge.ps1" -Type email -Name "{公司名}"
```

- 如果 `exists=true`：读取历史报价记录，在报价指引中标注"历史报价"
- 如果 `exists=false`：标注"首次报价"

### Step 6.2：保存报价记录到知识库

报价完成后，将报价摘要写入知识库：

```powershell
powershell -File "{{SKILL_DIR}}/../knowledge-base/scripts/write-knowledge.ps1" -Type email -Name "{公司名}" -Content @"
---
title: {公司名} - 报价记录
type: quote
customer: {公司名}
country: {国家}
---

# 报价记录

## 报价信息
- 报价日期：{日期}
- 报价产品：{产品名}
- 数量：{数量}
- 利润率区间：{最低}% - {最高}%
- 推荐利润率：{推荐}%
- 报价有效期：{有效期}
- 付款方式：{付款方式}

## 背调信息
- ICP评分：{分数}（{等级}级）
- 企业规模：{规模}

## 状态
- 报价状态：pending_approval
- 是否发送客户：否
- 客户反馈：待跟进
"@
```

### Step 6.3：记录活动日志

```powershell
powershell -File "{{SKILL_DIR}}/../holo-activity-log/scripts/log-activity.ps1" -ActionType quote -Customer "{公司名}" -Result success -Score {ICP分数} -Notes "利润率{最低}-{最高}%，产品{产品名}" -SkillName smart-quote
```

---

## 汇率数据来源

报价时如需换算为外币，使用 `scripts/exchange_rate.py` 查询实时汇率：

```bash
# 查询特定货币汇率
python scripts/exchange_rate.py --from CNY --to USD

# 换算金额
python scripts/exchange_rate.py 52000 CNY USD EUR BRL

# JSON 格式输出（供程序调用）
python scripts/exchange_rate.py 52000 CNY USD --json

# 历史汇率
python scripts/exchange_rate.py --from CNY --date 2026-05-01
```

| 数据源 | 说明 |
|--------|------|
| open.er-api.com | 主源，免费无需 API key，日更，支持 160+ 货币 |
| frankfurter.app | 降级备用，ECB 数据，30+ 主流货币 |

- 默认使用报价当日汇率
- open.er-api.com 不可用时自动降级到 frankfurter.app
- 汇率仅作参考，正式报价以 CNY EX-Factory 为准
- 客户要求锁定汇率超过 7 天需升级老板审批
---

---

## 详细参考

> 以下内容已拆分到 [[references/detailed-steps.md]]，仅在需要时读取：
> - 详细参考
>
> 何时读取：需要查阅详细步骤、模板、配置或示例时。
