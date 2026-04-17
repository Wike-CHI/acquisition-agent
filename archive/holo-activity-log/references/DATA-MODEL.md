# HOLO 活动日志数据模型

> 版本：1.0.0 | 更新：2026-04-10
> 用途：规范操作日志的字段定义、格式标准、存储路径

---

## 一、存储规范

### 文件路径

```
\\192.168.0.194\AI数据\activity\YYYY-MM-DD.csv
```

### 文件命名

- 格式：`YYYY-MM-DD.csv`
- 示例：`2026-04-10.csv`、`2026-04-15.csv`
- 每天一个独立文件

### 编码格式

- 字符编码：`UTF-8 with BOM`
- 分隔符：`|`（管道符，避免内容中的逗号干扰）
- 换行符：`CRLF`（Windows标准）

### 表头行

每个文件第一行是表头：

```
timestamp|device_id|ip|skill_name|action_type|customer|result|score|duration_sec|notes
```

---

## 二、字段定义

### 完整字段列表（10列）

| # | 字段名 | 类型 | 必需 | 说明 | 示例 |
|---|--------|------|------|------|------|
| 1 | timestamp | DateTime | ✅ | ISO8601格式，带毫秒 | `2026-04-10 16:30:00.123` |
| 2 | device_id | String | ✅ | 设备唯一标识 | `Administrator@192.168.0.101` |
| 3 | ip | String | ✅ | 客户端IP地址 | `192.168.0.101` |
| 4 | skill_name | String | ✅ | 触发的技能名 | `company-research` |
| 5 | action_type | Enum | ✅ | 操作类型枚举 | `research` |
| 6 | customer | String | ❌ | 目标客户名称 | `National Cement Ethiopia` |
| 7 | result | Enum | ✅ | 结果状态枚举 | `success` |
| 8 | score | Decimal | ❌ | 结果评分（0-100） | `82`、`9.3` |
| 9 | duration_sec | Int | ❌ | 执行耗时（秒） | `45` |
| 10 | notes | String | ❌ | 补充说明 | `ICP:82, 邮件评分:9.3` |

---

## 三、枚举定义

### 操作类型（action_type）

| 值 | 说明 | 使用场景 |
|----|------|----------|
| `search` | 客户搜索 | exa-search、facebook-acquisition、linkedin |
| `research` | 客户背调 | company-research、in-depth-research |
| `email_gen` | 开发信生成 | cold-email-generator |
| `email_send` | 邮件发送 | email-sender |
| `linkedin` | LinkedIn触达 | linkedin-writer、connection request |
| `facebook` | Facebook运营 | facebook-acquisition |
| `quote` | 报价生成 | honglong-products 报价功能 |
| `delivery` | 发送队列 | delivery-queue |
| `icp_score` | ICP评分 | 客户评分 |
| `other` | 其他操作 | 未分类操作 |

### 结果状态（result）

| 值 | 说明 | 使用场景 |
|----|------|----------|
| `success` | 完全成功 | 操作完成，达到预期 |
| `partial` | 部分成功 | 有结果但不完美 |
| `fail` | 失败 | 操作失败 |
| `skip` | 跳过 | 因条件不满足跳过 |
| `pending` | 进行中 | 异步操作未完成 |

### 结果评分（score）

| 场景 | 分数范围 | 说明 |
|------|----------|------|
| ICP评分 | 0-100 | 客户质量评分 |
| 开发信评分 | 0-10 | cold-email-generator 评分 |
| 邮箱验证 | 0-100 | 邮箱有效率 |
| 综合评分 | 0-100 | 业务综合评分 |

---

## 四、日志行示例

### 客户搜索

```
2026-04-10 16:30:00.123|Administrator@192.168.0.101|192.168.0.101|exa-search|search|National Cement Ethiopia|success|78|45|找到12条线索,3家高价值
```

### 客户背调

```
2026-04-10 16:35:12.456|Administrator@192.168.0.101|192.168.0.101|company-research|research|National Cement Ethiopia|success|82|120|非洲最大水泥厂,供应商审核中
```

### 开发信生成

```
2026-04-10 16:40:00.789|Administrator@192.168.0.101|192.168.0.101|cold-email-generator|email_gen|National Cement Ethiopia|success|9.3|30|第2轮润色达到9.3分
```

### 邮件发送

```
2026-04-10 16:45:00.012|Administrator@192.168.0.101|192.168.0.101|email-sender|email_send|National Cement Ethiopia|success|||发送到 sale@nationalcement.et
```

---

## 五、采集时机

### 自动采集（推荐）

在每个技能执行完毕后，由AI主动调用日志写入：

```
用户：帮我背调 National Cement Ethiopia
AI：
  1. 调用 company-research skill
  2. 获取背调结果（ICP: 82）
  3. 调用 holo-activity-log 写入日志
  4. 返回背调报告
```

### 手动记录

用户可以主动要求记录：

```
用户：记录一下，我刚完成了客户搜索
用户：今天开发信发了3封，记录一下
```

---

## 六、数据质量规则

### 必需字段校验

- `timestamp`：必须是有效日期时间
- `device_id`：必须包含 `@` 符号
- `ip`：必须是有效IPv4格式
- `skill_name`：必须是非空字符串
- `action_type`：必须是枚举值之一
- `result`：必须是枚举值之一

### 内容清理规则

- 去除前导/尾随空格
- 替换换行符为 ` `（空格）
- 替换 `|` 为 `·`（中间点）
- 截断超长字段（notes ≤ 500字符）

---

## 七、查询示例

### 查看今天的操作

```bash
# Windows
type "\\192.168.0.194\AI数据\activity\2026-04-10.csv"

# 按skill统计
findstr "company-research" "\\192.168.0.194\AI数据\activity\2026-04-10.csv"
```

### 查看某个业务员的操作

```
findstr "Administrator@192.168.0.101" "\\192.168.0.194\AI数据\activity\2026-04-10.csv"
```

### 统计发送数量

```
findstr "|email_send|" "\\192.168.0.194\AI数据\activity\2026-04-10.csv"
```

---

## 八、版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-04-10 | 初始版本 |
