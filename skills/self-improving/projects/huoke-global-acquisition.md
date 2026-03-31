# Project Memory — 红龙全球获客系统

> **Namespace:** huoke-global-acquisition
> **最后更新：** 2026-03-31
> **优先级：** 高（核心业务系统）

---

## 项目基本信息

- **公司：** 温州红龙工业设备制造有限公司（瑞安）
- **产品：** 工业皮带设备（风冷机/水冷机/分层机/导条机等）
- **目标：** 海外 B2B 获客，重点市场：中东/东南亚/欧美/南美
- **核心技能：** `global-customer-acquisition`（位于 `~/.workbuddy/skills/global-customer-acquisition/`）

---

## 已验证的市场调研流程

### 特易海关平台操作（SOP v2.1）

**最佳操作序列（2026-03-31 稳定版）：**

```
1. 登录
   eval: var inputs=document.querySelectorAll('input')
         native setter 填账号密码
         click button.login_btn

2. 进入搜索页（每次换国家都要重新 open）
   open "https://et.topease.net/gt/company?wlf=gt_company"
   wait 3000  ← Vue 渲染需要额外等待

3. 点击目标国家
   eval: Array.from(document.querySelectorAll('.country span'))
         .find(el=>el.textContent.trim()==='[国家中文名]')
         .closest('.country').click()

4. 填关键词（最稳定方式）
   find first "input[type=text]" fill "conveyor belt"

5. 提交查询
   find role button click --name "查询"
   wait 5000

6. 读取结果数量
   eval: Array.from(document.querySelectorAll('[role=tab]'))
         .map(t=>t.textContent.trim()).join(' | ')

7. 提取公司列表
   eval: document.body.innerText.slice(800, 4500)
```

**已测试的中文国家名（特易标签）：**
| 中文名 | 英文 | 最近数据（conveyor belt） |
|--------|------|--------------------------|
| 埃及 | Egypt | 139 家（2026-03-31）|
| 巴西 | Brazil | 1,079 家（2026-03-31）|
| 智利 | Chile | 365 家（2026-03-31）|
| 美国 | USA | 3,175 家（2026-03-31）|
| 墨西哥 | Mexico | 1,155 家（2026-03-31）|

---

## 已识别的重点客户（P0 级）

| 国家 | 公司 | 采购频次 | 联系方式 | 备注 |
|------|------|---------|---------|------|
| 美国 | WITECK CONSULTANTS INC | 210次相关 | 337 Merrick Rd Lynbrook NY | 专业橡胶皮带进口商 |
| 美国 | AFM INDUSTRIES | 202次相关 | — | CRM 已建档 |
| 巴西 | BORPAC COMERCIO | 3,136次/3年 | sergio@borpac.com.br | 最大皮带分销商，Sérgio LinkedIn已确认 |
| 墨西哥 | INTERBANDAS | — | interbandas.mx | 专业皮带分销 |
| 智利 | MINERA ESCONDIDA LTDA | — | Cerro El Plomo 6000 Santiago | BHP旗下，世界最大铜矿 |
| 智利 | MINERA SPENCE S.A. | — | 同上 | BHP旗下，同采购链 |
| 埃及 | SUEZ CEMENT CO. | 215次进口 | suezcement.com.eg | 水泥厂，S级 |
| 越南 | VICSUN CO. LTD | 15,399次 | vicsunco.ltd@gmail.com | 越南最大皮带分销商 |
| 马来西亚 | BELT-TECH ENGINEERING | — | kl@belt-tech.com.my | 134 Jln Radin, KL，工程皮带专业商 |
| 印度 | CONTINENTAL BELTING | — | info@continentalbelting.com | 皮带制造商，精准匹配硫化机 |

---

## 邮件触达自动化系统（2026-03-31 已落地）

### 脚本文件

| 文件 | 用途 | 触发方式 |
|------|------|---------|
| `send_batch_emails.py` | D0 正式群发 | 手动运行或 WorkBuddy D0 定时任务 |
| `follow_up_emails.py` | D5/D14 跟进 | `python follow_up_emails.py day5` 或 `day14` |

### WorkBuddy 定时任务（已创建）

| ID | 执行时间 | 动作 |
|----|---------|------|
| d0 | 2026-03-31 11:30 | send_batch_emails.py |
| d3-linkedin | 2026-04-03 09:00 | LinkedIn连接请求提醒 |
| d5 | 2026-04-05 09:00 | follow_up_emails.py day5 |
| d14 | 2026-04-14 09:00 | follow_up_emails.py day14 |

