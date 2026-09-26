// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://dahaihh.github.io',
  base: '/', // 用户主页仓库 → 站点在根路径
  trailingSlash: 'ignore',
  build: { format: 'directory' },
});
