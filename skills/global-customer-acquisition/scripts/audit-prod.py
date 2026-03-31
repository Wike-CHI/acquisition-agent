#!/usr/bin/env python3
"""快速验证生产文件"""
import os, re

SKILL = r'C:\Users\Administrator\.workbuddy\skills\global-customer-acquisition'
MISSING = ['tianyancha','jina-reader','quotation-generator']
issues = []
count = 0
for dirpath, dirs, files in os.walk(SKILL):
    dirs[:] = [d for d in dirs if d not in ['data','test-output','node_modules','__pycache__','.git']]
    for f in files:
        full = os.path.join(dirpath, f)
        rel = os.path.relpath(full, SKILL)
        if not rel.endswith('.md') or rel.startswith('temp-'):
            continue
        # Only check top-level + context/ + references/ + skills/*/
        ok = False
        parts = rel.split(os.sep)
        if parts[0] in ['SKILL.md','AGENTS.md','ANTI-AMNESIA.md','HEARTBEAT.md','TOOLS.md','AGENTS.md']:
            ok = True
        elif parts[0] in ['references','context','skills']:
            ok = True
        if not ok:
            continue
        count += 1
        try:
            with open(full, encoding='utf-8') as fp:
                c = fp.read()
        except:
            continue
        for m in MISSING:
            if re.search(r'\b' + m + r'\b', c, re.I):
                issues.append((rel, m))
        matches = re.findall(r"'exa'(?!-)", c)
        if matches:
            issues.append((rel, 'exa-not-exa-search'))
if issues:
    print('仍有:')
    for f, s in issues:
        print('  ' + f + ': ' + s)
else:
    print('全部通过，无缺失技能引用')
print('扫描了 ' + str(count) + ' 个生产文件')
