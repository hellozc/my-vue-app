import { markRaw } from 'vue'
import { generateId } from '@/layout-builder/utils'
import TopContainerBlock from '@/layout-builder/blocks/TopContainerBlock.vue'
import CarouselBlock from '@/layout-builder/blocks/CarouselBlock.vue'
import GridBlock from '@/layout-builder/blocks/GridBlock.vue'
import ListBlock from '@/layout-builder/blocks/ListBlock.vue'
import TopContainerConfig from '@/layout-builder/config/TopContainerConfig.vue'
import CarouselConfig from '@/layout-builder/config/CarouselConfig.vue'
import GridConfig from '@/layout-builder/config/GridConfig.vue'
import ListConfig from '@/layout-builder/config/ListConfig.vue'
import UserCardConfig from '@/layout-builder/config/UserCardConfig.vue'
import MenuGroupConfig from '@/layout-builder/config/MenuGroupConfig.vue'
import { COMPONENT_SCOPE } from '@/layout-builder/constants'
import { createDefaultTopContainerProps } from '@shared/layout/topContainer'
import { createDefaultGridProps } from '@shared/layout/grid'
import { createDefaultListProps } from '@shared/layout/list'
import { createDefaultUserCardProps } from '@shared/layout/userCard'
import { createDefaultMenuGroupProps } from '@shared/layout/menuGroup'
import UserCardBlock from '@/layout-builder/blocks/UserCardBlock.vue'
import MenuGroupBlock from '@/layout-builder/blocks/MenuGroupBlock.vue'

/** 页面主体组件分类（左侧组件库，仅 body 可拖拽） */
export const LAYOUT_CATEGORIES = [
  { key: 'basic', label: '基础组件' },
  { key: 'grid', label: '宫格组件' },
  { key: 'list', label: '列表组件' },
  { key: 'user', label: '用户组件' },
]

/**
 * 布局组件注册表 — 扩展新组件只需在此追加一项
 * @type {Record<string, LayoutComponentDefinition>}
 */
export const layoutComponentRegistry = {
  topContainer: {
    type: 'topContainer',
    label: '顶部容器',
    category: 'basic',
    scope: COMPONENT_SCOPE.BODY,
    description: '顶部轮播 + 品牌区，支持样式变体注册',
    createInstance() {
      return {
        id: generateId(),
        type: 'topContainer',
        props: createDefaultTopContainerProps(),
      }
    },
    block: markRaw(TopContainerBlock),
    config: markRaw(TopContainerConfig),
  },
  carousel: {
    type: 'carousel',
    label: '轮播图',
    category: 'basic',
    scope: COMPONENT_SCOPE.BODY,
    description: '独立轮播图模块',
    createInstance() {
      return {
        id: generateId(),
        type: 'carousel',
        props: {
          height: 160,
          autoplay: true,
          interval: 3000,
          loop: true,
          indicator: true,
          items: [],
        },
      }
    },
    block: markRaw(CarouselBlock),
    config: markRaw(CarouselConfig),
  },
  grid: {
    type: 'grid',
    label: '页面宫格',
    category: 'grid',
    scope: COMPONENT_SCOPE.BODY,
    description: '页面内宫格导航，随内容滚动，可放多个',
    createInstance() {
      return {
        id: generateId(),
        type: 'grid',
        props: createDefaultGridProps({
          padding: '12px',
          items: [
            { label: '菜单1', icon: 'Menu', linkCode: '', link: '' },
            { label: '菜单2', icon: 'Goods', linkCode: '', link: '' },
            { label: '菜单3', icon: 'User', linkCode: '', link: '' },
            { label: '菜单4', icon: 'Setting', linkCode: '', link: '' },
            { label: '菜单5', icon: 'Document', linkCode: '', link: '' },
            { label: '菜单6', icon: 'Folder', linkCode: '', link: '' },
          ],
        }),
      }
    },
    block: markRaw(GridBlock),
    config: markRaw(GridConfig),
  },
  list: {
    type: 'list',
    label: '列表模块',
    category: 'list',
    scope: COMPONENT_SCOPE.BODY,
    description: '带标题栏的图文列表',
    createInstance() {
      return {
        id: generateId(),
        type: 'list',
        props: createDefaultListProps({
          items: [
            { title: '列表项 1', desc: '描述文案', icon: 'Document', image: '', linkCode: '', link: '' },
            { title: '列表项 2', desc: '描述文案', icon: 'Document', image: '', linkCode: '', link: '' },
          ],
        }),
      }
    },
    block: markRaw(ListBlock),
    config: markRaw(ListConfig),
  },
  userCard: {
    type: 'userCard',
    label: '用户卡片',
    category: 'user',
    scope: COMPONENT_SCOPE.BODY,
    description: '头像昵称、登录引导、统计入口',
    createInstance() {
      return {
        id: generateId(),
        type: 'userCard',
        props: createDefaultUserCardProps(),
      }
    },
    block: markRaw(UserCardBlock),
    config: markRaw(UserCardConfig),
  },
  menuGroup: {
    type: 'menuGroup',
    label: '菜单组',
    category: 'user',
    scope: COMPONENT_SCOPE.BODY,
    description: '分组菜单，支持需登录与退出登录',
    createInstance() {
      return {
        id: generateId(),
        type: 'menuGroup',
        props: createDefaultMenuGroupProps(),
      }
    },
    block: markRaw(MenuGroupBlock),
    config: markRaw(MenuGroupConfig),
  },
}

export function getRegistryItem(type) {
  return layoutComponentRegistry[type] ?? null
}

export function getBlockComponent(type) {
  return getRegistryItem(type)?.block ?? null
}

export function getConfigComponent(type) {
  return getRegistryItem(type)?.config ?? null
}

export function createComponentInstance(type) {
  const def = getRegistryItem(type)
  if (!def) throw new Error(`未知布局组件类型: ${type}`)
  return def.createInstance()
}

export function getComponentsByCategory(categoryKey) {
  return Object.values(layoutComponentRegistry).filter(
    (item) => item.category === categoryKey && item.scope === COMPONENT_SCOPE.BODY
  )
}

/** 仅返回页面主体组件（排除 chrome） */
export function getBodyComponents() {
  return Object.values(layoutComponentRegistry).filter(
    (item) => item.scope === COMPONENT_SCOPE.BODY
  )
}

export function getComponentLabel(type) {
  return getRegistryItem(type)?.label ?? type
}
