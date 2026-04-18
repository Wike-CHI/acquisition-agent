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
$wb = "$env:USERPROFILE\.workbuddy"
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
[邮件签名]   若 $signature 为 true → 显示 ✅ 邮件签名已配置   否则显示 ⚠️ 邮件签名未配置
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
> - 凭据文件路径：`%USERPROFILE%\.workbuddy\`（**不是** `.openclaw\`）
> - 如果所有凭据已配置，显示"🎉 所有核心配置已完成"并直接进入 Step 4 完整检查


---

### Step 1: 配置凭据

**引导用户配置3个平台凭据：**

#### 1.1 NAS凭据

```
📁 【1/3】NAS共享盘配置

用途: 访问产品资料、图片、视频
地址: 192.168.0.194

请输入NAS用户名（直接回车跳过）:
> ______

请输入NAS密码:
> ********

✅ NAS凭据已保存
```

#### 1.2 特易凭据

```
🔍 【2/3】特易海关数据配置

用途: 查询海关进出口数据
官网: https://et.topease.net

请输入特易账户名（直接回车跳过）:
> ______

请输入特易密码:
> ********

✅ 特易凭据已保存
```

#### 1.3 邮箱配置

```
📧 【3/5】邮箱发送配置

用途: 发送开发信、跟进邮件

支持的邮箱服务商:
  1. QQ邮箱
  2. 163邮箱
  3. Gmail
  4. Outlook
  5. 自定义SMTP

请选择邮箱服务商（输入数字，直接回车跳过）:
> __

请输入邮箱地址:
> ________________

请输入授权码（不是登录密码）:
> ********

✅ 邮箱配置已保存
```

**授权码获取指引**：

| 邮箱 | 获取步骤 |
|------|----------|
| QQ邮箱 | mail.qq.com → 设置 → 账户 → POP3/SMTP服务 → 生成授权码 |
| 163邮箱 | mail.163.com → 设置 → POP3/SMTP/IMAP → 开启SMTP → 获取授权码 |
| Gmail | Google账号 → 安全性 → 两步验证 → 应用专用密码 |

---

#### 1.4 邮件签名配置

```
✍️ 【4/5】邮件签名配置

用途: 开发信和跟进邮件的署名，让客户知道联系谁

每封邮件末尾会自动附上你的签名，请填写个人信息：

请输入你的姓名（英文）:
> ________________

请输入职位（如 Sales Manager，直接回车跳过）:
> ________________

请输入你的手机号（含国际区号，如 +86 138xxxx）:
> ________________

是否有 WhatsApp？(y/N)（同手机号请直接按 Y）:
> __

请输入公司官网（如 holobelt.com，直接回车跳过）:
> ________________

✅ 邮件签名已保存

预览:
─────────────────────────────
Best regards,
{姓名} | {职位}
HONGLONG Industrial Equipment
📞 {手机} (WhatsApp available)
📧 {邮箱}
🌐 {官网}
📍 Ruian, Wenzhou, Zhejiang 325200, China
─────────────────────────────
```

> ⚠️ **重要**：开发信签名必须用**本人联系方式**，不要用公司公共邮箱（sale@18816.cn）或公司座机。客户回复才能准确找到你。

---

#### 1.5 孚盟MX CRM配置

```
📊 【5/5】孚盟MX CRM配置

用途: 客户管理、CRM同步、客户查询

登录地址: https://fumamx.com/#/login

请输入孚盟账号（手机号/邮箱，直接回车跳过）:
> ________________

请输入孚盟密码:
> ********

