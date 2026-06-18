import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const consumerRoot = path.resolve(__dirname, '..')
const sourceRoot = path.resolve(consumerRoot, '../shared')
const targetRoot = path.resolve(consumerRoot, 'shared')

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name)
    const to = path.join(dest, entry.name)
    if (entry.isDirectory()) copyDir(from, to)
    else fs.copyFileSync(from, to)
  }
}

if (!fs.existsSync(sourceRoot)) {
  if (!fs.existsSync(targetRoot)) {
    console.error('[sync-shared] 缺少 ../shared 且 layout-consumer/shared 不存在')
    process.exit(1)
  }
  console.log('[sync-shared] 使用已提交的 layout-consumer/shared')
  process.exit(0)
}

copyDir(sourceRoot, targetRoot)
console.log('[sync-shared] 已从 ../shared 同步到 layout-consumer/shared')
