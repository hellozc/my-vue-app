export function findMenuItem(path, list) {
  for (const item of list) {
    if (item.path === path) return item
    if (item.children) {
      const found = findMenuItem(path, item.children)
      if (found) return found
    }
  }
  return null
}

export function findMenuPath(path, list, chain = []) {
  for (const item of list) {
    const currentChain = [...chain, item.label]
    if (item.path === path) return currentChain
    if (item.children) {
      const found = findMenuPath(path, item.children, currentChain)
      if (found) return found
    }
  }
  return null
}

export function collectLeafMenus(list, result = []) {
  for (const item of list) {
    if (item.children?.length) {
      collectLeafMenus(item.children, result)
    } else if (item.type === 'menu') {
      result.push(item)
    }
  }
  return result
}

export function buildParentOptions(tree, prefix = '') {
  const options = [{ id: 0, label: '顶级菜单' }]
  const walk = (nodes, level = 0) => {
    nodes.forEach((node) => {
      if (node.type === 'directory') {
        options.push({
          id: node.id,
          label: `${'　'.repeat(level)}${node.label}`,
        })
        if (node.children?.length) walk(node.children, level + 1)
      }
    })
  }
  walk(tree)
  return options
}
