import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const serverRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
)
const envPath = path.join(serverRoot, '.env')

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
} else {
  dotenv.config()
}

export { envPath, serverRoot }
