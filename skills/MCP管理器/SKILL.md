---
name: MCP管理器
description: MCP服务器管理工具。通过mcporter CLI列出、配置、认证、调用MCP服务器。当用户说"配置MCP"、"MCP管理"、"管理工具"时使用。
description_zh: 管理和调用 MCP 服务器与工具
description_en: Manage and call MCP servers & tools
version: 1.0.0
triggers:
  - mcporter
  - MCP配置
  - MCP管理
---

# mcporter

> **Skill Graph：** 领域 → [[_index-meta|系统元技能领域]]


Use `mcporter` to work with MCP servers directly.

Quick start
- `mcporter list`
- `mcporter list <server> --schema`
- `mcporter call <server.tool> key=value`

Call tools
- Selector: `mcporter call linear.list_issues team=ENG limit:5`
- Function syntax: `mcporter call "linear.create_issue(title: \"Bug\")"`
- Full URL: `mcporter call https://api.example.com/mcp.fetch url:https://example.com`
- Stdio: `mcporter call --stdio "bun run ./server.ts" scrape url=https://example.com`
- JSON payload: `mcporter call <server.tool> --args '{"limit":5}'`

Auth + config
- OAuth: `mcporter auth <server | url> [--reset]`
- Config: `mcporter config list|get|add|remove|import|login|logout`

Daemon
- `mcporter daemon start|status|stop|restart`

Codegen
- CLI: `mcporter generate-cli --server <name>` or `--command <url>`
- Inspect: `mcporter inspect-cli <path> [--json]`
- TS: `mcporter emit-ts <server> --mode client|types`

Notes
- Config default: `./config/mcporter.json` (override with `--config`).
- Prefer `--output json` for machine-readable results.
