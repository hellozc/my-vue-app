/** 将后端返回的素材 URL 转为可访问地址 */
export function resolveMediaUrl(url) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url
  // 相对路径 /uploads/... 走同源（开发时 Vite 代理，生产时 Nginx/Express 静态资源）
  if (url.startsWith('/')) return url
  return url
}
