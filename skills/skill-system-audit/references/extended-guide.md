## 注意事项

- **不要只扫 routing 表**：父技能文件（GCA/coordinator）里的 `skill://` 引用同样要检查
- **路由表结构不是扁平的**：每个 intent 下有 `overseas`/`domestic` 分支，每分支是 `[{skill, fallback, next}]` 列表
- **patch 工具有歧义检测**：如果 `old_string` 匹配多处，patch 会拒绝执行，此时用 Python 字节级替换
- **归档后必须更新 sync-to-github.sh 的 RETAINED_SKILLS**：否则脚本同步时会跳过应该删除的技能
- **路由表修复4步**：从备份恢复 → YAML解析验证 → 修复4类破损引用 → 提取验证无 critical_missing
- **MANIFEST 里的不都是技能**：先过滤 `metadata_entries` 再比较
- **凭证扫描用宽regex但过滤严**：假阳性多（`pass` 字段到处都是），但真实凭证要全部清理

## 依赖

- Python 3
- PyYAML (`yaml`)

---

_Version: 1.1.0_
