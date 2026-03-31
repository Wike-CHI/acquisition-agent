# LinkedIn 决策人报告 - {{company_name}}

> 生成时间：{{date}}
> 目标市场：{{target_market}}
> 数据来源：{{data_source}}

---

## ★ Insight ─────────────────────────────────────

**LinkedIn 搜索策略洞察**：

{{#each insights}}
{{@index}}. **{{this.title}}** - {{this.description}}
{{/each}}

─────────────────────────────────────────────────

---

## 🎯 找到 {{total_contacts}} 个关键决策人

### 高优先级（直接决策者）

{{#each high_priority_contacts}}
#### {{@index}}️⃣ {{name}} - {{title}} ⭐⭐⭐⭐⭐

- **LinkedIn**: {{linkedin_url}}
- **公司**: {{company}}
- **地区**: {{location}}
- **经验**: {{experience}}
- **连接**: {{connections}} 连接，{{followers}} 关注者（{{activity_level}}）
- **决策权**: ⭐⭐⭐⭐⭐ {{decision_power}}
- **策略**: {{strategy}}

{{/each}}

---

### 中优先级（影响者）

{{#each medium_priority_contacts}}
#### {{@index}}️⃣ {{name}} - {{title}} ⭐⭐⭐⭐

- **LinkedIn**: {{linkedin_url}}
- **公司**: {{company}}
- **地区**: {{location}}
- **连接**: {{connections}} 连接（{{activity_level}}）
- **专业**: {{specialty}}
- **策略**: {{strategy}}

{{/each}}

---

### 低优先级（其他）

{{#each low_priority_contacts}}
#### {{@index}}️⃣ {{name}} - {{title}} ⭐⭐⭐

- **LinkedIn**: {{linkedin_url}}
- **公司**: {{company}}
- **连接**: {{connections}} 连接（{{activity_level}}）
- **策略**: {{strategy}}

{{/each}}

---

## 💎 额外发现

### 地理分布洞察

| 州/地区 | 公司数 | 决策人数 | 说明 |
|---------|--------|----------|------|
{{#each geographic_insights}}
| **{{region}}** | {{company_count}} | {{contact_count}} | {{note}} |
{{/each}}

### {{#if dual_contact_strategy}}双联系人策略{{/if}}

{{#if dual_contact_strategy}}
**{{dual_contact_strategy.company}}** 同时有 {{dual_contact_strategy.contact_count}} 个采购相关联系人：
{{#each dual_contact_strategy.contacts}}
- {{name}} ({{title}}，{{specialty}})
{{/each}}

**策略**: 同时联系 {{dual_contact_strategy.contact_count}} 人，增加成功率
{{/if}}

---

## 📋 本周行动计划

### 周一 - 发送 {{monday_contact_count}} 个连接请求

{{#each monday_contacts}}
✅ **{{name}}** - {{company}}（{{priority}}）
{{/each}}

---

{{#each connection_messages}}
**{{contact_name}} 连接消息**{{#if is_most_important}}（最重要）{{/if}}:

```
Hi {{first_name}},

{{message_body}}

Best,
[Your Name]
{{#if signature}}
{{signature}}{{/if}}
```

{{/each}}

---

### 周三 - 打电话到公司

**目标**: 获取采购部门直接邮箱

{{#each phone_targets}}
**{{company}}**:
```
电话: {{phone}}

脚本:
"Hi, this is [Your Name] from {{our_company}}.
We specialize in {{our_specialty}}.
Could I speak with someone in purchasing 
regarding supplier inquiries?"

备选:
"May I have the email address for your purchasing department?"
```

{{/each}}

---

### 周五 - 跟进已接受的连接

**检查 LinkedIn 连接状态**:
- [ ] 已接受 → 发送详细产品介绍 + 案例研究
- [ ] 未接受 → 准备邮件跟进

**产品资料准备**:
- [ ] 英文产品目录（PDF）
- [ ] 技术规格书
- [ ] 客户案例研究（2-3个）

---

## 📊 成功概率评估

┌──────────────────────┬──────────┬──────────┬────────────────┐
│ 联系人               │ 回应概率 │ 转化周期 │ 策略           │
├──────────────────────┼──────────┼──────────┼────────────────┤
{{#each success_probabilities}}
│ {{contact_name}}     │ {{response_rate}}      │ {{conversion_cycle}}    │ {{strategy}}           │
{{/each}}
└──────────────────────┴──────────┴──────────┴────────────────┘

---

## 📁 完整联系人清单已保存

```
{{save_path}}
├── {{report_filename}}  # 本报告
{{#each related_files}}
├── {{filename}}              # {{description}}
{{/each}}
```

**包含内容**：
- {{total_contacts}} 个决策人详细资料
- LinkedIn 连接消息模板
- 电话脚本
- 跟进时间表
- 成功指标

---

## 下一步建议

1. **现在就开始** - 立即发送前 {{monday_contact_count}} 个 LinkedIn 连接请求
2. **准备资料** - 英文产品目录、技术规格书、案例研究
3. **设定提醒** - 周三电话跟进，周五检查连接状态

---

## 需要我帮您：

1. ✍️ 起草其他人员的个性化连接消息？
2. 📧 准备英文产品介绍邮件？
3. 🔍 背调其他目标公司（{{#each other_target_companies}}{{name}}{{#unless @last}}、{{/unless}}{{/each}}）？

---

## 使用示例

### 输入数据

```json
{
  "company_name": "美国传送带行业",
  "target_market": "美国传送带制造商/服务商",
  "data_source": "Exa + LinkedIn Index",
  "insights": [
    {
      "title": "Michigan 是产业聚集地",
      "description": "4家公司集中在密歇根州，说明该地区是传送带产业中心"
    },
    {
      "title": "连接数反映活跃度",
      "description": "Katarina (500+连接) 和 Mike (500+连接) 比 Neil (2连接) 更容易联系到"
    }
  ],
  "high_priority_contacts": [
    {
      "name": "Katarina Katsavrias",
      "title": "采购经理",
      "linkedin_url": "https://www.linkedin.com/in/katarina-katsavrias-649ba31b",
      "company": "Dearborn Mid-West Conveyor Co.",
      "location": "Detroit Metropolitan Area, USA",
      "experience": "30年7个月",
      "connections": "500+",
      "followers": "1,093",
      "activity_level": "非常活跃",
      "decision_power": "采购经理，直接决策",
      "strategy": "最优先连接 - 高活跃度，30年经验，重视专业"
    }
  ]
}
```

### 生成命令

```
LinkedIn 决策人：[公司名/行业]
LinkedIn 决策人搜索：[关键词] [地区]
```

### 调用流程

```
1. mcporter call "exa.web_search_exa(query: 'site:linkedin.com purchasing manager [industry] [region]', numResults: 10)"
2. 解析搜索结果，提取决策人信息
3. 使用本模板生成报告
4. 保存到 projects/customer-data/
```

---

_生成时间：{{date}}_
_数据来源：{{data_source}}_
_Agent Reach 获客系统 v1.2.0_
