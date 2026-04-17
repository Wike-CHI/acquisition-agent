#!/usr/bin/env python3
"""
autoresearch eval runner - 运行技能评估测试
"""

import json
import re
import sys
from pathlib import Path


def load_eval(eval_path):
    """加载 eval.json"""
    with open(eval_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def evaluate_rule(response, eval_item):
    """评估 rule-based 规则"""
    rule = eval_item.get('rule')
    pattern = eval_item.get('pattern', [])
    text = response.lower()
    
    if rule == 'contains':
        patterns = pattern if isinstance(pattern, list) else [pattern]
        min_matches = eval_item.get('min_matches', 1)
        matches = sum(1 for p in patterns if p.lower() in text)
        return matches >= min_matches
    
    elif rule == 'regex':
        regex_pattern = eval_item.get('pattern', '')
        max_matches = eval_item.get('max_matches', float('inf'))
        matches = len(re.findall(regex_pattern, response, re.IGNORECASE))
        return matches <= max_matches
    
    elif rule == 'word_count':
        min_words = eval_item.get('min', 0)
        max_words = eval_item.get('max', float('inf'))
        word_count = len(response.split())
        return min_words <= word_count <= max_words
    
    return False


def evaluate_llm(response, eval_item):
    """
    评估 LLM-as-judge 问题
    TODO: 实现LLM评估
    目前返回True作为占位符
    """
    # TODO: 调用LLM进行评估
    print(f"  [LLM eval] {eval_item.get('name')}: {eval_item.get('question')}")
    return True  # 占位符


def run_eval(skill_name, skill_response, eval_path):
    """运行单个技能的eval"""
    eval_data = load_eval(eval_path)
    evals = eval_data.get('evals', [])
    
    results = {
        'skill': skill_name,
        'total_evals': len(evals),
        'passed': 0,
        'failed': 0,
        'details': []
    }
    
    for eval_item in evals:
        name = eval_item.get('name')
        eval_type = eval_item.get('type')
        
        if eval_type == 'rule':
            passed = evaluate_rule(skill_response, eval_item)
        elif eval_type == 'llm':
            passed = evaluate_llm(skill_response, eval_item)
        else:
            passed = False
        
        if passed:
            results['passed'] += 1
        else:
            results['failed'] += 1
        
        results['details'].append({
            'name': name,
            'type': eval_type,
            'passed': passed
        })
    
    results['pass_rate'] = results['passed'] / results['total_evals'] if results['total_evals'] > 0 else 0
    
    return results


def main():
    if len(sys.argv) < 3:
        print("Usage: python run_eval.py --skill <skill_name> --evals <eval.json>")
        sys.exit(1)
    
    skill_name = None
    eval_path = None
    
    args = sys.argv[1:]
    for i in range(0, len(args), 2):
        if args[i] == '--skill':
            skill_name = args[i+1]
        elif args[i] == '--evals':
            eval_path = args[i+1]
    
    if not skill_name or not eval_path:
        print("Error: Missing required arguments")
        sys.exit(1)
    
    # 读取实际的 SKILL.md 内容
    skill_path = Path(f"skills/{skill_name}/SKILL.md")
    if skill_path.exists():
        with open(skill_path, 'r', encoding='utf-8') as f:
            skill_response = f.read()
    else:
        print(f"Error: Skill file not found: {skill_path}")
        sys.exit(1)
    
    results = run_eval(skill_name, skill_response, eval_path)
    
    print(f"\n{'='*50}")
    print(f"Evaluation Results for: {skill_name}")
    print(f"{'='*50}")
    print(f"Total Evals: {results['total_evals']}")
    print(f"Passed: {results['passed']}")
    print(f"Failed: {results['failed']}")
    print(f"Pass Rate: {results['pass_rate']*100:.1f}%")
    print(f"{'='*50}\n")
    
    for detail in results['details']:
        status = "✅" if detail['passed'] else "❌"
        print(f"{status} {detail['name']} ({detail['type']})")


if __name__ == '__main__':
    main()
