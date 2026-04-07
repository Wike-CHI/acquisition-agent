---
name: wacli
description: "Send WhatsApp messages to other people or search/sync WhatsApp history via the wacli CLI (not for normal user chats)."
description_zh: "发送 WhatsApp 消息和同步历史"
description_en: "Send WhatsApp messages & sync history"
---

# wacli

Use `wacli` only when the user explicitly asks you to message someone on WhatsApp or to sync/search WhatsApp history.

Safety
- Require explicit recipient + message text.
- Confirm recipient + message before sending.

Auth + sync
- `wacli auth` (QR login + initial sync)
- `wacli sync --follow` (continuous sync)
- `wacli doctor`

Find chats + messages
- `wacli chats list --limit 20 --query "name or number"`
- `wacli messages search "query" --limit 20 --chat <jid>`

Send
- Text: `wacli send text --to "+14155551212" --message "Hello!"`
- File: `wacli send file --to "+14155551212" --file /path/agenda.pdf --caption "Agenda"`

Notes
- Store dir: `~/.wacli` (override with `--store`).
- Use `--json` for machine-readable output.

## ⚠️ LOCK 文件残留问题

`wacli sync --follow` 被 kill 或超时后，`~/.wacli/LOCK` 文件可能残留，导致后续所有 `wacli send` 失败（报错含 "lock"）。

**手动清理方法**：
```powershell
Stop-Process -Name wacli -Force
Remove-Item ~/.wacli/LOCK -Force
```

**批量发送**：优先使用 `whatsapp-outreach/scripts/whatsapp_bulk_send.py`，该脚本已内置锁清理和重试逻辑，无需手动处理。
