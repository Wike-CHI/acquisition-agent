---
name: credential-manager
version: 1.0.0
description: 统一凭据管理技能。支持对话式配置各平台账号密码，使用Windows DPAPI安全加密存储。
always: false
triggers:
  - 配置凭据
  - 配置账号
  - 查看已配置账号
  - credential
  - credentials
---

# credential-manager

> 统一凭据管理技能。支持对话式配置各平台账号密码，使用Windows DPAPI安全加密存储。

## 功能

- 💬 **对话式配置** - 直接在对话中输入账号密码
- 🔐 **安全加密** - Windows DPAPI加密存储
- 🎯 **统一管理** - 管理所有平台凭据
- 🔄 **自动读取** - 其他技能自动调用

## 支持的平台

| 平台 | 凭据文件 | 用途 |
|------|----------|------|
| **NAS** | `.nas_credentials` | 访问共享盘 |
| **特易** | `.teyi_credentials` | 海关数据查询 |
| **邮箱** | `.email_config.json` | 邮件发送 |

## 对话式配置

### 方式1: 直接对话

```
用户: 配置特易账号
AI: 请输入特易账户名：
用户: your_teyi_username
AI: 请输入特易密码：
用户: your_teyi_password
AI: ✅ 特易凭据已安全保存
```

### 方式2: 一次性配置

```
用户: 配置所有账号
AI: 好的，我们逐个配置。

    【1/3】NAS共享盘
    请输入NAS用户名（直接回车跳过）：
    用户: HOLO
    AI: 请输入NAS密码：
    用户: ********
    AI: ✅ NAS已保存
    
    【2/3】特易海关
    请输入特易账户名（直接回车跳过）：
    用户: your_teyi_username
    AI: 请输入特易密码：
    用户: ********
    AI: ✅ 特易已保存
    
    【3/3】邮箱
    选择邮箱服务商（QQ/163/Gmail/跳过）：
    用户: QQ
    AI: 请输入QQ邮箱地址：
    用户: xxx@qq.com
    AI: 请输入授权码（不是QQ密码）：
    用户: ********
    AI: ✅ 邮箱已保存
    
    🎉 所有凭据配置完成！

```

### 方式3: 更新单个

```
用户: 更新特易密码
AI: 请输入新的特易密码：
用户: ********
AI: ✅ 特易密码已更新
```

## 安全机制

### 存储方式

```
用户输入密码
      ↓
Windows DPAPI加密
（使用当前用户密钥）
      ↓
保存到本地文件
（仅当前用户可读）
      ↓
其他用户无法解密
```

### 文件权限

```
文件: %USERPROFILE%\.openclaw\.xxx_credentials
权限: 仅当前用户（Owner）
加密: Windows DPAPI
位置: 本地（不上传云端）
```

## 查看已配置平台

```
用户: 查看已配置的账号
AI: 已配置的平台：
    
    ✅ NAS共享盘
       用户名: HOLO
       配置时间: 2026-03-25 14:30
    
    ✅ 特易海关
       账户名: your_teyi_username
       配置时间: 2026-03-25 14:35
    
    ✅ QQ邮箱
       邮箱: xxx@qq.com
       配置时间: 2026-03-25 14:40
    
    ❌ Gmail邮箱
       状态: 未配置
```

## 删除凭据

```
用户: 删除特易账号
AI: ⚠️ 确认删除特易凭据？(y/n)
用户: y
AI: ✅ 特易凭据已删除
```

## 集成方式

其他技能调用凭据：

```powershell
# 读取特易凭据
$credFile = "$env:USERPROFILE\.openclaw\.teyi_credentials"
if (Test-Path $credFile) {
    $encrypted = Get-Content $credFile | ConvertFrom-Json
    $user = $encrypted.User | ConvertTo-SecureString | ForEach-Object {
        [Runtime.InteropServices.Marshal]::PtrToStringAuto(
            [Runtime.InteropServices.Marshal]::SecureStringToBSTR($_)
        )
    }
    $pass = $encrypted.Pass | ConvertTo-SecureString | ForEach-Object {
        [Runtime.InteropServices.Marshal]::PtrToStringAuto(
            [Runtime.InteropServices.Marshal]::SecureStringToBSTR($_)
        )
    }
    # 使用 $user 和 $pass
}
```

## 快速命令

| 命令 | 用途 |
|------|------|
| `配置特易账号` | 配置特易海关 |
| `配置NAS账号` | 配置共享盘 |
| `配置邮箱` | 配置邮件发送 |
| `配置所有账号` | 一次性配置 |
| `查看已配置账号` | 列出平台 |
| `更新[平台]密码` | 更新密码 |
| `删除[平台]账号` | 删除凭据 |

## 注意事项

1. **首次使用** - 会引导输入账号密码
2. **密码安全** - 使用Windows加密，不会泄露
3. **换电脑** - 需要重新配置（安全考虑）
4. **忘记密码** - 删除凭据文件，重新配置

---

_Version: 1.0.0_
_Updated: 2026-03-25_
