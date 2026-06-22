/**
 * 尺寸单位换算（750 设计稿）
 *
 * - 组件静态样式：直接写 rpx
 * - 管理端 schema 动态 px：用 pxToRpx / pxStringToRpx（1 schema px ≈ 2rpx）
 * - 勿引入 rem / lib-flexible：UniApp 会将 rpx 编译为 H5 自适应单位，小程序原生支持 rpx
 */

/** schema px → rpx（375 逻辑宽设计稿：16px → 32rpx） */
export function pxToRpx(px: number) {
  return `${px * 2}rpx`
}

/** 将 "12px 16px" 等字符串中的 px 批量转为 rpx */
export function pxStringToRpx(value: string) {
  if (!value || !value.includes('px')) return value
  return value.replace(/(\d+(?:\.\d+)?)px/g, (_, num) => pxToRpx(Number(num)))
}
