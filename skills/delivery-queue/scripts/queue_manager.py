#!/usr/bin/env python3
"""
消息队列管理脚本 - 红龙获客系统

功能：
  1. 管理消息发送队列（邮件/WhatsApp 双通道）
  2. 模拟真人发送节奏（间隔控制）
  3. 支持定时发送、Drip Campaign
  4. 频率限制（防止垃圾标记）

使用方法：
  # 添加消息到队列
  python queue_manager.py add --channel email --to "john@example.com" --subject "Hello" --body "Hi John, ..."

  # 添加 WhatsApp 消息
  python queue_manager.py add --channel whatsapp --to "+1234567890" --body "Hi John, ..."

  # 查看队列状态
  python queue_manager.py status

  # 处理待发送消息（按节奏发送）
  python queue_manager.py process [--dry-run]

  # 取消消息
  python queue_manager.py cancel --id msg_xxx

  # 清空已发送消息
  python queue_manager.py clean

队列存储：JSON 文件（~/.workbuddy/delivery_queue/queue.json）

依赖：Python 3.8+ 标准库（无第三方依赖）
"""

import json
import sys
import argparse
import uuid
import time
import random
from pathlib import Path
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional


# ============================================================
# 默认配置
# ============================================================

DEFAULT_CONFIG = {
    "interval_email": 300,        # 邮件间隔（秒）
    "interval_whatsapp": 180,     # WhatsApp 间隔（秒）
    "max_per_hour": 5,            # 每小时最多发送
    "max_per_day": 30,            # 每天最多发送
    "max_segment_chars_email": 200,  # 邮件每段最大字符数
    "max_segment_chars_whatsapp": 300,  # WhatsApp 每段最大字符数
    "whatsapp_max_consecutive": 3,  # WhatsApp 连续发送上限
    "retry_max": 3,               # 最大重试次数
    "retry_intervals": [30, 60, 120],  # 重试间隔（秒）
    "quiet_hours_start": 22,      # 静默时段开始（本地时间）
    "quiet_hours_end": 8,         # 静默时段结束（本地时间）
}

QUEUE_DIR = Path.home() / ".workbuddy" / "delivery_queue"
QUEUE_FILE = QUEUE_DIR / "queue.json"


# ============================================================
# 队列存储
# ============================================================

