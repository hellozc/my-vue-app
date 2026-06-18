/** 管理端 schema 使用 px，UniApp 展示统一转 rpx（750 设计稿） */
export function pxToRpx(px: number) {
  return `${px * 2}rpx`
}

export function pxStringToRpx(value: string) {
  if (!value || !value.includes('px')) return value
  return value.replace(/(\d+(?:\.\d+)?)px/g, (_, num) => pxToRpx(Number(num)))
}
