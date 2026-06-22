import { LAYOUT_SCHEMA_VERSION, type HeaderConfig, type LayoutSchema, type TabbarConfig } from './types'
import { normalizeHeader } from '@shared/layout/header'

function createDefaultTabbar(): TabbarConfig {
  return {
    enabled: true,
    props: {
      height: 50,
      background: '#ffffff',
      activeColor: '#6366f1',
      inactiveColor: '#909399',
      showBorder: true,
      fontSize: 11,
      iconSize: 22,
      activeIndex: 0,
      safeAreaInset: true,
      items: [
        { label: '首页', icon: 'home', linkCode: 'home', path: '/home' },
        { label: '社区', icon: 'community', linkCode: 'community-news', path: '/page1' },
        { label: '我的', icon: 'user', linkCode: 'user', path: '/user' },
      ],
    },
  }
}

export function normalizeTabbar(raw?: Partial<TabbarConfig>): TabbarConfig {
  const defaults = createDefaultTabbar()
  if (!raw) return defaults
  const rawItems = raw.props?.items
  return {
    enabled: raw.enabled ?? defaults.enabled,
    props: {
      ...defaults.props,
      ...(raw.props || {}),
      items: Array.isArray(rawItems) ? rawItems : defaults.props.items,
    },
  }
}

export function normalizeLayoutSchema(raw?: Partial<LayoutSchema> | null): LayoutSchema {
  if (!raw || typeof raw !== 'object') {
    return {
      version: LAYOUT_SCHEMA_VERSION,
      pageSettings: {
        backgroundType: 'solid',
        backgroundColor: '#f5f7fa',
        backgroundImage: '',
      },
      components: [],
      chrome: {
        tabbar: createDefaultTabbar(),
        header: normalizeHeader(),
      },
    }
  }

  return {
    version: raw.version ?? LAYOUT_SCHEMA_VERSION,
    pageSettings: {
      backgroundType: raw.pageSettings?.backgroundType ?? 'solid',
      backgroundColor: raw.pageSettings?.backgroundColor ?? '#f5f7fa',
      backgroundImage: raw.pageSettings?.backgroundImage ?? '',
    },
    components: Array.isArray(raw.components) ? raw.components : [],
    chrome: {
      tabbar: normalizeTabbar(raw.chrome?.tabbar),
      header: normalizeHeader(raw.chrome?.header as HeaderConfig | undefined),
    },
  }
}
