## 五、特殊情况处理

### 5.1 分公司/子公司

```
总公司：ABC Industrial (USA)
分公司：ABC Industrial Mexico

处理：
- 识别为相关公司
- 标记关系
- 不自动合并（保留为独立客户）
- 添加关联标记
```

### 5.2 名称变更

```
旧名称：ABC Belting Company
新名称：ABC Industrial Solutions

处理：
- 通过域名匹配识别
- 标记为"曾用名"
- 合并历史信息
```

### 5.3 多语言名称

```
英文：ABC Industrial
中文：ABC工业公司
西班牙语：ABC Industrial S.A.

处理：
- 通过域名匹配
- 保留多语言名称
- 标记为同一公司
```

## 六、输出报告

### 6.1 去重统计

```markdown
## 客户去重报告

### 输入数据
- Facebook: 20个客户
- LinkedIn: 15个客户
- Instagram: 12个客户
- 特易海关: 30个客户
- **总计**: 77个客户

### 去重结果
- 去重后客户: 45个
- 重复项移除: 32个
- 去重率: 41.6%

### 重复来源分析
| 来源组合 | 重复数 |
|----------|--------|
| Facebook + LinkedIn | 8个 |
| LinkedIn + Instagram | 5个 |
| Facebook + Instagram | 6个 |
| 三平台重复 | 3个 |
| 海关 + 社媒 | 10个 |
```

### 6.2 客户质量提升

```
去重前：
- 平均信息完整度: 45%
- 有邮箱: 40%
- 有电话: 30%
- 有网站: 50%

去重后（合并信息）：
- 平均信息完整度: 75%
- 有邮箱: 65%
- 有电话: 55%
- 有网站: 80%
```

## 七、快速命令

### 合并命令
```
用户: 合并这些平台的客户并去重
例: 合并 Facebook、LinkedIn、Instagram 的客户并去重
```

### 检查命令
```
用户: 检查这个客户是否已存在
例: 检查 ABC Industrial 是否在客户库中
```

### 导出命令
```
用户: 导出去重后的客户列表
例: 导出去重后的客户列表到 Excel
```

## 八、数据结构

### 8.1 客户唯一标识

```
客户ID = MD5(标准化公司名称 + 主域名)

示例：
公司：ABC Industrial Supply
域名：abc-industrial.com
标准化：abcindustrialsupply + abc-industrial.com
ID: a1b2c3d4e5f6...
```

### 8.2 合并记录

```json
{
  "customer_id": "a1b2c3d4e5f6",
  "merge_history": [
    {
      "date": "2026-03-25",
      "source": "facebook",
      "original_name": "ABC Industrial Supply",
      "data": {...}
    },
    {
      "date": "2026-03-25",
      "source": "linkedin",
      "original_name": "ABC Industrial Ltd",
      "data": {...}
    }
  ]
}
```

## 九、注意事项

### 9.1 不要过度去重

- 子公司 ≠ 重复
- 不同地区分公司 ≠ 重复
- 名称相似但业务不同 ≠ 重复

### 9.2 保留原始数据

- 始终保留去重前的原始数据
- 记录合并历史
- 可恢复误合并

### 9.3 人工确认

- 自动去重后人工抽查
- 对可疑重复进行确认
- 建立白名单/黑名单

---
*相关技能*:
- global-customer-acquisition: 全网获客主控
- customer-intelligence: 客户情报
- crm: 客户管理

*更新时间*: 2026-03-25
