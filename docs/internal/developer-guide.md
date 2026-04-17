# 开发者指南

## 环境要求

- Node.js 18+ (for /tmp/sender.mjs)
- Python 3.10+ (for skills)
- Windows WSL2 + Wike's Hermes Agent
- NAS: \\192.168.0.194 (not yet mounted)

## 技能开发规范

- 目录名 = skill名，全小写，中划线分隔
- 必须包含 SKILL.md（含YAML frontmatter + markdown正文）
- YAML frontmatter 必须字段：name, description, triggers, metadata（version/author）
- frontmatter 格式：`---` 包围，YAML解析必须通过
- 禁止在SKILL.md里硬编码凭证
- 禁止在技能描述里引用不存在的其他技能名

## 本地调试

- 调试技能：直接调用 skill_view(name)
- 查看skills_index：cat workspace/ROUTING-TABLE.yaml
- 验证YAML frontmatter：python3 -c "import yaml; yaml.safe_load(open('SKILL.md').read().split('---')[1])"
- 测试邮件发送：node --check /tmp/sender.mjs

## GitHub协作

- 本地 = 实际运行系统，GitHub = 备份
- 提交前：python3 scripts/validate_skills.py 检查所有SKILL.md
- 推送到GitHub后：用户手动 git pull 或从GitHub同步
- 敏感信息（凭证/API key）绝不进git
