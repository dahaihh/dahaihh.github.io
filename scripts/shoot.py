#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""对 dist 构建产物做真实渲染截图（视觉验收用）。

用法：
    npm run shoot                        # 全套页面，整页长图
    npm run shoot -- --pages / /about/   # 只截指定页
    npm run shoot -- --fold 900          # 只截首屏（不注入 css，保持真实粘性页脚）
    npm run shoot -- --widths 1280 390   # 多宽度

四个必须知道的坑（都是实测踩出来的）：

1) 为什么用本地 HTTP 而不是 file://
   Astro 产物引用绝对路径（/_astro/x.css）。file:// 下 `/` 指向文件系统根，
   CSS/图片全 404，必须先内联 CSS 才能看样式，且站内跳转失效。
   起一次性本地服务最忠实。**服务与 Chrome 必须在同一次 shell 调用内**
   （沙箱后台进程不跨调用存活）——本脚本把服务放在进程内线程，天然满足。

2) 绝不要给 Chrome 传 --user-data-dir
   传了会**永久挂起**，然后撞调用超时被 SIGTERM/SIGKILL 清掉（退出码 137/143），
   极易误判成"本机无头 Chrome 跑不通"。Chrome 与 Edge 都如此，全新目录也一样。

3) 整页长图要先中和粘性页脚
   本站 body 是 `min-height:100vh` + flex column，页脚被推到视口底部。
   视口给多高，页脚就掉到多低，底部"空白"裁不掉（那其实是页脚）。
   故整页模式会注入 `html,body{min-height:0}`，让页脚紧跟正文，再裁尾部纯空白。

4) 端口要开 reuse
   上一次运行的 socket 处于 TIME_WAIT，第二次起不来（Errno 48）。
"""

import argparse
import functools
import io
import os
import socketserver
import subprocess
import sys
import threading
import time
import http.server

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# 一套默认页面：path → 用于文件名的 slug
PAGES = {
    "home": "/",
    "posts": "/posts/",
    "series": "/series/",
    "about": "/about/",
    "contact": "/contact/",
}

# 整页模式的正交化补丁：拿掉 100vh 撑高，页脚即紧跟正文
DEFLEX = (b"<style data-shoot-deck>html,body{min-height:0!important}"
          b".site-footer{margin-top:0!important}</style>")


class _Handler(http.server.SimpleHTTPRequestHandler):
    """把 html 里的 </head> 前面插一段样式，其余原样返回。"""

    deflex = False

    def log_message(self, *args):
        pass

    def send_head(self):
        path = self.translate_path(self.path)
        if os.path.isdir(path):
            path = os.path.join(path, "index.html")
        if self.deflex and path.endswith(".html") and os.path.isfile(path):
            with open(path, "rb") as f:
                body = f.read()
            if DEFLEX not in body:
                body = body.replace(b"</head>", DEFLEX + b"</head>", 1)
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            return io.BytesIO(body)
        return super().send_head()


class _Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True       # 坑 4
    daemon_threads = True


def serve(directory, port, deflex):
    handler_cls = type("Handler", (_Handler,), {"deflex": deflex})
    handler = functools.partial(handler_cls, directory=directory)
    srv = _Server(("127.0.0.1", port), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv


def crop_trailing_blank(path, tol=8):
    """裁掉底部纯空白行。

    判据：一"行"内像素极差 ≤ tol 即视为空白。页脚含文字链接，行内极差极大，
    不会被误裁；只有真正无内容的尾部留白会被切掉。
    """
    try:
        import numpy as np
        from PIL import Image
    except ImportError:
        return None
    im = Image.open(path).convert("RGB")
    a = np.asarray(im)
    rng = a.max(axis=(1, 2)) - a.min(axis=(1, 2))
    idx = np.nonzero(rng > tol)[0]
    if len(idx) == 0:
        return None
    bottom = int(idx[-1]) + 1
    if bottom >= im.height - 2:
        return None
    im.crop((0, 0, im.width, bottom)).save(path)
    return bottom


def shoot(url, out, w, h, dsf, timeout):
    args = [
        CHROME, "--headless=new", "--disable-gpu", "--no-sandbox",
        "--no-proxy-server", "--hide-scrollbars",
        f"--force-device-scale-factor={dsf}",
        f"--window-size={w},{h}",
        f"--screenshot={out}", url,
    ]
    t0 = time.time()
    subprocess.run(args, capture_output=True, timeout=timeout)
    if not os.path.exists(out):
        return False, time.time() - t0, 0
    return True, time.time() - t0, os.path.getsize(out)


def label_of(w):
    return "desktop" if w >= 1024 else ("tablet" if w >= 700 else "mobile")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dist", default="dist")
    ap.add_argument("--out", default="/tmp/shots")
    ap.add_argument("--pages", nargs="*", help="要截的路径；也可写 slug，如 home series")
    ap.add_argument("--widths", nargs="*", type=int, default=[1280],
                    help="宽度列表，默认 1280")
    ap.add_argument("--fold", type=int, default=0,
                    help="只截首屏 N px（不注入样式，保留真实粘性页脚）")
    ap.add_argument("--height", type=int, default=4000, help="整页模式的抓取高度上限")
    ap.add_argument("--dsf", type=float, default=1.0, help="device scale factor，2 = 视网膜")
    ap.add_argument("--port", type=int, default=8877)
    ap.add_argument("--no-crop", action="store_true")
    ap.add_argument("--timeout", type=int, default=90)
    args = ap.parse_args()

    if not os.path.isdir(args.dist):
        sys.exit(f"找不到构建产物目录：{args.dist}（先跑 npm run build）")

    os.makedirs(args.out, exist_ok=True)
    fullpage = args.fold == 0
    srv = serve(args.dist, args.port, deflex=fullpage)

    if args.pages:
        jobs = []
        for p in args.pages:
            slug = PAGES.get(p) and p or (os.path.basename(p.rstrip("/")) or "home")
            path = PAGES.get(p, p)
            if not path.startswith("/"):
                path = "/" + path
            jobs.append((slug, path))
    else:
        jobs = list(PAGES.items())

    mode = f"整页（注入 min-height:0，裁尾部空白）" if fullpage else f"首屏 {args.fold}px（真实粘性页脚）"
    print(f"服务 {args.dist} @ 127.0.0.1:{args.port} · {mode}\n输出 → {args.out}\n")

    failures = 0
    total = len(jobs) * len(args.widths)
    for name, path in jobs:
        for w in args.widths:
            h = args.fold or args.height
            out = os.path.join(args.out, f"{name}-{label_of(w)}.png")
            ok, dt, size = shoot(f"http://127.0.0.1:{args.port}{path}", out, w, h, args.dsf, args.timeout)
            if not ok:
                failures += 1
                print(f"  ✗  {name:9s} {w}x{h}  {dt:5.1f}s  未生成")
                continue
            note = ""
            if fullpage and not args.no_crop:
                cropped = crop_trailing_blank(out)
                if cropped:
                    size = os.path.getsize(out)
                    note = f"  → 裁至 {cropped}px 高"
            print(f"  ✓  {name:9s} {w}x{h}  {dt:5.1f}s  {size // 1024} KB{note}")

    srv.shutdown()
    srv.server_close()
    print(f"\n完成 {total - failures}/{total}" + (f"，{failures} 张失败" if failures else ""))
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
