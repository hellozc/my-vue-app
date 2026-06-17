export function buildMenuTree(list) {
  const map = new Map()
  const tree = []
  list.forEach((item) => map.set(item.id, { ...item, children: [] }))
  map.forEach((node) => {
    if (node.parentId === 0) tree.push(node)
    else {
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

export function filterMenusByIds(allMenus, menuIds) {
  const map = new Map(allMenus.map((item) => [item.id, item]))
  const allowed = new Set(menuIds)
  menuIds.forEach((id) => {
    let current = map.get(id)
    while (current?.parentId) {
      allowed.add(current.parentId)
      current = map.get(current.parentId)
    }
  })
  return allMenus.filter((item) => allowed.has(item.id))
}
