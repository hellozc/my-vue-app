import router from './index'

const whiteList = ['/login']
let isReady = false

export function resetRouterReady() {
  isReady = false
}

export function getRouterReady() {
  return isReady
}

router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token')

  if (!token && !whiteList.includes(to.path)) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }

  if (token && to.path === '/login') {
    next('/')
    return
  }

  if (whiteList.includes(to.path)) {
    next()
    return
  }

  if (isReady) {
    next()
    return
  }

  const { useMenuStore } = await import('@/stores/menu')
  const menuStore = useMenuStore()

  try {
    await menuStore.initMenus(router)
    isReady = true
    next({ ...to, replace: true })
  } catch (error) {
    console.error('[Router] 菜单加载失败', error)
    isReady = true
    next()
  }
})
