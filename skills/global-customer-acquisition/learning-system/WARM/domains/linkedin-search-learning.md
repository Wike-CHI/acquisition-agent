# LinkedIn搜索最佳实践学习

> LinkedIn决策人搜索最佳实践（2026-04-01）

---

## 学习来源

**数据来源**：LinkedIn决策人验证（3次）  
**验证日期**：2026-04-01  
**状态**：✅ WARM（领域级学习）  
**最后使用**：2026-04-01  
**重复次数**：3次

---

## 工具选择验证（3次验证）

### 错误理解（已纠正）

**错误**：LinkedIn决策人 → linkedin技能/MCP  
**纠正**：LinkedIn决策人 → Exa语义搜索（`site:linkedin.com`）

---

### 正确工具优先级

| 优先级 | 工具 | 说明 | API Key |
|-------|------|------|---------|
| **1（首选）** | Exa Free via mcporter | 无需API Key，稳定可靠 | ❌ 不需要 |
| **2（备选）** | Exa API | 功能更强，需配置 | ✅ 需要EXA_API_KEY |
| **3（降级）** | web_search（Google） | 最后降级，LinkedIn受限 | ❌ 不需要 |

---

## 调用方式

### 方法1：Exa Free via mcporter（推荐）

```bash
mcporter call "exa.web_search_exa(query: 'linkedin profile gerente compras banda transportadora Colombia', numResults: 8, includeDomains: ['linkedin.com'])"
```

**优势**：
- ✅ 无需API Key
- ✅ 稳定可靠
- ✅ 支持多语言（英语、西语、葡语）
- ✅ 结果质量高

---

### 方法2：Exa API（备选）

```bash
curl -X POST "https://api.exa.ai/search" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $EXA_API_KEY" \
  -d '{
    "query": "linkedin profile Purchasing Manager conveyor belt United States",
    "numResults": 8,
    "includeDomains": ["linkedin.com"]
  }'
```

**优势**：
- ✅ 功能更强
- ✅ 支持更多参数

**劣势**：
- ❌ 需要配置EXA_API_KEY

---

### 方法3：web_search（降级）

```bash
web_search("Purchasing Manager conveyor belt United States site:linkedin.com")
```

**优势**：
- ✅ 无需配置

**劣势**：
- ❌ LinkedIn受限（可能无法访问）
- ❌ 结果质量不稳定

---

## 关键词模板

### 基本结构

```
[语言] + [岗位] + [产品] + [国家/地区]
```

---

### 英语（美国、加拿大、英国等）

**岗位关键词**：
- Purchasing Manager
- Procurement Manager
- Sourcing Manager
- Buyer
- Supply Chain Manager
- Operations Manager
- Plant Manager
- Production Manager

**产品关键词**：
- conveyor belt
- industrial belt
- belt splicing
- material handling

**示例**：
```
mcporter call "exa.web_search_exa(query: 'linkedin profile Purchasing Manager conveyor belt United States', numResults: 8, includeDomains: ['linkedin.com'])"

mcporter call "exa.web_search_exa(query: 'linkedin profile Procurement Manager industrial belt Canada', numResults: 8, includeDomains: ['linkedin.com'])"
```

---

### 西班牙语（墨西哥、哥伦比亚、西班牙等）

**岗位关键词**：
- Gerente de Compras（采购经理）
- Jefe de Compras（采购主管）
- Comprador（采购员）
- Gerente de Abastecimiento（供应链经理）

**产品关键词**：
- banda transportadora（输送带）
- cinta transportadora（传送带）
- banda industrial（工业带）

**示例**：
```
mcporter call "exa.web_search_exa(query: 'linkedin profile gerente compras banda transportadora Mexico', numResults: 8, includeDomains: ['linkedin.com'])"

mcporter call "exa.web_search_exa(query: 'linkedin profile jefe de compras banda industrial Colombia', numResults: 8, includeDomains: ['linkedin.com'])"
```

---

### 葡萄牙语（巴西）

**岗位关键词**：
- Gerente de Compras（采购经理）
- Chefe de Compras（采购主管）
- Comprador（采购员）
- Gerente de Suprimentos（供应链经理）

**产品关键词**：
- esteira transportadora（输送带）
- correia transportadora（传送带）
- correia industrial（工业带）

**示例**：
```
mcporter call "exa.web_search_exa(query: 'linkedin profile gerente compras esteira transportadora Brasil', numResults: 8, includeDomains: ['linkedin.com'])"

mcporter call "exa.web_search_exa(query: 'linkedin profile chefe de compras correia industrial Sao Paulo', numResults: 8, includeDomains: ['linkedin.com'])"
```