### 邮件策略要点

- D5 跟进：简短有力，提供一个具体价值点，降低门槛（"只需2分钟看一下产品对比"）
- D14 最终：明确是最后一封，留下联系方式，优雅收尾
- 发送间隔：每封 15 秒，避免触发 SPAM 过滤
- 签名统一：`Wike | HONGLONG Industrial Equipment`，+86 13165862311（WhatsApp）

### SMTP 配置（163）

```python
SMTP_CONFIG = {
    "host": "smtp.163.com",
    "port": 465,
    "username": "your@email.com",       # 填写业务员个人发件邮箱
    "password": "授权码（非登录密码）",
    "use_ssl": True,
}
```

---

## 市场特征学习（已验证）

### 美国市场
- **规模最大**（3,175 家），但竞争最激烈（中国皮带进口商成熟）
- 买家分类：专业橡胶皮带进口商（WITECK/AFM）> 工矿企业直采 > OEM 厂商
- 关键差异化：质量认证（FDA/RoHS）、快速交货（有美国仓=大优势）

### 巴西市场
- 专业分销商集中度高（BORPAC 一家就 3,136 次）
- 语言：葡萄牙语，发开发信建议中葡双语
- 付款：巴西进出口规则复杂（需要当地进口代理）

### 智利市场
- **矿业主导**，BHP 旗下公司采购量巨大
- 高单价、高要求（矿山皮带需要特殊规格）
- 开发路径：先接触 OEM/维修服务商，再进入矿山供应链

### 墨西哥市场
- 制造业密集（汽车/电子），皮带需求多样化
- 官网联系方式好找（INTERBANDAS 有完整官网）
- 语言：西班牙语开发信效果更好

### 埃及市场
- **水泥厂主导**（~40% 买家），其次是钢铁厂
- 从印度和中国进口，价格敏感但量大
- 沟通习惯：WhatsApp 优先于邮件

---

## 开发信策略（按市场）

### 美国/英语市场
```
Subject: Industrial Belt Equipment Supplier from China | [产品名]
- 强调 CE/ISO 认证
- 附上详细技术规格 PDF
- 提供免费样品
```

### 巴西（葡萄牙语）
```
Subject: Fornecedor de Equipamentos para Correias Industriais | [产品]
- 强调已有其他巴西客户（如有）
- 提及巴西进口优惠（MERCOSUL）
```

### 智利/墨西哥（西班牙语）
```
Subject: Proveedor de Equipos para Correas Industriales | [产品]
- 智利：强调矿山应用经验
- 墨西哥：强调快速交货和本地化服务
```

---

## 踩坑记录（项目专属）

1. **特易搜索页 URL**：`/gt/company?wlf=gt_company`（含 wlf 参数）比 `/gt/company/index` 加载更快
2. **会话超时**：特易 session 约 30 分钟超时，长任务中途需重新登录
3. **巴西国家名**：特易标签用"巴西"（不是"Brazil"或"BR"）
4. **结果页没有国家过滤**：搜索结果不含"换国家"功能，必须回搜索页重选
5. **数据时效**：特易数据滞后约 1-3 个月，2026 年 Q1 的数据可参考

---

## 相关文件路径

- 综合报告：`C:\Users\Administrator\WorkBuddy\20260330165354\南美北美工业皮带客户报告.md`
- 亚洲欧洲报告：`C:\Users\Administrator\WorkBuddy\20260330165354\亚洲欧洲工业皮带客户报告.md`
- 埃及报告：`C:\Users\Administrator\WorkBuddy\20260330165354\埃及工业皮带客户报告.md`
- 开发信集合：`C:\Users\Administrator\WorkBuddy\20260330165354\批量开发客户-开发信集合.md`
- Pipeline Excel：`C:\Users\Administrator\WorkBuddy\20260330165354\红龙全球客户Pipeline-2026Q1.xlsx`
- 邮件脚本：`C:\Users\Administrator\WorkBuddy\20260330165354\send_batch_emails.py`
- 跟进脚本：`C:\Users\Administrator\WorkBuddy\20260330165354\follow_up_emails.py`
- SOP 文件：`~/.workbuddy/skills/global-customer-acquisition/MARKET-DEEP-DIVE.md`
- 技能主文件：`~/.workbuddy/skills/global-customer-acquisition/SKILL.md`
