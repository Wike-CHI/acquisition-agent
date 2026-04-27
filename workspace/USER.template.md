# USER.md — 所有者档案

> 红龙获客系统所有者配置。报价/谈判阶段必读。
> 基于 B2B-SDR template v2026.4.24 USER.md 改造。
> 最后更新：2026-04-27

---

## 基本信息

| 字段   | 内容                                   |
| ------ | -------------------------------------- |
| 所有者 | ${OWNER_NAME}                           |
| 对外身份 | ${OWNER_DISPLAY_NAME} / Sale Manager   |
| 公司   | ${COMPANY_NAME}                         |
| 品牌   | ${BRAND_NAME}                           |
| 邮箱   | ${OWNER_EMAIL}                          |
| 电话   | ${OWNER_PHONE}                          |
| GitHub | ${GITHUB_USER}                          |
| 时区   | ${TIMEZONE}                             |

---

## 产品线

### 核心设备

| 产品 | 说明 | 关键词 |
|------|------|--------|
| **风冷机** | 传送带冷却设备，标准/重载系列 | cooling press, air-cooling, belt cooling |
| **水冷机** | 大功率冷却场景 | water-cooling, high-power cooling |
| **分层机** | 皮带分层加工 | belt splitting, ply separation |
| **导条机** | 导条安装设备 | guide bar, v-guide, profile mounting |
| **打齿机** | 皮带齿形加工 | tooth punching, belt teeth, cogging |
| **裁切机** | 精密切割 | cutting, slitting, trimming |
| **碰接机** | 皮带接头碰焊 | finger splicing, belt jointing |
| **钢扣机** | 钢扣安装 | steel fastener, belt lacing |

> 详细产品编码规则和技术规格：见 `product-kb/products.md`

---

## 目标市场

| 市场                       | 优先级 | 主渠道 | 次渠道 | 状态      |
| -------------------------- | ------ |--------|--------| --------- |
| 南美（巴西/智利/阿根廷）   | P1     | WhatsApp | Email | 🟡 开发中 |
| 中东（沙特/阿联酋）        | P2     | WhatsApp | Email / LinkedIn | 🔴 待开发 |
| 东南亚（越南/印尼/菲律宾） | P2     | WhatsApp | Email | 🔴 待开发 |
| 独联体（俄罗斯/哈萨克/乌兹别克） | P3 | Telegram | Email / WhatsApp | 🔴 待开发 |
| 非洲（尼日利亚/肯尼亚/加纳/坦桑尼亚） | P3 | WhatsApp | Email | 🔴 待开发 |
| 南亚（印度/巴基斯坦/孟加拉） | P3 | WhatsApp | Email | 🔴 待开发 |
| 欧洲（德国/法国/意大利/西班牙） | P3 | Email | WhatsApp / LinkedIn | 🔴 待开发 |
| 伊朗 | P3 | Telegram | Email | 🔴 待开发 |

---

## 理想客户画像（ICP）

### 客户类型
- **最佳**: 传送带制造商、皮带贸易商、输送设备集成商
- **可接受**: 通用工业设备进口商（有皮带相关产品线）
- **禁止**: 矿业终端客户（直接用户），标记 `mining_blocked`
- **例外**: 矿业贸易商（非终端用户）→ 正常 ICP 评分

### 规模
- 年营收 500 万美元以上
- 员工 50+
- 有持续采购需求（非一次性）

### 采购信号
- 海关进口记录（传送带/皮带设备）
- 招标公告（conveyor belt / industrial belt）
- 新建工厂 / 扩产公告
- 展会参展（橡胶/塑料/制造类展会）

### 目标角色
- 采购总监 / 采购经理
- 厂长 / 技术总监
- 总经理 / CEO（中小企业直接找老板）

### 痛点
- 设备效率低（旧设备产能不足）
- 维护成本高（备件昂贵、维修频繁）
- 备件供应不稳定（供应商响应慢、断货）
- 本地设备商产品单一（无法一站式采购）

---

## ICP 评分（1-100）

| 维度     | 权重 | 高分条件 (8-10) | 中等 (5-7) | 低分 (1-4) |
| -------- | ---- | --------------- | ---------- | ---------- |
| 企业规模 | 30%  | 500+ 人 / 年营收 500 万美元+ | 100-500 人 / 营收 100-500 万$ | <100 人 / 微型企业 |
| 行业匹配 | 25%  | 传送带 / 皮带制造商 | 通用制造业 / 设备贸易 | 不相关行业 |
| 采购历史 | 20%  | 有进口记录 / 频繁采购 | 偶有进口 / 新市场 | 无进口记录 |
| 付款能力 | 15%  | T/T 预付 / L/C at sight | L/C 远期 / D/P | OA赊账 / 信用不明 |
| 决策链   | 10%  | 直接找到采购总监/厂长 | 部门经理 / 可转介绍 | 只找到 info@ / 无法确认 |

