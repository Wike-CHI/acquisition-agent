# 外部技能索引 (External Skills Index)

> 红龙获客系统 v2.3.0 - 外部技能完整索引
> 更新时间：2026-04-02 11:35
> 技能总数：21个
> 文件总数：250+

---

## 📋 技能分类索引

### 📄 Office文档生成技能 (3个)

| 技能名 | 目录 | 功能描述 | 触发场景 | 关键文件 |
|--------|------|----------|----------|----------|
| **docx** | `docx/` | Word文档生成、评论、修订 | 生成报价单、合同、开发信模板 | SKILL.md, scripts/ |
| **pptx** | `pptx/` | PowerPoint演示文稿生成 | 产品演示、公司介绍PPT | SKILL.md, editing.md |
| **xlsx** | `xlsx/` | Excel电子表格生成 | 客户列表、价格表、数据报表 | SKILL.md |

### 🔍 搜索技能 (3个)

| 技能名 | 目录 | 功能描述 | 触发场景 | 关键文件 |
|--------|------|----------|----------|----------|
| **tavily-search** | `tavily-search/` | AI驱动的智能搜索 | 深度调研、市场分析、企业背调 | SKILL.md |
| **brave-web-search** | `brave-web-search/` | Brave搜索引擎集成 | 网页搜索、实时信息获取 | SKILL.md |
| **find-skills** | `find-skills/` | 技能查找工具 | 查找系统中可用的技能 | SKILL.md |

### 📧 邮件技能 (1个)

| 技能名 | 目录 | 功能描述 | 触发场景 | 关键文件 |
|--------|------|----------|----------|----------|
| **email-skill** | `email-skill/` | 邮件发送、SMTP集成 | 发送开发信、跟进邮件 | SKILL.md |

### 📄 PDF处理技能 (2个)

| 技能名 | 目录 | 功能描述 | 触发场景 | 关键文件 |
|--------|------|----------|----------|----------|
| **pdf** | `pdf/` | PDF生成、处理、表单 | 生成产品PDF、处理PDF表单 | SKILL.md, forms.md, reference.md |
| **pdf-skill** | `pdf-skill/` | PDF基础技能 | 简单PDF操作 | SKILL.md |

### 💡 笔记与记忆技能 (2个)

| 技能名 | 目录 | 功能描述 | 触发场景 | 关键文件 |
|--------|------|----------|----------|----------|
| **memos-memory-guide** | `memos-memory-guide/` | Memos笔记系统 | 长期记忆存储、知识管理 | SKILL.md, _meta.json |
| **notion-skill** | `notion-skill/` | Notion集成 | Notion数据库操作、文档管理 | SKILL.md |

### 🔧 开发工具技能 (3个)

| 技能名 | 目录 | 功能描述 | 触发场景 | 关键文件 |
|--------|------|----------|----------|----------|
| **github-skill** | `github-skill/` | GitHub集成 | 代码管理、Issue跟踪 | SKILL.md |
| **ssh-skill** | `ssh-skill/` | SSH连接管理 | 远程服务器操作 | SKILL.md |
| **local** | `local/` | 本地技能 | 本地工具、自定义功能 | turix-win/SKILL.md |

### 📅 日程与规划技能 (2个)

| 技能名 | 目录 | 功能描述 | 触发场景 | 关键文件 |
|--------|------|----------|----------|----------|
| **calendar-skill** | `calendar-skill/` | 日历集成 | 日程管理、任务提醒 | SKILL.md |
| **planning-with-files** | `planning-with-files/` | 文件规划工具 | 任务规划、进度追踪 | SKILL.md, templates/ |

### 🤖 AI与Agent技能 (2个)

| 技能名 | 目录 | 功能描述 | 触发场景 | 关键文件 |
|--------|------|----------|----------|----------|
| **agent-reach** | `agent-reach/` | Agent触达能力 | 多Agent协作、任务分发 | SKILL.md |
| **self-improving-agent** | `self-improving-agent/` | 自改进Agent | 自我学习、优化、进化 | SKILL.md, .learnings/ |

### 🛠️ 工具技能 (2个)

