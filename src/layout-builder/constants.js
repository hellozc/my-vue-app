/** 组件作用域：区分页面内容与壳层 chrome */
export const COMPONENT_SCOPE = {
  /** 页面主体：可拖拽、可多个、随页面滚动 */
  BODY: 'body',
  /** 壳层组件：固定位置、通常全局唯一，不走 components 数组 */
  CHROME: 'chrome',
}

export const CHROME_KEYS = {
  TABBAR: 'tabbar',
  HEADER: 'header',
}

export const SELECTION = {
  PAGE: '__page__',
  TABBAR: '__tabbar__',
  HEADER: '__header__',
}
