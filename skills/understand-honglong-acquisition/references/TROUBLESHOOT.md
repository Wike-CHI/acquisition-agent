# 常见错误与排错指南（学习指南版）

> 本文件是主技能 `HOLO-AGENT` references/TROUBLESHOOT.md 的精简学习版。
> 完整版请参考：`C:\Users\Administrator\.workbuddy\skills\global-customer-acquisition\references\TROUBLESHOOT.md`

---

## 6大踩坑验证

| # | 错误 | 正确做法 | 铁律编号 |
|---|------|---------|---------|
| 1 | LinkedIn决策人 → linkedin技能 | **Exa搜索**（`site:linkedin.com`）| 铁律4 |
| 2 | 海关数据 → API调用 | **agent-browser RPA** | - |
| 3 | 无邮箱 → 继续开发信 | **必须先获取联系方式** | 铁律5 |
| 4 | 开发信跳过润色/评分 | **必须润色+评分≥9.0分** | 铁律7 |
| 5 | 使用info@等通用邮箱 | **必须用决策人邮箱** | 铁律1 |
| 6 | 使用exa-search-free结果直接发邮件 | **仅作线索，必须二次验证** | 铁律4 |

---

## 常见错误排查

### 错误1：工具选择错误

**症状**：使用linkedin MCP工具搜索决策人

**原因**：LinkedIn MCP有速率限制

**解决**：使用Exa搜索 `site:linkedin.com + 关键词`

---

### 错误2：联系信息过时

**症状**：客户回复"已调岗"或邮件退回

**原因**：使用超过6个月的信息

**解决**：
1. 检查信息时效性（6个月内）
2. 多源验证（LinkedIn + 官网 + 特易）
3. 确认决策人职位

---

### 错误3：开发信被忽略

**症状**：回复率 < 1%

**原因**：开发信质量低，有明显AI味

**解决**：
1. 使用humanize-ai-text润色
2. 评分 ≥ 9.0分才能发送
3. 第2轮润色如果第1轮 < 9.0分

---

### 错误4：开发矿业客户

**症状**：客户不感兴趣，产品不匹配

**原因**：红龙产品不适合矿业，15,885家验证0家矿业客户

**解决**：
1. 检查公司名是否包含"mining"
2. 排除矿业关键词
3. 专注于分销商和加工厂

---

### 错误5：技能引用方式错误

**症状**：技能无法加载

**原因**：使用绝对路径而非skill://协议

**解决**：
- ✅ `skill://acquisition-coordinator`
- ❌ `.workbuddy/skills/acquisition-coordinator`

---

## 回退方案

### 通用回退策略

```
1. 记录失败原因
2. 尝试其他关键词/渠道
3. 切换到备选工具
4. 所有方法失败 → 标记状态，建议人工处理
```

### 故障切换映射

```javascript
const FALLBACK_MAP = {
  'linkedin': ['exa-search'],
  'teyi': ['exa-search'],
  'email-sender': ['delivery-queue'],
  'ai-social-media-content': ['facebook-acquisition']
};
```

---

_版本：v3.1.0 | 同步至 HOLO-AGENT v2.3.0 | 更新时间：2026-04-03_
