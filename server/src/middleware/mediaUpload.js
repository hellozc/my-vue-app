import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import multer from 'multer'
import { getCategoryDir, mediaConfig } from '../config/media.js'

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    // multipart 的 body 字段在 destination 阶段可能尚未解析，优先读 query
    const categoryCode = req.query?.categoryCode || req.body?.categoryCode || 'general'
    const dir = getCategoryDir(categoryCode)
    try {
      ensureDir(dir)
      cb(null, dir)
    } catch (err) {
      cb(err)
    }
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg'
    const safeExt = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext) ? ext : '.jpg'
    cb(null, `${Date.now()}_${randomUUID().slice(0, 8)}${safeExt}`)
  },
})

function fileFilter(req, file, cb) {
  if (mediaConfig.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true)
    return
  }
  cb(new Error('仅支持 JPG / PNG / GIF / WebP / SVG 图片'))
}

export const mediaUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: mediaConfig.serverMaxSizeMB * 1024 * 1024,
    files: 1,
  },
})
