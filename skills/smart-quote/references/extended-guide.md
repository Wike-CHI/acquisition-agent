## 参考文档

- **各国利润率指导**: references/profit_rates.md
- **产品成本参考（缓存）**: references/products.md（NAS不可用时的备用，2025-11-27更新）
- **报价指引模板**: references/报价指引模板.md（标准化输出格式）
- **A2UI 交互式输出**: references/a2ui-output-guide.md（报价卡片格式）
- **汇率查询脚本**: scripts/exchange_rate.py（实时汇率换算工具）

---

## 交互式卡片输出（A2UI）

完成报价分析后，在 Markdown 内容末尾附加 A2UI 报价摘要卡片。

**输出规则：**
1. 先输出 Markdown 格式的报价分析
2. 在末尾附加 ```` ```a2ui ``` 卡片，包含：
   - 产品名称、数量（Text 组件）
   - 建议利润率范围（Text 组件）
   - 估算FOB价范围（Text 组件）
   - "生成正式报价单"按钮（action: `generate_quote`，context 含 company/product/quantity）
3. surfaceId 格式：`quote-{客户域名关键词}-{序号}`
