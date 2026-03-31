# Skill 来源索引

记录各 skill 的原始来源，便于更新溯源。

> 最后更新：2026-03-26

## 来源说明

| 来源标识 | 说明 |
|---------|------|
| `clawhub` | 从 [clawhub.ai](https://clawhub.ai) 通过 `npx clawhub install` 安装 |
| `anthropics/skills` | 从 [github.com/anthropics/skills](https://github.com/anthropics/skills) 官方仓库 |
| `skills.sh` | 从 [skills.sh](https://skills.sh) 通过 `npx skills add` 安装 |
| `openclaw/skills` | 从 [github.com/openclaw/skills](https://github.com/openclaw/skills) |
| `local` | 团队内部提供，本地文件夹同步 |
| `official` | 官方产品团队直接提供 |
| `` | 来源不明 |

---

## 腾讯系产品（官方 / 内部提供）

| source 目录 | 名称 | 来源 | 地址/备注 |
|------------|------|------|---------|
| tencent-docs | 腾讯文档 | clawhub + official | https://clawhub.ai/kn71n4rrmmw7469qstfds7c2z181y79z/tencent-docs |
| tencent-meeting-skill | 腾讯会议 | local | 官方团队提供，本地文件夹同步 |
| ima-skills | ima笔记 | official | 官方团队提供 |
| qq-email | QQ邮箱 | | |
| cnb-skill | cnb.cool | official | https://cnb.cool |
| tapd-skill | TAPD | official | 官方团队提供 |
| lexiang-knowledge-base | 腾讯乐享 | local | 官方团队提供，本地文件夹同步 |
| tencentcloud-cos | 腾讯云COS | official | 官方团队提供 |
| cos-vectors | 腾讯云COS向量 | official | 官方团队提供 |
| tencent-ssv-techforgood | 腾讯技术公益 | official | 官方团队提供 |
| zenstudio | ZenStudio | clawhub | https://clawhub.ai/kn71cg8hs4ph4artgg92f9gash82yp15/zenstudio |
| andonq | AndonQ | local | 官方团队提供，本地文件夹同步 |
| skill-scanner | Skill安全扫描（朱雀实验室） | official | 腾讯朱雀实验室出品 |
| skills-security-check | Skill安全审计（云鼎实验室） | official | 腾讯云鼎实验室出品 |
| cloudq | CloudQ | official | 腾讯生态 |
| tencent-cloud-migration | 腾讯云迁移 | official | 腾讯生态 |
| skyline | skyline渲染引擎 | official | https://developers.weixin.qq.com/miniprogram/dev/framework/runtime/skyline/ |
| tdesign-miniprogram | TDesign微信小程序 | official | https://tdesign.tencent.com/miniprogram |
| wechat-miniprogram | 微信小程序框架 | official | https://developers.weixin.qq.com/miniprogram |

---

## clawhub 来源

> 以下 URL 均来自 `_meta.json` 中的 `ownerId` + `slug`，格式为 `https://clawhub.ai/<ownerId>/<slug>`，100% 确定。

| source 目录 | 名称 | clawhub 精确 URL | clawhub 版本 |
|------------|------|----------------|------------|
| agent-mbti | MBTI人格诊断 | https://clawhub.ai/kn7ewfx332mk3nevrwg0b59avh80jffv/agent-mbti | 0.1.1 |
| arxiv-reader | ArXiv论文精读 | https://clawhub.ai/kn7fs3xs9g6y2dpz2h267d22ax811smw/arxiv-reader | 1.0.3 |
| content-factory | 内容工厂 | https://clawhub.ai/kn78rfe4metwyxawfre84sztp17zxtgg/content-factory | 1.0.0 |
| content-repurposer | 内容分发 | https://clawhub.ai/kn7f8evtnf3cehvnk1jcgab17x80ev71/content-repurposer | 1.1.0 |
| earnings-tracker | 财报追踪 | https://clawhub.ai/kn79e7737znkq4877n6wc93wn58292v9/earnings-tracker | 1.1.0 |
| email-skill | 邮件管理 | https://clawhub.ai/kn725kyxpr1g1e3rjqtkp26v0s809930/email-skill | 0.1.0 |
| github-ai-trends | GitHub AI趋势追踪 | https://clawhub.ai/kn78cz0dbgnkap6d6x36w1g2r980xvky/github-ai-trends | 1.1.0 |
| goal-tracker | goal-tracker（目标追踪） | https://clawhub.ai/kn7cewhb5wnchncy8re254vv5x80t0a8/goal-tracker | 1.0.0 |
| habit-tracker | 习惯打卡 | https://clawhub.ai/kn7dsqp497235e9hhzdwd0q9a57zxjw6/habit-tracker | 1.0.0 |
| imap-smtp-email | IMAP/SMTP邮件 | https://clawhub.ai/kn70j4ejnwqjpykvwwvgymmdcd8055qp/imap-smtp-email | 0.0.10 |
| macro-monitor | 宏观数据监控 | https://clawhub.ai/kn7bsr0zwrkt96exdxg8xhr0ts80y9mq/macro-monitor | 1.0.2 |
| multi-search-engine | 多引擎搜索 | https://clawhub.ai/kn79j8kk7fb9w10jh83803j7f180a44m/multi-search-engine | 2.0.1 |
| news-summary | 新闻摘要 | https://clawhub.ai/kn72thdm1qe7rrz0vn4vqq3a297ymazh/news-summary | 1.0.1 |
| note-organizer | Joplin笔记管理 | https://clawhub.ai/kn71ha3d91ekxt8tgtwpvxp6gd82jrhx/note-organizer | 1.0.0 |
| tencent-docs | 腾讯文档 | https://clawhub.ai/kn71n4rrmmw7469qstfds7c2z181y79z/tencent-docs | 1.0.20（clawhub最新1.0.21）|
| arxiv-watcher | ArXiv论文追踪 | https://clawhub.ai/kn7c8ew58zsqxsn7a50925ypk97zzatv/arxiv-watcher | 1.0.0 |
| zenstudio | ZenStudio | https://clawhub.ai/kn71cg8hs4ph4artgg92f9gash82yp15/zenstudio | 1.2.6 |

### clawhub 来源但 ownerId 不明

| source 目录 | 名称 | 已知 slug | 备注 |
|------------|------|---------|------|
| citation-manager | 学术引用管理 | academic-citation-manager | openclaw/youstudyeveryday 仓库手动拷贝 |

---

## anthropics/skills 官方仓库

| source 目录 | 名称 | 备注 |
|------------|------|------|
| brand-guidelines | 品牌设计规范 | https://github.com/anthropics/skills |
| canvas-design | canvas-design（视觉设计） | https://github.com/anthropics/skills |
| mcp-builder | MCP开发指南 | https://github.com/anthropics/skills |

---

## skills.sh 来源

| source 目录 | 名称 | skills.sh 地址 | 安装数 |
|------------|------|--------------|------|
| idea-validator | 创业验证 | https://skills.sh/shipshitdev/library/idea-validator | ~148 |
| market-researcher | 市场调研 | https://skills.sh/404kidwiz/claude-supercode-skills/market-researcher | ~254 |

---

## MiniMax 官方仓库

> 来源：https://github.com/MiniMax-AI/skills
> 
> 注：所有 MiniMax skill 共用同一图标（MiniMax 官方 App icon，512×512），文件名与 source 一致。
> 已排除不收录：minimax-multimodal-toolkit（需 MINIMAX_API_KEY）、vision-analysis（需 MINIMAX_API_KEY）
> 已排除 IDE 适配类：android-native-dev、flutter-dev、frontend-dev、fullstack-dev、ios-application-dev、react-native-dev（已收录）

| source 目录 | 名称（marketplace） | 说明 |
|------------|-------------------|------|
| minimax-docx | Word 文档生成 | Word 文档生成与编辑 |
| minimax-pdf | PDF 文档生成 | 高质量 PDF 文档生成 |
| minimax-xlsx | Excel 文件处理 | Excel 文件创建与分析 |
| pptx-generator | PPT 演示文稿 | PowerPoint 演示文稿生成 |
| gif-sticker-maker | GIF 贴纸制作 | 照片转动态 GIF 贴纸 |
| android-native-dev | Android 原生开发 | Android 原生应用开发指南 |
| flutter-dev | Flutter 开发 | Flutter 跨平台开发指南 |
| ios-application-dev | iOS 应用开发 | iOS 应用开发指南 |
| react-native-dev | React Native 开发 | React Native 跨平台开发指南 |
| frontend-dev | 前端开发 | 前端开发与 AI 媒体生成 |
| fullstack-dev | 全栈开发 | 全栈应用架构与开发指南 |
| shader-dev | GLSL Shader 开发 | GLSL Shader 视觉效果开发 |

---

## 来源不明 / 待确认

| source 目录 | 名称 | 线索 |
|------------|------|------|
| agent-mail | 智能体邮箱 | |
| apple-notes | Apple备忘录 | CodeBuddy 内置 |
| apple-reminders | Apple提醒事项 | CodeBuddy 内置 |
| blogwatcher | 博客监控 | |
| browser-use | 浏览器自动化 | 基于 browser-use 库，自行封装 |
| FBS-BookWriter | FBS-BookWriter | MIT license，福帮手 AI 协同平台 |
| find-skills | find-skills | CodeBuddy 内置 |
| gifgrep | GIF搜索 | |
| github | github | CodeBuddy 内置 |
| gog | Google全家桶 | |
| healthcheck | 健康打卡 | |
| himalaya | Himalaya邮件 | 基于 himalaya CLI |
| humanizer | 去AI味 | |
| imsg | iMessage | |
| mcporter | MCP管理器 | |
| nano-banana-pro | AI绘图 | |
| nano-pdf | 轻量PDF编辑器 | |
| obsidian | obsidian | 基于 Obsidian，https://help.obsidian.md |
| openai-image-gen | 批量绘图 | |
| openai-whisper | 本地语音转文字 | 基于 openai/whisper |
| openai-whisper-api | 语音转文字API | 基于 OpenAI Whisper API |
| oracle | AI交叉审查 | |
| peekaboo | macOS界面自动化 | |
| qmd | 笔记搜索 | |
| sag | 文字转语音 | 基于 ElevenLabs |
| skill-creator | 技能创建指南 | CodeBuddy 内置 |
| skill-vetter | skill-vetter | |
| songsee | 音频可视化 | |
| summarize | 内容总结 | https://summarize.sh |
| things-mac | Things任务 | 基于 Things 3 |
| tmux | tmux | |
| trello | trello | 基于 Trello REST API |
| video-frames | 视频截帧 | |
| wacli | WhatsApp | 基于 wacli |
| weather | 天气查询 | |
| workbuddy-channel-setup | 自动安装IM渠道 | CodeBuddy 内置 |
| xiaohongshu | 小红书 | CodeBuddy 内置 |
| xurl | Twitter分析 | |
