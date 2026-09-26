/**
 * 站点级常量 + 站长验证码（M4 收录提交用）。
 *
 * 收录提交（Google Search Console / Bing / 百度）会给你一段验证串，
 * 填到下面的 VERIFICATION 里即可 —— BaseLayout 会自动渲染对应的 <meta>，
 * 留空则不渲染，不需要改布局文件。
 *
 * 各家对应的 meta：
 *   Google → <meta name="google-site-verification" content="...">
 *   Bing   → <meta name="msvalidate.01" content="...">
 *   百度   → <meta name="baidu-site-verification" content="...">
 *
 * ⚠️ 添加后要重新构建部署，再回控制台点「验证」。
 * 详细步骤见 `09-SEO收录提交指南.md`。
 */

export const SITE = {
  name: '大海学AI',
  description: '12 年开发 + 项目经理，公开记录学 AI 的每一步。不吹概念，只讲跑通的过程。',
  author: '大海',
} as const;

export const VERIFICATION = {
  google: '',
  bing: '',
  baidu: '',
};
