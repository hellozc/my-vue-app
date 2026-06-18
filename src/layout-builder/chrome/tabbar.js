/** 默认底部 Tabbar 配置（chrome 层，不属于 components 数组） */
export function createDefaultTabbar() {
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
      safeAreaInset: true,
      items: [
        { label: '首页', icon: 'House', linkCode: 'home', path: '/home' },
        { label: '商城', icon: 'Goods', linkCode: 'mall', path: '/mall' },
        { label: '我的', icon: 'User', linkCode: 'user', path: '/user' },
      ],
      activeIndex: 0,
    },
  }
}

export function normalizeTabbar(raw) {
  const defaults = createDefaultTabbar()
  if (!raw) return defaults
  return {
    enabled: raw.enabled ?? defaults.enabled,
    props: {
      ...defaults.props,
      ...(raw.props || {}),
      items: Array.isArray(raw.props?.items) ? raw.props.items : defaults.props.items,
    },
  }
}
