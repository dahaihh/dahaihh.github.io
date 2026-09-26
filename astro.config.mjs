// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://dahaihh.github.io',
  base: '/', // 用户主页仓库 → 站点在根路径
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  integrations: [
    // FR-12：sitemap 随构建自动更新。404 不是可索引页面，排除掉
    // （产物为 sitemap-index.xml + sitemap-0.xml，robots.txt 指向 index）
    sitemap({
      filter: (page) => !page.includes('/404'),
    }),
  ],
});
