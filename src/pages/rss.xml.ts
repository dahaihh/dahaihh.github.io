/**
 * RSS · /rss.xml（FR-06，P1）
 * 只输出非草稿文章，按发布时间倒序。链接形态与站点 canonical 一致（带尾斜杠）。
 * 注：`.ts` 端点文件是普通模块，不写 frontmatter 围栏。
 */
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = (await getCollection('posts', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );

  return rss({
    title: '大海学AI',
    description: '12 年开发 + 项目经理，公开记录学 AI 的每一步。不吹概念，只讲跑通的过程。',
    site: context.site ?? 'https://dahaihh.github.io',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.summary ?? '',
      link: `/posts/${post.id}/`,
      categories: [post.data.series, ...post.data.tags],
    })),
    customData: '<language>zh-CN</language>',
  });
}