✅ 孚盟账号已保存
```

---

#### 1.6 生成工作台配置

> **自动生成** — AI Agent 根据用户在 Step 1.3-1.4 中填写的信息，自动生成 workspace 配置文件。无需用户额外操作。

**执行逻辑**：

1. 从以下来源收集变量值：

| 变量 | 来源 | 默认值 |
|------|------|--------|
| `OWNER_NAME` | Step 1.4 姓名的中文/拼音 | 未设置 |
| `OWNER_DISPLAY_NAME` | Step 1.4 姓名 + 职位 | 未设置 |
| `OWNER_EMAIL` | Step 1.3 邮箱地址 | 未设置 |
| `OWNER_PHONE` | Step 1.4 手机号 | 未设置 |
| `COMPANY_NAME` | 公司常量 | HOLO Industrial Equipment Mfg Co., Ltd |
| `COMPANY_FULL_NAME` | 公司常量 | 温州红龙工业设备制造有限公司（HOLO Industrial Equipment Mfg Co., Ltd） |
| `BRAND_NAME` | 公司常量 | HOLO |
| `GITHUB_USER` | 跳过或用户自定义 | 未设置 |
| `FACTORY_LOCATION` | 公司常量 | 中国温州 |
| `TIMEZONE` | 公司常量 | 中国（UTC+8） |
| `COMPETITOR_NAME` | 公司常量 | Beltwin |
| `PIPELINE_DATA_PATH` | 自动检测 | `C:/Users/{系统用户名}/WorkBuddy/` |

2. 执行生成命令：

```powershell
powershell -ExecutionPolicy Bypass -File workspace/setup-user.ps1 `
  -OwnerName "用户填写的姓名" `
  -DisplayName "用户填写的姓名 / 职位" `
  -Email "用户填写的邮箱" `
  -Phone "用户填写的手机号" `
  -PipelinePath "C:/Users/$env:USERNAME/WorkBuddy/"
```

3. 验证生成结果：

```powershell
# 检查生成的文件是否包含实际值（而非占位符）
$files = @("USER.md", "IDENTITY.md", "AGENTS.md", "TOOLS.md", "SOUL.md", "MEMORY.md", "HEARTBEAT.md")
$all_ok = $true
foreach ($f in $files) {
    $path = "workspace/$f"
    if (Test-Path $path) {
        $content = Get-Content $path -Raw
        if ($content -match '\$\{[A-Z_]+\}') {
            Write-Host "⚠️ $f 仍有未替换的占位符"
            $all_ok = $false
        } else {
            Write-Host "✅ $f"
        }
    } else {
        Write-Host "❌ $f 未生成"
        $all_ok = $false
    }
}
```

**输出示例**：

```
📝 【6/6】生成工作台配置

根据你填写的信息，正在生成系统配置文件...

✅ USER.md      — 所有者档案
✅ IDENTITY.md  — AI 身份卡
✅ AGENTS.md    — SDR 操作手册
✅ TOOLS.md     — 工具配置
✅ SOUL.md      — 人格规范
✅ MEMORY.md    — 记忆协议
✅ HEARTBEAT.md — Pipeline 巡检

配置文件已生成到 workspace/ 目录。
后续可通过 bash workspace/setup-user.sh 重新生成。
```

> **备选方式**（IT 管理员批量部署）：
> 手动编辑 `.env` 文件后运行 `powershell workspace/setup-user.ps1` 或 `bash workspace/setup-user.sh`，无需经过引导流程。

---

### Step 2: 挂载NAS

```
📁 正在挂载NAS共享盘...

执行命令: .\skills\nas-file-reader\scripts\mount-nas.ps1

✅ NAS已挂载到 Y:
   可用空间: 2.5TB
   产品目录: Y:\1.HOLO机器目录
   视频目录: Y:\7.企业介绍宣传视频
```

**如果挂载失败**：
```
❌ NAS挂载失败

可能原因:
1. 网络不通 - 检查网络连接
2. 凭据错误 - 重新配置NAS账号
3. 服务器未开机 - 联系IT

是否重试？(Y/n)
```

---

### Step 3: 测试邮箱（可选）

