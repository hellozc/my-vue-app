export function buildMenuTree(list) {
  const map = new Map()
  const tree = []

  list.forEach((item) => {
    map.set(item.id, { ...item, children: [] })
  })

  map.forEach((node) => {
    if (node.parentId === 0) {
      tree.push(node)
    } else {
      const parent = map.get(node.parentId)
      if (parent) parent.children.push(node)
      else tree.push(node)
    }
  })

  const sortTree = (nodes) => {
    nodes.sort((a, b) => a.sort - b.sort)
    nodes.forEach((n) => {
      if (n.children.length) sortTree(n.children)
      else delete n.children
    })
  }
  sortTree(tree)
  return tree
}

/** 展开菜单 ID，自动包含所有上级目录 */
export function expandMenuIdsWithAncestors(allMenus, menuIds) {
  const map = new Map(allMenus.map((item) => [item.id, item]))
  const result = new Set(menuIds)
  menuIds.forEach((id) => {
    let current = map.get(id)
    while (current?.parentId) {
      result.add(current.parentId)
      current = map.get(current.parentId)
    }
  })
  return [...result]
}

export function filterMenusByIds(allMenus, menuIds) {
  const allowed = new Set(expandMenuIdsWithAncestors(allMenus, menuIds))
  return allMenus.filter((item) => allowed.has(item.id))
}
