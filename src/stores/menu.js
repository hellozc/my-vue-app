import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getMenuTree } from '@/api/menu'
import { addDynamicRoutes } from '@/router/dynamicRoutes'

export const useMenuStore = defineStore('menu', () => {
  const menuTree = ref([])
  const isLoaded = ref(false)

  async function fetchMenuTree() {
    const data = await getMenuTree()
    menuTree.value = data
    return data
  }

  async function initMenus(router) {
    const tree = await fetchMenuTree()
    addDynamicRoutes(router, tree)
    isLoaded.value = true
  }

  async function refreshMenus(router) {
    const tree = await fetchMenuTree()
    addDynamicRoutes(router, tree)
  }

  function resetMenus() {
    menuTree.value = []
    isLoaded.value = false
  }

  return {
    menuTree,
    isLoaded,
    fetchMenuTree,
    initMenus,
    refreshMenus,
    resetMenus,
  }
})
