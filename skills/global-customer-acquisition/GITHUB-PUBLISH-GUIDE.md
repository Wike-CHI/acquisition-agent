# GitHub 发布脚本

> 将获客技能集群系统发布到 GitHub 私有仓库

---

## 方法1: 手动创建仓库（推荐）

### Step 1: 在 GitHub 上创建仓库

1. 打开 https://github.com/new
2. 填写信息：
   - **Repository name**: `customer-acquisition-skills`
   - **Description**: `全网获客系统 - 基于官方5种Skill设计模式`
   - **Visibility**: ✅ **Private** （重要！选择私有）
   - **Initialize**: ❌ 不要勾选 README/gitignore/license（本地已有）

3. 点击 "Create repository"

### Step 2: 推送代码

```powershell
# 进入项目目录
cd C:\Users\Administrator\.openclaw\workspace\customer-acquisition-skills

# 添加所有文件
git add .

# 提交
git commit -m "🚀 初始版本: 全网获客系统 v1.2.0

核心功能:
- ✅ 智能路由（自动选择最佳渠道）
- ✅ 反复打磨（开发信自动检查3轮）
- ✅ 回退方案（每步失败自动处理）
- ✅ 竞品分析（自动识别竞争对手）
- ✅ LinkedIn 决策人（精准定位决策人）
- ✅ 自进化系统（持续学习用户反馈）

基于官方5种Skill设计模式:
- 模式一: 按顺序一步步走 + 验证点
- 模式二: 多个工具协同
- 模式三: 反复打磨直到满意
- 模式四: 根据情况选工具
- 模式五: 嵌入专业知识"

# 连接远程仓库（替换 YOUR_USERNAME）
git remote add origin https://github.com/Wike-CHI/customer-acquisition-skills.git

# 推送
git push -u origin main
```

---

## 方法2: 使用 GitHub Token（自动化）

### Step 1: 创建 GitHub Token

1. 打开 https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 勾选权限：
   - ✅ `repo`（完整仓库访问）
4. 复制生成的 token

### Step 2: 运行自动化脚本

```powershell
# 设置 token（替换 YOUR_TOKEN）
$env:GITHUB_TOKEN = "YOUR_TOKEN"

# 进入项目目录
cd C:\Users\Administrator\.openclaw\workspace\customer-acquisition-skills

# 添加所有文件
git add .
git commit -m "🚀 初始版本: 全网获客系统 v1.2.0"

# 使用 API 创建仓库
curl -X POST -H "Authorization: token $env:GITHUB_TOKEN" `
  https://api.github.com/user/repos `
  -d '{"name":"customer-acquisition-skills","description":"全网获客系统 - 基于官方5种Skill设计模式","private":true}'

# 添加远程仓库
git remote add origin https://github.com/Wike-CHI/customer-acquisition-skills.git

# 推送
git push -u origin main
```

---

## ✅ 验证

推送成功后，访问：
- https://github.com/Wike-CHI/customer-acquisition-skills

应该能看到所有文件！

---

## 📊 仓库内容

```
customer-acquisition-skills/
├── README.md                          # 项目说明
├── QUICK-START.md                     # 快速开始
├── SKILL.md                            # 主技能文件 (79 KB)
├── CHANNEL-ROUTER.md                   # 智能路由 (10 KB)
├── EMAIL-QUALITY-CHECK.md              # 开发信检查 (9 KB)
├── FALLBACK-PLAN.md                    # 回退方案 (12 KB)
├── LINKEDIN-DECISION-MAKER-GUIDE.md    # LinkedIn 指南 (5 KB)
├── COMPETITOR-ANALYSIS-GUIDE.md        # 竞品分析 (9 KB)
├── SELF-EVOLUTION-SYSTEM.md            # 自进化系统 (16 KB)
├── SKILL-DESIGN-PATTERNS-REPORT.md     # 设计模式报告 (12 KB)
├── templates/
│   └── linkedin-decision-maker-report.md  # 决策人报告模板
└── .gitignore                          # Git 忽略文件
```

---

## 🔐 安全提示

- ✅ 仓库设置为 **Private**
- ⚠️ 不要提交敏感信息（密码、token等）
- ✅ 使用 `.gitignore` 排除敏感文件

---

_准备好了吗？开始发布吧！🚀_
