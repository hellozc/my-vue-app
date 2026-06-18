export {
  LAYOUT_SCHEMA_VERSION,
  createEmptyLayout,
  cloneLayout,
  normalizeLayoutSchema,
  generateId,
} from '@/layout-builder/utils'
export { createPreviewLayout, PREVIEW_THEME } from '@/layout-builder/presets/preview'
export {
  LAYOUT_CATEGORIES,
  layoutComponentRegistry,
  getRegistryItem,
  getBlockComponent,
  getConfigComponent,
  createComponentInstance,
  getComponentsByCategory,
  getComponentLabel,
} from '@/layout-builder/registry'
export { default as LayoutBuilder } from '@/layout-builder/LayoutBuilder.vue'
export { default as LayoutRenderer } from '@/layout-builder/renderer/LayoutRenderer.vue'
export { default as TabbarBlock } from '@/layout-builder/blocks/TabbarBlock.vue'
export { COMPONENT_SCOPE, CHROME_KEYS, SELECTION } from '@/layout-builder/constants'
export { createDefaultTabbar, normalizeTabbar } from '@/layout-builder/chrome/tabbar'
export { createDefaultHeader, normalizeHeader } from '@/layout-builder/chrome/header'
