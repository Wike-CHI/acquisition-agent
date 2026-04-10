# Knowledge Base Skill - 红龙知识库管理

> 企业背调档案管理，自动去重，全员复用

## 核心定位

**知识库 = 团队共享的情报中心**

- 业务员A背调过的公司 → 自动保存
- 业务员B再查同一家公司 → 秒级返回，无需重复搜索
- 知识库越丰富，搜索越来越少

---

## 一、知识库目录结构

```
\\192.168.0.194\home\knowledge\
├── companies/              # 企业背调档案
│   ├── ABC-Corp.md         # 背调报告
│   ├── XYZ-Ltd.md
│   └── ...
├── contacts/               # 联系人档案
│   └── ABC-Corp/
│       └── John-Smith.md
├── market-research/        # 市场调研
│   └── Africa/
│       └── Ethiopia.md
└── emails/                # 已发送的开发信
    └── 2026-04/
        └── ABC-Corp-20260410.md
```

---

## 二、知识库文件命名规则

| 类型 | 命名格式 | 示例 |
|------|---------|------|
| 企业档案 | `{公司名-slug}.md` | `national-cement-ethiopia.md` |
| 联系人 | `{公司-slug}/{姓名-slug}.md` | `national-cement-ethiopia/john-smith.md` |
| 市场报告 | `{区域}/{国家}.md` | `africa/ethiopia.md` |
| 开发信 | `{公司-slug}/{公司}-{日期}.md` | `abc-corp/20260410.md` |

---

## 三、工作流程

### 3.1 读取知识库（查重）

```
输入：公司名
       ↓
生成slug：公司名 → national-cement-ethiopia
       ↓
检查路径：\\192.168.0.194\home\knowledge\companies\{slug}.md
       ↓
   存在？
   ├── 是 → 读取档案 + 更新 metadata + 返回
   └── 否 → 返回空（需要背调）
```

### 3.2 写入知识库（保存）

```
背调完成 → 格式化报告 → 保存到知识库
       ↓
路径：\\192.168.0.194\home\knowledge\companies\{slug}.md
       ↓
内容：标准背调报告格式
       ↓
更新meta：last_researcher, last_research_time, research_count
```

### 3.3 更新知识库（追加）

```
收到新信息 → 检查档案是否存在
       ↓
存在？
├── 是 → 追加到对应section
└── 否 → 提示：需要先背调
```

---

## 四、知识库档案格式

### 4.1 企业背调档案模板

```markdown
---
title: {公司名}
status: researched  # researched / contacted / qualified / closed
icp_score: 85
icp_grade: A       # A / B / C / D
last_researcher: Administrator@192.168.0.170
last_research_time: 2026-04-10 17:05:00
research_count: 1
created_time: 2026-04-10 17:05:00
---

# {公司名}

**状态**: ✅ 已调查  
**ICP评分**: {分数}/100 ({等级}级)  
**最后调查**: {时间} by {调查人}  
**调查次数**: {次数}

---

## 企业概况

| 项目 | 信息 |
|------|------|
| 名称 | {公司名} |
| 总部 | {地址} |
| 行业 | {行业} |
| 规模 | {规模} |
| 年营收 | {营收} |
| 网站 | {网站} |

## 产品需求

| 产品 | 需求程度 | 备注 |
|------|---------|------|
| 风冷接头机 | 高 | 适用规格 600-1800 |
| 水冷接头机 | 中 | 大规格需求 |

## 关键决策者

| 姓名 | 职位 | 邮箱 | 来源 |
|------|------|------|------|
| John Smith | Procurement Manager | john@xxx.com | LinkedIn |

## 开发历史

| 日期 | 动作 | 结果 | 负责人 |
|------|------|------|--------|
| 2026-04-10 | 背调 | 完成 | Admin |
| 2026-04-10 | 开发信 | 已发送 | Admin |

## 备注

```

---

## 五、脚本说明

### 5.1 读取知识库

```powershell
# 检查企业档案是否存在
.\\read-knowledge.ps1 -Type company -Name "National Cement Ethiopia"

# 返回：
# - exists: true/false
# - content: 档案内容（如果存在）
# - metadata: 基本信息
```

### 5.2 写入知识库

```powershell
# 保存背调报告
.\\write-knowledge.ps1 -Type company -Name "National Cement Ethiopia" -Content $report

# 保存联系人
.\\write-knowledge.ps1 -Type contact -Company "National Cement Ethiopia" -Name "John Smith" -Content $contactInfo
```

### 5.3 搜索知识库

```powershell
# 搜索包含关键词的档案
.\\search-knowledge.ps1 -Query "cement ethiopia"

# 列出所有企业档案
.\\list-knowledge.ps1 -Type companies
```

---

## 六、集成到其他技能

### 6.1 company-research 钩子

```
company-research 流程修改：

1. 接收公司名
2. 调用 read-knowledge 检查是否存在
3. 如果存在 → 返回"已有档案" + 显示摘要
4. 如果不存在 → 执行背调 → 调用 write-knowledge 保存
```

### 6.2 cold-email-generator 钩子

```
cold-email-generator 流程修改：

1. 接收公司名
2. 调用 read-knowledge 获取公司背景
3. 生成个性化开发信
4. 保存发送记录到 knowledge/emails/
```

---

## 七、NAS 连接信息（Agent专用）

> ⚠️ **安装须知**：Agent统一使用此账号，不依赖业务员个人NAS账号

| 项目 | 值 |
|------|-----|
| IP | `192.168.0.194` |
| Agent账号 | `HOLO-AGENT` |
| Agent密码 | `Hl88889999` |
| 共享路径 | `\\192.168.0.194\home` |
| 知识库目录 | `\\192.168.0.194\home\knowledge` |
| 目录结构 | companies/contacts/market-research/emails |

### 群晖配置要求

1. 在群晖管理界面创建用户 `HOLO-AGENT`，密码 `Hl88889999`
2. 给该用户分配 `home` 目录的读写权限
3. 知识库目录会自动创建：`home/knowledge/companies/`

---

## 八、触发词

- 知识库
- 查一下公司档案
- 这家公司调查过吗
- 企业档案
- knowledge base
- company profile
- 已有的客户资料
- 团队共享情报

---

## 九、维护

### 9.1 定期清理

| 任务 | 频率 | 说明 |
|------|------|------|
| 去重检查 | 每月 | 合并相似档案 |
| 归档旧档 | 每季度 | 归档超过1年无更新的档案 |
| 备份 | 每周 | 备份到本地 |

### 9.2 权限控制

| 角色 | 权限 |
|------|------|
| 业务员 | 读写自己的调查结果 |
| 管理员 | 管理所有档案 |

---

## 版本

- v1.1.0 (2026-04-10): 更新NAS账号为HOLO-AGENT（Agent专用）
- v1.0.0 (2026-04-10): 初始版本
