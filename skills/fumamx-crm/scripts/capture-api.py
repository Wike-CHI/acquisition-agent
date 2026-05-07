"""
孚盟 MX API 流量捕获工具 v2
通过 Chrome DevToolsActivePort 直连 CDP WebSocket，捕获所有内部 API 请求。

用法:
  python scripts/capture-api.py

前置:
  1. Chrome 已启动（无需 --remote-debugging-port，通过 DevToolsActivePort 发现）
  2. Chrome 中已打开 https://fumamx.com 并登录
  3. 运行后操作孚盟各模块，Ctrl+C 停止

依赖: websockets (browser-harness 已安装) + pip install aiofiles
"""

import asyncio
import json
import os
import re
import signal
import sys
from datetime import datetime, timezone
from pathlib import Path

import websockets

# ─── 配置 ────────────────────────────────────────────
TARGET_DOMAIN = "fumamx.com"
OUTPUT_FILE = "captured-apis.json"
SKIP_PATH_PATTERNS = (
    ".js", ".css", ".png", ".jpg", ".jpeg", ".gif", ".svg",
    ".ico", ".woff", ".woff2", ".ttf", ".map", ".mp4", ".webm",
    "hot-update",
)


def get_ws_url() -> str:
    """从 DevToolsActivePort 读取 Chrome CDP 地址"""
    profiles = [
        Path.home() / "AppData/Local/Google/Chrome/User Data",
        Path.home() / "AppData/Local/Microsoft/Edge/User Data",
        Path.home() / "AppData/Local/Chromium/User Data",
        Path.home() / "AppData/Local/Microsoft/Edge Beta/User Data",
        Path.home() / "AppData/Local/Microsoft/Edge Dev/User Data",
    ]
    for profile in profiles:
        dtap = profile / "DevToolsActivePort"
        if dtap.exists():
            port, path = dtap.read_text().strip().split("\n", 1)
            return f"ws://127.0.0.1:{port.strip()}{path.strip()}"

    # fallback: 直接探测常用端口
    import urllib.request
    for port in (9222, 9223):
        try:
            with urllib.request.urlopen(f"http://127.0.0.1:{port}/json/version", timeout=1) as r:
                return json.loads(r.read())["webSocketDebuggerUrl"]
        except Exception:
            continue
    raise RuntimeError("无法找到 Chrome CDP。请确认 Chrome 已启动")


def should_capture(url: str) -> bool:
    if TARGET_DOMAIN not in url:
        return False
    if url.startswith("ws"):
        return False
    lower = url.lower()
    if any(p in lower for p in SKIP_PATH_PATTERNS):
        return False
    return True


def normalize_url(url: str) -> str:
    u = re.sub(r'/[0-9a-f]{8,}', '/{id}', url)
    u = re.sub(r'/\d{6,}', '/{id}', u)
    u = re.sub(r'/\d{4}-\d{2}-\d{2}', '/{date}', u)
    return u


