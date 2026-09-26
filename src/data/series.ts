/**
 * 四个合集的定义（D4：用常量，不用 content collection）。
 * 合集是固定结构且带配色 token，塞进 collection 反而多一层空目录问题；
 * 等二期合集变多再迁移。
 *
 * 配色只存 token 名（`--c-xxx`），真值在 styles/tokens.css 里，
 * 浅色/深色两档由 CSS 的 prefers-color-scheme 自动切换 —— 组件不碰颜色字面量。
 */

export type SeriesKey = 'pitfall' | 'cost' | 'note' | 'share';

export interface Series {
  /** 与 frontmatter 的 `series` 字段、路由 /series/[name] 一致 */
  key: SeriesKey;
  /** 合集名（站上展示） */
  name: string;
  /** 一句说明（已定稿，≤60 字） */
  description: string;
  /** 配色 token 名，用于 style="--tag-c: var(--c-pitfall)" */
  colorVar: string;
}

export const SERIES: Series[] = [
  {
    key: 'pitfall',
    name: '踩坑实录',
    description:
      '学 AI 路上真实踩过的坑，按 Day 连载。每个坑都写清：当时想干什么、错在哪、后来怎么绕过去。',
    colorVar: '--c-pitfall',
  },
  {
    key: 'cost',
    name: 'AI账单',
    description: '把 AI 工具的真实花销摊开算。哪个值、哪个是智商税，用数字说话。',
    colorVar: '--c-cost',
  },
  {
    key: 'note',
    name: '学习笔记',
    description: '学 AI 过程中的整理与沉淀。概念、方法、看过的资料，用自己的话重写一遍。',
    colorVar: '--c-note',
  },
  {
    key: 'share',
    name: '文章分享',
    description: '值得一读的 AI 好文与好工具，附上我的使用判断，不做无脑转帖。',
    colorVar: '--c-share',
  },
];

/** 合集 key 的联合类型（供 schema / getStaticPaths 复用） */
export const SERIES_KEYS = SERIES.map((s) => s.key) as [SeriesKey, ...SeriesKey[]];

/** 按 key 取合集定义；未知 key 返回 undefined */
export function getSeries(key: string): Series | undefined {
  return SERIES.find((s) => s.key === key);
}
