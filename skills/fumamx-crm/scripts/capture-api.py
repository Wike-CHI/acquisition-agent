"""
孚盟 MX API 流量捕获工具
通过 Chrome CDP Network 域监听所有孚盟内部 API 请求。
输出结构化 JSON，供后续 MCP Server 构建。

用法:
  1. Chrome 开启远程调试: chrome.exe --remote-debugging-port=9222
  2. 在 Chrome 中登录 https://fumamx.com/#/login
  3. python capture-api.py
  4. 操作孚盟各个模块（查客户、建报价单、发邮件...）
  5. Ctrl+C 停止，自动保存到 captured-apis.json

依赖: pip install websocket-client
"""

import json
import re
import sys
import time
import signal
import threading
from datetime import datetime, timezone
from urllib.request import urlopen
from urllib.error import URLError

import websocket

# ─── 配置 ────────────────────────────────────────────
CDP_HOST = "127.0.0.1"
CDP_PORT = 9222
TARGET_DOMAIN = "fumamx.com"
OUTPUT_FILE = "captured-apis.json"
SKIP_EXTENSIONS = (
    ".js", ".css", ".png", ".jpg", ".jpeg", ".gif", ".svg",
    ".ico", ".woff", ".woff2", ".ttf", ".map", ".mp4", ".webm",
)

# ─── 全局状态 ────────────────────────────────────────
captured: list[dict] = []
pending: dict[str, dict] = {}           # requestId -> entry
body_requests: dict[int, str] = {}      # cmdId -> requestId
running = True
cmd_seq = 0
wsa: websocket.WebSocketApp | None = None


def next_cmd_id() -> int:
    global cmd_seq
    cmd_seq += 1
    return cmd_seq


def get_tabs() -> list[dict]:
    try:
        with urlopen(f"http://{CDP_HOST}:{CDP_PORT}/json") as resp:
            return json.loads(resp.read())
    except URLError as e:
        print(f"[FATAL] 无法连接 Chrome 调试端口 {CDP_PORT}")
        print(f"  启动: chrome.exe --remote-debugging-port={CDP_PORT}")
        print(f"  错误: {e}")
        sys.exit(1)


def find_fumamx_tab(tabs: list[dict]) -> dict | None:
    for t in tabs:
        if TARGET_DOMAIN in t.get("url", ""):
            return t
    return None


def cdp(method: str, params: dict | None = None):
    """发送 CDP 命令"""
    if wsa is None:
        return
    cid = next_cmd_id()
    msg = {"id": cid, "method": method}
    if params:
        msg["params"] = params
    wsa.send(json.dumps(msg))
    return cid


def should_capture(url: str) -> bool:
    if TARGET_DOMAIN not in url:
        return False
    if url.startswith("ws"):
        return False
    lower = url.lower()
    for ext in SKIP_EXTENSIONS:
        if ext in lower:
            return False
    return True


def normalize_url(url: str) -> str:
    """去除 URL 中的动态参数（ID/UUID）用于分组"""
    u = re.sub(r'/[0-9a-f]{8,}', '/{id}', url)
    u = re.sub(r'/\d{6,}', '/{id}', u)
    u = re.sub(r'/\d{4}-\d{2}-\d{2}', '/{date}', u)
    return u


def on_message(_ws, raw: str):
    global captured, pending, body_requests

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        return

    msg_id = data.get("id")
    method = data.get("method", "")
    params = data.get("params", {})

    # ─── 命令响应（包含 id，不含 method）───
    if msg_id is not None and not method:
        result = data.get("result", {})
        # getResponseBody 响应
        if msg_id in body_requests:
            req_id = body_requests.pop(msg_id)
            body = result.get("body", "")
            base64 = result.get("base64Encoded", False)
            if req_id in pending and body:
                entry = pending[req_id]
                if entry.get("response"):
                    if len(body) < 200_000:
                        entry["response"]["body"] = body if not base64 else f"[base64:{len(body)}]"
                    else:
                        entry["response"]["body"] = f"[TRUNCATED:{len(body)}]"
                print(f"      Body: {len(body)} bytes")
        return

    # ─── Network.requestWillBeSent ─────────
    if method == "Network.requestWillBeSent":
        req = params.get("request", {})
        url = req.get("url", "")
        if not should_capture(url):
            return

        request_id = params.get("requestId", "")
        post_data = req.get("postData", "")
        m = req.get("method", "GET")

        entry = {
            "requestId": request_id,
            "url": url,
            "method": m,
            "headers": req.get("headers", {}),
            "postData": post_data,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "response": None,
        }
        pending[request_id] = entry

        print(f"[REQ] {m} {url[:120]}")
        if post_data:
            try:
                body = json.loads(post_data)
                print(f"      Body: {json.dumps(body, ensure_ascii=False)[:300]}")
            except (json.JSONDecodeError, TypeError):
                print(f"      Body: {post_data[:300]}")

    # ─── Network.responseReceived ──────────
    elif method == "Network.responseReceived":
        req_id = params.get("requestId", "")
        if req_id not in pending:
            return

        resp = params.get("response", {})
        status = resp.get("status", 0)
        headers = resp.get("headers", {})
        ct = headers.get("content-type", headers.get("Content-Type", ""))
        mime = resp.get("mimeType", "")

        pending[req_id]["response"] = {
            "status": status,
            "statusText": resp.get("statusText", ""),
            "headers": dict(headers),
            "contentType": ct,
            "mimeType": mime,
            "encodedDataLength": resp.get("encodedDataLength", 0),
            "body": None,
        }
        print(f"[RES] {status} {pending[req_id]['url'][:100]}")

    # ─── Network.loadingFinished ───────────
    elif method == "Network.loadingFinished":
        req_id = params.get("requestId", "")
        if req_id not in pending:
            return

        entry = pending[req_id]
        resp = entry.get("response")

        # 尝试获取文本类型的响应体
        if resp:
            ct = (resp.get("contentType") or "").lower()
            mime = (resp.get("mimeType") or "").lower()
            is_text = any(t in ct or t in mime for t in
                          ["json", "xml", "text", "html", "javascript", "x-www-form-urlencoded"])
            if is_text:
                cid = cdp("Network.getResponseBody", {"requestId": req_id})
                if cid is not None:
                    body_requests[cid] = req_id

        # 完成并归档
        pending.pop(req_id, None)
        captured.append(entry)


