import { DEFAULT_IMAGE_UPLOAD_OPTIONS } from '@shared/media/uploadOptions'

const MB = 1024 * 1024

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < MB) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / MB).toFixed(2)} MB`
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('图片读取失败'))
    }
    image.src = url
  })
}

function canvasToBlob(canvas, mimeType, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('图片压缩失败'))
          return
        }
        resolve(blob)
      },
      mimeType,
      quality
    )
  })
}

function calcScaledSize(width, height, maxWidth, maxHeight) {
  let targetWidth = width
  let targetHeight = height
  const widthRatio = maxWidth / width
  const heightRatio = maxHeight / height
  const ratio = Math.min(widthRatio, heightRatio, 1)
  targetWidth = Math.max(1, Math.round(width * ratio))
  targetHeight = Math.max(1, Math.round(height * ratio))
  return { width: targetWidth, height: targetHeight }
}

/**
 * 压缩图片文件，返回可用于上传的 File
 */
export async function compressImageFile(file, options = {}) {
  const config = { ...DEFAULT_IMAGE_UPLOAD_OPTIONS, ...options }
  const maxBytes = config.compressTargetMB * MB
  const originalSize = file.size

  if (!file.type.startsWith('image/')) {
    throw new Error('仅支持图片文件')
  }

  if (!config.enableCompress && originalSize > config.maxSizeMB * MB) {
    throw new Error(`图片不能超过 ${config.maxSizeMB}MB`)
  }

  if (config.enableCompress === false) {
    if (originalSize > config.maxSizeMB * MB) {
      throw new Error(`图片不能超过 ${config.maxSizeMB}MB`)
    }
    return {
      file,
      width: null,
      height: null,
      originalSize,
      compressedSize: originalSize,
      compressed: false,
    }
  }

  const image = await loadImageFromFile(file)
  const { width, height } = calcScaledSize(
    image.naturalWidth,
    image.naturalHeight,
    config.maxWidth,
    config.maxHeight
  )

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('无法创建画布上下文')
  ctx.drawImage(image, 0, 0, width, height)

  const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
  let quality = config.quality
  let blob = await canvasToBlob(canvas, outputType, quality)

  while (blob.size > maxBytes && quality > 0.45) {
    quality -= 0.08
    blob = await canvasToBlob(canvas, outputType, quality)
  }

  if (blob.size > maxBytes) {
    throw new Error(
      `压缩后仍超过 ${config.compressTargetMB}MB（${formatSize(blob.size)}），请换更小图片`
    )
  }

  const ext = outputType === 'image/png' ? '.png' : '.jpg'
  const baseName = (file.name || 'image').replace(/\.[^.]+$/, '')
  const compressedFile = new File([blob], `${baseName}${ext}`, {
    type: outputType,
    lastModified: Date.now(),
  })

  return {
    file: compressedFile,
    width,
    height,
    originalSize,
    compressedSize: compressedFile.size,
    compressed: compressedFile.size < originalSize || width !== image.naturalWidth,
  }
}

export { formatSize }
