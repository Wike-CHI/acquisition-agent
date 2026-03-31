# 技能集成配置

## 已集成的增强技能

### 客户发现
```yaml
engines:
  - multi-search-engine  # 多引擎搜索
  - playwright           # 海关数据RPA
  - browser-automation  # LinkedIn/展会自动化
```

### 企业背调
```yaml
research:
  - company-background-check  # 自研背调（海外）
  - company-research         # 中文背调
  - market-research          # 市场调研
```

### 开发信
```yaml
email:
  - cold-email-generator    # 自研生成器
  - email-outreach-ops      # 跟进节奏
  - marketing-strategy-pmm  # ICP匹配
```

### 客户触达
```yaml
outreach:
  - email-sender            # 邮件发送（自研）
  - linkedin-writer         # LinkedIn私信
  - browser-automation      # 自动化触达
```

### 客户管理
```yaml
management:
  - 6维度评分               # 自研评分系统
  - sales-pipeline-tracker  # 销售管道
  - crm                     # 客户档案
```

### 策略规划
```yaml
strategy:
  - marketing-strategy-pmm  # PMM方法论
```

## 使用示例

### 场景1：客户发现
```bash
# 用户输入
搜索：美国传送带制造商，10家

# 系统自动调用
→ multi-search-engine（多引擎搜索）
→ playwright（海关数据RPA）
→ company-background-check（背调）
→ 输出：10家潜在客户 + 背调报告
```

### 场景2：开发信生成
```bash
# 用户输入
开发信：Dorner Manufacturing，制造商，风冷机

# 系统自动调用
→ cold-email-generator（读取SMB资料）
→ email-outreach-ops（跟进计划）
→ marketing-strategy-pmm（ICP匹配）
→ 输出：个性化开发信 + 跟进节奏
```

### 场景3：客户触达
```bash
# 用户输入
触达：Dorner Manufacturing 采购经理

# 系统自动调用
→ email-sender（发送邮件）
→ linkedin-writer（LinkedIn私信）
→ browser-automation（LinkedIn连接）
→ 输出：多渠道触达确认
```

### 场景4：客户管理
```bash
# 用户输入
更新客户：Dorner Manufacturing，状态=跟进中

# 系统自动调用
→ 6维度评分（重新评分）
→ sales-pipeline-tracker（更新管道）
→ crm（记录互动）
→ 输出：更新后的客户档案
```

## 集成优先级

### P0（立即生效）
- ✅ multi-search-engine
- ✅ playwright
- ✅ company-research
- ✅ email-outreach-ops
- ✅ marketing-strategy-pmm

### P1（本周集成）
- ✅ linkedin-writer
- ✅ browser-automation
- ✅ sales-pipeline-tracker
- ✅ crm

### P2（按需集成）
- market-research（竞争分析场景）
- company-background-check（自研，已集成）

## 监控指标

| 环节 | 指标 | 目标 |
|------|------|------|
| 客户发现 | 发现效率 | 15家/小时（原10家） |
| 企业背调 | 背调时间 | 3分钟/家（原5分钟） |
| 开发信 | 生成时间 | 5分钟/封（原10分钟） |
| 客户触达 | 触达渠道 | 2渠道（原1渠道） |
| 客户管理 | 管道覆盖率 | 100%（原50%） |
| 策略规划 | ICP准确度 | 90%（原70%） |

---

*配置完成时间：2026-03-23*