class CaptureSession:
    def __init__(self):
        self.browser_ws = None  # type: websockets.ClientConnection
        self.session_id: str | None = None
        self.captured: list[dict] = []
        self.pending: dict[str, dict] = {}
        self.running = True
        self.cmd_seq = 0

    def next_id(self) -> int:
        self.cmd_seq += 1
        return self.cmd_seq

    async def browser_cdp(self, method: str, **params) -> dict:
        """发送 CDP 命令到 browser 级 WebSocket (带 sessionId)"""
        cid = self.next_id()
        msg = {"id": cid, "method": method, "params": params or {}}
        if self.session_id:
            msg["sessionId"] = self.session_id
        await self.browser_ws.send(json.dumps(msg))
        while True:
            raw = await self.browser_ws.recv()
            data = json.loads(raw)
            if data.get("id") == cid:
                if "error" in data:
                    print(f"[CDP ERROR] {method}: {data['error']}")
                return data.get("result", {})

    async def connect(self):
        browser_url = get_ws_url()
        print(f"[CDP] Browser: {browser_url[:80]}...")
        self.browser_ws = await websockets.connect(browser_url, max_size=50_000_000)

        # 找孚盟标签页
        targets = await self.browser_cdp("Target.getTargets")
        fumamx_target = None
        for t in targets.get("targetInfos", []):
            if t["type"] == "page" and TARGET_DOMAIN in t.get("url", ""):
                fumamx_target = t
                break

        if not fumamx_target:
            pages = [t for t in targets.get("targetInfos", []) if t["type"] == "page"]
            print(f"[WARN] 未找到孚盟标签页。当前 {len(pages)} 个页面:")
            for p in pages:
                print(f"  - {p.get('title','?')[:60]}")
            print(f"\n请打开 https://fumamx.com/#/login 并登录后重新运行")
            return False

        print(f"[OK] 找到孚盟: {fumamx_target.get('title','?')[:60]}")
        target_id = fumamx_target["targetId"]

        # Attach 到孚盟标签页
        result = await self.browser_cdp("Target.attachToTarget", targetId=target_id, flatten=True)
        self.session_id = result["sessionId"]
        print(f"[OK] Attached to session: {self.session_id[:30]}...")

        # 需要创建新的 WS 连接来接收 session events
        # Flatten 模式下事件通过 browser WS 发送，带 session_id 字段
        # 不用另外 connect

        # 启用 Network (sessionId 由 browser_cdp 自动附加)
        await self.browser_cdp(
            "Network.enable",
            maxTotalBufferSize=100_000_000,
            maxResourceBufferSize=50_000_000,
        )
        print("[OK] Network enabled on Fumeng session")
        return True

    async def capture_loop(self):
        """持续监听 browser WS 的事件"""
        while self.running:
            try:
                raw = await asyncio.wait_for(self.browser_ws.recv(), timeout=0.5)
            except asyncio.TimeoutError:
                continue
            except websockets.ConnectionClosed:
                print("[CDP] Connection closed")
                break

            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                continue

            method = data.get("method", "")
            params = data.get("params", {})

            # 只关心 session 内的 Network 事件
            req_id = params.get("requestId", "")
            sid = data.get("sessionId", "")

            if method == "Network.requestWillBeSent":
                req = params.get("request", {})
                url = req.get("url", "")
                if not should_capture(url):
                    continue

                post_data = req.get("postData", "")
                m = req.get("method", "GET")
                entry = {
                    "requestId": req_id,
                    "url": url,
                    "method": m,
                    "headers": req.get("headers", {}),
                    "postData": post_data,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "response": None,
                }
                self.pending[req_id] = entry
                print(f"[REQ] {m} {url[:120]}")
                if post_data:
                    try:
                        body = json.loads(post_data)
                        print(f"      Body: {json.dumps(body, ensure_ascii=False)[:300]}")
                    except (json.JSONDecodeError, TypeError):
                        print(f"      Body: {post_data[:300]}")

            elif method == "Network.responseReceived":
                if req_id not in self.pending:
                    continue
                resp = params.get("response", {})
                status = resp.get("status", 0)
                headers = resp.get("headers", {})
                ct = headers.get("content-type", headers.get("Content-Type", ""))
                self.pending[req_id]["response"] = {
                    "status": status,
                    "statusText": resp.get("statusText", ""),
                    "headers": dict(headers),
                    "contentType": ct,
                    "mimeType": resp.get("mimeType", ""),
                    "body": None,
                }
                print(f"[RES] {status} {self.pending[req_id]['url'][:100]}")

            elif method == "Network.loadingFinished":
                if req_id not in self.pending:
                    continue
                entry = self.pending[req_id]
                resp = entry.get("response") or {}
                ct = (resp.get("contentType") or "").lower()
                mime = (resp.get("mimeType") or "").lower()
                is_text = any(t in ct or t in mime for t in
                              ["json", "xml", "text", "html", "javascript"])
                if is_text:
                    try:
                        body_result = await self.browser_cdp(
                            "Network.getResponseBody",
                            requestId=req_id,
                        )
                        body = body_result.get("body", "")
                        if body and len(body) < 200_000:
                            resp["body"] = body
                        elif body:
                            resp["body"] = f"[TRUNCATED:{len(body)}]"
                        print(f"      Body: {len(body or '')} bytes")
                    except Exception:
                        pass
                self.pending.pop(req_id, None)
                self.captured.append(entry)

            elif method == "Network.loadingFailed":
                if req_id in self.pending:
                    self.pending[req_id]["response"] = {
                        "status": 0,
                        "error": params.get("errorText", "Unknown"),
                    }
                    self.captured.append(self.pending.pop(req_id))
                    print(f"[FAIL] {params.get('errorText', '?')} {self.pending.get(req_id, {}).get('url', '?')[:100]}")


    def save(self):
        if not self.captured:
            print("\n[WARN] 未捕获到 API 请求")
            return

        endpoints: dict[str, list[dict]] = {}
        for req in self.captured:
            nu = normalize_url(req["url"])
            endpoints.setdefault(nu, []).append(req)

        output = {
            "capturedAt": datetime.now(timezone.utc).isoformat(),
            "targetDomain": TARGET_DOMAIN,
            "totalRequests": len(self.captured),
            "uniqueEndpoints": len(endpoints),
            "requests": self.captured,
            "endpoints": {
                url: {
                    "methods": list(set(r["method"] for r in reqs)),
                    "count": len(reqs),
                    "firstSeen": reqs[0]["timestamp"],
                    "examples": [
                        {
                            "method": r["method"],
                            "url": r["url"],
                            "postData": r["postData"],
                            "responseStatus": (r.get("response") or {}).get("status"),
                            "responseBody": (r.get("response") or {}).get("body", "")[:3000],
                        }
                        for r in reqs[:5]
                    ],
                }
                for url, reqs in sorted(endpoints.items())
            },
        }

        with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
            json.dump(output, f, ensure_ascii=False, indent=2)

        print(f"\n{'='*60}")
        print(f"[OK] 捕获 {len(self.captured)} 个请求, {len(endpoints)} 个唯一端点 → {OUTPUT_FILE}")
        print(f"\n端点一览:")
        for url, info in output["endpoints"].items():
            methods = ",".join(info["methods"])
            examples = info.get("examples", [])
            first_resp = next((r for r in examples if r.get("responseStatus")), None) or examples[0] if examples else {}
            print(f"  {methods:6s} | {info['count']:3d}x | {first_resp.get('responseStatus','?'):3d} | {url}")


async def main():
    session = CaptureSession()

    # 信号处理
    loop = asyncio.get_running_loop()
    stop_event = asyncio.Event()

    def signal_handler():
        print("\n[STOP] 停止捕获...")
        session.running = False
        stop_event.set()

    try:
        loop.add_signal_handler(signal.SIGINT, signal_handler)
    except NotImplementedError:
        # Windows 上使用 signal
        signal.signal(signal.SIGINT, lambda s, f: signal_handler())

    # 连接
    ok = await session.connect()
    if not ok:
        return

    print("\n[READY] 开始捕获孚盟 API 流量...")
    print("  在 Chrome 中操作孚盟（查客户、建报价单、发邮件...）")
    print("  按 Ctrl+C 停止\n")
    print("=" * 60)

    # 捕获循环
    await asyncio.gather(
        session.capture_loop(),
        stop_event.wait(),
        return_exceptions=True,
    )

    session.save()


if __name__ == "__main__":
    asyncio.run(main())
