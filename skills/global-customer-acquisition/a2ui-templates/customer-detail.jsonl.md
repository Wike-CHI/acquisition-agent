# 客户详情 A2UI 模板

{"id":"root","component":{"Card":{"child":"content"}}}
{"id":"content","component":{"Column":{"children":["header","info","score","actions"]}}}
{"id":"header","component":{"Text":{"text":{"literalString":"🏢 {{公司名}}"},"usageHint":"h1"}}}
{"id":"info","component":{"Column":{"children":["industry","location","products","contact"]}}}
{"id":"industry","component":{"Row":{"children":["industry-icon","industry-text"]}}}
{"id":"industry-icon","component":{"Icon":{"icon":"factory","color":"primary"}}}
{"id":"industry-text","component":{"Text":{"text":{"literalString":"行业：{{行业}}"},"usageHint":"body1"}}}
{"id":"location","component":{"Row":{"children":["location-icon","location-text"]}}}
{"id":"location-icon","component":{"Icon":{"icon":"location","color":"primary"}}}
{"id":"location-text","component":{"Text":{"text":{"literalString":"地区：{{地区}}"},"usageHint":"body1"}}}
{"id":"products","component":{"Row":{"children":["products-icon","products-text"]}}}
{"id":"products-icon","component":{"Icon":{"icon":"inventory","color":"primary"}}}
{"id":"products-text","component":{"Text":{"text":{"literalString":"兴趣：{{产品}}"},"usageHint":"body1"}}}
{"id":"contact","component":{"Row":{"children":["contact-icon","contact-text"]}}}
{"id":"contact-icon","component":{"Icon":{"icon":"person","color":"primary"}}}
{"id":"contact-text","component":{"Text":{"text":{"literalString":"联系人：{{联系人}}"},"usageHint":"body1"}}}
{"id":"score","component":{"Card":{"child":"score-content"}}}
{"id":"score-content","component":{"Row":{"children":["score-label","score-badge","score-status"]}}}
{"id":"score-label","component":{"Text":{"text":{"literalString":"ICP评分"},"usageHint":"h3"}}}
{"id":"score-badge","component":{"Badge":{"text":"{{分数}}","variant":"success"}}}
{"id":"score-status","component":{"Text":{"text":{"literalString":"({{等级}})"},"usageHint":"body2"}}}
{"id":"actions","component":{"Row":{"children":["btn-email","btn-quote","btn-crm"]}}}
{"id":"btn-email","component":{"Button":{"text":"📧 发送开发信","variant":"primary"}}}
{"id":"btn-quote","component":{"Button":{"text":"📋 生成报价","variant":"secondary"}}}
{"id":"btn-crm","component":{"Button":{"text":"📝 更新CRM","variant":"secondary"}}}

---

## 变量说明

| 变量 | 示例值 |
|------|--------|
| {{公司名}} | ACE Belting |
| {{行业}} | 输送带制造 |
| {{地区}} | 美国德州 |
| {{产品}} | 风冷机、打齿机 |
| {{联系人}} | John Smith |
| {{分数}} | 8.5 |
| {{等级}} | A级客户 |

---

## 使用示例

用户输入：
```
显示ACE Belting的客户详情
```

AI生成（替换变量）：
```jsonl
{"id":"root","component":{"Card":{"child":"content"}}}
{"id":"content","component":{"Column":{"children":["header","info","score","actions"]}}}
{"id":"header","component":{"Text":{"text":{"literalString":"🏢 ACE Belting"},"usageHint":"h1"}}}
{"id":"info","component":{"Column":{"children":["industry","location","products","contact"]}}}
{"id":"industry","component":{"Row":{"children":["industry-icon","industry-text"]}}}
{"id":"industry-icon","component":{"Icon":{"icon":"factory","color":"primary"}}}
{"id":"industry-text","component":{"Text":{"text":{"literalString":"行业：输送带制造"},"usageHint":"body1"}}}
{"id":"location","component":{"Row":{"children":["location-icon","location-text"]}}}
{"id":"location-icon","component":{"Icon":{"icon":"location","color":"primary"}}}
{"id":"location-text","component":{"Text":{"text":{"literalString":"地区：美国德州"},"usageHint":"body1"}}}
{"id":"products","component":{"Row":{"children":["products-icon","products-text"]}}}
{"id":"products-icon","component":{"Icon":{"icon":"inventory","color":"primary"}}}
{"id":"products-text","component":{"Text":{"text":{"literalString":"兴趣：风冷机、打齿机"},"usageHint":"body1"}}}
{"id":"contact","component":{"Row":{"children":["contact-icon","contact-text"]}}}
{"id":"contact-icon","component":{"Icon":{"icon":"person","color":"primary"}}}
{"id":"contact-text","component":{"Text":{"text":{"literalString":"联系人：John Smith"},"usageHint":"body1"}}}
{"id":"score","component":{"Card":{"child":"score-content"}}}
{"id":"score-content","component":{"Row":{"children":["score-label","score-badge","score-status"]}}}
{"id":"score-label","component":{"Text":{"text":{"literalString":"ICP评分"},"usageHint":"h3"}}}
{"id":"score-badge","component":{"Badge":{"text":"8.5","variant":"success"}}}
{"id":"score-status","component":{"Text":{"text":{"literalString":"(A级客户)"},"usageHint":"body2"}}}
{"id":"actions","component":{"Row":{"children":["btn-email","btn-quote","btn-crm"]}}}
{"id":"btn-email","component":{"Button":{"text":"📧 发送开发信","variant":"primary"}}}
{"id":"btn-quote","component":{"Button":{"text":"📋 生成报价","variant":"secondary"}}}
{"id":"btn-crm","component":{"Button":{"text":"📝 更新CRM","variant":"secondary"}}}
```