def on_error(_ws, err):
    if "Connection refused" not in str(err):
        print(f"[CDP ERR] {err}")


def on_close(_ws, code, _msg):
    global running
    print(f"[CDP] 连接关闭 (code={code})")
    running = False


def on_open(_ws):
    print("[CDP] 已连接，启用 Network 域...")
    cdp("Network.enable", {
        "maxTotalBufferSize": 100_000_000,
        "maxResourceBufferSize": 50_000_000,
    })
    print("\n[READY] 监听孚盟 API 流量中...")
    print("  操作孚盟各模块，完成后按 Ctrl+C\n")
    print("=" * 60)


def save():
    if not captured:
        print("\n[WARN] 未捕获到 API 请求")
        return

    endpoints: dict[str, list[dict]] = {}
    for req in captured:
        nu = normalize_url(req["url"])
        endpoints.setdefault(nu, []).append(req)

    output = {
        "capturedAt": datetime.now(timezone.utc).isoformat(),
        "targetDomain": TARGET_DOMAIN,
        "totalRequests": len(captured),
        "uniqueEndpoints": len(endpoints),
        "requests": captured,
        "endpoints": {
            url: {
                "methods": list(set(r["method"] for r in reqs)),
                "count": len(reqs),
                "firstSeen": reqs[0]["timestamp"],
                "examples": [
                    {"method": r["method"], "url": r["url"], "postData": r["postData"],
                     "responseStatus": (r.get("response") or {}).get("status"),
                     "responseBody": (r.get("response") or {}).get("body", "")[:3000]}
                    for r in reqs[:5]
                ],
            }
            for url, reqs in sorted(endpoints.items())
        },
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n[OK] 捕获 {len(captured)} 个请求, {len(endpoints)} 个唯一端点 → {OUTPUT_FILE}")
    print("\n端点一览:")
    for url, info in output["endpoints"].items():
        methods = ",".join(info["methods"])
        first_resp = next((r for r in info["examples"] if r.get("responseStatus")), info["examples"][0])
        print(f"  {methods:6s} | {info['count']:3d}x | {first_resp.get('responseStatus','?'):3d} | {url}")


def sig_handler(_sig, _frame):
    global running
    print("\n\n[STOP] 捕获停止中...")
    running = False


def main():
    global wsa, running

    signal.signal(signal.SIGINT, sig_handler)

    tabs = get_tabs()
    fumamx_tab = find_fumamx_tab(tabs)

    if not fumamx_tab:
        print("[WARN] 未找到孚盟标签页。当前标签页:")
        for i, t in enumerate(tabs):
            print(f"  [{i}] {t.get('title','?')[:60]}")
        print(f"\n请先在 Chrome 中打开 https://fumamx.com/#/login 并登录")
        sys.exit(0)

    ws_url = fumamx_tab.get("webSocketDebuggerUrl", "")
    if not ws_url:
        print("[FATAL] 无法获取 CDP WebSocket URL")
        sys.exit(1)

    print(f"[TAB] {fumamx_tab.get('title','?')[:60]}")
    print(f"[CDP] 连接 {ws_url[:80]}...")

    wsa = websocket.WebSocketApp(
        ws_url,
        on_open=on_open,
        on_message=on_message,
        on_error=on_error,
        on_close=on_close,
    )

    t = threading.Thread(target=wsa.run_forever, daemon=True)
    t.start()

    while running:
        time.sleep(0.3)

    if wsa:
        wsa.close()
    save()


if __name__ == "__main__":
    main()
