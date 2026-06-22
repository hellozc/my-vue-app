export const LAYOUT_SCHEMA_VERSION = 1

import type { HeaderShowBack } from '@/composables/useHeaderBack'

export type LinkType = 'internal' | 'external'

export interface LinkRecord {
  code: string
  name: string
  type: LinkType
  target: string
  status?: 'enabled' | 'disabled'
  categoryCode?: string
  categoryName?: string
}

export interface LayoutComponentItem {
  id: string
  type: string
  props: Record<string, unknown>
}

export interface HeaderRightAction {
  type?: 'icon' | 'text'
  icon?: string
  text?: string
  linkCode?: string
  link?: string
  action?: string
}

export interface HeaderImmersiveConfig {
  blendWithTopContainer?: boolean
  background?: string
  color?: string
}

export interface HeaderConfig {
  enabled?: boolean
  mode?: 'auto' | 'native' | 'immersive'
  navigationStyle?: 'auto' | 'default' | 'custom'
  title?: string
  showBack?: HeaderShowBack
  background?: string
  color?: string
  height?: number
  safeAreaInset?: boolean
  immersive?: HeaderImmersiveConfig
  rightActions?: HeaderRightAction[]
}

export interface TabbarItem {
  label: string
  icon?: string
  linkCode?: string
  path?: string
}

export interface TabbarConfig {
  enabled: boolean
  props: {
    height?: number
    background?: string
    activeColor?: string
    inactiveColor?: string
    showBorder?: boolean
    fontSize?: number
    iconSize?: number
    activeIndex?: number
    safeAreaInset?: boolean
    items: TabbarItem[]
  }
}

export interface PageSettings {
  backgroundType: 'solid' | 'image'
  backgroundColor: string
  backgroundImage: string
}

export interface LayoutSchema {
  version: number
  pageSettings: PageSettings
  components: LayoutComponentItem[]
  chrome: {
    tabbar: TabbarConfig
    header: HeaderConfig
  }
}

export interface LayoutDetail {
  id: number
  code: string
  name: string
  description?: string
  status: string
  version: number
  schema: LayoutSchema
}
