import { createDefaultTabbar } from '@/layout-builder/chrome/tabbar'
import { LAYOUT_SCHEMA_VERSION } from '@/layout-builder/utils'

/** 预览/示例统一视觉主题（社区首页风格） */
export const PREVIEW_THEME = {
  pageBg: '#f5f7fa',
  cardBg: '#ffffff',
  primary: '#6366f1',
  primaryLight: '#eef2ff',
  accent: '#e53935',
  iconBg: '#eef2ff',
}

export const previewCarouselItems = () => [
  { title: '社区欢迎季 · 精彩内容不断', image: '', bgColor: '#eef2ff' },
  { title: '邻里活动火热报名中', image: '', bgColor: '#e0e7ff' },
  { title: '热点资讯每日更新', image: '', bgColor: '#ede9fe' },
]

export const previewGridItems = () => [
  { label: '社区', icon: 'OfficeBuilding', linkCode: 'community-news', link: '' },
  { label: '活动', icon: 'Calendar', linkCode: '', link: '' },
  { label: '商城', icon: 'Goods', linkCode: 'mall', link: '' },
  { label: '消息', icon: 'ChatDotRound', linkCode: '', link: '' },
  { label: '服务', icon: 'Service', linkCode: '', link: '' },
  { label: '更多', icon: 'More', linkCode: '', link: '' },
]

export const previewListHeader = () => ({
  show: true,
  title: '社区资讯',
  accentColor: PREVIEW_THEME.accent,
  showMore: true,
  moreText: '更多>',
  moreLinkCode: 'community-news',
  moreLink: '',
})

export const previewListItems = () => [
  {
    title: '小区公告：本周六停水通知',
    desc: '请关注厨房与卫生间用水安排',
    icon: 'Bell',
    image: '',
    linkCode: 'community-news',
    link: '',
  },
  {
    title: '春季社区运动会开始报名',
    desc: '羽毛球、乒乓球等多个项目等你来',
    icon: 'Trophy',
    image: '',
    linkCode: '',
    link: '',
  },
  {
    title: '便民服务：家电维修预约',
    desc: '官方合作商户，持证上岗',
    icon: 'Tools',
    image: '',
    linkCode: '',
    link: '',
  },
  {
    title: '邻里互助：闲置物品交换',
    desc: '闲置交换、宠物寄养、顺风车',
    icon: 'ChatLineRound',
    image: '',
    linkCode: '',
    link: '',
  },
]

export const previewGridProps = () => ({
  columns: 3,
  rows: 2,
  offsetY: 12,
  marginX: 16,
  background: '#ffffff',
  blockRadius: 12,
  showShadow: true,
  padding: '12px 16px',
  gap: 10,
  borderRadius: 12,
  iconWidth: 48,
  iconHeight: 48,
  iconBg: PREVIEW_THEME.iconBg,
  items: previewGridItems(),
})

export const previewListProps = () => ({
  padding: '12px 16px',
  showDivider: true,
  showArrow: true,
  header: previewListHeader(),
  items: previewListItems(),
})

export const previewTopContainerProps = () => ({
  styleVariant: 1,
  containerBg: PREVIEW_THEME.cardBg,
  carousel: {
    autoplay: true,
    interval: 3500,
    loop: true,
    indicator: true,
    items: previewCarouselItems(),
  },
})

export const previewCarouselProps = () => ({
  height: 140,
  autoplay: true,
  interval: 3500,
  loop: true,
  indicator: true,
  items: previewCarouselItems(),
})

export const previewTabbarChrome = () => ({
  enabled: true,
  props: {
    ...createDefaultTabbar().props,
    activeColor: PREVIEW_THEME.primary,
    items: [
      { label: '首页', icon: 'House', linkCode: 'home', path: '/home' },
      { label: '社区', icon: 'OfficeBuilding', linkCode: 'community-news', path: '/page1' },
      { label: '我的', icon: 'User', linkCode: 'user', path: '/user' },
    ],
    activeIndex: 0,
  },
})

/**
 * 完整预览布局：包含全部 body 组件 + Tabbar，风格统一
 */
export function createPreviewLayout(overrides = {}) {
  return {
    version: LAYOUT_SCHEMA_VERSION,
    pageSettings: {
      backgroundType: 'solid',
      backgroundColor: PREVIEW_THEME.pageBg,
      backgroundImage: '',
    },
    components: [
      {
        id: 'cmp_preview_top',
        type: 'topContainer',
        props: previewTopContainerProps(),
      },
      {
        id: 'cmp_preview_grid',
        type: 'grid',
        props: previewGridProps(),
      },
      {
        id: 'cmp_preview_carousel',
        type: 'carousel',
        props: previewCarouselProps(),
      },
      {
        id: 'cmp_preview_list',
        type: 'list',
        props: previewListProps(),
      },
    ],
    chrome: {
      tabbar: previewTabbarChrome(),
    },
    ...overrides,
  }
}
