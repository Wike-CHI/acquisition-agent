# 凭据配置模板

> ⚠️ **复制此文件为 credentials.md 并填入真实凭据**
> ⚠️ **credentials.md 包含敏感信息，已在 .gitignore 中排除**

---

## NAS共享盘凭据

| 字段 | 示例值 | 说明 |
|------|--------|------|
| NAS地址 | 192.168.0.194 | 固定 |
| 业务员NAS账号 | {{NAS_USERNAME}} | 业务员独立账号 |
| 业务员NAS密码 | {{NAS_PASSWORD}} | 业务员独立密码 |
| 可访问共享目录 | 产品检测标准、公司报价资料等 | 已验证✅ |

---

## 特易海关数据凭据

| 字段 | 示例值 | 说明 |
|------|--------|------|
| 特易官网 | https://et.topease.net | 固定 |
| 登录链接 | https://et.topease.net/login?product=gt | 固定 |
| 特易账号 | {{TEYI_USERNAME}} | 海关数据查询账号 |
| 特易密码 | {{TEYI_PASSWORD}} | 海关数据查询密码 |
| 客服电话 | 021-64869988 | 技术支持 |

---

## 孚盟MX CRM凭据（可选）

| 字段 | 示例值 | 说明 |
|------|--------|------|
| 登录地址 | https://fumamx.com/#/login | 固定 |
| 孚盟账号 | {{FUMAM_USERNAME}} | 手机号/邮箱 |
| 孚盟密码 | {{FUMAM_PASSWORD}} | 登录密码 |

---

## 邮箱SMTP配置

| 字段 | 示例值 | 说明 |
|------|--------|------|
| 邮箱服务商 | 163/163/gmail | 固定 |
| 邮箱地址 | {{SMTP_USER}} | 发送地址 |
| SMTP服务器 | smtp.163.com | 固定 |
| SMTP端口 | 465 | SSL加密 |
| 授权码 | {{SMTP_PASSWORD}} | 不是登录密码 |

---

## API密钥配置（可选）

| 字段 | 示例值 | 说明 |
|------|--------|------|
| DeepSeek API Key | {{DEEPSEEK_API_KEY}} | 使用内置AI模型，无需配置 |
| Exa API Key | {{EXA_API_KEY}} | 使用 Exa Web Search (Free) 技能，无需配置 |

---

*此文件由 acquisition-init 技能自动管理*
*密码应使用 Windows DPAPI 加密存储*
