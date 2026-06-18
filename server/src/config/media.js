import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const uploadRoot = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads')

export const mediaConfig = {
  uploadRoot,
  publicPath: process.env.UPLOAD_PUBLIC_PATH || '/uploads',
  /** 服务端硬限制（MB），防止绕过前端直传超大文件 */
  serverMaxSizeMB: Number(process.env.UPLOAD_SERVER_MAX_MB) || 10,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
}

export function getCategoryDir(categoryCode = 'general') {
  const safeCode = String(categoryCode).replace(/[^a-z0-9_-]/gi, '') || 'general'
  return path.join(mediaConfig.uploadRoot, safeCode)
}

export function buildPublicUrl(relativePath) {
  const normalized = relativePath.replace(/\\/g, '/').replace(/^\//, '')
  return `${mediaConfig.publicPath}/${normalized}`
}

export function resolveAbsolutePath(relativePath) {
  const normalized = relativePath.replace(/\\/g, '/').replace(/^\//, '')
  const absolute = path.join(mediaConfig.uploadRoot, normalized)
  if (!absolute.startsWith(mediaConfig.uploadRoot)) {
    throw new Error('非法文件路径')
  }
  return absolute
}