```
📧 是否发送测试邮件验证邮箱配置？(Y/n)

[如果Y]
请输入接收测试邮件的邮箱地址:
> ________________

正在发送测试邮件...

✅ 测试邮件发送成功！
   请检查收件箱（包括垃圾邮件）

[如果失败]
❌ 邮件发送失败

可能原因:
1. 授权码错误 - 确认使用授权码而非登录密码
2. SMTP服务器错误 - 检查SMTP地址
3. 端口被阻止 - 尝试465/587/25端口

是否重新配置邮箱？(Y/n)
```

---

### Step 4: 完成检查

> **动态检测**：不再硬编码技能列表，改为自动扫描 `~/.workbuddy/skills/` 目录。

**检测逻辑**：
1. 扫描 `~/.workbuddy/skills/` 下所有子目录
2. 检查每个子目录是否存在 `SKILL.md`（有 = 已安装）
3. 读取每个 SKILL.md 的 frontmatter 获取技能名和版本
4. 对比 `global-customer-acquisition/dependencies/README.md` 中的 12 个核心依赖，标记缺失项

```bash
# 扫描已安装技能
ls ~/.workbuddy/skills/*/SKILL.md

# 检查核心依赖是否齐全
# 核心技能清单来自: global-customer-acquisition/dependencies/README.md
```

```
🔍 运行系统完整性检查...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
           获客系统状态检查报告
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 技能完整性 ({已安装数}/{总扫描数})
   {自动列出所有已安装的技能}

⚠️ 核心依赖缺失（如有）
   {对比 dependencies/README.md 中12个核心技能，列出缺失的}

✅ 凭据配置 (4/4)
   ✅ NAS凭据
   ✅ 特易凭据
   ✅ 邮箱配置
   ✅ 邮件签名

✅ 工作台配置 (7/7)
   ✅ USER.md / IDENTITY.md / AGENTS.md
   ✅ TOOLS.md / SOUL.md / MEMORY.md / HEARTBEAT.md

⚠️ 可选依赖（按需检查）
   ⚪ wacli CLI — WhatsApp触达必需
     检测: wacli --version
     安装: npm install -g wacli
   ⚪ Playwright — 浏览器自动化必需（通过 install-deps.sh 一键安装）
     检测: python3 -c "from playwright.sync_api import sync_playwright"
     安装: python3 -m playwright install chromium
   ⚪ Exa MCP — 语义搜索增强
     检测: 检查 mcp.json 中 exa 配置是否存在
     配置: 参考技能 exa-web-search-free
   ⚪ 特易 API — 海关数据查询
     检测: 检查 credential-manager 中 teyi_api_key 是否已存储
     配置: 联系特易平台获取 API Key

✅ 系统状态
   ✅ NAS已挂载 (Y:)
   ✅ 客户数据目录存在

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 系统完整性: 100%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### Step 4.5: 一键安装依赖

> **自动检测系统环境并安装所有依赖（Linux/macOS/Windows）**

**跨平台检测逻辑**：
```bash
# 自动检测 OS 类型
case "$(uname -s)" in
  Linux*)     # Debian/Ubuntu → apt-get
  Darwin*)    # macOS → brew
  CYGWIN*|MINGW*|MSYS*|NT*) # Windows → PowerShell
esac
# WSL2 额外处理 node path symlink
```

**自动安装的依赖**：

| 依赖 | 类型 | 用途 |
|------|------|------|
| openpyxl, docx, yaml, Pillow, requests, regex, lxml | Python | 文档处理、YAML解析、图片、HTTP |
| playwright + Chromium | Python | 浏览器自动化 |
| nodemailer | Node.js | 邮件发送 |

**执行命令**：

| 系统 | 一键安装命令 |
|------|-------------|
| Linux/macOS/WSL2 | `bash ~/.hermes/skills/acquisition/acquisition-dependencies/scripts/install-deps.sh` |
| Windows | `powershell -ExecutionPolicy Bypass -File %USERPROFILE%\.hermes\skills\acquisition\acquisition-dependencies\scripts\install-deps.ps1` |

**AI Agent 执行方式**（无需用户手动复制命令）：

```bash
# 自动检测 OS 类型并执行对应安装脚本
if uname -s | grep -qiE 'linux|darwin'; then
    bash ~/.hermes/skills/acquisition/acquisition-dependencies/scripts/install-deps.sh
