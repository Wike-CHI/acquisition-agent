# TOOLS.md - Tool Configuration & Notes

> Document tool-specific configurations, gotchas, and credentials here.

---

## Credentials Location

All credentials stored in `.credentials/` (gitignored):
- `example-api.txt` — Example API key

---

## Fumamx CRM (`fumamx` tool)

**Status:** ✅ Available when Fumamx view is open

**What it does:** Operates the Fumamx CRM browser view via CDP. Supports reading page content, navigating, clicking, filling forms, screenshots, and write operations (update customer info, add to nurture).

**Available actions:**
| Action | Type | Description |
|--------|------|-------------|
| `status` | Read | Check if Fumamx is open and current URL |
| `navigate` | Read | Go to a specific URL |
| `screenshot` | Read | Capture page screenshot (JPEG, quality 60) |
| `getPageText` | Read | Extract text content from page |
| `click` | Read | Click an element by CSS selector |
| `fill` | Read | Fill an input field by CSS selector |
| `evaluate` | Read | Run read-only JavaScript (cookie/fetch blocked) |
| `waitForSelector` | Read | Wait for an element to appear |
| `updateCustomer` | **Write** | Update customer fields (requires confirmation) |
| `addToNurture` | **Write** | Add customer to nurture flow (requires confirmation) |

**Gotchas:**
- Only works when the user has the Fumamx view open in the app
- Write operations (`updateCustomer`, `addToNurture`) require two calls: first returns a preview, user must confirm, then call again with `confirmed: true`
- Prefer `getPageText` over `screenshot` for text analysis (~5KB vs ~200KB)
- `evaluate` is sandboxed: `document.cookie`, `fetch()`, `XMLHttpRequest`, `WebSocket` are blocked
- Max 10 CDP steps per tool call — keep actions simple
- If you get "CDP bridge not available", ask the user to open Fumamx first

**Common patterns:**
```
// Check if Fumamx is ready
fumamx({ action: "status" })

// Read customer page text
fumamx({ action: "getPageText", selector: ".customer-info" })

// Update customer (two-phase)
fumamx({ action: "updateCustomer", customerId: "xxx", fields: [{ field: "公司电话", selector: "...", value: "..." }] })
// → returns preview → ask user to confirm →
fumamx({ action: "updateCustomer", customerId: "xxx", fields: [...], confirmed: true })
```

---

## Writing Preferences

[Document any preferences about writing style, voice, etc.]

---

*Add whatever helps you do your job. This is your cheat sheet.*
