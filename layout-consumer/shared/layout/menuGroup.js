export const MENU_GROUP_STYLE = {
  LIST: 'list',
  CELL: 'cell',
}

export function createDefaultMenuGroupItem(overrides = {}) {
  return {
    label: '菜单项',
    icon: 'Menu',
    desc: '',
    badge: '',
    linkCode: '',
    link: '',
    requireLogin: false,
    action: '',
    ...overrides,
  }
}

export function createDefaultMenuGroup(overrides = {}) {
  const { items, ...rest } = overrides
  return {
    title: '',
    items: Array.isArray(items)
      ? items.map((item) => createDefaultMenuGroupItem(item))
      : [createDefaultMenuGroupItem()],
    ...rest,
  }
}

export function createDefaultMenuGroupProps(overrides = {}) {
  const { groups, ...rest } = overrides
  return {
    padding: '0',
    margin: '12px 12px 0',
    background: '#ffffff',
    borderRadius: 16,
    showDivider: true,
    showArrow: true,
    style: MENU_GROUP_STYLE.LIST,
    groups: Array.isArray(groups)
      ? groups.map((group) => createDefaultMenuGroup(group))
      : [
          createDefaultMenuGroup({
            title: '我的服务',
            items: [
              createDefaultMenuGroupItem({ label: '我的订单', icon: 'Goods', requireLogin: true }),
              createDefaultMenuGroupItem({ label: '我的收藏', icon: 'Star', requireLogin: true }),
            ],
          }),
        ],
    ...rest,
  }
}

export function normalizeMenuGroupProps(raw = {}) {
  const defaults = createDefaultMenuGroupProps()
  const style = Object.values(MENU_GROUP_STYLE).includes(raw?.style)
    ? raw.style
    : defaults.style
  return {
    padding: raw.padding ?? defaults.padding,
    margin: raw.margin ?? defaults.margin,
    background: raw.background ?? defaults.background,
    borderRadius: Number(raw.borderRadius ?? defaults.borderRadius) || defaults.borderRadius,
    showDivider: raw.showDivider !== false && raw.showDivider !== 'false',
    showArrow: raw.showArrow !== false && raw.showArrow !== 'false',
    style,
    groups: Array.isArray(raw.groups)
      ? raw.groups.map((group, gi) =>
          createDefaultMenuGroup({
            ...defaults.groups[gi % defaults.groups.length],
            ...group,
            items: Array.isArray(group?.items)
              ? group.items.map((item, ii) =>
                  createDefaultMenuGroupItem({
                    ...(defaults.groups[gi % defaults.groups.length]?.items?.[ii] ?? {}),
                    ...item,
                  })
                )
              : defaults.groups[gi % defaults.groups.length]?.items ?? [],
          })
        )
      : defaults.groups,
  }
}
