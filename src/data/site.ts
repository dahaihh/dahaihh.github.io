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

/**
 * 默认分享卡（Open Graph / Twitter Card）图。
 *
 * 为什么要写死宽高：部分平台（微信、QQ、Telegram 等）在拿不到
 * og:image:width / height 时，会先按小图渲染再异步重排，甚至直接
 * 只显示成一张缩略图。声明真实像素尺寸可以避免这类延迟与误判。
 *
 * ⚠️ 换图时这三项必须同步改：path / width / height / type。
 */
export const OG_IMAGE = {
  path: '/og-default.png',
  width: 1200,
  height: 630,
  type: 'image/png',
  alt: '书桌前的学习者插画，配文 AI Journey',
} as const;

export const VERIFICATION = {
  google: '',
  bing: '',
  baidu: '',
};
