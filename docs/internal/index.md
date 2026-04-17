# 内部文档 — 红龙获客系统开发者手册

> 仅供 Wike 和开发伙伴阅读

## 目录

- [开发者指南](developer-guide.md) — 环境搭建、调试、技能开发规范
- [故障排查](troubleshooting.md) — 常见问题与解决方案

## 系统架构

```
skills/          82个技能（业务逻辑）
  holo-*         红龙定制技能
  acquisition-*  获客编排技能
  cold-email-*   开发信技能
  smart-quote    智能报价
  ...
archive/         33个归档技能（旧版/废弃）
deploy/          部署脚本（本地环境）
workspace/       运营文件（7层上下文）
  AGENTS.md      10阶段Pipeline
  HEARTBEAT.md   自动巡检
  ...
```

## 关键约束

- 凭证必须通过环境变量注入，禁止硬编码
- Beltwin 是合作10年经销商，不是竞品
- 矿业客户禁止直接接触
- 所有对外消息必须通过 /tmp/sender.mjs 发送
