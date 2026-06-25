export function createDefaultUserCardGuest(overrides = {}) {
  return {
    title: '点击登录',
    subtitle: '登录后享受更多服务',
    avatar: '',
    ...overrides,
  }
}

export function createDefaultUserCardStat(overrides = {}) {
  return {
    label: '积分',
    value: '0',
    linkCode: '',
    link: '',
    requireLogin: true,
    ...overrides,
  }
}

export function createDefaultUserCardProps(overrides = {}) {
  const { guest, stats, ...rest } = overrides
  return {
    padding: '24px 16px',
    margin: '12px 12px 0',
    background: '#ffffff',
    borderRadius: 16,
    showStats: true,
    tapRequiresLogin: true,
    guest: createDefaultUserCardGuest(guest),
    stats: Array.isArray(stats)
      ? stats
      : [
          createDefaultUserCardStat({ label: '积分', value: '0' }),
          createDefaultUserCardStat({ label: '优惠券', value: '0' }),
          createDefaultUserCardStat({ label: '订单', value: '0' }),
        ],
    ...rest,
  }
}

export function normalizeUserCardProps(raw = {}) {
  const defaults = createDefaultUserCardProps()
  return {
    padding: raw.padding ?? defaults.padding,
    margin: raw.margin ?? defaults.margin,
    background: raw.background ?? defaults.background,
    borderRadius: Number(raw.borderRadius ?? defaults.borderRadius) || defaults.borderRadius,
    showStats: raw.showStats !== false && raw.showStats !== 'false',
    tapRequiresLogin: raw.tapRequiresLogin !== false && raw.tapRequiresLogin !== 'false',
    guest: createDefaultUserCardGuest({ ...defaults.guest, ...(raw.guest ?? {}) }),
    stats: Array.isArray(raw.stats)
      ? raw.stats.map((item, index) =>
          createDefaultUserCardStat({
            ...defaults.stats[index % defaults.stats.length],
            ...item,
          })
        )
      : defaults.stats,
  }
}
