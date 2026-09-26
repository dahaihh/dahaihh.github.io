# 大海学AI · 个人网站

「大海学AI」的官方网站：内容归档 + SEO 入口 + 公众号导流。
技术栈 **Astro（纯静态、默认零运行时 JS、原生 CSS + design tokens）**，无 Tailwind、无 UI 框架。

- 线上地址（部署后）：<https://dahaihh.github.io>
- 仓库：`git@github.com:dahaihh/dahaihh.github.io.git`
- 分支约定：源码在默认分支 `master`；`hexo` 分支是 2018 年 Hexo 源码存档，不再维护

> 当前进度：**M1 骨架**。只有结构、路由与占位内容，真实文章在 M2 导入。

---

## 1. 起服务

Node 版本要求 ≥ 20（本项目在 22.22.2 上开发）。若本机 `PATH` 里没有合适的 Node，用托管版本：

```bash
export PATH=/Users/huanghai/.workbuddy/binaries/node/versions/22.22.2-3/bin:$PATH
```

```bash
cd "/Users/huanghai/Documents/Personal Account Operation/website"

npm install        # 首次
npm run dev        # 开发服务，默认 http://localhost:4321
npm run build      # 构建到 dist/（必须 0 error）
npm run preview    # 本地预览构建产物，默认 http://localhost:4321
```

`npm run build` 之后可核对产物：

```bash
ls dist/                                  # 应有 index.html / 404.html / .nojekyll / _astro/ / posts/ ...
test -f dist/.nojekyll && echo ".nojekyll OK"
```

> **`.nojekyll` 不能删**：GitHub Pages 默认跑 Jekyll，而 Jekyll 会忽略下划线开头的目录 —— Astro 的产物目录正是 `_astro/`。没有这个空文件，线上样式与脚本会全部 404。

---

## 2. 新增一篇文章

文章放在 `src/content/posts/`，一个 Markdown 文件 = 一篇文章。**文件名（去掉 `.md`）就是 URL 里的 slug**。

### 2.1 建文件

```bash
# 例：文件名 day-07-claude-code-first-run.md → URL 为 /posts/day-07-claude-code-first-run/
src/content/posts/day-07-claude-code-first-run.md
```

建议命名 `YYYY-MM-DD-短标题.md`（与 FR-11 转换脚本的输出规则一致）。

### 2.2 写 frontmatter

字段定义在 `src/content.config.ts`，**字段缺一个或类型不对会让构建直接报错**（这是有意为之，避免脏数据上线）：

```markdown
---
title: 标题（必填）
date: 2026-09-26            # 必填，支持 2026-09-26 或 2026-09-26 10:00:00
series: pitfall             # 必填，只能是 pitfall / cost / note / share
tags: ["Claude", "工作流"]    # 选填，默认 []
summary: 一句话摘要，≤120 字（必填，列表卡片与 SEO description 都用它）
cover: /images/posts/xxx/cover.png   # 选填
source_url: https://mp.weixin.qq.com/s/xxxx   # 选填，公众号原文链接
draft: false                # 选填，默认 false；true 则全站不显示
featured: false             # 选填，默认 false；true 进首页「精选文章」（最多取 3 篇）
---

正文用标准 Markdown，h2 / h3 / 加粗 / 列表 / 引用 / 代码块 / 图片都已在 `src/styles/global.css`
的 `.prose` 下统一排版。
```

`series` 的四个取值与显示名的对应关系在 `src/data/series.ts`：

| key | 名称 |
| --- | --- |
| `pitfall` | 踩坑实录 |
| `cost` | AI账单 |
| `note` | 学习笔记 |
| `share` | 文章分享 |

### 2.3 图片

正文图片放 `public/images/posts/<slug>/`，引用时用**站内绝对路径**：

```markdown
![描述](/images/posts/day-07-claude-code-first-run/step-1.png)
```

`public/` 下的文件会原样复制到站点根目录，所以 `public/images/posts/x/a.png` 的 URL 就是 `/images/posts/x/a.png`。

### 2.4 本地检查

```bash
npm run build      # frontmatter 不合规会在这里报错
npm run dev        # 浏览器里看排版
```

> `src/content/posts/placeholder.md` 是 M1 的排版自检占位文章，M2 引入真实文章后**删除**。

---

## 3. 替换资产

