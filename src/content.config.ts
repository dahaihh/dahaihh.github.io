/**
 * 内容集合（Astro 5+ 约定：集合配置放 src 根目录的 content.config.ts）
 *
 * 与任务书 §6 的差异（实装版本为 Astro 7.3.5）：
 * - `z` 改为从 `astro/zod` 引入：`astro:content` 仍导出 `z`，但已标记 deprecated
 *   （官方计划 Astro 8 移除），新代码用前者。
 * - `glob()` 加载器用法与 §6 完全一致，无需改动。
 *
 * ⚠️ 注意：Astro 5+ 的集合条目用 `entry.id`（不是 `entry.slug`），
 * 渲染改用 `const { Content } = await render(entry)`。
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    /** 归属合集，必须是四个固定合集之一（与 src/data/series.ts 的 key 对齐） */
    series: z.enum(['pitfall', 'cost', 'note', 'share']),
    tags: z.array(z.string()).default([]),
    /** 摘要，列表卡片与 SEO description 复用 */
    summary: z.string().max(120),
    cover: z.string().optional(),
    /** 公众号原文链接（FR-11 导入时写入） */
    source_url: z.string().url().optional(),
    draft: z.boolean().default(false),
    /** 首页精选位（最多取 3 篇） */
    featured: z.boolean().default(false),
  }),
});

export const collections = { posts };
