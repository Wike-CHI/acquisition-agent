# Changelog

All notable changes to the HOLO Acquisition Agent system.

## [v2.6.0] - 2026-04-14

### 🎯 重大升级：新增4大P0技能

#### `holo-proposal-generator` (NEW)
数字提案包生成器 v1.0.0 — 一键生成专业PDF提案，7页结构：
封面 → 客户背景 → 方案对比(vs Beltwin vs 现状) → 推荐产品 → 成功案例 → 商务条款 → CTA
支持中英葡西4语种，reportlab纯Python实现。

#### `holo-sales-trainer` (NEW)
AI销售训练场 v1.0.0 — 系统扮演海外采购商，新业务员练手。
覆盖：初次电话/讨价还价/技术拒绝/竞品对比，实时评分+话术报告。

#### `inquiry-response` (ROUTING FIXED)
询盘应答技能 v1.1.0 — 路由修复正式激活。
内容：15场景×6语种异议处理 + 9国文化谈判策略 + Beltwin底牌话术 + 成交收尾。

#### `follow-up-signal-monitor` (NEW)
跟进信号监控系统 v1.0.0 — 自动感知客户动静。
5级沉默检测（正常→关注→警戒→深度→弱信号），
价值型跟进草稿生成（A1市场情报/A2案例匹配/A3付款优化/B1技术澄清/B2到期提醒/B3软着陆/C1弱信号降频）。

---

### 🔧 路由修复

- `global-customer-acquisition` — 接入 `full_pipeline` 路由（优先级6）
- `market-development-report` — 接入 `market_development.overseas` 路由（优先级6）
- `inquiry_response` — 注册到 `routing.all_markets`（优先级6），skills_index同步注册
- `full_pipeline` — 接入 `global-customer-acquisition`
- `sales_response` — 旧路由引用已清理

---

### 📦 技能系统

- 新增 `skill-auditor` — 系统审查技能，定期健康检查
- 新增 `bash-patch-safe` — Bash脚本patch安全指南
- 新增 `acquisition-development-notes` — 开发笔记，踩坑记录
- `holo-updater` v1.1 — 新增 rsync fallback，跨平台GitHub拉取
- `acquisition-dependencies` v2.0 — Linux/macOS/WSL2/Windows全平台自动安装
- `acquisition-init` v2.0 — 一键依赖安装
- `release-manager` v3.2.0 — 新增 pull-from-github.ps1 双向同步

---

### 🏢 业务知识更新

- Beltwin 重新定标：**十年合作伙伴（经销商）**，非直接竞品
  - 话术调整：「源头厂家供货」vs「贸易商中间差价」
  - 底牌：配件库存有限/售后响应慢/质保仅6个月 vs HOLO 12个月
- 客户分类重构：明确排除矿业/港口/电力/水泥终端用户
- Beltwin已覆盖的终端客户列为争夺对象

---

### 📚 知识库

- `holo-products` v3.1 — 双层读取架构（references优先 + NAS兜底）
- `market-research` v1.2 — 六维度市场分析框架
- `knowledge-base` v1.2 — 知识库门卫规则 + 中文slug修复
- 新增产品应用知识：输送带/硫化/选型指南/客户痛点

---

### 🐛 Bug修复

- NAS路径引用修正（Y盘产品图册/市场营销/竞品分析 → 真实路径）
- 邮件编码乱码修复（UTF-8 BOM处理）
- WhatsApp批量发送LOCK残留问题
- skill-cli P1+P2一致性问题（13个技能）
- ICP评分动态检测修复

---

### 📊 系统状态（v2.6.0）

| 指标 | 数值 |
|------|------|
| 活跃技能 | 71个 |
| 路由意图 | 15个 |
| skills_index注册 | 43个 |
| 自研holo-*技能 | 4个（全部在线） |
| 累计commit | v2.5.3后+78个 |

---

## [v2.5.3] - 2026-04-10
Previous stable release