所有静态资产都在 `public/`，文件名保持不变即可直接替换：

| 文件 | 用途 | 规格要求 |
| --- | --- | --- |
| `favicon.ico` | 浏览器标签页 / 书签 | 多尺寸 ICO（16/32/48/64） |
| `favicon-16.png` `favicon-32.png` `favicon-48.png` | 现代浏览器标签页 | 单尺寸 PNG |
| `favicon-192.png` `favicon-512.png` | Android / PWA 图标 | 192×192、512×512 PNG |
| `apple-touch-icon.png` | iOS 添加到主屏幕 | 180×180 PNG，不要加透明圆角遮罩 |
| `og-default.png` | 全站默认社交分享图 | 1200×630 PNG |
| `images/wechat-qr.png` | 公众号二维码（联系页 + 文末卡片） | 344×344 PNG，**保留 24px 白边，不要裁** |

替换后重新 `npm run build` 即可，页面里的引用路径不用改。

### 二维码的两条硬约束（改样式时别踩）

1. 显示宽度 ≤ 172px（`WeChatCard.astro` 里写死 172×172），且不超过原图分辨率；
2. **必须垫白色圆角底**（`WeChatCard.astro` 的 `.wechat-qr-wrap` 用的是写死的 `#FFFFFF`，故意不跟 token 走）——深色模式下黑块直接落深底会对比度不足、部分扫码器识别失败。

---

## 4. 代码结构

```
src/
├── content.config.ts        # 内容集合 schema（字段在此定义）
├── content/posts/           # 文章 Markdown（M1 只有 placeholder.md）
├── data/series.ts           # 四个合集常量（名称 / 说明 / 配色 token 名）
├── layouts/
│   ├── BaseLayout.astro     # <html>/<head>/header/footer + 引入全局 CSS + <slot name="head" />
│   ├── PageLayout.astro     # 普通页：题头 + 内容槽
│   └── PostLayout.astro     # 文章页：正文排版 + 文末公众号卡片 + 上下篇
├── components/              # SiteHeader / SiteFooter / MobileNav / Hero / PostCard /
│                            # SeriesCard / SeriesTag / WeChatCard / Timeline / Pagination
├── styles/
│   ├── tokens.css           # design tokens（颜色 / 间距 / 圆角 / 阴影 / 字体 / 断点基准）
│   └── global.css           # reset + 布局骨架 + 卡片 / 按钮 / 标签 / 正文 / 空态
└── pages/                   # 8 条路由
```

### 改样式的约定

- **颜色、间距、圆角、阴影一律用 `var(--token)`**，不要在组件里写颜色字面量 —— 深色模式靠 `prefers-color-scheme` 自动切换，写死就断。
- **唯一例外**：`WeChatCard.astro` 里二维码底座写死 `#FFFFFF`，原因见上。
- 想整体调风格（换色、改圆角、改间距），只改 `src/styles/tokens.css`，不要动组件。
- 组件复用 `global.css` 里的公共类：`.container .section .section-head .grid-cards .card .btn .tag .tag-list .prose .page-head .empty .meta .sr-only` 等。

---

## 5. 部署与提交约定

### 部署（GitHub Pages）

站点用 GitHub Actions 自动部署，工作流在 `.github/workflows/deploy.yml`：

- **推送 `master` 自动触发**构建与发布，也可在仓库 Actions 页面手动触发（`workflow_dispatch`）。
- **首次部署需手动开启一次**：仓库 **Settings → Pages → Source** 选「**GitHub Actions**」。没做这一步，工作流会跑但不会真正发布。
- 仓库名是 `dahaihh.github.io`（用户主页仓库），站点在根路径，因此 `astro.config.mjs` 里 `base: '/'` 无需修改。
- `package-lock.json` 必须已入库：`withastro/action` 靠 lockfile 探测包管理器。
- 工作流不会改分支名，默认分支保持 `master`。

### 提交约定

- 提交前务必 `npm run build` **0 error**。
- **不要随手 `git push`**：线上 `dahaihh.github.io` 目前仍从 `master` 根目录直接服务 2018 年的静态产物；推送未经部署配置的提交会让站点变成空白页。首次部署前先按上一节把 Settings → Pages 的 Source 改成「GitHub Actions」。
- 默认分支保持 `master`，不要改名。
