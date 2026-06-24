import { inject, onBeforeUnmount, onMounted, type InjectionKey } from 'vue'

type Handler = () => void

export interface LayoutPageEventBus {
  subscribeReachBottom: (handler: Handler) => () => void
  subscribeScroll: (handler: Handler) => () => void
  emitReachBottom: () => void
  emitScroll: () => void
}

export const LAYOUT_PAGE_EVENT_KEY: InjectionKey<LayoutPageEventBus> = Symbol('layoutPageEvent')

export function createLayoutPageEventBus(): LayoutPageEventBus {
  const reachBottomHandlers = new Set<Handler>()
  const scrollHandlers = new Set<Handler>()
  return {
    subscribeReachBottom(handler) {
      reachBottomHandlers.add(handler)
      return () => reachBottomHandlers.delete(handler)
    },
    subscribeScroll(handler) {
      scrollHandlers.add(handler)
      return () => scrollHandlers.delete(handler)
    },
    emitReachBottom() {
      reachBottomHandlers.forEach((handler) => handler())
    },
    emitScroll() {
      scrollHandlers.forEach((handler) => handler())
    },
  }
}

/**
 * 订阅页面级触底/滚动事件（uni-app onReachBottom / onPageScroll）
 * 由各 ListBlock 自行判断是否加载，跨端可靠
 */
export function useLayoutPageEvents(options: { onReachBottom?: Handler; onScroll?: Handler }) {
  const bus = inject(LAYOUT_PAGE_EVENT_KEY, null)
  const unsubscribers: Array<() => void> = []

  onMounted(() => {
    if (!bus) return
    if (options.onReachBottom) unsubscribers.push(bus.subscribeReachBottom(options.onReachBottom))
    if (options.onScroll) unsubscribers.push(bus.subscribeScroll(options.onScroll))
  })

  onBeforeUnmount(() => {
    unsubscribers.forEach((fn) => fn())
  })
}
