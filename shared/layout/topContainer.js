/** 顶部容器样式变体注册表 — 新增样式只需追加一项 */
export const TOP_CONTAINER_VARIANTS = [
  {
    key: 'immersive-banner',
    label: '沉浸大图',
    description: '全宽头图 + 左上角品牌，适合社区首页',
    height: 200,
    wireframe: 'immersive',
    features: { brand: true, indicator: true },
    defaultOccupySpace: false,
  },
  {
    key: 'compact-strip',
    label: '紧凑条带',
    description: '较低高度轮播，适合简约页头',
    height: 120,
    wireframe: 'compact',
    features: { brand: true, indicator: true },
    defaultOccupySpace: true,
  },
]

const LEGACY_VARIANT_MAP = {
  1: 'immersive-banner',
  2: 'compact-strip',
}

function normalizeDisplayText(value) {
  if (value == null) return ''
  return String(value).trim()
}

export function hasTopContainerBrandContent(brand = {}) {
  return Boolean(normalizeDisplayText(brand.logo) || normalizeDisplayText(brand.title))
}

export function getTopContainerVariant(key) {
  return TOP_CONTAINER_VARIANTS.find((item) => item.key === key) ?? TOP_CONTAINER_VARIANTS[0]
}

export function resolveTopContainerVariantKey(props = {}) {
  if (props.variant) return props.variant
  if (props.styleVariant != null) {
    return LEGACY_VARIANT_MAP[props.styleVariant] ?? TOP_CONTAINER_VARIANTS[0].key
  }
  return TOP_CONTAINER_VARIANTS[0].key
}

export function createDefaultTopContainerBackground() {
  return {
    show: true,
    image: '',
  }
}

export function createDefaultTopContainerBrand() {
  return {
    show: false,
    logo: '',
    title: '',
    linkCode: '',
    link: '',
  }
}

export function createDefaultTopContainerCarousel() {
  return {
    autoplay: true,
    interval: 3000,
    loop: true,
    indicator: true,
    items: [],
  }
}

export function createDefaultTopContainerSlide(overrides = {}) {
  return {
    title: '',
    image: '',
    bgColor: '#eef2ff',
    linkCode: '',
    link: '',
    ...overrides,
  }
}

export function createDefaultTopContainerProps(overrides = {}) {
  const variant = getTopContainerVariant(
    overrides.variant ?? TOP_CONTAINER_VARIANTS[0].key
  )
  const background = {
    ...createDefaultTopContainerBackground(),
    ...(overrides.background ?? {}),
    image: overrides.background?.image ?? overrides.backgroundImage ?? '',
  }
  return {
    variant: variant.key,
    styleVariant: overrides.styleVariant,
    occupySpace: overrides.occupySpace ?? variant.defaultOccupySpace,
    containerBg: overrides.containerBg ?? '#ffffff',
    background,
    backgroundImage: background.image,
    brand: {
      ...createDefaultTopContainerBrand(),
      ...(overrides.brand ?? {}),
    },
    carousel: {
      ...createDefaultTopContainerCarousel(),
      ...(overrides.carousel ?? {}),
      items: overrides.carousel?.items ?? [],
    },
  }
}

/** 合并默认值并解析变体，展示端/编辑器共用 */
export function resolveTopContainerProps(raw = {}) {
  const variantKey = resolveTopContainerVariantKey(raw)
  const variant = getTopContainerVariant(variantKey)
  const brandRaw = raw.brand ?? {}
  const brand = {
    ...createDefaultTopContainerBrand(),
    ...brandRaw,
    title: normalizeDisplayText(brandRaw.title),
    logo: normalizeDisplayText(brandRaw.logo),
  }
  const hasBrandContent = hasTopContainerBrandContent(brand)
  if (brandRaw.show === false) {
    brand.show = false
  } else if (brandRaw.show === true) {
    brand.show = true
  } else {
    // 兼容旧数据：已配 Logo/标题时默认展示；新建默认不展示
    brand.show = hasBrandContent
  }
  const carousel = {
    ...createDefaultTopContainerCarousel(),
    ...(raw.carousel ?? {}),
    items: Array.isArray(raw.carousel?.items)
      ? raw.carousel.items.map((item) => ({
          ...createDefaultTopContainerSlide(),
          ...item,
          title: normalizeDisplayText(item.title),
        }))
      : [],
  }

  const background = {
    ...createDefaultTopContainerBackground(),
    ...(raw.background ?? {}),
    image: raw.background?.image ?? raw.backgroundImage ?? '',
  }

  return {
    ...raw,
    variant: variantKey,
    styleVariant: raw.styleVariant,
    occupySpace: raw.occupySpace ?? variant.defaultOccupySpace,
    containerBg: raw.containerBg ?? '#ffffff',
    background,
    // 同步扁平字段，便于旧数据/JSON 源码编辑
    backgroundImage: background.image,
    brand,
    carousel,
    variantMeta: variant,
    carouselHeight: variant.height,
  }
}
