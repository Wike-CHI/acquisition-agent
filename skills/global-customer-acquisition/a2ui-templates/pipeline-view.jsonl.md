# Pipeline看板 A2UI 模板

{"id":"root","component":{"Column":{"children":["header","tabs"]}}}
{"id":"header","component":{"Row":{"children":["title","stats"]}}}
{"id":"title","component":{"Text":{"text":{"literalString":"📊 销售Pipeline"},"usageHint":"h1"}}}
{"id":"stats","component":{"Row":{"children":["stat1","stat2","stat3","stat4"]}}}
{"id":"stat1","component":{"Badge":{"text":"新线索 {{new-count}}","variant":"info"}}}
{"id":"stat2","component":{"Badge":{"text":"已联系 {{contacted-count}}","variant":"warning"}}}
{"id":"stat3","component":{"Badge":{"text":"已报价 {{quoted-count}}","variant":"primary"}}}
{"id":"stat4","component":{"Badge":{"text":"已成交 {{won-count}}","variant":"success"}}}
{"id":"tabs","component":{"Tabs":{"tabs":["tab-new","tab-contacted","tab-quoted","tab-won"]}}}

<!-- Tab 1: 新线索 -->
{"id":"tab-new","component":{"Tab":{"label":"新线索 ({{new-count}})","content":"list-new"}}}
{"id":"list-new","component":{"List":{"items":["new-item1","new-item2","new-item3"]}}}

<!-- 新线索项1 -->
{"id":"new-item1","component":{"Card":{"child":"new-item1-content"}}}
{"id":"new-item1-content","component":{"Row":{"children":["new-item1-info","new-item1-actions"]}}}
{"id":"new-item1-info","component":{"Column":{"children":["new-item1-name","new-item1-details"]}}}
{"id":"new-item1-name","component":{"Text":{"text":{"literalString":"{{new-customer1-name}}"},"usageHint":"h3"}}}
{"id":"new-item1-details","component":{"Row":{"children":["new-item1-industry","new-item1-score"]}}}
{"id":"new-item1-industry","component":{"Text":{"text":{"literalString":"{{new-customer1-industry}}"},"usageHint":"body2"}}}
{"id":"new-item1-score","component":{"Badge":{"text":"ICP {{new-customer1-score}}","variant":"success"}}}
{"id":"new-item1-actions","component":{"Column":{"children":["new-item1-btn-contact","new-item1-btn-research"]}}}
{"id":"new-item1-btn-contact","component":{"Button":{"text":"📞 联系","variant":"primary","size":"small"}}}
{"id":"new-item1-btn-research","component":{"Button":{"text":"🔍 背调","variant":"secondary","size":"small"}}}

<!-- Tab 2: 已联系 -->
{"id":"tab-contacted","component":{"Tab":{"label":"已联系 ({{contacted-count}})","content":"list-contacted"}}}
{"id":"list-contacted","component":{"List":{"items":["contacted-item1"]}}}

<!-- Tab 3: 已报价 -->
{"id":"tab-quoted","component":{"Tab":{"label":"已报价 ({{quoted-count}})","content":"list-quoted"}}}
{"id":"list-quoted","component":{"List":{"items":["quoted-item1"]}}}

<!-- Tab 4: 已成交 -->
{"id":"tab-won","component":{"Tab":{"label":"已成交 ({{won-count}})","content":"list-won"}}}
{"id":"list-won","component":{"List":{"items":["won-item1"]}}}

---

## 变量说明

| 变量 | 示例值 |
|------|--------|
| {{new-count}} | 12 |
| {{contacted-count}} | 8 |
| {{quoted-count}} | 5 |
| {{won-count}} | 3 |
| {{new-customer1-name}} | ACE Belting |
| {{new-customer1-industry}} | 输送带制造 |
| {{new-customer1-score}} | 8.5 |

---

## 使用示例

用户输入：
```
显示Pipeline状态
```

AI生成：
```jsonl
{"id":"root","component":{"Column":{"children":["header","tabs"]}}}
{"id":"header","component":{"Row":{"children":["title","stats"]}}}
{"id":"title","component":{"Text":{"text":{"literalString":"📊 销售Pipeline"},"usageHint":"h1"}}}
{"id":"stats","component":{"Row":{"children":["stat1","stat2","stat3","stat4"]}}}
{"id":"stat1","component":{"Badge":{"text":"新线索 12","variant":"info"}}}
{"id":"stat2","component":{"Badge":{"text":"已联系 8","variant":"warning"}}}
{"id":"stat3","component":{"Badge":{"text":"已报价 5","variant":"primary"}}}
{"id":"stat4","component":{"Badge":{"text":"已成交 3","variant":"success"}}}
{"id":"tabs","component":{"Tabs":{"tabs":["tab-new","tab-contacted","tab-quoted","tab-won"]}}}
{"id":"tab-new","component":{"Tab":{"label":"新线索 (12)","content":"list-new"}}}
{"id":"list-new","component":{"List":{"items":["new-item1"]}}}
{"id":"new-item1","component":{"Card":{"child":"new-item1-content"}}}
{"id":"new-item1-content","component":{"Row":{"children":["new-item1-info","new-item1-actions"]}}}
{"id":"new-item1-info","component":{"Column":{"children":["new-item1-name","new-item1-details"]}}}
{"id":"new-item1-name","component":{"Text":{"text":{"literalString":"ACE Belting"},"usageHint":"h3"}}}
{"id":"new-item1-details","component":{"Row":{"children":["new-item1-industry","new-item1-score"]}}}
{"id":"new-item1-industry","component":{"Text":{"text":{"literalString":"输送带制造"},"usageHint":"body2"}}}
{"id":"new-item1-score","component":{"Badge":{"text":"ICP 8.5","variant":"success"}}}
{"id":"new-item1-actions","component":{"Column":{"children":["new-item1-btn-contact","new-item1-btn-research"]}}}
{"id":"new-item1-btn-contact","component":{"Button":{"text":"📞 联系","variant":"primary","size":"small"}}}
{"id":"new-item1-btn-research","component":{"Button":{"text":"🔍 背调","variant":"secondary","size":"small"}}}
...
```
