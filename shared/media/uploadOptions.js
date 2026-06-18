/** 图片上传默认配置（各使用方可覆盖） */
export const DEFAULT_IMAGE_UPLOAD_OPTIONS = {
  /** 允许的最大体积（MB），超出且开启压缩时会尝试压缩 */
  maxSizeMB: 2,
  /** 压缩后目标最大体积（MB），仍超出则拒绝上传 */
  compressTargetMB: 2,
  maxWidth: 1920,
  maxHeight: 1920,
  /** JPEG/WebP 质量 0~1 */
  quality: 0.82,
  /** 超出 maxSizeMB 时是否自动压缩 */
  enableCompress: true,
  /** 是否允许手填 URL */
  allowUrl: true,
  /** 是否允许从素材库选择 */
  allowLibrary: true,
  /** 是否允许本地上传 */
  allowUpload: true,
}

export const MEDIA_CATEGORY_CODES = {
  general: 'general',
  layout: 'layout',
  banner: 'banner',
  logo: 'logo',
  avatar: 'avatar',
}
