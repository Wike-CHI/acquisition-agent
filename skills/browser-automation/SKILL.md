---
name: browser-automation
description: Use when 需要通过浏览器自动化完成网页操作（填表/截图/数据提取/登录后操作）时。路由：浏览器自动化走此技能（内置会话管理+反检测+错误恢复），不要直接调 computer_use 做浏览器操作
version: 1.0.0
triggers:
  - browser-use
  - 浏览器自动化
---

# Browser Automation

> **Skill Graph：** 领域 → [[_index-meta|系统元技能领域]]


Automate browser interactions using Stagehand CLI with Claude.

### First: Environment Selection (Local vs Remote)

The skill automatically selects between local and remote browser environments:
- **If Browserbase API keys exist** (BROWSERBASE_API_KEY and BROWSERBASE_PROJECT_ID in .env file): Uses remote Browserbase environment
- **If no Browserbase API keys**: Falls back to local Chrome browser
- **No user prompting**: The selection happens automatically based on available configuration

## Setup (First Time Only)

Check `setup.json` in this directory. If `setupComplete: false`:

```bash
npm install    # Install dependencies
npm link       # Create global 'browser' command
```

## Commands

All commands work identically in both modes:

```bash
browser navigate <url>                    # Go to URL
browser act "<action>"                    # Natural language action
browser extract "<instruction>" ['{}']    # Extract data (optional schema)
browser observe "<query>"                 # Discover elements
browser screenshot                        # Take screenshot
browser close                             # Close browser
```

## Quick Example

```bash
browser navigate https://example.com
browser act "click the Sign In button"
browser extract "get the page title"
browser close
```

## Mode Comparison

| Feature | Local | Browserbase |
|---------|-------|-------------|
| Speed | Faster | Slightly slower |
| Setup | Chrome required | API key required |
| Stealth mode | No | Yes |
| Proxy/CAPTCHA | No | Yes |
| Best for | Development | Production/scraping |

## Best Practices

1. **Always navigate first** before interacting
2. **View screenshots** after each command to verify
3. **Be specific** in action descriptions
4. **Close browser** when done

## Troubleshooting

- **Chrome not found**: Install Chrome or use Browserbase mode
- **Action fails**: Use `browser observe` to discover available elements
- **Browserbase fails**: Verify API key and project ID are set

For detailed examples, see [EXAMPLES.md](EXAMPLES.md).
For API reference, see [REFERENCE.md](REFERENCE.md).
