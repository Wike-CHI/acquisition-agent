# Operator Config — 业务员身份配置

> 由 setup-user.ps1 自动生成，所有技能读取此文件获取业务员身份。
> 技能引用路径：`../../workspace/operator-config.md`

## 身份

| 字段 | 值 |
|------|-----|
| 姓名 | ${OWNER_DISPLAY_NAME} |
| 角色 | Sale Manager |
| 公司 | ${COMPANY_NAME} |
| 公司全称 | ${COMPANY_FULL_NAME} |
| 品牌 | ${BRAND_NAME} |
| 工厂地址 | ${FACTORY_LOCATION} |

## 联系方式

| 字段 | 值 |
|------|-----|
| 邮箱 | ${OWNER_EMAIL} |
| 电话 | ${OWNER_PHONE} |
| WhatsApp | ${OWNER_PHONE} |

## 邮件签名

```
${OWNER_DISPLAY_NAME}
Sale Manager | ${COMPANY_NAME}
${OWNER_PHONE}
${OWNER_EMAIL}
${BRAND_NAME} — Professional Belt Splicing Solutions
```
