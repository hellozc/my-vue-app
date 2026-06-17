const viewModules = import.meta.glob('../views/**/*.vue')

const dynamicRouteNames = new Set()

const resolveComponent = (component) => {
  if (!component) return null
  const normalized = component.endsWith('.vue') ? component : `${component}.vue`
  const matchKey = Object.keys(viewModules).find((key) =>
    key.replace(/\\/g, '/').endsWith(`/views/${normalized}`)
  )
  if (matchKey) return viewModules[matchKey]
  return () => import('@/views/DynamicPage.vue')
}

const toRoutePath = (path) => path.replace(/^\//, '')

const flattenMenuRoutes = (tree, result = []) => {
  tree.forEach((item) => {
    if (item.type === 'menu' && item.component) {
      result.push({
        path: toRoutePath(item.path),
        name: item.name,
        component: resolveComponent(item.component),
        meta: {
          title: item.label,
          menuPath: item.path,
        },
      })
    }
    if (item.children?.length) {
      flattenMenuRoutes(item.children, result)
    }
  })
  return result
}

export function addDynamicRoutes(router, menuTree) {
  removeDynamicRoutes(router)
  const routes = flattenMenuRoutes(menuTree)
  routes.forEach((route) => {
    router.addRoute('Main', route)
    dynamicRouteNames.add(route.name)
  })
}

export function removeDynamicRoutes(router) {
  dynamicRouteNames.forEach((name) => {
    if (router.hasRoute(name)) {
      router.removeRoute(name)
    }
  })
  dynamicRouteNames.clear()
}

export { flattenMenuRoutes }
