#!/usr/bin/env python3
"""
transform.py — AI文本拟人化润色器
将 AI 文本转化为自然、人性化的表达

用法: python transform.py "需要润色的文本" [--target_score 8.5]
"""

import sys
import re
from detect import detect

# 润色规则：AI模式 → 人类表达
TRANSFORMATIONS = [
    # 简化开头
    (r"I hope this email finds you well[,\s]*", ""),
    (r"Thank you for taking the time to read this email[,\s]*", ""),
    (r"I am writing to inform you that[,\s]*", ""),
    (r"Please allow me to introduce myself[,\s]*", ""),
    (r"We are pleased to announce that[,\s]*", ""),
    (r"It has come to our attention that[,\s]*", ""),
    (r"With regard to[,\s]+", ""),
    (r"Regarding[,\s]+", "关于"),
    # 替换机械过渡词
    (r"\bFurthermore\b", "还有"),
    (r"\bMoreover\b", "还有"),
    (r"\bIn conclusion\b", "简单说"),
    (r"\bFirstly\b", "第一"),
    (r"\bSecondly\b", "第二"),
    (r"\bIn summary\b", "总结"),
    (r"\bTo summarize\b", "总结"),
    (r"\bOverall\b", "总体来看"),
    (r"\bAdditionally\b", "另外"),
    (r"\bConsequently\b", "所以"),
    (r"\bAs a result\b", "结果"),
    (r"\bIn order to\b", "为了"),
    (r"\bIt is worth noting that\b", ""),
    (r"\bIt should be noted that\b", ""),
    # 简化三段式
    (r"\bFirst[ly]?[,\s]+", ""),
    (r"\bSecond[ly]?[,\s]+", ""),
    (r"\bThird[ly]?[,\s]+", ""),
    # 打破完美列表
    (r"^\s*[-*•]\s+", "• ", ),
    # 简化结尾
    (r"I look forward to hearing from you[.\s]*$", "期待回复。", re.IGNORECASE),
    (r"Please do not hesitate to contact me[.\s]*$", "有问题随时联系。", re.IGNORECASE),
    (r"Thank you for your consideration[.\s]*$", "谢谢！", re.IGNORECASE),
    # 降低形容词强度
    (r"\bexceptional\b", "好的", re.IGNORECASE),
    (r"\boutstanding\b", "可靠的", re.IGNORECASE),
    (r"\bremarkable\b", "不错的", re.IGNORECASE),
    (r"\bunparalleled\b", "领先的", re.IGNORECASE),
    (r"\bsuperior\b", "好的", re.IGNORECASE),
    (r"\bcutting-edge\b", "新的", re.IGNORECASE),
    (r"\brevolutionary\b", "创新的", re.IGNORECASE),
    (r"\binnovative\b", "实用的", re.IGNORECASE),
    (r"\bworld-class\b", "专业的", re.IGNORECASE),
    (r"\bindustry-leading\b", "行业领先的", re.IGNORECASE),
    # 删除冗余
    (r"\s{2,}", " "),
    (r"，{2,}", "，"),
    (r"。{2,}", "。"),
]


def transform(text: str, target_score: float = 8.5) -> str:
    """对文本进行拟人化润色"""
    current_score = detect(text)
    iterations = 0
    max_iterations = 5

    while current_score > target_score and iterations < max_iterations:
        original_text = text

        for pattern, replacement in TRANSFORMATIONS:
            if isinstance(pattern, str):
                text = re.sub(pattern, replacement, text)
            else:
                text = re.sub(pattern[0], pattern[1], text)

        # 句子长度变化（添加自然差异）
        sentences = re.split(r'([。.!?]+)', text)
        if len(sentences) >= 2:
            # 缩短第一个句子
            if len(sentences[0].split()) > 10:
                first_words = sentences[0].split()[:8]
                sentences[0] = " ".join(first_words)

        text = "".join(sentences)

        # 删除空括号内容
        text = re.sub(r'\([^)]*\)', '', text)
        text = re.sub(r'\s+', ' ', text).strip()

        current_score = detect(text)
        iterations += 1

        # 无变化则停止
        if text == original_text:
            break

    return text


def main():
    target_score = 8.5

    # 解析参数
    args = sys.argv[1:]
    target_arg = None
    text_parts = []
    i = 0
    while i < len(args):
        if args[i] == "--target_score" and i + 1 < len(args):
            target_arg = float(args[i + 1])
            i += 2
        else:
            text_parts.append(args[i])
            i += 1

    if text_parts:
        text = " ".join(text_parts)
    else:
        print("用法: python transform.py \"需要润色的文本\" [--target_score 8.5]")
        sys.exit(1)

    if target_arg is not None:
        target_score = target_arg

    original_score = detect(text)
    print(f"原始 AI Score: {original_score:.1f} / 10.0")

    result = transform(text, target_score)
    final_score = detect(result)

    print(f"\n润色后 AI Score: {final_score:.1f} / 10.0")
    print(f"AI密度降低: {(original_score - final_score):.1f} 分")
    print(f"\n润色结果:\n{result}")

    if final_score < 2.0:
        print("\n✅ 润色成功！AI密度 < 2%")
    elif final_score < 8.5:
        print("\n✅ 润色完成，AI密度已降至可接受范围")
    else:
        print("\n⚠️ 建议人工审核润色结果")


if __name__ == "__main__":
    main()