---

## 执行前检查

### 检查清单

```python
def check_linkedin_search():
    """LinkedIn搜索前检查"""
    
    # 1. 检查mcporter服务
    if not check_mcporter_available():
        return {"status": "error", "message": "mcporter服务不可用"}
    
    # 2. 检查exa服务
    if not check_exa_available():
        return {"status": "error", "message": "Exa服务不可用"}
    
    # 3. 检查关键词质量
    if not validate_keywords(query):
        return {"status": "warning", "message": "关键词可能不精准"}
    
    # 4. 检查结果数量
    if numResults < 3 or numResults > 10:
        return {"status": "warning", "message": "结果数量建议3-10个"}
    
    return {"status": "ready", "message": "可以执行LinkedIn搜索"}
```

**命令示例**：
```bash
mcporter list exa
```

**预期输出**：
```
✅ Exa服务可用
```

---

## 结果验证

### 验证标准

**有效LinkedIn Profile特征**：
1. ✅ URL包含 `linkedin.com/in/`
2. ✅ 标题（Headline）包含岗位关键词
3. ✅ 公司名称匹配目标客户
4. ✅ 地理位置匹配目标国家/地区

---

### 结果过滤

```python
def filter_linkedin_results(results):
    """过滤LinkedIn搜索结果"""
    
    valid_profiles = []
    
    for result in results:
        # 1. 检查URL
        if "linkedin.com/in/" not in result["url"]:
            continue
        
        # 2. 检查标题
        if not any(keyword in result["title"] for keyword in JOB_KEYWORDS):
            continue
        
        # 3. 检查公司
        if result["company"] not in TARGET_COMPANIES:
            continue
        
        # 4. 检查地理位置
        if result["location"] not in TARGET_LOCATIONS:
            continue
        
        valid_profiles.append(result)
    
    return valid_profiles
```

---

## 常见问题

### Q1: Exa搜索没有结果？

**可能原因**：
1. ❌ 关键词太泛（如只用"conveyor belt"）
2. ❌ 地理位置太大（如只用"United States"）
3. ❌ 语言不匹配（如英语关键词搜西语国家）

**解决方案**：
1. ✅ 添加岗位关键词（如"Purchasing Manager"）
2. ✅ 添加城市/州（如"California"）
3. ✅ 使用目标国家语言（如西语用"Gerente de Compras"）

---

### Q2: Exa服务不可用？

**可能原因**：
1. ❌ mcporter服务未启动
2. ❌ 网络连接问题

**解决方案**：
1. ✅ 检查mcporter服务：`mcporter list`
2. ✅ 检查网络连接
3. ✅ 降级到web_search（最后手段）

---

### Q3: LinkedIn搜索结果质量低？

**可能原因**：
1. ❌ 关键词不精准
2. ❌ 结果数量太少（<3个）

**解决方案**：
1. ✅ 优化关键词（添加更多岗位、产品关键词）
2. ✅ 增加结果数量（numResults: 10）

---

## 自我反思

### CONTEXT: LinkedIn决策人搜索

**任务类型**：搜索LinkedIn决策人

---

### REFLECTION: 工具选择验证

**初始错误**：LinkedIn决策人 → linkedin技能/MCP  
**纠正后**：LinkedIn决策人 → Exa语义搜索（`site:linkedin.com`）

**验证过程**：
1. ❌ 第1次尝试：使用linkedin技能，发现不是搜索工具
2. ❌ 第2次尝试：使用LinkedIn MCP，发现不是搜索工具
3. ✅ 第3次尝试：使用Exa语义搜索，成功找到决策人

---

### LESSON: LinkedIn搜索最佳实践

**下次改进**：
1. 🎯 **工具选择**：优先使用Exa Free via mcporter，备选Exa API，降级web_search
2. 🎯 **关键词模板**：语言+岗位+产品+国家
3. 🎯 **执行前检查**：`mcporter list exa` 确认服务可用
4. 🎯 **结果验证**：URL、标题、公司、地理位置四维度验证
5. 🎯 **结果过滤**：过滤无效结果，只保留有效LinkedIn Profile

---

## 推广建议

**适用范围**：LinkedIn决策人搜索（全球）  
**优先级**：P2（成功工作流）  
**下次使用**：每次LinkedIn搜索决策人时

---

_学习记录日期：2026-04-01_  
_状态：✅ WARM（领域级学习）_  
_系统版本：v2.3.0_
