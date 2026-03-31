#!/usr/bin/env python3
"""audit-external-skills.py"""
import os, re

SKILL = r'C:\Users\Administrator\.workbuddy\skills\global-customer-acquisition'
SKILLS_ROOT = r'C:\Users\Administrator\.workbuddy\skills'

EXTERNAL_SKILLS = {
    'cold-email-generator', 'email-sender', 'humanize-ai-text',
    'company-research', 'deep-research', 'linkedin', 'linkedin-writer',
    'brave-web-search', 'exasearch', 'exa', 'jina-reader',
    'company-background-check', 'market-research', 'email-outreach-ops',
    'marketing-strategy-pmm', 'browser-automation', 'sales-pipeline-tracker',
    'crm', 'multi-search-engine', 'playwright', 'telegram-toolkit',
    'sdr-humanizer', 'delivery-queue', 'quotation-generator',
    'lead-discovery', 'tianyancha', 'ai-social-media-content', 'fumamx-crm',
    'honglong-assistant', 'honglong-products',
}

local_skills = set()
skills_dir = os.path.join(SKILL, 'skills')
if os.path.exists(skills_dir):
    for d in os.listdir(skills_dir):
        p = os.path.join(skills_dir, d)
        if os.path.isdir(p):
            local_skills.add(d)

all_files = []
for dirpath, dirs, files in os.walk(SKILL):
    dirs[:] = [d for d in dirs if d not in ['data','test-output','node_modules','__pycache__','.git','temp-']]
    for f in files:
        if f.endswith(('.md','.js','.json','.ts','.py')):
            all_files.append(os.path.join(dirpath, f))

found = {}
for fpath in all_files:
    rel = os.path.relpath(fpath, SKILL)
    try:
        with open(fpath, encoding='utf-8') as f:
            lines = f.readlines()
    except:
        continue
    content = ''.join(lines)
    for skill in EXTERNAL_SKILLS:
        pat = re.compile(rf'skills?[\/:]({re.escape(skill)})[\/\s\.\]|#|"|`|\n', re.I)
        if pat.search(content):
            found.setdefault(skill, set()).add(rel)

print('=== 外部技能引用审计 ===\n')
missing = []
available = []
for skill in sorted(EXTERNAL_SKILLS):
    skill_path = os.path.join(SKILLS_ROOT, skill)
    exists = os.path.exists(skill_path)
    refs = found.get(skill, set())
    tag = '存在' if exists else 'MISS'
    icon = '  OK' if exists else '  X '
    print(f'[{icon}] skill://{skill} ({tag})')
    for f in sorted(refs):
        print(f'       {f}')
    if not exists and refs:
        missing.append(skill)
    elif exists:
        available.append(skill)

print()
print('=== 统计 ===')
print(f'  缺失但有引用: {len(missing)}')
for s in missing: print(f'    - {s}')
print(f'  存在且有引用: {len(available)}')
for s in available: print(f'    - {s}')
print()
print('=== 本地技能（已内置）===')
for s in sorted(local_skills):
    print(f'  + {s}')
