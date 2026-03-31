# 版本号规则详解

## 语义化版本（SemVer）

版本号格式：`MAJOR.MINOR.PATCH`

```
MAJOR.MINOR.PATCH
 │     │     └── Bug修复/微调（向后兼容）
 │     └─────── 新增功能（向后兼容）
 └────────────── 重大变更（不兼容）
```

## 变更检测逻辑

```
1. 扫描 skills/ 目录，获取每个 SKILL.md 的 MD5 哈希
2. 对比 .release/state.json 中的历史哈希
3. 分类变更：
   - 新增：目录存在但 state.json 中无记录
   - 修改：MD5 哈希发生变化
   - 删除：state.json 中有记录但目录不存在
```

## 自动升级规则

| 变更类型 | 版本升级 | 示例 | 说明 |
|----------|----------|------|------|
| 删除技能 | MAJOR+1 | 1.0.0 → **2**.0.0 | 不兼容变更 |
| 新增技能 | MINOR+1 | 1.0.0 → 1.**1**.0 | 新增功能 |
| 修改技能 | PATCH+1 | 1.0.0 → 1.0.**1** | Bug修复/改进 |
| 多个变更 | 取最高 | 新增+修改 → MINOR | 优先保护用户 |

## state.json 格式

```json
{
  "version": "1.0.0",
  "releaseDate": "2026-03-25",
  "skills": {
    "linkedin": {
      "hash": "abc123...",
      "lastModified": "2026-03-24T10:00:00Z"
    },
    "facebook-acquisition": {
      "hash": "def456...",
      "lastModified": "2026-03-25T14:00:00Z"
    }
  },
  "totalSkills": 80,
  "zipFile": "honglong-acquisition-agent-v1.0.0.zip",
  "zipSize": "174 MB",
  "structure": "workspace-root"
}
```

## CHANGELOG 格式

```markdown
# 更新日志

## [1.1.0] - 2026-03-26

**打包结构**: B2B SDR Template（清爽结构）

### 新增
- tiktok-acquisition - TikTok获客技能
- customer-scoring - 客户评分技能

### 修改
- facebook-acquisition - 优化搜索算法
- email-sender - 添加Gmail支持

### 修复
- linkedin - 修复登录问题

---

## [1.0.0] - 2026-03-25

### 新增
- 首次发布
- 80个获客相关技能
```

## 手动指定版本

使用 `-Version` 参数可覆盖自动版本计算：

```powershell
.\release.ps1 -Version 2.0.0
```

适合版本号需要与外部发布节奏对齐的情况。

---

_Version: 2.1.0_
