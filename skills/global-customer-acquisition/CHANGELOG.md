# 红龙获客系统更新日志

> 版本历史记录，追踪所有更新和优化。

---

## [v2.5.0] - 2026-04-06

### 新增
- **WhatsApp 触达渠道** — 基于实战验证（沙特客户 8/8 批量发送成功）
  - `whatsapp-outreach` 技能升级至 v2.0.0：JID 格式优化、批量发送流程、号码搜索脚本
  - `search_whatsapp.py` — DuckDuckGo 搜索客户 WhatsApp 号码
  - `whatsapp_bulk_send.py` — 批量发送，含行业模板、安全间隔、自动确认(--yes)
  - wacli 命令参考：JID 格式 `号码@s.whatsapp.net` 避免超时
  - sync/send 互斥机制说明

### 更新
- **触达层多渠道支持**（acquisition-workflow Phase 4）
  - 新增渠道选择逻辑：双通道 / 纯邮件 / 纯WhatsApp / 搜索后触达
  - Drip Campaign 加入 WhatsApp 跟进节点
- **honglong-assistant** 触达技能列表加入 whatsapp-outreach
- **SKILLS-ROUTER.md** v2.1.0 — 触达层加入 WhatsApp 渠道

### 变更文件
| 文件 | 变更 |
|------|------|
| `skills/whatsapp-outreach/SKILL.md` | v2.0.0 — 批量流程 + JID技巧 + 实战数据 |
| `skills/acquisition-workflow/SKILL.md` | Phase 4 多渠道 + 渠道选择逻辑 |
| `skills/honglong-assistant/SKILL.md` | 触达层 + WhatsApp + Drip Campaign |
| `SKILLS-ROUTER.md` | v2.1.0 触达层说明 |

### 实战数据
- 沙特客户 Pipeline: 30家 → 搜索到 8 家号码 → 8/8 发送成功
- 每条间隔 30-60 秒随机延迟
- 消息按行业个性化（物流/水泥/食品/木工）

---

## [v2.3.0] - 2026-04-02

### 重构
- SKILL.md 精简：680行 → 269行（减少 60%）
- 创建 5 个详细文档（ICP/SCORING/IRON-RULES/CONTACT-VERIFICATION/EMAIL-SCORING）
- 使用 `skill://` 协议（跨平台兼容）
- 添加 triggers 字段（8个触发词）

### 新增
- 联系方式验证加强（多源验证 + 时效性检查）
- 开发信质量提升 v2.0（润色 + 评分 ≥ 9.0分）
- 系统更名：global-customer-acquisition → HOLO-AGENT

### 修复
- AI 识别速度优化
- AI 理解速度优化
- 维护简洁性提升

---

## [v2.2.1] - 2026-04-01

### 新增
- 客户群体ICP定义（基于15,885家客户数据验证）
  - 目标客户群体：输送带分销商、皮带加工厂、工程公司
  - 避免矿业客户策略验证（0家矿业客户）
  - 推荐获客关键词（不含矿业）
  - 主要产品类型统计

### 优化
- 防卡顿机制整合到 `references/TROUBLESHOOT.md`
  - 新增"防卡顿机制（v2.2.0）"章节
  - 8大防卡顿机制详解
  - 流程卡顿风险分析（P0/P1/P2）
  - 防卡顿效果对比表
  - 已纠正的错误模式（7个）
  - 业务员防卡顿检查清单

### 文档
- 更新 `SKILL.md`：
  - 版本号：v2.2.0 → v2.2.1
  - 新增"目标客户群体ICP（v2.2.1 新增）"章节
  - 完善系统描述
- 创建 `CHANGELOG.md`：完整版本更新记录

### 学习来源
- 红龙客户信息.xlsx（15,885家客户数据）
- 红龙获客系统-防卡顿优化方案.md
- 红龙客户群体分析报告.md

### 自进化验证
- ✅ 执行获客流程：分析15,885家客户 + 整合防卡顿机制
- ✅ 收集反馈：内部自省发现优化点
- ✅ 分析反馈：评分：评分⭐⭐⭐⭐⭐ + 建议
- ✅ 自我优化：更新 SKILL.md + TROUBLESHOOT.md + MEMORY.md
- ⏳ 上传GitHub：待用户确认
- ⏳ 记录进化日志：已创建 CHANGELOG.md

---

## [v2.2.0] - 2026-04-01

### 新增
- 开发信生成功能重构为 v2.0
  - 强制调用 `humanize-ai-text` 技能
  - 评分标准提升至≥9.0分（满分10分）
  - 标准打磨流程：初稿 → 第1轮润色 → 第1轮评分 → <9.0分则第2轮润色+评分
  - 6维度评分标准（个性化、相关性、简洁性、语法、去AI味、CTA有效性）

### 优化
- 更新 `TROUBLESHOOT.md`：开发信生成相关错误处理
- 更新 `PIPELINE.md`：Step 6 开发信生成流程（v2.0打磨流程）

### 纠正
- 7个错误模式已纠正并记录到 `TROUBLESHOOT.md`：
  1. LinkedIn决策人归因错误 → 使用 Exa
  2. 开发信评分虚高跳过润色 → 强制润色+评分≥9.0分
  3. 无邮箱但继续流程 → 铁律强制停止
  4. 上下文溢出后忘记任务目标 → ContextManager压缩+锚定
  5. 开发信CTA太通用 → 具体可行CTA+案例
  6. 差异化优势不量化 → 量化技术参数
  7. 开发信只有优点，没有痛点共情 → 痛点+解决方案结构

---

## [v2.1.0] - 2026-03-31

### 新增
- 4层抗遗忘系统（L1/L2/L3/L4）
  - L1: MemOS 结构化内存
  - L2: 主动摘要压缩
  - L3: ChromaDB 向量存储
  - L4: CRM 每日快照