elif uname -s | grep -qi 'cygwin|mingw|msys|nt'; then
    powershell -ExecutionPolicy Bypass -File "$env:USERPROFILE\.hermes\skills\acquisition\acquisition-dependencies\scripts\install-deps.ps1"
fi
```

**检测到依赖缺失时的输出示例**：

```
🔍 检测依赖安装状态...

  python3 openpyxl    → ✅ 已安装
  python3 docx        → ✅ 已安装
  python3 yaml        → ⚠️ 缺失
  python3 Pillow       → ✅ 已安装
  python3 playwright   → ⚠️ 缺失 (Chromium 未安装)
  node   nodemailer   → ✅ 已安装

发现 2 项依赖缺失，是否一键安装？(Y/n)
```

**用户回答 Y 后**，Agent 自动执行对应脚本，无需用户复制命令。执行完成后：

```
✅ 依赖安装完成！

  python3 yaml        → ✅ openpyxl docx pyyaml Pillow requests regex lxml
  python3 playwright  → ✅ chromium 已安装 (180MB)
  验证:              → ✅ 全部依赖就绪
```

---

### Step 5: 完成引导

```
🎉 初始化完成！获客系统已就绪。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
           快速开始指南
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 完整获客流程:
   帮我找10个美国的工业皮带分销商并发开发信

📌 单独使用各阶段:
   • 从海关数据查秘鲁的输送带采购商
   • 在LinkedIn上搜索德国的经销商
   • 背调这家公司: ABC Industrial
   • 给这5个客户发开发信

📌 系统管理:
   • 检查获客系统状态
   • 配置所有账号
   • 获客系统帮助

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

现在开始找客户吗？(Y/n)
```

---

## 🔄 重新初始化

如果需要重新配置：

```
重新初始化获客系统
```

会询问：
```
⚠️ 这将清除所有已保存的凭据和工作台配置，确定继续吗？(y/N)
```

**确认后执行清理**：

```powershell
# 清理 workspace 配置文件
powershell -ExecutionPolicy Bypass -File workspace/cleanup-user.ps1 -Force
```

清理完成后自动回到 Step 0 重新开始引导流程。

---

## 📊 状态检查命令

随时检查系统状态：

```
检查获客系统状态
```

或

```
获客系统状态
```

## 🗑️ 清理业务员配置

业务员离职或换人时，清理已生成的配置文件：

```
清理工作台配置
```

或手动执行：

```powershell
powershell -ExecutionPolicy Bypass -File workspace/cleanup-user.ps1
```

清理后重新运行 `初始化获客系统` 即可为新业务员生成配置。

---

## 🔧 跳过某步骤

用户可以在任意步骤选择跳过：
- 直接回车跳过当前配置
- 后续可以通过单独命令配置：
  - `配置NAS账号`
  - `配置特易账号`
  - `配置邮箱`
  - `配置邮件签名`

---

## ⚠️ 注意事项

1. **凭据安全**: 所有密码使用Windows DPAPI加密存储，仅当前用户可访问
2. **网络要求**: NAS挂载需要内网连接
3. **邮箱限制**: 每小时≤50封，每天≤200封
4. **首次使用**: 建议完成所有配置步骤

---

## 📞 获取帮助

初始化过程中随时输入 `帮助` 或 `help` 查看指引。

完成后输入 `获客系统帮助` 查看完整命令列表。

---

_版本: 2.1.0_
_更新: 2026-04-17_
_依赖: credential-manager, nas-file-reader, email-sender_
_v2.1 新增: Step 1.6 自动生成 workspace 配置文件_
