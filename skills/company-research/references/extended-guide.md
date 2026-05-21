## 交互式卡片输出（A2UI）

完成背调后，在 Markdown 报告末尾附加 A2UI 交互卡片，让业务员一键操作。

**参考文件**：`references/a2ui-output-guide.md`（读取此文件获取完整格式说明）

**输出规则：**
1. 先输出 Markdown 格式的完整报告
2. 在报告末尾附加 ```` ```a2ui ``` 卡片，包含：
   - 公司名称、联系人、邮箱（Text 组件）
   - ICP 评分（Text 组件）
   - "发送开发信"按钮（action: `send_email`，context 含 to/subject）
   - "生成报价"按钮（action: `generate_quote`，context 含 company/product）
3. surfaceId 格式：`cr-{公司域名关键词}-{日期}`
