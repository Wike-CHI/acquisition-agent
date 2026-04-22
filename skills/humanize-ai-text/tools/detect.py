#!/usr/bin/env python3
"""
detect.py — AI文本检测器
检测输入文本的 AI 特征，计算 AI 密度评分

用法: python detect.py "待检测的文本"
"""

import sys
import re


def detect(text: str) -> float:
    """计算文本的 AI Score (0-10)，分数越高 AI 味越重"""
    score = 0.0

    # 1. 机械过渡词检测
    mechanical_transitions = [
        "furthermore", "moreover", "in conclusion", "firstly", "secondly",
        "in summary", "to summarize", "overall", "in essence",
        "it is worth noting", "it should be noted", "additionally",
        "consequently", "as a result", "in order to",
    ]
    for word in mechanical_transitions:
        if word.lower() in text.lower():
            score += 1.5

    # 2. 过度格式化检测（过多列表项）
    bullet_count = len(re.findall(r'^\s*[-*•]\s', text, re.MULTILINE))
    numbered_count = len(re.findall(r'^\s*\d+\.\s', text, re.MULTILINE))
    if bullet_count + numbered_count >= 5:
        score += 1.5
    elif bullet_count + numbered_count >= 3:
        score += 0.8

    # 3. 对称句子结构（过多平行结构）
    sentences = re.split(r'[.!?]+', text)
    symmetric_count = 0
    for s in sentences:
        s = s.strip()
        if not s:
            continue
        clauses = re.split(r',\s*', s)
        if len(clauses) >= 3:
            # 检查是否有相同长度的子句（对称暗示 AI）
            lengths = [len(c.split()) for c in clauses]
            if lengths and max(lengths) - min(lengths) <= 2 and len(lengths) >= 3:
                symmetric_count += 1
    if symmetric_count >= 2:
        score += 1.5

    # 4. 正式开头语检测
    formal_openings = [
        r'^I hope this email finds you well',
        r'^Thank you for your time',
        r'^I am writing to inform',
        r'^Please allow me to introduce',
        r'^We are pleased to announce',
        r'^It has come to our attention',
        r'^With regard to',
        r'^Regarding',
    ]
    for pattern in formal_openings:
        if re.search(pattern, text, re.IGNORECASE):
            score += 1.5

    # 5. 过度正面形容词
    superlatives = [
        r'\b(exceptional|outstanding|remarkable|unparalleled|superior)\b',
        r'\b(cutting-edge|revolutionary|innovative)\b',
        r'\b(first-class|world-class|industry-leading)\b',
    ]
    superlative_count = sum(len(re.findall(p, text, re.IGNORECASE)) for p in superlatives)
    score += min(superlative_count * 0.5, 1.5)

    # 6. 关键词重复检测（同一关键词出现≥3次）
    words = re.findall(r'\b[a-zA-Z]{4,}\b', text.lower())
    word_counts: dict[str, int] = {}
    for w in words:
        word_counts[w] = word_counts.get(w, 0) + 1
    repeated = [w for w, c in word_counts.items() if c >= 3 and w not in [
        'this', 'that', 'have', 'with', 'from', 'your', 'will', 'been',
    ]]
    if repeated:
        score += 1.0

    # 7. 三段式结构检测（首先/其次/最后）
    structure_patterns = [
        r'\b(first|首先)\b.*\b(second|其次)\b.*\b(third|最后|此外)\b',
        r'\b(firstly|secondly|finally)\b',
        r'\b(on the one hand|on the other hand)\b',
    ]
    for pattern in structure_patterns:
        if re.search(pattern, text, re.IGNORECASE):
            score += 1.5

    # 8. 缺少自然变化（句子长度过于一致）
    sentence_lens = [len(s.split()) for s in sentences if s.strip()]
    if sentence_lens and len(sentence_lens) >= 3:
        avg_len = sum(sentence_lens) / len(sentence_lens)
        variance = sum((l - avg_len) ** 2 for l in sentence_lens) / len(sentence_lens)
        if variance < 5:
            score += 1.0

    # 9. 过度使用被动语态
    passive_count = len(re.findall(r'\b(is|are|was|were)\s+\w+ed\b', text))
    if passive_count >= 3:
        score += 1.0

    return min(score, 10.0)


def main():
    if len(sys.argv) < 2:
        print("用法: python detect.py \"待检测的文本\"")
        sys.exit(1)

    text = " ".join(sys.argv[1:])

    score = detect(text)
    ai_density = (score / 10.0) * 100

    judgment = "PASS" if score < 8.5 else "NEED_HUMANIZE"

    print(f"AI Score: {score:.1f} / 10.0")
    print(f"AI密度: {ai_density:.2f}%")
    print(f"判断: {judgment}")

    if score >= 8.5:
        print("\n⚠️ AI密度较高，建议调用 transform.py 进行润色")
        sys.exit(1)
    else:
        print("\n✅ AI密度可接受，无需润色")
        sys.exit(0)


if __name__ == "__main__":
    main()