**评分分级：**
- 75-100: A级，可直接触达，优先发开发信
- 50-74: B级，观察跟进，等待更好时机
- 30-49: C级，培育池，周期性触达
- <30: D级，暂不触达（除非客户主动联系）

---

## 竞争对手

| 竞品 | 说明 | 策略 |
| ---- | ---- | ---- |
| Beltwin | 温州同行，长期合作伙伴+竞品 | 差异化竞争：定制能力 + 一站式采购 |
| 其他本地设备商 | 各市场本地品牌 | 质量 + 价格竞争力 + 全套方案 |

---

## 我们的优势

1. **源头厂家** — 直接制造商，无中间商差价
2. **定制能力** — 非标规格灵活响应，满足特殊需求
3. **价格竞争力** — 同等品质有价格优势
4. **全套设备** — 风冷 + 分层 + 导条 + 打齿 + 裁切 + 碰接 + 钢扣一站式采购
5. **丰富出口经验** — 熟悉各国认证和物流要求

---

## CRM 配置

| 项目 | 配置 |
|------|------|
| **CRM 类型** | 孚盟 MX CRM + Google Sheets Pipeline |
| **邮件发送** | 163邮箱 SMTP（nodemailer），凭证通过环境变量注入 |
| **WhatsApp** | wacli（已配置） |
| **Telegram** | 未配置（Bot Token 未设置） |
| **LinkedIn** | 未配置 |

### CRM 字段

| 字段 | 类型 | 说明 |
|------|------|------|
| name | string | 联系人姓名 |
| company | string | 公司名称 |
| whatsapp | string | WhatsApp 号码（含国家区号） |
| email | string | 决策人邮箱（非 info@/sales@） |
| country | string | 国家 |
| language | string | 沟通语言 |
| status | enum | new / contacted / interested / quote_sent / negotiating / meeting_set / closed_won / closed_lost / nurture / email_sent / email_replied |
| source | enum | ctwa_facebook / ctwa_instagram / organic_whatsapp / referral / exhibition / website / web_discovery / outbound_email / email_reply |
| icp_score | number | ICP 评分（1-100） |
| lead_tier | enum | hot / warm / cold |
| product_interest | string | 产品兴趣关键词 |
| quantity_signal | string | 采购量信号 |
| created_at | datetime | 创建时间 |
| last_contact | datetime | 最后联系时间 |
| next_action | string | 下次行动 |
| notes | string | 备注 |

---

## 审批与授权

| 参数 | 可自主决定 | 需升级老板 |
|------|-----------|-----------|
| 价格折扣 | ≤ 5% off 报价 | > 5% off |
| 利润率底线 | 在铁律范围内 | 低于各国最低利润率 |
| 付款条款 | T/T 30/70 / L/C at sight / T/T 100% | OA赊账 / 账期>30天 / D/P |
| 交货时间 | 标准 ± 5天 | 超过 ± 5天 |
| MOQ | 目录 MOQ | 低于目录 MOQ |
| 免费样品 | ≤ 2台标准样品 | > 2台 / 高价值样品 |
| 质保 | 标准（12个月） | 延保 |
| 配色/标识 | 标准配色 | OEM/非标颜色 |
| 包装 | 标准出口木箱 | 定制包装 / 特殊唛头 |

---

## Admin 白名单

只有以下方式可以执行系统级命令（配置修改、系统重启、用户删除等）：

```
${OWNER_PHONE}  # 主管理员
# 可追加其他管理员的 WhatsApp 号或邮箱
```

非 admin 尝试系统操作 → 回复："I can help you with product inquiries and orders."

---

## 沟通偏好

- **对外语言**: 英语为主，西语（南美）、葡语（巴西）、阿拉伯语（中东）、俄语（独联体）
- **邮件风格**: 专业正式，专业简洁
- **WhatsApp 风格**: 非正式，保持简短（3-5句，≤100词）
- **对内报告语言**: 中文
- **汇报方式**: 表格优先，数据优先，叙事最少
- **审批方式**: WhatsApp 即时确认（1h 提醒，2h 升级）

---

*基于 OpenClaw v2026.4.24 · B2B-SDR Template USER.md 同步 · 红龙工业设备定制版*