### 优化
- 重构系统架构：7层上下文系统
- 补录 22 个生产文件（MD格式）
- 更新 PACKAGE-GUIDE.md：17个依赖技能安装清单
- HEARTBEAT.md/TOOLS.md 移至根目录

### 纠正
- 全面审计并清理：22个生产文件0个真实邮箱/手机号
- 修复 exa → exa-search
- 删除 tianyancha/jina-reader

---

## [v2.0.0] - 2026-03-30

### 新增
- 完整的获客+运营技能集群
- 11步端到端获客流程
- Skills Router（技能路由器）
- ECL 执行控制层

### 重构
- 基于官方5种Skill设计模式重构
- 竞品分析功能
- LinkedIn决策人搜索

---

## 版本说明

### 版本号规则

- **主版本号（X）**：重大架构更新或不兼容变更
- **次版本号（Y）**：新增功能或重要优化
- **修订号（Z）**：Bug修复或小幅优化

### 更新频率

- **主版本**：1-2个月一次
- **次版本**：每周一次
- **修订版**：随时

---

## [v2.3.0] - 2026-04-01 ⭐

整合 self-improving-proactive-agent 的自我更新优化机制到红龙获客系统。

### 新增

**1. 三层记忆系统（HOT/WARM/COLD）**
- `learning-system/HOT/`：确认的持久化规则和偏好
  - `memory.md`：5大核心规则 + 2大偏好
  - `corrections.md`：7个纠正项，等待晋升
  - `index.md`：存储映射和主题索引
  - `customer-icp.md`：目标客户群体ICP（15,885家客户数据验证）⭐
  - `anti-stuck-mechanisms.md`：8大防卡顿机制详解 ⭐
- `learning-system/WARM/domains/`：领域级学习
  - `usa-market-learning.md`：美国市场获客经验（3家客户案例）⭐
  - `linkedin-search-learning.md`：LinkedIn搜索最佳实践
  - `email-quality-learning.md`：开发信质量标准（≥9.0分）
- `learning-system/WARM/projects/`：项目级学习
  - `honglong-icp-learning.md`：红龙客户群体ICP
- `learning-system/COLD/`：冷存储
  - `archive/`：归档
  - `graveyard/`：已废弃
- `learning-system/working-buffer.md`：挥发性面包屑（会话上下文恢复）

**2. 5种学习信号分类**
| 信号类型 | 存储位置 | 晋升速度 | 优先级 |
|---------|---------|---------|--------|
| **显式纠正** | HOT/memory.md | 立即HOT | P0 |
| **明确偏好** | HOT/memory.md | 重复2次→HOT | P1 |
| **成功工作流** | WARM/projects/ | 重复3次→HOT | P2 |
| **自我反思** | WARM/domains/ | 重复3次→HOT | P2 |
| **用户反馈** | WARM/projects/ | 根据评分决定 | P1 |

**3. 自动晋升/降级机制**
- **晋升**：重复3次在7天内 → 晋升到HOT
- **降级**：未使用30天 → 降级到WARM，未使用90天 → 归档到COLD

**4. proactivity系统（主动系统）**
- `proactivity/memory.md`：激活规则和边界保护
- `proactivity/session-state.md`：当前目标、决策、阻塞、下一步
- `proactivity/heartbeat.md`：心跳维护规则（每日/每周检查）
- `proactivity/patterns.md`：5个可重用成功模式
- `proactivity/log.md`：近期主动行动记录

### 优化

**1. 自进化循环更新**
- 旧版（v2.2.0）：6步循环
- 新版（v2.3.0）：7步循环
  - ✨ 新增：Step 2 学习信号收集
  - ✨ 新增：Step 3 晋升/降级分析
  - ✨ 新增：Step 7 心跳维护

**2. 学习系统与防卡顿机制整合**
- 将自我学习内容整合到三层记忆系统
- 将防卡顿机制整合到 HOT/anti-stuck-mechanisms.md ⭐
- 将客户群体ICP整合到 HOT/customer-icp.md ⭐
- 将美国市场经验整合到 WARM/domains/usa-market-learning.md ⭐

**3. 系统文档更新**
- `SKILL.md`：版本号 v2.2.1 → v2.3.0，新增学习系统章节
- `CHANGELOG.md`：新增v2.3.0更新日志
- `SELF-EVOLUTION-SYSTEM.md`：更新自进化循环（6步 → 7步）

### 学习来源

**1. self-improving-proactive-agent 技能**
- 三层记忆系统（HOT/WARM/COLD）
- 5种学习信号分类
- 自动晋升/降级机制
- proactivity系统

**2. 红龙获客系统-自我学习与优化报告**
- 客户群体分析（15,885家客户数据）
- 防卡顿机制整合
- 美国市场获客经验

### 整合效果

| 项目 | 整合前 | 整合后 | 改善 |
|------|--------|--------|------|
| **学习系统** | ❌ 无系统化学习 | **✅ 三层记忆系统** | ⭐⭐⭐⭐⭐ |
| **学习信号** | ❌ 只有用户反馈 | **✅ 5种学习信号** | ⭐⭐⭐⭐⭐ |
| **晋升/降级** | ❌ 无自动机制 | **✅ 自动晋升/降级** | ⭐⭐⭐⭐⭐ |
| **上下文恢复** | ⭐⭐ 手动查找 | **✅ 自动恢复** | ⭐⭐⭐⭐ |
| **心跳维护** | ❌ 无 | **✅ 定期检查** | ⭐⭐⭐⭐⭐ |
| **主动系统** | ❌ 无 | **✅ 5个模式** | ⭐⭐⭐⭐⭐ |

---

_最后更新：2026-04-01_
_当前版本：v2.3.0_
