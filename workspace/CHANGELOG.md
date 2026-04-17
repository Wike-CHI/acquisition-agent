# Changelog

All notable changes to the HOLO Acquisition Agent system.

## [v3.0.0] - 2026-04-17

### 🔥 重大重构：目录结构升级

参考 [iPythoning/b2b-sdr-agent-template](https://github.com/iPythoning/b2b-sdr-agent-template) 进行了完整的目录结构重构，与上游保持兼容。

#### 新目录结构

```
acquisition/
├── skills/          ← 82个技能（路由系统索引）
├── workspace/       ← 运营文件（Pipeline/HEARTBEAT/路由表）
├── archive/         ← 33个已归档技能（历史版本）
├── deploy/          ← 部署脚本和工具链
├── product-kb/      ← 产品知识库（NAS挂载后填入）
├── examples/        ← 行业场景案例
├── docs/internal/   ← 内部文档
└── local/           ← 本地平台特定工具
```

**变更：**
- 81个技能从根目录 → `skills/`
- 运营文件（AGENTS/HEARTBEAT/MEMORY/路由表）→ `workspace/`
- 部署脚本（.cli/ + scripts/）→ `deploy/`
- .archive/ → `archive/`（33个归档技能统一管理）
- 新增 `product-kb/`（产品知识库目录）
- 新增 `examples/`（南美/中东/东南亚3个区域目录）
- 新增 `docs/internal/`（内部文档目录）
- 新增 `NEW-STRUCTURE.md`（结构说明文档）

---

### 🛡️ 系统审查与修复

#### P0 安全
- 全量凭证扫描：**无真实硬编码凭证泄漏** ✅
- `/tmp/sender.mjs` 凭证已改为环境变量（`HOLO_SMTP_PASS`）注入
- `composio` 工具配置的9处均为模板占位符（非真实密钥）

#### P1 结构完整性
- 10个路由表死引用已清理（`skills_index` 中已归档技能）
- 4个技能补全 frontmatter（`graphify` / `knowledge-base` / `quotation-generator` / `telegram-toolkit`）
- 9个技能补全 `version` 字段
- 2个技能 name 不匹配已修正（`cli-anything-hub` / `market-development-report`）
- 9个技能补全 `triggers` 字段

#### P1 路由系统
- `skills_index` 从 48条 → 74条（新增36个未注册的磁盘技能）
- `SKILLS-MANIFEST.yaml` 与 `skills_index` 完全同步
- 归档技能清理：移除 `SKILLS-MANIFEST` 中的 `exa-search` / `sales-response` 遗留条目

#### P2 系统健康
- `skills_index` ↔ `SKILLS-MANIFEST` ↔ 磁盘三层对齐
- 82技能全部通过 frontmatter 验证（0错误 0警告）
- 空 `.archive/` 等遗留目录已清理

---

### 📊 技能统计

| 指标 | 数量 |
|------|------|
| 活跃技能（skills_index） | 74 |
| 磁盘技能 | 82 |
| 归档技能 | 33 |
| SKILLS-MANIFEST | 67 |

---

## [v2.6.0] - 2026-04-14

> 历史版本详见 CHANGELOG.md 归档
