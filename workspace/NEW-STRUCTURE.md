# 红龙获客系统目录结构 v3.0

> 参考: [iPythoning/b2b-sdr-agent-template](https://github.com/iPythoning/b2b-sdr-agent-template)
> 重构日期: 2026-04-17

## 目录概览

```
~/.hermes/skills/acquisition/           ← 红龙获客系统根目录
~/.hermes/skills/acquisition/
├── skills/          # 81个技能（路由系统可命中）
├── workspace/       # 运营文件（Pipeline/HEARTBEAT/路由表）
├── archive/         # 33个已归档技能（历史版本）
├── deploy/          # 部署脚本和工具链
├── product-kb/      # 产品知识库（NAS挂载后填入）
├── examples/        # 行业场景案例
├── docs/internal/   # 内部文档
└── local/           # 本地平台特定工具
```

## 详细结构

```
~/.hermes/skills/acquisition/
  acquisition/
    .claude/
      skills
  archive/
    skills/ (33 skills)
  deploy/
    cli/
    references/
      appendix.md
    scripts/
      sync-to-github.ps1
    templates/
      correction-template.md
      pattern-template.md
      validation-template.md
  docs/
    internal/
  examples/
    middle-east/
    south-america/
    southeast-asia/
  local/
    skills/ (1 skills)
  product-kb/
    products/
  skills/
    skills/ (82 skills)
  workspace/
    .last-sync-hashes.json/
    AGENTS.md/
    HEARTBEAT.md/
    MEMORY.md/
    ROUTING-TABLE.yaml/
    SKILLS-MANIFEST.yaml/
```

## 各目录说明

| 目录 | 内容 | 说明 |
|------|------|------|
| `skills/` | 82 个技能 | 路由系统索引，skills_index 引用 |
| `workspace/` | 运营文件 | AGENTS/Pipeline/HEARTBEAT/MEMORY/路由表 |
| `archive/` | 33 个归档技能 | 已淘汰技能，保留参考 |
| `deploy/` | 部署工具链 | CLI脚本/模板/同步工具 |
| `product-kb/` | 产品知识库 | NAS挂载后填充 |
| `examples/` | 行业案例 | 南美/中东/东南亚等 |
| `docs/internal/` | 内部文档 | |
| `local/` | 本地工具 | turix-win 等平台特定 |

## 设计原则

1. **运营文件集中于 workspace/** — 便于备份和版本控制
2. **技能收于 skills/** — 可扩展，不污染根目录
3. **归档技能统一放 archive/** — 历史可追溯，不删除
4. **deploy/ 自包含** — 可独立部署或分享
5. **参考 b2b-sdr-agent-template** — 与上游保持结构兼容

## 迁移记录

- v3.0 (2026-04-17): 整体重构，参考 b2b-sdr-agent-template
  - 81技能从根目录 → skills/
  - 运营文件 → workspace/
  - .cli/ + scripts/ → deploy/
  - .archive/ → archive/
  - 新增 product-kb/、examples/、docs/internal/