def load_queue() -> Dict[str, Any]:
    """加载队列数据"""
    if not QUEUE_FILE.exists():
        QUEUE_DIR.mkdir(parents=True, exist_ok=True)
        return {
            "messages": [],
            "config": DEFAULT_CONFIG,
            "stats": {
                "total_sent": 0,
                "total_failed": 0,
                "created_at": datetime.now().isoformat(),
            },
        }

    with open(QUEUE_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def save_queue(queue: Dict[str, Any]):
    """保存队列数据"""
    QUEUE_DIR.mkdir(parents=True, exist_ok=True)
    with open(QUEUE_FILE, "w", encoding="utf-8") as f:
        json.dump(queue, f, ensure_ascii=False, indent=2)


# ============================================================
# 消息操作
# ============================================================

def add_message(
    queue: Dict[str, Any],
    channel: str,
    to: str,
    body: str,
    subject: str = "",
    scheduled_at: str = "",
    priority: int = 5,
    metadata: Dict[str, Any] = None,
) -> Dict[str, Any]:
    """添加消息到队列"""

    msg_id = f"msg_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:6]}"

    message = {
        "id": msg_id,
        "channel": channel,
        "to": to,
        "subject": subject,
        "body": body,
        "status": "pending",  # pending | sending | sent | failed | cancelled
        "priority": priority,  # 1-10, 1=最高
        "scheduled_at": scheduled_at,
        "created_at": datetime.now().isoformat(),
        "sent_at": None,
        "retry_count": 0,
        "error": None,
        "metadata": metadata or {},
    }

    queue["messages"].append(message)
    return message


def segment_message(body: str, max_chars: int, channel: str) -> List[str]:
    """
    将长消息分段
    - 按自然段落分割
    - 每段不超过 max_chars
    """
    if len(body) <= max_chars:
        return [body]

    segments = []
    # 按换行分割段落
    paragraphs = body.split("\n")

    current_segment = ""
    for para in paragraphs:
        if len(current_segment) + len(para) + 1 <= max_chars:
            current_segment += ("\n" if current_segment else "") + para
        else:
            if current_segment:
                segments.append(current_segment)
            # 如果单段落超长，强制分割
            if len(para) > max_chars:
                for i in range(0, len(para), max_chars):
                    segments.append(para[i:i + max_chars])
                current_segment = ""
            else:
                current_segment = para

    if current_segment:
        segments.append(current_segment)

    return segments


def get_pending_messages(queue: Dict[str, Any]) -> List[Dict[str, Any]]:
    """获取待发送消息（按优先级和计划时间排序）"""
    pending = [m for m in queue["messages"] if m["status"] == "pending"]

    # 按优先级排序（数字越小优先级越高）
    pending.sort(key=lambda m: (m["priority"], m["created_at"]))
    return pending


def get_rate_limit_status(queue: Dict[str, Any]) -> Dict[str, int]:
    """获取当前频率限制状态"""
    config = queue.get("config", DEFAULT_CONFIG)
    now = datetime.now()
    one_hour_ago = (now - timedelta(hours=1)).isoformat()
    today_start = now.replace(hour=0, minute=0, second=0).isoformat()

    recent_messages = [m for m in queue["messages"] if m["status"] in ("sent", "sending")]

    last_hour = sum(1 for m in recent_messages if m.get("sent_at", "") >= one_hour_ago)
    today = sum(1 for m in recent_messages if m.get("sent_at", "") >= today_start)

    # 最近一条消息的发送时间
    sent_times = sorted([m.get("sent_at", "") for m in recent_messages if m.get("sent_at")], reverse=True)
    last_sent = sent_times[0] if sent_times else None

    return {
        "last_hour": last_hour,
        "max_per_hour": config.get("max_per_hour", DEFAULT_CONFIG["max_per_hour"]),
        "today": today,
        "max_per_day": config.get("max_per_day", DEFAULT_CONFIG["max_per_day"]),
        "last_sent": last_sent,
        "can_send_now": last_hour < config.get("max_per_hour", DEFAULT_CONFIG["max_per_hour"])
                        and today < config.get("max_per_day", DEFAULT_CONFIG["max_per_day"]),
    }


# ============================================================
# 处理队列
# ============================================================

def process_queue(queue: Dict[str, Any], dry_run: bool = False) -> List[Dict[str, Any]]:
    """
    处理待发送消息
    dry_run=True 时只输出将要执行的操作，不实际发送
    """
    config = queue.get("config", DEFAULT_CONFIG)
    pending = get_pending_messages(queue)
    rate = get_rate_limit_status(queue)

    if not pending:
        print("📭 队列为空，无待发送消息。")
        return []

    print(f"📬 待发送消息: {len(pending)} 条")
    print(f"📊 频率状态: 今日已发 {rate['today']}/{rate['max_per_day']}，"
          f"近1小时 {rate['last_hour']}/{rate['max_per_hour']}")

    results = []
    now = datetime.now()

    for msg in pending:
        # 检查频率限制
        if rate["today"] >= rate["max_per_day"]:
            print(f"⚠️ 已达每日发送上限 ({rate['max_per_day']})，停止处理。")
            break
        if rate["last_hour"] >= rate["max_per_hour"]:
            print(f"⚠️ 已达每小时发送上限 ({rate['max_per_hour']})，停止处理。")
            break

        # 检查定时发送
        if msg.get("scheduled_at"):
            scheduled = datetime.fromisoformat(msg["scheduled_at"])
            if now < scheduled:
                print(f"⏰ [{msg['id']}] 计划于 {scheduled.strftime('%H:%M')} 发送，跳过。")
                continue

        # 检查静默时段
        if config.get("quiet_hours_start") and config.get("quiet_hours_end"):
            hour = now.hour
            qs = config["quiet_hours_start"]
            qe = config["quiet_hours_end"]
            if qs <= hour or hour < qe:
                next_send = now.replace(hour=qe, minute=0, second=0)
                if hour >= qs:
                    next_send += timedelta(days=1)
                print(f"🌙 静默时段 ({qs}:00-{qe}:00)，下次发送: {next_send.strftime('%m-%d %H:%M')}")
                break

        # 计算发送间隔
        channel = msg.get("channel", "email")
        if channel == "whatsapp":
            interval = config.get("interval_whatsapp", DEFAULT_CONFIG["interval_whatsapp"])
        else:
            interval = config.get("interval_email", DEFAULT_CONFIG["interval_email"])

        # 添加随机抖动（±20%）
        jitter = interval * random.uniform(-0.2, 0.2)
        actual_interval = max(60, interval + jitter)

        if dry_run:
            print(f"  📤 [DRY RUN] {msg['id']} → {msg['to']} ({channel})")
            print(f"     间隔: {actual_interval:.0f}s")
            results.append({"id": msg["id"], "action": "dry_run", "interval": actual_interval})
        else:
            # 实际发送模式：更新状态
            msg["status"] = "sending"
            msg["sent_at"] = now.isoformat()
            results.append({
                "id": msg["id"],
                "channel": channel,
                "to": msg["to"],
                "action": "send_command",
                "interval": actual_interval,
                # 由调用方（Agent）执行实际发送
                "send_hint": f"使用 {channel} 发送给 {msg['to']}",
            })
            rate["today"] += 1
            rate["last_hour"] += 1

    return results


# ============================================================
# CLI 命令
# ============================================================

def cmd_add(args):
    """添加消息到队列"""
    queue = load_queue()
    msg = add_message(
        queue=queue,
        channel=args.channel,
        to=args.to,
        body=args.body,
        subject=args.subject or "",
        scheduled_at=args.scheduled_at or "",
        priority=args.priority,
    )
    save_queue(queue)
    print(f"✅ 消息已添加到队列")
    print(f"   ID: {msg['id']}")
    print(f"   通道: {msg['channel']}")
    print(f"   收件人: {msg['to']}")
    if msg.get("scheduled_at"):
        print(f"   计划发送: {msg['scheduled_at']}")


def cmd_status(args):
    """查看队列状态"""
    queue = load_queue()
    messages = queue.get("messages", [])
    rate = get_rate_limit_status(queue)

    pending = [m for m in messages if m["status"] == "pending"]
    sent = [m for m in messages if m["status"] == "sent"]
    failed = [m for m in messages if m["status"] == "failed"]

    print(f"\n📋 队列状态")
    print(f"{'='*40}")
    print(f"  待发送: {len(pending)}")
    print(f"  已发送: {len(sent)}")
    print(f"  失败:   {len(failed)}")
    print(f"  总计:   {len(messages)}")
    print(f"\n📊 频率限制")
    print(f"  今日:   {rate['today']}/{rate['max_per_day']}")
    print(f"  近1h:   {rate['last_hour']}/{rate['max_per_hour']}")
    print(f"  可发送: {'✅ 是' if rate['can_send_now'] else '❌ 已达上限'}")

    if pending:
        print(f"\n📬 待发送消息:")
        for m in pending[:10]:  # 只显示前10条
            scheduled = f" ⏰{m['scheduled_at'][:16]}" if m.get("scheduled_at") else ""
            print(f"  [{m['id'][:20]}] {m['channel']} → {m['to'][:30]} P{m['priority']}{scheduled}")
        if len(pending) > 10:
            print(f"  ... 还有 {len(pending) - 10} 条")


def cmd_process(args):
    """处理队列"""
    queue = load_queue()
    results = process_queue(queue, dry_run=args.dry_run)

    if results and not args.dry_run:
        save_queue(queue)
        print(f"\n✅ 处理完成: {len(results)} 条消息")

        # 输出发送指令供 Agent 执行
        print(f"\n📡 发送指令:")
        for r in results:
            if r.get("send_hint"):
                print(f"  {r['send_hint']}")


def cmd_cancel(args):
    """取消消息"""
    queue = load_queue()
    found = False
    for m in queue["messages"]:
        if m["id"].startswith(args.id) and m["status"] == "pending":
            m["status"] = "cancelled"
            print(f"✅ 已取消: {m['id']} → {m['to']}")
            found = True
            break

    if not found:
        print(f"❌ 未找到匹配的待发送消息: {args.id}")
    else:
        save_queue(queue)


def cmd_clean(args):
    """清理已发送/已取消的消息"""
    queue = load_queue()
    before = len(queue["messages"])
    queue["messages"] = [
        m for m in queue["messages"]
        if m["status"] in ("pending", "sending", "failed")
    ]
    removed = before - len(queue["messages"])
    save_queue(queue)
    print(f"✅ 清理完成，移除 {removed} 条已完成消息")


def cmd_segment(args):
    """测试消息分段"""
    channel = args.channel
    max_chars = (
        DEFAULT_CONFIG["max_segment_chars_whatsapp"]
        if channel == "whatsapp"
        else DEFAULT_CONFIG["max_segment_chars_email"]
    )

    segments = segment_message(args.body, max_chars, channel)
    print(f"\n📝 消息分段结果（{channel}，每段最大 {max_chars} 字符）:")
    print(f"   原始长度: {len(args.body)} 字符")
    print(f"   分段数: {len(segments)}")
    for i, seg in enumerate(segments, 1):
        print(f"\n--- 第 {i} 段 ({len(seg)} 字符) ---")
        print(seg)


def main():
    parser = argparse.ArgumentParser(
        description="消息队列管理 - 红龙获客系统",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    subparsers = parser.add_subparsers(dest="command", help="命令")

    # add 命令
    add_parser = subparsers.add_parser("add", help="添加消息到队列")
    add_parser.add_argument("--channel", required=True, choices=["email", "whatsapp"], help="发送通道")
    add_parser.add_argument("--to", required=True, help="收件人")
    add_parser.add_argument("--body", required=True, help="消息内容")
    add_parser.add_argument("--subject", default="", help="邮件主题（仅 email）")
    add_parser.add_argument("--scheduled-at", default="", help="计划发送时间 (ISO 8601)")
    add_parser.add_argument("--priority", type=int, default=5, help="优先级 1-10（默认5）")

    # status 命令
    subparsers.add_parser("status", help="查看队列状态")

    # process 命令
    proc_parser = subparsers.add_parser("process", help="处理待发送消息")
    proc_parser.add_argument("--dry-run", action="store_true", help="只输出不实际发送")

    # cancel 命令
    cancel_parser = subparsers.add_parser("cancel", help="取消消息")
    cancel_parser.add_argument("--id", required=True, help="消息 ID（支持前缀匹配）")

    # clean 命令
    subparsers.add_parser("clean", help="清理已完成消息")

    # segment 命令
    seg_parser = subparsers.add_parser("segment", help="测试消息分段")
    seg_parser.add_argument("--channel", default="email", choices=["email", "whatsapp"])
    seg_parser.add_argument("--body", required=True, help="消息内容")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    commands = {
        "add": cmd_add,
        "status": cmd_status,
        "process": cmd_process,
        "cancel": cmd_cancel,
        "clean": cmd_clean,
        "segment": cmd_segment,
    }

    commands[args.command](args)


if __name__ == "__main__":
    main()
