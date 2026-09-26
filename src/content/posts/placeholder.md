---
title: （占位）站点骨架自检文章
date: 2026-09-26
series: pitfall
tags:
  - 占位
  - 排版自检
summary: 专门用来验证 Markdown 排版与代码块样式的占位文章，M2 引入真实文章后删除。
featured: true
draft: false
---

这是一篇**占位文章**，唯一用途是跑通 Markdown 渲染管线、验证排版与代码块样式。M2 引入真实文章后删除。

## 二级标题：验证 h2 字号与上间距

正文段落用来确认移动端字号 ≥16px、行高 ≥1.7，且长链接不会撑破容器，例如：
`https://mp.weixin.qq.com/s/Y1piyO0wIdRiRIMEzCYWqg`

### 三级标题：验证 h3

加粗、*斜体*、行内代码 `npm run build` 都在这一段落里确认。

#### 列表

无序列表：

- 第一项：确认列表左缩进与项目间距
- 第二项：确认列表项内的行内代码 `astro build` 样式
- 第三项：确认嵌套层级

有序列表：

1. 写 frontmatter
2. 写正文
3. 跑一次构建

#### 引用

> 不吹概念，只讲跑通的过程。
>
> —— 引用的第二段，验证多段引用的间距。

#### 代码块

```ts
import { getCollection, render } from 'astro:content';

const posts = await getCollection('posts', ({ data }) => !data.draft);
const { Content } = await render(posts[0]);
```

超长单行代码（验证代码块自身横向滚动、不撑破页面）：

```bash
export PATH=/Users/huanghai/.workbuddy/binaries/node/versions/22.22.2-3/bin:$PATH && npm run build --prefix "/Users/huanghai/Documents/Personal Account Operation/website"
```

#### 图片

![站点默认分享图（占位，用于验证图片自适应与圆角）](/og-default.png)

#### 表格

| 字段 | 含义 | 是否必填 |
| --- | --- | --- |
| `title` | 文章标题 | 是 |
| `series` | 归属合集 | 是 |
| `featured` | 首页精选 | 否（默认 false） |

以上元素确认无误后，M1 骨架的正文排版即视为可用。
