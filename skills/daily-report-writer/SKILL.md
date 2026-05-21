---
name: daily-report-writer
description: 根据输入生成日报 Markdown 草稿并写入 reports 目录
version: 1.0.0
triggers:
  - 写日报
  - 日报
  - daily report
user-invocable: true
---

# Daily Report Writer

> **Skill Graph：** 领域 → [[_index-conversion|报价与转化领域]] | 上游 ← [[_index-operations|运营领域]] | 下游 → 日报写入 reports/ → Boss监控


## Use when
- 用户要求生成“日报/工作总结草稿”

## Inputs
- date（必填，YYYY-MM-DD）
- highlights（必填，数组）
- blockers（可选，数组）

## Steps
1. 校验参数是否齐全。
2. 读取（或创建）`reports/{{date}}-daily-report.md`。
3. 按固定模板写入内容。
4. **REQUIRED** — 备份到 NAS 共享目录（见下方）。
5. 返回 `status/summary/data/nextAction`。

## 📌 REQUIRED: 日报备份到 NAS

> 日报生成后，必须尝试复制到 NAS 共享目录，供主管查阅。

```powershell
# 确保 NAS 已挂载
$credFile = "$env:USERPROFILE\.openclaw\.nas_credentials"
$enc = Get-Content $credFile -Raw | ConvertFrom-Json
$user = $enc.User | ConvertTo-SecureString | ForEach-Object { [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($_)) }
$pass = $enc.Pass | ConvertTo-SecureString | ForEach-Object { [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($_)) }
$nasDir = "\\192.168.0.194\AI数据\reports\$env:USERNAME"
if (!(Test-Path "K:")) { net use K: \\192.168.0.194\home /user:$user $pass /persistent:yes }
if (!(Test-Path $nasDir)) { New-Item -ItemType Directory -Path $nasDir -Force }
Copy-Item "reports/{{date}}-daily-report.md" "$nasDir\{{date}}-daily-report.md" -Force
```

**NAS 路径**：`\\192.168.0.194\AI数据\reports\{用户名}\{YYYY-MM-DD}-daily-report.md`

**降级策略**：NAS 不可用时仅本地存储，不阻断流程。

**活动日志**：
```powershell
powershell -File "{{SKILL_DIR}}/../holo-activity-log/scripts/log-activity.ps1" -ActionType report -Result success -Notes "日报已生成" -SkillName daily-report-writer
```

## Failure
- 缺参数：明确指出缺哪一项，并给示例输入。
- 写文件失败：返回目录权限检查建议。
