# 故障排查指南

## 邮件发送失败

- 症状：nodemailer 报 535 Authentication Failed
- 原因：163邮箱授权码过期
- 解决：用户登录163邮箱网页版 → 设置 → POP3/SMTP/IMAP → 重新生成授权码 → 更新环境变量 HOLO_SMTP_PASS
- 测试：HOLO_SMTP_PASS=新授权码 node /tmp/sender.mjs --dry-run

## 技能路由失效

- 症状：请求技能但系统找不到
- 检查1：skills_index里有这条吗？cat workspace/ROUTING-TABLE.yaml | grep skill名
- 检查2：技能目录有SKILL.md吗？
- 检查3：frontmatter YAML格式正确吗？
- 解决：skill_manage create 或 patch 更新

## Cron任务不运行

- 检查：cronjob list 查看任务状态
- HEARTBEAT不触发：检查 holo-heartbeat-executor 技能是否正常加载
- 邮件序列没发：检查 SMTP 凭证是否有效

## WhatsApp发送失败

- 72h窗口外：WhatsApp限制，必须客户先回复或切换Email
- wacli报错：检查 wacli send --help 确认命令格式

## 开发信评分不通过

- cold-email-generator 输出评分<9.0
- 原因：个性化程度不够/占位符未填充/文化适配不足
- 解决：用 sdr-humanizer 去AI味，确保含具体公司名和痛点
