---
name: acquisition-init
version: 2.1.0
description: 获客系统初始化引导 v2.1。首次使用时引导用户配置凭据、生成工作台配置、挂载NAS、测试邮箱、安装依赖。当用户说"初始化获客系统"、"开始使用获客系统"、"一键安装依赖"时触发。
always: false
triggers:
  - 初始化获客系统
  - 初始化获客集群
  - 获客系统初始化
  - 开始使用获客系统
  - 获客系统设置
  - 一键安装依赖
  - 安装系统依赖
  - 安装全部依赖
  - 清理工作台配置
  - 清理业务员配置
  - 重置工作台
---

# 获客系统初始化引导

> **Skill Graph：** 领域 → [[_index-meta|系统元技能领域]] | 上游 ← [[_index-acquisition|核心流程领域]] | 下游 → [[acquisition-dependencies|依赖安装]]（环境就绪后）


首次使用获客技能集群时，引导用户完成初始化配置。

---

## 🚀 启动初始化

当用户说以下任一命令时触发：
- `初始化获客系统`
- `开始使用获客系统`
- `获客系统初始化`

---

## 📋 初始化流程

### Step 0: 欢迎检查

> **动态检测** — AI Agent 读取本技能后，必须先执行以下命令检测实际配置状态，再向用户展示结果。不得使用硬编码的静态文本。

**执行以下检测命令（PowerShell）：**

```powershell
# 检测凭据文件是否存在
$wb = "$env:USERPROFILE\.acquisition-agent"
$nas_cred   = Test-Path "$wb\.nas_credentials"
$teyi_cred  = Test-Path "$wb\.teyi_credentials"
$email_cfg  = Test-Path "$wb\.email_config.json"
$signature  = Test-Path "$wb\.email_signatures.json"

# 检测 workspace 配置文件是否存在且已填充（非模板占位符）
$ws = "workspace"
$ws_configured = $false
if (Test-Path "$ws/USER.md") {
    $content = Get-Content "$ws/USER.md" -Raw
    if ($content -notmatch '\$\{OWNER_NAME\}') { $ws_configured = $true }
}

# 从 workspace operator-config.md 读取签名姓名（优先于 .email_signatures.json）
$op_cfg = "$ws/operator-config.md"
if (Test-Path $op_cfg) {
    $op_content = Get-Content $op_cfg -Raw
    if ($op_content -match '未设置') {
        # workspace 未配置，继续用旧文件
    } else {
        $ws_identity_ok = $true
        # 提取姓名用于显示
        if ($op_content -match '\| 姓名 \| ([^|]+) \|') { $sig_name = $Matches[1].Trim() }
    }
}

# 检测 NAS 是否已挂载
$nas_mounted = Test-Path "Y:\"

# 读取邮箱配置获取发送方地址（用于显示）
$email_addr = ""
if (Test-Path "$wb\.email_config.json") {
    try {
        $cfg = Get-Content "$wb\.email_config.json" | ConvertFrom-Json
        $email_addr = $cfg.sender_email ?? ""
    } catch {}
}

# 读取签名配置获取姓名（用于显示）
$sig_name = ""
if (Test-Path "$wb\.email_signatures.json") {
    try {
        $sig = Get-Content "$wb\.email_signatures.json" | ConvertFrom-Json
        $sig_name = $sig.name ?? ""
    } catch {}
}
```

**根据检测结果动态生成输出（AI 按以下逻辑判断并展示）：**

```
🔍 检查当前系统状态...

✅ 已完成:
   - [x] 技能已安装

[NAS凭据]    若 $nas_cred  为 true → 显示 ✅ NAS凭据已配置    否则显示 ⚠️ NAS凭据未配置
[特易凭据]   若 $teyi_cred 为 true → 显示 ✅ 特易凭据已配置   否则显示 ⚠️ 特易凭据未配置
[邮箱配置]   若 $email_cfg 为 true → 显示 ✅ 邮箱配置已完成   否则显示 ⚠️ 邮箱配置未完成
[邮件签名]   若 $ws_identity_ok 为 true → 显示 ✅ 业务员身份已配置   否则若 $signature 为 true → 显示 ✅ 邮件签名已配置(旧格式)   否则显示 ⚠️ 业务员身份未配置
[工作台配置] 若 $ws_configured 为 true → 显示 ✅ 工作台配置已生成 否则显示 ⚠️ 工作台配置未生成
[NAS挂载]    若 $nas_mounted 为 true → 显示 ✅ NAS已挂载(Y:) 否则显示 ⚠️ NAS未挂载
```

**底部状态提示（AI 根据检测结果选择对应内容展示）：**

- **情况A**：三项核心凭据（NAS/特易/邮箱）和工作台配置全部未配置 →
  ```
  ⚠️ 尚未配置任何凭据。
  [若 $email_addr 不为空则显示: 检测到邮箱: $email_addr]
  [若 $sig_name   不为空则显示: 签名姓名: $sig_name]

  是否开始初始化配置？(Y/n)
  ```

- **情况B**：部分凭据未配置 →
  ```
  📋 发现未配置项目，继续完成初始化？
  ```

- **情况C**：所有核心配置均已完成 →
  ```
  🎉 所有核心配置已完成！

  [若 $email_addr 不为空则显示: ✅ 邮箱: $email_addr]
  [若 $sig_name   不为空则显示: ✅ 签名: $sig_name]
  [若 $nas_mounted 为 true 则显示: ✅ NAS已挂载]

  输入任意键查看完整状态报告，或直接输入任务（如"帮我找客户"）
  ```

> **关键要求**：
> - **禁止**使用硬编码的 `✅/⚠️` 状态，必须基于实际文件检测结果
> - **禁止**跳过检测直接显示"需要配置"，必须先执行上面的 PowerShell 检测
> - 凭据文件路径：`acquisition-agent/` 项目根目录下
> - 如果所有凭据已配置，显示"🎉 所有核心配置已完成"并直接进入 Step 4 完整检查


---

---

## 详细参考

> 以下内容已拆分到 [[references/detailed-setup.md]]，仅在需要时读取：
> - 🔄 重新初始化
> - 📊 状态检查命令
> - 🗑️ 清理业务员配置
> - 🔧 跳过某步骤
> - ⚠️ 注意事项
> - 📞 获取帮助
>
> 详细的初始化步骤（凭据配置、NAS挂载、邮箱测试、依赖安装等）。