| 技能名 | 目录 | 功能描述 | 触发场景 | 关键文件 |
|--------|------|----------|----------|----------|
| **find-skills-0.1.0** | `find-skills-0.1.0/` | 技能查找（旧版） | 备用技能查找工具 | SKILL.md, _meta.json |
| **backup-skill** | `backup-skill/` | 备份技能 | 数据备份、恢复 | SKILL.md |

---

## 🚀 快速路由表

### 按功能快速查找

**用户说 "生成报价单"** → 调用 `docx/` 技能
**用户说 "发开发信"** → 调用 `email-skill/` 技能
**用户说 "背调这家公司"** → 调用 `tavily-search/` + `brave-web-search/`
**用户说 "生成产品PDF"** → 调用 `pdf/` 技能
**用户说 "做客户统计表"** → 调用 `xlsx/` 技能
**用户说 "制作产品演示"** → 调用 `pptx/` 技能
**用户说 "保存到Memos"** → 调用 `memos-memory-guide/` 技能
**用户说 "记录到Notion"** → 调用 `notion-skill/` 技能
**用户说 "查看日程"** → 调用 `calendar-skill/` 技能
**用户说 "规划任务"** → 调用 `planning-with-files/` 技能

---

## 🔧 技能调用方式

### 方式1：直接路径调用

```markdown
<!-- 调用docx技能生成Word文档 -->
使用外部技能：[external-skills/docx/SKILL.md](external-skills/docx/SKILL.md)
```

### 方式2：相对路径调用

```markdown
<!-- 从主技能SKILL.md调用 -->
参考外部文档生成指南：[docx技能](../external-skills/docx/SKILL.md)
```

### 方式3：SKILL.md内嵌引用

```yaml
# 在主技能SKILL.md中
external_skills:
  docx_generation:
    path: "external-skills/docx/SKILL.md"
    trigger: "生成Word文档"
    priority: 5

  email_sending:
    path: "external-skills/email-skill/SKILL.md"
    trigger: "发送邮件"
    priority: 5
```

---

## 📊 技能优先级

| 优先级 | 技能 | 使用频率 |
|--------|------|----------|
| ⭐⭐⭐⭐⭐ | docx, email-skill, tavily-search | 每日使用 |
| ⭐⭐⭐⭐ | pdf, xlsx, pptx, memos-memory-guide | 每周使用 |
| ⭐⭐⭐ | brave-web-search, notion-skill, calendar-skill | 按需使用 |
| ⭐⭐ | agent-reach, self-improving-agent | 高级功能 |
| ⭐ | find-skills, backup-skill, ssh-skill | 工具类 |

---

## 🔗 相关文档

- **主技能路由**: `../SKILLS-ROUTER.md`
- **工具索引**: `../TOOLS.md`
- **系统架构**: `../SYSTEM-ARCHITECTURE.md`
- **执行控制**: `../EXECUTION-CONTROL.md`

---

## ⚠️ 注意事项

1. **技能依赖**: 某些技能需要配置API密钥或服务（如email-skill需要SMTP配置）
2. **版本兼容**: 技能之间可能存在版本依赖，注意SKILL.md中的版本要求
3. **性能优化**: 优先使用高优先级技能，避免频繁切换
4. **错误处理**: 如果外部技能不可用，主技能应提供降级方案

---

*索引更新时间: 2026-04-02*
*技能总数: 20个*
*文件总数: 247个*
*总大小: 4.0MB*

### 💾 NAS与存储技能 (1个)

| 技能名 | 目录 | 功能描述 | 触发场景 | 关键文件 |
|--------|------|----------|----------|----------|
| **nas-file-reader** | `nas-file-reader/` | NAS共享盘访问、文件读取、PDF OCR | 读取产品资料、查看企业画册、挂载NAS盘 | SKILL.md, scripts/mount-nas.ps1 |

**NAS配置信息**:
- 主NAS地址: 192.168.0.194
- 用户: HOLO / 密码: Hl88889999
- 共享目录: 市场营销
- 映射盘符: Y:
- 产品资料: Y:\1.HOLO机器目录\
- 宣传资料: Y:\7.企业介绍宣传视频\
